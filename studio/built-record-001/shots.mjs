// Screenshots for review. Serve v5/ and run:  BASE=http://127.0.0.1:8921 node studio/built-record-001/shots.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW || "playwright");
const BASE = process.env.BASE || "http://127.0.0.1:8921", OUT = new URL("./screens/", import.meta.url).pathname;
const b = await chromium.launch();
const shot = (p, n) => p.screenshot({ path: `${OUT}${n}.jpg`, type: "jpeg", quality: 86 });
const walk = async (p) => { const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 500) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(120); } await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400); };
const to = async (p, sel, off) => { await p.evaluate(([s, o]) => { const e = document.querySelector(s); scrollTo({ top: e.getBoundingClientRect().top + scrollY - o, behavior: "instant" }); }, [sel, off]); await p.waitForTimeout(700); };
for (const [n, o] of [["desktop", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }], ["phone", devices["iPhone 13"]]]) {
  const c = await b.newContext(o), p = await c.newPage(), off = n === "phone" ? 8 : 36;
  await p.goto(`${BASE}/built-record/muchacho-decatur.html`, { waitUntil: "networkidle" }); await walk(p);
  await shot(p, `${n}-01-opening`);
  await p.screenshot({ path: `${OUT}${n}-00-full.jpg`, type: "jpeg", quality: 70, fullPage: true });
  await to(p, "#overview", off); await shot(p, `${n}-02-overview`);
  const set = n === "phone" ? ".br-view" : ".br-set";
  await to(p, ".br-set", off); if (n === "phone") await shot(p, `${n}-03-sheet`);
  await to(p, set, off); await shot(p, `${n}-04-completed`);
  await p.click(".br-states [data-state=drawing]"); await to(p, set, off); await shot(p, `${n}-05-drawing`);
  await p.click(".br-states [data-state=construction]"); await to(p, set, off); await shot(p, `${n}-06-construction`);
  await p.click(".br-states [data-state=completed]"); await p.click("#tab-1"); await to(p, set, off); await shot(p, `${n}-07-front-room`);
  await p.click("#tab-5"); await to(p, ".br-set", off); await shot(p, `${n}-08-plan-reserved`);
  await to(p, "#finished", off); await shot(p, `${n}-09-finished-a`);
  await p.evaluate(() => scrollBy({ top: innerHeight * 0.92, behavior: "instant" })); await p.waitForTimeout(500); await shot(p, `${n}-10-finished-b`);
  await p.evaluate(() => scrollBy({ top: innerHeight * 0.92, behavior: "instant" })); await p.waitForTimeout(500); await shot(p, `${n}-11-finished-c`);
  await to(p, "#particulars", off); await shot(p, `${n}-12-particulars`);
  // The version it replaces, for comparison.
  await p.goto(`${BASE}/project-muchacho-decatur.html`, { waitUntil: "networkidle" }); await p.waitForTimeout(1200); await shot(p, `${n}-previous-01`);
  const vh = await p.evaluate(() => document.querySelector(".viewport").clientHeight);
  for (let i = 1; i <= 2; i++) { await p.evaluate((y) => document.querySelector(".viewport").scrollTo(0, y), i * vh * 0.95); await p.waitForTimeout(700); await shot(p, `${n}-previous-0${i + 1}`); }
  await p.goto(`${BASE}/built-record/beetlecat.html`, { waitUntil: "networkidle" }); await walk(p); await shot(p, `${n}-beetlecat-opening`);
  await c.close();
}
await b.close();
