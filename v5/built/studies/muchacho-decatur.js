/* Freeman case study — Muchacho Decatur. Edition 2: the authored treatment (16 Nov 2026).
   The round 2 version is preserved in muchacho-decatur-v1.js and opens at ?edition=1.

   SEVEN SLIDES, AND WHY.
   1  The door, by day. It is the photograph the visitor has just chosen in the overview; it grows into
      place here. The name, and the one sentence that says what the building is.
   2  The same door, open, in the evening. Cropped to stand exactly where the first photograph stood, so
      the turn from 1 to 2 is the door opening and the lamps coming on. The passage points inside.
   3  Inside. The bar, alone, at the largest size the slide allows. No words: the photograph has them.
   4  The idea of the job, set large, with one small photograph of the plainest thing in the house:
      an old panelled door with new lettering.
   5  A wall light on a plain wall, beside the sentence about how little of the work should show.
   6  The construction record. Seven chapters, named and numbered, none yet recorded. They are to be set
      down from interviews with Mac Thompson and the project team; until then the slide lists them and
      says so. When a chapter gains `body` text it leaves this list and becomes a slide of its own
      ({ type: "chapter", n }), with a photograph or drawing if it has one (`plate`).
   7  The credits, the particulars, and the way back.
   LEFT OUT, DELIBERATELY. The front room (security cameras, a vent, heads cut by the frame), the cased
   opening (a loudspeaker dominates it) and the sideboard (furnishings, not building). All three remain
   in the project overview on the map.

   ACCOUNT. Freeman's text of 13 Nov 2026. AWAITING APPROVAL. Sources as in muchacho-decatur-v1.js.
   PHOTOGRAPHS. Freeman Photographs set, uploaded 7 Nov 2026. Photographer not on file. Plate 02 is cropped
   (84% of the frame) to register with plate 01. Captions say what is visible and nothing more. */
window.FREEMAN_BUILT = window.FREEMAN_BUILT || {};
window.FREEMAN_BUILT["muchacho-decatur"] = {
  edition: 2,
  account: [
    "A restaurant made inside a house built in 1940.",
    "The porch, the dormer and the lattice windows are the first things a guest meets at 129 Church Street.",
    "The bar and the dining rooms sit within the rooms behind them.",
    "Work of this kind is governed by what is already there.",
    "New openings, services and finishes have to meet existing walls, floors and trim. The measure of the work is how little of that meeting shows.",
    "Freeman General Contracting was the builder, for Electric Hospitality, with interior design by BLUR Workshop."
  ],
  // THE CONSTRUCTION RECORD. Fill `body` (a string or an array of paragraphs) only from an interview or a
  // document, and note the source: `source: "Mac Thompson, superintendent, 2 Dec 2026"`. Optional `plate`.
  chapters: [
    { title: "Design intent and scope" },
    { title: "The house and its constraints" },
    { title: "Challenges and unforeseen conditions" },
    { title: "Decisions made in the field" },
    { title: "Materials, detailing and craftsmanship" },
    { title: "Architect, owner, trades and Freeman" },
    { title: "Lessons, and the finished result" }
  ],
  plates: {
    "01": { src: "assets/projects/muchacho-decatur-01.jpg", caption: "Church Street, by day",
      alt: "The front of Muchacho Decatur by day: a white house with a grey shingle roof and a dormer of lattice windows. The Muchacho sign hangs over a closed yellow glazed door numbered 129, between lattice-paned windows, behind a white porch rail under a magnolia branch." },
    "02": { src: "assets/projects/muchacho-decatur-10.jpg", caption: "The same door, evening", view: [123, 217, 1613, 2016],
      alt: "The same porch in the evening from the same place. The yellow door stands open, the rooms inside glow orange, string lights are lit along the eave and guests are on the porch." },
    "03": { src: "assets/projects/muchacho-decatur-04.jpg", caption: "The bar",
      alt: "Behind the bar: a timber counter with bottles and taps, a square timber-lined opening in the wall through which two guests are seen talking, a painted post, and warm light on cream walls." },
    "04": { src: "assets/projects/muchacho-decatur-05.jpg", caption: "Door",
      alt: "A cream-painted panelled door, close up, with the letters W.C. painted in red on its middle panel." },
    "05": { src: "assets/projects/muchacho-decatur-09.jpg", caption: "Wall light",
      alt: "A small framed picture above an orange glass wall light on a plain cream wall." }
  },
  leaves: [
    { type: "title", plate: "01", lead: 1 },
    { type: "plate", layout: "hold", plate: "02", lead: 2, passage: 3,
      // where the three things the sentence names stand on the photograph, as a percentage of its height
      levels: [[19, "Dormer"], [61, "Lattice windows"], [84, "Porch"]] },
    { type: "plate", plate: "03" },
    { type: "say", lead: 4, plate: "04" },
    { type: "plate", layout: "hold", plate: "05", lead: 5 },
    { type: "chapters", title: "Construction record", lead: "How it was built is still to be set down.",
      note: "The construction record / in preparation with the project team" },
    { type: "colophon", title: "Record", lead: 6,
      particulars: [["Building", "A house, built 1940"], ["Opened", "November 2026"]] }
  ]
};
