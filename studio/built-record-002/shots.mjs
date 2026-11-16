// The Built Record — screens of every leaf. Serve v5/ (python3 -m http.server 8932 --directory v5), then:
//   PW=<path to node_modules/playwright> node studio/built-record-002/shots.mjs [slug ...]
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW || "playwright");
const BASE = process.env.BASE || "http://127.0.0.1:8932";
const OUT = process.env.OUT || new URL("./screens/", import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : ["muchacho-decatur", "barnsley-resort", "the-optimist"];
const settle = async (pg) => { await pg.waitForTimeout(350); await pg.evaluate(() => Promise.all([...document.querySelectorAll(".fo-leaf.is-on img, .bi img")].map((im) => im.decode().catch(() => {})))); await pg.waitForTimeout(500); };
const b = await chromium.launch();
const errors = [];
// desktop and phone are saved as screens; the other sizes are checked for fit only.
const VIEWS = { desktop: { viewport: { width: 1440, height: 900 } }, phone: devices["iPhone 13"], "1920": { viewport: { width: 1920, height: 1080 } }, "1280": { viewport: { width: 1280, height: 720 } }, "1024": { viewport: { width: 1024, height: 768 } }, se: devices["iPhone SE"], pixel: devices["Pixel 5"] };
let checked = 0;
for (const view of Object.keys(VIEWS)) {
  const save = view === "desktop" || view === "phone";
  const c = await b.newContext(VIEWS[view]);
  const pg = await c.newPage();
  pg.on("pageerror", (e) => errors.push(String(e))); pg.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await pg.goto(`${BASE}/built/`); await settle(pg);
  if (save) await pg.screenshot({ path: `${OUT}contents-${view}.jpg`, type: "jpeg", quality: 78 });
  if (await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight > 1 || document.documentElement.scrollWidth - innerWidth > 1)) errors.push(`${view} contents overflows`);
  for (const slug of slugs) {
    await pg.goto(`${BASE}/built/${slug}.html`); await pg.waitForSelector("[data-ready]");
    const n = await pg.locator(".fo-stage .fo-leaf").count();
    for (let i = 1; i <= n; i++) {
      if (i > 1) await pg.keyboard.press("ArrowRight");
      await settle(pg);
      const over = await pg.evaluate(() => { const l = document.querySelector(".fo-leaf.is-on"); const cut = [...l.querySelectorAll("p, dd, dt, li, h1, figcaption")].filter((e) => e.scrollWidth - e.clientWidth > 1 && getComputedStyle(e).textOverflow !== "ellipsis").length;
        const lost = [...l.querySelectorAll("img")].filter((im) => im.complete && !im.naturalWidth).length;
        return [document.documentElement.scrollHeight - innerHeight, l.scrollHeight - l.clientHeight, cut, lost]; });
      checked++;
      if (over.some((v) => v > 1)) errors.push(`${view} ${slug} leaf ${i} overflows ${over}`);
      if (save) await pg.screenshot({ path: `${OUT}${slug}-${view}-${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 78 });
    }
  }
  await c.close();
}
await b.close();
console.log(errors.length ? errors.join("\n") : `${checked} leaves checked: every leaf fits one screen, no errors`);
