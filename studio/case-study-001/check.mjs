// Case Study 001 — behaviour, image, metadata and regression checks.
// Usage: PW=<path to node_modules/playwright> BASE=http://127.0.0.1:8921 node studio/case-study-001/check.mjs [slug ...]
// LIVE=1 skips nothing but tolerates a deployed host (no local-only assumptions).
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium, webkit, devices } = require(process.env.PW || 'playwright');
const BASE = (process.env.BASE || 'http://127.0.0.1:8921').replace(/\/$/, '');
let pass = 0, fail = 0;
const STUDIES = {
  'beetlecat': { name: 'Beetlecat', plates: 4, record: [/299 N Highland/, /Freeman General Contracting/, /Rocket Farm/, /Jared Swafford/], next: 'project-the-optimist.html', nextSel: '.pg' },
  'muchacho-decatur': { name: 'Muchacho Decatur', plates: 6, record: [/129 Church St/, /Freeman General Contracting/, /Electric Hospitality/, /BLUR Workshop/], next: 'project-brewhouse-cafe.html', nextSel: '.viewport' },
};
const WANT = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(STUDIES);
const ok = (c, msg, extra = '') => { if (c) pass++; else { fail++; console.log('  FAIL', msg, extra); } };
const SIZES = [
  ['1600x900@2x', { viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 }],
  ['1440x900', { viewport: { width: 1440, height: 900 } }],
  ['1280x720', { viewport: { width: 1280, height: 720 } }],
  ['1024x768', { viewport: { width: 1024, height: 768 } }],
  ['iPhone 13', devices['iPhone 13']], ['iPhone SE', devices['iPhone SE']], ['Pixel 5', devices['Pixel 5']],
];
for (const [ename, engine] of [['chromium', chromium], ['webkit', webkit]].filter(([n]) => !process.env.ENGINE || process.env.ENGINE === n)) {
  const browser = await engine.launch();
  for (const SLUG of WANT) for (const [name, opts] of SIZES) {
    const ST = STUDIES[SLUG];
    if (ename === 'webkit' && name === 'Pixel 5') continue;
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) continue;
    const tag = `[${ename} ${SLUG} ${name}]`;
    const ctx = await browser.newContext(opts); const p = await ctx.newPage();
    const errs = []; let bytes = 0;
    p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    p.on('response', async (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
    await p.goto(BASE + '/project-' + SLUG, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    const o = await p.evaluate(async (SLUG) => {
      const vp = document.querySelector('.viewport');
      // Read down the sheet a window at a time, as a visitor would, so lazy photographs load in every engine.
      for (let y = 0; y < vp.scrollHeight; y += vp.clientHeight * 0.8) { vp.scrollTop = y; await new Promise((r) => setTimeout(r, 350)); }
      await new Promise((r) => setTimeout(r, 600)); vp.scrollTop = 0;
      const imgs = [...document.querySelectorAll('.cs-plate img')];
      await Promise.all(imgs.map((i) => Promise.race([i.decode().catch(() => {}), new Promise((r) => setTimeout(r, 4000))])));
      const r = (s) => document.querySelector(s)?.getBoundingClientRect().toJSON();
      const res = performance.getEntriesByType('resource');
      return {
        study: document.body.dataset.study, title: document.title, phone: matchMedia('(max-width:760px)').matches,
        vp: vp.getBoundingClientRect().toJSON(), sh: vp.scrollHeight, sw: vp.scrollWidth, cw: vp.clientWidth,
        doc: [document.documentElement.scrollWidth - innerWidth, document.documentElement.scrollHeight - innerHeight],
        imgs: imgs.map((i) => { const b = i.getBoundingClientRect(); const file = +(i.srcset.split(', ').map((x) => x.split(' ')).find(([u]) => i.currentSrc.endsWith(u)) || [0, '0'])[1].replace('w', ''); return { src: i.currentSrc.split('/').pop(), nw: i.naturalWidth, w: b.width, h: b.height, alt: i.alt, ratio: file / (b.width * devicePixelRatio), ar: Math.abs(b.width / b.height - i.naturalWidth / i.naturalHeight) }; }),
        lead: r('.cs-lead img'), head: r('.cs-head'), rec: r('.cs-record'), name: r('.cs-name'), text: r('.cs-text'), foot: r('.cs-foot'),
        h: [...document.querySelectorAll('h1,h2,h3')].map((h) => h.tagName + ':' + h.textContent.trim()),
        record: [...document.querySelectorAll('.cs-record div')].map((d) => d.innerText.replace(/\s+/g, ' ')),
        account: document.querySelector('.cs-text').innerText.replace(/\s+/g, ' '),
        published: window.RECORDS.projects.find((x) => x.slug === SLUG).summary,
        links: [...document.querySelectorAll('.cs-foot a')].map((a) => a.getAttribute('href')),
        ext: [...document.querySelectorAll('.cs-record a')].map((a) => [a.href, a.target, a.rel]),
        taps: [...document.querySelectorAll('.cs-foot a')].map((a) => a.getBoundingClientRect().height),
        kb: res.filter((e) => /\.(jpg|js|css)/.test(e.name)).reduce((a, e) => a + (e.encodedBodySize || 0), 0),
        imgkb: res.filter((e) => /\.jpg/.test(e.name)).reduce((a, e) => a + (e.encodedBodySize || 0), 0),
        tab: vp.tabIndex, label: vp.getAttribute('aria-label'), controls: getComputedStyle(document.querySelector('.sheet-controls')).display,
      };
    }, SLUG);
    ok(!errs.length, tag + ' no errors', errs.join(' | '));
    ok(o.study === SLUG && o.title === ST.name + ' — Freeman GC', tag + ' study mounted');
    ok(o.sh > o.vp.height * 1.5, tag + ' sheet scrolls');
    ok(o.sw <= o.cw && o.doc[0] <= 0 && o.doc[1] <= 0, tag + ' no sideways scroll, document itself fixed', JSON.stringify([o.sw, o.cw, o.doc]));
    ok(o.imgs.length === ST.plates && o.imgs.every((i) => i.nw > 0 && i.alt.length > 40), tag + ' all plates loaded with descriptions', String(o.imgs.length));
    ok(o.imgs.every((i) => i.ar < 0.01), tag + ' no plate cropped or stretched');
    ok(o.imgs.every((i) => i.ratio >= 0.74), tag + ' plates sharp (file px / screen px >= .74)', JSON.stringify(o.imgs.map((i) => [i.src, +i.ratio.toFixed(2)])));
    ok(o.imgs.every((i) => i.ratio <= 2.6), tag + ' no plate far larger than needed', JSON.stringify(o.imgs.map((i) => [i.src, +i.ratio.toFixed(2)])));
    ok(o.account === o.published.replace(/\s+/g, ' '), tag + ' account is the published record, word for word');
    ok(o.record.length === ST.record.length && ST.record.every((re, k) => re.test(o.record[k])), tag + ' record rows', o.record.join(' | '));
    ok(o.h.join() === `H1:Projects / ${ST.name},H2:${ST.name},H3:Account`, tag + ' heading order', o.h.join());
    ok(o.links[0] === 'map.html?p=' + SLUG && o.links[1] === ST.next, tag + ' foot links', o.links.join());
    ok(o.ext.every(([h, t, r]) => /^https:/.test(h) && t === '_blank' && /noopener/.test(r)), tag + ' partner link safe');
    ok(o.tab === 0 && /case study/.test(o.label) && o.controls === 'none', tag + ' sheet focusable, pager hidden');
    if (o.phone) {
      ok(o.lead.top > o.name.bottom && o.rec.top > o.lead.bottom && o.lead.width > o.vp.width - 2, tag + ' phone order: name, plate, record');
      ok(o.taps.every((h) => h >= 44), tag + ' foot tap targets', o.taps.join());
    } else {
      ok(Math.abs(o.lead.left - o.text.left) < 1.5, tag + ' plate and text share an edge', [o.lead.left, o.text.left].join());
      ok(o.lead.bottom + 30 <= o.vp.bottom, tag + ' opening plate and caption inside the window', [o.lead.bottom, o.vp.bottom].join());
      ok(Math.abs(o.rec.bottom - o.lead.bottom) < 1.5, tag + ' record sits on the plate’s foot', [o.rec.bottom, o.lead.bottom].join());
      ok(o.name.right <= o.lead.left - 10, tag + ' name clear of plate');
    }
    console.log(tag, 'sheet', o.sh, 'px; files', Math.round(o.kb / 1024), 'KB of which photographs', Math.round(o.imgkb / 1024), 'KB;', o.imgs.map((i) => i.src.replace(/\.[0-9a-f]{8}/, '')).join(', '));

    // Keys from outside the sheet, then the place is kept across Next and Back.
    await p.keyboard.press('PageDown'); await p.waitForTimeout(250);
    const y1 = await p.evaluate(() => document.querySelector('.viewport').scrollTop);
    ok(y1 > 100, tag + ' PageDown reads on', String(y1));
    await p.evaluate(() => { document.querySelector('.viewport').scrollTop = 99999; });
    await p.waitForTimeout(150);
    const yEnd = await p.evaluate(() => document.querySelector('.viewport').scrollTop);
    await p.evaluate(() => document.querySelector('.cs-foot a:last-child').click()); await p.waitForTimeout(500);
    const g = await p.evaluate((sel) => ({ path: location.pathname, study: document.body.dataset.study || '', pg: !!document.querySelector(sel), controls: getComputedStyle(document.querySelector('.sheet-controls')).display, vpBottom: innerHeight - document.querySelector('.viewport').getBoundingClientRect().bottom }), ST.nextSel);
    ok(g.path.includes(ST.next.replace('.html', '')) && !g.study && g.pg && g.vpBottom > 40, tag + ' Next opens the next project’s existing page, frame restored', JSON.stringify(g));
    await p.goBack(); await p.waitForTimeout(500);
    const back = await p.evaluate(() => ({ study: document.body.dataset.study, y: document.querySelector('.viewport').scrollTop }));
    ok(back.study === SLUG && Math.abs(back.y - yEnd) < 4, tag + ' Back returns to the same place', JSON.stringify([back, yEnd]));

    // Arriving in place from another page: the template is fetched on the way.
    await p.goto(BASE + '/project-the-optimist', { waitUntil: 'networkidle' });
    await p.evaluate((SLUG) => { const a = document.createElement('a'); a.href = 'project-' + SLUG + '.html'; a.id = 'x'; a.textContent = 'x'; document.querySelector('.panel-head').append(a); }, SLUG);
    await p.evaluate(() => document.getElementById('x').click()); await p.waitForSelector('.cs-name', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(300);
    const inplace = await p.evaluate(() => ({ study: document.body.dataset.study, n: document.querySelectorAll('.cs-plate img').length, bottom: innerHeight - document.querySelector('.viewport').getBoundingClientRect().bottom }));
    ok(inplace.study === SLUG && inplace.n === ST.plates && inplace.bottom === 0, tag + ' in-place arrival', JSON.stringify(inplace));
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    ok(/project-the-optimist/.test(p.url()), tag + ' Escape closes back to where the visitor was', p.url());

    // The map hands over and takes back.
    await p.goto(BASE + '/map?p=' + SLUG, { waitUntil: 'load' }); await p.waitForSelector('.p-full');
    const href = await p.getAttribute('.p-full', 'href');
    ok(href === '/project-' + SLUG, tag + ' map sheet links to the case study', href);
    const sheet = await p.evaluate(() => ({ photos: document.querySelectorAll('#record .p-slide img').length, where: [...document.querySelectorAll('#record .p-where span')].map((x) => x.textContent).join(' '), story: !!document.querySelector('#record .p-story') }));
    ok(sheet.photos === ST.plates && sheet.story && ST.record[0].test(sheet.where), tag + ' map sheet shows photographs, account and address', JSON.stringify(sheet));
    await p.waitForTimeout(900);
    await p.evaluate(() => document.querySelector('.p-full').click()); await p.waitForSelector('.cs-name');
    await p.evaluate(() => document.querySelector('.panel-head .close').click()); await p.waitForTimeout(700);
    ok(p.url().includes('/map?p=' + SLUG), tag + ' CLOSE returns to the project on the map', p.url());

    // Untouched pages.
    for (const [path, sel] of [['/project-the-optimist', '.pg'], ['/project-woodlands-at-barnsley-resort', '.project-plate'], ['/project-dugans-pub', '.reading, .viewport'], ['/company', '.viewport']]) {
      await p.goto(BASE + path, { waitUntil: 'networkidle' });
      const u = await p.evaluate((sel) => ({ study: document.body.dataset.study || '', there: !!document.querySelector(sel), css: !!document.querySelector('link[data-case-study]') }), sel);
      ok(!u.study && u.there && !u.css, tag + ' ' + path + ' unchanged', JSON.stringify(u));
    }
    await ctx.close();
  }
  await browser.close();
}
// Metadata, as served.
for (const SLUG of WANT) {
const html = await (await fetch(BASE + '/project-' + SLUG)).text();
for (const [re, what] of [[new RegExp('<title>' + STUDIES[SLUG].name + ' — Freeman GC</title>'), 'title'], [/name="description" content="[^"]{60,170}"/, 'description 60–170 chars'], [new RegExp('rel="canonical" href="https://www\\.freemangc\\.com/project-' + SLUG + '"'), 'canonical'], [/property="og:image" content="https:\/\/www\.freemangc\.com\/assets\/map\/[a-z0-9-]+-1440\.[0-9a-f]{8}\.jpg"/, 'og:image'], [/og:image:alt/, 'og:image:alt'], [/twitter:card" content="summary_large_image"/, 'twitter card'], [/rel="preload" as="image"/, 'opening plate preloaded']]) ok(re.test(html), '[meta ' + SLUG + '] ' + what);
const og = html.match(/og:image" content="https:\/\/www\.freemangc\.com([^"]+)"/);
ok(og && (await fetch(BASE + og[1])).ok, '[meta] og:image file exists');
const pre = html.match(/imagesrcset="([^"]+)"/)[1].split(', ').map((s) => s.split(' ')[0]);
for (const u of pre) ok((await fetch(BASE + u)).ok, '[meta] preload file exists ' + u);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
