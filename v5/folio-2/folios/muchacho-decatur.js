/* Freeman Folio, second iteration — Muchacho Decatur.

   Five leaves. Outside is set on white; inside is set on a dark ground, so entering the house is a
   change of light. The four interior photographs are shown once as a single plate of openings,
   each cropped to its casing; every photograph can still be seen whole from the last leaf.

   This file composes; it states no facts:
     name, number, type, account   /records.js            (Freeman's published record)
     partners, roles, links        /project-credits.js    (verified credits)
     address, area, position       /record-assets/sites.js
     photograph sizes              /record-assets/photos.js (generated)

   ACCOUNT. Runs through the leaves word for word. 1 = first sentence; [2, 1] = second sentence, first clause.
   PHOTOGRAPHS. Freeman Photographs Drive folder, uploaded 7 Nov 2026. Photographer not on file.
   Captions, details and crop names say what is visible and nothing about who designed or made it.
   `view` and `details[].view` are regions of a photograph in its own pixels: [x, y, width, height].
   DRAWINGS, CONSTRUCTION RECORD. None on file. Nothing here stands in for them. */
window.FREEMAN_FOLIOS = window.FREEMAN_FOLIOS || {};
window.FREEMAN_FOLIOS["muchacho-decatur"] = {
  plates: {
    "01": { src: "assets/projects/muchacho-decatur-01.jpg", caption: "Front porch, Church Street",
      alt: "The front of Muchacho Decatur: a white house with a grey shingle roof and a dormer of lattice windows. The Muchacho sign hangs over a yellow glazed door numbered 129, between lattice-paned windows, behind a white porch rail under a magnolia branch." },
    "02": { src: "assets/projects/muchacho-decatur-02.jpg", caption: "Front room",
      alt: "A front room in use: cream walls and ceiling, a pair of tall lattice-paned windows in a wide painted casing, a framed photograph of a wave above them, a globe wall light, and guests at the counter in the foreground." },
    "03": { src: "assets/projects/muchacho-decatur-04.jpg", caption: "Bar",
      alt: "Behind the bar: a timber counter with bottles and taps, a square timber-lined opening in the wall through which two guests are seen talking, a painted post, and warm light on cream walls." },
    "04": { src: "assets/projects/muchacho-decatur-06.jpg", caption: "Cased opening",
      alt: "A doorway with a painted moulded casing and a parted bead curtain, lit from within. Above it hangs a framed photograph of a motocross rider and a wall speaker." },
    "05": { src: "assets/projects/muchacho-decatur-05.jpg", caption: "Door",
      alt: "A cream-painted panelled door, close up, with the letters W.C. painted in red on its middle panel." },
    "06": { src: "assets/projects/muchacho-decatur-07.jpg", caption: "Sideboard",
      alt: "An orange motorcycle helmet, a reel-to-reel tape recorder and a twin-shade lamp on a timber sideboard against an orange wall." }
  },
  leaves: [
    { type: "cover", plate: "01" },

    { type: "plate", title: "The front", plate: "01", side: "left", lead: 1, passage: [2, 1],
      details: [
        { name: "Dormer", view: [300, 60, 1300, 560], note: "A band of lattice sashes above the porch roof. Three are clear of the magnolia." },
        { name: "Eave and porch beam", view: [0, 690, 1920, 400], note: "The roof edge, the fascia and the beam that carries the porch, running the width of the front." },
        { name: "Sign", view: [500, 1020, 1000, 290], note: "A board hung from the porch beam on two hangers, centred on the door." },
        { name: "Entrance", view: [700, 1270, 600, 1010], note: "A glazed door in its frame, numbered 129, with a fixed light on either side." },
        { name: "Lattice window", view: [20, 1270, 450, 600], note: "One of the two windows on the canted sides of the bay. Diamond bars in the upper sash, clear glass below." },
        { name: "Porch rail and steps", view: [480, 1730, 1010, 670], note: "Square balusters between top and bottom rails, with capped newels at the head and foot of the steps." }
      ] },

    { type: "plate", title: "Inside", plate: "03", side: "band", ground: "dark", focus: [50, 58], passage: [2, 2] },

    { type: "typology", title: "Openings", ground: "dark", lead: 3, passage: 4,
      items: [
        { plate: "02", name: "Window", view: [770, 960, 880, 880] },
        { plate: "03", name: "Opening", view: [770, 540, 880, 880] },
        { plate: "04", name: "Doorway", view: [480, 560, 1360, 1360] },
        { plate: "05", name: "Door", view: [300, 60, 1800, 1800] }
      ] },

    { type: "colophon", title: "Record", passage: 5, plates: true,
      // Source: What Now Atlanta, 4 Nov 2026 ("renovated 1940 Craftsman bungalow"); confirmed by Cole, 13 Nov 2026.
      particulars: [["Building", "A house, built 1940"]] }
  ]
};
