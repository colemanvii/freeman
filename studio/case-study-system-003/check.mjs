// Freeman Folio — checks. Serve v5/ (python3 -m http.server 8921) then:
//   BASE=http://127.0.0.1:8921 node studio/case-study-system-002/check.mjs
// PW may point at a playwright module directory; otherwise the installed one is used.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW || "playwright");
const BASE = process.env.BASE || "http://127.0.0.1:8921";
const SLUGS = ["muchacho-decatur"];
const VIEWS = [
  ["1600x900@2", { viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 }],
  ["1440x900", { viewport: { width: 1440, height: 900 } }],
  ["1280x720", { viewport: { width: 1280, height: 720 } }],
  ["1024x768", { viewport: { width: 1024, height: 768 } }],
  ["iPhone 13", devices["iPhone 13"]],
  ["iPhone SE", devices["iPhone SE"]],
  ["Pixel 5", devices["Pixel 5"]],
  ["reduced motion", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }]
];
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("FAIL", msg); } };

const b = await chromium.launch();
for (const slug of SLUGS) for (const [name, opts] of VIEWS) {
  const tag = `${slug} · ${name}`;
  const c = await b.newContext(opts); const pg = await c.newPage();
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await pg.goto(`${BASE}/folio-2/${slug}.html`); await pg.waitForSelector("[data-ready]");
  const n = await pg.locator(".fo-stage .fo-leaf").count();
  ok(await pg.locator("h1").count() === 1, `${tag}: one h1`);
  ok(await pg.evaluate(() => document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth), `${tag}: the page does not scroll`);

  // Evidence: the passages on the leaves add up to Freeman's published account, word for word.
  const account = await pg.evaluate((slug) => window.RECORDS.projects.find((p) => p.slug === slug).summary.trim(), slug);
  const used = await pg.evaluate((slug) => {
    const F = window.FREEMAN_FOLIOS[slug]; return F.leaves.filter((L) => L.passage != null).length;
  }, slug);
  if (used) {
    const joined = await pg.evaluate(() => [...document.querySelectorAll(".fo-stage .fo-leaf")].map((l) => { const t = [...l.querySelectorAll(".fo-lead, .fo-big:not(.is-name), .fo-passage")].map((e) => e.textContent.trim()).join(" "); return t; }).filter(Boolean).join(" "));
    ok(joined === account, `${tag}: passages are the published account, in order, word for word`);
  }

  for (let i = 0; i < n; i++) {
    if (i) await pg.keyboard.press("ArrowRight");
    await pg.waitForTimeout(60);
    const r = await pg.evaluate(() => {
      const l = document.querySelector(".fo-leaf.is-on"), s = document.querySelector(".fo-stage").getBoundingClientRect();
      const inside = [...l.querySelectorAll(".fo-frame, .fo-big, .fo-passage, .fo-name, .fo-particulars, .fo-onward, .fo-keys, .fo-lead, .fo-typ, .fo-plates")].every((e) => { const q = e.getBoundingClientRect(); return q.width > 0 && q.left >= -1 && q.right <= innerWidth + 1 && q.top >= s.top - 1 && q.bottom <= s.bottom + 1; });
      const frames = [...l.querySelectorAll(".fo-frame")].map((e) => e.getBoundingClientRect()).every((q) => q.width >= 100 && q.height >= 80);
      return { i: +l.dataset.i, on: document.querySelectorAll(".fo-stage .fo-leaf.is-on").length, over: l.scrollHeight - l.clientHeight, inside, frames, hash: location.hash };
    });
    ok(r.i === i && r.on === 1, `${tag}: leaf ${i + 1} is the one leaf shown`);
    ok(r.over <= 1 && r.inside, `${tag}: leaf ${i + 1} is complete on one screen (over ${r.over}, inside ${r.inside})`);
    ok(r.frames, `${tag}: leaf ${i + 1} photographs have a real size`);
    ok(r.hash === (i ? `#${i + 1}` : ""), `${tag}: leaf ${i + 1} address`);
    // details: every key moves the frame; the last click returns to the whole photograph
    const keys = await pg.locator(".fo-leaf.is-on [data-k]").count();
    for (let k = 1; k < keys; k++) {
      await pg.locator(`.fo-leaf.is-on [data-k="${k}"]`).click();
      const z = await pg.evaluate(() => { const l = document.querySelector(".fo-leaf.is-on"); return [l.querySelector(".fo-fig img").style.transform, l.querySelector(".fo-note").textContent.length, l.querySelector('[aria-pressed="true"]').dataset.k]; });
      ok(z[0].includes("scale") && z[1] > 10 && +z[2] === k, `${tag}: leaf ${i + 1} detail ${k}`);
    }
    if (keys) { await pg.keyboard.press("Escape"); ok(await pg.evaluate(() => document.querySelector(".fo-leaf.is-on .fo-fig img").style.transform === ""), `${tag}: leaf ${i + 1} Escape returns to the whole photograph`); }
  }
  ok(await pg.locator("[data-next]").isDisabled(), `${tag}: last leaf, next is disabled`);
  await pg.keyboard.press("Home");
  ok(await pg.evaluate(() => document.querySelector(".fo-leaf.is-on").dataset.i === "0"), `${tag}: Home returns to the cover`);

  // any photograph, whole: from the openings plate and from the record
  await pg.goto(`${BASE}/folio-2/${slug}.html#4`); await pg.waitForSelector("[data-ready]");
  const crops = await pg.locator(".fo-leaf.is-on .fo-crop").count();
  ok(crops === 4, `${tag}: four openings`);
  ok(await pg.evaluate(() => [...document.querySelectorAll(".fo-leaf.is-on .fo-cropframe")].every((f) => { const q = f.getBoundingClientRect(), i = f.querySelector("img").getBoundingClientRect(); return Math.abs(q.width - q.height) < 2 && i.left <= q.left + 1 && i.right >= q.right - 1 && i.top <= q.top + 1 && i.bottom >= q.bottom - 1; })), `${tag}: crops are square and filled`);
  await pg.locator(".fo-leaf.is-on .fo-crop").first().click();
  ok(await pg.evaluate(() => !document.querySelector(".fo-view").hidden && document.documentElement.dataset.ground === "dark"), `${tag}: a crop opens its photograph whole`);
  await pg.keyboard.press("ArrowRight"); await pg.keyboard.press("Escape");
  ok(await pg.evaluate(() => document.querySelector(".fo-view").hidden && document.querySelector(".fo-leaf.is-on").dataset.i === "3"), `${tag}: Escape returns to the leaf`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).color !== "rgb(51, 46, 32)"), `${tag}: inside is set on the dark ground`);
  await pg.keyboard.press("Home");
  ok(await pg.evaluate(() => document.documentElement.dataset.ground === "light"), `${tag}: outside is set on white`);

  // index
  await pg.locator("[data-index]").click();
  ok(await pg.locator(".fo-index .fo-thumb").count() === n, `${tag}: index shows every leaf`);
  ok(await pg.evaluate(() => { const t = document.querySelector(".fo-thumb").getBoundingClientRect(), m = document.querySelector(".fo-mini").getBoundingClientRect(); return Math.abs(t.width - m.width) < 2 && Math.abs(t.height - m.height) < 3; }), `${tag}: miniatures are the leaves to scale`);
  await pg.locator(`.fo-index [data-go="${n - 1}"]`).click();
  ok(await pg.evaluate((n) => document.querySelector(".fo-index").hidden && +document.querySelector(".fo-leaf.is-on").dataset.i === n - 1, n), `${tag}: index opens a leaf`);

  // touch targets on phones
  if (opts.isMobile) ok(await pg.evaluate(() => [...document.querySelectorAll(".fo-ctl button, .fo-leaf.is-on .fo-keys button")].every((e) => { const q = e.getBoundingClientRect(); return q.height >= 44 && q.width >= 40; })), `${tag}: touch targets`);
  // deep link
  await pg.goto(`${BASE}/folio-2/${slug}.html#2`); await pg.waitForSelector("[data-ready]");
  ok(await pg.evaluate(() => document.querySelector(".fo-leaf.is-on").dataset.i === "1"), `${tag}: opens at #2`);
  ok(errs.length === 0, `${tag}: no errors ${errs.join(" | ")}`);
  await c.close();
}
await b.close();
console.log(`${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
