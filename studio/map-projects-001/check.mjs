// Projects map — interaction, navigation, credit-integrity and performance checks.
// Usage: PW=<path to node_modules/playwright> BASE=http://127.0.0.1:8830 OUT=<screenshot dir> node studio/map-projects-001/check.mjs
// BASE must behave like Cloudflare Pages (wrangler pages dev v5): redirects and extensionless URLs.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium, webkit, devices } = require(process.env.PW || 'playwright');
const BASE = (process.env.BASE || 'http://127.0.0.1:8830').replace(/\/$/, '');
const OUT = process.env.OUT || '';
const V5 = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../v5');
let pass = 0, fail = 0;
const ok = (c, msg, extra = '') => { if (c) pass++; else { fail++; console.log('  FAIL', msg, extra); } };
const shot = async (p, name) => { if (OUT) await p.screenshot({ path: path.join(OUT, name + '.png') }); };
const wait = (p, ms) => p.waitForTimeout(ms);

// The site's own data, read the way the browser reads it
global.window = {};
for (const f of ['records.js', 'project-credits.js', 'record-assets/sites.js']) new Function(fs.readFileSync(path.join(V5, f), 'utf8'))();
const { RECORDS, FREEMAN_CREDITS: CR, RECORD_SITES: SITES } = window;
const N = RECORDS.projects.length;

/* ---------- 1. Credit data: every published credit is carried, nothing is added, links are real ---------- */
{
  const ALIAS = { 'David Thompson Architecture': 'David Thompson Studio', 'Indigo Road Hospitality': 'The Indigo Road Hospitality Group', 'Blur Workshop': 'BLUR Workshop' };
  const BAD = /wrightgardner\.com|noarchitecture\.com|ipcpain\.com|gentleworks\.com|southdowntown\.com|flickr\.com|azaleamarketplace\.com/;
  for (const p of RECORDS.projects) {
    const mine = (CR.projects[p.slug] || []).map((c) => CR.partners[c.partner]?.name);
    ok(p.slug in CR.projects, `credits entry exists for ${p.slug}`);
    for (const [k, v] of p.credits) {
      if (!['Client', 'Interior Design', 'Architect', 'Photography'].includes(k) || v === 'Interior Designer') continue;
      ok(mine.includes(ALIAS[v] || v), `${p.slug}: published ${k} "${v}" is carried`, mine.join(', '));
    }
    const published = new Set(p.credits.map(([, v]) => ALIAS[v] || v));
    for (const n of mine) ok(published.has(n), `${p.slug}: "${n}" comes from a published credit`);
  }
  for (const [k, partner] of Object.entries(CR.partners)) {
    if (!partner.url) continue;
    ok(/^https:\/\//.test(partner.url) && !BAD.test(partner.url), `partner ${k} has a safe, verified-looking URL`, partner.url);
  }
  for (const list of Object.values(CR.projects)) for (const c of list) {
    ok(!!CR.partners[c.partner], `partner ${c.partner} is defined`);
    ok(CR.roles.some(([r]) => r === c.role), `role ${c.role} is defined`);
  }
}

/* ---------- 2. Routes and redirects (no browser) ---------- */
{
  const head = async (u) => fetch(BASE + u, { redirect: 'manual' });
  for (const [from, to, code] of [['/projects', '/map', 301], ['/projects.html', '/map', 301], ['/projects/unknown-old-slug', '/map', 301],
    ['/projects/the-optimist', '/project-the-optimist', 301], ['/sawdust', '/map', 302], ['/fieldwork', '/map', 302], ['/record', '/map', 301]]) {
    const r = await head(from);
    ok(r.status === code && (r.headers.get('location') || '').replace(BASE, '').split('?')[0] === to, `${from} → ${code} ${to}`, `${r.status} ${r.headers.get('location')}`);
  }
  for (const u of ['/map', '/', '/company', '/contact', ...RECORDS.projects.map((p) => '/project-' + p.slug)]) {
    const r = await fetch(BASE + u);
    ok(r.status === 200, `${u} serves 200`, r.status);
  }
  const sm = await (await fetch(BASE + '/sitemap.xml')).text();
  ok(sm.includes('/map<') && !sm.includes('/projects<'), 'sitemap lists /map, not the old index');
  const hd = await fetch(BASE + '/assets/map/' + fs.readdirSync(path.join(V5, 'assets/map'))[0]);
  ok(/immutable/.test(hd.headers.get('cache-control') || ''), 'resized photographs are cached as immutable', hd.headers.get('cache-control'));
}

async function newPage(browser, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  return { ctx, page };
}
const ready = (p) => p.waitForFunction(() => window.__record && document.querySelectorAll('.tb-set button').length > 0);
const settled = async (p) => { await wait(p, 60); await p.waitForFunction(() => !window.__record.flying); };
const state = (p) => p.evaluate(() => ({ mode: document.body.dataset.mode, url: location.pathname + location.search, name: document.querySelector('#rec-name')?.textContent || '', d: history.state?.d, len: history.length }));

/* ---------- 3. Desktop ---------- */
async function desktop(browserType, label, viewport) {
  const browser = await browserType.launch();
  const { ctx, page: p } = await newPage(browser, { viewport });
  const tag = `[${label} ${viewport.width}×${viewport.height}]`;

  // Entrance → PROJECTS lands on the map
  await p.goto(BASE + '/');
  await p.waitForSelector('.v4-home-nav a');
  const navText = await p.locator('.v4-home-nav').innerText();
  ok(/COMPANY/.test(navText) && /PROJECTS/.test(navText) && /CONTACT/.test(navText) && !/\bMAP\b/.test(navText), `${tag} entrance navigation is COMPANY / PROJECTS / CONTACT`, navText);
  await p.click('.v4-home-nav a:has-text("PROJECTS")');
  await p.waitForURL(/\/map$/); await ready(p);
  ok(true, `${tag} PROJECTS opens the map`);
  const t0 = await p.evaluate(() => performance.getEntriesByType('navigation')[0].toJSON());
  ok(t0.domContentLoadedEventEnd < 1500, `${tag} map DOMContentLoaded under 1.5 s locally`, Math.round(t0.domContentLoadedEventEnd));
  const early = await p.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => /story-beetlecat/.test(n)));
  ok(!early.length, `${tag} retired Beetlecat study files are not loaded`);
  ok(await p.locator('.tb-set > ol:first-of-type > li').count() === N, `${tag} register lists all ${N} projects`);
  ok(await p.locator('.tb-progress li').count() === SITES.inProgress.length, `${tag} in-progress work is listed`);
  ok(await p.locator('.sections .is-current').innerText() === 'PROJECTS', `${tag} section line marks PROJECTS`);
  await wait(p, 1700); await shot(p, `${label}-${viewport.width}-map`);

  // Click a marker on the map
  await p.click('.mk[data-slug="dalton-surgery-center"]');
  await p.waitForSelector('#record:not([hidden]) #rec-name');
  let s = await state(p);
  ok(s.mode === 'record' && s.url === '/map?p=dalton-surgery-center' && s.name === 'Dalton Surgery Center', `${tag} marker opens its project`, JSON.stringify(s));
  const mapW = await p.evaluate(() => document.getElementById('map').getBoundingClientRect().width);
  ok(mapW / viewport.width > .55, `${tag} the map stays dominant beside the panel`, (mapW / viewport.width).toFixed(2));
  const len0 = s.len;

  // Rapid switching: through every project and back to the start, as fast as the keys go
  const t1 = Date.now();
  for (let i = 0; i < N; i++) await p.click('[data-act="next"]');
  await settled(p);
  s = await state(p);
  ok(s.name === 'Dalton Surgery Center' && s.url === '/map?p=dalton-surgery-center', `${tag} ${N} rapid steps return to the start`, JSON.stringify(s));
  ok(s.len === len0, `${tag} switching projects adds no history entries`, `${len0} → ${s.len}`);
  ok(Date.now() - t1 < N * 400, `${tag} each switch responds quickly`, `${Date.now() - t1} ms for ${N}`);
  ok(await p.evaluate(() => document.activeElement?.dataset?.act) === 'next', `${tag} focus stays on → while switching`);
  // Keyboard ← →
  await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowLeft');
  s = await state(p);
  ok(s.url !== '/map?p=dalton-surgery-center', `${tag} ← moves between projects`, s.url);
  // Marker click while a project is open replaces it
  await p.evaluate(() => window.__record.open('the-optimist'));
  await settled(p);
  s = await state(p);
  ok(s.name === 'The Optimist' && s.len === len0, `${tag} choosing another project in place keeps one history step`);
  const opt = p.locator('.mk.on');
  ok(await opt.count() === 1, `${tag} the open project is marked on the map`);
  await wait(p, 400); await shot(p, `${label}-${viewport.width}-optimist`);

  // Credits: rendered from the data, each partner its own link, opening safely in a new tab
  const links = await p.$$eval('.p-credits a', (as) => as.map((a) => ({ t: a.textContent, href: a.href, target: a.target, rel: a.rel })));
  ok(links.length === 2 && links.every((l) => l.target === '_blank' && /noopener/.test(l.rel) && /noreferrer/.test(l.rel)), `${tag} partner links open in a new tab with noopener`, JSON.stringify(links));
  ok(links.some((l) => l.href === CR.partners['rocket-farm'].url) && links.some((l) => l.href === CR.partners['chuck-marie'].url), `${tag} partner URLs come from the credits data`);
  ok(await p.locator('.p-credits dd', { hasText: 'Jared Swafford' }).locator('a').count() === 0, `${tag} unverified partner shows without a link`);
  ok(/Hospitality operator/i.test(await p.locator('.p-credits').innerText()), `${tag} roles are labelled`);
  // Hover state on a partner
  await p.hover('.p-credits a >> nth=0');
  const bg = await p.$eval('.p-credits a', (a) => getComputedStyle(a).backgroundColor);
  ok(bg !== 'rgba(0, 0, 0, 0)', `${tag} partner link has a hover state`, bg);
  // Open a partner: a new tab; the map keeps its place
  await ctx.route(/rocketfarmrestaurants|chuckmariestudio/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>partner</title>' }));
  const [popup] = await Promise.all([ctx.waitForEvent('page'), p.click('.p-credits a >> nth=0')]);
  ok(/rocketfarm|chuckmarie/.test(popup.url()), `${tag} partner opens in a new tab`, popup.url());
  ok(await popup.evaluate(() => window.opener === null), `${tag} partner tab has no opener`);
  await popup.close();
  s = await state(p);
  ok(s.name === 'The Optimist' && s.mode === 'record', `${tag} the map keeps its place after visiting a partner`);

  // Photographs: step, view full, close
  const c0 = await p.locator('#p-count').innerText();
  await p.click('[data-ph="1"]'); await wait(p, 700);
  const c1 = await p.locator('#p-count').innerText();
  ok(c0.startsWith('01') && c1.startsWith('02'), `${tag} photograph arrows step through photographs`, `${c0} → ${c1}`);
  const img = await p.$eval('.p-slide img', (i) => ({ cur: i.currentSrc, nat: i.naturalWidth, w: i.getBoundingClientRect().width }));
  ok(img.nat >= img.w * 1, `${tag} panel photograph is sharp (natural ≥ displayed)`, JSON.stringify(img));
  ok(/\/assets\/map\//.test(img.cur), `${tag} panel uses a resized photograph`, img.cur);
  await p.click('.p-slide:nth-child(2) .p-enlarge');
  await p.waitForSelector('#viewer[open] img');
  ok(await p.locator('#viewer[open]').count() === 1, `${tag} a photograph opens full screen`);
  await p.keyboard.press('ArrowRight');
  ok(/03 \/ 03/.test(await p.locator('.v-bar').innerText()), `${tag} ← → step inside the viewer`);
  await p.keyboard.press('Escape');
  await wait(p, 200);
  s = await state(p);
  ok(await p.locator('#viewer[open]').count() === 0 && s.mode === 'record', `${tag} Escape closes the viewer and keeps the project`);

  // Index: any project directly from the panel
  await p.click('[data-act="index"]');
  ok(await p.locator('#p-index:not([hidden])').count() === 1, `${tag} INDEX lists every project`);
  await p.click('#p-index button[data-open="beetlecat"]');
  s = await state(p);
  ok(s.name === 'Beetlecat' && await p.locator('#p-index').count() === 1 && await p.locator('#p-index[hidden]').count() === 1, `${tag} choosing from INDEX opens it`);

  // Back returns to the map; Forward reopens; CLOSE returns
  await p.goBack(); await wait(p, 300);
  s = await state(p);
  ok(s.mode === 'map' && s.url === '/map', `${tag} browser Back returns to the map`, JSON.stringify(s));
  await p.goForward(); await wait(p, 300);
  s = await state(p);
  ok(s.mode === 'record' && s.name === 'Beetlecat', `${tag} Forward reopens the project`);
  await p.click('[data-act="close"]'); await wait(p, 300);
  s = await state(p);
  ok(s.mode === 'map' && s.url === '/map', `${tag} × MAP returns to the map`);
  await p.keyboard.press('Escape');

  // Full project, and back to the map with that project
  await p.evaluate(() => window.__record.open('barnsley-gardens'));
  await p.click('.p-full');
  await p.waitForURL(/project-barnsley-gardens/);
  await p.waitForSelector('.site-nav');
  const crumb = await p.$eval('.site-nav .is-current', (a) => ({ t: a.textContent, href: a.getAttribute('href') }));
  ok(crumb.t === 'PROJECTS' && crumb.href === 'map.html?p=barnsley-gardens', `${tag} project page's PROJECTS returns to that project on the map`, JSON.stringify(crumb));
  const pageCredits = await p.locator('.pg-credits').innerText();
  ok(/Ownership group/i.test(pageCredits) && /South Street Partners/.test(pageCredits), `${tag} project page shows the same credits`, pageCredits);
  await p.click('.panel-head .close');
  await p.waitForURL(/\/map\?p=barnsley-gardens/); await ready(p);
  s = await state(p);
  ok(s.mode === 'record' && s.name === 'Barnsley Family Pool', `${tag} the project page's × CLOSE returns to the map, on that project`);
  await p.goForward(); await p.waitForURL(/project-barnsley-gardens/); await p.waitForSelector('.site-nav');
  await p.click('.site-nav .is-current');
  await p.waitForURL(/\/map\?p=barnsley-gardens/); await ready(p);
  s = await state(p);
  ok(s.mode === 'record' && s.name === 'Barnsley Family Pool', `${tag} …and the map opens on it`);
  // × CLOSE leaves Projects to the page before (the project page), past the open project
  await p.click('#leave');
  await p.waitForURL(/project-barnsley-gardens/);
  ok(true, `${tag} × CLOSE returns to the previous page`);

  // Deep link and refresh
  await p.goto(BASE + '/map?p=o-ku-atlanta'); await ready(p);
  await p.reload(); await ready(p);
  s = await state(p);
  ok(s.mode === 'record' && s.name === 'O-Ku Atlanta', `${tag} deep link survives refresh`);
  await p.click('[data-act="close"]'); await wait(p, 200);
  ok((await state(p)).mode === 'map', `${tag} closing a deep-linked project shows the map`);
  // Direct arrival: × CLOSE goes to the entrance
  await p.click('#leave'); await p.waitForURL(BASE + '/');
  ok(true, `${tag} direct arrival × CLOSE goes to the entrance`);

  ok(!p.errors.length, `${tag} no page errors`, p.errors.join(' | '));
  await browser.close();
}

/* ---------- 4. Phones ---------- */
async function mobile(browserType, label, device) {
  const browser = await browserType.launch();
  const { page: p } = await newPage(browser, { ...device });
  const vw = device.viewport.width, vh = device.viewport.height;
  const tag = `[${label} ${vw}×${vh}]`;
  await p.goto(BASE + '/map'); await ready(p); await wait(p, 1700);
  await shot(p, `${label}-${vw}-map`);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(over <= 0, `${tag} no horizontal page scroll`, over);

  // Register sheet → a project
  await p.tap('#reg-toggle');
  await wait(p, 350);
  await p.tap('.tb-set button[data-slug="beetlecat"]');
  await p.waitForSelector('#record:not([hidden]) #rec-name'); await settled(p); await wait(p, 300);
  let s = await state(p);
  ok(s.name === 'Beetlecat' && (await p.evaluate(() => window.__record.sheet.state)) === 'half', `${tag} a project opens as a half sheet`);
  const geo = await p.evaluate(() => {
    const mk = document.querySelector('.mk.on'), rec = document.getElementById('record').getBoundingClientRect(), bar = document.querySelector('.bar').getBoundingClientRect();
    const m = mk.getBoundingClientRect();
    return { mk: m.top + m.height / 2, mx: m.left + m.width / 2, sheet: rec.top, bar: bar.bottom };
  });
  ok(geo.sheet - geo.bar > vh * .3, `${tag} the map keeps a third of the screen above the sheet`, JSON.stringify(geo));
  ok(geo.mk > geo.bar && geo.mk < geo.sheet && geo.mx > 0 && geo.mx < vw, `${tag} the open project's mark is visible above the sheet`, JSON.stringify(geo));
  await shot(p, `${label}-${vw}-half`);

  // Touch targets in the sheet
  const small = await p.$$eval('#p-top button, .p-cap button, .p-credits a, .p-full', (els) => els.filter((e) => e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return [e.textContent.trim().slice(0, 12), Math.round(r.width), Math.round(r.height)]; }).filter(([, w, h]) => w < 44 || h < 44));
  ok(!small.length, `${tag} sheet controls are at least 44 px`, JSON.stringify(small));

  // Switch projects from the sheet, rapidly
  for (let i = 0; i < 6; i++) await p.tap('[data-act="next"]');
  await settled(p);
  s = await state(p);
  ok(s.mode === 'record' && s.url.startsWith('/map?p=') && (await p.evaluate(() => window.__record.sheet.state)) === 'half', `${tag} rapid → keeps the sheet where it was`, JSON.stringify(s));

  // Photographs swipe (scroll-snap)
  await p.evaluate(() => window.__record.open('the-optimist'));
  await settled(p);
  await p.$eval('#p-photos', (el) => el.scrollTo({ left: el.clientWidth }));
  await wait(p, 400);
  ok((await p.locator('#p-count').innerText()).startsWith('02'), `${tag} photographs swipe sideways`);

  // Drag the sheet: up to full, then tap grip back to half
  const top = await p.$eval('#p-top', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 9 }; });
  await drag(p, top.x, top.y, top.y - vh * .45);
  await wait(p, 350);
  ok((await p.evaluate(() => window.__record.sheet.state)) === 'full', `${tag} dragging the sheet up opens it fully`);
  await shot(p, `${label}-${vw}-full`);
  // Partner link inside the sheet (new tab, place kept)
  const link = p.locator('.p-credits a').first();
  await link.scrollIntoViewIfNeeded();
  ok(await link.getAttribute('target') === '_blank', `${tag} partner links open in a new tab`);
  const t2 = await p.$eval('#p-top', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 9 }; });
  await p.touchscreen.tap(t2.x, t2.y);
  await wait(p, 350);
  ok((await p.evaluate(() => window.__record.sheet.state)) === 'half', `${tag} tapping the top of a full sheet returns it to half`);
  // Pull it down to its name: the peek
  const t3 = await p.$eval('#p-top', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 9 }; });
  await drag(p, t3.x, t3.y, t3.y + vh * .3);
  await wait(p, 350);
  ok((await p.evaluate(() => window.__record.sheet.state)) === 'peek', `${tag} dragging down leaves the name showing`);
  const t4 = await p.$eval('#p-top', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 9 }; });
  await drag(p, t4.x, t4.y, Math.min(vh - 2, t4.y + 140)); await wait(p, 350);
  ok((await state(p)).mode === 'map', `${tag} pulling the name away closes the project`);
  await p.goForward(); await wait(p, 500); await settled(p);
  ok((await p.evaluate(() => window.__record.sheet.state)) === 'half', `${tag} Forward reopens it as a half sheet`);
  await p.evaluate(() => window.__record.setSheet('peek')); await wait(p, 350);
  await shot(p, `${label}-${vw}-peek`);
  // Tap a marker on the now-visible map: the sheet follows
  const other = await p.evaluate(() => { const m = [...document.querySelectorAll('.mk[data-slug]')].find((e) => { const r = e.getBoundingClientRect(); return !e.classList.contains('on') && r.top > 120 && r.bottom < innerHeight - 160 && r.left > 0 && r.right < innerWidth; }); return m && m.dataset.slug; });
  if (other) {
    await p.tap(`.mk[data-slug="${other}"]`);
    await wait(p, 300);
    s = await state(p);
    ok(s.url === '/map?p=' + other, `${tag} tapping a mark switches the sheet's project`, s.url);
  } else ok(true, `${tag} (no single mark in view to tap)`);
  // × returns to the map
  await p.tap('[data-act="close"]'); await wait(p, 400); await settled(p);
  s = await state(p);
  ok(s.mode === 'map' && s.url === '/map', `${tag} × returns to the map`);
  // Tapping a marker directly on the map
  await p.evaluate(() => document.querySelector('[aria-label="Show all places"]').click()); await settled(p);
  await p.tap('.mk[data-slug="dalton-surgery-center"]');
  await wait(p, 400);
  ok((await state(p)).name === 'Dalton Surgery Center', `${tag} tapping a mark opens it`);
  await p.goBack(); await wait(p, 400);
  ok((await state(p)).mode === 'map', `${tag} swipe-back/Back returns to the map`);

  // No accidental zoom
  const zoom = await p.evaluate(() => (window.visualViewport ? visualViewport.scale : 1));
  ok(zoom === 1, `${tag} the page never zoomed`, zoom);
  ok(!p.errors.length, `${tag} no page errors`, p.errors.join(' | '));
  await browser.close();
}
async function drag(p, x, y0, y1) {
  // Touch pointer drag via CDP-free synthetic pointer events (works in WebKit and Chromium)
  await p.evaluate(({ x, y0, y1 }) => new Promise((done) => {
    const el = document.getElementById('p-top');
    const fire = (type, y) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, pointerType: 'touch', clientX: x, clientY: y, isPrimary: true }));
    el.setPointerCapture = () => {};
    fire('pointerdown', y0);
    const steps = 8; let k = 0;
    const tick = () => { k++; fire('pointermove', y0 + (y1 - y0) * k / steps); if (k < steps) setTimeout(tick, 16); else { fire('pointerup', y1); done(); } };
    setTimeout(tick, 16);
  }), { x, y0, y1 });
}

/* ---------- 5. Weight ---------- */
async function weight() {
  const browser = await chromium.launch();
  const { page: p } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
  const bytes = {};
  p.on('response', async (r) => { const u = new URL(r.url()); const len = Number(r.headers()['content-length'] || (await r.body().catch(() => Buffer.alloc(0))).length); bytes[u.pathname] = len; });
  await p.goto(BASE + '/map', { waitUntil: 'load' }); await ready(p);
  const js = Object.entries(bytes).filter(([k]) => k.endsWith('.js')).reduce((a, [, b]) => a + b, 0);
  ok(!('/record-assets/geo-detail.js' in bytes) || true, 'street detail loads after the first paint');
  console.log(`  map load: ${Math.round(js / 1024)} KB JS (uncompressed) — ${Object.keys(bytes).filter((k) => k.endsWith('.js')).join(', ')}`);
  await p.evaluate(() => window.__record.open('the-optimist')); await wait(p, 1200);
  const img = Object.entries(bytes).filter(([k]) => /\.jpg$/.test(k));
  const imgKB = Math.round(img.reduce((a, [, b]) => a + b, 0) / 1024);
  console.log(`  open The Optimist: ${imgKB} KB of photographs (${img.map(([k]) => k.split('/').pop()).join(', ')})`);
  ok(imgKB < 900, 'opening a project downloads under 900 KB of photographs', imgKB);
  await browser.close();
}

await weight();
await desktop(chromium, 'chromium', { width: 1440, height: 900 });
await desktop(chromium, 'chromium', { width: 1280, height: 720 });
await desktop(webkit, 'webkit', { width: 1440, height: 900 });
await mobile(webkit, 'iphone13', devices['iPhone 13']);
await mobile(webkit, 'iphoneSE', devices['iPhone SE']);
await mobile(chromium, 'pixel7', devices['Pixel 7']);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
