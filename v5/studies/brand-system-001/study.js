/* Brand System Study 001 — the neutral presentation: plates, comparisons, full-size viewer. */
(() => {
  "use strict";
  const S = window.FGCStudy, F = window.FGC;
  const { DIRS, APPS, FORMAT, formats, render, foundation } = S;

  if (new URLSearchParams(location.search).has("export")) document.documentElement.classList.add("export");

  /* ---------- Marks as symbols. The signature is read from the production bitmap (pixel-mark.js). */
  function signaturePath() {
    const cv = document.createElement("canvas");
    cv.width = 160; cv.height = 61;
    window.FreemanPixelMark.mount(cv, { play: false });
    const d = cv.getContext("2d").getImageData(0, 0, 160, 61).data;
    let p = "";
    for (let y = 0; y < 61; y++) for (let x = 0; x < 160; x++) {
      if (!d[(y * 160 + x) * 4 + 3]) continue;
      let n = 1; while (x + n < 160 && d[(y * 160 + x + n) * 4 + 3]) n++;
      p += `M${x} ${y}h${n}v1h-${n}z`; x += n - 1;
    }
    return p;
  }
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="fgc-sig" viewBox="0 0 160 61"><path d="${signaturePath()}"/></symbol><symbol id="fgc-eagle" viewBox="0 0 192 60"><path d="${window.FGC_EAGLE_PATH}"/></symbol></svg>`);

  /* ---------- Frames: an artboard scaled to its box, clickable to full size. */
  const frame = (r, { label = true, maxh = "var(--maxh)" } = {}) => `<div class="fr" data-open="${r.id}">
      <div class="frame" style="--ar:${r.w / r.h};--w:${r.w};width:min(100%, calc(${maxh} * ${r.w / r.h}))">${r.html}</div>
      ${label ? `<div class="fr-label"><span>${r.id}</span><span>${describe(r.id)}</span></div>` : ""}</div>`;
  const describe = (id) => {
    const [d, no, f] = id.split("-"), a = APPS.find((x) => x.no === no), dir = DIRS.find((x) => x.key === d);
    if (no === "00") return `${dir.name} — Foundations`;
    return `${dir.name} — ${a.name}, ${FORMAT[{ D: "d", M: "m", F: "front", R: "back", S: "sign" }[f]]}`;
  };
  const parseId = (id) => { const [d, no, f] = id.split("-"); return { d, no, f }; };
  const fmtKey = { D: "d", M: "m", F: "front", R: "back", S: "sign" };
  const byId = (id) => { const { d, no, f } = parseId(id); return no === "00" ? foundation(d) : render(d, APPS.find((a) => a.no === no).key, fmtKey[f]); };

  /* ---------- Plates */
  const plates = [];
  const plate = (sec, title, body, cls = "") => plates.push({ sec, title, body, cls });

  plate("Study", "Freeman General Contracting — Brand System 001", `<div class="cover">
      <div class="cover-mark">${S.sig(3)}</div>
      <div class="cover-list">${DIRS.map((d) => `<div><span>${d.key}</span><span>${d.name}</span><span>${d.note}</span></div>`).join("")}</div>
      <div class="cover-meta"><span>Six applications</span><span>Homepage · Project · Company · Field note · Business card · Jobsite sign</span><span>25 October 2026 · Study branch, not production</span></div></div>`, "p-cover");

  plate("Constants", "Held in every direction", `<div class="core">
      <div class="core-marks"><figure>${S.sig(3)}<figcaption>Signature · production bitmap 160 × 61, shown 3×</figcaption></figure><figure>${S.eagle(2)}<figcaption>Eagle · approved Stamp 192 × 60, shown 2×</figcaption></figure></div>
      <div class="core-words"><p class="core-bfg">Built for Generations.</p><p>${F.line}</p><p>Finished architecture alongside evidence of how it was built.</p></div>
      <div class="core-pal">${F.palette.map((c) => `<div><i style="background:${c.hex}"></i><span>${c.name}</span><span>${c.hex.toUpperCase()}</span></div>`).join("")}</div>
      <ul class="core-rules"><li>One screen, no scrolling, on desktop.</li><li>No cards, rounded panels, gradients or floating UI.</li><li>Signal used deliberately, and sparingly.</li><li>Only real Freeman content; unrecorded facts are stated as unrecorded.</li></ul></div>`, "p-core");

  plate("Overview", "Every application, every direction", `<div class="ov" style="--cols:${APPS.length}">
      <div></div>${APPS.map((a) => `<div class="ov-h">${a.no} ${a.name}</div>`).join("")}
      ${DIRS.map((d) => `<div class="ov-d"><b>${d.key}</b>${d.name}</div>${APPS.map((a) => `<div class="ov-c">${frame(render(d.key, a.key, formats(a)[0]), { label: false, maxh: "var(--ovh)" })}</div>`).join("")}`).join("")}</div>`, "p-ov");

  for (const a of APPS) {
    const fs = formats(a);
    if (a.kind === "web") {
      for (const f of fs) plate("Compare", `${a.no} ${a.name} — ${FORMAT[f]}`, `<div class="row3 ${f === "m" ? "row3-m" : ""}">${DIRS.map((d) => frame(render(d.key, a.key, f))).join("")}</div>`);
    } else if (a.kind === "card") {
      plate("Compare", `${a.no} ${a.name} — front and back`, `<div class="row3 row3-card">${DIRS.map((d) => `<div class="stack">${fs.map((f) => frame(render(d.key, a.key, f), { maxh: "var(--cardh)" })).join("")}</div>`).join("")}</div>`);
    } else {
      plate("Compare", `${a.no} ${a.name}`, `<div class="row3 row3-sign">${DIRS.map((d) => frame(render(d.key, a.key, "sign"), { maxh: "var(--signh)" })).join("")}</div>`);
    }
  }

  for (const d of DIRS) {
    plate(d.key, `${d.key} — ${d.name} · Foundations`, `<div class="solo">${frame(foundation(d.key))}</div>`);
    for (const a of APPS) {
      const fs = formats(a);
      const body = a.kind === "web" ? `<div class="pair">${frame(render(d.key, a.key, "d"))}${frame(render(d.key, a.key, "m"))}</div>`
        : a.kind === "card" ? `<div class="pair pair-card">${fs.map((f) => frame(render(d.key, a.key, f), { maxh: "var(--cardsolo)" })).join("")}</div>`
        : `<div class="solo">${frame(render(d.key, a.key, "sign"))}</div>`;
      plate(d.key, `${d.key} — ${d.name} · ${a.no} ${a.name}`, body);
    }
  }

  const VERDICT = {
    A: ["Continuity. Nothing to relearn; every value is already live.", "Closest to today, so the least new authority."],
    B: ["The quietest and most literary. Reads well to restaurateurs.", "Nearest to a luxury-hospitality template; carries no builder evidence."],
    C: ["The one only a builder could own: sheets, schedules, the Stamp as seal.", "Asks for dated field evidence Freeman does not yet hold."],
  };
  plate("Decision", "Recommendation", `<div class="dec">
      <div class="dec-rows">${DIRS.map((d) => `<div class="dec-row${d.key === "C" ? " is-rec" : ""}">
        ${frame(render(d.key, "project", "d"), { label: false, maxh: "var(--dech)" })}
        <div class="dec-text"><b>${d.key} — ${d.name}</b><span>${VERDICT[d.key][0]}</span><span>${VERDICT[d.key][1]}</span></div></div>`).join("")}</div>
      <div class="dec-call"><p>Develop C — Document, held to A’s restraint.</p>
        <p>Keep Signal to seal and redline. Begin dated captures on Little Rey so the first field sheets carry real evidence.</p></div></div>`, "p-dec");

  const root = document.getElementById("plates");
  root.innerHTML = plates.map((p, i) => `<section class="plate ${p.cls}" id="p${i + 1}" data-sec="${p.sec}">
      <header class="plate-head"><span>${String(i + 1).padStart(2, "0")}</span><span>${p.sec}</span><span>${p.title}</span></header>
      <div class="plate-body">${p.body}</div></section>`).join("");
  document.getElementById("count-total").textContent = String(plates.length).padStart(2, "0");

  /* Section links */
  const secs = [...new Set(plates.map((p) => p.sec))];
  document.getElementById("secnav").innerHTML = secs.map((s) => {
    const d = DIRS.find((x) => x.key === s), i = plates.findIndex((p) => p.sec === s);
    return `<a href="#p${i + 1}" data-sec="${s}">${d ? `${d.key} ${d.name}` : s}</a>`;
  }).join("");

  /* ---------- Scale every artboard to its frame */
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const f = e.target, w = +f.style.getPropertyValue("--w");
      f.firstElementChild.style.transform = `scale(${e.contentRect.width / w})`;
    }
  });
  const observe = (scope) => scope.querySelectorAll(".frame").forEach((f) => ro.observe(f));
  observe(document);

  /* Current plate counter */
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) {
      const i = +e.target.id.slice(1);
      document.getElementById("count-cur").textContent = String(i).padStart(2, "0");
      document.querySelectorAll("#secnav a").forEach((a) => a.classList.toggle("is-cur", a.dataset.sec === e.target.dataset.sec));
    }
  }, { threshold: 0.55 });
  document.querySelectorAll(".plate").forEach((p) => io.observe(p));

  /* ---------- Motion demos on the foundation sheets */
  let eagleReady = window.FreemanBitmapEagle.load("../../eagle/stamp.pbm").catch(() => null);
  function play(box) {
    const cv = box.querySelector("canvas"), kind = box.dataset.motion;
    if (kind === "sig") {
      box._h && box._h.destroy();
      box._h = window.FreemanSignature.mount(cv, { play: true });
    } else if (kind === "still") {
      window.FreemanPixelMark.mount(cv, { play: false });
    } else {
      eagleReady.then(() => window.FreemanBitmapEagle.play(cv.getContext("2d"), "impression", { color: "#f93822" }));
    }
  }
  const mio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) play(e.target); }), { threshold: 0.6 });
  document.querySelectorAll(".fd-motion").forEach((b) => mio.observe(b));
  document.addEventListener("click", (e) => {
    const r = e.target.closest("[data-replay]");
    if (r) { e.stopPropagation(); play(r.previousElementSibling); return; }
    const o = e.target.closest("[data-open]");
    if (o && !e.target.closest("#full")) openFull(o.dataset.open);
  }, true);

  /* ---------- Full-size viewer: ← → direction, ↑ ↓ application, F format, Z fit / 1:1, Esc */
  const full = document.getElementById("full"), stage = full.querySelector(".full-stage");
  let cur = null, actual = false;
  function openFull(id) {
    cur = parseId(id);
    const r = byId(id);
    full.querySelector(".full-id").textContent = r.id;
    full.querySelector(".full-name").textContent = describe(r.id);
    full.querySelector(".full-size").textContent = `${r.w} × ${r.h}`;
    stage.innerHTML = `<div class="frame" style="--ar:${r.w / r.h};--w:${r.w};width:${actual ? r.w + "px" : `min(100%, calc(var(--fullh) * ${r.w / r.h}))`}">${r.html}</div>`;
    stage.classList.toggle("is-actual", actual);
    full.querySelector("[data-zoom]").textContent = actual ? "Fit" : "1:1";
    full.hidden = false; document.documentElement.classList.add("is-full");
    observe(stage);
    stage.querySelectorAll(".fd-motion").forEach(play);
    history.replaceState(null, "", "#" + r.id);
  }
  function closeFull() { full.hidden = true; document.documentElement.classList.remove("is-full"); history.replaceState(null, "", location.pathname); }
  function step(axis, dlt) {
    if (!cur) return;
    let { d, no, f } = cur;
    if (axis === "dir") d = DIRS[(DIRS.findIndex((x) => x.key === d) + dlt + 3) % 3].key;
    if (axis === "app") {
      const list = ["00", ...APPS.map((a) => a.no)], i = (list.indexOf(no) + dlt + list.length) % list.length;
      no = list[i];
      if (no === "00") f = "F";
      else { const a = APPS.find((x) => x.no === no), fs = formats(a).map((k) => Object.keys(fmtKey).find((x) => fmtKey[x] === k)); if (!fs.includes(f)) f = fs[0]; }
    }
    if (axis === "fmt" && no !== "00") {
      const a = APPS.find((x) => x.no === no), fs = formats(a).map((k) => Object.keys(fmtKey).find((x) => fmtKey[x] === k));
      f = fs[(fs.indexOf(f) + 1) % fs.length];
    }
    openFull(`${d}-${no}-${f}`);
  }
  full.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.close !== undefined) closeFull();
    if (b.dataset.zoom !== undefined) { actual = !actual; openFull(`${cur.d}-${cur.no}-${cur.f}`); }
    if (b.dataset.step) { const [ax, n] = b.dataset.step.split(":"); step(ax, +n); }
  });
  document.addEventListener("keydown", (e) => {
    if (full.hidden) return;
    const k = e.key;
    if (k === "Escape") closeFull();
    else if (k === "ArrowRight") step("dir", 1);
    else if (k === "ArrowLeft") step("dir", -1);
    else if (k === "ArrowDown") { e.preventDefault(); step("app", 1); }
    else if (k === "ArrowUp") { e.preventDefault(); step("app", -1); }
    else if (k === "f" || k === "F") step("fmt", 1);
    else if (k === "z" || k === "Z") { actual = !actual; openFull(`${cur.d}-${cur.no}-${cur.f}`); }
    else return;
    e.preventDefault();
  });
  const h = location.hash.slice(1);
  if (/^p\d+$/.test(h)) { const el = document.getElementById(h); if (el) { el.classList.add("is-export"); el.scrollIntoView(); } }
  if (/^[ABC]-\d\d-[DMFRS]$/.test(h)) document.fonts.ready.then(() => openFull(h));
})();
