/* Photographs 002 — shared data and behaviour.
 *
 * PHOTOS: the eighteen photographs of 6 November committed with the first gallery
 * (060fc61), at their true aspect ratios. In production these are Drive IDs; here they
 * are the file numbers. Neither study crops anything: every frame keeps its own ratio.
 *
 * ORDER: the closest reading of the production curated sequence (EDITORIAL_ROWS in
 * lib/photographs-drive.js) available from its row comments. Four Drive-only photographs
 * — including the cover, two builders at the site — are not in the repository.
 */
window.PHOTOS = {
  "01": 0.8, "02": 1.25, "03": 1.25, "04": 1.25, "05": 1.25, "06": 0.8,
  "07": 1.25, "08": 1.25, "09": 0.8, "10": 0.8, "11": 1.25, "12": 1.25,
  "13": 1.7778, "14": 1.25, "15": 1.25, "16": 1.25, "17": 1.25, "18": 1.25
};
window.ORDER = ["02","15","18","03","07","08","01","16","14","06","05","04","17","09","13","11","10","12"];

/* One photograph as a link to its large file. `sizes` is passed by each layout so the
   browser fetches the right file for the width the photograph is actually shown at. */
window.tile = function (id, sizes, eager) {
  const a = document.createElement("a");
  a.className = "tile";
  a.href = "photos/" + id + "-2400.jpg";
  a.dataset.photo = id;
  a.style.setProperty("--r", PHOTOS[id]);
  const img = new Image();
  img.alt = "";
  img.decoding = "async";
  img.loading = eager ? "eager" : "lazy";
  img.sizes = sizes;
  img.srcset = `photos/${id}-640.jpg 640w, photos/${id}-1280.jpg 1280w, photos/${id}-2400.jpg 2400w`;
  img.src = `photos/${id}-1280.jpg`;
  const show = () => img.classList.add("in");
  if (img.complete) show(); else img.addEventListener("load", show, { once: true });
  a.appendChild(img);
  return a;
};

/* Viewer: production behaviour, plus a short crossfade between photographs. */
window.initViewer = function () {
  const d = document.querySelector("dialog"), img = d.querySelector(".stage img");
  let tiles = [], i = 0, x0 = null, swiped = false;
  const refresh = () => { tiles = [...document.querySelectorAll(".tile")]; };
  const show = (n, fade) => {
    i = (n + tiles.length) % tiles.length;
    const next = tiles[i].href;
    const set = () => { img.src = next; img.classList.remove("swap"); };
    if (fade && img.getAttribute("src")) { img.classList.add("swap"); setTimeout(set, 180); } else set();
    [i + 1, i - 1].forEach(k => { new Image().src = tiles[(k + tiles.length) % tiles.length].href; });
  };
  document.addEventListener("click", e => {
    const t = e.target.closest(".tile");
    if (!t || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); refresh(); show(tiles.indexOf(t), false); d.showModal();
  });
  d.querySelector(".prev").onclick = () => { if (!swiped) show(i - 1, true); };
  d.querySelector(".next").onclick = () => { if (!swiped) show(i + 1, true); };
  d.querySelector("[data-close]").onclick = () => d.close();
  img.onclick = () => { if (swiped) { swiped = false; return; } d.close(); };
  d.addEventListener("close", () => { img.removeAttribute("src"); tiles[i] && tiles[i].focus({ preventScroll: true }); });
  document.addEventListener("keydown", e => {
    if (!d.open) return;
    if (e.key === "ArrowRight") show(i + 1, true); else if (e.key === "ArrowLeft") show(i - 1, true);
  });
  d.addEventListener("pointerdown", e => { x0 = e.clientX; });
  d.addEventListener("pointerup", e => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50 && e.pointerType !== "mouse") {
      swiped = true; setTimeout(() => swiped = false, 400); show(dx < 0 ? i + 1 : i - 1, true);
    }
  });
};

/* Render for the current breakpoint and re-render when it changes. Each direction
   supplies desktop and phone compositions; both read from the same ORDER. */
window.composeFor = function (render) {
  const bp = matchMedia("(max-width:700px)");
  const run = () => render(bp.matches);
  bp.addEventListener("change", run);
  run();
};
