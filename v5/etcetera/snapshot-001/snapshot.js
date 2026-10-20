"use strict";
/*
 * Freeman GC — ETCETERA 005, an editorial snapshot (study). One page, composed within production's
 * fixed .viewport frame: nothing scrolls, nothing is clipped. app.js owns the route, the shell,
 * × CLOSE / Escape and the study switch in the footer.
 *
 *   FreemanSnapshot.compose(data, study, mode) → html   study: "a" | "b" | "c"
 *                                                        mode:  "desktop" | "phone" | "short"
 *
 * The three studies share the same figures and words; only the composition differs.
 *   A  Spread   a journal opening: one tall figure as the left page, figures and text on the right
 *   B  Band     all five figures in one band at one height, the text set beneath as a register
 *   C  Plate    one dominant figure with four small ones, the text in the gallery's margin column
 *
 * Figures in a band share one height. The band's width is solved from its own frame (container
 * units) so it always fits:  W ≤ (H − rows × line − (rows − 1) × rowgap + gap × k) / inv,
 * with inv = Σ 1/Σaspect and k = Σ (n − 1)/Σaspect over its rows; and never wider than the
 * smallest figure's natural height allows, so nothing is enlarged.
 */
(() => {
  const CREDIT_SITES = {
    "Rocket Farm Restaurants": "https://www.rocketfarmrestaurants.com/",
    "Jared Swafford": "https://www.flickr.com/photos/jaredswafford/",
  };
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // Production's credit link (app.js creditLink).
  const creditLink = (name) => {
    const href = CREDIT_SITES[name];
    return href
      ? `<a class="credit-external" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)} — visit website in new tab"><span class="tap-label">${esc(name)}<span aria-hidden="true" class="credit-arrow"> ↗</span></span></a>`
      : esc(name);
  };

  function compose(S, study, mode) {
    const fig = (n) => S.figures.find((f) => f.n === n);
    const figure = (f) =>
      `<figure style="--a:${(f.w / f.h).toFixed(4)}"><img src="${esc(f.src)}" width="${f.w}" height="${f.h}" alt="${esc(f.alt)}" decoding="async" draggable="false"><figcaption><b class="sn-no">${f.n}</b></figcaption></figure>`;
    // rows: [[n, n, …], …] → a band whose figures in each row share one height.
    function band(rows, cls = "") {
      let inv = 0, k = 0;
      rows.forEach((r) => {
        const sum = r.reduce((s, n) => s + fig(n).w / fig(n).h, 0);
        inv += 1 / sum;
        k += (r.length - 1) / sum;
      });
      const hmax = rows.length * Math.min(...rows.flat().map((n) => fig(n).h));
      return `<div class="sn-band ${cls}"><div class="sn-band-inner" style="--rows:${rows.length};--inv:${inv.toFixed(5)};--k:${k.toFixed(5)};--hmax:${hmax}px">${rows
        .map((r) => `<div class="sn-row">${r.map((n) => figure(fig(n))).join("")}</div>`).join("")}</div></div>`;
    }

    const ident = `<p class="sn-kicker">ETCETERA ${esc(S.object)} / AN EDITORIAL SNAPSHOT</p><h2 class="sn-name">${esc(S.name)}</h2><p class="sn-place">${esc(S.location)} · ${esc(S.type)}</p>`;
    const headline = `<h3 class="sn-headline">${esc(S.headline).replace(/\.$/, "")}<span class="co4-accent">.</span></h3>`;
    const observed = `<div class="sn-observed"><p class="sn-label">OBSERVED</p><p>${esc(S.observed)}</p></div>`;
    const reading = `<div class="sn-reading"><p class="sn-label">READING <span>/ OURS</span></p><p>${esc(S.reading)}</p></div>`;
    const credits = `<dl class="sn-credits">${S.credits.map(([k, v, note]) => `<div><dt>${esc(k)}</dt><dd>${creditLink(v)}${note ? `<small>${esc(note)}</small>` : ""}</dd></div>`).join("")}</dl>`;
    const key = `<p class="sn-key">${esc(S.key)} <a class="phrase" href="${esc(S.gallery)}">ALL PHOTOGRAPHS ↗</a></p>`;
    const run = (left, right) => `<header class="sn-run"><span>${left}</span><span>${right}</span></header>`;

    // Short screens (phones in landscape): too low for words above or below the figures, so each
    // study sets the words in two columns beside its figures. A keeps figures first, as its left
    // page; B and C keep words first, as the register and the margin.
    if (mode === "short") {
      const words = `<div class="sn-short-text"><div class="sn-short-head"><p class="sn-kicker">ETCETERA ${esc(S.object)} / ${esc(S.name).toUpperCase()}, ${esc(S.location).toUpperCase()}</p>${headline}</div><div>${observed}${key}</div><div>${reading}${credits}</div></div>`;
      const figures = study === "c"
        ? `<div class="sn-short-figures sn-short-plate">${band([[2]])}${band([[1, 3, 4, 5]])}</div>`
        : `<div class="sn-short-figures">${band(study === "a" ? [[1, 4, 5], [2, 3]] : [[2, 3], [1, 4, 5]])}</div>`;
      return `<div class="sn sn-short sn-short-${study}" data-mode="short">${study === "a" ? figures + words : words + figures}</div>`;
    }

    // A — Spread. Left page: figure 1 alone. Right page: the words, the two rooms as a pair, and
    // the two crops beside the credits.
    if (study === "a") {
      if (mode === "phone")
        // The spread folded: figure 1 tall beside 2 and 3 stacked; the words; the crops by the credits.
        return `<div class="sn sn-a" data-mode="phone">${run(`ETCETERA ${esc(S.object)}`, esc(S.name).toUpperCase())}
          <div class="sn-a-fold">${band([[1]], "sn-a-one")}${band([[2], [3]])}</div>
          <div class="sn-a-text">${headline}${observed}${reading}</div>
          <div class="sn-a-foot">${band([[4, 5]], "sn-a-crops")}<div>${credits}${key}</div></div></div>`;
      return `<div class="sn sn-a" data-mode="${mode}">${run(`ETCETERA ${esc(S.object)} / AN EDITORIAL SNAPSHOT`, `${esc(S.name).toUpperCase()} · ${esc(S.location).toUpperCase()}`)}
        <div class="sn-a-spread">
          <div class="sn-a-left">${band([[1]], "sn-a-one")}</div>
          <div class="sn-a-right">
            <div class="sn-a-words">${headline}<div class="sn-a-cols">${observed}${reading}</div></div>
            ${band([[2, 3]], "sn-a-pair")}
            <div class="sn-a-foot">${band([[4, 5]], "sn-a-crops")}<div>${credits}${key}</div></div>
          </div>
        </div></div>`;
    }

    // B — Band. Every figure in one band at one height; a register of four columns beneath.
    if (study === "b") {
      const rows = mode === "phone" ? [[1, 4, 5], [2, 3]] : [[1, 4, 2, 3, 5]];
      return `<div class="sn sn-b" data-mode="${mode}">
        ${band(rows, "sn-b-band")}
        <div class="sn-b-register">
          <div class="sn-b-ident">${ident}</div>
          <div>${headline}${observed}</div>
          <div>${reading}${key}</div>
          <div>${credits}</div>
        </div></div>`;
    }

    // C — Plate. The gallery's margin column holds every word; the field holds one dominant
    // figure and a row of four small ones beneath it, like the figures of a journal plate.
    return `<div class="sn sn-c" data-mode="${mode}">
      <aside class="sn-c-margin">${ident}${headline}${observed}${reading}${credits}${key}</aside>
      <div class="sn-c-plate">${band([[2]], "sn-c-main")}${band([[1, 3, 4, 5]], "sn-c-small")}</div>
    </div>`;
  }

  window.FreemanSnapshot = { compose };
})();
