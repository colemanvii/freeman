"use strict";
/*
 * Freeman GC — Project Monograph, an ETCETERA object (study 001).
 * Composes the monograph as a short sequence of static plates, one viewport each. app.js owns
 * everything else, exactly as on Company and Projects: the interior shell, the sheet controls
 * (PREV · 03 / 05 · NEXT, ← →, ?sheet= in the URL), × CLOSE, Escape and history.
 *
 *   FreemanMonograph.sheets(data, mode) → [{ label, html }]   mode: "desktop" | "phone" | "short"
 *
 * Desktop has five plates. Phones (portrait) and short screens (phones in landscape) recompose two
 * of them across two sheets each, as Company splits its philosophy on phones. No plate scrolls or clips: photographs are fitted to the frame
 * (container units), never enlarged, and text plates are sized to fit.
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
  // Production's credit link (app.js creditLink).
  const creditLink = (name) => {
    const href = CREDIT_SITES[name];
    return href
      ? `<a class="credit-external" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)} — visit website in new tab"><span class="tap-label">${esc(name)}<span aria-hidden="true" class="credit-arrow"> ↗</span></span></a>`
      : esc(name);
  };
  const img = (p) =>
    `<img src="${esc(p.src)}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" decoding="async" draggable="false">`;

  function sheets(M, mode) {
    const split = mode !== "desktop", phone = mode === "phone";
    const P = M.plates;
    const value = (role) => (M.record.find(([k]) => k === role) || [])[1] || "";
    const plateNo = (key) => pad(Object.keys(P).indexOf(key) + 1);
    // A plate's heading line: number in Freeman red, name, and one note on the right (as .pi4-heading).
    const head = (no, name, note) =>
      `<header class="mg-head"><span class="mg-head-title"><b class="mg-no">${pad(no)}</b> / ${esc(name).toUpperCase()}</span><span class="mg-head-note">${esc(note).toUpperCase()}</span></header>`;

    // 01 — Cover. The gallery's own layout (.pg), opened on the ETCETERA cover photograph.
    const cover = (labels) => `<div class="pg mg-cover">
      <header class="pg-info"><p class="mg-kicker">PROJECT MONOGRAPH ${esc(M.number)}</p><h2 class="pg-name">${esc(M.name)}</h2><p class="pg-place">${esc(M.location)}</p>
        <dl class="pg-credits"><div><dt>Client</dt><dd>${creditLink(value("Client"))}</dd></div><div><dt>Photography</dt><dd>${creditLink(value("Photography"))}</dd></div></dl>
        <ol class="mg-contents" aria-label="Plates">${labels.map((l, i) => `<li><button type="button" data-sheet-link="${i}"><span>${pad(i + 1)}</span>${esc(l)}</button></li>`).join("")}</ol>
      </header>
      <section class="pg-stage"><div class="pg-frame"><div class="pg-track"><figure class="pg-slide">${img(P.threshold)}</figure></div></div></section>
    </div>`;

    // 02 — The room. One photograph as production's project plate (.project-plate).
    const room = () => `<figure class="photo-sheet project-plate mg-room">${img(P.bar)}<figcaption class="project-plate-caption"><div class="project-plate-name">${esc(P.bar.title)}</div><div class="project-plate-meta"><span>PL. ${plateNo("bar")} / ${esc(M.name).toUpperCase()}</span><span>PHOTOGRAPH / ${esc(value("Photography")).toUpperCase()}</span></div></figcaption></figure>`;

    // 03 — The account, in Company's register, and the record beside it.
    const accountText = () => `<div class="mg-account-text"><p class="mg-kicker">P—${esc(M.id)} / ${esc(M.type).toUpperCase()} / ${esc(M.location).toUpperCase()}</p>
      <h2>${esc(M.name)}<span class="co4-accent">.</span></h2>
      <blockquote><p>${esc(M.account)}</p><footer>${esc(M.accountSource).toUpperCase()}</footer></blockquote></div>`;
    const accountRecord = () => `<div class="mg-account-record"><p class="mg-label">THE RECORD</p>
      <dl class="mg-claims">${M.record.map(([k, v, s]) => `<div><dt>${esc(k)}</dt><dd>${CREDIT_SITES[v] ? creditLink(v) : esc(v)}</dd><dd class="mg-status mg-status-${s}">${statusLabel(s)}</dd></div>`).join("")}</dl>
      <p class="mg-note">Freeman red marks what Freeman has stated and nothing on file yet shows.</p></div>`;

    // 04 — Material. Five crops at one height, numbered like an architectural plate, with a key.
    // The strip's width is solved so its height plus the number line fits the frame:
    //   W ≤ (H − rows × line − (rows − 1) × rowgap + gap × k) / inv,  inv = Σ 1/Σaspect, k = Σ (n−1)/Σaspect.
    const detail = (id) => M.details.find((d) => d.id === id);
    function material(no) {
      const rows = phone ? M.detailRowsPhone : [M.details.map((d) => d.id)];
      let inv = 0, k = 0;
      rows.forEach((r) => {
        const sum = r.reduce((s, id) => s + detail(id).w / detail(id).h, 0);
        inv += 1 / sum;
        k += (r.length - 1) / sum;
      });
      const strip = rows.map((r) => `<div class="mg-strip-row">${r.map((id) => {
        const d = detail(id);
        return `<figure style="--a:${(d.w / d.h).toFixed(4)}">${img(d)}<figcaption>D—${esc(d.id)}</figcaption></figure>`;
      }).join("")}</div>`).join("");
      const key = M.details.map((d) => `<li><b class="mg-no">D—${esc(d.id)}</b><span class="mg-key-text">${esc(d.caption)}</span><small>PL. ${plateNo(d.from)} / CROP</small></li>`).join("");
      // Never enlarged: the strip's rows together stay within the smallest crop's natural height.
      const hmax = rows.length * Math.min(...M.details.map((d) => d.h));
      return `<div class="mg-material">${head(no, "Material", "Five details, cropped from PL. 01–03")}
        <div class="mg-strip"><div class="mg-strip-inner" style="--rows:${rows.length};--inv:${inv.toFixed(5)};--k:${k.toFixed(5)};--hmax:${hmax}px">${strip}</div></div>
        <ol class="mg-key">${key}</ol></div>`;
    }

    // 05 — Field record. The finished room beside a frame of the same proportion, held open for
    // construction evidence that is not on file. The gap is shown, never filled.
    const r = P.room.w / P.room.h;
    const pair = () => `<div class="mg-pair" data-stack="${phone ? 1 : 0}"><div class="mg-pair-inner" style="--r:${r.toFixed(4)}">
        <figure>${img(P.room)}<figcaption><b class="mg-cap-label">FINISHED</b> PL. ${plateNo("room")} / ${esc(P.room.title).toUpperCase()}<br>PHOTOGRAPH / ${esc(value("Photography")).toUpperCase()}</figcaption></figure>
        <figure><div class="mg-empty" role="img" aria-label="No construction photograph on file"><span>NOT ON FILE</span></div><figcaption><b class="mg-cap-label">CONSTRUCTION</b> NO PHOTOGRAPH, DRAWING OR<br>DATED RECORD OF THE BUILD IS ON FILE</figcaption></figure>
      </div></div>`;
    const onward = () => `<div class="mg-onward"><div><p class="mg-label">REQUESTED</p><ol>${M.awaiting.map((a) => `<li>${esc(a)}</li>`).join("")}</ol></div>
      <nav aria-label="Continue"><p class="mg-label">CONTINUE</p>
        <a class="phrase" href="${esc(M.gallery)}">${esc(M.name).toUpperCase()} / PROJECT ↗</a>
        <a class="phrase" href="${esc(M.next.href)}">NEXT / ${esc(M.next.name).toUpperCase()} ↗</a>
        <a class="phrase" href="etcetera.html" data-back="1">RETURN / ETCETERA ↗</a></nav></div>`;
    const fieldRecord = (no) => `<div class="mg-evidence">${head(no, "Field record", "Finished, and what is not on file")}${pair()}${phone ? "" : onward()}</div>`;

    if (!split) {
      const labels = [M.name, P.bar.title, "Account", "Material", "Field record"];
      return [
        { label: labels[0], html: cover(labels) },
        { label: labels[1], html: room() },
        { label: labels[2], html: `<div class="mg-account">${accountText()}${accountRecord()}</div>` },
        { label: labels[3], html: material(4) },
        { label: labels[4], html: fieldRecord(5) },
      ];
    }
    const labels = [M.name, P.bar.title, "Account", "Record", "Material", "Field record", "Continue"];
    return [
      { label: labels[0], html: cover(labels) },
      { label: labels[1], html: room() },
      { label: labels[2], html: `<div class="mg-account">${accountText()}</div>` },
      { label: labels[3], html: `<div class="mg-account">${accountRecord()}</div>` },
      { label: labels[4], html: material(5) },
      { label: labels[5], html: fieldRecord(6) },
      { label: labels[6], html: `<div class="mg-evidence">${head(7, "Continue", "What would prove it")}${onward()}</div>` },
    ];
  }

  window.FreemanMonograph = { sheets };
})();
