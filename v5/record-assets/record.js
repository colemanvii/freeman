/* The Record — Exploration 001.
   The map is the index; the projects are the stories. Identity comes from /records.js, place and time from sites.js,
   geography from geo.js. Nothing here estimates a coordinate or a year. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const G = window.RECORD_GEO, SITES = window.RECORD_SITES, REG = window.RECORDS.projects;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NOW = 2026;
  const KM_PER_UNIT = 0.11132; // one map unit is 1/1000 degree of latitude
  const project = (lon, lat) => [(lon - G.proj.lon0) * G.proj.cos * G.proj.k, (G.proj.lat0 - lat) * G.proj.k];
  const unproject = (x, y) => [x / (G.proj.cos * G.proj.k) + G.proj.lon0, G.proj.lat0 - y / G.proj.k];

  /* ---------- The record: register entries joined to their places ---------- */
  const items = REG.map((p) => {
    const site = SITES.sites[p.slug] || { precision: null, reason: 'Location not on file' };
    const year = Number.isFinite(SITES.years[p.slug]) ? SITES.years[p.slug] : null;
    const it = { ...p, site, year, placed: !!site.precision };
    if (it.placed) [it.x, it.y] = project(site.lon, site.lat);
    const loc = (site.area || p.location || '').split(',');
    it.city = (loc.length > 1 ? loc[loc.length - 1] : loc[0]).trim();
    if (it.city === 'Georgia') it.city = loc[0].trim();
    it.client = (p.credits || []).find((c) => c[0] === 'Client')?.[1] || '';
    it.photos = (p.gallery && p.gallery.length ? p.gallery : p.image ? [{ src: p.image }] : []).map((g) => ({ ...g, src: '/' + g.src.replace(/^\//, '') }));
    return it;
  }).sort((a, b) => a.id.localeCompare(b.id));
  const placed = items.filter((i) => i.placed);
  const bySlug = Object.fromEntries(items.map((i) => [i.slug, i]));
  const dated = items.filter((i) => i.year !== null);

  /* ---------- Sheet border zone references ---------- */
  $('ref-top').innerHTML = 'ABCDEFGH'.split('').map((c) => `<span>${c}</span>`).join('');
  $('ref-left').innerHTML = '123456'.split('').map((c) => `<span>${c}</span>`).join('');

  /* ---------- Base map ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = $('svg'), world = $('world'), mapEl = $('map'), marks = $('marks');
  [['states', 'l-states', 0], ['counties', 'l-counties', .08], ['lakes', 'l-lakes', .2], ['rivers', 'l-rivers', .28], ['limits', 'l-limits', .4], ['local', 'l-local', .42], ['primary', 'l-primary', .45], ['interstates', 'l-roads', .5]]
    .forEach(([k, cls, d]) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', G[k]); p.setAttribute('class', cls); p.style.setProperty('--d', d + 's'); world.appendChild(p); });

  // Names: towns, neighbourhoods, rivers, states. Each knows the zoom at which it belongs.
  const names = [];
  const addName = (text, x, y, cls, minS, maxS = Infinity) => {
    const el = document.createElement('span'); el.className = 'nm ' + cls; el.textContent = text; marks.appendChild(el);
    names.push({ el, x, y, minS, maxS, cls });
  };
  G.stateLabels.forEach(([n, x, y]) => addName(n, x, y, 'state', 0, 1.4));
  G.riverLabels.forEach(([n, x, y]) => addName(n, x, y, 'river', .5));
  G.places.forEach(([n, x, y, t]) => addName(n, x, y, 't' + t + (t < 3 ? ' dot' : ''), t === 1 ? 0 : t === 2 ? .62 : 2.6, t === 1 && n === 'Atlanta' ? 3.2 : Infinity));

  /* ---------- View: screen = world * s + t ---------- */
  const view = { s: 1, tx: 0, ty: 0 };
  let W = 0, H = 0, sMin = .2;
  const S_MAX = 18;
  const size = () => { const r = mapEl.getBoundingClientRect(); W = r.width; H = r.height; };
  const toScreen = (x, y) => [x * view.s + view.tx, y * view.s + view.ty];
  const placedBounds = () => bounds(placed);
  function bounds(list, padUnits = 0) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const i of list) {
      const r = i.site?.precision === 'area' ? i.site.radiusKm / KM_PER_UNIT : padUnits;
      x0 = Math.min(x0, i.x - r); x1 = Math.max(x1, i.x + r); y0 = Math.min(y0, i.y - r); y1 = Math.max(y1, i.y + r);
    }
    return { x0, y0, x1, y1 };
  }
  // The part of the map not covered by the record (phones overlay the record on the map)
  function visible() {
    const rec = $('record');
    if (body.dataset.mode === 'record' && matchMedia('(max-width:760px)').matches) {
      // offsetTop ignores the sheet's entrance transform, so this is where the record will rest
      const top = rec.offsetTop - mapEl.getBoundingClientRect().top;
      return { x: 0, y: 0, w: W, h: Math.max(120, Math.min(H, top)) };
    }
    const lede = $('lede').getBoundingClientRect();
    const padTop = body.dataset.mode === 'map' ? Math.min(lede.height * .55, H * .2) : 0;
    return { x: 0, y: padTop, w: W, h: H - padTop };
  }
  function fitView(b, { pad = 60, maxS = S_MAX } = {}) {
    const v = visible();
    const p = Math.min(pad, v.w / 5, v.h / 5);
    const s = Math.max(sMin, Math.min(maxS, (v.w - 2 * p) / Math.max(1, b.x1 - b.x0), (v.h - 2 * p) / Math.max(1, b.y1 - b.y0)));
    return { s, tx: v.x + v.w / 2 - (b.x0 + b.x1) / 2 * s, ty: v.y + v.h / 2 - (b.y0 + b.y1) / 2 * s };
  }
  function centreOn(x, y, s) { const v = visible(); return { s, tx: v.x + v.w / 2 - x * s, ty: v.y + v.h / 2 - y * s }; }
  function clampView() {
    // Keep some of the drawing on screen
    const b = G.box, m = 80;
    view.tx = Math.min(W - m - b.x0 * view.s, Math.max(m - b.x1 * view.s, view.tx));
    view.ty = Math.min(H - m - b.y0 * view.s, Math.max(m - b.y1 * view.s, view.ty));
  }

  let anim = 0;
  function flyTo(target, ms = 650) {
    cancelAnimationFrame(anim);
    if (reduced || ms === 0) { Object.assign(view, target); draw(true); return Promise.resolve(); }
    const from = { ...view }, t0 = performance.now();
    // Interpolate scale geometrically and keep the path through the midpoint steady
    const fx = (W / 2 - from.tx) / from.s, fy = (H / 2 - from.ty) / from.s, gx = (W / 2 - target.tx) / target.s, gy = (H / 2 - target.ty) / target.s;
    return new Promise((done) => {
      const step = (now) => {
        const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        const s = from.s * Math.pow(target.s / from.s, e), cx = fx + (gx - fx) * e, cy = fy + (gy - fy) * e;
        view.s = s; view.tx = W / 2 - cx * s; view.ty = H / 2 - cy * s;
        draw(k === 1 || Math.abs(Math.log(s / lastClusterS)) > .08);
        if (k < 1) anim = requestAnimationFrame(step); else { Object.assign(view, target); draw(true); done(); }
      };
      anim = requestAnimationFrame(step);
    });
  }

  /* ---------- Marks: clusters by screen distance, recomputed when the scale changes ---------- */
  let clusters = [], lastClusterS = -1, year = NOW, hotSlug = null, openSlug = null;
  const markLayer = document.createElement('div'); markLayer.className = 'marklayer'; markLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  marks.appendChild(markLayer);
  const peek = document.createElement('aside');
  peek.className = 'photo-peek';
  peek.setAttribute('aria-hidden', 'true');
  peek.hidden = true;
  mapEl.appendChild(peek);
  const shown = (i) => i.placed && (i.year === null || i.year <= year);

  function cluster() {
    lastClusterS = view.s;
    const R = matchMedia('(pointer:coarse)').matches ? 30 : 24;
    const out = [];
    for (const i of placed) {
      if (!shown(i)) continue;
      const sx = i.x * view.s, sy = i.y * view.s;
      const c = out.find((c) => Math.hypot(c.sx - sx, c.sy - sy) < R);
      if (c) { c.items.push(i); c.sx = c.items.reduce((a, j) => a + j.x, 0) / c.items.length * view.s; c.sy = c.items.reduce((a, j) => a + j.y, 0) / c.items.length * view.s; }
      else out.push({ items: [i], sx, sy });
    }
    // Merge groups whose centres drifted together, so bubbles never overlap
    for (let merged = true; merged;) {
      merged = false;
      for (let a = 0; a < out.length && !merged; a++) for (let b = a + 1; b < out.length; b++) {
        if (Math.hypot(out[a].sx - out[b].sx, out[a].sy - out[b].sy) >= R) continue;
        const c = out[a]; c.items.push(...out[b].items); out.splice(b, 1);
        c.sx = c.items.reduce((t, j) => t + j.x, 0) / c.items.length * view.s; c.sy = c.items.reduce((t, j) => t + j.y, 0) / c.items.length * view.s;
        merged = true; break;
      }
    }
    for (const c of out) { c.x = c.sx / view.s; c.y = c.sy / view.s; c.key = c.items.map((i) => i.slug).sort().join('|'); }
    clusters = out;
    renderMarks();
  }
  const cityName = (c) => { const areas = new Set(c.items.map((i) => i.site.area)); if (areas.size === 1) return c.items[0].site.area.split(',')[0]; const cities = [...new Set(c.items.map((i) => i.city))]; return cities.length > 2 ? cities.slice(0, 2).join(' · ') + ' +' : cities.join(' · '); };

  let markEls = new Map();
  function renderMarks() {
    const keep = new Map();
    markLayer.innerHTML = '';
    // Approximate areas first, beneath everything
    for (const c of clusters) if (c.items.length === 1 && c.items[0].site.precision === 'area') {
      const a = document.createElement('div'); a.className = 'area'; a.dataset.slug = c.items[0].slug; markLayer.appendChild(a); c.areaEl = a;
    }
    for (const c of clusters) {
      const one = c.items.length === 1 ? c.items[0] : null;
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'mk' + (one ? (one.site.precision === 'area' ? ' approx' : '') : ' grp');
      if (one) { b.dataset.slug = one.slug; b.setAttribute('aria-label', `${one.name}, ${one.site.area}${one.site.precision === 'area' ? ', approximate area' : ''}`); }
      else { b.innerHTML = `<span class="ring2"></span><span class="ct">${c.items.length}</span>`; b.setAttribute('aria-label', `${c.items.length} projects near ${cityName(c)}`); }
      if (one && one.slug === openSlug) b.classList.add('on');
      if (lastArrive.has(c.key)) b.classList.add('arrive');
      b.addEventListener('click', (e) => { e.stopPropagation(); pick(c); });
      b.addEventListener('pointerenter', () => hover(c, true));
      b.addEventListener('pointerleave', () => hover(c, false));
      b.addEventListener('focus', () => hover(c, true));
      b.addEventListener('blur', () => hover(c, false));
      const t = document.createElement('span'); t.className = 'tag' + (one ? '' : ' grp');
      t.innerHTML = one ? `<span>${esc(one.name)} <small>${esc(one.id)}</small></span>` : `<span>${esc(cityName(c))} <small>${c.items.length}</small></span>`;
      markLayer.appendChild(b); markLayer.appendChild(t);
      c.el = b; c.tagEl = t; keep.set(c.key, c);
    }
    markEls = keep;
    lastArrive.clear();
    positionMarks();
  }
  const lastArrive = new Set();

  /* ---------- Field preview: a glimpse, not another panel ---------- */
  let peekSlug = null, peekOrigin = null;
  function placePeek() {
    if (peek.hidden || !peekSlug) return;
    const it = bySlug[peekSlug]; if (!it) return;
    const w = peek.offsetWidth, h = peek.offsetHeight;
    if (!w || !h) return;
    let x, y;
    if (peekOrigin === 'mark' && it.placed) {
      const pos = toScreen(it.x, it.y), mx = pos[0], my = pos[1];
      x = mx + 30 + w < W - 12 ? mx + 30 : mx - w - 30;
      x = Math.max(12, Math.min(W - w - 12, x));
      y = Math.max(14, Math.min(H - h - 20, my - h * .38));
    } else {
      x = Math.max(12, W - w - 19);
      y = 20;
    }
    peek.style.transform = 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)';
  }
  function showPeek(slug, origin) {
    const it = bySlug[slug];
    if (!it || !it.photos.length || body.dataset.mode !== 'map' || matchMedia('(max-width:760px)').matches) {
      if (peekOrigin === origin) hidePeek();
      return;
    }
    if (peekSlug !== slug || peekOrigin !== origin) {
      peek.innerHTML = '<img src="' + esc(it.photos[0].src) + '" alt="" decoding="async" loading="eager">' +
        '<div class="photo-peek-copy"><span class="photo-peek-index">PROJECT / ' + esc(it.id) + ' · ' + esc(it.type) + '</span>' +
        '<strong>' + esc(it.name) + '</strong><span class="photo-peek-place">' + esc(it.site.area || it.location) + '</span>' +
        '<span class="photo-peek-action">OPEN RECORD ↗</span></div>';
    }
    peekSlug = slug; peekOrigin = origin;
    peek.hidden = false;
    placePeek();
  }
  function hidePeek(slug = null, origin = null) {
    if (slug && (peekSlug !== slug || peekOrigin !== origin)) return;
    peek.hidden = true; peekSlug = null; peekOrigin = null;
  }


  function positionMarks() {
    const placedTags = [];
    const v = { w: W, h: H };
    for (const c of clusters) {
      const [x, y] = toScreen(c.x, c.y);
      c.el.style.transform = `translate(${x}px,${y}px)`;
      c.el.style.setProperty('--at', `translate(${x}px,${y}px)`);
      if (c.areaEl) {
        const r = Math.max(16, c.items[0].site.radiusKm / KM_PER_UNIT * view.s);
        c.areaEl.style.cssText = `width:${2 * r}px;height:${2 * r}px;transform:translate(${x - r}px,${y - r}px)`;
      }
      const tw = c.tagEl.offsetWidth || 120, th = 18;
      const flip = x + 14 + tw > W - 6;
      const tx = flip ? x - 14 - tw : x + 14, ty = y - th / 2;
      c.tagEl.classList.toggle('flip', flip);
      c.tagEl.style.transform = `translate(${tx}px,${ty}px)`;
      const box = { x0: tx, y0: ty, x1: tx + tw, y1: ty + th };
      const off = x < -40 || y < -40 || x > v.w + 40 || y > v.h + 40;
      const clash = placedTags.some((o) => !(box.x1 < o.x0 || box.x0 > o.x1 || box.y1 < o.y0 || box.y0 > o.y1));
      // Groups always carry their place name; single records show theirs when there is room at a working zoom
      const want = c.items.length > 1 || view.s > 1.1 || c.items[0].site.precision === 'area';
      const vis = want && !clash && !off;
      c.tagEl.classList.toggle('off', !vis);
      if (vis) placedTags.push(box);
      c.box = box;
    }
    return placedTags;
  }

  function positionNames(tagBoxes) {
    const taken = tagBoxes.slice();
    for (const c of clusters) { const [x, y] = toScreen(c.x, c.y); taken.push({ x0: x - 16, y0: y - 16, x1: x + 16, y1: y + 16 }); }
    const order = names.slice().sort((a, b) => rank(a) - rank(b));
    for (const n of order) {
      const ok = view.s >= n.minS && view.s < n.maxS;
      if (!ok) { n.el.classList.add('off'); continue; }
      const [x, y] = toScreen(n.x, n.y);
      const w = n.w || (n.w = n.el.offsetWidth), h = 11;
      const nx = n.cls.includes('dot') ? x + 7 : x - w / 2, ny = y - h / 2;
      n.el.style.transform = `translate(${nx}px,${ny}px)`;
      const box = { x0: nx - 4, y0: ny - 3, x1: nx + w + 4, y1: ny + h + 3 };
      const clash = taken.some((o) => !(box.x1 < o.x0 || box.x0 > o.x1 || box.y1 < o.y0 || box.y0 > o.y1));
      const off = x < -100 || y < -20 || x > W + 100 || y > H + 20;
      n.el.classList.toggle('off', clash || off);
      if (!clash && !off) taken.push(box);
    }
  }
  const rank = (n) => n.cls.includes('t1') ? 0 : n.cls.includes('t2') ? 2 : n.cls.includes('t3') ? 3 : n.cls.includes('river') ? 4 : 5;

  function draw(recluster = false) {
    clampView();
    world.setAttribute('transform', `translate(${view.tx.toFixed(2)} ${view.ty.toFixed(2)}) scale(${view.s.toFixed(5)})`);
    mapEl.classList.toggle('near', view.s > 2.4);
    mapEl.classList.toggle('close', view.s > 4.5);
    // The title steps back once someone is exploring, and returns at the overview
    if (body.dataset.mode === 'map') body.classList.toggle('quiet', body.classList.contains('quiet') ? view.s > homeS * 1.25 : view.s > homeS * 1.6);
    if (recluster || Math.abs(Math.log(view.s / lastClusterS)) > .001) cluster();
    else positionMarks();
    positionNames(clusters.filter((c) => !c.tagEl.classList.contains('off')).map((c) => c.box));
    if (hotSlug) setHot(hotSlug, true);
    scaleBar();
    placePeek();
  }

  function scaleBar() {
    const pxPerMile = view.s / (KM_PER_UNIT / 1.609344);
    const nice = [.1, .25, .5, 1, 2, 5, 10, 20, 25, 50, 100];
    const miles = nice.find((m) => m * pxPerMile >= 70) || 100;
    const el = $('scale');
    el.querySelector('i').style.width = Math.round(miles * pxPerMile) + 'px';
    el.querySelector('span').textContent = `${miles} ${miles === 1 ? 'MILE' : 'MILES'}`;
  }

  /* ---------- Hover, focus and selection ---------- */
  function hover(c, on) {
    const slug = c.items.length === 1 ? c.items[0].slug : null;
    c.tagEl.classList.toggle('hot', on);
    c.el.classList.toggle('hot', on);
    document.querySelectorAll('.tb-set button').forEach((b) => b.classList.toggle('hot', on && c.items.some((i) => i.slug === b.dataset.slug)));
    if (slug) { if (on) showPeek(slug, 'mark'); else hidePeek(slug, 'mark'); }
    else if (on && peekOrigin === 'mark') hidePeek();
    if (on) announce(slug ? `${bySlug[slug].name}, ${bySlug[slug].site.area}` : `${c.items.length} projects: ${c.items.map((i) => i.name).join(', ')}`);
  }
  function setHot(slug, on) {
    hotSlug = on ? slug : null;
    for (const c of clusters) {
      const has = c.items.some((i) => i.slug === slug);
      c.el.classList.toggle('hot', on && has);
      c.tagEl.classList.toggle('hot', on && has);
    }
  }

  function pick(c) {
    closeCallout();
    if (c.items.length === 1) return open(c.items[0].slug);
    const b = bounds(c.items, 2);
    const spread = Math.max(b.x1 - b.x0, b.y1 - b.y0);
    const target = fitView(b, { pad: 90, maxS: S_MAX });
    // Zoom in while it will separate the group; at a single site, list the records there
    if (spread > 1.2 && target.s > view.s * 1.25) return flyTo(target);
    callout(c);
  }

  let calloutEl = null, calloutC = null;
  function callout(c) {
    closeCallout();
    calloutC = c;
    const el = document.createElement('div'); el.className = 'callout'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', `Projects at ${c.items[0].site.area}`);
    const streets = new Set(c.items.map((i) => (i.site.address || '').replace(/^\d+\s+/, '')));
    const street = streets.size === 1 ? [...streets][0] : '';
    el.innerHTML = `<h3><span>${esc(cityName(c) + (street ? ' · ' + street : ''))}</span><button type="button" aria-label="Close">×</button></h3>
      <ol>${c.items.map((i) => `<li><button type="button" data-slug="${i.slug}"><span class="n">${esc(i.id)}</span><span><span class="t">${esc(i.name)}</span></span></button></li>`).join('')}</ol>`;
    el.querySelector('h3 button').addEventListener('click', closeCallout);
    el.querySelectorAll('li button').forEach((b) => {
      b.addEventListener('click', () => open(b.dataset.slug));
      b.addEventListener('pointerenter', () => setHot(b.dataset.slug, true));
      b.addEventListener('pointerleave', () => setHot(b.dataset.slug, false));
    });
    marks.appendChild(el); calloutEl = el;
    placeCallout();
    el.querySelector('li button').focus({ preventScroll: true });
  }
  function placeCallout() {
    if (!calloutEl || !calloutC) return;
    const [x, y] = toScreen(calloutC.x, calloutC.y);
    const w = calloutEl.offsetWidth, h = calloutEl.offsetHeight;
    const left = Math.max(8, Math.min(W - w - 8, x)), top = Math.min(H - h - 8, y + 26);
    calloutEl.style.transform = `translate(${left}px,${top}px)`;
  }
  function closeCallout() { if (calloutEl) { calloutEl.remove(); calloutEl = calloutC = null; } }

  /* ---------- Pan and zoom: pointer, wheel, pinch, keys ---------- */
  const pointers = new Map();
  let dragFrom = null, pinchFrom = null, moved = 0;
  mapEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.mk,.callout,.zoom')) return;
    mapEl.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    cancelAnimationFrame(anim);
    moved = 0;
    if (pointers.size === 1) dragFrom = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchFrom = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: view.s, mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2, tx: view.tx, ty: view.ty }; }
  });
  mapEl.addEventListener('pointermove', (e) => {
    const r = mapEl.getBoundingClientRect();
    const [lon, lat] = unproject((e.clientX - r.left - view.tx) / view.s, (e.clientY - r.top - view.ty) / view.s);
    $('coord').textContent = `${lat.toFixed(4)}° N  ${Math.abs(lon).toFixed(4)}° W`;
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2 && pinchFrom) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const s = clampS(pinchFrom.s * d / pinchFrom.d);
      const wx = (pinchFrom.mx - r.left - pinchFrom.tx) / pinchFrom.s, wy = (pinchFrom.my - r.top - pinchFrom.ty) / pinchFrom.s;
      view.s = s; view.tx = mx - r.left - wx * s; view.ty = my - r.top - wy * s;
      moved = 99; draw(); placeCallout();
    } else if (dragFrom) {
      const dx = e.clientX - dragFrom.x, dy = e.clientY - dragFrom.y;
      moved = Math.max(moved, Math.hypot(dx, dy));
      if (moved < 3) return;
      mapEl.classList.add('grab');
      view.tx = dragFrom.tx + dx; view.ty = dragFrom.ty + dy;
      draw(); placeCallout();
    }
  });
  mapEl.addEventListener('pointerleave', () => { $('coord').textContent = ''; if (peekOrigin === 'mark') hidePeek(); });
  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    mapEl.classList.remove('grab');
    if (pointers.size < 2) pinchFrom = null;
    if (pointers.size === 1) { const [p] = [...pointers.values()]; dragFrom = { x: p[0], y: p[1], tx: view.tx, ty: view.ty }; }
    if (!pointers.size) { dragFrom = null; if (moved < 3 && e.type === 'pointerup' && !e.target.closest('.callout')) closeCallout(); }
  };
  mapEl.addEventListener('pointerup', endPointer);
  mapEl.addEventListener('pointercancel', endPointer);
  const clampS = (s) => Math.max(sMin, Math.min(S_MAX, s));
  function zoomAt(px, py, factor, ms = 0) {
    const s = clampS(view.s * factor), wx = (px - view.tx) / view.s, wy = (py - view.ty) / view.s;
    const target = { s, tx: px - wx * s, ty: py - wy * s };
    return ms ? flyTo(target, ms) : (Object.assign(view, target), draw(), placeCallout());
  }
  mapEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = mapEl.getBoundingClientRect();
    const k = e.ctrlKey ? .012 : .0022;
    cancelAnimationFrame(anim);
    zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * k * (e.deltaMode === 1 ? 16 : 1)));
  }, { passive: false });
  mapEl.addEventListener('dblclick', (e) => { if (e.target.closest('.mk,.callout,.zoom')) return; const r = mapEl.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, 2.2, 380); });
  $('zin').addEventListener('click', () => zoomAt(W / 2, H / 2, 1.8, 320));
  $('zout').addEventListener('click', () => zoomAt(W / 2, H / 2, 1 / 1.8, 320));
  $('zfit').addEventListener('click', () => { closeCallout(); flyTo(home()); });
  mapEl.addEventListener('keydown', (e) => {
    if (e.target !== mapEl) return;
    const step = 90, k = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (k) { e.preventDefault(); flyTo({ s: view.s, tx: view.tx + k[0], ty: view.ty + k[1] }, 180); }
    else if (e.key === '+' || e.key === '=') zoomAt(W / 2, H / 2, 1.6, 260);
    else if (e.key === '-' || e.key === '_') zoomAt(W / 2, H / 2, 1 / 1.6, 260);
    else if (e.key === '0') flyTo(home());
  });

  /* ---------- Title block: the register ---------- */
  const body = document.body;
  const tb = $('tblock');
  function renderRegister() {
    const nPlaced = placed.length;
    tb.innerHTML = `<div class="tb-row tb-seal"><canvas width="192" height="60" id="seal" aria-hidden="true"></canvas><div class="tb-firm">Freeman General Contracting</div></div>
      <div class="tb-row tb-meta"><span class="tb-k">R-001 / THE RECORD</span><div class="tb-title">Project register</div></div>
      <div class="tb-grid tb-meta"><div><span class="tb-k">Projects</span>${items.length}</div><div><span class="tb-k">On the map</span>${nPlaced}</div></div>
      <button type="button" class="register-toggle" id="reg-toggle" aria-expanded="false" aria-controls="tb-set"><span>Register <b>${items.length}</b></span><span aria-hidden="true">▴</span></button>
      <nav class="tb-set" id="tb-set" aria-label="Register of projects"><ol>${items.map((i) => `<li><button type="button" data-slug="${i.slug}"${i.placed ? '' : ' data-unplaced'}><span class="n">${esc(i.id)}</span><span class="t">${esc(i.name)}</span><span class="w">${i.placed ? esc(shortCity(i)) : 'Not placed'}</span></button></li>`).join('')}</ol></nav>
      <div class="tb-foot tb-meta"><span class="key"><i></i>At the site</span><span class="key"><i class="a"></i>Approximate area</span></div>`;
    tb.querySelectorAll('.tb-set button').forEach((b) => {
      b.addEventListener('click', () => open(b.dataset.slug));
      b.addEventListener('pointerenter', () => { setHot(b.dataset.slug, true); showPeek(b.dataset.slug, 'register'); });
      b.addEventListener('pointerleave', () => { setHot(b.dataset.slug, false); hidePeek(b.dataset.slug, 'register'); });
      b.addEventListener('focus', () => { setHot(b.dataset.slug, true); showPeek(b.dataset.slug, 'register'); });
      b.addEventListener('blur', () => { setHot(b.dataset.slug, false); hidePeek(b.dataset.slug, 'register'); });
    });
    $('reg-toggle').addEventListener('click', () => { const o = tb.classList.toggle('open'); $('reg-toggle').setAttribute('aria-expanded', o); });
    const cv = $('seal');
    if (window.FreemanBitmapEagle) window.FreemanBitmapEagle.load('/eagle/stamp.pbm').then(() => window.FreemanBitmapEagle.still(cv.getContext('2d'), getComputedStyle(body).color)).catch(() => cv.remove());
  }
  const shortCity = (i) => ({ 'Atlanta': 'ATL' }[i.city] || i.city);
  const fmtDate = (d) => { const [y, m, dd] = d.split('-').map(Number); return `${dd} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][m - 1]} ${y}`; };

  /* ---------- The time rule: watch the record grow ---------- */
  const rule = $('rule');
  const years = [...new Set(dated.map((i) => i.year))].sort((a, b) => a - b);
  const Y0 = years.length ? Math.min(years[0], NOW - 1) : NOW - 1;
  let playing = 0;
  function renderRule() {
    const undated = items.filter((i) => i.year === null).length;
    const empty = !years.length;
    rule.innerHTML = `<button type="button" class="play" id="play" aria-pressed="false"${empty ? ' disabled' : ''}><i></i><span>Watch it grow</span></button>
      <div class="track-wrap${empty ? ' empty' : ''}" id="track-wrap">
        <p class="rule-note" id="rule-note"></p>
        <div class="track"></div>
        ${empty ? '' : Array.from({ length: NOW - Y0 + 1 }, (_, k) => Y0 + k).map((y) => `<span class="yr${years.includes(y) ? ' has' : ''}" style="left:${pct(y)}%">${(y - Y0) % yrStep() === 0 || y === NOW ? `<small>${y}</small>` : ''}</span>`).join('')}
        <div class="handle" id="handle" role="slider" tabindex="0" aria-label="Show work completed by year" aria-valuemin="${Y0}" aria-valuemax="${NOW}" aria-valuenow="${year}"${empty ? ' aria-disabled="true"' : ''} style="left:100%"><span class="lab" id="hlab">Now</span></div>
      </div>
      <div class="undated"><span>Year not on file</span><b>${undated}</b></div>`;
    setYear(year, false);
    if (empty) return;
    const wrap = $('track-wrap'), handle = $('handle');
    const yAt = (cx) => { const r = wrap.getBoundingClientRect(); return Math.round(Y0 + Math.max(0, Math.min(1, (cx - r.left) / r.width)) * (NOW - Y0)); };
    let drag = false;
    wrap.addEventListener('pointerdown', (e) => { drag = true; wrap.setPointerCapture(e.pointerId); stop(); setYear(yAt(e.clientX)); handle.focus({ preventScroll: true }); });
    wrap.addEventListener('pointermove', (e) => { if (drag) setYear(yAt(e.clientX)); });
    wrap.addEventListener('pointerup', () => { drag = false; });
    wrap.addEventListener('pointercancel', () => { drag = false; });
    handle.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (d) { e.preventDefault(); stop(); setYear(Math.max(Y0, Math.min(NOW, year + d))); }
      if (e.key === 'Home') { e.preventDefault(); stop(); setYear(Y0); }
      if (e.key === 'End') { e.preventDefault(); stop(); setYear(NOW); }
    });
    $('play').addEventListener('click', () => (playing ? stop() : play()));
  }
  const pct = (y) => (y - Y0) / (NOW - Y0) * 100;
  const yrStep = () => (NOW - Y0 > 30 ? 10 : NOW - Y0 > 12 ? 5 : 1);
  function setYear(y, animate = true) {
    const before = new Set(placed.filter(shown).map((i) => i.slug));
    year = y;
    const h = $('handle');
    if (h) { h.style.left = (years.length ? pct(y) : 100) + '%'; h.setAttribute('aria-valuenow', y); h.setAttribute('aria-valuetext', y === NOW ? 'Now' : String(y)); }
    if ($('hlab')) $('hlab').textContent = y === NOW ? 'Now' : y;
    const count = items.filter((i) => i.year !== null && i.year <= y).length;
    $('rule-note').innerHTML = years.length
      ? (y === NOW ? `<b>${dated.length}</b> dated · drag back through the record` : `<b>${count}</b> completed by ${y}`)
      : `<span class="long">No completion years are on file yet · each project joins the rule once its year is verified</span><span class="short">No years on file yet</span>`;
    body.classList.toggle('past', y < NOW);
    $('rule-note').classList.toggle('right', years.length > 0 && pct(y) < 50);
    if (animate) for (const i of placed) if (shown(i) && !before.has(i.slug)) lastArrive.add(i.slug);
    // Arrivals are keyed by cluster; mark any cluster containing a newcomer
    if (animate) { const keys = new Set(); cluster(); for (const c of clusters) if (c.items.some((i) => lastArrive.has(i.slug))) keys.add(c.key); lastArrive.clear(); keys.forEach((k) => lastArrive.add(k)); renderMarks(); }
    document.querySelectorAll('.tb-set button').forEach((b) => { const i = bySlug[b.dataset.slug]; b.classList.toggle('gone', i.year !== null && i.year > y); });
    // Undated records stay on the map, quietly, while looking into the past
    for (const c of clusters) c.el.classList.toggle('undated', y < NOW && c.items.every((i) => i.year === null));
    positionNames(clusters.filter((c) => !c.tagEl.classList.contains('off')).map((c) => c.box));
  }
  function play() {
    if (!years.length) return;
    $('play').setAttribute('aria-pressed', 'true');
    let y = Y0; setYear(y);
    const tick = () => { y += 1; setYear(y); if (y < NOW) playing = setTimeout(tick, reduced ? 120 : 420); else stop(); };
    playing = setTimeout(tick, 500);
  }
  function stop() { clearTimeout(playing); playing = 0; $('play')?.setAttribute('aria-pressed', 'false'); }

  /* ---------- The project record ---------- */
  let savedView = null, returnFocus = null;
  const recEl = $('record');
  function open(slug, { push = true } = {}) {
    const it = bySlug[slug]; if (!it) return;
    closeCallout(); stop(); hidePeek();
    if (body.dataset.mode !== 'record') { savedView = { ...view }; returnFocus = document.activeElement; }
    openSlug = slug;
    if (it.slug === 'beetlecat') body.dataset.feature = 'beetlecat';
    else delete body.dataset.feature;
    body.dataset.mode = 'record';
    recEl.hidden = false;
    recEl.innerHTML = recordHTML(it);
    recEl.classList.remove('enter'); void recEl.offsetWidth; if (!reduced) recEl.classList.add('enter');
    recEl.scrollTop = 0;
    wireRecord(it);
    $('crumb').textContent = `No. ${it.id} / ${it.name}`;
    if (push) history.pushState({ p: slug }, '', `?p=${encodeURIComponent(slug)}`);
    document.title = `${it.name} — The Record`;
    requestAnimationFrame(() => {
      size();
      if (it.placed) {
        const target = it.site.precision === 'area' ? fitView(bounds([it]), { pad: 40, maxS: 6 }) : centreOn(it.x, it.y, Math.max(view.s, 5.5));
        flyTo(target, 750);
      } else draw(true);
      recEl.focus({ preventScroll: true });
    });
    announce(`${it.name}. ${it.site.area || it.location}.`);
  }
  function close({ push = true } = {}) {
    if (body.dataset.mode !== 'record') return;
    body.dataset.mode = 'map';
    recEl.hidden = true; recEl.innerHTML = '';
    openSlug = null;
    delete body.dataset.feature;
    $('crumb').textContent = '';
    document.title = 'The Record — Freeman';
    if (push) history.pushState({}, '', location.pathname);
    requestAnimationFrame(() => {
      size();
      flyTo(savedView || home(), 650).then(() => {
        const mk = markLayer.querySelector(`.mk[data-slug="${returnFocus?.dataset?.slug || ''}"]`);
        (returnFocus && document.contains(returnFocus) ? returnFocus : mk || mapEl).focus({ preventScroll: true });
      });
    });
  }

  function recordHTML(it) {
    if (it.slug === 'beetlecat' && window.BEETLECAT_STORY) {
      const feature = window.BEETLECAT_STORY.render(it);
      if (feature) return feature;
    }
    const s = it.site;
    const where = [];
    if (s.precision === 'venue') where.push(`<span>${esc(s.address)}</span>`, `<span>${esc(s.area)}</span>`, `<span>${s.lat.toFixed(4)}° N ${Math.abs(s.lon).toFixed(4)}° W</span>`);
    else if (s.precision === 'area') where.push(`<span>${esc(s.area)}</span>`, `<span class="approx">Approximate area · ${esc(s.reason)}</span>`);
    else where.push(`<span>${esc(it.location)}</span>`, `<span class="approx">${esc(s.reason)}</span>`);
    const credits = (it.credits || []).filter((c) => c[0] !== 'Client');
    const missing = [];
    if (it.year === null) missing.push('Completion year');
    if (!it.photos.length) missing.push('Photography');
    if (!it.summary) missing.push('The story');
    missing.push('Drawings and field record');
    const near = it.placed ? placed.filter((j) => j !== it).map((j) => ({ j, d: Math.hypot(j.x - it.x, j.y - it.y) * KM_PER_UNIT / 1.609344 })).sort((a, b) => a.d - b.d).slice(0, 3) : [];
    const photo = it.photos[0];
    const fig = it.photos.length
      ? `<figure class="r-fig"><div class="r-photo"><img id="r-img" src="${esc(photo.src)}" alt="${esc(it.name)}, finished work"></div>
        ${it.photos.length > 1 ? `<div class="r-thumbs" role="group" aria-label="Photographs">${it.photos.map((p, k) => `<button type="button" data-k="${k}" aria-pressed="${k === 0}" aria-label="Photograph ${k + 1} of ${it.photos.length}" style="--ar:${p.w && p.h ? (p.w / p.h).toFixed(3) : 1.4}"><img src="${esc(p.src)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
        <figcaption class="r-cap"><span>Finished work${credits.find((c) => c[0] === 'Photography') ? ` · Photograph <b>${esc(credits.find((c) => c[0] === 'Photography')[1])}</b>` : ''}</span><span id="r-count">${it.photos.length > 1 ? `1 / ${it.photos.length}` : ''}</span></figcaption></figure>`
      : `<figure class="r-fig"><div class="nof"><svg preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true"><line x1="0" y1="0" x2="100" y2="100"/><line x1="100" y1="0" x2="0" y2="100"/></svg><span>Photography not on file</span></div></figure>`;
    return `<header class="r-head"><div>
        <p class="r-k"><b>No. ${esc(it.id)}</b> / ${esc(it.type)}</p>
        <h2 class="r-name" id="rec-name">${esc(it.name)}</h2>
        <p class="r-where">${where.join('')}</p></div>
        <button type="button" class="r-back" id="r-back" aria-label="Back to the map">← Map</button></header>
      <div class="r-body">${fig}
        <div class="r-notes">
          <div class="r-grid">
            <div><span class="tb-k">Type</span>${esc(it.type)}</div>
            <div><span class="tb-k">Completed</span><span class="muted">Not on file</span></div>
            ${it.client ? `<div class="wide"><span class="tb-k">Client</span>${esc(it.client)}</div>` : ''}
            ${credits.filter((c) => c[0] !== 'Photography').map((c) => `<div class="wide"><span class="tb-k">${esc(c[0])}</span>${esc(c[1])}</div>`).join('')}
          </div>
          ${it.summary ? `<p class="r-story">${esc(it.summary)}</p><p class="r-src">As published on the project page</p>` : ''}
          <p class="r-missing"><span>Not yet on file</span>${missing.map(esc).join(' · ')}</p>
          ${near.length ? `<h3 class="r-h">Nearest in the record</h3><ul class="r-list">${near.map(({ j, d }) => `<li><button type="button" data-open="${j.slug}"><span><span class="n">${esc(j.id)}</span><span class="t">${esc(j.name)}</span></span><span class="m">${j.site.precision === 'area' || it.site.precision === 'area' ? '≈ ' : ''}${d < .1 ? 'Same site' : d < 10 ? d.toFixed(1) + ' mi' : Math.round(d) + ' mi'}</span></button></li>`).join('')}</ul>` : ''}
          <a class="r-out" href="/project-${esc(it.slug)}"><span>Full project</span><span aria-hidden="true">→</span></a>
        </div></div>`;
  }
  function wireRecord(it) {
    $('r-back').addEventListener('click', () => close());
    if (window.BEETLECAT_STORY?.wire(recEl, it)) return;
    recEl.querySelectorAll('[data-open]').forEach((b) => {
      b.addEventListener('click', () => open(b.dataset.open));
      b.addEventListener('pointerenter', () => setHot(b.dataset.open, true));
      b.addEventListener('pointerleave', () => setHot(b.dataset.open, false));
    });
    recEl.querySelectorAll('.r-thumbs button').forEach((b) => b.addEventListener('click', () => {
      const k = +b.dataset.k, img = $('r-img');
      img.src = it.photos[k].src; img.classList.remove('in'); void img.offsetWidth; img.classList.add('in');
      recEl.querySelectorAll('.r-thumbs button').forEach((o) => o.setAttribute('aria-pressed', o === b));
      $('r-count').textContent = `${k + 1} / ${it.photos.length}`;
    }));
  }

  /* ---------- Find ---------- */
  const q = $('q'), found = $('found');
  let results = [], sel = -1;
  q.addEventListener('input', search);
  q.addEventListener('focus', () => { if (q.value) search(); });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!results.length) return; sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length; paintResults(); }
    else if (e.key === 'Escape') { endSearch(); }
  });
  $('find').addEventListener('submit', (e) => { e.preventDefault(); if (results.length) choose(results[Math.max(0, sel)]); });
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.find')) found.hidden = true, q.setAttribute('aria-expanded', 'false'); });
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ’']/g, '');
  function search() {
    const t = norm(q.value.trim());
    if (!t) { endSearch(false); return; }
    const proj = items.filter((i) => [i.name, i.location, i.site.area, i.type, i.client].some((f) => norm(f).includes(t)))
      .sort((a, b) => (norm(b.name).startsWith(t) - norm(a.name).startsWith(t)));
    const plc = G.places.filter((p) => norm(p[0]).includes(t) && !proj.some((i) => norm(i.name) === norm(p[0]))).slice(0, 4);
    results = [...proj.slice(0, 6).map((i) => ({ kind: 'p', i })), ...plc.map((p) => ({ kind: 'place', p }))];
    sel = results.length ? 0 : -1;
    paintResults();
  }
  function paintResults() {
    found.hidden = false; q.setAttribute('aria-expanded', 'true');
    found.innerHTML = results.length ? results.map((r, k) => r.kind === 'p'
      ? `<li role="option" id="f${k}" aria-selected="${k === sel}" data-k="${k}"><span class="n">${esc(r.i.id)}</span><span>${esc(r.i.name)}</span><span class="w">${esc(r.i.placed ? r.i.site.area.split(',')[0] : 'Not placed')}</span></li>`
      : `<li role="option" id="f${k}" aria-selected="${k === sel}" data-k="${k}"><span class="n">◦</span><span>${esc(r.p[0])}</span><span class="w">Place</span></li>`).join('')
      : `<li class="none">Nothing in the record by that name</li>`;
    q.setAttribute('aria-activedescendant', sel >= 0 ? 'f' + sel : '');
    found.querySelectorAll('[data-k]').forEach((li) => li.addEventListener('click', () => choose(results[+li.dataset.k])));
  }
  function endSearch(clear = true) { found.hidden = true; q.setAttribute('aria-expanded', 'false'); results = []; if (clear) q.value = ''; }
  function choose(r) {
    endSearch();
    q.blur();
    if (r.kind === 'p') return open(r.i.slug);
    const [, x, y, t] = r.p;
    flyTo(centreOn(x, y, Math.max(view.s, t === 3 ? 7 : t === 2 ? 2.4 : 1.6)), 800);
  }

  /* ---------- Keys, history, resize ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (calloutEl) { closeCallout(); return; }
      if (!found.hidden) return;
      if (body.dataset.mode === 'record') close();
    }
    if (e.key === '/' && document.activeElement !== q && body.dataset.mode === 'map') { e.preventDefault(); q.focus(); }
  });
  addEventListener('popstate', () => {
    const p = new URLSearchParams(location.search).get('p');
    if (p && bySlug[p]) open(p, { push: false }); else close({ push: false });
  });
  let homeS = 1;
  const home = () => fitView(placedBounds(), { pad: 90, maxS: 4 });
  new ResizeObserver(() => {
    const was = { W, H };
    size();
    if (!was.W) return;
    // Keep the centre of the drawing fixed as the sheet changes size
    view.tx += (W - was.W) / 2; view.ty += (H - was.H) / 2;
    sMin = Math.min(W / (G.box.x1 - G.box.x0), H / (G.box.y1 - G.box.y0)) * .9;
    names.forEach((n) => (n.w = 0));
    draw(true); placeCallout();
  }).observe(mapEl);

  function announce(t) { $('announce').textContent = t; }

  /* ---------- Begin: the drawing plots, then the work appears ---------- */
  renderRegister();
  size();
  sMin = Math.min(W / (G.box.x1 - G.box.x0), H / (G.box.y1 - G.box.y0)) * .9;
  const h = home(); homeS = h.s;
  Object.assign(view, h);
  renderRule();
  draw(true);
  if (!reduced) { body.classList.add('plot'); setTimeout(() => body.classList.remove('plot'), 1600); }
  const p0 = new URLSearchParams(location.search).get('p');
  if (p0 && bySlug[p0]) { history.replaceState({ p: p0 }, '', location.search); savedView = { ...h }; open(p0, { push: false }); }

  // For automated checks only
  window.__record = { items, view, setYear, open, close, get clusters() { return clusters; } };
})();
