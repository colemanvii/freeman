/* American Gothic live study: Monaco / American Gothic switch.
   Loaded synchronously in <head> so the chosen face is set before the first paint.
   ?type=monaco | ?type=gothic sets it; the choice is remembered on this device; T toggles.
   ?clean hides the switch (for screenshots). Nothing else on the page is touched. */
(() => {
  "use strict";
  const KEY = "freeman-type-study", root = document.documentElement, q = new URLSearchParams(location.search);
  let type = q.get("type");
  if (type !== "monaco" && type !== "gothic") { try { type = localStorage.getItem(KEY); } catch (e) {} }
  if (type !== "monaco") type = "gothic";
  const apply = (t) => {
    type = t;
    if (t === "gothic") root.dataset.type = "gothic"; else delete root.dataset.type;
    try { localStorage.setItem(KEY, t); } catch (e) {}
    document.querySelectorAll(".ag-toggle button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === t)));
    // Layout that measures text (the entrance group, the map labels) re-measures, as on any resize.
    const settle = () => dispatchEvent(new Event("resize"));
    (document.fonts && t === "gothic" ? document.fonts.load('500 12px "Libre Franklin"').then(() => document.fonts.ready) : Promise.resolve()).then(settle, settle);
  };
  apply(type);
  if (q.has("clean")) root.classList.add("ag-clean");
  const mount = () => {
    if (document.querySelector(".ag-toggle")) return;
    const el = document.createElement("div");
    el.className = "ag-toggle"; el.setAttribute("role", "group"); el.setAttribute("aria-label", "Typeface comparison");
    el.innerHTML = '<button type="button" data-t="gothic">American Gothic</button><button type="button" data-t="monaco">Monaco</button>';
    el.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) apply(b.dataset.t); });
    document.body.appendChild(el);
    apply(type);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  addEventListener("keydown", (e) => {
    if (e.key !== "t" && e.key !== "T") return;
    if (e.metaKey || e.ctrlKey || e.altKey || (e.target.closest && e.target.closest("input,textarea,select,[contenteditable]"))) return;
    apply(type === "gothic" ? "monaco" : "gothic");
  });
})();
