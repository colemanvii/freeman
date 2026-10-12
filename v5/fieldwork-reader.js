"use strict";
/*
 * Fieldwork — a photographic log. Mounted by app.js inside the same interior shell as the
 * other sections (section line at the top left, × CLOSE at the top right).
 *   index   → one list of compact rows: thumbnail / title + project (+ date and time only
 *             when a record carries a genuine one; none are invented)
 *   record  → the existing record page; ↑ ↓ (or ← →) step records, each a history entry
 * Each record has its own URL (fieldwork-<slug>.html), so records deep-link, refresh and
 * work with Back/Forward. Returning to the index restores its scroll and selected row.
 */
window.FreemanFieldwork = (() => {
  const data = window.RECORDS;
  if (!data || !Array.isArray(data.archive)) return null;
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const pad = (n, l = 3) => String(n).padStart(l, "0");
  const DRAFT_KEY = "freeman-fieldwork-local-drafts";

  const mem = { scroll: null };
  let api = null, host = null, els = {}, current = { kind: "index" }, active = -1;

  let drafts = [];
  try {
    drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]");
    if (!Array.isArray(drafts)) drafts = [];
  } catch (e) {
    drafts = [];
  }

  /* ---------- Records ---------- */
  const entries = () => [
    ...drafts.map((d, i) => ({ ...d, slug: "draft-" + i, draftIndex: i, isDraft: true })),
    ...data.archive,
  ];
  const href = (a) => (a.isDraft ? "fieldwork.html?draft=" + a.draftIndex : "fieldwork-" + a.slug + ".html");
  const numberOf = (a) => (a.isDraft ? "D" + String(a.draftIndex + 1).padStart(2, "0") : pad(data.archive.indexOf(a) + 1));
  const img = (a) => (a.isDraft ? null : "assets/" + a.image);
  const projectFor = (a) => (a.link ? data.projects.find((p) => p.slug === a.link) : null);
  // Only a genuine timestamp carried by the record itself; never a placeholder.
  function stamp(a) {
    const raw = a.capturedAt || a.date || a.savedAt;
    const d = raw ? new Date(raw) : null;
    if (!d || isNaN(d)) return null;
    const ymd = `${d.getFullYear()}.${pad(d.getMonth() + 1, 2)}.${pad(d.getDate(), 2)}`;
    const hasTime = typeof raw === "number" || /T\d|\d:\d/.test(String(raw));
    return { iso: d.toISOString(), text: hasTime ? `${ymd} / ${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}` : ymd };
  }

  /* Which view does a route describe? */
  function resolve(route) {
    if (route.record) return { kind: "detail", record: route.record };
    const draft = route.params.get("draft");
    if (draft != null) {
      const d = entries().find((a) => a.isDraft && String(a.draftIndex) === draft);
      if (d) return { kind: "detail", record: d };
    }
    if (route.params.get("note") === "new") return { kind: "note" };
    return { kind: "index" };
  }

  /* ---------- Frame: the shared interior shell ---------- */
  function frame() {
    host.innerHTML = `<header class="panel-head"><h1 class="sr-only">Fieldwork<span class="fw-tail"></span></h1>${window.FreemanClose ? window.FreemanClose() : ""}</header><section class="viewport fw-view" id="fw-window" aria-label="Fieldwork"></section><footer class="sheet-controls"><span class="sr-only" id="fw-message" aria-live="polite"></span></footer>`;
    els = {
      head: host.querySelector(".panel-head"),
      window: host.querySelector("#fw-window"),
      message: host.querySelector("#fw-message"),
      tail: host.querySelector(".fw-tail"),
    };
  }
  const setMessage = (v) => { if (els.message) els.message.textContent = v; };

  /* Section line and × CLOSE are shared with the rest of the site. */
  function updateChrome() {
    const focus = current.record ? current.record.slug : undefined;
    const parent = current.kind === "index" ? null : { href: "fieldwork.html", focus };
    const old = els.head.querySelector(".site-nav");
    if (old) old.remove();
    // The section line sits before × CLOSE, so CLOSE stays in the upper right.
    if (window.FreemanNav) els.head.querySelector("h1").insertAdjacentHTML("afterend", window.FreemanNav("fieldwork", parent));
    els.tail.textContent =
      current.kind === "detail" ? " / " + numberOf(current.record) : current.kind === "note" ? " / New note" : "";
  }

  /* ---------- Index: the log ---------- */
  function renderIndex(state) {
    const list = entries();
    const focusIndex = state && state.focus ? list.findIndex((a) => a.slug === state.focus) : -1;
    active = focusIndex;
    els.window.innerHTML = `<div class="fw-scroller" tabindex="0" aria-label="Field records"><ol class="fw-log">${list
      .map((a, i) => {
        const t = stamp(a);
        const thumb = img(a)
          ? `<img class="fw-thumb" src="${esc(img(a))}" alt="" loading="lazy">`
          : `<span class="fw-thumb fw-thumb-placeholder" aria-hidden="true">✎</span>`;
        return `<li class="fw-record${i === active ? " is-current" : ""}" data-row="${i}"><a class="fw-entry" href="${esc(href(a))}" data-slug="${esc(a.slug)}">${thumb}<span class="fw-text"><span class="fw-name">${esc(a.title)}</span><span class="fw-meta">${esc(a.project)}${a.isDraft ? " / Local draft" : ""}</span></span>${t ? `<time class="fw-time" datetime="${esc(t.iso)}">${esc(t.text)}</time>` : ""}</a></li>`;
      })
      .join("")}</ol></div>`;
    const scroller = els.window.querySelector(".fw-scroller");
    // The record a visitor opens becomes the selection they return to.
    scroller.addEventListener("click", (e) => {
      const row = e.target.closest(".fw-record");
      if (row) active = Number(row.dataset.row);
    });
    // Back/Forward carry the position in history; otherwise reuse the last one seen.
    const scroll = state && typeof state.fwScroll === "number" ? state.fwScroll : focusIndex >= 0 ? mem.scroll : null;
    if (typeof scroll === "number") scroller.scrollTop = scroll;
    if (focusIndex >= 0) reveal(focusIndex);
  }
  /* Keep a row visible inside the scroller without scrolling the fixed page (iOS-safe). */
  function reveal(i) {
    const scroller = els.window.querySelector(".fw-scroller");
    const row = scroller && scroller.querySelectorAll(".fw-record")[i];
    if (!row) return;
    const top = row.offsetTop, bottom = top + row.offsetHeight;
    if (top < scroller.scrollTop) scroller.scrollTop = top;
    else if (bottom > scroller.scrollTop + scroller.clientHeight) scroller.scrollTop = bottom - scroller.clientHeight;
  }
  // Keyboard only: ↑ ↓ move the selection through the log.
  function move(n) {
    const nodes = [...els.window.querySelectorAll(".fw-record")];
    if (!nodes.length) return;
    active = Math.max(0, Math.min(nodes.length - 1, active < 0 ? 0 : active + n));
    nodes.forEach((el, i) => el.classList.toggle("is-current", i === active));
    reveal(active);
  }

  /* ---------- Record ---------- */
  function step(n) {
    const list = entries();
    const i = list.findIndex((a) => a.slug === current.record.slug) + n;
    // Each record visited with ↑ ↓ is its own history step, so CLOSE and browser Back retrace them.
    if (i >= 0 && i < list.length) api.navigate(href(list[i]));
  }
  function renderDetail() {
    const a = current.record;
    const proj = projectFor(a);
    const t = stamp(a);
    const relation = proj
      ? `<a class="fw-relation-link" href="project-${encodeURIComponent(proj.slug)}.html">P—${esc(proj.id)} / ${esc(proj.name)} ↗</a>`
      : `<span>${esc(a.project)}</span><span class="fw-muted"> / no project relationship established</span>`;
    els.window.innerHTML = `<div class="fw-record-page"><div class="fw-toolbar"><span class="fw-toolbar-count fw-muted"></span><button type="button" class="fw-step" id="fw-prev" aria-label="Previous record">↑</button><button type="button" class="fw-step" id="fw-next" aria-label="Next record">↓</button></div><article class="fw-detail" tabindex="0" aria-label="${esc(a.title)}"><div class="fw-label">${numberOf(a)} / ${esc(a.type)} / ${esc(a.status || "LOCAL DRAFT")}</div><h2>${esc(a.title)}</h2><div class="fw-relation"><span class="fw-label">CONNECTED PROJECT</span><div>${relation}</div></div>${img(a) ? `<img src="${esc(img(a))}" alt="${esc(a.title)}" />` : ""}<p>${esc(a.text || "")}</p>${a.note ? `<p class="fw-note">${esc(a.note)}</p>` : ""}<div class="fw-tags"><span>${esc(a.type)}</span><span>${esc(a.project)}</span><span>${esc(a.status || "LOCAL DRAFT")}</span></div><dl class="fw-facts"><div><dt>CAPTURE DATE</dt><dd>${t ? esc(t.text) : a.isDraft ? "Saved in this browser" : "Not established"}</dd></div><div><dt>SOURCE</dt><dd>${esc(a.source || "This browser only")}</dd></div></dl></article></div>`;
    const list = entries();
    const i = list.findIndex((x) => x.slug === a.slug);
    els.window.querySelector(".fw-toolbar-count").textContent = `${pad(i + 1, 2)} / ${pad(list.length, 2)}`;
    const prev = els.window.querySelector("#fw-prev"), next = els.window.querySelector("#fw-next");
    prev.onclick = () => step(-1);
    next.onclick = () => step(1);
    prev.disabled = i <= 0;
    next.disabled = i < 0 || i >= list.length - 1;
  }

  /* ---------- Local note (this browser only; reached at fieldwork.html?note=new) ---------- */
  function renderNote() {
    els.window.innerHTML = `<div class="fw-record-page"><div class="fw-detail"><div class="fw-label">NEW FIELD NOTE / THIS DEVICE ONLY</div><h2>Record an observation.</h2><form class="fw-draft" id="fw-form"><label for="fw-title-input">TITLE</label><input id="fw-title-input" required maxlength="100" placeholder="What caught your attention?"><label for="fw-project-input">CONNECTED PROJECT</label><select id="fw-project-input"><option>Unassigned reference</option>${data.projects.map((p) => `<option>${esc(p.name)}</option>`).join("")}</select><label for="fw-note-input">THE NOTE</label><textarea id="fw-note-input" required maxlength="2000" placeholder="Describe what you saw, why it matters, or what was decided."></textarea><button type="submit" class="fw-button">SAVE LOCAL DRAFT ↗</button></form><p class="fw-note" style="margin-top:18px">Drafts are kept only in this browser's local storage. Nothing is uploaded, shared, or published to Freeman. Production publishing will require an authenticated workflow.</p></div></div>`;
    els.window.querySelector("#fw-form").onsubmit = (e) => {
      e.preventDefault();
      const title = els.window.querySelector("#fw-title-input").value.trim(),
        note = els.window.querySelector("#fw-note-input").value.trim();
      if (!title || !note) return;
      drafts.unshift({
        title,
        text: note,
        project: els.window.querySelector("#fw-project-input").value,
        type: "Field",
        status: "LOCAL DRAFT",
        source: "Saved in this browser",
        note: "Draft / not publicly published",
        savedAt: new Date().toISOString(), // the real moment it was saved
      });
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
      } catch (err) {
        drafts.shift();
        setMessage("Browser storage unavailable. Note not saved.");
        return;
      }
      api.navigate("fieldwork.html", { replace: true, focus: "draft-0" });
    };
  }

  function show(route, state) {
    current = resolve(route);
    updateChrome();
    if (current.kind === "detail") renderDetail();
    else if (current.kind === "note") renderNote();
    else renderIndex(state);
  }

  return {
    mount(root, route, state, routerApi) {
      api = routerApi;
      host = root;
      mem.scroll = null;
      active = -1;
      frame();
      show(route, state || {});
    },
    update(route, state) {
      show(route, state || {});
    },
    isDetail() {
      return current.kind !== "index";
    },
    title() {
      return current.kind === "detail" ? current.record.title : current.kind === "note" ? "New field note" : "Fieldwork";
    },
    save() {
      const scroller = els.window && els.window.querySelector(".fw-scroller");
      if (!scroller) return {};
      mem.scroll = scroller.scrollTop;
      const a = entries()[active];
      return { fwScroll: scroller.scrollTop, fwActive: active, focus: a ? a.slug : undefined };
    },
    key(e) {
      if (current.kind === "index" && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        move(e.key === "ArrowDown" ? 1 : -1);
        return true;
      }
      if (current.kind === "index" && e.key === "Enter" && e.target.classList && e.target.classList.contains("fw-scroller")) {
        const a = entries()[active];
        if (a) { e.preventDefault(); api.navigate(href(a)); return true; }
      }
      if (current.kind === "detail" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        step(e.key === "ArrowRight" ? 1 : -1);
        return true;
      }
      return false;
    },
    destroy() {
      host = null;
      els = {};
    },
  };
})();
