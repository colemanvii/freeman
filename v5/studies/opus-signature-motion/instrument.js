/* Signature hand — instrument. One clock drives everything: the three hands and the unmodified
   production animation (its requestAnimationFrame is fed from this clock, so Slow and the speed
   meter apply to it too). Plays once per selection or Replay; never loops. */
(() => {
  "use strict";
  const nativeRAF = window.requestAnimationFrame.bind(window);
  // Production pixel-mark.js asks the page for frames; hand it this clock's frames instead.
  let refQueue = [];
  window.requestAnimationFrame = (cb) => { refQueue.push(cb); return refQueue.length; };
  window.cancelAnimationFrame = () => { refQueue = []; };

  const PHONE = "(max-width:760px)"; // production app.js
  const params = new URLSearchParams(location.search);
  const reduced = () => params.get("motion") === "reduce" || matchMedia("(prefers-reduced-motion:reduce)").matches;
  const root = document.documentElement;
  const $ = (s) => document.querySelector(s);
  const home = $("#home"), identity = $("#identity");
  const canvas = $("#v4-pixel-mark"), refCanvas = $("#hs-reference"), traceCanvas = $("#hs-trace"), speed = $("#hs-speed");
  const ctx = canvas.getContext("2d"), tctx = traceCanvas.getContext("2d"), sctx = speed.getContext("2d");

  /* ---------- placement: production entrance fit(), unchanged ---------- */
  function fit() {
    const dpr = window.devicePixelRatio || 1;
    const phone = matchMedia(PHONE).matches;
    const target = phone ? innerWidth * 0.72 : Math.min(innerWidth * 0.34, innerHeight * 0.73);
    const limit = phone ? innerWidth - 40 : Math.min(innerWidth * 0.5, innerHeight * 0.9);
    let n = Math.max(1, Math.round((target * dpr) / 160));
    while (n > 1 && (160 * n) / dpr > limit) n--;
    if ((160 * n) / dpr < target * 0.75) n = (target * dpr) / 160;
    home.style.setProperty("--px", n / dpr + "px");
    const snap = (v) => Math.round(v * dpr) / dpr;
    home.style.setProperty("--x", snap((innerWidth - (160 * n) / dpr) / 2) + "px");
    home.style.setProperty("--y", snap(innerHeight * (phone ? 0.48 : 0.5) - identity.offsetHeight / 2) + "px");
    traceCanvas.width = Math.round(160 * n); traceCanvas.height = Math.round(61 * n);
    const r = speed.getBoundingClientRect();
    speed.width = Math.round(r.width * dpr); speed.height = Math.round(r.height * dpr);
  }

  /* ---------- the artwork, read from production ---------- */
  const ink = () => getComputedStyle(root).getPropertyValue("--mark").trim() || "#332e20";
  function productionFrame() {
    const c = document.createElement("canvas"); c.width = 160; c.height = 61;
    const m = window.FreemanPixelMark.mount(c, { play: false }); m.destroy();
    return c.getContext("2d").getImageData(0, 0, 160, 61);
  }
  const base = productionFrame();
  const pixels = [];
  for (let y = 0; y < 61; y++) for (let x = 0; x < 160; x++) if (base.data[(y * 160 + x) * 4 + 3]) pixels.push({ x, y });

  const ref = window.FreemanPixelMark.mount(refCanvas, { play: false });
  const builds = {};
  const getBuild = (id, mobile) => (builds[id + mobile] ||= window.FreemanHand.build(pixels, id, { mobile }));

  /* ---------- state ---------- */
  const st = { hand: "practiced", timing: "auto", slow: false, pen: false, t: 0, playing: false, last: 0, refBase: 0 };
  const mobile = () => st.timing === "auto" ? matchMedia(PHONE).matches : st.timing === "mobile";
  const isRef = () => st.hand === "production";
  const B = () => isRef() ? null : getBuild(st.hand, mobile());
  const total = () => isRef() ? 1850 : B().total;

  /* ---------- drawing ---------- */
  function drawHand(ms) {
    const b = B(), a = b.alphaAt(ms);
    ctx.clearRect(0, 0, 160, 61);
    ctx.fillStyle = ink();
    for (let i = 0; i < a.length; i++) {
      if (a[i] <= 0) continue;
      ctx.globalAlpha = a[i];
      ctx.fillRect(b.pixels[i].x, b.pixels[i].y, 1, 1);
    }
    ctx.globalAlpha = 1;
    drawPen(ms, b);
  }
  function drawPen(ms, b) {
    tctx.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
    if (!st.pen || !b) return;
    const s = traceCanvas.width / 160, orange = getComputedStyle(root).getPropertyValue("--orange").trim();
    // the last 90 ms of the nib's path, then the nib itself
    tctx.fillStyle = orange;
    for (let k = 90; k >= 0; k -= 3) {
      const p = b.penAt(ms - k); if (!p) continue;
      tctx.globalAlpha = (1 - k / 90) * (p.air ? 0.35 : 0.55);
      tctx.fillRect((p.x + 0.5) * s - 1, (p.y + 0.5) * s - 1, 2, 2);
    }
    tctx.globalAlpha = 1;
    const p = b.penAt(ms);
    if (p) {
      tctx.strokeStyle = orange; tctx.lineWidth = 1;
      const r = p.air ? 3 * s : 1.6 * s;
      tctx.beginPath(); tctx.arc((p.x + 0.5) * s, (p.y + 0.5) * s, r, 0, Math.PI * 2);
      if (p.air) tctx.setLineDash([2, 3]); else tctx.setLineDash([]);
      tctx.stroke(); tctx.setLineDash([]);
    }
  }
  function drawRef(ms) {
    // feed production's own loop with this clock
    const q = refQueue; refQueue = [];
    for (const cb of q) cb(st.refBase + ms);
    tctx.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
  }
  function drawMeter(ms) {
    const w = speed.width, h = speed.height, dpr = w / speed.getBoundingClientRect().width || 1;
    const css = getComputedStyle(root), inkC = css.getPropertyValue("--ink").trim(), hair = css.getPropertyValue("--hair").trim() || "#d5cec3", orange = css.getPropertyValue("--orange").trim();
    sctx.clearRect(0, 0, w, h);
    const T = Math.max(total(), 1), X = (t) => (t / T) * (w - 1) + 0.5;
    sctx.fillStyle = hair; sctx.fillRect(0, h - dpr, w, dpr);
    const b = B();
    if (b) {
      const vmax = Math.max(...b.trace.map((p) => p.v)) * 1.05;
      // ink speed as a hairline; lifts drawn as gaps over a dotted baseline
      sctx.strokeStyle = inkC; sctx.lineWidth = dpr; sctx.beginPath();
      let prev = null;
      for (const p of b.trace) {
        const x = X(p.t), y = h - dpr - (p.v / vmax) * (h - 4 * dpr);
        if (prev !== null && p.t - prev > 8) sctx.moveTo(x, y); else sctx.lineTo(x, y);
        prev = p.t;
      }
      sctx.stroke();
      sctx.fillStyle = inkC;
      for (const L of b.lifts) for (let t = L.t0; t < L.t1; t += 10) sctx.fillRect(X(t), h - 4 * dpr, dpr, dpr);
      // stroke beginnings
      sctx.fillStyle = hair;
      for (const p of b.paths) sctx.fillRect(Math.round(X(p.t0)), 0, dpr, 4 * dpr);
    } else {
      // production: no pen to measure; its 1,850 ms span
      sctx.fillStyle = hair; sctx.fillRect(X(0), h - 6 * dpr, X(1850) - X(0), dpr);
    }
    sctx.fillStyle = orange; sctx.fillRect(Math.round(X(Math.min(ms, T))), 0, dpr, h);
    $("#clock").textContent = String(Math.round(Math.min(ms, T))).padStart(4, "0") + " MS";
  }
  function render() {
    if (isRef()) drawRef(st.t); else drawHand(st.t);
    drawMeter(st.t);
  }

  /* ---------- clock ---------- */
  function tick(now) {
    if (!st.playing) return;
    const dt = Math.min(100, now - st.last); st.last = now;
    st.t += dt * (st.slow ? 0.25 : 1);
    const T = total();
    if (st.t >= T) { st.t = T; st.playing = false; }
    render();
    if (st.playing) nativeRAF(tick); else finished();
  }
  function play() {
    st.t = 0;
    $("#check").textContent = "";
    if (isRef()) { ref.replay(); st.refBase = performance.now(); }
    if (reduced()) { st.t = total(); if (isRef()) drawRef(1e6); render(); finished(); return; }
    st.playing = true; st.last = performance.now();
    render();
    nativeRAF(tick);
  }
  function finished() {
    if (isRef()) { drawRef(1e6); }
    verify();
  }
  // The last frame must be the production frame, pixel for pixel.
  function verify() {
    const c = isRef() ? refCanvas : canvas;
    const now = c.getContext("2d").getImageData(0, 0, 160, 61).data, prod = productionFrame().data;
    let diff = 0; for (let i = 0; i < now.length; i++) if (now[i] !== prod[i]) diff++;
    $("#check").textContent = reduced() ? "Reduced motion · finished frame shown" :
      diff === 0 ? `Final frame = production · ${pixels.length.toLocaleString()} px` : `Final frame differs · ${diff} channels`;
    $("#check").dataset.diff = diff;
  }

  /* ---------- controls ---------- */
  function select(id) {
    st.hand = id;
    document.querySelectorAll("[data-hand]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.hand === id)));
    canvas.hidden = isRef(); refCanvas.hidden = !isRef();
    $("#trace").disabled = isRef();
    describe();
    play();
  }
  function describe() {
    const m = mobile();
    $("#timing").textContent = st.timing === "auto" ? (m ? "Mobile" : "Desktop") : (m ? "Mobile ·" : "Desktop ·");
    if (isRef()) {
      $("#note").textContent = "The live entrance: 2,278 pixels converge from scattered offsets over 1,850 ms. Shown from the unmodified production file, for reference.";
      $("#span").textContent = "1850 MS · PRODUCTION";
    } else {
      const b = B();
      $("#note").textContent = b.hand.note;
      $("#span").textContent = `${Math.round(b.total)} MS · ${b.paths.length} STROKES · ${b.lifts.length} LIFTS`;
    }
  }
  document.querySelectorAll("[data-hand]").forEach((b) => b.addEventListener("click", () => select(b.dataset.hand)));
  $("#replay").addEventListener("click", () => { st.playing = false; play(); });
  $("#slow").addEventListener("click", (e) => { st.slow = !st.slow; e.currentTarget.setAttribute("aria-pressed", String(st.slow)); if (!st.playing) play(); });
  $("#trace").addEventListener("click", (e) => { st.pen = !st.pen; e.currentTarget.setAttribute("aria-pressed", String(st.pen)); render(); });
  $("#timing").addEventListener("click", () => {
    const m = mobile();
    st.timing = m ? "desktop" : "mobile";
    describe(); play();
  });
  function palette(id) {
    root.dataset.palette = id;
    document.querySelector('meta[name="theme-color"]').content = id === "umber" ? "#332e20" : "#fff9f1";
    document.querySelectorAll("[data-way]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.way === id)));
    if (isRef()) ref.paint(); else render();
    drawMeter(st.t);
    if (!st.playing && st.t >= total()) verify();
  }
  document.querySelectorAll("[data-way]").forEach((b) => b.addEventListener("click", () => palette(b.dataset.way)));
  // Drag across the speed meter to hold any moment.
  let scrubbing = false;
  function scrub(e) {
    const r = speed.getBoundingClientRect();
    st.t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * total();
    if (isRef()) { ref.replay(); st.refBase = 0; drawRef(0); }
    render();
  }
  speed.addEventListener("pointerdown", (e) => { scrubbing = true; st.playing = false; speed.setPointerCapture(e.pointerId); scrub(e); });
  speed.addEventListener("pointermove", (e) => scrubbing && scrub(e));
  speed.addEventListener("pointerup", () => { scrubbing = false; });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("button") && (e.key === " " || e.key === "Enter")) return;
    if (e.key === " " || e.key === "r") { e.preventDefault(); $("#replay").click(); }
    if (e.key === "s") $("#slow").click();
    if (["1", "2", "3", "0"].includes(e.key)) select(["production", "practiced", "considered", "breath"][+e.key]);
  });
  addEventListener("resize", () => { fit(); render(); describe(); });

  fit();
  palette(params.get("palette") === "umber" ? "umber" : "chalk");
  const start = params.get("hand");
  select(["practiced", "considered", "breath", "production"].includes(start) ? start : "practiced");
  window.__hand = { st, builds, verify, render, getBuild, pixels, raf: nativeRAF };
})();
