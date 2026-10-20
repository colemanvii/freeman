/* Project Monograph 001 — Beetlecat. The content of one monograph; monograph.js composes the plates.
   Nothing here is invented. Facts come from production records.js (Freeman's published project
   record). Captions describe only what is visible in a photograph and attribute nothing in it to a
   party. Details are crops of the credited photographs, unaltered except for cropping.
   Every statement carries one status: credited, stated (Freeman's own published account, with
   nothing on file to show it), or absent (not on file; never filled in). */
(() => {
  "use strict";
  window.MONOGRAPH = {
    number: "001",
    slug: "beetlecat",
    // Production's own index line for the project: P—01 / Hospitality.
    id: "01",
    name: "Beetlecat",
    location: "Atlanta, Georgia",
    type: "Hospitality",
    gallery: "project-beetlecat.html",
    // ETCETERA lists the monograph as its fifth object.
    etcetera: { object: "005" },

    // Verbatim, as published in the project record. Quoted, never rewritten.
    account:
      "Designed as a warm, layered hospitality space, Beetlecat required a balance of precision and personality. Freeman GC led construction with a focus on collaboration, sequencing, and detail—bringing together materials, systems, and finishes in a way that feels cohesive and lived-in. The result is a space that enhances the rhythm of service while inviting guests to linger.",
    accountSource: "Freeman’s published project record, freemangc.com",

    // [role, value, status]
    record: [
      ["Construction", "Freeman GC", "stated"],
      ["Client", "Rocket Farm Restaurants", "credited"],
      ["Photography", "Jared Swafford", "credited"],
      ["Design", "No design credit is published", "absent"],
      ["Completed", "No date on file", "absent"],
      ["Field record", "No construction photographs, drawings or dated records on file", "absent"],
    ],

    // Photographs: production's own files. n is the position in the production gallery
    // (project-beetlecat), so the monograph and the gallery cite the same object.
    plates: {
      threshold: { src: "/assets/projects/beetlecat-interior-2.jpg", w: 1440, h: 1920, n: 3, title: "The threshold",
        alt: "A yellow door with three rounded diagonal openings beside yellow-framed windows; in front, a red ribbed counter front with a wave-patterned glass screen on brass posts; plaid carpet and a slatted timber ceiling." },
      bar: { src: "/assets/project-0.jpg", w: 1920, h: 1370, n: 1, title: "The bar",
        alt: "Restaurant bar: yellow stools on chrome bases along a curved, lit bar, red-and-black plaid carpet, wave-patterned glass screens on brass posts, timber-lined walls and a slatted timber ceiling." },
      room: { src: "/assets/projects/beetlecat-3.jpg", w: 1920, h: 1281, n: 4, title: "The dining room",
        alt: "Dining room with white tablecloths and bentwood chairs before a channel-tufted red banquette, wave-patterned glass screens, branching globe chandeliers and yellow-framed windows along a timber-lined wall." },
    },

    // Crops of the plates above, in the order plate 04 shows them. from: plate key.
    // x, y, w, h: the crop in source pixels (see studio/project-monograph-001/INVENTORY.md).
    details: [
      { id: "01", src: "/etcetera/monograph-001/details/d03-door.jpg", w: 340, h: 940, from: "threshold",
        caption: "Yellow door, rounded openings", alt: "Detail: a yellow door with three rounded diagonal openings, a dark kick plate and an exit sign." },
      { id: "02", src: "/etcetera/monograph-001/details/d02-front.jpg", w: 840, h: 660, from: "threshold",
        caption: "Red ribbed counter front", alt: "Detail: a counter front faced in narrow vertical red and orange ribs." },
      { id: "03", src: "/etcetera/monograph-001/details/d06-window.jpg", w: 380, h: 860, from: "room",
        caption: "Yellow window frames", alt: "Detail: yellow-painted window frames with rounded corners, hinges and latches, set in timber." },
      { id: "04", src: "/etcetera/monograph-001/details/d05-stools.jpg", w: 560, h: 620, from: "bar",
        caption: "Stools, brass foot rail", alt: "Detail: yellow upholstered stools on chrome bases, a brass foot rail and a lit, ribbed bar front." },
      { id: "05", src: "/etcetera/monograph-001/details/d04-carpet.jpg", w: 600, h: 500, from: "threshold",
        caption: "Red-and-black plaid carpet", alt: "Detail: red and black plaid carpet meeting a timber wall." },
    ],
    // Phones: the same five crops in two rows.
    detailRowsPhone: [["01", "03", "04"], ["02", "05"]],

    // What would turn the stated claim into evidence. Requests, not descriptions.
    awaiting: [
      "Dated field photographs from the build",
      "Start and handover dates",
      "Drawings for the counter fronts, screens and door",
      "A statement from Rocket Farm Restaurants",
    ],

    next: { id: "02", name: "The Optimist", href: "project-the-optimist.html" },
  };
})();
