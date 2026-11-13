/* Freeman case studies — which projects have one, and how their photographs are laid out.
   Read by app.js (caseStudy). A project opens as a case study when it has an entry here AND
   "caseStudy": true on its record in /records.js; every other project keeps its existing page.

   This file holds layout and descriptions only. Facts are never restated here:
     name, type, number, account   /records.js           (Freeman's published record)
     partners, roles, links        /project-credits.js   (verified credits)
     address, area                 /record-assets/sites.js
     photograph sizes              /record-assets/photos.js (generated)

   plates   photographs in reading order. The first is the opening plate.
     src      a photograph already published for this project (must be in /record-assets/photos.js)
     caption  what the photograph shows, in a few plain words. Never who designed or made it.
     alt      a fuller description of what is visible, for people who cannot see the photograph.
   rows     how the plates after the first are grouped, e.g. [2, 1] = a pair, then one alone.
            Omitted: pairs. A pair shares one height; a single plate sits on the text column. */
window.FREEMAN_STUDIES = {
  beetlecat: {
    plates: [
      { src: "assets/project-0.jpg", caption: "Bar",
        alt: "The bar at Beetlecat: yellow stools on chrome bases along a curved, lit bar; red and black plaid carpet; wave-patterned glass screens on brass posts; timber walls and ceiling." },
      { src: "assets/projects/beetlecat-interior-2.jpg", caption: "Counter, glass screen and door",
        alt: "A yellow door with three rounded diagonal openings beside yellow-framed windows. In front, a red ribbed counter front carries a wave-patterned glass screen on a brass post. Plaid carpet, timber ceiling." },
      { src: "assets/projects/beetlecat-3.jpg", caption: "Dining room",
        alt: "Dining room: tables with white tablecloths before a channel-tufted red banquette, wave-patterned glass screens, globe chandeliers, and yellow-framed windows along a timber-lined wall." },
      { src: "assets/projects/beetlecat-1.jpg", caption: "Detail",
        alt: "Detail: a model sailboat with a yellow hull, a blue and white bowl and a model schooner in a glass case, on a ledge against a walnut wall." }
    ],
    rows: [2, 1]
  }
};
