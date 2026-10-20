/* ETCETERA — the registry (study etcetera-index-001). Every index study and every experience reads
   this file; nothing else lists entries. To publish an entry, add one object here and, if it needs
   one, an experience module. Each entry opens at /etcetera-<slug> (a route file beside etcetera.html).

   Entry fields
     no          three-digit catalogue number, in order of entry; never reused
     slug        route name: etcetera-<slug>.html
     title       as it should be read; sentence case
     type        editorial type, shown in capitals by the index (and used by Index A's filter)
     date        "YYYY-MM": when the entry joined the collection
     dek         optional one line the index may show on hover or focus
     image       optional { src, w, h, alt }: the entry's visual material in the index
     video       optional { src, poster, w, h }: film entries; without src the film is a placeholder
     weight      optional 1–3, Index C's emphasis (3 may lead a sheet, 2 may be set as a figure)
     experience  { module, files?, data? }: the module that presents it and its own data files

   Modules: src and css load on first use, relative to /etcetera/. A module registers itself as
   window.FreemanExperiences[name] = { mount(ctx) → { destroy?, key? } }; see experiences/README.md.

   Evidence. Entries 001–004 are the approved collection (production cc00dae), unchanged in content.
   005 is the approved Beetlecat snapshot (study/project-monograph-001, 35264b1). 006 is working copy.
   007 is an honest placeholder: no Freeman film is on file. */
(() => {
  "use strict";
  const modules = {
    plate: { src: ["experiences/plate.js"], css: ["experiences/plate.css"] },
    essay: { src: ["experiences/essay.js"], css: ["experiences/essay.css"] },
    film: { src: ["experiences/film.js"], css: ["experiences/film.css"] },
    snapshot: {
      src: ["snapshot-001/beetlecat.js", "snapshot-001/snapshot.js", "experiences/snapshot.js"],
      css: ["snapshot-001/snapshot.css"],
    },
  };

  const entries = [
    {
      no: "001", slug: "ruskin", title: "John Ruskin, on building", type: "Found text", date: "2026-10",
      dek: "A printed passage on building for those who come after, photographed.",
      image: { src: "/etcetera/ruskin.webp", w: 1536, h: 2048, alt: "Photograph of a printed John Ruskin passage about building for future generations" },
      weight: 2,
      experience: { module: "plate" },
    },
    {
      no: "002", slug: "optimist-note", title: "On building a place people want to return to.", type: "Note", date: "2026-10",
      dek: "A working reflection on hospitality buildouts, from The Optimist.",
      experience: { module: "essay", files: ["texts/optimist-note.js"] },
    },
    {
      no: "003", slug: "architectural-drawing", title: "Architectural drawing", type: "Drawing", date: "2026-10",
      dek: "A small structure, stairs, utility poles and wires, in black and white.",
      image: { src: "/etcetera/architectural-industrial.webp", w: 1290, h: 1717, alt: "Black-and-white architectural drawing of a small structure, stairs, utility poles and wires, with open paper space and a handwritten inscription along the lower margin" },
      experience: { module: "plate" },
    },
    {
      no: "004", slug: "residential-perspective", title: "Residential perspective", type: "Drawing", date: "2026-10",
      dek: "A long, low residence among trees, in warm tones.",
      image: { src: "/etcetera/residential-landscape.webp", w: 768, h: 576, alt: "Warm-toned perspective drawing of a long, low residence among trees and landscape, with paper margins and lettering along the lower edge" },
      experience: { module: "plate" },
    },
    {
      no: "005", slug: "beetlecat", title: "Beetlecat: two colours, one curve", type: "Photographic study", date: "2026-10",
      dek: "Five photographs, one observation and our reading of it.",
      image: { src: "/assets/projects/beetlecat-interior-2.jpg", w: 1440, h: 1920, alt: "Beetlecat: a yellow door with three rounded openings beside yellow-framed windows, a red ribbed counter front and plaid carpet" },
      weight: 2,
      experience: { module: "snapshot" },
    },
    {
      no: "006", slug: "built-for-generations", title: "Built for generations", type: "Essay", date: "2026-10",
      dek: "Working copy on the idea at the bottom of every page.",
      weight: 3,
      experience: { module: "essay", files: ["texts/built-for-generations.js"] },
    },
    {
      no: "007", slug: "film-001", title: "Film", type: "Film", date: "2026-10",
      dek: "Placeholder. No footage has been supplied.",
      video: { src: "", poster: "", w: 1920, h: 1080 },
      weight: 2,
      experience: { module: "film" },
    },
  ];

  window.ETCETERA = { modules, entries };
})();
