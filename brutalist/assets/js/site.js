/* =====================================================================
   FREEMAN GC — SITE RUNTIME
   Plain JavaScript, no dependencies, no build. Each page declares
   <body data-page="…">; the matching renderer reads window.FGC.
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

  /* ---------- images ---------------------------------------------------
     A figure always keeps its composition. If an image cannot load
     (offline, CDN unreachable) the frame shows an honest, labelled plate
     instead of a broken icon. `local` copies are tried first.            */
  const MISSING = 'Photograph not loaded — served from the freemangc.com asset library';
  const LOCAL = FGC.localMap || {};
  function imgAttrs(im) {
    const first = im.local || LOCAL[im.src] || im.src;
    const fb = first !== im.src && im.src ? ` data-fallback="${esc(im.src)}"` : '';
    return `src="${esc(first)}"${fb}`;
  }
  function fig(im, o = {}) {
    if (!im) return '';
    const kind = im.kind || o.kind || 'photo';
    const cap = o.caption === false ? '' :
      `<figcaption class="fig__cap">${o.plate ? `<span class="pl">${esc(o.plate)}</span>` : ''}<span class="c">${esc(o.caption || im.caption || '')}</span>${o.credit ? `<span class="cr">${esc(o.credit)}</span>` : ''}</figcaption>`;
    const frameTag = o.zoom != null ? `button type="button" class="fig__frame" data-zoom="${o.zoom}" aria-label="Enlarge: ${esc(im.caption || '')}"` : 'div class="fig__frame"';
    const closeTag = o.zoom != null ? 'button' : 'div';
    const tag = o.href ? 'a' : 'figure';
    const href = o.href ? ` href="${esc(o.href)}"` : '';
    return `<${tag}${href} class="fig fig--${kind} ${o.cls || ''}" data-missing="${esc(o.missing || MISSING)}">` +
      `<${frameTag}><img ${imgAttrs(im)} alt="${esc(im.alt || im.caption || '')}" loading="${o.eager ? 'eager' : 'lazy'}" decoding="async"></${closeTag}>` +
      `${cap}</${tag}>`;
  }
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLImageElement)) return;
    if (t.dataset.fallback && !t.dataset.triedFallback) { t.dataset.triedFallback = '1'; t.src = t.dataset.fallback; return; }
    const f = t.closest('.fig');
    if (f) { f.classList.add('is-missing'); const fr = t.closest('.fig__frame'); if (fr && !fr.dataset.missing) fr.dataset.missing = f.dataset.missing || MISSING; }
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

  /* ---------- lightbox ------------------------------------------------ */
  const LB = (() => {
    let list = [], i = 0, el, lastFocus;
    function build() {
      el = document.createElement('div');
      el.className = 'lb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Plate viewer');
      el.innerHTML = `<div class="lb__top"><span class="lb__title"></span><button type="button" class="lb__close">Close ×</button></div>
        <div class="lb__stage"><figure class="fig fig--natural" data-missing="${esc(MISSING)}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"><img alt=""></figure></div>
        <div class="lb__bot"><span class="lb__cap"></span><span class="lb__nav"><button type="button" class="lb__prev">← Prev</button><span class="lb__count"></span><button type="button" class="lb__next">Next →</button></span></div>`;
      document.body.appendChild(el);
      $('.lb__close', el).onclick = close;
      $('.lb__prev', el).onclick = () => show(i - 1);
      $('.lb__next', el).onclick = () => show(i + 1);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(i - 1);
        if (e.key === 'ArrowRight') show(i + 1);
        if (e.key === 'Tab') { const f = $$('button', el); const a = f[0], b = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); } else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); } }
      });
    }
    function show(n) {
      i = (n + list.length) % list.length; const it = list[i];
      const img = $('img', el); const f = $('.fig', el); f.classList.remove('is-missing');
      delete img.dataset.triedFallback;
      const loc = it.local || LOCAL[it.src];
      if (loc && it.src) img.dataset.fallback = it.src; else delete img.dataset.fallback;
      img.src = loc || it.src; img.alt = it.alt || it.caption || '';
      $('.lb__title', el).textContent = it.title || '';
      $('.lb__cap', el).textContent = it.caption || '';
      $('.lb__count', el).textContent = `${pad(i + 1)} / ${pad(list.length)}`;
      $('.lb__nav', el).style.visibility = list.length > 1 ? 'visible' : 'hidden';
    }
    function open(l, n) { if (!el) build(); list = l; lastFocus = document.activeElement; el.classList.add('is-open'); document.documentElement.style.overflow = 'hidden'; show(n); $('.lb__close', el).focus(); }
    function close() { el.classList.remove('is-open'); document.documentElement.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    return { open };
  })();

  /* ---------- shared: masthead current state, footer year ------------- */
  const page = document.body.dataset.page;
  $$('.nav a').forEach((a) => { if (a.dataset.nav && a.dataset.nav === document.body.dataset.nav) a.setAttribute('aria-current', 'page'); });
  $$('[data-year]').forEach((n) => (n.textContent = new Date().getFullYear()));

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
    const sv = $('[data-services]');
    if (sv) sv.innerHTML = C.services.map((s, i) => `<div class="service"><span class="n">${pad(i + 1)}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></div>`).join('');

    // typologies built from the project record
    const ty = $('[data-typologies]');
    if (ty) {
      const g = {}; projects.forEach((p) => (g[p.typology] = g[p.typology] || []).push(p));
      ty.innerHTML = Object.entries(g).map(([k, list]) =>
        `<div class="index__row ty-row"><span class="no">${pad(list.length)}</span><span class="t">${up(k)}</span><span class="m m1">${list.map((p) => `<a class="u" href="project.html?p=${esc(p.slug)}">${up(p.title)}</a>`).join('<span class="muted"> / </span>')}</span><span class="go"></span></div>`).join('');
    }

    // territory: a measured plate, not a map illustration
    const map = $('[data-territory]');
    if (map) {
      const B = { w: -85.5, e: -83.8, s: 33.6, n: 35.3 };
      const k = Math.cos((34.45 * Math.PI) / 180);
      const W = 700, H = Math.round(W * (B.n - B.s) / ((B.e - B.w) * k));
      const x = (lon) => ((lon - B.w) / (B.e - B.w)) * W;
      const y = (lat) => ((B.n - lat) / (B.n - B.s)) * H;
      let s = `<svg viewBox="-8 -24 ${W + 16} ${H + 64}" role="img" aria-labelledby="terr-t terr-d"><title id="terr-t">Where Freeman has built</title><desc id="terr-d">Project locations plotted by municipal coordinates between latitude 33.6 and 35.3 north and longitude 83.8 and 85.5 west, with the Georgia–Tennessee line at 35 degrees north.</desc>`;
      for (let lat = 34; lat <= 35; lat += 0.5) s += `<line class="g" x1="0" x2="${W}" y1="${y(lat)}" y2="${y(lat)}"/><text class="lbl-muted" x="${W - 6}" y="${y(lat) - 5}" text-anchor="end" style="font-size:9px">${lat.toFixed(1)}°N</text>`;
      for (let lon = -85.5; lon <= -83.8; lon += 0.5) s += `<line class="g" y1="0" y2="${H}" x1="${x(lon)}" x2="${x(lon)}"/><text class="lbl-muted" x="${x(lon) - 16}" y="${H + 16}" style="font-size:9px">${Math.abs(lon).toFixed(1)}°W</text>`;
      s += `<rect class="frame" x="0" y="0" width="${W}" height="${H}"/>`;
      s += `<line class="border" x1="0" x2="${W}" y1="${y(35)}" y2="${y(35)}"/><text class="lbl-muted" x="6" y="${y(35) - 7}" style="font-size:9px">35°00′N — Tennessee</text><text class="lbl-muted" x="6" y="${y(35) + 15}" style="font-size:9px">Georgia</text>`;
      // group projects that share a municipality
      const pts = {};
      projects.forEach((p) => { const key = p.coords.join(','); (pts[key] = pts[key] || { c: p.coords, place: p.location, list: [] }).list.push(p); });
      const place = (str) => str.replace(/, (Georgia|Tennessee)$/, '');
      Object.values(pts).forEach((g) => {
        const px = x(g.c[1]), py = y(g.c[0]);
        const left = g.c[1] < -84.6 && g.c[1] > -84.95 ? false : g.c[1] <= -84.35; // keep labels inside the frame
        const anchor = left ? 'end' : 'start'; const dx = left ? -10 : 10;
        const nos = g.list.map((p) => p.no).join(' ');
        const href = g.list.length === 1 ? `project.html?p=${g.list[0].slug}` : `projects.html`;
        s += `<a href="${href}"><rect class="pt" x="${px - 3}" y="${py - 3}" width="6" height="6"/><text x="${px + dx}" y="${py - 2}" text-anchor="${anchor}">${esc(place(g.place))}</text><text class="lbl-muted" x="${px + dx}" y="${py + 11}" text-anchor="${anchor}" style="font-size:9px">${esc(nos)}</text></a>`;
      });
      const bx = x(C.baseCoords[1]), by = y(C.baseCoords[0]);
      s += `<rect class="pt--base" x="${bx - 4}" y="${by - 4}" width="8" height="8"/><text x="${bx + 12}" y="${by - 1}" style="fill:var(--signal)">Cartersville</text><text x="${bx + 12}" y="${by + 12}" style="fill:var(--signal);font-size:9px">Base</text>`;
      // scale bar: 25 statute miles along a meridian (1° lat ≈ 69 mi)
      const mi25 = (25 / 69) * (H / (B.n - B.s));
      s += `<g transform="translate(${W - mi25 - 20},${H - 26})"><line x1="0" x2="${mi25}" y1="0" y2="0" stroke="currentColor"/><line x1="0" x2="0" y1="-4" y2="4" stroke="currentColor"/><line x1="${mi25}" x2="${mi25}" y1="-4" y2="4" stroke="currentColor"/><text x="0" y="16" style="font-size:9px">0</text><text x="${mi25}" y="16" text-anchor="end" style="font-size:9px">25 mi</text></g>`;
      s += `<text x="${W - 12}" y="20" text-anchor="end" style="font-size:10px">N ↑</text>`;
      s += `<text class="lbl-muted" x="0" y="-10" style="font-size:9px">Municipal coordinates · approximate · equirectangular</text></svg>`;
      map.innerHTML = s;
      const pl = $('[data-places]');
      if (pl) pl.innerHTML = `<li><span class="signal">Cartersville, Georgia — base</span><span class="c">${coord(C.baseCoords)}</span></li>` +
        Object.values(pts).map((g) => `<li><span>${esc(g.place)} <span class="muted">— ${g.list.map((p) => esc(p.title)).join(', ')}</span></span><span class="c">${coord(g.c)}</span></li>`).join('');
    }

    const pe = $('[data-people]');
    if (pe) pe.innerHTML = C.people.map((p) => `<article class="person">${p.photo ? fig({ src: p.photo, caption: p.name, alt: `${p.name}, ${p.role}` }, { caption: false }) : `<div class="fig is-missing"><div class="fig__frame" data-missing="Portrait pending" style="aspect-ratio:4/5"></div></div>`}<h3>${esc(p.name)}</h3><p class="label muted role">${esc(p.role)}</p><p>${esc(p.bio)}</p></article>`).join('');

    const fq = $('[data-faq]');
    if (fq) fq.innerHTML = C.faqs.map((f, i) => `<details><summary><span class="n">${pad(i + 1)}</span><span>${esc(f[0])}</span><span class="x" aria-hidden="true">+</span></summary><p class="a">${esc(f[1])}</p></details>`).join('');
    $$('.faq details').forEach((d) => d.addEventListener('toggle', () => { const x = $('.x', d); if (x) x.textContent = d.open ? '−' : '+'; }));
  };

  /* ---------- PROJECTS INDEX ---------------------------------------- */
  R.projects = () => {
    const list = $('[data-index]'); if (!list) return;
    const plate = $('[data-plate]');
    let sortKey = 'no', dir = 1, filter = params.get('type') || 'All';
    const types = ['All', ...new Set(projects.map((p) => p.typology))];
    const tally = $('[data-tally]');
    tally.innerHTML = types.map((t) => `<button type="button" data-type="${esc(t)}" aria-pressed="${t === filter}">${up(t)}<sup>${pad(t === 'All' ? projects.length : projects.filter((p) => p.typology === t).length)}</sup></button>`).join('');
    tally.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.type; $$('button', tally).forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); });
    $$('[data-sort]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.sort; dir = sortKey === k ? -dir : 1; sortKey = k; draw(); }));

    function setPlate(p) {
      if (!plate || !p) return;
      const im = p.images[0];
      plate.innerHTML = fig(im, { plate: `PL. ${p.no}`, caption: `${p.title} — ${im.caption}`, credit: p.photography ? `Photograph: ${p.photography}` : '', href: `project.html?p=${p.slug}`, eager: true }) +
        `<div class="meta"><div class="numeral">${esc(p.no)}</div><h2 class="title">${esc(p.title)}</h2><p class="label muted">${up(p.typology)} · ${up(p.location)} · ${esc(p.year || '')}</p></div>`;
      $$('.index__row', list).forEach((r) => r.classList.toggle('is-hot', r.dataset.slug === p.slug));
    }
    function draw() {
      const rows = projects.filter((p) => filter === 'All' || p.typology === filter)
        .slice().sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])) * dir);
      $$('[data-sort]').forEach((b) => b.setAttribute('aria-sort', b.dataset.sort === sortKey ? (dir > 0 ? 'ascending' : 'descending') : 'none'));
      list.innerHTML = rows.map((p) => `<a class="index__row" href="project.html?p=${esc(p.slug)}" data-slug="${esc(p.slug)}"><span class="no">${esc(p.no)}</span><span class="t">${up(p.title)}</span><span class="m m1">${up(p.typology)}</span><span class="m m2">${up(p.location)}</span><span class="m yr">${esc(p.year || '—')}</span><span class="go" aria-hidden="true">→</span></a>`).join('');
      $$('.index__row', list).forEach((r) => {
        const p = bySlug[r.dataset.slug];
        r.addEventListener('mouseenter', () => setPlate(p));
        r.addEventListener('focus', () => setPlate(p));
      });
      setPlate(rows[0]);
      $('[data-shown]').textContent = `${pad(rows.length, 3)} / ${pad(projects.length, 3)}`;
    }
    draw();

    // the monograph sequence — every project as a plate
    const seq = $('[data-seq]');
    if (seq) {
      const forms = ['a', 'b', 'c', 'd'];
      seq.innerHTML = projects.map((p, i) => {
        const f = forms[i % forms.length];
        const txt = `<div class="txt"><div class="numeral">${esc(p.no)}</div><h3 class="title"><a href="project.html?p=${esc(p.slug)}">${esc(p.title)}</a></h3><p class="label muted">${up(p.typology)} · ${up(p.location)}</p><p>${esc(p.statement)}</p></div>`;
        const im = fig(p.images[0], { plate: `PL. ${p.no}`, caption: f === 'a' || f === 'd' ? `${p.title} — ${p.location}` : p.images[0].caption, credit: p.photography ? `Photograph: ${p.photography}` : '', href: `project.html?p=${p.slug}` });
        return `<article class="seq__item seq__item--${f}">${f === 'a' || f === 'd' ? im : txt + im}</article>`;
      }).join('');
    }
  };

  /* ---------- PROJECT DETAIL ---------------------------------------- */
  R.project = () => {
    const root = $('[data-project]');
    const slug = params.get('p');
    const p = bySlug[slug];
    if (!p) {
      document.title = 'Project not found — Freeman GC';
      root.innerHTML = `<section class="phead"><p class="label muted">Projects / —</p><h1 class="title">No project is filed under “${esc(slug || '')}”.</h1><p style="margin-top:28px"><a class="act" href="projects.html">← Project index</a></p></section>`;
      return;
    }
    const i = projects.indexOf(p);
    const prev = projects[(i - 1 + projects.length) % projects.length];
    const next = projects[(i + 1) % projects.length];
    document.title = `${p.no} ${p.title} — Freeman GC`;
    $('.mast__brand .sub').textContent = `Projects / ${p.no}`;
    const all = p.images.map((im, n) => Object.assign({ title: `${p.no} — ${p.title}`, plate: `PL. ${pad(n + 1)}` }, im));
    const ledger = [
      ['Typology', p.typologyLong || p.typology], ['Location', p.location], ['Client', p.client], ['Interior design', p.interiorDesign],
      ['Photography', p.photography], ['Budget', p.budget], ['Complete', p.year], ['Coordinates', p.coords ? coord(p.coords) + ' (municipal)' : '']
    ].filter((r) => r[1]);
    const layout = ['p-half-l', 'p-half-r', 'p-right', 'p-full', 'p-left', 'p-mid', 'p-half-l', 'p-half-r'];
    const rest = all.slice(1);
    const cls = rest.map((_, n) => layout[n % layout.length]);
    if (cls.length && cls[cls.length - 1] === 'p-half-l') cls[cls.length - 1] = 'p-mid';
    const related = records.filter((r) => r.project === p.slug);
    let sec = 0; const S = () => pad(++sec);

    root.innerHTML = `
      <header class="phero">
        <div class="phero__no"><p class="label muted">Project ${esc(p.no)} / ${esc(projects[projects.length - 1].no)}</p><div class="numeral">${esc(p.no)}</div></div>
        <div class="phero__t"><h1 class="display">${esc(p.title)}</h1><p class="lede">${esc(p.statement)}</p></div>
      </header>
      <dl class="ledger pledger">${ledger.map((r) => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>
      <div class="plead">${fig(all[0], { plate: 'PL. 01', credit: p.photography ? `Photograph: ${p.photography}` : '', zoom: 0, eager: true })}</div>

      <section class="section">
        <div class="shead"><span class="label n">${S()}</span><span class="label">Description</span><span class="label aside">${esc(p.location)}</span></div>
        <div class="two"><div class="k"><p class="label muted">${up(p.typology)}<br>${esc(p.year || '')}</p></div><div class="v read">${p.description.map((d) => `<p>${esc(d)}</p>`).join('')}</div></div>
      </section>

      ${p.scope ? `<section class="section">
        <div class="shead"><span class="label n">${S()}</span><span class="label">Scope of work</span><span class="label aside">As published</span></div>
        <div class="two"><div class="k"></div><ol class="numbered v">${p.scope.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
      </section>` : ''}

      ${rest.length ? `<section class="section">
        <div class="shead"><span class="label n">${S()}</span><span class="label">Plates</span><span class="label aside">${pad(all.length)} photographs</span></div>
        <div class="plates">${rest.map((im, n) => `<div class="${cls[n]}">${fig(im, { plate: im.plate, credit: n === rest.length - 1 && p.photography ? `Photograph: ${p.photography}` : '', zoom: n + 1 })}</div>`).join('')}</div>
      </section>` : ''}

      ${p.drawing ? `<section class="section">
        <div class="shead"><span class="label n">${S()}</span><span class="label">Drawing</span><span class="label aside">Freeman archive</span></div>
        <div class="drawing">${fig(p.drawing, { kind: 'drawing', caption: p.drawing.caption })}</div>
      </section>` : ''}

      ${p.testimonial ? `<section class="section">
        <div class="shead"><span class="label n">${S()}</span><span class="label">Kind words</span><span class="label aside"></span></div>
        <div class="two"><div class="k"></div><div class="v"><blockquote class="quote">“${esc(p.testimonial.quote)}”</blockquote><p class="label attrib">${esc(p.testimonial.name)} <span class="muted">— ${esc(p.testimonial.role)}</span></p></div></div>
      </section>` : ''}

      ${related.length ? `<section class="section">
        <div class="shead"><span class="label n">${S()}</span><span class="label">Afield</span><span class="label aside"><a class="u" href="afield.html?project=${esc(p.slug)}">${pad(related.length, 3)} records →</a></span></div>
        <div class="index">${related.map((r) => `<a class="index__row rel-row" href="record.html?r=${esc(r.id)}"><span class="no signal">${esc(r.id)}</span><span class="t">${esc(r.title)}</span><span class="m m1">${up(r.kind)}</span><span class="go">→</span></a>`).join('')}</div>
      </section>` : ''}

      <section class="section">
        <div class="shead"><span class="label n">${S()}</span><span class="label">Record</span><span class="label aside"></span></div>
        <div class="two"><div class="k"></div><div class="v"><p class="micro" style="max-width:70ch;line-height:1.7">Text and photographs as published by Freeman General Contractors at <a class="u" href="${esc(p.source)}" rel="noopener">${esc(p.source.replace('https://', ''))}</a>. Copy edited for length; no facts added. Coordinates are municipal and approximate. Captions describe what each photograph shows.</p></div></div>
      </section>

      <nav class="pager section--tight" style="margin-top:var(--space-6)" aria-label="Projects">
        <a class="prev" href="project.html?p=${esc(prev.slug)}"><span class="muted-l">Previous</span>← ${esc(prev.no)} ${up(prev.title)}</a>
        <a class="mid" href="projects.html">Index</a>
        <a class="next" href="project.html?p=${esc(next.slug)}"><span class="muted-l">Next</span>${esc(next.no)} ${up(next.title)} →</a>
      </nav>`;
    root.addEventListener('click', (e) => { const z = e.target.closest('[data-zoom]'); if (z) LB.open(all, +z.dataset.zoom); });
  };

  /* ---------- AFIELD -------------------------------------------------- */
  R.afield = () => {
    const out = $('[data-records]'); if (!out) return;
    const kinds = ['All', ...new Set(records.map((r) => r.kind))];
    const state = { q: params.get('q') || '', kind: params.get('kind') || 'All', project: params.get('project') || '', view: params.get('view') || 'ledger' };

    const stats = $('[data-stats]');
    if (stats) {
      const withImg = records.filter((r) => r.image).length;
      const projs = new Set(records.map((r) => r.project).filter(Boolean)).size;
      const dated = records.filter((r) => r.date).length;
      stats.innerHTML = [['Records', pad(records.length, 3)], ['Photographed', pad(withImg, 3)], ['Projects', pad(projs, 2)], ['Dated captures', dated ? pad(dated, 3) : 'Pending'], ['Unfiled — Sawdust', pad((FGC.sawdust || []).length, 2)]]
        .map((s) => `<div><dt>${s[0]}</dt><dd>${s[1]}</dd></div>`).join('');
    }

    const kindBox = $('[data-kinds]');
    kindBox.innerHTML = kinds.map((k) => `<button type="button" data-kind="${esc(k)}" aria-pressed="${k === state.kind}">${up(k)}<sup>${pad(k === 'All' ? records.length : records.filter((r) => r.kind === k).length)}</sup></button>`).join('');
    const sel = $('[data-project-select]');
    const used = projects.filter((p) => records.some((r) => r.project === p.slug));
    sel.innerHTML = `<option value="">All projects</option>${used.map((p) => `<option value="${esc(p.slug)}">${esc(p.no)} ${esc(p.title)}</option>`).join('')}<option value="none">Archive — no project</option>`;
    sel.value = state.project;
    const q = $('[data-q]'); q.value = state.q;

    kindBox.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; state.kind = b.dataset.kind; $$('button', kindBox).forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); });
    sel.addEventListener('change', () => { state.project = sel.value; draw(); });
    q.addEventListener('input', () => { state.q = q.value; draw(); });
    $$('[data-view]').forEach((b) => b.addEventListener('click', () => { state.view = b.dataset.view; draw(); }));

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
      try { history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '')); } catch (e) { /* file:// in some browsers */ }
    }
    function draw() {
      const rows = records.filter(match);
      $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === state.view));
      $('[data-count]').textContent = `${pad(rows.length, 3)} / ${pad(records.length, 3)}`;
      if (!rows.length) { out.innerHTML = `<p class="af-empty">No records match. <button type="button" class="u" data-reset>Clear filters</button></p>`; $('[data-reset]').onclick = reset; sync(); return; }
      if (state.view === 'sheet') {
        out.className = 'af-sheet';
        out.innerHTML = rows.map((r) => {
          const im = recordImage(r);
          const cap = `<figcaption class="fig__cap"><span class="id">${esc(r.id)}</span><span class="c">${esc(r.title)}</span></figcaption>`;
          return im ? `<a href="record.html?r=${esc(r.id)}" class="fig fig--${esc(im.kind || 'photo')}" data-missing="${esc(r.title)} — photograph not loaded"><div class="fig__frame"><img ${imgAttrs(im)} alt="${esc(r.title)}" loading="lazy" decoding="async"></div>${cap}</a>`
            : `<a href="record.html?r=${esc(r.id)}" class="fig is-missing"><div class="fig__frame" data-missing="Photograph pending"></div>${cap}</a>`;
        }).join('');
      } else {
        out.className = 'index af-ledger';
        out.innerHTML = `<div class="index__head"><span>Record</span><span>Filed</span><span>Title</span><span>Kind</span><span>Project</span><span style="text-align:right">Plate</span></div>` +
          rows.map((r) => {
            const im = recordImage(r); const p = r.project ? bySlug[r.project] : null;
            return `<a class="index__row" href="record.html?r=${esc(r.id)}"><span class="id">${esc(r.id)}</span><span class="m date">${r.date ? esc(r.date) : 'UNDATED'}</span><span class="t">${esc(r.title)}</span><span class="m m1">${up(r.kind)}</span><span class="m m2">${p ? up(p.no + ' ' + p.title) : 'ARCHIVE'}</span><span class="thumb ${im ? 'is-' + (im.kind || 'photo') : 'is-empty'}">${im ? `<img ${imgAttrs(im)} alt="" loading="lazy" decoding="async">` : ''}</span></a>`;
          }).join('');
      }
      sync();
    }
    function reset() { Object.assign(state, { q: '', kind: 'All', project: '' }); q.value = ''; sel.value = ''; $$('button', kindBox).forEach((x) => x.setAttribute('aria-pressed', x.dataset.kind === 'All')); draw(); }
    draw();

    const sd = $('[data-sawdust]');
    if (sd && FGC.sawdust) {
      const list = FGC.sawdust.map((s) => ({ src: s.src, caption: `${s.no} — unfiled. Carried over from the Sawdust page of freemangc.com.`, title: `Sawdust ${s.no}`, alt: `Sawdust ${s.no}, archive image` }));
      sd.innerHTML = FGC.sawdust.map((s, i) => `<button type="button" class="fig fig--object" data-i="${i}" data-missing="${esc(s.no)}" aria-label="Open Sawdust ${esc(s.no)}"><span class="fig__frame" style="display:block"><img ${imgAttrs({ src: s.src })} alt="" loading="lazy" decoding="async"></span><span class="fig__cap"><span class="c">${esc(s.no)}</span></span></button>`).join('');
      sd.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) LB.open(list, +b.dataset.i); });
    }
  };

  /* ---------- AFIELD RECORD ----------------------------------------- */
  R.record = () => {
    const root = $('[data-record]');
    const id = (params.get('r') || '').toUpperCase();
    const n = records.findIndex((r) => r.id === id);
    if (n < 0) {
      document.title = 'Record not found — Afield — Freeman GC';
      root.innerHTML = `<section class="phead"><p class="label muted">Afield / —</p><h1 class="title">No record is filed as “${esc(id)}”.</h1><p style="margin-top:28px"><a class="act" href="afield.html">← Afield</a></p></section>`;
      return;
    }
    const r = records[n]; const prev = records[(n - 1 + records.length) % records.length]; const next = records[(n + 1) % records.length];
    const p = r.project ? bySlug[r.project] : null;
    const im = recordImage(r);
    document.title = `${r.id} ${r.title} — Afield — Freeman GC`;
    $('.mast__brand .sub').textContent = `Afield / ${r.id}`;
    const [pre, num] = r.id.split('-');
    const ledger = [
      ['Filed', r.date || 'Undated'], ['Project', p ? `<a class="u" href="project.html?p=${esc(p.slug)}">${esc(p.no)} ${esc(p.title)}</a>` : 'Archive — no project'],
      ['Location', p ? esc(p.location) : ''], ['Kind', esc(r.kind)], ['Material', esc(r.material || '')], ['Project year', p ? esc(p.year || '') : ''],
      ['Source', esc(r.source)], ['Credit', esc(r.credit || '')]
    ].filter((x) => x[1]);
    const siblings = records.filter((x) => x.id !== r.id && ((r.project && x.project === r.project) || (!r.project && !x.project && x.kind === r.kind))).slice(0, 6);
    root.innerHTML = `
      <article class="rec">
        <div class="rec__side">
          <p class="label muted" style="margin-bottom:14px">Record ${pad(n + 1, 3)} of ${pad(records.length, 3)}</p>
          <div class="id">${esc(pre)}<span>—</span>${esc(num)}</div>
          <h1 class="title">${esc(r.title)}</h1>
          <dl class="ledger ledger--stack">${ledger.map((x) => `<div><dt>${x[0]}</dt><dd>${x[1]}</dd></div>`).join('')}</dl>
        </div>
        <div class="rec__main">
          ${im ? fig(im, { kind: im.kind || 'photo', cls: 'fig--natural', caption: `${r.id} — ${r.title}`, credit: r.credit ? `${r.credit}` : '', zoom: 0, eager: true })
            : `<div class="pending">Photograph pending — file a dated capture to complete this record.</div>`}
          <div class="rec__obs"><p class="label muted">Observation</p><p class="lede">${esc(r.note)}</p></div>
          ${r.provenance ? `<div class="rec__prov"><p class="label muted">Provenance</p><p>${esc(r.provenance)}</p></div>` : ''}
        </div>
      </article>
      ${siblings.length ? `<section class="section">
        <div class="shead"><span class="label n">${pad(1)}</span><span class="label">${p ? 'Also filed from ' + esc(p.title) : 'Also in the archive'}</span><span class="label aside"><a class="u" href="afield.html${p ? '?project=' + esc(p.slug) : '?project=none'}">All →</a></span></div>
        <div class="index af-ledger">${siblings.map((x) => { const xi = recordImage(x); return `<a class="index__row" href="record.html?r=${esc(x.id)}"><span class="id">${esc(x.id)}</span><span class="m date">${x.date ? esc(x.date) : 'UNDATED'}</span><span class="t">${esc(x.title)}</span><span class="m m1">${up(x.kind)}</span><span class="m m2">${x.project ? up(bySlug[x.project].title) : 'ARCHIVE'}</span><span class="thumb ${xi ? 'is-' + (xi.kind || 'photo') : 'is-empty'}">${xi ? `<img ${imgAttrs(xi)} alt="" loading="lazy">` : ''}</span></a>`; }).join('')}</div>
      </section>` : ''}
      <nav class="pager" style="margin-top:var(--space-6)" aria-label="Records">
        <a class="prev" href="record.html?r=${esc(prev.id)}"><span class="muted-l">Previous</span>← ${esc(prev.id)} ${up(prev.title)}</a>
        <a class="mid" href="afield.html">Afield</a>
        <a class="next" href="record.html?r=${esc(next.id)}"><span class="muted-l">Next</span>${esc(next.id)} ${up(next.title)} →</a>
      </nav>`;
    root.addEventListener('click', (e) => { const z = e.target.closest('[data-zoom]'); if (z && im) LB.open([Object.assign({ title: r.id }, im, { caption: `${r.id} — ${r.title}` })], 0); });
    document.addEventListener('keydown', (e) => {
      if (document.querySelector('.lb.is-open') || /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') location.href = `record.html?r=${prev.id}`;
      if (e.key === 'ArrowRight') location.href = `record.html?r=${next.id}`;
    });
  };

  /* ---------- CONTACT ------------------------------------------------- */
  R.contact = () => {
    const f = $('[data-inquiry]'); if (!f) return;
    const to = (FGC.company && FGC.company.email) || 'gabe@freemangc.com';
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(f);
      const name = (d.get('name') || '').trim();
      const body = [`Name: ${name}`, `Email: ${d.get('email') || ''}`, `Phone: ${d.get('phone') || ''}`, `Project type: ${d.get('type') || ''}`, `Project location: ${d.get('where') || ''}`, '', d.get('message') || ''].join('\n');
      const subject = `Project inquiry${name ? ' — ' + name : ''}`;
      location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const st = $('[data-status]');
      st.textContent = `Your email application should now open with this inquiry addressed to ${to}. Nothing has been sent from this page — send it from your email to complete the inquiry.`;
    });
  };

  /* ---------- PORTAL (demonstration) -------------------------------- */
  R.portal = () => {
    const D = FGC.portalDemo; const root = $('[data-portal]'); if (!D || !root) return;
    const P = D.project;
    const fmt = (s) => { const d = new Date(s + 'T12:00:00'); return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase(); };
    const days = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
    const tabs = [['overview', 'Overview'], ['schedule', 'Schedule'], ['field', 'Field'], ['documents', 'Documents'], ['messages', 'Messages'], ['team', 'Team']];
    $('[data-pside]').innerHTML = `<p class="label pid">${esc(P.id)} · Sample</p><h1 class="ptitle">${esc(P.title)}</h1><p class="label muted loc">${esc(P.location)}</p>
      <div class="ptabs" role="tablist" aria-label="Project sections">${tabs.map((t, i) => `<button type="button" role="tab" id="tab-${t[0]}" aria-controls="panel-${t[0]}" aria-selected="false" data-tab="${t[0]}"><span class="n">${pad(i + 1)}</span><span>${t[1]}</span></button>`).join('')}</div>
      <p class="micro" style="margin-top:22px;line-height:1.6">As of ${fmt(D.asOf)} ${D.asOf.slice(0, 4)}<br>Sample data · read only</p>`;

    const left = days(D.asOf, P.turnover);
    const on = Math.round(P.progress / 2);
    const ticks = Array.from({ length: 50 }, (_, i) => `<i class="${i < on - 1 ? 'on' : i === on - 1 ? 'now' : ''}"></i>`).join('');
    const S0 = D.phases[0].start, S1 = D.phases[D.phases.length - 1].end, span = days(S0, S1);
    const pct = (d) => (days(S0, d) / span) * 100;
    const months = []; { const d = new Date(S0 + 'T12:00:00'); d.setDate(1); d.setMonth(d.getMonth() + 1); while (d <= new Date(S1 + 'T12:00:00')) { const iso = d.toISOString().slice(0, 10); months.push(`<span style="left:${pct(iso)}%">${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>`); d.setMonth(d.getMonth() + 1); } }
    const now = `<div class="gantt__now" style="left:calc(${pct(D.asOf)}% )"></div>`;

    const panel = (id, n, title, aside, html) => `<section class="ppanel" role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}" hidden><div class="shead"><span class="label n">${n}</span><span class="label">${title}</span><span class="label aside">${aside}</span></div>${html}</section>`;
    root.innerHTML =
      panel('overview', '01', 'Overview', 'Sample project', `
        <div class="status-row">
          <div><p class="micro">Status</p><p class="big signal">${esc(P.status)}</p></div>
          <div><p class="micro">Complete</p><p class="big">${P.progress}%</p></div>
          <div><p class="micro">Turnover</p><p class="big">${fmt(P.turnover)}</p></div>
          <div><p class="micro">Days remaining</p><p class="big">${left}</p></div>
        </div>
        <div class="ticks" role="img" aria-label="${P.progress} percent complete">${ticks}</div>
        <div class="ticks-legend"><span class="micro">Start ${fmt(P.start)}</span><span class="micro">Turnover ${fmt(P.turnover)}</span></div>
        <div class="cols2">
          <div><p class="label" style="margin-bottom:12px">Decisions needed <span class="signal">${pad(D.decisions.length)}</span></p>
            <ul class="stack">${D.decisions.map((d) => `<li><span class="st is-signal">Due ${fmt(d.due)}</span><span>${esc(d.id)} — ${esc(d.title)}<span class="sub">${esc(d.note)} ${esc(d.status)}.</span></span></li>`).join('')}</ul></div>
          <div><p class="label" style="margin-bottom:12px">This week</p>
            <ul class="stack">${D.week.map((w) => `<li><span class="st">${esc(w.status)}</span><span>${esc(w.text)}</span></li>`).join('')}</ul></div>
        </div>
        <div style="margin-top:var(--space-5)"><p class="label" style="margin-bottom:12px">Latest from the field</p>
          <div class="pgrid">${D.field.slice(0, 3).map((f) => fig({ src: f.src, caption: f.note }, { plate: fmt(f.date), caption: f.note })).join('')}</div></div>
        <div style="margin-top:var(--space-5)"><p class="label" style="margin-bottom:12px">Latest message</p>
          <div class="thread"><div class="msg"><p class="who">${esc(D.messages[D.messages.length - 1].from)}<span>${fmt(D.messages[D.messages.length - 1].date)}</span></p><p>${esc(D.messages[D.messages.length - 1].text)}</p></div></div></div>`) +
      panel('schedule', '02', 'Schedule', `${fmt(S0)} — ${fmt(S1)}`, `
        <div class="gantt">
          <div class="gantt__row head"><span>Phase</span><div class="gantt__months">${months.join('')}</div></div>
          ${D.phases.map((ph) => `<div class="gantt__row"><span>${esc(ph.name)}</span><div class="gantt__track">${now}<div class="gantt__bar ${ph.done ? '' : 'is-open'}" style="left:${pct(ph.start)}%;width:${Math.max(0.8, pct(ph.end) - pct(ph.start))}%"></div></div></div>`).join('')}
        </div>
        <p class="micro" style="margin-top:14px">Solid — complete · Outline — scheduled · <span class="signal">Vertical line — ${fmt(D.asOf)}</span></p>`) +
      panel('field', '03', 'Field', `${pad(D.field.length)} photographs · sample images`, `
        <div class="pgrid">${D.field.map((f, i) => `<div>${fig({ src: f.src, caption: f.note }, { plate: fmt(f.date), caption: f.note, zoom: i })}</div>`).join('')}</div>
        <p class="micro" style="margin-top:20px;max-width:70ch;line-height:1.7">Images are borrowed from Freeman’s published portfolio to show the layout. A connected portal would show the live project’s dated field photographs.</p>`) +
      panel('documents', '04', 'Documents', `${pad(D.documents.length)} files · client view`, `
        <div class="index doc-ledger"><div class="index__head"><span>No.</span><span>Title</span><span>Rev</span><span>Date</span><span>Kind</span><span>Status</span></div>
        ${D.documents.map((d) => `<div class="index__row"><span class="no">${esc(d.no)}</span><span class="t" style="text-transform:none;font-weight:400">${esc(d.title)}</span><span class="m rev">${esc(d.rev)}</span><span class="m dt">${fmt(d.date)}</span><span class="m m1">${esc(d.kind)}</span><span class="st m2">${esc(d.status)}</span></div>`).join('')}</div>
        <p class="micro" style="margin-top:14px">Demonstration list only — no files are attached or downloadable.</p>`) +
      panel('messages', '05', 'Messages', 'Sample thread', `
        <div class="thread">${D.messages.map((m) => `<div class="msg"><p class="who">${esc(m.from)}<span>${fmt(m.date)}</span></p><p>${esc(m.text)}</p></div>`).join('')}</div>
        <div class="composer"><label class="micro" for="composer">Reply</label><textarea id="composer" disabled placeholder="Messaging is not connected in this demonstration."></textarea>
        <div class="row"><span class="micro">Nothing typed here is sent or stored.</span><button type="button" class="act" disabled aria-disabled="true">Send →</button></div></div>`) +
      panel('team', '06', 'Team', 'Roles', `
        <div class="index">${D.team.map((t, i) => `<div class="index__row team-row"><span class="no">${pad(i + 1)}</span><span class="t">${up(t.role)}</span><span class="m m1">${up(t.org)}</span><span class="m m2">${up(t.name)}</span></div>`).join('')}</div>
        <p class="micro" style="margin-top:14px">In a live portal each role would name the assigned person, with direct telephone and email.</p>`);

    const field = D.field.map((f) => ({ src: f.src, caption: `${fmt(f.date)} — ${f.note}`, title: `${P.id} · Field` }));
    root.addEventListener('click', (e) => { const z = e.target.closest('[data-zoom]'); if (z) LB.open(field, +z.dataset.zoom); });
    const select = (id, push) => {
      if (!tabs.some((t) => t[0] === id)) id = 'overview';
      $$('[data-tab]').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === id));
      $$('.ppanel').forEach((p) => (p.hidden = p.id !== 'panel-' + id));
      if (push) try { history.replaceState(null, '', '#' + id); } catch (e) { location.hash = id; }
    };
    $('[data-pside]').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { select(b.dataset.tab, true); if (innerWidth < 860) window.scrollTo(0, 0); } });
    $('[data-pside]').addEventListener('keydown', (e) => {
      const b = e.target.closest('[data-tab]'); if (!b || !/Arrow(Up|Down|Left|Right)/.test(e.key)) return;
      e.preventDefault(); const all = $$('[data-tab]'); const k = all.indexOf(b) + (/Down|Right/.test(e.key) ? 1 : -1);
      const t = all[(k + all.length) % all.length]; t.focus(); select(t.dataset.tab, true);
    });
    select(location.hash.slice(1), false);
  };

  if (R[page]) R[page]();
})();
