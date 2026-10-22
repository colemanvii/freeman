/* Freeman signature — The Flourish (issue #65, chosen from study/signature-motion-refinement-20261022).
   Drop-in for FreemanPixelMark.mount(canvas, opts): same { replay, paint, destroy } handle.

   The name is there on the first frame; only the closing underline is signed, right to left,
   in about a third of a second. Then nothing moves. The artwork is never redrawn: every frame is
   a subset of the original 160×61 bitmap at full ink, and the last frame is the production
   finished frame exactly. BAKED holds one byte per original pixel (row-major): 0 = present on
   the first frame, n = inked at (n - 1) × 2 ms. Regenerate with v5-source/tools/bake-signature-flourish.mjs.

   Reduced motion (at mount or switched on while playing), a hidden tab and a bfcache restore draw
   the finished mark; a watchdog finishes it if frames stop arriving. If the artwork read back from
   pixel-mark.js is not the known bitmap, the production renderer draws it finished instead. */
(() => {
  "use strict";
  const W = 160, H = 61, COUNT = 2278, SUM = 157483714, STEP = 2;
  const BAKED = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABASFBYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANDhAWGBoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsNGhwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQkLHB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAcJHiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYGCCAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQGIiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJSMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlJQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApJykAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKykpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALSsrLDMyLy0tLjk4NDIwLy8wPTw8ODc2MzEyMTFGQ0JBQD8+Ojo3NTQzMzQzM4+Ojo2MjIuLiomJiIeGhoWEhIOCgoGAgH9+fn18e3t6eXl4d3Z2dXRzc3JxcHBvbm1tbGtqamloZ2ZmZWRjY2JhYF9eW1pZWFdWVVRUU1JRUE9OTk1MS0pJSEdGRURDQD8+PTw6ODY3NjU2NpOSkpGQkI+Ojo2MjIuKiomJiIeHhoWEhIOCgoGAgH9+fn18fHt6eXl4d3d2dXR0c3JxcXBvbm5tbGtramloaGdmZWRkY2JhYWBfXl1cW1hXVlVUU1JSUVBPTk1MTEtKSUhHRkVEQ0JBPz08Ozo5Ojg5ODc4lZSTk5KRkZCQj46OjYyMi4qKiYiIh4eGhYWEg4KCgYCAf35+fXx8e3p6eXh3d3Z1dXRzcnJxcG9vbm1sbGtqaWloZ2ZmZWRjYmJhYF9fXl1cW1pZV1VUU1JRUFBPTk1MS0pKSUhHRkVEQ0JBQD8+Pz49PDs8Ojs8l5WUlJOSkZGQkI+Ojo2MjIuKiomIiIeGhoWFhIODgoGAgH9+fn18fHt6enl4eHd2dXV0c3NycXBwb25tbWxramppaGdnZmVkZGNiYWBgX15dXVxbWllYV1ZXVlVUU1JSUVBPTk1MTEtKSUhHRkVEQ0JBQEFAPz49Pj6Zl5eWl5aWlZSTk5KRkZCQj46OjYyMi4qKiYiIh4eGhYWEg4KCgYCAf35+fXx8e3p6eXh3d3Z1dXRzcnJxcG9vbm1sbGtqaWloZ2ZmZWRjYmJhYF9fXl1cW1pZWFlYV1ZVVFRTUlFQT05OTUxLSklIR0ZFRENCQ0RBQJuZmZiZmZiZkpKRkJCPjo6NjIyLioqJiYiHh4aFhISDgoKBgIB/fn59fHx7enl5eHd3dnV0dHNycXFwb25ubWxra2ppaGhnZmVkZGNiYWFgX15dXFtaW1xZWFdWVlVUU1JRUFBPTk1MS0pJSEdGnpybmpubkZCQj46OjYyMi4uKiYmIh4aGhYSEg4KCgYCAf35+fXx7e3p5eXh3dnZ1dHNzcnFwcG9ubW1sa2pqaWhnZmZlZGNjYmFgX15dXF1eW6CenZyenZCQj46OjYyMi4qKiYiIh4aGhYSEg4KCgYCAf359fXx7e3p5eHh3dnV1dHOioJ+eoJ+Mi4qjoaCioaSjog==";
  const P = window.FreemanPixelMark;
  const NOOP = { replay() {}, paint() {}, destroy() {} };

  function checksum(xy) { let h = 2166136261; for (const v of xy) h = Math.imul(h ^ v, 16777619) >>> 0; return h; }
  let plan;
  function prepare() {
    if (plan !== undefined) return plan;
    plan = null;
    try {
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const m = P.mount(c, { play: false }); m.destroy();
      const d = c.getContext("2d").getImageData(0, 0, W, H).data, xy = [];
      for (let i = 0; i < W * H; i++) {
        const a = d[i * 4 + 3];
        if (a === 255) xy.push(i % W, (i / W) | 0);
        else if (a !== 0) return null; // readback was altered (privacy noise): don't trust it
      }
      const bytes = atob(BAKED);
      if (xy.length / 2 !== COUNT || checksum(xy) !== SUM || bytes.length !== COUNT) return null;
      const at = new Float64Array(COUNT);
      for (let i = 0; i < COUNT; i++) { const b = bytes.charCodeAt(i); at[i] = b ? (b - 1) * STEP : 0; }
      const order = Array.from(at.keys()).sort((i, j) => at[i] - at[j]);
      plan = { xy, at, order, total: at[order[COUNT - 1]] };
    } catch (e) {}
    return plan;
  }

  window.FreemanSignature = {
    mount(canvas, opts = {}) {
      if (!P) return NOOP;
      const k = prepare();
      if (!k) return P.mount(canvas, { ...opts, play: false });
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return NOOP;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)");
      let now = Infinity, frame = 0, timer = 0, dead = false;
      // production pixel-mark.js ink(), unchanged
      function ink() { const root = document.documentElement, css = getComputedStyle(root); return css.getPropertyValue("--mark").trim() || (root.dataset.palette === "sand" ? "#f93822" : (css.getPropertyValue("--ink").trim() || "#332e20")); }
      function draw(t) {
        now = t; ctx.clearRect(0, 0, W, H); ctx.fillStyle = ink();
        for (const i of k.order) {
          if (k.at[i] > t) break;
          ctx.fillRect(k.xy[2 * i], k.xy[2 * i + 1], 1, 1);
        }
      }
      function stop() { cancelAnimationFrame(frame); clearTimeout(timer); frame = timer = 0; }
      function finish() { stop(); if (!dead) draw(Infinity); }
      function replay() {
        if (dead) return;
        stop();
        if (reduce.matches || document.hidden) return finish();
        const start = performance.now();
        draw(0); // the first frame is painted with the page: the name is never withheld
        const tick = () => {
          const t = performance.now() - start;
          if (t >= k.total) return finish();
          draw(t); frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        timer = setTimeout(finish, k.total + 400); // frames stopped arriving: show it finished
      }
      const hidden = () => { if (document.hidden && frame) finish(); };
      const restored = (e) => { if (e.persisted && frame) finish(); };
      const reduced = () => { if (reduce.matches && frame) finish(); };
      document.addEventListener("visibilitychange", hidden);
      addEventListener("pageshow", restored);
      reduce.addEventListener ? reduce.addEventListener("change", reduced) : reduce.addListener(reduced);
      if (opts.play === false) finish(); else replay();
      return {
        replay,
        paint() { if (!dead) draw(now); },
        destroy() {
          dead = true; stop();
          document.removeEventListener("visibilitychange", hidden);
          removeEventListener("pageshow", restored);
          reduce.removeEventListener ? reduce.removeEventListener("change", reduced) : reduce.removeListener(reduced);
        },
      };
    },
  };
})();
