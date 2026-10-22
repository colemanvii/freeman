/* Signature motion study — selector over the real entrance.
   Loaded after pixel-mark.js and signature-motion.js, before app.js. app.js is unmodified: it
   still calls FreemanPixelMark.mount(canvas, { play }), which this file routes to the study
   engine with the chosen variant. History, palette, replay-on-click and routing are production's.

   ?v=still|stroke|impression|flourish  &tempo=measured|brisk  &rate=1|0.25  &bare (no panel)
   Keys: 0–3 choose, R replay, S quarter speed, T tempo. */
(() => {
  "use strict";
  const engine = window.FreemanSignatureMotion, original = window.FreemanPixelMark;
  if (!engine || !original) return;
  const VARIANTS = [["still", "00", "Already there"], ["stroke", "01", "An author's stroke"], ["impression", "02", "An impression"], ["flourish", "03", "The flourish"]];
  const TEMPI = { measured: 1, brisk: 0.66 };
  const q = new URLSearchParams(location.search);
  const state = {
    variant: VARIANTS.some(([v]) => v === q.get("v")) ? q.get("v") : "still",
    tempo: q.get("tempo") in TEMPI ? q.get("tempo") : "measured",
    rate: q.get("rate") === "0.25" ? 0.25 : 1,
  };
  const settings = () => ({ variant: state.variant, tempo: TEMPI[state.tempo], rate: state.rate });
  let handle = null;
  window.FreemanPixelMark = { ...original, mount(canvas, opts) { return (handle = engine.mount(canvas, { ...opts, settings })); } };

  function remember() {
    const u = new URL(location.href);
    u.searchParams.set("v", state.variant);
    if (state.tempo !== "measured") u.searchParams.set("tempo", state.tempo); else u.searchParams.delete("tempo");
    if (state.rate !== 1) u.searchParams.set("rate", "0.25"); else u.searchParams.delete("rate");
    try { history.replaceState(history.state, "", u.href); } catch (e) {}
    render();
  }
  function replay() { if (handle && document.body.dataset.route === "entrance") handle.replay(); }
  function choose(v) { state.variant = v; remember(); replay(); }

  const panel = document.createElement("div");
  panel.className = "sms-panel";
  panel.setAttribute("role", "group");
  panel.setAttribute("aria-label", "Signature motion study");
  function render() {
    const xy = engine._pixels(), ms = xy ? Math.round(engine._schedule(state.variant, xy).total * TEMPI[state.tempo]) : 0;
    panel.innerHTML =
      `<div class="sms-row">${VARIANTS.map(([v, n, name]) => `<button type="button" data-v="${v}" aria-pressed="${v === state.variant}"><span>${n}</span> ${name}</button>`).join("")}</div>` +
      `<div class="sms-row"><button type="button" data-act="replay">Replay</button>` +
      `<button type="button" data-act="rate" aria-pressed="${state.rate !== 1}">0.25× speed</button>` +
      `<button type="button" data-act="tempo" aria-pressed="${state.tempo === "brisk"}">Brisk</button>` +
      `<span class="sms-note" aria-live="polite">${ms ? `${ms} ms${state.rate !== 1 ? " · shown at 0.25×" : ""}` : "no motion"}</span></div>`;
  }
  panel.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.v) return choose(b.dataset.v);
    if (b.dataset.act === "rate") state.rate = state.rate === 1 ? 0.25 : 1;
    if (b.dataset.act === "tempo") state.tempo = state.tempo === "brisk" ? "measured" : "brisk";
    if (b.dataset.act !== "replay") remember();
    replay();
  });
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || (e.target.closest && e.target.closest("input,textarea,select"))) return;
    const v = VARIANTS.find(([, n]) => n === "0" + e.key);
    if (v) choose(v[0]);
    else if (e.key === "r" || e.key === "R") replay();
    else if (e.key === "s" || e.key === "S") { state.rate = state.rate === 1 ? 0.25 : 1; remember(); replay(); }
    else if (e.key === "t" || e.key === "T") { state.tempo = state.tempo === "brisk" ? "measured" : "brisk"; remember(); replay(); }
  });
  render();
  if (!q.has("bare")) document.addEventListener("DOMContentLoaded", () => document.body.append(panel));
})();
