"use strict";
/*
 * ETCETERA experience: plate. One image, centred in the frame at the largest size that fits and
 * never larger than its source, with its number, title and type beneath. Nothing else.
 * Used by found objects and drawings (entry.image).
 */
(() => {
  function mount({ viewport: vp, entry, esc }) {
    const im = entry.image;
    vp.innerHTML = `<figure class="ex-plate"><img src="${esc(im.src)}" width="${im.w}" height="${im.h}" alt="${esc(im.alt)}" draggable="false"><figcaption><span>${esc(entry.no)}</span><span>${esc(entry.title)}</span><span>${esc(entry.type)}</span></figcaption></figure>`;
    const fig = vp.querySelector(".ex-plate"), img = fig.querySelector("img"), cap = fig.querySelector("figcaption");
    // Size the image exactly, so the caption can share its left edge and width.
    function fit() {
      const room = vp.clientHeight - cap.offsetHeight - 14;
      const scale = Math.min(1, vp.clientWidth / im.w, Math.max(80, room) / im.h);
      img.style.width = Math.floor(im.w * scale) + "px";
      img.style.height = Math.floor(im.h * scale) + "px";
      fig.style.width = img.style.width;
    }
    fit();
    addEventListener("resize", fit);
    return { destroy: () => removeEventListener("resize", fit) };
  }
  (window.FreemanExperiences = window.FreemanExperiences || {}).plate = { mount };
})();
