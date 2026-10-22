const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://127.0.0.1:8824/studies/freemanai-film-001/?render=1&t=' + Date.now());
  await p.waitForFunction(() => window.filmDone === true, null, { timeout: 90000 });
  console.log(JSON.stringify(await p.evaluate(() => ({ marks: window.filmMarks, frames: window.filmFrames && window.filmFrames(), move: window.filmMove }))));
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
