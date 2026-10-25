/* One palette for the public site, ACCESS, the password gate and Team OS.
   Synchronous in <head>: apply before paint, including POST error responses. */
(() => {
  'use strict';
  const colors = { chalk: '#fff9f1', sand: '#ddcfb3', umber: '#332e20' };
  let palette = 'chalk';
  try {
    const saved = sessionStorage.getItem('freeman-palette');
    if (Object.hasOwn(colors, saved)) palette = saved;
  } catch (_) {}
  document.documentElement.dataset.palette = palette;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = colors[palette];
})();
