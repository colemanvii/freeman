"""Freeman film 002: original sound design, synthesized here (no samples).
Every cue is taken from the capture log (raw/meta.json) or measured from the rendered frames.
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
shot_start = {s['id']: s['start'] for s in T['shots']}
ups = [e['t'] for e in meta['events'] if e['type'] == 'up']

# Click: a small dry switch — firm tick on press, lighter and higher on release.
def click(up=False):
    t = tt(0.035)
    tick = bp(rng.standard_normal(len(t)), 3800 if up else 2500, 9000 if up else 7000) * np.exp(-t / 0.0012)
    body = np.sin(2 * np.pi * (2300 if up else 1650) * t) * np.exp(-t / (0.004 if up else 0.006))
    low = 0 if up else np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.004) * 0.5
    return norm(tick * 0.9 + body * 0.35 + low) * (0.55 if up else 1.0)
for e in meta['events']:
    add(click(e['type'] == 'up'), e['t'], db(-12 if e['type'] == 'down' else -16), 0.06)

# Pen: nib on paper, loudness following the measured ink rate of the signature frames.
ink = []
for f in range(0, int(1.6 * FPS)):
    a = frame(f)[300:1200:3, ::3]; ink.append(((a.sum(2)) < 360).sum())
rate = np.diff(np.array(ink, float), prepend=ink[0]).clip(0); rate /= rate.max() or 1
env = lp(np.interp(tt(len(rate) / FPS), np.arange(len(rate)) / FPS, rate), 18, 1).clip(0)
grain = hp(rng.standard_normal(len(env)), 1800) * (1 + 0.6 * np.sign(np.sin(2 * np.pi * 37 * tt(len(env) / SR))))
add(norm(bp(grain, 2200, 7500) * env ** 0.8), 0.0, db(-29), -0.1)

# Colorways: a soft struck tone with each change — D, F#, then A as the light paper returns.
def chime(freq, dur=0.55):
    t = tt(dur)
    s = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t / (0.22 / m ** 0.5)) for m, a in [(1, 1), (2, .28), (3.01, .08)])
    return norm(s * np.minimum(1, t / 0.004))
for t_up, fq in zip(ups[:3], [293.66, 369.99, 440.0]):
    add(chime(fq), t_up, db(-24), {293.66: -0.25, 369.99: 0.25, 440.0: 0.0}[fq])

# Entering the map: a quiet sheet laid down.
def settle(dur=0.16, lo=300, hi=3200):
    t = tt(dur); n = lp(bp(rng.standard_normal(len(t)), lo, hi), 2400)
    return norm(n * np.minimum(1, t / 0.012) * np.exp(-t / 0.05))
add(settle(0.2), shot_start['map'], db(-29))

# The Record arrives with the site's stepped wipe (steps(5), 420 ms): five fine ticks, one per step.
rec_open = ups[4]
for k in range(5):
    t = tt(0.02); tick = bp(rng.standard_normal(len(t)), 3000, 8000) * np.exp(-t / 0.0015)
    add(norm(tick), rec_open + k * 0.084 + 0.02, db(-31 - k * 0.8), 0.3 - k * 0.12)

# VIEW FRAME: the photograph settles, then a low, open room tone holds under it until the cut.
view = ups[5]
add(settle(0.14, 200, 2200), view, db(-31))
t = tt(shot_start['eagle'] - view)
room = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(73.42, 1, 0), (110.0, .6, .5), (146.83, .35, 1.1), (220.0, .12, .3)])
room = lp(room * np.minimum(1, t / 0.45) * np.minimum(1, (t[-1] - t) / 0.05) * (1 + .05 * np.sin(2 * np.pi * .6 * t)), 900)
add(norm(room), view + 0.05, db(-30))

# Stamp: a dry impression on the first frame of red ink — weighted thump, rubber contact, paper. No room.
def first_red(start):
    f = int(round(start * FPS))
    while True:
        a = frame(f)[700:960, 240:840]
        if ((a[..., 0] > 200) & (a[..., 1] < 100)).sum() > 500: return f / FPS
        f += 1
stamp_ink = first_red(T['eagle']['stampStart'])
t = tt(0.32)
thump = np.sin(2 * np.pi * np.cumsum(105 * np.exp(-t / 0.05) + 52) / SR) * np.exp(-t / 0.075)
contact = lp(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.012)
paper = bp(rng.standard_normal(len(t)), 900, 5000) * np.exp(-t / 0.03) * 0.25
k = int(0.20 * SR)
press = np.zeros(len(t)); press[k:] = bp(rng.standard_normal(len(t) - k), 400, 2500) * np.exp(-np.arange(len(t) - k) / SR / 0.01) * 0.18
add(norm(thump + contact * 0.8 + paper + press), stamp_ink - 0.004, db(-8))

# Resolve: the D chord, quietly, as the script returns; it fades to silence by the loop point.
t = tt(T['duration'] - shot_start['resolve'])
chord = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(146.83, .8), (220.0, .55), (293.66, .45), (369.99, .25), (440.0, .12)])
chord = lp(chord * np.minimum(1, t / 0.25) * np.clip((t[-1] - t) / 1.4, 0, 1) ** 1.5, 2200)
add(norm(chord), shot_start['resolve'] + 0.02, db(-30))

mix = hp(np.stack([L, R]), 28).T
mix *= db(-1.5) / np.max(np.abs(mix))
wavfile.write(OUT, SR, (mix * 32767).astype(np.int16))
print('stamp first ink at', round(stamp_ink, 3), 's; cues:', [round(u, 3) for u in ups])
