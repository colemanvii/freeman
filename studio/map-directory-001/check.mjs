// Map Directory 001 — the project register returns beside a full-bleed map; the map opens where Freeman has built.
// Usage: PW=<path to node_modules/playwright> BASE=http://127.0.0.1:8878 OUT=<dir> node studio/map-directory-001/check.mjs
import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium, webkit, devices } = require(process.env.PW || 'playwright');
const BASE = (process.env.BASE || 'http://127.0.0.1:8878').replace(/\/$/, '');
const OUT = process.env.OUT || '';
let pass = 0, fail = 0;
const ok = (c, msg, extra = '') => { if (c) pass++; else { fail++; console.log('  FAIL', msg, extra); } };
const settle = (p) => p.waitForFunction(() => !window.__record.flying, null, { timeout: 5000 }).then(() => p.waitForTimeout(120));
const DESK = [['1600x900', { viewport: { width: 1600, height: 900 } }], ['1440x900', { viewport: { width: 1440, height: 900 } }], ['1280x720', { viewport: { width: 1280, height: 720 } }], ['1024x768', { viewport: { width: 1024, height: 768 } }], ['1920x1080', { viewport: { width: 1920, height: 1080 } }]];
const PHONE = [['iPhone 13', devices['iPhone 13']], ['iPhone SE', devices['iPhone SE']], ['Pixel 5', devices['Pixel 5']]];

for (const [ename, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch();
  for (const [name, opts] of DESK) {
    const tag = `[${ename} ${name}]`;
    const ctx = await browser.newContext(opts); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('response', (r) => r.status() >= 400 && errs.push(r.status() + ' ' + r.url()));
    await p.goto(BASE + '/map', { waitUntil: 'load' }); await p.waitForTimeout(900);
    const o = await p.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect(), map = r('#map'), tb = r('#tblock'), lede = r('#lede'), zoom = r('.zoom'), north = r('.north');
      const marks = [...document.querySelectorAll('.marklayer .mk')].map((m) => { const b = m.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
      const R = window.__record;
      return { map: map.toJSON(), tb: tb.toJSON(), lede: lede.toJSON(), zoom: zoom.toJSON(), north: north.toJSON(), vw: innerWidth, vh: innerHeight, marks,
        placed: R.clusters.reduce((a, c) => a + c.items.length, 0), far: document.getElementById('map').classList.contains('far'), s: R.view.s, home: R.home().s,
        entries: document.querySelectorAll('#tb-set button[data-slug]').length, unplaced: document.querySelectorAll('#tb-set button[data-unplaced]').length, progress: document.querySelectorAll('.tb-progress li').length,
        tbScroll: getComputedStyle(document.getElementById('tb-set')).overflowY, chatt: [...document.querySelectorAll('.nm')].some((n) => n.textContent === 'Chattanooga' && !n.classList.contains('off')),
        scroll: [document.documentElement.scrollWidth - innerWidth, document.documentElement.scrollHeight - innerHeight], plate: !!document.querySelector('.l-plate') };
    });
    ok(o.map.x <= 12 && o.map.right >= o.vw - 12 && o.map.bottom >= o.vh - 12, `${tag} the map runs to the sheet border on every side`, JSON.stringify(o.map));
    ok(o.tb.right >= o.vw - 12 && o.tb.width > 200 && o.tb.width < 300 && o.tb.left > o.map.x + o.map.width / 2, `${tag} the directory sits over the map's right side`, JSON.stringify(o.tb));
    ok(!o.plate, `${tag} no framed inset`);
    ok(!o.far && Math.abs(Math.log(o.s / o.home)) < .01, `${tag} opens where Freeman has built, not on the Southeast`, `${o.s.toFixed(3)}`);
    ok(o.placed === 14, `${tag} every placed project is on the map`, o.placed);
    ok(o.marks.every((m) => m.x > o.map.x + 20 && m.x < o.tb.left - 20 && m.y > o.lede.bottom && m.y < o.map.bottom - 20), `${tag} every marker has room, clear of the title and the directory`, JSON.stringify(o.marks));
    ok(o.zoom.right <= o.tb.left && o.north.right <= o.tb.left, `${tag} zoom and compass stand on the open map`);
    ok(o.chatt, `${tag} Chattanooga is named`);
    ok(o.entries === 15 && o.unplaced === 1 && o.progress === 3, `${tag} the directory lists all 15 projects (one not placed) and work in progress`, `${o.entries}/${o.unplaced}/${o.progress}`);
    ok(o.tbScroll === 'auto', `${tag} the directory scrolls on its own`);
    ok(o.scroll[0] <= 0 && o.scroll[1] <= 0, `${tag} the page does not scroll`, JSON.stringify(o.scroll));
    if (OUT) await p.screenshot({ path: path.join(OUT, `${ename}-${name}-open.png`) });

    // Marker → directory: hovering a single-project marker marks its entry
    const single = await p.evaluate(() => { const c = window.__record.clusters.find((c) => c.items.length === 1); const b = c.el.getBoundingClientRect(); return { slug: c.items[0].slug, x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    await p.mouse.move(single.x, single.y); await p.waitForTimeout(150);
    const hotEntry = await p.evaluate(() => [...document.querySelectorAll('#tb-set button.hot')].map((b) => b.dataset.slug));
    ok(hotEntry.length === 1 && hotEntry[0] === single.slug, `${tag} hovering a marker identifies its directory entry`, JSON.stringify(hotEntry));
    const grp = await p.evaluate(() => { const c = window.__record.clusters.find((c) => c.items.length > 1); const b = c.el.getBoundingClientRect(); return { n: c.items.length, x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    await p.mouse.move(grp.x, grp.y); await p.waitForTimeout(150);
    ok(await p.evaluate(() => document.querySelectorAll('#tb-set button.hot').length) === grp.n, `${tag} hovering a group identifies each of its entries`);
    await p.mouse.move(5, o.vh / 2);

    // Directory → marker: hovering an entry marks it on the map; clicking locates it and opens the project
    const entry = p.locator('#tb-set button[data-slug="the-optimist"]');
    await entry.hover(); await p.waitForTimeout(120);
    ok(await p.evaluate(() => window.__record.clusters.some((c) => c.el.classList.contains('hot') && c.items.some((i) => i.slug === 'the-optimist'))), `${tag} hovering an entry highlights it on the map`);
    await entry.click(); await settle(p);
    const rec = await p.evaluate(() => { const R = window.__record, it = R.items.find((i) => i.slug === 'the-optimist'), m = document.getElementById('map').getBoundingClientRect(); const x = it.x * R.view.s + R.view.tx, y = it.y * R.view.s + R.view.ty; return { mode: document.body.dataset.mode, name: document.getElementById('rec-name')?.textContent, url: location.search, onMap: x > 0 && x < m.width && y > 0 && y < m.height, on: !!document.querySelector('.marklayer .mk.on') }; });
    ok(rec.mode === 'record' && rec.name === 'The Optimist' && rec.url === '?p=the-optimist' && rec.onMap && rec.on, `${tag} choosing an entry locates and opens the project`, JSON.stringify(rec));
    await p.evaluate(() => window.__record.close()); await p.waitForTimeout(200); await settle(p);
    ok(await p.evaluate(() => document.body.dataset.mode === 'map' && getComputedStyle(document.getElementById('tblock')).display !== 'none'), `${tag} closing the project returns the directory`);
    const bocado = p.locator('#tb-set button[data-slug="bocado-pizza"]');
    await bocado.click(); await settle(p);
    ok(await p.evaluate(() => document.getElementById('rec-name')?.textContent === 'Bocado Pizza'), `${tag} a project not on the map still opens from the directory`);
    await p.evaluate(() => window.__record.close()); await p.waitForTimeout(200); await settle(p);

    // The Southeast is still there by zooming out
    await p.evaluate(() => window.__record.flyTo(window.__record.home(), 0));
    for (let i = 0; i < 5; i++) { await p.click('#zout'); await settle(p); }
    const out = await p.evaluate(() => ({ far: document.getElementById('map').classList.contains('far'), names: [...document.querySelectorAll('.nm:not(.off)')].map((n) => n.textContent) }));
    ok(out.far && out.names.some((n) => /NASHVILLE|BIRMINGHAM|CHARLOTTE/i.test(n)), `${tag} zooming out reaches the Southeast`, out.names.slice(0, 8).join(','));
    if (OUT && name === '1600x900') await p.screenshot({ path: path.join(OUT, `${ename}-${name}-southeast.png`) });
    await p.click('#zfit'); await settle(p);
    ok(await p.evaluate(() => Math.abs(Math.log(window.__record.view.s / window.__record.home().s)) < .01), `${tag} ALL returns to the opening`);
    ok(!errs.length, `${tag} no errors or failed requests`, errs.join(' | '));
    await ctx.close();
  }
  for (const [name, dev] of PHONE) {
    if (ename === 'webkit' && name === 'Pixel 5') continue;
    const tag = `[${ename} ${name}]`;
    const ctx = await browser.newContext(ename === 'webkit' ? { ...dev, isMobile: undefined, defaultBrowserType: undefined } : dev); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(BASE + '/map', { waitUntil: 'load' }); await p.waitForTimeout(900);
    const o = await p.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect(), map = r('#map'), tb = r('#tblock'), zoom = r('.zoom'), lede = r('#lede');
      const marks = [...document.querySelectorAll('.marklayer .mk')].map((m) => { const b = m.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
      return { map: map.toJSON(), tb: tb.toJSON(), zoom: zoom.toJSON(), lede: lede.toJSON(), vw: innerWidth, vh: innerHeight, marks, far: document.getElementById('map').classList.contains('far'), sw: document.documentElement.scrollWidth };
    });
    ok(o.tb.height <= 64 && o.map.height > o.vh * .5, `${tag} the directory is collapsed beneath the map`, `${o.tb.height} / map ${o.map.height}`);
    ok(!o.far, `${tag} opens where Freeman has built`);
    ok(o.marks.every((m) => m.y > o.lede.bottom && m.y < o.map.bottom - 16 && m.x > 8 && m.x < o.vw - 8) && o.marks.every((m) => !(m.x > o.zoom.left - 12 && m.y > o.zoom.top - 12)), `${tag} every marker is clear of the title and the zoom buttons`, JSON.stringify(o.marks));
    ok(o.sw <= o.vw, `${tag} no horizontal scroll`);
    if (OUT) await p.screenshot({ path: path.join(OUT, `${ename}-${name.replace(' ', '-')}-open.png`) });
    await p.tap('#reg-toggle'); await p.waitForTimeout(500);
    const open = await p.evaluate(() => ({ h: document.getElementById('tblock').getBoundingClientRect().height, n: document.querySelectorAll('#tb-set button[data-slug]').length, exp: document.getElementById('reg-toggle').getAttribute('aria-expanded') }));
    ok(open.h > 200 && open.n === 15 && open.exp === 'true', `${tag} the directory opens with all 15 projects`, JSON.stringify(open));
    if (OUT) await p.screenshot({ path: path.join(OUT, `${ename}-${name.replace(' ', '-')}-directory.png`) });
    await p.tap('#tb-set button[data-slug="barnsley-gardens"]'); await settle(p);
    ok(await p.evaluate(() => document.body.dataset.mode === 'record' && document.getElementById('rec-name')?.textContent === 'Barnsley Family Pool'), `${tag} choosing an entry opens the project`);
    ok(!errs.length, `${tag} no errors`, errs.join(' | '));
    await ctx.close();
  }
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
