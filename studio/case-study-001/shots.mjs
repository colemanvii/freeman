// Case Study 001 — screenshots at the sizes reviewed.
// Usage: PW=<path to node_modules/playwright> BASE=http://127.0.0.1:8921 OUT=<dir> node studio/case-study-001/shots.mjs [path]
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW || 'playwright');
const BASE = (process.env.BASE || 'http://127.0.0.1:8921').replace(/\/$/, '');
const OUT = process.env.OUT || 'studio/case-study-001/screens';
const PATH = process.argv[2] || '/project-beetlecat';
const TAG = process.argv[3] || 'beetlecat';
fs.mkdirSync(OUT, { recursive: true });
const SIZES = [
  ['1600x900', { viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 }],
  ['1280x720', { viewport: { width: 1280, height: 720 } }],
  ['1024x768', { viewport: { width: 1024, height: 768 } }],
  ['iphone13', devices['iPhone 13']],
];
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const browser = await chromium.launch();
for (const [name, opts] of SIZES) {
  if (only && !only.includes(name)) continue;
  const ctx = await browser.newContext(opts); const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('  pageerror', name, String(e)));
  p.on('console', (m) => m.type() === 'error' && console.log('  console', name, m.text()));
  p.on('response', (r) => r.status() >= 400 && console.log('  ' + r.status(), r.url()));
  await p.goto(BASE + PATH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const vp = p.locator('.viewport');
  const { h, vh } = await vp.evaluate((v) => ({ h: v.scrollHeight, vh: v.clientHeight }));
  let k = 0;
  for (let y = 0; y < h - 4; y += Math.round(vh * 0.92)) {
    await vp.evaluate((v, y) => { v.scrollTop = y; }, y);
    await p.waitForTimeout(350);
    await p.screenshot({ path: `${OUT}/${TAG}-${name}-${String(++k).padStart(2, '0')}.png` });
    if (y + vh >= h) break;
  }
  console.log(name, 'sheet', h, 'window', vh, 'shots', k);
  await ctx.close();
}
await browser.close();
