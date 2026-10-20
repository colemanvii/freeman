/* Project Monograph 001 — Beetlecat. The content of one monograph; monograph.js lays it out.
   Nothing here is invented. Facts come from production records.js (Freeman's published project
   record). Captions describe only what is visible in a photograph and attribute nothing in it to a
   party. Details are crops of the credited photographs, unaltered except for cropping.
   Every statement carries one status: shown, credited, stated (Freeman's own published account,
   with nothing on file to show it), or absent (not on file; never filled in). */
(() => {
  "use strict";
  const PHOTO = "Jared Swafford";
  window.MONOGRAPH = {
    number: "001",
    slug: "beetlecat",
    // Production's own index line for the project: P—01 / Hospitality.
    id: "01",
    name: "Beetlecat",
    location: "Atlanta, Georgia",
    type: "Hospitality",
    gallery: "project-beetlecat.html",

    // Verbatim, as published in the project record. Quoted, never rewritten.
    account:
      "Designed as a warm, layered hospitality space, Beetlecat required a balance of precision and personality. Freeman GC led construction with a focus on collaboration, sequencing, and detail—bringing together materials, systems, and finishes in a way that feels cohesive and lived-in. The result is a space that enhances the rhythm of service while inviting guests to linger.",
    accountSource: "Freeman’s published project record, freemangc.com",

    claims: [
      ["Construction", "Freeman GC led construction.", "stated"],
      ["Client", "Rocket Farm Restaurants", "credited"],
      ["Photography", PHOTO, "credited"],
      ["Design", "No design credit is published. None is given here.", "absent"],
      ["Completed", "No date is on file.", "absent"],
    ],
    statuses: {
      shown: "Visible in a photograph on file.",
      credited: "A published credit naming a party and its role.",
      stated: "Freeman’s own published account. Nothing on file shows it yet.",
      absent: "Not on file. Left open, never filled in.",
    },

    // Photographs, in the order the monograph shows them (PL. 01, 02 …): production's own files,
    // at their own size. n is the position in the production gallery (project-beetlecat), so the
    // monograph and gallery cite the same object.
    plates: {
      threshold: { src: "/assets/projects/beetlecat-interior-2.jpg", w: 1440, h: 1920, n: 3, title: "The threshold",
        caption: "A yellow door cut with rounded openings. A wave-patterned glass screen on brass posts above a red ribbed counter front.",
        alt: "A yellow door with three rounded diagonal openings beside yellow-framed windows; in front, a red ribbed counter front with a wave-patterned glass screen on brass posts; plaid carpet and a slatted timber ceiling." },
      bar: { src: "/assets/project-0.jpg", w: 1920, h: 1370, n: 1, title: "The bar",
        caption: "Yellow stools on chrome bases along a lit, curved bar. Plaid carpet runs between the bar and the booths; slatted timber overhead.",
        alt: "Restaurant bar: yellow stools on chrome bases along a curved, lit bar, red-and-black plaid carpet, wave-patterned glass screens on brass posts, timber-lined walls and a slatted timber ceiling." },
      room: { src: "/assets/projects/beetlecat-3.jpg", w: 1920, h: 1281, n: 4, title: "The dining room",
        caption: "A channel-tufted red banquette and white tablecloths. Yellow-framed windows along a timber-lined wall.",
        alt: "Dining room with white tablecloths and bentwood chairs before a channel-tufted red banquette, wave-patterned glass screens, branching globe chandeliers and yellow-framed windows along a timber-lined wall." },
      shelf: { src: "/assets/projects/beetlecat-1.jpg", w: 1920, h: 1281, n: 2, title: "A shelf",
        caption: "A model sailboat, a blue-and-white bowl and a ship in a glass case, against timber.",
        alt: "A model sailboat with a weathered sail and yellow hull, a blue-and-white bowl and a ship model in a glass case, against a timber wall." },
    },

    // Crops of the plates above. from: plate key. x, y, w, h: the crop in source pixels.
    details: [
      { id: "01", src: "/etcetera/monograph-001/details/d01-screen.jpg", w: 860, h: 300, from: "threshold", x: 0, y: 990,
        caption: "Wave-patterned glass on a brass post.",
        alt: "Detail: white wave lines on a glass screen held by a brass post, above a pale stone cap." },
      { id: "02", src: "/etcetera/monograph-001/details/d02-front.jpg", w: 840, h: 660, from: "threshold", x: 0, y: 1240,
        caption: "The red ribbed counter front.",
        alt: "Detail: a counter front faced in narrow vertical red and orange ribs." },
      { id: "03", src: "/etcetera/monograph-001/details/d03-door.jpg", w: 340, h: 940, from: "threshold", x: 860, y: 500,
        caption: "The yellow door: three rounded openings, a kick plate, an exit sign above.",
        alt: "Detail: a yellow door with three rounded diagonal openings, a dark kick plate and an exit sign." },
      { id: "04", src: "/etcetera/monograph-001/details/d04-carpet.jpg", w: 600, h: 500, from: "threshold", x: 840, y: 1420,
        caption: "Red-and-black plaid carpet.",
        alt: "Detail: red and black plaid carpet meeting a timber wall." },
      { id: "05", src: "/etcetera/monograph-001/details/d05-stools.jpg", w: 560, h: 620, from: "bar", x: 1040, y: 650,
        caption: "Stools, a brass foot rail and the lit bar front.",
        alt: "Detail: yellow upholstered stools on chrome bases, a brass foot rail and a lit, ribbed bar front." },
      { id: "06", src: "/etcetera/monograph-001/details/d06-window.jpg", w: 380, h: 860, from: "room", x: 1540, y: 0,
        caption: "Yellow window frames with rounded corners, hinges and latches.",
        alt: "Detail: yellow-painted window frames with rounded corners, hinges and latches, set in timber." },
      { id: "07", src: "/etcetera/monograph-001/details/d07-banquette.jpg", w: 720, h: 280, from: "room", x: 630, y: 630,
        caption: "The channel-tufted banquette.",
        alt: "Detail: a red channel-tufted banquette behind tables laid with white cloths." },
    ],

    // What the photographs show, in the order they show it. Not a specification: no product,
    // maker or installer is named, because none is on file.
    visible: [
      "Slatted timber ceiling",
      "Timber-lined walls",
      "Yellow-framed windows",
      "A yellow door with rounded openings",
      "Wave-patterned glass screens on brass posts",
      "Red ribbed counter and bar fronts",
      "Red-and-black plaid carpet",
      "A channel-tufted red banquette",
      "Yellow stools on chrome bases",
      "Branching globe chandeliers",
    ],

    // Sequence: which plate fills each moment of the standard. opening is the ETCETERA cover, so
    // the photograph the visitor chose is the one that opens. field: one plate beside the margin;
    // wide: one plate across the frame; pause: the quiet photograph after the details.
    sequence: { opening: "threshold", field: "bar", wide: "room", pause: "shelf" },
    // How ETCETERA lists the monograph: its object number and the cover caption.
    etcetera: { object: "005", caption: "PROJECT MONOGRAPH 001 · BEETLECAT" },
    // Detail rhythm: rows of one or two crops. align: where a pair meets (start / end).
    detailRows: [
      { items: ["01", "03"], align: "start" },
      { items: ["02"], offset: 1 },
      { items: ["05", "04"], align: "end" },
      { items: ["07", "06"], align: "end" },
    ],

    // Field record: each finished detail beside the frame held open for its evidence.
    // request: what would be captured. A request, never a description of what happened.
    record: [
      { detail: "02", request: "The counter front during installation, photographed from this position." },
      { detail: "03", request: "The door opening before and after the door was hung, from this position." },
      { detail: "06", request: "The window wall before finishes, from this position." },
    ],
    awaiting: [
      "Dated field photographs from the build",
      "Start and handover dates",
      "Drawings for the counter fronts, screens and door",
      "A statement from Rocket Farm Restaurants, in their words",
    ],

    next: { id: "02", name: "The Optimist", href: "project-the-optimist.html" },
  };
})();
