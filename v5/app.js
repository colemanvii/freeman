"use strict";
/*
 * Freeman GC — V5 application shell and navigation.
 *
 * Every route is a real HTML file (deep links, refreshes and hosting need no rewrites).
 * Once loaded, links between routes are handled in place with the History API, so the
 * palette, the Fieldwork index position and the opening state are never reset by a visit.
 *
 * Navigation rules
 *  - index.html is the entrance. It stays in history like any other page; the eagle plays
 *    only on the first load of a tab session.
 *  - Every interior page carries the same section line at top-left:
 *      COMPANY / PROJECTS / FIELDWORK / CONTACT  (current section in orange).
 *    "FREEMAN GC" is the brand, never a navigation link.
 *    The four sections link to each other directly; none routes through another.
 *  - ← BACK (bottom-left on every interior page; Escape on detail pages) is real history:
 *    it returns to wherever the visitor actually came from, exactly like browser Back or a
 *    swipe-back. Each entry stores its depth within this visit; with no earlier same-site
 *    page (a direct arrival), BACK falls back to the entrance.
 *  - Leaving a page saves its view state (selected project, Fieldwork scroll/record) into
 *    that page's own history entry, so returning restores it. Filters and sheets live in the URL.
 */
(() => {
  const { projects, archive } = window.RECORDS;
  const root = document.querySelector("#main");
  const PALETTES = ["chalk", "sand", "umber"];
  const PAPER = { chalk: "#f4f4f0", sand: "#d9c5a7", umber: "#51453b" };
  const DESTINATIONS = [
    ["COMPANY", "company.html", ""],
    ["PROJECTS", "projects.html", ""],
    ["FIELDWORK", "fieldwork.html", ""],
    ["CONTACT", "contact.html", ""],
  ];
  const TITLES = {
    entrance: "Entry",
    company: "Company",
    projects: "Work",
    fieldwork: "Fieldwork",
    contact: "Contact",
    notfound: "Record not found",
  };
  const PHONE = "(max-width:760px)";

  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const attrs = (o = {}) =>
    Object.entries(o)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => ` ${k}="${esc(v)}"`)
      .join("");
  const link = (text, url, cl = "", extra) =>
    `<a class="${cl}" href="${esc(url)}"${attrs(extra)}>${esc(text)}</a>`;
  const block = (tag, text, cl = "") => `<${tag} class="${cl}">${esc(text)}</${tag}>`;
  const data = (k, v) => `<div class="data"><span>${esc(k)}</span><span>${esc(v)}</span></div>`;
  const pad = (n, l = 2) => String(n).padStart(l, "0");

  /* Storage is a convenience only (it can be missing or throw in private modes). */
  const ss = {
    get(k) {
      try { return sessionStorage.getItem(k); } catch (e) { return null; }
    },
    set(k, v) {
      try { sessionStorage.setItem(k, v); } catch (e) {}
    },
  };

  /* History wrapper. Safari throws when history is written too often; never let it break the page. */
  const hist = {
    get state() {
      try { return history.state && typeof history.state === "object" ? history.state : {}; } catch (e) { return {}; }
    },
    write(method, state, url) {
      try { history[method](state, "", url); return true; } catch (e) { return false; }
    },
  };
  const dirOf = (path) => path.replace(/[^/]*$/, "");

  /* ---------- Routes ---------- */
  function parse(href) {
    const url = new URL(href, location.href);
    const last = url.pathname.slice(url.pathname.lastIndexOf("/") + 1);
    let file = "";
    try { file = decodeURIComponent(last); } catch (e) { file = last; }
    file = file.replace(/\.html$/, "") || "index";
    const r = { file, url, params: url.searchParams, kind: "notfound" };
    if (file === "index") r.kind = "entrance";
    else if (["company", "projects", "contact", "fieldwork"].includes(file)) r.kind = file;
    else if (file.startsWith("project-")) {
      r.item = projects.find((p) => "project-" + p.slug === file);
      if (r.item) r.kind = "project";
    } else if (file.startsWith("fieldwork-")) {
      r.record = archive.find((a) => "fieldwork-" + a.slug === file);
      if (r.record) r.kind = "fieldwork";
    }
    return r;
  }
  // Two URLs show the same view when only sheet/filter parameters differ.
  const viewKey = (r) => r.file + "|" + (r.params.get("note") || "") + "|" + (r.params.get("draft") || "");
  function isAppUrl(url) {
    if (url.origin !== location.origin) return false;
    if (dirOf(url.pathname) !== dirOf(location.pathname)) return false;
    return parse(url.href).kind !== "notfound";
  }

  /* ---------- Palette (entry always starts in off-white; choice is carried in history state) ---------- */
  let palette = "chalk";
  function applyPalette(id) {
    palette = PALETTES.includes(id) ? id : "chalk";
    document.documentElement.dataset.palette = palette;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", PAPER[palette]);
  }
  function choosePalette(id) {
    applyPalette(id);
    ss.set("freeman-palette", palette);
    hist.write("replaceState", { ...hist.state, fgc: 1, palette }, location.href);
  }

  /* ---------- Hover words ---------- */
  function words(scope) {
    const walk = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        return n.parentElement.closest("script,style,textarea,select,option,button,.hover-word,.phrase,.center a,.brand-id") ||
          !/[A-Za-z0-9]/.test(n.nodeValue)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach((n) => {
      const f = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach((t) => {
        if (!t) return;
        if (!/\S/.test(t)) return f.append(t);
        const s = document.createElement("span");
        s.className = "hover-word";
        s.textContent = t;
        f.append(s);
      });
      n.replaceWith(f);
    });
  }

  /* ---------- Section line (shared with fieldwork-reader.js) ---------- */
  // `current` is the section file ("company", "projects", …); `parent` overrides that section's
  // link on a detail page so it returns with selection/filters intact.
  function siteNav(current, parent) {
    const items = DESTINATIONS.map(([t, u, c]) => {
      const here = u === current + ".html";
      const href = here && parent ? parent.href : u;
      const cl = ["site-link", "phrase", c, here ? "is-current" : ""].filter(Boolean).join(" ");
      return link(t, href, cl, { "aria-current": here && !parent ? "page" : null, "data-focus": here && parent ? parent.focus : null });
    });
    return `<nav class="site-nav" aria-label="Sections">${items.join('<span class="sep" aria-hidden="true">/</span>')}</nav>`;
  }
  window.FreemanNav = siteNav;

  /* ---------- ← BACK: real history, entrance as the fallback ---------- */
  const backMarkup = (cl = "section-link back-link phrase") =>
    `<a class="${cl}" href="index.html" data-back="1" aria-label="Back to the previous page">← BACK</a>`;
  function goBack() {
    if ((hist.state.depth || 0) > 0) history.back();
    else navigate("index.html");
  }
  window.FreemanBack = backMarkup;

  /* ---------- View state ---------- */
  let view = null; // { kind, detail, key(e), resize(), save(), destroy() }
  let pageIndex = 0,
    pageCount = 1,
    renderPage = () => {};

  /* ---------- Panel chrome (Company / Projects / Contact) ---------- */
  function chrome({ title, section, parent }) {
    const backHtml = backMarkup();
    root.innerHTML = `<header class="panel-head"><h1 class="sr-only">${esc(title)}</h1>${siteNav(section, parent)}</header><section class="viewport" aria-label="Current sheet"></section><footer class="sheet-controls">${backHtml}<nav aria-label="Sheet navigation"><button id="previous" class="phrase" type="button">PREV</button><span class="count" aria-live="polite"></span><button id="next" class="phrase" type="button">NEXT</button></nav></footer>`;
    root.querySelector("#previous").onclick = () => go(pageIndex - 1);
    root.querySelector("#next").onclick = () => go(pageIndex + 1);
  }
  function count() {
    pageIndex = Math.max(0, Math.min(pageCount - 1, pageIndex));
    root.querySelector(".count").textContent = `${pad(pageIndex + 1)} / ${pad(pageCount)}`;
    root.querySelector("#previous").disabled = pageIndex === 0;
    root.querySelector("#next").disabled = pageIndex === pageCount - 1;
    // A single sheet has nothing to page through.
    root.querySelector(".sheet-controls nav").hidden = pageCount < 2;
  }
  function go(i) {
    if (i < 0 || i >= pageCount) return;
    pageIndex = i;
    const u = new URL(location.href);
    if (i) u.searchParams.set("sheet", i);
    else u.searchParams.delete("sheet");
    hist.write("replaceState", { ...hist.state }, u.href);
    renderPage();
    count();
  }
  const sheetFromUrl = () => Math.max(0, Number(new URL(location.href).searchParams.get("sheet")) || 0);

  /* Paginate blocks into fixed sheets; nothing scrolls. `lead` pages come first (photo, register). */
  function reading(container, blocks, lead = []) {
    const pages = [...lead];
    const measure = document.createElement("article");
    measure.className = "reading";
    container.append(measure);
    let current = [];
    const fits = () => measure.scrollHeight <= measure.clientHeight;
    const flush = () => {
      if (current.length) {
        pages.push({ nodes: current });
        current = [];
        measure.replaceChildren();
      }
    };
    for (const markup of blocks) {
      const template = document.createElement("template");
      template.innerHTML = markup;
      const node = template.content.firstElementChild;
      measure.append(node.cloneNode(true));
      if (fits()) { current.push(markup); continue; }
      measure.lastElementChild.remove();
      flush();
      measure.append(node.cloneNode(true));
      if (fits()) { current.push(markup); continue; }
      measure.replaceChildren();
      const remaining = node.textContent.split(/\s+/);
      while (remaining.length) {
        let lo = 1, hi = remaining.length, best = 0;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2), test = node.cloneNode(false);
          test.textContent = remaining.slice(0, mid).join(" ");
          measure.replaceChildren(test);
          if (fits()) { best = mid; lo = mid + 1; } else hi = mid - 1;
        }
        const part = node.cloneNode(false);
        part.textContent = remaining.splice(0, best || 1).join(" ");
        current = [part.outerHTML];
        flush();
      }
    }
    flush();
    measure.remove();
    pageCount = pages.length || 1;
    return pages;
  }
  function photoMarkup(p) {
    return p.kind === "project"
      ? `<figure class="photo-sheet project-plate"><img src="${esc(p.src)}" alt="${esc(p.alt)}"><figcaption class="project-plate-caption"><div class="project-plate-name">${esc(p.title)}</div><div class="project-plate-meta"><span>P—${esc(p.id)} / ${esc(p.type)}</span><span>${esc(p.location)}</span></div></figcaption></figure>`
      : `<figure class="photo-sheet"><img src="${esc(p.src)}" alt="${esc(p.alt)}"><figcaption>${esc(p.caption)}</figcaption></figure>`;
  }
  function showPages(container, pages, extra = () => false) {
    renderPage = () => {
      const page = pages[pageIndex];
      if (extra(page)) return;
      if (page && page.photo) container.innerHTML = photoMarkup(page.photo);
      else container.innerHTML = '<article class="reading">' + ((page && page.nodes) || []).join("") + "</article>";
      words(container);
    };
    pageIndex = Math.min(pageIndex, pageCount - 1);
    renderPage();
    count();
  }

  /* ---------- COMPANY: the company, as an editorial reading page ---------- */
  function company() {
    const b = [
      block("p", "01 / COMPANY", "micro"),
      block("h1", "Constructing hospitality."),
      block("p", "We see construction as a service industry. The experience of building matters as much as the place we leave behind."),
      block("p", "Freeman General Contractors brings clients, architects, engineers and trades together around a shared project. Relationships are the foundation: respect, clear communication and care for the work."),
      block("p", "From restaurant renovations to retail, healthcare and residential construction, the work begins with understanding how a place will be used."),
      block("h2", "Services"),
      data("Design + build", "Early collaboration aligns design decisions and construction planning."),
      data("Construction management", "Oversight of schedule, costs, quality and team coordination."),
      data("Commercial", "Restaurants, retail, healthcare and convenience stores."),
      data("Residential", "High-end residential work, including La Cresta on Main in Blue Ridge."),
      block("h2", "People"),
      data("Gabe Freeman", "President"),
      data("Kendall Hawkins", "Vice President"),
      data("Bo Wright", "VP of Development & Construction"),
      block("p", "Roles as listed on Freeman’s public company page.", "micro"),
      block("h2", "Working together"),
      block("p", "Budget planning combines detailed estimating, expense monitoring and ongoing client communication. Project partners are coordinated through vetting, clear contracts and continuing conversation about quality and schedules."),
      link("BEGIN A CONVERSATION ↗", "contact.html", "text-link phrase"),
    ];
    chrome({ title: "Company / Freeman General Contractors", section: "company" });
    const vp = root.querySelector(".viewport");
    showPages(vp, reading(vp, b));
  }

  /* ---------- Projects ---------- */
  // Only verified values: Client and Architect from the project credits, and a date only from an
  // explicit, verified `date` field. The scraped "Complete: 2024" template credit is not used.
  const credit = (p, key) => ((p.credits || []).find(([k]) => k === key) || [])[1] || "";
  function projectsIndex(state) {
    chrome({ title: "Projects / Selected work", section: "projects" });
    const vp = root.querySelector(".viewport");
    const cell = (cls, value, label) =>
      value
        ? `<span class="${cls}"><span class="sr-only">${label} </span>${esc(value)}</span>`
        : `<span class="${cls} pi-empty"><span class="sr-only">${label} not yet verified</span><span aria-hidden="true">—</span></span>`;
    const rows = projects
      .map((p, i) => {
        const here = p.slug === state.focus;
        return `<li class="pi-row${here ? " is-current" : ""}"><a class="pi-link" href="project-${esc(p.slug)}.html" data-slug="${esc(p.slug)}"><span class="pi-no">${pad(i + 1, 3)}</span><span class="pi-name">${esc(p.name)}</span>${cell("pi-client", credit(p, "Client"), "Client")}${cell("pi-arch", credit(p, "Architect"), "Architect")}${cell("pi-date", p.date || "", "Date")}</a></li>`;
      })
      .join("");
    vp.innerHTML = `<div class="pi"><div class="pi-head" aria-hidden="true"><span>No.</span><span>Project</span><span>Client</span><span>Architect</span><span class="pi-head-date">Date</span></div><div class="pi-scroller"><ol class="pi-list" aria-label="Projects">${rows}</ol></div></div>`;
    const scroller = vp.querySelector(".pi-scroller");
    // The project a visitor opens is the selection they return to.
    scroller.addEventListener("click", (e) => {
      const row = e.target.closest(".pi-row");
      if (!row) return;
      scroller.querySelectorAll(".pi-row.is-current").forEach((r) => r.classList.remove("is-current"));
      row.classList.add("is-current");
    });
    if (typeof state.projScroll === "number") scroller.scrollTop = state.projScroll;
    const current = scroller.querySelector(".pi-row.is-current");
    if (current) {
      const top = current.offsetTop, bottom = top + current.offsetHeight;
      if (top < scroller.scrollTop) scroller.scrollTop = top;
      else if (bottom > scroller.scrollTop + scroller.clientHeight) scroller.scrollTop = bottom - scroller.clientHeight;
    }
    count();
  }
  function project(p) {
    const related = archive.filter((a) => a.link === p.slug);
    const b = [
      block("p", "P—" + p.id + " / " + p.type, "micro"),
      block("h1", p.name),
      block("p", p.location, "micro"),
      block("p", p.summary),
      ...(p.details ? [block("p", p.details)] : []),
      block("h2", "Project record"),
      ...p.credits
        .filter(([k, v]) => ["Client", "Photography", "Interior Design"].includes(k) && v !== "Interior Designer")
        .map(([k, v]) => data(k, v)),
      data("Source", "Freeman published portfolio"),
      ...related.map((a) =>
        link(
          `RELATED FIELDWORK / ${pad(archive.indexOf(a) + 1, 3)} ${a.title.toUpperCase()} ↗`,
          "fieldwork-" + a.slug + ".html",
          "text-link phrase",
        ),
      ),
    ];
    chrome({
      title: "Projects / " + p.name,
      section: "projects",
      parent: { href: "projects.html", focus: p.slug },
    });
    const vp = root.querySelector(".viewport");
    const pages = reading(vp, b, [
      { photo: { src: p.image, alt: p.name + " — Freeman portfolio photograph", kind: "project", title: p.name, id: p.id, type: p.type, location: p.location } },
    ]);
    showPages(vp, pages);
  }

  /* ---------- Contact / not found ---------- */
  const contactDraft = {
    value: "",
    read() {
      try { this.value = sessionStorage.getItem("freeman-contact-draft") || this.value; } catch (e) {}
      return this.value;
    },
    write(v) {
      this.value = v;
      try { sessionStorage.setItem("freeman-contact-draft", v); } catch (e) {}
    },
  };
  function contact() {
    chrome({ title: "Contact / Freeman General Contractors", section: "contact" });
    pageCount = 1;
    renderPage = () => {};
    const vp = root.querySelector(".viewport");
    vp.innerHTML = `<div class="contact-layout"><div class="contact-sheet"><h2 class="contact-label">CONTACT INFORMATION</h2><p class="subtle">For new work, partnerships or general inquiries.</p>${link("gabe@freemangc.com ↗", "mailto:gabe@freemangc.com", "phrase")}${link("706.263.3348 ↗", "tel:+17062633348", "phrase")}<p class="subtle">GABE FREEMAN<br>CARTERSVILLE, GEORGIA</p></div><form class="contact-inquiry" id="contact-inquiry" novalidate><label class="contact-label" for="contact-message">WRITE A MESSAGE</label><textarea id="contact-message" name="message" maxlength="4000" placeholder="Tell us about your project."></textarea><button type="submit">OPEN EMAIL ↗</button><p class="contact-disclaimer">Opens your email application. Nothing is sent from this website.</p></form></div>`;
    const form = vp.querySelector("#contact-inquiry");
    const field = form.elements.message;
    // The draft outlives re-renders (rotation, resize) and a return from the mail app.
    field.value = contactDraft.read();
    field.addEventListener("input", () => contactDraft.write(field.value));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = field.value.trim();
      contactDraft.write(field.value);
      const subject = encodeURIComponent("Freeman GC — New inquiry");
      const body = message ? "&body=" + encodeURIComponent(message) : "";
      window.location.href = "mailto:gabe@freemangc.com?subject=" + subject + body;
    });
    count();
  }
  function notFound() {
    chrome({ title: "Record not found", section: "" });
    const vp = root.querySelector(".viewport");
    showPages(vp, reading(vp, [block("h1", "Record not found."), link("RETURN TO COMPANY", "company.html", "text-link phrase")]));
  }

  /* ---------- Entrance ---------- */
  function paletteSelector() {
    const holder = document.createElement("div");
    holder.className = "palette-selector";
    holder.setAttribute("role", "group");
    holder.setAttribute("aria-label", "Website color palette");
    [["chalk", "OFF-WHITE"], ["sand", "SAND"], ["umber", "UMBER"]].forEach(([id, name]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "palette-chip palette-" + id;
      b.dataset.palette = id;
      b.setAttribute("aria-label", name + " palette");
      b.title = name;
      b.setAttribute("aria-pressed", String(id === palette));
      b.addEventListener("click", () => {
        choosePalette(id);
        holder.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.palette === id)));
      });
      holder.appendChild(b);
    });
    root.appendChild(holder);
  }
  function entrance() {
    const nav = (cl) => DESTINATIONS.map(([t, u, c]) => link(t, u, c, { "data-entry": "1" }));
    // FREEMAN GC is the brand, not a link: part of the centred group so brand and navigation centre together.
    const brand = '<span class="brand-id">FREEMAN GC</span>';
    root.innerHTML = `<nav class="center" aria-label="Main">${brand}${nav().join('<span class="sep">/</span>')}</nav><nav class="mobile-home-nav" aria-label="Main">${brand}${nav().join("")}</nav><div class="legal">FREEMAN GENERAL CONTRACTING<br>CARTERSVILLE, GEORGIA</div><div class="mark">BUILT FOR GENERATIONS™<br>EST. IN GEORGIA</div>`;
    words(root);
    paletteSelector();
  }
  /* The red eagle plays once when a visitor arrives through the entrance. Never on Back/Forward. */
  function opening() {
    let navType = "navigate";
    try {
      const entry = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      if (entry && entry.type) navType = entry.type;
    } catch (e) {}
    if (navType === "back_forward" || hist.state.introSeen || ss.get("fgc-intro-seen")) return;
    ss.set("fgc-intro-seen", "1");
    hist.write("replaceState", { ...hist.state, introSeen: 1 }, location.href);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const splash = document.createElement("div");
    splash.className = "freeman-intro";
    splash.setAttribute("aria-hidden", "true");
    splash.innerHTML = '<img src="intro-eagle.svg" alt="">';
    document.querySelector("#site").appendChild(splash);
    splash.addEventListener("animationend", () => splash.remove(), { once: true });
    setTimeout(() => splash.remove(), 2300);
  }

  /* ---------- Fieldwork (living index lives in fieldwork-reader.js) ---------- */
  const fieldworkApi = {
    navigate: (href, opts) => navigate(href, opts),
    replaceUrl: (href) => hist.write("replaceState", { ...hist.state }, new URL(href, location.href).href),
  };

  /* ---------- Router ---------- */
  function render(route, state = {}, { nav = false } = {}) {
    const fw = window.FreemanFieldwork;
    const stayInFieldwork = view && view.kind === "fieldwork" && route.kind === "fieldwork" && fw;
    if (view && view.destroy && !stayInFieldwork) view.destroy();
    document.querySelectorAll(".freeman-intro").forEach((s) => route.kind !== "entrance" && s.remove());
    document.body.dataset.route = route.kind;
    pageIndex = sheetFromUrl();
    pageCount = 1;
    renderPage = () => {};

    if (route.kind === "fieldwork" && fw) {
      if (stayInFieldwork) fw.update(route, state);
      else fw.mount(root, route, state, fieldworkApi);
      view = { kind: "fieldwork", detail: () => fw.isDetail(), key: (e) => fw.key(e), save: () => fw.save(), destroy: () => fw.destroy() };
      document.title = fw.title() + " — Freeman GC";
    } else {
      view = {
        kind: route.kind,
        detail: () => route.kind === "project",
        save: () => {
          if (route.kind !== "projects") return {};
          const scroller = root.querySelector(".pi-scroller");
          return { focus: currentFocus(), projScroll: scroller ? scroller.scrollTop : 0 };
        },
        resize: () => render(parse(location.href), { ...hist.state, focus: currentFocus() }),
      };
      if (route.kind === "entrance") entrance();
      else if (route.kind === "company") company();
      else if (route.kind === "projects") projectsIndex(state);
      else if (route.kind === "project") project(route.item);
      else if (route.kind === "contact") contact();
      else notFound();
      document.title = (route.item ? route.item.name : TITLES[route.kind]) + " — Freeman GC";
    }
    if (nav) settleFocus(state);
  }
  function currentFocus() {
    const a = root.querySelector(".index-row.active[data-slug], .pi-row.is-current [data-slug]");
    return a ? a.dataset.slug : undefined;
  }
  /* After an in-place navigation, put keyboard focus where the visitor expects it. */
  function settleFocus(state) {
    let el = state.focus ? root.querySelector(`[data-slug="${CSS.escape(state.focus)}"]`) : null;
    if (!el) el = root.querySelector(".panel-head h1, .fw-top h1");
    if (!el) return;
    if (!el.matches("a,button,input,[tabindex]")) el.setAttribute("tabindex", "-1");
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }
  function navigate(href, { replace = false, focus } = {}) {
    const url = new URL(href, location.href);
    const from = parse(location.href);
    const to = parse(url.href);
    // Remember where we were (list position etc.) on the entry we are leaving.
    if (view && view.save) hist.write("replaceState", { ...hist.state, ...view.save() }, location.href);
    // Same-file moves (sheets, filters) replace; everything else is a real history step.
    const method = replace || viewKey(from) === viewKey(to) ? "replaceState" : "pushState";
    const depth = (hist.state.depth || 0) + (method === "pushState" ? 1 : 0);
    const state = { fgc: 1, palette, introSeen: hist.state.introSeen, focus, depth };
    if (!hist.write(method, state, url.href)) {
      location.href = url.href; // History unavailable: fall back to a normal page load.
      return;
    }
    render(to, state, { nav: true });
  }

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    if (a.dataset.back) {
      e.preventDefault();
      goBack();
      return;
    }
    const url = new URL(a.getAttribute("href"), location.href);
    if (!isAppUrl(url)) return;
    e.preventDefault();
    navigate(url.href, { focus: a.dataset.focus });
  });
  window.addEventListener("popstate", (e) => {
    const state = e.state && typeof e.state === "object" ? e.state : {};
    if (PALETTES.includes(state.palette) && state.palette !== palette) applyPalette(state.palette);
    render(parse(location.href), state, { nav: true });
  });
  // Safari restores pages from the back/forward cache without re-running scripts.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) document.querySelectorAll(".freeman-intro").forEach((s) => s.remove());
  });
  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest("input,textarea,select")) return;
    if (view && view.key && view.key(e)) return;
    if (e.key === "Escape") {
      if (view && view.detail && view.detail()) {
        e.preventDefault();
        goBack();
      }
      return;
    }
    if (!view || view.kind === "fieldwork" || view.kind === "entrance") return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(pageIndex + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(pageIndex - 1); }
  });
  let lastW = innerWidth, lastH = innerHeight, resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (innerWidth === lastW && innerHeight === lastH) return;
      lastW = innerWidth;
      lastH = innerHeight;
      const ae = document.activeElement;
      if (ae && ae.matches && ae.matches("input,textarea,select")) return;
      if (view && view.resize) view.resize();
    }, 120);
  });

  /* ---------- Boot ---------- */
  const first = parse(location.href);
  if (first.kind === "entrance") {
    applyPalette("chalk");
    ss.set("freeman-palette", "chalk");
  } else {
    applyPalette([hist.state.palette, ss.get("freeman-palette")].find((p) => PALETTES.includes(p)));
  }
  // A fresh arrival is depth 0 (BACK falls back to the entrance); a reload keeps its depth.
  hist.write("replaceState", { ...hist.state, fgc: 1, palette, depth: hist.state.depth || 0 }, location.href);
  render(first, hist.state);
  if (first.kind === "entrance") opening();
})();
