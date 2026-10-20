/* Offline check for the three hands: node v5/studies/opus-signature-motion/verify.js
   Reads the original bitmap from production pixel-mark.js, builds every hand for desktop and
   mobile, and confirms each one owns and finishes every pixel of the artwork. */
"use strict";
const fs = require("fs"), path = require("path");
const Hand = require("./hand.js");
const src = fs.readFileSync(path.join(__dirname, "../../pixel-mark.js"), "utf8");
const pixels = JSON.parse(src.match(/const pts=(\[\[.*?\]\]);/)[1]).map(([x, y]) => ({ x, y }));
let failed = false;
for (const id of Object.keys(Hand.HANDS)) for (const mobile of [false, true]) {
  const b = Hand.build(pixels, id, { mobile });
  const end = b.alphaAt(b.total), start = b.alphaAt(b.pause);
  const complete = end.every((a) => a === 1), blank = start.every((a) => a === 0);
  const ok = b.pixels.length === pixels.length && complete && blank && !b.warnings.length;
  if (!ok) failed = true;
  console.log(`${ok ? "ok  " : "FAIL"} ${b.hand.name.padEnd(11)} ${mobile ? "mobile " : "desktop"} ${Math.round(b.total)} ms  ` +
    `${b.paths.map((p) => p.stroke).join(" → ")}  ${b.pixels.length}/${pixels.length} px${b.warnings.length ? "  " + b.warnings.join("; ") : ""}`);
}
// The baked production timeline must match the current hand.js and pixel-mark.js.
{
  const crypto = require("crypto"), vm = require("vm"), box = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "practiced.timeline.js"), "utf8"), box);
  const T = box.window.FreemanHandTimeline;
  const sorted = pixels.slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const sha = "pixel-mark.js sha256 " + crypto.createHash("sha256").update(src).digest("hex");
  for (const mobile of [false, true]) {
    const b = Hand.build(sorted, "practiced", { mobile }), P = mobile ? T.mobile : T.desktop;
    let worst = 0;
    for (let ms = 0; ms <= b.total; ms += 4) {
      const a = b.alphaAt(ms);
      for (let i = 0; i < a.length; i++) worst = Math.max(worst, Math.abs(a[i] - Math.max(0, Math.min(1, (ms * 10 - P.t[i]) / P.f[i]))));
    }
    const ok = T.source === sha && T.count === sorted.length && Math.abs(P.total - b.total) < 0.1 && worst < 0.05;
    if (!ok) failed = true;
    console.log(`${ok ? "ok  " : "FAIL"} timeline    ${mobile ? "mobile " : "desktop"} ${P.total} ms  max alpha error ${worst.toFixed(3)}  ${T.source === sha ? "artwork matches" : "artwork CHANGED: run bake.js"}`);
  }
}
process.exit(failed ? 1 : 0);
