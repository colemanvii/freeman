"use strict";
/*
 * ETCETERA — the index. Every entry is laid on one horizon, in the middle of the page, the way the
 * entrance lays out its four words: photographs and drawings at one height, words set as type, a
 * film as its own frame, all resting on a single baseline. Nothing else is shown. The title of an
 * entry appears beneath it only while it is pointed at; the rest of the line steps back.
 *
 *   FreemanEtcIndex.mount(vp, entries) → { paginate() → pages, render(i), pageOf(slug) }
 *
 * One line whenever its material can stand at a comfortable height (--ix-line); otherwise the line
 * breaks onto as few lines as keep it there; it pages only when even the smallest line would not fit.
 */
(() => {
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const MONO = 0.602; // Monaco's advance, in ems
  const FILM = 0.62; // a film frame stands lower than a photograph
  // Words are set at a size tied to the line's height, and wrapped to a measure fixed per entry.
  const typeSize = (H) => Math.round(Math.max(13, Math.min(28, H * 0.088)));
  const measure = (e) => (e.title.length > 24 ? 15 : 12);
  // Words are as wide as their longest line once wrapped, so every gap on the line is equal.
  function longest(e) {
    let line = 0, most = 0;
    e.title.split(" ").forEach((w) => {
      line = line && line + 1 + w.length <= measure(e) ? line + 1 + w.length : w.length;
      most = Math.max(most, line);
    });
    return most;
  }
  const width = (e, H) =>
    e.image ? (H * e.image.w) / e.image.h
    : e.video ? ((H * FILM) * (e.video.w || 16)) / (e.video.h || 9)
    : Math.ceil(longest(e) * MONO * typeSize(H)) + 1;

  function wrap(list, H, W, gap) {
    const rows = [];
    let row = [], x = 0;
    list.forEach((e) => {
      const w = width(e, H);
      if (row.length && x + gap + w > W) { rows.push(row); row = []; x = 0; }
      x += (row.length ? gap : 0) + w;
      row.push(e);
    });
    if (row.length) rows.push(row);
    return rows;
  }

  function item(e, H) {
    const w = Math.floor(width(e, H));
    let body;
    if (e.image) body = `<img src="${esc(e.image.src)}" width="${w}" height="${H}" alt="" draggable="false">`;
    else if (e.video) body = `<span class="ix-film" style="height:${Math.round(H * FILM)}px"><span class="ix-play"></span></span>`;
    else body = `<span class="ix-words" style="font-size:${typeSize(H)}px;width:${w}px">${esc(e.title).replace(/[.]$/, "")}<span class="co4-accent">.</span></span>`;
    const cap = e.image || e.video ? `<span class="ix-cap" aria-hidden="true">${esc(e.title)}</span>` : "";
    return `<a class="ix-item" href="etcetera-${esc(e.slug)}.html" data-slug="${esc(e.slug)}" aria-label="${esc(e.title)}" style="width:${w}px">${body}${cap}</a>`;
  }

  function mount(vp, entries) {
    let pages = [];
    const frame = () => {
      vp.innerHTML = '<div class="ix"><div class="ix-lines"></div></div>';
      const box = vp.querySelector(".ix-lines"), cs = getComputedStyle(box);
      return {
        W: box.clientWidth * (parseFloat(cs.getPropertyValue("--ix-measure")) || 1), Hmax: box.clientHeight - (parseFloat(cs.paddingBottom) || 0),
        gap: parseFloat(cs.columnGap) || 40, rowGap: parseFloat(cs.rowGap) || 56,
        cap: parseFloat(cs.getPropertyValue("--ix-cap")) || 420, min: parseFloat(cs.getPropertyValue("--ix-min")) || 80,
        line: parseFloat(cs.getPropertyValue("--ix-line")) || 150,
      };
    };
    function paginate() {
      const f = frame();
      // For one to four lines: the tallest height at which everything fits.
      const fit = [];
      for (let k = 1; k <= 4; k++) {
        let lo = f.min, hi = Math.min(f.cap, (f.Hmax - (k - 1) * f.rowGap) / k), best = 0;
        for (let n = 0; n < 22 && hi > lo; n++) {
          const H = (lo + hi) / 2;
          if (wrap(entries, H, f.W, f.gap).length <= k) { best = H; lo = H; } else hi = H;
        }
        if (best) fit.push({ k, H: Math.floor(best) });
      }
      if (fit.length) {
        // Fewer lines are calmer: the first that reaches a comfortable height, else the largest.
        const top = Math.max(...fit.map((x) => x.H));
        const pick = fit.find((x) => x.H >= Math.min(f.line, top));
        pages = [{ H: pick.H, rows: wrap(entries, pick.H, f.W, f.gap) }];
      } else {
        const per = Math.max(1, Math.floor((f.Hmax + f.rowGap) / (f.min + f.rowGap)));
        const rows = wrap(entries, f.min, f.W, f.gap);
        pages = [];
        for (let i = 0; i < rows.length; i += per) pages.push({ H: f.min, rows: rows.slice(i, i + per) });
      }
      pages.forEach((p) => (p.items = p.rows.flat()));
      return pages.length;
    }
    function render(i) {
      const p = pages[i];
      if (!p) return;
      vp.innerHTML = `<div class="ix"><div class="ix-lines">${p.rows.map((r) => `<div class="ix-line">${r.map((e) => item(e, p.H)).join("")}</div>`).join("")}</div></div>`;
    }
    const pageOf = (slug) => pages.findIndex((p) => p.items.some((e) => e.slug === slug));
    return { paginate, render, pageOf };
  }
  window.FreemanEtcIndex = { mount };
})();
