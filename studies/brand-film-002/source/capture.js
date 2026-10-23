// Freeman film 002 — deterministic capture of the real V5 site (release/approved-v5-2026-10-18 build,
// served unmodified). vclock.js drives every timer, requestAnimationFrame, performance.now/Date and
// CSS animation on each document, so every frame is exact and repeatable.
// Usage: node capture.js <siteBase> <outDir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json')));
const BASE = process.argv[2] || 'http://localhost:8765/';
const OUT = process.argv[3] || 'raw';
const FPS = T.fps;
fs.mkdirSync(OUT, { recursive: true });

// Monaco is Apple-licensed and absent on Linux: DejaVu Sans Mono stands in, injected into the CSS
// responses at capture time (the site files are untouched).
const FONT = '@font-face{font-family:Monaco;src:local("DejaVu Sans Mono");font-weight:400}' +
             '@font-face{font-family:Monaco;src:local("DejaVu Sans Mono Bold");font-weight:700}\n';
const ease = (p) => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const shotAt = (t) => [...T.shots].reverse().find((s) => t >= s.start - 1e-6);
const cropRect = (c) => { const w = 1080 / c.scale, h = 1920 / c.scale; return c.cx != null ? { x: c.cx - w / 2, y: c.cy - h / 2, w, h, scale: c.scale } : { x: c.x, y: c.y, w, h, scale: c.scale }; };
const toCanvas = (p, c) => [(p[0] - c.x) * c.scale, (p[1] - c.y) * c.scale];
const fromCanvas = (q, c) => [q[0] / c.scale + c.x, q[1] / c.scale + c.y];

(async () => {
  const browser = await chromium.launch();
  const first = T.shots[0];
  const ctx = await browser.newContext({ viewport: { width: first.viewport[0], height: first.viewport[1] }, deviceScaleFactor: T.dpr });
  await ctx.addInitScript({ path: path.join(__dirname, 'vclock.js') });
  await ctx.route('**/*.css*', async (route) => { const r = await route.fetch(); route.fulfill({ response: r, body: FONT + (await r.text()) }); });
  const page = await ctx.newPage();
  const settle = async () => {
    await page.evaluate(() => document.fonts.ready);
    // Polled from Node: the page's own timers are virtual and would never fire a page-side poll.
    for (let i = 0; ; i++) {
      const pending = await page.evaluate(() => [...document.images].filter((im) => im.getAttribute('src') && im.loading !== 'lazy' && !im.complete).map((im) => im.src));
      if (!pending.length) break;
      if (i > 400) throw new Error('images did not load: ' + pending.join(', '));
      await new Promise((r) => setTimeout(r, 50));
    }
    await page.evaluate(() => Promise.all([...document.images].filter((i) => i.complete && i.naturalWidth).map((i) => i.decode().catch(() => {}))));
  };
  await page.goto(BASE + first.url, { waitUntil: 'load' });
  await settle();
  // Where the entrance navigation sits on the canvas: the resolve plate sets its words on that line.
  const navY = await page.evaluate(() => { const r = document.querySelector('.v4-home-nav').getBoundingClientRect(); return r.y + r.height / 2; });
  const navCanvasY = (navY - cropRect(first.crop).y) * first.crop.scale;

  let docStart = -T.signatureOffset, docMs = 0;   // film time at which the current document's clock read 0
  const advance = async (t) => { const ms = (t - docStart) * 1000; if (ms > docMs) { await page.evaluate((m) => window.__vclock.advance(m), ms); docMs = ms; } };

  const resolved = new Map();
  let lastCanvas = null;
  async function resolve(i) {
    if (resolved.has(i)) return resolved.get(i);
    const k = T.cursor[i];
    let p;
    if (k.at === 'hold') { let j = i - 1; while (!T.cursor[j].at) j--; p = await resolve(j); }
    else if (k.at === 'carry') p = fromCanvas(lastCanvas, cropRect(shotAt(k.t).crop)); // same place on screen across the cut
    else p = await resolveAt(k.at);
    p = p.map((v) => Math.round(v * 3) / 3);
    resolved.set(i, p);
    return p;
  }
  const atCache = new Map();
  async function resolveAt(at) {
    if (atCache.has(at)) return atCache.get(at);
    const p = await page.evaluate((at) => {
      const c = (el, fx = .5, fy = .5) => { const r = el.getBoundingClientRect(); return [r.x + r.width * fx, r.y + r.height * fy]; };
      const [kind, arg] = at.split(':');
      if (kind === 'rest') { const r = document.querySelector('.v4-colorways').getBoundingClientRect(); return [r.right + 95, r.y + r.height / 2 - 38]; }
      if (kind === 'swatch') return c(document.querySelector(`[data-v4-color="${arg}"]`));
      if (kind === 'nav') return c([...document.querySelectorAll('.v4-home-nav a')].find((a) => a.textContent.trim() === arg));
      if (kind === 'approach') { const r = [...document.querySelectorAll('#tblock button')].find((b) => /Beetlecat/.test(b.textContent)).getBoundingClientRect(); return [r.x - 70, r.y + r.height / 2]; }
      if (kind === 'row') return c([...document.querySelectorAll('#tblock button')].find((b) => /Beetlecat/.test(b.textContent)), .3, .3);
      if (kind === 'record') return c(document.querySelector('.bc-enlarge-label'), .45, .5);
    }, at);
    atCache.set(at, p);
    return p;
  }
  async function cursorAt(t) {
    const keys = T.cursor.map((k, i) => [k, i]).filter(([k]) => k.at);
    let a = keys[0], b = null;
    for (const kk of keys) { if (kk[0].t <= t + 1e-6) a = kk; else { b = kk; break; } }
    const pa = await resolve(a[1]);
    if (!b || !b[0].ease) return pa;
    const pb = await resolve(b[1]);
    const p = ease(Math.min(1, Math.max(0, (t - a[0].t) / (b[0].t - a[0].t))));
    if (b[0].via) { // one continuous move along pa → via → pb, eased over its whole length
      const pv = await resolveAt(b[0].via);
      const l1 = Math.hypot(pv[0] - pa[0], pv[1] - pa[1]), l2 = Math.hypot(pb[0] - pv[0], pb[1] - pv[1]), s = p * (l1 + l2);
      return s <= l1 ? [pa[0] + (pv[0] - pa[0]) * s / l1, pa[1] + (pv[1] - pa[1]) * s / l1]
                     : [pv[0] + (pb[0] - pv[0]) * (s - l1) / l2, pv[1] + (pb[1] - pv[1]) * (s - l1) / l2];
    }
    // A slight arc, as a hand moves a mouse; never more than a few pixels off the line.
    const dx = pb[0] - pa[0], dy = pb[1] - pa[1], d = Math.hypot(dx, dy) || 1, bow = Math.sin(Math.PI * p) * Math.min(14, d * .04);
    return [pa[0] + dx * p - dy / d * bow, pa[1] + dy * p + dx / d * bow];
  }
  const cursorStyle = ([x, y]) => page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y); const s = el ? getComputedStyle(el).cursor : '';
    const stroke = (s.match(/stroke='%23([0-9a-f]{6})'/i) || [])[1] || '30312f';
    const rect = s.match(/rect x='([\d.]+)' y='[\d.]+' width='([\d.]+)'[^>]*fill='%23([0-9a-f]{6})'/i);
    return { stroke, rx: rect ? +rect[1] : 9, rw: rect ? +rect[2] : 3, fill: rect ? rect[3] : 'f05a28', raw: s.slice(0, 12) };
  }, [x, y]);

  const meta = [], events = [];
  const nSite = Math.round(T.shots.find((s) => s.plate).start * FPS);
  let mouse = null;
  for (let f = 0; f < nSite; f++) {
    const t = f / FPS;
    for (const k of T.cursor) if ((k.down || k.up) && k.t > (f - 1) / FPS + 1e-6 && k.t <= t + 1e-6) {
      await advance(k.t);
      if (k.down) await page.mouse.down();
      else if (k.navigate) {
        const shot = T.shots.find((s) => s.id === k.navigate);
        await Promise.all([page.waitForURL((u) => u.pathname.endsWith(shot.url), { waitUntil: 'load' }), page.mouse.up()]);
        await page.setViewportSize({ width: shot.viewport[0], height: shot.viewport[1] });
        await page.waitForTimeout(300);
        await settle();
        // The new document has been laid out for one display frame before it is first seen.
        docStart = t - 1 / 60; docMs = 0; mouse = null;
      } else { await page.mouse.up(); await page.waitForTimeout(40); }
      events.push({ t: k.t, type: k.down ? 'down' : 'up' });
    }
    await advance(t);
    const shot = shotAt(t), c = cropRect(shot.crop);
    const [x, y] = await cursorAt(t);
    if (!mouse || mouse[0] !== x || mouse[1] !== y) { await page.mouse.move(x, y); mouse = [x, y]; }
    await page.evaluate(() => window.__vclock.advance(window.__vclock.now() + 0.001)); // flush rAF work triggered by input
    await page.evaluate(() => window.__vclock.syncAnims());
    await settle();
    const vp = page.viewportSize();
    const clip = { x: Math.max(0, c.x), y: Math.max(0, c.y) };
    clip.width = Math.min(vp.width, c.x + c.w) - clip.x; clip.height = Math.min(vp.height, c.y + c.h) - clip.y;
    const file = `f${String(f).padStart(4, '0')}.png`;
    await page.screenshot({ path: path.join(OUT, file), clip, animations: 'allow', caret: 'initial' });
    lastCanvas = toCanvas([x, y], c);
    meta.push({ f, t, shot: shot.id, file, crop: c, clip, cursor: { x, y, canvas: lastCanvas, style: await cursorStyle([x, y]) } });
  }

  // Plates: same origin as the site, so they use its styles.css, pixel-mark and eagle scripts.
  const ppage = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await ppage.route('**/*.css*', async (route) => { const r = await route.fetch(); route.fulfill({ response: r, body: FONT + (await r.text()) }); });
  await ppage.route('**/__film/**', (route) => route.fulfill({ path: path.join(__dirname, path.basename(new URL(route.request().url()).pathname)), contentType: 'text/html' }));
  await ppage.goto(BASE + '__film/eagle.html', { waitUntil: 'load' });
  await ppage.evaluate(() => document.fonts.ready);
  await ppage.evaluate(() => window.stampReady);
  await ppage.evaluate(() => { window.__q = []; window.__frame = (ms) => { const q = window.__q; window.__q = []; q.forEach((cb) => cb(ms)); }; });
  const resolveStart = T.shots.find((s) => s.id === 'resolve').start;
  let stamped = false;
  for (let f = nSite; f < Math.round(resolveStart * FPS); f++) {
    const t = f / FPS;
    if (!stamped && t >= T.eagle.stampStart - 1e-6) { await ppage.evaluate(() => { window.stamp((cb) => window.__q.push(cb)); }); stamped = true; }
    if (stamped) await ppage.evaluate((ms) => window.__frame(ms), (t - T.eagle.stampStart) * 1000);
    const file = `f${String(f).padStart(4, '0')}.png`;
    await ppage.screenshot({ path: path.join(OUT, file) });
    meta.push({ f, t, shot: 'eagle', file, full: true });
  }
  // Resolve: the words, set on a transparent plate; compose.py places them under the finished script.
  await ppage.goto(BASE + '__film/resolve.html?y=' + navCanvasY.toFixed(1), { waitUntil: 'load' });
  await ppage.evaluate(() => document.fonts.ready);
  await ppage.screenshot({ path: path.join(OUT, 'resolve-words.png'), omitBackground: true });
  for (let f = Math.round(resolveStart * FPS); f < Math.round(T.duration * FPS); f++) meta.push({ f, t: f / FPS, shot: 'resolve', resolve: true, file: `f${String(f).padStart(4, '0')}.png` });
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ frames: meta, events, navCanvasY }, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
