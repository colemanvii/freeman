// The three Stamp motions from motion.html, packaged so the context study can
// play them on any canvas. Each draws the 192 x 60 bitmap at whole-pixel
// positions and ends by drawing the bitmap itself, so the last frame is the
// artwork exactly.
window.FreemanBitmapEagle = (() => {
  const W = 192, H = 60;
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function parse(text) {
    const lines = text.split('\n').filter((l) => l && !l.startsWith('#'));
    const bits = lines.slice(2).join('').replace(/\s+/g, '');
    const ink = [];
    for (let i = 0; i < W * H; i++) if (bits[i] === '1') ink.push([i % W, Math.floor(i / W)]);
    return ink;
  }
  function paint(ctx, pts, color) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = color; for (const [x, y] of pts) ctx.fillRect(x, y, 1, 1); }

  const MOTIONS = {
    reveal(ink) {
      return { D: 1500, frame: (ctx, t, color) => paint(ctx, ink.slice(0, Math.floor(ink.length * Math.min(1, t / 1500))), color) };
    },
    impression(ink) {
      const set = new Set(ink.map(([x, y]) => y * W + x));
      const solid = (n) => {
        const pts = [];
        for (let by = 0; by < H; by += n) for (let bx = 0; bx < W; bx += n) {
          let k = 0; for (let y = by; y < by + n; y++) for (let x = bx; x < bx + n; x++) if (set.has(y * W + x)) k++;
          if (k * 2 >= n * n) for (let y = by; y < Math.min(H, by + n); y++) for (let x = bx; x < bx + n; x++) pts.push([x, y]);
        }
        return pts;
      };
      const steps = [[300, solid(8)], [370, solid(4)], [430, solid(2)], [520, null]];
      return { D: 1200, frame(ctx, t, color) { let pts = []; for (const [at, p] of steps) if (t >= at) pts = p || ink; paint(ctx, pts, color); } };
    },
    assembly(ink) {
      const r = rng(1080), shards = new Map();
      for (const [x, y] of ink) {
        const key = (y >> 2) * 64 + (x >> 2);
        if (!shards.has(key)) shards.set(key, { pts: [], dx: Math.round((r() * 2 - 1) * 13), dy: Math.round((r() * 2 - 1) * 13), start: r() * 0.35 });
        shards.get(key).pts.push([x, y]);
      }
      const list = [...shards.values()];
      return { D: 1850, frame(ctx, t, color) {
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = color;
        const p = t / 1850;
        for (const s of list) {
          const k = easeOut(Math.min(1, Math.max(0, (p - s.start) / (1 - s.start - 0.15))));
          const ox = Math.round(s.dx * (1 - k)), oy = Math.round(s.dy * (1 - k));
          for (const [x, y] of s.pts) ctx.fillRect(x + ox, y + oy, 1, 1);
        }
      } };
    },
  };

  let ink = null;
  return {
    W, H,
    async load(url) { ink = parse(await (await fetch(url, { cache: 'no-store' })).text()); },
    still(ctx, color) { paint(ctx, ink, color); },
    // play(ctx, 'reveal', { speed, color, raf }) -> Promise resolved on the final frame
    play(ctx, kind, { speed = 1, color = '#332e20', raf = requestAnimationFrame.bind(window), reduced = false } = {}) {
      const m = MOTIONS[kind](ink);
      if (reduced) { paint(ctx, ink, color); return Promise.resolve(0); }
      return new Promise((done) => {
        let start = null;
        const tick = (now) => {
          if (start === null) start = now;
          const t = (now - start) * speed;
          if (t >= m.D) { paint(ctx, ink, color); done(m.D / speed); return; }
          m.frame(ctx, t, color); raf(tick);
        };
        m.frame(ctx, 0, color); raf(tick);
      });
    },
  };
})();
