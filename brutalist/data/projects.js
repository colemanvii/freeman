/* FREEMAN GC — PROJECT RECORDS
 * ---------------------------------------------------------------
 * Source of truth for /brutalist. Plain script (no build step) so
 * pages work from GitHub Pages, a local server, or file://.
 *
 * PROVENANCE
 *   Copy, credits, budgets and photography come from the published
 *   site (www.freemangc.com/projects/*, read 2026-10-12) and the
 *   repo's existing app-core.js. Copy is edited for length; no facts
 *   are added. Two published credit values are deliberately omitted
 *   because they read as CMS template defaults, not project facts:
 *     - "Interior Design: Interior Designer"
 *     - "Total sq. ft.: 2,000+" (identical on seven projects)
 *   Restore them here if Freeman confirms them.
 *
 * COORDINATES are municipal centres (approximate), not site locations.
 *
 * IMAGES
 *   `src`   — live-site CDN URL (Webflow asset library).
 *   `local` — optional repo copy; used first when present.
 *   Run scripts/localize-photography.sh on a networked machine to
 *   download every CDN image into assets/photography/ and switch to
 *   local files.
 *
 * TO ADD A PROJECT: copy an entry, give it the next `no`, a unique
 * `slug`, and only verified values. Leave unknown fields out.
 * --------------------------------------------------------------- */
(function () {
  const CDN = 'https://cdn.prod.website-files.com/666b9585b7fd3bd24dfbba73/';
  const SWAFFORD = 'Jared Swafford';
  const FGC_PHOTO = 'Freeman GC';

  const P = (file, caption, extra) => Object.assign({ src: CDN + file, caption, alt: caption }, extra || {});

  window.FGC = window.FGC || {};
  window.FGC.projects = [
    {
      no: '001',
      slug: 'beetlecat',
      title: 'Beetlecat',
      typology: 'Hospitality',
      location: 'Atlanta, Georgia',
      coords: [33.749, -84.388],
      year: '2024',
      client: 'Rocket Farm Restaurants',
      interiorDesign: 'Chuck Marie Studio',
      photography: SWAFFORD,
      statement: 'A warm, layered restaurant interior, built around the rhythm of service.',
      description: [
        'Beetlecat called for a balance of precision and personality. Freeman led construction with a focus on collaboration, sequencing and detail — bringing materials, systems and finishes together so the room reads as one thing, cohesive and lived-in.',
        'The finished space supports the pace of service while inviting guests to linger.'
      ],
      source: 'https://www.freemangc.com/projects/beetlecat-atlanta',
      images: [
        P('690112c66907ba02f5612747_Beetlecat%20Thumb%20Freeman%20General%20Contractors_HP.jpg', 'Bar and dining room'),
        P('6916c066bebf4e7e713cd4c6_Beetlecat_Freeman%20General%20Contractors%201.jpg', 'Sailboat model on timber panelling'),
        P('6916c066aba1c423cab3afb8_Beetlecat_Freeman%20General%20Contractors%203.jpg', 'Dining room, banquette and chandelier'),
        P('690df6f52cc488ed2cc452e2_2%20Beetlecat%20Freeman%20General%20Contractors%20Interior.jpg', 'Interior, window wall above red panelling'),
        P('6916c0672d8bf0bdde0c6728_Beetlecat_Freeman%20General%20Contractors%204.jpg', 'Timber surface and edge, close view'),
        P('6916c0671f74674fae2e565d_Beetlecat_Freeman%20General%20Contractors%205.jpg', 'Painted buoys against a dark wall'),
        P('6916c0672aed60ee9c1c2488_Beetlecat_Freeman%20General%20Contractors%206.jpg', 'Stair and handrail'),
        P('690112c760f5984a53df780a_Beetlecat%20Hero%20construction%20by%20Freeman%20General%20Contractors_HP.jpg', 'Entry')
      ],
      drawing: P('692f51816e49f0aa56fc8c41_FGC_Bettlecat-Illustration.png', 'Beetlecat — line drawing from the Freeman archive', { kind: 'drawing' })
    },
    {
      no: '002',
      slug: 'the-optimist',
      title: 'The Optimist',
      typology: 'Hospitality',
      location: 'Atlanta, Georgia',
      coords: [33.749, -84.388],
      year: '2024',
      client: 'Rocket Farm Restaurants',
      interiorDesign: 'Chuck Marie Studio',
      photography: SWAFFORD,
      statement: 'A refresh of the Oyster Bar, built in three weeks and finished on time and under budget.',
      description: [
        'Freeman was given the Oyster Bar at The Optimist, one of Atlanta’s most esteemed restaurants, on a three-week deadline. The work was finished on time and under budget.',
        'The scope was dense with custom work for so short a schedule: a radius window, radius tile wrapping the oven, custom millwork and custom stainless steel.'
      ],
      scope: [
        'Custom radius window',
        'Radius tile around the oven',
        'Custom millwork pieces',
        'Custom stainless steel pieces',
        'Schedule: three weeks — completed on time and under budget'
      ],
      source: 'https://www.freemangc.com/projects/the-optimist',
      images: [
        P('6916c3cc412995612baf28e4_The%20Optimist_Freeman%20General%20Contractors%200.jpg', 'Patio seating under the steel canopy', { local: 'assets/img/optimist.webp' }),
        P('6916c3cc616a51c96d983f4d_The%20Optimist_Freeman%20General%20Contractors%203.jpg', 'Booths beneath the “Country Hams” sign'),
        P('6916c3cc226026dc164a2677_The%20Optimist_Freeman%20General%20Contractors%202.jpg', 'Lit display shelving in a dark wall'),
        P('6916c3cce885d505106dea4d_e0cc8b54e2c2d232ebb91c2bf6f0f390_The%20Optimist_Freeman%20General%20Contractors%201.jpg', 'Table and chairs'),
        P('6916c3ccdf6efa79adf0ab70_The%20Optimist_Freeman%20General%20Contractors%204.jpg', 'Table setting'),
        P('6916c3ccd39e05f315dd5c7d_The%20Optimist_Freeman%20General%20Contractors%205.jpg', 'Banquette and red counter stools'),
        P('6916c3ccc2e7cd5b33947747_The%20Optimist_Freeman%20General%20Contractors%206.jpg', 'Dining room')
      ],
      drawing: P('692f58dc7691023a542b9198_FGC_Optimist-Illustration-3.png', 'The Optimist — sign drawing from the Freeman archive', { kind: 'drawing' })
    },
    {
      no: '003',
      slug: 'barnsley-gardens',
      title: 'Barnsley Gardens',
      typology: 'Hospitality',
      location: 'Adairsville, Georgia',
      coords: [34.369, -84.934],
      year: '2024',
      client: 'Barnsley Resorts',
      interiorDesign: 'Chuck Marie Studio',
      photography: SWAFFORD,
      statement: 'Work within an established resort, defined by subtlety, sequencing and respect for place.',
      description: [
        'Freeman approached Barnsley Gardens with precision and care, letting materials, landscape and structure work together.',
        'The result is meant to feel settled and enduring — shaped as much by restraint as by craftsmanship.'
      ],
      source: 'https://www.freemangc.com/projects/barnsley-gardens',
      images: [
        P('6916c7910f0d654dd4daa28f_Barnsley%20Gardens_Freeman%20General%20Contractors%201.jpg', 'Pool house and pool', { local: 'assets/img/barnsley.webp' }),
        P('6916c791f7e78966f4352831_Barnsley%20Gardens_Freeman%20General%20Contractors%204.jpg', 'Pool house from the water'),
        P('6916c7913226982eb8e2de86_Barnsley%20Gardens_Freeman%20General%20Contractors%205.jpg', 'Timber pergola rafters against the sky'),
        P('6916c791835fadbeb4e94c15_Barnsley%20Gardens_Freeman%20General%20Contractors%207.jpg', 'Gabled cabanas reflected in the pool'),
        P('6916c791efa21f77c96382a0_Barnsley%20Gardens_Freeman%20General%20Contractors%202.jpg', 'Opening beneath the pergola'),
        P('6916c791c6ac343f3b6f4b51_Barnsley%20Gardens_Freeman%20General%20Contractors%208.jpg', 'Rafter shadows on the wall'),
        P('6916c791412995612baff40c_Barnsley%20Gardens_Freeman%20General%20Contractors%206.jpg', 'Life ring on a pale wall'),
        P('6916c791a35551ba4fff3444_Barnsley%20Gardens_Freeman%20General%20Contractors%203.jpg', 'Umbrellas against the sun'),
        P('6916c792de5d68691778c5b5_Barnsley%20Gardens_Freeman%20General%20Contractors%209.jpg', 'Water channel around a lawn island')
      ]
    },
    {
      no: '004',
      slug: 'bocado-pizza',
      title: 'Bocado Pizza',
      typology: 'Commercial',
      location: 'Atlanta, Georgia',
      coords: [33.749, -84.388],
      year: '2024',
      client: 'Bocado Pizza',
      photography: FGC_PHOTO,
      statement: 'A full commercial renovation, inside and out.',
      description: [
        'Bocado Pizza was renovated throughout: new custom millwork, a new bar, new flooring across the main dining room and kitchen, and new finishes in every room.',
        'Outside, Freeman built a new outdoor seating area.'
      ],
      scope: [
        'Custom millwork',
        'New bar area',
        'New flooring — main dining and kitchen',
        'New finishes throughout',
        'New outdoor seating area'
      ],
      source: 'https://www.freemangc.com/projects/bocado-pizza',
      images: [
        P('692db75041d703e9a18d4085_Bocado%20Pizza_Interior%20Seating.jpeg', 'Interior seating'),
        P('692db750b73187579c648585_Bocado%20Pizza_Bar.jpeg', 'Bar'),
        P('692dc08be0c1e5931e59c91a_Bocado-Pizza_Indoor-Seating_Crop.jpg', 'Indoor seating, banquette and framed posters'),
        P('692db7509743a79ea49fed6b_Bocado%20Pizza_Exterior%20Seating.jpeg', 'Exterior seating'),
        P('692db75054b35340d6a200d6_Bocado%20Pizza_Exterior.jpeg', 'Exterior')
      ]
    },
    {
      no: '005',
      slug: 'savi-provisions',
      title: 'Savi Provisions',
      typology: 'Retail',
      location: 'Emory Village, Atlanta',
      coords: [33.791, -84.324],
      year: '2024',
      client: 'Savi Provisions',
      budget: '$850k',
      statement: 'Construction in a supporting role to the customer’s experience.',
      description: [
        'At Savi Provisions in Emory Village, Freeman worked closely with the project team to build a space that balances durability with refinement — letting materials, layout and flow work together naturally.'
      ],
      testimonial: {
        quote: 'Freeman General Contracting is a breath of fresh air in the construction industry. Highly communicative, attentive to detail, and easy to be around.',
        name: 'Paul Nair',
        role: 'Founder of Savi Provisions'
      },
      source: 'https://www.freemangc.com/projects/savi-provisions-emory-village',
      images: [
        P('692db4c97f14414f0e9997d7_Freeman%20General%20Contractors_Savi-Provisions_Emory-Village.jpg', 'Shop floor and shelving')
      ],
      drawing: P('692f59150065d2621716374a_FGC_Savi-Illustration%203.png', 'Savi Provisions — storefront drawing from the Freeman archive', { kind: 'drawing' })
    },
    {
      no: '006',
      slug: 'o-ku-atlanta',
      title: 'O-Ku Atlanta',
      typology: 'Hospitality',
      location: 'Atlanta, Georgia',
      coords: [33.749, -84.388],
      year: '2024',
      client: 'O-Ku Atlanta',
      interiorDesign: 'Chuck Marie Studio',
      photography: FGC_PHOTO,
      statement: 'A full commercial renovation, completed on a three-week schedule.',
      description: [
        'O-Ku Atlanta was renovated on a tight three-week schedule: new custom millwork, a refreshed bar, new flooring across the main dining room and kitchen, and updated finishes throughout.'
      ],
      scope: [
        'Custom millwork',
        'Bar refresh',
        'New flooring — main dining and kitchen',
        'Updated finishes throughout',
        'Schedule: three weeks'
      ],
      source: 'https://www.freemangc.com/projects/o-ku-atlanta',
      images: [
        P('692db40427922cb4d26b93fc_O-Ku%20Atlanta_Sushi%20and%20Main%20Bar.jpeg', 'Sushi bar and main bar'),
        P('692db404e2c8b7283f87b2cf_O-Ku%20Atlanta_Omotenashi%20Sign.jpeg', 'Omotenashi sign'),
        P('692db4045f9269e5b29545fd_O-Ku%20Atlanta_Behind%20Sushi%20Bar.jpeg', 'Behind the sushi bar'),
        P('692db4041b408968bea69d94_O-Ku%20Atlanta_Rooftop%20Bar.jpeg', 'Rooftop bar')
      ]
    },
    {
      no: '007',
      slug: 'la-cresta-on-main',
      title: 'La Cresta on Main',
      typology: 'Residential',
      typologyLong: 'High-end residential — new construction',
      location: 'Blue Ridge, Georgia',
      coords: [34.864, -84.324],
      year: '2024',
      budget: '$3.1 million',
      statement: 'Four three-story residences in Blue Ridge, Georgia.',
      description: [
        'La Cresta on Main is new high-end residential construction in the town of Blue Ridge: four three-story units, each with a two-car garage.',
        'The units are contemporary in plan — open floor plans and high ceilings — and finished with premium materials, custom cabinetry, full appliance packages and selected fixtures.'
      ],
      scope: [
        'Four three-story units',
        'Two-car garage per unit',
        'Open floor plans, high ceilings',
        'Custom cabinetry',
        'Appliances and fixtures'
      ],
      source: 'https://www.freemangc.com/projects/la-cresta-on-main',
      images: [
        P('692db50754b35340d6a11efd_FGC_La%20Cresta%20on%20Main_Exterior.jpeg', 'Exterior'),
        P('692db5070ec28998b33134e6_FGC_La%20Cresta%20on%20Main_Living%201.jpeg', 'Living room'),
        P('692db5077421f28f54eec6a0_FGC_La%20Cresta%20on%20Main_Kitchen.jpeg', 'Kitchen'),
        P('692db50792f5eda64f4b4fdf_FGC_La%20Cresta%20on%20Main_Kitchen%20and%20Dining.jpeg', 'Kitchen and dining'),
        P('692db507881718ccdd118e9c_FGC_La%20Cresta%20on%20Main_Bath.jpeg', 'Bath'),
        P('692db5073c644d682513c536_FGC_La%20Cresta%20on%20Main_Living%203.jpeg', 'Living room')
      ]
    },
    {
      no: '008',
      slug: 'cleveland-surgery-center',
      title: 'Cleveland Surgery Center',
      typology: 'Healthcare',
      location: 'Cleveland, Tennessee',
      coords: [35.159, -84.877],
      year: '2024',
      client: 'Interventional Pain Consultants',
      interiorDesign: 'Chuck Marie Studio',
      budget: '$1.1M',
      statement: 'A surgery center built for clinical precision and patient comfort.',
      description: [
        'Cleveland Surgery Center had to support clinical precision and patient comfort at once. Freeman approached it with a focus on coordination, durability and long-term performance — a building that works quietly behind the scenes.'
      ],
      source: 'https://www.freemangc.com/projects/cleveland-surgery-center',
      images: [
        P('692db51e0255304cdedbe097_Cleveland%20Surgery%20Center_FGC.jpeg', 'Cleveland Surgery Center')
      ]
    },
    {
      no: '009',
      slug: 'dalton-surgery-center',
      title: 'Dalton Surgery Center',
      typology: 'Healthcare',
      location: 'Dalton, Georgia',
      coords: [34.770, -84.970],
      year: '2024',
      client: 'Interventional Pain Consultants',
      photography: FGC_PHOTO,
      statement: 'A surgery center built for clinical precision and patient comfort.',
      description: [
        'Built for the same client as Cleveland Surgery Center, Dalton was approached the same way: coordination, durability and long-term performance in service of clinical precision and patient comfort.'
      ],
      source: 'https://www.freemangc.com/projects/dalton-surgery-center',
      images: [
        P('692db53cb73187579c63c249_Dalton%20Surgery%20Center_FGC.jpeg', 'Dalton Surgery Center')
      ]
    }
  ];
})();
