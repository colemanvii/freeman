const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const fs = require('fs'); const path = require('path');
const dir = process.argv[2]; fs.mkdirSync(dir + '/raw', { recursive: true }); fs.mkdirSync(dir + '/cfr', { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--force-device-scale-factor=1'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const cdp = await p.context().newCDPSession(p);
  const frames = []; let n = 0;
  cdp.on('Page.screencastFrame', async (f) => {
    const file = `${dir}/raw/${String(n++).padStart(5, '0')}.jpg`;
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    frames.push([f.metadata.timestamp, file]);
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 94, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  await p.goto('http://127.0.0.1:8824/studies/freemanai-film-001/?render=1&t=' + Date.now());
  await p.waitForFunction(() => window.filmDone === true, null, { timeout: 90000 });
  await p.waitForTimeout(300);
  const epoch = await p.evaluate(() => window.filmEpoch) / 1000;
  await cdp.send('Page.stopScreencast');
  await b.close();
  // Constant 30 fps: each output frame shows the latest captured frame at or before its time.
  let k = 0, gaps = 0, last = null;
  for (let i = 0; i < 900; i++) {
    const t = epoch + i / 30;
    while (k + 1 < frames.length && frames[k + 1][0] <= t) k++;
    if (frames[k][0] > t + 0.001) gaps++;
    if (last === k && i > 0) gaps += 0;
    fs.copyFileSync(frames[k][1], `${dir}/cfr/${String(i).padStart(4, '0')}.jpg`);
    last = k;
  }
  const inFilm = frames.filter(([ts]) => ts >= epoch && ts <= epoch + 30);
  const iv = inFilm.slice(1).map(([ts], i) => ts - inFilm[i][0]).sort((a, b) => a - b);
  console.log('epoch', epoch, 'first', frames[0][0], 'last', frames[frames.length-1][0], 'sorted', frames.every((f,i)=>!i||f[0]>=frames[i-1][0]));
  console.log(JSON.stringify({ captured: frames.length, inFilm: inFilm.length, fps: +(inFilm.length / 30).toFixed(1), medianGapMs: Math.round(iv[iv.length >> 1] * 1000), p95GapMs: Math.round(iv[Math.floor(iv.length * .95)] * 1000), maxGapMs: Math.round(iv[iv.length - 1] * 1000) }));
})().catch((e) => { console.error(e); process.exit(1); });
