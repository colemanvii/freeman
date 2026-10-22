/* FreemanAI — Interface Exploration 001. SAMPLE DATA.
   Every project, person, company, figure and document below is fictional,
   written to behave like a real Freeman week. Nothing here describes real work. */
(() => {
  'use strict';

  const TODAY = '2026-10-22';

  const ROLES = {
    owner: {
      label: 'OWNER', person: 'Owner', initials: 'OW',
      see: 'The company, this morning.',
      scope: 'All projects / all records',
      access: ['field', 'project', 'finance', 'company']
    },
    controller: {
      label: 'CONTROLLER', person: 'Renee Albright', initials: 'RA',
      see: 'Money in, money out, what is waiting.',
      scope: 'All projects / finance and contracts',
      access: ['project', 'finance', 'company']
    },
    pm: {
      label: 'PROJECT MANAGER', person: 'Lena Ortiz', initials: 'LO',
      see: 'Your two jobs, and what is stuck.',
      scope: 'Etowah Mercantile / Saltmarsh Oyster Bar',
      projects: ['2604', '2607'],
      access: ['field', 'project', 'company']
    },
    super: {
      label: 'SUPERINTENDENT', person: 'Wade Holcomb', initials: 'WH',
      see: 'Etowah Mercantile, today.',
      scope: 'Etowah Mercantile / field',
      projects: ['2604'],
      access: ['field', 'project', 'company']
    }
  };

  const PEOPLE = [
    { id: 'owner', name: 'Owner', role: 'Owner' },
    { id: 'renee', name: 'Renee Albright', role: 'Controller' },
    { id: 'lena', name: 'Lena Ortiz', role: 'Project manager' },
    { id: 'marcus', name: 'Marcus Bell', role: 'Project manager' },
    { id: 'wade', name: 'Wade Holcomb', role: 'Superintendent' },
    { id: 'tomas', name: 'Tomás Rivera', role: 'Superintendent' },
    { id: 'jay', name: 'Jay Kimsey', role: 'Estimator' }
  ];
  const ROLE_PERSON = { owner: 'owner', controller: 'renee', pm: 'lena', super: 'wade' };

  const PROJECTS = [
    { no: '2604', name: 'Etowah Mercantile', place: 'Cartersville, GA', type: 'Restaurant and market / adaptive reuse',
      contract: 4210000, billed: 0.68, phase: 'Interior finishes', pm: 'lena', super: 'wade', state: 'watch',
      note: 'Storefront change order waiting on owner. Finishes on sequence.' },
    { no: '2607', name: 'Saltmarsh Oyster Bar', place: 'Decatur, GA', type: 'Restaurant build-out',
      contract: 1880000, billed: 0.52, phase: 'MEP rough-in', pm: 'lena', super: 'tomas', state: 'late',
      note: 'Failed grease duct inspection 19 Oct. Four working days behind.' },
    { no: '2609', name: 'Pinecrest Clinic', place: 'Rome, GA', type: 'Medical office / ground up',
      contract: 3140000, billed: 0.31, phase: 'Framing and dry-in', pm: 'marcus', super: 'tomas', state: 'ok',
      note: 'Dry-in by 6 Nov if weather holds.' },
    { no: '2612', name: 'Allatoona Residence', place: 'Acworth, GA', type: 'Private residence',
      contract: 2560000, billed: 0.94, phase: 'Punch and closeout', pm: 'marcus', super: 'wade', state: 'ok',
      note: 'Six punch items open. Turnover 7 Nov.' },
    { no: '2615', name: 'Highland Row', place: 'Canton, GA', type: 'Townhomes / preconstruction',
      contract: 6800000, billed: 0, phase: 'Preconstruction', pm: 'marcus', super: null, state: 'ok',
      note: 'GMP due to owner 14 Nov.' }
  ];

  /* The record: every answer must point here. `access` decides who may see it. */
  const SOURCES = {
    'RFI-031': { kind: 'RFI', project: '2604', title: 'Storefront glazing at north elevation', author: 'Lena Ortiz', date: '2026-10-08', access: 'project',
      body: 'Existing masonry openings at the north elevation are 1-1/4" narrower than shown on A-401. Architect response 12 Oct: <mark>retain existing openings; switch to Kawneer 451T with 1" low-iron insulated glass</mark>. Revised shop drawings required.' },
    'MM-14': { kind: 'MINUTES', project: '2604', title: 'OAC meeting 14', author: 'Lena Ortiz', date: '2026-10-15', access: 'project',
      body: 'Item 14.3 Storefront. Owner agreed with RFI-031 direction. <mark>Owner asked for cost before approving</mark>; Freeman to issue PCO-012 by 17 Oct. Item 14.5 Tile. No change.' },
    'PCO-012': { kind: 'CHANGE', project: '2604', title: 'Storefront revision per RFI-031', author: 'Lena Ortiz', date: '2026-10-17', access: 'project',
      body: 'Low-iron glass upgrade and revised framing. North Georgia Glass $16,140; Freeman fee and bond $2,280. <mark>Total $18,420. Schedule impact: none if approved by 24 Oct</mark>; glass lead time is five weeks.' },
    'SUB-084110': { kind: 'SUBMITTAL', project: '2604', title: '08 41 10 Storefront shop drawings rev 2', author: 'North Georgia Glass', date: '2026-10-20', access: 'project',
      body: 'Revision 2 reflects RFI-031. <mark>Approved as noted by Hollis & Pryor, 21 Oct</mark>. Note: confirm sill height at door 104 in field.' },
    'SUB-093000': { kind: 'SUBMITTAL', project: '2604', title: '09 30 00 Restroom tile', author: 'Etowah Tile & Stone', date: '2026-09-30', access: 'project',
      body: 'Fireclay Tile, 3×12 handmade, colour Calcite, matte, <mark>stacked vertical bond, 1/8" joint, grout Mapei 77 Pewter</mark>. Approved 30 Sep. Floor: 2×2 hex unglazed, same grout.' },
    'DL-1019-2607': { kind: 'DAILY LOG', project: '2607', title: 'Daily log 19 Oct', author: 'Tomás Rivera', date: '2026-10-19', access: 'field',
      body: 'Mechanical rough-in inspection: <mark>failed. Grease duct clearance to combustibles at roof curb is 11", 18" required</mark>. Cobb Mechanical to re-route above bar. Crew 9. Weather clear 71°.' },
    'DL-1021-2607': { kind: 'DAILY LOG', project: '2607', title: 'Daily log 21 Oct', author: 'Tomás Rivera', date: '2026-10-21', access: 'field',
      body: 'Re-route 60% complete. <mark>Reinspection booked for Fri 24 Oct, 9:00</mark>. Hood vendor says delivery 30 Oct. Drywall held on bar wall until inspection passes.' },
    'EM-HOOD': { kind: 'EMAIL', project: '2607', title: 'Re: hood delivery', author: 'Capitol Kitchen Supply', date: '2026-10-20', access: 'project',
      body: 'Freight is confirmed. <mark>Expected delivery Tuesday 28 Oct</mark>, liftgate, call ahead.' },
    'SCH-2607': { kind: 'SCHEDULE', project: '2607', title: 'Schedule update 21 Oct', author: 'Lena Ortiz', date: '2026-10-21', access: 'project',
      body: 'Inspection failure pushes bar wall close-in and hood set. <mark>Net four working days on the critical path</mark>. Recovery: Saturday drywall crew 1 Nov.' },
    'LL-019': { kind: 'LESSON', project: null, title: 'Lesson 019 / grease duct clearances', author: 'Freeman operations', date: '2025-03-11', access: 'company',
      body: 'Same failure on a 2024 restaurant build-out. <mark>Check 18" duct clearance at roof curbs before framing the ceiling, not at rough-in</mark>. Add to pre-rough-in walk.' },
    'CR-OCT': { kind: 'COST REPORT', project: null, title: 'Cost report / week 43', author: 'Renee Albright', date: '2026-10-20', access: 'finance',
      body: 'General conditions to date vs budget: 2604 102%, <mark>2607 118%</mark>, 2609 91%, 2612 <mark>109%</mark>. 2607 overrun is supervision extension and inspection rework; 2612 is extended closeout.' },
    'PA-2604-07': { kind: 'PAY APP', project: '2604', title: 'Pay application 7 draft', author: 'Renee Albright', date: '2026-10-21', access: 'finance',
      body: 'Work this period $418,600. Retainage 10% $41,860. <mark>Net due this application $376,740</mark>. Approved CO-009 ($12,300) not yet on the schedule of values; add before submitting 25 Oct.' },
    'AR-AGING': { kind: 'RECEIVABLES', project: null, title: 'Receivables aging', author: 'Renee Albright', date: '2026-10-21', access: 'finance',
      body: 'Current $611,200. 31–60 days $148,900 (2612 pay app 9). <mark>61–90 days $38,500 (2607 pay app 4, owner disputes line 07 21 00)</mark>. Over 90: none.' },
    'COI-ETD': { kind: 'INSURANCE', project: '2609', title: 'Certificate / Etowah Drywall', author: 'Etowah Drywall', date: '2025-11-03', access: 'project',
      body: 'General liability and workers compensation. <mark>Expires 3 Nov 2026</mark>. Renewal not on file.' },
    'LW-COBB': { kind: 'LIEN WAIVER', project: '2607', title: 'Lien waivers / September', author: 'Renee Albright', date: '2026-10-21', access: 'finance',
      body: 'Received: Coosa Electric, Etowah Drywall. <mark>Missing: Cobb Mechanical, September conditional waiver</mark>. Payment held.' },
    'PUNCH-2612': { kind: 'PUNCH LIST', project: '2612', title: 'Punch list / walk 2', author: 'Marcus Bell', date: '2026-10-18', access: 'field',
      body: '23 items, 17 closed. <mark>Open: pantry door reveal, stair light dimmer, two paint touch-ups, gutter at porch, exterior hose bib</mark>. Owner walk 4 Nov.' },
    'CLOSE-2612': { kind: 'CLOSEOUT', project: '2612', title: 'Closeout register', author: 'Marcus Bell', date: '2026-10-20', access: 'project',
      body: 'O&M manuals 9 of 11. <mark>Missing: HVAC warranty registration, generator startup report</mark>. Attic stock delivered.' },
    'STD-DL': { kind: 'STANDARD', project: null, title: 'Freeman standard / daily log', author: 'Freeman operations', date: '2026-01-05', access: 'company',
      body: 'Every working day, before leaving site: <mark>crew counts by trade, weather, inspections, deliveries, visitors, delays with cause, and at least four photographs</mark> tied to a location. Delays must name who is responsible.' },
    'SPEC-0330': { kind: 'SPEC', project: '2609', title: '03 30 00 Cast-in-place concrete', author: 'Hollis & Pryor', date: '2026-06-02', access: 'project',
      body: 'Slab on grade: <mark>4,000 psi at 28 days, 4" slump ±1", 10 mil vapour retarder</mark>, saw cut within 12 hours.' },
    'DL-1021-2604': { kind: 'DAILY LOG', project: '2604', title: 'Daily log 21 Oct', author: 'Wade Holcomb', date: '2026-10-21', access: 'field',
      body: 'Crew 23: tile 4, millwork 6, paint 5, electric 4, Freeman 4. Restroom tile 70%. <mark>Bar top templating moved to Thu 23 Oct</mark>. No incidents.' }
  };

  /* Answers the prototype knows. A live system would compose these from the record. */
  const ANSWERS = [
    { id: 'storefront', match: ['storefront', 'glass', 'glazing', 'rfi-031', 'pco-012'],
      q: 'What did we decide on the storefront at Etowah Mercantile?',
      roles: ['owner', 'controller', 'pm', 'super'],
      parts: [
        ['Keep the existing masonry openings and switch to Kawneer 451T with 1" low-iron insulated glass.', ['RFI-031']],
        ['The owner agreed with the direction at OAC 14 but asked for cost first.', ['MM-14']],
        ['That cost is PCO-012, $18,420, still waiting on the owner. It has to be approved by 24 Oct or the five-week glass lead time moves the schedule.', ['PCO-012']],
        ['Shop drawings rev 2 are approved as noted; confirm the sill at door 104 in the field.', ['SUB-084110']]
      ],
      act: { label: 'Advance PCO-012 to the owner', kind: 'decision', ref: 'D-PCO012' } },
    { id: 'saltmarsh', match: ['saltmarsh', 'behind', 'late', 'delay', 'oyster'],
      q: 'Why is Saltmarsh behind?',
      roles: ['owner', 'controller', 'pm', 'super'],
      parts: [
        ['The mechanical rough-in inspection failed on 19 Oct: grease duct clearance at the roof curb was 11" against 18" required.', ['DL-1019-2607']],
        ['Cobb Mechanical is re-routing; reinspection is Friday 24 Oct at 9:00, and drywall on the bar wall is held until it passes.', ['DL-1021-2607']],
        ['Net effect is four working days on the critical path, with a Saturday drywall crew planned to recover.', ['SCH-2607']]
      ],
      conflict: { text: 'Hood delivery disagrees: the vendor says 28 Oct, the daily log says 30 Oct.', refs: ['EM-HOOD', 'DL-1021-2607'] },
      act: { label: 'Ask Tomás to confirm the hood date', kind: 'assign', to: 'tomas', project: '2607' } },
    { id: 'before', match: ['before', 'again', 'happened', 'lesson', 'grease', 'duct', 'clearance'],
      q: 'Have we had this duct clearance problem before?',
      roles: ['owner', 'controller', 'pm', 'super'],
      parts: [
        ['Yes. The same failure happened on a 2024 restaurant build-out.', ['LL-019']],
        ['The lesson recorded then: check the 18" clearance at roof curbs before the ceiling is framed, not at rough-in. It is not yet on the Saltmarsh pre-rough-in walk.', ['LL-019', 'DL-1019-2607']]
      ],
      act: { label: 'Add the check to Pinecrest pre-rough-in', kind: 'assign', to: 'marcus', project: '2609' } },
    { id: 'gc', match: ['general conditions', 'over', 'budget', 'overrun', 'margin', 'cost'],
      q: 'Which jobs are over on general conditions?',
      roles: ['owner', 'controller'],
      parts: [
        ['Two: Saltmarsh at 118% of budget to date and Allatoona at 109%.', ['CR-OCT']],
        ['Saltmarsh is supervision extension and inspection rework; Allatoona is extended closeout.', ['CR-OCT', 'SCH-2607']],
        ['Allatoona closeout is still missing the HVAC warranty registration and generator startup report.', ['CLOSE-2612']]
      ] },
    { id: 'billable', match: ['billable', 'bill', 'pay app', 'invoice', 'billing'],
      q: 'What is billable on Etowah Mercantile this month?',
      roles: ['owner', 'controller'],
      parts: [
        ['Pay application 7: $418,600 of work this period, less 10% retainage, $376,740 net.', ['PA-2604-07']],
        ['Approved CO-009 for $12,300 is not on the schedule of values yet. Add it before submitting on 25 Oct.', ['PA-2604-07']],
        ['PCO-012 is not billable until the owner approves it.', ['PCO-012']]
      ],
      act: { label: 'Assign CO-009 to the schedule of values', kind: 'assign', to: 'renee', project: '2604' } },
    { id: 'cash', match: ['receivable', 'owed', 'aging', 'collect', 'cash'],
      q: 'Who owes us money, and how old is it?',
      roles: ['owner', 'controller'],
      parts: [
        ['$611,200 is current and $148,900 is 31–60 days, all Allatoona pay app 9.', ['AR-AGING']],
        ['$38,500 is 61–90 days: Saltmarsh pay app 4, held because the owner disputes line 07 21 00.', ['AR-AGING']],
        ['Separately, Cobb Mechanical’s September lien waiver is missing, so their payment is held.', ['LW-COBB']]
      ] },
    { id: 'tile', match: ['tile', 'restroom', 'grout', 'bathroom'],
      q: 'What is the approved restroom tile at Etowah?',
      roles: ['owner', 'controller', 'pm', 'super'],
      parts: [
        ['Fireclay 3×12 handmade, colour Calcite, matte, stacked vertical bond with 1/8" joints and Mapei 77 Pewter grout.', ['SUB-093000']],
        ['Floors are 2×2 unglazed hex with the same grout. Walls were 70% set as of yesterday.', ['SUB-093000', 'DL-1021-2604']]
      ] },
    { id: 'turnover', match: ['allatoona', 'turnover', 'punch', 'closeout', 'open'],
      q: 'What is still open before Allatoona turns over?',
      roles: ['owner', 'controller', 'pm', 'super'],
      parts: [
        ['Six of 23 punch items: pantry door reveal, stair light dimmer, two paint touch-ups, porch gutter, exterior hose bib.', ['PUNCH-2612']],
        ['Two closeout documents are missing: HVAC warranty registration and the generator startup report.', ['CLOSE-2612']],
        ['The owner walk is 4 Nov; turnover 7 Nov.', ['PUNCH-2612']]
      ] },
    { id: 'insured', match: ['insur', 'coi', 'certificate', 'drywall'],
      q: 'Is Etowah Drywall insured for Pinecrest?',
      roles: ['owner', 'controller', 'pm', 'super'],
      parts: [
        ['Yes, until 3 Nov 2026. No renewal certificate is on file, and they are scheduled at Pinecrest through December.', ['COI-ETD']]
      ],
      act: { label: 'Request a renewed certificate', kind: 'assign', to: 'renee', project: '2609' } },
    { id: 'concrete', match: ['concrete', 'slab', 'mix', 'psi'],
      q: 'What is the slab mix at Pinecrest?',
      roles: ['owner', 'controller', 'pm', 'super'],
      parts: [
        ['4,000 psi at 28 days, 4" slump ±1", over a 10 mil vapour retarder; saw cut within 12 hours.', ['SPEC-0330']]
      ] },
    { id: 'dailylog', match: ['daily log', 'standard', 'log', 'how do we'],
      q: 'What goes in a Freeman daily log?',
      roles: ['owner', 'controller', 'pm', 'super'],
      parts: [
        ['Every working day before leaving site: crew counts by trade, weather, inspections, deliveries, visitors, delays with cause, and at least four located photographs.', ['STD-DL']],
        ['Every delay names who is responsible.', ['STD-DL']]
      ] }
  ];

  const SUGGEST = {
    owner: ['storefront', 'gc', 'saltmarsh', 'cash'],
    controller: ['billable', 'cash', 'gc', 'insured'],
    pm: ['saltmarsh', 'storefront', 'before', 'turnover'],
    super: ['tile', 'storefront', 'dailylog', 'before']
  };

  /* SEE: what is true now, per role. tone: signal | quiet */
  const SIGNALS = [
    { roles: ['owner'], tone: 'signal', project: '2604', text: 'PCO-012 storefront, $18,420, needs your decision by Fri 24 Oct.', ref: 'D-PCO012', time: '2D WAITING' },
    { roles: ['owner', 'controller', 'pm'], tone: 'signal', project: '2607', text: 'Saltmarsh is four working days behind after a failed duct inspection.', ref: 'SCH-2607', time: '19 OCT' },
    { roles: ['owner', 'controller'], tone: 'signal', project: '2607', text: '$38,500 at 61–90 days. Owner disputes line 07 21 00.', ref: 'AR-AGING', time: 'AGING' },
    { roles: ['owner', 'controller'], tone: 'quiet', project: null, text: 'General conditions over budget on two jobs: 2607 118%, 2612 109%.', ref: 'CR-OCT', time: 'WK 43' },
    { roles: ['owner'], tone: 'quiet', project: '2615', text: 'Highland Row GMP due to the owner 14 Nov. Two trade bids still out.', ref: null, time: '23 DAYS' },
    { roles: ['controller'], tone: 'signal', project: '2604', text: 'Pay app 7 goes out Sat 25 Oct. CO-009 is missing from the SOV.', ref: 'PA-2604-07', time: '3 DAYS' },
    { roles: ['controller', 'pm'], tone: 'signal', project: '2607', text: 'Cobb Mechanical September lien waiver missing. Payment held.', ref: 'LW-COBB', time: '21 OCT' },
    { roles: ['controller', 'owner'], tone: 'quiet', project: '2609', text: 'Etowah Drywall insurance expires 3 Nov. No renewal on file.', ref: 'COI-ETD', time: '12 DAYS' },
    { roles: ['pm'], tone: 'signal', project: '2604', text: 'Glass lead time is five weeks. PCO-012 approval by 24 Oct holds the schedule.', ref: 'PCO-012', time: '2 DAYS' },
    { roles: ['pm', 'super'], tone: 'quiet', project: '2604', text: 'Storefront shop drawings approved as noted. Confirm sill at door 104.', ref: 'SUB-084110', time: '21 OCT' },
    { roles: ['pm'], tone: 'quiet', project: '2607', text: 'Hood delivery: vendor says 28 Oct, site log says 30 Oct.', ref: 'EM-HOOD', time: 'CONFLICT' },
    { roles: ['super'], tone: 'signal', project: '2604', text: 'Bar top templating today, 10:00. Southern Millwork, two people.', ref: 'DL-1021-2604', time: '10:00' },
    { roles: ['super'], tone: 'quiet', project: '2604', text: 'Electrical rough-in inspection, mezzanine, Fri 24 Oct 13:00.', ref: null, time: 'FRI' },
    { roles: ['super'], tone: 'quiet', project: '2604', text: 'Delivery: restroom partitions, 14:30, east alley. Lift needed.', ref: null, time: '14:30' },
    { roles: ['owner', 'pm', 'super'], tone: 'quiet', project: '2612', text: 'Allatoona: six punch items open, owner walk 4 Nov.', ref: 'PUNCH-2612', time: '13 DAYS' }
  ];

  /* ACT: decisions and assignments that already exist. */
  const ITEMS = [
    { id: 'D-PCO012', short: 'PCO-012 storefront', kind: 'decision', project: '2604', title: 'Approve PCO-012 / storefront revision', amount: 18420, due: '2026-10-24',
      owner: 'owner', from: 'lena', state: 'waiting', refs: ['PCO-012', 'RFI-031', 'MM-14'],
      trail: [['2026-10-08', 'Lena Ortiz', 'Raised RFI-031'], ['2026-10-15', 'Owner', 'Asked for cost at OAC 14'], ['2026-10-17', 'Lena Ortiz', 'Issued PCO-012, $18,420']] },
    { id: 'D-RET2612', short: 'Allatoona retainage release', kind: 'decision', project: '2612', title: 'Release half of retainage at substantial completion', amount: 64000, due: '2026-11-07',
      owner: 'owner', from: 'renee', state: 'waiting', refs: ['CLOSE-2612', 'PUNCH-2612'],
      trail: [['2026-10-20', 'Renee Albright', 'Proposed 50% release against closeout register']] },
    { id: 'D-COBB', short: 'Cobb Mechanical payment hold', kind: 'decision', project: '2607', title: 'Hold Cobb Mechanical payment until waiver arrives', amount: 46210, due: '2026-10-27',
      owner: 'controller', from: 'renee', state: 'waiting', refs: ['LW-COBB'],
      trail: [['2026-10-21', 'Renee Albright', 'Waiver missing at pay cycle']] },
    { id: 'D-SAT', short: 'Saturday drywall crew', kind: 'decision', project: '2607', title: 'Saturday drywall crew to recover two days', amount: 3900, due: '2026-10-28',
      owner: 'pm', from: 'tomas', state: 'waiting', refs: ['SCH-2607'],
      trail: [['2026-10-21', 'Tomás Rivera', 'Proposed Saturday crew 1 Nov']] },
    { id: 'A-SILL', kind: 'assign', project: '2604', title: 'Field-verify sill height at door 104', due: '2026-10-23',
      owner: 'super', from: 'lena', state: 'open', refs: ['SUB-084110'],
      trail: [['2026-10-21', 'Lena Ortiz', 'Assigned from approved shop drawings']] },
    { id: 'A-PART', kind: 'assign', project: '2604', title: 'Book lift for partition delivery, 14:30', due: '2026-10-22',
      owner: 'super', from: 'wade', state: 'done', refs: [],
      trail: [['2026-10-20', 'Wade Holcomb', 'Booked with Sunbelt'], ['2026-10-21', 'Wade Holcomb', 'Confirmed']] }
  ];

  window.FREEMAN_AI = { TODAY, ROLES, PEOPLE, ROLE_PERSON, PROJECTS, SOURCES, ANSWERS, SUGGEST, SIGNALS, ITEMS };
})();
