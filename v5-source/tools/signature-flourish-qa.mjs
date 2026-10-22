// The Flourish — browser QA for the production entrance (Chromium + WebKit, Playwright).
//   python3 -m http.server 8821 --bind 127.0.0.1 --directory v5
//   node v5-source/tools/signature-flourish-qa.mjs [base] [study base] [result.json]
// The optional study base (a server for study/signature-motion-refinement-20261022's v5/) adds a
// frame-by-frame comparison of the baked table against the reviewed study engine.
import { chromium, webkit } from "playwright";
import fs from "fs";

const BASE = process.argv[2] || "http://127.0.0.1:8821";
const STUDY = process.argv[3] || "";
const OUT = process.argv[4] || "";
const PALETTES = { chalk: "#332e20", umber: "#fff9f1", sand: "#f93822" };
const results = [], fail = [];
const check = (engine, name, ok, detail = "") => { results.push({ engine, name, ok: !!ok, detail: String(detail) }); if (!ok) fail.push(`${engine} ${name} ${detail}`); };

const READ = () => {
  const d = document.querySelector("#v4-pixel-mark").getContext("2d").getImageData(0, 0, 160, 61).data;
  let ink = 0, partial = 0, colour = ""; const set = [];
  for (let i = 0; i < 160 * 61; i++) { const a = d[i * 4 + 3]; if (a === 255) { ink++; set.push(i); if (!colour) colour = [d[i * 4], d[i * 4 + 1], d[i * 4 + 2]].join(","); } else if (a) partial++; }
  return { ink, partial, set, colour, rgba: Array.from(d) };
};
const REFERENCE = async () => {
  // An independent copy of the production renderer, never the one the page wrapped.
  const src = await (await fetch("/pixel-mark.js?ref=" + Math.random())).text();
  const holder = {}; new Function("window", src)(holder);
  const c = document.createElement("canvas"); c.width = 160; c.height = 61;
  holder.FreemanPixelMark.mount(c, { play: false });
  return Array.from(c.getContext("2d").getImageData(0, 0, 160, 61).data);
};
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

async function open(browser, url, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts.context });
  const p = await ctx.newPage(); const errors = [], failed = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  if (opts.clock !== false) { await p.clock.install({ time: 0 }); await p.clock.pauseAt(1000); }
  if (opts.init) await p.addInitScript(opts.init);
  await p.goto(url, { waitUntil: "domcontentloaded" });
  if (opts.wait !== false) await p.waitForSelector("#v4-pixel-mark");
  return { p, ctx, errors, failed };
}

async function run(engine, browser) {
  // Final frame: canvas byte-identical to production play:false, every palette and DPR; crisp on screen.
  for (const dpr of [1, 2, 3]) {
    const { p, ctx, errors, failed } = await open(browser, BASE + "/", { context: { deviceScaleFactor: dpr } });
    const first = await p.evaluate(READ);
    check(engine, `dpr${dpr} first frame shows the name (≥ 1343 px, no partial alpha)`, first.ink >= 1343 && !first.partial, first.ink);
    await p.clock.runFor(1000);
    for (const pal of Object.keys(PALETTES)) {
      await p.click(`[data-v4-color="${pal}"]`);
      const got = await p.evaluate(READ), ref = await p.evaluate(REFERENCE);
      check(engine, `dpr${dpr} ${pal}: final canvas == FreemanPixelMark play:false`, same(got.rgba, ref) && got.ink === 2278, got.ink);
      const want = PALETTES[pal].slice(1).match(/../g).map((h) => parseInt(h, 16)).join(",");
      check(engine, `dpr${dpr} ${pal}: colour ${PALETTES[pal]}`, got.colour === want, got.colour);
      const colours = await p.evaluate(async () => {
        // Rasterised on screen: exactly paper + ink inside the mark (no resampling blur).
        const r = document.querySelector("#v4-pixel-mark").getBoundingClientRect();
        return [r.width * devicePixelRatio / 160, r.left * devicePixelRatio];
      });
      check(engine, `dpr${dpr} ${pal}: whole device pixels per bitmap pixel`, Number.isInteger(Math.round(colours[0] * 1e6) / 1e6), colours[0]);
    }
    check(engine, `dpr${dpr}: no JS errors`, !errors.length, errors.join(" | "));
    check(engine, `dpr${dpr}: no failed requests`, !failed.length, failed.join(" | "));
    await ctx.close();
  }

  // Every frame ⊆ final, full ink, monotone; finishes on time; nothing pending afterwards.
  {
    const { p, ctx } = await open(browser, BASE + "/", { init: () => {
      const r = window.requestAnimationFrame.bind(window), c = window.cancelAnimationFrame.bind(window), live = new Set();
      window.requestAnimationFrame = (f) => { const id = r((t) => { live.delete(id); f(t); }); live.add(id); return id; };
      window.cancelAnimationFrame = (id) => { live.delete(id); c(id); };
      window.__live = () => live.size;
    } });
    const fin = new Set((await p.evaluate(REFERENCE)).flatMap((x, i) => (i % 4 === 3 && x === 255 ? [(i - 3) / 4] : [])));
    let prev = new Set(), ok = true, partial = 0, doneAt = null;
    for (let t = 0; t <= 480; t += 16) {
      const s = await p.evaluate(READ); partial += s.partial;
      const cur = new Set(s.set);
      for (const i of cur) if (!fin.has(i)) ok = false;
      for (const i of prev) if (!cur.has(i)) ok = false;
      if (doneAt === null && s.ink === 2278) doneAt = t;
      prev = cur; await p.clock.runFor(16);
    }
    check(engine, "frames ⊆ final bitmap, monotone", ok);
    check(engine, "no partial-alpha pixels in any frame", partial === 0, partial);
    check(engine, "finished within 326–352 ms", doneAt >= 320 && doneAt <= 352, doneAt);
    check(engine, "finished: no pending animation frame", (await p.evaluate(() => window.__live())) === 0);
    await ctx.close();
  }

  // The baked table reproduces the reviewed study engine (within the 2 ms bake step).
  if (STUDY) {
    const a = await open(browser, BASE + "/"), b = await open(browser, STUDY + "/studies/signature-motion-refinement/?bare&v=flourish");
    let worst = 0;
    for (let t = 0; t <= 352; t += 16) {
      const x = new Set((await a.p.evaluate(READ)).set), y = new Set((await b.p.evaluate(READ)).set);
      let diff = 0; for (const i of x) if (!y.has(i)) diff++; for (const i of y) if (!x.has(i)) diff++;
      worst = Math.max(worst, diff);
      await a.p.clock.runFor(16); await b.p.clock.runFor(16);
    }
    check(engine, "baked frames match the reviewed study (≤ 12 px per frame, 2 ms step)", worst <= 12, `worst ${worst} px`);
    await a.ctx.close(); await b.ctx.close();
  }

  // History and bfcache.
  {
    const { p, ctx, errors } = await open(browser, BASE + "/");
    await p.clock.runFor(600);
    await p.click(".v4-home-nav a >> nth=0"); await p.clock.runFor(50);
    check(engine, "in-site link leaves the entrance", await p.evaluate(() => document.body.dataset.route === "company"));
    await p.goBack(); await p.waitForSelector("#v4-pixel-mark");
    check(engine, "Back: finished on its first frame", (await p.evaluate(READ)).ink === 2278);
    check(engine, "history: no JS errors", !errors.length, errors.join(" | "));
    await ctx.close();
  }
  {
    const { p, ctx } = await open(browser, BASE + "/", { init: () => { const real = performance.getEntriesByType.bind(performance); performance.getEntriesByType = (t) => (t === "navigation" ? [{ type: "back_forward" }] : real(t)); } });
    check(engine, "back_forward load: finished on its first frame", (await p.evaluate(READ)).ink === 2278);
    await ctx.close();
  }
  {
    const { p, ctx } = await open(browser, BASE + "/");
    await p.clock.runFor(150); const before = (await p.evaluate(READ)).ink;
    await p.evaluate(() => { const e = new Event("pageshow"); Object.defineProperty(e, "persisted", { value: true }); dispatchEvent(e); });
    check(engine, "bfcache restore mid-play finishes", before < 2278 && (await p.evaluate(READ)).ink === 2278, before);
    await ctx.close();
  }
  // Arriving at the entrance in place (CLOSE from a directly loaded Company page): finished, flourish on click.
  {
    const { p, ctx, errors } = await open(browser, BASE + "/company.html", { wait: false });
    await p.clock.runFor(100);
    await p.click(".close"); await p.waitForSelector("#v4-pixel-mark");
    check(engine, "Company → CLOSE → entrance: finished", (await p.evaluate(READ)).ink === 2278);
    await p.click(".v4-home-mark"); await p.clock.runFor(16);
    const s = await p.evaluate(READ);
    check(engine, "…and selecting the script replays the flourish (name stays)", s.ink >= 1343 && s.ink < 2278, s.ink);
    check(engine, "Company route: no JS errors", !errors.length, errors.join(" | "));
    await ctx.close();
  }

  // Palette switch during playback: same frame, new colour, continues.
  {
    const { p, ctx } = await open(browser, BASE + "/");
    await p.clock.runFor(150);
    const before = (await p.evaluate(READ)).ink;
    await p.click('[data-v4-color="umber"]');
    const mid = await p.evaluate(READ);
    await p.clock.runFor(100); const later = (await p.evaluate(READ)).ink;
    check(engine, "palette mid-play keeps the frame", mid.ink === before, `${before} → ${mid.ink}`);
    check(engine, "palette mid-play recolours", mid.colour === "255,249,241", mid.colour);
    check(engine, "palette mid-play continues, no restart", later > mid.ink, `${mid.ink} → ${later}`);
    await ctx.close();
  }

  // Reduced motion, hidden tab, no frames at all.
  {
    const { p, ctx } = await open(browser, BASE + "/", { context: { reducedMotion: "reduce" } });
    check(engine, "reduced motion: finished at first paint", (await p.evaluate(READ)).ink === 2278);
    await p.click(".v4-home-mark");
    check(engine, "reduced motion: replay stays finished", (await p.evaluate(READ)).ink === 2278);
    await ctx.close();
  }
  {
    const { p, ctx } = await open(browser, BASE + "/");
    await p.clock.runFor(100); const before = (await p.evaluate(READ)).ink;
    await p.emulateMedia({ reducedMotion: "reduce" }); await p.waitForTimeout(150);
    check(engine, "reduced motion switched on mid-play finishes", before < 2278 && (await p.evaluate(READ)).ink === 2278, before);
    await ctx.close();
  }
  {
    const { p, ctx } = await open(browser, BASE + "/");
    await p.clock.runFor(100);
    await p.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
    check(engine, "hidden tab mid-play finishes", (await p.evaluate(READ)).ink === 2278);
    await ctx.close();
  }
  {
    const { p, ctx } = await open(browser, BASE + "/", { init: () => { window.requestAnimationFrame = () => 0; } });
    const first = (await p.evaluate(READ)).ink;
    await p.clock.runFor(800);
    check(engine, "no frames at all: watchdog shows finished", first < 2278 && (await p.evaluate(READ)).ink === 2278, first);
    await ctx.close();
  }

  // Replay, then a route switch mid-play: torn down, no frames or listeners left.
  {
    const { p, ctx, errors } = await open(browser, BASE + "/", { init: () => {
      const r = window.requestAnimationFrame.bind(window), c = window.cancelAnimationFrame.bind(window), live = new Set();
      window.requestAnimationFrame = (f) => { const id = r((t) => { live.delete(id); f(t); }); live.add(id); return id; };
      window.cancelAnimationFrame = (id) => { live.delete(id); c(id); };
      window.__live = () => live.size;
      const add = EventTarget.prototype.addEventListener, rem = EventTarget.prototype.removeEventListener; window.__l = 0;
      const watch = (t) => t === "visibilitychange" || t === "pageshow" || t === "change";
      EventTarget.prototype.addEventListener = function (t, ...a) { if (watch(t)) window.__l++; return add.call(this, t, ...a); };
      EventTarget.prototype.removeEventListener = function (t, ...a) { if (watch(t)) window.__l--; return rem.call(this, t, ...a); };
    } });
    await p.clock.runFor(600);
    await p.click(".v4-home-mark"); await p.clock.runFor(16);
    const s = (await p.evaluate(READ)).ink;
    check(engine, "click replays the flourish from the start", s >= 1343 && s < 1500, s);
    const l0 = await p.evaluate(() => window.__l);
    await p.click(".v4-home-nav a >> nth=1"); await p.clock.runFor(100);
    check(engine, "route switch mid-play: no animation frame left", (await p.evaluate(() => window.__live())) === 0);
    check(engine, "route switch: player listeners removed", (await p.evaluate(() => window.__l)) === l0 - 3, `${l0} → ${await p.evaluate(() => window.__l)}`);
    check(engine, "replay/route: no JS errors", !errors.length, errors.join(" | "));
    await ctx.close();
  }

  // Phone.
  {
    const { p, ctx, errors, failed } = await open(browser, BASE + "/", { context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: engine === "chromium", hasTouch: true } });
    check(engine, "phone: first frame shows the name", (await p.evaluate(READ)).ink >= 1343);
    await p.clock.runFor(800);
    const m = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, h: document.querySelector(".v4-home-mark").getBoundingClientRect().height }));
    check(engine, "phone: no horizontal overflow", m.overflow <= 0, m.overflow);
    check(engine, "phone: signature target ≥ 44 px", m.h >= 44, m.h);
    check(engine, "phone: final ink", (await p.evaluate(READ)).ink === 2278);
    check(engine, "phone: no JS errors or failed requests", !errors.length && !failed.length, errors.concat(failed).join(" | "));
    await ctx.close();
  }

  // Every route that loads app.js boots without errors or missing files.
  for (const route of ["company.html", "projects.html", "contact.html", "etcetera.html", "project-beetlecat.html", "404.html"]) {
    const { p, ctx, errors, failed } = await open(browser, `${BASE}/${route}`, { wait: false, clock: false });
    await p.waitForLoadState("load"); await p.waitForTimeout(200);
    check(engine, `${route}: boots without JS errors or failed requests`, !errors.length && !failed.filter((f) => !f.includes("/404.html") || route !== "404.html").length, errors.concat(failed).join(" | "));
    await ctx.close();
  }
}

for (const [name, type] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await type.launch();
  try { await run(name, browser); } catch (e) { check(name, "suite completed", false, String(e).slice(0, 400)); }
  await browser.close();
}
const summary = { base: BASE, study: STUDY || null, date: new Date().toISOString(), passed: results.filter((r) => r.ok).length, failed: fail.length, results };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(summary, null, 1));
console.log(`${summary.passed} passed, ${summary.failed} failed`); fail.forEach((f) => console.log("FAIL", f));
process.exit(fail.length ? 1 : 0);
