/* Project Story 001 — the evidence record shared by all three studies.
   Nothing here is invented. Every item names its source. Photograph notes describe only what
   is visible; none of them attributes a visible element to Freeman's scope, because no
   photograph has been matched to a scope item. Keep that rule when adding material. */
(() => {
  'use strict';

  const ACCOUNT = 'Freeman’s published project account (freemangc.com)';
  const CREDIT = 'Published project credit (freemangc.com)';
  const PHOTO = 'Published portfolio photograph (freemangc.com)';

  window.STORY = {
    id: '001',
    issued: '19 Oct 2026',
    project: {
      name: 'The Optimist',
      scope: 'Oyster Bar refresh',
      location: 'Atlanta, Georgia',
      type: 'Hospitality',
      latitude: 'LAT. 33°46′48.216″N'
    },

    // Verbatim, as published. Quoted as source text; never rewritten in place.
    sourceText: 'Freeman General Contracting was given the opportunity to refresh the Oyster Bar at the highly esteemed restaurant in Atlanta, The Optimist. This project was on a tight deadline of 3 weeks. FGC finished on time and under budget. This project boasts ultra high-end finishes - custom radius window, radius tile around oven, custom millwork pieces, custom stainless steel pieces. This project had it all.',

    parties: [
      { role: 'Client', name: 'Rocket Farm Restaurants', source: CREDIT },
      { role: 'Interior design', name: 'Chuck Marie Studio', source: CREDIT },
      { role: 'Construction', name: 'Freeman GC', source: ACCOUNT },
      { role: 'Photography', name: 'Jared Swafford', source: CREDIT },
      { role: 'Drawing', name: 'Freeman GC archive', source: 'Freeman archive, freemangc.com' }
    ],

    // Scope exactly as listed in the account. located: no photograph identified yet.
    scope: [
      { id: 'radius-window', text: 'Custom radius window', located: false },
      { id: 'radius-tile', text: 'Radius tile around the oven', located: false },
      { id: 'millwork', text: 'Custom millwork pieces', located: false },
      { id: 'stainless', text: 'Custom stainless steel pieces', located: false }
    ],
    schedule: { text: 'Three weeks', result: 'Finished on time and under budget', source: ACCOUNT, record: false },

    // Figures that appear only in the legacy template credits. Production omits them; so do we.
    withheld: [
      { text: 'More than 2,000 square feet', why: 'Appears only in the legacy Webflow template credits (“Total sq. ft. 2,000+”). Not confirmed by Freeman; the live site omits it.' },
      { text: 'Completed in 2024', why: 'A template “Complete” credit on the legacy page. Not confirmed; the live site deliberately omits it.' }
    ],

    // What would turn stated claims into evidence. A request, not a description.
    awaiting: [
      'Dated field photographs from the three weeks on site',
      'Start and handover dates',
      'A photograph identifying each of the four scope items',
      'Shop or fabrication drawings for the radius window and stainless pieces',
      'A statement from Rocket Farm Restaurants or Chuck Marie Studio, in their words'
    ],

    // Photographs: originals byte-for-byte from Freeman's published portfolio.
    // n: file index on the source CDN. notes: [x %, y %, visible detail].
    plates: {
      dr: { kind: 'drawing', src: 'optimist-drawing.png', w: 1700, h: 1000, credit: 'Freeman GC archive',
        source: 'Freeman archive drawing, freemangc.com',
        title: 'The sign',
        caption: 'The sign, drawn in Freeman red: THE OPTIMIST 914 · OYSTER BAR · SEAFOOD & SPIRITS · MINI GOLF • 3 HOLES.',
        alt: 'Line drawing in red of a roadside sign reading The Optimist 914, Oyster Bar, Seafood and Spirits, Mini Golf 3 Holes.',
        notes: [] },
      p0: { n: 0, src: 'optimist-0.jpg', w: 1920, h: 1080, credit: 'Jared Swafford', source: PHOTO,
        title: 'Patio',
        caption: 'Patio tables under a dark canopy, string lights overhead, lawn in front.',
        alt: 'Restaurant exterior: patio tables and white chairs beneath a dark canopy, a palm, fringed umbrellas and a lawn under string lights.',
        notes: [[33, 46, 'Dark canopy on slender posts'], [49, 4, 'String lights over the lawn'], [89, 52, 'Fringed umbrellas']] },
      p6: { n: 6, src: 'optimist-6.jpg', w: 1920, h: 1235, credit: 'Jared Swafford', source: PHOTO,
        title: 'Dining room',
        caption: 'A green banquette along board panelling; fish wallpaper above; a window back to the patio.',
        alt: 'Dining room corner with a green leather banquette, timber tables and bentwood chairs, dark board panelling, fish-patterned wallpaper and a window to the patio.',
        notes: [[36, 7, 'Fish wallpaper'], [30, 43, 'Vertical board panelling'], [62, 57, 'Green banquette'], [80, 42, 'Window to the patio']] },
      p3: { n: 3, src: 'optimist-3.jpg', w: 1920, h: 1235, credit: 'Jared Swafford', source: PHOTO,
        title: 'Booths',
        caption: 'Curved blue booths beneath a painted COUNTRY HAMS sign on whitewashed brick.',
        alt: 'Curved blue leather booths with round tables beneath a painted Country Hams sign on whitewashed brick, with framed paintings and table lamps.',
        notes: [[66, 20, 'Painted sign: COUNTRY HAMS'], [24, 66, 'Curved blue booths'], [55, 5, 'Slatted ceiling'], [17, 53, 'Lamps on the booth backs']] },
      p2: { n: 2, src: 'optimist-2.jpg', w: 1920, h: 1311, credit: 'Jared Swafford', source: PHOTO,
        title: 'Cabinet',
        caption: 'A lit, glazed timber cabinet on painted brick, a mounted fish above.',
        alt: 'A glazed timber display cabinet lit from within, holding caps and folded shirts, against painted brick, with a mounted fish above and a lantern lamp beside it.',
        notes: [[49, 10, 'Mounted fish'], [48, 54, 'Glazed timber cabinet, lit inside'], [6, 33, 'Painted brick'], [18, 73, 'Lantern lamp']] },
      p5: { n: 5, src: 'optimist-5.jpg', w: 1920, h: 2400, credit: 'Jared Swafford', source: PHOTO,
        title: 'Counter',
        caption: 'Red stools at a wall counter; a mirror in a rounded timber frame; teal tile.',
        alt: 'A small wall-mounted counter set for two, with red swivel stools, a mirror in a rounded timber frame, a sconce and teal tile.',
        notes: [[67, 37, 'Mirror in a rounded timber frame'], [6, 76, 'Teal tile'], [22, 66, 'Red swivel stools'], [49, 78, 'Counter on a single post']] },
      p1: { n: 1, src: 'optimist-1.jpg', w: 1920, h: 2400, credit: 'Jared Swafford', source: PHOTO,
        title: 'Table',
        caption: 'A metal-topped table in raking sun beside a striped banquette.',
        alt: 'A round metal-topped table set with a plate, napkin and glasses in strong sunlight, beside a blue-and-white striped banquette and a bentwood chair with a red seat.',
        notes: [[58, 71, 'Metal-clad top, riveted edge'], [21, 33, 'Striped banquette'], [21, 84, 'Bentwood chair, red seat']] },
      p4: { n: 4, src: 'optimist-4.jpg', w: 1920, h: 2400, credit: 'Jared Swafford', source: PHOTO,
        title: 'Latitude',
        caption: 'Place settings on a timber table lettered with its latitude: LAT. 33°46′48.216″N.',
        alt: 'A timber table set with plates, napkins, cutlery and green glasses; yellow lettering along its edge reads LAT. 33 degrees 46 minutes 48.216 seconds north.',
        notes: [[61, 78, 'LAT. 33°46′48.216″N, lettered on the top'], [60, 26, 'Open-grain timber top'], [55, 6, 'Bentwood chairs']] }
    }
  };
})();
