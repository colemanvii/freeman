/* Photographs 002 — shared behaviour for both directions.
 * Data lives in data.js (ID, SEQUENCE, RATIO). Each direction supplies its compositions;
 * this file builds photographs, guards the sequence, and runs the viewer. */

/* One photograph: a link to its large file, never cropped (aspect-ratio = its own ratio). */
window.tile = function (key, sizes, eager) {
  const id = ID[key], a = document.createElement("a");
  a.className = "tile";
  a.href = `photos/${id}-2400.jpg`;
  a.dataset.photo = key;
  a.style.setProperty("--r", RATIO[key]);
  a.setAttribute("aria-label", "Open photograph");
  const img = new Image();
  img.alt = "";
  img.decoding = "async";
  img.loading = eager ? "eager" : "lazy";
  img.sizes = sizes;
  img.srcset = `photos/${id}-1280.jpg 1280w, photos/${id}-2400.jpg 2400w`;
  img.src = `photos/${id}-1280.jpg`;
  img.draggable = false;
  const show = () => img.classList.add("in");
  if (img.complete) show(); else img.addEventListener("load", show, { once: true });
  a.appendChild(img);
  return a;
};

/* Every composition must show each photograph in SEQUENCE exactly once, in order.
   Anything a composition misses is appended (as production does with new uploads),
   so a new Drive photograph can never silently disappear. */
window.guard = function (name, keys) {
  const flat = keys.flat(Infinity), seen = new Set(), problems = [];
  flat.forEach(k => { if (!ID[k]) problems.push("unknown " + k); if (seen.has(k)) problems.push("twice " + k); seen.add(k); });
  const missing = SEQUENCE.filter(k => !seen.has(k));
  const order = flat.filter(k => SEQUENCE.includes(k));
  if (order.join() !== SEQUENCE.filter(k => seen.has(k)).join()) problems.push("order differs from SEQUENCE");
  if (problems.length || missing.length) console.warn(name, problems, "missing:", missing);
  return missing;
};

window.composeFor = function (render) {
  const bp = matchMedia("(max-width:700px)");
  const run = () => render(bp.matches);
  bp.addEventListener("change", run);
  run();
};

/* Viewer. Tap a photograph to open it whole on paper. Tap the left or right third, swipe
   sideways, or use the arrow keys to move; tap the photograph, swipe down, press Escape or
   Close to return to the same place on the page. */
window.initViewer = function () {
  const d = document.querySelector("dialog"), img = d.querySelector(".stage img"), stage = d.querySelector(".stage");
  let tiles = [], i = 0, start = null, gesture = false, scrollY = 0;

  const show = (n, fade) => {
    i = (n + tiles.length) % tiles.length;
    const next = tiles[i].href;
    const set = () => { img.src = next; img.classList.remove("swap"); };
    if (fade && img.getAttribute("src")) { img.classList.add("swap"); setTimeout(set, 160); } else set();
    [i + 1, i - 1].forEach(k => { new Image().src = tiles[(k + tiles.length) % tiles.length].href; });
  };
  const open = t => {
    tiles = [...document.querySelectorAll(".tile")];
    scrollY = window.scrollY;
    document.documentElement.classList.add("viewing");
    show(tiles.indexOf(t), false);
    d.showModal();
  };
  const close = () => { if (d.open) d.close(); };

  document.addEventListener("click", e => {
    const t = e.target.closest(".tile");
    if (!t || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); open(t);
  });
  d.querySelector(".prev").addEventListener("click", () => { if (!gesture) show(i - 1, true); });
  d.querySelector(".next").addEventListener("click", () => { if (!gesture) show(i + 1, true); });
  d.querySelector("[data-close]").addEventListener("click", close);
  img.addEventListener("click", () => { if (!gesture) close(); });
  d.addEventListener("close", () => {
    img.removeAttribute("src");
    document.documentElement.classList.remove("viewing");
    window.scrollTo(0, scrollY);
    tiles[i] && tiles[i].focus({ preventScroll: true });
  });
  document.addEventListener("keydown", e => {
    if (!d.open) return;
    if (e.key === "ArrowRight") show(i + 1, true); else if (e.key === "ArrowLeft") show(i - 1, true);
  });

  /* Touch: the stage owns its gestures (touch-action:none in CSS), so a swipe is never
     mistaken for a page scroll and the page behind never moves. */
  stage.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") start = { x: e.clientX, y: e.clientY }; });
  stage.addEventListener("pointercancel", () => { start = null; });
  stage.addEventListener("pointerup", e => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y; start = null;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < 40 && ay < 40) return;               // a tap: let the click through
    gesture = true; setTimeout(() => gesture = false, 350);
    if (ax > ay) show(dx < 0 ? i + 1 : i - 1, true);
    else if (dy > 70) close();                      // swipe down to return to the page
  });
};
