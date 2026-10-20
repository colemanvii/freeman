/* ETCETERA 005 — Beetlecat, an editorial snapshot. One page: five figures, one short commentary,
   restrained identification. snapshot.js composes it; the three studies share this content exactly.

   Evidence rules. Facts come from production records.js (Freeman's published project record).
   OBSERVED says only what is visible in these photographs, and attributes none of it to a party.
   READING is our interpretation and is labelled as such. Construction is Freeman's own published
   statement; nothing on file shows it. No design credit is published, so none is given. */
(() => {
  "use strict";
  window.SNAPSHOT = {
    object: "005",
    name: "Beetlecat",
    location: "Atlanta, Georgia",
    type: "Hospitality",
    gallery: "project-beetlecat.html",

    // Figures, numbered as the commentary cites them. Photographs are production's own files;
    // 4 and 5 are crops of 1 and 2, unaltered except for cropping (source pixels in the README).
    figures: [
      { n: 1, src: "/assets/projects/beetlecat-interior-2.jpg", w: 1440, h: 1920,
        alt: "A yellow door with three rounded diagonal openings beside yellow-framed windows; in front, a red ribbed counter front with a wave-patterned glass screen on brass posts; plaid carpet." },
      { n: 2, src: "/assets/projects/beetlecat-3.jpg", w: 1920, h: 1281,
        alt: "Dining room with white tablecloths before a channel-tufted red banquette, wave-patterned glass screens, globe chandeliers and yellow-framed windows along a timber-lined wall." },
      { n: 3, src: "/assets/project-0.jpg", w: 1920, h: 1370,
        alt: "Bar: yellow stools on chrome bases along a curved, lit bar; red-and-black plaid carpet; wave-patterned glass screens on brass posts; timber walls and ceiling." },
      { n: 4, src: "/etcetera/snapshot-001/details/door.jpg", w: 340, h: 940, crop: 1,
        alt: "Detail: the yellow door, its three openings rounded at every corner." },
      { n: 5, src: "/etcetera/snapshot-001/details/window.jpg", w: 380, h: 860, crop: 2,
        alt: "Detail: yellow window frames with rounded corners, hinges and latches, set in timber." },
    ],

    headline: "Two colours, one curve.",
    // Visible in the figures cited. Nothing here says who designed or built any of it.
    observed:
      "Red runs through the carpet, the ribbed counter fronts and the banquette. Yellow returns in the window frames, the door and the stools. One rounded line recurs at every scale: window corners, the door’s openings, the waves on the glass, the end of the bar.",
    // Interpretation, labelled as ours.
    reading: "A few decisions, repeated without exception, make the room whole.",

    // [role, name, note]. Construction is stated by Freeman, not shown; design is not credited.
    credits: [
      ["Client", "Rocket Farm Restaurants"],
      ["Photography", "Jared Swafford"],
      ["Construction", "Freeman GC", "As stated in Freeman’s published record"],
      ["Design", "Not credited"],
    ],
    key: "Observed: visible in 1–5; 4 and 5 are crops of 1 and 2. Reading: our interpretation.",
  };
})();
