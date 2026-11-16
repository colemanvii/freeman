// The journey: map → overview → View full case study → slideshow → Back to project.
// Serve v5 with clean URLs (wrangler pages dev v5 --port 8932), then:
//   PW=<path to node_modules/playwright> node studio/built-record-002/journey.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW || "playwright");
const BASE = process.env.BASE || "http://127.0.0.1:8932";
const OUT = process.env.OUT || new URL("./screens/", import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const SLUG = "muchacho-decatur";
const VIEWS = { desktop: { viewport: { width: 1440, height: 900 } }, phone: devices["iPhone 13"], "1920": { viewport: { width: 1920, height: 1080 } }, "1280": { viewport: { width: 1280, height: 720 } }, "1024": { viewport: { width: 1024, height: 768 } }, se: devices["iPhone SE"], pixel: devices["Pixel 5"] };
const fails = []; let n = 0;
const ok = (cond, what) => { n++; if (!cond) fails.push(what); };
const settle = async (pg) => { await pg.waitForTimeout(350); await pg.evaluate(() => Promise.all([...document.querySelectorAll(".fo-leaf.is-on img, .p-slide img")].slice(0, 3).map((im) => im.decode().catch(() => {})))); await pg.waitForTimeout(450); };
const b = await chromium.launch();
for (const view of Object.keys(VIEWS)) {
  const save = view === "desktop" || view === "phone";
  const shot = (pg, name) => save ? pg.screenshot({ path: `${OUT}${name}-${view}.jpg`, type: "jpeg", quality: 80 }) : null;
  const c = await b.newContext(VIEWS[view]);
  const pg = await c.newPage();
  pg.on("pageerror", (e) => fails.push(`${view} script error: ${e}`));
  // 1 map, 2 overview
  await pg.goto(`${BASE}/map`); await pg.waitForLoadState("networkidle");
  await pg.evaluate(() => { history.pushState({ p: "muchacho-decatur", d: 1 }, "", "?p=muchacho-decatur"); dispatchEvent(new PopStateEvent("popstate")); });
  await pg.waitForSelector(".p-full"); await settle(pg);
  const action = pg.locator(".p-full");
  ok((await action.innerText()).replace(/\s+/g, " ").trim().toUpperCase().startsWith("VIEW FULL CASE STUDY"), `${view}: overview action reads "${await action.innerText()}"`);
  await action.scrollIntoViewIfNeeded(); await settle(pg); await shot(pg, "journey-1-overview");
  // 3 case study
  await action.click(); await pg.waitForSelector("[data-ready]");
  ok(new URL(pg.url()).pathname === `/project-${SLUG}`, `${view}: case study opened at ${pg.url()}`);
  const count = await pg.locator(".fo-leaf").count();
  for (let i = 1; i <= count; i++) {
    if (i > 1) { if (i % 2) await pg.keyboard.press("ArrowRight"); else await pg.locator("[data-next]").click(); }
    await settle(pg);
    const r = await pg.evaluate(() => { const l = document.querySelector(".fo-leaf.is-on"); const box = l.getBoundingClientRect();
      const out = [...l.querySelectorAll("img, p, h1, dl, a")].filter((e) => { const q = e.getBoundingClientRect(); return q.width && (q.bottom > box.bottom + 1 || q.right > box.right + 1 || q.left < box.left - 8); }).length;
      const lost = [...l.querySelectorAll("img")].filter((im) => im.complete && !im.naturalWidth).length;
      const a = document.querySelector("[data-next]").getBoundingClientRect(), ph = l.querySelector(".fo-frame");
      const over = ph ? (() => { const f = ph.getBoundingClientRect(); return !(a.right <= f.left || a.left >= f.right || a.bottom <= f.top || a.top >= f.bottom) && innerWidth > 760; })() : false;
      return { scroll: document.documentElement.scrollHeight - innerHeight, out, lost, over, counter: document.querySelector(".fo-count").textContent.trim(), bg: getComputedStyle(document.body).backgroundColor, hit: Math.min(a.width, a.height) }; });
    ok(r.scroll <= 1 && r.out === 0, `${view} slide ${i}: does not fit (${JSON.stringify(r)})`);
    ok(r.lost === 0, `${view} slide ${i}: missing image`);
    ok(!r.over, `${view} slide ${i}: arrow overlaps the photograph`);
    ok(r.counter === `${String(i).padStart(2, "0")} / ${String(count).padStart(2, "0")}`, `${view} slide ${i}: counter "${r.counter}"`);
    ok(r.bg === "rgb(255, 249, 241)", `${view} slide ${i}: ground ${r.bg}`);
    ok(r.hit >= 44, `${view} slide ${i}: arrow target ${r.hit}px`);
    await shot(pg, `muchacho-${String(i).padStart(2, "0")}`);
  }
  ok(await pg.locator("[data-next]").isDisabled(), `${view}: next is not disabled on the last slide`);
  await pg.keyboard.press("ArrowLeft"); await settle(pg);
  ok((await pg.locator(".fo-count").innerText()).startsWith(String(count - 1).padStart(2, "0")), `${view}: left arrow key did not go back one slide`);
  // 4 back to project: the overview is open again, on the map
  await pg.locator(".fo-back").click(); await pg.waitForSelector(".p-full"); await settle(pg);
  ok(new URL(pg.url()).pathname === "/map" && new URL(pg.url()).searchParams.get("p") === SLUG, `${view}: Back to project went to ${pg.url()}`);
  ok((await pg.locator("#rec-name").textContent()) === "Muchacho Decatur", `${view}: overview not open after Back to project`);
  await shot(pg, "journey-3-back");
  // browser forward returns to the case study, browser back leaves it in one step
  await pg.goForward(); await pg.waitForSelector("[data-ready]");
  ok(new URL(pg.url()).pathname === `/project-${SLUG}`, `${view}: browser forward went to ${pg.url()}`);
  await pg.keyboard.press("ArrowRight"); await pg.keyboard.press("ArrowRight"); await settle(pg);
  await pg.goBack(); await pg.waitForSelector(".p-full");
  ok(new URL(pg.url()).pathname === "/map", `${view}: browser back from slide 3 went to ${pg.url()}`);
  // from the overview, the map
  await pg.locator('[data-act="close"]').click(); await pg.waitForTimeout(500);
  ok(!new URL(pg.url()).searchParams.get("p"), `${view}: closing the overview left ${pg.url()}`);
  // a project with no slideshow keeps its existing action
  await pg.evaluate(() => { history.pushState({ p: "beetlecat", d: 1 }, "", "?p=beetlecat"); dispatchEvent(new PopStateEvent("popstate")); });
  await pg.waitForFunction(() => document.querySelector("#rec-name")?.textContent === "Beetlecat");
  ok((await pg.locator(".p-full").innerText()).toUpperCase().startsWith("FULL PROJECT"), `${view}: Beetlecat action reads "${await pg.locator(".p-full").innerText()}"`);
  // a direct arrival: Back to project still opens the overview
  const p2 = await c.newPage(); await p2.goto(`${BASE}/project-${SLUG}#4`); await p2.waitForSelector("[data-ready]");
  ok((await p2.locator(".fo-count").innerText()).startsWith("04"), `${view}: deep link #4 opened ${await p2.locator(".fo-count").innerText()}`);
  await p2.locator(".fo-back").click(); await p2.waitForSelector(".p-full");
  ok((await p2.locator("#rec-name").textContent()) === "Muchacho Decatur", `${view}: direct arrival, Back to project`);
  if (view === "phone") { // a swipe moves one slide
    await p2.goto(`${BASE}/project-${SLUG}`); await p2.waitForSelector("[data-ready]");
    await p2.evaluate(() => { const s = document.querySelector(".fo-stage"); const t = (x) => new Touch({ identifier: 1, target: s, clientX: x, clientY: 300 });
      s.dispatchEvent(new TouchEvent("touchstart", { touches: [t(300)], changedTouches: [t(300)] })); s.dispatchEvent(new TouchEvent("touchend", { touches: [], changedTouches: [t(120)] })); });
    ok((await p2.locator(".fo-count").innerText()).startsWith("02"), "phone: swipe did not move one slide");
  }
  await c.close();
}
await b.close();
console.log(fails.length ? `${fails.length} of ${n} failed\n` + fails.join("\n") : `${n} checks passed`);
