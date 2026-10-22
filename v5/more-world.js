/* Freeman / MORE — spatial editorial archive study. No external libraries. */
(() => {
  "use strict";

  const credo = [
    "Built for Generations is a way of making decisions.",
    "Every project reaches beyond the people standing on its job site today. It touches the owner who trusts us with an idea, the architect who gives it form, the trades whose skill makes it real, and the people who will use the place long after we leave.",
    "So we build for more than the handover. We build relationships that last through difficult conversations. We bring people together who take pride in what they do. We make the hard decision now when it is the right decision for what comes next.",
    "We believe the construction process itself should be worth being part of: collaborative, considered, and alive with the energy of people doing good work together.",
    "The standard cannot depend on the size or type of project. It has to be how we operate, with every client and every partner.",
    "That is what we mean by Built for Generations."
  ];

  const objects = [
    {id:"optimist", n:"002", name:"Bringing The Optimist to life", src:"/assets/project-1.jpg", alt:"Patio at The Optimist", type:"EDITORIAL NOTE"},
    {id:"barnsley", n:"003", name:"Barnsley Gardens", src:"/assets/projects/barnsley-gardens-2.jpg", alt:"Barnsley Gardens project photograph", type:"PROJECT PHOTOGRAPH"},
    {id:"drawing", n:"004", name:"Architectural drawing", src:"/etcetera/architectural-industrial.webp", alt:"Architectural study drawing", type:"FROM THE WORKING ARCHIVE"},
    {id:"residential", n:"005", name:"Residential perspective", src:"/etcetera/residential-landscape.webp", alt:"Residential perspective drawing", type:"FROM THE WORKING ARCHIVE"},
    {id:"ruskin", n:"006", name:"What remains", src:"/etcetera/ruskin.webp", alt:"Photographed passage by John Ruskin about building for future generations", type:"A READING"},
    {id:"beetlecat", n:"007", name:"Beetlecat", src:"/assets/projects/beetlecat-interior-2.jpg", alt:"Beetlecat interior photograph", type:"PROJECT PHOTOGRAPH"}
  ];

  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const paragraphs = (list) => list.map(p => "<p>" + escapeHTML(p) + "</p>").join("");
  const itemMarkup = (o) =>
    '<button class="more-piece more-piece-' + o.id + '" type="button" data-more-open="' + o.id + '" aria-label="Open ' + escapeHTML(o.name) + '">' +
      '<span class="more-piece-media"><img src="' + o.src + '" alt="' + escapeHTML(o.alt) + '" loading="lazy"></span>' +
      '<span class="more-piece-label"><span>' + o.n + ' / ' + escapeHTML(o.type) + '</span><strong>' + escapeHTML(o.name) + ' ↗</strong></span>' +
    '</button>';

  function mount(viewport) {
    viewport.innerHTML =
      '<section class="more-world" aria-label="Explore Freeman MORE">' +
        '<div class="more-stage" tabindex="0" aria-label="Drag to explore; use the controls to zoom or return to the center">' +
          '<div class="more-space">' +
            '<article class="more-credo" aria-labelledby="more-credo-title">' +
              '<div class="more-credo-overline">001 / THE FREEMAN POINT OF VIEW</div>' +
              '<h2 id="more-credo-title">BUILT FOR<br>GENERATIONS<span>.</span></h2>' +
              '<div class="more-credo-copy">' +
                '<p>Built for Generations is a way of making decisions.</p>' +
                '<p>We build relationships that last through difficult conversations, bring together people who care deeply about their work, and think beyond the handover.</p>' +
                '<p>We believe the process of building should be something worth being part of.</p>' +
              '</div>' +
              '<button class="more-read" type="button" data-more-open="credo">READ THE STATEMENT ↗</button>' +
              '<div class="more-credo-signoff">FREEMAN GENERAL CONTRACTING</div>' +
            '</article>' +
            objects.map(itemMarkup).join("") +
          '</div>' +
        '</div>' +
        '<div class="more-guidance" aria-hidden="true"><span>THE WORK / THE PEOPLE / THE PROCESS</span><span>DRAG TO EXPLORE</span></div>' +
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
      dialog.classList.toggle("more-dialog-image", id !== "credo" && id !== "optimist");
      const item = objects.find(o => o.id === id);
      modalTitle.textContent = id === "credo" ? "001 / BUILT FOR GENERATIONS" : item.n + " / " + item.type;
      if (id === "credo") {
        modalBody.innerHTML = '<article class="more-reading"><h2>Built for Generations.</h2>' + paragraphs(credo) +
          '<p class="more-signature">FREEMAN GENERAL CONTRACTING</p></article>';
      } else if (id === "optimist") {
        modalBody.innerHTML = '<article class="more-reading"><h2>Bringing The Optimist to life</h2>' +
          paragraphs([
            "A restaurant is experienced as a whole. The light on a table, the curve of a booth, the sounds of service, the ease with which people move through a room. Behind that apparent ease are decisions made by many people.",
            "Hospitality construction brings together a designer’s intent, an operator’s everyday needs, durability, craft, budget, and the calendar. A beautiful detail also needs to survive a busy Saturday night.",
            "The Optimist offers a place to examine that relationship between the finished result and the work behind it. The next chapter is documenting the coordination, sequencing, and judgment that make a space feel effortless.",
            "Not just what a place looks like when it is finished, but what it took to get there."
          ]) + '<small>EDITORIAL STUDY / PROJECT-SPECIFIC PROCESS DETAILS TO BE DOCUMENTED</small></article>';
      } else {
        modalBody.innerHTML = '<figure class="more-artwork"><img src="' + item.src + '" alt="' + escapeHTML(item.alt) + '">' +
          '<figcaption>' + escapeHTML(item.name) + ' / ' + escapeHTML(item.type) + '</figcaption></figure>';
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