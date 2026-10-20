"use strict";
/*
 * ETCETERA experience: credo. A short declaration, set like a document: the title alone in the
 * middle of the first screen, then one narrow column, then, after a long silence, the Freeman eagle
 * as its seal. Nothing beneath the eagle. The column scrolls inside the frame; the page never does.
 *
 * Text from window.ETCETERA_TEXTS[entry.slug] (texts/): title lines, stanzas of hand-set lines and
 * the closing ("a" unless ?closing=b). Lines are at most MEASURE characters, and the type is sized so
 * that MEASURE characters always fit: the line breaks are the author's on every screen.
 * Until the text is approved, WORKING COPY stands at the foot of the frame.
 */
(() => {
  const MEASURE = 34, MONO = 0.602;
  function mount({ root, viewport: vp, entry, esc }) {
    const T = (window.ETCETERA_TEXTS || {})[entry.slug];
    if (!T) {
      vp.innerHTML = `<article class="reading"><p>This text could not be loaded.</p></article>`;
      return {};
    }
    const closing = T.closings[new URL(location.href).searchParams.get("closing")] || T.closings.a;
    const stanza = (lines, cls = "") => `<p${cls ? ` class="${cls}"` : ""}>${lines.map(esc).join("<br>")}</p>`;
    // The title's closing full stop is Freeman orange, as on the Company page and the index.
    const title = T.title.map(esc);
    title[title.length - 1] = title[title.length - 1].replace(/[.]$/, '<span class="co4-accent">.</span>');
    const last = closing.length - 1;
    vp.innerHTML = `<div class="ex-credo" tabindex="0" aria-label="${esc(entry.title)}">
      <header class="ex-credo-title"><h2>${title.join("<br>")}</h2></header>
      <article class="ex-credo-text">${T.stanzas.map((s) => stanza(s)).join("")}${closing.map((s, i) => stanza(s, i === last && closing.length > 1 ? "is-last" : "")).join("")}</article>
      <footer class="ex-credo-seal"><img src="/intro-eagle.svg" width="1080" height="338" alt="The Freeman eagle"></footer>
    </div>`;
    if (!T.approved) root.querySelector(".section-link").textContent = "WORKING COPY";
    // The size at which MEASURE characters fill the column, no larger than the design size.
    const col = vp.querySelector(".ex-credo-text");
    const fit = () => {
      vp.style.removeProperty("--credo-size");
      const room = vp.clientWidth - 2 * parseFloat(getComputedStyle(col).getPropertyValue("--credo-margin"));
      const design = parseFloat(getComputedStyle(col).fontSize);
      vp.style.setProperty("--credo-size", Math.min(design, Math.floor((room / (MEASURE * MONO)) * 10) / 10) + "px");
    };
    fit();
    addEventListener("resize", fit);
    // Keyboard scrolling (space, arrows, page keys) belongs to the document from the start.
    try { vp.querySelector(".ex-credo").focus({ preventScroll: true }); } catch (e) {}
    return { destroy: () => removeEventListener("resize", fit) };
  }
  (window.FreemanExperiences = window.FreemanExperiences || {}).credo = { mount };
})();
