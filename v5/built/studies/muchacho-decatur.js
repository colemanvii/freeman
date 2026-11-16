/* The Built Record — Muchacho Decatur. A house: met from the street, entered, looked at closely.
   Five leaves. Outside is set on white, inside on a dark ground, so entering is a change of light.

   ACCOUNT. Freeman's text of 13 Nov 2026, one sentence per entry. AWAITING APPROVAL.
     1  "built in 1940": What Now Atlanta, 4 Nov 2026 ("renovated 1940 Craftsman bungalow"); confirmed by Cole, 13 Nov 2026.
     2  what the porch photographs show; street number visible on the door.
     3–5 a description of the kind of work; it claims nothing specific about this job.
     6  credits as published by Freeman (/project-credits.js).
   PARTICULARS. "Opened November 2026": What Now Atlanta, 4 Nov 2026 ("scheduled to open" 6 Nov);
     Rough Draft Atlanta, 5 Nov 2026 ("opens in Decatur tomorrow").
   PHOTOGRAPHS. Freeman Photographs set, uploaded 7 Nov 2026. Photographer not on file.
     Captions and crop names say what is visible and nothing about who designed or made it.
   DRAWINGS, CONSTRUCTION RECORD. None on file. Nothing here stands in for them. */
window.FREEMAN_BUILT = window.FREEMAN_BUILT || {};
window.FREEMAN_BUILT["muchacho-decatur"] = {
  account: [
    "Muchacho Decatur is a restaurant made inside a house built in 1940.",
    "The porch, the dormer and the lattice windows are the first things a guest meets at 129 Church Street.",
    "The bar and the dining rooms sit within the rooms behind them.",
    "Work of this kind is governed by what is already there.",
    "New openings, services and finishes have to meet existing walls, floors and trim, and the measure of the work is how little of that meeting shows.",
    "Freeman General Contracting was the builder, for Electric Hospitality, with interior design by BLUR Workshop."
  ],
  plates: {
    "01": { src: "assets/projects/muchacho-decatur-01.jpg", caption: "Front porch, Church Street",
      alt: "The front of Muchacho Decatur by day: a white house with a grey shingle roof and a dormer of lattice windows. The Muchacho sign hangs over a yellow glazed door numbered 129, between lattice-paned windows, behind a white porch rail under a magnolia branch." },
    "02": { src: "assets/projects/muchacho-decatur-10.jpg", caption: "The door open, evening",
      alt: "The same porch in the evening with the yellow door standing open, lamps lit inside, string lights along the eave and guests on the porch and steps." },
    "03": { src: "assets/projects/muchacho-decatur-04.jpg", caption: "Bar",
      alt: "Behind the bar: a timber counter with bottles and taps, a square timber-lined opening in the wall through which two guests are seen talking, a painted post, and warm light on cream walls." },
    "04": { src: "assets/projects/muchacho-decatur-02.jpg", caption: "Front room",
      alt: "A front room in use: cream walls and ceiling, a pair of tall lattice-paned windows in a wide painted casing, a framed photograph above them, a globe wall light, and guests at the counter in the foreground." },
    "05": { src: "assets/projects/muchacho-decatur-06.jpg", caption: "Cased opening",
      alt: "A doorway with a painted moulded casing and a parted bead curtain, lit from within. Above it hangs a framed photograph of a motocross rider and a wall speaker." },
    "06": { src: "assets/projects/muchacho-decatur-05.jpg", caption: "Door",
      alt: "A cream-painted panelled door, close up, with the letters W.C. painted in red on its middle panel." },
    "07": { src: "assets/projects/muchacho-decatur-09.jpg", caption: "Wall light",
      alt: "A small framed picture above an orange glass wall light on a plain cream wall." },
    "08": { src: "assets/projects/muchacho-decatur-07.jpg", caption: "Sideboard",
      alt: "An orange motorcycle helmet, a reel-to-reel tape recorder and a twin-shade lamp on a timber sideboard against an orange wall." }
  },
  leaves: [
    { type: "cover", plate: "01" },
    { type: "plate", title: "The front", plate: "02", side: "left", lead: 1, passage: 2 },
    { type: "plate", title: "Inside", plate: "03", side: "band", ground: "dark", focus: [50, 58], passage: 3 },
    { type: "typology", title: "In the walls", ground: "dark", lead: 4, passage: 5,
      items: [
        { plate: "04", name: "Window", view: [770, 960, 880, 880] },
        { plate: "05", name: "Doorway", view: [480, 560, 1360, 1360] },
        { plate: "06", name: "Door", view: [300, 60, 1800, 1800] },
        { plate: "07", name: "Wall light", view: [400, 744, 1200, 1200] }
      ] },
    { type: "colophon", title: "Record", lead: 6, plates: true, next: "barnsley-resort",
      particulars: [["Building", "A house, built 1940"], ["Opened", "November 2026"]] }
  ]
};
