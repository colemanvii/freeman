// Builds the Record's base map from sourced data into one compact module.
// Sources: us-atlas 3.0.1 (US Census, 1:10m) for state and county lines;
// OpenStreetMap via Overpass (ODbL) for interstates, rivers, lakes, places, city limits, streets.
// Usage: GEO_DIR=<raw downloads> TOPOJSON=<path to topojson-client> node build-geo.js v5/studies/the-record-001/geo.js
// The raw downloads and the queries that produce them are listed in README.md.
const fs = require('fs');
const path = require('path');
const topo = require(process.env.TOPOJSON || 'topojson-client');
const dir = process.env.GEO_DIR || __dirname;
const r = f => JSON.parse(fs.readFileSync(path.join(dir, f)));
const out = process.argv[2];

const LON0 = -84.6, LAT0 = 34.15, K = 1000, C = Math.cos(LAT0 * Math.PI / 180);
const P = (lon, lat) => [(lon - LON0) * C * K, (LAT0 - lat) * K];
const BOX = { x0: -1000, x1: 1000, y0: -1050, y1: 860 };
const inBox = ([x, y], pad = 0) => x > BOX.x0 - pad && x < BOX.x1 + pad && y > BOX.y0 - pad && y < BOX.y1 + pad;

function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let m = -1, md = tol * tol;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i]; let t = ((px - ax) * dx + (py - ay) * dy) / L; t = Math.max(0, Math.min(1, t));
      const ex = ax + t * dx - px, ey = ay + t * dy - py, d = ex * ex + ey * ey;
      if (d > md) { md = d; m = i; }
    }
    if (m > 0) { keep[m] = 1; st.push([a, m], [m, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
// Split a line where it leaves the padded box, simplify, and write an SVG path fragment.
function line(raw, tol, pad = 40, closed = false) {
  // Densify long straight runs (surveyed state lines) so clipping keeps the part inside the box
  const pts = [];
  raw.forEach((p, i) => {
    if (i) { const q = raw[i - 1], n = Math.floor(Math.hypot(p[0] - q[0], p[1] - q[1]) / 8); for (let k = 1; k < n; k++) pts.push([q[0] + (p[0] - q[0]) * k / n, q[1] + (p[1] - q[1]) * k / n]); }
    pts.push(p);
  });
  const runs = []; let cur = [];
  for (const p of pts) { if (inBox(p, pad)) cur.push(p); else { if (cur.length > 1) runs.push(cur); cur = []; } }
  if (cur.length > 1) runs.push(cur);
  return runs.map(run => {
    const s = dp(run, tol); if (s.length < 2) return '';
    return 'M' + s.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + (closed && s.length === run.length && run === pts ? 'Z' : '');
  }).join('');
}
const geomPts = g => g.map(n => P(n.lon, n.lat));

// State and county lines (Census via us-atlas)
const us = r('counties-10m.json');
const stateMesh = topo.mesh(us, us.objects.states, (a, b) => a !== b);
const coast = topo.mesh(us, us.objects.states, (a, b) => a === b);
const GA = '13';
const countyMesh = topo.mesh(us, us.objects.counties, (a, b) => a !== b && a.id.slice(0, 2) === b.id.slice(0, 2) && a.id.slice(0, 2) === GA);
const meshPath = (m, tol) => m.coordinates.map(ls => line(ls.map(([lon, lat]) => P(lon, lat)), tol)).join('');
const states = meshPath(stateMesh, .4);
const counties = meshPath(countyMesh, .5);

// Interstates (all member ways; dual carriageways read as one line at hairline)
const seen = new Set(); let interstates = '';
const shields = [];
for (const rel of r('interstates.json').elements) {
  for (const m of rel.members) {
    if (m.type !== 'way' || !m.geometry || seen.has(m.ref)) continue; seen.add(m.ref);
    interstates += line(geomPts(m.geometry), .35);
  }
}

// Rivers: the named rivers of north Georgia that the work sits beside
const RIVERS = ['Chattahoochee River', 'Etowah River', 'Coosa River', 'Oostanaula River', 'Coosawattee River', 'Conasauga River', 'Toccoa River', 'Chestatee River', 'Yellow River', 'South River', 'Cartecay River', 'Ellijay River', 'Nottely River', 'Hiwassee River', 'Tennessee River', 'Little Tallapoosa River', 'Tallapoosa River', 'Chattooga River', 'Ocoee River'];
let rivers = '';
const riverPts = {};
for (const w of r('rivers.json').elements) {
  if (!RIVERS.includes(w.tags.name)) continue;
  const pts = geomPts(w.geometry);
  rivers += line(pts, .3);
  (riverPts[w.tags.name] ||= []).push(...pts.filter(p => inBox(p)));
}

// Lakes: outer rings of the reservoirs
let lakes = '';
for (const e of r('lakes.json').elements) {
  const rings = e.type === 'way' ? [e.geometry] : e.members.filter(m => m.role === 'outer' && m.geometry).map(m => m.geometry);
  for (const g of rings) lakes += line(geomPts(g), .45, 40);
}

// City limits: Atlanta and Decatur (OSM admin_level 8)
let limits = '';
for (const e of r('atlanta.json').elements) for (const m of e.members) if (m.role === 'outer' && m.geometry) limits += line(geomPts(m.geometry), .12);

// Primary roads around Atlanta, kept for close zoom only
let primary = '';
for (const w of r('primary.json').elements) primary += line(geomPts(w.geometry), .06);
let local = '';
for (const w of r('local.json').elements) { const l = line(geomPts(w.geometry), .05); if (w.tags.highway === 'primary') primary += l; else local += l; }

// Places (OSM nodes). Tier decides the zoom at which a name appears.
const T1 = ['Atlanta', 'Chattanooga', 'Rome', 'Gainesville', 'Dalton', 'Marietta', 'Cartersville', 'Blue Ridge'];
const T2 = ['Adairsville', 'Calhoun', 'Ellijay', 'Jasper', 'Canton', 'Chatsworth', 'Dahlonega', 'Cumming', 'Alpharetta', 'Roswell', 'Decatur', 'Lawrenceville', 'Kennesaw', 'Woodstock', 'Dallas', 'Cedartown', 'Rockmart', 'Douglasville', 'LaFayette', 'Summerville', 'Murphy', 'Fort Payne', 'Carrollton', 'Newnan', 'Conyers', 'Buford', 'Sandy Springs', 'East Point', 'Smyrna'];
const places = [];
const allPlaces = r('places.json').elements.concat(r('majortowns.json').elements);
// Blue Ridge is a city but is absent from the city/town query result; use its OSM city hall (Nominatim way 270247829)
allPlaces.push({ lat: 34.86665, lon: -84.32624, tags: { name: 'Blue Ridge', place: 'town' } });
const used = new Set();
for (const n of allPlaces) {
  const name = n.tags.name; if (used.has(name)) continue;
  if (n.lon < -85.3 && name === "Jasper") continue; // Jasper, Tennessee shares the name
  const nb = n.tags.place === 'neighbourhood' || n.tags.place === 'suburb';
  const tier = T1.includes(name) ? 1 : T2.includes(name) ? 2 : nb ? 3 : 0;
  if (!tier) continue; used.add(name);
  const [x, y] = P(n.lon, n.lat); if (!inBox([x, y])) continue;
  places.push([name, +x.toFixed(1), +y.toFixed(1), tier]);
}

// River names, placed at the midpoint of each river's in-box course
const riverLabels = [];
for (const name of ['Chattahoochee River', 'Etowah River', 'Coosawattee River', 'Oostanaula River', 'Toccoa River', 'Conasauga River']) {
  const pts = riverPts[name]; if (!pts || !pts.length) continue;
  pts.sort((a, b) => a[1] - b[1]);
  const p = pts[Math.floor(pts.length * (name === 'Chattahoochee River' ? .42 : .5))];
  riverLabels.push([name.replace(' River', '').toUpperCase(), +p[0].toFixed(1), +p[1].toFixed(1)]);
}
const stateLabels = [['GEORGIA', ...P(-84.05, 34.42)], ['TENNESSEE', ...P(-85.2, 35.08)], ['NORTH CAROLINA', ...P(-83.9, 35.1)], ['ALABAMA', ...P(-85.55, 34.0)]]
  .map(([n, x, y]) => [n, +x.toFixed(1), +y.toFixed(1)]);

const data = { proj: { lon0: LON0, lat0: LAT0, k: K, cos: +C.toFixed(6) }, box: BOX, states, counties, interstates, rivers, lakes, limits, primary, local, places, riverLabels, stateLabels };
const js = `/* The Record — base map. Generated by studio/the-record-001/build-geo.js; do not edit by hand.
   State and county lines: US Census via us-atlas 3.0.1 (1:10m). Roads, streets, rivers, lakes, places, city limits:
   © OpenStreetMap contributors (ODbL), fetched ${new Date().toISOString().slice(0, 10)}. Local equirectangular projection about ${LAT0}°N, ${LON0}°. */
window.RECORD_GEO=${JSON.stringify(data)};
`;
fs.writeFileSync(out, js);
console.log('wrote', out, (js.length / 1024).toFixed(0) + ' KB', Object.fromEntries(Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? (v.length / 1024).toFixed(0) + 'K' : Array.isArray(v) ? v.length : '-'])));
