/* FreemanAI — Exploration 003: One Company, Many Perspectives. SAMPLE RECORD.
   Every project, person, company, quote, figure and document here is fictional.
   Real staff names appear only as role context in the role switcher.
   "Now" is fixed at Thursday 22 October 2026, 07:42, so every timestamp agrees. */
(() => {
  'use strict';

  const NOW = { date: '2026-10-22', time: '07:42' };

  /* Perspectives. Each is a distribution on the transmittal: who the set is issued to, what it is
     issued for, which jobs they carry and which tiers of money they may read. These are working
     hypotheses about the jobs, to be checked with Gabe and the team. In this study they are chosen by
     hand to preview a view; production recognises a person by sign-in and enforces access on the server.
     Access tiers: record (everyone) / cost (project cost: change, budget, commitments, pay apps) /
     company (company financials: WIP, margin, cash) / restricted (payroll, personnel: not in this sample). */
  const ROLES = {
    owner:      { label: 'Owner', who: 'Gabe', issued: 'Decision', lens: 'Decisions',
                  cares: 'Company performance, clients, risk, people, decisions',
                  jobs: 'all', cost: 'all', company: true },
    controller: { label: 'Controller', who: 'Macee', issued: 'Accounting', lens: 'Billing',
                  cares: 'Cash, commitments, billing, exceptions, reporting',
                  jobs: 'all', cost: 'all', company: true },
    pm:         { label: 'Project manager', who: 'Dillon', issued: 'Coordination', lens: 'Coordination',
                  cares: 'Schedule, procurement, RFIs, submittals, changes, subcontractors',
                  jobs: ['2604', '2607'], cost: 'assigned', company: false },
    super:      { label: 'Superintendent', who: 'Jimmy, Mac or Cameron', issued: 'Construction', lens: 'Field',
                  cares: 'Crews, sequence, drawings, inspections, safety, site conditions',
                  jobs: ['2604', '2612'], cost: 'none', company: false }
  };

  /* Fictional people on fictional jobs. */
  const PEOPLE = {
    wade:   { name: 'Wade Holcomb', role: 'Superintendent' },
    tomas:  { name: 'Tomás Rivera', role: 'Superintendent' },
    nell:   { name: 'Nell Duggan', role: 'Superintendent' },
    lena:   { name: 'Lena Ortiz', role: 'Project manager' },
    marcus: { name: 'Marcus Bell', role: 'Project manager' },
    renee:  { name: 'Renee Albright', role: 'Accounting' },
    jay:    { name: 'Jay Kimsey', role: 'Estimator' },
    ari:    { name: 'Ari Castellanos', role: 'Architect, Hollis & Pryor' },
    sam:    { name: 'Sam Whitlow', role: 'Safety' },
    pell:   { name: 'Ruth Pell', role: 'Client, Etowah Holdings' }
  };

  /* Schematic map of the north Georgia work area: x 0–100 west→east, y 0–70 north→south. */
  const MAP = {
    i75: 'M36 0 L41 9 L47 22 L52 28 L57 33 L63 39 L68 45 L74 52 L79 59 L83 66 L85 70',
    river: 'M74 15 C68 17 64 21 58 20 C53 19 50 23 46 25 C41 27 37 23 31 22 C25 21 21 17 16 16 C13 15 11 15 8 13',
    lake: 'M50 20 C54 17 59 18 60 22 C61 26 57 27 55 30 C53 32 50 30 50 27 C49 24 48 22 50 20 Z',
    towns: [['Marietta', 68, 45], ['Atlanta', 81, 66]],
    hq: [42, 28]
  };

  /* Plans: rooms on a 100 × 60 grid. rough → finish dates drive the hatch when time is dragged. */
  const PROJECTS = {
    '2604': {
      no: '2604', name: 'Etowah Mercantile', place: 'Cartersville', at: [47, 23],
      work: 'Restaurant and market in an 1890s brick warehouse',
      start: '2026-05-04', finish: '2026-12-18', phase: 'Interior finishes', pm: 'lena', super: 'wade',
      grid: { x: ['A', 'B', 'C', 'D', 'E', 'F'], y: ['1', '2', '3', '4'] },
      rooms: [
        { id: 'market', name: 'Market hall', x: 0, y: 0, w: 44, h: 34, rough: '2026-07-20', done: '2026-11-20' },
        { id: 'dining', name: 'Dining', x: 44, y: 0, w: 36, h: 34, rough: '2026-08-03', done: '2026-11-28' },
        { id: 'bar', name: 'Bar', x: 80, y: 0, w: 20, h: 22, rough: '2026-08-17', done: '2026-12-02' },
        { id: 'kitchen', name: 'Kitchen', x: 56, y: 34, w: 44, h: 26, rough: '2026-07-06', done: '2026-11-14' },
        { id: 'rest', name: 'Restrooms', x: 36, y: 34, w: 20, h: 26, rough: '2026-08-24', done: '2026-10-30' },
        { id: 'mezz', name: 'Mezzanine', x: 0, y: 34, w: 36, h: 26, rough: '2026-06-22', done: '2026-11-06' }
      ],
      label: 'Storefront / north elevation',
      milestones: [['2026-05-04', 'Notice to proceed'], ['2026-07-06', 'Rough-in starts'], ['2026-10-24', 'Storefront decision'], ['2026-11-06', 'Mezzanine complete'], ['2026-12-18', 'Turnover']],
      next: [['2026-10-22', '10:00', 'Bar top templating, Southern Millwork', 'wade'], ['2026-10-24', '13:00', 'Electrical rough-in inspection, mezzanine', 'wade'], ['2026-10-24', '', 'Storefront change decision due', 'lena']],
      people: ['lena', 'wade', 'ari']
    },
    '2607': {
      no: '2607', name: 'Saltmarsh Oyster Bar', place: 'Decatur', at: [90, 61],
      work: 'Restaurant build-out in a 1950s storefront',
      start: '2026-07-13', finish: '2026-12-11', phase: 'MEP rough-in', pm: 'lena', super: 'tomas',
      grid: { x: ['A', 'B', 'C', 'D', 'E'], y: ['1', '2', '3'] },
      rooms: [
        { id: 'dining', name: 'Dining', x: 0, y: 0, w: 52, h: 36, rough: '2026-09-07', done: '2026-11-30' },
        { id: 'raw', name: 'Raw bar', x: 52, y: 0, w: 22, h: 36, rough: '2026-09-14', done: '2026-12-03' },
        { id: 'bar', name: 'Bar', x: 74, y: 0, w: 26, h: 24, rough: '2026-09-21', done: '2026-12-05' },
        { id: 'kitchen', name: 'Kitchen', x: 52, y: 36, w: 48, h: 24, rough: '2026-09-01', done: '2026-11-24' },
        { id: 'rest', name: 'Restrooms', x: 30, y: 36, w: 22, h: 24, rough: '2026-09-28', done: '2026-11-17' },
        { id: 'patio', name: 'Patio', x: 0, y: 36, w: 30, h: 24, rough: '2026-10-26', done: '2026-11-21' }
      ],
      label: 'Street front / Church St',
      milestones: [['2026-07-13', 'Notice to proceed'], ['2026-10-19', 'Duct inspection failed'], ['2026-10-24', 'Reinspection'], ['2026-12-11', 'Turnover (was 5 Dec)']],
      next: [['2026-10-24', '09:00', 'Mechanical reinspection, grease duct', 'tomas'], ['2026-10-28', '', 'Hood delivery (dates disagree)', 'tomas'], ['2026-11-01', '', 'Saturday drywall crew to recover two days', 'lena']],
      people: ['lena', 'tomas']
    },
    '2609': {
      no: '2609', name: 'Pinecrest Clinic', place: 'Rome', at: [13, 17],
      work: 'Single-storey medical office, ground up',
      start: '2026-08-10', finish: '2027-03-26', phase: 'Framing and dry-in', pm: 'marcus', super: 'nell',
      grid: { x: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], y: ['1', '2', '3'] },
      rooms: [
        { id: 'wait', name: 'Waiting', x: 0, y: 0, w: 30, h: 30, rough: '2026-11-16', done: '2027-02-26' },
        { id: 'exam', name: 'Exam rooms', x: 30, y: 0, w: 50, h: 30, rough: '2026-11-23', done: '2027-03-05' },
        { id: 'proc', name: 'Procedure', x: 80, y: 0, w: 20, h: 60, rough: '2026-11-30', done: '2027-03-12' },
        { id: 'staff', name: 'Staff', x: 0, y: 30, w: 40, h: 30, rough: '2026-12-07', done: '2027-03-05' },
        { id: 'mech', name: 'Mechanical', x: 40, y: 30, w: 40, h: 30, rough: '2026-11-09', done: '2027-02-19' }
      ],
      label: 'Entry / east',
      milestones: [['2026-08-10', 'Notice to proceed'], ['2026-09-21', 'Slab poured'], ['2026-11-06', 'Dry-in'], ['2027-03-26', 'Turnover']],
      next: [['2026-10-23', '', 'East wing trusses complete', 'nell'], ['2026-11-03', '', 'Etowah Drywall insurance expires', 'marcus'], ['2026-11-06', '', 'Dry-in, weather permitting', 'nell']],
      people: ['marcus', 'nell']
    },
    '2612': {
      no: '2612', name: 'Allatoona Residence', place: 'Acworth', at: [58, 31],
      work: 'Private residence on the lake',
      start: '2025-11-03', finish: '2026-11-07', phase: 'Punch and closeout', pm: 'marcus', super: 'wade',
      grid: { x: ['A', 'B', 'C', 'D', 'E'], y: ['1', '2', '3'] },
      rooms: [
        { id: 'living', name: 'Living', x: 0, y: 0, w: 46, h: 34, rough: '2026-04-06', done: '2026-10-09' },
        { id: 'kitchen', name: 'Kitchen', x: 46, y: 0, w: 30, h: 34, rough: '2026-04-13', done: '2026-10-16' },
        { id: 'porch', name: 'Porch', x: 76, y: 0, w: 24, h: 60, rough: '2026-05-04', done: '2026-10-30' },
        { id: 'beds', name: 'Bedrooms', x: 0, y: 34, w: 50, h: 26, rough: '2026-04-20', done: '2026-10-02' },
        { id: 'stair', name: 'Stair', x: 50, y: 34, w: 26, h: 26, rough: '2026-04-20', done: '2026-11-04' }
      ],
      label: 'Lake side / south',
      milestones: [['2025-11-03', 'Notice to proceed'], ['2026-11-04', 'Owner walk'], ['2026-11-07', 'Turnover']],
      next: [['2026-11-04', '', 'Owner walk', 'marcus'], ['2026-11-07', '', 'Turnover', 'marcus']],
      people: ['marcus', 'wade']
    },
    '2615': {
      no: '2615', name: 'Highland Row', place: 'Canton', at: [74, 18],
      work: 'Eight townhomes, preconstruction',
      start: '2027-01-11', finish: '2027-12-17', phase: 'Preconstruction', pm: 'marcus', super: null,
      grid: { x: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'], y: ['1', '2'] },
      rooms: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ id: 'u' + (i + 1), name: 'Unit ' + (i + 1), x: i * 12.5, y: 12, w: 12.5, h: 40, rough: '2027-05-03', done: '2027-11-19' })),
      label: 'Highland Row / street',
      milestones: [['2026-10-21', 'Trade bids due'], ['2026-11-14', 'GMP to owner'], ['2027-01-11', 'Start']],
      next: [['2026-11-14', '', 'GMP to the owner', 'jay']],
      people: ['marcus', 'jay']
    }
  };

  /* The record. Every claim on a sheet points to one of these.
     access: field | project | memory (everyone) / cost / company (money tiers, see ROLES).
     Figures inside a record are marked {{cost:…}} or {{company:…}}: a reader without that tier still
     sees the record, with the figure hatched out and labelled with who can read it. */
  const SOURCES = {
    'DL-2604-1021': { kind: 'Daily log', project: '2604', at: ['2026-10-21', '16:40'], by: 'wade', access: 'field', room: 'rest', pin: [51, 46],
      body: 'Crew 23: tile 4, millwork 6, paint 5, electric 4, Freeman 4. <mark>Restroom wall tile 70% set.</mark> Bar top templating moved to Thu 23 Oct. No incidents.' },
    'FN-2604-0705': { kind: 'Field note', project: '2604', at: ['2026-10-22', '07:05'], by: 'wade', access: 'field', room: 'bar', pin: [90, 10],
      body: 'Southern Millwork confirmed for <mark>bar top templating today at 10:00</mark>, two people. Moved up a day; counters are clear.' },
    'PH-2604-0648': { kind: 'Photograph', project: '2604', at: ['2026-10-22', '06:48'], by: 'wade', access: 'field', room: 'rest', pin: [44, 48], photo: true,
      body: 'Restroom 1, east wall. <mark>Stacked bond running true at the vanity return.</mark> Sample photograph placeholder.' },
    'RFI-031': { kind: 'RFI', project: '2604', at: ['2026-10-08', '11:20'], by: 'lena', access: 'project', room: 'market', pin: [30, 1],
      body: 'North elevation masonry openings are 1-1/4" narrower than A-401. Architect response 12 Oct: <mark>keep the existing openings; switch to a narrower storefront frame with 1" low-iron glass.</mark>' },
    'MM-14': { kind: 'OAC minutes', project: '2604', at: ['2026-10-15', '10:00'], by: 'lena', access: 'project', room: null,
      body: 'Item 14.3 Storefront. The client (Etowah Holdings) agreed with the RFI-031 direction and <mark>asked for the change cost before approving.</mark>' },
    'PCO-012': { kind: 'Change proposal', project: '2604', at: ['2026-10-17', '15:10'], by: 'lena', access: 'project', room: 'market', pin: [22, 1],
      body: 'Storefront revision per RFI-031. Total {{cost:$18,420}}. <mark>Glass lead time five weeks; approve by 24 Oct to hold turnover.</mark> Sent to the client 17 Oct.' },
    'EM-2604-PELL': { kind: 'Email', project: '2604', at: ['2026-10-20', '16:05'], by: 'pell', access: 'project', room: null,
      body: 'Thanks for the storefront number. <mark>We are reviewing it with our lender and will come back early next week.</mark>' },
    'LA-2604-43': { kind: 'Look-ahead', project: '2604', at: ['2026-10-21', '17:10'], by: 'wade', access: 'project', room: null,
      body: 'Three weeks. Thu: bar top templating. Fri 13:00: mezzanine electrical inspection; mezzanine ceiling closes Mon 27 Oct if it passes. <mark>North openings stay boarded until the storefront frame arrives, five weeks after release</mark>; one week to install.' },
    'SCH-2604': { kind: 'Schedule', project: '2604', at: ['2026-10-17', '16:00'], by: 'lena', access: 'project', room: null,
      body: 'Baseline rev 4 by area. <mark>Market hall: rough-in 20 Jul, complete 20 Nov.</mark> Restrooms complete 30 Oct; mezzanine 6 Nov; turnover 18 Dec.' },
    'WX-1022': { kind: 'Forecast', project: '2604', at: ['2026-10-22', '06:00'], by: null, from: 'National Weather Service (sample)', access: 'project', room: null,
      body: 'Cartersville. <mark>Rain Sunday 26 Oct, 1.2 in expected</mark>, gusts to 25 mph.' },
    'SOV-2604-07': { kind: 'Schedule of values', project: '2604', at: ['2026-10-21', '12:00'], by: 'renee', access: 'cost', room: null,
      body: 'Pay app 7 draft, billed to date by area. Mezzanine 85%, kitchen 80%, restrooms 90%, dining 65%, bar 60%, <mark>market hall 55% of a {{cost:$420,000}} line</mark>.' },
    'WIP-0930': { kind: 'WIP schedule', project: '2604', at: ['2026-10-05', '09:00'], by: 'renee', access: 'memory', room: null,
      body: 'Etowah Mercantile: contract {{company:$2,412,000}}. <mark>Projected margin {{company:9.8%}} against {{company:11.5%}} at bid</mark>, mostly the July masonry delay.' },
    'SUB-084110': { kind: 'Submittal', project: '2604', at: ['2026-10-21', '09:30'], by: 'ari', access: 'project', room: 'market', pin: [38, 1],
      body: 'Storefront shop drawings rev 2 <mark>approved as noted.</mark> Confirm sill height at door 104 in the field.' },
    'INS-2604-1024': { kind: 'Inspection', project: '2604', at: ['2026-10-20', '14:00'], by: 'wade', access: 'field', room: 'mezz', pin: [18, 48],
      body: 'Electrical rough-in inspection for the mezzanine <mark>booked Fri 24 Oct at 13:00.</mark>' },

    'DL-2607-1019': { kind: 'Daily log', project: '2607', at: ['2026-10-19', '15:55'], by: 'tomas', access: 'field', room: 'kitchen', pin: [80, 44],
      body: 'Mechanical rough-in inspection <mark>failed: grease duct is 11" from combustible framing at the roof curb; 18" required.</mark> Cobb Mechanical to re-route above the bar.' },
    'EM-2607-HOOD': { kind: 'Email', project: '2607', at: ['2026-10-20', '13:12'], by: null, from: 'Capitol Kitchen Supply', access: 'project', room: 'kitchen', pin: [70, 52],
      body: 'Freight confirmed. <mark>Expected delivery Tuesday 28 Oct</mark>, liftgate, call ahead.' },
    'DL-2607-1021': { kind: 'Daily log', project: '2607', at: ['2026-10-21', '16:20'], by: 'tomas', access: 'field', room: 'kitchen', pin: [64, 46],
      body: 'Re-route 60% complete. Reinspection booked for Fri 24 Oct, 9:00. <mark>Hood vendor says delivery 30 Oct.</mark>' },
    'FN-2607-0652': { kind: 'Field note', project: '2607', at: ['2026-10-22', '06:52'], by: 'tomas', access: 'field', room: 'kitchen', pin: [86, 40],
      body: '<mark>Duct re-route complete.</mark> 19" measured at the curb. Ready for Friday reinspection. Bar wall stays open until it passes.' },
    'SCH-2607': { kind: 'Schedule update', project: '2607', at: ['2026-10-21', '17:30'], by: 'lena', access: 'project', room: null,
      body: 'Inspection failure pushes bar wall close-in and hood set. <mark>Turnover moves from 5 Dec to 11 Dec</mark> unless the Saturday crew recovers two days.' },

    'FN-2609-0720': { kind: 'Field note', project: '2609', at: ['2026-10-22', '07:20'], by: 'nell', access: 'field', room: 'exam', pin: [55, 6],
      body: '<mark>East wing trusses set and braced.</mark> West wing tomorrow. Rain Sunday; sheathing first.' },
    'SO-2609-0731': { kind: 'Safety observation', project: '2609', at: ['2026-10-22', '07:31'], by: 'sam', access: 'field', room: 'proc', pin: [90, 30],
      body: '<mark>Two framers tied off to a truss that was not yet braced.</mark> Stopped, re-anchored to the beam. Toolbox talk at 12:00.' },
    'COI-ETD': { kind: 'Insurance certificate', project: '2609', at: ['2025-11-03', '09:00'], by: null, from: 'Etowah Drywall', access: 'project', room: null,
      body: 'General liability and workers compensation <mark>expire 3 Nov 2026.</mark> No renewal on file.' },

    'CM-2609-ETD': { kind: 'Commitment', project: '2609', at: ['2026-10-20', '08:00'], by: 'renee', access: 'cost', room: null,
      body: 'Etowah Drywall subcontract, Pinecrest. Open balance {{cost:$64,300}}. <mark>Payments are held without a current insurance certificate.</mark>' },

    'PW-2612-0630': { kind: 'Punch walk', project: '2612', at: ['2026-10-22', '06:30'], by: 'marcus', access: 'field', room: 'stair', pin: [62, 46],
      body: 'Stair light dimmer replaced; porch gutter re-hung. <mark>Four punch items left</mark> before the owner walk 4 Nov.' },
    'BID-2615': { kind: 'Bid log', project: '2615', at: ['2026-10-21', '17:00'], by: 'jay', access: 'project', room: null,
      body: 'Received 14 of 16 trade bids. <mark>Framing and windows still out</mark>; follow-up today.' },

    'PA-2604-07': { kind: 'Pay application', project: '2604', at: ['2026-10-21', '12:00'], by: 'renee', access: 'cost', room: null,
      body: 'Pay app 7 draft: <mark>net due {{cost:$376,740}}</mark> after retainage. Approved CO-009 not yet on the schedule of values. Goes out Sat 25 Oct.' },

    'P-019': { kind: 'Precedent', project: null, at: ['2024-04-16', '10:00'], by: null, from: 'Freeman operations (sample)', access: 'memory', room: null,
      body: 'Larkin Street Kitchen (fictional, 2024). Grease duct 10" from framing at the curb; failed rough-in. <mark>Solved with a listed field-applied duct wrap, which permits reduced clearance; passed reinspection in one day.</mark>' },
    'L-019': { kind: 'Lesson', project: null, at: ['2024-05-02', '09:00'], by: null, from: 'Freeman operations (sample)', access: 'memory', room: null,
      body: '<mark>Measure duct clearance at roof curbs before the ceiling is framed</mark>, not at rough-in. Ask the inspector to pre-walk kitchens with a curb penetration.' },
    'P-011': { kind: 'Precedent', project: null, at: ['2023-09-12', '10:00'], by: null, from: 'Freeman operations (sample)', access: 'company', room: null,
      body: 'Fulton Mill Lofts (fictional, 2023). Existing openings were smaller than drawn. <mark>Laser-measured every opening before shop drawings</mark>; storefront fit without a change.' }
  };

  /* Pulse: what changed since 06:00, in order. Finance lines only for owner and controller. */
  const DISPATCH = ['PW-2612-0630', 'PH-2604-0648', 'FN-2607-0652', 'FN-2604-0705', 'FN-2609-0720', 'SO-2609-0731'];
  const ATTENTION = [
    { src: 'EM-2607-HOOD', with: 'DL-2607-1021', text: 'Hood delivery dates disagree: 28 Oct or 30 Oct.', who: 'tomas', due: '2026-10-23', conflict: true, for: ['pm', 'super'] },
    { src: 'PCO-012', with: 'EM-2604-PELL', text: 'Storefront: the client answers “early next week”; the glass deadline is Friday.', who: 'lena', due: '2026-10-24', conflict: true, for: ['owner', 'pm'] },
    { src: 'SO-2609-0731', text: 'Tie-off to unbraced truss at Pinecrest. Toolbox talk at 12:00.', who: 'sam', due: '2026-10-22', for: ['owner', 'super'] },
    { src: 'COI-ETD', text: 'Etowah Drywall insurance expires 3 Nov with no renewal on file.', who: 'marcus', due: '2026-11-03', for: ['controller', 'pm'] },
    { src: 'PA-2604-07', text: 'Pay app 7 goes out Saturday; CO-009 is missing from it.', who: 'renee', due: '2026-10-25', finance: true, for: ['controller'] }
  ];

  const PRECEDENTS = {
    duct: { id: 'P-019', lesson: 'L-019', now: 'DL-2607-1019', title: 'Grease duct clearance at a roof curb',
      thisJob: { project: '2607', clearance: 11, fix: 'Re-route above the bar', days: 4 },
      then: { name: 'Larkin Street Kitchen', year: 2024, clearance: 10, fix: 'Listed duct wrap', days: 1 },
      match: ['Same failure: clearance to combustibles at the roof curb', 'Same stage: found at rough-in inspection', 'Similar kitchen hood and curb'],
      reuse: [['Measure curb clearance before the ceiling is framed', 'L-019'], ['Price a listed duct wrap as the one-day option', 'P-019'], ['Ask the inspector to pre-walk the kitchen', 'L-019']],
      apply: { project: '2609', text: 'Add the curb clearance check to the Pinecrest pre-rough-in walk' } },
    opening: { id: 'P-011', lesson: null, now: 'RFI-031', title: 'Existing openings smaller than drawn',
      thisJob: { project: '2604' }, then: { name: 'Fulton Mill Lofts', year: 2023 },
      match: ['Same condition: existing masonry openings smaller than drawn', 'Older building, adaptive reuse'],
      reuse: [['Laser-measure every opening before shop drawings', 'P-011']],
      apply: { project: '2609', text: 'Laser-measure openings before the Pinecrest storefront submittal' } }
  };

  /* Facts: the statements FreemanAI can make about a job, each tied to the record. Every perspective
     reads from this one list, so two people asking the same question can lead differently but never
     disagree. kind: record (default) | inferred (FreemanAI's reading of cited records, with its basis) |
     conflict (records disagree) | vif (not in the record: verify in field, with who would).
     tier: the money tier needed to read it. */
  const FACTS = {
    '2604': {
      phase:    { t: 'Interior finishes, on sequence for the 18 Dec turnover.', src: ['SCH-2604'] },
      bartop:   { t: 'The bar top is templated today at 10:00.', src: ['FN-2604-0705'] },
      tile:     { t: 'Restroom wall tile is 70% set.', src: ['DL-2604-1021'] },
      insp:     { t: 'The mezzanine electrical inspection is Friday at 13:00; its ceiling closes Monday if it passes.', src: ['INS-2604-1024', 'LA-2604-43'] },
      rfi:      { t: 'The architect kept the existing north openings and narrowed the storefront frame instead.', src: ['RFI-031'] },
      deadline: { t: 'The storefront change has to be approved by Friday 24 Oct to hold the five-week glass order.', src: ['PCO-012'] },
      client:   { t: 'The client wrote on 20 Oct that they will answer “early next week”, after their lender reviews it.', src: ['EM-2604-PELL'] },
      gap:      { t: 'Early next week is after Friday’s glass deadline.', src: ['PCO-012', 'EM-2604-PELL'], kind: 'conflict' },
      float:    { t: 'If the answer comes Tuesday 28 Oct, the frame is in by 9 Dec and the float to turnover falls from 13 days to 9.', src: ['PCO-012', 'LA-2604-43', 'SCH-2604'], kind: 'inferred',
                  basis: 'Five weeks of lead time and one week to install, counted from the release date, against the 18 Dec turnover. Assumes the glazier holds the slot, which is not confirmed.' },
      boarded:  { t: 'The north openings stay boarded until the frame arrives.', src: ['LA-2604-43'] },
      rain:     { t: 'Rain is forecast Sunday, 1.2 inches, against the boarded north wall.', src: ['WX-1022'] },
      sill:     { t: 'Shop drawings are approved as noted; the sill height at door 104 has not been measured.', src: ['SUB-084110'], kind: 'vif', vif: 'Sill height at door 104', owner: 'wade' },
      cost:     { t: 'The change is $18,420.', src: ['PCO-012'], tier: 'cost' },
      billable: { t: 'It cannot be billed until the client approves it, so it is not on pay app 7.', src: ['PCO-012', 'PA-2604-07'], tier: 'cost' },
      pay:      { t: 'Pay app 7 nets $376,740 after retainage and goes out Saturday.', src: ['PA-2604-07'], tier: 'cost' },
      co009:    { t: 'Approved CO-009 is missing from it.', src: ['PA-2604-07'], tier: 'cost', kind: 'conflict' },
      under:    { t: 'The market hall is billed at 55%; the schedule puts it near 76%. That is about $88,000 of earned work that may belong on pay app 7.', src: ['SOV-2604-07', 'SCH-2604'], tier: 'cost', kind: 'inferred',
                  basis: 'Schedule progress (rough-in 20 Jul to complete 20 Nov, read on 22 Oct) against the billed share of a $420,000 line. Schedule progress is not field progress.' },
      walk:     { t: 'Nobody has recorded market hall progress since rough-in.', src: [], kind: 'vif', vif: 'Market hall percent complete', owner: 'wade', tier: 'cost' },
      margin:   { t: 'Projected margin is 9.8% against 11.5% at bid.', src: ['WIP-0930'], tier: 'company' }
    }
  };

  /* Lenses: how each perspective reads the same facts. lead: the order they are read in. layer: what is
     drawn over the shared plan. marks: dates on the time rule. act: what this person can start from
     here. brief: what this desk is watching, told to the others on the sheet (never a figure). */
  const LENSES = {
    '2604': {
      owner: {
        lead: ['deadline', 'client', 'gap', 'float', 'cost', 'margin', 'phase'],
        brief: 'Watching the client’s storefront answer against Friday.',
        marks: [['2026-10-24', 'Storefront deadline'], ['2026-10-28', 'Client’s “early next week”'], ['2026-12-09', 'Storefront in, if Tuesday'], ['2026-12-18', 'Turnover']],
        layer: [{ cloud: [36, -4.4, 40, 4.4], tag: 'Storefront / client decision', sub: 'Due 24 Oct / answer ~28 Oct', at: [46, 12] },
                { at: [58, 52], tag: 'Turnover 18 Dec', sub: 'Float 13 → 9 days ≈', inferred: true }],
        act: { t: 'Decide whether to call the client before Friday.', due: '2026-10-23', btn: 'Ask Lena to set up the call', kind: 'Request', note: 'Set up a call with Ruth Pell before Friday about the storefront answer and the glass deadline.' }
      },
      controller: {
        lead: ['pay', 'co009', 'under', 'walk', 'billable', 'cost', 'margin'],
        brief: 'Pay app 7 goes out Saturday with two lines to check.',
        marks: [['2026-10-25', 'Pay app 7 out'], ['2026-11-25', 'Pay app 8'], ['2026-12-18', 'Turnover / retainage']],
        layer: [{ billed: { market: 55, dining: 65, bar: 60, kitchen: 80, rest: 90, mezz: 85 } }],
        act: { t: 'Get market hall progress confirmed before Saturday.', due: '2026-10-24', btn: 'Ask the site to verify', kind: 'Verify', note: 'Confirm market hall percent complete before pay app 7 goes out Saturday.' }
      },
      pm: {
        lead: ['deadline', 'client', 'gap', 'float', 'cost', 'sill', 'insp', 'bartop'],
        brief: 'Holding the glass slot and closing the submittal note.',
        marks: [['2026-10-24', 'Storefront deadline / inspection'], ['2026-11-28', 'Glass, if released Friday'], ['2026-12-02', 'Glass, if released Tuesday'], ['2026-12-18', 'Turnover']],
        layer: [{ cloud: [36, -4.4, 40, 4.4], tag: 'PCO-012 / ball: client', sub: 'Release by Fri or glass slips', at: [46, 12] },
                { room: 'mezz', tag: 'Inspection Fri 13:00', sub: 'Ceiling closes Mon if it passes' },
                { room: 'bar', tag: 'Templating 10:00' },
                { vif: [36, 0], tag: 'V.I.F. sill at 104' }],
        act: { t: 'Ask the glazier to hold the slot to Tuesday 28 Oct.', due: '2026-10-23', btn: 'File the request', kind: 'Request', note: 'Ask the glazier to hold the storefront glass slot to Tuesday 28 Oct.' }
      },
      super: {
        lead: ['bartop', 'tile', 'insp', 'sill', 'rain', 'boarded', 'gap', 'float'],
        brief: 'Bar top today, inspection Friday, rain Sunday.',
        marks: [['2026-10-22', 'Bar top templating'], ['2026-10-24', 'Mezzanine inspection'], ['2026-10-26', 'Rain'], ['2026-10-27', 'Mezzanine ceiling closes'], ['2026-11-06', 'Mezzanine complete']],
        layer: [{ boarded: [0, 80], tag: 'North openings boarded', sub: 'Rain Sun 26 Oct' },
                { room: 'rest', tag: 'Tile ×4', sub: '70% set' }, { room: 'bar', tag: 'Millwork ×6', sub: 'Template 10:00' },
                { room: 'dining', tag: 'Paint ×5' }, { room: 'mezz', tag: 'Electric ×4', sub: 'Inspection Fri 13:00' },
                { room: 'market', tag: 'Freeman ×4' }, { vif: [36, 0], tag: 'V.I.F. sill at 104' }],
        act: { t: 'Measure the sill height at door 104.', due: '2026-10-24', btn: 'Capture the measurement', capture: { kind: 'Observation', pin: [36, 2], note: 'Door 104 sill height measured at ' } }
      }
    }
  };

  window.FAI = { NOW, ROLES, PEOPLE, MAP, PROJECTS, SOURCES, DISPATCH, ATTENTION, PRECEDENTS, FACTS, LENSES };
})();
