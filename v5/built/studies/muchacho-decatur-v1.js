/* PRESERVED FOR COMPARISON (round 2, approved system, 16 Nov 2026). Opens at /project-muchacho-decatur?edition=1.
   Freeman case study — Muchacho Decatur. Seven slides: met from the street, entered, looked at closely.
   Three compositions only: the opening, a photograph alone, a photograph with a short passage.

   ACCOUNT. Freeman's text of 13 Nov 2026, one sentence per entry. AWAITING APPROVAL.
     1  "built in 1940": What Now Atlanta, 4 Nov 2026 ("renovated 1940 Craftsman bungalow"); confirmed by Cole, 13 Nov 2026.
     2  what the porch photographs show; street number visible on the door.
     3–5 a description of the kind of work; it claims nothing specific about this job.
     6  credits as published by Freeman (/project-credits.js).
   PARTICULARS. "Opened November 2026": What Now Atlanta, 4 Nov 2026 ("scheduled to open" 6 Nov);
     Rough Draft Atlanta, 5 Nov 2026 ("opens in Decatur tomorrow").
   PHOTOGRAPHS. Freeman Photographs set, uploaded 7 Nov 2026. Photographer not on file.
     Captions say what is visible and nothing about who designed or made it.
   DRAWINGS, CONSTRUCTION RECORD. None on file. Nothing here stands in for them. */
window.FREEMAN_BUILT = window.FREEMAN_BUILT || {};
window.FREEMAN_BUILT["muchacho-decatur-v1"] = {
  record: "muchacho-decatur",
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
    "03": { src: "assets/projects/muchacho-decatur-02.jpg", caption: "Front room",
      alt: "A front room in use: cream walls and ceiling, a pair of tall lattice-paned windows in a wide painted casing, a framed photograph above them, a globe wall light, and guests at the counter in the foreground." },
    "04": { src: "assets/projects/muchacho-decatur-04.jpg", caption: "Bar",
      alt: "Behind the bar: a timber counter with bottles and taps, a square timber-lined opening in the wall through which two guests are seen talking, a painted post, and warm light on cream walls." },
    "05": { src: "assets/projects/muchacho-decatur-06.jpg", caption: "Cased opening",
      alt: "A doorway with a painted moulded casing and a parted bead curtain, lit from within. Above it hangs a framed photograph of a motocross rider and a wall speaker." },
    "06": { src: "assets/projects/muchacho-decatur-09.jpg", caption: "Wall light",
      alt: "A small framed picture above an orange glass wall light on a plain cream wall." }
  },
  leaves: [
    { type: "cover", plate: "01" },
    { type: "plate", plate: "02", lead: 1, passage: 2 },
    { type: "plate", plate: "03" },
    { type: "plate", plate: "04", lead: 3 },
    { type: "plate", plate: "05", lead: 4, passage: 5 },
    { type: "plate", plate: "06" },
    { type: "colophon", title: "Record", lead: 6,
      particulars: [["Building", "A house, built 1940"], ["Opened", "November 2026"]] }
  ]
};
