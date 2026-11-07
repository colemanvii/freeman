/* Projects — the map is the index; the projects are the stories.
   Identity, photography and story come from /records.js, partner credits and links from /project-credits.js,
   place from sites.js, photograph sizes from photos.js, geography from geo.js (street detail: geo-detail.js).
   Nothing here estimates a coordinate, a year or a credit. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const G = window.RECORD_GEO, SITES = window.RECORD_SITES, REG = window.RECORDS.projects;
  const CREDITS = window.FREEMAN_CREDITS || { roles: [], partners: {}, projects: {} }, PHOTOS = window.RECORD_PHOTOS || {};
  const phone = () => matchMedia('(max-width:760px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NOW = 2026;
  const KM_PER_UNIT = 0.11132; // one map unit is 1/1000 degree of latitude
  const project = (lon, lat) => [(lon - G.proj.lon0) * G.proj.cos * G.proj.k, (G.proj.lat0 - lat) * G.proj.k];
  const unproject = (x, y) => [x / (G.proj.cos * G.proj.k) + G.proj.lon0, G.proj.lat0 - y / G.proj.k];

  /* ---------- Photographs: resized copies from photos.js; the published original is always the largest source ---------- */
  function photo(src) {
    const key = src.replace(/^\//, ''), m = PHOTOS[key];
    return m ? { src: '/' + key, w: m.w, h: m.h, set: m.set } : { src: '/' + key, w: 0, h: 0, set: [[0, '/' + key]] };
  }
  const srcset = (p) => p.set.filter(([w]) => w).map(([w, u]) => `${u} ${w}w`).join(', ');
  const sized = (p, px) => (p.set.find(([w]) => w >= px) || p.set[p.set.length - 1])[1];

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
    it.photos = (p.gallery && p.gallery.length ? p.gallery : p.image ? [{ src: p.image }] : []).map((g) => photo(g.src));
    return it;
  }).sort((a, b) => a.id.localeCompare(b.id));
  const placed = items.filter((i) => i.placed);
  const order = items; // the register order; ← → step through it
  const bySlug = Object.fromEntries(items.map((i) => [i.slug, i]));
  const dated = items.filter((i) => i.year !== null);

  /* ---------- Sheet border zone references ---------- */
  $('ref-top').innerHTML = 'ABCDEFGH'.split('').map((c) => `<span>${c}</span>`).join('');
  $('ref-left').innerHTML = '123456'.split('').map((c) => `<span>${c}</span>`).join('');

  /* ---------- Base map ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = $('svg'), world = $('world'), mapEl = $('map'), marks = $('marks');
  [['states', 'l-states', 0], ['counties', 'l-counties', .08], ['lakes', 'l-lakes', .2], ['rivers', 'l-rivers', .28], ['limits', 'l-limits', .4], ['local', 'l-local', .42], ['primary', 'l-primary', .45], ['interstates', 'l-roads', .5]]
    .forEach(([k, cls, d]) => { const p = document.createElementNS(NS, 'path'); if (G[k]) p.setAttribute('d', G[k]); p.setAttribute('class', cls); p.dataset.layer = k; p.style.setProperty('--d', d + 's'); world.appendChild(p); });
  // Street-level layers only show when zoomed in, so they arrive after the first paint (or at once, if needed sooner).
  let detail = null;
  function loadDetail() {
    if (detail || G.local) return;
    detail = document.createElement('script');
    detail.src = '/record-assets/geo-detail.js?v=20261026-map-projects';
    detail.onload = () => { const D = window.RECORD_GEO_DETAIL || {}; for (const k in D) world.querySelector(`[data-layer="${k}"]`)?.setAttribute('d', D[k]); };
    document.head.appendChild(detail);
  }

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
    if (body.dataset.mode === 'record' && phone()) {
      // Where the sheet rests (offsetTop ignores its transforms), not where it is mid-gesture
      const top = rec.offsetTop + sheet.y - mapEl.getBoundingClientRect().top;
      return { x: 0, y: 0, w: W, h: Math.max(120, Math.min(H, top)) };
    }
    // The heading occupies its own layout row; it no longer covers the map.
    return { x: 0, y: 0, w: W, h: H };
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

  let anim = 0, flying = false;
  function flyTo(target, ms = 650) {
    cancelAnimationFrame(anim);
    if (reduced || ms === 0) { flying = false; Object.assign(view, target); draw(true); return Promise.resolve(); }
    flying = true;
    const from = { ...view }, t0 = performance.now();
    // Interpolate scale geometrically and keep the path through the midpoint steady
    const fx = (W / 2 - from.tx) / from.s, fy = (H / 2 - from.ty) / from.s, gx = (W / 2 - target.tx) / target.s, gy = (H / 2 - target.ty) / target.s;
    // A long flight eases out mid-route so the drawing stays on screen: at street scale the ground between
    // two distant places is empty paper. Keep the travel in screen terms within about one map width.
    const travel = Math.hypot(gx - fx, gy - fy), sMid = Math.sqrt(from.s * target.s);
    const dip = Math.min(1, (Math.min(W, H) * .9) / Math.max(1e-6, travel * sMid));
    return new Promise((done) => {
      const step = (now) => {
        const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        const s = from.s * Math.pow(target.s / from.s, e) * Math.pow(dip, Math.sin(Math.PI * e)), cx = fx + (gx - fx) * e, cy = fy + (gy - fy) * e;
        view.s = s; view.tx = W / 2 - cx * s; view.ty = H / 2 - cy * s;
        draw(k === 1 || Math.abs(Math.log(s / lastClusterS)) > .08);
        if (k < 1) anim = requestAnimationFrame(step); else { flying = false; Object.assign(view, target); draw(true); done(); }
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
    // Most scale changes (every frame of a pinch or a flight) leave the groups as they were: keep the
    // elements and only move them. The marks are rebuilt only when a group forms or splits.
    const sig = out.map((c) => c.key).sort().join(';');
    if (sig === clusterSig && !lastArrive.size) {
      const old = new Map(clusters.map((c) => [c.key, c]));
      for (const c of out) { const o = old.get(c.key); c.el = o.el; c.tagEl = o.tagEl; c.areaEl = o.areaEl; c.tw = o.tw; }
      clusters = out;
      positionMarks();
      return;
    }
    clusterSig = sig;
    clusters = out;
    renderMarks();
  }
  let clusterSig = '';
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
      if (c.items.some((i) => i.slug === openSlug)) b.classList.add('on');
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
    for (const c of clusters) c.tw = c.tagEl.offsetWidth || 120; // one layout read for all tags, not one per frame
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
      peek.innerHTML = '<img src="' + esc(sized(it.photos[0], 480)) + '" alt="" decoding="async" loading="eager">' +
        '<div class="photo-peek-copy"><span class="photo-peek-index">PROJECT / ' + esc(it.id) + ' · ' + esc(it.type) + '</span>' +
        '<strong>' + esc(it.name) + '</strong><span class="photo-peek-place">' + esc(it.site.area || it.location) + '</span>' +
        '<span class="photo-peek-action">OPEN PROJECT →</span></div>';
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
      const tw = c.tw || 120, th = 18;
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
    if (view.s > 1.8) loadDetail();
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
      <div class="tb-row tb-meta"><span class="tb-k">P-001 / PROJECTS</span><div class="tb-title">Project register</div></div>
      <div class="tb-grid tb-meta"><div><span class="tb-k">Projects</span>${items.length}</div><div><span class="tb-k">On the map</span>${nPlaced}</div></div>
      <button type="button" class="register-toggle" id="reg-toggle" aria-expanded="false" aria-controls="tb-set"><span>All projects <b>${items.length}</b></span><span aria-hidden="true">▴</span></button>
      <nav class="tb-set" id="tb-set" aria-label="Register of projects"><ol>${items.map((i) => `<li><button type="button" data-slug="${i.slug}"${i.placed ? '' : ' data-unplaced'}><span class="n">${esc(i.id)}</span><span class="t">${esc(i.name)}</span><span class="w">${i.placed ? esc(shortCity(i)) : 'Not placed'}</span></button></li>`).join('')}</ol>
        ${(SITES.inProgress || []).length ? `<p class="tb-sub">In progress</p><ol class="tb-progress">${SITES.inProgress.map((i) => `<li><span class="n">—</span><span class="t">${esc(i.name)}</span><span class="w">${esc(i.place.split(',')[0])}</span></li>`).join('')}</ol>` : ''}</nav>
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

  /* ---------- The project: an editorial panel beside the map; on phones, a sheet over it ----------
     History: opening a project from the map is one step (Back returns to the map); moving between
     projects replaces that step, so Back never replays every project visited. */
  let savedView = null, returnFocus = null;
  const recEl = $('record');
  const credits = (it) => (CREDITS.roles || []).map(([role, label, plural]) => {
    const list = (CREDITS.projects[it.slug] || []).filter((c) => c.role === role && CREDITS.partners[c.partner]);
    return list.length ? { role, label: list.length > 1 && plural ? plural : label, people: list.map((c) => ({ ...CREDITS.partners[c.partner], note: c.note || '' })) } : null;
  }).filter(Boolean);
  const partner = (p) => p.url
    ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="p-link"><span>${esc(p.name)}</span><span class="p-out" aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>`
    : `<span class="p-name-only">${esc(p.name)}</span>`;

  function open(slug, { push = true, focus = null } = {}) {
    const it = bySlug[slug]; if (!it) return;
    closeCallout(); stop(); hidePeek(); closeIndex();
    const switching = body.dataset.mode === 'record';
    if (!switching) { savedView = { ...view }; returnFocus = document.activeElement; }
    openSlug = slug;
    markOpen();
    body.dataset.mode = 'record';
    tb.classList.remove('open'); $('reg-toggle')?.setAttribute('aria-expanded', 'false');
    recEl.hidden = false;
    recEl.innerHTML = recordHTML(it);
    if (!switching && !reduced) { recEl.classList.remove('enter'); void recEl.offsetWidth; recEl.classList.add('enter'); }
    wireRecord(it);
    $('crumb').textContent = `No. ${it.id} / ${it.name}`;
    if (push) {
      const st = { p: slug, d: switching ? (history.state?.d || 0) : (history.state?.d || 0) + 1 };
      if (switching) history.replaceState(st, '', `?p=${encodeURIComponent(slug)}`);
      else history.pushState(st, '', `?p=${encodeURIComponent(slug)}`);
    }
    document.title = `${it.name} — Freeman General Contracting`;
    requestAnimationFrame(() => {
      size();
      if (phone()) setSheet(switching ? sheet.state : 'half', { fly: false });
      fly(it);
      if (focus) recEl.querySelector(`[data-act="${focus}"]`)?.focus({ preventScroll: true });
      else if (!switching) recEl.focus({ preventScroll: true });
    });
    preloadNeighbours(it);
    announce(`${it.name}. ${it.site.area || it.location}.`);
  }
  function fly(it) {
    if (!it.placed) return draw(true);
    if (it.site.precision === 'area') return flyTo(fitView(bounds([it]), { pad: 40, maxS: 6 }), 650);
    // Close enough that the project stands as its own mark, unless it shares a site with others
    const R = (matchMedia('(pointer:coarse)').matches ? 30 : 24) + 8;
    const gap = Math.min(...placed.filter((j) => j !== it).map((j) => Math.hypot(j.x - it.x, j.y - it.y)).filter((d) => d > .05));
    const s = Math.min(S_MAX, Math.max(view.s, 5.5, Number.isFinite(gap) ? R / gap : 0));
    flyTo(centreOn(it.x, it.y, s), 650);
  }
  function close({ push = true } = {}) {
    if (body.dataset.mode !== 'record') return;
    // The project was opened from the map in this visit: step back to that entry, as browser Back would.
    if (push && (history.state?.d || 0) > 0 && history.state?.p) { history.back(); return; }
    viewer.open && viewer.close();
    body.dataset.mode = 'map';
    recEl.hidden = true; recEl.innerHTML = '';
    recEl.style.removeProperty('--y');
    openSlug = null;
    markOpen();
    $('crumb').textContent = '';
    placeInstruments();
    document.title = 'Projects — Freeman General Contracting';
    if (push) history.replaceState({ d: history.state?.d || 0 }, '', location.pathname);
    requestAnimationFrame(() => {
      size();
      flyTo(savedView || home(), 650).then(() => {
        const mk = markLayer.querySelector(`.mk[data-slug="${returnFocus?.dataset?.slug || ''}"]`);
        (returnFocus && document.contains(returnFocus) ? returnFocus : mk || mapEl).focus({ preventScroll: true });
      });
    });
  }
  function step(dir, focus) {
    const k = order.findIndex((i) => i.slug === openSlug);
    if (k < 0) return;
    open(order[(k + dir + order.length) % order.length].slug, { focus });
  }
  function markOpen() {
    for (const c of clusters) c.el.classList.toggle('on', c.items.some((i) => i.slug === openSlug));
    tb.querySelectorAll('.tb-set button').forEach((b) => b.toggleAttribute('aria-current', b.dataset.slug === openSlug));
  }
  function preloadNeighbours(it) {
    const k = order.indexOf(it);
    const later = window.requestIdleCallback || ((f) => setTimeout(f, 400));
    later(() => [order[(k + 1) % order.length], order[(k - 1 + order.length) % order.length]].forEach((j) => {
      if (j.photos[0]) { const im = new Image(); im.decoding = 'async'; im.src = sized(j.photos[0], 960); }
    }));
  }

  function recordHTML(it) {
    const s = it.site;
    const where = s.precision === 'venue' ? [s.address, s.area] : s.precision === 'area' ? [s.area, 'Approximate area'] : [it.location];
    const cr = credits(it);
    const by = cr.find((c) => c.role === 'photography');
    const near = it.placed ? placed.filter((j) => j !== it).map((j) => ({ j, d: Math.hypot(j.x - it.x, j.y - it.y) * KM_PER_UNIT / 1.609344 })).sort((a, b) => a.d - b.d).slice(0, 3) : [];
    const ph = it.photos;
    const fig = ph.length ? `<figure class="p-fig">
        <div class="p-photos" id="p-photos" tabindex="0" role="group" aria-roledescription="carousel" aria-label="${esc(it.name)} photographs">${ph.map((p, j) => `<div class="p-slide" aria-label="${j + 1} of ${ph.length}"><button type="button" class="p-enlarge" data-k="${j}" aria-label="View photograph ${j + 1} of ${ph.length} full screen"><img src="${esc(sized(p, 960))}" srcset="${esc(srcset(p))}" sizes="(max-width:760px) calc(100vw - 32px), 520px"${p.w ? ` width="${p.w}" height="${p.h}"` : ''} alt="${esc(it.name)}, photograph ${j + 1} of ${ph.length}" decoding="async"${j ? ' loading="lazy"' : ' fetchpriority="high"'} draggable="false"></button></div>`).join('')}</div>
        <figcaption class="p-cap"><span class="p-count" id="p-count">${ph.length > 1 ? `01 / ${String(ph.length).padStart(2, '0')}` : ''}</span><span class="p-by">${by ? `Photograph ${by.people.map((p) => esc(p.name)).join(', ')}` : ''}</span>${ph.length > 1 ? `<span class="p-arrows"><button type="button" data-ph="-1" aria-label="Previous photograph">←</button><button type="button" data-ph="1" aria-label="Next photograph">→</button></span>` : ''}</figcaption></figure>` : '';
    return `<div class="p-top" id="p-top">
        <div class="p-grip" aria-hidden="true"></div>
        <div class="p-bar">
          <span class="p-k"><b>No. ${esc(it.id)}</b><span class="p-type"> / ${esc(it.type)}</span></span>
          <span class="p-ctl">
            <button type="button" data-act="prev" aria-label="Previous project">←</button>
            <button type="button" data-act="next" aria-label="Next project">→</button>
            <button type="button" data-act="index" class="p-index-btn" aria-expanded="false" aria-controls="p-index">Index</button>
            <button type="button" data-act="close" class="p-close" aria-label="Close project, return to the map">× <span>Map</span></button>
          </span>
        </div>
        <h2 class="p-name" id="rec-name">${esc(it.name)}</h2>
        <p class="p-where">${where.filter(Boolean).map((w) => `<span>${esc(w)}</span>`).join('')}</p>
      </div>
      <div class="p-scroll" id="p-scroll">
        ${fig}
        ${it.summary ? `<p class="p-story">${esc(it.summary)}</p>` : ''}
        ${cr.length ? `<dl class="p-credits">${cr.map((c) => `<div><dt>${esc(c.label)}</dt><dd>${c.people.map((p) => partner(p) + (p.note ? ` <span class="p-note">${esc(p.note)}</span>` : '')).join('<br>')}</dd></div>`).join('')}</dl>` : ''}
        <a class="p-full" href="/project-${esc(it.slug)}"><span>Full project</span><span aria-hidden="true">→</span></a>
        ${near.length ? `<h3 class="p-h">Nearby</h3><ul class="p-near">${near.map(({ j, d }) => `<li><button type="button" data-open="${j.slug}"><span class="n">${esc(j.id)}</span><span class="t">${esc(j.name)}</span><span class="m">${j.site.precision === 'area' || it.site.precision === 'area' ? '≈ ' : ''}${d < .1 ? 'Same site' : d < 10 ? d.toFixed(1) + ' mi' : Math.round(d) + ' mi'}</span></button></li>`).join('')}</ul>` : ''}
      </div>
      <nav class="p-index" id="p-index" hidden aria-label="All projects"><ol>${order.map((j) => `<li><button type="button" data-open="${j.slug}"${j === it ? ' aria-current="true"' : ''}><span class="n">${esc(j.id)}</span><span class="t">${esc(j.name)}</span><span class="w">${j.placed ? esc(shortCity(j)) : 'Not placed'}</span></button></li>`).join('')}</ol></nav>`;
  }

  function wireRecord(it) {
    recEl.querySelector('[data-act="prev"]').addEventListener('click', () => step(-1, 'prev'));
    recEl.querySelector('[data-act="next"]').addEventListener('click', () => step(1, 'next'));
    recEl.querySelector('[data-act="close"]').addEventListener('click', () => close());
    recEl.querySelector('[data-act="index"]').addEventListener('click', toggleIndex);
    recEl.querySelectorAll('[data-open]').forEach((b) => {
      b.addEventListener('click', () => open(b.dataset.open));
      b.addEventListener('pointerenter', () => setHot(b.dataset.open, true));
      b.addEventListener('pointerleave', () => setHot(b.dataset.open, false));
    });
    const strip = $('p-photos');
    if (strip) {
      const count = $('p-count'), total = String(it.photos.length).padStart(2, '0');
      const at = () => Math.round(strip.scrollLeft / Math.max(1, strip.clientWidth));
      let raf = 0;
      strip.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (count) count.textContent = `${String(at() + 1).padStart(2, '0')} / ${total}`; }); }, { passive: true });
      const go = (k) => strip.scrollTo({ left: Math.max(0, Math.min(it.photos.length - 1, k)) * strip.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
      recEl.querySelectorAll('[data-ph]').forEach((b) => b.addEventListener('click', () => go(at() + +b.dataset.ph)));
      strip.addEventListener('keydown', (e) => { const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); go(at() + d); } });
      recEl.querySelectorAll('.p-enlarge').forEach((b) => b.addEventListener('click', () => showViewer(it, +b.dataset.k)));
    }
    if (phone()) wireSheet();
  }

  /* Index: every project, without leaving the one you are reading */
  function toggleIndex() {
    const ix = $('p-index'), btn = recEl.querySelector('[data-act="index"]');
    if (!ix) return;
    const show = ix.hidden;
    ix.hidden = !show; btn.setAttribute('aria-expanded', show);
    recEl.classList.toggle('indexing', show);
    recEl.style.setProperty('--index-top', $('p-top').offsetHeight + 'px');
    if (show) { if (phone() && sheet.state !== 'full') setSheet('full'); (ix.querySelector('[aria-current]') || ix.querySelector('button')).focus({ preventScroll: true }); ix.querySelector('[aria-current]')?.scrollIntoView({ block: 'center' }); }
  }
  function closeIndex() { const ix = $('p-index'); if (ix && !ix.hidden) toggleIndex(); }

  /* Viewer: one photograph at its published size, nothing else on screen */
  const viewer = $('viewer');
  let viewing = null;
  function showViewer(it, k) {
    viewing = { it, k };
    paintViewer();
    if (!viewer.open) viewer.showModal();
  }
  function paintViewer() {
    const { it, k } = viewing, p = it.photos[k], n = it.photos.length;
    const by = credits(it).find((c) => c.role === 'photography');
    viewer.innerHTML = `<div class="v-bar"><span>${esc(it.name)}${n > 1 ? ` · ${String(k + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}` : ''}</span><button type="button" data-v="close" aria-label="Close photograph">× Close</button></div>
      <div class="v-img"><img src="${esc(p.src)}" srcset="${esc(srcset(p))}" sizes="100vw" alt="${esc(it.name)}, photograph ${k + 1} of ${n}"></div>
      <div class="v-foot"><span>${by ? `Photograph ${by.people.map((x) => esc(x.name)).join(', ')}` : ''}</span>${n > 1 ? `<span class="v-arrows"><button type="button" data-v="-1" aria-label="Previous photograph">← Prev</button><button type="button" data-v="1" aria-label="Next photograph">Next →</button></span>` : ''}</div>`;
    viewer.querySelector('[data-v="close"]').addEventListener('click', () => viewer.close());
    viewer.querySelectorAll('[data-v="-1"],[data-v="1"]').forEach((b) => b.addEventListener('click', () => { viewing.k = (k + +b.dataset.v + n) % n; paintViewer(); viewer.querySelector(`[data-v="${b.dataset.v}"]`)?.focus(); }));
  }
  viewer.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (d && viewing) { e.preventDefault(); e.stopPropagation(); const n = viewing.it.photos.length; viewing.k = (viewing.k + d + n) % n; paintViewer(); }
  });
  viewer.addEventListener('click', (e) => { if (e.target === viewer || e.target.classList.contains('v-img')) viewer.close(); });
  viewer.addEventListener('close', () => {
    if (!viewing) return;
    const strip = $('p-photos');
    if (strip) strip.scrollLeft = viewing.k * strip.clientWidth;
    recEl.querySelector(`.p-enlarge[data-k="${viewing.k}"]`)?.focus({ preventScroll: true });
    viewing = null;
  });

  /* ---------- Phones: the project is a sheet with three rests — the name (peek), half, full ----------
     The map stays above it and keeps taking touches. Drag the top of the sheet, or tap it to cycle. */
  const sheet = { state: 'half', y: 0 };
  const safeBottom = (() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;height:env(safe-area-inset-bottom);visibility:hidden'; document.body.appendChild(d); return () => d.offsetHeight; })();
  function rests() {
    const h = recEl.offsetHeight, top = $('p-top');
    return { h, full: 0, half: Math.round(h * .5), peek: Math.max(0, h - (top ? top.offsetHeight : 120) - safeBottom()) };
  }
  function setSheet(state, { fly: refly = true } = {}) {
    if (!phone() || recEl.hidden) return;
    recEl.style.setProperty('--sheet-top', Math.round(document.querySelector('.bar').getBoundingClientRect().bottom) + 'px');
    sheet.state = state;
    sheet.y = rests()[state];
    recEl.dataset.sheet = state;
    recEl.style.setProperty('--y', sheet.y + 'px');
    placeInstruments();
    const it = bySlug[openSlug];
    if (refly && it && state !== 'full') fly(it);
  }
  function wireSheet() {
    const top = $('p-top');
    let from = null;
    top.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button,a')) return;
      from = { y: e.clientY, at: sheet.y, t: performance.now(), moved: 0 };
      top.setPointerCapture(e.pointerId);
      recEl.classList.add('drag');
    });
    top.addEventListener('pointermove', (e) => {
      if (!from) return;
      const dy = e.clientY - from.y;
      from.moved = Math.max(from.moved, Math.abs(dy));
      sheet.y = Math.max(0, Math.min(recEl.offsetHeight, from.at + dy));
      recEl.style.setProperty('--y', sheet.y + 'px');
    });
    const end = (e) => {
      if (!from) return;
      recEl.classList.remove('drag');
      const r = rests(), dy = e.clientY - from.y, v = dy / Math.max(1, performance.now() - from.t);
      const was = sheet.state, tap = from.moved < 6;
      from = null;
      if (tap) return setSheet(was === 'peek' ? 'half' : was === 'half' ? 'full' : 'half');
      if (sheet.y > r.peek + Math.max(64, (r.h - r.peek) * .55)) return close(); // pulled most of its name away: put the project away
      const ranked = ['full', 'half', 'peek'];
      let next = ranked.reduce((a, b) => (Math.abs(r[b] - sheet.y) < Math.abs(r[a] - sheet.y) ? b : a));
      if (Math.abs(v) > .5) { const k = ranked.indexOf(was) + (v > 0 ? 1 : -1); next = ranked[Math.max(0, Math.min(2, k))]; }
      setSheet(next);
    };
    top.addEventListener('pointerup', end);
    top.addEventListener('pointercancel', end);
  }
  // Zoom controls and scale sit just above the sheet, never beneath it
  const instruments = mapEl.querySelector('.instruments');
  function placeInstruments() {
    const lift = phone() && body.dataset.mode === 'record' ? Math.max(0, H - visible().h) : 0;
    instruments.style.transform = lift ? `translateY(${-lift}px)` : '';
    instruments.classList.toggle('lifted', !!lift);
    $('field').style.setProperty('--lift', lift + 'px');
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
      : `<li class="none">No matching projects or places</li>`;
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
    if (viewer.open) return; // the photograph viewer handles its own keys; Escape closes it
    if (e.key === 'Escape') {
      if (calloutEl) { closeCallout(); return; }
      if (!found.hidden) return;
      const ix = $('p-index');
      if (ix && !ix.hidden) { toggleIndex(); recEl.querySelector('[data-act="index"]')?.focus(); return; }
      if (body.dataset.mode === 'record') close();
    }
    // ← → move between projects, unless the map (which pans) or a text field has the keys
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && body.dataset.mode === 'record' && !e.altKey && !e.metaKey && !e.ctrlKey
      && e.target !== mapEl && !e.target.closest('input,textarea,.p-photos')) {
      e.preventDefault();
      step(e.key === 'ArrowLeft' ? -1 : 1, e.target.closest('[data-act]')?.dataset.act);
    }
    if (e.key === '/' && document.activeElement !== q && body.dataset.mode === 'map') { e.preventDefault(); q.focus(); }
  });
  addEventListener('popstate', () => {
    const p = new URLSearchParams(location.search).get('p');
    if (p && bySlug[p]) open(p, { push: false }); else close({ push: false });
  });
  // × CLOSE leaves Projects the way browser Back would: past any project opened here, to the page before.
  // With no earlier page on this site (a direct arrival), it goes to the entrance.
  $('leave').addEventListener('click', (e) => {
    let same = false;
    try { same = !!document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1; } catch (err) { same = false; }
    if (!same) return;
    e.preventDefault();
    history.go(-1 - (history.state?.d || 0));
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
    if (body.dataset.mode === 'record' && phone()) setSheet(sheet.state, { fly: false });
    else { recEl.style.removeProperty('--y'); sheet.y = 0; placeInstruments(); }
  }).observe(mapEl);

  function announce(t) { $('announce').textContent = t; }

  /* ---------- Begin: the map is drawn complete on arrival ---------- */
  renderRegister();
  size();
  sMin = Math.min(W / (G.box.x1 - G.box.x0), H / (G.box.y1 - G.box.y0)) * .9;
  const h = home(); homeS = h.s;
  Object.assign(view, h);
  renderRule();
  draw(true);
  const p0 = new URLSearchParams(location.search).get('p');
  if (p0 && bySlug[p0]) { history.replaceState({ p: p0, d: history.state?.d || 0 }, '', location.search); savedView = { ...h }; open(p0, { push: false }); }
  else if (history.state?.p) history.replaceState({ d: 0 }, '', location.pathname);
  (window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(loadDetail, { timeout: 2500 });

  // For automated checks only
  window.__record = { items, view, setYear, open, close, step, get clusters() { return clusters; }, get sheet() { return { ...sheet }; }, get flying() { return flying; }, setSheet };
})();
