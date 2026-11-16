/* Freeman case study — The Optimist, Oyster Bar. A job against a clock. Four slides.
   No photograph on file shows the work itself, so the passage about the job stands beside the one
   photograph that is plainly the whole restaurant, and the record slide says what the photographs are.

   ACCOUNT. Sentences 1–4 restate Freeman's published record (/records.js) in plain words. AWAITING APPROVAL.
     1  "refresh the Oyster Bar": Freeman's published record. "2024": Chuck Marie Studio, design/optimistoysterbar (year open 2024).
     2  "a tight deadline of 3 weeks", "finished on time and under budget": Freeman's published record.
     3  Freeman's published list of the work, word for word apart from the sentence around it.
     4  credits as published by Freeman (/project-credits.js).
   PARTICULARS. "About 1,300 sq ft": Chuck Marie Studio, same page.
   PHOTOGRAPHS. Three, by Jared Swafford. They show the restaurant. None has been matched to the Oyster Bar,
     so captions say only what is visible.
   OPEN. See studio/built-record-002/REGISTER.md: the dates of the three weeks, photographs of the radius
     window, the oven tile, the millwork and the stainless steel, and Chuck Marie Studio's own photographs. */
window.FREEMAN_BUILT = window.FREEMAN_BUILT || {};
window.FREEMAN_BUILT["the-optimist"] = {
  account: [
    "In 2024 Freeman refreshed the Oyster Bar at The Optimist, the Rocket Farm restaurant on Howell Mill Road in Atlanta.",
    "The schedule was three weeks. Freeman finished on time and under budget.",
    "The work: a custom radius window, radius tile around the oven, custom millwork and custom stainless steel.",
    "Freeman General Contracting was the builder, for Rocket Farm Restaurants, with interior design by Chuck Marie Studio."
  ],
  plates: {
    "01": { src: "assets/projects/the-optimist-1.jpg", caption: "A table, afternoon",
      alt: "A round marble-topped table set with a plate, a book and a glass, in a shaft of sunlight, with striped banquette cushions behind and a red chair in shadow in front." },
    "02": { src: "assets/project-1.jpg", caption: "The Optimist, Howell Mill Road",
      alt: "A low dark building with a long open front, a lawn with tables and guests, string lights and trees in autumn colour." },
    "03": { src: "assets/projects/the-optimist-2.jpg", caption: "Lit cabinet",
      alt: "A lit timber cabinet of small panes holding hats and shirts against a dark brick wall, with a carved red fish mounted above it and flowers on the counter." }
  },
  leaves: [
    { type: "cover", plate: "01" },
    { type: "plate", plate: "02", lead: 1, passage: [2, 3] },
    { type: "plate", plate: "03" },
    { type: "colophon", title: "Record", lead: 4,
      passage: "The photographs show the restaurant. The Oyster Bar itself has not yet been photographed for this record.",
      particulars: [["Scope", "Oyster Bar refresh"], ["Completed", "2024"], ["Schedule", "Three weeks"], ["Area", "About 1,300 sq ft"]] }
  ]
};
