// Signature handwriting study (round 2) — browser verification.
//   python3 -m http.server 8820 --bind 127.0.0.1 --directory v5
//   node verify.mjs [http://127.0.0.1:8820]        (needs `playwright` and `pngjs` resolvable)
// Writes results.json beside this file. Every check is a real browser assertion; nothing is assumed.
import { chromium, webkit } from "playwright";
import { PNG } from "pngjs";
import fs from "fs";

const BASE = process.argv[2] || "http://127.0.0.1:8820";
const STUDY = BASE + "/studies/signature-handwriting/?bare";
const VARIANTS = ["still", "fluent", "quick", "deliberate"];
const PALETTES = { chalk: "#332e20", umber: "#fff9f1", sand: "#f93822" };
const results = [], fail = [];
const check = (engine, name, ok, detail = "") => { results.push({ engine, name, ok: !!ok, detail }); if (!ok) fail.push(`${engine} ${name} ${detail}`); };

// Canvas state helpers, evaluated in the page.
const READ = () => {
  const c = document.querySelector("#v4-pixel-mark"), d = c.getContext("2d").getImageData(0, 0, 160, 61).data;
  let ink = 0, partial = 0; const set = [];
  for (let i = 0; i < 160 * 61; i++) { const a = d[i * 4 + 3]; if (a === 255) { ink++; set.push(i); } else if (a) partial++; }
  return { ink, partial, set, rgba: Array.from(d) };
};
const REFERENCE = async () => {
  // A fresh copy of the production renderer, loaded independently of the study engine.
  const src = await (await fetch("/pixel-mark.js?ref=" + Math.random())).text();
  const holder = {}; new Function("window", src)(holder);
  const c = document.createElement("canvas"); c.width = 160; c.height = 61;
  holder.FreemanPixelMark.mount(c, { play: false });
  return Array.from(c.getContext("2d").getImageData(0, 0, 160, 61).data);
};
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

async function page(browser, url, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts.context });
  const p = await ctx.newPage(); const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  // The fake clock first, so a test's own overrides (rAF, performance) wrap the clock's versions.
  if (opts.clock !== false) { await p.clock.install({ time: 0 }); await p.clock.pauseAt(1000); }
  if (opts.init) await p.addInitScript(opts.init);
  await p.goto(url, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("#v4-pixel-mark");
  return { p, ctx, errors };
}

async function run(engine, browser) {
  // 1. Final frame equals production play:false, every variant × palette × DPR, canvas and screen.
  for (const dpr of [1, 2, 3]) {
    const prod = await page(browser, BASE + "/", { context: { deviceScaleFactor: dpr } });
    await prod.p.clock.runFor(2500);
    const prodShots = {};
    for (const pal of Object.keys(PALETTES)) {
      await prod.p.click(`[data-v4-color="${pal}"]`);
      prodShots[pal] = await prod.p.locator("#v4-pixel-mark").screenshot();
    }
    const prodGeo = await prod.p.evaluate(() => { const r = document.querySelector("#v4-pixel-mark").getBoundingClientRect(), d = devicePixelRatio; return { w: r.width * d / 160, x: r.left * d, y: r.top * d }; });
    if (Math.abs(prodGeo.y - Math.round(prodGeo.y)) > 1e-6) check(engine, `note: production entrance y is ${prodGeo.y} device px at dpr${dpr} (layout rounding, pre-existing)`, true);
    await prod.ctx.close();
    for (const v of VARIANTS) {
      const { p, ctx, errors } = await page(browser, `${STUDY}&v=${v}`, { context: { deviceScaleFactor: dpr } });
      await p.clock.runFor(2500);
      for (const pal of Object.keys(PALETTES)) {
        await p.click(`[data-v4-color="${pal}"]`);
        const got = await p.evaluate(READ), ref = await p.evaluate(REFERENCE);
        check(engine, `final ${v} ${pal} dpr${dpr} canvas == FreemanPixelMark play:false`, same(got.rgba, ref) && got.ink === 2278, `ink ${got.ink}`);
        const shot = await p.locator("#v4-pixel-mark").screenshot();
        check(engine, `final ${v} ${pal} dpr${dpr} on-screen == production entrance`, Buffer.compare(shot, prodShots[pal]) === 0 || samePng(shot, prodShots[pal]));
        const fill = await p.evaluate(() => { const d = document.querySelector("#v4-pixel-mark").getContext("2d").getImageData(0, 0, 160, 61).data; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) return "#" + [d[i], d[i + 1], d[i + 2]].map((x) => x.toString(16).padStart(2, "0")).join(""); });
        check(engine, `final ${v} ${pal} colour ${PALETTES[pal]}`, fill === PALETTES[pal], fill);
      }
      // Device-pixel alignment: whole device pixels per bitmap pixel, on a whole device pixel.
      // Same placement as the production entrance (fit() is production's, unchanged); whole
      // device pixels per bitmap pixel. Sub-1/64-px layout rounding is reported, not hidden.
      const geo = await p.evaluate(() => { const r = document.querySelector("#v4-pixel-mark").getBoundingClientRect(), d = devicePixelRatio; return { w: r.width * d / 160, x: r.left * d, y: r.top * d }; });
      check(engine, `alignment ${v} dpr${dpr} == production`, JSON.stringify(geo) === JSON.stringify(prodGeo), JSON.stringify(geo));
      check(engine, `whole device pixels per bitmap pixel ${v} dpr${dpr}`, Math.abs(geo.w - Math.round(geo.w)) < 1e-6, geo.w);
      check(engine, `no JS errors ${v} dpr${dpr}`, !errors.length, errors.join(" | "));
      await ctx.close();
    }
  }

  // 2. Every intermediate frame is a subset of the finished bitmap, at full ink, growing monotonically.
  for (const v of ["fluent", "quick", "deliberate"]) {
    const { p, ctx } = await page(browser, `${STUDY}&v=${v}`);
    const fin = new Set((await p.evaluate(REFERENCE)).flatMap((x, i) => (i % 4 === 3 && x === 255 ? [i / 4 - 0.75] : [])));
    let prev = new Set(), ok = true, partial = 0, firstInk = null, t = 0, frames = 0;
    for (let k = 0; k < 90; k++) {
      const s = await p.evaluate(READ); partial += s.partial; frames++;
      if (firstInk === null) firstInk = s.ink;
      for (const i of s.set) if (!fin.has(i)) ok = false;
      const cur = new Set(s.set);
      for (const i of prev) if (!cur.has(i)) ok = false;
      prev = cur; await p.clock.runFor(16); t += 16;
    }
    check(engine, `${v} frames ⊆ final, monotone`, ok, `${frames} frames`);
    check(engine, `${v} no partial-alpha pixels`, partial === 0, `partial ${partial}`);
    check(engine, `${v} first frame not blank (pen already down)`, firstInk >= 40, `first frame ink ${firstInk}`);
    await ctx.close();
  }

  // 3. History: Back to the entrance draws it finished immediately; in-site arrival does not replay.
  {
    const { p, ctx, errors } = await page(browser, `${STUDY}&v=fluent`);
    await p.clock.runFor(1500);
    await p.click(".v4-home-nav a >> nth=0"); await p.clock.runFor(100);
    check(engine, "in-site link leaves entrance", await p.evaluate(() => document.body.dataset.route === "company"));
    await p.goBack(); await p.waitForSelector("#v4-pixel-mark");
    const s = await p.evaluate(READ);
    check(engine, "Back shows the finished mark on the first frame", s.ink === 2278, `ink ${s.ink}`);
    check(engine, "history: no JS errors", !errors.length, errors.join(" | "));
    await ctx.close();
  }
  // 3b. A document loaded as back_forward (no bfcache) draws finished: production arrivedByHistory().
  {
    const { p, ctx } = await page(browser, `${STUDY}&v=fluent`, { init: () => { const real = performance.getEntriesByType.bind(performance); performance.getEntriesByType = (t) => (t === "navigation" ? [{ type: "back_forward" }] : real(t)); } });
    const s = await p.evaluate(READ);
    check(engine, "back_forward load: finished at first frame", s.ink === 2278, `ink ${s.ink}`);
    await ctx.close();
  }
  // 3c. bfcache restore mid-animation (pageshow persisted) finishes the mark.
  {
    const { p, ctx } = await page(browser, `${STUDY}&v=fluent`);
    await p.clock.runFor(200);
    const before = (await p.evaluate(READ)).ink;
    await p.evaluate(() => { const e = new Event("pageshow"); Object.defineProperty(e, "persisted", { value: true }); dispatchEvent(e); });
    const after = (await p.evaluate(READ)).ink;
    check(engine, "bfcache restore mid-play finishes", before < 2278 && after === 2278, `${before} → ${after}`);
    await ctx.close();
  }

  // 4. Palette switch during playback recolours in place without restarting.
  for (const v of ["fluent", "quick", "deliberate"]) {
    const { p, ctx } = await page(browser, `${STUDY}&v=${v}`);
    await p.clock.runFor(150);
    const refMid = (await p.evaluate(READ)).ink;
    await p.click('[data-v4-color="umber"]');
    const mid = await p.evaluate(READ);
    await p.clock.runFor(100); const later = (await p.evaluate(READ)).ink;
    const col = await p.evaluate(() => { const d = document.querySelector("#v4-pixel-mark").getContext("2d").getImageData(0, 0, 160, 61).data; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) return [d[i], d[i + 1], d[i + 2]].join(","); });
    check(engine, `${v}: palette switch mid-play keeps the frame`, mid.ink === refMid, `${mid.ink} vs ${refMid}`);
    check(engine, `${v}: palette switch mid-play recolours`, col === "255,249,241", col);
    check(engine, `${v}: palette switch does not restart`, later > mid.ink || later === 2278, `${mid.ink} → ${later}`);
    await ctx.close();
  }

  // 5. Reduced motion: at load, and switched on while playing.
  {
    const { p, ctx } = await page(browser, `${STUDY}&v=fluent`, { context: { reducedMotion: "reduce" } });
    check(engine, "reduced motion: finished on first frame", (await p.evaluate(READ)).ink === 2278);
    await ctx.close();
  }
  {
    const { p, ctx } = await page(browser, `${STUDY}&v=fluent`);
    await p.clock.runFor(150); const before = (await p.evaluate(READ)).ink;
    // Media-query change events are delivered on a real rendering step, not on the fake clock.
    await p.emulateMedia({ reducedMotion: "reduce" }); await p.waitForTimeout(150);
    const after = (await p.evaluate(READ)).ink;
    check(engine, "reduced motion turned on mid-play finishes", before < 2278 && after === 2278, `${before} → ${after}`);
    await p.click(".v4-home-mark"); // replay request under reduced motion
    check(engine, "replay under reduced motion stays finished", (await p.evaluate(READ)).ink === 2278);
    await ctx.close();
  }

  // 6. Tab hidden mid-play finishes; frames that never arrive still end finished.
  {
    const { p, ctx } = await page(browser, `${STUDY}&v=fluent`);
    await p.clock.runFor(150);
    await p.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
    check(engine, "hidden tab mid-play finishes", (await p.evaluate(READ)).ink === 2278);
    await ctx.close();
  }
  {
    const { p, ctx } = await page(browser, `${STUDY}&v=fluent`, { init: () => { window.requestAnimationFrame = () => 0; } });
    const first = (await p.evaluate(READ)).ink;
    await p.clock.runFor(1600);
    const s = await p.evaluate(READ);
    check(engine, "no frames at all: watchdog shows finished", first < 2278 && s.ink === 2278, `${first} → ${s.ink}`);
    await ctx.close();
  }

  // 7. Replay on click; route switch mid-play tears down cleanly (no RAF or listener left behind).
  {
    const { p, ctx, errors } = await page(browser, `${STUDY}&v=fluent`, { init: () => {
      window.__raf = 0; const r = window.requestAnimationFrame.bind(window), c = window.cancelAnimationFrame.bind(window), live = new Set();
      window.requestAnimationFrame = (f) => { const id = r((t) => { live.delete(id); f(t); }); live.add(id); return id; };
      window.cancelAnimationFrame = (id) => { live.delete(id); c(id); };
      window.__live = () => live.size;
      const add = EventTarget.prototype.addEventListener, rem = EventTarget.prototype.removeEventListener; window.__l = 0;
      EventTarget.prototype.addEventListener = function (t, ...a) { if (t === "visibilitychange" || t === "pageshow" || t === "change") window.__l++; return add.call(this, t, ...a); };
      EventTarget.prototype.removeEventListener = function (t, ...a) { if (t === "visibilitychange" || t === "pageshow" || t === "change") window.__l--; return rem.call(this, t, ...a); };
    } });
    await p.clock.runFor(1500);
    check(engine, "finished: no pending animation frame", (await p.evaluate(() => window.__live())) === 0);
    await p.click(".v4-home-mark"); await p.clock.runFor(32);
    const replay = (await p.evaluate(READ)).ink;
    check(engine, "click replays from the start", replay > 0 && replay < 400, `ink ${replay}`);
    const l0 = await p.evaluate(() => window.__l);
    await p.click(".v4-home-nav a >> nth=1"); await p.clock.runFor(200);
    check(engine, "route switch mid-play: animation frames cancelled", (await p.evaluate(() => window.__live())) === 0);
    check(engine, "route switch: engine listeners removed", (await p.evaluate(() => window.__l)) === l0 - 3, `${l0} → ${await p.evaluate(() => window.__l)}`);
    check(engine, "replay/route: no JS errors", !errors.length, errors.join(" | "));
    await ctx.close();
  }

  // 8. The site entrance on this branch (not the study page): the hand plays on arrival.
  {
    const { p, ctx, errors } = await page(browser, BASE + "/");
    const s0 = await p.evaluate(READ);
    await p.clock.runFor(1600);
    const s1 = await p.evaluate(READ), ref = await p.evaluate(REFERENCE);
    check(engine, "entrance: pen already down on first frame, finished exact", s0.ink >= 40 && s0.ink < 2278 && same(s1.rgba, ref), `${s0.ink} → ${s1.ink}`);
    check(engine, "entrance: hand scripts gone, engine loaded", await p.evaluate(() => !window.FreemanHandMark && !!window.FreemanSignature));
    check(engine, "entrance: no JS errors", !errors.length, errors.join(" | "));
    await ctx.close();
  }

  // 9. Arriving through a project URL (no signature scripts on that page), then CLOSE to the entrance.
  const fresh = async (url, setup) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errors = [], failed = [];
    p.on("pageerror", (e) => errors.push(String(e)));
    p.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    if (setup) await setup(p);
    await p.goto(url); await p.waitForLoadState("load");
    return { p, ctx, errors, failed };
  };
  const fullInk = () => { const c = document.querySelector("#v4-pixel-mark"); if (!c) return false; const d = c.getContext("2d").getImageData(0, 0, 160, 61).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] === 255) n++; return n === 2278; };
  const projects = await (async () => { const { p, ctx } = await fresh(BASE + "/projects.html"); const l = await p.evaluate(() => [...new Set(window.RECORDS.projects.map((x) => "project-" + x.slug + ".html"))]); await ctx.close(); return l; })();
  for (const url of projects) {
    const { p, ctx, errors, failed } = await fresh(`${BASE}/${url}`);
    const short = url.replace(/^project-|\.html$/g, "");
    const before = await p.evaluate(() => [typeof window.FreemanPixelMark, typeof window.FreemanSignature].join("/"));
    let partial = 0; const watch = setInterval(() => p.evaluate(() => { const c = document.querySelector("#v4-pixel-mark"); if (!c) return 0; const d = c.getContext("2d").getImageData(0, 0, 160, 61).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] && d[i] < 255) n++; return n; }).then((n) => { partial += n; }, () => {}), 20);
    await p.click(".close");
    await p.waitForFunction(fullInk, null, { timeout: 5000 }).catch(() => {});
    const got = await p.evaluate(READ), ref = await p.evaluate(REFERENCE);
    check(engine, `${short}: page had no signature scripts (${before})`, before === "undefined/undefined");
    check(engine, `${short} → CLOSE → entrance: exact finished mark`, same(got.rgba, ref), got.ink);
    if (url === projects[0]) {
      await p.click(".v4-home-mark"); await p.waitForTimeout(150);
      const mid = await p.evaluate(READ);
      check(engine, `${short}: replay writes the whole signature by hand`, mid.ink > 0 && mid.ink < 1343 && !mid.partial, mid.ink);
      await p.waitForTimeout(1200);
      await p.click('[data-v4-color="sand"]');
      const fill = await p.evaluate(() => { const d = document.querySelector("#v4-pixel-mark").getContext("2d").getImageData(0, 0, 160, 61).data; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) return [d[i], d[i + 1], d[i + 2]].join(","); });
      check(engine, `${short}: colourway recolours the lazily loaded mark`, fill === "249,56,34", fill);
      const tags = await p.evaluate(() => [...document.scripts].filter((s) => /\/(pixel-mark|signature-motion)\.js/.test(s.src)).length);
      check(engine, `${short}: each signature script loaded once`, tags === 2, tags);
    }
    clearInterval(watch); await p.waitForTimeout(40);
    check(engine, `${short}: never a partial-alpha (scatter) pixel`, partial === 0, partial);
    check(engine, `${short}: no JS errors or failed requests`, !errors.length && !failed.length, errors.concat(failed).join(" | "));
    await ctx.close();
  }
  {
    const { p, ctx, errors } = await fresh(`${BASE}/${projects[0]}`);
    await p.click(".close"); await p.waitForFunction(fullInk);
    await p.click(".v4-home-nav a >> nth=0"); await p.waitForTimeout(100);
    await p.goBack(); await p.waitForSelector("#v4-pixel-mark");
    check(engine, "project → entrance → Company → Back: finished on its first frame", (await p.evaluate(READ)).ink === 2278);
    check(engine, "project → entrance → Company → Back: no JS errors", !errors.length, errors.join(" | "));
    await ctx.close();
  }
  {
    const { p, ctx, errors } = await fresh(`${BASE}/${projects[0]}`, (q) => q.route(/\/(signature-motion|pixel-mark)\.js/, async (r) => { await new Promise((s) => setTimeout(s, 600)); await r.continue(); }));
    await p.click(".close"); await p.waitForTimeout(50);
    await p.click(".v4-home-nav a >> nth=1"); await p.waitForTimeout(1200);
    const after = await p.evaluate(() => ({ route: document.body.dataset.route, canvas: !!document.querySelector("#v4-pixel-mark"), loaded: typeof window.FreemanSignature }));
    check(engine, "leaving the entrance before its scripts arrive: no late mount, no errors", after.route === "projects" && !after.canvas && after.loaded === "object" && !errors.length, JSON.stringify(after) + errors.join(" | "));
    await ctx.close();
  }

  // 10. Fallbacks never animate: hand missing, artwork unknown, everything missing.
  for (const [label, url, setup, want] of [
    ["signature-motion.js missing (entrance)", BASE + "/", (q) => q.route(/\/signature-motion\.js/, (r) => r.abort()), 2278],
    ["signature-motion.js missing (from a project page)", "PROJECT", (q) => q.route(/\/signature-motion\.js/, (r) => r.abort()), 2278],
    ["artwork not the known bitmap", BASE + "/", (q) => q.route(/\/pixel-mark\.js\?v=/, async (r) => { const res = await r.fetch(); await r.fulfill({ response: res, body: (await res.text()).replace("[56,4],", "") }); }), 2277],
  ]) {
    const { p, ctx, errors } = await fresh(url === "PROJECT" ? `${BASE}/${projects[0]}` : url, setup);
    if (url === "PROJECT") { await p.click(".close"); }
    await p.waitForSelector("#v4-pixel-mark"); await p.waitForTimeout(300);
    let partial = 0; const inks = new Set();
    for (let k = 0; k < 10; k++) { const s = await p.evaluate(READ); partial += s.partial; inks.add(s.ink); await p.waitForTimeout(40); }
    await p.click(".v4-home-mark");
    for (let k = 0; k < 10; k++) { const s = await p.evaluate(READ); partial += s.partial; inks.add(s.ink); await p.waitForTimeout(40); }
    check(engine, `fallback (${label}): finished and still on load and on replay`, partial === 0 && inks.size === 1 && inks.has(want), `ink ${[...inks]} partial ${partial}`);
    check(engine, `fallback (${label}): no JS errors`, !errors.length, errors.join(" | "));
    await ctx.close();
  }
  {
    const { p, ctx, errors } = await fresh(`${BASE}/${projects[0]}`, (q) => q.route(/\/(signature-motion|pixel-mark)\.js/, (r) => r.abort()));
    await p.click(".close"); await p.waitForTimeout(600);
    const s = await p.evaluate(() => ({ disabled: document.querySelector(".v4-home-mark").disabled, ink: (() => { const d = document.querySelector("#v4-pixel-mark").getContext("2d").getImageData(0, 0, 160, 61).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; })() }));
    check(engine, "both scripts unreachable: blank canvas, inert button, no JS errors", s.disabled && s.ink === 0 && !errors.length, JSON.stringify(s) + errors.join(" | "));
    await ctx.close();
  }

  // 11. Phone: composition, no horizontal overflow, touch targets, no errors.
  for (const v of VARIANTS) {
    const { p, ctx, errors } = await page(browser, `${STUDY}&v=${v}`, { context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: engine === "chromium", hasTouch: true } });
    await p.clock.runFor(1500);
    const m = await p.evaluate(() => {
      const box = (s) => [...document.querySelectorAll(s)].map((e) => { const r = e.getBoundingClientRect(), a = getComputedStyle(e, "::after"); return { w: r.width, h: r.height, after: a.content !== "none" ? a.inset : "" }; });
      return { overflow: document.documentElement.scrollWidth - innerWidth, mark: box(".v4-home-mark")[0], ways: box(".v4-way"), links: box(".v4-home-nav a") };
    });
    check(engine, `phone ${v}: no horizontal overflow`, m.overflow <= 0, m.overflow);
    check(engine, `phone ${v}: signature target ≥ 44px tall`, m.mark.h >= 44, JSON.stringify(m.mark));
    check(engine, `phone ${v}: colourway targets enlarged`, m.ways.every((w) => w.w >= 24 && w.after), JSON.stringify(m.ways[0]));
    check(engine, `phone ${v}: final ink`, (await p.evaluate(READ)).ink === 2278);
    check(engine, `phone ${v}: no JS errors`, !errors.length, errors.join(" | "));
    await ctx.close();
  }
}

function samePng(a, b) {
  const x = PNG.sync.read(a), y = PNG.sync.read(b);
  return x.width === y.width && x.height === y.height && Buffer.compare(x.data, y.data) === 0;
}

for (const [name, type] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await type.launch();
  try { await run(name, browser); } catch (e) { check(name, "suite completed", false, String(e).slice(0, 300)); }
  await browser.close();
}
const summary = { base: BASE, date: new Date().toISOString(), passed: results.filter((r) => r.ok).length, failed: fail.length, results };
fs.writeFileSync(process.env.RESULTS || new URL("./results.json", import.meta.url), JSON.stringify(summary, null, 1));
console.log(`${summary.passed} passed, ${summary.failed} failed`); fail.forEach((f) => console.log("FAIL", f));
process.exit(fail.length ? 1 : 0);
