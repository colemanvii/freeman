/* The Built Record — one renderer for every Freeman case study (built/studies/<slug>.js).

   A study is read one leaf at a time, like the spreads of a printed monograph. Nothing scrolls.
   The reader turns leaves with the arrow keys, the rail, a swipe or the wheel. Any photograph can be
   seen whole. There is no other interface.

   Grown from the five-leaf Freeman Folio (v5/folio-2). Kept: the leaf, the turning, the light and dark
   grounds, the plate of matched crops, the record with every photograph whole. Removed: the index of
   miniatures and the keyed "read the photograph" control, which were interface, not editing.
   Added: a study may stand for a place with several works (Barnsley); pair, statement and works.

   Leaf types: cover · plate (left | right | band) · pair · typology · statement · drawing · colophon.

   FACTS. A study file composes; it restates nothing that the site already records:
     name, number, type          /records.js             (unless the study gives `project`)
     partners, roles, links      /project-credits.js     (unless the study gives `credits`)
     address, area, position     /record-assets/sites.js (unless the study gives `site`)
     photograph sizes            /record-assets/photos.js (generated)
   TEXT. `account` is the study's own short text, one sentence per entry, each with its source noted in
   the study file. A leaf refers to a sentence by number, or carries a literal string. */
(() => {
  "use strict";
  const slug = window.BUILT_SLUG || document.documentElement.dataset.study;
  const F = (window.FREEMAN_BUILT || {})[slug];
  const root = document.getElementById("built");
  const all = (window.RECORDS || {}).projects || [];
  const p = F && (F.project || all.find((x) => x.slug === (F.record || slug)));
  if (!F || !p || !root) { if (root) root.innerHTML = '<p class="fo-none">This study is not available.</p>'; return; }

  const BASE = window.BUILT_BASE != null ? window.BUILT_BASE : "../"; // the site root, seen from this page
  const PHOTOS = window.RECORD_PHOTOS || {};
  const site = F.site || ((window.RECORD_SITES || {}).sites || {})[F.record || slug] || {};
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const url = (u) => BASE + String(u).replace(/^\//, "");
  const pad = (n) => String(n).padStart(2, "0");
  const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  const word = (n) => WORDS[n] || String(n);

  // ---------- text ----------
  const account = F.account || ((p.summary || "").match(/[^.!?]+[.!?]+(?=\s|$)/g) || []).map((s) => s.trim());
  const say = (ref) => ref == null ? "" : typeof ref === "number" ? (account[ref - 1] || "") : String(ref);

  // ---------- photographs ----------
  const photo = (id) => { const g = F.plates[id]; return g && PHOTOS[g.src] ? { id, ...g, ...PHOTOS[g.src] } : null; };
  const srcset = (ph) => ph.set.map(([w, u]) => `${url(u)} ${w}w`).join(", ");
  const mid = (ph) => (ph.set.find(([w]) => w >= 960) || ph.set[ph.set.length - 1])[1];
  const img = (ph, sizes, eager, more) =>
    `<img src="${esc(url(mid(ph)))}" srcset="${esc(srcset(ph))}" sizes="${esc(sizes)}" width="${ph.w}" height="${ph.h}" alt="${esc(ph.alt)}" decoding="async" draggable="false"${eager ? ' fetchpriority="high"' : ""}${more || ""}>`;
  const caption = (ph) => `<figcaption class="fo-micro"><b>${ph.id}</b>${esc(ph.caption)}</figcaption>`;
  const figure = (ph, sizes, eager, cls) =>
    `<div class="fo-cell ${cls || ""}" style="--r:${(ph.w / ph.h).toFixed(4)}"><figure class="fo-fig"><button type="button" class="fo-frame" data-plate="${ph.id}" aria-label="${esc(`Plate ${ph.id}, ${ph.caption}. See it whole`)}">${img(ph, sizes, eager)}</button>${caption(ph)}</figure></div>`;
  const band = (ph, focus, eager) =>
    `<figure class="fo-bandfig"><div class="fo-frame" style="--r:${(ph.w / ph.h).toFixed(4)}">${img(ph, "100vw", eager, focus ? ` style="object-position:${focus[0]}% ${focus[1]}%"` : "")}</div>${caption(ph)}</figure>`;

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
  const coord = venue && site.lat != null ? `${Math.abs(site.lat).toFixed(5)}° ${site.lat >= 0 ? "N" : "S"}, ${Math.abs(site.lon).toFixed(5)}° ${site.lon >= 0 ? "E" : "W"}` : "";
  const record = [
    ["Location", where.map(esc).join("<br>")],
    ["General contractor", "Freeman General Contracting"],
    ...credits.filter(([k]) => k !== "Photography").map(([k, v]) => [k, v.map(partner).join(", ")])
  ];
  const dl = (rows, cls) => `<dl class="${cls}">${rows.map(([k, v]) => `<div><dt class="fo-micro">${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>`;

  // ---------- leaves ----------
  const leaves = F.leaves;
  const count = leaves.length;
  const titleOf = (L) => L.title || (L.type === "cover" ? "Cover" : (photo(L.plate) || {}).caption || "");
  const many = (v) => [].concat(v == null ? [] : v).map(say).filter(Boolean);
  const words = (L, big) => {
    const lead = say(L.lead);
    return (L.label ? `<p class="fo-micro fo-label">${esc(L.label)}</p>` : "") +
      (lead ? `<p class="${big ? "fo-big" : "fo-lead"}">${esc(lead)}</p>` : "") +
      many(L.passage).map((t) => `<p class="fo-passage">${esc(t)}</p>`).join("");
  };

  const render = {
    cover(L) {
      const ph = photo(L.plate);
      const head = `<p class="fo-kicker fo-micro"><b>No. ${esc(p.id)}</b> / ${esc(p.type)}</p><header class="fo-head"><h1 class="fo-name">${esc(p.name)}</h1><p class="fo-micro">${esc(where.join(", "))}</p></header>`;
      const how = `<p class="fo-how fo-micro"><b>${word(count)} leaves</b><br>Turn with <kbd>←</kbd> <kbd>→</kbd></p>`;
      if (L.layout === "band") return (ph ? band(ph, L.focus, true) : "") + head + dl(record, "fo-record") + how;
      return head + (ph ? figure(ph, "(max-width:760px) 100vw, 52vw", true, ph.w > ph.h ? "is-wide" : "") : "") + dl(record, "fo-record") + how;
    },
    plate(L) {
      const ph = photo(L.plate);
      if (!ph) return "";
      const w = words(L);
      if (L.side === "band") return band(ph, L.focus) + (w ? `<div class="fo-under">${w}</div>` : "");
      return figure(ph, "(max-width:760px) 100vw, 58vw") + (w ? `<div class="fo-side"><div class="fo-words">${w}</div></div>` : "");
    },
    // Two photographs at different scales, with the passage they bear out.
    pair(L) {
      const [a, b] = L.plates.map(photo);
      if (!a || !b) return "";
      return figure(a, "(max-width:760px) 100vw, 45vw", false, "fo-a") + figure(b, "(max-width:760px) 100vw, 50vw", false, "fo-b") + `<div class="fo-words">${words(L)}</div>`;
    },
    // One plate of matched crops: the same kind of thing, found in several photographs, shown at one size.
    typology(L) {
      const cells = L.items.map((it, i) => {
        const ph = photo(it.plate); if (!ph) return "";
        const [x, y, w, h] = it.view;
        const st = `width:${(ph.w / w * 100).toFixed(3)}%;left:${(-x / w * 100).toFixed(3)}%;top:${(-y / h * 100).toFixed(3)}%`;
        return `<li><button type="button" class="fo-crop" data-plate="${ph.id}" aria-label="${esc(`${it.name}. See plate ${ph.id}, ${ph.caption}, whole`)}"><span class="fo-cropframe" style="aspect-ratio:${(w / h).toFixed(4)}"><img src="${esc(url(mid(ph)))}" srcset="${esc(srcset(ph))}" sizes="(max-width:760px) 130vw, ${Math.round(24 * ph.w / w)}vw" alt="${esc(ph.alt)}" style="${st}" decoding="async" draggable="false"></span><span class="fo-micro"><b>${String.fromCharCode(65 + i)}</b>${esc(it.name)}<i>Plate ${ph.id}</i></span></button></li>`;
      }).join("");
      return `<div class="fo-words">${words(L, true)}</div><ol class="fo-typ" style="--n:${L.items.length}">${cells}</ol>`;
    },
    // A fact set large, the sentences that state it, and a short list. No photograph.
    statement(L) {
      const list = L.list ? `<div class="fo-listwrap">${L.listTitle ? `<p class="fo-micro">${esc(L.listTitle)}</p>` : ""}<ol class="fo-list">${L.list.map((t, i) => `<li><b class="fo-micro">${pad(i + 1)}</b>${esc(t)}</li>`).join("")}</ol></div>` : "";
      return `<p class="fo-figure">${esc(say(L.figure))}</p><div class="fo-words">${words(L)}</div>${list}` +
        (L.source ? `<p class="fo-foot fo-micro">${esc(L.source)}</p>` : "");
    },
    // A drawing leaf: a real sheet (SVG or image supplied by the design team) in a title block. No project has one yet.
    drawing(L) {
      const tb = [["Sheet", L.sheet], ["Title", L.title], ["Drawn by", L.by], ["Date", L.date], ["Scale", L.scale]].filter(([, v]) => v);
      return `<div class="fo-cell" style="--r:${(L.w / L.h).toFixed(4)}"><figure class="fo-fig fo-sheet"><div class="fo-frame">${L.svg || `<img src="${esc(url(L.src))}" alt="${esc(L.alt || L.title)}" width="${L.w}" height="${L.h}">`}</div></figure></div>` +
        `<div class="fo-side">${L.note ? `<p class="fo-passage">${esc(L.note)}</p>` : ""}${dl(tb.map(([k, v]) => [k, esc(v)]), "fo-particulars")}</div>`;
    },
    colophon(L) {
      const nextF = L.next && (window.BUILT_INDEX || []).find((x) => x.slug === L.next);
      const ids = Object.keys(F.plates);
      const photographers = credits.filter(([k]) => k === "Photography").map(([, v]) => v.map(partner).join(", "));
      const rows = [["Project", `No. ${esc(p.id)}, ${esc(p.type)}`], ...record.slice(0, 1), ...(coord ? [["Position", coord]] : []),
        ...(L.particulars || []).map(([k, v]) => [k, esc(v)]), ...record.slice(1),
        ["Photographs", `${word(ids.length)} plates${photographers.length ? `<br>${photographers.join(", ")}` : ""}`]];
      const works = L.works ? `<ol class="fo-works">${L.works.map((w) => `<li><b class="fo-micro">No. ${esc(w.no)}</b><span>${esc(w.name)}</span><i>${esc(w.note || "")}</i></li>`).join("")}</ol>` : "";
      const strip = L.plates ? `<div class="fo-plates" style="--n:${ids.length};--sum:${ids.reduce((t, id) => t + (photo(id) ? photo(id).w / photo(id).h : 0), 0).toFixed(3)}"><p class="fo-micro">The photographs, whole</p><ol>${ids.map((id) => { const ph = photo(id); return ph ? `<li><button type="button" data-plate="${id}" aria-label="${esc(`Plate ${id}, ${ph.caption}, whole`)}"><img src="${esc(url(ph.set[0][1]))}" alt="" width="${ph.w}" height="${ph.h}"><span class="fo-micro"><b>${id}</b></span></button></li>` : ""; }).join("")}</ol></div>` : "";
      return `<div class="fo-close"><p class="fo-big">${esc(say(L.lead) || p.name)}</p>${many(L.passage).map((t) => `<p class="fo-passage">${esc(t)}</p>`).join("")}${works}</div>` +
        dl(rows, "fo-particulars") + strip +
        `<nav class="fo-onward" aria-label="Onward"><a href="./"><span class="fo-micro">Contents</span>The Built Record</a>` +
        (nextF ? `<a href="${esc(L.next)}.html"><span class="fo-micro">Next</span>${esc(nextF.name)} <i aria-hidden="true">→</i></a>` : "") + `</nav>`;
    }
  };

  root.innerHTML =
    `<div class="fo-stage" id="fo-stage">` +
    leaves.map((L, i) => `<section class="fo-leaf fo-${L.type}${L.side ? " is-" + L.side : ""}${L.layout ? " is-" + L.layout : ""}${L.type === "plate" && photo(L.plate) && photo(L.plate).h > photo(L.plate).w ? " is-tall" : ""}" data-i="${i}"${L.ground ? ` data-ground="${esc(L.ground)}"` : ""} aria-label="${esc(`Leaf ${i + 1} of ${count}: ${titleOf(L)}`)}">${(render[L.type] || (() => ""))(L)}</section>`).join("") +
    `</div>` +
    `<div class="fo-view" id="fo-view" hidden role="dialog" aria-label="Photograph, whole"><div class="fo-cell"><figure class="fo-fig"><div class="fo-frame"></div><figcaption class="fo-micro"></figcaption></figure></div><button type="button" class="fo-micro fo-viewx" data-viewx>× Back</button></div>` +
    `<footer class="fo-rail"><p class="fo-where" aria-live="polite"><b></b><i>/ ${pad(count)}</i><span></span></p>` +
    `<ol class="fo-ticks">${leaves.map((L, i) => `<li><button type="button" data-go="${i}" aria-label="${esc(`Leaf ${i + 1}: ${titleOf(L)}`)}"></button></li>`).join("")}</ol>` +
    `<div class="fo-ctl"><button type="button" data-prev aria-label="Previous leaf">←</button><button type="button" data-next aria-label="Next leaf">→</button></div></footer>`;

  const stage = root.querySelector(".fo-stage");
  const els = [...stage.querySelectorAll(".fo-leaf")];
  const whereEl = root.querySelector(".fo-where");
  const ticks = [...root.querySelectorAll(".fo-ticks button")];
  const btnPrev = root.querySelector("[data-prev]"), btnNext = root.querySelector("[data-next]");
  const theme = document.querySelector('meta[name="theme-color"]');
  let at = -1;
  const ground = (g) => { document.documentElement.dataset.ground = g; if (theme) theme.content = g === "dark" ? "#17140f" : "#ffffff"; };

  // ---------- turning ----------
  const go = (i, quiet) => {
    i = Math.max(0, Math.min(count - 1, i));
    if (i === at) return;
    at = i;
    els.forEach((el, n) => { el.classList.toggle("is-on", n === i); el.inert = n !== i; });
    ticks.forEach((t, n) => t.toggleAttribute("aria-current", n === i));
    whereEl.querySelector("b").textContent = pad(i + 1);
    whereEl.querySelector("span").textContent = titleOf(leaves[i]);
    btnPrev.disabled = i === 0; btnNext.disabled = i === count - 1;
    ground(leaves[i].ground || "light");
    if (!quiet) { try { history.replaceState(null, "", i ? `#${i + 1}` : location.pathname + location.search); } catch (e) { /* a sandboxed frame may refuse; turning still works */ } }
  };
  const turn = (d) => go(at + d);

  // ---------- a photograph, whole ----------
  const view = root.querySelector(".fo-view");
  const plateIds = Object.keys(F.plates);
  let viewing = null, cameFrom = null;
  const showPlate = (id) => {
    const ph = photo(id);
    if (!ph) return;
    if (view.hidden) cameFrom = document.activeElement;
    viewing = id;
    view.querySelector(".fo-cell").style.setProperty("--r", (ph.w / ph.h).toFixed(4));
    view.querySelector(".fo-frame").innerHTML = img(ph, "(max-width:760px) 100vw, 70vw");
    view.querySelector("figcaption").innerHTML = `<b>${ph.id}</b>${esc(ph.caption)}<i>${plateIds.indexOf(id) + 1} / ${plateIds.length}</i>`;
    view.hidden = false; stage.inert = true;
    ground("dark");
    view.querySelector("[data-viewx]").focus({ preventScroll: true });
  };
  const closePlate = () => {
    if (view.hidden) return;
    view.hidden = true; stage.inert = false; viewing = null;
    ground(leaves[at].ground || "light");
    if (cameFrom && cameFrom.focus) cameFrom.focus({ preventScroll: true });
  };
  const stepPlate = (d) => showPlate(plateIds[(plateIds.indexOf(viewing) + d + plateIds.length) % plateIds.length]);
  view.addEventListener("click", (e) => { e.stopPropagation(); if (e.target.closest("[data-viewx]") || !e.target.closest(".fo-fig")) closePlate(); else stepPlate(1); });

  // ---------- input ----------
  root.addEventListener("click", (e) => {
    const pl = e.target.closest("[data-plate]");
    if (pl) { showPlate(pl.dataset.plate); return; }
    const g = e.target.closest("[data-go]");
    if (g) { closePlate(); go(+g.dataset.go); return; }
    if (e.target.closest("[data-prev]")) { closePlate(); turn(-1); }
    else if (e.target.closest("[data-next]")) { closePlate(); turn(1); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const onControl = e.target.closest && e.target.closest("button, a, input");
    if (!view.hidden) {
      if (e.key === "Escape") closePlate();
      else if (e.key === "ArrowRight") stepPlate(1);
      else if (e.key === "ArrowLeft") stepPlate(-1);
      else return;
      e.preventDefault(); return;
    }
    const k = e.key;
    if (k === "ArrowRight" || k === "PageDown" || (k === " " && !onControl && !e.shiftKey)) { turn(1); e.preventDefault(); }
    else if (k === "ArrowLeft" || k === "PageUp" || (k === " " && !onControl && e.shiftKey)) { turn(-1); e.preventDefault(); }
    else if (k === "Home") { go(0); e.preventDefault(); }
    else if (k === "End") { go(count - 1); e.preventDefault(); }
  });
  // The wheel turns one leaf per gesture: readers reach for it, and nothing here scrolls.
  let locked = 0, sum = 0;
  window.addEventListener("wheel", (e) => {
    if (!view.hidden || e.ctrlKey) return;
    const now = Date.now();
    if (now < locked) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    sum = Math.sign(d) === Math.sign(sum) ? sum + d : d;
    if (Math.abs(sum) > 60) { turn(sum > 0 ? 1 : -1); sum = 0; locked = now + 650; }
  }, { passive: true });
  // A sideways swipe turns a leaf.
  let sx = 0, sy = 0, st = 0;
  stage.addEventListener("touchstart", (e) => { if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); } else st = 0; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (!st) return;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (view.hidden && Date.now() - st < 800 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6) turn(dx < 0 ? 1 : -1);
    st = 0;
  }, { passive: true });
  window.addEventListener("hashchange", () => go((parseInt(location.hash.slice(1), 10) || 1) - 1, true));

  go((parseInt(location.hash.slice(1), 10) || 1) - 1, true);
  if (calm.matches) document.documentElement.dataset.calm = "";
  document.documentElement.dataset.ready = "";
})();
