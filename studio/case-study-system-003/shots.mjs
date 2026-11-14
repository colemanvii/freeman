// Freeman Folio, second iteration — screens. Serve v5/ on 8921, then: node studio/case-study-system-003/shots.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW || "playwright");
const BASE = process.env.BASE || "http://127.0.0.1:8921";
const OUT = new URL("./screens/", import.meta.url).pathname;
const shot = (pg, name) => pg.screenshot({ path: `${OUT}${name}.jpg`, type: "jpeg", quality: 74 });
const settle = async (pg) => { await pg.waitForTimeout(600); await pg.evaluate(() => Promise.all([...document.querySelectorAll(".fo-leaf.is-on img, .fo-index img, .fo-view img")].map((im) => im.decode().catch(() => {})))); await pg.waitForTimeout(900); };
const b = await chromium.launch();
for (const view of ["desktop", "phone"]) {
  const c = await b.newContext(view === "desktop" ? { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 } : devices["iPhone 13"]);
  const pg = await c.newPage();
  await pg.goto(`${BASE}/folio-2/muchacho-decatur.html`); await pg.waitForSelector("[data-ready]");
  const n = await pg.locator(".fo-stage .fo-leaf").count();
  for (let i = 1; i <= n; i++) {
    if (i > 1) await pg.keyboard.press("ArrowRight");
    await settle(pg); await shot(pg, `${view}-${String(i).padStart(2, "0")}`);
    if (i === 2) { await pg.locator('.fo-leaf.is-on [data-k="4"]').click(); await settle(pg); await shot(pg, `${view}-02-detail`); await pg.locator('.fo-leaf.is-on [data-k="0"]').click(); }
    if (i === 4) { await pg.locator(".fo-leaf.is-on .fo-crop").nth(1).click(); await settle(pg); await shot(pg, `${view}-04-whole`); await pg.locator("[data-viewx]").click(); }
  }
  await pg.locator("[data-index]").click(); await settle(pg); await shot(pg, `${view}-index`);
  await c.close();
}
await b.close();
