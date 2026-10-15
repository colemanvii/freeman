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
 *  - × CLOSE (upper right on every interior page; Escape on detail pages) is real history:
 *    it returns to wherever the visitor actually came from, exactly like browser Back or a
 *    swipe-back. Each entry stores its depth within this visit; with no earlier same-site
 *    page (a direct arrival), CLOSE falls back to the entrance.
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
    ["RECORD", "record.html", ""],
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
      try { history[method](state, "", extensionless(url)); return true; } catch (e) { return false; }
    },
  };
  /* Cloudflare Pages serves extensionless URLs and 308-redirects "x.html" to "x"; that redirect
     drops history.state, so a refresh would lose the visit depth (CLOSE) and saved view state.
     Where the host behaves that way, write the extensionless form; plain file servers keep ".html". */
  const httpHost = /^https?:$/.test(location.protocol);
  let pretty = httpHost && /[^/]$/.test(location.pathname) && !/\.html$/.test(location.pathname);
  if (httpHost && !pretty && window.fetch) {
    fetch("company.html", { method: "HEAD", redirect: "manual", cache: "no-store" })
      .then((r) => { if (r.type === "opaqueredirect") pretty = true; })
      .catch(() => {});
  }
  function extensionless(url) {
    if (!pretty || url == null) return url;
    const u = new URL(url, location.href);
    if (u.origin !== location.origin) return url;
    u.pathname = u.pathname.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "");
    return u.href;
  }
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
    else if (["company", "projects", "contact"].includes(file)) r.kind = file;
    // Fieldwork exists only in local --fieldwork builds (see v5-source/generate.py); publicly it is not found.
    else if (file === "fieldwork" && window.FreemanFieldwork) r.kind = file;
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

  /* ---------- × CLOSE: the one return control, upper right on every interior page ----------
     Real history: back to wherever the visitor came from; the entrance on a direct arrival. */
  const closeMarkup = () =>
    `<a class="close phrase" href="index.html" data-back="1" aria-label="Close — return to the previous page">× CLOSE</a>`;
  function goBack() {
    if ((hist.state.depth || 0) > 0) history.back();
    else navigate("index.html");
  }
  window.FreemanClose = closeMarkup;

  /* ---------- View state ---------- */
  let view = null; // { kind, detail, key(e), resize(), save(), destroy() }
  let pageIndex = 0,
    pageCount = 1,
    renderPage = () => {};

  /* ---------- Panel chrome (Company / Projects / Contact) ---------- */
  function chrome({ title, section, parent }) {
    root.innerHTML = `<header class="panel-head"><h1 class="sr-only">${esc(title)}</h1>${siteNav(section, parent)}${closeMarkup()}</header><section class="viewport" aria-label="Current sheet"></section><footer class="sheet-controls"><span class="section-link" aria-hidden="true"></span><nav aria-label="Sheet navigation"><button id="previous" class="phrase" type="button">PREV</button><span class="count" aria-live="polite"></span><button id="next" class="phrase" type="button">NEXT</button></nav></footer>`;
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
      // A heading never ends a sheet: it moves to the next sheet with the text it introduces.
      const carry = [];
      while (current.length > 1 && /^<h[12]\b/.test(current[current.length - 1])) carry.unshift(current.pop());
      flush();
      carry.forEach((m) => {
        const tpl = document.createElement("template");
        tpl.innerHTML = m;
        measure.append(tpl.content.firstElementChild);
        current.push(m);
      });
      measure.append(node.cloneNode(true));
      if (fits()) { current.push(markup); continue; }
      // Too long for one sheet: split it; a carried heading stays with its first part.
      let lead = [...measure.children].slice(0, carry.length);
      measure.replaceChildren();
      const remaining = node.textContent.split(/\s+/);
      while (remaining.length) {
        let lo = 1, hi = remaining.length, best = 0;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2), test = node.cloneNode(false);
          test.textContent = remaining.slice(0, mid).join(" ");
          measure.replaceChildren(...lead, test);
          if (fits()) { best = mid; lo = mid + 1; } else hi = mid - 1;
        }
        const part = node.cloneNode(false);
        part.textContent = remaining.splice(0, best || 1).join(" ");
        current = [...(lead.length ? carry : []), part.outerHTML];
        lead = [];
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
    // One static view: headline and introduction; services, people and location. No sheets.
    const services = [
      ["General Contracting", ""],
      ["Construction Management", ""],
      ["Preconstruction", ""],
      ["Hospitality", ""],
      ["Commercial", ""],
      ["Residential", ""],
    ];
    const row = (k, v, cls = "") => `<div class="co-row${cls}"><dt>${esc(k)}</dt>${v ? `<dd>${esc(v)}</dd>` : ""}</div>`;
    chrome({ title: "Company / Freeman General Contracting", section: "company" });
    const vp = root.querySelector(".viewport");
    // Centred in the page area; only a very small phone that cannot hold it scrolls (top never clipped).
    const people = [["Gabe Freeman", "Founder / President"], ["Cameron Dombi", "Superintendent"], ["Mac Thompson", "Superintendent"], ["Jimmy Jennings", "Superintendent"]];
    vp.innerHTML = `<div class="co-frame"><div class="co"><section class="co-intro"><h2 class="co-head">Built for generations.</h2><p>Freeman General Contracting is an independent builder based in Cartersville, Georgia.</p><p>We believe how something is built matters as much as what is built. Good work requires trust, judgment, and attention to every detail.</p><p>We work with people who believe the same.</p></section><section class="co-facts"><h3 class="co-label">WHAT WE DO</h3><dl class="co-list co-services">${services.map(([k,v]) => row(k,v)).join("")}</dl><div class="co-team"><div class="co-team-heading"><h3 class="co-label">PEOPLE</h3><span class="co-location">CARTERSVILLE, GEORGIA</span></div><div class="co-people" id="co-people">${people.map(([name,role], i) => `<button class="co-person" type="button" data-person="${i}" aria-label="View ${esc(name)} profile"><span class="co-portrait" aria-hidden="true"></span><span class="co-person-name">${esc(name)}</span><span class="co-person-role">${esc(role)}</span></button>`).join("")}</div><div class="co-detail" id="co-detail" hidden aria-live="polite"></div></div></section></div></div>`;
    const index = vp.querySelector("#co-people");
    const detail = vp.querySelector("#co-detail");
    function showPerson(i) {
      const [name, role] = people[i];
      if (!name) return;
      index.hidden = true;
      detail.hidden = false;
      detail.innerHTML = `<div class="co-detail-photo" aria-hidden="true"></div><div class="co-detail-copy"><div class="co-detail-top"><span class="co-detail-index">0${i+1} / 04</span><button class="co-detail-back" type="button" aria-label="Back to people">← ALL PEOPLE</button></div><h4>${esc(name)}</h4><div class="co-detail-role">${esc(role)}</div><div class="co-detail-note">Portrait and profile forthcoming.</div></div>`;
      detail.querySelector(".co-detail-back").addEventListener("click", () => { detail.hidden = true; index.hidden = false; index.querySelector('[data-person="${i}"]').focus(); });
    }
    index.querySelectorAll("[data-person]").forEach(button => button.addEventListener("click", () => showPerson(Number(button.dataset.person))));
    words(vp);
    pageCount = 1;
    renderPage = () => {};
    count();
  }

  /* ---------- Projects ---------- */
  // Only verified values: Client and Design (Freeman's published "Interior Design" credit; its
  // "Interior Designer" template placeholder is not a credit) from the project credits, and a date
  // only from an explicit, verified `date` field. The scraped "Complete: 2024" credit is not used.
  const credit = (p, key) => ((p.credits || []).find(([k]) => k === key) || [])[1] || "";
  const designCredit = (p) => credit(p, "Architect") || (credit(p, "Interior Design") === "Interior Designer" ? "" : credit(p, "Interior Design"));
  // Only publish a destination when the organization's or creator's page can be identified.
  // Keep the credited name verbatim; this map affects links, not project attribution.
  const creditSites = {
    "Rocket Farm Restaurants": "https://www.rocketfarmrestaurants.com/",
    "Indigo Road Hospitality": "https://www.theindigoroad.com/",
    "Wright Gardner Architects": "https://www.wrightgardnerarchitect.com/",
    "NO Architecture": "https://www.no-arch.com/",
    "Azalea Marketplace": "https://azaleamarket.com/",
    "South Street Partners": "https://southstreetpartners.com/",
    "David Thompson Architecture": "https://dthompsonarchitect.com/",
    "South Downtown": "https://www.southdowntownatl.com/",
    "Gentle Works": "https://gentle.works/",
    "Electric Hospitality": "https://www.electric-hospitality.com/",
    "Blur Workshop": "https://www.blurworkshop.com/",
    "David Thompson Studio": "https://dthompsonarchitect.com/",
    "Chuck Marie Studio": "https://www.chuckmariestudio.com/",
    "Barnsley Resorts": "https://www.barnsleyresort.com/",
    "Bocado Pizza": "https://bocadopizza.com/",
    "Savi Provisions": "https://www.saviprovisions.com/",
    "O-Ku Atlanta": "https://www.o-kusushi.com/location/o-ku-atlanta/",
    "Interventional Pain Consultants": "https://www.ipc-pain.com/",
    "Jared Swafford": "https://www.flickr.com/photos/jaredswafford/"
  };
  const creditLink = (name, cls = "") => {
    if (!name) return "";
    const href = creditSites[name];
    return href
      ? `<a class="${cls} credit-external" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)} — visit website in new tab">${esc(name)}<span aria-hidden="true" class="credit-arrow"> ↗</span></a>`
      : `<span class="${cls}">${esc(name)}</span>`;
  };

  function projectsIndex(state) {
    chrome({ title: "Projects / Selected work", section: "projects" });
    const vp = root.querySelector(".viewport");
    const cell = (cls, value, label) =>
      value
        ? creditLink(value, cls)
        : `<span class="${cls} pi-empty"><span class="sr-only">${label} not yet verified</span><span aria-hidden="true">—</span></span>`;
    const rows = projects
      .map((p, i) => {
        const here = p.slug === state.focus;
        return `<li class="pi-row${here ? " is-current" : ""}"><div class="pi-link"><span class="pi-no">${pad(i + 1, 3)}</span><a class="pi-name pi-project-link" href="project-${esc(p.slug)}.html" data-slug="${esc(p.slug)}">${esc(p.name)}</a>${cell("pi-client", credit(p, "Client"), "Client")}${cell("pi-arch", designCredit(p), "Design")}${p.date ? `<span class="pi-date">${esc(p.date)}</span>` : `<span class="pi-date pi-empty" aria-hidden="true">—</span>`}</div></li>`;
      })
      .join("");
    const inProgress = [
      ["Barnsley Branded Residential", "Adairsville, Georgia", "Residential"],
      ["Magnolia Commons Retail Center", "Cumming, GA", "Retail"],
      ["Little Rey", "Dunwoody, Georgia", "Hospitality"],
    ];
    const activeRows = inProgress.map(([name, place, type]) =>
      `<li class="pi-row pi-progress"><div class="pi-link pi-progress-line"><span class="pi-no">—</span><span class="pi-name">${esc(name)}</span><span class="pi-client">${esc(place)}</span><span class="pi-arch">${esc(type)}</span><span class="pi-date">IN PROGRESS</span></div></li>`
    ).join("");
    vp.innerHTML = `<div class="pi"><div class="pi-head" aria-hidden="true"><span>No.</span><span>Project</span><span>Client</span><span>Design</span><span class="pi-head-date">Date</span></div><div class="pi-scroller"><div class="pi-section-label">IN PROGRESS / CURRENT WORK</div><ol class="pi-list" aria-label="In progress projects">${activeRows}</ol><div class="pi-section-label pi-completed-label">SELECTED WORK / COMPLETED</div><ol class="pi-list" aria-label="Completed projects">${rows}</ol></div></div>`;
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
  /* Photography-first project page: one photograph at a time, the name, place and verified credits
     beside it. Desktop: click the right/left half of the photograph; phones: swipe; keys: ← →.
     Changing photographs never adds history, so CLOSE still returns to wherever the visitor came from. */
  let galleryKey = null;
  function gallery(p) {
    chrome({
      title: "Projects / " + p.name,
      section: "projects",
      parent: { href: "projects.html", focus: p.slug },
    });
    const credits = [["Client", credit(p, "Client")], ["Architect", credit(p, "Architect")], ["Interior design", credit(p, "Interior Design")], ["Photography", credit(p, "Photography")]]
      .filter(([, v]) => v && v !== "Interior Designer");
    const related = archive.filter((a) => a.link === p.slug);
    const photos = p.gallery;
    const vp = root.querySelector(".viewport");
    vp.innerHTML = `<div class="pg"><header class="pg-info"><h2 class="pg-name">${esc(p.name)}</h2><p class="pg-place">${esc(p.location)}</p><dl class="pg-credits">${credits
      .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${creditLink(v)}</dd></div>`)
      .join("")}</dl></header><section class="pg-stage" aria-roledescription="gallery" aria-label="${esc(p.name)} photographs"><div class="pg-frame" tabindex="0" aria-label="Photographs — use the left and right arrow keys"><div class="pg-track">${photos
      .map((g, i) => `<figure class="pg-slide" aria-hidden="true"><img data-src="${esc(g.src)}" width="${g.w}" height="${g.h}" alt="${esc(p.name)} — photograph ${i + 1} of ${photos.length}" draggable="false"></figure>`)
      .join("")}</div></div><div class="pg-controls"><button type="button" class="pg-arrow" data-step="-1" aria-label="Previous photograph">←</button><p class="pg-count" aria-live="polite"></p><button type="button" class="pg-arrow" data-step="1" aria-label="Next photograph">→</button></div></section></div>`;
    const frame = vp.querySelector(".pg-frame"), track = vp.querySelector(".pg-track");
    const slides = [...track.children], counter = vp.querySelector(".pg-count");
    const [prevBtn, nextBtn] = vp.querySelectorAll(".pg-arrow");
    const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = Math.max(0, Math.min(photos.length - 1, Number(hist.state.slide) || 0));
    function show(i, animate = true) {
      index = Math.max(0, Math.min(photos.length - 1, i));
      // Load the current photograph and its neighbours only.
      [index - 1, index, index + 1].forEach((n) => {
        const img = slides[n] && slides[n].querySelector("img");
        if (img && !img.getAttribute("src")) img.src = img.dataset.src;
      });
      track.style.transition = animate && !still() ? "" : "none";
      track.style.transform = `translateX(${-index * 100}%)`;
      slides.forEach((s, n) => s.setAttribute("aria-hidden", String(n !== index)));
      counter.textContent = `${pad(index + 1)} / ${pad(photos.length)}`;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === photos.length - 1;
      frame.dataset.first = String(index === 0);
      frame.dataset.last = String(index === photos.length - 1);
      hist.write("replaceState", { ...hist.state, slide: index }, location.href); // kept for Back/Forward, never pushed
    }
    [prevBtn, nextBtn].forEach((b) => b.addEventListener("click", () => show(index + Number(b.dataset.step))));
    // Desktop: the photograph's left half goes back, its right half forward.
    frame.addEventListener("click", (e) => {
      const img = e.target.closest("img");
      if (!img || moved) return;
      const r = img.getBoundingClientRect();
      show(index + (e.clientX < r.left + r.width / 2 ? -1 : 1));
    });
    frame.addEventListener("mousemove", (e) => {
      const img = e.target.closest("img");
      if (!img) return (frame.dataset.side = "");
      const r = img.getBoundingClientRect();
      frame.dataset.side = e.clientX < r.left + r.width / 2 ? "prev" : "next";
    });
    frame.addEventListener("mouseleave", () => (frame.dataset.side = ""));
    // Phones: horizontal swipe that follows the finger. Touches starting at the screen edge are
    // left alone so the browser's own swipe-back keeps working.
    const EDGE = 24;
    let startX = 0, startY = 0, dx = 0, tracking = false, horizontal = null, moved = false;
    frame.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      moved = false;
      if (e.touches.length !== 1 || t.clientX < EDGE || t.clientX > innerWidth - EDGE) return (tracking = false);
      tracking = true; horizontal = null; startX = t.clientX; startY = t.clientY; dx = 0;
    }, { passive: true });
    frame.addEventListener("touchmove", (e) => {
      if (!tracking) return;
      const t = e.touches[0];
      dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (horizontal === null && Math.abs(dx) + Math.abs(dy) > 8) horizontal = Math.abs(dx) > Math.abs(dy);
      if (!horizontal) return;
      e.preventDefault();
      moved = true;
      const atEnd = (dx > 0 && index === 0) || (dx < 0 && index === photos.length - 1);
      track.style.transition = "none";
      track.style.transform = `translateX(calc(${-index * 100}% + ${atEnd ? dx * 0.3 : dx}px))`;
    }, { passive: false });
    const endSwipe = () => {
      if (!tracking) return;
      tracking = false;
      if (!horizontal) return;
      const w = frame.clientWidth;
      show(index + (dx < -Math.min(60, w * 0.18) ? 1 : dx > Math.min(60, w * 0.18) ? -1 : 0));
      setTimeout(() => (moved = false), 50);
    };
    frame.addEventListener("touchend", endSwipe);
    frame.addEventListener("touchcancel", endSwipe);
    galleryKey = (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return false;
      e.preventDefault();
      show(index + (e.key === "ArrowRight" ? 1 : -1));
      return true;
    };
    show(index, false);
    count();
  }
  function project(p) {
    if (Array.isArray(p.gallery) && p.gallery.length) return gallery(p);
    const related = archive.filter((a) => a.link === p.slug);
    const b = [
      block("p", "P—" + p.id + " / " + p.type, "micro"),
      block("h1", p.name),
      block("p", p.location, "micro"),
      block("p", p.summary),
      ...(p.details ? [block("p", p.details)] : []),
      block("h2", "Project record"),
      ...p.credits
        .filter(([k, v]) => ["Client", "Photography", "Interior Design", "Architect"].includes(k) && v !== "Interior Designer")
        .map(([k, v]) => `<div class="data"><span>${esc(k)}</span><span>${creditLink(v)}</span></div>`),
      ...(p.image ? [data("Source", "Freeman published portfolio")] : []),
    ];
    chrome({
      title: "Projects / " + p.name,
      section: "projects",
      parent: { href: "projects.html", focus: p.slug },
    });
    const vp = root.querySelector(".viewport");
    const pages = reading(vp, b, p.image ? [
      { photo: { src: p.image, alt: p.name + " — Freeman portfolio photograph", kind: "project", title: p.name, id: p.id, type: p.type, location: p.location } },
    ] : []);
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
    chrome({ title: "Contact / Freeman General Contracting", section: "contact" });
    pageCount = 1;
    renderPage = () => {};
    const vp = root.querySelector(".viewport");
    vp.innerHTML = `<div class="contact-layout"><div class="contact-sheet"><h2 class="contact-label">CONTACT INFORMATION</h2><p class="subtle">For new work, partnerships or general inquiries.</p>${link("gabe@freemangc.com ↗", "mailto:gabe@freemangc.com", "phrase")}${link("706.263.3348 ↗", "tel:+17062633348", "phrase")}<p class="subtle">GABE FREEMAN<br>CARTERSVILLE, GEORGIA</p></div><form class="contact-inquiry" id="contact-inquiry" novalidate><label class="contact-label" for="contact-message">WRITE A MESSAGE</label><textarea id="contact-message" name="message" maxlength="4000" placeholder="Tell us about your project." required></textarea><label class="contact-email-label" for="contact-email">YOUR EMAIL</label><input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required><input type="text" name="website" autocomplete="off" tabindex="-1" aria-hidden="true" class="contact-honeypot"><button type="submit">SEND MESSAGE ↗</button><p class="contact-disclaimer" id="contact-status" role="status" aria-live="polite">Sends directly to Freeman. We'll reply by email.</p></form></div>`;
    const form = vp.querySelector("#contact-inquiry");
    const field = form.elements.message;
    const emailField = form.elements.email;
    const button = form.querySelector('button[type="submit"]');
    const status = vp.querySelector("#contact-status");
    field.value = contactDraft.read();
    field.addEventListener("input", () => contactDraft.write(field.value));
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = field.value.trim();
      const email = emailField.value.trim();
      contactDraft.write(field.value);
      if (message.length < 3) { status.textContent = "Please write a message first."; field.focus(); return; }
      if (!emailField.checkValidity()) { status.textContent = "Please enter a valid email address."; emailField.focus(); return; }
      button.disabled = true;
      button.textContent = "SENDING…";
      status.textContent = "Sending your message…";
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, message, website: form.elements.website.value })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) throw new Error(result.error || "Could not send your message.");
        status.textContent = "MESSAGE SENT. THANK YOU.";
        field.value = "";
        emailField.value = "";
        contactDraft.write("");
      } catch (error) {
        status.textContent = error.message || "Could not send. Please try again.";
      } finally {
        button.disabled = false;
        button.textContent = "SEND MESSAGE ↗";
      }
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
    root.innerHTML = `<nav class="center" aria-label="Main">${brand}${nav().join('<span class="sep">/</span>')}</nav><nav class="mobile-home-nav" aria-label="Main">${brand}${nav().join("")}</nav><a class="client-access-entry phrase" href="client-access.html" aria-label="Access">ACCESS ↗</a><div class="legal">FREEMAN GENERAL CONTRACTING<br>CARTERSVILLE, GEORGIA</div><div class="mark">BUILT FOR GENERATIONS™<br>EST. IN GEORGIA</div>`;
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
      view = { kind: "fieldwork", detail: () => fw.isDetail(), key: (e) => fw.key(e), save: () => fw.save(), resize: () => fw.resize(), destroy: () => fw.destroy() };
      document.title = fw.title() + " — Freeman GC";
    } else {
      galleryKey = null;
      view = {
        kind: route.kind,
        detail: () => route.kind === "project",
        key: (e) => (galleryKey ? galleryKey(e) : false),
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
    const url = new URL(a.getAttribute("href"), document.baseURI);
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
  // A fresh arrival is depth 0 (CLOSE falls back to the entrance); a reload keeps its depth.
  hist.write("replaceState", { ...hist.state, fgc: 1, palette, depth: hist.state.depth || 0 }, location.href);
  render(first, hist.state);
  if (first.kind === "entrance") opening();
})();
