"use strict";
/*
 * Fieldwork — a working notebook. Mounted by app.js inside the same interior shell as the other
 * sections (section line top left, × CLOSE top right). Functionality recovered from the original
 * notebook (commit 4628667): categories, project filters, search, records with photographs and full
 * detail, stepping through the list a record was opened from, and local field-note drafts.
 *   index   → filters beside a fixed-screen list of observations, paged — never scrolled
 *   record  → the record's photograph, observation, note, connected project, date and source;
 *             ↑ ↓ (or ← →) step through the list it came from, each step a history entry
 *   note    → fieldwork.html?note=new: a draft kept in this browser only, with its real save time
 * Filters live in the URL (?category=&project=&q=); returning to the index restores the page and
 * the selected record.
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
  const ALL = "All records";
  const categories = [ALL, "Field", "Observation", "Material", "Process", "Artifact"];
  const connected = [...new Set(data.archive.filter((a) => a.link).map((a) => a.project))];
  const DRAFT_KEY = "freeman-fieldwork-local-drafts";

  const mem = { category: ALL, project: "", q: "", page: 0 };
  let api = null, host = null, els = {}, current = { kind: "index" }, active = -1, page = 0, perPage = 6, qTimer = null;

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
    (mem.category === ALL || a.type === mem.category) &&
    (!mem.project || a.project === mem.project) &&
    (!mem.q || (a.title + " " + a.type + " " + a.project + " " + a.text).toLowerCase().includes(mem.q.toLowerCase()));
  const filtered = () => entries().filter(matches);
  const filterQuery = () => {
    const p = new URLSearchParams();
    if (mem.category !== ALL) p.set("category", mem.category);
    if (mem.project) p.set("project", mem.project);
    if (mem.q) p.set("q", mem.q);
    const s = p.toString();
    return "fieldwork.html" + (s ? "?" + s : "");
  };
  function readFilters(params) {
    const c = params.get("category"), p = params.get("project");
    mem.category = categories.includes(c) ? c : ALL;
    mem.project = connected.includes(p) ? p : "";
    mem.q = (params.get("q") || "").slice(0, 120);
  }
  // Only a genuine timestamp carried by the record itself; never a placeholder.
  function stamp(a) {
    const raw = a.capturedAt || a.date || a.savedAt;
    const d = raw ? new Date(raw) : null;
    if (!d || isNaN(d)) return null;
    const ymd = `${d.getFullYear()}.${pad(d.getMonth() + 1, 2)}.${pad(d.getDate(), 2)}`;
    const hasTime = typeof raw === "number" || /T\d|\d:\d/.test(String(raw));
    return { iso: d.toISOString(), text: hasTime ? `${ymd} ${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}` : ymd };
  }
  // Plain context: the record's type and, where there is one, its project. No archive jargon.
  const context = (a) => [a.type, projectFor(a) ? projectFor(a).name : a.project === "Illustrative study" ? "Illustrative study" : ""].filter(Boolean);
  const firstSentence = (s) => {
    s = String(s || "").trim();
    const m = s.match(/^.+?[.!?](?=\s|$)/);
    return m ? m[0] : s;
  };

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

  /* ---------- Frame: the shared interior shell, filters beside the working area ---------- */
  function frame() {
    host.innerHTML = `<header class="panel-head"><h1 class="sr-only">Fieldwork<span class="fw-tail"></span></h1>${window.FreemanClose ? window.FreemanClose() : ""}</header><section class="viewport fw-view" aria-label="Fieldwork"><div class="nb"><aside class="nb-side"><nav class="nb-cats" aria-label="Record categories"></nav><nav class="nb-projects" aria-label="Projects"></nav><a class="nb-new" href="fieldwork.html?note=new">+ New field note</a></aside><div class="nb-main" id="fw-window"></div></div></section><footer class="sheet-controls"><span class="sr-only" id="fw-message" aria-live="polite"></span><nav aria-label="Fieldwork pages" hidden><button id="fw-pp" class="phrase" type="button">PREV</button><span class="count" aria-live="polite"></span><button id="fw-np" class="phrase" type="button">NEXT</button></nav></footer>`;
    els = {
      head: host.querySelector(".panel-head"),
      window: host.querySelector("#fw-window"),
      cats: host.querySelector(".nb-cats"),
      projects: host.querySelector(".nb-projects"),
      message: host.querySelector("#fw-message"),
      tail: host.querySelector(".fw-tail"),
      pager: host.querySelector(".sheet-controls nav"),
    };
    els.cats.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      mem.category = b.dataset.cat;
      filtersChanged();
    });
    els.projects.addEventListener("click", (e) => {
      const b = e.target.closest("[data-project]");
      if (!b) return;
      mem.project = mem.project === b.dataset.project ? "" : b.dataset.project;
      filtersChanged();
    });
    host.querySelector("#fw-pp").onclick = () => turn(-1);
    host.querySelector("#fw-np").onclick = () => turn(1);
  }
  const setMessage = (v) => { if (els.message) els.message.textContent = v; };

  /* Section line and × CLOSE are shared with the rest of the site. */
  function updateChrome() {
    const focus = current.record ? current.record.slug : undefined;
    const parent = current.kind === "index" ? null : { href: filterQuery(), focus };
    const old = els.head.querySelector(".site-nav");
    if (old) old.remove();
    // The section line sits before × CLOSE, so CLOSE stays in the upper right.
    if (window.FreemanNav) els.head.querySelector("h1").insertAdjacentHTML("afterend", window.FreemanNav("fieldwork", parent));
    els.tail.textContent =
      current.kind === "detail" ? " / " + numberOf(current.record) : current.kind === "note" ? " / New note" : "";
  }

  function renderNav() {
    const all = entries();
    els.cats.innerHTML = categories
      .map((c) => {
        const on = c === mem.category;
        const n = all.filter((a) => c === ALL || a.type === c).length;
        return `<button type="button" data-cat="${esc(c)}" class="${on ? "on" : ""}" aria-pressed="${on}"><span>${esc(c === ALL ? "All" : c)}</span><span class="nb-n">${n}</span></button>`;
      })
      .join("");
    els.projects.innerHTML = connected
      .map((p) => `<button type="button" data-project="${esc(p)}" class="${mem.project === p ? "on" : ""}" aria-pressed="${mem.project === p}">↗ ${esc(p)}</button>`)
      .join("");
  }

  function filtersChanged() {
    active = -1;
    page = 0;
    if (current.kind === "index") {
      renderNav();
      renderList();
      api.replaceUrl(filterQuery());
    } else {
      api.navigate(filterQuery());
    }
  }

  /* ---------- Index: select a note, read it beside the list; paged to fit the screen ----------
     Fine pointers preview on hover and open on click. Touch: the first tap selects (the panel shows
     the evidence), a second tap — or "Open record" — opens it. */
  const touch = () => matchMedia("(hover: none)").matches;
  const DRAFT_NOTE = "Draft · this browser only, not published";
  function renderIndex(state) {
    els.window.innerHTML = `<div class="nb-tools"><input class="nb-search" type="search" enterkeyhint="search" autocomplete="off" placeholder="Search notes" aria-label="Search field notes"><a class="nb-new nb-new-inline" href="fieldwork.html?note=new" aria-label="New field note">+ Note</a></div><div class="nb-desk"><section class="nb-preview" aria-live="polite" aria-label="Selected note"></section><ol class="nb-list" aria-label="Field notes"></ol></div>`;
    const input = els.window.querySelector(".nb-search");
    input.value = mem.q;
    // Only the list is redrawn while typing, so the input (and the iOS keyboard) stays put.
    input.addEventListener("input", () => {
      mem.q = input.value;
      active = -1;
      page = 0;
      renderList();
      clearTimeout(qTimer);
      qTimer = setTimeout(() => api.replaceUrl(filterQuery()), 350);
    });
    const ol = els.window.querySelector(".nb-list");
    ol.addEventListener("click", (e) => {
      const row = e.target.closest(".nb-item");
      if (!row) return;
      const i = Number(row.dataset.row);
      if (touch() && i !== active) {
        e.preventDefault(); // first tap selects; the next tap opens
        select(i);
        return;
      }
      active = i;
    });
    ol.addEventListener("mouseover", (e) => {
      const row = e.target.closest(".nb-item");
      if (row && !touch()) select(Number(row.dataset.row));
    });
    ol.addEventListener("focusin", (e) => {
      const row = e.target.closest(".nb-item");
      if (row) select(Number(row.dataset.row));
    });
    const list = filtered();
    const focusIndex = state && state.focus ? list.findIndex((a) => a.slug === state.focus) : -1;
    perPage = fit();
    active = focusIndex;
    page = focusIndex >= 0 ? Math.floor(focusIndex / perPage) : typeof (state && state.fwPage) === "number" ? state.fwPage : mem.page;
    renderNav();
    renderList();
  }
  // How many note rows fit the list area without scrolling: measured from a real row.
  function fit() {
    const ol = els.window.querySelector(".nb-list");
    if (!ol) return perPage;
    perPage = 1;
    renderList();
    const row = ol.querySelector(".nb-item");
    const h = row ? row.getBoundingClientRect().height : 48;
    return Math.max(1, Math.floor((ol.clientHeight + 0.5) / h));
  }
  function renderList() {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / perPage));
    page = Math.max(0, Math.min(pages - 1, page || 0));
    mem.page = page;
    const first = page * perPage;
    // The selection always sits on the visible page.
    if (list.length && (active < first || active >= first + perPage)) active = first;
    if (!list.length) active = -1;
    const ol = els.window.querySelector(".nb-list");
    ol.innerHTML =
      list
        .slice(first, first + perPage)
        .map((a, n) => {
          const i = first + n;
          const meta = a.isDraft ? "Draft · this browser" : context(a).join(" · ");
          return `<li class="nb-item${i === active ? " is-current" : ""}${a.isDraft ? " is-draft" : ""}" data-row="${i}"><a class="nb-link" href="${esc(href(a))}" data-slug="${esc(a.slug)}"><span class="nb-no">${numberOf(a)}</span><span class="nb-title">${esc(a.title)}</span><span class="nb-meta">${esc(meta)}</span></a></li>`;
        })
        .join("") || `<li class="nb-empty">No notes match.</li>`;
    els.pager.hidden = pages < 2;
    els.pager.querySelector(".count").textContent = `${pad(page + 1, 2)} / ${pad(pages, 2)}`;
    els.pager.querySelector("#fw-pp").disabled = page === 0;
    els.pager.querySelector("#fw-np").disabled = page >= pages - 1;
    renderPreview();
  }
  function select(i) {
    if (i === active) return;
    active = i;
    els.window.querySelectorAll(".nb-item").forEach((r) => r.classList.toggle("is-current", Number(r.dataset.row) === i));
    renderPreview();
  }
  // The selected note: its photograph as evidence, its own observation, its project, a genuine date.
  function renderPreview() {
    const box = els.window.querySelector(".nb-preview");
    if (!box) return;
    const a = filtered()[active];
    if (!a) {
      box.innerHTML = "";
      return;
    }
    const t = stamp(a);
    const proj = projectFor(a);
    const meta = [numberOf(a), a.type, ...(proj ? [proj.name, proj.location] : a.project === "Illustrative study" ? ["Illustrative study"] : [])];
    box.innerHTML = `${img(a) ? `<a class="nb-pv-photo" href="${esc(href(a))}" tabindex="-1" aria-hidden="true"><img src="${esc(img(a))}" alt=""></a>` : ""}<div class="nb-pv-text"><span class="nb-meta">${meta.map(esc).join(" · ")}${t ? ` · <time datetime="${esc(t.iso)}">${esc(t.text)}</time>` : ""}</span><a class="nb-pv-title" href="${esc(href(a))}">${esc(a.title)}</a><p class="nb-pv-obs">${esc(a.text || "")}</p>${a.isDraft ? `<p class="nb-draft">${DRAFT_NOTE}</p>` : ""}<a class="nb-open" href="${esc(href(a))}">Open record ↗</a></div>`;
  }
  function turn(n) {
    const pages = Math.max(1, Math.ceil(filtered().length / perPage));
    const next = Math.max(0, Math.min(pages - 1, page + n));
    if (next === page) return;
    page = next;
    active = -1;
    renderList();
  }
  // Keyboard ↑ ↓ move the selection through the notes, turning pages as needed; Enter opens.
  function move(n) {
    const list = filtered();
    if (!list.length) return;
    active = Math.max(0, Math.min(list.length - 1, active < 0 ? page * perPage : active + n));
    page = Math.floor(active / perPage);
    renderList();
    const el = els.window.querySelector(`.nb-item[data-row="${active}"] .nb-link`);
    if (el) el.focus({ preventScroll: true });
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
    // Each record visited with ↑ ↓ is its own history step, so CLOSE and browser Back retrace them.
    if (i >= 0 && i < list.length) api.navigate(href(list[i]));
  }
  function renderDetail() {
    els.pager.hidden = true;
    const a = current.record;
    const proj = projectFor(a);
    const t = stamp(a);
    const list = stepList();
    const i = list.findIndex((x) => x.slug === a.slug);
    const facts = [
      ["Project", proj ? `<a class="fw-relation-link" href="project-${encodeURIComponent(proj.slug)}.html">${esc(proj.name)} ↗</a>` : esc(a.project)],
      ["Captured", t ? esc(t.text) : a.isDraft ? "Saved in this browser" : "Not established"],
      ["Source", esc(a.source || "This browser only")],
      ...(a.status && !a.isDraft ? [["Status", esc(a.status)]] : []),
    ];
    els.window.innerHTML = `<div class="nb-record"><div class="nb-record-bar"><span class="nb-meta">${[numberOf(a), ...context(a)].map(esc).join(" · ")}</span><span class="nb-steps"><span class="nb-meta">${pad(i + 1, 2)} / ${pad(list.length, 2)}</span><button type="button" class="nb-step" id="fw-prev" aria-label="Previous note">↑</button><button type="button" class="nb-step" id="fw-next" aria-label="Next note">↓</button></span></div><article class="nb-detail" tabindex="0" aria-label="${esc(a.title)}"><h2>${esc(a.title)}</h2>${img(a) ? `<img src="${esc(img(a))}" alt="${esc(a.title)}">` : ""}${a.isDraft ? `<p class="nb-draft">${DRAFT_NOTE}</p>` : ""}<p>${esc(a.text || "")}</p>${a.note ? `<p class="nb-note">${esc(a.note)}</p>` : ""}<dl class="nb-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></article></div>`;
    const prev = els.window.querySelector("#fw-prev"), next = els.window.querySelector("#fw-next");
    prev.onclick = () => step(-1);
    next.onclick = () => step(1);
    prev.disabled = i <= 0;
    next.disabled = i < 0 || i >= list.length - 1;
  }

  /* ---------- Local note (this browser only; reached at fieldwork.html?note=new) ---------- */
  function renderNote() {
    els.pager.hidden = true;
    els.window.innerHTML = `<div class="nb-record"><div class="nb-detail"><h2>New field note</h2><form class="fw-draft" id="fw-form"><label for="fw-title-input">Title</label><input id="fw-title-input" required maxlength="100" placeholder="What caught your attention?"><label for="fw-project-input">Project</label><select id="fw-project-input"><option>Unassigned</option>${data.projects.map((p) => `<option>${esc(p.name)}</option>`).join("")}</select><label for="fw-type-input">Kind</label><select id="fw-type-input">${categories.slice(1).map((c) => `<option${c === "Field" ? " selected" : ""}>${esc(c)}</option>`).join("")}</select><label for="fw-note-input">Note</label><textarea id="fw-note-input" required maxlength="2000" placeholder="What you saw, why it matters, or what was decided."></textarea><button type="submit" class="fw-button">Save note</button></form><p class="nb-draft">Saved as a draft in this browser only. It is not published or shared.</p></div></div>`;
    els.window.querySelector("#fw-form").onsubmit = (e) => {
      e.preventDefault();
      const title = els.window.querySelector("#fw-title-input").value.trim(),
        note = els.window.querySelector("#fw-note-input").value.trim();
      if (!title || !note) return;
      drafts.unshift({
        title,
        text: note,
        project: els.window.querySelector("#fw-project-input").value,
        type: els.window.querySelector("#fw-type-input").value,
        status: "LOCAL DRAFT",
        source: "Saved in this browser",
        savedAt: new Date().toISOString(), // the real moment it was saved
      });
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
      } catch (err) {
        drafts.shift();
        setMessage("Browser storage unavailable. Note not saved.");
        return;
      }
      mem.category = ALL;
      mem.project = "";
      mem.q = "";
      api.navigate("fieldwork.html", { replace: true, focus: "draft-0" });
    };
  }

  function show(route, state) {
    current = resolve(route);
    if (current.kind === "index") readFilters(route.params);
    // A record reached from outside the active list resets the list context.
    if (current.kind === "detail" && !current.record.isDraft && !filtered().some((a) => a.slug === current.record.slug)) {
      mem.category = ALL;
      mem.project = "";
      mem.q = "";
    }
    updateChrome();
    renderNav();
    host.querySelector(".nb").dataset.view = current.kind;
    if (current.kind === "detail") renderDetail();
    else if (current.kind === "note") renderNote();
    else renderIndex(state);
  }

  return {
    mount(root, route, state, routerApi) {
      api = routerApi;
      host = root;
      // Entering Fieldwork from another section starts from the URL, not stale memory.
      mem.category = ALL;
      mem.project = "";
      mem.q = "";
      mem.page = 0;
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
      if (current.kind !== "index") return {};
      const a = filtered()[active];
      return { fwPage: page, fwActive: active, focus: a ? a.slug : undefined };
    },
    resize() {
      // Re-page for the new size, keeping the selected note (or the first visible one) in view.
      if (current.kind !== "index") return;
      const keep = active >= 0 ? active : page * perPage;
      perPage = fit();
      page = Math.floor(keep / perPage);
      renderList();
    },
    key(e) {
      if (current.kind === "index" && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        move(e.key === "ArrowDown" ? 1 : -1);
        return true;
      }
      if (current.kind === "index" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        turn(e.key === "ArrowRight" ? 1 : -1);
        return true;
      }
      if (current.kind === "detail" && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        step(e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1);
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
