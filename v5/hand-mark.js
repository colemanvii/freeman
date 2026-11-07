/* Freeman signature — refined Practiced hand player (refinement 002).
   Drop-in for FreemanPixelMark.mount(canvas, opts): same { replay, paint, destroy } handle.
   Needs pixel-mark.js (the artwork, read from its finished frame) and practiced.timeline.js
   (the baked timing). If either is missing or the artwork no longer matches the timeline, it
   returns the unmodified production animation instead, so the entrance can never break.

   Unchanged from production: the 160×61 canvas and bitmap, colour from --mark on every draw,
   mount(canvas, { play: false }) draws the finished frame (back/forward arrival), reduced motion
   draws the finished frame immediately, and the last frame is the production frame exactly. */
(() => {
  "use strict";
  function finishedPixels() {
    const c = document.createElement("canvas"); c.width = 160; c.height = 61;
    const m = window.FreemanPixelMark.mount(c, { play: false }); m.destroy();
    const d = c.getContext("2d").getImageData(0, 0, 160, 61).data, out = [];
    for (let y = 0; y < 61; y++) for (let x = 0; x < 160; x++) if (d[(y * 160 + x) * 4 + 3]) out.push(x, y);
    return out;
  }
  let xy = null;
  window.FreemanHandMark = {
    mount(canvas, opts) {
      const T = window.FreemanHandTimeline, P = window.FreemanPixelMark;
      if (!P) return { replay() {}, paint() {}, destroy() {} };
      if (!T) return P.mount(canvas, opts);
      xy = xy || finishedPixels();
      if (xy.length / 2 !== T.count) return P.mount(canvas, opts); // artwork changed: re-bake
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return { replay() {}, paint() {}, destroy() {} };
      let frame = 0, run = 0, ms = Infinity, prof = null;
      // production pixel-mark.js ink(), unchanged
      function ink() { const root = document.documentElement, css = getComputedStyle(root); return css.getPropertyValue("--mark").trim() || (root.dataset.palette === "sand" ? "#f93822" : (css.getPropertyValue("--ink").trim() || "#332e20")); }
      function draw(at) {
        ms = at; ctx.clearRect(0, 0, 160, 61); ctx.fillStyle = ink();
        const done = !prof || at >= prof.total, u = at * 10;
        for (let i = 0, n = T.count; i < n; i++) {
          const a = done ? 1 : (u - prof.t[i]) / prof.f[i];
          if (a <= 0) continue;
          ctx.globalAlpha = a >= 1 ? 1 : a;
          ctx.fillRect(xy[2 * i], xy[2 * i + 1], 1, 1);
        }
        ctx.globalAlpha = 1;
      }
      function replay() {
        cancelAnimationFrame(frame); const id = ++run;
        prof = matchMedia(T.phone).matches ? T.mobile : T.desktop;
        if (matchMedia("(prefers-reduced-motion:reduce)").matches) { draw(Infinity); return; }
        // Blank paper is painted first; the clock starts on the next frame, so the opening pause
        // is seen in full. A slow frame advances at most 34 ms: it slows the hand, never skips ink.
        draw(0);
        let t = 0, last = 0;
        const loop = (now) => {
          if (id !== run) return;
          t += Math.min(34, Math.max(0, now - last)); last = now;
          draw(t);
          if (t < prof.total) frame = requestAnimationFrame(loop); else draw(Infinity);
        };
        frame = requestAnimationFrame(() => { frame = requestAnimationFrame((now) => { if (id !== run) return; last = now; loop(now); }); });
      }
      if (opts && opts.play === false) draw(Infinity); else replay();
      return { replay, paint() { draw(ms); }, destroy() { run++; cancelAnimationFrame(frame); } };
    },
  };
})();
