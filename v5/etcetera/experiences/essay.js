"use strict";
/*
 * ETCETERA experience: essay. One narrow column, centred, that scrolls inside the frame; the page
 * never scrolls. Type, measure and space only. Text from window.ETCETERA_TEXTS[entry.slug]:
 *   { lead } opening paragraph · { p } paragraph · { h } section · { quote, cite } · { rule }
 */
(() => {
  function mount({ viewport: vp, entry, esc }) {
    const T = (window.ETCETERA_TEXTS || {})[entry.slug];
    if (!T) {
      vp.innerHTML = `<article class="reading"><p>This text could not be loaded.</p></article>`;
      return {};
    }
    const block = (b) =>
      b.lead ? `<p class="ex-essay-lead">${esc(b.lead)}</p>`
      : b.h ? `<h3>${esc(b.h)}</h3>`
      : b.quote ? `<blockquote><p>${esc(b.quote)}</p><cite>${esc(b.cite)}</cite></blockquote>`
      : b.rule ? "<hr>"
      : `<p>${esc(b.p)}</p>`;
    // The title's closing full stop is Freeman orange, as on the Company page.
    vp.innerHTML = `<div class="ex-essay" tabindex="0" aria-label="${esc(entry.title)}"><article class="ex-essay-col">
      <h2>${esc(T.title).replace(/\.$/, "")}<span class="co4-accent">.</span></h2>
      ${T.blocks.map(block).join("")}
      ${T.colophon ? `<p class="ex-essay-end">${esc(T.colophon)}</p>` : ""}
    </article></div>`;
    // Keyboard scrolling (space, arrows, page keys) belongs to the column from the start.
    try { vp.querySelector(".ex-essay").focus({ preventScroll: true }); } catch (e) {}
    return {};
  }
  (window.FreemanExperiences = window.FreemanExperiences || {}).essay = { mount };
})();
