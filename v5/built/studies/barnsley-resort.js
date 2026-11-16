/* Freeman case study — Barnsley Resort. One estate where Freeman's record holds three works.
   Nine slides: the place, the pool, Woodlands, and Freeman on site in November 2026.

   This study belongs to three entries in /records.js (No. 03 Barnsley Family Pool, No. 15 Woodlands at
   Barnsley Resort, No. 16 Dugan's Pub). Each of their overviews offers it, and Back to project returns to
   whichever one the visitor came from. It carries its own `project`, `site` and `credits`.

   ACCOUNT. New text, 16 Nov 2026. AWAITING APPROVAL. Sources, sentence by sentence:
     1  "3,000 acres": Hotel Management Network, 21 Nov 2024; Simply Buckhead, 31 May 2018 ("the 3,000-acre estate").
        "begun in the 1840s": Historic Hotels of America, Barnsley Resort history (land found 1841).
     2  Freeman's published record: three projects at 597 Barnsley Gardens Rd, each credited to South Street Partners.
     3  what plates 04 and 05 show. Published by Freeman under No. 03, Barnsley Family Pool.
     4  "since 1999": Barnsley Resort blog, 1 Jul 2026.
     5  "renovated in 2026": same ("This summer, Woodlands is slated for a thoughtful renovation"); the finished
        room was photographed by 7 Nov 2026 (plate 06). Freeman named as collaborator: David Thompson Studio,
        works/woodlands-at-barnsley-resort. Dugan's Pub is the bar room of Woodlands: barnsleyresort.com/dine/woodlands.
     6  what plates 07 and 08 show; Freeman Photographs set, uploaded 7 Nov 2026.
     7  a count of the above.
   OPEN. The project the November sitework belongs to is not on file and is not named. The people in
     plate 08 are not named. See studio/built-record-002/REGISTER.md. */
window.FREEMAN_BUILT = window.FREEMAN_BUILT || {};
window.FREEMAN_BUILT["barnsley-resort"] = {
  records: ["barnsley-gardens", "woodlands-at-barnsley-resort", "dugans-pub"],
  project: { id: "03 · 15 · 16", name: "Barnsley Resort", type: "Hospitality", location: "Adairsville, Georgia" },
  site: { precision: "venue", lat: 34.29874, lon: -84.98641, address: "597 Barnsley Gardens Rd", area: "Adairsville, Georgia" },
  credits: [
    ["Ownership group", ["south-street"]],
    ["Interior design, Woodlands", ["david-thompson"]],
    ["Photography", [{ name: "Jared Swafford (01, 04, 05)" }, { name: "Freeman photographic archive" }]]
  ],
  account: [
    "Barnsley Resort stands on 3,000 acres at Adairsville, Georgia, around the brick ruin of a manor house begun in the 1840s.",
    "Freeman’s record holds three works here, all for the resort’s ownership: the family pool, Woodlands, and Dugan’s Pub.",
    "At the pool, the pavilion’s counter is one wide opening in a white wall, cased in timber under open rafters.",
    "Woodlands has been the resort’s restaurant since 1999.",
    "It was renovated in 2026 to interiors by David Thompson Studio, which names Freeman General Contracting as its collaborator. Dugan’s Pub is its bar room.",
    "In November 2026 Freeman was on the ground again: graded earth, machines, and a meeting at the table by the fire.",
    "One estate, one ownership, three works on Freeman’s record."
  ],
  plates: {
    "01": { src: "assets/project-2.jpg", caption: "Family pool and pavilion",
      alt: "A curved pool edged in pale stone, with a lawn, a row of green and white umbrellas and a long gabled pavilion with a cupola behind, under a clear sky." },
    "02": { src: "assets/projects/barnsley-resort-ruin.jpg", caption: "The manor ruin",
      alt: "The roofless brick ruin of a manor house with arched openings, seen up a flight of stone steps between clipped boxwoods. Two people are walking up to the arch." },
    "03": { src: "assets/projects/barnsley-resort-valley.jpg", caption: "The valley, November",
      alt: "A wooded ridge in autumn colour above open grass, under a pale evening sky." },
    "04": { src: "assets/projects/barnsley-gardens-2.jpg", caption: "Counter, pool pavilion",
      alt: "A wide opening with a stone counter in a white wall, framed in timber, with a kitchen in shadow behind and timber rafters above." },
    "05": { src: "assets/projects/barnsley-gardens-3.jpg", caption: "Umbrellas",
      alt: "Green and white umbrellas seen from below against the sun and a clear blue sky." },
    "06": { src: "assets/projects/woodlands-at-barnsley-01.jpg", caption: "Woodlands, dining room",
      alt: "A dining room with dark panelled wainscot, patterned wallpaper hung with framed pictures, a tall window and tables set with leather chairs." },
    "07": { src: "assets/projects/barnsley-resort-site-2.jpg", caption: "Sitework, November 2026",
      alt: "Graded gravel and red earth with excavators, a loader and an articulated truck parked in a row before a line of trees." },
    "08": { src: "assets/projects/barnsley-resort-table.jpg", caption: "At the table",
      alt: "Three men in work clothes sitting at a table in front of a tall stone fireplace in an open pavilion, with a long timber table in the foreground." }
  },
  leaves: [
    { type: "cover", plate: "01" },
    { type: "plate", plate: "02", lead: 1 },
    { type: "plate", plate: "03" },
    { type: "plate", plate: "04", label: "No. 03 / Barnsley Family Pool", lead: 2, passage: 3 },
    { type: "plate", plate: "05" },
    { type: "plate", plate: "06", label: "No. 15 / Woodlands · No. 16 / Dugan’s Pub", lead: 4, passage: 5 },
    { type: "plate", plate: "07", label: "November 2026", lead: 6 },
    { type: "plate", plate: "08" },
    { type: "colophon", title: "Record", lead: 7,
      works: [
        { no: "03", name: "Barnsley Family Pool", note: "Pool and pavilion" },
        { no: "15", name: "Woodlands at Barnsley Resort", note: "Restaurant renovation, 2026" },
        { no: "16", name: "Dugan’s Pub", note: "Bar room of Woodlands" }
      ],
      particulars: [["Estate", "3,000 acres"]] }
  ]
};
