/* =====================================================================
   FREEMAN GC — SITE RUNTIME (fixed-screen revision)
   Plain JavaScript, no dependencies, no build.
   Nothing on the public site scrolls the page. Material that does not
   fit one screen is divided by:
     • Pager  — measures blocks and splits them into pages that fit
     • panels — one section at a time (company, portal)
     • slides — one plate at a time (project presentation)
   ===================================================================== */
(function () {
  'use strict';
  const FGC = window.FGC || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const up = (v) => esc(String(v || '').toUpperCase());
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const params = new URLSearchParams(location.search);
  const projects = FGC.projects || [];
  const records = FGC.afield || [];
  const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
  const LOCAL = FGC.localMap || {};
  const MOBILE = () => window.matchMedia('(max-width:760px)').matches;
  const typing = (e) => /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;

  /* ---------- images ------------------------------------------------- */
  const MISSING = 'Photograph not loaded — served from the freemangc.com asset library';
  function imgAttrs(im) {
    const first = im.local || LOCAL[im.src] || im.src;
    const fb = first !== im.src && im.src ? ` data-fallback="${esc(im.src)}"` : '';
    return `src="${esc(first)}"${fb}`;
  }
  function fig(im, o = {}) {
    if (!im) return '';
    const kind = im.kind || o.kind || 'photo';
    const cap = o.caption === false ? '' :
      `<figcaption class="fig__cap"><span class="c">${o.plate ? `<span class="pl">${esc(o.plate)}</span> ` : ''}${esc(o.caption || im.caption || '')}</span>${o.credit ? `<span class="cr">${esc(o.credit)}</span>` : ''}</figcaption>`;
    const tag = o.href ? 'a' : 'figure';
    const href = o.href ? ` href="${esc(o.href)}"` : '';
    return `<${tag}${href} class="fig fig--${kind} ${o.href ? 'nohl ' : ''}${o.cls || ''}">` +
      `<div class="fig__frame" data-missing="${esc(o.missing || MISSING)}"><img ${imgAttrs(im)} alt="${esc(im.alt || im.caption || '')}" loading="${o.lazy ? 'lazy' : 'eager'}" decoding="async"></div>${cap}</${tag}>`;
  }
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLImageElement)) return;
    if (t.dataset.fallback && !t.dataset.triedFallback) { t.dataset.triedFallback = '1'; t.src = t.dataset.fallback; return; }
    const f = t.closest('.fig'); if (f) f.classList.add('is-missing');
    const th = t.closest('.thumb'); if (th) th.classList.add('is-empty');
  }, true);
  const recordImage = (r) => {
    if (!r.image) return null;
    if (r.image.project) {
      const p = bySlug[r.image.project]; const im = p && p.images[r.image.i];
      return im ? Object.assign({}, im, { caption: r.title }) : null;
    }
    return Object.assign({ caption: r.title, alt: r.title }, r.image);
  };
  const coord = (c) => c ? `${Math.abs(c[0]).toFixed(3)}°${c[0] >= 0 ? 'N' : 'S'} ${Math.abs(c[1]).toFixed(3)}°${c[1] >= 0 ? 'E' : 'W'}` : '';

  /* ---------- resize scheduling -------------------------------------- */
  const onResize = (() => {
    const fns = new Set(); let raf = 0;
    const run = () => { raf = 0; fns.forEach((f) => f()); };
    window.addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(run); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    return (f) => fns.add(f);
  })();

  /* ---------- Pager ---------------------------------------------------
     .pg > .pg__body (blocks) + .pg__ctrl [data-pg=-1|1] [data-pg-count]
     Splits the body's children into pages that fit the body's height. */
  function Pager(pg, opt = {}) {
    const body = $('.pg__body', pg);
    const ctrl = $('.pg__ctrl', pg);
    const count = $('[data-pg-count]', pg);
    let pages = [[]], cur = 0;
    const label = opt.label || 'Page';
    function measure(keep) {
      const blocks = [...body.children];
      blocks.forEach((b) => (b.hidden = false));
      pg.classList.remove('is-single', 'is-overflow');
      body.style.overflow = '';
      if (!pg.offsetParent && pg.getClientRects().length === 0) return; // not displayed
      const avail = body.clientHeight;
      const top0 = body.getBoundingClientRect().top;
      pages = []; let page = [], start = null;
      for (const b of blocks) {
        const r = b.getBoundingClientRect();
        const t = r.top - top0, btm = r.bottom - top0;
        if (start === null) start = t;
        if (btm - start > avail + 0.5 && page.length) { pages.push(page); page = []; start = t; }
        page.push(b);
      }
      if (page.length || !pages.length) pages.push(page);
      if (!keep) cur = 0;
      cur = Math.min(cur, pages.length - 1);
      show();
    }
    function show() {
      const on = new Set(pages[cur]);
      [...body.children].forEach((b) => (b.hidden = !on.has(b)));
      if (count) count.textContent = `${label} ${pad(cur + 1)} / ${pad(pages.length)}`;
      $$('[data-pg]', ctrl).forEach((b) => (b.disabled = (+b.dataset.pg < 0 && cur === 0) || (+b.dataset.pg > 0 && cur === pages.length - 1)));
      pg.classList.toggle('is-single', pages.length < 2);
      // a single block taller than the space: never crop — contain it
      if (body.scrollHeight > body.clientHeight + 1) { body.style.overflow = 'auto'; pg.classList.add('is-overflow'); }
      if (opt.onShow) opt.onShow(cur, pages.length);
    }
    function go(d) { const n = Math.max(0, Math.min(pages.length - 1, cur + d)); if (n !== cur) { cur = n; show(); } }
    ctrl && ctrl.addEventListener('click', (e) => { const b = e.target.closest('[data-pg]'); if (b) go(+b.dataset.pg); });
    onResize(() => measure(true));
    return { measure, go, get index() { return cur; }, get total() { return pages.length; } };
  }

  /* fit: if a fixed composition still overflows its box, contain it
     (internal scroll) rather than crop it. Logged for QA. */
  function fit(el) {
    if (!el) return;
    el.classList.remove('is-scroll');
    if (el.scrollHeight > el.clientHeight + 2) { el.classList.add('is-scroll'); el.dataset.fitted = 'scroll'; }
    else delete el.dataset.fitted;
  }

  /* ---------- lightbox ------------------------------------------------ */
  const LB = (() => {
    let list = [], i = 0, el, lastFocus;
    function build() {
      el = document.createElement('div');
      el.className = 'lb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Plate viewer');
      el.innerHTML = `<div class="lb__top"><span class="lb__title"></span><button type="button" class="hl lb__close">Close ×</button></div>
        <div class="lb__stage"><figure class="fig fig--contain"><div class="fig__frame" data-missing="${esc(MISSING)}"><img alt=""></div></figure></div>
        <div class="lb__bot"><span class="lb__cap"></span><span class="lb__nav"><button type="button" class="hl lb__prev">← Prev</button><span class="lb__count muted"></span><button type="button" class="hl lb__next">Next →</button></span></div>`;
      document.body.appendChild(el);
      $('.lb__close', el).onclick = close;
      $('.lb__prev', el).onclick = () => show(i - 1);
      $('.lb__next', el).onclick = () => show(i + 1);
      el.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(i - 1);
        if (e.key === 'ArrowRight') show(i + 1);
        if (e.key === 'Tab') { const f = $$('button', el).filter((b) => b.offsetParent); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
      });
    }
    function show(n) {
      i = (n + list.length) % list.length; const it = list[i];
      const img = $('img', el); $('.fig', el).classList.remove('is-missing');
      delete img.dataset.triedFallback;
      const loc = it.local || LOCAL[it.src];
      if (loc && it.src) img.dataset.fallback = it.src; else delete img.dataset.fallback;
      img.src = loc || it.src; img.alt = it.alt || it.caption || '';
      $('.lb__title', el).textContent = it.title || '';
      $('.lb__cap', el).textContent = it.caption || '';
      $('.lb__count', el).textContent = `${pad(i + 1)} / ${pad(list.length)}`;
      $('.lb__nav', el).style.visibility = list.length > 1 ? 'visible' : 'hidden';
    }
    function open(l, n) { if (!el) build(); list = l; lastFocus = document.activeElement; el.classList.add('is-open'); show(n); $('.lb__close', el).focus(); }
    function close() { el.classList.remove('is-open'); if (lastFocus) lastFocus.focus(); }
    return { open };
  })();

  /* ---------- shell: current page, year, mobile index ---------------- */
  const page = document.body.dataset.page;
  $$('.nav a').forEach((a) => { if (a.dataset.nav && a.dataset.nav === document.body.dataset.nav) a.setAttribute('aria-current', 'page'); });
  $$('[data-year]').forEach((n) => (n.textContent = new Date().getFullYear()));
  (function menu() {
    const btn = $('.menu-btn'); const nav = $('.nav'); if (!btn || !nav) return;
    const m = document.createElement('div');
    m.className = 'menu'; m.id = 'menu'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Index');
    m.innerHTML = `<div class="menu__top"><a href="index.html">Freeman General Contractors</a><button type="button" class="hl" data-close>Close ×</button></div>
      <nav class="menu__list" aria-label="Primary">${$$('a', nav).map((a) => `<a href="${a.getAttribute('href')}" data-n="${a.dataset.n}" class="${a.className}"${a.getAttribute('aria-current') ? ' aria-current="page"' : ''}>${esc(a.textContent)}</a>`).join('')}</nav>
      <div class="menu__foot micro">Tel. <a href="tel:7062633348">706.263.3348</a> · <a href="mailto:gabe@freemangc.com">gabe@freemangc.com</a><br>Cartersville, Georgia · Built for Generations™</div>`;
    document.body.appendChild(m);
    const open = () => { m.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); $('.menu__list a', m).focus(); };
    const close = () => { m.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); };
    btn.addEventListener('click', open);
    $('[data-close]', m).addEventListener('click', close);
    m.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { const f = $$('a,button', m); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
  })();

  /* generic "pick" list: hover / focus / click selects an item */
  function pickList(box, items, render, label) {
    const detail = $(`[data-detail="${box.dataset.pick}"]`);
    box.setAttribute('role', 'group'); if (label) box.setAttribute('aria-label', label);
    box.innerHTML = items.map((it, i) => `<button type="button" class="nohl" data-i="${i}" aria-pressed="${i === 0}" aria-controls=""><span class="n">${pad(i)}</span><span class="t">${esc(it.name)}</span></button>`).join('');
    let cur = -1;
    const sel = (i) => {
      if (i === cur) return; cur = i;
      $$('button', box).forEach((b) => b.setAttribute('aria-pressed', +b.dataset.i === i));
      detail.innerHTML = render(items[i], i);
      const panel = box.closest('.panel'); if (panel) fit(panel);
    };
    box.addEventListener('mouseover', (e) => { const b = e.target.closest('button'); if (b && !MOBILE()) sel(+b.dataset.i); });
    box.addEventListener('focusin', (e) => { const b = e.target.closest('button'); if (b) sel(+b.dataset.i); });
    box.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) sel(+b.dataset.i); });
    box.addEventListener('keydown', (e) => {
      if (!/Arrow(Up|Down)/.test(e.key)) return; e.preventDefault(); e.stopPropagation();
      const bs = $$('button', box); const n = (cur + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length; bs[n].focus();
    });
    sel(0);
  }

  /* =================================================================== */
  const R = {};

  /* ---------- ENTRY -------------------------------------------------- */
  R.entry = () => {
    const hint = $('.entry__hint');
    const hints = {
      company: `The company — ${FGC.company ? FGC.company.base : 'Cartersville, Georgia'}`,
      projects: `Index ${projects.length ? projects[0].no + '–' + projects[projects.length - 1].no : ''} · ${projects.length} projects`,
      afield: `Field record · ${records.length} entries`,
      contact: FGC.company ? `Tel. ${FGC.company.phone}` : 'Contact',
      portal: 'Private project records'
    };
    $$('.entry__nav a').forEach((a) => {
      const on = () => (hint.textContent = hints[a.dataset.hint] || '');
      const off = () => (hint.textContent = '');
      a.addEventListener('mouseenter', on); a.addEventListener('focus', on);
      a.addEventListener('mouseleave', off); a.addEventListener('blur', off);
    });
    const clock = $('[data-clock]');
    if (clock) {
      const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' });
      const tick = () => { const parts = fmt.formatToParts(new Date()); const g = (t) => (parts.find((p) => p.type === t) || {}).value || ''; clock.textContent = `${g('hour')}:${g('minute')} ${g('timeZoneName')}`; };
      tick(); setInterval(tick, 20000);
    }
    $$('[data-count="projects"]').forEach((n) => (n.textContent = pad(projects.length, 3)));
    $$('[data-count="records"]').forEach((n) => (n.textContent = pad(records.length, 3)));
  };

  /* ---------- COMPANY ------------------------------------------------ */
  R.company = () => {
    const C = FGC.company; if (!C) return;
    const tabs = $$('.toc [data-sec]');
    const order = tabs.map((t) => t.dataset.sec);
    const names = Object.fromEntries(tabs.map((t) => [t.dataset.sec, $('.t', t).textContent]));
    let cur = null;
    function select(sec, focus) {
      if (!order.includes(sec)) sec = order[0];
      cur = sec;
      tabs.forEach((t) => { const on = t.dataset.sec === sec; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      $$('.panel').forEach((p) => (p.hidden = p.dataset.sec !== sec));
      const i = order.indexOf(sec);
      $('[data-mob-label]').innerHTML = `<b>${pad(i)}</b> / ${pad(order.length - 1)} · ${esc(names[sec])}`;
      try { history.replaceState(null, '', '#' + sec); } catch (e) { /* file:// */ }
      if (sec === 'territory') drawMap();
      fit($(`#panel-${sec}`));
    }
    tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.sec)));
    $('.toc').addEventListener('keydown', (e) => {
      if (!/Arrow(Up|Down)|Home|End/.test(e.key)) return; e.preventDefault();
      const i = order.indexOf(cur);
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? order.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + order.length) % order.length;
      select(order[n], true);
    });
    $$('[data-step]').forEach((b) => b.addEventListener('click', () => { const i = order.indexOf(cur); select(order[(i + +b.dataset.step + order.length) % order.length]); }));
    document.addEventListener('keydown', (e) => {
      if (typing(e) || e.target.closest('.toc,.pick')) return;
      const i = order.indexOf(cur);
      if (e.key === 'ArrowRight' || e.key === 'PageDown') select(order[Math.min(order.length - 1, i + 1)]);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') select(order[Math.max(0, i - 1)]);
    });

    // practice
    pickList($('[data-pick="practice"]'), [{ name: 'Constructing Hospitality', text: C.hospitality }, ...C.services.map((s) => ({ name: s[0], text: s[1] }))],
      (it) => `<h3>${esc(it.name)}</h3><p class="lede">${esc(it.text)}</p>`, 'Practice');
    const g = {}; projects.forEach((p) => (g[p.typology] = (g[p.typology] || 0) + 1));
    $('[data-built]').innerHTML = 'Built — ' + Object.entries(g).map(([k, n]) => `<a href="projects.html?type=${encodeURIComponent(k)}">${esc(k)} ${pad(n)}</a>`).join(' · ');

    // people
    pickList($('[data-pick="people"]'), C.people, (p) => `<div class="p-people__r">${p.photo ? fig({ src: p.photo, alt: `${p.name}, ${p.role}` }, { caption: false, cls: 'portrait-fig' }) : `<div class="fig is-missing"><div class="fig__frame" data-missing="Portrait pending"></div></div>`}<div><h3>${esc(p.name)}</h3><p class="label muted" style="margin-top:4px">${esc(p.role)}</p><p class="read" style="margin-top:clamp(10px,2vh,18px)">${esc(p.bio)}</p></div></div>`, 'People');

    // questions
    pickList($('[data-pick="questions"]'), C.faqs.map((f) => ({ name: f[0], a: f[1] })), (f) => `<p class="label muted">Answer</p><p class="lede" style="margin-top:clamp(10px,2vh,18px)">${esc(f.a)}</p>`, 'Questions');

    // territory — drawn at the panel's real pixel size so type stays 1:1
    function drawMap() {
      const box = $('[data-territory]'); if (!box || box.closest('[hidden]')) return;
      const W = Math.max(200, box.clientWidth), H = Math.max(160, box.clientHeight);
      const B = { w: -85.5, e: -83.8, s: 33.6, n: 35.3 };
      const k = Math.cos((34.45 * Math.PI) / 180);
      const sc = Math.min((W - 20) / ((B.e - B.w) * k), (H - 34) / (B.n - B.s));
      const mw = (B.e - B.w) * k * sc, mh = (B.n - B.s) * sc, ox = (W - mw) / 2, oy = 14;
      const x = (lon) => ox + (lon - B.w) * k * sc;
      const y = (lat) => oy + (B.n - lat) * sc;
      let s = `<svg class="territory" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="terr-t terr-d"><title id="terr-t">Where Freeman has built</title><desc id="terr-d">Project locations by municipal coordinates, latitude 33.6 to 35.3 north, longitude 83.8 to 85.5 west; the Georgia–Tennessee line at 35 degrees north.</desc>`;
      for (let lat = 34; lat <= 35; lat += 0.5) s += `<line class="g" x1="${ox}" x2="${ox + mw}" y1="${y(lat)}" y2="${y(lat)}"/><text class="lbl-muted" x="${ox + mw - 4}" y="${y(lat) - 4}" text-anchor="end" style="font-size:9px">${lat.toFixed(1)}°N</text>`;
      for (let lon = -85.5; lon <= -83.8; lon += 0.5) s += `<line class="g" y1="${oy}" y2="${oy + mh}" x1="${x(lon)}" x2="${x(lon)}"/><text class="lbl-muted" x="${x(lon) + 3}" y="${oy + mh + 13}" style="font-size:9px">${Math.abs(lon).toFixed(1)}°W</text>`;
      s += `<rect class="frame" x="${ox}" y="${oy}" width="${mw}" height="${mh}"/>`;
      s += `<line class="border" x1="${ox}" x2="${ox + mw}" y1="${y(35)}" y2="${y(35)}"/><text class="lbl-muted" x="${ox + 6}" y="${y(35) - 6}" style="font-size:9px">35°00′N — Tennessee</text><text class="lbl-muted" x="${ox + 6}" y="${y(35) + 14}" style="font-size:9px">Georgia</text>`;
      const pts = {};
      projects.forEach((p) => { const key = p.coords.join(','); (pts[key] = pts[key] || { c: p.coords, place: p.location, list: [] }).list.push(p); });
      const place = (str) => str.replace(/, (Georgia|Tennessee)$/, '');
      Object.values(pts).forEach((gp) => {
        const px = x(gp.c[1]), py = y(gp.c[0]);
        const left = gp.c[1] > -84.36 && gp.c[0] < 33.77; // Atlanta proper: label to the left of the point
        const anchor = left ? 'end' : 'start', dx = left ? -9 : 9;
        const href = gp.list.length === 1 ? `project.html?p=${gp.list[0].slug}` : `projects.html`;
        s += `<a href="${href}" class="nohl"><rect class="pt" x="${px - 3}" y="${py - 3}" width="6" height="6"/><text x="${px + dx}" y="${py - 1}" text-anchor="${anchor}">${esc(place(gp.place))}</text><text class="lbl-muted" x="${px + dx}" y="${py + 11}" text-anchor="${anchor}" style="font-size:9px">${esc(gp.list.map((p) => p.no).join(' '))}</text></a>`;
      });
      const bx = x(C.baseCoords[1]), by = y(C.baseCoords[0]);
      s += `<rect class="pt--base" x="${bx - 4}" y="${by - 4}" width="8" height="8"/><text x="${bx + 11}" y="${by - 1}" style="fill:var(--signal)">Cartersville</text><text x="${bx + 11}" y="${by + 11}" style="fill:var(--signal);font-size:9px">Base</text>`;
      const mi25 = (25 / 69) * sc;
      s += `<g transform="translate(${ox + mw - mi25 - 12},${oy + mh - 22})" stroke="currentColor"><line x1="0" x2="${mi25}" y1="0" y2="0"/><line x1="0" x2="0" y1="-4" y2="4"/><line x1="${mi25}" x2="${mi25}" y1="-4" y2="4"/></g><text x="${ox + mw - mi25 - 12}" y="${oy + mh - 8}" style="font-size:9px">0</text><text x="${ox + mw - 12}" y="${oy + mh - 8}" text-anchor="end" style="font-size:9px">25 mi</text>`;
      s += `<text x="${ox + mw - 8}" y="${oy + 16}" text-anchor="end">N ↑</text></svg>`;
      box.innerHTML = s;
      $('[data-places]').innerHTML = `<li><span class="signal">Cartersville — base</span><span class="c">${coord(C.baseCoords)}</span></li>` +
        Object.values(pts).map((gp) => `<li><span>${esc(place(gp.place))} <span class="muted">${gp.list.map((p) => p.no).join(' ')}</span></span><span class="c">${coord(gp.c)}</span></li>`).join('');
    }
    onResize(() => { if (cur === 'territory') drawMap(); if (cur) fit($(`#panel-${cur}`)); });
    window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== cur) select(h); });
    select(location.hash.slice(1));
  };

  /* ---------- PROJECTS INDEX ---------------------------------------- */
  R.projects = () => {
    const list = $('[data-index]'); if (!list) return;
    const plate = $('[data-plate]');
    let sortKey = 'no', dir = 1, filter = params.get('type') || 'All';
    const types = ['All', ...new Set(projects.map((p) => p.typology))];
    if (!types.includes(filter)) filter = 'All';
    const tally = $('[data-tally]');
    tally.innerHTML = types.map((t) => `<button type="button" class="hl" data-type="${esc(t)}" aria-pressed="${t === filter}">${up(t)}<sup>${pad(t === 'All' ? projects.length : projects.filter((p) => p.typology === t).length)}</sup></button>`).join('');
    tally.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.type; $$('button', tally).forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); });
    $$('[data-sort]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.sort; dir = sortKey === k ? -dir : 1; sortKey = k; draw(); }));
    let hot = null;
    function setPlate(p) {
      if (!plate || !p) return; hot = p;
      const im = p.images[0];
      plate.innerHTML = fig(im, { plate: `PL. ${p.no}`, caption: im.caption, credit: p.photography || '', href: `project.html?p=${p.slug}` }) +
        `<div class="meta"><div class="numeral">${esc(p.no)}</div><div><h2 class="title">${esc(p.title)}</h2><p class="micro" style="margin-top:6px">${esc(p.typology)} · ${esc(p.location)}</p></div></div>`;
      $$('.index__row', list).forEach((r) => r.classList.toggle('is-hot', r.dataset.slug === p.slug));
      sizePlate();
    }
    function sizePlate() { // on short phones the plate yields to the index
      if (!plate) return; plate.hidden = false;
      if (MOBILE() && plate.clientHeight < 150) plate.hidden = true;
    }
    function draw() {
      const rows = projects.filter((p) => filter === 'All' || p.typology === filter)
        .slice().sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])) * dir);
      $$('[data-sort]').forEach((b) => b.setAttribute('aria-sort', b.dataset.sort === sortKey ? (dir > 0 ? 'ascending' : 'descending') : 'none'));
      list.innerHTML = rows.map((p) => `<a class="index__row nohl" href="project.html?p=${esc(p.slug)}" data-slug="${esc(p.slug)}"><span class="no">${esc(p.no)}</span><span class="t">${up(p.title)}</span><span class="m m1" data-loc="${up(p.location)}">${up(p.typology)}</span><span class="m m2">${up(p.location)}</span><span class="m yr">${esc(p.year || '—')}</span><span class="go" aria-hidden="true">→</span></a>`).join('');
      $$('.index__row', list).forEach((r) => {
        const p = bySlug[r.dataset.slug];
        r.addEventListener('mouseenter', () => setPlate(p));
        r.addEventListener('focus', () => setPlate(p));
      });
      setPlate(rows[0]);
      $('[data-shown]').textContent = `${pad(rows.length, 3)} / ${pad(projects.length, 3)}`;
    }
    draw();
    onResize(sizePlate);
  };

  /* ---------- PROJECT PRESENTATION ---------------------------------- */
  R.project = () => {
    const root = $('[data-project]');
    const p = bySlug[params.get('p')];
    if (!p) {
      document.title = 'Project not found — Freeman GC';
      root.innerHTML = `<div style="grid-column:1/-1;align-self:center"><p class="label muted">Projects / —</p><h1 class="title" style="margin-top:14px">No project is filed under “${esc(params.get('p') || '')}”.</h1><p style="margin-top:24px"><a class="act" href="projects.html">← Project index</a></p></div>`;
      return;
    }
    const i = projects.indexOf(p);
    const prev = projects[(i - 1 + projects.length) % projects.length];
    const next = projects[(i + 1) % projects.length];
    document.title = `${p.no} ${p.title} — Freeman GC`;
    $('.mast__brand .sub').textContent = `Projects / ${p.no}`;
    const related = records.filter((r) => r.project === p.slug);
    const credit = p.photography ? `Photograph: ${p.photography}` : '';

    // the presentation, in order
    const S = [];
    p.images.forEach((im, n) => {
      S.push({ kind: 'photo', code: pad(n + 1), name: `PL. ${pad(n + 1)}`, cap: im.caption, html: fig(im, { cls: 'fig--contain', caption: false }) });
      if (n === 0) S.push({ kind: 'text', code: 'Text', name: 'Description', cap: 'Description', html: `<div class="inner"><p class="label muted">Description · ${esc(p.location)}</p><div class="read">${p.description.map((d) => `<p>${esc(d)}</p>`).join('')}</div></div>` });
    });
    if (p.drawing) S.push({ kind: 'drawing', code: 'Drawing', name: 'Drawing', cap: p.drawing.caption, html: fig(p.drawing, { kind: 'drawing', caption: false }) });
    const ledger = [['Typology', p.typologyLong || p.typology], ['Location', p.location], ['Client', p.client], ['Interior design', p.interiorDesign], ['Photography', p.photography], ['Budget', p.budget], ['Complete', p.year], ['Coordinates', p.coords ? coord(p.coords) + ' (municipal)' : '']].filter((r) => r[1]);
    if (p.scope) S.push({ kind: 'parts', code: 'Scope', name: 'Scope of work', cap: 'Scope of work — as published', html:
      `<div><p class="label muted" style="margin-bottom:10px">Scope of work · as published</p><ol class="numbered">${p.scope.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>` });
    S.push({ kind: 'parts', code: 'Data', name: 'Particulars', cap: 'Particulars — as published', html:
      `<div><p class="label muted" style="margin-bottom:10px">Particulars</p><dl class="ledger">${ledger.map((r) => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}<div><dt>Source</dt><dd><a href="${esc(p.source)}" rel="noopener">${esc(p.source.replace('https://www.', ''))}</a></dd></div></dl></div>` });
    if (p.testimonial) S.push({ kind: 'words', code: 'Words', name: 'Kind words', cap: `${p.testimonial.name} — ${p.testimonial.role}`, html: `<blockquote class="quote">“${esc(p.testimonial.quote)}”</blockquote><p class="label" style="margin-top:clamp(14px,2.6vh,24px)">${esc(p.testimonial.name)} <span class="muted">— ${esc(p.testimonial.role)}</span></p>` });
    if (related.length) S.push({ kind: 'list', code: 'Afield', name: 'Afield', cap: `${pad(related.length, 3)} records from this project`, html:
      `<p class="label muted" style="margin-bottom:10px">Afield · filed from ${esc(p.title)}</p><div class="index">${related.map((r) => `<a class="index__row nohl" href="record.html?r=${esc(r.id)}"><span class="no signal">${esc(r.id)}</span><span class="t">${esc(r.title)}</span><span class="m">${up(r.kind)}</span><span class="go">→</span></a>`).join('')}</div><p style="margin-top:14px"><a class="act" href="afield.html?project=${esc(p.slug)}">All in Afield →</a></p>` });

    const info = [['Typology', p.typology], ['Location', p.location], ['Client', p.client], ['Complete', p.year]].filter((r) => r[1]);
    root.innerHTML = `
      <aside class="pp__info">
        <p class="label muted">Project ${esc(p.no)} / ${esc(projects[projects.length - 1].no)}</p>
        <div class="numeral">${esc(p.no)}</div>
        <h1>${esc(p.title)}</h1>
        <p class="lede">${esc(p.statement)}</p>
        <dl class="ledger">${info.map((r) => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>
        <div class="spacer"></div>
        <nav class="pp__nav" aria-label="Projects"><a href="project.html?p=${esc(prev.slug)}">← ${esc(prev.no)}</a><a href="projects.html">Index</a><a href="project.html?p=${esc(next.slug)}">${esc(next.no)} →</a></nav>
      </aside>
      <div class="pp__mob"><div class="numeral">${esc(p.no)}</div><div><h1 aria-hidden="true">${esc(p.title)}</h1><p class="micro">${esc(p.typology)} · ${esc(p.location)}</p></div></div>
      <section class="pp__stage" aria-roledescription="presentation" aria-label="${esc(p.title)}">
        <div class="slides">${S.map((s, n) => `<div class="slide slide--${s.kind} fit" role="group" aria-roledescription="slide" aria-label="${n + 1} of ${S.length}: ${esc(s.name)}" hidden>${s.html}</div>`).join('')}</div>
        <div class="ctrl"><span class="cap" aria-live="polite"></span><span class="count"></span><span class="btns"><button type="button" class="hl" data-go="-1">← Prev</button><button type="button" class="hl" data-go="1">Next →</button></span></div>
        <div class="dots" role="group" aria-label="Contents">${S.map((s, n) => `<button type="button" class="hl" data-to="${n}" title="${esc(s.name)}">${esc(s.code)}</button>`).join('')}</div>
        <nav class="pp__mobnav" aria-label="Projects"><a href="project.html?p=${esc(prev.slug)}">← ${esc(prev.no)} ${esc(prev.title)}</a><a href="projects.html">Index</a><a href="project.html?p=${esc(next.slug)}">${esc(next.no)} →</a></nav>
      </section>`;
    if (!MOBILE()) $('.pp__mobnav').hidden = true;
    const slides = $$('.slide', root);
    let cur = -1;
    function show(n) {
      n = Math.max(0, Math.min(S.length - 1, n)); if (n === cur) return; cur = n;
      slides.forEach((s, k) => (s.hidden = k !== n));
      const s = S[n];
      $('.ctrl .cap', root).innerHTML = `<span class="pl">${esc(s.name)}</span>${s.kind === 'photo' ? esc(s.cap) + (credit ? ` <span class="muted">· ${esc(credit)}</span>` : '') : esc(s.kind === 'text' ? p.title : s.cap)}`;
      $('.ctrl .count', root).textContent = `${pad(n + 1)} / ${pad(S.length)}`;
      $('[data-go="-1"]', root).disabled = n === 0;
      $('[data-go="1"]', root).disabled = n === S.length - 1;
      $$('.dots button', root).forEach((b, k) => b.setAttribute('aria-current', k === n));
      fit(slides[n]);
      try { history.replaceState(null, '', `${location.pathname}?p=${p.slug}${n ? '#' + (n + 1) : ''}`); } catch (e) { /* file:// */ }
    }
    root.addEventListener('click', (e) => {
      const g = e.target.closest('[data-go]'); if (g) show(cur + +g.dataset.go);
      const t = e.target.closest('[data-to]'); if (t) show(+t.dataset.to);
    });
    document.addEventListener('keydown', (e) => {
      if (typing(e) || document.querySelector('.menu.is-open')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); show(cur + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(cur - 1); }
      if (e.key === 'Home') show(0);
      if (e.key === 'End') show(S.length - 1);
    });
    onResize(() => { $('.pp__mobnav').hidden = !MOBILE(); if (slides[cur]) fit(slides[cur]); });
    show(Math.max(0, (parseInt(location.hash.slice(1), 10) || 1) - 1));
  };

  /* ---------- AFIELD -------------------------------------------------- */
  R.afield = () => {
    const pg = $('[data-records]'); if (!pg) return;
    const body = $('.pg__body', pg);
    const kinds = ['All', ...new Set(records.map((r) => r.kind))];
    const VIEWS = [['ledger', 'Ledger'], ['sheet', 'Sheet'], ['sawdust', 'Sawdust'], ['about', 'About']];
    const state = { q: params.get('q') || '', kind: params.get('kind') || 'All', project: params.get('project') || '', view: params.get('view') || 'ledger' };
    if (!VIEWS.some((v) => v[0] === state.view)) state.view = 'ledger';
    const pager = Pager(pg, { label: 'Page' });

    const withImg = records.filter((r) => r.image).length;
    const projs = new Set(records.map((r) => r.project).filter(Boolean)).size;
    const dated = records.filter((r) => r.date).length;
    $('[data-stats]').innerHTML = [['Records', pad(records.length, 3)], ['Photographed', pad(withImg, 3)], ['Projects', pad(projs, 2)], ['Dated', dated ? pad(dated, 3) : 'Pending']].map((s) => `<div><dt>${s[0]}</dt><dd>${s[1]}</dd></div>`).join('');

    const kindBox = $('[data-kinds]');
    kindBox.innerHTML = kinds.map((k) => `<button type="button" class="hl" data-kind="${esc(k)}" aria-pressed="${k === state.kind}">${up(k)}<sup>${pad(k === 'All' ? records.length : records.filter((r) => r.kind === k).length)}</sup></button>`).join('');
    const viewBox = $('[data-views]');
    viewBox.innerHTML = VIEWS.map((v) => `<button type="button" class="hl" role="tab" data-view="${v[0]}" aria-selected="${v[0] === state.view}">${v[1]}</button>`).join('');
    const sel = $('[data-project-select]');
    const used = projects.filter((p) => records.some((r) => r.project === p.slug));
    sel.innerHTML = `<option value="">All projects</option>${used.map((p) => `<option value="${esc(p.slug)}">${esc(p.no)} ${esc(p.title)}</option>`).join('')}<option value="none">Archive — no project</option>`;
    sel.value = state.project;
    const q = $('[data-q]'); q.value = state.q;

    kindBox.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; state.kind = b.dataset.kind; if (state.view === 'sawdust' || state.view === 'about') state.view = 'ledger'; draw(); });
    viewBox.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; state.view = b.dataset.view; draw(); });
    sel.addEventListener('change', () => { state.project = sel.value; if (state.view === 'sawdust' || state.view === 'about') state.view = 'ledger'; draw(); });
    q.addEventListener('input', () => { state.q = q.value; if (state.view === 'sawdust' || state.view === 'about') state.view = 'ledger'; draw(); });

    // mobile: filters live in an overlay
    const desk = $('#af-filters'); const openBtn = $('[data-filters-open]');
    const closeF = () => { desk.classList.remove('is-open'); openBtn.setAttribute('aria-expanded', 'false'); openBtn.focus(); draw(); };
    openBtn.addEventListener('click', () => { desk.classList.add('is-open'); openBtn.setAttribute('aria-expanded', 'true'); $('button', desk).focus(); });
    $('[data-filters-close]').addEventListener('click', closeF);
    desk.addEventListener('keydown', (e) => { if (e.key === 'Escape' && desk.classList.contains('is-open')) closeF(); });

    function match(r) {
      if (state.kind !== 'All' && r.kind !== state.kind) return false;
      if (state.project === 'none' && r.project) return false;
      if (state.project && state.project !== 'none' && r.project !== state.project) return false;
      if (state.q) {
        const p = r.project ? bySlug[r.project] : null;
        const hay = [r.id, r.title, r.kind, r.note, r.material, p && p.title, p && p.location].join(' ').toLowerCase();
        return state.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
      }
      return true;
    }
    function sync() {
      const u = new URLSearchParams();
      if (state.q) u.set('q', state.q); if (state.kind !== 'All') u.set('kind', state.kind);
      if (state.project) u.set('project', state.project); if (state.view !== 'ledger') u.set('view', state.view);
      try { history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '')); } catch (e) { /* file:// */ }
    }
    function sheetGrid(n) {
      const w = body.clientWidth; const cols = Math.max(2, Math.min(6, Math.floor(w / (MOBILE() ? 112 : 172))));
      const cell = Math.round((w - (cols - 1) * 16) / cols * 0.78 + 40);
      body.style.setProperty('--sheet-cols', cols); body.style.setProperty('--sheet-cell', cell + 'px');
    }
    function draw() {
      $$('button', kindBox).forEach((x) => x.setAttribute('aria-pressed', x.dataset.kind === state.kind));
      $$('button', viewBox).forEach((x) => x.setAttribute('aria-selected', x.dataset.view === state.view));
      sel.value = state.project;
      const rows = records.filter(match);
      const filtered = state.kind !== 'All' || state.project || state.q;
      $('[data-filter-sum]').textContent = filtered ? '· filtered' : '';
      pg.classList.remove('af-ledger', 'af-sheet'); body.style.removeProperty('--sheet-cols');
      if (state.view === 'about') {
        $('[data-count]').textContent = 'About the record';
        $('[data-viewnote]').textContent = '';
        body.innerHTML = `<p class="label muted af-about">How Afield is kept</p>
          <p class="read af-about" style="margin-top:12px">Afield is the public part of Freeman’s project record. Each entry describes what a photograph shows or what Freeman has published about a project — nothing more. Archive references from Sawdust are kept separately and are never presented as Freeman jobsite evidence.</p>
          <ol class="numbered af-about" style="margin-top:18px"><li>Photograph from a safe, repeatable position; keep the original file and its capture date.</li><li>Write one factual observation — what is seen, not what is hoped.</li><li>File it in data/afield.js with the next number, project, kind and source.</li><li>Leave the date blank unless verified. Never reuse a number.</li></ol>
          <p class="micro af-about" style="margin-top:18px">No capture dates have been verified yet; every record currently reads “Undated”.</p>`;
      } else if (state.view === 'sawdust') {
        const list = (FGC.sawdust || []).map((s) => ({ src: s.src, caption: `${s.no} — unfiled. From the Sawdust page of freemangc.com.`, title: `Sawdust ${s.no}`, alt: `Sawdust ${s.no}, archive image` }));
        $('[data-count]').textContent = `Sawdust · ${pad(list.length)} unfiled`;
        $('[data-viewnote]').textContent = 'Scraps, inspirations, outtakes & ideas — references, not records';
        pg.classList.add('af-sheet'); sheetGrid();
        body.innerHTML = (FGC.sawdust || []).map((s, i) => `<button type="button" class="fig fig--object nohl" data-i="${i}" aria-label="Open Sawdust ${esc(s.no)}"><span class="fig__frame" style="display:block" data-missing="${esc(s.no)}"><img ${imgAttrs({ src: s.src })} alt="" loading="lazy" decoding="async"></span><span class="fig__cap"><span class="t">${esc(s.no)}</span></span></button>`).join('');
        body.onclick = (e) => { const b = e.target.closest('[data-i]'); if (b) LB.open(list, +b.dataset.i); };
      } else {
        body.onclick = null;
        $('[data-count]').textContent = `Records ${pad(rows.length, 3)} / ${pad(records.length, 3)}`;
        $('[data-viewnote]').textContent = 'Undated — capture dates not yet verified';
        if (!rows.length) {
          body.innerHTML = `<p class="af-empty">No records match. <button type="button" class="hl" data-reset>Clear filters</button></p>`;
          $('[data-reset]').onclick = () => { Object.assign(state, { q: '', kind: 'All', project: '' }); q.value = ''; draw(); };
        } else if (state.view === 'sheet') {
          pg.classList.add('af-sheet'); sheetGrid();
          body.innerHTML = rows.map((r) => {
            const im = recordImage(r);
            const cap = `<span class="fig__cap"><span class="id">${esc(r.id)}</span><span class="t">${esc(r.title)}</span></span>`;
            return im ? `<a href="record.html?r=${esc(r.id)}" class="fig fig--${esc(im.kind || 'photo')} nohl"><span class="fig__frame" style="display:block" data-missing="${esc(r.title)}"><img ${imgAttrs(im)} alt="" loading="lazy" decoding="async"></span>${cap}</a>`
              : `<a href="record.html?r=${esc(r.id)}" class="fig is-missing nohl"><span class="fig__frame" style="display:block" data-missing="Photograph pending"></span>${cap}</a>`;
          }).join('');
        } else {
          pg.classList.add('af-ledger');
          body.innerHTML = rows.map((r) => {
            const im = recordImage(r); const p = r.project ? bySlug[r.project] : null;
            return `<a class="index__row nohl" href="record.html?r=${esc(r.id)}"><span class="id">${esc(r.id)}</span><span class="m date">${r.date ? esc(r.date) : 'UNDATED'}</span><span class="t">${esc(r.title)}</span><span class="m m1" data-proj="${p ? up(p.title) : 'ARCHIVE'}">${up(r.kind)}</span><span class="m m2">${p ? up(p.no + ' ' + p.title) : 'ARCHIVE'}</span><span class="thumb ${im ? 'is-' + (im.kind || 'photo') : 'is-empty'}">${im ? `<img ${imgAttrs(im)} alt="" loading="lazy" decoding="async">` : ''}</span></a>`;
          }).join('');
        }
      }
      sync();
      pager.measure();
    }
    onResize(() => { if (pg.classList.contains('af-sheet')) { sheetGrid(); pager.measure(true); } });
    document.addEventListener('keydown', (e) => {
      if (typing(e) || document.querySelector('.lb.is-open,.menu.is-open,.af-desk.is-open')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') pager.go(1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') pager.go(-1);
    });
    draw();
  };

  /* ---------- AFIELD RECORD ----------------------------------------- */
  R.record = () => {
    const root = $('[data-record]');
    const id = (params.get('r') || '').toUpperCase();
    const n = records.findIndex((r) => r.id === id);
    if (n < 0) {
      document.title = 'Record not found — Afield — Freeman GC';
      root.innerHTML = `<div style="grid-column:1/-1;align-self:center"><p class="label muted">Afield / —</p><h1 class="title" style="margin-top:14px">No record is filed as “${esc(id)}”.</h1><p style="margin-top:24px"><a class="act" href="afield.html">← Afield</a></p></div>`;
      return;
    }
    const r = records[n]; const prev = records[(n - 1 + records.length) % records.length]; const next = records[(n + 1) % records.length];
    const p = r.project ? bySlug[r.project] : null;
    const im = recordImage(r);
    document.title = `${r.id} ${r.title} — Afield — Freeman GC`;
    $('.mast__brand .sub').textContent = `Afield / ${r.id} · ${pad(n + 1, 3)} of ${pad(records.length, 3)}`;
    const [pre, num] = r.id.split('-');
    const ledger = [
      ['Filed', r.date || 'Undated', ''], ['Project', p ? `<a href="project.html?p=${esc(p.slug)}">${esc(p.no)} ${esc(p.title)}</a>` : 'Archive', ''],
      ['Location', p ? esc(p.location) : '', 'x-m'], ['Kind', esc(r.kind), ''], ['Material', esc(r.material || ''), 'x-m'],
      ['Source', esc(r.source), 'x-m'], ['Credit', esc(r.credit || ''), '']
    ].filter((x) => x[1]);
    root.innerHTML = `
      <aside class="rec__side">
        <div class="rec__head"><div class="id">${esc(pre)}<span>—</span>${esc(num)}</div><h1>${esc(r.title)}</h1></div>
        <div class="rec__text"><p class="lede">${esc(r.note)}</p>${r.provenance ? `<p class="prov"><span class="muted">Provenance — </span>${esc(r.provenance)}</p>` : ''}</div>
        <dl class="ledger">${ledger.map((x) => `<div class="${x[2]}"><dt>${x[0]}</dt><dd>${x[1]}</dd></div>`).join('')}</dl>
        <div class="spacer" style="flex:1 1 auto;min-height:8px"></div>
        <nav class="pp__nav" aria-label="Records"><a href="record.html?r=${esc(prev.id)}">← ${esc(prev.id)}</a><a href="afield.html${p ? '?project=' + esc(p.slug) : ''}">Afield</a><a href="record.html?r=${esc(next.id)}">${esc(next.id)} →</a></nav>
      </aside>
      <div class="rec__main">
        ${im ? fig(im, { kind: im.kind || 'photo', cls: 'fig--contain', caption: `${r.id} — ${r.title}`, credit: r.credit || '' })
          : `<div class="pending" data-missing="Photograph pending — file a dated capture to complete this record."></div><p class="micro" style="margin-top:8px">${esc(r.id)} — ${esc(r.title)}</p>`}
      </div>`;
    if (im) {
      const fr = $('.rec__main .fig__frame', root); fr.setAttribute('role', 'button'); fr.tabIndex = 0; fr.setAttribute('aria-label', 'Enlarge photograph');
      const open = () => LB.open([Object.assign({ title: r.id }, im, { caption: `${r.id} — ${r.title}` })], 0);
      fr.addEventListener('click', open); fr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    }
    const side = $('.rec__side', root);
    const check = () => fit(MOBILE() ? root : side);
    onResize(check); check();
    document.addEventListener('keydown', (e) => {
      if (typing(e) || document.querySelector('.lb.is-open,.menu.is-open')) return;
      if (e.key === 'ArrowLeft') location.href = `record.html?r=${prev.id}`;
      if (e.key === 'ArrowRight') location.href = `record.html?r=${next.id}`;
    });
  };

  /* ---------- CONTACT ------------------------------------------------- */
  R.contact = () => {
    const views = $$('[data-view]');
    const show = (v) => {
      views.forEach((x) => (x.hidden = x.dataset.view !== v));
      $('.ct').classList.toggle('is-form', v === 'form');
      const target = v === 'form' ? $('#f-name') : $('[data-show="form"]');
      if (target) target.focus();
      fit($('.ct__r'));
    };
    $$('[data-show]').forEach((b) => b.addEventListener('click', () => show(b.dataset.show)));
    const f = $('[data-inquiry]');
    const to = (FGC.company && FGC.company.email) || 'gabe@freemangc.com';
    f.addEventListener('keydown', (e) => { if (e.key === 'Escape') show('info'); });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(f);
      const name = (d.get('name') || '').trim();
      const body = [`Name: ${name}`, `Email: ${d.get('email') || ''}`, `Phone: ${d.get('phone') || ''}`, `Project type: ${d.get('type') || ''}`, `Project location: ${d.get('where') || ''}`, '', d.get('message') || ''].join('\n');
      location.href = `mailto:${to}?subject=${encodeURIComponent(`Project inquiry${name ? ' — ' + name : ''}`)}&body=${encodeURIComponent(body)}`;
      $('[data-status]').textContent = `Your email application should now open with this inquiry to ${to}. Nothing has been sent from this page — send it from your email.`;
    });
    onResize(() => fit($('.ct__r')));
    fit($('.ct__r'));
  };

  R['portal-gate'] = () => { const g = $('.gate'); fit(g); onResize(() => fit(g)); };

  /* ---------- PORTAL (demonstration) -------------------------------- */
  R.portal = () => {
    const D = FGC.portalDemo; const root = $('[data-portal]'); if (!D || !root) return;
    const P = D.project;
    const fmt = (s) => new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
    const days = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
    const tabs = [['overview', 'Overview'], ['schedule', 'Schedule'], ['field', 'Field'], ['documents', 'Documents'], ['messages', 'Messages'], ['team', 'Team']];
    $('[data-pside]').innerHTML = `<p class="label pid">${esc(P.id)} · Sample</p><h1 class="ptitle">${esc(P.title)}</h1><p class="micro" style="margin-top:4px">${esc(P.location)}</p>
      <div class="ptabs" role="tablist" aria-label="Project sections" aria-orientation="vertical">${tabs.map((t, i) => `<button type="button" role="tab" class="nohl" id="tab-${t[0]}" aria-controls="panel-${t[0]}" aria-selected="false" data-tab="${t[0]}"><span class="n">${pad(i + 1)}</span><span class="t">${t[1]}</span></button>`).join('')}</div>
      <p class="micro asof">As of ${fmt(D.asOf)} ${D.asOf.slice(0, 4)}<br>Sample data · read only</p>`;

    const left = days(D.asOf, P.turnover);
    const on = Math.round(P.progress / 2);
    const ticks = Array.from({ length: 50 }, (_, i) => `<i class="${i < on - 1 ? 'on' : i === on - 1 ? 'now' : ''}"></i>`).join('');
    const S0 = D.phases[0].start, S1 = D.phases[D.phases.length - 1].end, span = days(S0, S1);
    const pct = (d) => (days(S0, d) / span) * 100;
    const months = []; { const d = new Date(S0 + 'T12:00:00'); d.setDate(1); d.setMonth(d.getMonth() + 1); while (d <= new Date(S1 + 'T12:00:00')) { const iso = d.toISOString().slice(0, 10); months.push(`<span style="left:${pct(iso)}%">${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>`); d.setMonth(d.getMonth() + 1); } }
    const now = `<div class="gantt__now" style="left:${pct(D.asOf)}%"></div>`;
    const ctrl = `<div class="pg__ctrl"><button type="button" class="hl" data-pg="-1">← Prev</button><span class="count" data-pg-count></span><button type="button" class="hl" data-pg="1">Next →</button></div>`;
    const panel = (id, n, title, aside, blocks, extra = '', bodyCls = '') => `<section class="ppanel" role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}" hidden><div class="shead"><span class="label"><span class="muted">${n}</span>&nbsp;&nbsp;${title}</span><span class="label muted">${aside}</span></div><div class="pg"><div class="pg__body ${bodyCls}">${blocks}</div>${ctrl}</div>${extra}</section>`;

    root.innerHTML =
      panel('overview', '01', 'Overview', 'Sample project', `
        <div class="ov-a status-row">
          <div><p class="micro">Status</p><p class="big signal">${esc(P.status)}</p></div>
          <div><p class="micro">Complete</p><p class="big">${P.progress}%</p></div>
          <div><p class="micro">Turnover</p><p class="big">${fmt(P.turnover)}</p></div>
          <div><p class="micro">Days remaining</p><p class="big">${left}</p></div>
        </div>
        <div class="ov-a"><div class="ticks" role="img" aria-label="${P.progress} percent complete">${ticks}</div><div class="ticks-legend"><span class="micro">Start ${fmt(P.start)}</span><span class="micro">Turnover ${fmt(P.turnover)}</span></div></div>
        <div><p class="label" style="margin-bottom:8px">Decisions needed <span class="signal">${pad(D.decisions.length)}</span></p><ul class="stack">${D.decisions.map((d) => `<li><span class="st is-signal">Due ${fmt(d.due)}</span><span>${esc(d.id)} — ${esc(d.title)}<span class="sub">${esc(d.note)}</span></span></li>`).join('')}</ul></div>
        <div><p class="label" style="margin-bottom:8px">This week</p><ul class="stack">${D.week.map((w) => `<li><span class="st">${esc(w.status)}</span><span>${esc(w.text)}</span></li>`).join('')}</ul></div>
        <div class="ov-a ov-field"><p class="label" style="margin-bottom:8px">Latest from the field <span class="muted">· sample images</span></p><div class="pgrid">${D.field.slice(0, 3).map((f, i) => `<div class="pf" data-zoom="${i}">${fig({ src: f.src, caption: f.note }, { plate: fmt(f.date), caption: f.note.replace(/^Sample image — /, '').replace(/\..*$/, '') })}</div>`).join('')}</div></div>`, '', 'ov-grid') +
      panel('schedule', '02', 'Schedule', `${fmt(S0)} — ${fmt(S1)}`,
        `<div class="gantt__row head"><span>Phase</span><div class="gantt__months">${months.join('')}</div></div>` +
        D.phases.map((ph) => `<div class="gantt__row"><span>${esc(ph.name)}</span><div class="gantt__track">${now}<div class="gantt__bar ${ph.done ? '' : 'is-open'}" style="left:${pct(ph.start)}%;width:${Math.max(0.8, pct(ph.end) - pct(ph.start))}%"></div></div></div>`).join('') +
        `<p class="micro" style="padding-top:10px">Solid — complete · Outline — scheduled · <span class="signal">Line — ${fmt(D.asOf)}</span></p>`) +
      panel('field', '03', 'Field', `${pad(D.field.length)} photographs · sample images`,
        D.field.map((f, i) => `<div class="pf" data-zoom="${i}">${fig({ src: f.src, caption: f.note }, { plate: fmt(f.date), caption: f.note })}</div>`).join(''), '', 'pgrid') +
      panel('documents', '04', 'Documents', `${pad(D.documents.length)} files · list only`,
        D.documents.map((d) => `<div class="index__row"><span class="no">${esc(d.no)}</span><span class="t">${esc(d.title)}</span><span class="m rev">${esc(d.rev)}</span><span class="m dt">${fmt(d.date)}</span><span class="m m1">${esc(d.kind)}</span><span class="st">${esc(d.status)}</span></div>`).join('') +
        `<p class="micro" style="padding-top:10px">Demonstration list — no files are attached or downloadable.</p>`, '', 'index doc-ledger') +
      panel('messages', '05', 'Messages', 'Sample thread',
        D.messages.map((m) => `<div class="msg"><p class="who">${esc(m.from)}<span>${fmt(m.date)}</span></p><p>${esc(m.text)}</p></div>`).join('') +
        `<div class="composer"><label class="micro" for="composer">Reply</label><textarea id="composer" disabled placeholder="Messaging is not connected in this demonstration."></textarea><div class="row"><span class="micro">Nothing typed here is sent or stored.</span><button type="button" class="act" disabled aria-disabled="true">Send →</button></div></div>`, '') +
      panel('team', '06', 'Team', 'Roles',
        D.team.map((t, i) => `<div class="index__row team-row"><span class="no">${pad(i + 1)}</span><span class="t">${up(t.role)}</span><span class="m m1">${up(t.org)}</span><span class="m m2">${up(t.name)}</span></div>`).join('') +
        `<p class="micro" style="padding-top:10px">A live portal would name each assigned person, with direct telephone and email.</p>`, '', 'index');

    const pagers = {};
    $$('.ppanel', root).forEach((p) => (pagers[p.id] = Pager($('.pg', p), { label: 'Page' })));
    const field = D.field.map((f) => ({ src: f.src, caption: `${fmt(f.date)} — ${f.note}`, title: `${P.id} · Field` }));
    root.addEventListener('click', (e) => { const z = e.target.closest('[data-zoom]'); if (z) LB.open(field, +z.dataset.zoom); });
    let cur = 'overview';
    const ids = tabs.map((t) => t[0]);
    const select = (id, focus) => {
      if (!ids.includes(id)) id = 'overview'; cur = id;
      $$('[data-tab]').forEach((b) => { const on = b.dataset.tab === id; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      $$('.ppanel', root).forEach((p) => (p.hidden = p.id !== 'panel-' + id));
      try { history.replaceState(null, '', '#' + id); } catch (e) { /* file:// */ }
      fieldCols(); pagers['panel-' + id].measure();
    };
    function fieldCols() { const b = $('#panel-field .pg__body'); if (b) b.style.setProperty('--pcols', MOBILE() ? 1 : 3); }
    $('[data-pside]').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) select(b.dataset.tab); });
    $('[data-pside]').addEventListener('keydown', (e) => {
      const b = e.target.closest('[data-tab]'); if (!b || !/Arrow(Up|Down|Left|Right)|Home|End/.test(e.key)) return;
      e.preventDefault(); const i = ids.indexOf(cur);
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? ids.length - 1 : (i + (/Down|Right/.test(e.key) ? 1 : -1) + ids.length) % ids.length;
      select(ids[n], true);
    });
    onResize(fieldCols);
    window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== cur) select(h); });
    select(location.hash.slice(1));
  };

  if (R[page]) R[page]();
})();
