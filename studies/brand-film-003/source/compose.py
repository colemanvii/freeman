"""Freeman film 003: compose captured shots into 1080 x 1920 frames.
Site shots are pasted 1:1 (they were captured at their crop scale) with the site's own crosshair drawn
at one constant size, in whatever colour the page's CSS cursor specifies. The photograph shot expands
the original Beetlecat photograph out of its map preview; the lockup sets the finished Freeman-colorway
script from the opening shot over "Built for Generations".
Usage: python3 compose.py <rawDir> <outDir> <siteDir>"""
import json, sys, os, re
from PIL import Image, ImageDraw
import numpy as np

RAW, OUT, SITE = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
T = json.load(open(os.path.join(os.path.dirname(__file__), 'timeline.json')))
FPS, CS = T['fps'], T['cursorScale']     # CS: film px per cursor-SVG px, the same in every shot
SHOT = {s['id']: s for s in T['shots']}
meta = json.load(open(os.path.join(RAW, 'meta.json')))
frames = {fr['f']: fr for fr in meta['frames']}
hexrgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
cssrgb = lambda s: tuple(int(v) for v in re.findall(r'\d+', s)[:3])
fno = lambda t: int(round(t * FPS))

def cursor(st):
    """The 21 x 21 SVG cursor from the site CSS: a 1px cross plus a centred square; hotspot (10,10).
    CS is a whole number, so every SVG pixel is an exact block of film pixels."""
    im = Image.new('RGBA', (21 * CS, 21 * CS), (0, 0, 0, 0)); d = ImageDraw.Draw(im); u = CS
    stroke = hexrgb(st['stroke'])
    d.rectangle([10 * u, 1 * u, 11 * u - 1, 20 * u - 1], fill=stroke)
    d.rectangle([1 * u, 10 * u, 20 * u - 1, 11 * u - 1], fill=stroke)
    a, w = st['rx'], st['rw']
    d.rectangle([round(a * u), round(a * u), round((a + w) * u) - 1, round((a + w) * u) - 1], fill=hexrgb(st['fill']))
    return im

def site_frame(fr, with_cursor=True):
    src = Image.open(os.path.join(RAW, fr['file'])).convert('RGB')
    c, clip = fr['crop'], fr['clip']; s = c['scale']
    canvas = Image.new('RGB', (1080, 1920), cssrgb(fr['paper']))
    w, h = round(clip['width'] * s), round(clip['height'] * s)
    if src.size != (w, h): src = src.resize((w, h), Image.LANCZOS)
    canvas.paste(src, (round((clip['x'] - c['x']) * s), round((clip['y'] - c['y']) * s)))
    if with_cursor:
        cur = cursor(fr['cursor']['style']); cx, cy = fr['cursor']['canvas']
        canvas.paste(cur, (round(cx) - 10 * CS, round(cy) - 10 * CS), cur)
    return canvas

# ---- The photograph: one continuous scale-and-position move from the preview to the full frame ----
def bezier(x1, y1, x2, y2):
    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(48):
            t = (lo + hi) / 2
            if 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3 < x: lo = t
            else: hi = t
        t = (lo + hi) / 2
        return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3
    return f
# Lifts off the preview, travels, and reaches the frame edges still moving: a decisive arrival.
ARRIVE = bezier(.55, 0, .7, .95)
ARRIVE_END_SLOPE = (1 - ARRIVE(1 - 1e-4)) / 1e-4

class Expansion:
    def __init__(self, peek_frame):
        pk, c = peek_frame['peek'], peek_frame['crop']; s = c['scale']
        self.photo = Image.open(os.path.join(SITE, pk['src'].lstrip('/'))).convert('RGB')
        nw, nh = self.photo.size
        assert (nw, nh) == (pk['nw'], pk['nh']) and pk['fit'] == 'cover' and pk['pos'] == '50% 50%' and pk['filter'] == 'none', pk
        x, y, w, h = pk['rect']
        self.r0 = np.array([(x - c['x']) * s, (y - c['y']) * s, w * s, h * s])     # preview, on the canvas
        self.r1 = np.array([0, 0, 1080, 1920.])
        self.k0 = max(self.r0[2] / nw, self.r0[3] / nh)                           # object-fit: cover
        self.k1 = 1920 / nh                                                       # full height of the photograph
        e = SHOT['photo']['expand']
        self.c0 = np.array([nw / 2, nh / 2]); self.c1 = np.array([e['focusX'] * nw, nh / 2])
        self.ov, self.ta, self.ts = e['overshoot'], e['arrive'], e['settle']
        self.t0 = SHOT['photo']['start']
        self.size = (nw, nh)

    def state(self, t):
        u = (t - self.t0) / self.ta
        if u < 1:
            p = ARRIVE(max(0, u))
            win = self.r0 + (self.r1 - self.r0) * p
            k = self.k0 + (self.k1 * (1 + self.ov) - self.k0) * p
            ctr = self.c0 + (self.c1 - self.c0) * p
        else:
            # The photograph absorbs the arrival's momentum: it carries on a touch, then settles back
            # to its resting scale (a Hermite curve matching the arrival's velocity, ending at rest).
            v = min(1, (t - self.t0 - self.ta) / self.ts)
            m0 = (self.k1 * (1 + self.ov) - self.k0) * ARRIVE_END_SLOPE / self.ta * self.ts / self.k1
            g = (2 * v ** 3 - 3 * v ** 2 + 1) * self.ov + (v ** 3 - 2 * v ** 2 + v) * m0
            win, k, ctr = self.r1, self.k1 * (1 + g), self.c1
        return win, k, ctr

    def draw(self, base, t):
        win, k, ctr = self.state(t)
        nw, nh = self.size
        # the part of the photograph inside the window, kept inside the photograph
        sw, sh = win[2] / k, win[3] / k
        sx = min(max(ctr[0] - sw / 2, 0), nw - sw); sy = min(max(ctr[1] - sh / 2, 0), nh - sh)
        X0, Y0 = round(win[0]), round(win[1]); X1, Y1 = round(win[0] + win[2]), round(win[1] + win[3])
        box = (sx + (X0 - win[0]) / k, sy + (Y0 - win[1]) / k, sx + (X1 - win[0]) / k, sy + (Y1 - win[1]) / k)
        box = (max(0, box[0]), max(0, box[1]), min(nw, box[2]), min(nh, box[3]))   # sub-pixel rounding at the edges
        out = base.copy()
        out.paste(self.photo.resize((X1 - X0, Y1 - Y0), Image.LANCZOS, box=box), (X0, Y0))
        return out, dict(win=[round(v, 2) for v in win], k=round(k, 4), src=[round(v, 1) for v in (sx, sy, sw, sh)])

# ---- Lockup: the finished Freeman-colorway script from the opening shot, exactly where it was ----
def lockup_plate():
    m = SHOT['mark']
    # a frame in the Freeman (sand) colorway, after the click has settled and before the next one
    ref = next(fr for fr in meta['frames'] if fr['shot'] == 'mark' and cssrgb(fr['paper']) == (221, 207, 179) and fr['t'] > 2.8)
    im = site_frame(ref, with_cursor=False)
    paper = np.array(cssrgb(ref['paper']))
    a = np.asarray(im).astype(int); ink = (np.abs(a - paper).sum(2) > 40)
    c = ref['crop']; below = (ref['script'][1] + ref['script'][3] - c['y']) * c['scale']
    ink[int(below) + 8:, :] = False
    ys, xs = np.where(ink); box = (xs.min() - 4, ys.min() - 4, xs.max() + 5, ys.max() + 5)
    plate = Image.new('RGB', (1080, 1920), tuple(paper))
    plate.paste(im.crop(box), box[:2])
    words = Image.open(os.path.join(RAW, 'lockup-words.png')).convert('RGBA')
    wa = np.asarray(words)[..., 3]; wy = np.where(wa.max(1) > 0)[0]
    # the words sit on the line where the entrance navigation sits, under the script
    target = SHOT['lockup'].get('wordsY') or meta['navCanvasY']
    plate.paste(words, (0, round(target - (wy.min() + wy.max()) / 2)), words)
    return plate, box

if __name__ == '__main__':
    only = set(int(v) for v in sys.argv[4].split(',')) if len(sys.argv) > 4 else None
    n = fno(T['duration'])
    peek_f = max(fr['f'] for fr in meta['frames'] if fr['shot'] == 'map')
    exp = Expansion(frames[peek_f]); base = site_frame(frames[peek_f])
    plate = None; log = []
    for f in range(n):
        if only is not None and f not in only: continue
        t = f / FPS; out = os.path.join(OUT, 'f%04d.png' % f)
        shot = [s for s in T['shots'] if t >= s['start'] - 1e-6][-1]
        if shot.get('doc'): site_frame(frames[f]).save(out)
        elif shot.get('expand'):
            im, st = exp.draw(base, t); im.save(out); log.append(dict(f=f, **st))
        elif shot.get('plate'): Image.open(os.path.join(RAW, frames[f]['file'])).convert('RGB').save(out)
        else:
            if plate is None: plate, box = lockup_plate()
            plate.save(out)
    json.dump(log, open(os.path.join(OUT, 'expansion.json'), 'w'), indent=0)
    print('composed', n if only is None else len(only))
