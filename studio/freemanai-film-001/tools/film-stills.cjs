const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const out = process.argv[2];
const T = [26.6, 27.4, 28.0];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('http://127.0.0.1:8824/studies/freemanai-film-001/?render=1&t=' + Date.now());
  for (const t of T) {
    await p.waitForFunction((t) => window.filmNow && window.filmNow() >= t, t, { timeout: 60000, polling: 'raf' });
    await p.screenshot({ path: `${out}/t${String(t.toFixed(1)).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 80 });
  }
  await p.waitForFunction(() => window.filmDone === true, null, { timeout: 60000 });
  const files = require('fs').readdirSync(out).filter((f) => f.endsWith('.jpg')).sort();
  const sheet = await b.newPage({ viewport: { width: 1920, height: 1200 } });
  await sheet.setContent(`<body style="margin:0;background:#332e20;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px;font:14px Monaco;color:#fff9f1">${files.map((f) => `<figure style="margin:0"><img src="file://${out}/${f}" style="width:100%;display:block"><figcaption>${f.slice(1, -4)}s</figcaption></figure>`).join('')}</body>`);
  await sheet.waitForTimeout(500);
  await sheet.screenshot({ path: `${out}/sheet-a.png`, clip: { x: 0, y: 0, width: 1920, height: 1200 } });
  await sheet.screenshot({ path: `${out}/sheet-full.png`, fullPage: true });
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
