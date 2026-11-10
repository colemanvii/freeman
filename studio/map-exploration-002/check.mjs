// Map Exploration 002 — checks for the regional opening, the scale tiers and the hand-off to North Georgia.
// Usage: PW=<path to node_modules/playwright> BASE=http://127.0.0.1:8875 OUT=<screenshot dir> node studio/map-exploration-002/check.mjs
// Run studio/map-projects-001/check.mjs as well: everything the approved map did, it must still do.
import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.env.PW || 'playwright');
const BASE = (process.env.BASE || 'http://127.0.0.1:8875').replace(/\/$/, '');
const OUT = process.env.OUT || '';
let pass = 0, fail = 0;
const ok = (c, msg, extra = '') => { if (c) pass++; else { fail++; console.log('  FAIL', msg, extra); } };
const VIEWS = [['desktop', 1440, 900], ['laptop', 1280, 760], ['tablet', 820, 1180], ['tablet-wide', 1180, 820], ['phone', 390, 844], ['small phone', 360, 740]];
// Points that must be on screen at the opening: Georgia and its neighbours (an interior point of each state)
const MUST = { desktop: { Georgia: [-83.4, 32.7], Tennessee: [-86.5, 35.8], Alabama: [-86.8, 32.8], Mississippi: [-89.7, 32.7], 'South Carolina': [-80.9, 33.9], 'North Carolina': [-79.4, 35.6], Florida: [-83.8, 30.4] },
  phone: { Georgia: [-83.4, 32.7], Tennessee: [-86.5, 35.8], Alabama: [-86.8, 32.8], 'South Carolina': [-80.9, 33.9], 'North Carolina': [-80.5, 35.6] } };

for (const [engine, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch();
  for (const [name, w, h] of VIEWS) {
    const tag = `[${engine} ${name} ${w}×${h}]`, mobile = w < 760;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile && engine === 'chromium', hasTouch: mobile });
    const p = await ctx.newPage();
    const errs = [];
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    p.on('pageerror', (e) => errs.push(String(e)));
    p.on('response', (r) => r.status() >= 400 && errs.push(r.status() + ' ' + r.url()));
    await p.goto(BASE + '/map', { waitUntil: 'load' });
    await p.waitForTimeout(900);

    // Opening framing
    const o = await p.evaluate((must) => {
      const R = window.__record, m = document.getElementById('map').getBoundingClientRect();
      const on = {}; for (const [k, [lon, lat]] of Object.entries(must)) { const [x, y] = R.project(lon, lat); const sx = x * R.view.s + R.view.tx, sy = y * R.view.s + R.view.ty; on[k] = sx > 8 && sx < m.width - 8 && sy > 8 && sy < m.height - 8; }
      const marks = [...document.querySelectorAll('.marklayer .mk')].map((b) => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2 - m.left, y: r.top + r.height / 2 - m.top }; });
      const doc = document.documentElement, lede = document.getElementById('lede').getBoundingClientRect();
      const below = marks.every((k) => k.y + m.top > lede.bottom - 4);
      const chatt = [...document.querySelectorAll('.nm')].filter((n) => n.textContent === 'Chattanooga').some((n) => !n.classList.contains('off'));
      return { s: R.view.s, far: document.getElementById('map').classList.contains('far'), on, clusters: R.clusters.length, inClusters: R.clusters.reduce((a, c) => a + c.items.length, 0),
        placed: R.items.filter((i) => i.placed).length, marksIn: marks.every((k) => k.x > 0 && k.y > 0 && k.x < m.width && k.y < m.height),
        scroll: [doc.scrollHeight - innerHeight, doc.scrollWidth - innerWidth], below, chatt,
        register: getComputedStyle(document.getElementById('tblock')).display,
        names: [...document.querySelectorAll('.nm:not(.off)')].map((n) => n.textContent), states: [...document.querySelectorAll('.nm.state:not(.off)')].length,
        cut: [...document.querySelectorAll('.nm:not(.off)')].filter((n) => { const r = n.getBoundingClientRect(); return r.left < m.left || r.right > m.right; }).map((n) => n.textContent) };
    }, w / h < 1 ? MUST.phone : MUST.desktop);
    ok(o.far, `${tag} opens at the regional scale`, o.s.toFixed(3));
    ok(Object.values(o.on).every(Boolean), `${tag} Georgia and its neighbours are in the opening view`, JSON.stringify(o.on));
    ok(o.inClusters === o.placed && o.placed === 14, `${tag} every placed project is on the map at the opening`, `${o.inClusters}/${o.placed}`);
    ok(o.clusters >= 2 && o.clusters <= 5, `${tag} the work reads as a few concentrations, not a scatter`, o.clusters);
    ok(o.marksIn, `${tag} every mark is inside the map at the opening`);
    ok(o.below, `${tag} every mark sits below the title block (8c057c9)`);
    ok(o.chatt, `${tag} Chattanooga, the Tennessee line, is named at the opening (8c057c9)`);
    ok(o.register === 'none', `${tag} no permanent register on the map (8c057c9)`);
    ok(o.scroll[0] <= 0 && o.scroll[1] <= 0, `${tag} the page itself does not scroll`, JSON.stringify(o.scroll));
    ok(o.states >= 3, `${tag} state names are shown at the opening`, o.states);
    ok(o.names.includes('NASHVILLE') || o.names.includes('BIRMINGHAM') || o.names.includes('Nashville') || o.names.includes('Birmingham'), `${tag} neighbouring cities are named`, o.names.join(','));
    ok(!o.cut.length, `${tag} no name is cut by the edge of the map`, o.cut.join(','));
    if (OUT) await p.screenshot({ path: path.join(OUT, `${engine}-${name.replace(' ', '-')}-open.png`) });

    // The view never leaves the sheet: pan hard in every direction, zoom out past the minimum
    const cover = await p.evaluate(async () => {
      const R = window.__record, m = document.getElementById('map').getBoundingClientRect(), G = window.RECORD_REGION.box, out = [];
      for (const [dx, dy] of [[1e6, 0], [-1e6, 0], [0, 1e6], [0, -1e6]]) {
        await R.flyTo({ s: R.view.s / 5, tx: R.view.tx + dx, ty: R.view.ty + dy }, 0);
        const x0 = -R.view.tx / R.view.s, y0 = -R.view.ty / R.view.s, x1 = (m.width - R.view.tx) / R.view.s, y1 = (m.height - R.view.ty) / R.view.s;
        out.push(x0 >= G.x0 - 1 && y0 >= G.y0 - 1 && x1 <= G.x1 + 1 && y1 <= G.y1 + 1);
      }
      await R.flyTo(R.home(), 0);
      return out;
    });
    ok(cover.every(Boolean), `${tag} the drawing always covers the map, however far it is moved`, JSON.stringify(cover));

    // Discovery: choose the largest concentration; it comes down to the place, then separates
    const c1 = await p.evaluate(() => { const c = window.__record.clusters.slice().sort((a, b) => b.items.length - a.items.length)[0]; return { n: c.items.length, slug: c.items.map((i) => i.slug).sort().join() }; });
    await p.click('.marklayer .mk.grp >> nth=0', { force: true }).catch(() => {});
    const big = await p.evaluate(() => [...document.querySelectorAll('.marklayer .mk.grp')].sort((a, b) => +b.textContent - +a.textContent)[0]?.getBoundingClientRect());
    await p.evaluate(() => window.__record.flyTo(window.__record.home(), 0));
    await p.waitForTimeout(100);
    const target = await p.evaluate(() => { const b = [...document.querySelectorAll('.marklayer .mk.grp')].sort((a, c) => +c.textContent - +a.textContent)[0]; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await p.mouse.click(target[0], target[1]);
    await p.waitForFunction(() => !window.__record.flying, null, { timeout: 4000 });
    const c2 = await p.evaluate(() => ({ s: window.__record.view.s, far: document.getElementById('map').classList.contains('far'), n: window.__record.clusters.length, mode: document.body.dataset.mode }));
    ok(c2.mode === 'map' && !c2.far && c2.s <= 3.21 && c2.s > .32, `${tag} a regional group comes down to its place (not straight to the street)`, JSON.stringify(c2));
    ok(c2.n > o.clusters, `${tag} the group separates as the view comes in`, `${o.clusters} → ${c2.n}`);

    // North Georgia's own drawing has taken over inside its frame; the region's layers have not been lost outside it
    const layers = await p.evaluate(() => {
      const vis = (sel) => { const e = document.querySelector(sel); return e && getComputedStyle(e).visibility !== 'hidden' && e.closest('g.region')?.style.display !== 'none'; };
      return { detailRivers: vis('.detail [data-layer="rivers"]'), regionStates: !!document.querySelector('[data-layer="r-states"]')?.getAttribute('d'), regionCounties: document.querySelectorAll('[data-layer="r-counties"] path').length > 50 };
    });
    ok(layers.detailRivers, `${tag} North Georgia's own rivers and roads show at working scale`);
    ok(layers.regionStates && layers.regionCounties, `${tag} region lines and county lines (after first paint) are loaded`, JSON.stringify(layers));

    // ALL returns the approved North Georgia framing
    await p.click('#zfit');
    await p.waitForFunction(() => !window.__record.flying, null, { timeout: 4000 });
    const all = await p.evaluate(() => { const R = window.__record, a = R.allPlaces(); return { d: Math.abs(Math.log(R.view.s / a.s)), far: document.getElementById('map').classList.contains('far') }; });
    ok(all.d < .01 && !all.far, `${tag} ALL shows every place, as the approved map opens`, JSON.stringify(all));

    // Search reaches beyond Georgia
    if (!mobile || engine === 'chromium') {
      await p.fill('#q', 'Nashville');
      await p.waitForTimeout(150);
      const hit = await p.evaluate(() => [...document.querySelectorAll('#found li')].map((l) => l.textContent));
      ok(hit.some((t) => t.includes('Nashville')), `${tag} Find knows the region's cities`, hit.join('|'));
      await p.press('#q', 'Enter');
      await p.waitForFunction(() => !window.__record.flying, null, { timeout: 4000 });
      const at = await p.evaluate(() => { const R = window.__record, [lon, lat] = R.unproject((document.getElementById('map').clientWidth / 2 - R.view.tx) / R.view.s, (document.getElementById('map').clientHeight / 2 - R.view.ty) / R.view.s); return [lon, lat]; });
      ok(Math.abs(at[0] + 86.78) < .05 && Math.abs(at[1] - 36.17) < .05, `${tag} choosing Nashville flies there`, at.map((v) => v.toFixed(3)).join(','));
    }

    // Opening a project from the region and returning
    await p.evaluate(() => window.__record.flyTo(window.__record.home(), 0));
    await p.evaluate(() => window.__record.open('beetlecat'));
    await p.waitForTimeout(150);
    await p.waitForFunction(() => !window.__record.flying, null, { timeout: 4000 });
    const rec = await p.evaluate(() => ({ mode: document.body.dataset.mode, name: document.getElementById('rec-name')?.textContent, s: window.__record.view.s, url: location.search }));
    ok(rec.mode === 'record' && rec.name === 'Beetlecat' && rec.s >= 5.5 && rec.url === '?p=beetlecat', `${tag} a project opens from the region at its site`, JSON.stringify(rec));
    if (OUT) await p.screenshot({ path: path.join(OUT, `${engine}-${name.replace(' ', '-')}-record.png`) });
    await p.evaluate(() => window.__record.close());
    await p.waitForTimeout(250);
    await p.waitForFunction(() => !window.__record.flying, null, { timeout: 4000 });
    const back = await p.evaluate(() => ({ mode: document.body.dataset.mode, far: document.getElementById('map').classList.contains('far') }));
    ok(back.mode === 'map' && back.far, `${tag} closing the project returns to the region`, JSON.stringify(back));

    // Smoothness: frame intervals during a flight from the region into North Georgia and a wheel zoom
    const frames = await p.evaluate(async () => {
      const R = window.__record, t = [];
      let run = true; const tick = (now) => { t.push(now); if (run) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
      await R.flyTo(R.allPlaces(), 900); await R.flyTo(R.home(), 900);
      const m = document.getElementById('map'), r = m.getBoundingClientRect();
      for (let i = 0; i < 40; i++) { m.dispatchEvent(new WheelEvent('wheel', { deltaY: -40, clientX: r.left + r.width * .45, clientY: r.top + r.height * .55, bubbles: true, cancelable: true })); await new Promise((f) => requestAnimationFrame(f)); }
      run = false;
      const d = t.slice(1).map((v, i) => v - t[i]).sort((a, b) => a - b);
      return { n: d.length, p50: d[Math.floor(d.length * .5)], p95: d[Math.floor(d.length * .95)], max: d[d.length - 1] };
    });
    ok(frames.p95 < 40, `${tag} flights and wheel zoom keep pace (p95 frame)`, JSON.stringify(frames));
    if (name === 'desktop' || name === 'phone') console.log(`  ${tag} frames`, JSON.stringify(frames));

    ok(!errs.length, `${tag} no console errors or failed requests`, errs.join(' | '));
    await ctx.close();
  }
  await browser.close();
}
// Degenerate start (8c057c9's blank-map fix): open at almost no height, then grow — the view refits to the region
{
  const browser = await chromium.launch(); const p = await browser.newPage({ viewport: { width: 1280, height: 60 } });
  await p.goto(BASE + '/map'); await p.waitForFunction(() => window.__record); await p.waitForTimeout(300);
  await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(800);
  const r = await p.evaluate(() => { const R = window.__record, h = R.home(); return { s: R.view.s, home: h.s, far: document.getElementById('map').classList.contains('far') }; });
  ok(Math.abs(Math.log(r.s / r.home)) < .02 && r.far, 'a late-sized map refits to the region, not a pinpoint', JSON.stringify(r));
  await browser.close();
}
// Geography: the reprojection agrees with its inverse, and projects sit where their coordinates say
{
  const browser = await chromium.launch(); const p = await browser.newPage();
  await p.goto(BASE + '/map', { waitUntil: 'load' });
  const g = await p.evaluate(() => {
    const R = window.__record, G = window.RECORD_GEO, RG = window.RECORD_REGION;
    let worst = 0; for (const [lon, lat] of [[-97, 25], [-71, 41], [-84.6, 34.15], [-90, 30], [-75.5, 35.2]]) { const [a, b] = R.unproject(...R.project(lon, lat)); worst = Math.max(worst, Math.abs(a - lon), Math.abs(b - lat)); }
    const atlL = G.places.find((p) => p[0] === 'Atlanta'), atlR = RG.places.find((p) => p[0] === 'Atlanta');
    const [ax, ay] = R.project(-84.388, 33.749);
    const opt = R.items.find((i) => i.slug === 'the-optimist');
    const [ox, oy] = R.project(opt.site.lon, opt.site.lat);
    return { worst, local: Math.hypot(atlL[1] - ax, atlL[2] - ay), region: Math.hypot(atlR[1] - ax, atlR[2] - ay), site: Math.hypot(opt.x - ox, opt.y - oy) };
  });
  ok(g.worst < 1e-9, 'projection and its inverse agree across the region', g.worst);
  ok(g.local < 25 && g.region < 120, 'Atlanta from OpenStreetMap and from Natural Earth (a generalised city point) both sit on Atlanta (units of 111 m)', JSON.stringify(g));
  ok(g.site < 1e-6, 'project marks use the verified coordinates as given', g.site);
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
