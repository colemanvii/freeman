/* The Built Record — Beetlecat. A record with photographs and Freeman's published account only:
   no drawings, no construction record. The same renderer makes a complete page from what exists;
   the sections with no material are simply absent. Captions say what is visible and nothing more. */
window.BUILT_RECORDS = window.BUILT_RECORDS || {};
window.BUILT_RECORDS.beetlecat = {
  study: "001",
  plates: {
    "01": { src: "assets/project-0.jpg", caption: "Bar", alt: "The bar at Beetlecat: yellow stools on chrome bases along a curved, lit bar; red and black plaid carpet; wave-patterned glass screens on brass posts; timber walls and ceiling." },
    "02": { src: "assets/projects/beetlecat-interior-2.jpg", caption: "Counter, glass screen and door", alt: "A yellow door with three rounded diagonal openings beside yellow-framed windows. In front, a red ribbed counter front carries a wave-patterned glass screen on a brass post. Plaid carpet, timber ceiling." },
    "03": { src: "assets/projects/beetlecat-3.jpg", caption: "Dining room", alt: "Dining room: tables with white tablecloths before a channel-tufted red banquette, wave-patterned glass screens, globe chandeliers, and yellow-framed windows along a timber-lined wall." },
    "04": { src: "assets/projects/beetlecat-1.jpg", caption: "Detail", alt: "Detail: a model sailboat with a yellow hull, a blue and white bowl and a model schooner in a glass case, on a ledge against a walnut wall." }
  },
  opening: { plate: "01" },
  finished: [
    [["03", 1, 8, "start"], ["02", 10, 12, "end"]],
    [["04", 5, 10, "start"]]
  ],
  missing: [
    ["Drawings", "None on file. With the architect’s plan this record gains an Architectural record section; nothing else changes."],
    ["Construction", "None on file."],
    ["Facts", "Completion year, floor area, design credit, scope."]
  ]
};
