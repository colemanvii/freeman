/* Freeman / MORE — spatial editorial archive study. No external libraries. */
(() => {
  "use strict";

  // Proposed first-person note for Gabe's approval (77 words).
  const note = [
      "When I say Built for Generations, I mean more than the buildings we leave behind. I mean the people who build them, the partners who trust us, and the relationships we choose to protect.",
      "We should make the hard decision when it’s right, even when the easier one is tempting. Every project deserves that standard.",
      "I want construction to be something people enjoy being part of, and something we’re proud to stand behind long after opening day."
  ];

  // Seven-piece editorial edit, chosen for visual and material range.
  // Non-project references are identified as archive material, not Freeman construction evidence.
  const objects = [
    {id:"optimist", n:"002", name:"Bringing The Optimist to life", src:"/assets/project-1.jpg", alt:"Patio at The Optimist", type:"EDITORIAL NOTE"},
    {id:"barnsley", n:"003", name:"Barnsley Gardens", src:"/assets/projects/barnsley-gardens-2.jpg", alt:"Barnsley Gardens project photograph", type:"PROJECT"},
    {id:"drawing", n:"004", name:"Architectural study", src:"/etcetera/architectural-industrial.webp", alt:"Historical architectural study drawing", type:"ARCHIVE REFERENCE", context:"Architectural reference from the existing Freeman creative archive. No project attribution is implied."},
    {id:"residential", n:"005", name:"A perspective", src:"/etcetera/residential-landscape.webp", alt:"Warm-toned residential perspective drawing", type:"ARCHIVE REFERENCE", context:"Architectural reference from the existing Freeman creative archive. No project attribution is implied."},
    {id:"ruskin", n:"006", name:"When we build", src:"/etcetera/ruskin.webp", alt:"Photographed page bearing a passage by John Ruskin", type:"A READING"},
    {id:"beetlecat", n:"007", name:"Beetlecat", src:"/assets/projects/beetlecat-interior-2.jpg", alt:"Colorful interior of Beetlecat", type:"PROJECT"},
    {id:"timber", n:"008", name:"Timber", src:"/more-assets/timber.webp", alt:"Worn timber surface from the Field Notes archive", type:"MATERIAL REFERENCE", context:"Material reference from the Field Notes archive. Project and date unverified."}
  ];

  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const paragraphs = (list) => list.map(p => "<p>" + escapeHTML(p) + "</p>").join("");
  const itemMarkup = (o) =>
    '<button class="more-piece more-piece-' + o.id + '" type="button" data-more-open="' + o.id + '" aria-label="Open ' + escapeHTML(o.name) + '">' +
      '<span class="more-piece-media"><img src="' + o.src + '" alt="' + escapeHTML(o.alt) + '" loading="lazy"></span>' +
      '<span class="more-piece-label"><span>' + o.n + '</span><strong>' + escapeHTML(o.name) + ' ↗</strong></span>' +
    '</button>';

  function mount(viewport) {
    viewport.innerHTML =
      '<section class="more-world" aria-label="Explore Freeman MORE">' +
        '<div class="more-stage" tabindex="0" aria-label="Drag to explore; use the controls to zoom or return to the center">' +
          '<div class="more-space">' +
            '<article class="more-credo" aria-labelledby="more-credo-title">' +
              '<div class="more-credo-overline">001 / THE FREEMAN POINT OF VIEW</div>' +
              '<h2 id="more-credo-title">BUILT FOR<br>GENERATIONS<span>.</span></h2>' +
              '<div class="more-credo-copy">' + paragraphs(note) + '</div>' +
              '<footer class="more-credo-footer">' +
                '<div class="more-credo-signoff"><strong>GABE FREEMAN</strong><span>FOUNDER / FREEMAN GENERAL CONTRACTING</span></div>' +
                '<img class="more-credo-eagle" src="/eagle/stamp-red.svg" width="192" height="60" alt="" aria-hidden="true" decoding="sync">' +
              '</footer>' +
            '</article>' +
            objects.map(itemMarkup).join("") +
          '</div>' +
        '</div>' +
        '<div class="more-guidance" aria-hidden="true"><span>DRAG TO EXPLORE</span></div>' +
        '<div class="more-tools" aria-label="Explore controls">' +
          '<button type="button" data-more-control="zoom-in" aria-label="Zoom in">+</button>' +
          '<button type="button" data-more-control="zoom-out" aria-label="Zoom out">−</button>' +
          '<button type="button" data-more-control="overview">OVERVIEW</button>' +
          '<button type="button" data-more-control="center">⌖ CENTER</button>' +
        '</div>' +
        '<dialog class="more-dialog" aria-labelledby="more-dialog-title">' +
          '<header class="more-dialog-head"><span id="more-dialog-title"></span><button type="button" data-more-close>× CLOSE</button></header>' +
          '<div class="more-dialog-content"></div>' +
        '</dialog>' +
      '</section>';

    const stage = viewport.querySelector(".more-stage");
    const space = viewport.querySelector(".more-space");
    const dialog = viewport.querySelector(".more-dialog");
    const modalTitle = viewport.querySelector("#more-dialog-title");
    const modalBody = viewport.querySelector(".more-dialog-content");
    const CX = 1190, CY = 840, WORLD_W = 2380, WORLD_H = 1740;
    const MIN = 0.18, MAX = 1.8;
    let tx = 0, ty = 0, scale = 0.8, gesture = null;
    const pointers = new Map();

    function paint() {
      space.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
    }
    function center() {
      const r = stage.getBoundingClientRect();
      scale = Math.min(0.84, Math.max(0.46, (r.width - 32) / 560));
      tx = r.width / 2 - CX * scale;
      ty = r.height / 2 - CY * scale;
      paint();
    }
    function overview() {
      const r = stage.getBoundingClientRect();
      scale = Math.min((r.width - 50) / WORLD_W, (r.height - 50) / WORLD_H, 1);
      tx = (r.width - WORLD_W * scale) / 2;
      ty = (r.height - WORLD_H * scale) / 2;
      paint();
    }
    function zoomAt(factor, x, y) {
      const newScale = Math.min(MAX, Math.max(MIN, scale * factor));
      const wx = (x - tx) / scale;
      const wy = (y - ty) / scale;
      scale = newScale;
      tx = x - wx * scale;
      ty = y - wy * scale;
      paint();
    }
    stage.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const r = stage.getBoundingClientRect();
        zoomAt(Math.exp(-e.deltaY * .005), e.clientX - r.left, e.clientY - r.top);
      } else {
        tx -= e.deltaX;
        ty -= e.deltaY;
        paint();
      }
    }, {passive:false});

    stage.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      stage.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, {x:e.clientX,y:e.clientY});
      if (pointers.size === 1) {
        gesture = {kind:"pan",x:e.clientX,y:e.clientY};
        stage.classList.add("is-grabbing");
      } else if (pointers.size === 2) {
        const a = [...pointers.values()];
        gesture = {kind:"pinch",distance:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),scale:scale};
      }
    });
    stage.addEventListener("pointermove", (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, {x:e.clientX,y:e.clientY});
      if (pointers.size === 2 && gesture && gesture.kind === "pinch") {
        const a = [...pointers.values()];
        const distance = Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
        const midX = (a[0].x+a[1].x)/2 - stage.getBoundingClientRect().left;
        const midY = (a[0].y+a[1].y)/2 - stage.getBoundingClientRect().top;
        const factor = (gesture.scale * distance / Math.max(gesture.distance,1)) / scale;
        zoomAt(factor,midX,midY);
      } else if (pointers.size === 1 && gesture && gesture.kind === "pan") {
        tx += e.clientX - gesture.x; ty += e.clientY - gesture.y;
        gesture.x = e.clientX; gesture.y = e.clientY; paint();
      }
    });
    function release(e) {
      pointers.delete(e.pointerId);
      stage.classList.remove("is-grabbing");
      gesture = pointers.size === 1 ? {kind:"pan",...([...pointers.values()][0])} : null;
    }
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);
    stage.addEventListener("lostpointercapture", release);

    function openEntry(id) {
      dialog.classList.toggle("more-dialog-image", id !== "optimist");
      const item = objects.find(o => o.id === id);
      if (!item) return;
      modalTitle.textContent = item.n + " / " + item.type;
      if (id === "optimist") {
        modalBody.innerHTML = '<article class="more-reading"><h2>Bringing The Optimist to life</h2>' +
          paragraphs([
            "A restaurant is experienced as a whole. The light on a table, the curve of a booth, the sounds of service, the ease with which people move through a room. Behind that apparent ease are decisions made by many people.",
            "Hospitality construction brings together a designer’s intent, an operator’s everyday needs, durability, craft, budget, and the calendar. A beautiful detail also needs to survive a busy Saturday night.",
            "The Optimist offers a place to examine that relationship between the finished result and the work behind it. The next chapter is documenting the coordination, sequencing, and judgment that make a space feel effortless.",
            "Not just what a place looks like when it is finished, but what it took to get there."
          ]) + '<small>EDITORIAL STUDY / PROJECT-SPECIFIC PROCESS DETAILS TO BE DOCUMENTED</small></article>';
      } else {
        modalBody.innerHTML = '<figure class="more-artwork"><img src="' + item.src + '" alt="' + escapeHTML(item.alt) + '">' +
          '<figcaption>' + escapeHTML(item.name) + ' / ' + escapeHTML(item.type) +
          (item.context ? '<span class="more-artwork-context">' + escapeHTML(item.context) + '</span>' : '') +
          '</figcaption></figure>';
      }
      dialog.showModal();
    }
    viewport.querySelectorAll("[data-more-open]").forEach(b => b.addEventListener("click", () => openEntry(b.dataset.moreOpen)));
    viewport.querySelector("[data-more-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
    viewport.querySelectorAll("[data-more-control]").forEach(button => {
      button.addEventListener("click", () => {
        const r = stage.getBoundingClientRect();
        const mode = button.dataset.moreControl;
        if (mode === "center") center();
        else if (mode === "overview") overview();
        else zoomAt(mode === "zoom-in" ? 1.2 : 1 / 1.2, r.width / 2, r.height / 2);
      });
    });
    stage.addEventListener("keydown", e => {
      if (e.target !== stage) return;
      const steps = {ArrowUp:[0,65],ArrowDown:[0,-65],ArrowLeft:[65,0],ArrowRight:[-65,0]};
      if (steps[e.key]) {
        e.preventDefault(); tx += steps[e.key][0]; ty += steps[e.key][1]; paint();
      } else if (e.key === "Home") {e.preventDefault();center();}
    });
    center();
  }
  window.FreemanMore = {mount};
})();