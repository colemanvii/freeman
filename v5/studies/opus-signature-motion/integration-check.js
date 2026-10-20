const { chromium } = require("playwright");
/* Integration check: the entrance with the refined hand against unmodified production.
   node v5/studies/opus-signature-motion/integration-check.js <production-url> <candidate-url>
   Needs Playwright with Chromium. Compares size, position, every colorway's final frame (RGBA),
   reduced motion, click replay, colorway repaint and back navigation, on phone and desktop. */
const [PROD, INTEG] = process.argv.slice(2);
if (!PROD || !INTEG) { console.error("usage: integration-check.js <production-url> <candidate-url>"); process.exit(2); }
const VIEWS = { phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } };
async function open(b, url, view, { palette = "chalk", reduce = false, sample = false } = {}) {
  const ctx = await b.newContext({ ...VIEWS[view], reducedMotion: reduce ? "reduce" : "no-preference" });
  await ctx.addInitScript((p) => { try { sessionStorage.setItem("freeman-palette", p); } catch (e) {} }, palette);
  if (sample) await ctx.addInitScript(() => {
    window.__ink = []; const raf = window.requestAnimationFrame.bind(window), t0 = performance.now();
    const loop = (now) => { const c = document.querySelector("#v4-pixel-mark"); if (c) { const d = c.getContext("2d").getImageData(0, 0, 160, 61).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; window.__ink.push([Math.round(now - t0), n]); } raf(loop); }; raf(loop);
  });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(url); await p.waitForSelector("#v4-pixel-mark");
  return { ctx, p, errs };
}
const geom = (p) => p.evaluate(() => { const r = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(2)); }; return { canvas: r("#v4-pixel-mark"), nav: r(".v4-home-nav"), px: getComputedStyle(document.querySelector(".v4-home")).getPropertyValue("--px") }; });
const frame = (p) => p.evaluate(() => Array.from(document.querySelector("#v4-pixel-mark").getContext("2d").getImageData(0, 0, 160, 61).data).join(","));
(async () => {
  const b = await chromium.launch(); let fail = 0;
  const ok = (c, msg) => { if (!c) fail++; console.log((c ? "ok   " : "FAIL ") + msg); };
  for (const view of ["phone", "desktop"]) for (const palette of ["chalk", "sand", "umber"]) {
    const A = await open(b, PROD, view, { palette }), B = await open(b, INTEG, view, { palette, sample: palette === "chalk" });
    await A.p.waitForTimeout(2600); await B.p.waitForTimeout(2600);
    const ga = await geom(A.p), gb = await geom(B.p);
    ok(JSON.stringify(ga) === JSON.stringify(gb), `${view} ${palette}: size/position identical ${JSON.stringify(gb)}`);
    ok(await frame(A.p) === await frame(B.p), `${view} ${palette}: final frame identical to production (RGBA)`);
    ok(await B.p.evaluate(() => !!window.FreemanHandMark && !!window.FreemanHandTimeline), `${view} ${palette}: hand player active`);
    if (palette === "chalk") {
      const ink = await B.p.evaluate(() => window.__ink);
      const first = ink.find((s) => s[1] > 0), full = ink.find((s) => s[1] === 2278);
      let mono = true; for (let i = 1; i < ink.length; i++) if (ink[i][1] < ink[i - 1][1]) mono = false;
      ok(mono && first && full, `${view}: plays from blank, ink only grows; first ink ${first && first[0]} ms, complete ${full && full[0]} ms after first frame`);
      await B.p.click(".v4-home-mark"); await B.p.waitForTimeout(150);
      const mid = await B.p.evaluate(() => { const d = document.querySelector("#v4-pixel-mark").getContext("2d").getImageData(0, 0, 160, 61).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
      await B.p.waitForTimeout(2500);
      ok(mid < 2278 && await frame(A.p) === await frame(B.p), `${view}: click replays (${mid} px at 150 ms) and ends on the production frame`);
      // colorway switch after finish repaints without restarting
      await B.p.click('[data-v4-color="umber"]'); await A.p.click('[data-v4-color="umber"]'); await B.p.waitForTimeout(100);
      ok(await frame(A.p) === await frame(B.p), `${view}: colorway change repaints finished frame in new colour`);
      // back/forward: leave and come back -> finished frame, no replay
      await B.p.click('.v4-home-nav a >> nth=0'); await B.p.waitForTimeout(600); await B.p.goBack(); await B.p.waitForSelector("#v4-pixel-mark");
      await B.p.waitForTimeout(30);
      const back = await B.p.evaluate(() => { const d = document.querySelector("#v4-pixel-mark").getContext("2d").getImageData(0, 0, 160, 61).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] === 255) n++; return n; });
      ok(back === 2278, `${view}: back navigation shows the finished signature immediately (${back} px)`);
    }
    ok(!A.errs.length && !B.errs.length, `${view} ${palette}: no console errors ${B.errs.join(" | ")}`);
    await A.ctx.close(); await B.ctx.close();
  }
  for (const view of ["phone", "desktop"]) {
    const A = await open(b, PROD, view, { reduce: true }), B = await open(b, INTEG, view, { reduce: true });
    await A.p.waitForTimeout(120); await B.p.waitForTimeout(120);
    ok(await frame(A.p) === await frame(B.p), `${view}: reduced motion shows the production finished frame at once`);
    await A.ctx.close(); await B.ctx.close();
  }
  await b.close(); console.log(fail ? `${fail} FAILED` : "all passed"); process.exit(fail ? 1 : 0);
})();
