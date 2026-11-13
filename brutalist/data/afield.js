/* AFIELD — FIELD RECORD
 * ---------------------------------------------------------------
 * A living record of Freeman's work: details, materials, places,
 * schedules, drawings and reference material, filed one entry at a
 * time. Each record is numbered and sourced; dates are entered only
 * when verified.
 *
 * FIELDS
 *   id        'AF-037'   next unused number, never reused
 *   title     short noun phrase
 *   kind      Detail | Material | Place | Schedule | Drawing | Reference
 *   project   project slug from data/projects.js, or null
 *   date      'YYYY-MM-DD' capture date if known, else ''
 *   material  optional, only what is visible or documented
 *   note      one factual observation (what is seen / what is documented)
 *   source    where the fact came from
 *   credit    photographer / origin
 *   image     { project: slug, i: index }   reuse a project photograph
 *             { src, local }                 any other image
 *             omitted                        photograph pending
 *   provenance optional caution shown on the record
 *
 * HONESTY RULES
 *   - Observations describe what the photograph shows or what Freeman
 *     has published. Do not invent dates, decisions or site events.
 *   - Archive references (Sawdust) are never presented as Freeman
 *     jobsite evidence.
 * --------------------------------------------------------------- */
(function () {
  const CDN = 'https://cdn.prod.website-files.com/666b9585b7fd3bd24dfbba73/';
  const SITE = 'Published photograph, freemangc.com';
  const COPY = 'Published project description, freemangc.com';
  const SAWDUST = 'Sawdust archive, freemangc.com/sawdust';
  const ARCHIVE_NOTE = 'Archive reference. Not a Freeman jobsite photograph; project and date unknown.';

  window.FGC = window.FGC || {};
  window.FGC.afield = [
    { id: 'AF-001', title: 'Pergola rafters', kind: 'Detail', project: 'barnsley-gardens', material: 'Timber, stained', image: { project: 'barnsley-gardens', i: 2 }, note: 'Stained timber rafters photographed from below, set against open sky. The members run at a constant spacing and cast the shadows recorded in AF-002.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-002', title: 'Rafter shadows', kind: 'Detail', project: 'barnsley-gardens', image: { project: 'barnsley-gardens', i: 5 }, note: 'Shadows of the pergola rafters fall across the wall below in a regular rhythm — the structure drawn a second time by the sun.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-003', title: 'Opening beneath the pergola', kind: 'Detail', project: 'barnsley-gardens', material: 'Timber', image: { project: 'barnsley-gardens', i: 4 }, note: 'A framed opening in the wall under the timber pergola.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-004', title: 'Life ring', kind: 'Place', project: 'barnsley-gardens', image: { project: 'barnsley-gardens', i: 6 }, note: 'A life ring and line mounted on a pale wall at the pool. Safety equipment as part of the finished place.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-005', title: 'Water channel', kind: 'Place', project: 'barnsley-gardens', image: { project: 'barnsley-gardens', i: 8 }, note: 'A water channel wraps a planted lawn island; the resort landscape continues beyond.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-006', title: 'Cabanas in reflection', kind: 'Place', project: 'barnsley-gardens', image: { project: 'barnsley-gardens', i: 3 }, note: 'A row of gabled cabanas doubled in the still water of the pool.', source: SITE, credit: 'Jared Swafford' },

    { id: 'AF-007', title: 'Timber, close view', kind: 'Material', project: 'beetlecat', material: 'Timber', image: { project: 'beetlecat', i: 4 }, note: 'A close view of a finished timber surface and edge, grain running diagonally across the frame.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-008', title: 'Buoys', kind: 'Detail', project: 'beetlecat', image: { project: 'beetlecat', i: 5 }, note: 'Painted buoys hung against a dark wall.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-009', title: 'Stair and handrail', kind: 'Detail', project: 'beetlecat', image: { project: 'beetlecat', i: 6 }, note: 'Stair and handrail, as photographed for the finished project.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-010', title: 'Sailboat on panelling', kind: 'Material', project: 'beetlecat', material: 'Timber panelling', image: { project: 'beetlecat', i: 1 }, note: 'A sailboat model rests on a shelf against warm timber panelling.', source: SITE, credit: 'Jared Swafford' },

    { id: 'AF-011', title: 'Display shelving', kind: 'Detail', project: 'the-optimist', image: { project: 'the-optimist', i: 2 }, note: 'Lit display shelving set into a dark wall.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-012', title: 'Banquette and stools', kind: 'Detail', project: 'the-optimist', image: { project: 'the-optimist', i: 5 }, note: 'A banquette beside a counter with red stools.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-013', title: 'Patio under steel', kind: 'Place', project: 'the-optimist', material: 'Steel canopy', image: { project: 'the-optimist', i: 0 }, note: 'Patio tables beneath a dark steel canopy, opening onto lawn.', source: SITE, credit: 'Jared Swafford' },
    { id: 'AF-014', title: 'Three weeks', kind: 'Schedule', project: 'the-optimist', note: 'The Oyster Bar refresh was given a three-week deadline. Freeman finished on time and under budget.', source: COPY, credit: 'Freeman GC' },
    { id: 'AF-015', title: 'Radius window, radius tile', kind: 'Detail', project: 'the-optimist', material: 'Timber, tile', note: 'The scope included a custom radius window and radius tile wrapping the oven — curved work on a three-week schedule.', source: COPY, credit: 'Freeman GC' },
    { id: 'AF-016', title: 'Stainless and millwork', kind: 'Material', project: 'the-optimist', material: 'Stainless steel, millwork', note: 'Custom stainless steel pieces and custom millwork were part of the scope.', source: COPY, credit: 'Freeman GC' },

    { id: 'AF-017', title: 'Behind the sushi bar', kind: 'Detail', project: 'o-ku-atlanta', image: { project: 'o-ku-atlanta', i: 2 }, note: 'The working side of the sushi bar.', source: SITE, credit: 'Freeman GC' },
    { id: 'AF-018', title: 'Omotenashi', kind: 'Detail', project: 'o-ku-atlanta', image: { project: 'o-ku-atlanta', i: 1 }, note: 'An Omotenashi sign. The word is Japanese for wholehearted hospitality — close kin to Freeman’s own phrase, Constructing Hospitality.', source: SITE, credit: 'Freeman GC' },
    { id: 'AF-019', title: 'Three weeks, again', kind: 'Schedule', project: 'o-ku-atlanta', note: 'A full commercial renovation — millwork, bar, flooring and finishes — completed on a tight three-week schedule.', source: COPY, credit: 'Freeman GC' },

    { id: 'AF-020', title: 'New bar', kind: 'Detail', project: 'bocado-pizza', image: { project: 'bocado-pizza', i: 1 }, note: 'The new bar area, part of a full renovation that also replaced the flooring in the main dining room and kitchen.', source: SITE, credit: 'Freeman GC' },
    { id: 'AF-021', title: 'Outdoor seating', kind: 'Place', project: 'bocado-pizza', image: { project: 'bocado-pizza', i: 3 }, note: 'The new outdoor seating area.', source: SITE, credit: 'Freeman GC' },

    { id: 'AF-022', title: 'Kitchen cabinetry', kind: 'Material', project: 'la-cresta-on-main', material: 'Custom cabinetry', image: { project: 'la-cresta-on-main', i: 2 }, note: 'Kitchen in one of four three-story units. Custom cabinetry is documented in the project description.', source: SITE, credit: 'Freeman GC' },
    { id: 'AF-023', title: 'Bath', kind: 'Detail', project: 'la-cresta-on-main', image: { project: 'la-cresta-on-main', i: 4 }, note: 'Bath fixtures and finishes in one of the four units.', source: SITE, credit: 'Freeman GC' },
    { id: 'AF-024', title: 'Shop floor', kind: 'Place', project: 'savi-provisions', image: { project: 'savi-provisions', i: 0 }, note: 'Shelving and circulation on the shop floor at Emory Village.', source: SITE, credit: 'Freeman GC' },

    { id: 'AF-025', title: 'Beetlecat, drawn', kind: 'Drawing', project: 'beetlecat', image: { src: CDN + '692f51816e49f0aa56fc8c41_FGC_Bettlecat-Illustration.png', kind: 'drawing' }, note: 'A line drawing of the Beetlecat building in Freeman red.', source: 'Freeman archive, freemangc.com', credit: 'Freeman GC' },
    { id: 'AF-026', title: 'The Optimist, drawn', kind: 'Drawing', project: 'the-optimist', image: { src: CDN + '692f58dc7691023a542b9198_FGC_Optimist-Illustration-3.png', kind: 'drawing' }, note: 'A drawing of The Optimist’s sign: “Oyster Bar · Seafood & Spirits.”', source: 'Freeman archive, freemangc.com', credit: 'Freeman GC' },
    { id: 'AF-027', title: 'Savi, drawn', kind: 'Drawing', project: 'savi-provisions', image: { src: CDN + '692f59150065d2621716374a_FGC_Savi-Illustration%203.png', kind: 'drawing' }, note: 'A drawing of the Savi storefront: a corner building with awnings.', source: 'Freeman archive, freemangc.com', credit: 'Freeman GC' },

    { id: 'AF-028', title: 'Rafter square', kind: 'Reference', project: null, material: 'Steel', image: { local: 'assets/img/square.webp', src: CDN + '690e259371dd2e5b56411391_Tool%201.png', kind: 'object' }, note: 'A steel rafter square. Tables for common and hip/valley top cuts are stamped into its face — the roof framed in arithmetic before it is framed in wood.', source: SAWDUST, credit: 'Freeman archive', provenance: ARCHIVE_NOTE },
    { id: 'AF-029', title: 'Angle divider No. 835', kind: 'Reference', project: null, image: { local: 'assets/img/angle-divider.webp', src: CDN + '690e2593ba81ccc61c685dae_Tool%205.png', kind: 'object' }, note: 'A General No. 835 angle divider on its printed card: “for carpenters, builders, floorlayers.”', source: SAWDUST, credit: 'Freeman archive', provenance: ARCHIVE_NOTE },
    { id: 'AF-030', title: 'Tying steel', kind: 'Reference', project: null, material: 'Reinforcing steel', image: { local: 'assets/img/steelwork.webp', src: CDN + '6913960d3298c1cdfac1a6f6_Tool%2016.png' }, note: 'Historical photograph: a worker bends over reinforcing steel on a deck high above a town.', source: SAWDUST, credit: 'Freeman archive', provenance: 'Historical reference. Not attributed to a Freeman job.' },
    { id: 'AF-031', title: 'Nail in timber', kind: 'Reference', project: null, material: 'Timber, iron', image: { local: 'assets/img/timber.webp', src: CDN + '6916ba25fd36f33f132811ca_Tool%2021.png' }, note: 'A nail set into weathered, darkened timber.', source: SAWDUST, credit: 'Freeman archive', provenance: ARCHIVE_NOTE },
    { id: 'AF-032', title: 'Masonry building, loading dock', kind: 'Reference', project: null, material: 'Brick, painted', image: { local: 'assets/img/site.webp', src: CDN + '6916ba25e9cf0be4b68cae04_Tool%2025.png' }, note: 'A painted brick building with a raised loading dock; a ladder and equipment at the door.', source: SAWDUST, credit: 'Freeman archive', provenance: ARCHIVE_NOTE },
    { id: 'AF-033', title: 'Cartersville, by postcard', kind: 'Reference', project: null, image: { src: CDN + '690112c63593bf91a4d43db2_Cartersville%20postcard%20-%20Freeman%20General%20Contractors_HP.jpg' }, note: 'A historic postcard of Cartersville, Georgia, where Freeman is based.', source: 'freemangc.com', credit: 'Freeman archive', provenance: 'Historical postcard.' },
    { id: 'AF-034', title: 'Rebar, in clogs', kind: 'Reference', project: null, material: 'Reinforcing steel', image: { src: CDN + '690112c6c48c78ba3ccab9dd_Vintage%20construction%20by%20Freeman%20General%20Contractors_HP.jpg' }, note: 'Vintage photograph: a man wearing clogs works with rebar.', source: 'freemangc.com', credit: 'Freeman archive', provenance: 'Historical reference. Not attributed to a Freeman job.' },
    { id: 'AF-035', title: '“We thought of you before you came.”', kind: 'Reference', project: null, image: { src: CDN + '690112c6316602414deb30ac_Freeman%20General%20Contractors_We%20thought%20of%20you%20before%20you%20came_HP.png', kind: 'object' }, note: 'A printed line kept in the Freeman archive. Hospitality, stated as preparation.', source: 'freemangc.com', credit: 'Freeman archive', provenance: 'Archive artifact.' },
    { id: 'AF-036', title: 'Freedom heirloom', kind: 'Reference', project: null, image: { src: CDN + '690112c5acee06ec566eff10_Freedom%20Eagle%20-%20Freeman%20General%20Contractors_HP.jpg' }, note: 'An heirloom eagle, kept in the Freeman archive.', source: 'freemangc.com', credit: 'Freeman archive', provenance: 'Archive artifact.' }
  ];

  /* SAWDUST — carried over from freemangc.com/sawdust
   * "Scraps, Inspirations, Outtakes & Ideas." Unfiled material.
   * Promote an item to a numbered record above once it is described. */
  const S = (f) => CDN + f;
  window.FGC.sawdust = [
    'Tool%2010.png#6913960ced1751e716bfb0d1', 'Tool%2018.png#6913960db4daa5efe493b52d', 'Tool%2011.png#6913963dedf7618fdeb28918',
    'Tool%209.png#6913960c4de32e0b5a2bf0b2', 'Tool%2023.png#6916ba25de1a366bd6999424', 'Tool%2024.png#6916ba250384493efbdd53ea',
    'Tool%2028.png#6916baff2b5b2cf2c2f78554', 'Service%202.png#690e50c7615afc9742977885', 'Tool%2020.png#6913960d4238c7ae0ca2ac76',
    'Tool%2026.png#6916ba25070e98e98beba47b', 'Service%201.png#690e4e9110211ed9a915136a', 'Tool%208.png#6913960c51a29b87eb417808',
    'Tool%2015.png#6913960c8313941195fa1174', 'Tool%2019.png#6913960d21dba16dfe52ed43', 'Tool%2012.png#6913960c24b9f5d532655343',
    'Tool%202.png#690e25931f3a34d1ea4e0da6', 'Tool%204.png#690e25932359baba240b0b8f', 'Tool%206.png#690e2593b29db7bf57b890eb',
    'Tool%203.png#690e2592217a88f2ecfa62e7', 'Service%203.png#690e4e91cc8bbf9cca13f9ea'
  ].map((x, i) => {
    const [name, id] = x.split('#');
    return { no: 'S-' + String(i + 1).padStart(2, '0'), src: S(id + '_' + name), label: decodeURIComponent(name).replace(/\.png$/, '') };
  });
})();
