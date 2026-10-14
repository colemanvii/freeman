/* Freeman GC / private proposal shell. Content: /data/alder.js */
(function () {
  'use strict';

  const P = window.PROPOSAL;
  const BASE = P.base;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- helpers ---------- */

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + n.toLocaleString('en-US');
  const url = (path) => (path ? `${BASE}/${path}` : BASE);
  const chapter = (slug) => P.chapters.find((c) => c.slug === slug);
  const idAnchor = (id) => id.toLowerCase();
  const word = (t) => `<span class="word">${t}</span>`;

  // Resolve a cross-reference ID to its stable address in this proposal.
  function ref(id) {
    const [kind, num] = id.split('-');
    const n = Number(num);
    switch (kind) {
      case 'S': return n <= 5 ? url(`03-people-scope#${idAnchor(id)}`) : url(`03-people-scope/boundaries#${idAnchor(id)}`);
      case 'B': return url(`05-budget#${idAnchor(id)}`);
      case 'A': return url(`05-budget/allowances/${P.budget.allowances.find((a) => a.id === id).slug}`);
      case 'M': return url(`04-schedule#${idAnchor(id)}`);
      case 'C': return url(`04-schedule#${idAnchor(id)}`);
      case 'D': return url(`06-decisions#${idAnchor(id)}`);
      default: return BASE;
    }
  }
  const xlink = ([id, label]) => `<a class="xref" href="${ref(id)}"><span class="xid">${esc(id)}</span> ${word(esc(label))}</a>`;
  const xlinks = (list) => `<span class="xrefs">${list.map(xlink).join('')}</span>`;

  const author = () => P.issue.author || P.issue.authorPlaceholder;
  const mailto = () => `mailto:${P.contact.email}?subject=${encodeURIComponent(P.contact.subject)}&body=${encodeURIComponent(P.contact.body)}`;

  function overlapText(row, rows) {
    const o = rows.filter((r) => r !== row && r.from <= row.to && r.to >= row.from);
    return o.length ? `runs alongside ${o.map((r) => r.label.toLowerCase()).join('; ')}` : 'no overlap';
  }

  /* ---------- chapter frame ---------- */

  function rail(ch, opts) {
    return `
      <header class="rail">
        <p class="micro chapter-id"><span class="num">${ch.n}</span> / ${esc(ch.label)}</p>
        <p class="question">${esc(opts.question)}</p>
        <h1 class="chapter-title" id="h-${ch.slug}" tabindex="-1">${esc(opts.heading)}</h1>
        ${opts.sub ? `<p class="sub">${esc(opts.sub)}</p>` : ''}
        ${opts.lead ? `<div class="lead">${[].concat(opts.lead).map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : ''}
        ${opts.qual ? `<div class="qual">${opts.qual}</div>` : ''}
      </header>`;
  }

  function pager(ch) {
    const i = P.chapters.indexOf(ch);
    const prev = P.chapters[i - 1];
    const next = P.chapters[i + 1];
    return `
      <nav class="pager" aria-label="Chapter sequence">
        ${prev ? `<a href="${url(prev.slug)}" rel="prev"><span class="arrow">←</span> ${word(`${prev.n} ${esc(prev.label)}`)}</a>` : `<a href="${BASE}"><span class="arrow">←</span> ${word('Opening')}</a>`}
        ${next ? `<a href="${url(next.slug)}" rel="next" class="next">${word(`${next.n} ${esc(next.label)}`)} <span class="arrow">→</span></a>` : `<a href="${BASE}" class="next">${word('Contents')} <span class="arrow">→</span></a>`}
      </nav>`;
  }

  function chapterView(slug, railHtml, contentHtml, extraClass) {
    const ch = chapter(slug);
    return {
      kind: 'chapter', chapter: ch, title: `${ch.n} ${ch.label}`,
      pager: pager(ch),
      html: `<article class="chapter ${extraClass || ''}" aria-labelledby="h-${ch.slug}">${railHtml}<div class="field">${contentHtml}</div></article>`
    };
  }

  function detailView(parentSlug, title, html) {
    const ch = chapter(parentSlug);
    return {
      kind: 'detail', chapter: ch, title: `${title} / ${ch.n} ${ch.label}`, parent: url(parentSlug),
      html: `
        <article class="detail">
          <a class="back" href="${url(parentSlug)}" data-back><span class="arrow">←</span> ${word(`Back to ${esc(ch.label)}`)}</a>
          ${html}
        </article>`
    };
  }

  /* ---------- 00 opening ---------- */

  function opening() {
    const o = P.opening;
    const entries = P.chapters.map((c) => `
      <li>
        <a href="${url(c.slug)}">
          <span class="num">${c.n}</span>
          <span class="entry-label">${word(esc(c.label))}</span>
          <span class="entry-summary">${esc(c.summary)}</span>
          <span class="entry-note${c.flag ? ' flag' : ''}">${esc(c.note)}</span>
        </a>
      </li>`).join('');

    return {
      kind: 'opening', title: 'Private proposal',
      html: `
        <div class="opening">
          <section class="op-intro" aria-labelledby="client-name">
            <p class="micro">${esc(P.client.preparedFor)}</p>
            <h1 id="client-name" class="client" tabindex="-1">${esc(P.client.name)}</h1>
            <p class="place">${esc(P.client.city)} / ${esc(P.client.type)}</p>
            <p class="thesis">${o.thesis.map(esc).join('<br>')}</p>
            <p class="approach">${esc(o.approach)}</p>
            <p class="condition"><span class="cap"><span class="mark" aria-hidden="true"></span>First condition</span>${esc(o.firstCondition)}</p>
            <div class="commercial">
              ${o.commercial.map((c) => `
                <a class="cline" href="${url(c.to)}">
                  <span class="cap">${esc(c.label)}</span>
                  <span class="val">${word(esc(c.value))}</span>
                </a>`).join('')}
            </div>
            <div class="op-foot">
              <p class="caveat">${esc(P.issue.status)}</p>
              <a class="primary" href="${url(P.chapters[0].slug)}">${word('Read the proposal')} <span class="arrow">→</span></a>
            </div>
          </section>
          <nav class="op-contents" aria-label="Contents">
            <p class="micro">Contents / six chapters, read in any order</p>
            <ol>${entries}</ol>
          </nav>
        </div>`
    };
  }

  /* ---------- 01 project & approach ---------- */

  function projectApproach() {
    const p = P.project;
    const facts = P.client.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    const content = `
      <div class="cols cols-5-3 cols-even">
        <div>
          <h2 class="cap">Three priorities</h2>
          <ol class="priorities">
            ${p.priorities.map((x, i) => `<li><span class="num">0${i + 1}</span><div><p class="p-title">${esc(x.title)}</p><p class="p-text">${esc(x.text)}</p></div></li>`).join('')}
          </ol>
          <h2 class="cap">The two largest unknowns</h2>
          <ul class="unknowns">
            ${p.unknowns.map((u) => `<li id="${idAnchor(u.id)}"><a href="${ref(u.id)}"><span class="xid">${u.id}</span> ${word(esc(u.title))}</a><p>${esc(u.text)}</p></li>`).join('')}
          </ul>
        </div>
        <aside class="side">
          <h2 class="cap">Basis of this interpretation</h2>
          <dl class="kv">${p.basisSummary.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          <a class="more" href="${url('01-project-approach/basis')}">${word('Basis of this proposal')} <span class="arrow">→</span></a>
          <h2 class="cap">How we would work</h2>
          <p class="statement">${esc(p.philosophy)}</p>
          <p class="status-line">${esc(p.philosophyStatus)}</p>
          <ul class="actions-list">${p.actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
        </aside>
      </div>`;
    return chapterView('01-project-approach', rail(chapter('01-project-approach'), {
      question: p.question, heading: p.heading, lead: p.lead,
      qual: `<dl class="kv tight">${facts}</dl><p class="fine">All project facts are illustrative inputs for this study.</p>`
    }), content);
  }

  function basisDetail() {
    const b = P.project.basis;
    return detailView('01-project-approach', b.title, `
      <h1 class="chapter-title" tabindex="-1">${esc(b.title)}</h1>
      <p class="notice"><span class="mark" aria-hidden="true"></span>${esc(b.note)}</p>
      <table class="register">
        <caption class="sr">Basis of this proposal, as of ${esc(P.issue.date)}</caption>
        <thead><tr><th scope="col">Category</th><th scope="col">Item</th><th scope="col">Dated</th><th scope="col">Status</th></tr></thead>
        <tbody>${b.rows.map((r) => `<tr><td data-label="Category">${esc(r.cat)}</td><td data-label="Item">${esc(r.item)}</td><td data-label="Dated" class="nowrap">${esc(r.date)}</td><td data-label="Status">${esc(r.status)}</td></tr>`).join('')}</tbody>
      </table>
      <p class="fine">Issue ${P.issue.number} / ${esc(P.issue.date)}. Items marked “Not received” are release dependencies for a priced proposal.</p>`);
  }

  /* ---------- 02 relevant work ---------- */

  function plate(t, n, kind, label, small) {
    return `
      <figure class="plate${small ? ' small' : ''}" id="plate-${t.slug}-${n}">
        <div class="frame" role="img" aria-label="${esc(label)}: evidence not yet received"><span>Not yet received</span></div>
        <figcaption>
          <span class="cap">Plate 2.${n} / ${esc(kind)}</span>
          <span>${esc(label)}</span>
          <span class="src">Source, date, photographer, and permission required</span>
        </figcaption>
      </figure>`;
  }

  function argument(t) {
    return `
          <section class="argument" id="topic-${t.slug}" aria-label="${esc(t.title)}" aria-live="polite">
            <dl class="five">
              ${t.parts.map((x, i) => `<div><dt><span class="num">${i + 1}</span>${esc(x.k)}${x.status === 'unverified' ? '<span class="pending">To verify</span>' : ''}</dt><dd>${esc(x.text)}</dd></div>`).join('')}
              <div class="relevance"><dt><span class="num">5</span>Relevance to Alder<span class="proposed">Proposed action</span></dt><dd>${esc(t.relevance)}${xlinks(t.links)}</dd></div>
            </dl>
          </section>`;
  }

  function relevantWork(topicSlug) {
    const r = P.reference;
    const t = r.topics.find((x) => x.slug === topicSlug) || r.topics[0];
    const tabs = r.topics.map((x) => `<li><a href="${url(`02-relevant-work/${x.slug}`)}" data-topic${x === t ? ' aria-current="true"' : ''}>${word(esc(x.title))}</a></li>`).join('');
    const content = `
      <div class="ref-head">
        <p class="micro">${esc(r.label)}</p>
        <h2 class="ref-title">${esc(r.title)}</h2>
      </div>
      <nav aria-label="Evidence topics"><ul class="topics">${tabs}</ul></nav>
      <div class="cols cols-3-5 evidence">
        <div class="plates">
          ${plate(t, 1, 'Finished work', t.plate.finished)}
          ${plate(t, 2, 'Field record', t.plate.field, true)}
        </div>
        <div class="account">
          ${argument(t)}
        </div>
      </div>`;
    return chapterView('02-relevant-work', rail(chapter('02-relevant-work'), {
      question: r.question, heading: 'Evidence before anecdote.', lead: r.lead,
      qual: `<p class="notice"><span class="mark" aria-hidden="true"></span>${esc(r.releaseStatus)}</p><a class="more" href="${url('02-relevant-work/verification')}">${word('Verification register')} <span class="arrow">→</span></a>`
    }), content, 'ch-evidence');
  }

  function verificationDetail() {
    const r = P.reference;
    return detailView('02-relevant-work', 'Verification register', `
      <h1 class="chapter-title" tabindex="-1">Verification register</h1>
      <p class="lead-detail">${esc(r.title)}. Every field must be resolved from a record before this reference is issued to a client. If only one contribution can be substantiated, one account is published. If none can, the reference is withdrawn.</p>
      <div class="cols cols-4-4">
        <div>
          <h2 class="cap">Before client issue</h2>
          <dl class="kv">${r.verify.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          <p class="fine">${esc(r.verifyNote)}</p>
        </div>
        <div>
          <h2 class="cap">Publicly confirmed context</h2>
          <ul class="sources">${r.sources.map(([t, u]) => `<li><a href="${u}" rel="noopener" target="_blank">${word(esc(t))} <span class="arrow">↗</span></a><span class="src">${esc(u.replace('https://', ''))}</span></li>`).join('')}</ul>
          <p class="fine">${esc(r.sourcesNote)}</p>
          <h2 class="cap">Editorial template, not approved copy</h2>
          <p class="statement">${esc(r.template)}</p>
        </div>
      </div>`);
  }

  /* ---------- 03 people & scope ---------- */

  function peopleScope() {
    const p = P.people;
    const content = `
      <div class="cols cols-5-3">
        <section aria-labelledby="team-h">
          <h2 class="cap" id="team-h">Proposed team</h2>
          <table class="records team">
            <caption class="sr">Proposed roles, responsibilities, and appointment status</caption>
            <thead><tr><th scope="col">Role</th><th scope="col">Responsibility</th><th scope="col">Status</th></tr></thead>
            <tbody>${p.team.map((t) => `<tr${t.primary ? ' class="primary-contact"' : ''}><th scope="row" data-label="Role">${esc(t.role)}${t.primary ? '<span class="tag">Primary contact</span>' : ''}</th><td data-label="Responsibility">${esc(t.resp)}</td><td data-label="Status" class="status">${esc(t.status)}</td></tr>`).join('')}</tbody>
          </table>
          <p class="fine">${esc(p.teamNote)}</p>
          <h2 class="cap">Delivery approach</h2>
          <ol class="stages">${p.stages.map(([a, b], i) => `<li><span class="num">${i + 1}</span><span><span class="ink">${esc(a)}</span> ${esc(b)}</span></li>`).join('')}</ol>
        </section>
        <aside class="side" aria-labelledby="scope-h">
          <h2 class="cap" id="scope-h">Proposed scope</h2>
          <ul class="scope">${p.scope.map((s) => `<li id="${idAnchor(s.id)}"><span class="xid">${s.id}</span>${esc(s.item)}</li>`).join('')}</ul>
          <p class="fine">${esc(p.scopeNote)}</p>
          <h2 class="cap">Where responsibilities meet</h2>
          <p class="worked"><span class="ink">Kitchen equipment.</span> Owner purchases; supplier installs and starts; Freeman coordinates access and priced utility connections. Exact limits confirmed before pricing.</p>
          <a class="more" href="${url('03-people-scope/boundaries')}">${word('Responsibility boundaries')} <span class="arrow">→</span></a>
        </aside>
      </div>`;
    return chapterView('03-people-scope', rail(chapter('03-people-scope'), {
      question: p.question, heading: p.heading, lead: p.lead,
      qual: `<p class="fine">No biographies or photographs are shown until each person’s participation and availability are confirmed.</p>`
    }), content);
  }

  function boundariesDetail() {
    const b = P.people.boundaries;
    return detailView('03-people-scope', b.title, `
      <h1 class="chapter-title" tabindex="-1">${esc(b.title)}</h1>
      <p class="notice"><span class="mark" aria-hidden="true"></span>${esc(b.note)}</p>
      <table class="register boundaries">
        <caption class="sr">Responsibility boundaries by scope item</caption>
        <thead><tr><th scope="col">Item</th><th scope="col">Included / Freeman</th><th scope="col">Owner or other party</th><th scope="col">Unresolved boundary</th></tr></thead>
        <tbody>${b.rows.map((r) => `
          <tr id="${idAnchor(r.id)}"${r.worked ? ' class="worked-row"' : ''}>
            <th scope="row" data-label="Item"><span class="xid">${r.id}</span>${esc(r.item)}${r.worked ? '<span class="tag">Worked example</span>' : ''}</th>
            <td data-label="Included / Freeman">${esc(r.freeman)}</td>
            <td data-label="Owner or other party">${esc(r.other)}</td>
            <td data-label="Unresolved boundary"><span>${esc(r.open)}${r.decision ? xlinks([[r.decision, 'Decision']]) : ''}${r.allowance ? xlinks([[r.allowance, 'Allowance']]) : ''}</span></td>
          </tr>`).join('')}</tbody>
      </table>`);
  }

  /* ---------- 04 schedule ---------- */

  function scheduleView(selectedId) {
    const s = P.schedule;
    const W = s.weeks;
    const sel = s.milestones.find((m) => m.id === selectedId) || s.milestones.find((m) => m.key);
    const ticks = [1, 4, 8, 12, 16, 20, 24];
    const rows = s.rows.map((r) => {
      const on = sel.rows.includes(r.id);
      return `
        <li class="g-row${on ? ' on' : ''}">
          <div class="g-label"><span class="g-name">${esc(r.label)}</span><span class="g-dep">${esc(r.dep)}</span><span class="g-ov">Weeks ${r.from}–${r.to} / ${esc(overlapText(r, s.rows))}</span></div>
          <div class="g-range"><span class="sr">Weeks </span>${r.from}–${r.to}${on ? `<span class="sr"> (related to selected gate)</span>` : ''}</div>
          <div class="g-track" aria-hidden="true"><span class="g-bar" style="--from:${r.from};--to:${r.to}"></span></div>
        </li>`;
    }).join('');
    const markers = s.milestones.map((m) => `<button type="button" class="g-mark${m === sel ? ' sel' : ''}" style="--w:${m.week}" data-ms="${m.id}" aria-pressed="${m === sel}" aria-controls="ms-panel" aria-label="Week ${m.week}: ${esc(m.label)}"><i aria-hidden="true"></i><b>W${m.week}</b></button>`).join('');
    const msList = s.milestones.map((m) => `<li><button type="button" data-ms="${m.id}" aria-pressed="${m === sel}" aria-controls="ms-panel"><span class="ms-w">W${m.week}</span> ${word(esc(m.label))}</button></li>`).join('');
    const relatedRows = s.rows.filter((r) => sel.rows.includes(r.id)).map((r) => esc(r.label)).join('; ');

    const content = `
      <figure class="gantt" style="--weeks:${W};--sel:${sel.week}" aria-labelledby="gantt-cap">
        <figcaption id="gantt-cap" class="cap">Gray: proposed activity / ◇ decision gate / orange: selected gate and dependent work</figcaption>
        <div class="g-axis" aria-hidden="true"><div></div><div class="g-range">Wks</div><div class="g-track">${ticks.map((t) => `<span style="--w:${t}">${t}</span>`).join('')}</div></div>
        <ol class="g-rows">${rows}</ol>
        <div class="g-gates" role="group" aria-label="Decision gates"><div class="g-gates-label cap">Decision gates</div><div class="g-range">Gates</div><div class="g-track">${markers}</div></div>
      </figure>
      <section class="ms" aria-labelledby="ms-h">
        <h2 class="sr" id="ms-h">Selected decision gate</h2>
        <ul class="ms-list-sm">${msList}</ul>
        <div id="ms-panel" class="ms-panel" aria-live="polite">
          <p class="ms-head"><span class="xid">${sel.id}</span>Week ${sel.week} / ${esc(sel.label)}<span class="ms-hint">A delay at this gate requires a revised schedule</span></p>
          <dl class="ms-grid">
            <div><dt>Prerequisite</dt><dd>${esc(sel.prereq)}</dd></div>
            <div><dt>Responsible</dt><dd>${esc(sel.role)}</dd></div>
            <div><dt>Workstreams</dt><dd>${relatedRows}</dd></div>
            <div><dt>Affects</dt><dd>${xlinks(sel.affects)}</dd></div>
          </dl>
        </div>
      </section>
      <section class="below-chart" aria-labelledby="cond-h">
        <h2 class="cap" id="cond-h">Active conditions / always open until resolved</h2>
        <ol class="conditions">
          ${s.conditions.map((c) => `
            <li id="${idAnchor(c.id)}">
              <p class="c-title"><span class="xid">${c.id}</span>${esc(c.title)}</p>
              <p class="c-meta"><span class="k">Accountable</span>${esc(c.role)}</p>
              <p class="c-meta"><span class="k">Next</span>${esc(c.next)}</p>
            </li>`).join('')}
        </ol>
      </div>`;
    return chapterView('04-schedule', rail(chapter('04-schedule'), {
      question: s.question, heading: s.heading, sub: s.sub, lead: s.lead,
      qual: `<p class="fine">${esc(s.note)}</p>`
    }), content, 'ch-schedule');
  }

  /* ---------- 05 budget ---------- */

  function budget() {
    const b = P.budget;
    const rows = b.lines.map((l) => {
      const cls = l.total ? 'total' : l.subtotal ? 'subtotal' : '';
      const main = `<tr id="${idAnchor(l.id)}" class="${cls}"><th scope="row"><span class="xid">${l.id}</span><span class="b-label">${esc(l.label)}</span><span class="b-status">${esc(l.status)}</span></th><td class="amt">${money(l.amount)}</td></tr>`;
      if (!l.allowances) return main;
      return main + b.allowances.map((a) => `<tr class="allowance" id="${idAnchor(a.id)}"><th scope="row"><a href="${url(`05-budget/allowances/${a.slug}`)}"><span class="xid">${a.id}</span>${word(esc(a.label))} <span class="arrow">→</span></a></th><td class="amt">${money(a.amount)}</td></tr>`).join('');
    }).join('');

    const content = `
      <div class="cols cols-5-3">
        <section aria-labelledby="reg-h">
          <div class="total-block">
            <p class="cap" id="reg-h">${esc(b.totalLabel)}</p>
            <p class="total">${b.total}</p>
            <p class="basis">${esc(b.totalBasis)}</p>
          </div>
          <table class="budget">
            <caption class="sr">Illustrative budget register; amounts in US dollars, rounded</caption>
            <thead><tr><th scope="col">Component / pricing status</th><th scope="col" class="amt">Illustrative</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="fine">${esc(b.allowancesNote)}</p>
          <p class="terms-line"><span class="cap">Issued estimate will state</span>${b.terms.map(([k]) => esc(k)).join(' / ')}<span class="nb"> — not established in this study</span></p>
        </section>
        <aside class="side">
          <h2 class="cap">Outside this total</h2>
          <ul class="excl">${b.exclusions.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
          <p class="fine">${esc(b.exclusionsNote)}</p>
          <h2 class="cap">Next pricing action</h2>
          <p class="next-action">${esc(b.next)} ${xlinks([['D-01', 'Equipment boundary'], ['D-02', 'Services investigation']])}</p>
        </aside>
      </div>`;
    return chapterView('05-budget', rail(chapter('05-budget'), {
      question: b.question, heading: b.heading, lead: b.lead,
      qual: `<h2 class="cap">Assumptions</h2><ul class="excl">${b.assumptions.map((e) => `<li>${esc(e)}</li>`).join('')}</ul><p class="notice rail-note"><span class="mark" aria-hidden="true"></span>${esc(b.disclaimer)}</p>`
    }), content, 'ch-budget');
  }

  function allowanceDetail(slug) {
    const b = P.budget;
    const a = b.allowances.find((x) => x.slug === slug);
    if (!a) return unavailable();
    const ms = P.schedule.milestones.find((m) => m.id === a.milestone);
    const others = b.allowances.filter((x) => x !== a).map((x) => `<a href="${url(`05-budget/allowances/${x.slug}`)}">${word(esc(x.label))}</a>`).join('<span class="sep"> / </span>');
    return detailView('05-budget', `${a.label} allowance`, `
      <p class="micro"><span class="xid">${a.id}</span>Allowance / within B-02 finish and fixture allowances</p>
      <h1 class="chapter-title" tabindex="-1">${esc(a.label)} allowance</h1>
      <p class="total">${money(a.amount)}</p>
      <p class="basis">Illustrative installed package / included once in the $1,500,000 planning total</p>
      <div class="cols cols-4-4">
        <div>
          <h2 class="cap">Inclusions</h2>
          <ul class="excl">${a.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <h2 class="cap">Basis</h2>
          <p class="body13">${esc(a.basis)}</p>
        </div>
        <div>
          <dl class="kv">
            <div><dt>Unresolved selection</dt><dd>${esc(a.unresolved)}</dd></div>
            <div><dt>Responsible</dt><dd>${esc(a.responsible)}</dd></div>
            <div><dt>Decision date</dt><dd>${esc(a.decision)}${xlinks([[ms.id, `W${ms.week} / ${ms.label}`]])}</dd></div>
            <div><dt>Potential effect</dt><dd>Not yet priced</dd></div>
          </dl>
          <p class="fine">No cost change is shown until a selection is priced against a quotation.</p>
          <p class="others"><span class="cap">Other allowances</span>${others}</p>
        </div>
      </div>`);
  }

  /* ---------- 06 decisions ---------- */

  function decisions() {
    const d = P.decisions;
    const content = `
      <table class="decisions">
        <caption class="sr">Decisions before preconstruction</caption>
        <thead><tr><th scope="col">Decision</th><th scope="col">Accountable</th><th scope="col">Needed by</th><th scope="col">State / consequence</th></tr></thead>
        <tbody>${d.rows.map((r) => `
          <tr id="${idAnchor(r.id)}">
            <th scope="row" data-label="Decision"><span class="xid">${r.id}</span><span class="d-title">${esc(r.title)}</span>${xlinks(r.links)}</th>
            <td data-label="Accountable">${esc(r.role)}</td>
            <td data-label="Needed by">${esc(r.by)}</td>
            <td data-label="State / consequence"><span><span class="state">${esc(r.state)}</span> / ${esc(r.consequence)}</span></td>
          </tr>`).join('')}</tbody>
      </table>
      <div class="cols cols-4-4 next-step">
        <div class="act">
          <a class="primary" href="${mailto()}">${word('Request a working session')} <span class="arrow">→</span></a>
          <p class="fine">${esc(d.actionNote)} To: ${esc(P.contact.email)}</p>
        </div>
        <div class="act">
          <a class="secondary" href="${url('issue')}">${word('Download this issue')} <span class="arrow">↓</span></a>
          <p class="fine">Printable record of Issue ${P.issue.number}, ${esc(P.issue.date)}, with every disclosure and caption.</p>
        </div>
      </div>`;
    return chapterView('06-decisions', rail(chapter('06-decisions'), {
      question: d.question, heading: d.heading, lead: d.lead,
      qual: `<p class="fine">${esc(d.after)}</p>`
    }), content, 'ch-decisions');
  }

  /* ---------- printable issue ---------- */

  function issue() {
    // Compose every chapter and every detail into one dated record.
    const part = (v, detail) => ({ title: v.title, html: v.html, detail });
    const topics = P.reference.topics;
    const parts = [
      part(projectApproach()), part(basisDetail(), true),
      part(relevantWork(topics[0].slug)),
      ...topics.slice(1).map((t) => ({ title: `Relevant Work / ${t.title}`, detail: true, html: `<div class="cols cols-3-5 evidence"><div class="plates">${plate(t, 1, 'Finished work', t.plate.finished)}${plate(t, 2, 'Field record', t.plate.field, true)}</div><div class="account"><h2 class="ref-title">${esc(t.title)}</h2>${argument(t)}</div></div>` })),
      part(verificationDetail(), true),
      part(peopleScope()), part(boundariesDetail(), true),
      part(scheduleView()),
      part(budget()), ...P.budget.allowances.map((a) => part(allowanceDetail(a.slug), true)),
      part(decisions())
    ];
    const strip = (h) => h.replace(/<nav class="pager"[\s\S]*?<\/nav>/g, '').replace(/<a class="back"[\s\S]*?<\/a>/g, '').replace(/ tabindex="-1"/g, '').replace(/ aria-live="polite"/g, '');
    return {
      kind: 'issue', title: `Issue ${P.issue.number} / printable record`,
      html: `
        <div class="issue-doc">
          <header class="issue-head">
            <p class="micro">Freeman GC / Private proposal / Issue ${P.issue.number} / ${esc(P.issue.date)}</p>
            <h1 class="client" tabindex="-1">${esc(P.client.name)}</h1>
            <p class="place">${esc(P.client.city)} / ${esc(P.client.type)}</p>
            <p class="thesis">${P.opening.thesis.map(esc).join('<br>')}</p>
            <p class="approach">${esc(P.opening.approach)}</p>
            <p class="condition"><span class="cap"><span class="mark" aria-hidden="true"></span>First condition</span>${esc(P.opening.firstCondition)}</p>
            <dl class="kv">${P.opening.commercial.map((c) => `<div><dt>${esc(c.label)}</dt><dd>${esc(c.value)}</dd></div>`).join('')}<div><dt>Status</dt><dd>${esc(P.issue.status)}</dd></div><div><dt>Prepared by</dt><dd>${esc(author())}</dd></div></dl>
            <div class="no-print issue-actions">
              <button type="button" class="primary" data-print>${word('Print or save as PDF')}</button>
              <a class="secondary" href="/downloads/alder-issue-01.pdf" download>${word('Download PDF')} <span class="arrow">↓</span></a>
              <a class="secondary" href="${url('06-decisions')}">${word('Back to Decisions')}</a>
            </div>
          </header>
          ${parts.map((v) => `<section class="issue-part${v.detail ? ' issue-detail' : ''}"><p class="micro running">${esc(v.title)}</p>${strip(v.html)}</section>`).join('')}
          <footer class="issue-foot"><p>Prepared by ${esc(author())} / Issue ${P.issue.number} / ${esc(P.issue.date)}</p><p>${esc(P.issue.status)}. All names, figures, and dates are illustrative inputs to a design study and are not a Freeman offer. ${esc(P.budget.disclaimer)}</p><p>Built for generations</p></footer>
        </div>`
    };
  }

  /* ---------- failure states ---------- */

  function unavailable() {
    return {
      kind: 'error', title: 'This issue is unavailable',
      html: `<section class="failure"><p class="micro">Freeman GC / Private proposal</p><h1 class="chapter-title" tabindex="-1">This issue is unavailable.</h1><p>The address may be incomplete, or this issue may have been withdrawn. Your proposal contact can send a current link.</p><a class="primary" href="mailto:${P.contact.email}?subject=${encodeURIComponent('Proposal link unavailable')}">${word('Contact Freeman')} <span class="arrow">→</span></a><p class="fine">Opens a draft in your email application.</p><a class="secondary" href="${BASE}">${word('Alder / Issue 01 contents')}</a></section>`
    };
  }

  function expired() {
    return {
      kind: 'error', title: 'Access expired',
      html: `<section class="failure"><p class="micro">Freeman GC / Private proposal</p><h1 class="chapter-title" tabindex="-1">Access expired.</h1><p>Proposal links expire to protect pricing and project information. Request a fresh link and it will be sent to your invited address.</p><a class="primary" href="mailto:${P.contact.email}?subject=${encodeURIComponent('Request fresh proposal access / Alder')}">${word('Request fresh access')} <span class="arrow">→</span></a><p class="fine">Demonstration of the failure state. Opens a draft in your email application; nothing is sent automatically.</p></section>`
    };
  }

  /* ---------- router ---------- */

  function resolve(pathname) {
    let path = pathname.replace(/\/+$/, '');
    if (path === '' || path === '/p' || path === '/index.html') path = BASE;
    if (path === BASE) return opening();
    if (path === '/p/expired' || path === `${BASE}/expired`) return expired();
    if (!path.startsWith(BASE + '/')) return unavailable();
    const segs = path.slice(BASE.length + 1).split('/');
    const [ch, a, b] = segs;
    switch (ch) {
      case '01-project-approach':
        if (!a) return projectApproach();
        if (a === 'basis' && !b) return basisDetail();
        break;
      case '02-relevant-work':
        if (!a) return relevantWork();
        if (a === 'verification' && !b) return verificationDetail();
        if (P.reference.topics.some((t) => t.slug === a) && !b) return relevantWork(a);
        break;
      case '03-people-scope':
        if (!a) return peopleScope();
        if (a === 'boundaries' && !b) return boundariesDetail();
        break;
      case '04-schedule':
        if (!a) return scheduleView((location.hash.match(/^#(m-\d+)$/i) || [])[1]?.toUpperCase());
        break;
      case '05-budget':
        if (!a) return budget();
        if (a === 'allowances' && b) return allowanceDetail(b);
        break;
      case '06-decisions':
        if (!a) return decisions();
        break;
      case 'issue':
        if (!a) return issue();
        break;
    }
    return unavailable();
  }

  const $main = document.getElementById('main');
  const $live = document.getElementById('announce');
  const $where = document.getElementById('where');
  const $short = document.getElementById('where-short');
  const $position = document.getElementById('position');
  const $footMid = document.getElementById('foot-mid');
  const prepared = `Prepared by ${esc(author())} / Issue ${P.issue.number} / ${esc(P.issue.date)}`;

  let current = null; // { path, view }
  const returns = {}; // parent path -> { scrollY, trigger }

  function setChrome(view) {
    const ch = view.chapter;
    document.body.dataset.kind = view.kind;
    document.title = `${P.client.name} / ${view.title} — Freeman GC`;
    if (ch) {
      $where.innerHTML = `<a href="${url(ch.slug)}"><span class="num">${ch.n}</span> ${word(esc(ch.label))}</a>`;
      $position.textContent = `${ch.n} / 06`;
    } else {
      $where.innerHTML = '';
      $position.textContent = view.kind === 'opening' ? '01—06' : '';
    }
    $short.textContent = ch ? `${P.client.short} / ${ch.n}` : P.client.short;
    $footMid.innerHTML = view.pager || `<span class="issue-meta">${prepared}</span>`;
  }

  function scrollToHash() {
    const id = location.hash.slice(1);
    if (!id) return false;
    const el = document.getElementById(id);
    if (!el) return false;
    document.querySelectorAll('.is-target').forEach((x) => x.classList.remove('is-target'));
    el.classList.add('is-target');
    el.scrollIntoView({ block: 'center' });
    return true;
  }

  function render(opts) {
    const o = opts || {};
    const path = location.pathname.replace(/\/+$/, '') || '/';
    const view = resolve(path);
    const sameChapter = current && current.view.chapter && view.chapter === current.view.chapter && view.kind === 'chapter' && current.view.kind === 'chapter';
    const prevScroll = window.scrollY;

    $main.innerHTML = view.html;
    setChrome(view);
    bind(view);

    if (!reduceMotion.matches && !sameChapter && !o.initial) {
      $main.classList.remove('fade');
      void $main.offsetWidth;
      $main.classList.add('fade');
    }

    const restore = returns[path];
    if (o.returning && restore) {
      window.scrollTo(0, restore.scrollY);
      const t = $main.querySelector(`a[href="${restore.trigger}"]`);
      if (t) t.focus({ preventScroll: true });
      delete returns[path];
    } else if (sameChapter && o.keepFocus) {
      window.scrollTo(0, prevScroll);
      const t = $main.querySelector(o.keepFocus);
      if (t) t.focus({ preventScroll: true });
    } else if (!scrollToHash()) {
      window.scrollTo(0, 0);
      if (!o.initial) {
        const h = $main.querySelector('h1');
        if (h) h.focus({ preventScroll: true });
      }
    }
    if (!o.initial || view.kind === 'error') $live.textContent = view.chapter ? `Chapter ${view.chapter.n}, ${view.chapter.label}${view.kind === 'detail' ? `, ${view.title.split(' / ')[0]}` : ''}` : view.title;
    current = { path, view };
  }

  function bind(view) {
    $main.querySelectorAll('[data-ms]').forEach((btn) => {
      btn.addEventListener('click', () => {
        history.replaceState(history.state, '', `${location.pathname}#${btn.dataset.ms.toLowerCase()}`);
        const scroll = window.scrollY;
        render({ keepFocus: `${btn.classList.contains('g-mark') ? '.g-mark' : '.ms-list-sm button'}[data-ms="${btn.dataset.ms}"]` });
        window.scrollTo(0, scroll);
      });
    });
    $main.querySelectorAll('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));
  }

  function navigate(href, opts) {
    const u = new URL(href, location.href);
    const o = opts || {};
    // Remember where a detail view was opened from, so return restores it.
    if (current && o.trigger && current.view.kind === 'chapter') {
      const target = resolve(u.pathname.replace(/\/+$/, ''));
      if (target.kind === 'detail') returns[current.path] = { scrollY: window.scrollY, trigger: o.trigger };
    }
    if (u.pathname === location.pathname && u.hash && u.hash !== location.hash && !o.topic) {
      history.pushState({}, '', u.pathname + u.hash);
      if (current && current.view.chapter && current.view.chapter.slug === '04-schedule' && /^#m-/.test(u.hash)) render({ keepFocus: null });
      else scrollToHash();
      return;
    }
    history.pushState({ returning: !!o.returning }, '', u.pathname + u.search + u.hash);
    render(o);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !u.pathname.startsWith('/p/')) return;
    e.preventDefault();
    const parentReturn = a.hasAttribute('data-back') && returns[u.pathname.replace(/\/+$/, '')];
    if (parentReturn && history.state && history.state.fromParent === u.pathname) { history.back(); return; }
    navigate(a.href, {
      trigger: a.getAttribute('href'),
      returning: !!parentReturn,
      topic: a.hasAttribute('data-topic'),
      keepFocus: a.hasAttribute('data-topic') ? `a[href="${a.getAttribute('href')}"]` : null
    });
  });

  window.addEventListener('popstate', () => {
    const path = location.pathname.replace(/\/+$/, '');
    render({ returning: !!returns[path] });
  });

  // Normalise the root to the proposal's address.
  if (location.pathname === '/' || location.pathname === '/index.html') history.replaceState({}, '', BASE + location.hash);
  render({ initial: true });
})();
