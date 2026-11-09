// Frame-exact render of one study from the same draw() the player uses.
//   PLAYWRIGHT=/path/to/node_modules/playwright node render.cjs <id> <out-dir> [fps=60] [only=0,120,240]
// Needs the study served over http (fetch of stamp.pbm): BASE=http://127.0.0.1:8840
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs'); const path = require('path');
const [id, outArg, fpsArg, onlyArg] = process.argv.slice(2);
const out = path.resolve(outArg); fs.mkdirSync(out, { recursive: true });
const fps = +(fpsArg || 60), base = process.env.BASE || 'http://127.0.0.1:8840';
(async () => {
  const b = await chromium.launch({ args: ['--force-device-scale-factor=1', '--font-render-hinting=none'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
  p.on('console', (m) => console.error('page:', m.text()));
  await p.goto(`${base}/studio/x-motion-001/study.html?s=${id}&render=1`);
  await p.waitForFunction(() => window.stage && window.stage.studies);
  const D = await p.evaluate((id) => window.stage.studies[id].D, id);
  const total = Math.round(D * fps);
  const list = onlyArg ? onlyArg.split(',').map(Number) : [...Array(total).keys()];
  for (const i of list) {
    const data = await p.evaluate(([id, q]) => { const c = document.querySelector('canvas'); window.stage.at(id, q); return c.toDataURL('image/png'); }, [id, i / total]);
    fs.writeFileSync(path.join(out, String(i).padStart(4, '0') + '.png'), Buffer.from(data.split(',')[1], 'base64'));
  }
  console.log(JSON.stringify({ id, D, fps, frames: list.length, total }));
  await b.close();
})();
