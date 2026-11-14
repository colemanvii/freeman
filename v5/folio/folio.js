/* Freeman Folio — one renderer for every project that has a folio (folio/folios/<slug>.js).

   A folio is read one leaf at a time. Nothing scrolls. A leaf is a composed screen: a cover, a passage
   of the account, a photograph, a drawing, the particulars. The reader turns leaves (arrow keys, the
   rail, a swipe, the wheel), sees the whole folio at once in the index, and reads a photograph closely
   through its keyed details. Facts come from the site's published records; the folio file composes them.

   Leaf types: cover · text · plate (left | right | centre | band) · drawing · colophon. */
(() => {
  "use strict";
  const slug = window.FOLIO_SLUG || document.documentElement.dataset.folio;
  const F = (window.FREEMAN_FOLIOS || {})[slug];
  const p = ((window.RECORDS || {}).projects || []).find((x) => x.slug === slug);
  const root = document.getElementById("folio");
  if (!F || !p || !root) { if (root) root.innerHTML = '<p class="fo-none">This folio is not available.</p>'; return; }

  const BASE = window.FOLIO_BASE != null ? window.FOLIO_BASE : "../"; // the site root, seen from this page
  const PHOTOS = window.RECORD_PHOTOS || {};
  const site = ((window.RECORD_SITES || {}).sites || {})[slug] || {};
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const url = (u) => BASE + String(u).replace(/^\//, "");
  const pad = (n) => String(n).padStart(2, "0");
  const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

  // ---------- the account, by sentence and clause ----------
  const account = (p.summary || "").trim();
  const sentences = account.match(/[^.!?]+[.!?]+(?=\s|$)/g) || [];
  const passage = (ref) => {
    if (ref == null) return "";
    const [s, c] = [].concat(ref);
    const sentence = (sentences[s - 1] || "").trim();
    if (!c) return sentence;
    const clauses = sentence.split(/(?<=;)\s+/);
    return (clauses[c - 1] || "").trim();
  };

  // ---------- photographs ----------
  const photo = (id) => { const g = F.plates[id]; return g && PHOTOS[g.src] ? { id, ...g, ...PHOTOS[g.src] } : null; };
  const img = (ph, sizes, eager, more) => {
    const set = ph.set.map(([w, u]) => `${url(u)} ${w}w`).join(", ");
    const mid = (ph.set.find(([w]) => w >= 960) || ph.set[ph.set.length - 1])[1];
    return `<img src="${esc(url(mid))}" srcset="${esc(set)}" sizes="${esc(sizes)}" width="${ph.w}" height="${ph.h}" alt="${esc(ph.alt)}" decoding="async" draggable="false"${eager ? ' fetchpriority="high"' : ""}${more || ""}>`;
  };
  const figure = (ph, sizes, eager, cls) => `<div class="fo-cell ${cls || ""}" style="--r:${(ph.w / ph.h).toFixed(4)}"><figure class="fo-fig"><div class="fo-frame">${img(ph, sizes, eager)}</div><figcaption class="fo-micro"><b>${ph.id}</b>${esc(ph.caption)}</figcaption></figure></div>`;

  // ---------- credits (same reading as app.js) ----------
  const credits = () => {
    const C = window.FREEMAN_CREDITS;
    if (!C || !C.projects[slug]) return [];
    return C.roles.map(([role, label, plural]) => {
      const list = C.projects[slug].filter((c) => c.role === role && C.partners[c.partner]).map((c) => C.partners[c.partner]);
      return list.length ? [list.length > 1 && plural ? plural : label, list] : null;
    }).filter(Boolean);
  };
  const partner = (x) => x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.name)}</a>` : esc(x.name);
  const venue = site.precision === "venue";
  const where = venue ? [site.address, site.area].filter(Boolean) : [site.area || p.location];
  const coord = venue && site.lat != null ? `${Math.abs(site.lat).toFixed(5)}° ${site.lat >= 0 ? "N" : "S"}, ${Math.abs(site.lon).toFixed(5)}° ${site.lon >= 0 ? "E" : "W"}` : "";
  const record = [
    ["Location", where.map(esc).join("<br>")],
    ["General contractor", "Freeman General Contracting"],
    ...credits().map(([k, v]) => [k, v.map(partner).join(", ")])
  ];
  const dl = (rows, cls) => `<dl class="${cls}">${rows.map(([k, v]) => `<div><dt class="fo-micro">${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>`;

  // ---------- leaves ----------
  const leaves = F.leaves;
  const count = leaves.length;
  const titleOf = (L) => L.title || (L.type === "cover" ? "Cover" : (photo(L.plate) || {}).caption || "");

  const reading = (L, ph) => {
    if (!L.details || !L.details.length) return "";
    const keys = [`<li><button type="button" data-k="0" aria-pressed="true"><b>—</b><span>Whole photograph</span></button></li>`]
      .concat(L.details.map((d, i) => `<li><button type="button" data-k="${i + 1}" aria-pressed="false"><b>${i + 1}</b><span>${esc(d.name)}</span></button></li>`)).join("");
    const small = ph.set[0][1];
    return `<div class="fo-read"><p class="fo-micro">Read the photograph</p><ol class="fo-keys">${keys}</ol>` +
      `<div class="fo-keyinfo"><span class="fo-plan" style="--r:${(ph.w / ph.h).toFixed(4)}" aria-hidden="true"><img src="${esc(url(small))}" alt="" width="${ph.w}" height="${ph.h}"><i></i></span><p class="fo-note" aria-live="polite"></p></div></div>`;
  };

  const render = {
    cover(L) {
      const ph = photo(L.plate);
      return `<header class="fo-head"><p class="fo-micro"><b>No. ${esc(p.id)}</b> / ${esc(p.type)}</p><h1 class="fo-name">${esc(p.name)}</h1><p class="fo-micro">${esc(site.area || p.location)}</p></header>` +
        (ph ? figure(ph, "(max-width:760px) 100vw, 52vw", true, ph.w > ph.h ? "is-wide" : "") : "") +
        dl(record, "fo-record") +
        `<p class="fo-how fo-micro"><b>${WORDS[count] || count} leaves</b><br>Turn with <kbd>←</kbd> <kbd>→</kbd><br><kbd>I</kbd> for the index</p>`;
    },
    text(L) {
      const ph = L.plate && photo(L.plate);
      return `<p class="fo-big">${esc(passage(L.passage))}</p>` +
        (ph ? figure(ph, "(max-width:760px) 60vw, 26vw", false, "fo-aside") : "") +
        (L.place ? `<p class="fo-foot fo-micro">${where.map(esc).join(", ")}${coord ? `<br>${coord}` : ""}</p>` : "");
    },
    plate(L) {
      const ph = photo(L.plate);
      if (!ph) return "";
      const band = L.side === "band";
      const fig = band
        ? `<figure class="fo-bandfig"><div class="fo-frame" style="--r:${(ph.w / ph.h).toFixed(4)}">${img(ph, "100vw", false, L.focus ? ` style="object-position:${L.focus[0]}% ${L.focus[1]}%"` : "")}</div><figcaption class="fo-micro"><b>${ph.id}</b>${esc(ph.caption)}</figcaption></figure>`
        : figure(ph, L.side === "centre" ? "(max-width:760px) 100vw, 46vw" : "(max-width:760px) 100vw, 58vw");
      const say = passage(L.passage);
      const side = band || (!say && !L.details) ? "" : `<div class="fo-side">${say ? `<p class="fo-passage">${esc(say)}</p>` : ""}${reading(L, ph)}</div>`;
      return fig + side;
    },
    // A drawing leaf: a real sheet (SVG or image supplied by the design team) in a title block. No project has one yet.
    drawing(L) {
      const tb = [["Sheet", L.sheet], ["Title", L.title], ["Drawn by", L.by], ["Date", L.date], ["Scale", L.scale]].filter(([, v]) => v);
      return `<div class="fo-cell" style="--r:${(L.w / L.h).toFixed(4)}"><figure class="fo-fig fo-sheet"><div class="fo-frame">${L.svg || `<img src="${esc(url(L.src))}" alt="${esc(L.alt || L.title)}" width="${L.w}" height="${L.h}">`}</div></figure></div>` +
        `<div class="fo-side">${L.note ? `<p class="fo-passage">${esc(L.note)}</p>` : ""}${dl(tb.map(([k, v]) => [k, esc(v)]), "fo-particulars")}</div>`;
    },
    colophon(L) {
      const nextP = L.next && ((window.RECORDS || {}).projects || []).find((x) => x.slug === L.next);
      const rows = [["Project", `No. ${esc(p.id)}, ${esc(p.type)}`], ...record.slice(0, 1), ...(coord ? [["Position", coord]] : []),
        ...(L.particulars || []).map(([k, v]) => [k, esc(v)]), ...record.slice(1),
        ["Photographs", `${WORDS[Object.keys(F.plates).length] || Object.keys(F.plates).length} plates`]];
      const say = passage(L.passage);
      return `<div class="fo-close">${say ? `<p class="fo-big">${esc(say)}</p>` : `<p class="fo-big is-name">${esc(p.name)}</p>`}</div>` +
        dl(rows, "fo-particulars") +
        `<nav class="fo-onward" aria-label="Onward"><a href="${esc(url("map.html?p=" + slug))}"><span class="fo-micro">Return</span>${esc(p.name)} on the map</a>` +
        (nextP ? `<a href="${esc((window.FOLIO_HERE || "") + L.next)}.html"><span class="fo-micro">Next folio</span>${esc(nextP.name)} <i aria-hidden="true">→</i></a>` : "") + `</nav>`;
    }
  };

  root.innerHTML =
    `<div class="fo-stage" id="fo-stage">` +
    leaves.map((L, i) => `<section class="fo-leaf fo-${L.type}${L.side ? " is-" + L.side : ""}${L.plate && L.type === "text" ? " has-plate" : ""}${L.type === "plate" && photo(L.plate) && photo(L.plate).h > photo(L.plate).w ? " is-tall" : ""}" data-i="${i}" aria-label="${esc(`Leaf ${i + 1} of ${count}: ${titleOf(L)}`)}">${(render[L.type] || (() => ""))(L)}</section>`).join("") +
    `</div>` +
    `<div class="fo-index" id="fo-index" hidden role="dialog" aria-label="Index of leaves"><ol></ol></div>` +
    `<footer class="fo-rail"><p class="fo-where" aria-live="polite"><b></b><i>/ ${pad(count)}</i><span></span></p>` +
    `<ol class="fo-ticks">${leaves.map((L, i) => `<li><button type="button" data-go="${i}" aria-label="${esc(`Leaf ${i + 1}: ${titleOf(L)}`)}"></button></li>`).join("")}</ol>` +
    `<div class="fo-ctl"><button type="button" class="fo-micro" data-index aria-expanded="false" aria-controls="fo-index">Index</button><button type="button" data-prev aria-label="Previous leaf">←</button><button type="button" data-next aria-label="Next leaf">→</button></div></footer>`;

  const stage = root.querySelector(".fo-stage");
  const els = [...stage.querySelectorAll(".fo-leaf")];
  const index = root.querySelector(".fo-index");
  const whereEl = root.querySelector(".fo-where");
  const ticks = [...root.querySelectorAll(".fo-ticks button")];
  const btnPrev = root.querySelector("[data-prev]"), btnNext = root.querySelector("[data-next]"), btnIndex = root.querySelector("[data-index]");
  let at = -1;

  // ---------- reading a photograph: the frame moves across it ----------
  const MAXZOOM = 2.4; // beyond this the files run out
  const setKey = (leaf, k) => {
    const L = leaves[+leaf.dataset.i];
    const read = leaf.querySelector(".fo-read");
    if (!read) return;
    const ph = photo(L.plate);
    const image = leaf.querySelector(".fo-fig img");
    const d = k ? L.details[k - 1] : null;
    let s = 1, tx = 0, ty = 0, box = [0, 0, 1, 1];
    if (d) {
      const [x, y, w, h] = d.view;
      s = Math.min(ph.w / w, ph.h / h, MAXZOOM);
      tx = Math.min(0, Math.max(1 - s, 0.5 - ((x + w / 2) / ph.w) * s));
      ty = Math.min(0, Math.max(1 - s, 0.5 - ((y + h / 2) / ph.h) * s));
      box = [-tx / s, -ty / s, 1 / s, 1 / s];
      image.sizes = "220vw"; // ask for the largest file once a reader looks closely
    }
    image.style.transform = d ? `translate(${(tx * 100).toFixed(3)}%, ${(ty * 100).toFixed(3)}%) scale(${s.toFixed(4)})` : "";
    leaf.classList.toggle("is-close", !!d);
    leaf.dataset.k = k;
    read.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.k === k)));
    const mark = read.querySelector(".fo-plan i");
    mark.style.cssText = `left:${box[0] * 100}%;top:${box[1] * 100}%;width:${box[2] * 100}%;height:${box[3] * 100}%`;
    read.querySelector(".fo-note").innerHTML = d ? `<b>${esc(d.name)}.</b> ${esc(d.note)}` : "";
  };
  els.forEach((leaf) => {
    if (!leaf.querySelector(".fo-read")) return;
    leaf.addEventListener("click", (e) => {
      const b = e.target.closest("[data-k]");
      if (b) setKey(leaf, +b.dataset.k);
      else if (e.target.closest(".fo-frame") && !e.target.closest(".fo-plan")) {
        const n = leaves[+leaf.dataset.i].details.length;
        setKey(leaf, ((+leaf.dataset.k || 0) + 1) % (n + 1)); // a click on the photograph steps to the next detail
      }
    });
    setKey(leaf, 0);
  });

  // ---------- turning ----------
  const go = (i, quiet) => {
    i = Math.max(0, Math.min(count - 1, i));
    if (i === at) return;
    if (at >= 0 && els[at].dataset.k > 0) setKey(els[at], 0);
    at = i;
    els.forEach((el, n) => { el.classList.toggle("is-on", n === i); el.inert = n !== i; });
    ticks.forEach((t, n) => t.toggleAttribute("aria-current", n === i));
    whereEl.querySelector("b").textContent = pad(i + 1);
    whereEl.querySelector("span").textContent = titleOf(leaves[i]);
    btnPrev.disabled = i === 0; btnNext.disabled = i === count - 1;
    document.documentElement.dataset.leaf = leaves[i].type;
    if (!quiet) { try { history.replaceState(null, "", i ? `#${i + 1}` : location.pathname + location.search); } catch (e) { /* a sandboxed frame may refuse; turning still works */ } }
  };
  const turn = (d) => go(at + d);

  // ---------- the index: the whole folio on one screen ----------
  const list = index.querySelector("ol");
  const sizeIndex = () => {
    const r = stage.getBoundingClientRect();
    index.style.setProperty("--sw", r.width); index.style.setProperty("--sh", r.height);
    const t = list.querySelector(".fo-thumb");
    if (t) index.style.setProperty("--k", t.clientWidth / r.width);
  };
  const openIndex = (on) => {
    if (on === !index.hidden) return;
    if (on) {
      list.innerHTML = els.map((el, i) => `<li${i === at ? ' class="is-here"' : ""}><div class="fo-thumb" aria-hidden="true"><div class="fo-mini"></div></div><button type="button" class="fo-pick fo-micro" data-go="${i}"><b>${pad(i + 1)}</b>${esc(titleOf(leaves[i]))}</button></li>`).join("");
      list.querySelectorAll(".fo-mini").forEach((m, i) => {
        const c = els[i].cloneNode(true);
        c.classList.add("is-on"); c.inert = true; c.removeAttribute("aria-label");
        c.querySelectorAll("img").forEach((im) => { im.style.transform = ""; im.sizes = "25vw"; im.removeAttribute("fetchpriority"); });
        m.appendChild(c);
      });
    }
    index.hidden = !on;
    stage.inert = on;
    btnIndex.setAttribute("aria-expanded", String(on));
    btnIndex.textContent = on ? "Close index" : "Index";
    document.documentElement.toggleAttribute("data-index", on);
    if (on) { sizeIndex(); const here = list.querySelector(".is-here button"); if (here) here.focus({ preventScroll: true }); }
    else { list.innerHTML = ""; btnIndex.focus({ preventScroll: true }); }
  };
  window.addEventListener("resize", () => { if (!index.hidden) sizeIndex(); });

  // ---------- input ----------
  root.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]");
    if (g) { go(+g.dataset.go); openIndex(false); return; }
    if (e.target.closest("[data-prev]")) turn(-1);
    else if (e.target.closest("[data-next]")) turn(1);
    else if (e.target.closest("[data-index]")) openIndex(index.hidden);
  });
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const onControl = e.target.closest && e.target.closest("button, a, input");
    if (e.key === "Escape") { if (!index.hidden) openIndex(false); else if (els[at].dataset.k > 0) setKey(els[at], 0); return; }
    if (e.key === "i" || e.key === "I") { openIndex(index.hidden); e.preventDefault(); return; }
    if (!index.hidden) return;
    const k = e.key;
    if (k === "ArrowRight" || k === "PageDown" || (k === " " && !onControl && !e.shiftKey)) { turn(1); e.preventDefault(); }
    else if (k === "ArrowLeft" || k === "PageUp" || (k === " " && !onControl && e.shiftKey)) { turn(-1); e.preventDefault(); }
    else if (k === "Home") { go(0); e.preventDefault(); }
    else if (k === "End") { go(count - 1); e.preventDefault(); }
  });
  // The wheel turns one leaf per gesture: readers reach for it, and nothing here scrolls.
  let locked = 0, sum = 0;
  window.addEventListener("wheel", (e) => {
    if (!index.hidden || e.ctrlKey) return;
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
    if (Date.now() - st < 800 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6) turn(dx < 0 ? 1 : -1);
    st = 0;
  }, { passive: true });
  window.addEventListener("hashchange", () => go((parseInt(location.hash.slice(1), 10) || 1) - 1, true));

  go((parseInt(location.hash.slice(1), 10) || 1) - 1, true);
  if (calm.matches) document.documentElement.dataset.calm = "";
  document.documentElement.dataset.ready = "";
})();
