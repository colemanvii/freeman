/* Bake the refined Practiced hand into a static timing table for production:
   node v5/studies/opus-signature-motion/bake.js
   hand.js needs ~0.2–0.4 s of thinning and routing per build (far longer on a phone), so the site
   ships only the result: when each pixel is first inked and how long it takes to settle.
   Pixels are listed in row-major order (y, then x) of the production finished frame, the order
   hand-mark.js reads them back from FreemanPixelMark at runtime. No coordinates are copied. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const Hand = require("./hand.js");
const file = path.join(__dirname, "../../pixel-mark.js");
const src = fs.readFileSync(file, "utf8");
const pixels = JSON.parse(src.match(/const pts=(\[\[.*?\]\]);/)[1]).map(([x, y]) => ({ x, y }))
  .sort((a, b) => a.y - b.y || a.x - b.x);
const profile = (mobile) => {
  const b = Hand.build(pixels, "practiced", { mobile });
  if (b.warnings.length) throw new Error(b.warnings.join("; "));
  // tenths of a millisecond; total is recomputed from the rounded values so it stays exact
  const t = b.pixels.map((q) => Math.round(q.t * 10)), f = b.pixels.map((q) => Math.max(1, Math.round(q.fade * 10)));
  const total = Math.max(...t.map((v, i) => v + f[i])) / 10;
  return { total, t, f };
};
const out = {
  hand: "practiced", refinement: "002",
  source: "pixel-mark.js sha256 " + crypto.createHash("sha256").update(src).digest("hex"),
  count: pixels.length, phone: "(max-width:760px)",
  desktop: profile(false), mobile: profile(true),
};
const js = `/* Freeman signature — refined Practiced hand (refinement 002), baked by bake.js from hand.js.
   Per pixel, in row-major order of the production finished frame: t = first inked, f = settle,
   both in tenths of a millisecond. Regenerate with bake.js if hand.js or pixel-mark.js changes. */
window.FreemanHandTimeline=${JSON.stringify(out)};
`;
fs.writeFileSync(path.join(__dirname, "practiced.timeline.js"), js);
console.log(`practiced.timeline.js  ${out.count} px  desktop ${out.desktop.total} ms  mobile ${out.mobile.total} ms  ${(js.length / 1024).toFixed(1)} KB`);
