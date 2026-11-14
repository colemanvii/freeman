/* Freeman Folio — Muchacho Decatur.

   A folio is an ordered set of leaves. Each leaf is one composed screen. This file decides the order,
   the composition of each leaf, and what a reader may look at closely. It states no facts:
     name, number, type, account   /records.js            (Freeman's published record)
     partners, roles, links        /project-credits.js    (verified credits)
     address, area, position       /record-assets/sites.js
     photograph sizes              /record-assets/photos.js (generated)

   ACCOUNT. The account in /records.js runs through the folio word for word. A leaf takes a passage by
   position: 1 = first sentence; [2, 1] = second sentence, first clause (clauses part at a semicolon).
   studio/case-study-system-002/check.mjs fails if the passages do not add up to the account.

   PHOTOGRAPHS. Freeman Photographs Drive folder, uploaded 7 Nov 2026. Photographer not on file.
   Captions and details say what is visible in the frame and nothing about who designed or made it.
   `details` are regions of the photograph in its own pixels: [x, y, width, height].

   DRAWINGS. None on file for this project, so the folio has no drawing leaf. See the README. */
window.FREEMAN_FOLIOS = window.FREEMAN_FOLIOS || {};
window.FREEMAN_FOLIOS["muchacho-decatur"] = {
  plates: {
    "01": { src: "assets/projects/muchacho-decatur-01.jpg", caption: "Front porch, Church Street",
      alt: "The front of Muchacho Decatur: a white house with a grey shingle roof and a dormer of lattice windows. The Muchacho sign hangs over a yellow glazed door numbered 129, between lattice-paned windows, behind a white porch rail under a magnolia branch." },
    "02": { src: "assets/projects/muchacho-decatur-02.jpg", caption: "Front room",
      alt: "A front room in use: cream walls and ceiling, a pair of tall lattice-paned windows in a wide painted casing, a framed photograph of a wave above them, a globe wall light, and guests at the counter in the foreground." },
    "03": { src: "assets/projects/muchacho-decatur-04.jpg", caption: "Bar",
      alt: "Behind the bar: a timber counter with bottles and taps, a square timber-lined opening in the wall through which two guests are seen talking, a painted post, and warm light on cream walls." },
    "04": { src: "assets/projects/muchacho-decatur-05.jpg", caption: "Door",
      alt: "A cream-painted panelled door, close up, with the letters W.C. painted in red on its middle panel." },
    "05": { src: "assets/projects/muchacho-decatur-06.jpg", caption: "Cased opening",
      alt: "A doorway with a painted moulded casing and a parted bead curtain, lit from within. Above it hangs a framed photograph of a motocross rider and a wall speaker." },
    "06": { src: "assets/projects/muchacho-decatur-07.jpg", caption: "Sideboard",
      alt: "An orange motorcycle helmet, a reel-to-reel tape recorder and a twin-shade lamp on a timber sideboard against an orange wall." }
  },
  leaves: [
    { type: "cover", plate: "01" },

    { type: "text", title: "A house", passage: 1, place: true },

    { type: "plate", title: "The front", plate: "01", side: "left", passage: [2, 1],
      details: [
        { name: "Dormer", view: [300, 60, 1300, 560], note: "A band of lattice sashes above the porch roof. Three are clear of the magnolia." },
        { name: "Eave and porch beam", view: [0, 690, 1920, 400], note: "The roof edge, the fascia and the beam that carries the porch, running the width of the front." },
        { name: "Sign", view: [500, 1020, 1000, 290], note: "A board hung from the porch beam on two hangers, centred on the door." },
        { name: "Entrance", view: [700, 1270, 600, 1010], note: "A glazed door in its frame, numbered 129, with a fixed light on either side." },
        { name: "Lattice window", view: [20, 1270, 450, 600], note: "One of the two windows on the canted sides of the bay. Diamond bars in the upper sash, clear glass below." },
        { name: "Porch rail and steps", view: [480, 1730, 1010, 670], note: "Square balusters between top and bottom rails, with capped newels at the head and foot of the steps." }
      ] },

    { type: "plate", title: "Front room", plate: "02", side: "right", passage: [2, 2],
      details: [
        { name: "Pair of sashes", view: [800, 1060, 840, 860], note: "Two tall lattice sashes in one wide painted casing with a capped head." },
        { name: "Ceiling line", view: [300, 200, 1800, 760], note: "Where the ceiling meets the window wall, with the supply register in the ceiling." }
      ] },

    { type: "plate", title: "Bar", plate: "03", side: "band", focus: [50, 60] },

    { type: "text", title: "What is already there", passage: 3, plate: "04" },

    { type: "plate", title: "Cased opening", plate: "05", side: "left", passage: 4,
      details: [
        { name: "Casing head", view: [480, 1180, 1440, 300], note: "A moulded casing with a capped head, painted." },
        { name: "Opening", view: [590, 1300, 1220, 620], note: "The doorway itself, lit from within, with a parted bead curtain." }
      ] },

    { type: "plate", title: "Sideboard", plate: "06", side: "centre" },

    { type: "colophon", title: "Particulars", passage: 5,
      // Source: What Now Atlanta, 4 Nov 2026 ("renovated 1940 Craftsman bungalow"); confirmed by Cole, 13 Nov 2026.
      particulars: [["Building", "A house, built 1940"]],
      next: "beetlecat" }
  ]
};
