"use strict";
/*
 * ETCETERA — the contents. One list of titles, set as the site sets its headings (each ends in a
 * Freeman orange full stop, like "What we do." on the Company page), in columns 2–7 of the
 * twelve-column frame: the leading entries large, as chapters; after a pause, the rest smaller.
 * Beside it, columns 9–12, a quiet preview frame shows the material of the entry being pointed at
 * or focused, as the Projects index does, and nothing at all at rest. The selected title stays;
 * the others recede. On phones the titles stand alone; a tap opens.
 *
 *   FreemanEtcIndex.mount(vp, entries) → { paginate() → pages, render(i), pageOf(slug) }
 *
 * The list is one viewport. Should the collection outgrow it, it pages with production's sheet
 * controls rather than shrinking.
 */
(() => {
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const title = (t) => esc(t.replace(/[.]$/, "")) + '<span class="co4-accent">.</span>';

  function preview(e) {
    if (e.image) return `<img src="${esc(e.image.src)}" width="${e.image.w}" height="${e.image.h}" alt="" draggable="false">`;
    if (e.video) return '<span class="toc-play"></span>';
    return "";
  }

  function mount(vp, entries) {
    let pages = [];
    const shell = (list) => `<div class="toc"><ol class="toc-list">${list.map((e) =>
      `<li class="${e.lead ? "is-lead" : ""}"><a class="toc-entry" href="etcetera-${esc(e.slug)}.html" data-slug="${esc(e.slug)}" aria-label="${esc(e.title.replace(/[.]$/, ""))}">${title(e.title)}</a></li>`).join("")}</ol>
      <div class="toc-preview" aria-hidden="true">${list.map((e) => `<span class="toc-figure" data-for="${esc(e.slug)}">${preview(e)}</span>`).join("")}</div></div>`;
    function paginate() {
      vp.innerHTML = shell(entries);
      const list = vp.querySelector(".toc-list"), items = [...list.children];
      const room = list.parentElement.clientHeight;
      // As many whole entries as the frame holds, measured, never shrunk.
      pages = [];
      let page = [], top = null;
      items.forEach((li, i) => {
        const r = li.getBoundingClientRect();
        if (top === null) top = r.top;
        if (page.length && r.bottom - top > room) {
          // A sheet never ends on the first entry of a new group: it moves over to begin the next.
          const carry = page.length > 1 && !page[page.length - 1].lead && page[page.length - 2].lead ? [page.pop()] : [];
          pages.push(page);
          page = carry;
          top = carry.length ? items[i - 1].getBoundingClientRect().top : r.top;
        }
        page.push(entries[i]);
      });
      if (page.length) pages.push(page);
      return pages.length;
    }
    function render(i) {
      const list = pages[i] || entries;
      vp.innerHTML = shell(list);
      const toc = vp.querySelector(".toc");
      const show = (slug) => toc.querySelectorAll(".toc-figure").forEach((f) => f.classList.toggle("is-shown", f.dataset.for === slug));
      const from = (e) => { const a = e.target.closest && e.target.closest("[data-slug]"); return a ? a.dataset.slug : null; };
      toc.addEventListener("mouseover", (e) => { const s = from(e); if (s) show(s); });
      toc.addEventListener("mouseleave", () => show(toc.contains(document.activeElement) ? document.activeElement.dataset.slug : null));
      toc.addEventListener("focusin", (e) => show(from(e)));
      toc.addEventListener("focusout", () => show(null));
    }
    const pageOf = (slug) => pages.findIndex((p) => p.some((e) => e.slug === slug));
    return { paginate, render, pageOf };
  }
  window.FreemanEtcIndex = { mount };
})();
