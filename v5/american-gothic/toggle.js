/* FREEMAN — AMERICAN GOTHIC PRODUCTION
   The approved Libre Franklin study is fixed as the public typographic system.
   The study's comparison control, URL overrides, keyboard shortcut and local
   preferences are deliberately excluded from the production release.
   Keep the attribute in the head so the face is selected before first paint. */
(() => {
  "use strict";
  // Company 001 study: the preview runs in Monaco, as the Architectural White study was drawn.
  // document.documentElement.dataset.type = "gothic";
  const settle = () => dispatchEvent(new Event("resize"));
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", settle, { once: true });
  } else {
    settle();
  }
  // Text-measuring layouts (entrance group, map labels) must re-measure after
  // the actual web font arrives, not just after DOMContentLoaded.
  if (document.fonts) {
    document.fonts.load('500 12px "Libre Franklin"')
      .then(() => document.fonts.ready)
      .then(settle, settle);
  }
})();
