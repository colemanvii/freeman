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
  const arrow = (a) => `<span class="arrow" aria-hidden="true">${a || '→'}</span>`;

  // Resolve a cross-reference ID to its stable address in this proposal.
  // IDs stay in the data and the DOM; readers see only plain-language labels.
  function ref(id) {
    const [kind, num] = id.split('-');
    const n = Number(num);
    switch (kind) {
      case 'S': return n <= 5 ? url(`03-people-scope#${idAnchor(id)}`) : url(`03-people-scope/boundaries#${idAnchor(id)}`);
      case 'B': return url(`05-budget#${idAnchor(id)}`);
      case 'A': return url(`05-budget/allowances/${P.budget.allowances.find((a) => a.id === id).slug}`);
      case 'M': return url(`04-schedule#${idAnchor(id)}`);
      case 'W': return url(`04-schedule#${idAnchor(id)}`);
      case 'C': return url(`04-schedule#${idAnchor(id)}`);
      case 'D': return url(`06-decisions#${idAnchor(id)}`);
      default: return BASE;
    }
  }
  const xlink = ([id, label]) => `<a class="xref" href="${ref(id)}" data-ref="${esc(id)}">${word(esc(label))}</a>`;
  const xlinks = (list, lead) => `<p class="xrefs">${lead ? `<span class="xrefs-lead">${esc(lead)}</span>` : ''}${list.map(xlink).join('<span class="sep">, </span>')}</p>`;

  const author = () => P.issue.author || P.issue.authorPlaceholder;
  const mailto = () => `mailto:${P.contact.email}?subject=${encodeURIComponent(P.contact.subject)}&body=${encodeURIComponent(P.contact.body)}`;
  // "Not yet documented. Record needed: the design requirement…" → "The design requirement…"
  const recordNeeded = (t) => { const s = t.replace(/^Not yet (documented|received)\.\s*(Record needed:\s*)?/, ''); return s.charAt(0).toUpperCase() + s.slice(1); };

  function overlapText(row, rows) {
    const o = rows.filter((r) => r !== row && r.from <= row.to && r.to >= row.from);
    return o.length ? `runs alongside ${o.map((r) => r.label.toLowerCase()).join('; ')}` : 'no overlap';
  }

  /* ---------- chapter frame ---------- */

  function rail(ch, opts) {
    return `
      <header class="rail">
        <p class="chapter-id"><span class="num">${ch.n}</span>${esc(ch.label)}</p>
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
        ${prev ? `<a href="${url(prev.slug)}" rel="prev">${arrow('←')} ${word(`${prev.n} ${esc(prev.label)}`)}</a>` : `<a href="${BASE}">${arrow('←')} ${word('Opening')}</a>`}
        ${next ? `<a href="${url(next.slug)}" rel="next" class="next">${word(`${next.n} ${esc(next.label)}`)} ${arrow()}</a>` : `<a href="${BASE}" class="next">${word('Contents')} ${arrow()}</a>`}
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
          <a class="back" href="${url(parentSlug)}" data-back>${arrow('←')} ${word(`Back to ${esc(ch.label)}`)}</a>
          ${html}
        </article>`
    };
  }

  /* ---------- 00 opening ---------- */

  function opening() {
    const o = P.opening;
    const entries = P.chapters.map((c) => `
      <li class="${c.path ? 'on-path' : 'supporting'}">
        <a href="${url(c.slug)}">
          <span class="num">${c.n}</span>
          <span class="entry-label">${word(esc(c.label))}</span>
          <span class="entry-summary">${esc(c.summary)}</span>
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
            <p class="thesis">${o.thesis.map((t) => `<span>${esc(t)}</span>`).join(' ')}</p>
            <p class="approach">${esc(o.approach)}</p>
            <p class="condition">${esc(o.firstCondition)}</p>
            <div class="commercial">
              ${o.commercial.map((c) => `
                <a class="cline" href="${url(c.to)}">
                  <span class="cap">${esc(c.label)}</span>
                  <span class="val">${word(esc(c.value))}</span>
                </a>`).join('')}
            </div>
            <div class="op-foot">
              <p class="caveat">${esc(P.issue.status)}</p>
              <a class="primary" href="${url(P.chapters[0].slug)}">${word('Read the proposal')} ${arrow()}</a>
            </div>
          </section>
          <nav class="op-contents" aria-labelledby="contents-h">
            <p class="micro" id="contents-h">Contents</p>
            <p class="path-note">${esc(o.readingPath)}</p>
            <ol>${entries}</ol>
          </nav>
        </div>`
    };
  }

  /* ---------- 01 project & approach ---------- */

  function projectApproach() {
    const p = P.project;
    const facts = P.client.facts.map(([, v]) => esc(v)).join(' / ');
    const content = `
      <div class="cols cols-5-3">
        <div>
          <h2 class="cap">Three priorities</h2>
          <ol class="priorities">
            ${p.priorities.map((x, i) => `<li><span class="ord">${i + 1}</span><div><p class="p-title">${esc(x.title)}</p><p class="p-text">${esc(x.text)}</p></div></li>`).join('')}
          </ol>
          <h2 class="cap">What we would confirm first</h2>
          <ul class="unknowns">
            ${p.unknowns.map((u) => `<li id="${idAnchor(u.id)}"><a href="${ref(u.id)}">${word(esc(u.title))} ${arrow()}</a><p>${esc(u.text)}</p></li>`).join('')}
          </ul>
        </div>
        <aside class="side">
          <h2 class="cap">How we would work</h2>
          <p class="statement">${esc(p.philosophy)}</p>
          <ul class="actions-list">${p.actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
          <p class="fine">${esc(p.philosophyStatus)}</p>
          <h2 class="cap">Basis</h2>
          <p class="statement">${esc(p.basis.note)}</p>
          <a class="more" href="${url('01-project-approach/basis')}">${word('Basis of this proposal')} ${arrow()}</a>
        </aside>
      </div>`;
    return chapterView('01-project-approach', rail(chapter('01-project-approach'), {
      heading: p.heading, lead: p.lead,
      qual: `<p class="fine"><span class="ink">${facts}.</span> Illustrative inputs for this study.</p>`
    }), content);
  }

  function basisDetail() {
    const b = P.project.basis;
    return detailView('01-project-approach', b.title, `
      <h1 class="chapter-title" tabindex="-1">${esc(b.title)}</h1>
      <p class="notice">${esc(b.note)}</p>
      <table class="register">
        <caption class="sr">Basis of this proposal, as of ${esc(P.issue.date)}</caption>
        <thead><tr><th scope="col">Category</th><th scope="col">Item</th><th scope="col">Dated</th><th scope="col">Status</th></tr></thead>
        <tbody>${b.rows.map((r) => `<tr><td data-label="Category">${esc(r.cat)}</td><td data-label="Item">${esc(r.item)}</td><td data-label="Dated" class="nowrap">${esc(r.date)}</td><td data-label="Status">${esc(r.status.replace(/ \/ D-0\d$/, ''))}</td></tr>`).join('')}</tbody>
      </table>
      <p class="fine">Issue ${P.issue.number} / ${esc(P.issue.date)}. Items not yet received are release dependencies for a priced proposal.</p>`);
  }

  /* ---------- 02 relevant work ---------- */

  function plate(t, n, label) {
    return `
      <figure class="plate plate-${n}" id="plate-${t.slug}-${n}">
        <div class="frame" role="img" aria-label="${esc(label)}. Photograph not yet supplied."></div>
        <figcaption>
          <span>Plate ${n} / ${esc(label)}</span>
          <span class="src">Photograph, credit, and permission to be supplied</span>
        </figcaption>
      </figure>`;
  }

  function argument(t) {
    return `
      <section class="argument" id="topic-${t.slug}" aria-labelledby="topic-h-${t.slug}">
        <h3 class="account-title" id="topic-h-${t.slug}" tabindex="-1">${esc(t.title)}</h3>
        <p class="cap">For Alder</p>
        <p class="alder-action">${esc(t.relevance.replace(/^For Alder, (\w)/, (m, c) => c.toUpperCase()))}</p>
        ${xlinks(t.links, 'See ')}
        <p class="cap record-h">What the record will show</p>
        <dl class="record">
          ${t.parts.map((x) => `<div><dt>${esc(x.k)}</dt><dd>${esc(recordNeeded(x.text))}</dd></div>`).join('')}
        </dl>
      </section>`;
  }

  function relevantWork(topicSlug) {
    const r = P.reference;
    const t = r.topics.find((x) => x.slug === topicSlug) || r.topics[0];
    const others = r.topics.filter((x) => x !== t)
      .map((x) => `<a href="${url(`02-relevant-work/${x.slug}`)}" data-topic>${word(esc(x.title))}</a>`).join('<span class="sep"> / </span>');
    const content = `
      <div class="ref-head">
        <p class="micro">${esc(r.label)}</p>
        <h2 class="ref-title">${esc(r.title)}</h2>
      </div>
      <div class="cols cols-3-5 evidence">
        <div class="plates">
          ${plate(t, 1, t.plate.finished)}
          ${plate(t, 2, t.plate.field)}
        </div>
        <div class="account">
          ${argument(t)}
          <p class="fine claim-note">${esc(r.claimNote)}</p>
          <nav class="other-accounts" aria-label="Other accounts"><span>Other accounts, held until records support them: </span>${others}</nav>
        </div>
      </div>`;
    return chapterView('02-relevant-work', rail(chapter('02-relevant-work'), {
      heading: r.heading, lead: r.lead,
      qual: `<p class="fine"><span class="ink">Internal study.</span> ${esc(r.releaseStatus)}</p><a class="more" href="${url('02-relevant-work/verification')}">${word('Verification register')} ${arrow()}</a>`
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
          <ul class="sources">${r.sources.map(([t, u]) => `<li><a href="${u}" rel="noopener" target="_blank">${word(esc(t))} ${arrow('↗')}</a><span class="src">${esc(u.replace('https://', ''))}</span></li>`).join('')}</ul>
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
            <caption class="sr">Proposed roles and responsibilities</caption>
            <thead><tr><th scope="col">Role</th><th scope="col">Responsibility</th></tr></thead>
            <tbody>${p.team.map((t) => `<tr><th scope="row" data-label="Role">${esc(t.role)}${t.primary ? '<span class="tag">Your primary contact</span>' : ''}</th><td data-label="Responsibility">${esc(t.resp)}</td></tr>`).join('')}</tbody>
          </table>
          <p class="fine">${esc(p.teamNote)}</p>
          <h2 class="cap">How the work would proceed</h2>
          <ol class="stages">${p.stages.map(([a, b]) => `<li><span><span class="ink">${esc(a)}</span> ${esc(b)}</span></li>`).join('')}</ol>
        </section>
        <aside class="side" aria-labelledby="scope-h">
          <h2 class="cap" id="scope-h">Proposed scope</h2>
          <ul class="scope">${p.scope.map((s) => `<li id="${idAnchor(s.id)}">${esc(s.item)}</li>`).join('')}</ul>
          <p class="fine">${esc(p.scopeNote)}</p>
          <h2 class="cap">Where responsibilities meet</h2>
          <p class="statement"><span class="ink">Kitchen equipment.</span> The owner purchases; the supplier installs and starts up; Freeman coordinates access and priced utility connections.</p>
          <a class="more" href="${url('03-people-scope/boundaries')}">${word('Responsibility boundaries')} ${arrow()}</a>
        </aside>
      </div>`;
    return chapterView('03-people-scope', rail(chapter('03-people-scope'), {
      heading: p.heading, lead: p.lead
    }), content);
  }

  function boundariesDetail() {
    const b = P.people.boundaries;
    const decisionLabel = { 'D-01': 'Equipment boundary decision', 'D-02': 'Services investigation decision' };
    return detailView('03-people-scope', b.title, `
      <h1 class="chapter-title" tabindex="-1">${esc(b.title)}</h1>
      <p class="notice">${esc(b.note)}</p>
      <table class="register boundaries">
        <caption class="sr">Responsibility boundaries by scope item</caption>
        <thead><tr><th scope="col">Item</th><th scope="col">Included / Freeman</th><th scope="col">Owner or other party</th><th scope="col">Unresolved boundary</th></tr></thead>
        <tbody>${b.rows.map((r) => `
          <tr id="${idAnchor(r.id)}">
            <th scope="row" data-label="Item">${esc(r.item)}${r.worked ? '<span class="tag">Worked example</span>' : ''}</th>
            <td data-label="Included / Freeman">${esc(r.freeman)}</td>
            <td data-label="Owner or other party">${esc(r.other)}</td>
            <td data-label="Unresolved boundary"><span>${esc(r.open)}${r.decision ? xlinks([[r.decision, decisionLabel[r.decision]]]) : ''}${r.allowance ? xlinks([[r.allowance, 'Millwork allowance']]) : ''}</span></td>
          </tr>`).join('')}</tbody>
      </table>`);
  }

  /* ---------- 04 schedule ---------- */

  function scheduleView(selectedId) {
    const s = P.schedule;
    const W = s.weeks;
    const sel = s.milestones.find((m) => m.id === selectedId) || s.milestones.find((m) => m.key);
    const ticks = [4, 8, 12, 16, 20, 24];
    const rows = s.rows.map((r) => {
      const on = sel.rows.includes(r.id);
      return `
        <li class="g-row${on ? ' on' : ''}" id="${idAnchor(r.id)}">
          <div class="g-label"><span class="g-name">${esc(r.label)}</span><span class="g-dep">${esc(r.dep)}</span><span class="g-ov">Weeks ${r.from}–${r.to} / ${esc(overlapText(r, s.rows))}</span></div>
          <div class="g-range"><span class="sr">Weeks </span>${r.from}–${r.to}${on ? `<span class="sr"> (depends on the selected gate)</span>` : ''}</div>
          <div class="g-track" aria-hidden="true">${[4, 8, 12, 16, 20].map((w) => `<i class="g-line" style="--w:${w}"></i>`).join('')}<span class="g-bar" style="--from:${r.from};--to:${r.to}"></span></div>
        </li>`;
    }).join('');
    const markers = s.milestones.map((m) => `<button type="button" class="g-mark${m === sel ? ' sel' : ''}" style="--w:${m.week}" data-ms="${m.id}" aria-pressed="${m === sel}" aria-controls="ms-panel" aria-label="Week ${m.week}: ${esc(m.label)}"><i aria-hidden="true"></i><b>${m.week}</b></button>`).join('');
    const msList = s.milestones.map((m) => `<li><button type="button" data-ms="${m.id}" aria-pressed="${m === sel}" aria-controls="ms-panel"><span class="ms-w">Week ${m.week}</span> ${word(esc(m.label))}</button></li>`).join('');
    const relatedRows = s.rows.filter((r) => sel.rows.includes(r.id)).map((r) => esc(r.label)).join('; ');

    const content = `
      <figure class="gantt" style="--weeks:${W};--sel:${sel.week}" aria-labelledby="gantt-cap">
        <figcaption id="gantt-cap" class="sr">Six workstreams on a shared 24-week axis, with five decision gates. The selected gate and the work that depends on it are highlighted.</figcaption>
        <div class="g-axis" aria-hidden="true"><div class="cap">Workstream</div><div class="g-range cap">Weeks</div><div class="g-track">${ticks.map((t) => `<span style="--w:${t}">${t}</span>`).join('')}</div></div>
        <ol class="g-rows">${rows}</ol>
        <div class="g-gates" role="group" aria-label="Decision gates"><div class="cap">Decision gates</div><div></div><div class="g-track">${markers}</div></div>
      </figure>
      <section class="ms" aria-labelledby="ms-h">
        <h2 class="sr" id="ms-h">Selected decision gate</h2>
        <ul class="ms-list-sm">${msList}</ul>
        <div id="ms-panel" class="ms-panel" aria-live="polite">
          <p class="ms-head" id="${idAnchor(sel.id)}">Week ${sel.week} / ${esc(sel.label)}</p>
          <dl class="ms-grid">
            <div><dt>Prerequisite</dt><dd>${esc(sel.prereq)}</dd></div>
            <div><dt>Responsible</dt><dd>${esc(sel.role)}</dd></div>
            <div><dt>Depends on it</dt><dd>${relatedRows}</dd></div>
            <div><dt>Affects</dt><dd>${sel.affects.map(xlink).join('<br>')}</dd></div>
          </dl>
        </div>
      </section>
      <section class="below-chart" aria-labelledby="cond-h">
        <h2 class="cap" id="cond-h">Three conditions open today</h2>
        <ol class="conditions">
          ${s.conditions.map((c) => `
            <li id="${idAnchor(c.id)}">
              <p class="c-title">${esc(c.title)}</p>
              <p class="c-role">${esc(c.role)}</p>
              <p class="c-next">${esc(c.next)}</p>
            </li>`).join('')}
        </ol>
      </section>`;
    return chapterView('04-schedule', rail(chapter('04-schedule'), {
      heading: s.heading, sub: s.sub, lead: s.lead,
      qual: `<p class="fine">${esc(s.note)}</p>`
    }), content, 'ch-schedule');
  }

  /* ---------- 05 budget ---------- */

  function budget() {
    const b = P.budget;
    const rows = b.lines.map((l) => {
      const cls = l.total ? 'total' : l.subtotal ? 'subtotal' : '';
      const main = `<tr id="${idAnchor(l.id)}"${cls ? ` class="${cls}"` : ''}><th scope="row"><span class="b-label">${esc(l.label)}</span><span class="b-status">${esc(l.status)}</span></th><td class="amt">${money(l.amount)}</td></tr>`;
      if (!l.allowances) return main;
      return main + b.allowances.map((a, i) => `<tr class="allowance${i === b.allowances.length - 1 ? ' last' : ''}" id="${idAnchor(a.id)}"><th scope="row"><a href="${url(`05-budget/allowances/${a.slug}`)}">${word(esc(a.label))} ${arrow()}</a></th><td class="amt">${money(a.amount)}</td></tr>`).join('');
    }).join('');

    const content = `
      <div class="total-block">
        <p class="cap" id="reg-h">${esc(b.totalLabel)} / illustrative</p>
        <p class="total">${b.total}</p>
        <p class="basis">${esc(b.totalBasis)}</p>
      </div>
      <div class="cols cols-5-3">
        <section aria-labelledby="reg-h">
          <table class="budget">
            <caption class="sr">Illustrative budget register; amounts in US dollars, rounded</caption>
            <thead><tr><th scope="col">Component</th><th scope="col" class="amt">Amount</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="fine">${esc(b.allowancesNote)}</p>
        </section>
        <aside class="side">
          <h2 class="cap">Outside this total</h2>
          <ul class="plain">${b.exclusions.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
          <p class="fine">${esc(b.exclusionsNote.replace(' (S-07)', ''))}</p>
          <h2 class="cap">Next pricing step</h2>
          <p class="statement">${esc(b.next.replace(' once D-01 and D-02 are resolved', ' once the equipment boundary and existing services are resolved'))}</p>
          ${xlinks([['D-01', 'Equipment boundary'], ['D-02', 'Services investigation']], 'See ')}
        </aside>
      </div>`;
    return chapterView('05-budget', rail(chapter('05-budget'), {
      heading: b.heading, lead: b.lead,
      qual: `<h2 class="cap">Assumptions</h2><ul class="plain">${b.assumptions.map((e) => `<li>${esc(e)}</li>`).join('')}</ul><p class="fine">${esc(b.disclaimer)} The issued estimate will state its ${b.terms.map(([k]) => k.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ', and $1')}; none is established here.</p>`
    }), content, 'ch-budget');
  }

  function allowanceDetail(slug) {
    const b = P.budget;
    const a = b.allowances.find((x) => x.slug === slug);
    if (!a) return unavailable();
    const ms = P.schedule.milestones.find((m) => m.id === a.milestone);
    const others = b.allowances.filter((x) => x !== a).map((x) => `<a href="${url(`05-budget/allowances/${x.slug}`)}">${word(esc(x.label))}</a>`).join('<span class="sep"> / </span>');
    return detailView('05-budget', `${a.label} allowance`, `
      <p class="micro">Allowance / within finish and fixture allowances</p>
      <h1 class="chapter-title" tabindex="-1">${esc(a.label)} allowance</h1>
      <p class="total total-detail">${money(a.amount)}</p>
      <p class="basis">Illustrative installed package / included once in the $1,500,000 planning total</p>
      <div class="cols cols-4-4">
        <div>
          <h2 class="cap">Inclusions</h2>
          <ul class="plain">${a.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <h2 class="cap">Basis</h2>
          <p class="statement">${esc(a.basis)}</p>
        </div>
        <div>
          <dl class="kv">
            <div><dt>Unresolved selection</dt><dd>${esc(a.unresolved.replace(' (S-11)', ''))}</dd></div>
            <div><dt>Responsible</dt><dd>${esc(a.responsible)}</dd></div>
            <div><dt>Decision date</dt><dd>${esc(a.decision)}${xlinks([[ms.id, `Week ${ms.week}, ${ms.label.toLowerCase()}`]], 'See ')}</dd></div>
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
        <caption class="cap">Three open decisions</caption>
        <thead><tr><th scope="col">Decision</th><th scope="col">Who, and by when</th><th scope="col">Why it matters</th></tr></thead>
        <tbody>${d.rows.map((r, i) => `
          <tr id="${idAnchor(r.id)}">
            <th scope="row" data-label="Decision"><div class="d-cell"><span class="ord">${i + 1}</span><div><span class="d-title">${esc(r.title)}</span>${xlinks(r.links, 'See ')}</div></div></th>
            <td data-label="Who, and by when"><span>${esc(r.role)}<br><span class="ink">${esc(r.by)}</span></span></td>
            <td data-label="Why it matters"><span>${esc(r.consequence)}</span></td>
          </tr>`).join('')}</tbody>
      </table>
      <div class="next-step">
        <div class="act">
          <a class="primary" href="${mailto()}">${word('Request a working session')} ${arrow()}</a>
          <p class="fine">${esc(d.actionNote)} To ${esc(P.contact.email)}.</p>
        </div>
        <div class="act">
          <a class="secondary" href="${url('issue')}">${word('Download this issue')} ${arrow('↓')}</a>
          <p class="fine">Issue ${P.issue.number}, ${esc(P.issue.date)}, with every disclosure and caption.</p>
        </div>
      </div>`;
    return chapterView('06-decisions', rail(chapter('06-decisions'), {
      heading: d.heading, lead: d.lead,
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
      ...topics.slice(1).map((t) => ({ title: `Relevant Work / ${t.title}`, detail: true, html: `<div class="cols cols-3-5 evidence"><div class="plates">${plate(t, 1, t.plate.finished)}${plate(t, 2, t.plate.field)}</div><div class="account">${argument(t)}</div></div>` })),
      part(verificationDetail(), true),
      part(peopleScope()), part(boundariesDetail(), true),
      part(scheduleView()),
      part(budget()), ...P.budget.allowances.map((a) => part(allowanceDetail(a.slug), true)),
      part(decisions())
    ];
    const strip = (h) => h.replace(/<nav class="(pager|other-accounts)"[\s\S]*?<\/nav>/g, '').replace(/<a class="back"[\s\S]*?<\/a>/g, '').replace(/ tabindex="-1"/g, '').replace(/ aria-live="polite"/g, '').replace(/ id="[^"]*"/g, '');
    return {
      kind: 'issue', title: `Issue ${P.issue.number} / printable record`,
      html: `
        <div class="issue-doc">
          <header class="issue-head">
            <p class="micro">Freeman GC / Private proposal / Issue ${P.issue.number} / ${esc(P.issue.date)}</p>
            <h1 class="client" tabindex="-1">${esc(P.client.name)}</h1>
            <p class="place">${esc(P.client.city)} / ${esc(P.client.type)}</p>
            <p class="thesis">${P.opening.thesis.map((t) => `<span>${esc(t)}</span>`).join(' ')}</p>
            <p class="approach">${esc(P.opening.approach)}</p>
            <p class="condition">${esc(P.opening.firstCondition)}</p>
            <dl class="kv">${P.opening.commercial.map((c) => `<div><dt>${esc(c.label)}</dt><dd>${esc(c.value)}</dd></div>`).join('')}<div><dt>Status</dt><dd>${esc(P.issue.status)}</dd></div><div><dt>Prepared by</dt><dd>${esc(author())}</dd></div></dl>
            <div class="no-print issue-actions">
              <button type="button" class="primary" data-print>${word('Print or save as PDF')}</button>
              <a class="secondary" href="/downloads/alder-issue-01.pdf" download>${word('Download PDF')} ${arrow('↓')}</a>
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
      keepFocus: a.hasAttribute('data-topic') ? '.account-title' : null
    });
  });

  window.addEventListener('popstate', () => {
    const path = location.pathname.replace(/\/+$/, '');
    render({ returning: !!returns[path] });
  });

  // Normalise the root to the proposal's address.
  // Cloudflare Pages may expose the physical HTML filename after an asset rewrite.
  // Canonicalize that entry point before the router runs; retain chapter deep links.
  if (['/', '/index.html', '/proposal-alder', '/proposal-alder.html', '/p/alder/index.html'].includes(location.pathname)) {
    history.replaceState(history.state || {}, '', BASE + location.search + location.hash);
  }
  render({ initial: true });
})();
