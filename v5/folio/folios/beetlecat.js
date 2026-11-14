/* Freeman Folio — Beetlecat. Four photographs and Freeman's published account; no drawings on file.
   The same system as Muchacho Decatur, composed differently: Beetlecat is a room, not a house, so it
   opens wide, gives its dining room the full band, and reads its counter closely.
   Facts are never restated here (see folios/muchacho-decatur.js for the sources). */
window.FREEMAN_FOLIOS = window.FREEMAN_FOLIOS || {};
window.FREEMAN_FOLIOS.beetlecat = {
  plates: {
    "01": { src: "assets/project-0.jpg", caption: "Bar",
      alt: "The bar at Beetlecat: yellow stools on chrome bases along a curved, lit bar; red and black plaid carpet; wave-patterned glass screens on brass posts; timber walls and ceiling." },
    "02": { src: "assets/projects/beetlecat-interior-2.jpg", caption: "Counter, glass screen and door",
      alt: "A yellow door with three rounded diagonal openings beside yellow-framed windows. In front, a red ribbed counter front carries a wave-patterned glass screen on a brass post. Plaid carpet, timber ceiling." },
    "03": { src: "assets/projects/beetlecat-3.jpg", caption: "Dining room",
      alt: "Dining room: tables with white tablecloths before a channel-tufted red banquette, wave-patterned glass screens, globe chandeliers, and yellow-framed windows along a timber-lined wall." },
    "04": { src: "assets/projects/beetlecat-1.jpg", caption: "Detail",
      alt: "Detail: a model sailboat with a yellow hull, a blue and white bowl and a model schooner in a glass case, on a ledge against a walnut wall." }
  },
  leaves: [
    { type: "cover", plate: "01" },
    { type: "text", title: "Precision and personality", passage: 1, place: true },
    { type: "plate", title: "Dining room", plate: "03", side: "band", focus: [50, 55] },
    { type: "plate", title: "Counter", plate: "02", side: "left", passage: 2 },
    { type: "text", title: "Linger", passage: 3, plate: "04" },
    { type: "colophon", title: "Particulars", next: "barnsley-gardens" }
  ]
};
