"""Freeman film 003: original sound design, synthesized here (no samples).
Sound gives the edit its rhythm: dry clicks where the hand acts, a restrained accent on each colour
change and on the photograph's arrival, a short stamp for the eagle. Nothing narrates the interface.
Every cue is read from the capture log (raw/meta.json), the timeline, or measured from the frames.
Usage: python3 sound.py <rawDir> <framesDir> <out.wav>"""
import json, sys, os
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
from PIL import Image

RAW, FRAMES, OUT = sys.argv[1:4]
SR = 48000
T = json.load(open(os.path.join(os.path.dirname(__file__), 'timeline.json')))
meta = json.load(open(os.path.join(RAW, 'meta.json')))
SHOT = {s['id']: s for s in T['shots']}
FPS = T['fps']; N = int(T['duration'] * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(1080)

def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'highpass', fs=SR, output='sos'), x)
def db(d): return 10 ** (d / 20)
def tt(d): return np.arange(int(d * SR)) / SR
def norm(x): return x / (np.max(np.abs(x)) or 1)
def add(sig, t, gain, pan=0.0):
    i = int(round(t * SR)); j = min(N, i + len(sig)); s = sig[:j - i] * gain
    L[i:j] += s * np.cos((pan + 1) * np.pi / 4) * 1.4142; R[i:j] += s * np.sin((pan + 1) * np.pi / 4) * 1.4142
def frame(f): return np.asarray(Image.open(os.path.join(FRAMES, 'f%04d.png' % f)).convert('RGB')).astype(int)
# Every press and release in the timeline, including those that fall on a cut.
shot_at = lambda t: [s for s in T['shots'] if t >= s['start'] - 1e-6][-1]['id']
ev = [{'t': k['t'], 'type': 'down' if k.get('down') else 'up', 'shot': shot_at(k['t'])} for k in T['cursor'] if k.get('down') or k.get('up')]
ups = lambda shot: [e['t'] for e in ev if e['type'] == 'up' and e['shot'] == shot]

# Click: a small dry switch — firm tick on press, lighter and higher on release. No room.
def click(up=False):
    t = tt(0.03)
    tick = bp(rng.standard_normal(len(t)), 3800 if up else 2400, 9000 if up else 7000) * np.exp(-t / 0.0011)
    body = np.sin(2 * np.pi * (2300 if up else 1600) * t) * np.exp(-t / (0.0035 if up else 0.005))
    low = 0 if up else np.sin(2 * np.pi * 170 * t) * np.exp(-t / 0.004) * 0.6
    return norm(tick * 0.9 + body * 0.3 + low) * (0.5 if up else 1.0)
for e in ev:
    add(click(e['type'] == 'up'), e['t'], db(-23 if e['type'] == 'down' else -28), 0.05)

# Colour changes: the paper changes on release. A short, dry, pitched knock — wood more than bell —
# rising D, F#, A across Dark, Freeman, Light.
def knock(freq, dur=0.22):
    t = tt(dur)
    s = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t / (0.07 / m)) for m, a in [(1, 1), (2.76, .22), (5.4, .06)])
    thud = lp(rng.standard_normal(len(t)), 600) * np.exp(-t / 0.008) * 0.5
    return norm((s + thud) * np.minimum(1, t / 0.0015))
for t_up, fq, pan in zip(ups('mark'), [293.66, 369.99, 440.0], [-0.15, 0.15, 0.0]):
    add(knock(fq), t_up + 0.004, db(-22), pan)

# The photograph: a breath of air that lifts with the expansion and a low, warm landing on arrival;
# then a quiet room under the photograph, leaving it space.
p = SHOT['photo']; t0, ta = p['start'], p['expand']['arrive']
t = tt(ta + 0.25)
swell = bp(rng.standard_normal(len(t)), 500, 4200) * np.clip(t / ta, 0, 1) ** 2.2 * np.exp(-np.maximum(0, t - ta) / 0.05)
add(norm(swell), t0, db(-30), 0.0)
t = tt(0.9)
land = np.sin(2 * np.pi * np.cumsum(62 + 30 * np.exp(-t / 0.04)) / SR) * np.exp(-t / 0.22) * np.minimum(1, t / 0.006)
land += lp(rng.standard_normal(len(t)), 700) * np.exp(-t / 0.02) * 0.25
add(norm(land), t0 + ta - 0.01, db(-17))
t_room = SHOT['eagle']['start'] - (t0 + ta)
t = tt(t_room)
room = sum(a * np.sin(2 * np.pi * f * t + ph) for f, a, ph in [(73.42, 1, 0), (110.0, .55, .5), (146.83, .3, 1.1), (220.0, .1, .3)])
room = lp(room * (1 + .04 * np.sin(2 * np.pi * .5 * t)), 800)
room *= np.minimum(1, t / 0.6) * np.clip((t[-1] - t) / 0.35, 0, 1) ** 1.5
air = lp(hp(rng.standard_normal(len(t)), 250), 2500) * np.minimum(1, t / 0.8) * np.clip((t[-1] - t) / 0.35, 0, 1)
add(norm(room) + norm(air) * 0.12, t0 + ta, db(-29))

# Stamp: a dry impression on the first frame of red ink — weighted thump, rubber contact, paper.
def first_red(start):
    f = int(round(start * FPS))
    while True:
        a = frame(f)
        if ((a[..., 0] > 200) & (a[..., 1] < 100) & (a[..., 2] < 80)).sum() > 500: return f / FPS
        f += 1
stamp_ink = first_red(SHOT['eagle']['start'])
t = tt(0.3)
thump = np.sin(2 * np.pi * np.cumsum(110 * np.exp(-t / 0.045) + 50) / SR) * np.exp(-t / 0.06)
contact = lp(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.01)
paper = bp(rng.standard_normal(len(t)), 900, 5000) * np.exp(-t / 0.025) * 0.25
add(norm(thump + contact * 0.8 + paper), stamp_ink - 0.004, db(-9))

# Lockup: one quiet D, fading to silence by the loop point.
lk = SHOT['lockup']['start']
t = tt(T['duration'] - lk)
chord = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(146.83, .8), (220.0, .5), (293.66, .4), (369.99, .18)])
chord = lp(chord * np.minimum(1, t / 0.12) * np.clip((t[-1] - t) / 1.2, 0, 1) ** 1.6, 2000)
add(norm(chord), lk + 0.01, db(-28))

mix = hp(np.stack([L, R]), 28).T
mix *= db(-1.0) / np.max(np.abs(mix))
wavfile.write(OUT, SR, (mix * 32767).astype(np.int16))
print('cues: clicks', [round(e['t'], 3) for e in ev], 'arrival', round(t0 + ta, 3), 'stamp ink', round(stamp_ink, 3))
