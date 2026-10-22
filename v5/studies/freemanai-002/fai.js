/* FreemanAI — Exploration 002: A Living Company.
   Ask anything; the surface answers by drawing a sheet. Every claim is a bubble that opens
   its source. Drag the date and the work moves with it. Capture from the field and watch the
   record travel to a decision. Static prototype: fixtures.js is the record; changes persist in
   this browser only. There is no model: questions are routed by keyword to composed sheets. */
(() => {
  'use strict';
  const F = window.FAI;
  const $ = (id) => document.getElementById(id);
  const KEY = 'freemanai-002';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- small helpers ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dn = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const iso = (n) => new Date(n * 864e5).toISOString().slice(0, 10);
  const fmt = (n, year = true) => { const t = new Date(n * 864e5); return `${t.getUTCDate()} ${MON[t.getUTCMonth()]}${year ? ' ' + t.getUTCFullYear() : ''}`; };
  const short = (isoDate) => fmt(dn(isoDate), dn(isoDate) < dn('2026-01-01') || dn(isoDate) > dn('2026-12-31'));
  const mins = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const hhmm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const TODAY = dn(F.NOW.date);
  const strip = (html) => html.replace(/<[^>]+>/g, '');
  const first = (html) => strip(html).split(/(?<=\.)\s/)[0];
  const who = (id) => F.PEOPLE[id] || null;
  const say = (t) => { $('announce').textContent = t; };
  const relDay = (n) => n === TODAY ? 'today' : n < TODAY ? `${TODAY - n} day${TODAY - n > 1 ? 's' : ''} ago` : `in ${n - TODAY} day${n - TODAY > 1 ? 's' : ''}`;

  /* ---------- state ---------- */
  const seed = () => ({ seq: 412, clock: mins(F.NOW.time), records: [], applied: {} });
  let store;
  try { store = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (_) { store = seed(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (_) { /* private browsing: memory only */ } };
  const tick = (n = 3) => (store.clock += n);

  const params = new URLSearchParams(location.search);
  const state = { role: F.ROLES[params.get('as')] ? params.get('as') : 'owner', set: [], at: -1, scrub: {} };
  const R = () => F.ROLES[state.role];
  const can = (access) => access !== 'finance' || R().finance;
  const visible = (id) => !!F.SOURCES[id] && can(F.SOURCES[id].access);
  const roleName = (r) => F.ROLES[r].label;

  /* ---------- citations: one number per source per sheet ---------- */
  function Cites() {
    const order = [];
    return {
      order,
      n(id) { if (!order.includes(id)) order.push(id); return order.indexOf(id) + 1; },
      tag(id, red) { return `<button type="button" class="cite${red ? ' red' : ''}" data-src="${id}" aria-label="Source ${this.n(id)}: ${esc(F.SOURCES[id].kind)}">${this.n(id)}</button>`; }
    };
  }
  /* parts: [text, [sources], { finance, red }] → paragraphs; finance parts drop for other roles */
  function reading(parts, c) {
    let withheld = 0;
    const html = parts.map(([t, refs = [], o = {}]) => {
      if (o.finance && !R().finance) { withheld++; return ''; }
      if (!refs.every(visible)) { withheld++; return ''; }
      return `${esc(t)}${refs.map((r) => c.tag(r, o.red)).join('')}`;
    }).filter(Boolean);
    return { html: `<div class="reading"><p>${html.join(' ')}</p></div>`, withheld };
  }

  /* ---------- routing a question to a sheet ---------- */
  const PROJECT_WORDS = [['2604', /etowah|mercantile/], ['2607', /saltmarsh|oyster/], ['2609', /pinecrest|clinic/], ['2612', /allatoona|residence/], ['2615', /highland|townhome/]];
  const HOME = { owner: null, controller: null, pm: '2607', super: '2604' };

  function route(q) {
    const t = q.toLowerCase().trim();
    if (!t) return { kind: 'pulse' };
    const rec = t.match(/fr-?0*(\d{3,4})/);
    if (rec) return { kind: 'record', id: 'FR-' + pad(+rec[1], 4) };
    if (/^(capture|report|log|record) (a|an|the)?|capture/.test(t)) return { kind: 'capture' };
    const money = /margin|profit|cash|billing|billable|pay app|invoice|cost|budget|price|receivable|money|\$/.test(t);
    if (money && !R().finance) return { kind: 'restricted' };
    if (/before|precedent|again|dealt|similar|last time|lesson|seen this/.test(t)) return { kind: 'memory', topic: /storefront|opening|glass|window/.test(t) ? 'opening' : 'duct' };
    if (money) return { kind: 'ledger' };
    const p = PROJECT_WORDS.find(([, re]) => re.test(t));
    if (p) return { kind: 'project', no: p[0] };
    if (/my job|my site|my project/.test(t) && HOME[state.role]) return { kind: 'project', no: HOME[state.role] };
    if (/today|changed|happening|across|morning|new|pulse|freeman|going on|attention|decision/.test(t)) return { kind: 'pulse' };
    if (/duct|hood|reinspection/.test(t)) return { kind: 'project', no: '2607' };
    if (/storefront|tile|bar top/.test(t)) return { kind: 'project', no: '2604' };
    return { kind: 'none', q };
  }

  function ask(q) {
    const r = route(q);
    if (r.kind === 'capture') { openCapture(); return; }
    issue({ ...r, q: q.trim() || 'What changed across Freeman today?' });
  }

  /* ---------- sheets ---------- */
  const SHEETS = { pulse, project, memory, record, ledger, none: notOnFile, restricted };

  function issue(spec, { replace = false } = {}) {
    const same = state.set[state.at] && JSON.stringify(strip0(state.set[state.at])) === JSON.stringify(strip0(spec));
    if (!same && !replace) { state.set = state.set.slice(0, state.at + 1).concat([spec]); state.at = state.set.length - 1; }
    else if (replace) state.set[state.at] = spec;
    paint(true);
  }
  const strip0 = (s) => ({ ...s, q: undefined, hot: undefined });

  function paint(animate) {
    const spec = state.set[state.at];
    const go = () => {
      document.body.dataset.mode = spec ? 'sheet' : 'entry';
      if (!spec) { renderEntry(); renderTitle(null); return; }
      const s = SHEETS[spec.kind](spec);
      spec.no = s.no; spec.title = s.title;
      const el = $('sheet');
      el.className = 'sheet' + (animate && !reduced ? ' plot' : ' settled');
      el.innerHTML = `<header class="s-head"><h2 class="s-q">${esc(s.heading || spec.q || s.title)}</h2><span class="s-no">${esc(s.no)} / ${esc(s.title)}</span></header>
        <p class="status">${s.status.map(([cls, t]) => `<span class="${cls}">${esc(t)}</span>`).join('')}</p>${s.html}`;
      el.scrollTop = 0;
      if (s.mount) s.mount(el);
      if (animate && !reduced) { pen(el); clearTimeout(paint.t); paint.t = setTimeout(() => el.classList.add('settled'), 2800); }
      renderTitle(s);
      $('q').value = '';
      $('q').placeholder = 'Ask the next question';
      const url = new URL(location.href);
      url.searchParams.set('as', state.role);
      const q = spec.kind === 'record' ? spec.id : spec.q;
      if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    };
    if (animate && document.startViewTransition && !reduced) document.startViewTransition(go); else go();
  }

  /* The pen: a red square travels the first outline as it is drawn. */
  function pen(el) {
    const path = el.querySelector('[data-pen]');
    if (!path || !path.getTotalLength) return;
    const svg = path.ownerSVGElement;
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const s = +(path.dataset.pen || 1.6);
    dot.setAttribute('width', s); dot.setAttribute('height', s); dot.setAttribute('class', 'pen');
    svg.appendChild(dot);
    const L = path.getTotalLength(), D = 900, delay = parseFloat(getComputedStyle(path).getPropertyValue('--d')) * 1000 || 0;
    let t0 = null;
    const ease = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const step = (now) => {
      if (t0 === null) t0 = now + delay;
      const k = Math.max(0, Math.min(1, (now - t0) / D));
      const p = path.getPointAtLength(ease(k) * L);
      dot.setAttribute('x', p.x - s / 2); dot.setAttribute('y', p.y - s / 2);
      if (k < 1) requestAnimationFrame(step); else setTimeout(() => dot.remove(), 160);
    };
    requestAnimationFrame(step);
  }

  /* ---------- G-001: the company, since 06:00 ---------- */
  function pulse() {
    const c = Cites();
    const recs = store.records.filter((r) => r.day === F.NOW.date);
    const parts = [
      [`Since 06:00, ${F.DISPATCH.length + recs.length} field entries across ${new Set(F.DISPATCH.map((id) => F.SOURCES[id].project)).size} jobs.`],
      ['Saltmarsh finished its duct re-route and is ready for Friday’s reinspection.', ['FN-2607-0652']],
      ['Etowah Mercantile templates the bar top at 10:00.', ['FN-2604-0705']],
      ['Pinecrest had a safety stop: two framers tied off to an unbraced truss.', ['SO-2609-0731'], { red: true }],
      ['One date in the record disagrees: the Saltmarsh hood arrives 28 Oct or 30 Oct.', ['EM-2607-HOOD', 'DL-2607-1021'], { red: true }]
    ];
    const rd = reading(parts, c);
    const attention = F.ATTENTION.filter((a) => !a.finance || R().finance);
    const queue = store.records.filter((r) => r.state !== 'closed' && r.state !== 'approved' && r.state !== 'declined');
    const events = F.DISPATCH.map((id) => ({ id, m: mins(F.SOURCES[id].at[1]), src: F.SOURCES[id] }))
      .concat(recs.map((r) => ({ rec: r, m: r.time, src: { project: r.project } })));
    const end = Math.max(mins(F.NOW.time), store.clock);
    const html = `${rd.html}
      <div class="s-body">
        <div class="drawing">
          <p class="rule-hint"><span><b>Drag the time</b> across the morning</span><span id="pulse-count"></span></p>
          <div id="rule"></div>
          ${mapSvg(c)}
          <p class="cap"><span><b>G-001</b> / Work area, north Georgia</span><span>Schematic / not to scale</span></p>
        </div>
        <div class="notes">
          <section><h3><span>Needs a person</span><span>${pad(attention.length + queue.length)}</span></h3><ol class="rows">
            ${queue.map((r) => `<li><button type="button" class="line new" data-record="${r.id}"><span class="k">${r.state === 'decision' ? 'Owner' : 'PM'}</span><span><span class="t">${esc(r.kind)}: ${esc(r.title)}</span><span class="m">${esc(r.id)} / ${esc(F.PROJECTS[r.project].name)} / waiting on ${r.state === 'decision' ? 'owner decision' : 'PM review'}</span></span><span class="r"></span></button></li>`).join('')}
            ${attention.map((a) => `<li><div class="line${a.conflict ? ' new' : ''}"><span class="k">${dn(a.due) === TODAY ? 'Today' : esc(short(a.due))}</span><span><span class="t">${esc(a.text)}</span><span class="m">${esc(who(a.who).name)} / ${esc(F.PROJECTS[F.SOURCES[a.src].project]?.name || 'Company')}</span></span><span class="r">${c.tag(a.src, a.conflict)}${a.with ? c.tag(a.with, true) : ''}</span></div></li>`).join('')}
          </ol></section>
          <section><h3><span>Dispatch</span><span>06:00 → ${hhmm(end)}</span></h3><ol class="rows" id="dispatch"></ol></section>
        </div>
      </div>`;
    const draw = (upTo) => {
      const shown = events.filter((e) => e.m <= upTo).sort((a, b) => b.m - a.m);
      $('dispatch').innerHTML = shown.length ? shown.map((e) => e.rec
        ? `<li><button type="button" class="line new" data-record="${e.rec.id}" data-site="${e.rec.project}"><span class="k">${hhmm(e.m)}</span><span><span class="t">${esc(e.rec.kind)}: ${esc(e.rec.title)}</span><span class="m">${esc(e.rec.id)} / ${esc(F.PROJECTS[e.rec.project].name)} / captured here</span></span><span class="r"></span></button></li>`
        : `<li><button type="button" class="line" data-src="${e.id}" data-site="${e.src.project}"><span class="k">${hhmm(e.m)}</span><span><span class="t">${esc(first(e.src.body))}</span><span class="m">${esc(e.src.kind)} / ${esc(who(e.src.by)?.name || e.src.from)} / ${esc(F.PROJECTS[e.src.project].name)}</span></span><span class="r">${c.tag(e.id, e.src.kind === 'Safety observation')}</span></button></li>`).join('') : '<li class="empty">Nothing yet this morning.</li>';
      const counts = {};
      shown.forEach((e) => { counts[e.src.project] = (counts[e.src.project] || 0) + 1; });
      document.querySelectorAll('.site').forEach((g) => {
        const n = counts[g.dataset.site] || 0;
        g.querySelector('.cnt').textContent = n ? '×' + n : '';
        g.querySelectorAll('.ring').forEach((r, i) => { r.style.display = i < n ? '' : 'none'; });
      });
      $('pulse-count').textContent = `${pad(shown.length)} entries by ${hhmm(upTo)}`;
    };
    return {
      no: 'G-001', title: 'Company today', sources: c.order,
      status: [['ok', '■ From the record'], ['', `${pad(c.order.length)} sources`], ['warn', '1 disagreement'], ['', 'Sample / not live'], ...(rd.withheld ? [['warn', 'Finance withheld']] : [])],
      html,
      mount() {
        const v = state.scrub.pulse ?? end;
        rule($('rule'), { from: mins('06:00'), to: end, value: v, now: end, step: 1, marks: events.map((e) => [e.m, '']), label: (m) => hhmm(m) + (m === end ? ' / now' : ''), ends: ['06:00', hhmm(end)], onchange: (m) => { state.scrub.pulse = m; draw(m); } });
        draw(v);
      }
    };
  }

  function mapSvg(c) {
    const M = F.MAP;
    const sites = Object.values(F.PROJECTS);
    return `<svg viewBox="-2 -4 104 78" role="img" aria-label="Schematic map of Freeman jobs in north Georgia">
      <rect class="d-hair" x="0" y="0" width="100" height="70"/>
      <path class="d-hair" d="${M.lake}" style="fill:var(--faint);--d:.3s" data-fade/>
      <path class="d-dash" d="${M.river}" data-fade style="--d:.4s"/>
      <path class="d-heavy" d="${M.i75}" pathLength="1" data-draw data-pen="1.4" style="--t:.9s;stroke-width:.34"/>
      <text class="d-mute" x="38.5" y="5" font-size="2">I-75</text>
      <text class="d-mute" x="27" y="27.5" font-size="1.5" letter-spacing=".2">ETOWAH RIVER</text>
      ${M.towns.map(([n, x, y], i) => `<g data-fade style="--d:${.5 + i * .05}s"><circle cx="${x}" cy="${y}" r=".45" fill="var(--muted)"/><text class="d-mute" x="${x + 1}" y="${y - 1}" font-size="1.7">${n.toUpperCase()}</text></g>`).join('')}
      <g data-fade style="--d:.9s"><rect x="${M.hq[0] - 1.6}" y="${M.hq[1] - 1.6}" width="3.2" height="3.2" fill="var(--red)"/><text class="d-redt" x="${M.hq[0] - 2.4}" y="${M.hq[1] + 1.2}" font-size="1.7" text-anchor="end">FREEMAN HQ</text></g>
      ${sites.map((p, i) => `<g class="site" data-site="${p.no}" data-ask="What’s going on with ${esc(p.name)}?" data-fade style="--d:${1 + i * .12}s" tabindex="0" role="button" aria-label="${esc(p.name)}">
        <circle class="ring" cx="${p.at[0]}" cy="${p.at[1]}" r="2.6"/><circle class="ring" cx="${p.at[0]}" cy="${p.at[1]}" r="3.6"/>
        <rect x="${p.at[0] - 1.4}" y="${p.at[1] - 1.4}" width="2.8" height="2.8"/>
        <text class="d-text lbl" x="${p.at[0] + 3}" y="${p.at[1] + .7}" font-size="2"${p.at[0] > 80 ? ` text-anchor="end" dx="-6"` : ''}>${p.no} ${esc(p.name.toUpperCase())}</text>
        <text class="d-mute" x="${p.at[0] + 3}" y="${p.at[1] + 3.3}" font-size="1.6"${p.at[0] > 80 ? ` text-anchor="end" dx="-6"` : ''}>${esc(p.place.toUpperCase())} <tspan class="d-redt cnt"></tspan></text></g>`).join('')}
      <g transform="translate(94 8)" data-fade style="--d:1.4s"><path class="d-ink" d="M0 3 L0 -3 M-1.4 -1 L0 -3 L1.4 -1"/><text class="d-mute" x="0" y="6" font-size="1.8" text-anchor="middle">N</text></g>
    </svg>`;
  }

  /* ---------- A-xxxx: a project, across time ---------- */
  const READINGS = {
    '2604': [
      ['Interior finishes, on sequence for the 18 Dec turnover.'],
      ['Restroom wall tile is 70% set', ['DL-2604-1021']], ['and the bar top is templated today at 10:00.', ['FN-2604-0705']],
      ['The open question is the storefront: the architect kept the existing openings', ['RFI-031']],
      ['and the owner asked for the cost before approving.', ['MM-14']],
      ['The change is $18,420 and must be approved by 24 Oct to hold the glass order.', ['PCO-012'], { finance: true }]
    ],
    '2607': [
      ['MEP rough-in. Turnover has moved from 5 Dec to 11 Dec', ['SCH-2607'], { red: true }],
      ['after the grease duct failed inspection at the roof curb on 19 Oct.', ['DL-2607-1019']],
      ['The re-route was finished this morning, 19" at the curb.', ['FN-2607-0652']],
      ['The hood date is unresolved: the vendor says 28 Oct, the site log says 30 Oct.', ['EM-2607-HOOD', 'DL-2607-1021'], { red: true }]
    ],
    '2609': [
      ['Framing and dry-in. East wing trusses were set and braced this morning.', ['FN-2609-0720']],
      ['There was a safety stop at 07:31 for tie-off to an unbraced truss.', ['SO-2609-0731'], { red: true }],
      ['Etowah Drywall’s insurance expires 3 Nov with no renewal on file.', ['COI-ETD']]
    ],
    '2612': [
      ['Punch and closeout. Four items remain before the owner walk on 4 Nov.', ['PW-2612-0630']]
    ],
    '2615': [
      ['Preconstruction. Fourteen of sixteen trade bids are in; framing and windows are still out.', ['BID-2615']]
    ]
  };

  function project(spec) {
    const p = F.PROJECTS[spec.no];
    const c = Cites();
    const rd = reading(READINGS[p.no], c);
    const srcs = Object.entries(F.SOURCES).filter(([id, s]) => s.project === p.no && visible(id)).sort((a, b) => (a[1].at.join() < b[1].at.join() ? -1 : 1));
    srcs.forEach(([id]) => c.n(id));
    const recs = store.records.filter((r) => r.project === p.no);
    const start = dn(p.start), end = dn(p.finish);
    const conflict = (READINGS[p.no] || []).some(([, , o]) => o && o.red && o.finance !== true);
    const html = `${rd.html}
      <div class="s-body">
        <div class="drawing">
          <p class="rule-hint"><span><b>Drag the date</b> across the job</span><span id="plan-count"></span></p>
          <div id="rule"></div>
          ${planSvg(p, c, srcs, recs, spec.hot)}
          <p class="cap"><span><b>A-${p.no}</b> / ${esc(p.name)} / floor plan</span><span>Schematic / not to scale</span></p>
        </div>
        <div class="notes">
          <section><h3><span>Record to this date</span><span id="rec-n"></span></h3><ol class="rows" id="rec-list"></ol></section>
          <section><h3><span>Next</span><span>From ${fmt(TODAY, false)}</span></h3><ol class="rows">${p.next.map(([d, t, text, w]) => `<li><div class="line"><span class="k">${dn(d) === TODAY ? 'Today' : esc(short(d))}</span><span><span class="t">${esc(text)}</span><span class="m">${t ? t + ' / ' : ''}${esc(who(w)?.name || '')}</span></span><span class="r"></span></div></li>`).join('')}</ol></section>
          <section><h3><span>People on this job</span><span>Sample</span></h3><ol class="rows">${p.people.map((id) => `<li><div class="line"><span class="k">${who(id).name.split(' ').map((w) => w[0]).join('')}</span><span><span class="t">${esc(who(id).name)}</span><span class="m">${esc(who(id).role)}</span></span><span class="r"></span></div></li>`).join('')}</ol></section>
          <section><h3><span>The job</span><span>${p.no}</span></h3><dl class="meta"><dt>Work</dt><dd>${esc(p.work)}</dd><dt>Place</dt><dd>${esc(p.place)}, Georgia</dd><dt>Phase</dt><dd>${esc(p.phase)}</dd><dt>Dates</dt><dd>${fmt(start)} → ${fmt(end)}</dd><dt>Contract</dt><dd>${R().finance ? 'Sample figures in the ledger sheet' : '<span class="muted">Owner and controller only</span>'}</dd></dl></section>
        </div>
      </div>`;
    const pinsAt = (d) => {
      let n = 0;
      document.querySelectorAll('.plan .pin').forEach((g) => { const show = +g.dataset.day <= d; g.style.display = show ? '' : 'none'; if (show) n++; });
      let rough = 0, done = 0;
      document.querySelectorAll('.plan .room').forEach((r) => {
        const s = d >= +r.dataset.done ? 'done' : d >= +r.dataset.rough ? 'rough' : 'empty';
        r.setAttribute('class', 'room ' + s);
        const pct = r.parentNode.querySelector('.pct');
        if (pct) pct.textContent = s === 'rough' ? Math.round(((d - r.dataset.rough) / (r.dataset.done - r.dataset.rough)) * 100) + '%' : s === 'done' ? 'Complete' : '';
        if (s === 'done') done++; else if (s === 'rough') rough++;
      });
      $('plan-count').textContent = `${done} complete / ${rough} in progress / ${n} on record`;
      const list = srcs.filter(([, s]) => dn(s.at[0]) <= d).reverse().slice(0, 5);
      const own = recs.filter((r) => dn(r.day) <= d);
      $('rec-n').textContent = fmt(d, false);
      $('rec-list').innerHTML = own.map((r) => `<li><button type="button" class="line new" data-record="${r.id}"><span class="k">${hhmm(r.time)}</span><span><span class="t">${esc(r.kind)}: ${esc(r.title)}</span><span class="m">${esc(r.id)} / ${esc(r.grid)} / ${esc(stateWord(r))}</span></span><span class="r"></span></button></li>`).join('') +
        (list.length ? list.map(([id, s]) => `<li><button type="button" class="line" data-src="${id}"><span class="k">${esc(short(s.at[0]))}</span><span><span class="t">${esc(first(s.body))}</span><span class="m">${esc(s.kind)} / ${esc(who(s.by)?.name || s.from)}</span></span><span class="r">${c.tag(id)}</span></button></li>`).join('') : `<li class="empty">${d < start ? 'The job has not started at this date.' : 'Nothing in this sample record before this date.'}</li>`);
    };
    return {
      no: 'A-' + p.no, title: p.name, sources: c.order,
      status: [['ok', '■ From the record'], ['', `${pad(c.order.length)} sources`], ...(conflict ? [['warn', 'Needs attention']] : []), ['', 'Sample / not live'], ...(rd.withheld ? [['warn', `${rd.withheld} finance line withheld`]] : [])],
      html,
      mount() {
        const v = state.scrub[p.no] ?? Math.min(Math.max(TODAY, start), end);
        rule($('rule'), { from: start, to: end, value: v, now: TODAY, step: 1, marks: p.milestones.map(([d, t]) => [dn(d), t]), label: (d) => `${fmt(d)} / ${relDay(d)}`, ends: [fmt(start, true), fmt(end, true)], onchange: (d) => { state.scrub[p.no] = d; pinsAt(d); } });
        pinsAt(v);
      }
    };
  }

  function planSvg(p, c, srcs, recs, hot) {
    const gx = p.grid.x, gy = p.grid.y;
    const X = (i) => 10 + (100 / (gx.length - 1)) * i, Y = (j) => 12 + (60 / (gy.length - 1)) * j;
    const outline = `M10 12 H110 V72 H10 Z`;
    let pinN = 0;
    return `<svg class="plan" viewBox="0 0 120 84" role="img" aria-label="Floor plan of ${esc(p.name)} with field records">
      <defs>
        <pattern id="h-light" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hatch-l" x1="0" y1="0" x2="0" y2="3"/></pattern>
        <pattern id="h-dense" width="1.3" height="1.3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hatch-d" x1="0" y1="0" x2="0" y2="1.3"/></pattern>
      </defs>
      ${gx.map((l, i) => `<g data-fade style="--d:${.6 + i * .04}s"><line class="d-dash" x1="${X(i)}" y1="6.2" x2="${X(i)}" y2="76"/><circle cx="${X(i)}" cy="3.2" r="2.4" fill="var(--paper)" class="d-ink" style="stroke-width:1px"/><text class="d-text" x="${X(i)}" y="3.3" font-size="2.2" text-anchor="middle" dominant-baseline="central">${l}</text></g>`).join('')}
      ${gy.map((l, j) => `<g data-fade style="--d:${.7 + j * .04}s"><line class="d-dash" x1="6.2" y1="${Y(j)}" x2="114" y2="${Y(j)}"/><circle cx="3.2" cy="${Y(j)}" r="2.4" fill="var(--paper)" class="d-ink" style="stroke-width:1px"/><text class="d-text" x="3.2" y="${Y(j) + .1}" font-size="2.2" text-anchor="middle" dominant-baseline="central">${l}</text></g>`).join('')}
      ${p.rooms.map((r, i) => `<g data-fade style="--d:${.9 + i * .07}s"><rect class="room empty" data-rough="${dn(r.rough)}" data-done="${dn(r.done)}" x="${10 + r.x}" y="${12 + r.y}" width="${r.w}" height="${r.h}"/>
        <rect x="${10 + r.x + 1.2}" y="${12 + r.y + 1.2}" width="${Math.min(r.w - 2.4, r.name.length * 1.45 + 1.4)}" height="${r.h > 14 ? 6.2 : 3.4}" fill="var(--paper)"/>
        <text class="d-text" x="${10 + r.x + 2}" y="${12 + r.y + 3.5}" font-size="1.9">${esc(r.name.toUpperCase())}</text>
        ${r.h > 14 ? `<text class="d-redt pct" x="${10 + r.x + 2}" y="${12 + r.y + 6.2}" font-size="1.7"></text>` : ''}</g>`).join('')}
      <path d="${outline}" class="d-heavy" pathLength="1" data-draw data-pen="1.6"/>
      <text class="d-mute" x="12" y="10.6" font-size="1.7">${esc(p.label.toUpperCase())}</text>
      ${srcs.filter(([, s]) => s.pin).map(([id, s], i) => {
        pinN++;
        const n = c.n(id), x = 10 + s.pin[0], y = 12 + s.pin[1];
        const red = /Safety|Inspection/.test(s.kind) && /fail|unbraced/i.test(s.body) || id === 'EM-2607-HOOD' || id === 'DL-2607-1021';
        const shape = s.photo ? `<rect x="${x - 2.3}" y="${y - 2.3}" width="4.6" height="4.6"/>` : /RFI|Change|Submittal/.test(s.kind) ? `<path d="M${x} ${y - 2.8} L${x + 2.8} ${y + 2.2} L${x - 2.8} ${y + 2.2} Z"/>` : `<circle cx="${x}" cy="${y}" r="2.4"/>`;
        return `<g class="pin arrive${red ? ' red' : ''}${hot === id ? ' hot' : ''}" data-src="${id}" data-day="${dn(s.at[0])}" style="animation-delay:${1.4 + i * .09}s" tabindex="0" role="button" aria-label="${esc(s.kind)} ${n}">${shape}<text x="${x}" y="${y + (shape.startsWith('<path') ? .6 : .1)}" font-size="2">${n}</text></g>`;
      }).join('')}
      ${recs.filter((r) => r.pin).map((r, i) => `<g class="pin red arrive${hot === r.id ? ' hot' : ''}" data-record="${r.id}" data-day="${dn(r.day)}" style="animation-delay:${1.6 + (pinN + i) * .09}s" tabindex="0" role="button" aria-label="Field record ${r.id}"><circle cx="${10 + r.pin[0]}" cy="${12 + r.pin[1]}" r="2.8"/><text x="${10 + r.pin[0]}" y="${12 + r.pin[1] + .1}" font-size="1.7">F</text></g>`).join('')}
      <g transform="translate(115 80)" data-fade style="--d:1.6s"><path class="d-ink" d="M0 2 L0 -3 M-1.2 -1.4 L0 -3 L1.2 -1.4"/><text class="d-mute" x="-2.4" y="1.4" font-size="1.7" text-anchor="end">N</text></g>
    </svg>`;
  }

  /* ---------- D-5xx: have we dealt with this before? ---------- */
  function memory(spec) {
    const P = F.PRECEDENTS[spec.topic];
    const c = Cites();
    const applied = store.applied[spec.topic];
    if (spec.topic === 'opening') {
      const rd = reading([
        ['Yes. In 2023 at Fulton Mill Lofts the existing openings were also smaller than drawn.', ['P-011']],
        ['That job laser-measured every opening before shop drawings and the storefront fit without a change.', ['P-011']],
        ['Etowah Mercantile found the same condition at the RFI stage instead.', ['RFI-031'], { red: true }]
      ], c);
      return memorySheet(spec, P, c, rd, applied, `<div class="details">${openingDetail('This job / 2604', 'RFI-031', c, true)}${openingDetail('Precedent / 2023', 'P-011', c, false)}</div>`,
        [['This job', 'At RFI', true], ['Precedent', 'Before shop drawings', false], ['Lesson', 'Measure first', false]]);
    }
    const rd = reading([
      ['Yes, once. In 2024 at Larkin Street Kitchen the grease duct was 10" from framing at the roof curb and failed rough-in.', ['P-019']],
      ['It was solved with a listed duct wrap and passed reinspection in a day.', ['P-019']],
      ['Saltmarsh failed the same way on 19 Oct', ['DL-2607-1019'], { red: true }],
      ['and re-routed instead, finished this morning: four days against one.', ['FN-2607-0652']],
      ['The lesson recorded then was to measure at the curb before the ceiling is framed. It was not applied here.', ['L-019'], { red: true }]
    ], c);
    return memorySheet(spec, P, c, rd, applied,
      `<div class="details">${ductDetail('This job / Saltmarsh / 19 Oct 2026', 11, false, 'DL-2607-1019', c)}${ductDetail('Precedent / Larkin Street Kitchen / 2024', 10, true, 'P-019', c)}</div>`,
      [['Saltmarsh lost', '4 days', true], ['Precedent lost', '1 day', false], ['Lesson applied', 'No', true]]);
  }

  function memorySheet(spec, P, c, rd, applied, drawing, verdict) {
    const target = F.PROJECTS[P.apply.project];
    return {
      no: spec.topic === 'duct' ? 'D-501' : 'D-502', title: 'Precedent / ' + P.title, sources: c.order,
      status: [['ok', '■ From the record'], ['', '1 precedent'], ['', `Matches ${P.match.length} of ${P.match.length}`], ['', 'Sample / not live']],
      html: `${rd.html}<div class="s-body">
        <div class="drawing">${drawing}
          <div class="verdict-line">${verdict.map(([k, v, red]) => `<div><span class="eyebrow">${esc(k)}</span><b class="${red ? 'red' : ''}">${esc(v)}</b></div>`).join('')}</div>
          <p class="cap"><span><b>${spec.topic === 'duct' ? 'D-501' : 'D-502'}</b> / Two details, one problem</span><span>Schematic sections / not to scale</span></p>
        </div>
        <div class="notes">
          <section><h3><span>Why it matches</span><span>${pad(P.match.length)}</span></h3><ol class="rows">${P.match.map((m, i) => `<li><div class="line"><span class="k">${pad(i + 1)}</span><span class="t">${esc(m)}</span><span class="r"></span></div></li>`).join('')}</ol></section>
          <section><h3><span>What we can reuse</span><span>${pad(P.reuse.length)}</span></h3><ol class="rows">${P.reuse.map(([t, s], i) => `<li><div class="line"><span class="k">${pad(i + 1)}</span><span class="t">${esc(t)}</span><span class="r">${c.tag(s)}</span></div></li>`).join('')}</ol></section>
          <section><h3><span>Use it next</span><span>${esc(target.name)}</span></h3>
            ${applied ? `<p class="line new"><span class="k">${hhmm(applied.time)}</span><span><span class="t">Sent to ${esc(target.name)} as ${esc(applied.id)}.</span><span class="m">Waiting on PM review</span></span><span></span></p><div class="acts"><button type="button" class="btn" data-record="${applied.id}">Open ${esc(applied.id)} ↗</button></div>`
              : `<p class="empty">${esc(P.apply.text)}.</p><div class="acts"><button type="button" class="btn red" data-apply="${spec.topic}">Apply to ${esc(target.name)} ↗</button></div>`}
          </section>
        </div></div>`
    };
  }

  /* A roof curb in section: deck, curb, duct, the nearest combustible member and the clearance. */
  function ductDetail(title, inches, wrapped, src, c) {
    const u = 1.15, dx = 30, gap = inches * u, req = 18 * u;
    const joist = dx + 5 + gap;
    const n = c.n(src);
    return `<figure class="detail" style="margin:0">
      <svg viewBox="0 0 80 64" role="img" aria-label="${esc(title)}: ${inches} inch clearance">
        <defs><pattern id="wood${n}" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line class="hatch-l" x1="0" y1="0" x2="0" y2="2"/></pattern>
        <pattern id="wrap${n}" width="1.2" height="1.2" patternUnits="userSpaceOnUse"><circle cx=".6" cy=".6" r=".22" fill="var(--red)"/></pattern></defs>
        <path class="d-heavy" d="M2 30 H78" pathLength="1" data-draw ${wrapped ? '' : 'data-pen="1.4"'} style="--t:.7s"/>
        <rect x="2" y="30" width="76" height="3" fill="url(#wood${n})" data-fade style="--d:.5s"/>
        <path class="d-ink" d="M${dx - 6} 30 V20 H${dx + 11} V30" pathLength="1" data-draw style="--d:.4s;--t:.6s" style="stroke-width:1.2px"/>
        ${wrapped ? `<rect x="${dx - 1.5}" y="4" width="8" height="56" fill="url(#wrap${n})" data-fade style="--d:1s"/>` : ''}
        <rect class="d-heavy" x="${dx}" y="4" width="5" height="56" pathLength="1" data-draw style="--d:.6s;--t:.8s"/>
        <rect x="${joist}" y="33" width="4" height="22" fill="url(#wood${n})" class="d-ink" data-fade style="--d:1s"/>
        <text class="d-mute" x="${joist + 5}" y="44" font-size="2">COMBUSTIBLE</text><text class="d-mute" x="${joist + 5}" y="47" font-size="2">FRAMING</text>
        <text class="d-mute" x="${dx + 2.5}" y="2.4" font-size="2" text-anchor="middle">GREASE DUCT</text>
        <text class="d-mute" x="${dx - 5}" y="18.5" font-size="2">ROOF CURB</text>
        <g data-fade style="--d:1.3s"><path class="d-dash" d="M${dx + 5} 58 H${dx + 5 + req}"/><path class="d-dash" d="M${dx + 5 + req} 55 V61"/>
        <text class="d-mute" x="${dx + 5 + req / 2}" y="62.8" font-size="2" text-anchor="middle">18" REQUIRED</text></g>
        <g data-fade style="--d:1.5s"><path class="${wrapped ? 'd-ink' : 'd-red'}" d="M${dx + 5} 39 H${joist} M${dx + 5} 37 V41 M${joist} 37 V41"/>
        <text class="${wrapped ? 'd-text' : 'd-redt'}" x="${dx + 5 + gap / 2}" y="37" font-size="2.4" text-anchor="middle">${inches}"</text></g>
        ${wrapped ? `<g data-fade style="--d:1.7s"><path class="d-ink" d="M${dx - 1.5} 12 L${dx - 10} 8"/><text class="d-redt" x="${dx - 11}" y="7.5" font-size="2" text-anchor="end">LISTED WRAP</text><text class="d-mute" x="${dx - 11}" y="10" font-size="1.8" text-anchor="end">REDUCED CLEARANCE OK</text></g>`
          : `<path class="cloud" d="${cloud(dx + 2, 33, gap + 6, 10)}" pathLength="1" data-draw style="--d:1.8s;--t:.7s"/><g data-fade style="--d:2.2s"><path d="M${dx + gap + 9} 31 l2.2 -3.8 l2.2 3.8 Z" fill="var(--paper)" class="d-red"/><text class="d-redt" x="${dx + gap + 11.2}" y="30.2" font-size="1.8" text-anchor="middle">1</text></g>`}
      </svg>
      <h4><button type="button" class="bub" data-src="${src}">${n}</button>${esc(title)}</h4>
      <p>${wrapped ? 'Failed at rough-in, wrapped with a listed duct wrap, passed the next day.' : 'Failed at rough-in. Re-routed above the bar, now 19" at the curb.'}</p>
    </figure>`;
  }

  function openingDetail(title, src, c, short) {
    const n = c.n(src);
    return `<figure class="detail" style="margin:0"><svg viewBox="0 0 80 50" role="img" aria-label="${esc(title)}">
      <rect x="4" y="6" width="72" height="38" fill="var(--faint)" data-fade/>
      <rect class="d-heavy" x="20" y="12" width="${short ? 38.5 : 40}" height="30" fill="var(--paper)" pathLength="1" data-draw data-pen="1.4"/>
      <path class="d-dash" d="M20 9 H60"/><text class="d-mute" x="40" y="7.6" font-size="2" text-anchor="middle">AS DRAWN</text>
      <path class="${short ? 'd-red' : 'd-ink'}" d="M20 46 H${short ? 58.5 : 60}" /><text class="${short ? 'd-redt' : 'd-text'}" x="40" y="49.4" font-size="2.2" text-anchor="middle">${short ? 'AS BUILT: 1-1/4" NARROWER' : 'MEASURED BEFORE SHOP DRAWINGS'}</text>
      ${short ? `<path class="cloud" d="${cloud(54, 10, 9, 34)}" pathLength="1" data-draw style="--d:1.2s"/>` : ''}
    </svg><h4><button type="button" class="bub" data-src="${src}">${n}</button>${esc(title)}</h4></figure>`;
  }

  /* A revision cloud: scalloped arcs round a rectangle. */
  function cloud(x, y, w, h) {
    const r = 1.6, pts = [];
    const nx = Math.max(2, Math.round(w / (r * 2))), ny = Math.max(2, Math.round(h / (r * 2)));
    let d = `M${x} ${y}`;
    for (let i = 1; i <= nx; i++) d += ` A${r} ${r} 0 0 1 ${x + (w * i) / nx} ${y}`;
    for (let i = 1; i <= ny; i++) d += ` A${r} ${r} 0 0 1 ${x + w} ${y + (h * i) / ny}`;
    for (let i = 1; i <= nx; i++) d += ` A${r} ${r} 0 0 1 ${x + w - (w * i) / nx} ${y + h}`;
    for (let i = 1; i <= ny; i++) d += ` A${r} ${r} 0 0 1 ${x} ${y + h - (h * i) / ny}`;
    void pts;
    return d;
  }

  /* ---------- F-xxxx: a field record and its route to a decision ---------- */
  const STEPS = [['captured', 'Captured in the field'], ['review', 'Project manager review'], ['decision', 'Owner decision'], ['closed', 'Closed']];
  function stateWord(r) { return { review: 'PM review', decision: 'Owner decision', closed: 'Closed in the field', approved: 'Approved', declined: 'Declined' }[r.state]; }

  function record(spec) {
    const r = store.records.find((x) => x.id === spec.id);
    if (!r) return notOnFile({ q: spec.q || spec.id });
    const p = F.PROJECTS[r.project];
    const escalated = r.trail.some((t) => t[2].startsWith('Escalated'));
    const reached = { captured: true, review: true, decision: escalated || r.state === 'decision', closed: ['closed', 'approved', 'declined'].includes(r.state) };
    const current = r.state === 'review' ? 'review' : r.state === 'decision' ? 'decision' : 'closed';
    const stampFor = (k) => {
      const t = r.trail.find((x) => x[3] === k);
      return t ? `<span class="stamp${spec.fresh === k ? ' press' : ''}">${k === 'approved' ? '<canvas width="192" height="60" data-eagle></canvas>' : ''}${esc(t[2].split(':')[0])}<small>${esc(t[1])} / ${hhmm(t[0])} / ${fmt(TODAY)}</small></span>` : '';
    };
    const nextRole = r.state === 'review' ? 'pm' : r.state === 'decision' ? 'owner' : null;
    let actions = '';
    if (nextRole && nextRole === state.role) {
      actions = r.state === 'review'
        ? `<div class="acts"><button type="button" class="btn primary" data-step="close">Resolve in the field</button><button type="button" class="btn red" data-step="escalate">Needs owner decision ↗</button></div>`
        : `<p class="line"><span class="k">Cost</span><span><span class="t">${money(r.estimate)} sample estimate, 1 day</span><span class="m">Visible to owner and controller only</span></span><span></span></p>
           <div class="acts"><button type="button" class="btn red" data-step="approve">Approve</button><button type="button" class="btn ghost" data-step="decline">Decline</button></div>`;
    } else if (nextRole) {
      actions = `<div class="nudge">The next step belongs to the ${roleName(nextRole).toLowerCase()}.${r.state === 'decision' && R().finance ? ` Sample estimate ${money(r.estimate)}.` : ''}<br><button type="button" class="btn" data-as="${nextRole}">View as ${roleName(nextRole).toLowerCase()} →</button></div>`;
    }
    const keyplan = planKey(p, r.pin);
    return {
      no: 'F-' + r.id.slice(3), title: 'Field record / ' + r.kind, sources: [], heading: `${r.kind}: ${r.title}`,
      status: [['ok', '■ Captured record'], ['', r.id], [r.state === 'review' || r.state === 'decision' ? 'warn' : 'ok', stateWord(r)], ['', 'Sample / not live']],
      html: `<div class="s-body record">
        <div class="drawing"><div class="slip">
          <p class="eyebrow">${esc(r.kind)} / ${esc(r.id)} / ${esc(p.no)} ${esc(p.name)} / ${esc(r.grid)}</p>
          <p class="note">${esc(r.note)}</p>
          ${r.photo ? `<img class="photo" src="${r.photo}" alt="Field photograph attached to ${r.id}">` : ''}
          ${keyplan}
          <dl class="meta"><dt>Captured</dt><dd>${hhmm(r.time)} / ${fmt(TODAY)} / ${esc(roleName(r.by))}</dd><dt>Where</dt><dd>${esc(r.grid)}</dd><dt>Photo</dt><dd>${r.photo ? 'Attached, kept with the record' : 'None'}</dd></dl>
          <div class="acts"><button type="button" class="btn ghost" data-open-project="${p.no}" data-hot="${r.id}">On the ${esc(p.name)} timeline ↗</button></div>
        </div></div>
        <div class="notes">
          <section><h3><span>Route</span><span>${esc(stateWord(r))}</span></h3><ol class="route">
            ${STEPS.filter(([k]) => k !== 'decision' || reached.decision || r.state === 'review').map(([k, label], i) => {
              const done = k === 'captured' || (k === 'review' && r.state !== 'review') || (k === 'decision' && ['approved', 'declined'].includes(r.state)) || (k === 'closed' && reached.closed);
              const now = k === current && !reached.closed;
              const stamp = k === 'captured' ? stampFor('captured') : k === 'review' ? stampFor('reviewed') : k === 'decision' ? stampFor('approved') || stampFor('declined') : stampFor('closed');
              return `<li class="${done ? 'done' : ''}${now ? ' now' : ''}"><span class="node">${done ? '✓' : i + 1}</span><span><span class="what">${esc(label)}</span><span class="when">${k === 'decision' && !reached.decision ? 'Only if the PM escalates' : done ? 'Done' : now ? 'Waiting' : 'Not yet'}</span>${stamp}</span></li>`;
            }).join('')}
          </ol>${actions}</section>
          <section><h3><span>Trail</span><span>Kept, never edited</span></h3><ol class="rows">${r.trail.map(([m, by, what]) => `<li><div class="line"><span class="k">${hhmm(m)}</span><span><span class="t">${esc(what)}</span><span class="m">${esc(by)}</span></span><span></span></div></li>`).join('')}</ol></section>
        </div></div>`,
      mount(el) {
        const cv = el.querySelector('[data-eagle]');
        if (cv && window.FreemanBitmapEagle) {
          const ctx = cv.getContext('2d');
          window.FreemanBitmapEagle.load('/eagle/stamp.pbm').then(() => {
            const red = getComputedStyle(document.documentElement).getPropertyValue('--red').trim() || '#f93822';
            if (spec.fresh === 'approved' && !reduced) window.FreemanBitmapEagle.play(ctx, 'impression', { color: red }); else window.FreemanBitmapEagle.still(ctx, red);
          }).catch(() => cv.remove());
        }
        spec.fresh = null;
      }
    };
  }
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  function planKey(p, pin, interactive) {
    const rooms = p.rooms.map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="transparent" class="d-ink" style="stroke-width:1px"/><text class="d-mute" x="${r.x + 1.6}" y="${r.y + 3.6}" font-size="2.4">${esc(r.name.toUpperCase())}</text>`).join('');
    const mark = pin ? `<g class="pin red"><circle cx="${pin[0]}" cy="${pin[1]}" r="2.8"/><text x="${pin[0]}" y="${pin[1] + .1}" font-size="2">F</text></g>` : '';
    return `<svg class="${interactive ? 'cap-plan' : ''}" viewBox="-2 -2 104 64" role="${interactive ? 'button' : 'img'}" aria-label="Key plan of ${esc(p.name)}${interactive ? ': tap where' : ''}" ${interactive ? 'id="cap-plan" tabindex="0"' : ''}>${rooms}<rect x="0" y="0" width="100" height="60" fill="none" class="d-heavy"/>${mark}</svg>`;
  }

  function gridRef(p, pin) {
    if (!pin) return 'Location not placed';
    const gx = p.grid.x, gy = p.grid.y;
    const ix = Math.round((pin[0] / 100) * (gx.length - 1)), iy = Math.round((pin[1] / 60) * (gy.length - 1));
    const room = p.rooms.find((r) => pin[0] >= r.x && pin[0] <= r.x + r.w && pin[1] >= r.y && pin[1] <= r.y + r.h);
    return `${room ? room.name + ', ' : ''}near ${gx[ix]}-${gy[iy]}`;
  }

  /* ---------- B-001: money, for the roles that may see it ---------- */
  function ledger() {
    const c = Cites();
    const rd = reading([
      ['Etowah Mercantile pay app 7 nets $376,740 after retainage and goes out Saturday; approved CO-009 is not on it yet.', ['PA-2604-07']],
      ['The storefront change, $18,420, is not billable until the owner approves it.', ['PCO-012']],
      ['Etowah Drywall’s certificate lapses 3 Nov, which will hold their Pinecrest payments.', ['COI-ETD'], { red: true }]
    ], c);
    return {
      no: 'B-001', title: 'Ledger / billing', sources: c.order,
      status: [['ok', '■ From the record'], ['', `${pad(c.order.length)} sources`], ['', 'Sample figures / not live'], ['', 'Owner and controller only']],
      html: `${rd.html}<div class="s-body wide"><div class="drawing">
        <svg viewBox="0 0 120 30" role="img" aria-label="Pay application 7 broken down">
          <path class="d-heavy" d="M4 18 H116" pathLength="1" data-draw data-pen="1.4"/>
          ${[[4, 'WORK THIS PERIOD', '$418,600'], [80, 'RETAINAGE 10%', '−$41,860'], [104, 'NET DUE', '$376,740']].map(([x, k, v], i) => `<g data-fade style="--d:${.6 + i * .2}s"><path class="d-ink" d="M${x} 14 V22"/><text class="d-mute" x="${x + 1}" y="11" font-size="2">${k}</text><text class="${i === 2 ? 'd-redt' : 'd-text'}" x="${x + 1}" y="27" font-size="3">${v}</text></g>`).join('')}
        </svg>
        <p class="cap"><span><b>B-001</b> / Pay app 7 / 2604</span><span>Sample figures</span></p></div></div>`
    };
  }

  /* ---------- X / R: not on file, restricted ---------- */
  function notOnFile(spec) {
    const words = (spec.q || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !/what|when|where|which|about|there|their|have|does|with|this|that|from|going/.test(w));
    const hits = Object.entries(F.SOURCES).filter(([id, s]) => visible(id) && words.some((w) => strip(s.body + ' ' + s.kind).toLowerCase().includes(w))).slice(0, 4);
    const c = Cites();
    hits.forEach(([id]) => c.n(id));
    return {
      no: 'X-' + pad(state.set.length, 3), title: 'Not on file', sources: c.order,
      status: [['warn', '■ Not on file'], ['', hits.length ? `${pad(hits.length)} related` : 'Nothing related'], ['', 'FreemanAI does not guess']],
      html: `<div class="reading"><p>Nothing in the record answers this. ${hits.length ? 'These records mention it.' : ''}</p></div>
        <div class="s-body"><div class="drawing"><svg viewBox="0 0 120 40" role="img" aria-label="Empty: not on file"><rect class="d-heavy" x="2" y="2" width="116" height="36" pathLength="1" data-draw data-pen="1.4"/><path class="d-ink" d="M2 2 L118 38 M118 2 L2 38" pathLength="1" data-draw style="--d:.7s"/><rect x="40" y="16" width="40" height="8" fill="var(--paper)"/><text class="d-text" x="60" y="20.6" font-size="2.6" text-anchor="middle" dominant-baseline="central">NOT ON FILE</text></svg></div>
        <div class="notes">${hits.length ? `<section><h3><span>Related records</span></h3><ol class="rows">${hits.map(([id, s]) => `<li><button type="button" class="line" data-src="${id}"><span class="k">${esc(short(s.at[0]))}</span><span><span class="t">${esc(first(s.body))}</span><span class="m">${esc(s.kind)}</span></span><span class="r">${c.tag(id)}</span></button></li>`).join('')}</ol></section>` : ''}
        <section><h3><span>Ask a person</span></h3><p class="empty">Send the question to the project manager. The answer, when it comes, joins the record.</p><div class="acts"><button type="button" class="btn" data-person="${esc(spec.q)}">Send to project manager ↗</button></div></section></div></div>`
    };
  }

  function restricted(spec) {
    return {
      no: 'R-' + pad(state.set.length, 3), title: 'Restricted', sources: [],
      status: [['warn', '■ Restricted for ' + R().label.toLowerCase()], ['', 'Nothing shown']],
      html: `<div class="reading"><p>Cost, billing and margin records are open to the owner and the controller. In this prototype the role switch only simulates that; production enforces it on the server.</p></div>
        <div class="s-body wide"><div class="drawing"><svg viewBox="0 0 120 30" role="img" aria-label="Restricted area"><defs><pattern id="h-r" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hatch-l" x1="0" y1="0" x2="0" y2="2.4"/></pattern></defs><rect class="d-heavy" x="2" y="2" width="116" height="26" fill="url(#h-r)" pathLength="1" data-draw data-pen="1.4"/><rect x="38" y="11" width="44" height="8" fill="var(--paper)"/><text class="d-text" x="60" y="15.4" font-size="2.6" text-anchor="middle" dominant-baseline="central">RESTRICTED</text></svg></div></div>`
    };
    void spec;
  }

  /* ---------- the time rule ---------- */
  function rule(host, o) {
    const span = o.to - o.from || 1;
    const pct = (v) => ((v - o.from) / span) * 100;
    host.className = 'rule';
    host.innerHTML = `<div class="track"></div>
      ${o.marks.map(([v, t]) => `<span class="tick m" style="left:${pct(v)}%" title="${esc(t)}"></span>`).join('')}
      <span class="tick" style="left:0"><small>${esc(o.ends[0])}</small></span><span class="tick end" style="left:100%"><small>${esc(o.ends[1])}</small></span>
      ${o.now >= o.from && o.now <= o.to ? `<span class="today" style="left:${pct(o.now)}%"></span>` : ''}
      <button type="button" class="handle" role="slider" aria-valuemin="${o.from}" aria-valuemax="${o.to}" aria-label="Date"><span class="lab"></span></button>`;
    const h = host.querySelector('.handle');
    let v = o.value;
    const set = (nv, fire = true) => {
      v = Math.max(o.from, Math.min(o.to, Math.round(nv / o.step) * o.step));
      h.style.left = pct(v) + '%';
      h.querySelector('.lab').textContent = o.label(v);
      h.setAttribute('aria-valuenow', v); h.setAttribute('aria-valuetext', o.label(v));
      if (fire) o.onchange(v);
    };
    set(v, false);
    const fromX = (x) => { const b = host.getBoundingClientRect(); return o.from + ((x - b.left) / b.width) * span; };
    host.addEventListener('pointerdown', (e) => { host.setPointerCapture(e.pointerId); set(fromX(e.clientX)); host.dataset.drag = '1'; });
    host.addEventListener('pointermove', (e) => { if (host.dataset.drag) set(fromX(e.clientX)); });
    host.addEventListener('pointerup', () => { delete host.dataset.drag; });
    host.addEventListener('pointercancel', () => { delete host.dataset.drag; });
    h.addEventListener('keydown', (e) => {
      const big = e.shiftKey ? 7 : 1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(v + o.step * big); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(v - o.step * big); }
      if (e.key === 'Home') { e.preventDefault(); set(o.from); }
      if (e.key === 'End') { e.preventDefault(); set(o.to); }
    });
  }

  /* ---------- entry and title block ---------- */
  const TRIES = {
    owner: ['What changed across Freeman today?', 'What’s going on with Etowah Mercantile?', 'Have we dealt with this duct problem before?', 'What is billable this month?'],
    controller: ['What changed across Freeman today?', 'What is billable this month?', 'What’s going on with Pinecrest Clinic?', 'Have we dealt with this duct problem before?'],
    pm: ['What changed across Freeman today?', 'What’s going on with Saltmarsh?', 'Have we dealt with this duct problem before?', 'What’s going on with Etowah Mercantile?'],
    super: ['What’s happening on my job today?', 'What changed across Freeman today?', 'Have we seen this duct problem before?', 'Capture a field issue']
  };
  function renderEntry() {
    const open = store.records.filter((r) => r.state === 'review' || r.state === 'decision').length;
    $('entry-foot').innerHTML = `<ol class="tries">${TRIES[state.role].map((q, i) => `<li><button type="button" data-ask="${esc(q)}"><span class="n">${pad(i + 1)}</span><span class="t">${esc(q)}</span><span class="r">${q.startsWith('Capture') ? '● Capture' : 'Ask ↗'}</span></button></li>`).join('')}</ol>
      <p class="since"><span>Since 06:00 / ${pad(F.DISPATCH.length + store.records.length)} field entries / <b>${pad(F.ATTENTION.filter((a) => !a.finance || R().finance).length + open)} need a person</b></span><span>Sample record / fictional / not live</span></p>`;
    $('q').placeholder = 'Ask about a job, a person, a problem';
    $('crumb').innerHTML = '';
  }

  let seal = null;
  function renderTitle(s) {
    const tb = $('tblock');
    const status = s ? s.status[0] : ['ok', '■ Ready'];
    tb.innerHTML = `<div class="tb-row tb-seal"><canvas width="192" height="60" id="seal" aria-hidden="true"></canvas><div class="tb-firm">Freeman General Contracting<br><span class="muted">Cartersville, Georgia</span></div></div>
      <div class="tb-row"><span class="tb-k">Sheet</span><div class="tb-title">${esc(s ? s.title : 'Index / ask to issue a sheet')}</div></div>
      <div class="tb-row"><span class="tb-k">Sheet no.</span><div class="tb-no">${esc(s ? s.no : 'G-000')}</div></div>
      <div class="tb-grid">
        <div><span class="tb-k">Date</span>${fmt(TODAY)}</div><div><span class="tb-k">Time</span>${hhmm(store.clock)}</div>
        <div><span class="tb-k">Viewed as</span>${esc(R().label)}</div><div><span class="tb-k">Sources</span>${s ? pad(s.sources.length) : '—'}</div>
      </div>
      <div class="tb-row"><span class="tb-k">Status</span><span class="tb-status ${status[0]}">${esc(status[1])}</span></div>
      <div class="tb-set"><span class="tb-k">This set / ${pad(state.set.length)} issued</span><ol>${state.set.map((x, i) => `<li><button type="button" data-sheet="${i}" aria-current="${i === state.at}"><span>${esc(x.no || '')}</span><span>${esc(x.title || '')}</span></button></li>`).join('')}</ol></div>
      <div class="tb-foot"><b>Sample record.</b> Fictional projects and people. Not live; not connected to Procore or accounting. <button type="button" id="reset" class="muted" style="text-transform:uppercase;letter-spacing:inherit">Reset</button></div>`;
    $('crumb').innerHTML = s ? `<button type="button" id="crumb-home">Index</button> / ${esc(s.no)} ${esc(s.title)}` : '';
    $('role-label').textContent = R().label.toUpperCase();
    const cv = $('seal');
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#332e20';
    if (window.FreemanBitmapEagle) (seal ||= window.FreemanBitmapEagle.load('/eagle/stamp.pbm')).then(() => window.FreemanBitmapEagle.still(cv.getContext('2d'), ink)).catch(() => cv.remove());
  }

  /* ---------- evidence ---------- */
  const SYSTEM = { 'Daily log': 'Procore daily log', 'Field note': 'Procore daily log', 'Photograph': 'Procore photos', 'RFI': 'Procore RFIs', 'OAC minutes': 'Procore meetings', 'Change proposal': 'Procore change events', 'Submittal': 'Procore submittals', 'Inspection': 'Procore inspections', 'Email': 'Project email', 'Schedule update': 'Project schedule', 'Safety observation': 'Procore observations', 'Insurance certificate': 'Compliance files', 'Punch walk': 'Procore punch list', 'Bid log': 'BuildingConnected', 'Pay application': 'Accounting', 'Precedent': 'FreemanAI record', 'Lesson': 'FreemanAI record' };
  function openEvidence(id, from) {
    const s = F.SOURCES[id];
    const ev = $('evidence');
    if (!s) return;
    if (!can(s.access)) {
      ev.innerHTML = `<header class="ev-top"><span>Restricted</span><button type="button" data-close-ev>× Close</button></header><div class="ev-body"><div class="restricted-box"><h2 id="ev-title">Restricted record.</h2><p>Finance records are open to the owner and the controller.</p></div></div>`;
    } else {
      const n = [...document.querySelectorAll(`#sheet .cite[data-src="${id}"]`)][0]?.textContent;
      ev.innerHTML = `<header class="ev-top"><span>${esc(s.kind)} / ${esc(id)}${n ? ` / source ${n}` : ''}</span><button type="button" data-close-ev>× Close</button></header>
        <div class="ev-body"><h2 id="ev-title">${esc(s.kind)}, ${esc(short(s.at[0]))}${s.project ? ', ' + esc(F.PROJECTS[s.project].name) : ''}</h2>
        ${s.photo ? `<svg class="ev-photo" viewBox="0 0 160 100" role="img" aria-label="Photograph placeholder"><rect class="ph" x="0" y="0" width="160" height="100"/>${Array.from({ length: 9 }, (_, i) => `<path class="d-hair" d="M${20 + i * 14} 20 V80"/>`).join('')}<path class="d-ink" d="M0 80 H160"/><text class="d-mute" x="80" y="92" font-size="5" text-anchor="middle">SAMPLE PHOTOGRAPH NOT INCLUDED</text></svg>` : ''}
        <p class="text">${s.body}</p>
        <dl class="meta"><dt>By</dt><dd>${esc(who(s.by)?.name || s.from)}${who(s.by) ? ' / ' + esc(who(s.by).role) : ''}</dd><dt>Dated</dt><dd>${esc(short(s.at[0]))}, ${esc(s.at[1])}</dd><dt>Project</dt><dd>${s.project ? esc(s.project + ' ' + F.PROJECTS[s.project].name) : 'Company'}</dd><dt>Open to</dt><dd>${s.access === 'finance' ? 'Owner and controller' : 'Every role'}</dd><dt>System</dt><dd>${esc(SYSTEM[s.kind] || 'Record')} <span class="muted">/ not connected in this sample</span></dd></dl>
        ${s.project && s.pin && (!state.set[state.at] || state.set[state.at].kind !== 'project') ? `<div class="acts"><button type="button" class="btn" data-open-project="${s.project}" data-hot="${id}">Show on the plan ↗</button></div>` : ''}</div>`;
    }
    ev.hidden = false;
    ev.querySelector('[data-close-ev]').focus();
    document.querySelectorAll('#sheet .hot').forEach((x) => x.classList.remove('hot'));
    document.querySelectorAll(`#sheet [data-src="${id}"]`).forEach((x) => x.classList.add('hot'));
    openEvidence.from = from;
  }
  function closeEvidence() {
    $('evidence').hidden = true;
    document.querySelectorAll('#sheet .hot').forEach((x) => x.classList.remove('hot'));
    if (openEvidence.from && document.contains(openEvidence.from)) openEvidence.from.focus();
  }

  /* ---------- capture ---------- */
  const SAMPLE_NOTE = 'Water staining on the mezzanine ceiling under the roof drain. Looks like the drain body is leaking at the clamp ring. Need roofer before drywall closes Friday.';
  const cap = { project: '2604', kind: 'Issue', pin: null, photo: null };
  function openCapture() {
    const spec = state.set[state.at];
    cap.project = spec && spec.kind === 'project' ? spec.no : HOME[state.role] || '2604';
    if (F.PROJECTS[cap.project].phase === 'Preconstruction') cap.project = '2604';
    cap.pin = null; cap.photo = null; cap.kind = 'Issue';
    renderCapture();
    $('capture').hidden = false;
    document.body.classList.add('capturing');
    if (matchMedia('(pointer:fine)').matches) setTimeout(() => $('cap-plan')?.focus(), 30);
  }
  function closeCapture() { $('capture').hidden = true; document.body.classList.remove('capturing'); }
  function renderCapture(keepNote) {
    const p = F.PROJECTS[cap.project];
    const note = keepNote ? $('cap-note').value : '';
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    $('capture').innerHTML = `<header class="cap-top"><span id="cap-title">Capture / ${esc(roleName(state.role))}</span><button type="button" data-close-cap>× Close</button></header>
      <div class="cap-body">
        <div class="cap-step"><span class="eyebrow"><span>01 Job</span></span><select id="cap-project" aria-label="Job">${Object.values(F.PROJECTS).filter((x) => x.phase !== 'Preconstruction').map((x) => `<option value="${x.no}"${x.no === cap.project ? ' selected' : ''}>${x.no} ${esc(x.name)}</option>`).join('')}</select></div>
        <div class="cap-step"><span class="eyebrow"><span>02 Tap where</span><b id="cap-where">${esc(gridRef(p, cap.pin))}</b></span>${planKey(p, cap.pin, true)}</div>
        <div class="cap-step"><span class="eyebrow"><span>03 Say what you see</span></span>
          <textarea id="cap-note" placeholder="What, where, and why it matters.">${esc(note)}</textarea>
          <div class="talk"><button type="button" class="btn" id="cap-talk" aria-pressed="false">● ${SR ? 'Hold to talk' : 'Dictate (sample)'}</button><label class="btn ghost" for="cap-photo">+ Photo</label><input id="cap-photo" type="file" accept="image/*" capture="environment" hidden><span class="thumbs" id="cap-thumbs">${cap.photo ? `<img src="${cap.photo}" alt="">` : ''}</span></div></div>
        <div class="cap-step"><span class="eyebrow"><span>04 Kind</span></span><div class="kinds" role="group" aria-label="Kind">${['Issue', 'Observation', 'Safety', 'Delay'].map((k) => `<button type="button" data-kind="${k}" aria-pressed="${k === cap.kind}">${k}</button>`).join('')}</div></div>
      </div>
      <footer class="cap-foot"><button type="button" class="btn red" id="cap-send">Send to PM review →</button><span class="hint">Becomes a record with a trail. The owner sees it only if the PM escalates.</span></footer>`;
    const plan = $('cap-plan');
    const place = (e) => {
      const pt = plan.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const q = pt.matrixTransform(plan.getScreenCTM().inverse());
      cap.pin = [Math.max(0, Math.min(100, Math.round(q.x))), Math.max(0, Math.min(60, Math.round(q.y)))];
      renderCapture(true);
      say('Placed at ' + gridRef(F.PROJECTS[cap.project], cap.pin));
    };
    plan.addEventListener('click', place);
    plan.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cap.pin = [50, 30]; renderCapture(true); } });
    $('cap-project').addEventListener('change', (e) => { cap.project = e.target.value; cap.pin = null; renderCapture(true); });
    $('capture').querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => { cap.kind = b.dataset.kind; $('capture').querySelectorAll('[data-kind]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));
    $('cap-photo').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) shrink(f).then((u) => { cap.photo = u; $('cap-thumbs').innerHTML = `<img src="${u}" alt="">`; }); });
    const talk = $('cap-talk');
    if (SR) {
      let rec = null;
      const start = (e) => { e.preventDefault(); if (rec) return; rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true;
        const base = $('cap-note').value;
        let heard = false;
        rec.onresult = (ev) => { heard = true; $('cap-note').value = (base ? base + ' ' : '') + [...ev.results].map((r) => r[0].transcript).join(' '); };
        const fallback = () => { rec = null; if (talk.dataset.typing !== '1' && !$('cap-note').value.trim()) typeInto($('cap-note'), SAMPLE_NOTE, talk); else talk.setAttribute('aria-pressed', 'false'); };
        rec.onerror = () => {};
        rec.onend = () => { if (!heard) fallback(); else { rec = null; talk.setAttribute('aria-pressed', 'false'); } };
        talk.setAttribute('aria-pressed', 'true'); try { rec.start(); } catch (_) { fallback(); } };
      const stop = () => { if (rec) rec.stop(); };
      talk.addEventListener('pointerdown', start); talk.addEventListener('pointerup', stop); talk.addEventListener('pointerleave', stop);
      talk.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { if (rec) stop(); else start(e); } });
    } else {
      talk.addEventListener('click', () => typeInto($('cap-note'), SAMPLE_NOTE, talk));
    }
    $('cap-send').addEventListener('click', send);
  }
  function typeInto(el, text, btn) {
    btn.setAttribute('aria-pressed', 'true'); btn.dataset.typing = '1';
    const end = () => { btn.setAttribute('aria-pressed', 'false'); btn.dataset.typing = ''; say('Sample dictation entered.'); };
    if (reduced) { el.value = text; end(); return; }
    let i = 0;
    const step = () => { i = Math.min(text.length, i + 3); el.value = text.slice(0, i); if (i < text.length) setTimeout(step, 16); else end(); };
    step();
  }
  function send() {
    const note = $('cap-note').value.trim();
    if (!note) { $('cap-note').value = ''; typeInto($('cap-note'), SAMPLE_NOTE, $('cap-talk')); say('Using the sample dictation. Press send again.'); return; }
    const p = F.PROJECTS[cap.project];
    const id = 'FR-' + pad(++store.seq, 4);
    const t = tick(1);
    const title = note.split(/(?<=[.!?])\s/)[0].replace(/\.$/, '').slice(0, 80);
    const r = { id, project: p.no, kind: cap.kind, pin: cap.pin, grid: gridRef(p, cap.pin), note, title, photo: cap.photo, by: state.role, day: F.NOW.date, time: t, state: 'review', estimate: 2400,
      trail: [[t, roleName(state.role), `Captured: ${cap.kind.toLowerCase()} at ${gridRef(p, cap.pin)}${cap.photo ? ', with photograph' : ''}`, 'captured'], [t, 'FreemanAI', `Filed as ${id}; routed to project manager review`]] };
    store.records.push(r);
    save();
    closeCapture();
    issue({ kind: 'record', id, q: `${cap.kind}: ${title}`, fresh: 'captured' });
    say(`Filed ${id}. Routed to project manager review.`);
  }
  function shrink(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { const k = Math.min(1, 720 / Math.max(img.width, img.height)); const cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(img.src); resolve(cv.toDataURL('image/jpeg', .72)); };
      img.src = URL.createObjectURL(file);
    });
  }

  function stepRecord(how) {
    const spec = state.set[state.at];
    const r = store.records.find((x) => x.id === spec.id);
    if (!r) return;
    const t = tick();
    const me = roleName(state.role);
    if (how === 'close') { r.state = 'closed'; r.trail.push([t, me, 'Reviewed: resolved in the field', 'reviewed'], [t, me, 'Closed', 'closed']); }
    if (how === 'escalate') { r.state = 'decision'; r.trail.push([t, me, 'Reviewed: needs owner decision', 'reviewed'], [t, me, 'Escalated to owner decision with a sample estimate']); }
    if (how === 'approve') { r.state = 'approved'; r.trail.push([t, me, 'Approved: proceed', 'approved'], [t, 'FreemanAI', 'Decision added to the project record']); }
    if (how === 'decline') { r.state = 'declined'; r.trail.push([t, me, 'Declined: hold', 'declined']); }
    save();
    issue({ ...spec, fresh: { close: 'closed', escalate: 'reviewed', approve: 'approved', decline: 'declined' }[how] }, { replace: true });
  }

  function apply(topic) {
    const P = F.PRECEDENTS[topic];
    const p = F.PROJECTS[P.apply.project];
    const id = 'FR-' + pad(++store.seq, 4);
    const t = tick(1);
    store.records.push({ id, project: p.no, kind: 'Reuse', pin: null, grid: 'Whole job', note: P.apply.text + '. From precedent ' + P.id + '.', title: P.apply.text, photo: null, by: state.role, day: F.NOW.date, time: t, state: 'review', estimate: 0,
      trail: [[t, roleName(state.role), `Captured: reuse from ${P.id}`, 'captured'], [t, 'FreemanAI', `Filed as ${id}; routed to project manager review`]] });
    store.applied[topic] = { id, time: t };
    save();
    issue(state.set[state.at], { replace: true });
    say(`Sent to ${p.name} as ${id}.`);
  }

  function personQuestion(q) {
    const id = 'FR-' + pad(++store.seq, 4);
    const t = tick(1);
    store.records.push({ id, project: HOME[state.role] || '2604', kind: 'Question', pin: null, grid: 'Not placed', note: q, title: q, photo: null, by: state.role, day: F.NOW.date, time: t, state: 'review', estimate: 0,
      trail: [[t, roleName(state.role), 'Captured: question not answered by the record', 'captured'], [t, 'FreemanAI', `Filed as ${id}; routed to project manager review`]] });
    save();
    issue({ kind: 'record', id, q, fresh: 'captured' });
  }

  /* ---------- roles ---------- */
  function openRoles(open) {
    const list = $('roles');
    list.hidden = !open;
    $('role').setAttribute('aria-expanded', String(open));
    if (!open) return;
    list.innerHTML = Object.entries(F.ROLES).map(([k, r], i) => `<li><button type="button" role="option" data-role="${k}" aria-selected="${k === state.role}"><span class="n">${pad(i + 1)}</span><span><span class="name">${esc(r.label)}</span><small>${esc(r.who)}${r.finance ? ' / sees finance' : ' / no finance'}</small></span></button></li>`).join('') +
      '<li class="note">Simulates a view, not security. Production needs server-side permissions, audit logs and consent for photographs and voice.</li>';
    list.querySelector('[aria-selected="true"]').focus();
  }
  function setRole(r) { state.role = r; openRoles(false); closeEvidence(); paint(false); say('Viewing as ' + R().label.toLowerCase()); }

  /* ---------- events ---------- */
  $('ask').addEventListener('submit', (e) => { e.preventDefault(); ask($('q').value); });
  $('home').addEventListener('click', () => { state.at = -1; closeEvidence(); paint(true); });
  $('capture-btn').addEventListener('click', openCapture);
  $('role').addEventListener('click', () => openRoles($('roles').hidden));
  $('roles').addEventListener('click', (e) => { const b = e.target.closest('[data-role]'); if (b) setRole(b.dataset.role); });

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!$('roles').hidden && !t.closest('#roles,#role')) openRoles(false);
    let b;
    if ((b = t.closest('[data-close-ev]'))) return closeEvidence();
    if ((b = t.closest('[data-close-cap]'))) return closeCapture();
    if ((b = t.closest('[data-ask]'))) { closeEvidence(); return b.dataset.ask.startsWith('Capture') ? openCapture() : ask(b.dataset.ask); }
    if ((b = t.closest('[data-src]'))) { e.preventDefault(); return openEvidence(b.dataset.src, b); }
    if ((b = t.closest('[data-record]'))) { closeEvidence(); return issue({ kind: 'record', id: b.dataset.record, q: null }); }
    if ((b = t.closest('[data-open-project]'))) { closeEvidence(); state.scrub[b.dataset.openProject] = TODAY; return issue({ kind: 'project', no: b.dataset.openProject, hot: b.dataset.hot, q: `What’s going on with ${F.PROJECTS[b.dataset.openProject].name}?` }); }
    if ((b = t.closest('[data-step]'))) return stepRecord(b.dataset.step);
    if ((b = t.closest('[data-as]'))) return setRole(b.dataset.as);
    if ((b = t.closest('[data-apply]'))) return apply(b.dataset.apply);
    if ((b = t.closest('[data-person]'))) return personQuestion(b.dataset.person);
    if ((b = t.closest('[data-sheet]'))) { state.at = +b.dataset.sheet; closeEvidence(); return paint(true); }
    if ((b = t.closest('#crumb-home'))) { state.at = -1; return paint(true); }
    if ((b = t.closest('#reset'))) { store = seed(); save(); state.set = []; state.at = -1; state.scrub = {}; closeEvidence(); return paint(false); }
  });
  document.addEventListener('mouseover', (e) => {
    const b = e.target.closest('#sheet [data-src], #sheet [data-site]');
    document.querySelectorAll('#sheet .hot, .site.on').forEach((x) => { if (!$('evidence').hidden && x.dataset.src) return; x.classList.remove('hot', 'on'); });
    if (!b) return;
    if (b.dataset.src) document.querySelectorAll(`#sheet [data-src="${b.dataset.src}"]`).forEach((x) => x.classList.add('hot'));
    const site = b.dataset.site || F.SOURCES[b.dataset.src]?.project;
    if (site) document.querySelectorAll(`.site[data-site="${site}"]`).forEach((x) => x.classList.add('on'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!$('capture').hidden) closeCapture(); else if (!$('evidence').hidden) closeEvidence(); else openRoles(false); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('svg [data-src], .site, svg [data-record]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
    if (e.target.matches('input,textarea,select') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); $('q').focus(); }
    if (e.key === 'c') { e.preventDefault(); openCapture(); }
  });

  /* Speak a question */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    const mic = $('mic');
    mic.hidden = false;
    let rec = null;
    mic.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true;
      rec.onresult = (ev) => { const r = [...ev.results]; $('q').value = r.map((x) => x[0].transcript).join(' '); if (r[r.length - 1].isFinal) { rec.stop(); ask($('q').value); } };
      rec.onerror = () => {}; rec.onend = () => { rec = null; mic.setAttribute('aria-pressed', 'false'); };
      mic.setAttribute('aria-pressed', 'true'); try { rec.start(); } catch (_) { rec = null; }
    });
  }

  /* The ghost question: a hint of what can be asked, cycling while the field is empty */
  const GHOSTS = ['What changed across Freeman today?', 'What’s going on with Saltmarsh?', 'Have we dealt with this before?', 'Ask about a job, a person, a problem'];
  let g = 0;
  setInterval(() => { if (document.body.dataset.mode === 'entry' && !$('q').value && document.activeElement !== $('q')) $('q').placeholder = GHOSTS[g++ % GHOSTS.length]; }, 2600);

  /* Sheet border zone references */
  $('ref-top').innerHTML = 'ABCDEFGH'.split('').map((l) => `<span>${l}</span>`).join('');
  $('ref-left').innerHTML = '123456'.split('').map((l) => `<span>${l}</span>`).join('');

  const q0 = params.get('q');
  if (q0) ask(q0); else paint(false);
})();
