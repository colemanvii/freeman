/* Signature handwriting study (round 2, issue #65) — selector over the real entrance.
   Loaded after pixel-mark.js and signature-motion.js, before app.js. app.js mounts
   window.FreemanSignature (the engine); this file sets which pass it plays. History, palette,
   replay-on-click and routing are the site's own.

   ?v=still|fluent|quick|deliberate (also fluent:left, the cap written from its curl)
   &rate=1|0.25  &bare (no panel). Keys: 0–3 choose, R replay, S quarter speed. */
(() => {
  "use strict";
  const engine = window.FreemanSignatureMotion;
  if (!engine || !window.FreemanSignature) return;
  const VARIANTS = [["still", "00", "Still"], ["fluent", "01", "Fluent"], ["quick", "02", "Quick"], ["deliberate", "03", "Deliberate"]];
  const q = new URLSearchParams(location.search);
  const known = (v) => v === "still" || !!engine.PASSES[String(v).split(":")[0]];
  const state = { variant: known(q.get("v")) ? q.get("v") : engine.RECOMMENDED, rate: q.get("rate") === "0.25" ? 0.25 : 1 };
  engine.settings = () => ({ variant: state.variant, rate: state.rate });
  let handle = null;
  const signature = window.FreemanSignature;
  window.FreemanSignature = { mount(canvas, opts) { return (handle = signature.mount(canvas, opts)); } };

  function remember() {
    const u = new URL(location.href);
    u.searchParams.set("v", state.variant);
    if (state.rate !== 1) u.searchParams.set("rate", "0.25"); else u.searchParams.delete("rate");
    try { history.replaceState(history.state, "", u.href); } catch (e) {}
    render();
  }
  function replay() { if (handle && document.body.dataset.route === "entrance") handle.replay(); }
  function choose(v) { state.variant = v; remember(); replay(); }

  const panel = document.createElement("div");
  panel.className = "sms-panel";
  panel.setAttribute("role", "group");
  panel.setAttribute("aria-label", "Signature handwriting study");
  function render() {
    const xy = engine._pixels(), ms = xy ? Math.round(engine._schedule(state.variant, xy).total) : 0;
    panel.innerHTML =
      `<div class="sms-row">${VARIANTS.map(([v, n, name]) => `<button type="button" data-v="${v}" aria-pressed="${v === state.variant}"><span>${n}</span> ${name}</button>`).join("")}</div>` +
      `<div class="sms-row"><button type="button" data-act="replay">Replay</button>` +
      `<button type="button" data-act="rate" aria-pressed="${state.rate !== 1}">0.25× speed</button>` +
      `<span class="sms-note" aria-live="polite">${ms ? `${ms} ms${state.rate !== 1 ? " · shown at 0.25×" : ""}` : "no motion"}</span></div>`;
  }
  panel.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.v) return choose(b.dataset.v);
    if (b.dataset.act === "rate") { state.rate = state.rate === 1 ? 0.25 : 1; remember(); }
    replay();
  });
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || (e.target.closest && e.target.closest("input,textarea,select"))) return;
    const v = VARIANTS.find(([, n]) => n === "0" + e.key);
    if (v) choose(v[0]);
    else if (e.key === "r" || e.key === "R") replay();
    else if (e.key === "s" || e.key === "S") { state.rate = state.rate === 1 ? 0.25 : 1; remember(); replay(); }
  });
  render();
  if (!q.has("bare")) document.addEventListener("DOMContentLoaded", () => document.body.append(panel));
})();
