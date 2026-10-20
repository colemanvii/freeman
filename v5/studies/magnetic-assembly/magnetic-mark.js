/* Freeman signature — Magnetic Assembly (study 001).
   Built on the original pixel engine (/pixel-mark.js), not the handwriting player. The artwork is
   read from pixel-mark.js's own finished frame, and every unit's loose position comes from the
   original hash(): the same pixel that started 13 px up-left in the original starts a few pixels
   up-left here. Nothing about the artwork is restated in this file.

   Phases: DISPERSE (fade in already loose) → HOVER (independent drift, slowly drawn in) →
   SNAP (accelerate onto the exact original coordinate) → HOLD (still).

   Rendering: the canvas is drawn at device resolution with a margin, so a suspended pixel can sit
   between bitmap cells and drift by a fraction of a cell. The finished frame is drawn on whole
   cells only and equals the production frame exactly (verify()).

   mount(canvas, { variant, play, rate, onFrame }) → { replay, paint, seek, resize, destroy,
   setRate, total }. Same contract as FreemanPixelMark.mount: colour from --mark on every draw, play:false
   draws the finished frame, reduced motion draws the finished frame immediately. */
(() => {
  "use strict";
  const W = 160, H = 61, PAD = 14, TAU = Math.PI * 2;
  // pixel-mark.js hash, unchanged
  function hash(x, y) { let t = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return t - Math.floor(t); }
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (t) => t * t * (3 - 2 * t);

  let XY = null;
  function artwork() {
    if (XY) return XY;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const m = window.FreemanPixelMark.mount(c, { play: false }); m.destroy();
    const d = c.getContext("2d").getImageData(0, 0, W, H).data, out = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) out.push(x, y);
    return (XY = out);
  }

  /* Variants. spread scales the original offsets (±13 × ±9 bitmap px). tile groups pixels into
     rigid fragments. drift is in bitmap px. Snap: "stagger" lands units one after another
     (hash order, like the original); "together" times every unit so all land on one frame. */
  const VARIANTS = {
    original: { name: "Original", original: true, total: 1850 },
    settle: {
      name: "Settle", spread: 0.14, tile: 1,
      fade: 300, fadeStagger: 260, hover: 760, gather: 0.15, drift: 0.35, rate: 0.55,
      snap: "stagger", snapStagger: 220, snapDur: 300, power: 2.4, inout: true, recoil: 0,
    },
    lodestone: {
      name: "Lodestone", spread: 0.28, tile: 5,
      fade: 340, fadeStagger: 300, hover: 960, gather: 0.2, drift: 0.5, rate: 0.5,
      snap: "together", land: 1200, snapMin: 110, snapMax: 230, power: 3, recoil: 0,
    },
    field: {
      name: "Field", spread: 0.45, tile: 7,
      fade: 380, fadeStagger: 340, hover: 1120, gather: 0.28, drift: 0.75, rate: 0.42,
      snap: "together", land: 1400, snapMin: 130, snapMax: 280, power: 3.4, recoil: 0.35, recoilDur: 150,
    },
  };

  function build(v) {
    const xy = artwork(), n = xy.length / 2;
    if (v.original) {
      const px = [];
      for (let i = 0; i < n; i++) {
        const x = xy[2 * i], y = xy[2 * i + 1], r = hash(x, y);
        px.push({ x, y, start: 70 + r * 630, ox: (hash(y + 11, x) * 2 - 1) * 13, oy: (hash(y, x + 17) * 2 - 1) * 9 });
      }
      return { px, total: v.total, phases: [700, 700, 1850] };
    }
    const t = v.tile, map = new Map(), units = [];
    for (let i = 0; i < n; i++) {
      const x = xy[2 * i], y = xy[2 * i + 1];
      // Fragments are cells of a jittered grid (nearest seed), so they follow no axis and break
      // a stroke into irregular pieces rather than squares. tile 1 = every pixel on its own.
      let tx = x, ty = y;
      if (t > 1) {
        const gx = Math.floor(x / t), gy = Math.floor(y / t);
        let best = Infinity;
        for (let j = gy - 1; j <= gy + 1; j++) for (let i2 = gx - 1; i2 <= gx + 1; i2++) {
          const sx = (i2 + hash(i2 + 0.3, j + 0.7)) * t, sy = (j + hash(i2 + 0.9, j + 0.1)) * t;
          const d = (sx - x - 0.5) ** 2 + (sy - y - 0.5) ** 2;
          if (d < best) { best = d; tx = i2; ty = j; }
        }
      }
      const k = (tx + 100) * 1000 + ty + 100;
      let u = map.get(k);
      if (!u) {
        // The original's per-pixel offset, taken at the fragment's anchor cell.
        const ax = tx * t, ay = ty * t;
        u = {
          m: [], ox: (hash(ay + 11, ax) * 2 - 1) * 13 * v.spread, oy: (hash(ay, ax + 17) * 2 - 1) * 9 * v.spread,
          a: hash(ax, ay) * v.fadeStagger,
          p1: hash(ax + 3.1, ay + 7.7), p2: hash(ax + 5.3, ay + 1.9), p3: hash(ax + 8.2, ay + 4.4), p4: hash(ax + 2.6, ay + 9.1),
          f1: 0.45 + 0.35 * hash(ax + 6.7, ay + 3.3), f2: 0.8 + 0.5 * hash(ax + 4.9, ay + 6.1),
        };
        map.set(k, u); units.push(u);
      }
      u.m.push(x, y);
    }
    let oMax = 0;
    for (const u of units) oMax = Math.max(oMax, Math.hypot(u.ox, u.oy));
    let end = 0, first = Infinity;
    for (const u of units) {
      if (v.snap === "together") {
        // Farther units leave earlier; everything arrives on the same frame.
        u.d = v.snapMin + (v.snapMax - v.snapMin) * Math.sqrt(Math.hypot(u.ox, u.oy) / oMax);
        u.s = v.land - u.d;
      } else {
        u.d = v.snapDur;
        u.s = v.hover + hash(u.m[0] + 0.5, u.m[1] + 0.5) * v.snapStagger;
      }
      end = Math.max(end, u.s + u.d); first = Math.min(first, u.s);
    }
    const total = Math.ceil(end + (v.recoil ? v.recoilDur : 0));
    return { units, total, phases: [v.fade + v.fadeStagger, first, end] };
  }
  const cache = {};
  const model = (id) => cache[id] || (cache[id] = build(VARIANTS[id]));

  // Drifting, slowly gathering position of a suspended unit (bitmap px from home).
  function loose(u, v, ms) {
    const s = ms / 1000, g = 1 - v.gather * smooth(clamp(ms / v.hover)), A = v.drift;
    return [
      u.ox * g + A * (0.62 * Math.sin(TAU * (u.f1 * s * v.rate * 2 + u.p1)) + 0.38 * Math.sin(TAU * (u.f2 * s * v.rate * 2 + u.p2))),
      u.oy * g + A * 0.75 * (0.6 * Math.sin(TAU * (u.f2 * s * v.rate * 2 + u.p3)) + 0.4 * Math.sin(TAU * (u.f1 * s * v.rate * 2 + u.p4))),
    ];
  }
  function ease(v, u) {
    if (v.inout) return u < 0.5 ? Math.pow(2 * u, v.power) / 2 : 1 - Math.pow(2 - 2 * u, v.power) / 2;
    return Math.pow(u, v.power); // magnetic: accelerating all the way in, stopped by the target
  }

  function ink(el) {
    const root = document.documentElement, css = getComputedStyle(el);
    return css.getPropertyValue("--mark").trim() || (root.dataset.palette === "sand" ? "#f93822" : (css.getPropertyValue("--ink").trim() || "#332e20"));
  }

  function mount(canvas, opts = {}) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const id = VARIANTS[opts.variant] ? opts.variant : "lodestone", v = VARIANTS[id], M = model(id);
    if (!ctx) return { replay() {}, paint() {}, resize() {}, destroy() {}, setRate() {}, total: M.total };
    let frame = 0, run = 0, last = M.total, rate = opts.rate || 1, n = 1;

    function resize() {
      // One bitmap pixel = a whole number of device pixels (production fit() sets --px that way).
      const dpr = window.devicePixelRatio || 1;
      const px = parseFloat(getComputedStyle(canvas).getPropertyValue("--px")) || 3;
      n = Math.max(1, Math.round(px * dpr));
      const css = n / dpr;
      canvas.width = (W + 2 * PAD) * n; canvas.height = (H + 2 * PAD) * n;
      Object.assign(canvas.style, {
        width: (W + 2 * PAD) * css + "px", height: (H + 2 * PAD) * css + "px",
        margin: -PAD * css + "px", imageRendering: "auto",
      });
      draw(last);
    }
    function cell(x, y) {
      const X = Math.round((PAD + x) * n), Y = Math.round((PAD + y) * n);
      ctx.fillRect(X, Y, Math.round((PAD + x) * n + n) - X, Math.round((PAD + y) * n + n) - Y);
    }
    function draw(ms) {
      last = ms;
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = ink(canvas);
      const done = ms >= M.total;
      if (done) { const xy = artwork(); for (let i = 0; i < xy.length; i += 2) ctx.fillRect((PAD + xy[i]) * n, (PAD + xy[i + 1]) * n, n, n); return; }
      if (v.original) {
        // pixel-mark.js draw(), unchanged: whole bitmap cells, clipped to the 160×61 canvas.
        ctx.save(); ctx.beginPath(); ctx.rect(PAD * n, PAD * n, W * n, H * n); ctx.clip();
        for (const p of M.px) {
          const t = clamp((ms - p.start) / (M.total - p.start - 60)); if (t === 0) continue;
          const e = 1 - Math.pow(1 - t, 3);
          ctx.globalAlpha = Math.min(1, t * 2.3);
          ctx.fillRect((PAD + Math.round(p.x + p.ox * (1 - e))) * n, (PAD + Math.round(p.y + p.oy * (1 - e))) * n, n, n);
        }
        ctx.restore(); ctx.globalAlpha = 1; return;
      }
      for (const u of M.units) {
        const a = clamp((ms - u.a) / v.fade); if (a === 0) continue;
        let [dx, dy] = loose(u, v, ms);
        const k = (ms - u.s) / u.d;
        if (k >= 1) {
          dx = dy = 0;
          if (v.recoil) {
            // A trace of overtravel past home, then still: the stop is felt, not seen.
            const r = (ms - u.s - u.d) / v.recoilDur;
            if (r < 1) {
              const [lx, ly] = loose(u, v, u.s + u.d), L = Math.hypot(lx, ly) || 1, o = -v.recoil * Math.sin(Math.PI * r) * (1 - r);
              dx = (lx / L) * o; dy = (ly / L) * o;
            }
          }
        } else if (k > 0) { const e = 1 - ease(v, k); dx *= e; dy *= e; }
        ctx.globalAlpha = a < 1 ? smooth(a) : 1;
        const m = u.m;
        for (let i = 0; i < m.length; i += 2) cell(m[i] + dx, m[i + 1] + dy);
      }
      ctx.globalAlpha = 1;
    }
    function phase(ms) {
      const p = M.phases;
      return ms >= M.total ? "hold" : ms < p[0] && ms < p[1] ? "disperse" : ms < p[1] ? "hover" : "snap";
    }
    function replay() {
      cancelAnimationFrame(frame);
      const me = ++run; let start = null;
      if (matchMedia("(prefers-reduced-motion:reduce)").matches) { draw(M.total); opts.onFrame && opts.onFrame(M.total, "hold"); return; }
      function loop(now) {
        if (me !== run) return;
        if (start === null) start = now;
        const ms = (now - start) * rate;
        draw(ms);
        opts.onFrame && opts.onFrame(Math.min(ms, M.total), phase(ms));
        if (ms < M.total) frame = requestAnimationFrame(loop);
      }
      frame = requestAnimationFrame(loop);
    }
    resize();
    if (opts.play === false) draw(M.total); else replay();
    return {
      replay, resize, total: M.total, variant: id,
      paint() { draw(last); },
      seek(ms) { run++; cancelAnimationFrame(frame); draw(ms); opts.onFrame && opts.onFrame(Math.min(ms, M.total), phase(ms)); },
      setRate(r) { rate = r; },
      destroy() { run++; cancelAnimationFrame(frame); },
    };
  }

  /* The finished frame of every variant, read back cell by cell, against the production frame. */
  function verify() {
    const xy = artwork(), want = new Set();
    for (let i = 0; i < xy.length; i += 2) want.add(xy[i] + "," + xy[i + 1]);
    const out = {};
    for (const id of Object.keys(VARIANTS)) {
      const c = document.createElement("canvas"); c.style.setProperty("--px", "1px");
      document.body.appendChild(c);
      const m = mount(c, { variant: id, play: false }); m.destroy();
      const k = c.width / (W + 2 * PAD), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
      let bad = 0, count = 0;
      for (let y = -PAD; y < H + PAD; y++) for (let x = -PAD; x < W + PAD; x++) {
        const cx = Math.floor((PAD + x + 0.5) * k), cy = Math.floor((PAD + y + 0.5) * k);
        const on = d[(cy * c.width + cx) * 4 + 3] === 255;
        if (on) count++;
        if (on !== want.has(x + "," + y)) bad++;
      }
      c.remove();
      out[id] = { pixels: count, expected: want.size, mismatches: bad };
    }
    return out;
  }

  window.FreemanMagneticMark = {
    mount, verify, variants: VARIANTS, total: (id) => model(id).total,
    tune(id, p) { Object.assign(VARIANTS[id], p); delete cache[id]; }, // study only: live tuning
  };
})();
