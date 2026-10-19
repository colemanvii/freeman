/* One sheet at a time, like the V5 project gallery. Without JS, every sheet is shown in order. */
(() => {
  'use strict';
  const sheets = [...document.querySelectorAll('.sheet')];
  if (!sheets.length || matchMedia('(max-width: 760px)').matches) return;
  document.documentElement.classList.replace('no-js', 'js');

  const toc = [...document.querySelectorAll('.toc a')];
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const count = document.getElementById('count');
  const pad = n => String(n).padStart(2, '0');
  let i = 0;

  function show(n, focus) {
    i = Math.max(0, Math.min(sheets.length - 1, n));
    sheets.forEach((s, k) => s.classList.toggle('is-current', k === i));
    toc.forEach((a, k) => a.setAttribute('aria-current', k === i ? 'true' : 'false'));
    prev.disabled = i === 0;
    next.disabled = i === sheets.length - 1;
    count.textContent = `${pad(i + 1)} / ${pad(sheets.length)}`;
    history.replaceState(null, '', `#${sheets[i].id}`);
    if (focus) sheets[i].focus({ preventScroll: true });
  }

  toc.forEach((a, k) => a.addEventListener('click', e => { e.preventDefault(); show(k, true); }));
  prev.addEventListener('click', () => show(i - 1));
  next.addEventListener('click', () => show(i + 1));
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') show(i + 1);
    if (e.key === 'ArrowLeft') show(i - 1);
  });

  const fromHash = () => Math.max(0, sheets.findIndex(s => `#${s.id}` === location.hash));
  addEventListener('hashchange', () => show(fromHash()));
  show(fromHash());
})();
