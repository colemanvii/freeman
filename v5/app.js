"use strict";
/*
 * Freeman GC — V5 application shell and navigation.
 *
 * Every route is a real HTML file (deep links, refreshes and hosting need no rewrites).
 * Once loaded, links between routes are handled in place with the History API, so the
 * palette, the Fieldwork index position and the opening state are never reset by a visit.
 *
 * Navigation rules
 *  - index.html is the entrance only. Leaving it REPLACES its history entry, so Back
 *    never returns to the centered screen, and no interior link points to it.
 *  - × CLOSE (and Escape) goes up one level:
 *      project detail        → Projects
 *      Fieldwork record/note → Fieldwork (filters and list position kept)
 *      Projects / Fieldwork / Contact / unknown → FREEMAN GC
 *      FREEMAN GC sheet 02+  → FREEMAN GC sheet 01; on sheet 01 there is nothing to close.
 *  - FREEMAN GC is the interior home and always shows the four destinations.
 */
(() => {
  const { projects, archive } = window.RECORDS;
  const root = document.querySelector("#main");
  const PALETTES = ["chalk", "sand", "umber"];
  const PAPER = { chalk: "#f4f4f0", sand: "#d9c5a7", umber: "#51453b" };
  const DESTINATIONS = [
    ["FREEMAN GC", "company.html", "brand"],
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
        return n.parentElement.closest("script,style,textarea,select,option,button,.hover-word,.phrase,.center a") ||
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

  /* ---------- View state ---------- */
  let view = null; // { kind, close(): target|null, key(e), resize(), save(), destroy() }
  let pageIndex = 0,
    pageCount = 1,
    renderPage = () => {},
    closeSpec = () => null;

  /* ---------- Panel chrome (FREEMAN GC / Projects / Contact) ---------- */
  function closeMarkup(target) {
    return target
      ? link("× CLOSE", target.href, "close phrase", { "data-focus": target.focus, "aria-label": "Close — " + target.label })
      : `<button class="close phrase" type="button" disabled aria-label="Close — already at Freeman GC">× CLOSE</button>`;
  }
  function refreshClose() {
    const old = root.querySelector(".panel-head .close");
    if (!old) return;
    const t = document.createElement("template");
    t.innerHTML = closeMarkup(closeSpec());
    old.replaceWith(t.content.firstElementChild);
  }
  function chrome({ title, crumb, close, back }) {
    closeSpec = typeof close === "function" ? close : () => close;
    const heading = crumb
      ? `${link(crumb.text, crumb.href, "crumb phrase", { "data-focus": crumb.focus })} / ${esc(title)}`
      : esc(title);
    const backHtml = back
      ? link("← " + back.text, back.href, "section-link phrase", { "data-focus": back.focus })
      : '<span class="section-link" aria-hidden="true"></span>';
    root.innerHTML = `<header class="panel-head"><h1>${heading}</h1>${closeMarkup(closeSpec())}</header><section class="viewport" aria-label="Current sheet"></section><footer class="sheet-controls">${backHtml}<nav aria-label="Sheet navigation"><button id="previous" class="phrase" type="button">PREV</button><span class="count" aria-live="polite"></span><button id="next" class="phrase" type="button">NEXT</button></nav></footer>`;
    root.querySelector("#previous").onclick = () => go(pageIndex - 1);
    root.querySelector("#next").onclick = () => go(pageIndex + 1);
    words(root.querySelector(".panel-head h1"));
  }
  function count() {
    pageIndex = Math.max(0, Math.min(pageCount - 1, pageIndex));
    root.querySelector(".count").textContent = `${pad(pageIndex + 1)} / ${pad(pageCount)}`;
    root.querySelector("#previous").disabled = pageIndex === 0;
    root.querySelector("#next").disabled = pageIndex === pageCount - 1;
    refreshClose();
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

  /* ---------- FREEMAN GC: interior home with the four destinations ---------- */
  function registerMarkup(rowHeight) {
    const rows = DESTINATIONS.map(
      ([t, u], i) =>
        `<a class="index-row${i === 0 ? " active" : ""}" href="${u}" data-slug="dest-${u.replace(".html", "")}"${i === 0 ? ' aria-current="page"' : ""}><span class="number">${pad(i + 1)}</span><span class="phrase">${esc(t)}</span></a>`,
    ).join("");
    return `<section class="register hub-register" aria-label="Freeman GC sections"><div class="index-title">Sections / ${pad(DESTINATIONS.length)}</div><nav class="index-rows" aria-label="Sections" style="--row-height:${rowHeight}px">${rows}</nav></section>`;
  }
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
    chrome({
      title: "COMPANY / FREEMAN GENERAL CONTRACTORS",
      close: () => (pageIndex > 0 ? { href: "company.html", label: "return to sheet 01" } : null),
      back: null,
    });
    const vp = root.querySelector(".viewport");
    if (matchMedia(PHONE).matches) {
      // Phones: the four destinations are sheet 01, the company text follows.
      const rowHeight = Math.max(48, Math.min(68, Math.floor((vp.clientHeight - 64) / DESTINATIONS.length)));
      const pages = reading(vp, b, [{ hub: true }]);
      showPages(vp, pages, (page) => {
        if (!page || !page.hub) return false;
        vp.innerHTML = `<div class="hub-phone">${registerMarkup(rowHeight)}</div>`;
        return true;
      });
    } else {
      const rowHeight = Math.max(44, Math.min(54, Math.floor((vp.clientHeight - 64) / DESTINATIONS.length)));
      vp.innerHTML = `<div class="hub-layout">${registerMarkup(rowHeight)}<div class="hub-reading"></div></div>`;
      const target = vp.querySelector(".hub-reading");
      showPages(target, reading(target, b));
    }
  }

  /* ---------- Projects ---------- */
  function projectsIndex(state) {
    chrome({
      title: "PROJECTS / SELECTED WORK",
      close: { href: "company.html", label: "return to Freeman GC" },
      back: { href: "company.html", text: "FREEMAN GC" },
    });
    const vp = root.querySelector(".viewport");
    vp.innerHTML = '<div class="index-layout"><section class="register"><div class="index-title"></div><nav class="index-rows" aria-label="Projects"></nav></section><figure class="preview" aria-hidden="true"><img alt=""><figcaption></figcaption></figure></div>';
    const rows = vp.querySelector(".index-rows");
    const rowHeight = matchMedia(PHONE).matches ? 68 : 54;
    const perPage = Math.max(1, Math.min(projects.length, Math.floor((vp.clientHeight - 48) / rowHeight)));
    pageCount = Math.ceil(projects.length / perPage);
    let activeIndex = projects.findIndex((p) => p.slug === state.focus);
    if (activeIndex >= 0) pageIndex = Math.floor(activeIndex / perPage);
    function preview(i) {
      activeIndex = i;
      const a = projects[i];
      vp.querySelector(".preview img").src = a.image;
      vp.querySelector(".preview figcaption").textContent = a.name + " / " + a.location;
      rows.querySelectorAll(".index-row").forEach((x) => x.classList.toggle("active", Number(x.dataset.index) === i));
    }
    renderPage = () => {
      vp.querySelector(".index-title").textContent = "Selected projects / " + projects.length + " records";
      rows.style.setProperty("--row-height", rowHeight + "px");
      rows.innerHTML = projects
        .slice(pageIndex * perPage, (pageIndex + 1) * perPage)
        .map((p, n) => {
          const i = pageIndex * perPage + n;
          return `<a class="index-row" data-index="${i}" data-slug="${esc(p.slug)}" href="project-${esc(p.slug)}.html"><span class="number">${pad(i + 1)}</span><span class="phrase">${esc(p.name)}</span></a>`;
        })
        .join("");
      rows.querySelectorAll("a").forEach((a) => {
        a.onmouseenter = () => preview(Number(a.dataset.index));
        a.onfocus = () => preview(Number(a.dataset.index));
      });
      const first = pageIndex * perPage;
      preview(activeIndex >= first && activeIndex < first + perPage ? activeIndex : first);
    };
    renderPage();
    count();
    if (pageIndex !== sheetFromUrl()) go(pageIndex);
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
      title: p.name,
      crumb: { text: "PROJECTS", href: "projects.html", focus: p.slug },
      close: { href: "projects.html", focus: p.slug, label: "return to Projects" },
      back: { href: "projects.html", text: "PROJECTS", focus: p.slug },
    });
    const vp = root.querySelector(".viewport");
    const pages = reading(vp, b, [
      { photo: { src: p.image, alt: p.name + " — Freeman portfolio photograph", kind: "project", title: p.name, id: p.id, type: p.type, location: p.location } },
    ]);
    showPages(vp, pages);
  }

  /* ---------- Contact / not found ---------- */
  function contact() {
    chrome({
      title: "CONTACT / FREEMAN GENERAL CONTRACTORS",
      close: { href: "company.html", label: "return to Freeman GC" },
      back: { href: "company.html", text: "FREEMAN GC" },
    });
    pageCount = 1;
    renderPage = () => {};
    const vp = root.querySelector(".viewport");
    vp.innerHTML = `<div class="contact-layout"><div class="contact-sheet"><p class="subtle">For new work, partnerships or general inquiries.</p>${link("gabe@freemangc.com ↗", "mailto:gabe@freemangc.com", "phrase")}${link("706.263.3348 ↗", "tel:+17062633348", "phrase")}<p class="subtle">GABE FREEMAN<br>CARTERSVILLE, GEORGIA</p></div><form class="contact-inquiry" id="contact-inquiry"><label for="contact-message">WRITE AN INQUIRY</label><textarea id="contact-message" name="message" required maxlength="4000" placeholder="Tell us about your project."></textarea><button type="submit">OPEN EMAIL ↗</button><p class="contact-disclaimer">OPENS YOUR EMAIL APPLICATION. NOTHING IS SENT FROM THIS WEBSITE.</p></form></div>`;
    const form = vp.querySelector("#contact-inquiry");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.elements.message.value.trim();
      if (!message) return;
      const subject = encodeURIComponent("Freeman GC — New inquiry");
      const body = encodeURIComponent(message);
      window.location.href = "mailto:gabe@freemangc.com?subject=" + subject + "&body=" + body;
    });
    count();
  }
  function notFound() {
    chrome({
      title: "RECORD NOT FOUND",
      close: { href: "company.html", label: "return to Freeman GC" },
      back: { href: "company.html", text: "FREEMAN GC" },
    });
    const vp = root.querySelector(".viewport");
    showPages(vp, reading(vp, [block("h1", "Record not found."), link("RETURN TO FREEMAN GC", "company.html", "text-link phrase")]));
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
    root.innerHTML = `<nav class="center" aria-label="Main">${nav().join('<span class="sep">/</span>')}</nav><nav class="mobile-home-nav" aria-label="Main">${nav().join("")}</nav><div class="legal">FREEMAN GENERAL CONTRACTORS<br>CARTERSVILLE, GEORGIA</div><div class="mark">BUILT FOR GENERATIONS™<br>EST. IN GEORGIA</div>`;
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
    closeSpec = () => null;

    if (route.kind === "fieldwork" && fw) {
      if (stayInFieldwork) fw.update(route, state);
      else fw.mount(root, route, state, fieldworkApi);
      view = { kind: "fieldwork", close: () => fw.closeTarget(), key: (e) => fw.key(e), save: () => fw.save(), destroy: () => fw.destroy() };
      document.title = fw.title() + " — Freeman GC";
    } else {
      view = { kind: route.kind, close: () => closeSpec(), resize: () => render(parse(location.href), { ...hist.state, focus: currentFocus() }) };
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
    const a = root.querySelector(".index-row.active[data-slug]");
    return a ? a.dataset.slug : undefined;
  }
  /* After an in-place navigation, put keyboard focus where the visitor expects it. */
  function settleFocus(state) {
    let el = state.focus ? root.querySelector(`[data-slug="${CSS.escape(state.focus)}"]`) : null;
    if (!el) el = root.querySelector(".panel-head h1, .fw-top .fw-crumb");
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
    // The entrance is never kept in history; same-file moves (sheets, filters) replace too.
    const method = replace || from.kind === "entrance" || viewKey(from) === viewKey(to) ? "replaceState" : "pushState";
    const state = { fgc: 1, palette, introSeen: hist.state.introSeen, focus };
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
      const target = view && view.close && view.close();
      if (target) {
        e.preventDefault();
        navigate(target.href, { focus: target.focus });
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
  hist.write("replaceState", { ...hist.state, fgc: 1, palette }, location.href);
  render(first, hist.state);
  if (first.kind === "entrance") opening();
})();
