// Draws the mix against the film's own cues: waveform, spectrogram (log frequency), cue lines.
//   node viz.mjs <mix.wav> <cues.json> <out.bmp>   (convert with: sips -s format png out.bmp --out out.png)
import fs from 'node:fs';
const [wavPath, cuePath, outPath] = process.argv.slice(2);
const w = fs.readFileSync(wavPath), SR = 48000, n = (w.length - 44) / 6;
const L = new Float32Array(n), R = new Float32Array(n);
for (let i = 0, o = 44; i < n; i++, o += 6) { L[i] = w.readIntLE(o, 3) / 8388607; R[i] = w.readIntLE(o + 3, 3) / 8388607; }
const { cues } = JSON.parse(fs.readFileSync(cuePath, 'utf8'));
const W = 3000, H = 900, img = new Uint8Array(W * H * 3).fill(255);
const px = (x, y, r, g, b) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 3; img[i] = r; img[i + 1] = g; img[i + 2] = b; };
// waveform (top 300 px)
for (let x = 0; x < W; x++) { const a = Math.floor(x * n / W), b = Math.floor((x + 1) * n / W); let mn = 0, mx = 0; for (let i = a; i < b; i++) { const v = (L[i] + R[i]) / 2; if (v < mn) mn = v; if (v > mx) mx = v; } for (let y = Math.round(150 - mx * 140); y <= Math.round(150 - mn * 140); y++) px(x, y, 51, 46, 32); }
// dB envelope (300–420)
for (let x = 0; x < W; x++) { const a = Math.floor(x * n / W), b = Math.floor((x + 1) * n / W); let e = 0; for (let i = a; i < b; i++) e += L[i] * L[i]; const d = 10 * Math.log10(e / (b - a) + 1e-12); const y = Math.round(420 - (d + 70) * 1.7); for (let yy = y; yy < 420; yy++) px(x, yy, 197, 185, 167); }
// spectrogram (430–890), 2048 FFT, log frequency 40 Hz – 16 kHz
const F = 2048; const win = Float64Array.from({ length: F }, (_, i) => .5 - .5 * Math.cos(2 * Math.PI * i / F));
function fft(re, im) { const N = re.length; for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } } for (let len = 2; len <= N; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang); for (let i = 0; i < N; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr; re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } } } }
const top = 430, bot = 890, f0 = 40, f1 = 16000;
for (let x = 0; x < W; x++) {
  const c = Math.floor((x + .5) * n / W) - F / 2; const re = new Float64Array(F), im = new Float64Array(F);
  for (let i = 0; i < F; i++) { const j = c + i; re[i] = j >= 0 && j < n ? (L[j] + R[j]) / 2 * win[i] : 0; }
  fft(re, im);
  for (let y = top; y < bot; y++) { const f = f0 * Math.pow(f1 / f0, (bot - y) / (bot - top)); const k = Math.round(f * F / SR); const m = Math.hypot(re[k], im[k]); const d = 20 * Math.log10(m + 1e-9); const v = Math.max(0, Math.min(1, (d + 70) / 70)); px(x, y, 255 - v * 204, 249 - v * 203, 241 - v * 209); }
}
// cue lines and seconds
const mark = (t, r, g, b, y0, y1) => { const x = Math.round(t / 30 * W); for (let y = y0; y < y1; y++) px(x, y, r, g, b); };
for (let s = 0; s <= 30; s++) mark(s, 120, 110, 100, 0, 12);
for (const [t, name] of cues) { if (name === 'v' || name === 'key' || name === 'phone-key') continue; const red = /stamp|approve|grab|release|plot|evidence|send|card/.test(name) || name === 'touch'; mark(t, red ? 249 : 150, red ? 56 : 140, red ? 34 : 130, 0, H); }
for (const t of [23.72, 26.54]) for (let d = -1; d <= 1; d++) mark(t + d / 100, 249, 56, 34, 0, H);
// BMP
const row = W * 3, pad = (4 - row % 4) % 4, size = 54 + (row + pad) * H, bmp = Buffer.alloc(size);
bmp.write('BM', 0); bmp.writeUInt32LE(size, 2); bmp.writeUInt32LE(54, 10); bmp.writeUInt32LE(40, 14); bmp.writeInt32LE(W, 18); bmp.writeInt32LE(H, 22); bmp.writeUInt16LE(1, 26); bmp.writeUInt16LE(24, 28); bmp.writeUInt32LE((row + pad) * H, 34);
let o = 54; for (let y = H - 1; y >= 0; y--) { for (let x = 0; x < W; x++) { const i = (y * W + x) * 3; bmp[o++] = img[i + 2]; bmp[o++] = img[i + 1]; bmp[o++] = img[i]; } o += pad; }
fs.writeFileSync(outPath, bmp);
