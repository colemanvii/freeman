"use strict";
/*
 * ETCETERA experience: essay. One narrow column of text that scrolls vertically inside the shell's
 * frame; the page itself never scrolls. No images, no motion: type, measure and space only.
 * Text comes from window.ETCETERA_TEXTS[entry.slug] (etcetera/texts/), as blocks:
 *   { lead } opening paragraph · { p } paragraph · { h, n } section heading with its numeral
 *   { quote, cite, ref? } quotation (ref links to another entry) · { rule } a pause
 */
(() => {
  function mount({ viewport: vp, entry, words, esc }) {
    const T = (window.ETCETERA_TEXTS || {})[entry.slug];
    if (!T) {
      vp.innerHTML = `<article class="reading"><p>This text could not be loaded.</p></article>`;
      return {};
    }
    // The title's closing full stop is Freeman orange, as on the Company page.
    const title = esc(T.title).replace(/\.$/, "") + '<span class="co4-accent">.</span>';
    const block = (b) =>
      b.lead ? `<p class="ex-essay-lead">${esc(b.lead)}</p>`
      : b.h ? `<h3 class="ex-essay-h"><span class="ex-essay-n">${esc(b.n || "")}</span>${esc(b.h)}</h3>`
      : b.quote ? `<blockquote class="ex-essay-quote"><p>${esc(b.quote)}</p><cite>${b.ref ? `<a class="phrase" href="etcetera-${esc(b.ref)}.html">${esc(b.cite)} ↗</a>` : esc(b.cite)}</cite></blockquote>`
      : b.rule ? '<hr class="ex-essay-rule">'
      : `<p>${esc(b.p)}</p>`;
    vp.innerHTML = `<div class="ex-essay" tabindex="0" aria-label="${esc(entry.title)}, scrollable text"><article class="ex-essay-col">
      <header class="ex-essay-head"><p class="ex-essay-kicker">${esc(T.kicker)}</p><h2 class="ex-essay-title">${title}</h2>${T.status ? `<p class="ex-essay-status">${esc(T.status)}</p>` : ""}</header>
      ${T.blocks.map(block).join("")}
      <footer class="ex-essay-end"><p>${esc(T.colophon || "")}</p><a class="phrase" href="etcetera.html" data-back="1">× CLOSE / RETURN TO ETCETERA</a></footer>
    </article></div>`;
    words(vp.querySelector(".ex-essay-col"));
    // Keyboard scrolling (space, arrows, page keys) belongs to the column from the start.
    const scroller = vp.querySelector(".ex-essay");
    try { scroller.focus({ preventScroll: true }); } catch (e) {}
    return {};
  }
  (window.FreemanExperiences = window.FreemanExperiences || {}).essay = { mount };
})();
