"use strict";
/*
 * ETCETERA experience: snapshot. Mounts the approved Beetlecat snapshot (snapshot-001/, carried over
 * unchanged from study/project-monograph-001 at 35264b1) in the experience shell. Content and the
 * three compositions are untouched; only the route and shell are new. One static viewport.
 * ?study=a|b|c keeps the snapshot's own unresolved comparison (A Spread is the default); it is
 * switched in the footer and replaces history, as before.
 */
(() => {
  const STUDIES = [["a", "Spread"], ["b", "Band"], ["c", "Plate"]];
  function mount({ root, viewport: vp, entry, params, words, esc }) {
    const study = STUDIES.some(([id]) => id === params.get("study")) ? params.get("study") : "a";
    root.querySelector(".section-link").insertAdjacentHTML("beforeend", ` <span class="ex-snap-switch">/ STUDY ${STUDIES.map(([id, name]) =>
      `<a class="phrase${id === study ? " is-current" : ""}" href="etcetera-${esc(entry.slug)}.html?study=${id}"${id === study ? ' aria-current="true"' : ""} title="${name}">${id.toUpperCase()}</a>`).join("")}</span>`);
    // Phones in portrait and short screens (phones in landscape) have their own compositions.
    const phone = matchMedia("(max-width:760px)"), short = matchMedia("(max-height:500px)");
    const compose = () => {
      vp.innerHTML = window.FreemanSnapshot.compose(window.SNAPSHOT, study, short.matches ? "short" : phone.matches ? "phone" : "desktop");
      words(vp);
    };
    compose();
    phone.addEventListener("change", compose);
    short.addEventListener("change", compose);
    return { destroy: () => { phone.removeEventListener("change", compose); short.removeEventListener("change", compose); } };
  }
  (window.FreemanExperiences = window.FreemanExperiences || {}).snapshot = { mount };
})();
