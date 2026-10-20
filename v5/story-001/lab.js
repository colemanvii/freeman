/* Project Story 001 — the laboratory frame: study switcher, About sheet, shortcuts.
   Each study page sets <body data-study="a|b|c"> and includes a <template id="about-study">. */
(() => {
  'use strict';
  const STUDIES = [
    { key: 'a', name: 'Approach', href: '../a/' },
    { key: 'b', name: 'Account', href: '../b/' },
    { key: 'c', name: 'Sheet', href: '../c/' }
  ];
  const body = document.body;
  const current = body.dataset.study;
  const idx = STUDIES.findIndex(s => s.key === current);

  const lab = document.createElement('header');
  lab.className = 'lab';
  lab.innerHTML =
    '<nav aria-label="Project Story 001 studies">' +
      '<a href="../" class="study-tag">Story 001<span class="long"> · The Optimist</span></a><span class="sep">/</span>' +
      STUDIES.map((s, i) =>
        `<a href="${s.href}"${s.key === current ? ' aria-current="page"' : ''}>${s.key.toUpperCase()}<span class="long"> ${s.name}</span></a>` +
        (i < STUDIES.length - 1 ? '<span class="sep">/</span>' : '')).join('') +
    '</nav>' +
    '<div class="tools"><button type="button" data-about>About</button><a href="../">× Index</a></div>';
  body.prepend(lab);

  const tpl = document.getElementById('about-study');
  let about = null;
  let lastFocus = null;
  if (tpl) {
    about = document.createElement('section');
    about.className = 'about';
    about.setAttribute('role', 'dialog');
    about.setAttribute('aria-modal', 'true');
    about.setAttribute('aria-label', 'About this study');
    about.innerHTML = '<button type="button" class="close-about">× Close</button><div class="about-inner"></div>';
    about.querySelector('.about-inner').append(tpl.content.cloneNode(true));
    body.append(about);
    about.querySelector('.close-about').addEventListener('click', () => toggleAbout(false));
  }
  function toggleAbout(open) {
    if (!about) return;
    const next = open === undefined ? !about.classList.contains('open') : open;
    if (next) { lastFocus = document.activeElement; about.classList.add('open'); about.querySelector('.close-about').focus(); }
    else { about.classList.remove('open'); if (lastFocus) lastFocus.focus(); }
    body.classList.toggle('about-open', next);
  }
  lab.querySelector('[data-about]').addEventListener('click', () => toggleAbout());

  window.LAB = {
    aboutOpen: () => !!about && about.classList.contains('open'),
    closeAbout: () => toggleAbout(false)
  };

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.key === 'Escape' && window.LAB.aboutOpen()) { e.preventDefault(); e.stopImmediatePropagation(); toggleAbout(false); return; }
    if (e.key === 'i' || e.key === 'I') { e.preventDefault(); toggleAbout(); return; }
    if (e.key === '\\') { body.classList.toggle('lab-hidden'); return; }
    if (e.key === '[' && idx > -1) location.href = STUDIES[(idx + STUDIES.length - 1) % STUDIES.length].href;
    if (e.key === ']' && idx > -1) location.href = STUDIES[(idx + 1) % STUDIES.length].href;
  }, true);
})();
