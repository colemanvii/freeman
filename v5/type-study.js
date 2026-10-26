/* Mobile typography study 001: ?type=a|b|c chooses a direction (type-study.css). The choice is
   kept in window.name so it survives in-app navigation and reloads within the same tab or frame;
   ?type=current shows production. Synchronous in <head>, before first paint. */
(() => {
  'use strict';
  const types = ['a', 'b', 'c'];
  const asked = new URLSearchParams(location.search).get('type');
  let type = types.includes(asked) ? asked : null;
  if (!asked) type = (/^type-study:([abc])$/.exec(window.name) || [])[1] || null;
  window.name = type ? 'type-study:' + type : '';
  if (type) document.documentElement.dataset.type = type;
})();
