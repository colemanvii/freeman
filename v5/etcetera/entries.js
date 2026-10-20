/* ETCETERA — the collection (study etcetera-index-001). The index and every experience read this
   file. An entry opens at /etcetera-<slug> (a route file beside etcetera.html).

     slug, title   route name; the title is announced and shown on hover, never as a label
     image         { src, w, h }: the entry's material in the index
     video         { src, w, h }: a film; without src the frame stands empty
     lead          set large in the contents, with the other leading entries; the rest follow smaller
     experience    the module that presents it (modules, below); files: its own data

   Order is the order of the contents: the three experiences, then the four approved objects. Material is real: the four approved objects (production cc00dae),
   Beetlecat's own photograph, the essay's own words. No Freeman film is on file. */
(() => {
  "use strict";
  const modules = {
    plate: { src: ["experiences/plate.js"], css: ["experiences/plate.css"] },
    essay: { src: ["experiences/essay.js"], css: ["experiences/essay.css"] },
    credo: { src: ["experiences/credo.js"], css: ["experiences/credo.css"] },
    film: { src: ["experiences/film.js"], css: ["experiences/film.css"] },
    snapshot: {
      src: ["snapshot-001/beetlecat.js", "snapshot-001/snapshot.js", "experiences/snapshot.js"],
      css: ["snapshot-001/snapshot.css"],
    },
  };

  const entries = [
    { slug: "built-for-generations", lead: true, title: "Built for generations.", experience: "credo", files: ["texts/built-for-generations.js"] },
    { slug: "beetlecat", lead: true, title: "Beetlecat", experience: "snapshot",
      image: { src: "/assets/projects/beetlecat-interior-2.jpg", w: 1440, h: 1920, alt: "Beetlecat: a yellow door with rounded openings beside yellow-framed windows, a red ribbed counter front and plaid carpet" } },
    { slug: "film-001", lead: true, title: "Film", experience: "film", video: { src: "", w: 16, h: 9 } },
    { slug: "ruskin", title: "John Ruskin, on building", experience: "plate",
      image: { src: "/etcetera/ruskin.webp", w: 1536, h: 2048, alt: "Photograph of a printed John Ruskin passage about building for future generations" } },
    { slug: "architectural-drawing", title: "Architectural drawing", experience: "plate",
      image: { src: "/etcetera/architectural-industrial.webp", w: 1290, h: 1717, alt: "Black-and-white architectural drawing of a small structure, stairs, utility poles and wires, with open paper space and a handwritten inscription along the lower margin" } },
    { slug: "residential-perspective", title: "Residential perspective", experience: "plate",
      image: { src: "/etcetera/residential-landscape.webp", w: 768, h: 576, alt: "Warm-toned perspective drawing of a long, low residence among trees and landscape, with paper margins and lettering along the lower edge" } },
    { slug: "optimist-note", title: "On building a place people want to return to.", experience: "essay", files: ["texts/optimist-note.js"] },
  ];

  window.ETCETERA = { modules, entries };
})();
