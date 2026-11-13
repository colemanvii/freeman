// Map full bleed — the ground around North Georgia's survey box, so the map fills the page.
//
// geo.js stops at its box (about 1.2° either side of 34.15°N 84.6°W). On a wide screen the opening view is
// wider than that box, which left bare paper either side of a framed rectangle. This draws the surrounding
// ground in the SAME local equirectangular projection as geo.js, for use outside the box only:
//   US Census via us-atlas 3.0.1 (1:10m): state and county lines (the same source as geo.js's own lines)
//   Natural Earth 5.1.2 (public domain, 1:10m): rivers, lakes, Interstates, towns
// geo.js itself is not changed.
//
// Usage: TOOLS=<dir with node_modules/us-atlas, topojson-client> NE=<dir of Natural Earth geojson>
//        node studio/map-full-bleed/build-surround.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const require = createRequire(path.join(process.env.TOOLS, 'node_modules', 'x.js'));
const topo = require('topojson-client');
const rd = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const NE = process.env.NE;

// geo.js's projection, read from the file so the two can never disagree
const geoSrc = fs.readFileSync(path.join(ROOT, 'v5/record-assets/geo.js'), 'utf8');
const G = JSON.parse(geoSrc.slice(geoSrc.indexOf('{'), geoSrc.lastIndexOf('}') + 1));
const { lon0, lat0, k, cos } = G.proj;
const P = (lon, lat) => [(lon - lon0) * cos * k, (lat0 - lat) * k];
const BOX = G.box;

// Extent of the surrounding ground: wider than any opening view on screens up to 3840 px wide
const EXT = { lon0: -90.2, lon1: -79.0, lat0: 31.0, lat1: 37.3 };
const inExt = ([lon, lat], pad = 0) => lon > EXT.lon0 - pad && lon < EXT.lon1 + pad && lat > EXT.lat0 - pad && lat < EXT.lat1 + pad;
const inBox = ([x, y]) => x > BOX.x0 && x < BOX.x1 && y > BOX.y0 && y < BOX.y1;

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
const enc = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
// Lines: densify, keep runs inside the padded extent. Runs well inside the box are dropped (the page clips the
// rest exactly at the box edge, where geo.js's own drawing takes over).
function lines(list, tol, pad = 0.4) {
  let out = '';
  for (const raw of list) {
    const pts = [];
    raw.forEach((p, i) => {
      if (i) { const q = raw[i - 1], n = Math.floor(Math.hypot(p[0] - q[0], p[1] - q[1]) / 0.02); for (let j = 1; j < n; j++) pts.push([q[0] + (p[0] - q[0]) * j / n, q[1] + (p[1] - q[1]) * j / n]); }
      pts.push(p);
    });
    let cur = [];
    const flush = () => { if (cur.length > 1) { const pr = cur.map((p) => P(...p)); if (!pr.every(([x, y]) => x > BOX.x0 + 30 && x < BOX.x1 - 30 && y > BOX.y0 + 30 && y < BOX.y1 - 30)) { const s = dp(pr, tol); if (s.length > 1) out += enc(s); } } cur = []; };
    for (const p of pts) { if (inExt(p, pad)) cur.push(p); else flush(); }
    flush();
  }
  return out;
}
function polys(rings, tol, minArea = 0) {
  let out = '';
  for (const ring of rings) {
    if (!ring.some((p) => inExt(p, 0.3))) continue;
    const pr = ring.map((p) => P(...p));
    if (pr.every(inBox)) continue;
    let a = 0; for (let i = 0, j = pr.length - 1; i < pr.length; j = i++) a += (pr[j][0] - pr[i][0]) * (pr[j][1] + pr[i][1]);
    if (Math.abs(a / 2) < minArea) continue;
    const s = dp(pr, tol); if (s.length > 3) out += enc(s) + 'Z';
  }
  return out;
}
const geomLines = (g) => (g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []);
const geomRings = (g) => (g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : []);
const touches = (g) => { const o = []; const w = (a) => (typeof a[0] === 'number' ? o.push(a) : a.forEach(w)); w(g.coordinates); return o.some((p) => inExt(p, 0.3)); };
const ne = (f) => rd(path.join(NE, f + '.geojson')).features.filter((x) => x.geometry && touches(x.geometry));

const us = rd(path.join(process.env.TOOLS, 'node_modules/us-atlas/counties-10m.json'));
const states = lines(topo.mesh(us, us.objects.states, (a, b) => a !== b).coordinates, .4);
const counties = lines(topo.mesh(us, us.objects.counties, (a, b) => a !== b && a.id.slice(0, 2) === b.id.slice(0, 2)).coordinates, .6);
const rivers = lines([...ne('ne_10m_rivers_lake_centerlines'), ...ne('ne_10m_rivers_north_america').filter((f) => f.properties.scalerank <= 11)].flatMap((f) => geomLines(f.geometry)), .8);
const lakes = polys([...ne('ne_10m_lakes'), ...ne('ne_10m_lakes_north_america')].flatMap((f) => geomRings(f.geometry)), .5, 4);
const interstates = lines(ne('ne_10m_roads').filter((f) => f.properties.sov_a3 === 'USA' && f.properties.level === 'Interstate' && f.properties.type !== 'Ferry Route').flatMap((f) => geomLines(f.geometry)), .5);

// Towns outside the box: tier 1 (the cities a reader steers by) from the opening, tier 2 as the view comes in
const places = rd(path.join(NE, 'ne_10m_populated_places_simple.geojson')).features.map((f) => f.properties)
  .filter((p) => p.sov_a3 === 'USA' && inExt([p.longitude, p.latitude], -0.15) && p.pop_max >= 6e4)
  .map((p) => { const [x, y] = P(p.longitude, p.latitude); return { n: p.name, x, y, pop: p.pop_max }; })
  .filter((p) => !inBox([p.x, p.y]) || p.x < BOX.x0 + 40 || p.x > BOX.x1 - 40 || p.y < BOX.y0 + 40 || p.y > BOX.y1 - 40)
  .filter((p) => !G.places.some((q) => q[0] === p.n || Math.hypot(q[1] - p.x, q[2] - p.y) < 60))
  .sort((a, b) => b.pop - a.pop);
const kept = [];
for (const p of places) if (!kept.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 220)) kept.push(p);
const placesOut = kept.map((p) => [p.n, +p.x.toFixed(1), +p.y.toFixed(1), p.pop >= 3.5e5 ? 1 : 2]);
// South Carolina appears beside the box once the map fills a wide screen
const stateLabels = [['SOUTH CAROLINA', ...P(-81.75, 34.55).map((v) => +v.toFixed(1))], ['KENTUCKY', ...P(-85.6, 37.05).map((v) => +v.toFixed(1))], ['MISSISSIPPI', ...P(-89.4, 33.6).map((v) => +v.toFixed(1))]];

const ext = [P(EXT.lon0, EXT.lat1), P(EXT.lon1, EXT.lat0)];
const S = { ext: { x0: +ext[0][0].toFixed(1), y0: +ext[0][1].toFixed(1), x1: +ext[1][0].toFixed(1), y1: +ext[1][1].toFixed(1) }, states, counties, rivers, lakes, interstates, places: placesOut, stateLabels };
fs.writeFileSync(path.join(ROOT, 'v5/record-assets/geo-surround.js'), `/* Projects map — the ground around North Georgia's survey box, drawn outside it only. Generated by studio/map-full-bleed/build-surround.mjs; do not edit by hand.
   State and county lines: US Census via us-atlas 3.0.1 (1:10m). Rivers, lakes, Interstates, towns: Natural Earth 5.1.2 (public domain, 1:10m).
   Same local equirectangular projection as geo.js, about 34.15°N, -84.6°. */
window.RECORD_GEO_SURROUND=${JSON.stringify(S)};\n`);
for (const [k2, v] of Object.entries(S)) console.log(k2.padEnd(12), typeof v === 'string' ? (v.length / 1024).toFixed(0) + 'k' : JSON.stringify(v).slice(0, 300));
