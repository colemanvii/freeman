/* The Built Record — Muchacho Decatur.
   Layout, drawings and captions only. Facts are never restated here; the renderer reads them from
     /records.js (name, number, type, account)   /project-credits.js (partners, roles)
     /record-assets/sites.js (address, area)     /record-assets/photos.js (photograph sizes)

   DRAWINGS. No architect's drawing of this project is on file. Every sheet below is a RECORD DRAWING
   traced from one of Freeman's published photographs, in that photograph's own pixel coordinates, so the
   drawing and the photograph register exactly. They show proportion and arrangement as photographed.
   They carry no dimensions, no materials, no assemblies and no structure, because none are on file.
   People, foliage, fittings and furnishings are omitted; lines hidden in the photograph are not drawn. */
(function () {
  "use strict";
  // ---- drawing helpers: three line weights, heavy (profile), regular, light (pattern) ----
  const f = (n) => Math.round(n * 10) / 10;
  const R = (x, y, w, h, c) => `<rect class="${c || "b"}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  const L = (x1, y1, x2, y2, c) => `<line class="${c || "b"}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  const P = (pts, c) => `<polyline class="${c || "b"}" points="${pts.map((p) => p.join(",")).join(" ")}"/>`;
  const G = (pts, c) => `<polygon class="${c || "b"}" points="${pts.map((p) => p.join(",")).join(" ")}"/>`;
  // Diamond glazing bars inside a sash: two families of diagonals, clipped to the glass.
  const lattice = (id, x, y, w, h, dx, dy) => {
    let s = "";
    const k = dy / dx;
    for (let c = -Math.ceil(h / dy) - 1; c <= Math.ceil(w / dx) + 1; c++) {
      const x0 = x + c * dx + dx / 2;
      s += L(x0, y, x0 + h / k, y + h, "c") + L(x0, y, x0 - h / k, y + h, "c");
    }
    return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${s}</g>${R(x, y, w, h)}`;
  };
  // Evenly spaced uprights (balusters), drawn as pairs of lines with paper between.
  const balusters = (x0, x1, step, y0, y1, w) => {
    let s = "";
    for (let x = x0; x <= x1; x += step) s += R(x, y0, w, y1 - y0, "b p");
    return s;
  };

  // ---- R-1  Front elevation, traced from plate 01 (1920 x 2400) ----
  const elevation = (u) => {
    let s = "";
    // roof courses, clipped to the visible roof
    s += `<clipPath id="${u}roof"><polygon points="0,300 338,300 338,574 1920,574 1920,733 0,776"/></clipPath><g clip-path="url(#${u}roof)">`;
    for (let y = 318; y < 780; y += 36) s += L(0, y, 1920, y - 6, "c");
    s += "</g>";
    // dormer: corner board, three sashes visible, sill
    s += P([[338, 300], [338, 574]], "a") + L(455, 312, 455, 540) + L(455, 312, 1500, 312) + L(440, 540, 1500, 540, "a") + L(440, 572, 1500, 572, "a") + L(440, 540, 440, 572, "a");
    s += lattice(u + "d1", 484, 356, 262, 164, 88, 82) + lattice(u + "d2", 832, 356, 266, 164, 88, 82) + lattice(u + "d3", 1184, 356, 262, 164, 88, 82);
    s += L(880, 100, 1920, 100) + L(880, 128, 1920, 128, "a");
    // eave, fascia, porch beam
    s += L(0, 776, 1920, 733, "a") + L(0, 800, 1920, 757) + L(0, 832, 1920, 800) + L(0, 1043, 1920, 1040, "a");
    // wall head and the canted sides of the bay
    s += P([[0, 1232], [330, 1268], [562, 1268]]) + P([[1442, 1268], [1575, 1268], [1920, 1236]]);
    s += L(335, 1268, 335, 1830) + L(440, 1268, 440, 1830) + L(1500, 1268, 1500, 1830) + L(1588, 1268, 1588, 1830);
    // sign board on its two hangers
    s += L(688, 1043, 688, 1092) + L(1315, 1043, 1315, 1092) + R(562, 1092, 880, 168, "a") + R(576, 1106, 852, 140, "c");
    // lattice windows, left and right of the bay
    s += R(58, 1300, 274, 540) + lattice(u + "wl", 84, 1326, 232, 292, 78, 98) + R(84, 1642, 232, 190);
    s += R(1592, 1318, 270, 524) + lattice(u + "wr", 1608, 1340, 238, 296, 80, 99) + R(1608, 1660, 238, 176);
    // sidelights and their sills
    s += R(445, 1300, 236, 652) + R(457, 1312, 212, 628, "c") + L(432, 1954, 694, 1954);
    s += R(1250, 1315, 232, 650) + R(1262, 1327, 208, 626, "c") + R(1226, 1965, 280, 22);
    // door: frame, leaf, glass, pull, hinges, threshold
    s += R(765, 1298, 400, 914, "a") + R(776, 1306, 374, 900) + R(840, 1400, 255, 615) + R(849, 1409, 237, 597, "c");
    s += R(795, 1775, 13, 92) + R(1150, 1362, 9, 44, "c") + R(1150, 1692, 9, 44, "c") + R(1150, 2040, 9, 44, "c");
    s += `<text class="t" x="1202" y="1604" text-anchor="middle">129</text>` + R(1183, 1626, 36, 36, "c");
    // porch floor and step
    s += L(0, 2212, 1920, 2212, "c") + L(627, 2290, 1357, 2290, "a") + L(627, 2330, 1357, 2330);
    // railings: rails, balusters, then the newels in front
    s += R(0, 1820, 603, 16, "b p") + balusters(22, 570, 42, 1836, 2256, 15) + R(0, 2256, 535, 18, "b p");
    s += R(1389, 1832, 531, 16, "b p") + balusters(1412, 1900, 42, 1848, 2272, 15) + R(1453, 2272, 467, 18, "b p");
    s += G([[640, 1830], [683, 1830], [627, 2068], [560, 2068]], "b p") + G([[1306, 1840], [1349, 1840], [1440, 2078], [1370, 2078]], "b p");
    s += R(603, 1790, 80, 610, "a p") + R(594, 1755, 98, 35, "a p") + R(535, 2096, 90, 304, "a p") + R(525, 2065, 110, 31, "a p");
    s += R(1306, 1800, 82, 600, "a p") + R(1297, 1766, 100, 34, "a p") + R(1360, 2108, 92, 292, "a p") + R(1350, 2077, 112, 31, "a p");
    return s;
  };

  // ---- R-2  Front room, window wall, traced from plate 02 (2400 x 1920) ----
  const frontRoom = (u) => {
    let s = "";
    s += L(470, 690, 1930, 690, "a") + L(0, 270, 470, 690) + L(1930, 690, 2400, 480) + L(1935, 690, 1935, 1000, "c") + L(0, 440, 440, 905) + L(440, 905, 440, 1920) + L(385, 950, 385, 1140, "c");
    s += G([[575, 355], [760, 350], [795, 455], [615, 455]], "c");
    s += R(1015, 825, 400, 260, "c");
    // the pair of sashes in its casing
    s += R(855, 1120, 725, 18, "a") + P([[865, 1920], [865, 1138], [1570, 1138], [1570, 1920]], "a") + P([[940, 1920], [940, 1205], [1505, 1205], [1505, 1920]]);
    s += lattice(u + "c1", 965, 1238, 228, 682, 114, 166) + lattice(u + "c2", 1240, 1238, 226, 682, 113, 166);
    // the window at the left edge
    s += P([[0, 1140], [365, 1140], [365, 1920]], "a") + P([[0, 1235], [295, 1235], [295, 1920]]) + lattice(u + "c3", -40, 1282, 328, 638, 132, 200);
    s += `<ellipse class="c" cx="620" cy="1432" rx="66" ry="34"/>` + P([[640, 1400], [630, 1330], [655, 1322]], "c");
    return s;
  };

  // ---- R-3  Bar, opening in the back wall, traced from plate 04 (2400 x 1920) ----
  const bar = (u) => {
    let s = "";
    s += L(190, 0, 190, 1920, "a") + L(1870, 0, 1870, 1500) + L(2040, 0, 2040, 1560) + P([[1500, 0], [1500, 256], [1600, 256], [1600, 0]]);
    s += R(910, 685, 590, 610, "a") + R(928, 702, 556, 590) + R(902, 1292, 606, 28, "a");
    s += P([[190, 1340], [780, 1290], [845, 1345], [190, 1560]]) + L(845, 1345, 845, 1920) + L(690, 1398, 690, 1920, "c") + L(430, 1482, 430, 1920, "c");
    s += P([[1508, 1320], [2400, 1570]]) + P([[1500, 1345], [1745, 1920]]);
    s += `<circle class="c" cx="802" cy="1090" r="36"/>`;
    return s;
  };

  // ---- R-4  Panelled door, traced from plate 05 (2400 x 1920) ----
  const door = (u) => {
    let s = "";
    s += P([[300, 0], [300, 330], [2170, 330], [2170, 0]], "a") + P([[322, 0], [322, 308], [2148, 308], [2148, 0]], "c") + P([[420, 0], [420, 215], [2040, 215], [2040, 0]]);
    s += R(290, 630, 1895, 650, "a") + R(315, 655, 1845, 600, "c") + R(410, 760, 1640, 390);
    s += L(290, 630, 410, 760, "c") + L(2185, 630, 2050, 760, "c") + L(290, 1280, 410, 1150, "c") + L(2185, 1280, 2050, 1150, "c");
    s += P([[275, 1920], [275, 1590], [2195, 1590], [2195, 1920]], "a") + P([[300, 1920], [300, 1615], [2170, 1615], [2170, 1920]], "c") + P([[400, 1920], [400, 1715], [2060, 1715], [2060, 1920]]);
    s += `<text class="t r" x="1245" y="1000" text-anchor="middle" style="font-size:96px">W.C.</text>`;
    return s;
  };

  // ---- R-5  Cased opening, traced from plate 06 (2400 x 1920) ----
  const opening = (u) => {
    let s = "";
    s += L(335, 160, 2400, 160) + L(335, 160, 292, 1050, "c");
    s += R(885, 705, 625, 480, "c") + R(905, 725, 585, 440, "c");
    s += G([[1880, 812], [2255, 822], [2255, 846], [1880, 838]], "c") + G([[1910, 1656], [2280, 1664], [2280, 1690], [1910, 1684]], "c");
    s += R(545, 1255, 1310, 20, "a") + P([[550, 1920], [550, 1275], [1850, 1275], [1850, 1920]], "a") + P([[600, 1920], [600, 1310], [1800, 1310], [1800, 1920]], "c") + P([[615, 1920], [615, 1325], [1785, 1325], [1785, 1920]]);
    s += L(615, 1368, 1785, 1368, "c");
    for (let t = 650; t <= 1160; t += 30) s += L(t, 1368, 640 + (t - 650) * 0.6, 1920, "c");
    for (let t = 1210; t <= 1770; t += 30) s += L(t, 1368, 1400 + (t - 1210) * 0.66, 1920, "c");
    return s;
  };

  const SAME = "A photograph of this location during the work, taken from the position of the finished plate.";

  window.BUILT_RECORDS = window.BUILT_RECORDS || {};
  window.BUILT_RECORDS["muchacho-decatur"] = {
    study: "001",
    firstKey: 3, // the drawing set opens on the entrance
    // Plates: Freeman's published photographs. Captions say what is visible and nothing about who made it.
    plates: {
      "01": { src: "assets/projects/muchacho-decatur-01.jpg", caption: "Front porch, Church Street", alt: "The front of Muchacho Decatur: a white house with a grey shingle roof and a dormer of lattice windows. The Muchacho sign hangs over a yellow glazed door numbered 129, between lattice-paned windows, behind a white porch rail under a magnolia branch." },
      "02": { src: "assets/projects/muchacho-decatur-02.jpg", caption: "Front room", alt: "A front room in use: cream walls and ceiling, a pair of tall lattice-paned windows in a wide painted casing, a framed photograph of a wave above them, a globe wall light, and guests at the counter in the foreground." },
      "03": { src: "assets/projects/muchacho-decatur-04.jpg", caption: "Bar", alt: "Behind the bar: a timber counter with bottles and taps, a square timber-lined opening in the wall through which two guests are seen talking, a painted post, and warm light on cream walls." },
      "04": { src: "assets/projects/muchacho-decatur-05.jpg", caption: "Door", alt: "A cream-painted panelled door, close up, with the letters W.C. painted in red on its middle panel." },
      "05": { src: "assets/projects/muchacho-decatur-06.jpg", caption: "Cased opening", alt: "A doorway with a painted moulded casing and a parted bead curtain, lit from within. Above it hangs a framed photograph of a motocross rider and a wall speaker." },
      "06": { src: "assets/projects/muchacho-decatur-07.jpg", caption: "Detail", alt: "An orange motorcycle helmet, a reel-to-reel tape recorder and a twin-shade lamp on a timber sideboard against an orange wall." }
    },
    // Opening: the first plate and its record drawing on one sheet, parted at the centre line of the door.
    opening: { plate: "01", sheet: "R-1", seam: 50.1 },
    // 03 Architectural record. `view` regions are [x, y, w, h] in the photograph's pixels.
    drawingNote: "Record drawings traced from Freeman’s photographs. Not the architect’s drawings. Not to scale.",
    sheets: [
      { id: "R-1", title: "Front elevation", sub: "Church Street, as photographed", plate: "01", w: 1920, h: 2400, draw: elevation,
        keys: [
          { n: 1, name: "Dormer", view: [300, 60, 1300, 560], note: "A band of lattice sashes above the porch roof. Three are clear of the magnolia; the drawing stops where the photograph does.", want: SAME },
          { n: 2, name: "Eave and porch beam", view: [0, 690, 1920, 400], note: "The roof edge, the fascia and the beam that carries the porch, running the width of the front.", want: SAME },
          { n: 3, name: "Sign", view: [500, 1020, 1000, 290], note: "A board hung from the porch beam on two hangers, centred on the door.", want: SAME },
          { n: 4, name: "Entrance", view: [700, 1270, 600, 1010], note: "A glazed door in its frame, numbered 129, with a fixed light on either side.", want: SAME },
          { n: 5, name: "Lattice window", view: [20, 1270, 450, 600], note: "One of the two windows on the canted sides of the bay. Diamond bars in the upper sash, clear glass below.", want: SAME },
          { n: 6, name: "Porch rail and steps", view: [480, 1730, 1010, 670], note: "Square balusters between top and bottom rails, with capped newels at the head and foot of the steps.", want: SAME }
        ] },
      { id: "R-2", title: "Front room", sub: "Window wall, as photographed", plate: "02", w: 2400, h: 1920, draw: frontRoom,
        keys: [
          { n: 1, name: "Pair of sashes", view: [800, 1060, 840, 860], note: "Two tall lattice sashes in one wide painted casing with a capped head.", want: SAME },
          { n: 2, name: "Ceiling line", view: [300, 200, 1800, 760], note: "Where the ceiling meets the window wall, with the supply register in the ceiling.", want: SAME }
        ] },
      { id: "R-3", title: "Bar", sub: "Opening in the back wall, as photographed", plate: "03", w: 2400, h: 1920, draw: bar,
        keys: [
          { n: 1, name: "Opening", view: [820, 600, 770, 800], note: "A square timber-lined opening with a ledge, giving a view from the bar to the room behind.", want: SAME },
          { n: 2, name: "Back counter", view: [150, 1180, 760, 740], note: "The counter that meets the opening wall on the left of the bar.", want: SAME }
        ] },
      { id: "R-4", title: "Door", sub: "Panels and lettering, as photographed", plate: "04", w: 2400, h: 1920, draw: door,
        keys: [
          { n: 1, name: "Middle panel", view: [200, 540, 2080, 830], note: "A raised panel inside a moulded frame, one of the three in view.", want: SAME },
          { n: 2, name: "Lettering", view: [900, 800, 700, 330], note: "W.C., painted by hand in red on the field of the panel.", want: SAME }
        ] },
      { id: "R-5", title: "Cased opening", sub: "Head and curtain, as photographed", plate: "05", w: 2400, h: 1920, draw: opening,
        keys: [
          { n: 1, name: "Casing head", view: [480, 1180, 1440, 300], note: "A moulded casing with a capped head, painted.", want: SAME },
          { n: 2, name: "Opening", view: [590, 1300, 1220, 620], note: "The doorway itself, lit from within, with a parted bead curtain.", want: SAME }
        ] },
      { id: "A-101", title: "Floor plan", reserved: true,
        needs: ["The architect’s floor plan, with permission to redraw it for publication.", "Which rooms may be named, and which areas stay off the public sheet.", "The position each photograph was taken from, so the plates can be keyed to the plan."] }
    ],
    // 04 The build. Nothing is on file for this project, so the section states that and nothing more.
    build: {
      plates: [],
      wanted: ["Construction photographs, with their dates", "Freeman’s scope: what was kept, replaced and new", "Start and handover dates", "The project team, by name and role"]
    },
    // 05 Finished work. Spreads on a twelve-column sheet: [plate, first column, last column, vertical place].
    finished: [
      [["02", 1, 8, "start"], ["04", 10, 12, "end"]],
      [["05", 1, 4, "start"], ["03", 6, 12, "end"]],
      [["06", 1, 7, "end"], ["01", 9, 12, "start"]]
    ],
    // 06 Particulars: verified items only. `source` is shown in the review notes, not the public table.
    particulars: [
      ["Building", "A house built in 1940", "Confirmed by Cole, 13 Nov 2026; What Now Atlanta, 4 Nov 2026"],
      ["Use", "Restaurant and bar", "Freeman’s published record"],
      ["Record", "6 photographs, 5 record drawings", "This page"]
    ],
    // Review notes: what is missing before this could be published. Not part of the public page.
    missing: [
      ["Drawings", "Architect’s plan, elevations and sections, and permission to redraw them. Any structural or MEP sheets Freeman may show."],
      ["Construction", "Dated site photographs. None are on file; the Construction state of every key is reserved."],
      ["Scope", "What Freeman kept, replaced and built: structure, openings, floors, trim, services, kitchen, porch."],
      ["Credits", "BLUR Workshop’s role on Decatur (interiors only, or architect as well). The photographer’s name and permission for crops."],
      ["Facts", "Start and handover dates, floor area, seat count, delivery method, Freeman’s project team."],
      ["Photographs", "Confirmation that the door plate is Muchacho Decatur. Originals above 2400 px for full-width plates. Plan-view or wide interior frames."],
      ["Approval", "The account is new writing and has not been approved. The record drawings need a check against the building."]
    ]
  };
})();
