"use strict";
/*
 * ETCETERA experience: film. The simplest presentation in the collection: one frame, centred in the
 * viewport at the film's own proportion, against the paper. One line beneath it carries the only
 * controls (play / pause, time, full screen). Nothing plays until the visitor asks.
 *
 * Without entry.video.src the frame is an honest placeholder at the same proportion: no Freeman
 * film is on file, and no stock footage stands in for one.
 */
(() => {
  const time = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };
  function mount({ viewport: vp, entry, esc }) {
    const v = entry.video || {}, w = v.w || 16, h = v.h || 9;
    const has = !!v.src;
    vp.innerHTML = `<div class="ex-film" style="--ratio:${w} / ${h};--r:${(w / h).toFixed(5)}">
      <div class="ex-film-frame">${has
        ? `<video src="${esc(v.src)}"${v.poster ? ` poster="${esc(v.poster)}"` : ""} playsinline preload="metadata" aria-label="${esc(entry.title)}"></video>`
        : `<div class="ex-film-empty" role="img" aria-label="Placeholder: no film has been supplied for this entry"><span>FILM / FOOTAGE NOT YET SUPPLIED</span><span>${w} × ${h}</span></div>`}</div>
      <div class="ex-film-line">${has
        ? `<button type="button" class="phrase" data-film-play>PLAY</button><span class="ex-film-time" aria-live="off">00:00 / --:--</span><button type="button" class="phrase" data-film-full>FULL SCREEN</button>`
        : `<span>PLACEHOLDER / NO VIDEO ON FILE</span>`}</div>
    </div>`;
    if (!has) return {};
    const video = vp.querySelector("video"), play = vp.querySelector("[data-film-play]"), clock = vp.querySelector(".ex-film-time");
    const sync = () => {
      play.textContent = video.paused ? (video.ended ? "PLAY AGAIN" : "PLAY") : "PAUSE";
      clock.textContent = `${time(video.currentTime)} / ${isFinite(video.duration) ? time(video.duration) : "--:--"}`;
    };
    const toggle = () => (video.paused ? video.play().catch(() => {}) : video.pause());
    play.addEventListener("click", toggle);
    video.addEventListener("click", toggle);
    ["play", "pause", "ended", "timeupdate", "loadedmetadata"].forEach((t) => video.addEventListener(t, sync));
    vp.querySelector("[data-film-full]").addEventListener("click", () => {
      const f = video.requestFullscreen || video.webkitEnterFullscreen || video.webkitRequestFullscreen;
      if (f) f.call(video);
    });
    return {
      // Space and K play or pause, as in most players; the shell keeps Escape.
      key(e) {
        if (e.key !== " " && e.key !== "k") return false;
        if (e.target.closest && e.target.closest("button")) return false;
        e.preventDefault();
        toggle();
        return true;
      },
      destroy: () => video.pause(),
    };
  }
  (window.FreemanExperiences = window.FreemanExperiences || {}).film = { mount };
})();
