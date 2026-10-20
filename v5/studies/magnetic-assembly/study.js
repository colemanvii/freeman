/* Magnetic Assembly — comparison instrument. Three views of the same engine:
   ENTRANCE (the selected motion in the live entrance composition), COMPARE (all four, replayed
   together) and LIGHT / DARK (the selected motion in both colorways at once).
   Keys: 1–4 variation, R or Space replay, S slow, V view. State is kept in the URL (?v=&view=). */
(() => {
  "use strict";
  const MM = window.FreemanMagneticMark;
  const ORDER = ["settle", "lodestone", "field", "original"];
  const NUM = { settle: "01", lodestone: "02", field: "03", original: "—" };
  const NOTES = {
    settle: "Slight dispersion: every pixel on its own, about ±2 px out (0.14× the original offsets). It hangs as a fine grain, then lands in the original's own hash order across 220 ms on a soft in-out curve. The closest relative of the production motion.",
    lodestone: "Moderate dispersion: the script breaks into irregular shards of ~5 px, about ±3.5 px out (0.28×). They hover and drift in, then each accelerates toward home on its own clock so every shard arrives on the same frame and stops dead.",
    field: "Wider dispersion: larger shards (~7 px), about ±6 px out (0.45×), and a longer hover. The same single-frame arrival, with a trace of overtravel at the stop.",
    original: "Production baseline, unchanged: ±13 × ±9 px offsets, staggered fade-in, cubic ease-out over 1,850 ms, drawn on whole bitmap cells.",
  };
  const VIEWS = [["entrance", "Entrance"], ["compare", "Compare"], ["split", "Light / Dark"]];
  const PHONE = "(max-width:760px)";

  const home = document.getElementById("home");
  const q = new URLSearchParams(location.search);
  let variant = ORDER.includes(q.get("v")) ? q.get("v") : "lodestone";
  let view = VIEWS.some(([v]) => v === q.get("view")) ? q.get("view") : "entrance";
  let slow = false, marks = [];
  const clock = document.getElementById("clock"), phaseEl = document.getElementById("phase");

  function setPalette(p) {
    document.documentElement.dataset.palette = p;
    document.querySelector('meta[name="theme-color"]').content = { chalk: "#fff9f1", umber: "#332e20", sand: "#ddcfb3" }[p];
    document.querySelectorAll("[data-way]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.way === p)));
    try { sessionStorage.setItem("freeman-palette", p); } catch (_) {}
    marks.forEach((m) => m.paint());
  }

  // Production entrance fit(), unchanged: one bitmap pixel = a whole number of device pixels.
  function fitEntrance() {
    const dpr = window.devicePixelRatio || 1, phone = matchMedia(PHONE).matches;
    const target = phone ? innerWidth * 0.72 : Math.min(innerWidth * 0.34, innerHeight * 0.73);
    const limit = phone ? innerWidth - 40 : Math.min(innerWidth * 0.5, innerHeight * 0.9);
    let n = Math.max(1, Math.round((target * dpr) / 160));
    while (n > 1 && (160 * n) / dpr > limit) n--;
    if ((160 * n) / dpr < target * 0.75) n = (target * dpr) / 160;
    home.style.setProperty("--px", n / dpr + "px");
    const snap = (v) => Math.round(v * dpr) / dpr, group = document.getElementById("identity");
    home.style.setProperty("--x", snap((innerWidth - (160 * n) / dpr) / 2) + "px");
    home.style.setProperty("--y", snap(innerHeight * (phone ? 0.48 : 0.5) - group.offsetHeight / 2) + "px");
  }
  // The largest whole-device-pixel scale that fits a box.
  function fitBox(el, fw, fh) {
    const dpr = window.devicePixelRatio || 1, r = el.getBoundingClientRect();
    const n = Math.max(1, Math.floor(Math.min((r.width * fw * dpr) / 160, (r.height * fh * dpr) / 61)));
    el.style.setProperty("--px", n / dpr + "px");
  }

  function lead(ms, phase) {
    clock.textContent = String(Math.round(ms)).padStart(4, "0");
    phaseEl.textContent = phase;
  }

  function build() {
    marks.forEach((m) => m.destroy());
    marks = [];
    home.dataset.view = view;
    document.querySelectorAll(".ma-view").forEach((el) => (el.hidden = el.dataset.for !== view));
    document.getElementById("view").textContent = VIEWS.find(([v]) => v === view)[1];
    const rate = slow ? 0.25 : 1;
    if (view === "entrance") {
      fitEntrance();
      marks.push(MM.mount(document.querySelector("#identity canvas"), { variant, rate, onFrame: lead }));
    } else if (view === "compare") {
      const grid = document.getElementById("grid");
      grid.innerHTML = ORDER.map((id) => `<figure class="ma-cell${id === variant ? " is-current" : ""}" data-cell="${id}">
        <button type="button" class="ma-mark" aria-label="Replay all"><canvas aria-hidden="true"></canvas></button>
        <figcaption><b>${NUM[id]} ${MM.variants[id].name}</b>${MM.total(id).toLocaleString("en-US")} ms</figcaption></figure>`).join("");
      grid.querySelectorAll(".ma-cell").forEach((cell) => {
        fitBox(cell, 0.62, 0.5);
        const id = cell.dataset.cell;
        marks.push(MM.mount(cell.querySelector("canvas"), { variant: id, rate, onFrame: id === variant ? lead : null }));
      });
      // Every mark starts on the same animation frame, so the four arrivals can be compared.
    } else {
      document.querySelectorAll(".ma-pane").forEach((pane, i) => {
        fitBox(pane, 0.6, 0.42);
        marks.push(MM.mount(pane.querySelector("canvas"), { variant, rate, onFrame: i === 0 ? lead : null }));
      });
    }
    document.querySelectorAll("[data-variant]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.variant === variant)));
    document.getElementById("note").textContent = NOTES[variant] + " " + MM.total(variant).toLocaleString("en-US") + " ms.";
    const u = new URL(location.href);
    u.searchParams.set("v", variant); u.searchParams.set("view", view);
    history.replaceState(null, "", u);
  }
  const replay = () => marks.forEach((m) => m.replay());

  document.querySelectorAll("[data-variant]").forEach((b) => b.addEventListener("click", () => { variant = b.dataset.variant; build(); }));
  document.querySelectorAll("[data-way]").forEach((b) => b.addEventListener("click", () => setPalette(b.dataset.way)));
  home.addEventListener("click", (e) => { if (e.target.closest(".ma-mark")) replay(); });
  document.getElementById("replay").addEventListener("click", replay);
  document.getElementById("slow").addEventListener("click", (e) => {
    slow = !slow; e.currentTarget.setAttribute("aria-pressed", String(slow));
    marks.forEach((m) => m.setRate(slow ? 0.25 : 1)); replay();
  });
  document.getElementById("view").addEventListener("click", () => {
    view = VIEWS[(VIEWS.findIndex(([v]) => v === view) + 1) % VIEWS.length][0]; build();
  });
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k >= "1" && k <= "4") { variant = ORDER[+k - 1]; build(); }
    else if (k === "r" || k === " ") { e.preventDefault(); replay(); }
    else if (k === "s") document.getElementById("slow").click();
    else if (k === "v") document.getElementById("view").click();
  });
  let pending = 0;
  addEventListener("resize", () => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => {
      if (view === "entrance") fitEntrance();
      else document.querySelectorAll(view === "compare" ? ".ma-cell" : ".ma-pane").forEach((el) => fitBox(el, view === "compare" ? 0.62 : 0.6, view === "compare" ? 0.5 : 0.42));
      marks.forEach((m) => m.resize());
    });
  });

  let saved = "chalk";
  try { saved = sessionStorage.getItem("freeman-palette") || "chalk"; } catch (_) {}
  setPalette(["chalk", "umber", "sand"].includes(saved) ? saved : "chalk");
  build();

  // The finished frame of every variation must be the production frame, pixel for pixel.
  const v = MM.verify(), ok = Object.values(v).every((r) => r.mismatches === 0 && r.pixels === r.expected);
  document.getElementById("check").textContent = ok
    ? `Final frame = production, ${v.original.expected.toLocaleString("en-US")} px, 0 differ`
    : "Final frame differs from production — see console";
  if (!ok) console.warn("Magnetic Assembly verify", v);
  window.__maVerify = v;
})();
