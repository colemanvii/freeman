/* The Built Record — one renderer for every project that has a record (built-record/records/<slug>.js).
   Facts come from the site's existing records; the record file adds layout, drawings and captions.
   Every section draws only when its material exists, so a project with photographs alone still makes a page.

   Sections: opening · overview · architectural record (drawing set) · the build · finished work · particulars. */
(() => {
  "use strict";
  const slug = window.BR_SLUG || document.documentElement.dataset.record;
  const rec = (window.BUILT_RECORDS || {})[slug];
  const p = ((window.RECORDS || {}).projects || []).find((x) => x.slug === slug);
  const root = document.getElementById("record");
  if (!rec || !p || !root) { if (root) root.innerHTML = '<p class="br-none">This record is not available.</p>'; return; }

  const BASE = window.BR_BASE != null ? window.BR_BASE : "../"; // the site root, seen from this page
  const PHOTOS = window.RECORD_PHOTOS || {};
  const site = ((window.RECORD_SITES || {}).sites || {})[slug] || {};
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const url = (u) => BASE + String(u).replace(/^\//, "");
  const pad = (n) => String(n).padStart(2, "0");

  // ---------- photographs ----------
  const photo = (id) => { const g = rec.plates[id]; return g && PHOTOS[g.src] ? { id, ...g, ...PHOTOS[g.src] } : null; };
  const img = (ph, sizes, eager) => {
    const set = ph.set.map(([w, u]) => `${url(u)} ${w}w`).join(", ");
    const mid = (ph.set.find(([w]) => w >= 960) || ph.set[ph.set.length - 1])[1];
    return `<img src="${esc(url(mid))}" srcset="${esc(set)}" sizes="${esc(sizes)}" width="${ph.w}" height="${ph.h}" alt="${esc(ph.alt)}" decoding="async"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`;
  };
  const original = (ph) => url(ph.set[ph.set.length - 1][1]);

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
  const record = [
    ["Location", venue ? [site.address, site.area].filter(Boolean).map(esc).join("<br>") : esc(site.area || p.location)],
    ["General contractor", "Freeman General Contracting"],
    ...credits().map(([k, v]) => [k, v.map(partner).join(", ")])
  ];

  // ---------- drawings ----------
  const sheets = rec.sheets || [];
  const drawn = sheets.filter((s) => !s.reserved);
  const svg = (s, uid, extra) => `<svg class="br-lines" viewBox="0 0 ${s.w} ${s.h}" preserveAspectRatio="xMidYMid meet" ${extra || 'aria-hidden="true"'}>${s.draw(uid)}</svg>`;

  // ---------- sections ----------
  const sections = [];
  const account = (p.summary || "").trim();
  const cut = account.match(/^(.+?[.!?])\s+(\S[\s\S]*)$/);
  const lead = rec.opening && photo(rec.opening.plate);
  const leadSheet = rec.opening && drawn.find((s) => s.id === rec.opening.sheet);
  const plateCount = Object.keys(rec.plates).length;

  if (account) sections.push(["overview", "Overview", ""]);
  if (sheets.length) sections.push(["drawings", "Architectural record", `${drawn.length} ${drawn.length === 1 ? "drawing" : "drawings"}`]);
  if (rec.build) sections.push(["build", "The build", rec.build.plates.length ? `${rec.build.plates.length} photographs` : "Open"]);
  if (rec.finished) sections.push(["finished", "Finished work", `${plateCount} plates`]);
  sections.push(["particulars", "Particulars", ""]);
  const num = (id) => pad(sections.findIndex((s) => s[0] === id) + 2);
  const label = (id, extra) => { const s = sections.find((x) => x[0] === id); return `<h2 class="br-label br-micro" id="h-${id}"><b>${num(id)}</b>${esc(s[1])}${extra ? `<span>${esc(extra)}</span>` : ""}</h2>`; };

  // Opening: name and record at the left, the first plate (parted against its drawing) in the middle, contents at the right.
  const opening = () => {
    const ratio = lead ? (lead.w / lead.h).toFixed(4) : 1;
    const sizes = `(max-width:760px) 100vw, min(42vw, calc((100vh - 200px) * ${ratio}))`;
    const plate = !lead ? "" : leadSheet
      ? `<figure class="br-lead" style="--r:${ratio}"><div class="br-split" style="--seam:${rec.opening.seam}%">${img(lead, sizes, true)}<div class="br-split-dwg">${svg(leadSheet, "o-")}</div><span class="br-seam" aria-hidden="true"></span><input class="br-range" type="range" min="0" max="100" step="0.1" value="${rec.opening.seam}" aria-label="Part the sheet. Left of the line is the record drawing; right of it is the photograph."></div><figcaption class="br-micro br-twin"><span><b>${esc(leadSheet.id)}</b>${esc(leadSheet.title)}</span><span><b>${esc(lead.id)}</b>${esc(lead.caption)}</span></figcaption></figure>`
      : `<figure class="br-lead" style="--r:${ratio}">${img(lead, sizes, true)}<figcaption class="br-micro"><span><b>${esc(lead.id)}</b>${esc(lead.caption)}</span></figcaption></figure>`;
    return `<header class="br-open br-grid" data-lead="${lead && lead.w > lead.h ? "wide" : "tall"}"><div class="br-head"><p class="br-micro"><b>No. ${esc(p.id)}</b> / ${esc(p.type)}</p><h1 class="br-name">${esc(p.name)}</h1><p class="br-micro">${esc(site.area || p.location)}</p></div>${plate}<dl class="br-record">${record.map(([k, v]) => `<div><dt class="br-micro">${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl><nav class="br-contents" aria-label="Contents of this record"><p class="br-micro"><b>The Built Record</b></p><ol><li><span class="br-micro"><b>01</b>Introduction</span></li>${sections.map(([id, t, n]) => `<li><a class="br-micro" href="#${id}"><b>${num(id)}</b>${esc(t)}${n ? `<i>${esc(n)}</i>` : ""}</a></li>`).join("")}</ol></nav></header>`;
  };

  const overview = () => !account ? "" : `<section class="br-sec br-grid" id="overview" aria-labelledby="h-overview">${label("overview")}<div class="br-text"><p class="br-standfirst">${esc(cut ? cut[1] : account)}</p>${cut ? `<p class="br-body">${esc(cut[2])}</p>` : ""}</div></section>`;

  // The drawing set: a sheet to read and choose from, and a stage that shows the chosen place three ways.
  const STATES = [["drawing", "Drawing"], ["construction", "Construction"], ["completed", "Completed"]];
  const drawings = () => !sheets.length ? "" : `<section class="br-sec" id="drawings" aria-labelledby="h-drawings"><div class="br-grid">${label("drawings")}<p class="br-note">${esc(rec.drawingNote || "")}</p></div>
<div class="br-set"><div class="br-tabs" role="tablist" aria-label="Sheets">${sheets.map((s, i) => `<button class="br-micro" role="tab" type="button" id="tab-${i}" aria-selected="${i === 0}" aria-controls="br-desk" tabindex="${i === 0 ? 0 : -1}" data-sheet="${i}"><b>${esc(s.id)}</b>${esc(s.title)}${s.reserved ? "<i>Reserved</i>" : ""}</button>`).join("")}</div>
<div class="br-desk br-grid" id="br-desk" role="tabpanel"><div class="br-sheet"></div><div class="br-view"></div></div></div></section>`;

  const build = () => {
    if (!rec.build) return "";
    const b = rec.build;
    if (b.plates.length) return `<section class="br-sec" id="build" aria-labelledby="h-build"><div class="br-grid">${label("build")}</div>${spreads(b.plates)}</section>`;
    return `<section class="br-sec br-grid" id="build" aria-labelledby="h-build">${label("build", "Open")}<div class="br-text"><p class="br-body">No construction record of this project is on file, so none is shown. This part of the page opens when the material below is supplied.</p><ul class="br-wanted">${b.wanted.map((w, i) => `<li><span class="br-micro"><b>${pad(i + 1)}</b>Wanted</span>${esc(w)}</li>`).join("")}</ul></div></section>`;
  };

  // Spreads: each photograph is placed on the twelve-column sheet by the record, never by a uniform grid.
  const spreads = (rows) => rows.map((row) => `<div class="br-spread br-grid">${row.map(([id, a, b, at]) => {
    const ph = photo(id);
    if (!ph) return "";
    const span = b - a + 1;
    return `<figure class="br-plate" data-span="${span <= 4 ? "s" : span <= 6 ? "m" : "l"}" data-side="${a > 6 ? "r" : "l"}" style="--a:${a};--b:${b + 1};--at:${at || "start"}">${img(ph, `(max-width:760px) ${span <= 4 ? 64 : 100}vw, ${Math.round((span / 12) * 100)}vw`)}<figcaption class="br-micro"><b>${esc(ph.id)}</b>${esc(ph.caption)}</figcaption></figure>`;
  }).join("")}</div>`).join("");

  const finished = () => !rec.finished ? "" : `<section class="br-sec" id="finished" aria-labelledby="h-finished"><div class="br-grid">${label("finished")}</div>${spreads(rec.finished)}</section>`;

  const particulars = () => {
    const rows = [...record, ...(rec.particulars || []).map(([k, v]) => [k, esc(v)])];
    if (venue && site.lat) rows.splice(1, 0, ["Position", `${Math.abs(site.lat).toFixed(5)}° ${site.lat < 0 ? "S" : "N"}, ${Math.abs(site.lon).toFixed(5)}° ${site.lon < 0 ? "W" : "E"}`]);
    return `<section class="br-sec br-grid" id="particulars" aria-labelledby="h-particulars">${label("particulars")}<dl class="br-parts">${rows.map(([k, v]) => `<div><dt class="br-micro">${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl></section>`;
  };

  const review = () => !rec.missing ? "" : `<aside class="br-review br-grid" aria-labelledby="h-review"><h2 class="br-label br-micro" id="h-review"><b>Review</b>Not part of the published page</h2><div class="br-text"><p class="br-body">Study ${esc(rec.study || "")}. Everything above is drawn from Freeman’s published record and photographs. The items below are missing, and the page says nothing about them.</p><dl class="br-missing">${rec.missing.map(([k, v]) => `<div><dt class="br-micro">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>${(rec.particulars || []).some((x) => x[2]) ? `<p class="br-micro br-src">Sources: ${rec.particulars.filter((x) => x[2]).map(([k, , s]) => `${esc(k)}: ${esc(s)}`).join(" · ")}${site.source ? ` · Location: ${esc(site.source)}` : ""}</p>` : ""}</div></aside>`;

  const order = [...window.RECORDS.projects].sort((a, b) => Number(a.id) - Number(b.id));
  const next = order[(order.indexOf(p) + 1) % order.length];
  const foot = `<footer class="br-foot br-micro"><a href="${BASE}map.html?p=${encodeURIComponent(slug)}">← ${esc(p.name)} on the map</a><a href="${BASE}project-${esc(slug)}.html">Current published version</a><a href="${BASE}project-${esc(next.slug)}.html"><span>Next</span> ${esc(next.name)} →</a></footer>`;

  root.innerHTML = opening() + overview() + drawings() + build() + finished() + particulars() + review() + (window.BR_STANDALONE ? "" : foot);
  document.title = `${p.name} — The Built Record — Freeman GC`;

  // ---------- opening: the seam between drawing and photograph ----------
  const split = root.querySelector(".br-split");
  if (split) {
    const range = split.querySelector(".br-range");
    range.addEventListener("input", () => split.style.setProperty("--seam", range.value + "%"));
  }

  // ---------- drawing set ----------
  const desk = root.querySelector(".br-desk");
  if (desk) {
    const sheetEl = desk.querySelector(".br-sheet"), viewEl = desk.querySelector(".br-view");
    const tabs = [...root.querySelectorAll(".br-tabs [role=tab]")];
    let at = 0, key = -1, state = "completed", box = null, raf = 0;

    const stage = () => viewEl.querySelector(".br-stage svg");
    const full = (s) => [0, 0, s.w, s.h];
    // Move the stage's window on the drawing. The move is the meaning (where on the sheet), so it is short and can be turned off.
    const frame = (to, jump) => {
      const el = stage();
      if (!el) return;
      cancelAnimationFrame(raf);
      if (jump || calm.matches || !box) { box = to.slice(); el.setAttribute("viewBox", box.join(" ")); return; }
      const from = box.slice(), t0 = performance.now(), D = 420;
      const step = (now) => {
        const t = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - t, 3);
        box = from.map((v, i) => v + (to[i] - v) * e);
        el.setAttribute("viewBox", box.map((v) => v.toFixed(1)).join(" "));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const caption = () => {
      const s = sheets[at], k = s.keys[key], ph = photo(s.plate);
      const cap = viewEl.querySelector(".br-cap");
      const head = k ? `<b>${esc(s.id)}/${k.n}</b>${esc(k.name)}` : `<b>${esc(s.id)}</b>${esc(s.title)}`;
      const text = state === "construction" ? "" : state === "completed" ? (k ? k.note : ph.caption + ".") : (k ? k.note : s.sub + ".");
      const src = state === "drawing" ? `Record drawing traced from plate ${esc(ph.id)}. Not to scale.` : state === "completed" ? `Plate ${esc(ph.id)}, ${esc(ph.caption)}.` : "";
      cap.innerHTML = `<p class="br-micro br-cap-head">${head}</p>${text ? `<p class="br-cap-note">${esc(text)}</p>` : ""}${src ? `<p class="br-micro">${src}</p>` : ""}`;
    };

    const paint = () => {
      const s = sheets[at];
      viewEl.querySelector(".br-stage").dataset.state = state;
      viewEl.querySelectorAll(".br-states button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.state === state));
      sheetEl.querySelectorAll(".br-key").forEach((b, i) => b.setAttribute("aria-pressed", i === key));
      const k = s.keys[key];
      const res = viewEl.querySelector(".br-reserved");
      const bp = k && k.build;
      res.innerHTML = bp
        ? `<img src="${esc(url(bp.src))}" alt="${esc(bp.alt || "")}"><p class="br-micro">${esc([bp.date, bp.note].filter(Boolean).join(" · "))}</p>`
        : `<div><p class="br-micro"><b>Plate reserved</b></p><p class="br-res-line">No construction photograph of ${k ? "this location" : "this view"} is on file.</p><p class="br-micro">Wanted</p><p class="br-res-want">${esc((k && k.want) || "Construction photographs of what this sheet shows, with their dates.")}</p></div>`;
      viewEl.querySelector(".br-count").textContent = k ? `${k.n} / ${s.keys.length}` : `– / ${s.keys.length}`;
      caption();
    };

    const choose = (i, jump) => {
      const s = sheets[at];
      key = i;
      frame(s.keys[i] ? s.keys[i].view : full(s), jump);
      paint();
    };

    const open = (i, focus) => {
      at = i; key = -1; box = null;
      tabs.forEach((t, n) => { t.setAttribute("aria-selected", n === i); t.tabIndex = n === i ? 0 : -1; });
      if (focus) tabs[i].focus();
      desk.setAttribute("aria-labelledby", "tab-" + i);
      const s = sheets[i];
      desk.dataset.reserved = s.reserved ? "true" : "false";
      if (s.reserved) {
        sheetEl.innerHTML = `<div class="br-paper"><div class="br-blank"><div><p class="br-micro"><b>Sheet reserved</b></p><p class="br-res-line">${esc(s.title)}. Not drawn.</p><p class="br-res-want">No plan of this project is on file, and Freeman will not publish one from memory or guesswork.</p></div></div>${block(s)}</div>`;
        viewEl.innerHTML = `<div class="br-needs"><p class="br-micro"><b>To draw this sheet</b></p><ol>${s.needs.map((n, x) => `<li><span class="br-micro"><b>${pad(x + 1)}</b></span>${esc(n)}</li>`).join("")}</ol></div>`;
        return;
      }
      const ph = photo(s.plate);
      desk.style.setProperty("--sr", (s.w / s.h).toFixed(4));
      sheetEl.innerHTML = `<div class="br-paper"><div class="br-draw" style="aspect-ratio:${s.w}/${s.h}">${svg(s, "s" + i + "-")}${s.keys.map((k, n) => `<button class="br-key" type="button" aria-pressed="false" data-key="${n}" style="z-index:${1 + s.keys.filter((o) => o.view[2] * o.view[3] > k.view[2] * k.view[3]).length};left:${(k.view[0] / s.w) * 100}%;top:${(k.view[1] / s.h) * 100}%;width:${(k.view[2] / s.w) * 100}%;height:${(k.view[3] / s.h) * 100}%" aria-label="${esc(s.id)}/${k.n}, ${esc(k.name)}"><span aria-hidden="true">${k.n}</span></button>`).join("")}</div>${block(s)}</div>`;
      viewEl.innerHTML = `<div class="br-states" role="group" aria-label="Show this place as">${STATES.map(([id, t], n) => `<button class="br-micro" type="button" data-state="${id}" aria-pressed="false"><b>${String.fromCharCode(65 + n)}</b>${t}</button>`).join("")}</div>
<div class="br-stage" data-state="${state}"><svg viewBox="0 0 ${s.w} ${s.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(ph.alt)}"><image class="br-photo" href="${esc(original(ph))}" width="${s.w}" height="${s.h}"/><g class="br-lines">${s.draw("v" + i + "-")}</g></svg><div class="br-reserved"></div></div>
<div class="br-under"><div class="br-cap" aria-live="polite"></div><div class="br-step br-micro"><button type="button" data-step="-1" aria-label="Previous place on this sheet">←</button><span class="br-count"></span><button type="button" data-step="1" aria-label="Next place on this sheet">→</button></div></div>`;
      choose(s.first != null ? s.first : 0, true);
    };
    // Title block: what the sheet is, what it was made from, and what it is not.
    const block = (s) => {
      const ph = s.plate && photo(s.plate);
      return `<dl class="br-block br-micro"><div><dt>Sheet</dt><dd><b>${esc(s.id)}</b></dd></div><div><dt>Title</dt><dd><b>${esc(s.title)}</b>${s.sub ? `<br>${esc(s.sub)}` : ""}</dd></div><div><dt>Source</dt><dd>${ph ? `Traced from plate ${esc(ph.id)}` : "None on file"}</dd></div><div><dt>Scale</dt><dd>${s.reserved ? "–" : "Not to scale"}</dd></div></dl>`;
    };

    desk.addEventListener("click", (e) => {
      const k = e.target.closest(".br-key"), st = e.target.closest(".br-states button"), sp = e.target.closest("[data-step]");
      if (k) {
        choose(Number(k.dataset.key));
        // On a phone the stage sits below the sheet: bring it into the window so the choice is seen.
        const r = viewEl.getBoundingClientRect();
        if (r.top > innerHeight * 0.6) viewEl.scrollIntoView({ block: "start", behavior: calm.matches ? "auto" : "smooth" });
      }
      else if (st) { state = st.dataset.state; paint(); }
      else if (sp) { const n = sheets[at].keys.length; choose((key + Number(sp.dataset.step) + n) % n); }
    });
    root.querySelector(".br-tabs").addEventListener("click", (e) => { const t = e.target.closest("[role=tab]"); if (t) open(Number(t.dataset.sheet)); });
    root.querySelector(".br-tabs").addEventListener("keydown", (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); open((at + d + sheets.length) % sheets.length, true); }
      else if (e.key === "Home") { e.preventDefault(); open(0, true); }
      else if (e.key === "End") { e.preventDefault(); open(sheets.length - 1, true); }
    });
    open(0);
    // Open on the place the record names first (the entrance), not the first key on the sheet.
    if (rec.firstKey != null && sheets[0].keys[rec.firstKey]) choose(rec.firstKey, true);
  }
})();
