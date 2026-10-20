"use strict";
/* ETCETERA experience: plate. One image, centred, at the largest size that fits and never larger
   than its source. Nothing else. */
(() => {
  function mount({ viewport: vp, entry, esc }) {
    const im = entry.image;
    vp.innerHTML = `<img class="ex-plate" src="${esc(im.src)}" width="${im.w}" height="${im.h}" alt="${esc(im.alt)}" draggable="false">`;
    return {};
  }
  (window.FreemanExperiences = window.FreemanExperiences || {}).plate = { mount };
})();
