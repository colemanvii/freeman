"use strict";
/*
 * Freeman GC — Project Monograph, an ETCETERA object (study 001).
 * app.js owns the route (etcetera-monograph-001), the section line with ETCETERA current, × CLOSE,
 * Escape and history. This module draws the monograph beneath that header: production's .viewport
 * frame, here the one place that scrolls, and production's sheet controls (PREV · 03 / 07 · NEXT).
 *
 *   FreemanMonograph.mount(root, data, { scroll }) → { key(e), save(), destroy() }
 *
 * The opening sheet is the project gallery's own layout (.pg) with the ETCETERA cover photograph,
 * so the picture the visitor chose is the picture that opens. A new monograph is a new data file.
 */
(() => {
  const CREDIT_SITES = {
    "Rocket Farm Restaurants": "https://www.rocketfarmrestaurants.com/",
    "Jared Swafford": "https://www.flickr.com/photos/jaredswafford/",
  };
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const statusLabel = (s) => (s === "absent" ? "Not on file" : s).toUpperCase();

  // Production's credit link (app.js creditLink), so credits read and behave identically.
  const creditLink = (name) => {
    const href = CREDIT_SITES[name];
    return href
      ? `<a class="credit-external" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)} — visit website in new tab"><span class="tap-label">${esc(name)}<span aria-hidden="true" class="credit-arrow"> ↗</span></span></a>`
      : esc(name);
  };

  // Production's hover words (app.js words).
  function words(scope) {
    const walk = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        return n.parentElement.closest("script,style,button,a,.hover-word,.phrase,.mg-status") || !/[A-Za-z0-9]/.test(n.nodeValue)
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

  function render(M) {
    const plate = (key) => M.plates[key];
    const detail = (id) => M.details.find((d) => d.id === id);
    const plateNo = (key) => pad(Object.keys(M.plates).indexOf(key) + 1);
    const credit = (role) => (M.claims.find(([k]) => k === role) || [])[1] || "";
    const shortTitle = (key) => plate(key).title.replace(/^The /, "").replace(/^./, (c) => c.toUpperCase());
    const SHEETS = ["Plate", "Account", shortTitle(M.sequence.field), shortTitle(M.sequence.wide), "Detail", "Field record", "Record"];

    const sheet = (i, body, cls = "") =>
      `<section class="mg-sheet ${cls}" data-sheet="${i}" aria-label="${pad(i + 1)} ${esc(SHEETS[i])}">${body}</section>`;
    // The margin: sheet number and name, then the sheet's own notes. Same column as the gallery's credits.
    const margin = (i, inner = "") =>
      `<header class="mg-margin"><p class="mg-folio"><span>${pad(i + 1)}</span> / ${esc(SHEETS[i]).toUpperCase()}</p>${inner}</header>`;
    const img = (p, cls = "") =>
      `<img class="${cls}" src="${esc(p.src)}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" decoding="async" draggable="false">`;
    const plateCaption = (key) => {
      const p = plate(key);
      return `<p class="mg-plate-no">PL. ${plateNo(key)} / ${esc(p.title).toUpperCase()}</p><p class="mg-caption">${esc(p.caption)}</p><p class="mg-source">PHOTOGRAPH / ${esc(credit("Photography")).toUpperCase()}<br>GALLERY ${pad(p.n)} / ${pad(Object.keys(M.plates).length)}</p>`;
    };

    // 01 — the gallery's layout (.pg), opened on the ETCETERA cover photograph.
    function opening() {
      const p = plate(M.sequence.opening);
      const credits = [["Client", credit("Client")], ["Photography", credit("Photography")]].filter(([, v]) => v);
      const contents = SHEETS.map((s, i) => `<li><button type="button" data-sheet-link="${i}"><span>${pad(i + 1)}</span>${esc(s)}</button></li>`).join("");
      return sheet(0, `<div class="pg mg-opening">
        <header class="pg-info"><p class="mg-kicker">PROJECT MONOGRAPH ${esc(M.number)}</p><h2 class="pg-name">${esc(M.name)}</h2><p class="pg-place">${esc(M.location)}</p>
          <dl class="pg-credits">${credits.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${creditLink(v)}</dd></div>`).join("")}</dl>
          <nav class="mg-contents" aria-label="Monograph sheets"><p>${pad(SHEETS.length)} SHEETS</p><ol>${contents}</ol></nav>
        </header>
        <section class="pg-stage"><div class="pg-frame"><div class="pg-track"><figure class="pg-slide">${img(p)}</figure></div></div>
          <div class="pg-controls"><button type="button" class="mg-begin" data-sheet-link="1">BEGIN ↓</button></div></section>
      </div>`, "mg-sheet-opening");
    }

    // 02 — the published account, quoted, beside the status of every fact the monograph states.
    function account() {
      const rows = M.claims.map(([k, v, s]) =>
        `<div class="mg-claim"><dt>${esc(k)}</dt><dd>${CREDIT_SITES[v] ? creditLink(v) : esc(v)}</dd><dd class="mg-status mg-status-${s}">${statusLabel(s)}</dd></div>`).join("");
      const key = Object.entries(M.statuses).map(([k, v]) => `<li><span class="mg-status mg-status-${k}">${statusLabel(k)}</span> ${esc(v)}</li>`).join("");
      return sheet(1, `${margin(1, `<p class="mg-caption">The account Freeman published for ${esc(M.name)}, quoted as published. Every statement in this monograph carries one status.</p><ul class="mg-key">${key}</ul>`)}
        <div class="mg-field mg-account">
          <p class="mg-kicker">P—${esc(M.id)} / ${esc(M.type).toUpperCase()} / ${esc(M.location).toUpperCase()}</p>
          <h2>${esc(M.name)}<span class="co4-accent">.</span></h2>
          <blockquote><p>${esc(M.account)}</p><footer>${esc(M.accountSource).toUpperCase()}</footer></blockquote>
          <dl class="mg-claims">${rows}</dl>
        </div>`);
    }

    // 03 — one photograph at full frame height, its caption in the margin.
    function field() {
      const key = M.sequence.field;
      return sheet(2, `${margin(2, plateCaption(key))}<figure class="mg-field mg-plate">${img(plate(key))}</figure>`);
    }

    // 04 — one landscape photograph across the whole frame, captioned as a production project plate.
    function wide() {
      const key = M.sequence.wide;
      const p = plate(key);
      return sheet(3, `<figure class="mg-wide">${img(p)}<figcaption class="project-plate-caption"><div class="project-plate-name">${esc(p.title)}</div><div class="project-plate-meta"><span>PL. ${plateNo(key)} / ${esc(M.name).toUpperCase()}</span><span>PHOTOGRAPH / ${esc(credit("Photography")).toUpperCase()}</span></div></figcaption></figure>
        <p class="mg-wide-caption">${esc(p.caption)}</p>`, "mg-sheet-wide");
    }

    // 05 — details at their own size, then one quiet photograph.
    const detailFigure = (d) =>
      `<figure class="mg-detail" style="--w:${d.w}px">${img(d)}<figcaption><span>D—${esc(d.id)}</span> ${esc(d.caption)}<small>FROM PL. ${plateNo(d.from)} / CROP</small></figcaption></figure>`;
    function details() {
      const rows = M.detailRows.map((r) =>
        `<div class="mg-detail-row" data-count="${r.items.length}" data-align="${esc(r.align || "start")}"${r.offset ? ` style="--offset:${r.offset}"` : ""}>${r.items.map((id) => detailFigure(detail(id))).join("")}</div>`).join("");
      const pause = M.sequence.pause;
      const visible = M.visible.map((v) => `<li>${esc(v)}</li>`).join("");
      return sheet(4, `${margin(4, `<p class="mg-caption">Material, as the photographs show it. Each detail is a crop of a credited photograph, shown no larger than its source.</p><p class="mg-label">VISIBLE IN THE PHOTOGRAPHS</p><ol class="mg-visible">${visible}</ol><p class="mg-source">NOT A SPECIFICATION. NO PRODUCT, MAKER OR INSTALLER IS ON FILE.</p>`)}
        <div class="mg-field mg-details">${rows}
          <figure class="mg-pause">${img(plate(pause))}<figcaption>${plateCaption(pause)}</figcaption></figure>
        </div>`);
    }

    // 06 — the finished detail beside the frame held open for the evidence that would explain it.
    function fieldRecord() {
      const pairs = M.record.map((r) => {
        const d = detail(r.detail);
        return `<div class="mg-record-pair" style="--ratio:${d.w}/${d.h};--aspect:${(d.w / d.h).toFixed(4)};--w:${d.w}px">
          <figure class="mg-record-finished">${img(d)}<figcaption><span>FINISHED</span> D—${esc(d.id)} / ${esc(d.caption)}</figcaption></figure>
          <figure class="mg-record-field"><div class="mg-empty" role="img" aria-label="No field photograph on file"><span>NOT ON FILE</span></div><figcaption><span>FIELD</span> ${esc(r.request)}</figcaption></figure>
        </div>`;
      }).join("");
      const awaiting = M.awaiting.map((a) => `<li>${esc(a)}</li>`).join("");
      return sheet(5, `${margin(5, `<p class="mg-caption">No construction photographs, drawings or dated records for ${esc(M.name)} are on file. Each frame is held open for one, at the size of the finished detail it would explain.</p><p class="mg-label">ALSO REQUESTED</p><ol class="mg-visible">${awaiting}</ol>`)}
        <div class="mg-field mg-record">${pairs}</div>`);
    }

    // 07 — the register, the sources, and the way on. Links are site routes, handled in place by app.js.
    function record() {
      const rows = [
        ["Project", M.name],
        ["Location", M.location],
        ["Type", M.type],
        ["Client", creditLink(credit("Client")), true],
        ["Construction", "Freeman GC", false, "stated"],
        ["Photography", creditLink(credit("Photography")), true],
        ["Design", "—", false, "absent"],
        ["Completed", "—", false, "absent"],
      ].map(([k, v, html, s]) => `<div><dt>${esc(k)}</dt><dd>${html ? v : esc(v)}</dd><dd class="mg-status${s ? " mg-status-" + s : ""}">${s ? statusLabel(s) : ""}</dd></div>`).join("");
      return sheet(6, `${margin(6, `<p class="mg-caption">Sources: Freeman’s published project record and its photographs. Details are crops of those photographs, unaltered except for cropping.</p>`)}
        <div class="mg-field mg-register">
          <dl class="mg-claims">${rows}</dl>
          <nav class="mg-onward" aria-label="Continue">
            <div><span>PROJECT</span><a class="phrase" href="${esc(M.gallery)}">${esc(M.name).toUpperCase()} ↗</a></div>
            <div><span>NEXT / P—${esc(M.next.id)}</span><a class="phrase" href="${esc(M.next.href)}">${esc(M.next.name).toUpperCase()} ↗</a></div>
            <div><span>RETURN</span><a class="phrase" href="etcetera.html" data-back="1">ETCETERA ↗</a></div>
          </nav>
        </div>`, "mg-sheet-record");
    }

    return {
      SHEETS,
      html: `<section class="viewport mg-viewport" tabindex="-1" aria-label="${esc(M.name)} monograph">${[opening(), account(), field(), wide(), details(), fieldRecord(), record()].join("")}</section>
        <footer class="sheet-controls"><span class="section-link">MONOGRAPH ${esc(M.number)} / <span class="mg-current"></span></span><nav aria-label="Sheet navigation"><button id="previous" class="phrase" type="button">PREV</button><span class="count" aria-live="polite"></span><button id="next" class="phrase" type="button">NEXT</button></nav></footer>`,
    };
  }

  function mount(root, M, { scroll } = {}) {
    const { SHEETS, html } = render(M);
    root.insertAdjacentHTML("beforeend", html);
    const vp = root.querySelector(".mg-viewport");
    words(vp);
    const sheets = [...vp.querySelectorAll(".mg-sheet")];
    const prev = root.querySelector("#previous"), next = root.querySelector("#next");
    const countEl = root.querySelector(".count"), currentEl = root.querySelector(".mg-current");
    let index = 0;

    // The sheet in view is the last one whose top has reached the upper third of the frame.
    function current() {
      const line = vp.getBoundingClientRect().top + vp.clientHeight / 3;
      let i = 0;
      sheets.forEach((s, n) => { if (s.getBoundingClientRect().top <= line) i = n; });
      if (vp.scrollTop + vp.clientHeight >= vp.scrollHeight - 2) i = sheets.length - 1;
      return i;
    }
    function count() {
      index = current();
      countEl.textContent = `${pad(index + 1)} / ${pad(sheets.length)}`;
      currentEl.textContent = SHEETS[index].toUpperCase();
      prev.disabled = index === 0;
      next.disabled = index === sheets.length - 1;
      vp.querySelectorAll(".mg-contents [data-sheet-link]").forEach((b) => b.toggleAttribute("aria-current", Number(b.dataset.sheetLink) === index));
    }
    // A sheet's leading whitespace separates it from the last one; a move lands on its content.
    // Production moves are immediate (no transitions); so is this one.
    function go(i) {
      i = Math.max(0, Math.min(sheets.length - 1, i));
      const s = sheets[i];
      vp.scrollTop = s.offsetTop - sheets[0].offsetTop + parseFloat(getComputedStyle(s).paddingTop);
      count();
    }

    prev.addEventListener("click", () => go(index - 1));
    next.addEventListener("click", () => go(index + 1));
    vp.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sheet-link]");
      if (b) go(Number(b.dataset.sheetLink));
    });
    // A reload keeps the place too. Safari throws when history is written too often: write once
    // scrolling settles, keeping app.js's own state (depth, palette) in the entry.
    let ticking = false, saveTimer;
    vp.addEventListener("scroll", () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try { history.replaceState({ ...(history.state || {}), mgScroll: vp.scrollTop }, ""); } catch (e) {}
      }, 200);
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; count(); });
    }, { passive: true });

    // Back / Forward and reload return to the same place in the story (app.js keeps it in history).
    if (typeof scroll === "number") vp.scrollTop = scroll;
    count();
    try { vp.focus({ preventScroll: true }); } catch (e) {}

    return {
      key(e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return false;
        e.preventDefault();
        go(index + (e.key === "ArrowRight" ? 1 : -1));
        return true;
      },
      save: () => ({ mgScroll: vp.scrollTop }),
      destroy: () => clearTimeout(saveTimer),
    };
  }

  window.FreemanMonograph = { mount };
})();
