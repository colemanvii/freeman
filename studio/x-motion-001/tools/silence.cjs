// A silent 48 kHz stereo 16-bit WAV of the given length: node silence.cjs <out.wav> <seconds>
const fs = require('fs');
const [out, secs] = [process.argv[2], Number(process.argv[3])];
const n = Math.round(48000 * secs), data = n * 4, b = Buffer.alloc(44 + data);
b.write('RIFF', 0); b.writeUInt32LE(36 + data, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(48000, 24); b.writeUInt32LE(192000, 28);
b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(data, 40);
fs.writeFileSync(out, b);
