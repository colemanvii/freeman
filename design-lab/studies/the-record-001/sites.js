/* The Record — where each project sits, and how precisely we may say so.
   Identity, photography and story come from /records.js (the site's own register); this file adds only place and time.

   precision
     venue  a public business at its published street address (OSM / Nominatim, cross-checked against news or listings)
     area   a deliberately approximate area: private residential, healthcare, or a site not yet confirmed
     null   not placed: the location is not known

   year: completion year, only once verified by Freeman. Every year is empty in this study; nothing is estimated. */
window.RECORD_SITES = {
  checked: '2026-10-22',
  sites: {
    'beetlecat': { precision: 'venue', lat: 33.76234, lon: -84.35884, area: 'Inman Park, Atlanta', address: '299 N Highland Ave NE', source: 'OSM address point for 299 N Highland Ave NE; address per The Infatuation' },
    'the-optimist': { precision: 'venue', lat: 33.77985, lon: -84.41064, area: 'West Midtown, Atlanta', address: '914 Howell Mill Rd NW', source: 'OSM node 3021100658' },
    'o-ku-atlanta': { precision: 'venue', lat: 33.78412, lon: -84.41190, area: 'West Midtown, Atlanta', address: '1085 Howell Mill Rd NW', source: 'OSM address point; address per BizBash venue directory' },
    'savi-provisions': { precision: 'venue', lat: 33.78805, lon: -84.32566, area: 'Emory Village, Atlanta', address: '1593 N Decatur Rd', source: 'OSM address node 2119893351; opening reported by What Now Atlanta, March 2024' },
    'brewhouse-cafe': { precision: 'venue', lat: 33.75212, lon: -84.39321, area: 'South Downtown, Atlanta', address: '91 Broad St SW', source: 'OSM node 13975310342; Rough Draft Atlanta and Axios, September 2025' },
    'mule-train-atlanta': { precision: 'venue', lat: 33.75227, lon: -84.39324, area: 'South Downtown, Atlanta', address: '87 Broad St SW', source: 'OSM address point; address per Atlanta Magazine' },
    'broad-street-bbq': { precision: 'venue', lat: 33.75194, lon: -84.39303, area: 'South Downtown, Atlanta', address: '96 Broad St SW', source: 'OSM node 13975310341' },
    'barnsley-gardens': { precision: 'venue', lat: 34.29874, lon: -84.98641, area: 'Barnsley Resort, Adairsville', address: '597 Barnsley Gardens Rd', source: 'OSM node 10812691451 (resort); the pool is not mapped separately' },
    'dugans-pub': { precision: 'venue', lat: 34.29874, lon: -84.98641, area: 'Barnsley Resort, Adairsville', address: '597 Barnsley Gardens Rd', source: 'OSM node 10812691451 (resort); the pub is not mapped separately' },
    'woodlands-at-barnsley-resort': { precision: 'venue', lat: 34.29874, lon: -84.98641, area: 'Barnsley Resort, Adairsville', address: '597 Barnsley Gardens Rd', source: 'OSM node 10812691451 (resort)' },
    // Approximate by policy: private residences and a healthcare facility are shown as an area around the town centre.
    'la-cresta-on-main': { precision: 'area', lat: 34.86665, lon: -84.32624, radiusKm: 2.5, area: 'Blue Ridge, Georgia', reason: 'Private residences', source: 'Blue Ridge city hall, OSM way 270247829' },
    'dalton-surgery-center': { precision: 'area', lat: 34.77459, lon: -84.97023, radiusKm: 3, area: 'Dalton, Georgia', reason: 'Healthcare facility', source: 'Dalton city hall, OSM node 5397409639' },
    // Approximate because the site itself is not yet confirmed.
    'muchacho-decatur': { precision: 'area', lat: 33.77375, lon: -84.29618, radiusKm: 1.5, area: 'Decatur, Georgia', reason: 'Site to be confirmed', source: 'Decatur city hall, OSM way 40813538' },
    'azalea-marketplace': { precision: 'area', lat: 33.75432, lon: -84.38935, radiusKm: 1.2, area: 'Downtown, Atlanta', reason: 'Site to be confirmed', source: 'Downtown Atlanta; probable match Azalea Fresh Market, 25 Peachtree St NW (Savi Provisions partnership)' },
    // Bocado had several locations (West Midtown closed 2021; Sandy Springs 2024). Which one Freeman built is not known.
    'bocado-pizza': { precision: null, area: 'Atlanta, Georgia', reason: 'Location not on file' }
  },
  years: {}
};
