"use strict";
/* ETCETERA experience: snapshot. The approved Beetlecat snapshot (snapshot-001/, carried over
   unchanged from study/project-monograph-001 at 35264b1), composition A, in the experience shell.
   One static viewport; phones and short screens have their own compositions, as before. */
(() => {
  function mount({ viewport: vp, words }) {
    const phone = matchMedia("(max-width:760px)"), short = matchMedia("(max-height:500px)");
    const compose = () => {
      vp.innerHTML = window.FreemanSnapshot.compose(window.SNAPSHOT, "a", short.matches ? "short" : phone.matches ? "phone" : "desktop");
      words(vp);
    };
    compose();
    phone.addEventListener("change", compose);
    short.addEventListener("change", compose);
    return { destroy: () => { phone.removeEventListener("change", compose); short.removeEventListener("change", compose); } };
  }
  (window.FreemanExperiences = window.FreemanExperiences || {}).snapshot = { mount };
})();
