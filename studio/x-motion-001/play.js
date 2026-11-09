/* Shared player. Each <canvas data-study="01"> plays its loop on the real clock.
   Keys: space pause · ← → step one frame (60 fps) · L show the loop seam (last frame | first frame). */
(async () => {
  'use strict';
  await document.fonts.ready;
  const studies = await window.FreemanMotion.load();
  const canvases = [...document.querySelectorAll('canvas[data-study]')];
  const t0 = performance.now();
  let paused = false, offset = 0, pausedAt = 0;
  const fps = 60;
  window.stage = {
    studies,
    at(id, p, ctx) { studies[id].draw(ctx || canvases.find((c) => c.dataset.study === id).getContext('2d'), ((p % 1) + 1) % 1); },
  };
  if (document.body.dataset.render === '1') return; // the renderer drives frames itself
  const elapsed = () => (paused ? pausedAt : performance.now() - t0 - offset) / 1000;
  function frame() {
    const s = elapsed();
    for (const c of canvases) { const st = studies[c.dataset.study]; st.draw(c.getContext('2d'), (s % st.D) / st.D); const o = (c.closest('figure') || c.parentElement).querySelector('.time'); if (o) o.textContent = (s % st.D).toFixed(2).padStart(5, '0') + ' / ' + st.D.toFixed(2) + ' s'; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); if (paused) { offset += performance.now() - t0 - offset - pausedAt; paused = false; } else { pausedAt = performance.now() - t0 - offset; paused = true; } }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { if (!paused) { pausedAt = performance.now() - t0 - offset; paused = true; } pausedAt += (e.key === 'ArrowRight' ? 1 : -1) * 1000 / fps; }
    if (e.key === 'l' || e.key === 'L') { if (!paused) { pausedAt = performance.now() - t0 - offset; paused = true; } const D = studies[canvases[0].dataset.study].D; pausedAt = (pausedAt / 1000 % D < D / 2 ? D * 1000 - 1000 / fps : 0) + Math.floor(pausedAt / 1000 / D) * D * 1000; }
  });
})();
