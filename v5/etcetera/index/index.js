"use strict";
/*
 * ETCETERA — the index, composed by hand on the site's grid. Not a layout algorithm: each of the
 * seven entries has its own place, scale and alignment, written out below for two compositions.
 *
 *   Landscape (desktop, laptop, tablet and phone held sideways): twelve columns.
 *     Beetlecat, the one colour photograph, stands at the full height of the frame in columns 5–9.
 *     "Built for generations." is set large in 10–12, on Beetlecat's top line; the film rests on
 *     its baseline below, small. Ruskin and the drawing are a small pair at top left, on the same top
 *     line; the residential perspective rests on the baseline beneath them, and the Optimist note
 *     takes its top line across the way, in the right column.
 *   Portrait (phones, tablet upright): six columns. The words first, large; Beetlecat with the
 *     two printed sheets beside it, top and bottom aligned to it; the quiet group at the foot.
 *
 * Pointing at an entry steps the rest back and shows its title beneath it (index.css). Words are
 * art-directed too: each text entry's line breaks are set here, not left to the browser.
 *
 *   FreemanEtcIndex.mount(vp, entries) → { paginate() → 1, render(), pageOf(slug) }
 *
 * A new entry needs a place in both compositions before it appears.
 */
(() => {
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const MONO = 0.602; // Monaco's advance, in ems
  const LEAD = 1.04, NOTE_LEAD = 1.32;
  const CAP = 30; // room beneath the baseline for the title that appears on hover
  const LINES = {
    "built-for-generations": ["Built for", "generations."],
    "optimist-note": ["On building a place", "people want", "to return to."],
  };
  const ratio = (e) => (e.image ? e.image.w / e.image.h : (e.video.w || 16) / (e.video.h || 9));
  // The largest size of a picture within a width and a height.
  const fit = (e, w, h) => (w / ratio(e) <= h ? { w, h: w / ratio(e) } : { w: h * ratio(e), h });
  const longest = (slug) => Math.max(...LINES[slug].map((l) => l.length));
  const words = (slug, size, lead) => ({ w: Math.ceil(longest(slug) * MONO * size) + 2, h: LINES[slug].length * size * lead, size, lead });

  function grid(W, cols, g) {
    const col = (W - g * (cols - 1)) / cols;
    return { X: (c) => (c - 1) * (col + g), S: (n) => n * col + (n - 1) * g };
  }

  function landscape(W, H) {
    const { X, S } = grid(W, 12, W >= 1100 ? 24 : 16);
    const U = H - CAP;
    const at = {};
    const put = (slug, x, y, b) => (at[slug] = { x, y, ...b });
    // The dominant: Beetlecat, full height.
    const bc = fit(entry("beetlecat"), S(5), U);
    put("beetlecat", X(5), U - bc.h, bc);
    // Top left, a quiet pair on Beetlecat's top line.
    put("ruskin", X(1), 0, fit(entry("ruskin"), S(2), U * 0.36));
    put("architectural-drawing", X(3), 0, fit(entry("architectural-drawing"), S(2), U * 0.36));
    // Bottom left, on the baseline.
    const rp = fit(entry("residential-perspective"), S(4), U * 0.4);
    put("residential-perspective", X(1), U - rp.h, rp);
    // Right: the words, large, on the top line.
    const bfg = words("built-for-generations", Math.min(64, U * 0.085, (S(3) - 4) / (longest("built-for-generations") * MONO)), LEAD);
    put("built-for-generations", X(10), 0, bfg);
    // The note takes the residential perspective's top line; the film rests on the baseline beneath.
    const note = words("optimist-note", Math.max(11, Math.min(16, U * 0.022)), NOTE_LEAD);
    const noteY = Math.max(at["residential-perspective"].y, bfg.h + 32);
    put("optimist-note", X(10), noteY, note);
    const fm = fit(entry("film-001"), S(2), Math.min(U * 0.3, U - noteY - note.h - 28));
    put("film-001", X(10), U - fm.h, fm);
    return at;
  }

  function portrait(W, H) {
    const g = W < 500 ? 12 : 20;
    const { X, S } = grid(W, 6, g);
    const U = H - CAP;
    const at = {};
    const put = (slug, x, y, b) => (at[slug] = { x, y, ...b });
    // Bands at full scale, then scaled together to fit the frame.
    const bfg = words("built-for-generations", Math.min(44, (S(5) - 4) / (longest("built-for-generations") * MONO)), LEAD);
    const bc = fit(entry("beetlecat"), S(4), Infinity);
    const ru = fit(entry("ruskin"), S(2), bc.h / 2 - g / 2);
    const dr = fit(entry("architectural-drawing"), S(2), bc.h / 2 - g / 2);
    const rp = fit(entry("residential-perspective"), S(3), Infinity);
    const note = words("optimist-note", W < 500 ? 11 : 14, NOTE_LEAD);
    const fm = fit(entry("film-001"), S(3), Math.max(24, rp.h - note.h - 14));
    const gap = 2 * g + 8, total = bfg.h + gap + bc.h + gap + rp.h;
    const s = Math.min(1, U / total);
    // Spare height opens the two gaps (up to twice their size); the rest centres the composition.
    const open = Math.min(gap, Math.max(0, (U - total * s) / 2));
    const x0 = (W - W * s) / 2, y0 = Math.max(0, (U - total * s - open * 2) / 2);
    const k = (b) => ({ ...b, w: b.w * s, h: b.h * s, size: b.size && b.size * s });
    const y1 = y0 + bfg.h * s + gap * s + open, y2 = y1 + bc.h * s + gap * s + open;
    put("built-for-generations", x0, y0, k(bfg));
    put("beetlecat", x0, y1, k(bc));
    put("ruskin", x0 + X(5) * s, y1, k(ru));
    put("architectural-drawing", x0 + X(5) * s, y1 + (bc.h - dr.h) * s, k(dr));
    put("residential-perspective", x0, y2, k(rp));
    put("optimist-note", x0 + X(4) * s, y2, k(note));
    put("film-001", x0 + X(4) * s, y2 + (rp.h - fm.h) * s, k(fm));
    return at;
  }

  let byslug = {};
  const entry = (slug) => byslug[slug];

  function item(e, b) {
    const style = `left:${b.x.toFixed(1)}px;top:${b.y.toFixed(1)}px;width:${b.w.toFixed(1)}px;height:${b.h.toFixed(1)}px`;
    let body;
    if (e.image) body = `<img src="${esc(e.image.src)}" alt="" draggable="false">`;
    else if (e.video) body = '<span class="ix-film"><span class="ix-play"></span></span>';
    else {
      const lines = LINES[e.slug].map(esc);
      // The words that lead the collection end in Freeman orange.
      if (e.slug === "built-for-generations") lines[lines.length - 1] = lines[lines.length - 1].replace(/[.]$/, '<span class="co4-accent">.</span>');
      body = `<span class="ix-words" style="font-size:${b.size.toFixed(2)}px;line-height:${b.lead}">${lines.join("<br>")}</span>`;
    }
    const cap = e.image || e.video ? `<span class="ix-cap" aria-hidden="true">${esc(e.title)}</span>` : "";
    return `<a class="ix-item ix-${e.image ? "image" : e.video ? "film" : "words"}" href="etcetera-${esc(e.slug)}.html" data-slug="${esc(e.slug)}" aria-label="${esc(e.title.replace(/[.]$/, ""))}" style="${style}">${body}${cap}</a>`;
  }

  function mount(vp, entries) {
    byslug = Object.fromEntries(entries.map((e) => [e.slug, e]));
    function render() {
      vp.innerHTML = '<div class="ix"></div>';
      const ix = vp.firstElementChild, W = ix.clientWidth, H = ix.clientHeight;
      const wide = W / H >= 1.1;
      const at = wide ? landscape(W, H) : portrait(W, H);
      ix.dataset.composition = wide ? "landscape" : "portrait";
      // Reading and tab order follow the collection, not the composition.
      ix.innerHTML = entries.filter((e) => at[e.slug]).map((e) => item(e, at[e.slug])).join("");
    }
    return { paginate: () => 1, render, pageOf: (slug) => (byslug[slug] ? 0 : -1) };
  }
  window.FreemanEtcIndex = { mount };
})();
