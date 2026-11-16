// The whole Muchacho journey as frames: map → overview → hover → entry transition → slides → return.
// Serve v5 with clean URLs on 8932, then: PW=<playwright> OUT=<dir>/ node studio/built-record-002/film.mjs [edition]
// edition "1" films the version preserved for comparison (the overview link is followed with ?edition=1).
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW || "playwright");
const BASE = process.env.BASE || "http://127.0.0.1:8932";
const OUT = process.env.OUT || new URL("./film/", import.meta.url).pathname;
const ED = process.argv[2] || "2";
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const notes = [];
for (const view of ["desktop", "phone"]) {
  const c = await b.newContext({ ...(view === "desktop" ? { viewport: { width: 1440, height: 900 } } : devices["iPhone 13"]), recordVideo: process.env.VIDEO ? { dir: OUT, size: view === "desktop" ? { width: 1440, height: 900 } : { width: 390, height: 664 } } : undefined });
  const pg = await c.newPage();
  const errs = []; pg.on("pageerror", (e) => errs.push(String(e))); pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  const cdp = await c.newCDPSession(pg);
  let frames = [], rec = false;
  cdp.on("Page.screencastFrame", (f) => { if (rec) frames.push(f.data); cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 72, everyNthFrame: 1 });
  const still = (name) => pg.screenshot({ path: `${OUT}e${ED}-${view}-${name}.jpg`, type: "jpeg", quality: 80 });
  const burst = async (name, act, ms, pick) => { frames = []; rec = true; await act(); await pg.waitForTimeout(ms); rec = false;
    const n = frames.length; notes.push(`${view} ${name}: ${n} frames`);
    pick.forEach((q, k) => { const f = frames[Math.min(n - 1, Math.floor(q * n))]; if (f) fs.writeFileSync(`${OUT}e${ED}-${view}-${name}-${k + 1}.jpg`, Buffer.from(f, "base64")); }); };
  await pg.goto(`${BASE}/map`); await pg.waitForLoadState("networkidle"); await pg.waitForTimeout(1200);
  await still("1-map");
  // choose Muchacho on the map itself, falling back to the directory
  const mark = pg.locator('.mk[data-slug="muchacho-decatur"]').first();
  const row = pg.locator('.tb-set button[data-slug="muchacho-decatur"]').first();
  if (await mark.isVisible().catch(() => false)) { await mark.click(); notes.push(`${view}: chosen by its marker`); }
  else { if (!(await row.isVisible().catch(() => false))) await pg.locator("#reg-toggle").click(); await row.click(); notes.push(`${view}: chosen in the directory`); }
  await pg.waitForFunction(() => document.querySelector("#rec-name")?.textContent === "Muchacho Decatur" && [...document.querySelectorAll(".p-full")].some((a) => a.offsetParent)); await pg.waitForTimeout(1800);
  await still("2-overview");
  const act = pg.locator(".p-full:visible");
  await act.scrollIntoViewIfNeeded(); await pg.waitForTimeout(400);
  if (ED === "1") await act.evaluate((a) => { a.href += "?edition=1"; });
  if (view === "desktop") { await act.hover(); await pg.waitForTimeout(300); } await still("3-invite");
  const before = await pg.evaluate(() => ({ y: document.getElementById("p-scroll")?.scrollTop }));
  await burst("4-enter", () => act.click(), 1300, [0.12, 0.3, 0.5, 0.75]);
  await pg.waitForSelector("[data-ready]"); await pg.waitForTimeout(500); await still("5-slide-01");
  const n = await pg.locator(".fo-leaf").count();
  for (let i = 2; i <= n; i++) {
    if (i === 2) await burst("5-turn", () => pg.keyboard.press("ArrowRight"), 800, [0.35, 0.6]); else await pg.keyboard.press("ArrowRight");
    await pg.waitForTimeout(900); await still(`5-slide-${String(i).padStart(2, "0")}`);
  }
  await burst("6-return", () => pg.locator(".fo-back").click(), 1300, [0.15, 0.35, 0.6]);
  await pg.waitForFunction(() => document.querySelector("#rec-name")?.textContent === "Muchacho Decatur"); await pg.waitForTimeout(600); await still("7-returned");
  const after = await pg.evaluate(() => ({ y: document.getElementById("p-scroll")?.scrollTop, url: location.pathname + location.search }));
  notes.push(`${view}: returned to ${after.url}; overview scroll ${before.y} → ${after.y}; errors: ${errs.length ? errs.join(" | ") : "none"}`);
  await c.close();
}
await b.close();
console.log(notes.join("\n"));
