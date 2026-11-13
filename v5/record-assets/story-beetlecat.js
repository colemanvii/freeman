/* The Record / Beetlecat 002 — one project, told with precision.
   Draws only from published Freeman records; missing evidence is identified, never invented. */
window.BEETLECAT_STORY = (() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  const two = n => String(n).padStart(2, '0');
  const label = (key, val) => '<div class="bc-fact"><dt>' + esc(key) + '</dt><dd>' + esc(val) + '</dd></div>';
  function render(it) {
    if (it.slug !== 'beetlecat' || !it.photos.length) return null;
    const client = it.client || 'Not on file';
    const photoCredit = (it.credits || []).find(c => c[0] === 'Photography')?.[1] || '';
    const current = it.photos[0];
    const count = it.photos.length;
    const where = it.site.precision === 'venue'
      ? [it.site.address, it.site.area].filter(Boolean).join(' / ')
      : it.site.area || it.location;
    const thumbs = it.photos.map((p, n) => '<button type="button" class="bc-thumb" data-frame="' + n + '" aria-pressed="' + (n === 0) + '" aria-label="View photograph ' + (n + 1) + ' of ' + count + '"><img src="' + esc(p.src) + '" loading="lazy" alt=""><span>' + two(n + 1) + '</span></button>').join('');
    return '<header class="r-head bc-head"><div class="bc-heading"><p class="r-k"><b>No. ' + esc(it.id) + '</b> / THE RECORD / HOSPITALITY</p>' +
      '<h2 class="r-name" id="rec-name">' + esc(it.name) + '</h2><p class="r-where">' + esc(where) + '</p></div>' +
      '<button type="button" class="r-back" id="r-back" aria-label="Return to project map">← THE MAP</button></header>' +
      '<div class="r-body bc-body">' +
        '<figure class="bc-stage" aria-label="Beetlecat project photography">' +
          '<div class="bc-media">' +
            '<button type="button" class="bc-enlarge" id="bc-enlarge" aria-label="Enlarge photograph 1 of ' + count + '">' +
              '<img id="r-img" src="' + esc(current.src) + '" alt="' + esc(it.name) + ', photograph 1" decoding="async">' +
              '<span class="bc-enlarge-label" aria-hidden="true">VIEW FRAME <span>↗</span></span></button>' +
            '<div class="bc-media-controls"><span class="bc-framecount" id="bc-framecount">FRAME 01 / ' + two(count) + '</span>' +
              '<div class="bc-arrows"><button type="button" id="bc-prev" aria-label="Previous photograph">←</button>' +
              '<button type="button" id="bc-next" aria-label="Next photograph">→</button></div></div>' +
          '</div>' +
          '<div class="bc-strip" role="group" aria-label="Select a photograph">' + thumbs + '</div>' +
          '<figcaption class="bc-caption"><span>FIG. 01—' + two(count) + ' / FINISHED WORK</span><span>' + (photoCredit ? 'PHOTOGRAPHY / ' + esc(photoCredit) : 'PHOTOGRAPHY ON FILE') + '</span></figcaption>' +
        '</figure>' +
        '<article class="bc-editorial" aria-labelledby="bc-story-label">' +
          '<div class="bc-index"><span>PROJECT RECORD / 01</span><span>ATLANTA, GEORGIA</span></div>' +
          '<p class="bc-heading-small" id="bc-story-label">01 / THE PLACE</p>' +
          '<p class="bc-headline">A place shaped by <em>precision</em> and personality.</p>' +
          '<p class="bc-copy">' + esc(it.summary || 'Published project account not on file.') + '</p>' +
          '<p class="bc-source">SOURCE / FREEMAN PUBLISHED PROJECT ACCOUNT</p>' +
          '<section class="bc-ledger" aria-label="Project details"><h3>02 / THE PEOPLE & PLACE</h3>' +
            '<dl>' + label('CLIENT', client) + label('BUILDER', 'Freeman General Contracting') + label('PLACE', it.site.area || it.location) +
              label('YEAR COMPLETED', it.year === null ? 'Not yet verified' : String(it.year)) + (photoCredit ? label('PHOTOGRAPHY', photoCredit) : '') + '</dl>' +
          '</section>' +
          '<section class="bc-evidence" aria-labelledby="bc-evidence-title"><h3 id="bc-evidence-title">03 / THE EVIDENCE</h3>' +
            '<p>What this record can show today—and what we still need to learn.</p>' +
            '<div class="bc-evidence-row"><span class="bc-indicator is-filed"></span><span>Finished photography</span><strong>' + count + ' FRAMES</strong></div>' +
            '<div class="bc-evidence-row"><span class="bc-indicator is-filed"></span><span>Published project account</span><strong>ON FILE</strong></div>' +
            '<div class="bc-evidence-row"><span class="bc-indicator"></span><span>Construction drawings & field evidence</span><strong>NOT YET ON FILE</strong></div>' +
            '<div class="bc-evidence-row"><span class="bc-indicator"></span><span>Decision history & verified completion year</span><strong>NOT YET ON FILE</strong></div>' +
          '</section>' +
          '<div class="bc-next"><span>THE NEXT CHAPTER</span><p>How did the idea become this place?</p><small>Drawings, field notes, and first-hand accounts can complete the story. This study does not invent what is missing.</small></div>' +
          '<a class="r-out" href="/project-' + esc(it.slug) + '"><span>VIEW THE PUBLISHED PROJECT</span><span aria-hidden="true">↗</span></a>' +
        '</article>' +
      '</div>' +
      '<dialog class="bc-lightbox" id="bc-lightbox" aria-label="Beetlecat photography viewer">' +
        '<div class="bc-lightbox-head"><span>FREEMAN / BEETLECAT / <span id="bc-fullcount">01—' + two(count) + '</span></span>' +
          '<button type="button" id="bc-lightbox-close" aria-label="Close photography viewer">× CLOSE</button></div>' +
        '<div class="bc-fullimage"><img id="bc-fullimg" src="' + esc(current.src) + '" alt="Beetlecat, photograph 1"></div>' +
        '<div class="bc-lightbox-foot"><button type="button" id="bc-fullprev" aria-label="Previous photograph">← PREVIOUS</button>' +
          '<span>' + (photoCredit ? 'PHOTOGRAPHY / ' + esc(photoCredit) : 'FINISHED WORK') + '</span>' +
          '<button type="button" id="bc-fullnext" aria-label="Next photograph">NEXT →</button></div>' +
      '</dialog>';
  }
  function wire(rec, it) {
    if (it.slug !== 'beetlecat') return false;
    const $ = id => rec.querySelector('#' + id);
    const photos = it.photos;
    const dialog = $('bc-lightbox');
    let active = 0, start = null, suppress = false;
    const main = $('r-img'), full = $('bc-fullimg');
    const total = photos.length;
    function preload(k) {
      const i = new Image(); i.decoding = 'async'; i.src = photos[(k + total) % total].src;
    }
    function show(k) {
      active = (k + total) % total;
      const photo = photos[active];
      main.src = photo.src;
      main.alt = it.name + ', photograph ' + (active + 1);
      $('bc-enlarge').setAttribute('aria-label', 'Enlarge photograph ' + (active + 1) + ' of ' + total);
      $('bc-framecount').textContent = 'FRAME ' + two(active + 1) + ' / ' + two(total);
      rec.querySelectorAll('.bc-thumb').forEach((b, i) => b.setAttribute('aria-pressed', String(i === active)));
      if (dialog.open) {
        full.src = photo.src; full.alt = it.name + ', photograph ' + (active + 1);
        $('bc-fullcount').textContent = two(active + 1) + '—' + two(total);
      }
      preload(active + 1);
    }
    rec.querySelectorAll('.bc-thumb').forEach(btn => btn.addEventListener('click', () => show(Number(btn.dataset.frame))));
    $('bc-prev').addEventListener('click', () => show(active - 1));
    $('bc-next').addEventListener('click', () => show(active + 1));
    $('bc-fullprev').addEventListener('click', () => show(active - 1));
    $('bc-fullnext').addEventListener('click', () => show(active + 1));
    $('bc-enlarge').addEventListener('click', () => {
      if (suppress) { suppress = false; return; }
      dialog.showModal(); show(active); $('bc-lightbox-close').focus({preventScroll:true});
    });
    $('bc-lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => $('bc-enlarge').focus({preventScroll:true}));
    // Keep the original map's Escape shortcut from closing the record when the photo viewer is active.
    // Listener is bound to this record and removed automatically when it is replaced.
    dialog.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); dialog.close(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); show(active - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); show(active + 1); }
    });
    const media = $('bc-enlarge');
    media.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') start = {x:e.clientX,y:e.clientY}; });
    media.addEventListener('pointerup', e => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y; start = null;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        suppress = true; show(active + (dx < 0 ? 1 : -1));
        setTimeout(() => { suppress = false; }, 100);
      }
    });
    media.addEventListener('pointercancel', () => { start = null; });
    preload(1);
    return true;
  }
  return {render,wire};
})();