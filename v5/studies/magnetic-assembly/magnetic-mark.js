/* Freeman signature — Magnetic Assembly, round 2: the original, plus one moment.
   This is pixel-mark.js's draw() with one seam opened up: where the original computes a pixel's
   progress and position from the clock, each study bends that computation a little. Everything
   else is the original: the 160×61 canvas scaled with whole pixels, the same pixels, hash, ±13 ×
   ±9 offsets, start stagger (70 + r·630 ms), cubic ease-out, fade (t·2.3), rounding to whole
   cells, clipping at the canvas edge, colour from --mark.

   control     the original, verbatim (verify() replays production pixel-mark.js frame by frame
               against it)
   suspension  01 the original's clock slows almost to a stop for a moment two-fifths of the way
               in, so the loose signature hangs, then the original assembly carries on
   magnetic    02 each pixel eases most of the way home, hesitates, then is pulled the last few
               cells in sharply; landings stay staggered across ~650 ms in the original's order
   breathing   03 the dispersed signature appears first, faint, and drifts for about a second
               before the original assembly begins from where it drifted to

   mount(canvas, { variant, play, rate, onFrame }) → { replay, paint, seek, resize, destroy,
   setRate, total }. Same contract as FreemanPixelMark.mount. */
(() => {
  "use strict";
  const W = 160, H = 61, D = 1850, TAU = Math.PI * 2;
  // pixel-mark.js hash and ease, unchanged
  function hash(x, y) { let t = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return t - Math.floor(t); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (t) => t * t * (3 - 2 * t);

  let PX = null;
  function pixels() {
    if (PX) return PX;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const m = window.FreemanPixelMark.mount(c, { play: false }); m.destroy();
    const d = c.getContext("2d").getImageData(0, 0, W, H).data, out = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) {
      // pixel-mark.js per-pixel constants, unchanged …
      const r = hash(x, y);
      out.push({
        x, y, r, start: 70 + r * 630, ox: (hash(y + 11, x) * 2 - 1) * 13, oy: (hash(y, x + 17) * 2 - 1) * 9,
        // … plus a drift phase/frequency of its own, for the studies that let pixels float.
        p1: hash(x + 3.1, y + 7.7), p2: hash(x + 5.3, y + 1.9), f: 0.18 + 0.2 * hash(x + 6.7, y + 3.3), j: hash(x + 8.2, y + 4.4),
      });
    }
    return (PX = out);
  }
  // A slow float of about a cell: whole-cell rounding turns it into an occasional one-cell step.
  function drift(p, ms, amp) {
    const s = ms / 1000;
    return [amp * Math.sin(TAU * (p.f * s + p.p1)), amp * 0.7 * Math.sin(TAU * (p.f * 0.83 * s + p.p2))];
  }

  /* Each study: total length, and state(p, ms) → [progress e (0 = loose, 1 = home), alpha, dx, dy]
     where dx/dy is extra displacement in cells. phase(ms) names the moment for the readout. */
  const original = (p, ms) => { const t = clamp((ms - p.start) / (D - p.start - 60)); return [ease(t), Math.min(1, t * 2.3), 0, 0, t]; };

  // 01 — clock warp: rate falls smoothly to RHO over L ms starting at A, then returns to 1.
  const S = { A: 640, L: 760, RHO: 0.06, drift: 0.9 };
  S.lost = ((1 - S.RHO) * S.L) / 2;
  function warp(ms) {
    if (ms <= S.A) return ms;
    if (ms >= S.A + S.L) return ms - S.lost;
    const u = ms - S.A;
    return ms - (1 - S.RHO) * (u / 2 - (S.L / (4 * Math.PI)) * Math.sin((TAU * u) / S.L));
  }
  // 02 — landing time per pixel: the original's own order (r), lightly shuffled.
  const M = { first: 1080, spread: 600, jitter: 90, pull: 120, at: 0.76 };
  // 03 — opening length, haze strength, drift in cells.
  const B = { pre: 1100, haze: 0.5, drift: 0.8 };

  const STUDIES = {
    control: { name: "Original", total: D, state: original, phase: (ms) => (ms < D ? "assemble" : "hold") },
    suspension: {
      name: "Suspension", total: Math.round(D + S.lost),
      state(p, ms) {
        const [e, a] = original(p, warp(ms));
        const hang = ms > S.A && ms < S.A + S.L ? Math.sin((Math.PI * (ms - S.A)) / S.L) ** 2 : 0;
        const [dx, dy] = hang ? drift(p, ms, S.drift * hang) : [0, 0];
        return [e, a, dx * (1 - e), dy * (1 - e)];
      },
      phase: (ms) => (ms >= STUDIES.suspension.total ? "hold" : ms > S.A + S.L * 0.15 && ms < S.A + S.L * 0.85 ? "suspend" : "assemble"),
    },
    magnetic: {
      name: "Magnetic Finish", total: D,
      state(p, ms) {
        const t = clamp((ms - p.start) / (D - p.start - 60)), a = Math.min(1, t * 2.3);
        const land = M.first + p.r * M.spread + p.j * M.jitter, pull = land - M.pull;
        let e;
        if (ms >= land) e = 1;
        else if (ms <= pull) e = M.at * ease(clamp((ms - p.start) / (pull - p.start))); // the original's curve, stopping short
        else e = M.at + (1 - M.at) * Math.pow((ms - pull) / M.pull, 3); // then pulled in, accelerating
        return [e, a, 0, 0];
      },
      phase: (ms) => (ms >= D ? "hold" : ms < M.first - M.pull ? "assemble" : "snap"),
    },
    breathing: {
      name: "Breathing Room", total: B.pre + D,
      state(p, ms) {
        // Opening: the loose signature fades up faint, in the original's order, and floats.
        const haze = B.haze * smooth(clamp((ms - p.r * 520) / 480));
        const [e, a0] = original(p, ms - B.pre);
        const g = 1 - 0.08 * smooth(clamp(ms / B.pre)); // drawn in by a breath before the pull begins
        const [dx, dy] = drift(p, ms, B.drift);
        return [1 - (1 - e) * g, Math.max(haze, a0), dx * (1 - e), dy * (1 - e)];
      },
      phase: (ms) => (ms >= B.pre + D ? "hold" : ms < B.pre ? "drift" : "assemble"),
    },
  };

  function ink() {
    const root = document.documentElement, css = getComputedStyle(root);
    return css.getPropertyValue("--mark").trim() || (root.dataset.palette === "sand" ? "#f93822" : (css.getPropertyValue("--ink").trim() || "#332e20"));
  }
  // Panes in the Light / Dark view carry their own --mark; read it where the canvas is.
  function inkAt(el) { const v = getComputedStyle(el).getPropertyValue("--mark").trim(); return v || ink(); }

  function mount(canvas, opts = {}) {
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d", { alpha: true });
    const id = STUDIES[opts.variant] ? opts.variant : "control", st = STUDIES[id], total = st.total;
    if (!ctx) return { replay() {}, paint() {}, seek() {}, resize() {}, destroy() {}, setRate() {}, total };
    let frame = 0, run = 0, last = total, rate = opts.rate || 1;
    const px = pixels();
    function draw(ms) {
      last = ms; ctx.clearRect(0, 0, W, H); ctx.fillStyle = inkAt(canvas);
      const done = ms >= total;
      for (const p of px) {
        if (done) { ctx.globalAlpha = 1; ctx.fillRect(p.x, p.y, 1, 1); continue; }
        const [e, a, dx, dy] = st.state(p, ms);
        if (a <= 0) continue;
        ctx.globalAlpha = a;
        ctx.fillRect(Math.round(p.x + p.ox * (1 - e) + dx), Math.round(p.y + p.oy * (1 - e) + dy), 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    const report = (ms) => opts.onFrame && opts.onFrame(Math.min(ms, total), st.phase(ms));
    function replay() {
      cancelAnimationFrame(frame);
      const me = ++run; let start = null;
      if (matchMedia("(prefers-reduced-motion:reduce)").matches) { draw(total); report(total); return; }
      function loop(now) {
        if (me !== run) return;
        if (start === null) start = now;
        const ms = (now - start) * rate;
        draw(ms); report(ms);
        if (ms < total) frame = requestAnimationFrame(loop);
      }
      frame = requestAnimationFrame(loop);
    }
    if (opts.play === false) draw(total); else replay();
    return {
      replay, total, variant: id, resize() {},
      paint() { draw(last); },
      seek(ms) { run++; cancelAnimationFrame(frame); draw(ms); report(ms); },
      setRate(r) { rate = r; },
      destroy() { run++; cancelAnimationFrame(frame); },
    };
  }

  /* 1. Every study's finished frame equals the production finished frame, byte for byte.
     2. The control equals production pixel-mark.js on every frame: production is driven with a
        fake clock (requestAnimationFrame swapped out for the duration of the check). */
  function verify() {
    const grab = (c) => c.getContext("2d").getImageData(0, 0, W, H).data;
    const same = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; };
    const prod = document.createElement("canvas"); prod.width = W; prod.height = H;
    window.FreemanPixelMark.mount(prod, { play: false }).destroy();
    const finals = {};
    for (const id of Object.keys(STUDIES)) {
      const c = document.createElement("canvas");
      mount(c, { variant: id, play: false }).destroy();
      finals[id] = same(grab(c), grab(prod));
    }
    const raf = window.requestAnimationFrame, queue = [];
    let frames = 0, differ = 0;
    try {
      window.requestAnimationFrame = (f) => (queue.push(f), queue.length);
      const a = document.createElement("canvas"); a.width = W; a.height = H;
      const b = document.createElement("canvas");
      const pm = window.FreemanPixelMark.mount(a, {});
      const me = mount(b, { variant: "control", play: false });
      if (queue.length) queue.shift()(1000); // production takes its start time from the first frame
      for (let ms = 0; ms <= D + 20; ms += 10) {
        const f = queue.shift(); if (!f) break;
        f(1000 + ms); me.seek(ms);
        frames++; if (same(grab(a), grab(b))) differ++;
      }
      pm.destroy(); me.destroy();
    } finally { window.requestAnimationFrame = raf; }
    return { finals, control: { frames, differ } };
  }

  window.FreemanMagneticMark = {
    mount, verify, variants: STUDIES, total: (id) => STUDIES[id].total, params: { S, M, B },
    // Study only: how many pixels change cell between consecutive 60 fps frames (stillness check).
    steps(id, from, to) {
      const st = STUDIES[id], px = pixels(), out = [];
      let prev = null;
      for (let ms = from; ms <= to; ms += 1000 / 60) {
        const cur = px.map((p) => { const [e, , dx, dy] = st.state(p, ms); return Math.round(p.x + p.ox * (1 - e) + dx) * 1000 + Math.round(p.y + p.oy * (1 - e) + dy); });
        if (prev) { let n = 0; for (let i = 0; i < cur.length; i++) if (cur[i] !== prev[i]) n++; out.push(n); }
        prev = cur;
      }
      return out;
    },
  };
})();
