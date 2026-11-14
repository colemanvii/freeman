// Freeman Folio — screens. Serve v5/ on 8921, then: node studio/case-study-system-002/shots.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW || "playwright");
const BASE = process.env.BASE || "http://127.0.0.1:8921";
const OUT = new URL("./screens/", import.meta.url).pathname;
const shot = (pg, name) => pg.screenshot({ path: `${OUT}${name}.jpg`, type: "jpeg", quality: 72 });
const settle = async (pg) => { await pg.waitForTimeout(250); await pg.evaluate(() => Promise.all([...document.querySelectorAll(".fo-leaf.is-on img, .fo-index img")].map((im) => im.decode().catch(() => {})))); await pg.waitForTimeout(900); };
const b = await chromium.launch();
for (const [slug, views] of [["muchacho-decatur", ["desktop", "phone"]], ["beetlecat", ["desktop"]], ["barnsley-gardens", ["desktop"]]]) for (const view of views) {
  const c = await b.newContext(view === "desktop" ? { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 } : devices["iPhone 13"]);
  const pg = await c.newPage();
  await pg.goto(`${BASE}/folio/${slug}.html`); await pg.waitForSelector("[data-ready]");
  const n = await pg.locator(".fo-stage .fo-leaf").count();
  const all = slug === "muchacho-decatur";
  for (let i = 1; i <= n; i++) {
    if (i > 1) await pg.keyboard.press("ArrowRight");
    if (!all && i !== 1 && i !== 3) continue;
    await settle(pg); await shot(pg, `${slug}-${view}-${String(i).padStart(2, "0")}`);
    if (all && i === 3) for (const k of [3, 4]) { await pg.locator(`.fo-leaf.is-on [data-k="${k}"]`).click(); await settle(pg); await shot(pg, `${slug}-${view}-03-detail-${k}`); }
    if (all && i === 3) await pg.keyboard.press("Escape");
  }
  await pg.keyboard.press("i"); await settle(pg); await shot(pg, `${slug}-${view}-index`);
  await c.close();
}
await b.close();
