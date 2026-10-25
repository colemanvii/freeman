/* Brand System Study 001 — compositions.
   Each composition is a fixed artboard (desktop 1440 x 900, mobile 390 x 844, card 1050 x 600 at
   300 px/in, jobsite sign 1440 x 720 for 96 x 48 in). The three directions render the same content
   through the same six applications so that differences are only in the system. */
(() => {
  "use strict";
  const F = window.FGC, P = F.project, N = F.notes, CO = F.company;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const up = (s) => esc(s).toUpperCase();
  const pad = (n, l = 2) => String(n).padStart(l, "0");

  /* Marks: the production signature bitmap and the Stamp eagle, at whole-pixel scales only. */
  const sig = (s, c = "") => `<svg class="mk sig ${c}" width="${160 * s}" height="${61 * s}" viewBox="0 0 160 61" role="img" aria-label="Freeman"><use href="#fgc-sig"/></svg>`;
  const eagle = (s, c = "") => `<svg class="mk eagle ${c}" width="${192 * s}" height="${60 * s}" viewBox="0 0 192 60" role="img" aria-label="Freeman eagle"><use href="#fgc-eagle"/></svg>`;
  const img = (src, alt, cls = "", style = "") => `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" decoding="async" draggable="false"${style ? ` style="${style}"` : ""}>`;
  const g = P.gallery;
  const NAV = ["Company", "Projects", "Map", "Field Notes", "Contact"];

  /* ================================================================ A — Refined */
  const A = {};
  const aNav = (cur) => `<nav class="a-nav"><span class="a-brand">FREEMAN</span>${NAV.map((n) => `<span${n === cur ? ' class="is-cur"' : ""}>${up(n)}</span>`).join("<i>/</i>")}</nav>`;
  const aHead = (cur) => `<header class="a-head">${aNav(cur)}<span>× CLOSE</span></header>`;
  const aRows = (rows) => `<div class="a-rows">${rows.map(([k, v]) => `<div><span>${up(k)}</span><span>${esc(v)}</span></div>`).join("")}</div>`;
  const aMHead = (crumb) => `<header class="a-mhead"><span><b>FREEMAN</b> / ${up(crumb)}</span><span>× CLOSE</span></header>`;

  A.home = {
    d: () => `<div class="a-access">ACCESS ↗</div>
      <div class="a-entry">${sig(2)}<nav>${NAV.map(up).join("<i>/</i>")}</nav></div>
      <div class="a-legal">${up(F.name)}<br>${up(F.place)}</div>
      <div class="a-line">${up(F.line)}</div>
      <div class="a-bfg">${up(F.bfg)}™</div>`,
    m: () => `<div class="a-access">ACCESS ↗</div>
      <div class="a-mentry">${sig(2)}<nav>${NAV.map((n) => `<span>${up(n)}</span>`).join("")}</nav></div>
      <div class="a-mfoot">${up(F.line)}<br><br>${up(F.bfg)}™</div>`,
  };
  A.project = {
    d: () => `${aHead("Projects")}
      <div class="a-vp a-split">
        <aside class="a-rec">
          <div class="a-id"><b>P—${P.id}</b> / ${up(P.type)}</div>
          <h1>${up(P.name)}</h1><div class="a-sub">${up(P.location)}</div>
          ${aRows([["Client", P.client + " ↗"], ["Photography", P.photography + " ↗"], ["Type", P.type]])}
          <div class="a-thumbs">${g.map((x, i) => `<figure${i === 0 ? ' class="is-cur"' : ""}>${img(x.src, "")}<span>${pad(i + 1)}</span></figure>`).join("")}</div>
        </aside>
        <figure class="a-plate">${img(g[0].src, P.name + " — photograph 1")}<figcaption><span>${up(P.name)}</span><span>P—${P.id} / ${up(P.type)}&emsp;${up(P.location)}</span></figcaption></figure>
      </div>
      <div class="a-ctl">←&emsp;01 / ${pad(g.length)}&emsp;→</div>`,
    m: () => `${aMHead("Projects")}
      <figure class="a-mplate">${img(g[0].src, P.name)}</figure>
      <div class="a-mbody"><div class="a-id"><b>P—${P.id}</b> / ${up(P.type)}</div><h1>${up(P.name)}</h1><div class="a-sub">${up(P.location)}</div>
      ${aRows([["Client", P.client + " ↗"], ["Photography", P.photography + " ↗"]])}</div>
      <div class="a-mctl"><span>←</span><span>01 / ${pad(g.length)}</span><span>→</span></div>`,
  };
  A.company = {
    d: () => `${aHead("Company")}
      <div class="a-vp a-co">
        <section class="a-co-text"><div class="a-id"><b>C—01</b> / COMPANY</div><h1>Built for generations<b>.</b></h1>
          <p class="a-lead">${esc(CO.lead)}</p>${CO.paras.map((p) => `<p>${esc(p)}</p>`).join("")}</section>
        <section class="a-co-index">
          <div class="a-id">SERVICES</div>
          <ol class="a-list">${CO.services.map(([n, d], i) => `<li><span class="a-no">${pad(i + 1)}</span><span>${up(n)}</span><span class="a-mute">${esc(d)}</span></li>`).join("")}</ol>
          <div class="a-id">PEOPLE</div>
          <ol class="a-list a-people">${CO.people.map(([n, r]) => `<li><span>${up(n)}</span><span class="a-mute">${up(r)}</span></li>`).join("")}</ol>
        </section>
      </div>`,
    m: () => `${aMHead("Company")}
      <div class="a-mco"><div class="a-id"><b>C—01</b> / COMPANY</div><h1>Built for generations<b>.</b></h1>
      <p class="a-lead">${esc(CO.lead)}</p>${CO.paras.slice(0, 2).map((p) => `<p>${esc(p)}</p>`).join("")}
      <ol class="a-list">${CO.services.map(([n], i) => `<li><span class="a-no">${pad(i + 1)}</span><span>${up(n)}</span></li>`).join("")}</ol></div>`,
  };
  A.note = {
    d: () => `${aHead("Field Notes")}
      <div class="a-vp a-split">
        <aside class="a-rec">
          <div class="a-id"><b>FN—${N[0].no}</b> / FIELD NOTE</div>
          <h1>${up(N[0].title)}</h1><p class="a-obs">${esc(N[0].obs)}</p>
          ${aRows([["Source", N[0].source], ["Project", "Unrecorded"], ["Date", "Unrecorded"]])}
          <ol class="a-list a-notes">${N.map((n, i) => `<li${i === 0 ? ' class="is-cur"' : ""}><span class="a-no">FN—${n.no}</span><span>${up(n.title)}</span></li>`).join("")}</ol>
        </aside>
        <figure class="a-evidence">${img(N[0].src, N[0].obs, "", `width:${N[0].w * 1.5}px;height:${N[0].h * 1.5}px`)}<figcaption><span>FN—${N[0].no}</span><span>${up(N[0].source)} — ${up(N[0].date)}</span></figcaption></figure>
      </div>`,
    m: () => `${aMHead("Field Notes")}
      <figure class="a-mev">${img(N[0].src, N[0].obs)}</figure>
      <div class="a-mbody"><div class="a-id"><b>FN—${N[0].no}</b> / FIELD NOTE</div><h1>${up(N[0].title)}</h1><p class="a-obs">${esc(N[0].obs)}</p>
      ${aRows([["Source", N[0].source], ["Date", "Unrecorded"]])}</div>
      <div class="a-mctl"><span>←</span><span>01 / ${pad(N.length)}</span><span>→</span></div>`,
  };
  A.card = {
    front: () => `<div class="a-cf">${sig(2)}</div><div class="a-cfl">${up(F.name)}</div><div class="a-cfr">${up(F.bfg)}™</div>`,
    back: () => `<i class="a-loc"></i><div class="a-cb-name">${up(F.card.name)}</div><div class="a-cb-role">${up(F.card.role)}</div>
      <div class="a-cb-info">${esc(F.email)}<br>${esc(F.phone)}<br>${up(F.place)}</div><div class="a-cb-mark">${eagle(1)}</div>`,
  };
  A.sign = () => `<div class="a-s-sig">${sig(4)}</div>
    <div class="a-s-proj"><div class="a-id">PROJECT</div><h1>${up(F.sign.name)}</h1><div>${up(F.sign.place)}</div><div class="a-s-status"><i class="a-loc"></i>${up(F.sign.type)} — ${up(F.sign.status)}</div></div>
    <div class="a-s-rail"><span>${up(F.name)}</span><span>${up(F.place)}</span><span>${esc(F.phone)}</span><span>${up(F.web)}</span><span>${up(F.bfg)}™</span></div>`;

  /* ================================================================ B — Editorial */
  const B = {};
  const bHead = (cur) => `<header class="b-head">${sig(1)}<nav>${NAV.map((n) => `<span${n === cur ? ' class="is-cur"' : ""}>${esc(n)}</span>`).join("")}</nav></header>`;
  const bMHead = () => `<header class="b-mhead">${sig(1)}<span>Index</span></header>`;
  const dot = '<b class="sig-dot">.</b>';

  B.home = {
    d: () => `<div class="b-entry">${sig(2)}<p>${esc(F.line)}</p><nav>${NAV.map((n) => `<span>${esc(n)}</span>`).join("")}</nav></div>
      <footer class="b-foot"><span>${esc(F.name)}</span><span>${esc(F.place)}</span><span>${esc(F.bfg)}${dot}</span></footer>`,
    m: () => `<div class="b-mentry">${sig(2)}<p>${esc(F.line)}</p><nav>${NAV.map((n) => `<span>${esc(n)}</span>`).join("")}</nav></div>
      <footer class="b-mfoot">${esc(F.bfg)}${dot}</footer>`,
  };
  B.project = {
    d: () => `${bHead("Projects")}
      <article class="b-spread">
        <div class="b-text"><div class="b-sc">No. ${P.id}</div><h1>${esc(P.name)}</h1><p class="b-place">${esc(P.location)}</p>
          <p class="b-body">${esc(P.summary)}</p>
          <dl class="b-colophon"><div><dt>Client</dt><dd>${esc(P.client)}</dd></div><div><dt>Photography</dt><dd>${esc(P.photography)}</dd></div><div><dt>Type</dt><dd>${esc(P.type)}</dd></div></dl></div>
        <figure class="b-plate">${img(g[0].src, P.name + " — plate 1")}<figcaption><span><i>Plate 1.</i>&nbsp;${esc(P.name)}, ${esc(P.location.split(",")[0])}. Photograph by ${esc(P.photography)}.</span><span class="b-plates">${g.map((x, i) => `<span${i === 0 ? ' class="is-cur"' : ""}>${i + 1}</span>`).join("")}</span></figcaption></figure>
      </article>`,
    m: () => `${bMHead()}
      <div class="b-mtext"><div class="b-sc">No. ${P.id}</div><h1>${esc(P.name)}</h1><p class="b-place">${esc(P.location)}</p></div>
      <figure class="b-mplate">${img(g[0].src, P.name)}<figcaption><i>Plate 1 of ${g.length}.</i>&nbsp;Photograph by ${esc(P.photography)}.</figcaption></figure>
      <p class="b-mbody">${esc(P.summary.split(". ").slice(0, 2).join(". "))}.</p>`,
  };
  B.company = {
    d: () => `${bHead("Company")}
      <article class="b-co">
        <div class="b-co-head"><div class="b-sc">The Company</div><h1>Built for<br>generations${dot}</h1><p class="b-place">${esc(CO.lead)}</p></div>
        <div class="b-co-cols"><div>${CO.paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
          <div><div class="b-sc">Services</div><p>${CO.services.map(([n, d]) => `<span class="b-run">${esc(n)}.</span> ${esc(d)}`).join(" ")}</p>
          <div class="b-sc">People</div><p class="b-people">${CO.people.map(([n, r]) => `${esc(n)}, <i>${esc(r)}</i>`).join("<br>")}</p></div></div>
      </article>`,
    m: () => `${bMHead()}
      <article class="b-mco"><div class="b-sc">The Company</div><h1>Built for generations${dot}</h1><p class="b-place">${esc(CO.lead)}</p>
      ${CO.paras.slice(0, 2).map((p) => `<p>${esc(p)}</p>`).join("")}</article>`,
  };
  B.note = {
    d: () => `${bHead("Field Notes")}
      <article class="b-note">
        <figure class="b-ev">${img(N[0].src, N[0].obs, "", `width:${N[0].w * 1.5}px;height:${N[0].h * 1.5}px`)}<figcaption><i>No. ${+N[0].no}.</i>&nbsp;${esc(N[0].source)}.</figcaption></figure>
        <div class="b-note-text"><div class="b-sc">Field Notes</div><h1>${esc(N[0].title)}</h1><p class="b-place">${esc(N[0].obs)}</p>
          <p class="b-small">${esc(N[0].source)}. ${esc(N[0].date)}. ${esc(N[0].project)}.</p>
          <figure class="b-ev2">${img(N[1].src, N[1].obs, "", `width:${N[1].w / 2}px;height:${N[1].h / 2}px`)}<figcaption><i>No. ${+N[1].no}.</i>&nbsp;${esc(N[1].title)}. ${esc(N[1].obs)}</figcaption></figure></div>
      </article>`,
    m: () => `${bMHead()}
      <figure class="b-mev">${img(N[0].src, N[0].obs)}</figure>
      <div class="b-mtext"><div class="b-sc">Field Notes — No. ${+N[0].no}</div><h1 class="b-h2">${esc(N[0].title)}</h1><p class="b-place">${esc(N[0].obs)}</p>
      <p class="b-small">${esc(N[0].source)}. ${esc(N[0].date)}.</p></div>`,
  };
  B.card = {
    front: () => `<div class="b-cf">${sig(2)}</div><div class="b-cfb">${esc(F.bfg)}${dot}</div>`,
    back: () => `<div class="b-cb-name">${esc(F.card.name)}</div><div class="b-cb-role">${esc(F.card.role)}</div>
      <div class="b-cb-info">${esc(F.email)}<br>${esc(F.phone)}<br>${esc(F.name)}, ${esc(F.place)}</div><div class="b-cb-mark">${eagle(1)}</div>`,
  };
  B.sign = () => `<div class="b-s-text"><div class="b-sc">${esc(F.sign.status)}</div><h1>${esc(F.sign.name)}</h1><p>${esc(F.sign.place)}</p></div>
    <div class="b-s-sig">${sig(2)}</div>
    <footer class="b-s-foot"><span>${esc(F.name)}</span><span>${esc(F.phone)}&emsp;${esc(F.web)}</span><span>${esc(F.bfg)}${dot}</span></footer>`;

  /* ================================================================ C — Document */
  const C = {};
  const SHEETS = [["00", "Entry"], ["C-01", "Company"], ["P-01", "Projects"], ["M-01", "Map"], ["FN-01", "Field Notes"], ["X-01", "Contact"]];
  const ticks = (cols, rows) => `<div class="c-ticks c-top">${Array.from({ length: cols }, (_, i) => `<span>${i + 1}</span>`).join("")}</div>
    <div class="c-ticks c-left">${Array.from({ length: rows }, (_, i) => `<span>${"ABCDEFGH"[i]}</span>`).join("")}</div>`;
  const tblock = ({ sheet, title, mark = true }) => `<aside class="c-tb">
      ${mark ? `<div class="c-cell c-seal">${eagle(1)}</div>` : ""}
      <div class="c-cell"><b>${up(F.name)}</b><br>${up(F.place)}</div>
      <div class="c-cell">${up(F.bfg)}™</div>
      <div class="c-cell c-index"><label>INDEX</label>${SHEETS.map(([c, n]) => `<div${c === sheet ? ' class="is-cur"' : ""}><span>${c}</span><span>${up(n)}</span></div>`).join("")}</div>
      <div class="c-fill"></div>
      <div class="c-cell"><label>TITLE</label><div class="c-val">${up(title)}</div></div>
      <div class="c-cell c-sheetno"><label>SHEET</label><div>${sheet}</div></div>
    </aside>`;
  const sheet = (inner, tb) => `<div class="c-sheet">${ticks(6, 4)}<div class="c-draw">${inner}</div>${tblock(tb)}</div>`;
  const crop = (inner, cls = "") => `<figure class="c-crop ${cls}">${inner}<i></i><i></i><i></i><i></i></figure>`;
  const mstrip = (code, title, mark = true) => `<footer class="c-mstrip">${mark ? `<div class="c-cell c-seal">${eagle(1)}</div>` : `<div class="c-cell">${up(F.bfg)}™</div>`}<div class="c-cell c-sheetno"><label>SHEET / ${up(title)}</label><div>${code}</div></div></footer>`;
  const msheet = (inner, code, title, mark) => `<div class="c-msheet"><header class="c-mhead"><span>${up(F.name)}</span><span>INDEX ↗</span></header><div class="c-mdraw">${inner}</div>${mstrip(code, title, mark)}</div>`;
  /* Leader on FN-01: the ladder stands at about 40% across, 81% down the original frame. */
  const redline = `<svg class="c-redline" viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="40" cy="80.5" rx="3.6" ry="6.5" vector-effect="non-scaling-stroke"/><path d="M40 74 L40 -5 L46 -5" vector-effect="non-scaling-stroke"/></svg><span class="c-rl-label">01 — ${up(N[0].obs)}</span>`;
  const redlineM = `<svg class="c-redline" viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="40" cy="80.5" rx="4.5" ry="8" vector-effect="non-scaling-stroke"/></svg><span class="c-rl-tag">01</span>`;

  C.home = {
    d: () => sheet(`<div class="c-entry">${sig(3)}<p>${up(F.line)}</p></div>`, { sheet: "00", title: "Entry", mark: false }),
    m: () => `<div class="c-msheet"><header class="c-mhead"><span>SHEET 00 / ENTRY</span><span>ACCESS ↗</span></header>
      <div class="c-mentry">${sig(2)}<p>${up(F.line)}</p>
      <div class="c-index c-mindex">${SHEETS.slice(1).map(([c, n]) => `<div><span>${c}</span><span>${up(n)}</span></div>`).join("")}</div></div>
      <footer class="c-mstrip"><div class="c-cell">${up(F.name)}<br>${up(F.place)}</div><div class="c-cell">${up(F.bfg)}™</div></footer></div>`,
  };
  C.project = {
    d: () => sheet(`<div class="c-label c-v1">VIEW 01 / ${pad(g.length)}</div>
      ${crop(img(g[0].src, P.name + " — view 1"), "c-main")}
      <div class="c-views">${g.slice(1).map((x, i) => `<figure>${img(x.src, "")}<span>${pad(i + 2)}</span></figure>`).join("")}</div>
      <table class="c-sched"><thead><tr><th>CLIENT</th><th>PHOTOGRAPHY</th><th>LOCATION</th><th>TYPE</th></tr></thead><tbody><tr><td>${up(P.client)}</td><td>${up(P.photography)}</td><td>${up(P.location)}</td><td>${up(P.type)}</td></tr></tbody></table>
      <div class="c-note"><label>GENERAL NOTE</label><p>${esc(P.summary)}</p></div>`, { sheet: "P-01", title: P.name }),
    m: () => msheet(`<div class="c-label">VIEW 01 / ${pad(g.length)}</div>${crop(img(g[0].src, P.name), "c-mmain")}
      <h1 class="c-mh">${up(P.name)}</h1>
      <div class="c-mrows">${[["Client", P.client], ["Photography", P.photography], ["Location", P.location], ["Type", P.type]].map(([k, v]) => `<div><label>${up(k)}</label><span>${up(v)}</span></div>`).join("")}</div>`, "P-01", P.name),
  };
  C.company = {
    d: () => sheet(`<h1 class="c-big">BUILT FOR<br>GENERATIONS.</h1>
      <div class="c-co"><div class="c-notes"><label>GENERAL NOTES</label><ol>${[CO.lead, ...CO.paras].map((p) => `<li>${esc(p)}</li>`).join("")}</ol></div>
        <div><table class="c-sched c-tight"><thead><tr><th>SCOPE</th><th></th><th></th></tr></thead><tbody>${CO.services.map(([n, d], i) => `<tr><td class="c-code">S-0${i + 1}</td><td>${up(n)}</td><td class="c-mute">${esc(d)}</td></tr>`).join("")}</tbody></table>
        <table class="c-sched c-tight"><thead><tr><th>PERSONNEL</th><th></th><th></th></tr></thead><tbody>${CO.people.map(([n, r], i) => `<tr><td class="c-code">${pad(i + 1)}</td><td>${up(n)}</td><td class="c-mute">${up(r)}</td></tr>`).join("")}</tbody></table></div></div>`, { sheet: "C-01", title: "Company" }),
    m: () => msheet(`<h1 class="c-big c-mbig">BUILT FOR<br>GENERATIONS.</h1><div class="c-notes"><label>GENERAL NOTES</label><ol>${[CO.lead, CO.paras[0]].map((p) => `<li>${esc(p)}</li>`).join("")}</ol></div>
      <div class="c-mrows">${CO.services.map(([n], i) => `<div><label>S-0${i + 1}</label><span>${up(n)}</span></div>`).join("")}</div>`, "C-01", "Company"),
  };
  C.note = {
    d: () => sheet(`<div class="c-label c-v1">FN-01 / ${up(N[0].title)}</div>
      ${crop(`${img(N[0].src, N[0].obs, "c-mono")}${redline}`, "c-ev")}
      <div class="c-evs">${N.slice(1).map((n) => `<figure>${img(n.src, n.obs, "c-mono", `width:${n.w / 2}px;height:${n.h / 2}px`)}<span>FN-${n.no} — ${up(n.title)}</span></figure>`).join("")}</div>
      <table class="c-sched c-evsched"><thead><tr><th>NOTE</th><th>OBSERVATION</th><th>SOURCE</th><th>DATE</th></tr></thead><tbody>${N.map((n) => `<tr><td class="c-code">FN-${n.no}</td><td>${up(n.obs)}</td><td>${up(n.source)}</td><td>${n.date.startsWith("Capture") ? "UNRECORDED" : up(n.date)}</td></tr>`).join("")}</tbody></table>`, { sheet: "FN-01", title: N[0].title }),
    m: () => msheet(`<div class="c-label">FN-01 / ${up(N[0].title)}</div>${crop(`${img(N[0].src, N[0].obs, "c-mono")}${redlineM}`, "c-mev")}
      <p class="c-mobs"><b>01 —</b> ${up(N[0].obs)}</p>
      <div class="c-mrows"><div><label>SOURCE</label><span>${up(N[0].source)}</span></div><div><label>DATE</label><span>UNRECORDED</span></div><div><label>PROJECT</label><span>UNRECORDED</span></div></div>`, "FN-01", N[0].title),
  };
  C.card = {
    front: () => `<div class="c-cframe"><div class="c-cseal">${eagle(2)}</div><div class="c-crow"><span>${up(F.name)}</span><span>${up(F.bfg)}™</span></div></div>`,
    back: () => `<div class="c-cframe c-cback"><div class="c-cname">${up(F.card.name)}</div>
      <div class="c-crows">${[["Role", F.card.role.toUpperCase()], ["T", F.phone], ["E", F.email.toUpperCase()], ["W", F.web.toUpperCase()]].map(([k, v]) => `<div><label>${up(k)}</label><span>${esc(v)}</span></div>`).join("")}</div></div>`,
  };
  C.sign = () => `<div class="c-sheet c-ssheet">${ticks(8, 4)}
    <div class="c-draw"><label class="c-label">PROJECT</label><h1>${up(F.sign.name)}</h1>
      <div class="c-srow"><div><label>LOCATION</label><span>${up(F.sign.place)}</span></div><div><label>TYPE</label><span>${up(F.sign.type)}</span></div><div><label>STATUS</label><span>${up(F.sign.status)}</span></div></div></div>
    <aside class="c-tb"><div class="c-sblock">${eagle(2)}</div>
      <div class="c-cell"><label>GENERAL CONTRACTOR</label><b>${up(F.name)}</b><br>${up(F.place)}</div>
      <div class="c-cell">T ${esc(F.phone)}<br>${up(F.web)}</div><div class="c-fill"></div><div class="c-cell">${up(F.bfg)}™</div></aside></div>`;

  /* ================================================================ registry */
  const DIRS = [
    { key: "A", name: "Refined", note: "The current identity, held to stricter rules.", impl: A },
    { key: "B", name: "Editorial", note: "One serif, restrained; the page as a printed monograph.", impl: B },
    { key: "C", name: "Document", note: "Construction drawings, field evidence and the Stamp.", impl: C },
  ];
  const APPS = [
    { no: "01", key: "home", name: "Homepage", kind: "web" },
    { no: "02", key: "project", name: "Project", kind: "web" },
    { no: "03", key: "company", name: "Company", kind: "web" },
    { no: "04", key: "note", name: "Field note", kind: "web" },
    { no: "05", key: "card", name: "Business card", kind: "card" },
    { no: "06", key: "sign", name: "Jobsite sign", kind: "sign" },
  ];
  const SIZE = { d: [1440, 900], m: [390, 844], front: [1050, 600], back: [1050, 600], sign: [1440, 720] };
  const FORMAT = { d: "Desktop", m: "Mobile", front: "Card front", back: "Card back", sign: "96 × 48 in" };
  const formats = (app) => (app.kind === "web" ? ["d", "m"] : app.kind === "card" ? ["front", "back"] : ["sign"]);

  function render(dirKey, appKey, fmt) {
    const d = DIRS.find((x) => x.key === dirKey), a = APPS.find((x) => x.key === appKey);
    const impl = d.impl[appKey], html = fmt === "sign" ? impl() : impl[fmt]();
    const [w, h] = SIZE[fmt];
    return { w, h, id: `${dirKey}-${a.no}-${fmt === "d" ? "D" : fmt === "m" ? "M" : fmt === "front" ? "F" : fmt === "back" ? "R" : "S"}`,
      html: `<div class="art d${dirKey} f-${fmt} app-${appKey}" style="width:${w}px;height:${h}px">${html}</div>` };
  }
  window.FGCStudy = { DIRS, APPS, SIZE, FORMAT, formats, render, sig, eagle };
})();
