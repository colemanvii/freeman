/* FreemanAI — Interface Exploration 001.
   SEE what is true now. ASK the record and see the record. ACT and leave a trail.
   Static prototype: the sample record lives in data.js; changes persist in this browser only. */
(() => {
  'use strict';
  const D = window.FREEMAN_AI;
  const $ = (id) => document.getElementById(id);
  const KEY = 'freemanai-001';
  const VERBS = ['see', 'ask', 'act'];
  const PERSON_ROLE = Object.fromEntries(Object.entries(D.ROLE_PERSON).map(([r, p]) => [p, r]));
  const ACCESS_NAME = { field: 'Field', project: 'Project', finance: 'Finance', company: 'Company' };
  const ACCESS_WHO = { field: 'Every role', project: 'Every role', finance: 'Owner and controller', company: 'Every role' };

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const day = (iso) => { if (!iso) return '—'; const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]}${y !== 2026 ? ' ' + y : ''}`; };
  const person = (id) => D.PEOPLE.find((p) => p.id === id) || { name: id, role: '' };
  const project = (no) => D.PROJECTS.find((p) => p.no === no);
  const say = (t) => { $('announce').textContent = t; };

  /* ---------- state ---------- */
  const seed = () => ({
    seq: 412,
    items: D.ITEMS.map((it) => ({ ...it, to: D.ROLE_PERSON[it.owner] || it.owner, trail: it.trail.map((t) => [...t]) })),
    events: []
  });
  let store;
  try { store = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (_) { store = seed(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (_) { /* private mode: keep in memory */ } };

  const params = new URLSearchParams(location.search);
  const state = {
    role: D.ROLES[params.get('role')] ? params.get('role') : 'owner',
    verb: VERBS.includes(params.get('verb')) ? params.get('verb') : 'see',
    answer: null,
    kind: 'ISSUE',
    photos: [],
    filed: null
  };
  const me = () => D.ROLE_PERSON[state.role];
  const R = () => D.ROLES[state.role];
  const can = (access) => R().access.includes(access);
  const myProjects = () => D.PROJECTS.filter((p) => !R().projects || R().projects.includes(p.no));
  const visibleSource = (id) => D.SOURCES[id] && can(D.SOURCES[id].access);

  /* ---------- frame ---------- */
  function render() {
    document.body.dataset.verb = state.verb;
    document.querySelectorAll('.verbs button').forEach((b) => {
      if (b.dataset.verb === state.verb) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    $('role-label').textContent = R().label;
    const ledes = {
      see: [R().see, R().scope],
      ask: ['Answers from the record, with the record attached.', 'Only what a ' + R().label.toLowerCase() + ' may see'],
      act: ['Capture it. Give it an owner. Move it forward.', 'Acting as ' + (state.role === 'owner' ? 'the owner' : R().person)]
    }[state.verb];
    $('lede').innerHTML = `${esc(ledes[0])}<small>${esc(ledes[1])}</small>`;
    $('work').innerHTML = { see: renderSee, ask: renderAsk, act: renderAct }[state.verb]();
    if (state.verb === 'ask') bindAsk();
    if (state.verb === 'act') bindAct();
    const url = new URL(location.href);
    url.searchParams.set('role', state.role); url.searchParams.set('verb', state.verb);
    history.replaceState(null, '', url);
  }

  function go(verb, opts = {}) {
    state.verb = verb;
    render();
    if (!opts.keepScroll) $('work').scrollTop = 0;
  }

  /* ---------- SEE ---------- */
  function waitingOn(roleKey) {
    const pid = D.ROLE_PERSON[roleKey];
    return store.items.filter((i) => i.to === pid && (i.state === 'waiting' || i.state === 'open'));
  }

  function figures() {
    const w = waitingOn(state.role);
    const f = {
      owner: [
        ['REVENUE 2026', '$9.41M', 'of the $12M goal / sample figure', 78],
        ['WAITING ON YOU', pad(w.length), w.length ? w.map((i) => i.short || i.title).slice(0, 2).join(' / ') : 'Nothing waiting', null, w.length > 0],
        ['BEHIND SCHEDULE', '01', 'Saltmarsh / four working days', null, true]
      ],
      controller: [
        ['PAY APP 7 / 2604', '$376,740', 'Net due / goes out Sat 25 Oct'],
        ['OVER 60 DAYS', '$38,500', 'Saltmarsh pay app 4 / disputed line', null, true],
        ['WAITING ON YOU', pad(w.length), w.length ? w[0].title : 'Nothing waiting', null, w.length > 0]
      ],
      pm: [
        ['CRITICAL PATH', '−4 days', 'Saltmarsh / failed duct inspection', null, true],
        ['GLASS DEADLINE', '2 days', 'PCO-012 approval by Fri 24 Oct'],
        ['WAITING ON YOU', pad(w.length), w.length ? w[0].title : 'Nothing waiting', null, w.length > 0]
      ],
      super: [
        ['ON SITE YESTERDAY', '23', 'Tile 4 / millwork 6 / paint 5 / electric 4 / Freeman 4'],
        ['WEATHER', '71° clear', 'Rain Sunday 26 Oct, 60%'],
        ['ASSIGNED TO YOU', pad(w.length), w.length ? w[0].title : 'Nothing open', null, w.length > 0]
      ]
    }[state.role];
    const from = {
      owner: ['Ledger / 21 Oct', 'FreemanAI / now', 'Schedule / 21 Oct'],
      controller: ['Pay app draft / 21 Oct', 'Receivables / 21 Oct', 'FreemanAI / now'],
      pm: ['Schedule / 21 Oct', 'PCO-012 / 17 Oct', 'FreemanAI / now'],
      super: ['Daily log / 21 Oct', 'Forecast / 06:00', 'FreemanAI / now']
    }[state.role];
    f.forEach((x, i) => { x[2] += '\n'; x.from = from[i]; });
    return `<div class="figures">${f.map(([k, v, c, bar, hot], i) => `<div class="figure"><div class="k">${k}</div><div class="v${hot ? ' hot' : ''}">${esc(v)}</div>${bar ? `<div class="bar"><span style="width:${bar}%"></span></div>` : ''}<div class="c">${esc(c.trim())}</div><div class="src">${esc(f[i].from)}</div></div>`).join('')}</div>`;
  }

  function signals() {
    const pid = me();
    const fromStore = store.events.filter((e) => e.roles.includes(state.role)).map((e) => ({ ...e, tone: 'signal' }));
    const seen = new Set(fromStore.map((e) => e.ref));
    const assigned = store.items.filter((i) => i.captured && i.to === pid && i.state === 'open' && !seen.has(i.id))
      .map((i) => ({ tone: 'signal', project: i.project, text: `${i.kind}: ${i.title}`, ref: i.id, time: 'FROM ' + person(i.from).name.split(' ')[0] }));
    const seeded = D.SIGNALS.filter((s) => s.roles.includes(state.role)).filter((s) => {
      const item = store.items.find((i) => i.id === s.ref);
      return !item || item.state === 'waiting' || item.state === 'open';
    });
    return [...fromStore.reverse(), ...assigned, ...seeded.filter((s) => s.tone === 'signal'), ...seeded.filter((s) => s.tone !== 'signal')];
  }

  function renderSee() {
    const list = signals();
    const showMoney = can('finance');
    const jobs = myProjects();
    const stateWord = { ok: 'On sequence', watch: 'Watch', late: 'Behind 4d' };
    return figures() +
      `<section class="block"><div class="eyebrow"><span>Now</span><span>${pad(list.length)} / Thu 22 Oct, 07:40</span></div>
       <ol class="rows">${list.map((s, i) => `<li><button type="button" class="row" ${s.ref ? `data-open="${esc(s.ref)}"` : 'disabled'}>
         <span class="n${s.tone === 'signal' ? '' : ' quiet'}">${pad(i + 1)}</span>
         <span><span class="t">${esc(s.text)}</span><span class="m">${s.project ? esc(project(s.project).name) : 'Company'}</span></span>
         <span class="r${s.time === 'CONFLICT' || s.time === 'NOW' ? ' hot' : ''}">${esc(s.time)}</span></button></li>`).join('')}</ol></section>
      <section class="block"><div class="eyebrow"><span>${jobs.length > 1 ? 'Jobs' : 'Job'}</span><span>${pad(jobs.length)} active</span></div>
       <table class="jobs"><thead><tr><th class="no">No</th><th>Project</th><th class="ph">Phase</th>${showMoney ? '<th class="pct">Billed</th>' : ''}<th class="st">State</th></tr></thead>
       <tbody>${jobs.map((p) => `<tr data-project="${p.no}" tabindex="0"><td class="no">${p.no}</td><td><span class="name">${esc(p.name)}</span><small>${esc(p.place)}</small></td><td>${esc(p.phase)}</td>${showMoney ? `<td class="pct">${Math.round(p.billed * 100)}%</td>` : ''}<td class="st ${p.state}">${stateWord[p.state]}</td></tr>`).join('')}</tbody></table></section>`;
  }

  /* ---------- ASK ---------- */
  const STOP = new Set('what which when where who whom why how the and are was were has have had did does for with from that this our your their about there any all can will would should could been into than then them they its not but get got is on of to in at by we us me my'.split(' '));
  const words = (s) => s.toLowerCase().replace(/[^a-z0-9\- ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

  function find(text) {
    const t = text.toLowerCase().trim();
    let best = null, top = 0;
    D.ANSWERS.forEach((a) => {
      let s = a.q.toLowerCase() === t ? 100 : 0;
      a.match.forEach((m) => { if (t.includes(m)) s += m.length > 6 ? 3 : 2; });
      if (s > top) { top = s; best = a; }
    });
    return top >= 2 ? best : null;
  }

  function ask(text) {
    text = text.trim();
    if (!text) return;
    const a = find(text);
    if (a && !a.roles.includes(state.role)) {
      state.answer = { text, restricted: true };
    } else if (a) {
      const parts = a.parts.filter(([, refs]) => refs.every(visibleSource));
      state.answer = { text, a, parts, withheld: a.parts.length - parts.length };
    } else {
      const w = words(text);
      const hits = Object.entries(D.SOURCES).filter(([id]) => visibleSource(id))
        .map(([id, s]) => [id, w.reduce((n, x) => n + ((s.title + ' ' + s.body + ' ' + s.kind + ' ' + (project(s.project)?.name || '')).toLowerCase().includes(x) ? 1 : 0), 0)])
        .filter(([, n]) => n > 0).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([id]) => id);
      state.answer = { text, hits };
    }
    go('ask');
    say('Answer ready.');
  }

  function renderAnswer() {
    const ans = state.answer;
    const head = `<div class="asked">You asked / ${esc(ans.text)}</div>`;
    if (ans.restricted) {
      return head + `<div class="answer"><p>This is held in finance records, which are open to the owner and the controller.</p></div>
        <div class="verdict"><span class="warn">■ Restricted for ${esc(R().label.toLowerCase())}</span><span>Nothing was shown</span></div>
        <div class="next"><button type="button" class="btn" data-route="renee" data-q="${esc(ans.text)}">Ask Renee Albright ↗</button></div>`;
    }
    if (!ans.a) {
      if (ans.hits.length) {
        return head + `<div class="answer"><p>There is no direct answer on file. These records mention it.</p></div>
          <div class="verdict"><span class="warn">■ Not answered by the record</span><span>${pad(ans.hits.length)} related</span></div>
          ${evidence(ans.hits)}
          <div class="next"><button type="button" class="btn" data-route="lena" data-q="${esc(ans.text)}">Ask a person ↗</button></div>`;
      }
      return head + `<div class="answer"><p>Not on file. Nothing in the record answers this, and FreemanAI will not guess.</p></div>
        <div class="verdict"><span class="warn">■ Not on file</span></div>
        <div class="next"><button type="button" class="btn" data-route="lena" data-q="${esc(ans.text)}">Ask a person ↗</button></div>`;
    }
    const order = [];
    ans.parts.forEach(([, refs]) => refs.forEach((r) => { if (!order.includes(r)) order.push(r); }));
    const conflict = ans.a.conflict && ans.a.conflict.refs.every(visibleSource) ? ans.a.conflict : null;
    if (conflict) conflict.refs.forEach((r) => { if (!order.includes(r)) order.push(r); });
    const latest = order.map((r) => D.SOURCES[r].date).sort().pop();
    const act = ans.a.act;
    return head +
      `<div class="answer">${ans.parts.map(([t, refs]) => `<p>${esc(t)}${refs.map((r) => `<button type="button" class="cite" data-open="${r}" aria-label="Source ${order.indexOf(r) + 1}, ${r}">${order.indexOf(r) + 1}</button>`).join('')}</p>`).join('')}</div>
       ${conflict ? `<div class="conflict"><div class="eyebrow">The record disagrees</div>${esc(conflict.text)}${conflict.refs.map((r) => `<button type="button" class="cite" data-open="${r}">${order.indexOf(r) + 1}</button>`).join('')}</div>` : ''}
       <div class="verdict"><span class="ok">■ From the record</span><span>${pad(order.length)} sources</span><span>Latest ${day(latest)}</span>${ans.withheld ? `<span class="warn">${ans.withheld} statement${ans.withheld > 1 ? 's' : ''} withheld / finance</span>` : ''}</div>
       ${act ? `<div class="next"><button type="button" class="btn primary" data-act="${ans.a.id}">${esc(act.label)} ↗</button></div>` : ''}
       ${evidence(order)}`;
  }

  function evidence(ids) {
    return `<section class="block"><div class="eyebrow"><span>Evidence</span><span>Open any record</span></div><ol class="rows">${ids.map((id, i) => {
      const s = D.SOURCES[id];
      return `<li><button type="button" class="row" data-open="${id}"><span class="n">${pad(i + 1)}</span><span><span class="t">${esc(s.title)}</span><span class="m">${esc(s.kind)} / ${esc(id)} / ${esc(s.author)}</span></span><span class="r">${day(s.date)}</span></button></li>`;
    }).join('')}</ol></section>`;
  }

  function renderAsk() {
    const form = `<form class="askline" id="askform" autocomplete="off"><input id="q" name="q" type="text" placeholder="Ask the record." aria-label="Ask FreemanAI" value="${state.answer ? esc(state.answer.text) : ''}"><button type="submit">Ask ↵</button></form>`;
    if (state.answer) return form + renderAnswer() + `<div class="next"><button type="button" class="btn ghost" id="clear">← Other questions</button></div>`;
    const qs = D.SUGGEST[state.role].map((id) => D.ANSWERS.find((a) => a.id === id));
    const count = Object.keys(D.SOURCES).filter(visibleSource).length;
    return form + `<section class="block"><div class="eyebrow"><span>Asked this week</span><span>${esc(R().label)}</span></div><ol class="rows">${qs.map((a, i) => `<li><button type="button" class="row" data-ask="${esc(a.q)}"><span class="n">${pad(i + 1)}</span><span class="t">${esc(a.q)}</span><span class="r">↗</span></button></li>`).join('')}</ol></section>
      <p class="eyebrow"><span>The record / ${count} documents open to you / daily logs, RFIs, minutes, submittals, standards, lessons${can('finance') ? ', cost and billing' : ''}</span></p>`;
  }

  function bindAsk() {
    $('askform').addEventListener('submit', (e) => { e.preventDefault(); ask($('q').value); });
    if (!state.answer) setTimeout(() => { if (matchMedia('(pointer:fine)').matches) $('q').focus(); }, 0);
    const clear = $('clear');
    if (clear) clear.addEventListener('click', () => { state.answer = null; go('ask'); });
  }

  /* ---------- ACT ---------- */
  const KINDS = ['ISSUE', 'OBSERVATION', 'DELAY', 'SAFETY', 'DECISION NEEDED'];

  function itemRow(i, n, mine) {
    const actions = !mine ? '' : i.kind === 'decision'
      ? `<span class="item-actions"><button type="button" class="btn" data-do="approve" data-id="${i.id}">Approve</button><button type="button" class="btn ghost" data-do="return" data-id="${i.id}">Return</button></span>`
      : `<span class="item-actions"><button type="button" class="btn" data-do="done" data-id="${i.id}">Done</button></span>`;
    const meta = [project(i.project)?.name, i.amount && can('finance') || i.amount && i.kind === 'decision' && state.role !== 'super' ? money(i.amount) : null,
      mine ? 'From ' + person(i.from).name : 'With ' + person(i.to).name].filter(Boolean).join(' / ');
    return `<li><div class="row"><span class="n">${pad(n)}</span><span><button type="button" class="t" data-open="${i.id}">${esc(i.title)}</button><span class="m">${esc(meta)}</span>${actions}</span><span class="r state ${i.state}">${i.state === 'waiting' || i.state === 'open' ? 'Due ' + day(i.due) : esc(i.state)}</span></div></li>`;
  }

  function renderAct() {
    const pid = me();
    const mine = store.items.filter((i) => i.to === pid && (i.state === 'waiting' || i.state === 'open'));
    const others = store.items.filter((i) => i.from === pid && i.to !== pid && (i.state === 'waiting' || i.state === 'open'));
    const closed = store.items.filter((i) => (i.to === pid || i.from === pid) && !(i.state === 'waiting' || i.state === 'open')).slice(-4).reverse();
    const projects = myProjects().filter((p) => p.phase !== 'Preconstruction' || state.role !== 'super');
    const capture = `<section class="block"><div class="eyebrow"><span>Capture</span><span>Becomes a record with an owner</span></div>
      ${state.filed ? `<p class="filed">Filed <b>${esc(state.filed.id)}</b>. ${esc(person(state.filed.to).name)} has it in Act, and it heads their See.</p>` : ''}
      <form class="capture" id="capture">
        <div class="kinds" role="group" aria-label="Kind">${KINDS.map((k) => `<button type="button" data-kind="${k}" aria-pressed="${k === state.kind}">${k}</button>`).join('')}</div>
        <div class="pair"><label class="field"><span>Project</span><select name="project">${projects.map((p) => `<option value="${p.no}">${p.no} ${esc(p.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Where</span><input name="where" placeholder="Level, room, gridline" autocomplete="off"></label></div>
        <label class="field"><span>What you see</span><textarea name="note" id="note" placeholder="Say it plainly. What, where, and why it matters."></textarea></label>
        <div class="tools"><label class="btn ghost" for="photo">+ Photo</label><input id="photo" type="file" accept="image/*" capture="environment" multiple hidden>
          <button type="button" class="btn ghost mic" id="mic" aria-pressed="false" hidden>● Speak</button>
          <span class="thumbs" id="thumbs">${state.photos.map((p) => `<img src="${p}" alt="">`).join('')}</span></div>
        <div class="pair"><label class="field"><span>Owner</span><select name="to">${D.PEOPLE.filter((p) => p.id !== pid).map((p) => `<option value="${p.id}"${p.id === suggestOwner() ? ' selected' : ''}>${esc(p.name)} / ${esc(p.role)}</option>`).join('')}</select></label>
        <label class="field"><span>Needed by</span><input name="due" type="date" value="2026-10-24"></label></div>
        <div><button type="submit" class="btn primary">File it ↗</button></div>
      </form></section>`;
    const queue = `<section class="block"><div class="eyebrow"><span>Waiting on you</span><span>${pad(mine.length)}</span></div>
      ${mine.length ? `<ol class="rows">${mine.map((i, n) => itemRow(i, n + 1, true)).join('')}</ol>` : '<p class="empty">Nothing waiting on you.</p>'}</section>`;
    const out = `<section class="block"><div class="eyebrow"><span>Waiting on others</span><span>${pad(others.length)}</span></div>
      ${others.length ? `<ol class="rows">${others.map((i, n) => itemRow(i, n + 1, false)).join('')}</ol>` : '<p class="empty">Nothing outstanding.</p>'}</section>`;
    const done = closed.length ? `<section class="block"><div class="eyebrow"><span>Closed</span><span>Kept on the record</span></div><ol class="rows">${closed.map((i, n) => itemRow(i, n + 1, false)).join('')}</ol></section>` : '';
    return state.role === 'super' ? capture + queue + out + done : queue + capture + out + done;
  }

  function suggestOwner() {
    return { owner: 'lena', controller: 'lena', pm: 'wade', super: 'lena' }[state.role];
  }

  function bindAct() {
    const form = $('capture');
    form.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => {
      state.kind = b.dataset.kind;
      form.querySelectorAll('[data-kind]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
    $('photo').addEventListener('change', (e) => {
      [...e.target.files].slice(0, 3).forEach((file) => shrink(file).then((url) => {
        state.photos.push(url);
        $('thumbs').insertAdjacentHTML('beforeend', `<img src="${url}" alt="">`);
      }));
    });
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const mic = $('mic');
      mic.hidden = false;
      let rec = null;
      mic.addEventListener('click', () => {
        if (rec) { rec.stop(); return; }
        rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false;
        rec.onresult = (ev) => { const t = [...ev.results].map((r) => r[0].transcript).join(' '); const n = $('note'); n.value = (n.value ? n.value + ' ' : '') + t; };
        rec.onend = () => { rec = null; mic.setAttribute('aria-pressed', 'false'); };
        mic.setAttribute('aria-pressed', 'true'); rec.start();
      });
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const note = String(f.get('note') || '').trim();
      if (!note) { $('note').focus(); say('Write what you see first.'); return; }
      const id = 'FR-' + String(++store.seq).padStart(4, '0');
      const title = note.split(/(?<=[.!?])\s/)[0].slice(0, 90);
      const where = String(f.get('where') || '').trim();
      const item = {
        id, kind: state.kind === 'DECISION NEEDED' ? 'decision' : 'assign', captured: true, label: state.kind,
        project: f.get('project'), title: title + (where ? ' / ' + where : ''), note, where,
        due: f.get('due'), to: f.get('to'), from: me(), state: state.kind === 'DECISION NEEDED' ? 'waiting' : 'open',
        photos: state.photos.slice(), refs: [],
        trail: [[D.TODAY, person(me()).name, `Captured ${state.kind.toLowerCase()}${state.photos.length ? ' with ' + state.photos.length + ' photo' + (state.photos.length > 1 ? 's' : '') : ''}`], [D.TODAY, person(me()).name, 'Assigned to ' + person(f.get('to')).name]]
      };
      store.items.push(item);
      const toRole = PERSON_ROLE[item.to];
      const roles = [toRole, state.kind === 'SAFETY' ? 'owner' : null].filter(Boolean);
      if (roles.length) store.events.push({ roles, project: item.project, text: `${state.kind}: ${item.title}`, ref: id, time: 'NOW' });
      save();
      state.filed = item; state.photos = []; state.kind = 'ISSUE';
      go('act', { keepScroll: true });
      say(`Filed ${id}, assigned to ${person(item.to).name}.`);
    });
  }

  function shrink(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 720 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL('image/jpeg', 0.72));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  function decide(id, how) {
    const i = store.items.find((x) => x.id === id);
    if (!i) return;
    const who = person(me()).name;
    const words = { approve: ['approved', 'Approved'], return: ['returned', 'Returned for more information'], done: ['done', 'Marked done'] }[how];
    i.state = words[0];
    i.trail.push([D.TODAY, who, words[1]]);
    const roles = [PERSON_ROLE[i.from]].filter((r) => r && r !== state.role);
    if (id === 'D-PCO012' && how === 'approve') roles.push('controller', 'pm');
    if (roles.length) store.events.push({ roles: [...new Set(roles)], project: i.project, text: `${words[1]} by ${who === 'Owner' ? 'the owner' : who}: ${i.short || i.title}.`, ref: id, time: 'NOW' });
    save();
    closeSheet();
    render();
    say(`${i.title}: ${words[1]}.`);
  }

  function routeQuestion(to, q) {
    const id = 'FR-' + String(++store.seq).padStart(4, '0');
    store.items.push({ id, kind: 'assign', captured: true, label: 'QUESTION', project: null, title: 'Answer: ' + q, note: q, due: '2026-10-24', to, from: me(), state: 'open', refs: [], photos: [],
      trail: [[D.TODAY, person(me()).name, 'Asked FreemanAI; not on file'], [D.TODAY, person(me()).name, 'Routed to ' + person(to).name]] });
    const r = PERSON_ROLE[to];
    if (r) store.events.push({ roles: [r], project: null, text: 'Question: ' + q, ref: id, time: 'NOW' });
    save();
    state.filed = store.items[store.items.length - 1];
    go('act');
  }

  function actFromAnswer(aid) {
    const a = D.ANSWERS.find((x) => x.id === aid);
    if (!a?.act) return;
    if (a.act.kind === 'decision') {
      const item = store.items.find((i) => i.id === a.act.ref);
      if (item && item.to === me()) { go('act'); openRecord(item.id); return; }
      if (item) {
        item.trail.push([D.TODAY, person(me()).name, 'Advanced to the owner from Ask']);
        store.events.push({ roles: ['owner'], project: item.project, text: `${person(me()).name} is waiting on you: ${item.title}.`, ref: item.id, time: 'NOW' });
        save();
        state.filed = item; go('act'); return;
      }
    }
    const id = 'FR-' + String(++store.seq).padStart(4, '0');
    const item = { id, kind: 'assign', captured: true, label: 'FROM ASK', project: a.act.project, title: a.act.label, note: 'Raised from: ' + a.q, due: '2026-10-24', to: a.act.to, from: me(), state: 'open', refs: a.parts.flatMap(([, r]) => r).filter((r, i, all) => all.indexOf(r) === i), photos: [],
      trail: [[D.TODAY, person(me()).name, 'Raised from Ask: ' + a.q], [D.TODAY, person(me()).name, 'Assigned to ' + person(a.act.to).name]] };
    if (item.to === me()) item.to = 'lena';
    store.items.push(item);
    const r = PERSON_ROLE[item.to];
    if (r) store.events.push({ roles: [r], project: item.project, text: item.title, ref: id, time: 'NOW' });
    save();
    state.filed = item;
    go('act');
  }

  /* ---------- record sheet ---------- */
  function openRecord(id) {
    const src = D.SOURCES[id];
    const item = store.items.find((i) => i.id === id);
    let kicker = '', html = '';
    if (src) {
      if (!can(src.access)) {
        kicker = 'RESTRICTED';
        html = `<h2 id="sheet-title">This record is restricted.</h2><p class="body">${ACCESS_NAME[src.access]} records are open to: ${ACCESS_WHO[src.access].toLowerCase()}.</p>`;
      } else {
        const cited = D.ANSWERS.filter((a) => a.parts.some(([, r]) => r.includes(id)) && a.roles.includes(state.role));
        kicker = `${src.kind} / ${id}`;
        html = `<h2 id="sheet-title">${esc(src.title)}</h2><p class="body">${src.body}</p>
          <dl class="meta"><dt>Project</dt><dd>${src.project ? esc(src.project + ' ' + project(src.project).name) : 'Company'}</dd><dt>Author</dt><dd>${esc(src.author)}</dd><dt>Dated</dt><dd>${day(src.date)}</dd><dt>Open to</dt><dd>${ACCESS_WHO[src.access]} / ${ACCESS_NAME[src.access].toLowerCase()} record</dd></dl>
          ${cited.length ? `<section class="block" style="margin-top:30px"><div class="eyebrow"><span>Cited in</span></div><ol class="rows">${cited.map((a, n) => `<li><button type="button" class="row" data-ask="${esc(a.q)}"><span class="n">${pad(n + 1)}</span><span class="t">${esc(a.q)}</span><span class="r">↗</span></button></li>`).join('')}</ol></section>` : ''}`;
      }
    } else if (item) {
      const mine = item.to === me() && (item.state === 'waiting' || item.state === 'open');
      kicker = `${item.label || (item.kind === 'decision' ? 'DECISION' : 'ASSIGNMENT')} / ${item.id}`;
      html = `<h2 id="sheet-title">${esc(item.title)}</h2>
        ${item.photos?.length ? item.photos.map((p) => `<img class="photo" src="${p}" alt="Field photograph">`).join('') : ''}
        ${item.note ? `<p class="body">${esc(item.note)}</p>` : ''}
        <dl class="meta"><dt>Project</dt><dd>${item.project ? esc(item.project + ' ' + project(item.project).name) : 'Company'}</dd>
          ${item.amount && (can('finance') || item.kind === 'decision') && state.role !== 'super' ? `<dt>Amount</dt><dd>${money(item.amount)}</dd>` : ''}
          <dt>Owner</dt><dd>${esc(person(item.to).name)}</dd><dt>From</dt><dd>${esc(person(item.from).name)}</dd><dt>Needed by</dt><dd>${day(item.due)}</dd><dt>State</dt><dd class="state ${item.state}">${esc(item.state)}</dd></dl>
        ${mine ? `<div class="item-actions" style="margin:22px 0 6px">${item.kind === 'decision' ? `<button type="button" class="btn primary" data-do="approve" data-id="${item.id}">Approve ↗</button><button type="button" class="btn" data-do="return" data-id="${item.id}">Return</button>` : `<button type="button" class="btn primary" data-do="done" data-id="${item.id}">Done ↗</button>`}</div>` : ''}
        <section class="block" style="margin-top:30px"><div class="eyebrow"><span>Trail</span><span>Every change is kept</span></div><ol class="trail">${item.trail.map(([d, who, what]) => `<li><time>${day(d)}</time><span>${esc(what)}<small>${esc(who)}</small></span></li>`).join('')}</ol></section>
        ${item.refs.filter(visibleSource).length ? evidence(item.refs.filter(visibleSource)) : ''}`;
    } else if (project(id)) {
      const p = project(id);
      const recs = Object.entries(D.SOURCES).filter(([, s]) => s.project === id).map(([k]) => k).filter(visibleSource);
      kicker = `PROJECT / ${p.no}`;
      html = `<h2 id="sheet-title">${esc(p.name)}</h2><p class="body">${esc(p.note)}</p>
        <dl class="meta"><dt>Place</dt><dd>${esc(p.place)}</dd><dt>Work</dt><dd>${esc(p.type)}</dd><dt>Phase</dt><dd>${esc(p.phase)}</dd>
        <dt>Contract</dt><dd>${can('finance') ? money(p.contract) + ' / ' + Math.round(p.billed * 100) + '% billed' : '<span class="muted">Finance record</span>'}</dd>
        <dt>PM</dt><dd>${esc(person(p.pm).name)}</dd><dt>Super</dt><dd>${p.super ? esc(person(p.super).name) : '—'}</dd></dl>
        ${recs.length ? evidence(recs) : ''}`;
    } else return;
    $('sheet-kicker').textContent = kicker;
    $('sheet-body').innerHTML = html;
    $('sheet-body').scrollTop = 0;
    $('sheet').hidden = false;
    $('sheet-close').focus();
  }
  function closeSheet() { $('sheet').hidden = true; }

  /* ---------- roles menu ---------- */
  function openRoles(open) {
    const list = $('roles');
    list.hidden = !open;
    $('role').setAttribute('aria-expanded', String(open));
    if (!open) return;
    list.innerHTML = Object.entries(D.ROLES).map(([k, r], i) => `<li><button type="button" role="option" data-role="${k}" aria-selected="${k === state.role}"><span class="n">${pad(i + 1)}</span><span><span class="name">${r.label}</span><small>${esc(k === 'owner' ? 'All projects' : r.person + ' / ' + r.scope.split(' / ')[0])}</small></span></button></li>`).join('');
    list.querySelector('[aria-selected="true"]').focus();
  }

  /* ---------- events ---------- */
  document.querySelector('.verbs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-verb]');
    if (!b) return;
    if (b.dataset.verb === state.verb && state.verb === 'ask') state.answer = null;
    if (b.dataset.verb !== 'act') state.filed = null;
    go(b.dataset.verb);
    $('work').focus({ preventScroll: true });
  });
  $('role').addEventListener('click', () => openRoles($('roles').hidden));
  $('roles').addEventListener('click', (e) => {
    const b = e.target.closest('[data-role]');
    if (!b) return;
    state.role = b.dataset.role; state.answer = null; state.filed = null;
    openRoles(false); closeSheet(); render();
    say('Viewing as ' + R().label.toLowerCase());
  });
  document.addEventListener('click', (e) => {
    if (!$('roles').hidden && !e.target.closest('#roles,#role')) openRoles(false);
    const open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); openRecord(open.dataset.open); return; }
    const q = e.target.closest('[data-ask]');
    if (q) { closeSheet(); ask(q.dataset.ask); return; }
    const d = e.target.closest('[data-do]');
    if (d) { decide(d.dataset.id, d.dataset.do); return; }
    const a = e.target.closest('[data-act]');
    if (a) { actFromAnswer(a.dataset.act); return; }
    const rt = e.target.closest('[data-route]');
    if (rt) { routeQuestion(rt.dataset.route, rt.dataset.q); return; }
    const pr = e.target.closest('tr[data-project]');
    if (pr) openRecord(pr.dataset.project);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!$('sheet').hidden) closeSheet(); else openRoles(false); }
    if (e.key === 'Enter' && e.target.matches('tr[data-project]')) openRecord(e.target.dataset.project);
    if (e.target.matches('input,textarea,select') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '1' || e.key === '2' || e.key === '3') { state.filed = null; go(VERBS[+e.key - 1]); }
    if (e.key === '/') { e.preventDefault(); state.answer = null; go('ask'); $('q').focus(); }
  });
  $('sheet-close').addEventListener('click', closeSheet);
  $('reset').addEventListener('click', () => { store = seed(); save(); state.answer = null; state.filed = null; closeSheet(); render(); say('Sample record reset.'); });

  render();
})();
