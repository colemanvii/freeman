"use strict";
/*
 * ETCETERA experience: film. One frame, centred in the viewport at the film's proportion, against
 * the paper. Select the frame to play or pause it (or Space); a small triangle shows while it is
 * paused. Nothing plays until asked. Without entry.video.src the frame stands empty: no Freeman film
 * is on file, and no stock footage stands in for one.
 */
(() => {
  function mount({ viewport: vp, entry, esc }) {
    const v = entry.video || {}, w = v.w || 16, h = v.h || 9;
    vp.innerHTML = `<div class="ex-film" style="--r:${(w / h).toFixed(5)}">${v.src
      ? `<video src="${esc(v.src)}"${v.poster ? ` poster="${esc(v.poster)}"` : ""} playsinline preload="metadata" aria-label="${esc(entry.title)}"></video><button type="button" class="ex-film-play" aria-label="Play"></button>`
      : `<span class="ex-film-empty" role="img" aria-label="No film has been supplied yet">FOOTAGE FORTHCOMING</span>`}</div>`;
    const video = vp.querySelector("video");
    if (!video) return {};
    const box = vp.querySelector(".ex-film"), play = box.querySelector(".ex-film-play");
    const sync = () => {
      box.classList.toggle("is-playing", !video.paused);
      play.setAttribute("aria-label", video.paused ? "Play" : "Pause");
    };
    const toggle = () => (video.paused ? video.play().catch(() => {}) : video.pause());
    box.addEventListener("click", toggle);
    ["play", "pause", "ended"].forEach((t) => video.addEventListener(t, sync));
    return {
      key(e) {
        if (e.key !== " " || (e.target.closest && e.target.closest("button"))) return false;
        e.preventDefault();
        toggle();
        return true;
      },
      destroy: () => video.pause(),
    };
  }
  (window.FreemanExperiences = window.FreemanExperiences || {}).film = { mount };
})();
