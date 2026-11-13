/* FREEMAN GC — COMPANY
 * Sources: www.freemangc.com (home, /about, /contact — read 2026-10-12)
 * and the repo's approved app-core.js (service descriptions).
 * Edit here; pages render from this file. */
(function () {
  const CDN = 'https://cdn.prod.website-files.com/666b9585b7fd3bd24dfbba73/';
  window.FGC = window.FGC || {};
  window.FGC.company = {
    name: 'Freeman General Contractors',
    short: 'Freeman GC',
    base: 'Cartersville, Georgia',
    baseCoords: [34.165, -84.800],
    phone: '706.263.3348',
    phoneHref: 'tel:7062633348',
    email: 'gabe@freemangc.com',
    mark: 'Built for Generations',

    thesis: 'Construction is a service industry no different than a high-end restaurant or a boutique hotel.',
    thesisFollow: 'The process of building should be as enjoyable as the end product, resulting in relationships and projects that are built for generations.',
    relationships: 'Relationships are the bedrock of the work. Freeman brings the same respect, integrity and commitment from personal life to every interaction — with clients, subcontractors, suppliers, architects and engineers. Those connections are the foundation for every project.',
    hospitality: 'Constructing Hospitality means caring for people throughout the build: listening to owners, respecting the design team and the trades, and considering how a place will be used. Thoughtful sequencing, clear communication and attention to detail are part of that service — whether the building is a restaurant, a business or a home.',

    services: [
      ['Design + Build', 'Good building starts with shared decisions. Freeman works with owners, architects and engineers to align design, scope and budget early, then coordinates materials and details through construction — so the thinking behind each decision is carried into the work.'],
      ['Construction Management', 'Care shows up in the daily work: coordinating trades, tracking decisions and keeping owners informed. Schedules, cost updates, field documentation and open items are brought into the conversation, so the team knows what is happening, what has changed and what needs attention next.'],
      ['Commercial Construction', 'Restaurants, retail and hospitality spaces have to work for the people who run them and the guests they welcome. Construction is coordinated around those needs — from trade sequencing and equipment to the finishes people touch.'],
      ['High-End Residential', 'A home should feel considered long after move-in. Freeman works with homeowners and their design teams to carry material choices, custom details and everyday needs through construction, with respect for the home and attention to the work behind the finished surfaces.']
    ],

    people: [
      {
        name: 'Gabe Freeman', role: 'President',
        photo: CDN + '6904f4355f384508023b1b5f_586fac66beb6bf631c2b0ccec63dc2b7_Gabe%20Freeman%20General%20Contractors_HP.jpg',
        bio: 'Eight years in construction. Four as a project manager, learning the back-end operations of general contracting; three in a partnership building convenience stores from the ground up, where the experience was hands-on and practical. He now leads Freeman General Contracting.'
      },
      {
        name: 'Kendall Hawkins', role: 'Vice President',
        photo: CDN + '6916ca6eac71cd08cee1989f_Kendall%20Hawkins_Freeman%20General%20Contractors.jpg',
        bio: 'Began in land acquisition and development, then served as COO managing operations and financials for a multi-million-dollar portfolio in the waste industry. His experience running diverse companies shapes the direction of Freeman General Contracting.'
      },
      {
        name: 'Bo Wright', role: 'VP of Development & Construction',
        photo: null,
        bio: 'A background in community development, real estate and urban planning. Formerly a Director at Strong Towns and Executive Director of a Main Street organization and economic development agency, where he led zoning reform. He has consulted on mission-driven real estate projects and developed several of his own, and leads Freeman’s real estate development activities.'
      }
    ],

    testimonial: {
      quote: 'Freeman General Contracting is a breath of fresh air in the construction industry. Highly communicative, attentive to detail, and easy to be around.',
      name: 'Paul Nair', role: 'Founder, Savi Provisions', project: 'savi-provisions'
    },

    faqs: [
      ['What is the typical timeline for a commercial construction project?', 'It depends on scope, existing conditions, permits and lead times. Freeman’s construction management provides oversight and coordination through the whole process, with the aim of finishing on time, within budget and to a high standard. Two projects in this record — The Optimist and O-Ku Atlanta — were completed on three-week schedules.'],
      ['How do you keep projects on budget?', 'Meticulous planning, detailed cost estimating and regular monitoring of expenses — supported by transparent communication with the client and early, practical problem-solving.'],
      ['What do you do to keep the site safe?', 'Safety protocols, regular training and compliance with safety regulations by everyone on site. That includes regular site inspections, protective equipment and emergency preparedness plans.'],
      ['How do you manage subcontractors and suppliers?', 'Careful vetting, clear contracts and ongoing communication — holding every party to Freeman’s quality standards, the schedule and the specifications.']
    ]
  };
})();
