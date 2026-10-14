/*
 * Alder — Issue 01 content record.
 *
 * Content only. Layout lives in /app.js and /styles.css.
 *
 * Claim status vocabulary (every fact in this file carries one):
 *   illustrative  — invented for this design study; not a Freeman offer or a client fact
 *   proposed      — a proposed Freeman action or statement awaiting company approval
 *   public        — confirmed from a cited public source
 *   unverified    — a factual claim that must be substantiated before client issue
 *   verified      — substantiated and approved for issue (none yet in this study)
 *
 * Cross-reference IDs: S-## scope items, B-## budget lines, A-## allowances,
 * M-## milestones, C-## active conditions, D-## decisions.
 */
window.PROPOSAL = {
  slug: 'alder',
  base: '/p/alder',

  issue: {
    number: '01',
    date: '14 October 2026',
    dateISO: '2026-10-14',
    author: null, // must be a verified Freeman author before client issue
    authorPlaceholder: 'Author to be confirmed',
    priorIssues: [],
    access: 'Demonstration access',
    status: 'Illustrative proposal / Not an estimate',
    internal: 'Study 05 / internal design preview'
  },

  contact: {
    // The configured address on the Freeman V5 site.
    email: 'gabe@freemangc.com',
    subject: 'Alder / Issue 01 — request for a working session',
    body: [
      'Hello Freeman,',
      '',
      'We have read Issue 01 of the Alder proposal (14 October 2026) and would like to arrange a working session to review:',
      '',
      '1. The kitchen equipment purchasing and installation boundary (D-01)',
      '2. An investigation of the existing building services and exhaust route (D-02)',
      '3. Preconstruction deliverables and fee (D-03)',
      '',
      'Suggested times:',
      '',
      'Founders, Alder'
    ].join('\n')
  },

  client: {
    name: 'Alder',
    short: 'Alder',
    city: 'Atlanta',
    type: 'Restaurant build-out',
    preparedFor: 'Prepared for the founders of',
    facts: [
      ['Area', '3,200 sq ft', 'illustrative'],
      ['Seats', '80', 'illustrative'],
      ['Premises', 'Leased second-generation restaurant space', 'illustrative'],
      ['Kitchen', 'Open to view from the dining room', 'illustrative'],
      ['Service', 'Evening dinner program', 'illustrative']
    ]
  },

  opening: {
    thesis: [
      'A dining room that feels settled from the first service.',
      'A kitchen planned for the pace behind it.'
    ],
    approach: 'Our starting point is the meeting of those two ambitions: protect the room’s character while resolving equipment, building services, and the sequence of work early.',
    firstCondition: 'Before we establish an opening date, we recommend confirming the existing utilities and the kitchen exhaust route.',
    commercial: [
      { label: 'Working construction budget', value: '$1.50m, including $150k owner contingency', to: '05-budget' },
      { label: 'Illustrative sequence', value: '24 weeks from preconstruction authorization; opening date unconfirmed', to: '04-schedule' }
    ]
  },

  chapters: [
    { n: '01', slug: '01-project-approach', label: 'Project & Approach', summary: 'The room, the kitchen, and what we resolve first', note: 'Two unknowns lead' },
    { n: '02', slug: '02-relevant-work', label: 'Relevant Work', summary: 'Little Rey / role and evidence pending verification', note: 'Internal: not ready for issue', flag: true },
    { n: '03', slug: '03-people-scope', label: 'People & Scope', summary: 'Who leads; who supplies; where responsibilities meet', note: 'Five roles / one open boundary' },
    { n: '04', slug: '04-schedule', label: 'Schedule', summary: '24 illustrative weeks / start conditions unresolved', note: 'Three active conditions' },
    { n: '05', slug: '05-budget', label: 'Budget', summary: '$1.50m construction planning total / exclusions apply', note: 'Five exclusions listed' },
    { n: '06', slug: '06-decisions', label: 'Decisions', summary: 'Three questions before preconstruction', note: 'Next: a working session' }
  ],

  /* ---------- 01 Project & Approach ---------- */
  project: {
    question: 'Do you understand what we are trying to make?',
    heading: 'A room that works as well as it feels.',
    lead: 'Alder is imagined as a neighborhood restaurant with the kitchen in view and the dining room at ease. We would begin where those experiences meet: equipment layout, service routes, sound, and the junctions between materials.',
    priorities: [
      { title: 'Protect the character of the room.', text: 'Finishes, light, and sound are decided as a whole, and the junctions guests see are resolved before they are built.' },
      { title: 'Resolve the working requirements of the kitchen.', text: 'Equipment, utilities, ventilation, and service routes are coordinated before pricing, not after installation begins.' },
      { title: 'Make cost and sequence legible before committing to the build.', text: 'Every amount carries its basis and every date its starting condition, so authorization is an informed step.' }
    ],
    unknowns: [
      { id: 'C-01', title: 'Existing utility capacity', text: 'Electrical, gas, and water capacity for an expanded kitchen has not been verified.' },
      { id: 'C-02', title: 'Kitchen exhaust route', text: 'A compliant path from hood to roof or façade has not been confirmed with the landlord.' }
    ],
    basisSummary: [
      ['Client inputs', 'Illustrative brief / 14 Oct 2026'],
      ['Drawings', 'None received'],
      ['Site observation', 'None / no visit made'],
      ['Status', 'Fictional scenario']
    ],
    philosophy: 'We build with attention to the whole project and the details that carry it. Our role is to make the design buildable, coordinate the work, and keep decisions clear from the first review through turnover.',
    philosophyStatus: 'Proposed statement / for company approval',
    actions: [
      'Review constructability with the architect',
      'Reconcile trade scope against the drawings',
      'Coordinate procurement and site work',
      'Prepare inspections and handover'
    ],
    basis: {
      title: 'Basis of this proposal',
      note: 'Fictional scenario; no site survey or client drawings received.',
      rows: [
        { cat: 'Client inputs', item: 'Founder brief: 80 seats, visible kitchen, evening service', date: '14 Oct 2026', status: 'Illustrative' },
        { cat: 'Client inputs', item: 'Premises: 3,200 sq ft leased second-generation space', date: '14 Oct 2026', status: 'Illustrative' },
        { cat: 'Drawings', item: 'Architect’s drawing set', date: '—', status: 'Not received' },
        { cat: 'Drawings', item: 'Existing building and MEP drawings from landlord', date: '—', status: 'Not received' },
        { cat: 'Drawings', item: 'Kitchen equipment schedule and cut sheets', date: '—', status: 'Not received' },
        { cat: 'Site observations', item: 'Walk-through of the premises', date: '—', status: 'Not made' },
        { cat: 'Site observations', item: 'Existing services and exhaust route survey', date: '—', status: 'Proposed / D-02' },
        { cat: 'Assumptions', item: 'No structural expansion of the premises', date: '14 Oct 2026', status: 'Assumed' },
        { cat: 'Assumptions', item: 'Existing services reused where capacity permits', date: '14 Oct 2026', status: 'Unverified' },
        { cat: 'Outstanding', item: 'Lease exhibit and landlord work letter', date: '—', status: 'Requested on appointment' },
        { cat: 'Outstanding', item: 'Hazardous-material survey, if the landlord holds one', date: '—', status: 'Requested on appointment' }
      ]
    }
  },

  /* ---------- 02 Relevant Work ---------- */
  reference: {
    question: 'What have you actually done that matters here?',
    title: 'Little Rey / Rocket Farm Restaurants',
    label: 'Reference / Freeman role pending verification',
    lead: [
      'This reference will focus on the work Freeman can document: the assignment, the people involved, and the decisions made in the field.',
      'For Alder, the question is how that experience informs the coordination of a guest-facing room and a working kitchen.'
    ],
    releaseStatus: 'Not ready for client issue. Each historical field below must be filled from a record, or the topic removed.',
    template: 'At [location], [legal entity or named team member] was responsible for [documented scope] during [dates]. The record below shows [specific action].',
    topics: [
      {
        slug: 'material-junction',
        title: 'A material junction',
        plate: { finished: 'Finished photograph of the junction in use', field: 'Approved detail or field photograph of the same junction' },
        parts: [
          { k: 'Intent', status: 'unverified', text: 'Not yet documented. Record needed: the design requirement for a guest-facing junction, from the architect’s drawings.' },
          { k: 'Condition', status: 'unverified', text: 'Not yet documented. Record needed: what the team encountered, with a dated field report or RFI.' },
          { k: 'Freeman’s contribution', status: 'unverified', text: 'Not yet documented. Record needed: the action Freeman or a named team member took, credited separately from the architect and other builders.' },
          { k: 'Evidence', status: 'unverified', text: 'Not yet received. An attributable photograph or approved detail, with photographer, date, and permission.' }
        ],
        relevance: 'Before ordering millwork, we would mock up the junction where the dining room’s finishes meet the open kitchen’s cleanable surfaces and review it with the architect.',
        links: [['A-01', 'Millwork allowance'], ['S-02', 'Architectural build-out'], ['M-05', 'W5 / long-lead release']]
      },
      {
        slug: 'equipment-coordination',
        title: 'Equipment coordination',
        plate: { finished: 'Finished photograph of the kitchen line', field: 'Equipment layout or utility rough-in record' },
        parts: [
          { k: 'Intent', status: 'unverified', text: 'Not yet documented. Record needed: the operational requirement for the kitchen equipment and its utilities.' },
          { k: 'Condition', status: 'unverified', text: 'Not yet documented. Record needed: a dated coordination record — for example a rough-in conflict or a revised equipment schedule.' },
          { k: 'Freeman’s contribution', status: 'unverified', text: 'Not yet documented. Record needed: Freeman’s exact coordination role, distinguished from the equipment supplier’s and the architect’s.' },
          { k: 'Evidence', status: 'unverified', text: 'Not yet received. A field record or approved drawing detail with permission to show it.' }
        ],
        relevance: 'For Alder, we would confirm who purchases, installs, and starts each piece of equipment, then overlay the equipment schedule on the utility rough-in before pricing.',
        links: [['D-01', 'Decision: equipment boundary'], ['S-07', 'Kitchen equipment boundary'], ['M-21', 'W21 / equipment readiness']]
      },
      {
        slug: 'field-decision',
        title: 'A field decision',
        plate: { finished: 'Photograph of the completed condition', field: 'Field record of the decision, dated' },
        parts: [
          { k: 'Intent', status: 'unverified', text: 'Not yet documented. Record needed: what the drawings required at the point the decision was made.' },
          { k: 'Condition', status: 'unverified', text: 'Not yet documented. Record needed: the concealed or unexpected condition, with a dated field record.' },
          { k: 'Freeman’s contribution', status: 'unverified', text: 'Not yet documented. Record needed: who proposed the response, who approved it, and how cost and time were reported.' },
          { k: 'Evidence', status: 'unverified', text: 'Not yet received. A field photograph or written record, attributed and permitted.' }
        ],
        relevance: 'For Alder, we would investigate the existing services and the exhaust route before the construction baseline, so that a concealed condition becomes a planned decision rather than a field surprise.',
        links: [['D-02', 'Decision: services investigation'], ['C-02', 'Exhaust route condition'], ['M-08', 'W8 / construction start gate']]
      }
    ],
    verify: [
      ['Location', 'Piedmont or Northside Parkway — unresolved'],
      ['Dates', 'Not established'],
      ['Contracting entity', 'Not established'],
      ['Direct client', 'Not established'],
      ['Freeman or prior-employer work', 'Not established'],
      ['Contracted scope', 'Not established'],
      ['Named participants', 'Not established'],
      ['Drawing and image permissions', 'Not requested'],
      ['Claimed outcome', 'None claimed']
    ],
    verifyNote: 'If the work was an individual’s prior experience, it is labeled “Team experience / completed while at [company]”, not presented as a Freeman commission. No Rocket Farm endorsement is implied.',
    sources: [
      ['Rocket Farm Restaurants lists Little Rey among its restaurants', 'https://www.rocketfarmrestaurants.com/', 'public'],
      ['Little Rey / Piedmont', 'https://www.littlerey.com/piedmont', 'public'],
      ['Little Rey / Northside Parkway', 'https://www.littlerey.com/northside-parkway', 'public']
    ],
    sourcesNote: 'These public sources identify the restaurant and its two Atlanta locations. They do not establish Freeman’s construction role.'
  },

  /* ---------- 03 People & Scope ---------- */
  people: {
    question: 'Who will do what, and who carries the gaps?',
    heading: 'A clear line from the decision to the work.',
    lead: 'The project manager would be your primary contact. The superintendent would coordinate the daily work. Design changes would return to the architect; cost and time effects would return to you before authorization.',
    team: [
      { role: 'Freeman principal', resp: 'Client relationship, escalation, commercial oversight', status: 'Person to confirm' },
      { role: 'Project manager', resp: 'Trade scope, procurement, cost reporting, decisions', status: 'Person to confirm', primary: true },
      { role: 'Superintendent', resp: 'Daily coordination, sequencing, quality, site safety', status: 'Person to confirm' },
      { role: 'Architect / owner-appointed', resp: 'Design intent, coordinated documents, design responses', status: 'Appointment to confirm' },
      { role: 'Founder / owner', resp: 'Brief, selections, owner purchases, authorizations', status: 'Fictional role' }
    ],
    teamNote: 'Roles are shown until named people are confirmed for participation and availability.',
    scope: [
      { id: 'S-01', item: 'Selective demolition' },
      { id: 'S-02', item: 'Architectural build-out' },
      { id: 'S-03', item: 'Mechanical, electrical, plumbing, and fire-protection work, coordinated' },
      { id: 'S-04', item: 'Installation coordination for owner-supplied items' },
      { id: 'S-05', item: 'Inspections and turnover' }
    ],
    scopeNote: 'All proposed scope, pending survey and documents.',
    stages: [
      ['Verify', 'existing conditions'],
      ['Reconcile', 'drawings and trade proposals'],
      ['Coordinate', 'procurement and construction'],
      ['Test', 'inspect, and turn over']
    ],
    boundaries: {
      title: 'Responsibility boundaries',
      note: 'Illustrative allocations to test the format. These are not standard Freeman contractual terms; every limit is confirmed before pricing.',
      rows: [
        { id: 'S-07', item: 'Kitchen equipment', freeman: 'Coordinates delivery, access, and set-in sequence; provides priced utility connections to agreed points', other: 'Owner purchases; equipment supplier installs and starts up', open: 'Exact connection points for each item; who provides final hook-up and startup testing', decision: 'D-01', worked: true },
        { id: 'S-08', item: 'Exhaust hood and duct', freeman: 'Duct route, roof or façade penetration, fire-rated enclosure', other: 'Hood supplied with equipment package', open: 'Whether the hood is in the owner’s package; landlord approval of the route', decision: 'D-02' },
        { id: 'S-09', item: 'Walk-in cooler', freeman: 'Slab preparation, power, and drain', other: 'Supplier provides box and refrigeration', open: 'Remote condenser location', decision: 'D-01' },
        { id: 'S-10', item: 'Low-voltage, POS, audio', freeman: 'Conduit, back boxes, and pull strings', other: 'Owner’s vendors cable, install, and program', open: 'Device locations not yet set' },
        { id: 'S-11', item: 'Loose furniture', freeman: 'Receipt and placement if requested', other: 'Owner purchases and installs', open: 'Banquette: built-in millwork or loose furniture', allowance: 'A-01' },
        { id: 'S-12', item: 'Permits and utility fees', freeman: 'Building permit application and inspection coordination', other: 'Owner pays statutory permit and utility connection charges', open: 'Health department plan review submission' },
        { id: 'S-13', item: 'Landlord work', freeman: 'Coordination with landlord’s contractors', other: 'Landlord work letter items', open: 'Work letter not received' }
      ]
    }
  },

  /* ---------- 04 Schedule ---------- */
  schedule: {
    question: 'What has to happen before we can open?',
    heading: '24 illustrative weeks from authorization to handover.',
    sub: 'Opening follows owner training, operational readiness, and required approvals. No opening date is committed.',
    lead: 'The opening depends on decisions made before the site gets busy. We would establish the construction start after the permit, site access, and coordinated documents are ready. Equipment selections and release dates would be tracked against the work they enable.',
    weeks: 24,
    rows: [
      { id: 'W-1', label: 'Existing conditions and preconstruction', from: 1, to: 4, dep: 'Utilities, exhaust route, brief confirmed' },
      { id: 'W-2', label: 'Design coordination and permitting', from: 3, to: 8, dep: 'Design and permit readiness before site work' },
      { id: 'W-3', label: 'Long-lead procurement', from: 5, to: 16, dep: 'Approved selections and release authority' },
      { id: 'W-4', label: 'Demolition and rough-in', from: 9, to: 14, dep: 'Permit, possession, coordinated documents' },
      { id: 'W-5', label: 'Finishes and equipment coordination', from: 15, to: 21, dep: 'Rough-in approvals and equipment arrivals' },
      { id: 'W-6', label: 'Testing, inspections, punch, handover', from: 22, to: 24, dep: 'Systems ready; inspections available' }
    ],
    milestones: [
      { id: 'M-04', week: 4, label: 'Brief and basis agreed', prereq: 'Founder brief confirmed; services and exhaust investigation reported', role: 'Founder, with project manager', rows: ['W-1', 'W-2'], affects: [['D-02', 'Services investigation'], ['B-01', 'Trade construction']] },
      { id: 'M-08', week: 8, label: 'Construction start gate', prereq: 'Building permit issued, possession of the premises, coordinated documents', role: 'Project manager, with architect', rows: ['W-2', 'W-4'], affects: [['C-01', 'Utility capacity'], ['C-02', 'Exhaust route'], ['B-01', 'Trade construction']], key: true },
      { id: 'M-14', week: 14, label: 'Rough-in review', prereq: 'Rough-in inspections passed; equipment connection points confirmed', role: 'Superintendent', rows: ['W-4', 'W-5'], affects: [['S-07', 'Kitchen equipment boundary'], ['S-03', 'MEP and fire protection']] },
      { id: 'M-21', week: 21, label: 'Equipment readiness', prereq: 'Owner equipment delivered; supplier available for set-in and startup', role: 'Founder’s equipment supplier, with project manager', rows: ['W-3', 'W-5'], affects: [['D-01', 'Equipment boundary'], ['C-03', 'Lead times']] },
      { id: 'M-24', week: 24, label: 'Target handover', prereq: 'Final inspections passed; punch list closed; operating documents issued', role: 'Project manager', rows: ['W-6'], affects: [['S-05', 'Inspections and turnover']] }
    ],
    conditions: [
      { id: 'C-01', title: 'Utility capacity unverified', role: 'Project manager', next: 'Survey electrical, gas, and water service against the equipment load', affects: 'M-08' },
      { id: 'C-02', title: 'Exhaust route unconfirmed', role: 'Architect, with project manager', next: 'Trace a compliant hood-to-roof route; seek landlord approval', affects: 'M-08' },
      { id: 'C-03', title: 'Equipment lead times unquoted', role: 'Founder’s equipment supplier', next: 'Written lead times once selections are approved', affects: 'M-21' }
    ],
    note: 'Illustrative sequencing assumptions, not permitting or procurement predictions. A delay at the start gate requires a revised schedule; downstream dates are not assumed to hold.'
  },

  /* ---------- 05 Budget ---------- */
  budget: {
    question: 'What does this include, how certain is it, and what else must we fund?',
    heading: 'A clear basis for the next conversation.',
    total: '$1,500,000',
    totalLabel: 'Construction planning total',
    totalBasis: 'Includes a $150,000 owner-held contingency. Illustrative; not priced against drawings, a site survey, or trade proposals.',
    lead: 'This is a planning exercise. Kitchen equipment, loose furniture, professional fees, and pre-opening operating costs are outside this total. The full development budget remains to be established.',
    lines: [
      { id: 'B-01', label: 'Trade construction excluding allowances', amount: 1000000, status: 'Planning placeholder; unquoted' },
      { id: 'B-02', label: 'Finish and fixture allowances', amount: 150000, status: 'Included once; selections unresolved', allowances: true },
      { id: 'B-03', label: 'General conditions, fee, insurance', amount: 200000, status: 'Combined placeholder; split in detailed estimate' },
      { id: 'B-04', label: 'Proposed construction subtotal', amount: 1350000, status: 'Not a contract sum', subtotal: true },
      { id: 'B-05', label: 'Owner-held construction contingency', amount: 150000, status: 'Separate reserve; not contractor revenue' },
      { id: 'B-06', label: 'Construction planning total', amount: 1500000, status: 'Includes owner contingency', total: true }
    ],
    allowancesNote: 'Allowances are excluded from the $1,000,000 trade line to prevent double counting. Each is an illustrative installed package; labor, freight, taxes, and markups are reconciled in the issued estimate.',
    allowances: [
      {
        id: 'A-01', slug: 'millwork', label: 'Millwork', amount: 80000,
        includes: ['Bar die and back bar', 'Host stand', 'Banquette bases, if built in', 'Open-kitchen counter front'],
        basis: 'Illustrative installed package for an 80-seat room. No drawings, shop drawings, or fabricator quotation.',
        unresolved: 'Bar length and top material; whether the banquette is millwork or loose furniture (S-11).',
        responsible: 'Founder selects, with architect; project manager prices',
        decision: 'Selections approved before W5 long-lead release',
        milestone: 'M-04'
      },
      {
        id: 'A-02', slug: 'decorative-lighting', label: 'Decorative lighting', amount: 40000,
        includes: ['Pendants over the bar and banquette', 'Wall sconces', 'Dimming for decorative circuits'],
        basis: 'Illustrative fixture-and-install package. Fixture selections and quantities not received.',
        unresolved: 'Fixture selections, counts, and lead times; dimming control approach.',
        responsible: 'Founder selects, with architect or lighting designer',
        decision: 'Selections approved before W5 long-lead release',
        milestone: 'M-04'
      },
      {
        id: 'A-03', slug: 'finish-selections', label: 'Finish selections', amount: 30000,
        includes: ['Feature tile at the open-kitchen wall', 'Dining room wall finish', 'Flooring transition at the kitchen threshold'],
        basis: 'Illustrative premium over base finishes carried in the trade line.',
        unresolved: 'Tile, wall, and floor selections; cleanability at the kitchen threshold.',
        responsible: 'Founder selects, with architect',
        decision: 'Selections approved before W14 rough-in review',
        milestone: 'M-14'
      }
    ],
    exclusions: [
      'Owner-purchased kitchen equipment and furniture',
      'Architect and consultant fees',
      'Statutory permit and utility connection charges',
      'Leasing, financing, and pre-opening expenses',
      'Hazardous-material remediation and major off-site works'
    ],
    exclusionsNote: 'Construction coordination of excluded items can still be included: the purchase is excluded; utility connections and installation coordination may be priced (S-07).',
    assumptions: [
      'Second-generation restaurant space',
      'No structural expansion assumed',
      'Existing capacity and concealed conditions unverified'
    ],
    terms: [
      ['Drawing revision', 'Not established'],
      ['Pricing date', 'Not established'],
      ['Validity period', 'Not established'],
      ['Tax treatment', 'Not established'],
      ['Fee basis', 'Not established'],
      ['Treatment of changes', 'Not established']
    ],
    next: 'Price a detailed estimate against the architect’s drawings once D-01 and D-02 are resolved.',
    disclaimer: 'All figures are invented to test information design. They are not market guidance, a Freeman estimate, or a quotation. Amounts are rounded.'
  },

  /* ---------- 06 Decisions ---------- */
  decisions: {
    question: 'What are we deciding now, and what will Freeman do next?',
    heading: 'The next step is a working session.',
    lead: 'We propose reviewing the kitchen responsibility boundary, the existing building services, and a defined preconstruction scope. Freeman would return with a written scope, fee, and deliverable schedule for review.',
    rows: [
      { id: 'D-01', title: 'Confirm kitchen equipment purchasing and installation boundary', role: 'Founder, with PM recommendation', by: 'Before scope pricing', state: 'Open', consequence: 'Prevents omissions and double pricing', links: [['S-07', 'Responsibility boundary'], ['A-01', 'Millwork allowance'], ['M-21', 'W21 / equipment readiness']] },
      { id: 'D-02', title: 'Authorize existing-services and exhaust investigation', role: 'Founder, with architect’s input', by: 'Before construction baseline', state: 'Open', consequence: 'Tests schedule and cost assumptions', links: [['C-01', 'Utility capacity'], ['C-02', 'Exhaust route'], ['M-08', 'W8 / start gate']] },
      { id: 'D-03', title: 'Confirm preconstruction deliverables and fee', role: 'Founder, with Freeman principal', by: 'Before services begin', state: 'Open', consequence: 'Establishes the next engagement', links: [['B-03', 'General conditions and fee'], ['M-04', 'W4 / basis agreed']] }
    ],
    after: 'Construction authorization would follow a separate agreement. Reading or acknowledging this proposal does not authorize work.',
    actionNote: 'Opens a draft in your email application. Nothing is sent until you send it.'
  }
};
