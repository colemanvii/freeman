// Bake the Flourish arrival table into v5/signature-flourish.js.
// Usage (from the repository root):
//   node v5-source/tools/bake-signature-flourish.mjs <path to signature-motion.js from study/signature-motion-refinement-20261022>
// The study engine derives the times from the bitmap's own skeleton and an authored pen route;
// this script runs it once for the "flourish" variant and stores one byte per pixel (row-major):
// 0 = present on the first frame, n = inked at (n - 1) × STEP ms.
import fs from "fs";
import vm from "vm";

const STEP = 2;
const engine = process.argv[2];
if (!engine) throw new Error("pass the path to the study engine (v5/signature-motion.js on the study branch)");
const pts = JSON.parse(fs.readFileSync("v5/pixel-mark.js", "utf8").match(/const pts=(\[\[.*?\]\]);/s)[1]);
const xy = pts.flat();
const ctx = { window: {}, Math, Float64Array, Int32Array, Uint8Array, Array, Infinity, document: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(engine, "utf8"), ctx);
const E = ctx.window.FreemanSignatureMotion;
const { a, total } = E._schedule("flourish", xy);
const word = Array.from(a).filter((t) => t === 0).length;
// Pixels of the flourish keep a non-zero byte even at t = 0, so the table also records ownership.
const k = E.HAND.length - 1, M = E._analyse(xy), w = M.write(E.HAND), f = M.flood(w, 1.2);
const bytes = Buffer.from(Array.from(a, (t, i) => (f.O[i] === k ? Math.min(255, Math.round(t / STEP) + 1) : 0)));
const b64 = bytes.toString("base64");
const out = "v5/signature-flourish.js", src = fs.readFileSync(out, "utf8");
fs.writeFileSync(out, src.replace(/const BAKED = "[^"]*";/, `const BAKED = "${b64}";`));
console.log(`checksum ${E._checksum(xy)} · ${pts.length} pixels · ${word} on the first frame · ${pts.length - word} signed · total ${total.toFixed(1)} ms → ${(Math.max(...bytes) - 1) * STEP} ms baked · ${b64.length} chars`);
