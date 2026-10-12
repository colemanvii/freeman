/* CLIENT PORTAL — DEMONSTRATION DATA
 * ---------------------------------------------------------------
 * EVERYTHING IN THIS FILE IS SAMPLE DATA.
 * It describes no real client, project, schedule or decision.
 * Photographs are borrowed from Freeman's published portfolio and are
 * labelled as samples in the interface.
 *
 * When a live integration exists (e.g. Procore, a document store,
 * authenticated messaging), replace this file with an API adapter that
 * returns the same shape. The interface reads only these fields.
 * --------------------------------------------------------------- */
(function () {
  const CDN = 'https://cdn.prod.website-files.com/666b9585b7fd3bd24dfbba73/';
  window.FGC = window.FGC || {};
  window.FGC.portalDemo = {
    asOf: '2026-10-12',
    client: 'Sample Client',
    project: {
      id: 'DEMO-000',
      title: 'Restaurant Interior Renovation',
      location: 'Atlanta, Georgia (sample)',
      typology: 'Hospitality',
      status: 'On schedule',
      start: '2026-08-03',
      turnover: '2026-11-20',
      progress: 62,
      contract: 'Sample — not shown'
    },
    phases: [
      { name: 'Preconstruction', start: '2026-07-20', end: '2026-08-03', done: true },
      { name: 'Demolition', start: '2026-08-03', end: '2026-08-14', done: true },
      { name: 'Rough-in — MEP', start: '2026-08-14', end: '2026-09-11', done: true },
      { name: 'Inspections', start: '2026-09-08', end: '2026-09-18', done: true },
      { name: 'Drywall and ceilings', start: '2026-09-18', end: '2026-10-09', done: true },
      { name: 'Millwork and bar', start: '2026-10-05', end: '2026-10-30', done: false },
      { name: 'Finishes and flooring', start: '2026-10-19', end: '2026-11-10', done: false },
      { name: 'Equipment set', start: '2026-11-02', end: '2026-11-13', done: false },
      { name: 'Punch and turnover', start: '2026-11-11', end: '2026-11-20', done: false }
    ],
    decisions: [
      { id: 'D-07', title: 'Bar-top finish', due: '2026-10-15', note: 'Two samples on site. Selection holds the millwork fabrication slot.', status: 'Awaiting client' },
      { id: 'D-08', title: 'Banquette fabric', due: '2026-10-22', note: 'Designer to confirm colourway; client sign-off requested.', status: 'Awaiting designer' }
    ],
    week: [
      { status: 'Complete', text: 'Ceiling inspection passed' },
      { status: 'In progress', text: 'Bar die-wall framing and blocking' },
      { status: 'In progress', text: 'Millwork shop drawings — revision B review' },
      { status: 'Scheduled', text: 'Tile delivery, Thursday' }
    ],
    field: [
      { date: '2026-10-09', note: 'Sample image — bar area. Field photographs from the live project would appear here, dated and captioned.', src: CDN + '692db750b73187579c648585_Bocado%20Pizza_Bar.jpeg' },
      { date: '2026-10-02', note: 'Sample image — dining room.', src: CDN + '692db75041d703e9a18d4085_Bocado%20Pizza_Interior%20Seating.jpeg' },
      { date: '2026-09-25', note: 'Sample image — banquette and wall finishes.', src: CDN + '692dc08be0c1e5931e59c91a_Bocado-Pizza_Indoor-Seating_Crop.jpg' },
      { date: '2026-09-18', note: 'Sample image — working side of a bar.', src: CDN + '692db4045f9269e5b29545fd_O-Ku%20Atlanta_Behind%20Sushi%20Bar.jpeg' },
      { date: '2026-09-11', note: 'Sample image — exterior seating.', src: CDN + '692db7509743a79ea49fed6b_Bocado%20Pizza_Exterior%20Seating.jpeg' },
      { date: '2026-09-04', note: 'Sample image — timber detail.', src: CDN + '6916c0672d8bf0bdde0c6728_Beetlecat_Freeman%20General%20Contractors%204.jpg' }
    ],
    documents: [
      { no: 'A-101', title: 'Floor plan', rev: 'Rev 3', date: '2026-09-22', kind: 'Drawing', status: 'Current' },
      { no: 'A-401', title: 'Bar elevations', rev: 'Rev 2', date: '2026-09-29', kind: 'Drawing', status: 'Current' },
      { no: 'M-01', title: 'Millwork shop drawings', rev: 'Rev B', date: '2026-10-08', kind: 'Submittal', status: 'In review' },
      { no: 'FS-01', title: 'Approved finish schedule', rev: '—', date: '2026-09-15', kind: 'Schedule', status: 'Approved' },
      { no: 'MN-11', title: 'Owner meeting notes', rev: '—', date: '2026-10-07', kind: 'Minutes', status: 'Issued' },
      { no: 'CO-02', title: 'Change order — added blocking', rev: '—', date: '2026-09-30', kind: 'Change order', status: 'Executed' }
    ],
    messages: [
      { from: 'Project lead, Freeman GC', date: '2026-10-09', text: 'Ceiling inspection passed this morning. Millwork begins Monday. The bar-top selection is the one open item holding the fabrication slot — samples are on site whenever you can stop by.' },
      { from: 'Sample Client', date: '2026-10-09', text: 'Thanks. I can be there Wednesday afternoon.' },
      { from: 'Project lead, Freeman GC', date: '2026-10-10', text: 'Wednesday works. We will have both samples laid out under the bar lighting.' }
    ],
    team: [
      { role: 'Project lead', org: 'Freeman GC', name: 'Assigned per project' },
      { role: 'Superintendent', org: 'Freeman GC', name: 'Assigned per project' },
      { role: 'Interior design', org: 'Design team', name: 'Per project' },
      { role: 'Owner representative', org: 'Client', name: 'Sample Client' }
    ]
  };
})();
