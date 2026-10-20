"use strict";
/*
 * ETCETERA — the index, composed by hand on the site's grid. Not a layout algorithm: each of the
 * seven entries has its own place, scale and alignment, written out below for two compositions.
 *
 *   Landscape (desktop, laptop, tablet and phone held sideways): twelve columns, one top line,
 *   one baseline.
 *     "Built for generations." is the large graphic element, top left (columns 1–5). Ruskin's
 *     printed passage, on building for those who come after, answers it at the far right of the
 *     same top line, small. The two drawings stand together on the baseline at left, the
 *     perspective wide, the elevation narrow and lower. Beetlecat, at a medium scale, rests on the
 *     baseline at right with open paper between it and the drawings; the Optimist note, the other
 *     piece about a restaurant, starts on Beetlecat's top line beside it. The film, with no
 *     footage yet, is only its play mark, closing the baseline like a full stop.
 *   Portrait (phones, tablet upright): six columns, composed separately and scaled as a whole.
 *     The words first; Beetlecat with Ruskin and the note beside it; the drawings together at the
 *     foot, the play mark on the perspective's top line.
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
    const base = (slug, x, b) => put(slug, x, U - b.h, b);
    // Top line: the words, large, at left; Ruskin, small, at the far right.
    const bfg = words("built-for-generations", Math.min(96, U * 0.13, (S(5) - 4) / (longest("built-for-generations") * MONO)), LEAD);
    put("built-for-generations", X(1), 0, bfg);
    const ru = fit(entry("ruskin"), S(2), U * 0.27);
    put("ruskin", W - ru.w, 0, ru);
    // Baseline, left: the drawings together, the elevation lower than the perspective.
    const rp = fit(entry("residential-perspective"), S(4), Math.min(U * 0.47, U - bfg.h - 64));
    base("residential-perspective", X(1), rp);
    base("architectural-drawing", X(5), fit(entry("architectural-drawing"), S(2), rp.h * 0.78));
    // Baseline, right: Beetlecat at a medium scale; the note on its top line, the play mark at the end.
    const bc = fit(entry("beetlecat"), S(3), Math.min(U * 0.64, U - ru.h - 40));
    base("beetlecat", X(8), bc);
    const note = words("optimist-note", Math.max(9, Math.min(17, U * 0.025, (S(2) - 4) / (longest("optimist-note") * MONO))), NOTE_LEAD);
    // On the smallest sideways phones the note keeps its right margin and steps left into the gutter.
    put("optimist-note", Math.min(X(11), W - note.w), U - bc.h, note);
    const mark = Math.round(Math.max(14, Math.min(22, U * 0.03)));
    base("film-001", X(11), { w: mark, h: mark });
    return at;
  }

  function portrait(W, H) {
    const g = W < 500 ? 12 : 20;
    const { X, S } = grid(W, 6, g);
    const U = H - CAP;
    const at = {};
    const put = (slug, x, y, b) => (at[slug] = { x, y, ...b });
    // Bands at full scale, then scaled together to fit the frame.
    const bfg = words("built-for-generations", Math.min(52, (S(5) - 4) / (longest("built-for-generations") * MONO)), LEAD);
    const bc = fit(entry("beetlecat"), S(3), Infinity);
    const ru = fit(entry("ruskin"), S(2), bc.h * 0.5);
    const note = words("optimist-note", Math.min(14, (S(3) - 4) / (longest("optimist-note") * MONO)), NOTE_LEAD);
    const rp = fit(entry("residential-perspective"), S(4), Infinity);
    const dr = fit(entry("architectural-drawing"), S(2), rp.h * 0.7);
    const mark = 16;
    const gap = 3 * g + 4, total = bfg.h + gap + bc.h + gap + rp.h;
    const s = Math.min(1, U / total);
    // Spare height opens the two gaps (up to twice their size); the rest centres the composition.
    const open = Math.min(gap, Math.max(0, (U - total * s) / 2));
    const x0 = (W - W * s) / 2, y0 = Math.max(0, (U - total * s - open * 2) / 2);
    const k = (b) => ({ ...b, w: b.w * s, h: b.h * s, size: b.size && b.size * s });
    const y1 = y0 + bfg.h * s + gap * s + open, y2 = y1 + bc.h * s + gap * s + open;
    put("built-for-generations", x0, y0, k(bfg));
    put("beetlecat", x0, y1, k(bc));
    put("ruskin", x0 + X(5) * s, y1, k(ru));
    put("optimist-note", x0 + X(4) * s, y1 + (bc.h - note.h) * s, k(note));
    put("residential-perspective", x0 + X(3) * s, y2, k(rp));
    put("architectural-drawing", x0, y2 + (rp.h - dr.h) * s, k(dr));
    put("film-001", x0, y2, k({ w: mark, h: mark }));
    return at;
  }

  let byslug = {};
  const entry = (slug) => byslug[slug];

  function item(e, b) {
    const style = `left:${b.x.toFixed(1)}px;top:${b.y.toFixed(1)}px;width:${b.w.toFixed(1)}px;height:${b.h.toFixed(1)}px`;
    let body;
    if (e.image) body = `<img src="${esc(e.image.src)}" alt="" draggable="false">`;
    // A film without footage is only its play mark.
    else if (e.video) body = '<span class="ix-play"></span>';
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
