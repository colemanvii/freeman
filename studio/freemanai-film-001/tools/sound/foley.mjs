// Recorded Foley: reading the working copies and finding the usable moments in them.
// Working copies are the CC0 originals decoded to 48 kHz, 24-bit WAV with afconvert:
//   afconvert -f WAVE -d LEI24@48000 -c 1 <original> <id>.wav   (jobsite recordings keep 2 channels)
import fs from 'node:fs';

export const SR = 48000;

/** Read a 24-bit PCM WAV (any chunk order) into Float32 channels. */
export function readWav(path) {
  const b = fs.readFileSync(path);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WAVE') throw new Error('not a WAV: ' + path);
  let o = 12, ch = 0, bits = 0, rate = 0, data = null;
  while (o + 8 <= b.length) {
    const id = b.toString('ascii', o, o + 4), size = b.readUInt32LE(o + 4);
    if (id === 'fmt ') { ch = b.readUInt16LE(o + 10); rate = b.readUInt32LE(o + 12); bits = b.readUInt16LE(o + 22); }
    if (id === 'data') data = b.subarray(o + 8, o + 8 + size);
    o += 8 + size + (size & 1);
  }
  if (bits !== 24 || rate !== SR || !data) throw new Error(`expected 48 kHz 24-bit PCM: ${path} (${rate} Hz, ${bits}-bit)`);
  const n = Math.floor(data.length / (3 * ch)), out = Array.from({ length: ch }, () => new Float32Array(n));
  for (let i = 0, p = 0; i < n; i++) for (let c = 0; c < ch; c++, p += 3) out[c][i] = data.readIntLE(p, 3) / 8388608;
  return out;
}

const dB = (x) => 20 * Math.log10(x + 1e-9);

/** Amplitude envelope with a short attack and release (seconds). */
export function envelope(x, att = .001, rel = .01) {
  const a = Math.exp(-1 / (att * SR)), r = Math.exp(-1 / (rel * SR)), e = new Float32Array(x.length);
  let y = 0; for (let i = 0; i < x.length; i++) { const v = Math.abs(x[i]); y = v > y ? v + (y - v) * a : v + (y - v) * r; e[i] = y; }
  return e;
}

/**
 * Find transients: points where the envelope jumps well above the level just before.
 * Each hit: start (s), peak (dBFS), rise (dB above the 40 ms before), decay (s to fall 30 dB),
 * low (share of energy under 250 Hz in the first 150 ms), floor (dBFS in the 60 ms before).
 */
export function hits(x, { rise = 14, gap = .06, minPeak = -45 } = {}) {
  const e = envelope(x, .0005, .015), out = [];
  const back = Math.round(.04 * SR);
  let i = back, last = -1e9;
  while (i < x.length - 1) {
    const before = e[i - back], now = e[i];
    if (dB(now) - dB(before) >= rise && dB(now) > minPeak && i - last > gap * SR) {
      let s = i; while (s > 0 && e[s - 1] < e[s] && e[s - 1] > before * 1.4) s--;
      let p = i; for (let k = i; k < Math.min(x.length, i + .03 * SR); k++) if (e[k] > e[p]) p = k;
      let d = p; while (d < x.length - 1 && dB(e[d]) > dB(e[p]) - 30 && d - p < 2 * SR) d++;
      let floor = 0; for (let k = Math.max(0, s - .06 * SR); k < s; k++) floor = Math.max(floor, Math.abs(x[k]));
      const n = Math.min(Math.round(.15 * SR), x.length - s); let lo = 0, all = 0, y = 0; const k1 = 1 - Math.exp(-2 * Math.PI * 250 / SR);
      for (let k = 0; k < n; k++) { const v = x[s + k]; y += (v - y) * k1; lo += y * y; all += v * v; }
      out.push({ start: s / SR, peak: +dB(e[p]).toFixed(1), rise: +(dB(e[p]) - dB(before)).toFixed(1), decay: +((d - p) / SR).toFixed(3), low: +(lo / (all + 1e-12)).toFixed(3), floor: +dB(floor).toFixed(1) });
      last = i; i = p + Math.round(gap * SR);
    } else i++;
  }
  return out;
}

/** Short-term level (dB RMS) in windows, for choosing steady passages. */
export function levels(x, win = .1) { const w = Math.round(win * SR), r = []; for (let s = 0; s + w <= x.length; s += w) { let e = 0; for (let i = s; i < s + w; i++) e += x[i] * x[i]; r.push(+dB(Math.sqrt(e / w)).toFixed(1)); } return r; }

/** Cut [start, start+len] seconds from x with short fades; returns a new buffer. */
export function cut(x, start, len, fadeIn = .002, fadeOut = .02) {
  const s = Math.max(0, Math.round(start * SR)), n = Math.min(Math.round(len * SR), x.length - s), b = new Float32Array(n);
  const fi = fadeIn * SR, fo = fadeOut * SR;
  for (let i = 0; i < n; i++) { let g = 1; if (i < fi) g = i / fi; if (n - i < fo) g = Math.min(g, (n - i) / fo); b[i] = x[s + i] * g; }
  return b;
}

/** Peak-normalise a buffer to a level in dBFS. */
export function norm(b, to = -6) { let p = 0; for (const v of b) p = Math.max(p, Math.abs(v)); const g = Math.pow(10, to / 20) / (p || 1); for (let i = 0; i < b.length; i++) b[i] *= g; return b; }

if (process.argv[1] && process.argv[1].endsWith('foley.mjs')) {
  const dir = process.argv[2];
  const opts = { 470710: { rise: 12 }, 362622: { rise: 12 }, 514486: { rise: 12 }, 636044: { rise: 10, gap: .05 }, 563505: { rise: 10, gap: .05 }, 631822: { rise: 10, gap: .05 }, 704862: { rise: 10, gap: .05 }, 450235: { rise: 8, gap: .25, minPeak: -50 }, 396531: { rise: 8, gap: .25, minPeak: -50 }, 371026: { rise: 10 }, 464302: { rise: 8 } };
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.wav')).sort()) {
    const id = f.slice(0, -4), [x] = readWav(`${dir}/${f}`);
    const h = hits(x, opts[id] || {});
    const lv = levels(x, .25);
    console.log(`\n${id}  ${(x.length / SR).toFixed(2)} s  hits ${h.length}  level p10/p50/p90 ${[.1, .5, .9].map((q) => [...lv].sort((a, b) => a - b)[Math.floor(q * (lv.length - 1))]).join('/')} dB`);
    console.log(h.slice(0, id.match(/^(470710|362622|514486)$/) ? 20 : 8).map((k) => `  ${k.start.toFixed(3)}s pk ${k.peak} rise ${k.rise} dec ${k.decay} low ${k.low} floor ${k.floor}`).join('\n'));
  }
}
