/* Freeman case study — one slideshow for every project that has one (built/studies/<slug>.js).

   The journey: Projects map → project overview (the map's panel) → View full case study → this.
   It opens at the project's own address, /project-<slug>. Back to project returns to the overview.

   One off-white ground. One slide at a time; nothing scrolls. Previous and next arrows at the left and
   right edges, the arrow keys, a swipe. A counter at the foot. One short dissolve between slides.

   Slides: cover · plate (a photograph alone, or with a short passage) · drawing · colophon.
   (pair and statement remain for the two studies not yet moved to this system.)

   FACTS. A study file composes; it restates nothing the site already records:
     name, number, type          /records.js             (unless the study gives `project`)
     partners, roles, links      /project-credits.js     (unless the study gives `credits`)
     address, area, position     /record-assets/sites.js (unless the study gives `site`)
     photograph sizes            /record-assets/photos.js (generated)
   TEXT. `account` is the study's short text, one sentence per entry, each with its source noted in the
   study file. A slide refers to a sentence by number, or carries a literal string. */
(() => {
  "use strict";
  const slug = window.BUILT_SLUG || document.documentElement.dataset.study;
  const F = (window.FREEMAN_BUILT || {})[slug];
  const root = document.getElementById("built");
  const all = (window.RECORDS || {}).projects || [];
  const p = F && (F.project || all.find((x) => x.slug === (F.record || slug)));
  if (!F || !p || !root) { if (root) root.innerHTML = '<p class="fo-none">This case study is not available.</p>'; return; }

  const BASE = window.BUILT_BASE != null ? window.BUILT_BASE : "../"; // the site root, seen from this page
  const PHOTOS = window.RECORD_PHOTOS || {};
  const home = F.back || F.record || slug; // the project whose overview this study returns to
  const site = F.site || ((window.RECORD_SITES || {}).sites || {})[F.record || slug] || {};
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const url = (u) => BASE + String(u).replace(/^\//, "");
  const pad = (n) => String(n).padStart(2, "0");
  const overview = url("map?p=" + encodeURIComponent(home));

  // ---------- text ----------
  const account = F.account || ((p.summary || "").match(/[^.!?]+[.!?]+(?=\s|$)/g) || []).map((s) => s.trim());
  const say = (ref) => ref == null ? "" : typeof ref === "number" ? (account[ref - 1] || "") : String(ref);
  const many = (v) => [].concat(v == null ? [] : v).map(say).filter(Boolean);

  // ---------- photographs ----------
  const photo = (id) => { const g = F.plates[id]; return g && PHOTOS[g.src] ? { id, ...g, ...PHOTOS[g.src] } : null; };
  const srcset = (ph) => ph.set.map(([w, u]) => `${url(u)} ${w}w`).join(", ");
  const mid = (ph) => (ph.set.find(([w]) => w >= 960) || ph.set[ph.set.length - 1])[1];
  const img = (ph, sizes, eager, more) =>
    `<img src="${esc(url(mid(ph)))}" srcset="${esc(srcset(ph))}" sizes="${esc(sizes)}" width="${ph.w}" height="${ph.h}" alt="${esc(ph.alt)}" decoding="async" draggable="false"${eager ? ' fetchpriority="high"' : ""}${more || ""}>`;
  const caption = (ph) => `<figcaption class="fo-micro"><b>${ph.id}</b>${esc(ph.caption)}</figcaption>`;
  const figure = (ph, sizes, eager, cls) =>
    `<div class="fo-cell ${cls || ""}" style="--r:${(ph.w / ph.h).toFixed(4)}"><figure class="fo-fig"><div class="fo-frame">${img(ph, sizes, eager)}</div>${caption(ph)}</figure></div>`;

  // ---------- credits ----------
  const C = window.FREEMAN_CREDITS || { roles: [], partners: {}, projects: {} };
  const partnerOf = (x) => typeof x === "string" ? C.partners[x] : x;
  const credits = F.credits
    ? F.credits.map(([label, list]) => [label, list.map(partnerOf).filter(Boolean)])
    : C.roles.map(([role, label, plural]) => {
      const list = (C.projects[F.record || slug] || []).filter((c) => c.role === role && C.partners[c.partner]).map((c) => C.partners[c.partner]);
      return list.length ? [list.length > 1 && plural ? plural : label, list] : null;
    }).filter(Boolean);
  const partner = (x) => x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.name)}</a>` : esc(x.name);
  const venue = site.precision === "venue";
  const where = venue ? [site.address, site.area].filter(Boolean) : [site.area || p.location];
  const record = [
    ["Location", where.map(esc).join("<br>")],
    ["General contractor", "Freeman General Contracting"],
    ...credits.map(([k, v]) => [k, v.map(partner).join(", ")])
  ];
  const dl = (rows, cls) => `<dl class="${cls}">${rows.map(([k, v]) => `<div><dt class="fo-micro">${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>`;

  // ---------- slides ----------
  const leaves = F.leaves;
  const count = leaves.length;
  const titleOf = (L) => L.title || (L.type === "cover" ? p.name : (photo(L.plate) || {}).caption || "");
  const words = (L) => {
    const lead = say(L.lead);
    return (L.label ? `<p class="fo-micro fo-label">${esc(L.label)}</p>` : "") +
      (lead ? `<p class="fo-lead">${esc(lead)}</p>` : "") +
      many(L.passage).map((t) => `<p class="fo-passage">${esc(t)}</p>`).join("");
  };

  const render = {
    // The opening: the name, where it is, and one photograph.
    cover(L) {
      const ph = photo(L.plate);
      return `<header class="fo-head"><p class="fo-kicker fo-micro"><b>No. ${esc(p.id)}</b> / ${esc(p.type)}</p><h1 class="fo-name">${esc(p.name)}</h1><p class="fo-micro">${esc(where.join(", "))}</p></header>` +
        (ph ? figure(ph, "(max-width:760px) 100vw, 60vw", true) : "");
    },
    // A photograph, whole. Alone it stands in the middle of the slide; with a passage it stands at the left.
    plate(L) {
      const ph = photo(L.plate);
      if (!ph) return "";
      const w = words(L);
      return figure(ph, w ? "(max-width:760px) 100vw, 60vw" : "(max-width:760px) 100vw, 86vw") + (w ? `<div class="fo-words">${w}</div>` : "");
    },
    pair(L) {
      const [a, b] = L.plates.map(photo);
      if (!a || !b) return "";
      return figure(a, "(max-width:760px) 100vw, 45vw", false, "fo-a") + figure(b, "(max-width:760px) 100vw, 50vw", false, "fo-b") + `<div class="fo-words">${words(L)}</div>`;
    },
    statement(L) {
      const list = L.list ? `<div class="fo-listwrap">${L.listTitle ? `<p class="fo-micro">${esc(L.listTitle)}</p>` : ""}<ol class="fo-list">${L.list.map((t, i) => `<li><b class="fo-micro">${pad(i + 1)}</b>${esc(t)}</li>`).join("")}</ol></div>` : "";
      return `<p class="fo-figure">${esc(say(L.figure))}</p><div class="fo-words">${words(L)}</div>${list}` +
        (L.source ? `<p class="fo-foot fo-micro">${esc(L.source)}</p>` : "");
    },
    // A real sheet supplied by the design team, in a title block. No project has one yet.
    drawing(L) {
      const tb = [["Sheet", L.sheet], ["Title", L.title], ["Drawn by", L.by], ["Date", L.date], ["Scale", L.scale]].filter(([, v]) => v);
      return `<div class="fo-cell" style="--r:${(L.w / L.h).toFixed(4)}"><figure class="fo-fig fo-sheet"><div class="fo-frame">${L.svg || `<img src="${esc(url(L.src))}" alt="${esc(L.alt || L.title)}" width="${L.w}" height="${L.h}">`}</div></figure></div>` +
        `<div class="fo-words">${L.note ? `<p class="fo-passage">${esc(L.note)}</p>` : ""}${dl(tb.map(([k, v]) => [k, esc(v)]), "fo-particulars")}</div>`;
    },
    // The last slide: who built it and for whom, the particulars, and the way back.
    colophon(L) {
      const rows = [["Project", `No. ${esc(p.id)}, ${esc(p.type)}`], ...record.slice(0, 1),
        ...(L.particulars || []).map(([k, v]) => [k, esc(v)]), ...record.slice(1)];
      const works = L.works ? `<ol class="fo-works">${L.works.map((w) => `<li><b class="fo-micro">No. ${esc(w.no)}</b><span>${esc(w.name)}</span><i>${esc(w.note || "")}</i></li>`).join("")}</ol>` : "";
      return `<div class="fo-close"><p class="fo-lead">${esc(say(L.lead) || p.name)}</p>${many(L.passage).map((t) => `<p class="fo-passage">${esc(t)}</p>`).join("")}${works}` +
        `<a class="fo-return" href="${esc(overview)}" data-back><span aria-hidden="true">←</span> Back to project</a></div>` +
        dl(rows, "fo-particulars");
    }
  };

  root.innerHTML =
    `<div class="fo-stage" id="fo-stage">` +
    leaves.map((L, i) => `<section class="fo-leaf fo-${L.type}${L.type === "plate" ? (words(L) ? " has-words" : " is-alone") : ""}${L.layout ? " is-" + L.layout : ""}" data-i="${i}" aria-roledescription="slide" aria-label="${esc(`${i + 1} of ${count}: ${titleOf(L)}`)}">${(render[L.type] || (() => ""))(L)}</section>`).join("") +
    `</div>` +
    `<button type="button" class="fo-arrow fo-prev" data-prev aria-label="Previous slide"><span aria-hidden="true">←</span></button>` +
    `<button type="button" class="fo-arrow fo-next" data-next aria-label="Next slide"><span aria-hidden="true">→</span></button>` +
    `<p class="fo-count" aria-live="polite"><b></b> / ${pad(count)}</p>`;

  const stage = root.querySelector(".fo-stage");
  const els = [...stage.querySelectorAll(".fo-leaf")];
  const countEl = root.querySelector(".fo-count b");
  const btnPrev = root.querySelector("[data-prev]"), btnNext = root.querySelector("[data-next]");
  let at = -1;

  // ---------- moving between slides ----------
  const go = (i, quiet) => {
    i = Math.max(0, Math.min(count - 1, i));
    if (i === at) return;
    at = i;
    els.forEach((el, n) => { el.classList.toggle("is-on", n === i); el.inert = n !== i; });
    countEl.textContent = pad(i + 1);
    btnPrev.disabled = i === 0; btnNext.disabled = i === count - 1;
    // The address keeps the slide, so a reload or a shared link opens here. It replaces, never pushes:
    // browser Back always leaves the case study in one step.
    if (!quiet) { try { history.replaceState(history.state, "", i ? `#${i + 1}` : location.pathname + location.search); } catch (e) { /* a sandboxed frame may refuse */ } }
  };
  const turn = (d) => go(at + d);

  // ---------- back to the project ----------
  // Arrived from this project's overview: go back in history, so the map is exactly as it was left.
  // Arrived any other way (a link, a search result): open the overview afresh.
  const fromOverview = (() => {
    try {
      const r = new URL(document.referrer);
      return r.origin === location.origin && /^\/map(\.html)?$/.test(r.pathname) && r.searchParams.get("p") === home && history.length > 1;
    } catch (e) { return false; }
  })();
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[data-back]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (fromOverview) { e.preventDefault(); history.back(); }
  });
  document.querySelectorAll("a[data-back]").forEach((a) => { a.href = overview; });

  // ---------- input ----------
  // After a pointer click the arrow gives focus back, so no focus ring lingers over the slides.
  btnPrev.addEventListener("click", (e) => { turn(-1); if (e.detail) btnPrev.blur(); });
  btnNext.addEventListener("click", (e) => { turn(1); if (e.detail) btnNext.blur(); });
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === "ArrowRight" || k === "PageDown") { turn(1); e.preventDefault(); }
    else if (k === "ArrowLeft" || k === "PageUp") { turn(-1); e.preventDefault(); }
    else if (k === "Home") { go(0); e.preventDefault(); }
    else if (k === "End") { go(count - 1); e.preventDefault(); }
  });
  // A sideways swipe moves one slide.
  let sx = 0, sy = 0, st = 0;
  stage.addEventListener("touchstart", (e) => { if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); } else st = 0; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (!st) return;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st < 800 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) turn(dx < 0 ? 1 : -1);
    st = 0;
  }, { passive: true });
  window.addEventListener("hashchange", () => go((parseInt(location.hash.slice(1), 10) || 1) - 1, true));

  go((parseInt(location.hash.slice(1), 10) || 1) - 1, true);
  if (calm.matches) document.documentElement.dataset.calm = "";
  document.documentElement.dataset.ready = "";
})();
