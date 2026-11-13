// The Built Record, study 001 — browser checks. Serve v5/ and run:
//   PW=<path to node_modules/playwright> BASE=http://127.0.0.1:8921 node studio/built-record-001/check.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium, webkit, devices } = require(process.env.PW || "playwright");
const BASE = process.env.BASE || "http://127.0.0.1:8921";
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : (fail++, console.log("FAIL", m)); };
const views = [["desktop 1440", { viewport: { width: 1440, height: 900 } }], ["laptop 1280", { viewport: { width: 1280, height: 720 } }], ["tablet 1024", { viewport: { width: 1024, height: 768 } }], ["iPhone 13", devices["iPhone 13"]], ["iPhone SE", devices["iPhone SE"]], ["reduced motion", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }]];
for (const [bn, type] of [["chromium", chromium], ["webkit", webkit]]) {
  let b; try { b = await type.launch(); } catch { console.log("skip", bn); continue; }
  for (const [name, opt] of views) {
    const c = await b.newContext(opt), p = await c.newPage(), errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    const T = `${bn} ${name}: `;
    for (const slug of ["muchacho-decatur", "beetlecat"]) {
      await p.goto(`${BASE}/built-record/${slug}.html`, { waitUntil: "networkidle" });
      ok(await p.locator("h1.br-name").count() === 1, T + slug + " has one h1");
      ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), T + slug + " no sideways scroll");
      // The opening shows the architecture without scrolling.
      ok(await p.evaluate(() => { const r = document.querySelector(".br-lead img").getBoundingClientRect(); return r.top < innerHeight * 0.6 && r.height > 150; }), T + slug + " opening plate on first screen");
      ok(await p.evaluate(() => [...document.querySelectorAll("img")].every((i) => i.alt.length > 20)), T + slug + " photographs described");
    }
    await p.goto(`${BASE}/built-record/muchacho-decatur.html`, { waitUntil: "networkidle" });
    // Seam: keyboard moves it.
    const range = p.locator(".br-range");
    await range.focus(); const s0 = await range.inputValue();
    await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowRight");
    ok(Number(await range.inputValue()) > Number(s0), T + "seam moves with arrow keys");
    ok((await p.locator(".br-split").evaluate((e) => e.style.getPropertyValue("--seam"))) === (await range.inputValue()) + "%", T + "seam drawn where the input says");
    // Drawing set: opens on the entrance, completed.
    ok(await p.locator('.br-key[aria-pressed="true"]').getAttribute("data-key") === "3", T + "set opens on the entrance");
    ok(await p.locator(".br-stage").getAttribute("data-state") === "completed", T + "set opens on the completed photograph");
    // Three states, by keyboard.
    for (const st of ["drawing", "construction", "completed"]) {
      await p.locator(`.br-states [data-state=${st}]`).focus(); await p.keyboard.press("Enter");
      ok(await p.locator(".br-stage").getAttribute("data-state") === st, T + "state " + st);
      ok(await p.locator(`.br-states [data-state=${st}]`).getAttribute("aria-pressed") === "true", T + "pressed " + st);
    }
    await p.locator(".br-states [data-state=construction]").click();
    ok((await p.locator(".br-reserved").innerText()).toLowerCase().includes("no construction photograph"), T + "construction state says nothing is on file");
    // Every key on every sheet is reachable and moves the stage.
    const n = await p.locator(".br-tabs [role=tab]").count();
    for (let i = 0; i < n; i++) {
      await p.locator("#tab-" + i).click();
      ok(await p.locator("#tab-" + i).getAttribute("aria-selected") === "true", T + "tab " + i);
      const keys = await p.locator(".br-key").count();
      for (let k = 0; k < keys; k++) {
        await p.locator(`.br-key[data-key="${k}"]`).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(opt.reducedMotion ? 30 : 520);
        const want = await p.evaluate(([i, k]) => window.BUILT_RECORDS["muchacho-decatur"].sheets[i].keys[k].view.join(" "), [i, k]);
        const got = (await p.locator(".br-stage svg").getAttribute("viewBox")).split(" ").map((v) => Math.round(Number(v))).join(" ");
        ok(got === want, T + `sheet ${i} key ${k} stage ${got} != ${want}`);
      }
    }
    // Tabs by arrow keys; reserved sheet states what is needed.
    await p.locator("#tab-0").click(); await p.keyboard.press("End");
    ok(await p.locator("#tab-" + (n - 1)).getAttribute("aria-selected") === "true", T + "End reaches the last sheet");
    ok((await p.locator(".br-needs").innerText()).includes("floor plan"), T + "reserved sheet lists what is needed");
    // Touch targets on phones.
    if (opt.isMobile) ok(await p.evaluate(() => [...document.querySelectorAll(".br-states button,.br-step button,.br-tabs button,.br-foot a")].every((e) => e.getBoundingClientRect().height >= 44)), T + "touch targets 44px");
    ok(errs.length === 0, T + "no script errors " + errs.join("; "));
    await c.close();
  }
  await b.close();
}
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
