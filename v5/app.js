"use strict";
/*
 * Freeman GC — V5 application shell and navigation.
 *
 * Every route is a real HTML file (deep links, refreshes and hosting need no rewrites).
 * Once loaded, links between routes are handled in place with the History API, so the
 * palette, the Fieldwork index position and the opening state are never reset by a visit.
 *
 * Navigation rules
 *  - index.html is the entrance. It stays in history like any other page; the original
 *    Freeman script is written by hand on fresh arrival and shown finished on Back/Forward.
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
  // Move the mode rules after the base stylesheet before measuring any layout.
  const eraStyle=document.getElementById('freeman-era-styles');
  if(eraStyle) document.head.append(eraStyle);
  const { projects, archive } = window.RECORDS;
  const root = document.querySelector("#main");
  const PALETTES = ["chalk", "sand", "umber"];
  const PAPER = { chalk: "#fff9f1", sand: "#ddcfb3", umber: "#332e20" };
  const DESTINATIONS = [
    ["COMPANY", "company.html", ""],
    ["PROJECTS", "projects.html", ""],
    // NOTES stays withdrawn. The Record was approved for public release on 22 Oct 2026.
    ["MAP", "map.html", ""],
    ["CONTACT", "contact.html", ""],
  ];
  const TITLES = {
    entrance: "Entry",
    company: "Company",
    projects: "Work",
    fieldwork: "Fieldwork",
    contact: "Contact",
    etcetera: "Notes",
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
    else if (["company", "projects", "etcetera", "contact"].includes(file)) r.kind = file;
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

  /* ---------- Palette (fresh sessions start off-white; navigation keeps the selection) ---------- */
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
    // V4: one editorial frame; three views, no route changes or layout jumps.
    chrome({ title: "Company / Freeman General Contracting", section: "company" });
    const vp = root.querySelector(".viewport");
    const people = [
      {name:"Gabe Freeman",role:"Founder / President"},
      {name:"Dillon Vanderpool",role:"Project Manager"},
      {name:"Cameron Dombi",role:"Superintendent"},
      {name:"Mac Thompson",role:"Superintendent"},
      {name:"Jimmy Jennings",role:"Superintendent"},
      {name:"Macee Murray",role:"Controller"}
    ];
    const services = [
      {name:"General Contracting",detail:"Construction execution, coordination of trades, quality, and completion.",image:"assets/projects/barnsley-gardens-2.jpg",alt:"Architectural photograph of Barnsley Gardens",caption:"BARNSLEY GARDENS"},
      {name:"Construction Management",detail:"Planning and coordination throughout the life of a project.",image:"assets/projects/barnsley-gardens-2.jpg",alt:"Photograph of Barnsley Gardens",caption:"BARNSLEY GARDENS"},
      {name:"Preconstruction",detail:"Early collaboration around scope, budgets, schedules, and constructability.",image:"assets/projects/beetlecat-interior-2.jpg",alt:"Interior photograph of Beetlecat",caption:"BEETLECAT"}
    ];
    let currentTab="philosophy",currentPerson=0,currentService=0;
    vp.innerHTML = `<div class="co4" data-co4-view="philosophy">
      <div class="co4-stage">
        <section class="co4-editorial" id="co4-panel" role="tabpanel" aria-live="polite">
          <nav class="co4-nav" aria-label="Company views" role="tablist">
            <button type="button" role="tab" data-co4-tab="philosophy" aria-selected="true" aria-controls="co4-copy">PHILOSOPHY</button>
            <button type="button" role="tab" data-co4-tab="services" aria-selected="false" aria-controls="co4-copy">SERVICES</button>
            <button type="button" role="tab" data-co4-tab="people" aria-selected="false" aria-controls="co4-copy">PEOPLE</button>
          </nav>
          <div class="co4-copy" id="co4-copy"></div>
        </section>
        <figure class="co4-visual co4-placeholder-visual" aria-live="polite"><div class="co4-media"><div class="co4-image-placeholder" id="co4-image-placeholder">ADD IMAGE HERE</div></div><figcaption id="co4-image-caption">PHILOSOPHY / IMAGE TO COME</figcaption></figure>
      </div>
    </div>`;
    const copy=vp.querySelector("#co4-copy");
    const imageCaption=vp.querySelector("#co4-image-caption");
    const imagePlaceholder=vp.querySelector("#co4-image-placeholder");
    function updateImageSpace(){
      const item=currentTab==="people" ? people[currentPerson] : currentTab==="services" ? services[currentService] : null;
      imagePlaceholder.textContent="ADD IMAGE HERE";
      imageCaption.textContent=currentTab==="people" ? item.name.toUpperCase()+" / HEADSHOT TO COME" : currentTab==="services" ? item.name.toUpperCase()+" / IMAGE TO COME" : "PHILOSOPHY / IMAGE TO COME";
    }
    const philosophyParagraphs=[
      "The way a place gets built matters.",
      "We work alongside owners, architects, designers, and operators who care deeply about what they create. We come to the table early, bring the right people together, and carry ambitious ideas through construction.",
      "Good construction is a relationship, not a transaction. It takes clear judgment, difficult conversations, respect for the people doing the work, and decisions made for the long term.",
      "We believe the process of building should be something people look forward to, not simply something they have to get through."
    ];
    function renderCompanySheet() {
      if(currentTab!=="philosophy")return;
      const paragraphs=philosophyParagraphs;
      copy.innerHTML=`<h2>Built for generations<span class="co4-accent">.</span></h2>${paragraphs.map(p=>`<p>${esc(p)}</p>`).join("")}`;
    }
    function setCompanySheets() {
      pageCount=1;
      pageIndex=Math.min(pageIndex,pageCount-1);
      renderPage=renderCompanySheet;
      renderPage();
      count();
    }
    function show(tab) {
      currentTab=tab;
      vp.querySelector(".co4").dataset.co4View=tab;
      updateImageSpace();
      vp.querySelectorAll("[data-co4-tab]").forEach(el=>el.setAttribute("aria-selected",String(el.dataset.co4Tab===tab)));
      pageIndex=0;
      if(tab==="philosophy"){
        setCompanySheets();
      } else if(tab==="services"){
        pageCount=1;renderPage=()=>{};count();
        copy.innerHTML=`<h2>What we do<span class="co4-accent">.</span></h2>
          <div class="co4-menu" role="group" aria-label="Services">${services.map((s,i)=>`<button type="button" class="co4-choice" data-co4-service="${i}" aria-pressed="${i===currentService}"><span>0${i+1}</span><strong>${esc(s.name)}</strong><span>↗</span></button>`).join("")}</div>
          <div class="co4-description"><span>OUR APPROACH</span><p id="co4-service-text">${esc(services[currentService].detail)}</p></div>`;
      } else {
        pageCount=1;renderPage=()=>{};count();
        const person=people[currentPerson];
        copy.innerHTML=`<h2>Our people<span class="co4-accent">.</span></h2>
          <div class="co4-people" role="group" aria-label="Select a team member">${people.map((p,i)=>`<button type="button" class="co4-choice" data-co4-person="${i}" aria-pressed="${i===currentPerson}"><span>0${i+1}</span><strong>${esc(p.name)}</strong><span>↗</span></button>`).join("")}</div>
          <div class="co4-description"><span id="co4-person-role">${esc(person.role)}</span><p id="co4-person-name">${esc(person.name)}</p><small>Full biography and portrait forthcoming.</small></div>`;
      }
    }
    vp.addEventListener("click",e=>{
      const tab=e.target.closest("[data-co4-tab]"),service=e.target.closest("[data-co4-service]"),person=e.target.closest("[data-co4-person]");
      if(tab){show(tab.dataset.co4Tab);return;}
      if(service){currentService=Number(service.dataset.co4Service);vp.querySelectorAll("[data-co4-service]").forEach(el=>el.setAttribute("aria-pressed",String(Number(el.dataset.co4Service)===currentService)));vp.querySelector("#co4-service-text").textContent=services[currentService].detail;updateImageSpace();return;}
      if(person){currentPerson=Number(person.dataset.co4Person);show("people");}
    });
    vp.querySelector(".co4-nav").addEventListener("keydown",e=>{
      const tabs=[...vp.querySelectorAll("[data-co4-tab]")],i=tabs.indexOf(document.activeElement);
      if(i===-1||!["ArrowLeft","ArrowRight"].includes(e.key))return;
      e.preventDefault();const next=tabs[(i+(e.key==="ArrowRight"?1:tabs.length-1))%tabs.length];next.focus();show(next.dataset.co4Tab);
    });
    show("philosophy");
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
      ? `<a class="${cls} credit-external" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)} — visit website in new tab"><span class="tap-label">${esc(name)}<span aria-hidden="true" class="credit-arrow"> ↗</span></span></a>`
      : `<span class="${cls}">${esc(name)}</span>`;
  };

  function projectsIndex(state) {
    chrome({ title: "Projects / Selected work", section: "projects" });
    const vp = root.querySelector(".viewport");
    const cell=(cls,value,label)=>value?creditLink(value,cls):`<span class="${cls} pi-empty"><span class="sr-only">${label} not yet verified</span><span aria-hidden="true">—</span></span>`;
    const rows=projects.map((p,i)=>`<li class="pi-row${p.slug===state.focus?" is-current":""}"><div class="pi-link"><span class="pi-no">${pad(i+1,3)}</span><a class="pi-name pi-project-link" href="project-${esc(p.slug)}.html" data-slug="${esc(p.slug)}"><span class="tap-label">${esc(p.name)}</span></a>${cell("pi-client",credit(p,"Client"),"Client")}${cell("pi-arch",designCredit(p),"Design")}${p.date?`<span class="pi-date">${esc(p.date)}</span>`:'<span class="pi-date pi-empty" aria-hidden="true">—</span>'}</div></li>`).join("");
    const inProgress=[
      ["Barnsley Branded Residential","Adairsville, Georgia","Residential"],
      ["Magnolia Commons Retail Center","Cumming, GA","Retail"],
      ["Little Rey","Dunwoody, Georgia","Hospitality"]
    ];
    const activeRows=inProgress.map(([name,place,type])=>`<li class="pi-row pi-progress"><div class="pi-link pi-progress-line"><span class="pi-no">—</span><span class="pi-name">${esc(name)}</span><span class="pi-client">${esc(place)}</span><span class="pi-arch">${esc(type)}</span><span class="pi-date">IN PROGRESS</span></div></li>`).join("");
    const desktopItems=projects.map((p,i)=>`<li class="pi4-work-row"><button type="button" class="pi4-select" data-pi4-select="${esc(p.slug)}" aria-pressed="false"><span class="pi4-no">${pad(i+1,3)}</span><span class="pi4-indicator" aria-hidden="true">+</span><span class="pi4-item-name">${esc(p.name)}</span></button><span class="pi4-client">${cell("pi-client",credit(p,"Client"),"Client")}</span><span class="pi4-designer">${cell("pi-arch",designCredit(p),"Design")}</span></li>`).join("");
    vp.innerHTML=`<div class="pi4" aria-label="Desktop project index"><aside class="pi4-register">
      <div class="pi4-heading"><span>PROJECT INDEX</span><span>IN PROGRESS / ${pad(inProgress.length,2)} &nbsp;·&nbsp; SELECTED / ${pad(projects.length,2)}</span></div>
      <div class="pi4-scroll"><div class="pi4-columns" aria-hidden="true"><span>NO.</span><span>PROJECT</span><span>CLIENT</span><span>DESIGN</span></div><div class="pi4-section">IN PROGRESS / CURRENT WORK</div>
        <ol class="pi4-current">${inProgress.map(([name,place,type])=>`<li class="pi4-work-row pi4-in-progress"><span class="pi4-no">—</span><span class="pi4-item-name">${esc(name)}</span><span class="pi4-client">${esc(place)}</span><span class="pi4-designer">${esc(type)}</span></li>`).join("")}</ol>
        <div class="pi4-section pi4-completed">SELECTED WORK / COMPLETED</div>
        <ol class="pi4-items">${desktopItems}</ol>
      </div></aside>
      <section class="pi4-stage" id="pi4-stage" aria-label="Selected project preview" aria-live="polite"></section>
    </div>
    <div class="pi pi4-original-mobile"><div class="pi-head" aria-hidden="true"><span>No.</span><span>Project</span><span>Client</span><span>Design</span><span class="pi-head-date">Date</span></div><div class="pi-scroller"><div class="pi-section-label">IN PROGRESS / CURRENT WORK</div><ol class="pi-list" aria-label="In progress projects">${activeRows}</ol><div class="pi-section-label pi-completed-label">SELECTED WORK / COMPLETED</div><ol class="pi-list" aria-label="Completed projects">${rows}</ol></div></div>`;
    // The full-screen photography view already exists. The preview is its smaller sibling.
    const stage=vp.querySelector("#pi4-stage");
    let selected=null,photoIndex=0;
    const photosFor=p=>(p.gallery&&p.gallery.length?p.gallery.map(g=>g.src):p.image?[p.image]:[]);
    function select(slug,index=0){
      const p=projects.find(x=>x.slug===slug)||projects.find(x=>x.slug==="the-optimist")||projects.find(x=>photosFor(x).length)||projects[0];
      if(!p)return;
      selected=p;const photos=photosFor(p);photoIndex=Math.max(0,Math.min(index,photos.length-1));
      const hasPhotos=photos.length>0,selectedIndex=projects.indexOf(p)+1;
      stage.innerHTML=`<div class="pi4-preview-head"><span>SELECTED WORK / ${pad(selectedIndex,2)} OF ${pad(projects.length,2)}</span><button type="button" data-pi4-close aria-label="Close selected project">CLOSE ×</button></div>
        <div class="pi4-preview-title"><div><h2>${esc(p.name)}</h2><p>${esc(p.location||"")}</p></div><a href="project-${esc(p.slug)}.html">VIEW PROJECT ↗</a></div>
        <div class="pi4-preview-image">${hasPhotos?`<a href="project-${esc(p.slug)}.html" class="pi4-image-link" aria-label="Open ${esc(p.name)} full project gallery"><img id="pi4-image" src="${esc(photos[photoIndex])}" alt="${esc(p.name)} — photograph ${photoIndex+1}" draggable="false"></a>`:'<div class="pi4-no-image">PHOTOGRAPHY FORTHCOMING</div>'}</div>
        <div class="pi4-image-caption">${esc(p.name)} / ${esc(p.date||"SELECTED WORK")}</div>
        <div class="pi4-preview-bottom"><span>FREEMAN / SELECTED WORK</span>
          ${hasPhotos?`<div class="pi4-arrows"><button type="button" data-pi4-step="-1" aria-label="Previous project photograph" ${photoIndex===0?"disabled":""}>←</button><span>${pad(photoIndex+1)} / ${pad(photos.length)}</span><button type="button" data-pi4-step="1" aria-label="Next project photograph" ${photoIndex===photos.length-1?"disabled":""}>→</button></div>`:""}
        </div>`;
      vp.querySelectorAll("[data-pi4-select]").forEach(el=>{
        const active=el.dataset.pi4Select===p.slug;
        el.setAttribute("aria-pressed",String(active));
        const indicator=el.querySelector(".pi4-indicator");
        if(indicator)indicator.textContent=active?"−":"+";
      });
      hist.write("replaceState",{...hist.state,focus:p.slug},location.href);
    }
    vp.querySelector(".pi4").addEventListener("click",e=>{
      const chooser=e.target.closest("[data-pi4-select]"),step=e.target.closest("[data-pi4-step]"),close=e.target.closest("[data-pi4-close]");
      if(chooser){select(chooser.dataset.pi4Select);return;}
      if(step&&selected){select(selected.slug,photoIndex+Number(step.dataset.pi4Step));return;}
      if(close){
        selected=null;
        stage.innerHTML='<div class="pi4-preview-head"><span>SELECTED WORK</span></div><div class="pi4-empty-selection">SELECT A PROJECT / LEFT INDEX ↗</div>';
        vp.querySelectorAll("[data-pi4-select]").forEach(el=>{
          el.setAttribute("aria-pressed","false");
          const indicator=el.querySelector(".pi4-indicator");
          if(indicator)indicator.textContent="+";
        });
        hist.write("replaceState",{...hist.state,focus:null},location.href);
      }
    });
    select(state.focus||"the-optimist");
    const scroller=vp.querySelector(".pi4-original-mobile .pi-scroller");
    scroller.addEventListener("click",e=>{
      const row=e.target.closest(".pi-row");if(!row)return;
      scroller.querySelectorAll(".pi-row.is-current").forEach(r=>r.classList.remove("is-current"));
      row.classList.add("is-current");
    });
    if(typeof state.projScroll==="number")scroller.scrollTop=state.projScroll;
    const current=scroller.querySelector(".pi-row.is-current");
    if(current){const top=current.offsetTop,bottom=top+current.offsetHeight;if(top<scroller.scrollTop)scroller.scrollTop=top;else if(bottom>scroller.scrollTop+scroller.clientHeight)scroller.scrollTop=bottom-scroller.clientHeight;}
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
  function etcetera() {
    chrome({ title: "Notes / Freeman General Contracting", section: "etcetera" });
    pageCount = 1;
    renderPage = () => {};
    count();
    const vp = root.querySelector(".viewport");
    vp.innerHTML = `<div class="fw-editorial" aria-label="Fieldwork editorial index">
      <article class="fw-lead" aria-labelledby="fw-essay-title">
        <span class="fw-eyebrow">001</span>
        <div class="fw-essay">
          <h2 id="fw-essay-title">BUILT FOR GENERATIONS.</h2>
          <p>Buildings outlive the people who build them.</p>
          <p>They become restaurants where families gather, places where friendships begin, and familiar corners of neighborhoods that change around them. The names of the people responsible may be forgotten. The work remains.</p>
          <p>There is a responsibility that comes with building something another person will inherit. It means thinking past opening day: how a place will be used, how it will age, how it will be maintained, and what it will give to the people who encounter it.</p>
          <p>Good construction is often invisible in the finished result. Behind every well-considered space are thousands of decisions, most of which no one will ever notice.</p>
          <p>Those decisions matter.</p>
          <p>We work alongside architects, designers, craftspeople, and owners who believe the things worth making are worth making well.</p>
          <p>We believe the process deserves as much attention as the result, and that the quality of our work should be evident long after we've left the jobsite.</p>
          <p>Built for Generations is a statement about what makes something worth keeping.</p>
        </div>
        <span class="fw-foot">FREEMAN GENERAL CONTRACTING</span>
      </article>
      <div class="fw-register" aria-label="Selected fieldwork">
        <button class="fw-entry fw-entry-note" type="button" data-etc-open="optimist">
          <span class="fw-entry-visual"><img src="/assets/project-1.jpg" alt="Guests gathering on the outdoor patio at The Optimist" loading="eager"></span>
          <span class="fw-entry-caption">002 / THE OPTIMIST — READ THE NOTE ↗</span>
        </button>
      </div>
    </div>
    <dialog class="etc-dialog" aria-labelledby="etc-detail-title">
      <div class="etc-dialog-bar"><span id="etc-detail-title" data-etc-title></span><button class="phrase" data-etc-close type="button">× CLOSE</button></div>
      <article class="etc-dialog-body" data-etc-body></article>
    </dialog>`;
    const dialog = vp.querySelector(".etc-dialog");
    const detail = vp.querySelector("[data-etc-body]");
    const title = vp.querySelector("[data-etc-title]");
    vp.querySelector("[data-etc-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    vp.querySelectorAll("[data-etc-open]").forEach((btn) => btn.addEventListener("click", () => {
      if (btn.dataset.etcOpen === "letter") {
        dialog.classList.remove("etc-dialog-artwork");
        title.textContent = "001 / BUILT FOR GENERATIONS";
        detail.scrollTop = 0;
        detail.innerHTML = `<div class="etc-number">NOTES / A POINT OF VIEW</div>
          <h2>Built for Generations</h2>
          <p>Buildings outlive the people who build them.</p>
          <p>They become restaurants where families gather, places where friendships begin, and familiar corners of neighborhoods that change around them. The names of the people responsible may be forgotten. The work remains.</p>
          <p>There is a responsibility that comes with building something another person will inherit. It means thinking past opening day: how a place will be used, how it will age, how it will be maintained, and what it will give to the people who encounter it.</p>
          <p>Good construction is often invisible in the finished result. Behind every well-considered space are thousands of decisions, most of which no one will ever notice.</p>
          <p>Those decisions matter.</p>
          <p>We work alongside architects, designers, craftspeople, and owners who believe the things worth making are worth making well.</p>
          <p>We believe the process deserves as much attention as the result, and that the quality of our work should be evident long after we've left the jobsite.</p>
          <p>Built for Generations is a statement about what makes something worth keeping.</p>
          `;
        dialog.showModal();
        return;
      }
      const artwork = {
        industrial: ["003 / ARCHITECTURAL DRAWING", "/etcetera/architectural-industrial.webp"],
        residential: ["004 / RESIDENTIAL PERSPECTIVE", "/etcetera/residential-landscape.webp"]
      }[btn.dataset.etcOpen];
      dialog.classList.toggle("etc-dialog-artwork", Boolean(artwork));
      detail.scrollTop = 0;
      if (artwork) {
        title.textContent = artwork[0];
        const image = document.createElement("img");
        image.className = "etc-detail-photo";
        image.src = artwork[1];
        image.alt = btn.querySelector("img").alt;
        detail.replaceChildren(image);
        dialog.showModal();
        return;
      }
      const ruskin = btn.dataset.etcOpen === "ruskin";
      title.textContent = ruskin ? "001 / JOHN RUSKIN" : "002 / THE OPTIMIST";
      detail.innerHTML = ruskin
        ? '<img class="etc-detail-photo" src="/etcetera/ruskin.webp" alt="Photographed John Ruskin passage about building for future generations">'
        : `<div class="etc-number">NOTES / AN EDITORIAL NOTE</div>
          <h2>On building a place people want to return to.</h2>
          <p>A restaurant is experienced as a whole. The light on a table, the curve of a booth, the sounds of service, the ease with which people move through a room. But behind that apparent ease is a concentration of decisions made by many people.</p>
          <p>Hospitality buildouts ask construction to reconcile different kinds of pressure at once: the designer's intent, the operator's day-to-day requirements, durability, craft, budgets, and the calendar. A beautiful detail also has to survive a busy Saturday night.</p>
          <p>The Optimist's oyster-bar refresh gives us a useful place to examine that tension. Its finished rooms offer a starting point; what we'd like to document next is the less visible work—coordination, sequencing, material choices, and judgment that makes a space feel effortless.</p>
          <p>Not just what a place looks like after the work is finished, but what it took to get there.</p>
          <small>WORKING EDITORIAL REFLECTION / PROJECT-SPECIFIC CONSTRUCTION DETAILS NOT YET VERIFIED</small>`;
      dialog.showModal();
    }));
  }

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
    contactEagle();
  }
  /* Approved Stamp bitmap: inline SVG paints synchronously with the Contact content. */
  function contactEagle() {
    const layout = root.querySelector(".contact-layout");
    if (!layout) return;
    layout.insertAdjacentHTML("beforeend", '<svg class="contact-eagle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 60" width="192" height="60" aria-hidden="true" focusable="false" fill="currentColor"><path d="M92 0h8v1h-8zM90 1h11v1h-11zM88 2h14v1h-14zM87 3h15v1h-15zM85 4h5v1h-5zM91 4h3v1h-3zM96 4h7v1h-7zM84 5h6v1h-6zM91 5h3v1h-3zM96 5h7v1h-7zM62 6h12v1h-12zM84 6h6v1h-6zM91 6h12v1h-12zM121 6h12v1h-12zM59 7h17v1h-17zM84 7h6v1h-6zM91 7h13v1h-13zM120 7h17v1h-17zM56 8h21v1h-21zM84 8h20v1h-20zM118 8h23v1h-23zM53 9h25v1h-25zM84 9h20v1h-20zM117 9h27v1h-27zM50 10h10v1h-10zM70 10h9v1h-9zM85 10h19v1h-19zM116 10h8v1h-8zM131 10h16v1h-16zM47 11h10v1h-10zM60 11h10v1h-10zM74 11h6v1h-6zM91 11h13v1h-13zM115 11h16v1h-16zM136 11h15v1h-15zM0 12h6v1h-6zM43 12h31v1h-31zM76 12h5v1h-5zM91 12h13v1h-13zM114 12h22v1h-22zM139 12h15v1h-15zM0 13h11v1h-11zM39 13h37v1h-37zM77 13h5v1h-5zM91 13h6v1h-6zM98 13h7v1h-7zM114 13h25v1h-25zM142 13h15v1h-15zM0 14h16v1h-16zM29 14h27v1h-27zM64 14h13v1h-13zM78 14h4v1h-4zM91 14h3v1h-3zM95 14h2v1h-2zM98 14h7v1h-7zM113 14h29v1h-29zM146 14h15v1h-15zM1 15h63v1h-63zM65 15h13v1h-13zM79 15h4v1h-4zM91 15h3v1h-3zM95 15h2v1h-2zM98 15h2v1h-2zM101 15h4v1h-4zM112 15h34v1h-34zM149 15h18v1h-18zM179 15h12v1h-12zM2 16h77v1h-77zM80 16h4v1h-4zM90 16h4v1h-4zM95 16h2v1h-2zM98 16h2v1h-2zM101 16h4v1h-4zM111 16h38v1h-38zM152 16h40v1h-40zM3 17h3v1h-3zM11 17h29v1h-29zM44 17h36v1h-36zM81 17h4v1h-4zM90 17h4v1h-4zM95 17h2v1h-2zM98 17h2v1h-2zM101 17h5v1h-5zM110 17h42v1h-42zM155 17h37v1h-37zM3 18h8v1h-8zM16 18h20v1h-20zM40 18h40v1h-40zM81 18h5v1h-5zM89 18h5v1h-5zM95 18h2v1h-2zM98 18h2v1h-2zM101 18h5v1h-5zM109 18h46v1h-46zM158 18h33v1h-33zM4 19h12v1h-12zM21 19h11v1h-11zM36 19h45v1h-45zM82 19h12v1h-12zM95 19h2v1h-2zM98 19h2v1h-2zM101 19h57v1h-57zM161 19h28v1h-28zM4 20h17v1h-17zM32 20h27v1h-27zM70 20h11v1h-11zM82 20h12v1h-12zM95 20h2v1h-2zM98 20h2v1h-2zM101 20h43v1h-43zM152 20h9v1h-9zM165 20h23v1h-23zM6 21h64v1h-64zM71 21h11v1h-11zM83 21h14v1h-14zM98 21h54v1h-54zM153 21h12v1h-12zM179 21h9v1h-9zM8 22h74v1h-74zM83 22h57v1h-57zM142 22h45v1h-45zM11 23h17v1h-17zM43 23h99v1h-99zM148 23h37v1h-37zM14 24h6v1h-6zM28 24h128v1h-128zM172 24h11v1h-11zM17 25h121v1h-121zM143 25h33v1h-33zM18 26h26v1h-26zM48 26h95v1h-95zM144 26h4v1h-4zM152 26h24v1h-24zM18 27h20v1h-20zM44 27h8v1h-8zM55 27h89v1h-89zM146 27h6v1h-6zM156 27h19v1h-19zM22 28h12v1h-12zM38 28h11v1h-11zM52 28h85v1h-85zM138 28h8v1h-8zM147 28h9v1h-9zM158 28h15v1h-15zM27 29h19v1h-19zM49 29h9v1h-9zM61 29h6v1h-6zM69 29h48v1h-48zM118 29h14v1h-14zM133 29h5v1h-5zM140 29h7v1h-7zM148 29h21v1h-21zM32 30h10v1h-10zM46 30h9v1h-9zM58 30h7v1h-7zM67 30h25v1h-25zM103 30h15v1h-15zM119 30h8v1h-8zM128 30h5v1h-5zM135 30h5v1h-5zM141 30h19v1h-19zM33 31h19v1h-19zM55 31h8v1h-8zM65 31h32v1h-32zM98 31h21v1h-21zM120 31h3v1h-3zM124 31h4v1h-4zM129 31h6v1h-6zM136 31h19v1h-19zM36 32h61v1h-61zM98 32h22v1h-22zM121 32h3v1h-3zM125 32h4v1h-4zM130 32h18v1h-18zM41 33h35v1h-35zM78 33h16v1h-16zM102 33h18v1h-18zM121 33h4v1h-4zM126 33h16v1h-16zM45 34h3v1h-3zM51 34h9v1h-9zM61 34h13v1h-13zM76 34h21v1h-21zM98 34h23v1h-23zM122 34h4v1h-4zM127 34h10v1h-10zM53 35h3v1h-3zM63 35h9v1h-9zM74 35h22v1h-22zM97 35h35v1h-35zM65 36h27v1h-27zM93 36h2v1h-2zM96 36h34v1h-34zM67 37h26v1h-26zM95 37h29v1h-29zM70 38h52v1h-52zM71 39h48v1h-48zM74 40h39v1h-39zM77 41h12v1h-12zM90 41h13v1h-13zM104 41h8v1h-8zM79 42h10v1h-10zM90 42h13v1h-13zM104 42h9v1h-9zM79 43h10v1h-10zM90 43h13v1h-13zM104 43h11v1h-11zM78 44h10v1h-10zM89 44h2v1h-2zM92 44h6v1h-6zM99 44h4v1h-4zM104 44h3v1h-3zM108 44h9v1h-9zM76 45h12v1h-12zM89 45h2v1h-2zM92 45h2v1h-2zM95 45h3v1h-3zM99 45h4v1h-4zM104 45h3v1h-3zM108 45h4v1h-4zM113 45h5v1h-5zM75 46h13v1h-13zM89 46h2v1h-2zM92 46h2v1h-2zM95 46h3v1h-3zM99 46h5v1h-5zM105 46h2v1h-2zM108 46h4v1h-4zM113 46h5v1h-5zM75 47h13v1h-13zM89 47h2v1h-2zM92 47h2v1h-2zM95 47h3v1h-3zM99 47h5v1h-5zM105 47h2v1h-2zM108 47h5v1h-5zM114 47h4v1h-4zM76 48h12v1h-12zM89 48h2v1h-2zM92 48h2v1h-2zM95 48h3v1h-3zM99 48h1v1h-1zM101 48h3v1h-3zM105 48h3v1h-3zM109 48h8v1h-8zM77 49h10v1h-10zM88 49h3v1h-3zM92 49h2v1h-2zM95 49h3v1h-3zM99 49h1v1h-1zM101 49h3v1h-3zM105 49h3v1h-3zM109 49h8v1h-8zM77 50h10v1h-10zM88 50h3v1h-3zM92 50h2v1h-2zM95 50h3v1h-3zM99 50h1v1h-1zM101 50h3v1h-3zM105 50h3v1h-3zM109 50h8v1h-8zM77 51h10v1h-10zM88 51h3v1h-3zM92 51h2v1h-2zM95 51h3v1h-3zM99 51h2v1h-2zM102 51h2v1h-2zM105 51h3v1h-3zM109 51h7v1h-7zM77 52h9v1h-9zM87 52h4v1h-4zM92 52h2v1h-2zM95 52h3v1h-3zM99 52h2v1h-2zM102 52h3v1h-3zM106 52h2v1h-2zM109 52h6v1h-6zM78 53h8v1h-8zM87 53h4v1h-4zM92 53h2v1h-2zM95 53h3v1h-3zM99 53h2v1h-2zM102 53h3v1h-3zM106 53h7v1h-7zM81 54h9v1h-9zM91 54h3v1h-3zM95 54h3v1h-3zM99 54h6v1h-6zM106 54h7v1h-7zM81 55h9v1h-9zM91 55h3v1h-3zM95 55h3v1h-3zM99 55h13v1h-13zM82 56h12v1h-12zM95 56h15v1h-15zM82 57h25v1h-25zM84 58h22v1h-22zM90 59h8v1h-8zM101 59h2v1h-2z"/></svg>');
  }
  function notFound() {
    chrome({ title: "Record not found", section: "" });
    const vp = root.querySelector(".viewport");
    showPages(vp, reading(vp, [block("h1", "Record not found."), link("RETURN TO COMPANY", "company.html", "text-link phrase")]));
  }

  /* ---------- Entrance (V4) ----------
     The original 160×61 Freeman script is the identity; navigation sits beneath it as one group.
     The signature is written by hand on arrival (load, reload; signature-motion.js) and drawn
     finished after an in-site link and on Back/Forward. Selecting the script writes it again.
     Without the hand the script is shown finished and still. A colorway recolours
     the script in place; it never restarts the animation. The bitmap is shown at a whole number of
     device pixels per bitmap pixel, so every pixel of the script is the same size. */
  const COLORWAYS = [["chalk", "Light"], ["umber", "Dark"], ["sand", "Freeman"]];
  function entrance({ play = true } = {}) {
    const nav = DESTINATIONS.map(([t, u]) => link(t, u, "", { "data-entry": "1" })).join('<span class="sep" aria-hidden="true">/</span>');
    const ways = COLORWAYS.map(([id, name]) =>
      `<button type="button" class="v4-way v4-way-${id}" data-v4-color="${id}" aria-label="${name} colorway" aria-pressed="${id === palette}"></button>`).join("");
    root.innerHTML = `<div class="v4-home">
      <h1 class="sr-only">Freeman General Contracting</h1>
      <div class="v4-home-identity">
        <button type="button" class="v4-home-mark" aria-label="Replay the Freeman script"><canvas id="v4-pixel-mark" width="160" height="61" aria-hidden="true"></canvas><svg class="era-smooth-mark" viewBox="0 0 160 61" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" d="M56.750,3.613C57.312,3.475 58.083,3.582 58.750,3.575C59.417,3.569 60.125,3.526 60.750,3.575C61.375,3.624 62.190,3.591 62.500,3.871C62.810,4.150 62.756,4.848 62.610,5.250C62.464,5.652 62.037,6.015 61.625,6.285C61.213,6.556 60.597,6.657 60.139,6.875C59.680,7.093 59.398,7.468 58.875,7.593C58.352,7.719 57.623,7.582 57.000,7.629C56.377,7.676 55.655,7.713 55.134,7.875C54.613,8.037 54.397,8.475 53.875,8.603C53.353,8.732 52.646,8.635 52.000,8.643C51.354,8.652 50.562,8.543 50.000,8.655C49.438,8.768 49.021,9.045 48.625,9.316C48.229,9.586 48.036,10.018 47.625,10.278C47.214,10.538 46.573,10.621 46.156,10.875C45.740,11.129 45.464,11.474 45.125,11.803C44.786,12.132 44.383,12.442 44.125,12.850C43.867,13.258 43.830,13.832 43.580,14.250C43.330,14.668 42.951,15.004 42.625,15.357C42.299,15.709 41.930,16.009 41.625,16.366C41.320,16.723 41.043,17.084 40.793,17.500C40.543,17.916 40.402,18.467 40.125,18.863C39.848,19.259 39.458,19.540 39.133,19.875C38.807,20.210 38.425,20.479 38.170,20.875C37.915,21.271 37.754,21.803 37.601,22.250C37.447,22.697 37.017,23.306 37.250,23.559C37.483,23.812 38.508,23.861 39.000,23.768C39.492,23.675 39.724,23.146 40.203,23.000C40.682,22.854 41.461,22.702 41.875,22.890C42.289,23.077 42.695,23.732 42.689,24.125C42.683,24.518 42.148,24.896 41.841,25.250C41.535,25.604 41.182,25.917 40.850,26.250C40.519,26.583 40.264,26.992 39.851,27.250C39.439,27.508 38.809,27.851 38.375,27.798C37.941,27.745 37.628,27.188 37.250,26.930C36.872,26.672 36.521,26.259 36.104,26.250C35.688,26.241 35.187,26.648 34.750,26.877C34.313,27.106 33.828,27.292 33.485,27.625C33.143,27.958 32.947,28.458 32.695,28.875C32.442,29.292 32.256,29.750 31.971,30.125C31.686,30.500 31.315,30.792 30.985,31.125C30.655,31.458 30.325,31.791 29.994,32.125C29.663,32.459 29.332,32.792 29.000,33.127C28.668,33.462 28.333,33.800 28.000,34.136C27.667,34.472 27.333,34.808 27.000,35.145C26.667,35.481 26.333,35.817 26.000,36.153C25.667,36.489 25.366,36.852 25.000,37.160C24.634,37.468 24.223,37.744 23.806,38.000C23.390,38.256 22.884,38.420 22.500,38.697C22.116,38.974 21.908,39.403 21.500,39.661C21.092,39.920 20.492,40.026 20.054,40.250C19.617,40.474 19.372,40.838 18.875,41.005C18.378,41.171 17.573,41.082 17.073,41.250C16.573,41.418 16.408,41.874 15.875,42.015C15.342,42.156 14.542,42.082 13.875,42.096C13.208,42.109 12.542,42.096 11.875,42.096C11.208,42.096 10.542,42.098 9.875,42.096C9.208,42.094 8.441,42.185 7.875,42.086C7.309,41.987 6.876,41.764 6.476,41.500C6.076,41.236 5.806,40.833 5.473,40.500C5.141,40.167 4.788,39.854 4.480,39.500C4.171,39.146 3.780,38.896 3.622,38.375C3.465,37.854 3.453,36.950 3.537,36.375C3.620,35.800 3.839,35.310 4.125,34.925C4.411,34.540 4.777,34.200 5.250,34.067C5.723,33.933 6.582,33.886 6.965,34.125C7.347,34.364 7.465,34.958 7.547,35.500C7.629,36.042 7.538,36.833 7.458,37.375C7.378,37.917 6.914,38.412 7.067,38.750C7.220,39.088 7.928,39.188 8.375,39.405C8.822,39.622 9.188,39.941 9.750,40.051C10.312,40.162 11.083,40.063 11.750,40.066C12.417,40.068 13.146,40.120 13.750,40.066C14.354,40.012 14.875,39.918 15.375,39.744C15.875,39.569 16.314,39.267 16.750,39.018C17.186,38.769 17.556,38.464 17.993,38.250C18.431,38.036 18.918,37.942 19.375,37.733C19.832,37.525 20.321,37.247 20.737,37.000C21.154,36.753 21.520,36.542 21.876,36.250C22.233,35.958 22.542,35.582 22.875,35.247C23.208,34.911 23.542,34.574 23.875,34.238C24.208,33.902 24.542,33.566 24.875,33.230C25.208,32.894 25.542,32.558 25.875,32.222C26.208,31.885 26.542,31.550 26.875,31.213C27.208,30.877 27.580,30.571 27.875,30.202C28.170,29.833 28.395,29.426 28.645,29.000C28.895,28.574 29.253,28.128 29.375,27.645C29.497,27.163 29.375,26.596 29.375,26.106C29.375,25.616 29.167,25.074 29.375,24.704C29.583,24.334 30.135,24.066 30.625,23.886C31.115,23.706 31.859,23.835 32.314,23.625C32.770,23.415 33.097,23.022 33.357,22.625C33.617,22.228 33.625,21.660 33.875,21.243C34.125,20.827 34.529,20.478 34.858,20.125C35.187,19.772 35.550,19.479 35.849,19.125C36.148,18.771 36.399,18.417 36.650,18.000C36.900,17.583 37.071,17.021 37.352,16.625C37.633,16.229 38.007,15.958 38.337,15.625C38.666,15.292 39.003,14.958 39.328,14.625C39.654,14.292 40.032,14.029 40.290,13.625C40.548,13.221 40.626,12.617 40.875,12.200C41.124,11.783 41.466,11.471 41.782,11.125C42.097,10.779 42.512,10.500 42.768,10.125C43.023,9.750 43.378,9.253 43.313,8.875C43.247,8.497 42.844,8.066 42.375,7.859C41.906,7.651 41.146,7.669 40.500,7.631C39.854,7.593 39.167,7.631 38.500,7.631C37.833,7.631 37.167,7.631 36.500,7.631C35.833,7.631 35.109,7.570 34.500,7.631C33.891,7.693 33.345,7.824 32.845,8.000C32.345,8.176 31.933,8.441 31.500,8.685C31.067,8.930 30.688,9.231 30.250,9.468C29.812,9.704 29.198,9.768 28.875,10.107C28.552,10.445 28.505,11.039 28.315,11.500C28.124,11.961 27.700,12.452 27.731,12.875C27.762,13.298 28.205,13.678 28.500,14.040C28.795,14.401 29.104,14.763 29.500,15.044C29.896,15.325 30.372,15.669 30.875,15.724C31.378,15.779 32.018,15.539 32.518,15.375C33.018,15.211 33.387,14.781 33.875,14.740C34.363,14.698 35.206,14.832 35.446,15.125C35.686,15.418 35.576,16.170 35.314,16.500C35.052,16.830 34.339,16.895 33.875,17.104C33.411,17.312 33.074,17.639 32.532,17.750C31.990,17.861 31.276,17.765 30.625,17.768C29.974,17.771 29.236,17.812 28.625,17.767C28.014,17.722 27.413,17.711 26.956,17.500C26.500,17.289 26.219,16.833 25.886,16.500C25.552,16.167 25.161,15.958 24.953,15.500C24.746,15.042 24.690,14.375 24.642,13.750C24.594,13.125 24.544,12.299 24.666,11.750C24.788,11.201 25.090,10.842 25.375,10.458C25.660,10.073 26.042,9.780 26.375,9.444C26.708,9.107 27.042,8.773 27.375,8.437C27.708,8.101 28.000,7.731 28.375,7.430C28.750,7.128 29.208,6.875 29.625,6.627C30.042,6.379 30.396,6.111 30.875,5.940C31.354,5.769 31.896,5.659 32.500,5.602C33.104,5.546 33.833,5.601 34.500,5.601C35.167,5.601 35.833,5.601 36.500,5.601C37.167,5.601 37.833,5.601 38.500,5.601C39.167,5.601 39.833,5.599 40.500,5.601C41.167,5.603 41.938,5.510 42.500,5.614C43.062,5.717 43.375,6.056 43.875,6.223C44.375,6.390 44.896,6.552 45.500,6.616C46.104,6.679 46.934,6.708 47.500,6.606C48.066,6.503 48.397,6.169 48.897,6.000C49.397,5.831 50.000,5.761 50.500,5.594C51.000,5.427 51.397,5.167 51.897,5.000C52.397,4.833 52.920,4.689 53.500,4.590C54.080,4.490 54.833,4.565 55.375,4.403C55.917,4.240 56.188,3.751 56.750,3.613ZM45.750,22.865C46.215,22.804 47.040,22.850 47.415,23.125C47.790,23.400 47.736,24.107 48.000,24.512C48.264,24.917 48.591,25.288 49.000,25.557C49.409,25.825 50.041,25.864 50.453,26.125C50.865,26.386 51.298,26.704 51.473,27.125C51.647,27.546 51.618,28.169 51.500,28.648C51.382,29.127 51.016,29.573 50.766,30.000C50.516,30.427 50.287,30.833 50.000,31.208C49.713,31.583 49.294,31.836 49.044,32.250C48.794,32.664 48.753,33.274 48.500,33.691C48.247,34.107 47.817,34.365 47.528,34.750C47.238,35.135 47.006,35.583 46.764,36.000C46.521,36.417 46.185,36.792 46.074,37.250C45.963,37.708 45.838,38.515 46.096,38.750C46.355,38.985 47.204,38.837 47.625,38.661C48.046,38.486 48.247,37.975 48.625,37.698C49.003,37.421 49.475,37.257 49.892,37.000C50.309,36.743 50.804,36.508 51.125,36.153C51.446,35.799 51.565,35.290 51.815,34.875C52.065,34.460 52.334,34.037 52.625,33.662C52.916,33.287 53.312,33.042 53.562,32.625C53.812,32.208 53.869,31.579 54.125,31.163C54.381,30.746 54.772,30.465 55.100,30.125C55.428,29.785 55.761,29.458 56.092,29.125C56.422,28.792 56.752,28.458 57.083,28.125C57.414,27.792 57.735,27.455 58.075,27.125C58.415,26.795 58.718,26.393 59.125,26.143C59.532,25.893 60.072,25.836 60.515,25.625C60.958,25.414 61.349,25.124 61.784,24.875C62.219,24.626 62.631,24.297 63.125,24.130C63.619,23.962 64.271,23.804 64.750,23.868C65.229,23.933 65.655,24.201 66.000,24.515C66.345,24.829 66.679,25.211 66.820,25.750C66.962,26.289 66.964,27.188 66.850,27.750C66.737,28.312 66.424,28.729 66.141,29.125C65.859,29.521 65.484,29.792 65.154,30.125C64.824,30.458 64.518,30.825 64.159,31.125C63.800,31.425 63.418,31.672 63.000,31.922C62.582,32.172 62.152,32.447 61.652,32.625C61.152,32.803 60.500,32.822 60.000,32.989C59.500,33.156 59.149,33.456 58.653,33.625C58.157,33.794 57.488,33.812 57.025,34.000C56.562,34.188 56.178,34.402 55.875,34.756C55.572,35.110 55.388,35.626 55.209,36.125C55.030,36.624 54.838,37.173 54.804,37.750C54.769,38.327 54.717,39.247 55.000,39.590C55.283,39.933 56.042,39.890 56.500,39.808C56.958,39.725 57.250,39.260 57.750,39.093C58.250,38.927 59.000,38.979 59.500,38.807C60.000,38.635 60.333,38.301 60.750,38.059C61.167,37.817 61.625,37.639 62.000,37.355C62.375,37.071 62.667,36.688 63.000,36.353C63.333,36.018 63.667,35.681 64.000,35.344C64.333,35.008 64.667,34.672 65.000,34.336C65.333,34.001 65.667,33.665 66.000,33.329C66.333,32.993 66.695,32.686 67.000,32.319C67.305,31.951 67.581,31.541 67.831,31.125C68.081,30.709 68.222,30.210 68.500,29.823C68.778,29.437 69.167,29.144 69.500,28.806C69.833,28.469 70.167,28.134 70.500,27.798C70.833,27.462 71.146,27.100 71.500,26.791C71.854,26.482 72.208,26.195 72.625,25.944C73.042,25.693 73.542,25.489 74.000,25.287C74.458,25.084 74.938,24.953 75.375,24.728C75.812,24.502 76.125,24.057 76.625,23.932C77.125,23.807 77.904,23.823 78.375,23.980C78.846,24.137 79.115,24.556 79.449,24.875C79.782,25.194 80.262,25.487 80.375,25.892C80.488,26.297 80.256,26.830 80.125,27.306C79.994,27.782 79.840,28.342 79.590,28.750C79.340,29.158 78.953,29.422 78.625,29.756C78.297,30.090 77.975,30.422 77.625,30.754C77.275,31.086 76.943,31.495 76.526,31.750C76.110,32.005 75.582,32.076 75.125,32.284C74.668,32.492 74.215,32.756 73.785,33.000C73.356,33.244 73.056,33.586 72.550,33.750C72.044,33.914 71.319,33.882 70.750,33.986C70.181,34.090 69.494,34.081 69.134,34.375C68.774,34.669 68.795,35.292 68.589,35.750C68.382,36.208 67.953,36.604 67.893,37.125C67.834,37.646 67.986,38.445 68.233,38.875C68.480,39.305 68.956,39.668 69.375,39.703C69.794,39.738 70.296,39.307 70.750,39.085C71.204,38.864 71.641,38.583 72.099,38.375C72.558,38.167 73.088,38.088 73.500,37.838C73.912,37.588 74.226,37.202 74.570,36.875C74.913,36.548 75.231,36.208 75.561,35.875C75.891,35.542 76.221,35.208 76.551,34.875C76.881,34.542 77.212,34.208 77.543,33.875C77.873,33.542 78.207,33.209 78.533,32.875C78.859,32.541 79.238,32.286 79.500,31.869C79.762,31.453 79.855,30.796 80.105,30.375C80.355,29.954 80.684,29.681 81.000,29.344C81.316,29.008 81.667,28.688 82.000,28.355C82.333,28.022 82.667,27.678 83.000,27.345C83.333,27.013 83.599,26.627 84.000,26.361C84.401,26.095 84.988,26.004 85.405,25.750C85.822,25.496 86.130,25.137 86.500,24.837C86.870,24.537 87.146,24.095 87.625,23.949C88.104,23.803 88.896,23.806 89.375,23.959C89.854,24.112 90.131,24.569 90.500,24.868C90.869,25.166 91.174,25.665 91.591,25.750C92.008,25.835 92.532,25.542 93.003,25.375C93.474,25.208 93.981,24.985 94.418,24.750C94.855,24.515 95.132,24.097 95.625,23.963C96.118,23.829 96.896,23.802 97.375,23.946C97.854,24.090 98.127,24.528 98.500,24.829C98.873,25.129 99.115,25.596 99.613,25.750C100.110,25.904 100.982,25.878 101.484,25.750C101.986,25.622 102.198,25.214 102.625,24.984C103.052,24.755 103.565,24.563 104.044,24.375C104.524,24.187 105.007,23.870 105.500,23.856C105.993,23.843 106.594,24.042 107.000,24.295C107.406,24.548 107.756,24.883 107.937,25.375C108.118,25.867 108.077,26.607 108.087,27.250C108.098,27.893 108.140,28.709 108.000,29.234C107.860,29.759 107.477,29.959 107.250,30.399C107.023,30.839 106.902,31.462 106.640,31.875C106.379,32.288 106.002,32.542 105.679,32.875C105.355,33.208 104.976,33.479 104.697,33.875C104.418,34.271 104.247,34.823 104.006,35.250C103.765,35.677 103.461,36.002 103.250,36.440C103.039,36.877 102.760,37.449 102.739,37.875C102.718,38.301 102.790,38.839 103.125,38.993C103.460,39.147 104.312,38.985 104.750,38.798C105.188,38.612 105.417,38.197 105.750,37.875C106.083,37.553 106.417,37.204 106.750,36.868C107.083,36.531 107.417,36.203 107.750,35.858C108.083,35.514 108.492,35.215 108.750,34.801C109.008,34.387 109.045,33.792 109.295,33.375C109.545,32.958 109.924,32.648 110.250,32.300C110.576,31.953 110.948,31.653 111.250,31.291C111.552,30.928 111.814,30.541 112.064,30.125C112.314,29.709 112.469,29.187 112.750,28.797C113.031,28.406 113.396,28.089 113.750,27.781C114.104,27.474 114.459,27.206 114.875,26.951C115.291,26.696 115.848,26.529 116.244,26.250C116.640,25.971 116.853,25.535 117.250,25.280C117.647,25.025 118.188,24.945 118.625,24.720C119.062,24.494 119.354,24.072 119.875,23.928C120.396,23.783 121.198,23.779 121.750,23.854C122.302,23.929 122.710,24.230 123.190,24.375C123.669,24.520 124.177,24.795 124.625,24.724C125.073,24.652 125.458,23.956 125.875,23.947C126.292,23.939 126.938,24.254 127.125,24.673C127.312,25.091 127.146,25.966 127.000,26.460C126.854,26.953 126.486,27.209 126.250,27.633C126.014,28.056 125.857,28.605 125.582,29.000C125.307,29.395 124.928,29.665 124.602,30.000C124.275,30.335 123.891,30.595 123.625,31.012C123.359,31.428 123.253,32.082 123.003,32.500C122.753,32.918 122.417,33.164 122.125,33.521C121.833,33.879 121.500,34.223 121.250,34.644C121.000,35.065 120.896,35.639 120.625,36.049C120.354,36.458 119.812,36.682 119.625,37.099C119.438,37.517 119.326,38.403 119.500,38.554C119.674,38.704 120.307,38.259 120.667,38.000C121.028,37.741 121.327,37.333 121.662,37.000C121.996,36.667 122.339,36.333 122.674,36.000C123.008,35.667 123.340,35.333 123.671,35.000C124.002,34.667 124.331,34.333 124.661,34.000C124.991,33.667 125.324,33.333 125.652,33.000C125.980,32.667 126.358,32.396 126.628,32.000C126.898,31.604 127.020,31.042 127.270,30.625C127.520,30.208 127.817,29.855 128.126,29.500C128.436,29.145 128.792,28.829 129.125,28.493C129.458,28.157 129.792,27.820 130.125,27.486C130.458,27.152 130.729,26.767 131.125,26.488C131.521,26.209 132.083,26.067 132.500,25.811C132.917,25.555 133.252,25.255 133.625,24.953C133.998,24.651 134.281,24.176 134.739,24.000C135.198,23.824 135.894,23.772 136.375,23.897C136.856,24.022 137.249,24.457 137.624,24.750C137.999,25.043 138.208,25.531 138.625,25.654C139.042,25.776 139.646,25.628 140.125,25.487C140.604,25.345 141.062,25.050 141.500,24.805C141.938,24.559 142.271,24.166 142.750,24.014C143.229,23.861 143.896,23.775 144.375,23.891C144.854,24.007 145.250,24.405 145.625,24.710C146.000,25.016 146.350,25.343 146.625,25.724C146.900,26.106 147.215,26.510 147.278,27.000C147.340,27.490 147.167,28.163 147.000,28.663C146.833,29.163 146.526,29.574 146.276,30.000C146.026,30.426 145.787,30.844 145.500,31.219C145.213,31.594 144.803,31.836 144.553,32.250C144.303,32.664 144.253,33.288 144.000,33.705C143.747,34.121 143.326,34.367 143.038,34.750C142.750,35.133 142.516,35.583 142.273,36.000C142.031,36.417 141.695,36.792 141.584,37.250C141.472,37.708 141.348,38.512 141.605,38.750C141.862,38.988 142.651,38.802 143.125,38.677C143.599,38.552 144.031,38.250 144.447,38.000C144.864,37.750 145.262,37.484 145.625,37.180C145.988,36.875 146.292,36.509 146.625,36.173C146.958,35.837 147.292,35.500 147.625,35.164C147.958,34.828 148.292,34.493 148.625,34.156C148.958,33.819 149.341,33.522 149.625,33.141C149.909,32.761 150.081,32.289 150.331,31.875C150.581,31.461 150.784,30.975 151.125,30.655C151.466,30.335 151.833,30.070 152.375,29.955C152.917,29.840 153.833,29.834 154.375,29.965C154.917,30.097 155.301,30.407 155.625,30.746C155.949,31.085 156.200,31.458 156.320,32.000C156.440,32.542 156.347,33.333 156.346,34.000C156.346,34.667 156.438,35.452 156.318,36.000C156.198,36.548 155.792,36.786 155.625,37.286C155.458,37.786 155.482,38.493 155.315,39.000C155.149,39.507 154.828,39.871 154.625,40.330C154.422,40.788 154.347,41.335 154.097,41.750C153.847,42.165 153.454,42.474 153.125,42.821C152.796,43.168 152.421,43.469 152.125,43.832C151.829,44.195 151.635,44.618 151.348,45.000C151.060,45.382 150.770,45.815 150.400,46.125C150.029,46.435 149.504,46.578 149.125,46.859C148.746,47.141 148.529,47.563 148.125,47.815C147.721,48.068 147.139,48.154 146.701,48.375C146.264,48.596 145.929,48.897 145.500,49.140C145.071,49.382 144.625,49.653 144.125,49.832C143.625,50.011 143.000,50.049 142.500,50.216C142.000,50.383 141.625,50.665 141.125,50.832C140.625,50.999 140.104,51.153 139.500,51.217C138.896,51.281 138.129,51.191 137.500,51.217C136.871,51.244 136.229,51.219 135.729,51.375C135.229,51.531 135.038,52.012 134.500,52.154C133.962,52.297 133.167,52.218 132.500,52.231C131.833,52.244 131.167,52.231 130.500,52.231C129.833,52.231 129.167,52.231 128.500,52.231C127.833,52.231 127.167,52.231 126.500,52.231C125.833,52.231 125.167,52.231 124.500,52.231C123.833,52.231 123.167,52.231 122.500,52.231C121.833,52.231 121.167,52.231 120.500,52.231C119.833,52.231 119.167,52.231 118.500,52.231C117.833,52.231 117.142,52.207 116.500,52.231C115.858,52.255 115.148,52.224 114.648,52.375C114.148,52.526 114.025,52.991 113.500,53.136C112.975,53.281 112.167,53.227 111.500,53.245C110.833,53.263 110.167,53.245 109.500,53.245C108.833,53.245 108.167,53.245 107.500,53.245C106.833,53.245 106.167,53.245 105.500,53.245C104.833,53.245 104.167,53.245 103.500,53.245C102.833,53.245 102.167,53.245 101.500,53.245C100.833,53.245 100.167,53.245 99.500,53.245C98.833,53.245 98.167,53.245 97.500,53.245C96.833,53.245 96.167,53.245 95.500,53.245C94.833,53.245 94.167,53.245 93.500,53.245C92.833,53.245 92.167,53.245 91.500,53.245C90.833,53.245 90.167,53.245 89.500,53.245C88.833,53.245 88.146,53.229 87.500,53.245C86.854,53.261 86.140,53.195 85.625,53.342C85.110,53.488 84.911,53.972 84.411,54.125C83.911,54.278 83.256,54.237 82.625,54.259C81.994,54.282 81.292,54.259 80.625,54.259C79.958,54.259 79.292,54.259 78.625,54.259C77.958,54.259 77.292,54.259 76.625,54.259C75.958,54.259 75.292,54.259 74.625,54.259C73.958,54.259 73.292,54.259 72.625,54.259C71.958,54.259 71.292,54.259 70.625,54.259C69.958,54.259 69.292,54.259 68.625,54.259C67.958,54.259 67.292,54.259 66.625,54.259C65.958,54.259 65.292,54.259 64.625,54.259C63.958,54.259 63.292,54.259 62.625,54.259C61.958,54.259 61.292,54.259 60.625,54.259C59.958,54.259 59.292,54.259 58.625,54.259C57.958,54.259 57.235,54.198 56.625,54.259C56.015,54.320 55.467,54.459 54.967,54.625C54.467,54.791 54.119,55.204 53.625,55.257C53.131,55.310 52.500,55.108 52.000,54.944C51.500,54.780 51.187,54.390 50.625,54.275C50.062,54.161 49.292,54.262 48.625,54.259C47.958,54.256 47.292,54.259 46.625,54.259C45.958,54.259 45.271,54.263 44.625,54.258C43.979,54.254 43.285,54.356 42.750,54.230C42.215,54.103 41.916,53.664 41.416,53.500C40.916,53.336 40.319,53.333 39.750,53.245C39.181,53.157 38.521,53.137 38.000,52.971C37.479,52.806 37.167,52.377 36.625,52.254C36.083,52.131 35.354,52.279 34.750,52.232C34.146,52.186 33.510,52.139 33.000,51.976C32.490,51.812 32.234,51.376 31.693,51.250C31.151,51.124 30.407,51.223 29.750,51.217C29.093,51.212 28.417,51.217 27.750,51.217C27.083,51.217 26.375,51.179 25.750,51.217C25.125,51.255 24.500,51.284 24.000,51.445C23.500,51.606 23.292,52.053 22.750,52.184C22.208,52.315 21.375,52.190 20.750,52.232C20.125,52.273 19.500,52.273 19.000,52.433C18.500,52.594 18.250,53.027 17.750,53.195C17.250,53.362 16.500,53.270 16.000,53.438C15.500,53.607 15.250,54.038 14.750,54.205C14.250,54.373 13.500,54.275 13.000,54.443C12.500,54.612 12.250,55.049 11.750,55.216C11.250,55.384 10.500,55.278 10.000,55.449C9.500,55.620 9.174,56.004 8.750,56.242C8.326,56.480 7.935,56.700 7.456,56.875C6.976,57.050 6.347,57.352 5.875,57.291C5.403,57.230 4.729,56.830 4.625,56.507C4.521,56.184 4.917,55.656 5.250,55.354C5.583,55.052 6.125,54.880 6.625,54.696C7.125,54.512 7.750,54.416 8.250,54.250C8.750,54.085 9.146,53.869 9.625,53.701C10.104,53.533 10.625,53.409 11.125,53.242C11.625,53.075 12.125,52.871 12.625,52.702C13.125,52.533 13.625,52.395 14.125,52.229C14.625,52.062 15.125,51.872 15.625,51.703C16.125,51.534 16.625,51.382 17.125,51.216C17.625,51.049 18.125,50.872 18.625,50.704C19.125,50.535 19.625,50.370 20.125,50.202C20.625,50.035 21.125,49.866 21.625,49.698C22.125,49.531 22.562,49.296 23.125,49.195C23.688,49.093 24.479,49.238 25.000,49.088C25.521,48.938 25.729,48.445 26.250,48.293C26.771,48.141 27.479,48.197 28.125,48.177C28.771,48.158 29.542,48.251 30.125,48.175C30.708,48.098 31.125,47.886 31.625,47.718C32.125,47.551 32.542,47.261 33.125,47.168C33.708,47.076 34.458,47.164 35.125,47.163C35.792,47.162 36.458,47.164 37.125,47.163C37.792,47.163 38.542,47.230 39.125,47.161C39.708,47.092 40.125,46.914 40.625,46.747C41.125,46.579 41.542,46.255 42.125,46.156C42.708,46.056 43.458,46.151 44.125,46.150C44.792,46.149 45.458,46.150 46.125,46.150C46.792,46.150 47.458,46.149 48.125,46.149C48.792,46.149 49.458,46.149 50.125,46.149C50.792,46.149 51.458,46.149 52.125,46.149C52.792,46.149 53.458,46.150 54.125,46.150C54.792,46.150 55.458,46.150 56.125,46.150C56.792,46.150 57.458,46.150 58.125,46.150C58.792,46.150 59.458,46.149 60.125,46.149C60.792,46.149 61.458,46.149 62.125,46.149C62.792,46.150 63.458,46.149 64.125,46.149C64.792,46.149 65.458,46.149 66.125,46.149C66.792,46.150 67.458,46.150 68.125,46.150C68.792,46.150 69.458,46.150 70.125,46.150C70.792,46.150 71.458,46.149 72.125,46.149C72.792,46.149 73.458,46.149 74.125,46.149C74.792,46.150 75.458,46.149 76.125,46.149C76.792,46.149 77.458,46.149 78.125,46.149C78.792,46.149 79.458,46.150 80.125,46.150C80.792,46.150 81.458,46.150 82.125,46.150C82.792,46.150 83.458,46.149 84.125,46.149C84.792,46.149 85.458,46.149 86.125,46.149C86.792,46.149 87.458,46.149 88.125,46.150C88.792,46.150 89.458,46.150 90.125,46.150C90.792,46.150 91.458,46.150 92.125,46.149C92.792,46.149 93.458,46.149 94.125,46.149C94.792,46.149 95.458,46.149 96.125,46.149C96.792,46.149 97.458,46.149 98.125,46.149C98.792,46.150 99.458,46.150 100.125,46.150C100.792,46.150 101.458,46.150 102.125,46.150C102.792,46.150 103.458,46.150 104.125,46.150C104.792,46.150 105.458,46.149 106.125,46.149C106.792,46.149 107.458,46.149 108.125,46.149C108.792,46.150 109.458,46.150 110.125,46.150C110.792,46.150 111.458,46.150 112.125,46.150C112.792,46.150 113.458,46.149 114.125,46.149C114.792,46.149 115.458,46.150 116.125,46.150C116.792,46.150 117.458,46.150 118.125,46.150C118.792,46.150 119.458,46.149 120.125,46.149C120.792,46.149 121.458,46.149 122.125,46.149C122.792,46.149 123.458,46.149 124.125,46.149C124.792,46.149 125.458,46.149 126.125,46.149C126.792,46.149 127.458,46.150 128.125,46.150C128.792,46.150 129.458,46.149 130.125,46.150C130.792,46.150 131.500,46.189 132.125,46.150C132.750,46.111 133.375,46.079 133.875,45.917C134.375,45.756 134.583,45.311 135.125,45.181C135.667,45.050 136.479,45.145 137.125,45.136C137.771,45.127 138.452,45.231 139.000,45.125C139.548,45.019 139.910,44.667 140.410,44.500C140.910,44.333 141.423,44.221 142.000,44.124C142.577,44.027 143.354,44.080 143.875,43.920C144.396,43.760 144.625,43.330 145.125,43.162C145.625,42.995 146.375,43.084 146.875,42.916C147.375,42.748 147.625,42.320 148.125,42.152C148.625,41.985 149.412,42.101 149.875,41.909C150.338,41.717 150.567,41.318 150.904,41.000C151.240,40.682 151.565,40.336 151.894,40.000C152.223,39.664 152.608,39.401 152.875,38.984C153.142,38.567 153.264,37.942 153.494,37.500C153.723,37.058 154.110,36.855 154.250,36.334C154.390,35.813 154.346,35.014 154.333,34.375C154.320,33.736 154.436,32.863 154.172,32.500C153.908,32.137 153.091,32.016 152.750,32.194C152.409,32.373 152.384,33.166 152.125,33.571C151.866,33.976 151.517,34.283 151.197,34.625C150.876,34.967 150.534,35.292 150.203,35.625C149.872,35.958 149.541,36.292 149.211,36.625C148.880,36.958 148.548,37.292 148.218,37.625C147.887,37.958 147.561,38.292 147.226,38.625C146.890,38.958 146.617,39.357 146.205,39.625C145.792,39.893 145.185,40.006 144.750,40.235C144.315,40.464 144.014,40.768 143.594,41.000C143.173,41.232 142.722,41.444 142.228,41.625C141.733,41.806 141.132,42.106 140.625,42.085C140.118,42.064 139.592,41.764 139.186,41.500C138.780,41.236 138.440,40.875 138.190,40.500C137.940,40.125 137.677,39.708 137.685,39.250C137.694,38.792 138.084,38.265 138.240,37.750C138.397,37.235 138.451,36.640 138.625,36.161C138.799,35.682 139.033,35.297 139.283,34.875C139.533,34.453 139.834,34.002 140.125,33.627C140.416,33.252 140.780,33.042 141.029,32.625C141.279,32.208 141.366,31.542 141.622,31.125C141.877,30.708 142.283,30.500 142.561,30.125C142.838,29.750 143.071,29.333 143.287,28.875C143.502,28.417 144.027,27.700 143.855,27.375C143.682,27.050 142.726,26.875 142.250,26.925C141.774,26.976 141.375,27.386 141.000,27.680C140.625,27.973 140.333,28.360 140.000,28.686C139.667,29.011 139.406,29.370 139.000,29.631C138.594,29.891 137.896,29.918 137.562,30.250C137.229,30.582 137.259,31.213 136.999,31.625C136.738,32.037 136.333,32.369 136.000,32.719C135.667,33.069 135.333,33.391 135.000,33.727C134.667,34.064 134.292,34.378 134.000,34.739C133.708,35.099 133.500,35.475 133.250,35.890C133.000,36.305 132.784,36.835 132.500,37.229C132.216,37.622 131.795,37.842 131.545,38.250C131.295,38.658 131.250,39.262 131.000,39.678C130.750,40.095 130.376,40.405 130.043,40.750C129.711,41.095 129.415,41.562 129.003,41.750C128.591,41.938 127.969,42.022 127.573,41.875C127.177,41.728 126.702,41.284 126.625,40.867C126.548,40.451 126.924,39.853 127.111,39.375C127.299,38.897 127.484,38.396 127.750,38.000C128.016,37.604 128.446,37.396 128.705,37.000C128.964,36.604 129.053,36.042 129.302,35.625C129.551,35.208 129.884,34.854 130.199,34.500C130.513,34.146 130.873,33.854 131.191,33.500C131.508,33.146 131.855,32.792 132.104,32.375C132.352,31.958 132.428,31.396 132.684,31.000C132.940,30.604 133.369,30.396 133.637,30.000C133.905,29.604 134.108,29.083 134.292,28.625C134.476,28.167 134.896,27.473 134.743,27.250C134.590,27.027 133.771,27.120 133.375,27.287C132.979,27.454 132.699,27.923 132.365,28.250C132.031,28.577 131.702,28.896 131.372,29.250C131.043,29.604 130.636,29.958 130.386,30.375C130.136,30.792 130.122,31.345 129.870,31.750C129.618,32.155 129.208,32.461 128.875,32.804C128.542,33.148 128.208,33.478 127.875,33.814C127.542,34.150 127.208,34.485 126.875,34.821C126.542,35.157 126.208,35.494 125.875,35.830C125.542,36.166 125.208,36.502 124.875,36.838C124.542,37.174 124.208,37.510 123.875,37.847C123.542,38.183 123.208,38.518 122.875,38.855C122.542,39.191 122.208,39.539 121.875,39.864C121.542,40.188 121.286,40.549 120.875,40.801C120.464,41.053 119.865,41.164 119.406,41.375C118.948,41.586 118.630,41.997 118.125,42.067C117.620,42.136 116.875,41.949 116.375,41.790C115.875,41.631 115.625,41.180 115.125,41.111C114.625,41.041 113.875,41.216 113.375,41.375C112.875,41.534 112.667,41.947 112.125,42.062C111.583,42.177 110.667,42.185 110.125,42.067C109.583,41.948 109.256,41.632 108.875,41.350C108.494,41.068 108.279,40.529 107.841,40.375C107.404,40.221 106.742,40.301 106.250,40.426C105.758,40.551 105.316,40.883 104.889,41.125C104.463,41.367 104.192,41.713 103.690,41.875C103.187,42.037 102.450,42.116 101.875,42.095C101.300,42.074 100.680,41.985 100.242,41.750C99.805,41.515 99.451,41.166 99.250,40.687C99.049,40.208 99.018,39.452 99.039,38.875C99.060,38.298 99.202,37.727 99.375,37.227C99.548,36.727 99.833,36.309 100.076,35.875C100.319,35.441 100.616,35.072 100.833,34.625C101.049,34.178 101.118,33.610 101.375,33.193C101.632,32.777 102.090,32.511 102.374,32.125C102.657,31.739 102.826,31.291 103.076,30.875C103.326,30.459 103.588,30.007 103.875,29.632C104.162,29.257 104.651,29.028 104.797,28.625C104.943,28.222 105.008,27.443 104.750,27.212C104.492,26.982 103.667,27.078 103.250,27.242C102.833,27.406 102.625,27.916 102.250,28.197C101.875,28.478 101.417,28.671 101.000,28.928C100.583,29.185 100.125,29.434 99.750,29.738C99.375,30.041 99.038,30.371 98.750,30.748C98.462,31.125 98.275,31.585 98.025,32.000C97.775,32.415 97.546,32.863 97.250,33.238C96.954,33.613 96.572,33.914 96.250,34.250C95.928,34.585 95.570,34.837 95.320,35.250C95.070,35.663 95.001,36.311 94.750,36.727C94.499,37.144 94.102,37.371 93.814,37.750C93.525,38.129 93.271,38.583 93.019,39.000C92.767,39.417 92.588,39.875 92.305,40.250C92.021,40.625 91.682,40.955 91.319,41.250C90.955,41.545 90.507,42.044 90.125,42.023C89.743,42.002 89.184,41.545 89.024,41.125C88.864,40.705 89.014,39.979 89.167,39.500C89.320,39.021 89.699,38.681 89.942,38.250C90.185,37.819 90.347,37.309 90.625,36.913C90.903,36.517 91.355,36.277 91.609,35.875C91.863,35.473 91.899,34.917 92.148,34.500C92.397,34.083 92.802,33.750 93.101,33.375C93.400,33.000 93.691,32.667 93.941,32.250C94.191,31.833 94.333,31.271 94.602,30.875C94.871,30.479 95.300,30.271 95.555,29.875C95.809,29.479 95.994,28.964 96.130,28.500C96.267,28.036 96.626,27.341 96.375,27.091C96.124,26.842 95.104,26.866 94.625,27.003C94.146,27.140 93.875,27.610 93.500,27.912C93.125,28.215 92.771,28.550 92.375,28.818C91.979,29.085 91.438,29.169 91.125,29.519C90.812,29.869 90.771,30.514 90.500,30.919C90.229,31.324 89.833,31.608 89.500,31.947C89.167,32.287 88.833,32.620 88.500,32.956C88.167,33.292 87.833,33.626 87.500,33.965C87.167,34.304 86.771,34.588 86.500,34.990C86.229,35.391 86.126,35.958 85.876,36.375C85.626,36.792 85.312,37.139 85.000,37.493C84.688,37.847 84.314,38.163 84.002,38.500C83.689,38.837 83.374,39.098 83.125,39.515C82.876,39.931 82.780,40.601 82.509,41.000C82.239,41.399 81.918,41.806 81.500,41.910C81.082,42.015 80.362,41.883 80.000,41.627C79.638,41.371 79.335,40.813 79.327,40.375C79.319,39.937 79.713,39.438 79.949,39.000C80.185,38.562 80.447,38.125 80.744,37.750C81.041,37.375 81.414,37.083 81.733,36.750C82.053,36.417 82.409,36.167 82.661,35.750C82.913,35.333 82.994,34.667 83.245,34.250C83.497,33.833 83.884,33.625 84.169,33.250C84.454,32.875 84.704,32.417 84.955,32.000C85.206,31.583 85.398,31.127 85.676,30.750C85.955,30.373 86.425,30.180 86.625,29.740C86.825,29.301 87.104,28.371 86.875,28.111C86.646,27.852 85.689,28.015 85.250,28.184C84.811,28.353 84.576,28.791 84.242,29.125C83.909,29.459 83.506,29.774 83.250,30.191C82.994,30.607 82.957,31.210 82.707,31.625C82.457,32.040 82.076,32.335 81.750,32.678C81.424,33.022 81.083,33.349 80.750,33.685C80.417,34.021 80.083,34.358 79.750,34.694C79.417,35.030 79.083,35.365 78.750,35.701C78.417,36.037 78.083,36.373 77.750,36.709C77.417,37.045 77.083,37.381 76.750,37.717C76.417,38.053 76.083,38.397 75.750,38.726C75.417,39.055 75.152,39.437 74.750,39.691C74.348,39.945 73.777,40.028 73.340,40.250C72.902,40.472 72.557,40.783 72.125,41.026C71.693,41.269 71.250,41.530 70.750,41.708C70.250,41.886 69.708,42.067 69.125,42.095C68.542,42.124 67.729,42.066 67.250,41.879C66.771,41.692 66.583,41.293 66.250,40.974C65.917,40.655 65.624,40.274 65.250,39.966C64.876,39.658 64.421,39.179 64.005,39.125C63.588,39.071 63.205,39.455 62.750,39.643C62.295,39.830 61.713,40.023 61.275,40.250C60.838,40.477 60.546,40.773 60.125,41.007C59.704,41.241 59.250,41.473 58.750,41.654C58.250,41.835 57.729,42.021 57.125,42.093C56.521,42.166 55.696,42.186 55.125,42.087C54.554,41.988 54.177,41.701 53.697,41.500C53.218,41.299 52.611,41.194 52.250,40.881C51.889,40.569 51.864,39.782 51.530,39.625C51.197,39.468 50.696,39.791 50.250,39.937C49.804,40.082 49.314,40.298 48.856,40.500C48.398,40.702 47.934,40.907 47.500,41.147C47.066,41.388 46.771,41.786 46.250,41.943C45.729,42.101 44.938,42.165 44.375,42.093C43.812,42.021 43.223,41.839 42.875,41.511C42.527,41.183 42.453,40.606 42.285,40.125C42.116,39.644 41.805,39.074 41.862,38.625C41.919,38.176 42.461,37.931 42.625,37.431C42.789,36.931 42.662,36.113 42.847,35.625C43.032,35.137 43.441,34.868 43.737,34.500C44.033,34.132 44.376,33.832 44.625,33.415C44.874,32.999 44.970,32.403 45.230,32.000C45.490,31.597 45.916,31.396 46.184,31.000C46.451,30.604 46.597,30.062 46.836,29.625C47.076,29.188 47.573,28.810 47.621,28.375C47.669,27.940 47.437,27.175 47.125,27.016C46.813,26.856 46.127,27.171 45.750,27.419C45.373,27.666 45.114,28.085 44.864,28.500C44.614,28.915 44.519,29.501 44.250,29.908C43.981,30.314 43.583,30.595 43.250,30.937C42.917,31.280 42.521,31.556 42.250,31.962C41.979,32.369 41.876,32.958 41.626,33.375C41.376,33.792 41.063,34.117 40.750,34.467C40.437,34.817 40.062,35.137 39.750,35.476C39.438,35.816 39.125,36.086 38.875,36.504C38.625,36.922 38.518,37.567 38.250,37.983C37.982,38.399 37.596,38.664 37.267,39.000C36.938,39.336 36.606,39.667 36.276,40.000C35.945,40.333 35.622,40.682 35.285,41.000C34.947,41.318 34.652,41.809 34.250,41.908C33.848,42.008 33.042,41.909 32.875,41.595C32.708,41.280 33.021,40.454 33.250,40.021C33.479,39.589 33.918,39.339 34.250,39.002C34.582,38.665 34.916,38.334 35.243,38.000C35.569,37.666 35.951,37.396 36.212,37.000C36.473,36.604 36.560,36.042 36.809,35.625C37.058,35.208 37.391,34.854 37.706,34.500C38.021,34.146 38.381,33.854 38.698,33.500C39.015,33.146 39.360,32.792 39.609,32.375C39.858,31.958 39.933,31.396 40.191,31.000C40.449,30.604 40.832,30.333 41.156,30.000C41.480,29.667 41.862,29.396 42.137,29.000C42.412,28.604 42.563,28.062 42.806,27.625C43.049,27.188 43.433,26.875 43.594,26.375C43.755,25.875 43.600,25.106 43.772,24.625C43.944,24.144 44.295,23.782 44.625,23.489C44.955,23.196 45.285,22.925 45.750,22.865ZM120.375,26.341C120.016,26.078 119.429,26.688 119.000,26.922C118.571,27.157 118.169,27.445 117.804,27.750C117.439,28.055 117.140,28.417 116.811,28.750C116.481,29.083 116.108,29.375 115.825,29.750C115.542,30.125 115.364,30.583 115.113,31.000C114.861,31.417 114.607,31.870 114.317,32.250C114.027,32.630 113.625,32.866 113.375,33.282C113.125,33.699 113.026,34.297 112.815,34.750C112.605,35.203 112.352,35.572 112.112,36.000C111.872,36.428 111.536,36.840 111.375,37.319C111.214,37.798 111.023,38.516 111.148,38.875C111.273,39.234 111.712,39.471 112.125,39.475C112.538,39.478 113.201,39.144 113.625,38.898C114.049,38.652 114.332,38.316 114.667,38.000C115.002,37.684 115.371,37.403 115.635,37.000C115.899,36.597 116.001,35.998 116.250,35.581C116.499,35.164 116.817,34.847 117.130,34.500C117.442,34.153 117.808,33.850 118.125,33.496C118.442,33.142 118.784,32.793 119.034,32.375C119.284,31.957 119.360,31.394 119.625,30.989C119.890,30.584 120.371,30.357 120.625,29.942C120.879,29.528 121.193,29.100 121.152,28.500C121.110,27.900 120.734,26.604 120.375,26.341ZM75.625,26.984C75.250,26.893 74.854,27.523 74.500,27.834C74.146,28.145 73.825,28.510 73.500,28.850C73.175,29.190 72.611,29.546 72.549,29.875C72.486,30.204 72.832,30.804 73.125,30.825C73.418,30.846 73.932,30.292 74.307,30.000C74.682,29.708 74.968,29.344 75.375,29.075C75.782,28.805 76.708,28.730 76.750,28.382C76.792,28.034 76.000,27.076 75.625,26.984ZM62.250,27.121C61.902,27.164 61.583,27.693 61.250,28.009C60.917,28.325 60.573,28.664 60.250,29.017C59.927,29.369 59.298,29.836 59.313,30.125C59.329,30.414 60.000,30.792 60.343,30.750C60.687,30.708 61.036,30.187 61.375,29.873C61.714,29.559 62.047,29.219 62.375,28.865C62.703,28.511 63.361,28.041 63.341,27.750C63.320,27.459 62.598,27.078 62.250,27.121Z"/></svg></button>
        <nav class="v4-home-nav" aria-label="Main">${nav}</nav>
      </div>
      <a class="client-access-entry phrase" href="client-access.html" aria-label="Access">ACCESS ↗</a>
      <div class="legal">FREEMAN GENERAL CONTRACTING<br>CARTERSVILLE, GEORGIA</div>
      <div class="era-switch" role="group" aria-label="Site era">
        <button type="button" data-era-choice="1990" aria-pressed="${document.documentElement.dataset.era === '1990'}">1990</button>
        <span aria-hidden="true">/</span>
        <button type="button" data-era-choice="2026" aria-pressed="${document.documentElement.dataset.era === '2026'}">2026</button>
      </div>
      <div class="mark">BUILT FOR GENERATIONS™</div>
    </div>`;
    root.querySelectorAll('[data-era-choice]').forEach(btn=>btn.addEventListener('click',()=>{
      const era=btn.dataset.eraChoice;
      if(document.documentElement.dataset.era===era)return;
      document.documentElement.dataset.era=era;
      try{localStorage.setItem('freeman-era',era)}catch(_){}
      root.querySelectorAll('[data-era-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.eraChoice===era)));
      fit();
    }));
    const home = root.querySelector(".v4-home");
    const canvas = root.querySelector("#v4-pixel-mark");
    function fit() {
      // Bitmap pixel size: a whole number of device pixels, nearest to the composed width.
      const dpr = window.devicePixelRatio || 1;
      const phone = matchMedia(PHONE).matches;
      const target = phone ? innerWidth * 0.72 : Math.min(innerWidth * 0.34, innerHeight * 0.73);
      const limit = phone ? innerWidth - 40 : Math.min(innerWidth * 0.5, innerHeight * 0.9);
      let n = Math.max(1, Math.round((target * dpr) / 160));
      while (n > 1 && (160 * n) / dpr > limit) n--;
      // Low-density narrow screens (a 1× window under 400px) have no whole step near the target:
      // keep the composed size there rather than shrinking the script to a stamp.
      if ((160 * n) / dpr < target * 0.75) n = (target * dpr) / 160;
      home.style.setProperty("--px", n / dpr + "px");
      // Place the group on whole device pixels: a half-pixel offset would blur the bitmap.
      const snap = (v) => Math.round(v * dpr) / dpr;
      const group = home.querySelector(".v4-home-identity");
      home.style.setProperty("--x", snap((innerWidth - (160 * n) / dpr) / 2) + "px");
      home.style.setProperty("--y", snap(innerHeight * (phone ? 0.48 : 0.5) - group.offsetHeight / 2) + "px");
    }
    fit();
    // Pages that don't carry the signature scripts (project pages) load them on the way here.
    let mark = null, live = true;
    const button = root.querySelector(".v4-home-mark");
    const attach = () => {
      if (!live || mark) return;
      mark = mountSignature(canvas, play);
      button.disabled = !mark;
    };
    button.disabled = true;
    button.addEventListener("click", () => {
      if(document.documentElement.dataset.era==='2026') {
        if(!matchMedia('(prefers-reduced-motion:reduce)').matches)
          button.querySelector('.era-smooth-mark').animate([{opacity:0},{opacity:1}],{duration:450,easing:'ease-out'});
      } else if(mark) mark.replay();
    });
    if (window.FreemanSignature || window.FreemanPixelMark) attach();
    else loadSignature().then(attach);
    root.querySelectorAll("[data-v4-color]").forEach((btn) => btn.addEventListener("click", () => {
      if (btn.dataset.v4Color !== palette) choosePalette(btn.dataset.v4Color);
      root.querySelectorAll("[data-v4-color]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v4Color === palette)));
      if (mark) mark.paint();
    }));
    words(root.querySelector(".legal"));
    words(root.querySelector(".mark"));
    return { resize: fit, destroy: () => { live = false; if (mark) mark.destroy(); } };
  }
  // The handwritten signature when signature-motion.js is present; otherwise the original bitmap,
  // finished and still. The retired scattered-pixel assembly is never played.
  function mountSignature(canvas, play) {
    if (window.FreemanSignature) return window.FreemanSignature.mount(canvas, { play });
    if (!window.FreemanPixelMark) return null;
    const still = window.FreemanPixelMark.mount(canvas, { play: false });
    return { replay: () => still.paint(), paint: () => still.paint(), destroy: () => still.destroy() };
  }
  // Same URLs as the entrance's script tags, so a later visit reuses the cached files.
  const SIGNATURE_SCRIPTS = ["/pixel-mark.js?v=20261018-v5-restore", "/signature-motion.js?v=20261022-hand-first-stroke-001"];
  let signatureLoad = null;
  function loadSignature() {
    const add = (src) => new Promise((done) => {
      const s = document.createElement("script");
      s.src = src; s.onload = s.onerror = done;
      document.head.append(s);
    });
    // In order: the hand reads its artwork from pixel-mark.js.
    return signatureLoad || (signatureLoad = (window.FreemanPixelMark ? Promise.resolve() : add(SIGNATURE_SCRIPTS[0]))
      .then(() => (window.FreemanSignature ? null : add(SIGNATURE_SCRIPTS[1]))));
  }
  // Back/Forward (and a document restored from history) shows the finished script.
  function arrivedByHistory() {
    try {
      const entry = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      return !!entry && entry.type === "back_forward";
    } catch (e) { return false; }
  }

  /* ---------- Fieldwork (living index lives in fieldwork-reader.js) ---------- */
  const fieldworkApi = {
    navigate: (href, opts) => navigate(href, opts),
    replaceUrl: (href) => hist.write("replaceState", { ...hist.state }, new URL(href, location.href).href),
  };

  /* ---------- Router ---------- */
  function render(route, state = {}, { nav = false, pop = false } = {}) {
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
        resize: ["company", "projects", "etcetera", "contact"].includes(route.kind) ? null : () => render(parse(location.href), { ...hist.state, focus: currentFocus() }),
      };
      if (route.kind === "entrance") Object.assign(view, entrance({ play: !pop && !nav }));
      else if (route.kind === "company") company();
      else if (route.kind === "projects") projectsIndex(state);
      else if (route.kind === "project") project(route.item);
      else if (route.kind === "contact") contact();
      else if (route.kind === "etcetera") etcetera();
      else notFound();
      document.title = (route.item ? route.item.name : TITLES[route.kind]) + " — Freeman GC";
    }
    if (nav) settleFocus(state);
  }
  function currentFocus() {
    const chosen = root.querySelector(".pi4-select[aria-pressed=\"true\"]");
    if(chosen && matchMedia("(min-width:761px)").matches) return chosen.dataset.pi4Select;
    const a = root.querySelector(".index-row.active[data-slug], .pi-row.is-current [data-slug]");
    return a ? a.dataset.slug : undefined;
  }
  /* After an in-place navigation, put keyboard focus where the visitor expects it. */
  function settleFocus(state) {
    let el = state.focus && matchMedia("(min-width:761px)").matches ? root.querySelector(`[data-pi4-select="${CSS.escape(state.focus)}"]`) : null;
    if(!el && state.focus) el = root.querySelector(`[data-slug="${CSS.escape(state.focus)}"]`);
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
    render(parse(location.href), state, { nav: true, pop: true });
  });
  // iOS Safari applies :active (the touch highlight) only when a touch listener exists.
  document.addEventListener("touchstart", () => {}, { passive: true });
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
  applyPalette([ss.get("freeman-palette"), hist.state.palette].find((p) => PALETTES.includes(p)));
  // A fresh arrival is depth 0 (CLOSE falls back to the entrance); a reload keeps its depth.
  hist.write("replaceState", { ...hist.state, fgc: 1, palette, depth: hist.state.depth || 0 }, location.href);
  render(first, hist.state, { pop: arrivedByHistory() });
})();

