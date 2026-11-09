// Proves the Material rule on the rendered loops: every frame holds every pixel,
// no two pixels share a cell, and the loop seam is identical. Prints a fingerprint
// of all 480 frames so a later change can be checked against the approved one.
//   PLAYWRIGHT=/path/to/node_modules/playwright node verify.cjs 02 04
// Needs the worktree root served at BASE (default http://127.0.0.1:8840).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const base = process.env.BASE || 'http://127.0.0.1:8840';
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['02', '04'];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', (e) => console.error('page error:', e.message));
  await p.goto(`${base}/studio/x-motion-001/study.html?s=02&render=1`);
  await p.waitForFunction(() => window.stage && window.stage.studies, null, { timeout: 60000 });
  let failed = false;
  for (const id of ids) {
    const r = await p.evaluate((id) => {
      const st = window.stage.studies[id]; let h = 0, bad = 0, n = 0;
      for (let i = 0; i < 480; i++) {
        const c = st.cells(i / 480); n = c.length;
        if (new Set(c.map(([x, y]) => x + ',' + y)).size !== c.length) bad++;
        for (const [x, y] of c) h = (Math.imul(h, 31) + x * 977 + y) | 0;
      }
      return { name: st.name, pixels: n, framesWithOverlap: bad, seamIdentical: JSON.stringify(st.cells(0)) === JSON.stringify(st.cells(0.99999)), fingerprint: h };
    }, id);
    if (r.framesWithOverlap || !r.seamIdentical) failed = true;
    console.log(id, JSON.stringify(r));
  }
  await b.close(); process.exit(failed ? 1 : 0);
})();
