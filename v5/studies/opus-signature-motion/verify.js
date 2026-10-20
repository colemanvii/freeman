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
process.exit(failed ? 1 : 0);
