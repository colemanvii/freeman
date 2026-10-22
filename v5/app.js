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
  const { projects, archive } = window.RECORDS;
  const root = document.querySelector("#main");
  const PALETTES = ["chalk", "sand", "umber"];
  const PAPER = { chalk: "#fff9f1", sand: "#ddcfb3", umber: "#332e20" };
  const DESTINATIONS = [
    ["COMPANY", "company.html", ""],
    ["PROJECTS", "projects.html", ""],
    // NOTES temporarily hidden from public navigation; its editorial work remains archived at /etcetera.
    // RECORD is being developed privately; restore navigation only after approval.
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
        <button type="button" class="v4-home-mark" aria-label="Replay the Freeman script"><canvas id="v4-pixel-mark" width="160" height="61" aria-hidden="true"></canvas></button>
        <nav class="v4-home-nav" aria-label="Main">${nav}</nav>
      </div>
      <a class="client-access-entry phrase" href="client-access.html" aria-label="Access">ACCESS ↗</a>
      <div class="legal">FREEMAN GENERAL CONTRACTING<br>CARTERSVILLE, GEORGIA</div>
      <div class="v4-colorways" role="group" aria-label="Colorway">${ways}</div>
      <div class="mark">BUILT FOR GENERATIONS™</div>
    </div>`;
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
    button.addEventListener("click", () => mark && mark.replay());
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
  const SIGNATURE_SCRIPTS = ["/pixel-mark.js?v=20261018-v5-restore", "/signature-motion.js?v=20261022-hand-002"];
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
