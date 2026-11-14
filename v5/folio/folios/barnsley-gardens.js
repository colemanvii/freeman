/* Freeman Folio — Barnsley Family Pool. Three photographs and Freeman's published account.
   A landscape project: no cover portrait, the account set against the widest view.
   The account is Freeman's published text, word for word, including its first sentence as published.
   Facts are never restated here (see folios/muchacho-decatur.js for the sources). */
window.FREEMAN_FOLIOS = window.FREEMAN_FOLIOS || {};
window.FREEMAN_FOLIOS["barnsley-gardens"] = {
  plates: {
    "01": { src: "assets/project-2.jpg", caption: "Pool and pavilion", alt: "A curved pool edged in pale stone, with a lawn, a row of green and white umbrellas and a long gabled pavilion with a cupola behind, under a clear sky." },
    "02": { src: "assets/projects/barnsley-gardens-2.jpg", caption: "Counter opening", alt: "A wide opening with a stone counter in a white wall, framed in timber, with a kitchen in shadow behind and timber rafters above." },
    "03": { src: "assets/projects/barnsley-gardens-3.jpg", caption: "Umbrellas", alt: "Green and white umbrellas seen from below against the sun and a clear blue sky." }
  },
  leaves: [
    { type: "cover", plate: "01" },
    { type: "text", title: "Respect for place", passage: 1, place: true },
    { type: "plate", title: "Counter opening", plate: "02", side: "right", passage: 2 },
    { type: "plate", title: "Umbrellas", plate: "03", side: "band", focus: [50, 50] },
    { type: "colophon", title: "Particulars", passage: 3, next: "muchacho-decatur" }
  ]
};
