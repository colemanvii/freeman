// Freeman film 003 — deterministic capture of the real V5 site (release/approved-v5-2026-10-18 build,
// served unmodified). Each shot runs in its own browser context at a device scale equal to its crop
// scale, so a CSS pixel lands on whole film pixels and nothing is resampled. vclock.js drives every
// timer, requestAnimationFrame, performance.now/Date and CSS animation, so every frame is repeatable.
// Usage: node capture.js <siteBase> <outDir> [--stills t1,t2,...]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json')));
const BASE = process.argv[2] || 'http://127.0.0.1:8765/';
const OUT = process.argv[3] || 'raw';
const si = process.argv.indexOf('--stills');
const STILLS = si > 0 ? new Set(process.argv[si + 1].split(',').map((t) => Math.round(+t * T.fps))) : null;
const FPS = T.fps;
fs.mkdirSync(OUT, { recursive: true });

const ease = (p) => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const shotAt = (t) => [...T.shots].reverse().find((s) => t >= s.start - 1e-6);
const shotEnd = (s) => { const i = T.shots.indexOf(s); return i + 1 < T.shots.length ? T.shots[i + 1].start : T.duration; };
const frameRange = (a, b) => [Math.round(a * FPS), Math.round(b * FPS)];
const snap = (v, s) => Math.round(v * s) / s;            // crop origins on the device-pixel grid
const toCanvas = (p, c) => [(p[0] - c.x) * c.scale, (p[1] - c.y) * c.scale];
const fromCanvas = (q, c) => [q[0] / c.scale + c.x, q[1] / c.scale + c.y];

// Targets, resolved in the page's CSS pixels.
const TARGETS = (at) => {
  const c = (el, fx = .5, fy = .5) => { const r = el.getBoundingClientRect(); return [r.x + r.width * fx, r.y + r.height * fy]; };
  const [kind, arg] = at.split(':');
  if (kind === 'rest') { const r = document.querySelector('.v4-colorways').getBoundingClientRect(); return [r.right + 70, r.y + r.height / 2]; }
  if (kind === 'swatch') return c(document.querySelector(`[data-v4-color="${arg}"]`));
  if (kind === 'nav') return c([...document.querySelectorAll('.v4-home-nav a')].find((a) => a.textContent.trim() === arg));
  if (kind === 'mark') {
    // The mark's resting place (its --at translate), not wherever its arrival animation has it now.
    const all = window.__record.clusters, cl = all.find((k) => k.items.length === 1 && k.items[0].slug === arg) || all.find((k) => k.items.some((i) => i.slug === arg));
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(cl.el.style.getPropertyValue('--at'));
    const r = document.getElementById('map').getBoundingClientRect();
    return [r.x + +m[1], r.y + +m[2]];
  }
  throw new Error('unknown target ' + at);
};

(async () => {
  const browser = await chromium.launch();
  const meta = { frames: [], events: [], shots: {} };
  let lastCanvas = null, prevShot = null;

  for (const shot of T.shots.filter((s) => s.doc)) {
    const ctx = await browser.newContext({ viewport: { width: shot.viewport[0], height: shot.viewport[1] }, deviceScaleFactor: shot.scale });
    await ctx.addInitScript({ path: path.join(__dirname, 'vclock.js') });
    const page = await ctx.newPage();
    const settle = async () => {
      await page.evaluate(() => document.fonts.ready);
      // Polled from Node: the page's own timers are virtual and would never fire a page-side poll.
      for (let i = 0; ; i++) {
        const pending = await page.evaluate(() => [...document.images].filter((im) => im.getAttribute('src') && !im.complete).map((im) => im.src));
        if (!pending.length) break;
        if (i > 400) throw new Error('images did not load: ' + pending.join(', '));
        await new Promise((r) => setTimeout(r, 50));
      }
      await page.evaluate(() => Promise.all([...document.images].filter((i) => i.complete && i.naturalWidth).map((i) => i.decode().catch(() => {}))));
    };
    await page.goto(BASE + shot.url, { waitUntil: 'load' });
    await settle();
    const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
    const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);

    if (shot.prep) {
      // The map is zoomed and panned with the site's own wheel and drag before the shot is seen.
      const at = () => page.evaluate(TARGETS, 'mark:beetlecat');
      const field = await page.evaluate(() => { const r = document.getElementById('map').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
      let p = await at();
      const s0 = await page.evaluate(() => window.__record.view.s);
      // Wheel steps, as a hand would, until the site's own zoom reaches the chosen scale.
      for (let i = 0, s = s0; i < 40 && Math.abs(Math.log(shot.prep.zoom / s)) > .002; i++) {
        p = await at();
        await page.mouse.move(p[0], p[1]);
        await page.mouse.wheel(0, Math.max(-240, Math.min(240, -Math.log(shot.prep.zoom / s) / .0022)));
        await page.waitForTimeout(60);
        s = await page.evaluate(() => window.__record.view.s);
      }
      p = await at();
      const goal = [field[0] + field[2] - shot.prep.markFromFieldRight, shot.prep.markY];
      const from = [field[0] + 40, field[1] + field[3] - 160];
      await page.mouse.move(from[0], from[1]); await page.mouse.down();
      await page.mouse.move(from[0] + (goal[0] - p[0]), from[1] + (goal[1] - p[1]), { steps: 8 });
      await page.mouse.up();
      await page.mouse.move(2, 2);
      await page.waitForTimeout(100);
    }

    // Crop: fixed, or anchored so a target sits at a chosen (or the previous shot's) place on the canvas.
    let crop;
    if (shot.crop) crop = { ...shot.crop, scale: shot.scale };
    else {
      const p = await page.evaluate(TARGETS, shot.anchor.target);
      const q = shot.anchor.canvas || toCanvas(p, meta.shots[prevShot.id].crop);
      crop = { x: snap(p[0] - q[0] / shot.scale, shot.scale), y: snap(p[1] - q[1] / shot.scale, shot.scale), scale: shot.scale };
    }
    crop.w = 1080 / shot.scale; crop.h = 1920 / shot.scale;
    meta.shots[shot.id] = { crop, fonts, bodyFont, viewport: shot.viewport, view: await page.evaluate(() => window.__record && { ...window.__record.view }) };
    console.log(shot.id, 'crop', JSON.stringify(crop), 'view', JSON.stringify(meta.shots[shot.id].view));

    // Document clock: home starts with the film; the map is cut into `preroll` seconds after it loads.
    const docStart = shot.doc === 'home' ? -T.signatureOffset : shot.start - (shot.preroll || 0);
    let docMs = 0;
    const advance = async (t) => { const ms = (t - docStart) * 1000; if (ms > docMs) { await page.evaluate((m) => window.__vclock.advance(m), ms); docMs = ms; } };
    // Step through the preroll a display frame at a time, so CSS animations start when the page starts them.
    if (shot.preroll) for (let t = docStart + 1 / 60; t < shot.start - 1 / FPS; t += 1 / 60) { await advance(t); await page.evaluate(() => window.__vclock.syncAnims()); }

    const keys = T.cursor.map((k, i) => ({ ...k, i })).filter((k) => k.at && shotAt(k.t).doc === shot.doc);
    const resolved = new Map();
    const resolve = async (k) => {
      if (resolved.has(k.i)) return resolved.get(k.i);
      let p;
      if (k.at === 'hold') { const prev = [...keys].reverse().find((j) => j.i < k.i && j.at !== 'hold'); p = await resolve(prev); }
      else if (k.at === 'carry') p = fromCanvas(lastCanvas, crop); // the same place on screen across the cut
      else p = await page.evaluate(TARGETS, k.at);
      p = p.map((v) => Math.round(v * shot.scale) / shot.scale);
      resolved.set(k.i, p);
      return p;
    };
    const cursorAt = async (t) => {
      let a = keys[0], b = null;
      for (const k of keys) { if (k.t <= t + 1e-6) a = k; else { b = k; break; } }
      const pa = await resolve(a);
      if (!b || !b.ease) return pa;
      const pb = await resolve(b), p = ease(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
      // A slight arc, as a hand moves a mouse; never more than a few pixels off the line.
      const dx = pb[0] - pa[0], dy = pb[1] - pa[1], d = Math.hypot(dx, dy) || 1, bow = Math.sin(Math.PI * p) * Math.min(10, d * .04);
      return [pa[0] + dx * p - dy / d * bow, pa[1] + dy * p + dx / d * bow];
    };
    const cursorStyle = ([x, y]) => page.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x, y); const s = el ? getComputedStyle(el).cursor : '';
      const stroke = (s.match(/stroke='%23([0-9a-f]{6})'/i) || [])[1] || '30312f';
      const rect = s.match(/rect x='([\d.]+)' y='[\d.]+' width='([\d.]+)'[^>]*fill='%23([0-9a-f]{6})'/i);
      return { stroke, rx: rect ? +rect[1] : 9, rw: rect ? +rect[2] : 3, fill: rect ? rect[3] : 'f05a28' };
    }, [x, y]);

    const [f0, f1] = frameRange(shot.doc === 'home' ? 0 : shot.start, shotEnd(shot));
    const [s0] = frameRange(shot.start, 0);
    let mouse = null;
    for (let f = f0; f < f1; f++) {
      const t = f / FPS;
      for (const k of T.cursor) if ((k.down || k.up) && k.t > (f - 1) / FPS + 1e-6 && k.t <= t + 1e-6 && shotAt(k.t).doc === shot.doc) {
        if (f >= s0 && !meta.events.some((e) => e.t === k.t)) meta.events.push({ t: k.t, type: k.down ? 'down' : 'up', shot: shotAt(k.t).id });
        if (k.dispatch === false) continue;
        await advance(k.t);
        if (k.down) await page.mouse.down(); else { await page.mouse.up(); }
      }
      await advance(t);
      const [x, y] = await cursorAt(t);
      if (!mouse || mouse[0] !== x || mouse[1] !== y) { await page.mouse.move(x, y); mouse = [x, y]; }
      await page.evaluate(() => window.__vclock.advance(window.__vclock.now() + 0.001)); // flush rAF work triggered by input
      await page.evaluate(() => window.__vclock.syncAnims());
      await settle();
      if (f < s0) continue;
      const canvas = toCanvas([x, y], crop);
      lastCanvas = canvas;
      if (STILLS && !STILLS.has(f)) continue;
      const vp = page.viewportSize();
      const clip = { x: Math.max(0, crop.x), y: Math.max(0, crop.y) };
      clip.width = Math.min(vp.width, crop.x + crop.w) - clip.x; clip.height = Math.min(vp.height, crop.y + crop.h) - clip.y;
      const file = `f${String(f).padStart(4, '0')}.png`;
      await page.screenshot({ path: path.join(OUT, file), clip, animations: 'allow', caret: 'initial' });
      const fr = { f, t, shot: shot.id, file, crop, clip, cursor: { css: [x, y], canvas, style: await cursorStyle([x, y]) },
        paper: await page.evaluate(() => getComputedStyle(document.body).backgroundColor) };
      if (shot.id === 'mark') Object.assign(fr, await page.evaluate(() => {
        const box = (el) => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; };
        return { script: box(document.querySelector('canvas')), nav: box(document.querySelector('.v4-home-nav')) };
      }));
      if (shot.id === 'map') fr.peek = await page.evaluate(() => {
        const e = document.querySelector('.photo-peek'); if (!e || e.hidden) return null;
        const i = e.querySelector('img'), r = i.getBoundingClientRect(), cs = getComputedStyle(i);
        return { rect: [r.x, r.y, r.width, r.height], src: new URL(i.currentSrc || i.src).pathname, nw: i.naturalWidth, nh: i.naturalHeight, fit: cs.objectFit, pos: cs.objectPosition, filter: cs.filter };
      });
      meta.frames.push(fr);
    }
    meta.shots[shot.id].lastCanvas = lastCanvas;
    prevShot = shot;
    await ctx.close();
  }

  // Plates: same origin as the site, so they use its styles.css, palette and eagle scripts.
  const mark = meta.shots.mark.crop;
  const scriptBox = meta.frames.find((f) => f.script) ? meta.frames.find((f) => f.script).script : [480, 202, 480, 183];
  const scriptCanvasY = (scriptBox[1] + scriptBox[3] / 2 - mark.y) * mark.scale;
  meta.scriptCanvasY = scriptCanvasY;
  const navBox = (meta.frames.find((f) => f.nav) || {}).nav;
  if (navBox) meta.navCanvasY = (navBox[1] + navBox[3] / 2 - mark.y) * mark.scale;
  const ppage = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await ppage.route('**/__film/**', (route) => route.fulfill({ path: path.join(__dirname, path.basename(new URL(route.request().url()).pathname)), contentType: 'text/html' }));
  const eagle = T.shots.find((s) => s.plate === 'eagle');
  await ppage.goto(BASE + '__film/eagle.html?y=' + scriptCanvasY.toFixed(1), { waitUntil: 'load' });
  await ppage.evaluate(() => document.fonts.ready);
  await ppage.evaluate(() => window.stampReady);
  await ppage.evaluate(() => { window.__q = []; window.__frame = (ms) => { const q = window.__q; window.__q = []; q.forEach((cb) => cb(ms)); }; });
  let stamped = false;
  const [e0, e1] = frameRange(eagle.start, shotEnd(eagle));
  for (let f = e0; f < e1; f++) {
    const t = f / FPS;
    // The motion's clock starts at the stamp time, which may fall before the plate is first seen.
    if (!stamped && t >= eagle.stampAt - 1e-6) { await ppage.evaluate((sp) => { window.stamp((cb) => window.__q.push(cb), sp); window.__frame(0); }, eagle.speed); stamped = true; }
    if (stamped) await ppage.evaluate((ms) => window.__frame(ms), (t - eagle.stampAt) * 1000);
    if (STILLS && !STILLS.has(f)) continue;
    const file = `f${String(f).padStart(4, '0')}.png`;
    await ppage.screenshot({ path: path.join(OUT, file) });
    meta.frames.push({ f, t, shot: 'eagle', file, full: true });
  }
  // Lockup words, on a transparent plate in the Freeman (sand) palette; compose.py sets them under the script.
  await ppage.goto(BASE + '__film/words.html', { waitUntil: 'load' });
  await ppage.evaluate(() => document.fonts.ready);
  await ppage.screenshot({ path: path.join(OUT, 'lockup-words.png'), omitBackground: true });
  meta.wordsFont = await ppage.evaluate(() => getComputedStyle(document.getElementById('w')).fontFamily);
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
