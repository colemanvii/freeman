import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium, webkit, devices } = require(process.env.PW);
const BASE = process.env.BASE, OUT = process.env.OUT;
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('  FAIL', m, x); } };
const sizes = [['desk-1440', { viewport: { width: 1440, height: 900 } }], ['desk-1920', { viewport: { width: 1920, height: 1080 } }], ['desk-1024', { viewport: { width: 1024, height: 768 } }],
  ['phone', devices['iPhone 13']], ['phone-small', devices['iPhone SE']]];
for (const [bname, bt] of [['chromium', chromium], ['webkit', webkit]]) {
  const b = await bt.launch();
  for (const [name, opt] of sizes) {
    const o = { ...opt }; if (bname === 'chromium') delete o.defaultBrowserType;
    if (bname === 'chromium' && o.isMobile) { /* chromium handles mobile emulation */ }
    const ctx = await b.newContext(o); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    const tag = `${bname}/${name}`;
    await p.goto(BASE + '/projects'); await p.waitForFunction(() => window.__record); await p.waitForTimeout(1200);
    ok(p.url().endsWith('/map'), `${tag} /projects → /map`, p.url());
    const st = await p.evaluate(() => {
      const r = (id) => document.getElementById(id).getBoundingClientRect();
      const map = r('map'), lede = r('lede');
      const marks = [...document.querySelectorAll('#marks .mk')].map((m) => m.getBoundingClientRect()).map((b) => [b.x + b.width / 2, b.y + b.height / 2]);
      return { s: __record.view.s, map: map.toJSON(), lede: lede.toJSON(), tb: getComputedStyle(document.getElementById('tblock')).display, marks, vw: innerWidth, sw: document.documentElement.scrollWidth,
        chatt: [...document.querySelectorAll('.nm')].find((n) => n.textContent === 'Chattanooga')?.className };
    });
    ok(st.tb === 'none', `${tag} no permanent register`);
    ok(st.s > 0.1 && st.s < 4, `${tag} home scale sane`, st.s);
    ok(st.map.width >= st.vw - 60, `${tag} map spans the sheet`, `${st.map.width} of ${st.vw}`);
    ok(st.sw <= st.vw, `${tag} no horizontal scroll`);
    ok(st.marks.length >= 3 && st.marks.every(([x, y]) => x > st.map.x && x < st.map.right && y > st.lede.bottom - 4 && y < st.map.bottom), `${tag} every marker in view below the title`, JSON.stringify(st.marks));
    ok(st.chatt && !st.chatt.includes('off'), `${tag} Chattanooga labelled at home`, st.chatt);
    if (OUT) await p.screenshot({ path: `${OUT}/${bname}-${name}-home.png` });
    // Search: empty field lists all; query + Enter opens
    await p.click('#q'); await p.waitForTimeout(150);
    ok(await p.locator('#found li[data-k]').count() === 15, `${tag} empty find lists all 15 projects`);
    if (OUT && bname === 'chromium') await p.screenshot({ path: `${OUT}/${bname}-${name}-list.png` });
    await p.fill('#q', 'optim'); await p.keyboard.press('Enter'); await p.waitForTimeout(1300);
    ok(await p.evaluate(() => document.body.dataset.mode === 'record' && location.search === '?p=the-optimist'), `${tag} search opens The Optimist`);
    if (OUT) await p.screenshot({ path: `${OUT}/${bname}-${name}-record.png` });
    await p.goBack(); await p.waitForTimeout(1200);
    ok(await p.evaluate(() => document.body.dataset.mode === 'map'), `${tag} back returns to map`);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('tblock')).display === 'none'), `${tag} register stays hidden after record`);
    // Zoom
    const s0 = await p.evaluate(() => __record.view.s);
    await p.click('#zin'); await p.waitForTimeout(600); const s1 = await p.evaluate(() => __record.view.s);
    ok(s1 / s0 > 1.6, `${tag} + zooms in`, s1 / s0);
    await p.click('#zout'); await p.waitForTimeout(600); const s2 = await p.evaluate(() => __record.view.s);
    ok(Math.abs(s2 / s0 - 1) < .05, `${tag} − zooms out`, s2 / s0);
    await p.click('#zin'); await p.waitForTimeout(500); await p.click('#zfit'); await p.waitForTimeout(1000);
    ok(Math.abs(await p.evaluate(() => __record.view.s) / s0 - 1) < .05, `${tag} ALL returns home`);
    // Markers: a group zooms in to separate; a single site opens its project
    const g0 = await p.evaluate(() => __record.view.s);
    await p.locator('#marks .mk.grp').first().click(); await p.waitForTimeout(1100);
    ok(await p.evaluate(() => __record.view.s) > g0 * 1.2, `${tag} group marker zooms in`);
    await p.click('#zfit'); await p.waitForTimeout(1000);
    await p.locator('#marks .mk[data-slug="dalton-surgery-center"]').click(); await p.waitForTimeout(1300);
    ok(await p.evaluate(() => document.body.dataset.mode === 'record' && location.search.includes('dalton')), `${tag} single marker opens Dalton`);
    if (OUT) await p.screenshot({ path: `${OUT}/${bname}-${name}-marker.png` });
    ok(errs.length === 0, `${tag} no page errors`, errs.join(' | '));
    await ctx.close();
  }
  await b.close();
}
// Degenerate start: open at zero height, then grow — the view must refit, not stay at a pinpoint
{
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 60 } });
  await p.goto(BASE + '/map'); await p.waitForFunction(() => window.__record); await p.waitForTimeout(300);
  console.log('  squashed start: map h =', await p.evaluate(() => document.getElementById('map').getBoundingClientRect().height), 's =', await p.evaluate(() => __record.view.s));
  await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(800);
  const s = await p.evaluate(() => __record.view.s);
  ok(s > 0.1, 'late-sized map refits to home', s);
  await b.close();
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
