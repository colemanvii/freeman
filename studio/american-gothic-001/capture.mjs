// Real-browser captures of the American Gothic live study, both faces, desktop and phone.
// node capture.mjs [baseURL]  — uses installed Google Chrome through Playwright.
import { createRequire } from "module";
import { mkdirSync } from "fs";
const require = createRequire("/Users/colecalfee/Sites/emberwing/");
const { chromium } = require("playwright");

const base = process.argv[2] || "http://localhost:8871";
const out = (process.env.OUT || new URL("./screens/", import.meta.url).pathname);
mkdirSync(out, { recursive: true });
const pages = [["home", "/"], ["company", "/company"], ["projects", "/map"], ["beetlecat", "/project-beetlecat"],
  ["woodlands", "/project-woodlands-at-barnsley-resort"], ["contact", "/contact"]];
const devices = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" },
};
const browser = await chromium.launch({ channel: "chrome" });
for (const [dname, dev] of Object.entries(devices)) {
  const ctx = await browser.newContext(dev);
  const page = await ctx.newPage();
  for (const [name, path] of pages) for (const type of ["gothic", "monaco"]) {
    await page.goto(`${base}${path}?type=${type}&clean`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(name === "projects" ? 4500 : 3200);
    const file = `${out}${dname}-${name}-${type}.png`;
    await page.screenshot({ path: file });
    const f = await page.evaluate(() => getComputedStyle(document.querySelector("#main *, main *, body *")).fontFamily);
    console.log(file.split("/").pop(), "·", f.split(",")[0]);
  }
  await ctx.close();
}
await browser.close();
