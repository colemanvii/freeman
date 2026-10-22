// The Record — interaction and integrity checks.
// Usage: PW=<path to node_modules/playwright> BASE=http://localhost:8825 OUT=<screenshot dir> node studio/the-record-001/check.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.env.PW || 'playwright');
const BASE = (process.env.BASE || 'http://localhost:8825') + '/studies/the-record-001/';
const OUT = process.env.OUT || '';
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL', msg); } };
const wait = (p, ms) => p.waitForTimeout(ms);

// Test-only years, injected over the network so the page's own data is never touched
const TEST_YEARS = { 'beetlecat': 2019, 'the-optimist': 2021, 'barnsley-gardens': 2022, 'o-ku-atlanta': 2023, 'la-cresta-on-main': 2024 };

async function page(browser, opts, { years = false } = {}) {
  const ctx = await browser.newContext(opts);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  if (years) await p.route('**/sites.js*', async (r) => {
    const res = await r.fetch(); const body = (await res.text()).replace('years: {}', 'years: ' + JSON.stringify(TEST_YEARS));
    r.fulfill({ response: res, body });
  });
  p.errors = errors;
  return p;
}
const state = (p) => p.evaluate(() => ({ s: __record.view.s, tx: __record.view.tx, ty: __record.view.ty, mode: document.body.dataset.mode, clusters: __record.clusters.map((c) => c.items.map((i) => i.slug)) }));

async function desktop(browserType, name, viewport) {
  console.log(`${name} ${viewport.width}×${viewport.height}`);
  const b = await browserType.launch();
  const p = await page(b, { viewport });
  await p.goto(BASE); await wait(p, 1800);
  let st = await state(p);
  ok(st.mode === 'map', 'opens on the map');
  ok(st.clusters.flat().length === 14, `14 placed projects on the map (got ${st.clusters.flat().length})`);
  ok(!st.clusters.flat().includes('bocado-pizza'), 'Bocado is not placed');
  const fits = await p.evaluate(() => document.scrollingElement.scrollHeight <= innerHeight + 1 && document.scrollingElement.scrollWidth <= innerWidth + 1);
  ok(fits, 'no page scroll');
  const inMap = await p.evaluate(() => { const r = document.getElementById('map').getBoundingClientRect(); return __record.clusters.every((c) => { const k = c.el.getBoundingClientRect(); return k.left >= r.left && k.right <= r.right && k.top >= r.top && k.bottom <= r.bottom; }); });
  ok(inMap, 'every mark is inside the map at first view');
  const lede = await p.evaluate(() => { const l = document.getElementById('lede').getBoundingClientRect(); return __record.clusters.every((c) => { const k = c.el.getBoundingClientRect(); return k.bottom < l.top || k.top > l.bottom || k.right < l.left || k.left > l.right; }); });
  ok(lede, 'no mark sits under the title');
  if (OUT) await p.screenshot({ path: `${OUT}/${name}-${viewport.width}-map.png` });

  // A group zooms in until it separates
  const s0 = st.s;
  await p.evaluate(() => __record.clusters.find((c) => c.items.length > 5).el.click());
  await wait(p, 900);
  st = await state(p);
  ok(st.s > s0 * 2, `Atlanta group zooms in (${s0.toFixed(2)} → ${st.s.toFixed(2)})`);
  if (OUT) await p.screenshot({ path: `${OUT}/${name}-${viewport.width}-atlanta.png` });

  // Three records on Broad Street share a block: zoom until they cannot separate, then the callout lists them
  for (let k = 0; k < 4; k++) {
    const opened = await p.evaluate(() => { const c = __record.clusters.find((c) => c.items.some((i) => i.slug === 'brewhouse-cafe')); c.el.click(); return !!document.querySelector('.callout'); });
    await wait(p, 900);
    if (opened || await p.$('.callout')) break;
  }
  const call = await p.$eval('.callout', (e) => [...e.querySelectorAll('li .t')].map((t) => t.textContent)).catch(() => []);
  ok(call.length === 3 && call.includes('Mule Train') && call.includes('Broad Street BBQ') && call.includes('Brewhouse Cafe'), `Broad St callout lists three (${call.join(', ')})`);
  if (OUT) await p.screenshot({ path: `${OUT}/${name}-${viewport.width}-callout.png` });
  const before = await state(p);
  await p.click('.callout li:nth-child(2) button');
  await wait(p, 1000);
  st = await state(p);
  ok(st.mode === 'record' && p.url().includes('?p='), 'callout opens a record and sets the URL');
  const recFits = await p.evaluate(() => { const r = document.getElementById('record'); const o = r.querySelector('.r-out').getBoundingClientRect(); return o.bottom <= innerHeight && r.scrollHeight <= r.clientHeight + 1; });
  ok(recFits, 'record fits the viewport with the full-project link visible');
  await p.keyboard.press('Escape');
  await wait(p, 1000);
  st = await state(p);
  ok(st.mode === 'map' && Math.abs(st.s - before.s) < 1e-6 && Math.abs(st.tx - before.tx) < .5 && Math.abs(st.ty - before.ty) < .5, 'closing returns to the same position and zoom');

  // Beetlecat, the composed record
  await p.click('#zfit'); await wait(p, 900);
  await p.click('.tb-set button[data-slug="beetlecat"]');
  await wait(p, 1100);
  const rec = await p.evaluate(() => ({ name: document.getElementById('rec-name').textContent, thumbs: document.querySelectorAll('.r-thumbs button').length, where: document.querySelector('.r-where').textContent, img: document.getElementById('r-img').complete && document.getElementById('r-img').naturalWidth > 0 }));
  ok(rec.name === 'Beetlecat' && rec.thumbs === 4 && rec.img, 'Beetlecat record with four photographs');
  ok(/299 N Highland/.test(rec.where), 'public venue shows its published address');
  await p.click('.r-thumbs button:nth-child(3)'); await wait(p, 400);
  ok((await p.textContent('#r-count')).trim() === '3 / 4', 'thumbnail switches the photograph');
  if (OUT) await p.screenshot({ path: `${OUT}/${name}-${viewport.width}-beetlecat.png` });
  await p.click('[data-open]'); await wait(p, 1100);
  ok(await p.evaluate(() => document.getElementById('rec-name').textContent !== 'Beetlecat'), 'nearest record opens');
  await p.goBack(); await wait(p, 1000);
  ok(await p.evaluate(() => document.getElementById('rec-name')?.textContent === 'Beetlecat'), 'back returns to the previous record');
  await p.goBack(); await wait(p, 1000);
  ok((await state(p)).mode === 'map', 'back again returns to the map');

  // Privacy: approximate areas never show coordinates or an address
  for (const slug of ['la-cresta-on-main', 'dalton-surgery-center', 'muchacho-decatur', 'azalea-marketplace']) {
    await p.evaluate((s) => __record.open(s), slug); await wait(p, 900);
    const w = await p.textContent('.r-where');
    ok(/Approximate area/i.test(w) && !/°/.test(w) && !/\d+ \w+ (St|Rd|Ave)/.test(w), `${slug} is shown as an approximate area`);
    await p.evaluate(() => __record.close()); await wait(p, 800);
  }
  if (OUT) { await p.evaluate(() => __record.open('la-cresta-on-main')); await wait(p, 1100); await p.screenshot({ path: `${OUT}/${name}-${viewport.width}-lacresta.png` }); await p.evaluate(() => __record.close()); await wait(p, 800); }

  // Find
  await p.fill('#q', 'optim'); await p.keyboard.press('Enter'); await wait(p, 1100);
  ok(await p.evaluate(() => document.getElementById('rec-name')?.textContent === 'The Optimist'), 'find opens The Optimist');
  await p.keyboard.press('Escape'); await wait(p, 900);
  await p.fill('#q', 'Blue Ridge'); await wait(p, 100);
  const opts = await p.$$eval('#found li', (l) => l.map((x) => x.textContent));
  ok(opts.some((t) => /La Cresta/.test(t)), 'find by place returns the project there');

  // Rule with no years on file: honest, disabled
  const rule = await p.evaluate(() => ({ dis: document.getElementById('play').disabled, note: document.getElementById('rule-note').textContent, n: document.querySelector('.undated b').textContent }));
  ok(rule.dis && /No completion years/.test(rule.note) && rule.n === '15', 'time rule is honest when no years are on file');
  ok(p.errors.length === 0, 'no console errors: ' + p.errors.join(' | '));
  await b.close();

  // Rule with test-only years
  const b2 = await browserType.launch();
  const q = await page(b2, { viewport }, { years: true });
  await q.goto(BASE); await wait(q, 1800);
  const n = () => q.evaluate(() => __record.clusters.flat ? __record.clusters.reduce((a, c) => a + c.items.length, 0) : 0);
  ok(await q.evaluate(() => !document.getElementById('play').disabled), 'play is enabled once years exist');
  await q.evaluate(() => __record.setYear(2020)); await wait(q, 300);
  const at2020 = await q.evaluate(() => __record.clusters.flatMap((c) => c.items.map((i) => i.slug)));
  ok(at2020.includes('beetlecat') && !at2020.includes('the-optimist') && !at2020.includes('o-ku-atlanta'), 'by 2020 Beetlecat is shown, later work is not');
  ok(at2020.includes('dugans-pub'), 'undated records stay on the map');
  ok(await q.evaluate(() => [...document.querySelectorAll('.mk.undated')].length > 0), 'undated records are drawn quietly in the past');
  await q.evaluate(() => __record.setYear(2026)); await wait(q, 300);
  ok(await n() === 14, 'now shows every placed record');
  // Drag the handle to the start
  const box = await q.$eval('#track-wrap', (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2, w: r.width }; });
  await q.mouse.move(box.x + box.w - 1, box.y); await q.mouse.down(); await q.mouse.move(box.x + 2, box.y, { steps: 6 }); await q.mouse.up();
  ok(await q.evaluate(() => document.getElementById('handle').getAttribute('aria-valuenow')) === String(Math.min(2019, 2025)), 'dragging the rule reaches the first year');
  if (OUT) await q.screenshot({ path: `${OUT}/${name}-${viewport.width}-rule-test-years.png` });
  await q.focus('#handle'); await q.keyboard.press('End'); await wait(q, 200);
  ok(await q.evaluate(() => document.getElementById('handle').getAttribute('aria-valuenow')) === '2026', 'End key returns to now');
  ok(q.errors.length === 0, 'no console errors with years: ' + q.errors.join(' | '));
  await b2.close();
}

async function phone() {
  console.log('phone 375×812');
  const b = await chromium.launch();
  const p = await page(b, { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.goto(BASE); await wait(p, 1800);
  const st = await state(p);
  ok(st.clusters.flat().length === 14, 'phone: all placed projects on the map');
  ok(await p.evaluate(() => document.scrollingElement.scrollHeight <= innerHeight + 1), 'phone: no page scroll');
  const inMap = await p.evaluate(() => { const r = document.getElementById('map').getBoundingClientRect(); return __record.clusters.every((c) => { const k = c.el.getBoundingClientRect(); const x = k.left + k.width / 2, y = k.top + k.height / 2; return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }); });
  ok(inMap, 'phone: every mark inside the map');
  const sizes = await p.evaluate(() => __record.clusters.map((c) => c.el.getBoundingClientRect().width));
  ok(sizes.every((w) => w >= 44), 'phone: marks are 44px touch targets');
  if (OUT) await p.screenshot({ path: `${OUT}/phone-map.png` });
  // One-finger pan
  const m = await p.$eval('#map', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const tx0 = (await state(p)).tx;
  const cdp = await p.context().newCDPSession(p);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id })) });
  await touch('touchStart', [[m.x - 60, m.y]]); for (let k = 1; k <= 6; k++) await touch('touchMove', [[m.x - 60 + k * 15, m.y]]); await touch('touchEnd', []);
  await wait(p, 200);
  ok((await state(p)).tx > tx0 + 40, 'phone: drag pans the map');
  // Pinch out
  const s0 = (await state(p)).s;
  await touch('touchStart', [[m.x - 30, m.y], [m.x + 30, m.y]]); for (let k = 1; k <= 8; k++) await touch('touchMove', [[m.x - 30 - k * 12, m.y], [m.x + 30 + k * 12, m.y]]); await touch('touchEnd', []);
  await wait(p, 200);
  ok((await state(p)).s > s0 * 1.8, 'phone: pinch zooms');
  // Register
  await p.tap('#reg-toggle'); await wait(p, 400);
  ok(await p.evaluate(() => document.getElementById('tblock').classList.contains('open')), 'phone: register opens');
  if (OUT) await p.screenshot({ path: `${OUT}/phone-register.png` });
  await p.tap('.tb-set button[data-slug="beetlecat"]'); await wait(p, 1200);
  const r = await p.evaluate(() => { const rec = document.getElementById('record').getBoundingClientRect(); const mk = document.querySelector('.mk.on')?.getBoundingClientRect(); return { top: rec.top, mk: mk && mk.top + mk.height / 2, scroll: document.getElementById('record').scrollHeight > document.getElementById('record').clientHeight }; });
  ok(r.mk && r.mk > 40 && r.mk < r.top, 'phone: the project stays visible on the map above its record');
  if (OUT) await p.screenshot({ path: `${OUT}/phone-beetlecat.png` });
  await p.$eval('#record', (e) => (e.scrollTop = e.scrollHeight)); await wait(p, 200);
  if (OUT) await p.screenshot({ path: `${OUT}/phone-beetlecat-end.png` });
  ok(await p.evaluate(() => { const o = document.querySelector('.r-out').getBoundingClientRect(); return o.bottom <= innerHeight; }), 'phone: record scrolls to the full-project link');
  await p.tap('#r-back'); await wait(p, 1000);
  ok((await state(p)).mode === 'map', 'phone: back to the map');
  ok(p.errors.length === 0, 'phone: no console errors: ' + p.errors.join(' | '));
  await b.close();
}

await desktop(chromium, 'chromium', { width: 1440, height: 900 });
await desktop(chromium, 'chromium', { width: 1280, height: 720 });
await desktop(webkit, 'webkit', { width: 1440, height: 900 });
await phone();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
