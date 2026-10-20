/* Freeman signature — a hand writing the original 160×61 script.
   Study only (study/opus-signature-motion). Production pixel-mark.js is read, never changed.

   The artwork is taken at runtime from the production finished frame, pixel for pixel. Nothing
   here draws a shape of its own: every frame is a subset of those pixels at full or partial
   opacity, and every pixel ends at full opacity, so the last frame is the production frame.

   How the hand is modelled
   - Centrelines: the bitmap is thinned (Zhang–Suen); each stroke is a list of waypoints routed
     along that skeleton, so the pen follows the real ink, including retraces (m, n, e, a).
   - Point of contact: a pixel appears when the moving nib first covers it. The nib radius is the
     local half-width of the stroke, so the leading edge is round, like ink under a pen.
   - Rhythm: the line is cut at its vertical turning points; each piece is one minimum-jerk
     motion (slow out of a turn, fastest mid-stroke, slow into the next), timed by isochrony.
     Retraces are quick; the flourish is one ballistic throw with a skewed velocity profile.
   - Pen lifts are real air time; crossing strokes own their pixels, so a later stroke is never
     disclosed early by an earlier one passing over it. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FreemanHand = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const W = 160, H = 61;

  /* ---------- curves ---------- */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let lo = 0, hi = 1;
      for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (X(m) < x) lo = m; else hi = m; }
      return Y((lo + hi) / 2);
    };
  }
  const smooth = (t) => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  /* ---------- bitmap analysis ---------- */
  function thin(g) {
    const k = g.slice();
    const at = (x, y) => k[y * W + x];
    let changed = true;
    while (changed) {
      changed = false;
      for (const step of [0, 1]) {
        const del = [];
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          if (!at(x, y)) continue;
          const p = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
          const b = p.reduce((a, c) => a + c, 0);
          if (b < 2 || b > 6) continue;
          let a = 0; for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) a++;
          if (a !== 1) continue;
          if (step === 0 ? (p[0] * p[2] * p[4] || p[2] * p[4] * p[6]) : (p[0] * p[2] * p[6] || p[0] * p[4] * p[6])) continue;
          del.push(y * W + x);
        }
        for (const i of del) k[i] = 0;
        if (del.length) changed = true;
      }
    }
    return k;
  }
  // Distance from each ink pixel to the nearest paper pixel: the local half-width of the stroke.
  function halfWidth(g) {
    const d = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!g[y * W + x]) continue;
      let best = 9;
      for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) {
        const xx = x + dx, yy = y + dy;
        const paper = xx < 0 || yy < 0 || xx >= W || yy >= H || !g[yy * W + xx];
        if (paper) { const r = Math.hypot(dx, dy); if (r < best) best = r; }
      }
      d[y * W + x] = best;
    }
    return d;
  }
  function snap(sk, x, y) {
    let best = null, bd = 1e9;
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      if (!sk[yy * W + xx]) continue;
      const d = (xx - x) ** 2 + (yy - y) ** 2;
      if (d < bd) { bd = d; best = [xx, yy]; }
    }
    return { p: best, d: Math.sqrt(bd) };
  }
  function route(sk, a, b) {
    const N = W * H, dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), done = new Uint8Array(N);
    const s = a[1] * W + a[0], t = b[1] * W + b[0];
    dist[s] = 0;
    const open = [s];
    while (open.length) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (dist[open[i]] < dist[open[bi]]) bi = i;
      const u = open.splice(bi, 1)[0];
      if (done[u]) continue; done[u] = 1;
      if (u === t) break;
      const ux = u % W, uy = (u / W) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const vx = ux + dx, vy = uy + dy; if (vx < 0 || vy < 0 || vx >= W || vy >= H) continue;
        const v = vy * W + vx; if (!sk[v] || done[v]) continue;
        const nd = dist[u] + (dx && dy ? Math.SQRT2 : 1);
        if (nd < dist[v]) { dist[v] = nd; prev[v] = u; open.push(v); }
      }
    }
    if (!isFinite(dist[t])) throw new Error("no skeleton route " + a + " → " + b);
    const out = []; for (let v = t; v !== -1; v = prev[v]) out.push([v % W, (v / W) | 0]);
    return out.reverse();
  }

  /* ---------- the strokes of the signature (waypoints on the skeleton; {r:[x,y]} = free point) ---------- */
  const STROKES = {
    // F capital: entry tick, the small loop, the cap swash rising to the right.
    // Across the stem junction the cap keeps to its own centreline, so the stem's top is not shown early.
    cap: [[34, 15], [30, 16], [27, 14], [26, 12], [28, 9], [31, 7], [37, 6], [42, 6], { r: [45.5, 6.7] }, { r: [49.5, 6.7] }, [53, 6], [55, 6], [60, 5]],
    // One-breath variant: the swash hooks back down into the stem without lifting.
    capHook: [[34, 15], [30, 16], [27, 14], [26, 12], [28, 9], [31, 7], [37, 6], [42, 6], { r: [45.5, 6.7] }, { r: [49.5, 6.7] }, [53, 6], [55, 6], [60, 5], [55, 6], [53, 6], { r: [49.5, 6.9], back: true }, { r: [46.5, 7.9], back: true }],
    // F stem: down the long diagonal, through the crossbar (free line so the crossing stays its own), into the foot curl.
    stem: [[45, 9], [42, 13], [39, 17], [36, 21], [35, 23], { r: [33.3, 25.1] }, { r: [31.4, 26.6] }, [31, 28], [29, 31], [26, 34], [22, 37], [18, 39], [12, 40], [8, 40], [7, 39], [6, 37], [6, 36]],
    // F crossbar, crossing the stem.
    bar: [{ r: [29.4, 24.6] }, { r: [33, 25] }, [36, 25], [39, 25], [41, 24]],
    // r e e m a n in one connected line, ending at the foot of the n's closing loop.
    word: [
      [34, 40], [37, 36], [40, 32], [43, 28], [44, 26], [46, 25], [48, 26], [49, 28], [48, 30], [47, 32], [45, 35], [44, 38], [45, 40], [46, 39], [48, 39], [50, 38], [53, 38],
      [53, 37], [54, 34], [55, 32], [57, 31], [59, 31], [61, 31], [62, 30], [63, 29], [64, 28], [65, 27], [65, 26], [64, 25], [62, 25], [61, 26], [59, 27], [58, 29], [58, 30], [57, 31],
      [56, 32], [54, 33], [53, 36], [53, 37], [53, 39], [54, 40], [58, 40], [59, 39], [61, 38], [63, 37], [65, 37],
      [66, 36], [67, 34], [68, 32], [70, 31], [74, 31], [76, 29], [77, 28], [78, 26], [77, 25], [75, 25], [73, 26], [72, 28], [71, 30], [70, 31],
      [68, 32], [67, 34], [66, 36], [66, 38], [66, 39], [67, 40], [70, 40], [72, 39], [74, 38], [75, 37],
      [76, 36], [79, 33], [81, 30], [83, 28], [84, 27], [85, 26], [87, 26], [88, 27], [88, 29], [87, 31], [85, 33], [84, 35], [83, 37],
      [84, 35], [85, 33], [87, 31], [88, 29], [88, 27], [90, 27], [92, 26], [94, 25], [97, 25], [98, 27], [98, 28], [97, 29], [96, 31], [94, 33], [93, 35], [92, 36], [91, 38], [90, 40],
      [91, 38], [92, 36], [93, 35], [94, 33], [96, 31], [97, 29], [98, 28], [99, 27], [100, 27], [101, 26], [103, 25], [105, 25], [106, 26], [106, 28], [105, 30], [104, 31], [103, 32], [102, 34], [101, 36], [101, 39], [102, 40],
      [104, 39], [106, 38], [109, 38],
      [109, 39], [110, 40], [112, 40], [113, 39], [116, 39], [117, 38], [117, 36], [119, 33], [121, 30], [122, 28], [122, 26], [121, 25], [118, 25], [117, 26], [115, 27], [114, 28], [113, 30], [112, 31], [111, 33], [110, 35], [109, 37], [109, 38],
      [109, 39], [110, 40], [112, 40], [113, 39], [116, 39], [117, 39], [120, 39],
      [121, 38], [123, 36], [125, 34], [127, 32], [128, 30], [130, 28], [131, 27], [132, 26], [134, 25], [135, 25], [136, 26], [136, 28], [135, 30], [134, 31], [132, 33], [131, 35], [130, 36], [129, 38], [128, 39],
      [129, 38], [130, 36], [131, 35], [132, 33], [134, 31], [135, 30], [136, 28], [136, 27], [138, 27], [140, 26], [142, 25], [144, 25], [144, 26], [145, 27], [144, 28], [144, 29], [143, 30], [142, 32], [141, 33], [140, 35], [139, 37], [139, 39],
      [141, 39], [143, 39], [145, 38], [146, 37], [148, 35], [149, 34], [150, 32], [151, 31], [153, 30], [154, 31], [154, 35], [154, 37], [153, 38],
    ],
    // The final gesture: out of the n's loop, down and back under the whole name.
    flourish: [[153, 38], [153, 39], [152, 40], [151, 41], [150, 42], [148, 43], [146, 44], [144, 45], [142, 46], [140, 47], [137, 47], [136, 48], [111, 48], [110, 49], [60, 49], [23, 49], [20, 50], [17, 51], [14, 52], [11, 53], [8, 54], [6, 55]],
  };

  /* ---------- three interpretations ----------
     order: strokes in writing order. join: "lift" (pen leaves the paper, air time in ms)
     or "flow" (continuous, no deceleration). ms values are desktop; mobile scales by `mobile`. */
  const HANDS = {
    practiced: {
      name: "Practiced",
      note: "A signature written thousands of times. Classic order; the hand never hesitates, and the name runs straight into the flourish as one throw.",
      // Refinement 002: a held beat of blank paper before touchdown; phones compressed less (fewer
      // pixels jumped per frame); the flourish is a true throw, launched hard out of the n, fastest
      // stroke of the piece and released at speed; the hairline tip then settles into the hold.
      pause: 300, end: 2020, mobile: 0.86,
      iso: 0.55, flow: 0.3, turn: 1.0, retrace: 2.2, touch: 0, settle: { px: 26, ms: 150 },
      order: [
        { s: "cap", tempo: [1.25, 1.0] }, { s: "stem", lift: 46, tempo: [1.0, 0.9] }, { s: "bar", lift: 58 }, { s: "word", lift: 50, tempo: [1.1, 0.82] },
        { s: "flourish", flow: true, single: true, throw: [0.8, 1.6, 0.55], gain: 0.95 },
      ],
    },
    considered: {
      name: "Considered",
      note: "Signed with care. Each stroke lands and settles; the F is crossed after the name, then a held breath before a separate, sweeping underline.",
      pause: 260, end: 2700, mobile: 0.8,
      iso: 0.5, flow: 0.14, turn: 0.9, retrace: 1.5, touch: 38,
      order: [
        { s: "cap", tempo: [1.2, 1.1] }, { s: "stem", lift: 80 }, { s: "word", lift: 95, tempo: [1.05, 0.95] },
        { s: "bar", lift: 120 },
        { s: "flourish", lift: 170, single: true, throw: [1.6, 1.5, 0.26], gain: 1.5 },
      ],
    },
    breath: {
      name: "One Breath",
      note: "Fast and connected. Cap and stem in a single motion through the cusp, the crossbar dashed in, the name in quick beats, and a hard whip underneath.",
      pause: 120, end: 1520, mobile: 0.8,
      iso: 0.62, flow: 0.4, turn: 1.2, retrace: 2.8, touch: 0,
      order: [
        { s: "capHook" }, { s: "stem", flow: true }, { s: "bar", lift: 40 }, { s: "word", lift: 36, tempo: [1.0, 0.8] },
        { s: "flourish", flow: true, single: true, throw: [1.0, 1.0, 0.5], gain: 1.05 },
      ],
    },
  };

  /* ---------- build ---------- */
  function build(pixels, handId, opts = {}) {
    const hand = HANDS[handId];
    const scale = opts.mobile ? hand.mobile : 1;
    const g = new Uint8Array(W * H);
    for (const p of pixels) g[p.y * W + p.x] = 1;
    const sk = thin(g), hw = halfWidth(g);
    const warnings = [];

    // 1. paths: route waypoints along the skeleton; mark retraced segments (no new ink).
    const seen = new Set();
    const segKey = (a, b) => { const ka = a[0] + "," + a[1], kb = b[0] + "," + b[1]; return ka < kb ? ka + "|" + kb : kb + "|" + ka; };
    const paths = hand.order.map((o) => {
      const way = STROKES[o.s];
      const nodes = []; // {x,y,ink} ink = the segment arriving here lays new ink
      let last = null;
      for (const w of way) {
        if (w.r) { nodes.push({ x: w.r[0], y: w.r[1], ink: !w.back, free: true }); last = null; continue; }
        const sn = snap(sk, w[0], w[1]);
        if (sn.d > 1.01) warnings.push(`${o.s}: waypoint ${w} is ${sn.d.toFixed(2)} off the skeleton`);
        if (last) {
          const r = route(sk, last, sn.p);
          for (let i = 1; i < r.length; i++) {
            const k = segKey(r[i - 1], r[i]);
            nodes.push({ x: r[i][0], y: r[i][1], ink: !seen.has(k) }); seen.add(k);
          }
        } else nodes.push({ x: sn.p[0], y: sn.p[1], ink: true });
        last = sn.p;
      }
      return { o, nodes };
    });

    // 2. smooth the pixel staircase and resample every 0.5 px.
    for (const P of paths) {
      const n = P.nodes, sm = n.map((p, i) => {
        if (i === 0 || i === n.length - 1 || p.free) return { x: p.x, y: p.y, ink: p.ink };
        let sx = 0, sy = 0, c = 0;
        for (let j = Math.max(0, i - 2); j <= Math.min(n.length - 1, i + 2); j++) { sx += n[j].x; sy += n[j].y; c++; }
        return { x: sx / c, y: sy / c, ink: p.ink };
      });
      const S = [{ x: sm[0].x, y: sm[0].y, ink: true, s: 0 }];
      let s = 0;
      for (let i = 1; i < sm.length; i++) {
        const a = sm[i - 1], b = sm[i], L = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.max(1, Math.round(L / 0.5));
        for (let k = 1; k <= steps; k++) { s += L / steps; S.push({ x: a.x + (b.x - a.x) * k / steps, y: a.y + (b.y - a.y) * k / steps, ink: b.ink, s }); }
      }
      P.S = S; P.len = s;
    }

    // 3. rhythm. Handwriting moves in strokes between vertical turning points (tops of humps,
    //    bottoms of legs, loop apexes, cusps). Each stroke is one minimum-jerk motion: it leaves
    //    a turn slowly, peaks mid-stroke and slows into the next turn; `flow` keeps a fraction of
    //    speed through the turns. Durations follow isochrony (longer strokes are faster, not
    //    proportionally longer). The final gesture is one ballistic throw with a skewed profile.
    const cdf = (a, b) => { // cumulative of u^a (1-u)^b, tabulated
      const N = 400, c = new Float64Array(N + 1); let acc = 0;
      for (let i = 1; i <= N; i++) { const u = (i - 0.5) / N; acc += Math.pow(u, a) * Math.pow(1 - u, b); c[i] = acc; }
      for (let i = 0; i <= N; i++) c[i] /= acc;
      return (u) => { const x = Math.max(0, Math.min(1, u)) * N, i = Math.min(N - 1, Math.floor(x)); return c[i] + (c[i + 1] - c[i]) * (x - i); };
    };
    const bell = cdf(2, 2);
    for (let pi = 0; pi < paths.length; pi++) {
      const P = paths[pi], S = P.S, n = S.length, o = P.o;
      const ys = S.map((_, i) => { let t = 0, c = 0; for (let j = Math.max(0, i - 6); j <= Math.min(n - 1, i + 6); j++) { t += S[j].y; c++; } return t / c; });
      let cuts = [0];
      if (!o.single) {
        let dir = 0, ext = ys[0], ei = 0;
        for (let i = 1; i < n; i++) {
          if (dir >= 0 && ys[i] > ext) { ext = ys[i]; ei = i; if (!dir) dir = 1; }
          else if (dir <= 0 && ys[i] < ext) { ext = ys[i]; ei = i; if (!dir) dir = -1; }
          else if (Math.abs(ys[i] - ext) > hand.turn) { cuts.push(ei); dir = -dir || (ys[i] > ext ? 1 : -1); ext = ys[i]; ei = i; }
        }
      }
      for (let i = 1; i < n; i++) if (S[i].ink !== S[i - 1].ink) cuts.push(i - 1);
      cuts.push(n - 1);
      cuts = [...new Set(cuts)].sort((x, y) => x - y).filter((c, i, arr) => i === 0 || c === n - 1 || S[c].s - S[arr[i - 1]].s > 3 && S[n - 1].s - S[c].s > 2);
      P.cuts = cuts;
      let u = 0;
      for (let ci = 1; ci < cuts.length; ci++) {
        const ia = cuts[ci - 1], ib = cuts[ci], L = S[ib].s - S[ia].s;
        const ink = S[Math.min(ib, ia + 1)].ink;
        const final = !!o.throw;
        const shape = final ? cdf(o.throw[0], o.throw[1]) : bell;
        // speed kept through a turn: none at touchdown / lift-off, `flow` inside a continuous line
        const first = ci === 1 && !o.flow, last = ci === cuts.length - 1 && !(paths[pi + 1] && paths[pi + 1].o.flow);
        const lam = final ? o.throw[2] : first || last ? hand.flow * 0.35 : hand.flow;
        // tempo: a hand settles into some strokes and gathers speed through others
        const tp = o.tempo ? o.tempo[0] + (o.tempo[1] - o.tempo[0]) * ((S[ia].s + S[ib].s) / 2 / P.len) : 1;
        const D = Math.pow(Math.max(L, 0.5), hand.iso) * (ink ? 1 : 1 / hand.retrace) * (final ? o.gain : 1) * tp;
        for (let i = ia + 1; i <= ib; i++) {
          const f = (S[i].s - S[ia].s) / L;
          // invert s(τ) = (1-λ)·shape(τ) + λ·τ
          let lo = 0, hi = 1;
          for (let k2 = 0; k2 < 30; k2++) { const m = (lo + hi) / 2, cdfm = shape(m); if ((1 - lam) * cdfm + lam * m < f) lo = m; else hi = m; }
          S[i].u = u + D * (lo + hi) / 2;
        }
        u += D;
      }
      S[0].u = 0;
      P.units = u;
    }

    // 4. time: fixed air/touch times in ms; the rest of the span is shared by pen travel.
    let fixed = 0, units = 0;
    for (const P of paths) { if (P.o.lift) fixed += P.o.lift * scale + hand.touch * scale; units += P.units; }
    if (paths[0]) fixed += hand.touch * scale;
    const pause = hand.pause * scale, end = hand.end * scale, FADE = 6;
    const k = (end - FADE - pause - fixed) / units; // ms per unit
    let t = pause;
    const lifts = [];
    paths.forEach((P, pi) => {
      if (P.o.lift) { const t0 = t; t += P.o.lift * scale; lifts.push({ t0, t1: t, from: paths[pi - 1].S[paths[pi - 1].S.length - 1], to: P.S[0] }); }
      if (P.o.lift || pi === 0) t += hand.touch * scale;
      P.S[0].t = t;
      const t0 = t; for (let i = 1; i < P.S.length; i++) P.S[i].t = t0 + k * P.S[i].u; t = t0 + k * P.units;
      P.t0 = P.S[0].t; P.t1 = t;
    });

    // 5. ownership: each pixel belongs to the stroke whose ink line is nearest (ties → written first).
    const out = [];
    for (const p of pixels) {
      const near = paths.map((P, pi) => {
        let d = Infinity, i = -1;
        P.S.forEach((q, j) => { if (!q.ink) return; const e = Math.hypot(q.x - p.x, q.y - p.y); if (e < d) { d = e; i = j; } });
        return { d, i, pi };
      });
      const D = Math.min(...near.map((c) => c.d));
      const best = near.find((c) => c.d <= D + 0.4);
      out.push({ x: p.x, y: p.y, pi: best.pi, i: best.i, d: best.d });
    }
    // 6. contact: the nib (local half-width) first covers the pixel, searched back along its own stroke.
    for (const q of out) {
      const S = paths[q.pi].S;
      const r = hwAt(hw, sk, S[q.i]) + 0.35;
      let j = q.i;
      while (j > 0 && S[q.i].s - S[j - 1].s < r + 2.5) {
        const c = S[j - 1];
        if (c.ink && Math.hypot(c.x - q.x, c.y - q.y) <= r) j--; else if (!c.ink) j--; else break;
      }
      while (j < q.i && !S[j].ink) j++;
      q.t = S[j].t;
      // ink settles within about one pixel of pen travel, whatever the speed: no smear behind the nib
      const nx = S[Math.min(S.length - 1, j + 2)], v = (nx.s - S[j].s) / Math.max(1e-3, nx.t - S[j].t);
      q.fade = Math.max(2.5, Math.min(12, 1.1 / Math.max(v, 1e-3)));
      q.stroke = paths[q.pi].o.s;
    }
    // `settle`: the pen leaves the paper while still moving; the hairline tip of the last stroke
    // then lands a beat behind it, so the finished mark arrives and holds rather than stopping dead.
    if (hand.settle) {
      const P = paths[paths.length - 1], from = P.len - hand.settle.px;
      for (const q of out) {
        if (q.pi !== paths.length - 1) continue;
        const f = (P.S[q.i].s - from) / hand.settle.px;
        if (f > 0) q.fade = Math.max(q.fade, hand.settle.ms * Math.pow(Math.min(1, f), 1.6));
      }
    }
    const total = Math.max(...out.map((q) => q.t + q.fade));

    // speed trace for the instrument (px/ms over time) and the pen path for the trace layer
    const trace = [];
    for (const P of paths) for (let i = 1; i < P.S.length; i++) {
      const a = P.S[i - 1], b = P.S[i];
      trace.push({ t: b.t, v: (b.s - a.s) / Math.max(1e-6, b.t - a.t), x: b.x, y: b.y, ink: b.ink });
    }
    return {
      _paths: paths, hand, handId, mobile: !!opts.mobile, pixels: out, total, FADE, pause, end, lifts, trace, warnings,
      paths: paths.map((P) => ({ stroke: P.o.s, t0: P.t0, t1: P.t1, len: P.len, lift: P.o.lift || 0, flow: !!P.o.flow })),
      // alpha of every pixel at time ms (0..1); equal to 1 everywhere from `total` on
      alphaAt(ms) { return out.map((q) => ms >= total ? 1 : Math.max(0, Math.min(1, (ms - q.t) / q.fade))); },
      // where the nib is at time ms (null in the air)
      penAt(ms) {
        for (const P of paths) {
          if (ms < P.t0 || ms > P.t1) continue;
          const S = P.S; let lo = 0, hi = S.length - 1;
          while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S[m].t <= ms) lo = m; else hi = m; }
          const a = S[lo], b = S[hi], u = (ms - a.t) / Math.max(1e-6, b.t - a.t);
          return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, ink: b.ink, stroke: P.o.s };
        }
        for (const L of lifts) if (ms > L.t0 && ms < L.t1) {
          const u = smooth((ms - L.t0) / (L.t1 - L.t0));
          return { x: L.from.x + (L.to.x - L.from.x) * u, y: L.from.y + (L.to.y - L.from.y) * u, air: true };
        }
        return null;
      },
    };
  }
  function hwAt(hw, sk, q) {
    // half-width at the nearest skeleton pixel to a path sample
    const x = Math.round(q.x), y = Math.round(q.y);
    let best = 1.5, bd = 9;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= W || yy >= H || !sk[yy * W + xx]) continue;
      const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = hw[yy * W + xx]; }
    }
    return best;
  }

  return { W, H, HANDS, STROKES, build, bezier, thin };
});
