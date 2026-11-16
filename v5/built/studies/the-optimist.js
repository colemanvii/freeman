/* The Built Record — The Optimist, Oyster Bar. A job against a clock. Four leaves, short and mostly dark;
   the schedule is the protagonist and is set as type, because no photograph on file shows the work itself.

   ACCOUNT. Sentences 1–3 restate Freeman's published record (/records.js) in plain words. AWAITING APPROVAL.
     1  "refresh the Oyster Bar": Freeman's published record. "2024": Chuck Marie Studio, design/optimistoysterbar (year open 2024).
     2  "a tight deadline of 3 weeks": Freeman's published record.
     3  "finished on time and under budget": Freeman's published record.
     4  "about 1,300 square feet": Chuck Marie Studio, same page.
     5  credits as published by Freeman (/project-credits.js).
   THE WORK. The four items are Freeman's published list, word for word apart from capitals.
   PHOTOGRAPHS. Three, by Jared Swafford. They show the restaurant. None has been matched to the Oyster Bar,
     so captions say only what is visible and the record leaf says so in plain words.
   OPEN. See studio/built-record-002/REGISTER.md: the dates of the three weeks, photographs of the radius
     window, the oven tile, the millwork and the stainless steel, and Chuck Marie Studio's own photographs. */
window.FREEMAN_BUILT = window.FREEMAN_BUILT || {};
window.FREEMAN_BUILT["the-optimist"] = {
  account: [
    "In 2024 Freeman refreshed the Oyster Bar at The Optimist, the Rocket Farm restaurant on Howell Mill Road in Atlanta.",
    "The schedule was three weeks.",
    "Freeman finished on time and under budget.",
    "The room is about 1,300 square feet.",
    "Freeman General Contracting was the builder, for Rocket Farm Restaurants, with interior design by Chuck Marie Studio."
  ],
  plates: {
    "01": { src: "assets/projects/the-optimist-1.jpg", caption: "A table, afternoon",
      alt: "A round marble-topped table set with a plate, a book and a glass, in a shaft of sunlight, with striped banquette cushions behind and a red chair in shadow in front." },
    "02": { src: "assets/projects/the-optimist-2.jpg", caption: "Lit cabinet",
      alt: "A lit timber cabinet of small panes holding plates and shellfish on ice against a dark brick wall, with a carved red fish mounted above it and flowers on the counter." },
    "03": { src: "assets/project-1.jpg", caption: "Patio, Howell Mill Road",
      alt: "A low dark building with a long open front, a lawn with tables and guests, string lights and trees in autumn colour." }
  },
  leaves: [
    { type: "cover", plate: "01", ground: "dark" },
    { type: "statement", title: "Three weeks", ground: "dark", figure: "Three weeks.", lead: 1, passage: [3, 4],
      listTitle: "The work", list: ["Custom radius window", "Radius tile around the oven", "Custom millwork", "Custom stainless steel"],
      source: "Scope and schedule as published by Freeman General Contracting" },
    { type: "plate", title: "Lit cabinet", plate: "02", side: "band", ground: "dark", focus: [50, 46] },
    { type: "colophon", title: "Record", lead: 5,
      passage: "The photographs show the restaurant. The Oyster Bar itself has not yet been photographed for this record.",
      particulars: [["Scope", "Oyster Bar refresh"], ["Completed", "2024"], ["Schedule", "Three weeks"], ["Area", "About 1,300 sq ft"]] }
  ]
};
