"""Freeman film 002: compose captured crops into 1080 x 1920 frames, draw the site's own crosshair
(at one constant size, in whatever colour the page's CSS cursor specifies) and build the resolve plate.
Usage: python3 compose.py <rawDir> <outDir>"""
import json, sys, os
from PIL import Image, ImageDraw
import numpy as np

RAW, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
T = json.load(open(os.path.join(os.path.dirname(__file__), 'timeline.json')))
CS = T['cursorScale']           # canvas px per cursor-SVG px, the same in every shot
PAPER = (255, 249, 241)         # chalk --paper #fff9f1
SS = 4
hexrgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def cursor(st):
    """The 21 x 21 SVG cursor from the site CSS: 1px cross plus a centred square; hotspot (10,10)."""
    n = int(21 * CS * SS) + SS
    im = Image.new('RGBA', (n, n), (0, 0, 0, 0)); d = ImageDraw.Draw(im); u = CS * SS
    stroke = hexrgb(st['stroke'])
    d.rectangle([10 * u, 1 * u, 11 * u - 1, 20 * u - 1], fill=stroke)
    d.rectangle([1 * u, 10 * u, 20 * u - 1, 11 * u - 1], fill=stroke)
    a, w = st['rx'], st['rw']
    d.rectangle([a * u, a * u, (a + w) * u - 1, (a + w) * u - 1], fill=hexrgb(st['fill']))
    return im.resize((n // SS, n // SS), Image.LANCZOS)

def site_frame(fr, with_cursor=True):
    src = Image.open(os.path.join(RAW, fr['file'])).convert('RGB')
    c, clip = fr['crop'], fr['clip']; s = c['scale']
    # paper beyond the window edge is the page's own paper colour (sampled from the capture's corner)
    canvas = Image.new('RGB', (1080, 1920), src.getpixel((2, 2)))
    canvas.paste(src.resize((round(clip['width'] * s), round(clip['height'] * s)), Image.LANCZOS),
                 (round((clip['x'] - c['x']) * s), round((clip['y'] - c['y']) * s)))
    if with_cursor:
        cur = cursor(fr['cursor']['style']); cx, cy = fr['cursor']['canvas']
        canvas.paste(cur, (round(cx - 10 * CS), round(cy - 10 * CS)), cur)
    return canvas

meta = json.load(open(os.path.join(RAW, 'meta.json')))
frames = meta['frames']
resolve_base = None
for fr in frames:
    if fr.get('full'):
        Image.open(os.path.join(RAW, fr['file'])).convert('RGB').save(os.path.join(OUT, fr['file'])); continue
    if fr.get('resolve'):
        if resolve_base is None:
            # The finished chalk script from the opening shot, at exactly the same place on the canvas.
            ref = next(f for f in frames if f['shot'] == 'mark' and abs(f['t'] - 3.40) < 1e-3)
            im = site_frame(ref, with_cursor=False)
            a = np.asarray(im).astype(int); ink = (np.abs(a - np.array(PAPER)).sum(2) > 40)
            ink[int(meta['navCanvasY']) - 30:, :] = False
            ys, xs = np.where(ink); box = (xs.min() - 4, ys.min() - 4, xs.max() + 5, ys.max() + 5)
            resolve_base = Image.new('RGB', (1080, 1920), PAPER)
            resolve_base.paste(im.crop(box), box[:2])
            words = Image.open(os.path.join(RAW, 'resolve-words.png')).convert('RGBA')
            resolve_base.paste(words, (0, 0), words)
        resolve_base.save(os.path.join(OUT, fr['file'])); continue
    site_frame(fr).save(os.path.join(OUT, fr['file']))
print('composed', len(frames))
