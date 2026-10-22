/* Freeman signature — motion study engine (study/signature-motion-refinement-20261022).
   Drop-in for FreemanPixelMark.mount(canvas, opts): same { replay, paint, destroy } handle.

   The artwork is never redrawn or approximated. Every frame is a subset of the original 160×61
   bitmap, drawn as whole pixels at full ink (no partial alpha, no movement); the last frame is
   the production finished frame exactly. Motion is only the order in which those pixels are
   inked. A variant is a list of arrival times, one per original pixel:

     still       every pixel at 0 — the finished mark on first paint.
     stroke      the hand writes it: a pen route along the bitmap's own skeleton, timed by the
                 two-thirds power law (slower in tight turns), with real pen lifts.
     impression  the ink takes: the heaviest parts of each stroke print first, edges last.
     flourish    the name is already there; only the closing underline is written, right to left.

   Safety: reduced motion (at mount or changed while playing), a hidden tab and a bfcache restore
   all draw the finished mark; a timer finishes it if frames stop arriving. If the artwork read
   back from pixel-mark.js is not the known bitmap, the production renderer is used unchanged. */
(() => {
  "use strict";
  const W = 160, H = 61, COUNT = 2278, SUM = 157483714;
  const P = window.FreemanPixelMark; // the production renderer, captured before anyone wraps it

  /* ---------- Artwork (read from the production renderer, verified) ---------- */
  function checksum(xy) { let h = 2166136261; for (const v of xy) h = Math.imul(h ^ v, 16777619) >>> 0; return h; }
  let artwork;
  function finishedPixels() {
    if (artwork !== undefined) return artwork;
    artwork = null;
    try {
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const m = P.mount(c, { play: false }); m.destroy();
      const d = c.getContext("2d").getImageData(0, 0, W, H).data, xy = [];
      for (let i = 0; i < W * H; i++) {
        const a = d[i * 4 + 3];
        if (a === 255) xy.push(i % W, (i / W) | 0);
        else if (a !== 0) return null; // readback was altered (privacy noise): don't trust it
      }
      if (xy.length / 2 === COUNT && checksum(xy) === SUM) artwork = xy;
    } catch (e) {}
    return artwork;
  }

  /* ---------- Analysis: skeleton, pen route, arrival times ---------- */
  const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  function analyse(xy) {
    const n = xy.length / 2, ink = new Int32Array(W * H).fill(-1);
    for (let i = 0; i < n; i++) ink[xy[2 * i + 1] * W + xy[2 * i]] = i;
    const at = (x, y) => (x >= 0 && y >= 0 && x < W && y < H ? ink[y * W + x] : -1);

    // Zhang–Suen thinning: the bitmap's own 1-px centre lines.
    const sk = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) sk[i] = ink[i] >= 0 ? 1 : 0;
    const v = (x, y) => (x >= 0 && y >= 0 && x < W && y < H ? sk[y * W + x] : 0);
    for (let changed = true; changed;) {
      changed = false;
      for (let pass = 0; pass < 2; pass++) {
        const del = [];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          if (!sk[y * W + x]) continue;
          const p = [v(x, y - 1), v(x + 1, y - 1), v(x + 1, y), v(x + 1, y + 1), v(x, y + 1), v(x - 1, y + 1), v(x - 1, y), v(x - 1, y - 1)];
          const b = p.reduce((a, c) => a + c, 0);
          let a = 0; for (let k = 0; k < 8; k++) if (!p[k] && p[(k + 1) % 8]) a++;
          if (b < 2 || b > 6 || a !== 1) continue;
          if (pass === 0 ? p[0] * p[2] * p[4] || p[2] * p[4] * p[6] : p[0] * p[2] * p[6] || p[0] * p[4] * p[6]) continue;
          del.push(y * W + x);
        }
        for (const i of del) sk[i] = 0;
        if (del.length) changed = true;
      }
    }

    // Shortest path along the skeleton between two snapped waypoints.
    const skel = []; for (let i = 0; i < W * H; i++) if (sk[i]) skel.push(i);
    function snap([x, y]) {
      let best = -1, d = Infinity;
      for (const i of skel) { const e = (i % W - x) ** 2 + (((i / W) | 0) - y) ** 2; if (e < d) { d = e; best = i; } }
      return best;
    }
    function path(a, b) {
      const dist = new Float64Array(W * H).fill(Infinity), prev = new Int32Array(W * H).fill(-1), done = new Uint8Array(W * H);
      dist[a] = 0; const open = [a];
      while (open.length) {
        let k = 0; for (let j = 1; j < open.length; j++) if (dist[open[j]] < dist[open[k]]) k = j;
        const u = open.splice(k, 1)[0]; if (done[u]) continue; done[u] = 1; if (u === b) break;
        const ux = u % W, uy = (u / W) | 0;
        for (const [dx, dy] of N8) {
          const x = ux + dx, y = uy + dy; if (!v(x, y)) continue;
          const w = y * W + x, nd = dist[u] + Math.hypot(dx, dy);
          if (nd < dist[w]) { dist[w] = nd; prev[w] = u; open.push(w); }
        }
      }
      const out = []; for (let u = b; u !== -1; u = prev[u]) out.push(u);
      return out[out.length - 1] === a ? out.reverse() : [a, b];
    }

    // Time along one stroke. Speed follows the two-thirds power law of human movement
    // (v ∝ R^⅓, R = radius of curvature), easing in and out over a few pixels; a flick
    // leaves at speed instead of stopping.
    function timeStroke(route, { speed = 1, flick = false } = {}) {
      const P = route.map((i) => [i % W, (i / W) | 0]), m = P.length, s = [0];
      for (let i = 1; i < m; i++) s.push(s[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
      const L = s[m - 1] || 1, heading = [];
      for (let i = 0; i < m; i++) {
        const a = P[Math.max(0, i - 3)], b = P[Math.min(m - 1, i + 3)];
        heading.push(Math.atan2(b[1] - a[1], b[0] - a[0]));
      }
      const t = [0];
      for (let i = 1; i < m; i++) {
        let dh = Math.abs(heading[Math.min(m - 1, i + 2)] - heading[Math.max(0, i - 2)]);
        if (dh > Math.PI) dh = 2 * Math.PI - dh;
        const span = Math.max(1, s[Math.min(m - 1, i + 2)] - s[Math.max(0, i - 2)]);
        const R = Math.min(40, Math.max(1.5, span / Math.max(dh, 1e-3)));
        const u = s[i] / L, ramp = Math.min(1, s[i] / 6 + 0.35) * (flick ? 1 + 0.9 * u : Math.min(1, (L - s[i]) / 6 + 0.35));
        const vel = speed * Math.cbrt(R / 40) * ramp;
        t.push(t[i - 1] + (s[i] - s[i - 1]) / vel);
      }
      return { P, t, s };
    }

    // A written sequence of strokes → arrival per skeleton pixel (first pass wins).
    function write(strokes, { lift = 10, liftPerPx = 0.12 } = {}) {
      const first = new Float64Array(W * H).fill(Infinity), owner = new Int32Array(W * H).fill(-1), routes = [];
      let clock = 0, pen = null;
      for (const st of strokes) {
        const ids = st.p.map(snap); let route = [ids[0]];
        for (let k = 1; k < ids.length; k++) route = route.concat(path(ids[k - 1], ids[k]).slice(1));
        if (pen) clock += lift + liftPerPx * Math.hypot(pen[0] - (route[0] % W), pen[1] - ((route[0] / W) | 0));
        const tm = timeStroke(route, st);
        route.forEach((u, k) => { if (clock + tm.t[k] < first[u]) { first[u] = clock + tm.t[k]; owner[u] = routes.length; } });
        routes.push({ name: st.name, P: tm.P, t: tm.t.map((x) => x + clock), start: clock, end: clock + tm.t[tm.t.length - 1] });
        clock += tm.t[tm.t.length - 1];
        const last = route[route.length - 1]; pen = [last % W, (last / W) | 0];
      }
      return { first, owner, routes, total: clock };
    }

    // Every ink pixel takes the time of its nearest timed skeleton pixel, measured through ink
    // (never across paper, so no stroke can reveal its neighbour), plus a little time to spread
    // from the centre line to the edge of the stroke.
    function flood({ first, owner }, spread) {
      const T = new Float64Array(n).fill(Infinity), D = new Float64Array(n).fill(Infinity), O = new Int32Array(n).fill(-1), open = [];
      for (let i = 0; i < W * H; i++) if (first[i] < Infinity && ink[i] >= 0) { T[ink[i]] = first[i]; O[ink[i]] = owner[i]; D[ink[i]] = 0; open.push(ink[i]); }
      while (open.length) {
        let k = 0; for (let j = 1; j < open.length; j++) if (D[open[j]] < D[open[k]] || (D[open[j]] === D[open[k]] && T[open[j]] < T[open[k]])) k = j;
        const u = open.splice(k, 1)[0];
        for (const [dx, dy] of N8) {
          const w = at(xy[2 * u] + dx, xy[2 * u + 1] + dy); if (w < 0) continue;
          const nd = D[u] + Math.hypot(dx, dy);
          if (nd < D[w] - 1e-9 || (Math.abs(nd - D[w]) < 1e-9 && T[u] < T[w])) { D[w] = nd; T[w] = T[u]; O[w] = O[u]; open.push(w); }
        }
      }
      return { T: Array.from(T, (t, i) => t + spread * D[i]), O };
    }

    // Euclidean distance from each ink pixel to the nearest paper: how much ink it carries.
    const paper = []; for (let y = -1; y <= H; y++) for (let x = -1; x <= W; x++) if (at(x, y) < 0) {
      for (const [dx, dy] of N8) if (at(x + dx, y + dy) >= 0) { paper.push([x, y]); break; }
    }
    const depth = new Float64Array(n);
    for (let i = 0; i < n; i++) { let d = Infinity; for (const [x, y] of paper) d = Math.min(d, (x - xy[2 * i]) ** 2 + (y - xy[2 * i + 1]) ** 2); depth[i] = Math.sqrt(d); }

    return { n, sk, skel, write, flood, depth, xy };
  }

  /* ---------- The hand: strokes inferred from the bitmap ----------
     Waypoints are rough; the route always runs on the bitmap's own skeleton between them. */
  const HAND = [
    { name: "F cap", p: [[35, 15], [29, 17], [25, 13], [28, 8], [33, 6], [43, 7], [52, 5], [62, 4]] },
    { name: "F stem", p: [[46, 9], [40, 16], [35, 23], [31, 28], [25, 35], [18, 39], [11, 41], [6, 40], [6, 36]] },
    { name: "F bar", p: [[31, 26], [34, 25], [39, 25], [42, 24]] },
    { name: "reeman", p: [
      [33, 41], [44, 26], [46, 23], [50, 27], [47, 33], [44, 39], [47, 41], [52, 38], // r
      [55, 32], [60, 31], [64, 29], [65, 26], [63, 25], [60, 26], [58, 29], [57, 31], [54, 33], [53, 37], [55, 40], [58, 40], [62, 38], // e
      [68, 32], [73, 31], [77, 29], [78, 26], [76, 25], [73, 26], [71, 29], [70, 31], [67, 33], [66, 37], [68, 40], [71, 40], [73, 38], // e
      [79, 32], [84, 27], [87, 26], [85, 31], [83, 37], [85, 31], [88, 27], [92, 26], [96, 25], [97, 27], [94, 33], [92, 38], [94, 33], [97, 27], [101, 26], [104, 25], [106, 27], [104, 33], [104, 36], [106, 38], // m
      [109, 37], [111, 33], [113, 29], [116, 26], [119, 25], [122, 26], [122, 31], [119, 34], [117, 38], [120, 39], // a
      [122, 37], [126, 33], [131, 27], [133, 26], [131, 31], [129, 37], [128, 39], [131, 31], [136, 26], [140, 26], [144, 26], [145, 28], [142, 33], [139, 38], [142, 39], [146, 37], // n
    ] },
    { name: "flourish", flick: true, speed: 1.5, p: [[146, 37], [149, 33], [152, 30], [154, 32], [154, 37], [152, 40], [150, 43], [146, 45], [140, 47], [130, 48], [100, 49], [70, 49], [45, 50], [25, 51], [5, 56]] },
  ];


  /* ---------- Arrival times per variant (ms at the measured tempo) ---------- */
  const DURATION = { still: 0, stroke: 1050, impression: 360, flourish: 320 };
  let model = null;
  const cache = {};
  function schedule(variant, xy) {
    if (cache[variant]) return cache[variant];
    const M = model || (model = analyse(xy)), n = M.n, a = new Float64Array(n), dur = DURATION[variant] || 0;
    if (variant === "stroke") {
      const w = M.write(HAND), f = M.flood(w, 0.4);
      for (let i = 0; i < n; i++) a[i] = (f.T[i] / w.total) * dur;
    } else if (variant === "flourish") {
      const w = M.write(HAND), f = M.flood(w, 1.2), k = HAND.length - 1, r = w.routes[k];
      for (let i = 0; i < n; i++) a[i] = f.O[i] === k ? (Math.max(0, f.T[i] - r.start) / (r.end - r.start)) * dur : 0;
    } else if (variant === "impression") {
      // Ink squeeze: the whole signature lands as its centre line, then spreads to its true
      // edges, distance through ink from the centre line setting the time. Thin letters are
      // full almost at once; the broad underline keeps taking ink a moment longer.
      const first = new Float64Array(W * H).fill(Infinity);
      for (const i of M.skel) first[i] = 0;
      // The first ring is already down on the first frame: no visible hairline stage.
      const f = M.flood({ first, owner: new Int32Array(W * H) }, 1), max = Math.max(...f.T);
      for (let i = 0; i < n; i++) a[i] = (Math.max(0, f.T[i] - 1) / (max - 1)) * dur;
    }
    const order = Array.from(a.keys()).sort((i, j) => a[i] - a[j]);
    return (cache[variant] = { a, order, total: a[order[n - 1]] || 0 });
  }

  /* ---------- Player ---------- */
  const NOOP = { replay() {}, paint() {}, destroy() {} };
  function mount(canvas, opts = {}) {
    if (!P) return NOOP;
    const xy = finishedPixels();
    if (!xy) return P.mount(canvas, { ...opts, play: false }); // unknown artwork: the production still
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return NOOP;
    const settings = typeof opts.settings === "function" ? opts.settings : () => ({});
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let plan = null, scale = 1, now = Infinity, frame = 0, timer = 0, dead = false;
    // production pixel-mark.js ink(), unchanged
    function ink() { const root = document.documentElement, css = getComputedStyle(root); return css.getPropertyValue("--mark").trim() || (root.dataset.palette === "sand" ? "#f93822" : (css.getPropertyValue("--ink").trim() || "#332e20")); }
    function draw(t) {
      now = t; ctx.clearRect(0, 0, W, H); ctx.fillStyle = ink();
      const all = !plan || t >= plan.total * scale;
      for (const i of plan ? plan.order : []) {
        if (!all && plan.a[i] * scale > t) break;
        ctx.fillRect(xy[2 * i], xy[2 * i + 1], 1, 1);
      }
      if (!plan) for (let i = 0; i < COUNT; i++) ctx.fillRect(xy[2 * i], xy[2 * i + 1], 1, 1);
    }
    function stop() { cancelAnimationFrame(frame); clearTimeout(timer); frame = timer = 0; }
    function finish() { stop(); if (!dead) draw(Infinity); }
    function replay() {
      if (dead) return;
      stop();
      const s = settings(), rate = s.rate || 1;
      plan = schedule(s.variant || "still", xy); scale = s.tempo || 1;
      const total = plan.total * scale;
      if (!total || reduce.matches || document.hidden) return finish();
      const start = performance.now();
      draw(0); // the first frame is painted with the page: never a blank wait
      const tick = (ts) => {
        const t = Math.max(0, Math.max(ts, performance.now()) - start) * rate;
        if (t >= total) return finish();
        draw(t); frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      timer = setTimeout(finish, total / rate + 400); // frames stopped arriving: show it finished
    }
    const hidden = () => { if (document.hidden && frame) finish(); };
    const restored = (e) => { if (e.persisted && frame) finish(); };
    const reduced = () => { if (reduce.matches && frame) finish(); };
    document.addEventListener("visibilitychange", hidden);
    addEventListener("pageshow", restored);
    reduce.addEventListener ? reduce.addEventListener("change", reduced) : reduce.addListener(reduced);
    if (opts.play === false) { plan = schedule(settings().variant || "still", xy); finish(); } else replay();
    return {
      replay,
      paint() { if (!dead) draw(now); },
      finish,
      destroy() {
        dead = true; stop();
        document.removeEventListener("visibilitychange", hidden);
        removeEventListener("pageshow", restored);
        reduce.removeEventListener ? reduce.removeEventListener("change", reduced) : reduce.removeListener(reduced);
      },
    };
  }

  window.FreemanSignatureMotion = { mount, DURATION, HAND, _analyse: analyse, _schedule: schedule, _checksum: checksum, _pixels: finishedPixels };
})();
