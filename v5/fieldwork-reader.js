"use strict";
/*
 * Fieldwork — living index. Mounted by app.js; follows the same interior navigation rules:
 *   every view             → ← BACK (footer) follows real history; returning to the index
 *                            restores its filters, scroll and selected record
 * Each record has its own URL (fieldwork-<slug>.html), so records deep-link, refresh and
 * work with Back/Forward. Filters live in the index URL (?category=&project=&q=).
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
  const categories = ["All records", "Field", "Observation", "Material", "Process", "Artifact"];
  const connected = [["", "All projects"], ...[...new Set(data.archive.filter((a) => a.link).map((a) => a.project))].map((p) => [p, p])];
  const DRAFT_KEY = "freeman-fieldwork-local-drafts";

  const mem = { category: "All records", project: "", q: "", scroll: null };
  let api = null, host = null, els = {}, current = { kind: "index" }, active = 0, qTimer = null;

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
  const matches = (a) =>
    (mem.category === "All records" || a.type === mem.category) &&
    (!mem.project || a.project === mem.project) &&
    (!mem.q || (a.title + " " + a.type + " " + a.project + " " + a.text).toLowerCase().includes(mem.q.toLowerCase()));
  const filtered = () => entries().filter(matches);
  const filterQuery = () => {
    const p = new URLSearchParams();
    if (mem.category !== "All records") p.set("category", mem.category);
    if (mem.project) p.set("project", mem.project);
    if (mem.q) p.set("q", mem.q);
    const s = p.toString();
    return "fieldwork.html" + (s ? "?" + s : "");
  };
  function readFilters(params) {
    const c = params.get("category"), p = params.get("project");
    mem.category = categories.includes(c) ? c : "All records";
    mem.project = connected.some(([id]) => id && id === p) ? p : "";
    mem.q = (params.get("q") || "").slice(0, 120);
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

  /* ---------- Frame ---------- */
  function frame() {
    host.innerHTML = `<div class="fw-frame"><header class="fw-top"><h1 class="fw-crumb sr-only">Fieldwork<span class="fw-tail"></span></h1><span class="fw-nav"></span></header><div class="fw-line"></div><div class="fw-mast"><div><div class="fw-eyebrow">ARCHIVE / ONGOING</div><div class="fw-title" role="heading" aria-level="2">Fieldwork<i>.</i></div></div><div class="fw-description">A working record of the things we build, observe, and learn.</div></div><div class="fw-grid"><aside class="fw-side"><div class="fw-label">BROWSE / INDEX</div><nav class="fw-menu" aria-label="Record categories"></nav><div class="fw-line"></div><div class="fw-label">CONNECTED WORK</div><nav class="fw-related" aria-label="Project filters"></nav></aside><section class="fw-window" id="fw-window" aria-label="Records"></section><aside class="fw-status"><div class="fw-label">ARCHIVE STATUS</div><div class="fw-stat-row"><span class="fw-muted">RECORDS</span><div class="fw-stat" id="fw-total"></div></div><div class="fw-stat-row"><span class="fw-muted">MODE</span><div style="padding-top:8px">OPEN / ONGOING</div></div><div class="fw-label" style="margin-top:26px">RECENT ACTIVITY</div><div class="fw-activity"><b>+</b><span>New observations can be prepared as drafts</span></div><div class="fw-activity"><b>↗</b><span>Records connect to finished projects</span></div><div class="fw-activity"><b>○</b><span>Unverified references remain identified</span></div><a class="fw-button" id="fw-new" href="fieldwork.html?note=new">+ ADD LOCAL FIELD NOTE ↗</a></aside></div><div class="fw-line"></div><footer class="fw-foot">${window.FreemanBack ? window.FreemanBack("fw-backlink fw-link") : ""}<span class="fw-muted" id="fw-message" aria-live="polite"></span><span class="fw-sig">FREEMAN / BUILT FOR GENERATIONS™</span></footer></div>`;
    els = {
      window: host.querySelector("#fw-window"),
      menu: host.querySelector(".fw-menu"),
      related: host.querySelector(".fw-related"),
      message: host.querySelector("#fw-message"),
      tail: host.querySelector(".fw-tail"),
      nav: host.querySelector(".fw-nav"),
    };
    els.menu.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      mem.category = b.dataset.cat;
      mem.project = "";
      filtersChanged();
    });
    els.related.addEventListener("click", (e) => {
      const b = e.target.closest("[data-project]");
      if (!b) return;
      mem.project = b.dataset.project;
      mem.category = "All records";
      filtersChanged();
    });
  }
  const setMessage = (v) => { els.message.textContent = v; };

  /* Section line is shared with the rest of the site; ← BACK (footer) is real history. */
  function updateChrome() {
    const isIndex = current.kind === "index";
    const focus = current.record ? current.record.slug : undefined;
    const parent = isIndex ? null : { href: filterQuery(), focus };
    els.nav.innerHTML = window.FreemanNav ? window.FreemanNav("fieldwork", parent) : "";
    els.tail.textContent =
      current.kind === "detail" ? " / " + numberOf(current.record) : current.kind === "note" ? " / New note" : "";
  }

  function renderNav() {
    const all = entries();
    els.menu.innerHTML = categories
      .map((c) => `<button type="button" data-cat="${esc(c)}" class="${c === mem.category && !mem.project ? "active" : ""}" aria-pressed="${c === mem.category && !mem.project}"><span>${esc(c)}</span><span>${all.filter((a) => c === "All records" || a.type === c).length}</span></button>`)
      .join("");
    els.related.innerHTML = connected
      .map(([id, name]) => `<button type="button" data-project="${esc(id)}" aria-pressed="${mem.project === id}">↗ ${esc(name)}</button>`)
      .join("");
    host.querySelector("#fw-total").textContent = pad(all.length);
  }

  function filtersChanged() {
    active = 0;
    if (current.kind === "index") {
      renderNav();
      renderList();
      api.replaceUrl(filterQuery());
    } else {
      api.navigate(filterQuery());
    }
  }

  /* ---------- Index ---------- */
  function renderIndex(state) {
    els.window.innerHTML = `<div class="fw-toolbar"><input class="fw-search" type="search" enterkeyhint="search" autocomplete="off" placeholder="SEARCH FIELDWORK / MATERIALS / PEOPLE..." aria-label="Search field records"><button type="button" class="fw-step" id="fw-prev" aria-label="Previous record">↑</button><button type="button" class="fw-step" id="fw-next" aria-label="Next record">↓</button><a class="fw-mobile-note" href="fieldwork.html?note=new" aria-label="Create local field note">+ NOTE</a></div><div class="fw-scroller" tabindex="0" aria-label="Scrollable field records"></div><div class="fw-scrollcount"><span id="fw-listcount"></span><span>↑ ↓ TO ADVANCE · SCROLL TO BROWSE</span></div>`;
    const input = els.window.querySelector(".fw-search");
    input.value = mem.q;
    // Only the list is redrawn while typing, so the input (and the iOS keyboard) stays put.
    input.addEventListener("input", () => {
      mem.q = input.value;
      active = 0;
      renderList();
      clearTimeout(qTimer);
      qTimer = setTimeout(() => api.replaceUrl(filterQuery()), 350);
    });
    els.window.querySelector("#fw-prev").onclick = () => move(-1);
    els.window.querySelector("#fw-next").onclick = () => move(1);
    const list = filtered();
    const focusIndex = state && state.focus ? list.findIndex((a) => a.slug === state.focus) : -1;
    if (focusIndex >= 0) active = focusIndex;
    renderList();
    const scroller = els.window.querySelector(".fw-scroller");
    // The record a visitor opens becomes the selection they return to.
    scroller.addEventListener("click", (e) => {
      const row = e.target.closest(".fw-record");
      if (row) active = Number(row.dataset.row);
    });
    // Back/Forward carry the position in history; × CLOSE from a record reuses the last one seen.
    const scroll = state && typeof state.fwScroll === "number" ? state.fwScroll : focusIndex >= 0 ? mem.scroll : null;
    if (typeof scroll === "number") scroller.scrollTop = scroll;
    if (focusIndex >= 0) reveal(focusIndex);
  }
  function renderList() {
    const list = filtered();
    active = Math.max(0, Math.min(active, list.length - 1));
    const scroller = els.window.querySelector(".fw-scroller");
    scroller.innerHTML =
      list
        .map((a, i) => {
          const proj = projectFor(a);
          return `<article class="fw-record ${i === active ? "is-current" : ""}" data-row="${i}"><span class="fw-number">${numberOf(a)}</span>${img(a) ? `<img class="fw-thumb" src="${esc(img(a))}" alt="" loading="lazy">` : `<span class="fw-thumb-placeholder" aria-hidden="true">✎</span>`}<div><a class="fw-name" href="${esc(href(a))}" data-slug="${esc(a.slug)}">${esc(a.title)}</a><div class="fw-meta">${proj ? "↗ " : ""}${esc(a.project)} / ${esc(a.type)}${a.isDraft ? " / LOCAL DRAFT" : ""}</div></div></article>`;
        })
        .join("") || '<div class="fw-empty">No matching records. Try another classification.</div>';
    els.window.querySelector("#fw-listcount").textContent = `${list.length} RECORDS / ${mem.project || "ALL PROJECTS"}`;
    renderNav();
    updateSteps();
    setMessage("SELECT A RECORD TO OPEN →");
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
  function move(n) {
    const nodes = [...els.window.querySelectorAll(".fw-record")];
    if (!nodes.length) return;
    active = Math.max(0, Math.min(nodes.length - 1, active + n));
    nodes.forEach((el, i) => el.classList.toggle("is-current", i === active));
    reveal(active);
    setMessage(`RECORD ${pad(active + 1, 2)} / ${pad(nodes.length, 2)}`);
    updateSteps();
  }
  function updateSteps() {
    const list = current.kind === "detail" ? stepList() : filtered();
    const i = current.kind === "detail" ? list.findIndex((a) => a.slug === current.record.slug) : active;
    const prev = els.window.querySelector("#fw-prev"), next = els.window.querySelector("#fw-next");
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i < 0 || i >= list.length - 1;
  }

  /* ---------- Record ---------- */
  // Step through the list the visitor came from; if the record is outside it, step through everything.
  const stepList = () => {
    const list = filtered();
    return list.some((a) => a.slug === current.record.slug) ? list : entries();
  };
  function step(n) {
    const list = stepList();
    const i = list.findIndex((a) => a.slug === current.record.slug) + n;
    if (i >= 0 && i < list.length) api.navigate(href(list[i]), { replace: true });
  }
  function renderDetail() {
    const a = current.record;
    const proj = projectFor(a);
    const relation = proj
      ? `<a class="fw-relation-link" href="project-${encodeURIComponent(proj.slug)}.html">P—${esc(proj.id)} / ${esc(proj.name)} ↗</a>`
      : `<span>${esc(a.project)}</span><span class="fw-muted"> / no project relationship established</span>`;
    els.window.innerHTML = `<div class="fw-toolbar"><span class="fw-toolbar-count fw-muted"></span><button type="button" class="fw-step" id="fw-prev" aria-label="Previous record">↑</button><button type="button" class="fw-step" id="fw-next" aria-label="Next record">↓</button></div><article class="fw-detail" tabindex="0" aria-label="${esc(a.title)}"><div class="fw-label">${numberOf(a)} / ${esc(a.type)} / ${esc(a.status || "LOCAL DRAFT")}</div><h2>${esc(a.title)}</h2><div class="fw-relation"><span class="fw-label">CONNECTED PROJECT</span><div>${relation}</div></div>${img(a) ? `<img src="${esc(img(a))}" alt="${esc(a.title)}" />` : ""}<p>${esc(a.text || "")}</p>${a.note ? `<p class="fw-note">${esc(a.note)}</p>` : ""}<div class="fw-tags"><span>${esc(a.type)}</span><span>${esc(a.project)}</span><span>${esc(a.status || "LOCAL DRAFT")}</span></div><dl class="fw-facts"><div><dt>CAPTURE DATE</dt><dd>${a.isDraft ? "Saved in this browser" : "Not established"}</dd></div><div><dt>SOURCE</dt><dd>${esc(a.source || "This browser only")}</dd></div></dl></article>`;
    const list = stepList();
    els.window.querySelector(".fw-toolbar-count").textContent = `${pad(list.findIndex((x) => x.slug === a.slug) + 1, 2)} / ${pad(list.length, 2)}`;
    els.window.querySelector("#fw-prev").onclick = () => step(-1);
    els.window.querySelector("#fw-next").onclick = () => step(1);
    updateSteps();
    renderNav();
    setMessage(a.isDraft ? "LOCAL DRAFT / NOT PUBLISHED" : "ARCHIVE RECORD / " + (a.status || "REFERENCE"));
  }

  /* ---------- Local note (this browser only) ---------- */
  function renderNote() {
    els.window.innerHTML = `<div class="fw-detail"><div class="fw-label">NEW FIELD NOTE / THIS DEVICE ONLY</div><h2>Record an observation.</h2><form class="fw-draft" id="fw-form"><label for="fw-title-input">TITLE</label><input id="fw-title-input" required maxlength="100" placeholder="What caught your attention?"><label for="fw-project-input">CONNECTED PROJECT</label><select id="fw-project-input"><option>Unassigned reference</option>${data.projects.map((p) => `<option>${esc(p.name)}</option>`).join("")}</select><label for="fw-note-input">THE NOTE</label><textarea id="fw-note-input" required maxlength="2000" placeholder="Describe what you saw, why it matters, or what was decided."></textarea><button type="submit" class="fw-button">SAVE LOCAL DRAFT ↗</button></form><p class="fw-note" style="margin-top:18px">Drafts are kept only in this browser's local storage. Nothing is uploaded, shared, or published to Freeman. Production publishing will require an authenticated workflow.</p></div>`;
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
      });
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
      } catch (err) {
        drafts.shift();
        setMessage("BROWSER STORAGE UNAVAILABLE / NOTE NOT SAVED");
        return;
      }
      mem.q = "";
      mem.category = "All records";
      mem.project = "";
      api.navigate("fieldwork.html", { replace: true, focus: "draft-0" });
    };
    renderNav();
    setMessage("DRAFT ONLY / NOT PUBLISHED");
  }

  function show(route, state) {
    current = resolve(route);
    if (current.kind === "index") readFilters(route.params);
    // A record reached from outside the active list resets the list context.
    if (current.kind === "detail" && !current.record.isDraft && !filtered().some((a) => a.slug === current.record.slug)) {
      mem.category = "All records";
      mem.project = "";
      mem.q = "";
    }
    updateChrome();
    if (current.kind === "detail") renderDetail();
    else if (current.kind === "note") renderNote();
    else renderIndex(state);
  }

  return {
    mount(root, route, state, routerApi) {
      api = routerApi;
      host = root;
      // Entering Fieldwork from another section starts from the URL, not stale memory.
      mem.category = "All records";
      mem.project = "";
      mem.q = "";
      mem.scroll = null;
      active = 0;
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
      const a = filtered()[active];
      return { fwScroll: scroller.scrollTop, fwActive: active, focus: a ? a.slug : undefined };
    },
    key(e) {
      if (current.kind === "index" && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        move(e.key === "ArrowDown" ? 1 : -1);
        return true;
      }
      if (current.kind === "index" && e.key === "Enter" && e.target.classList && e.target.classList.contains("fw-scroller")) {
        const a = filtered()[active];
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
      clearTimeout(qTimer);
      host = null;
      els = {};
    },
  };
})();
