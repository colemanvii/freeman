// Map Exploration 002 — the Southeast around the approved North Georgia map.
//
// 1. Reprojects the production base map (geo.js, geo-detail.js at f50c47e) from its local equirectangular
//    projection into a Lambert conformal conic (standard parallels 31° and 37°N, centred on the same point,
//    scaled so one unit is still 1/1000° of latitude at 34.15°N). Inside North Georgia the drawing moves by
//    well under a pixel at working zoom; across the region, parallels curve the way an atlas plate's do.
// 2. Builds geo-region.js (first paint) and geo-region-detail.js (after first paint) for the wider region.
//
// Sources
//   us-atlas 3.0.1 (US Census, 1:10m): nation, state and county lines
//   world-atlas 2.0.2 (Natural Earth 1:10m): land beyond the US (Bahamas, Mexico) — outline only
//   Natural Earth 5.1.2 (public domain, 1:10m): rivers and lake centrelines, North America rivers and lakes,
//   lakes, roads (Interstate level only), populated places
//
// Usage: TOOLS=<dir with node_modules/us-atlas, world-atlas, topojson-client> NE=<dir of Natural Earth geojson>
//        node studio/map-exploration-002/build-region.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const TOOLS = process.env.TOOLS, NE = process.env.NE;
const require = createRequire(path.join(TOOLS, 'node_modules', 'x.js'));
const topo = require('topojson-client');
const rd = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const PROD = 'f50c47e'; // production at the time of the study: release/approved-v5-2026-10-18

/* ---------- Projections ---------- */
const D = Math.PI / 180;
const OLD = { lon0: -84.6, lat0: 34.15, k: 1000, cos: 0.827571 };
const oldInv = (x, y) => [x / (OLD.cos * OLD.k) + OLD.lon0, OLD.lat0 - y / OLD.k];

const LAT1 = 31, LAT2 = 37, LAT0 = 34.15, LON0 = -84.6;
const f1 = LAT1 * D, f2 = LAT2 * D;
const N = Math.log(Math.cos(f1) / Math.cos(f2)) / Math.log(Math.tan(Math.PI / 4 + f2 / 2) / Math.tan(Math.PI / 4 + f1 / 2));
const F = Math.cos(f1) * Math.pow(Math.tan(Math.PI / 4 + f1 / 2), N) / N;
const rho = (lat) => F / Math.pow(Math.tan(Math.PI / 4 + lat * D / 2), N);
const RHO0 = rho(LAT0);
const K0 = N * RHO0 / Math.cos(LAT0 * D);          // scale factor at the centre (unit sphere)
const K = 1000 / (K0 * D);                          // 1000 units per degree of latitude at the centre
const P = (lon, lat) => { const r = rho(lat), t = N * (lon - LON0) * D; return [K * r * Math.sin(t), -K * (RHO0 - r * Math.cos(t))]; };
const PROJ = { type: 'lcc', lon0: LON0, lat0: LAT0, lat1: LAT1, lat2: LAT2, n: +N.toFixed(10), F: +F.toFixed(10), rho0: +RHO0.toFixed(10), K: +K.toFixed(6) };

/* ---------- Reproject the production map ---------- */
const reproj = (x, y) => P(...oldInv(x, y));
const fx = (v) => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, '.0');
const pathRe = /(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g;
const reprojPath = (d) => d.replace(pathRe, (_, a, b) => { const [x, y] = reproj(+a, +b); return `${x.toFixed(1)} ${y.toFixed(1)}`; });
const load = (rel) => { const s = execSync(`git show ${PROD}:${rel}`, { cwd: ROOT, maxBuffer: 1 << 28 }).toString(); return { head: s.slice(0, s.indexOf('window.')), obj: JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1)) }; };
const NOTE = `   Reprojected for Map Exploration 002 by studio/map-exploration-002/build-region.mjs: Lambert conformal conic,\n   standard parallels ${LAT1}° and ${LAT2}°N, centred on ${LAT0}°N ${LON0}°; one unit is 1/1000° of latitude at the centre. */\n`;
const header = (h) => h.replace(/\*\/\s*$/, '').replace(/Local equirectangular projection about 34\.15°N, -84\.6°\.\s*/, '') + '\n' + NOTE;

const base = load('v5/record-assets/geo.js');
const G = base.obj;
const oldBox = G.box;
for (const k of Object.keys(G)) if (typeof G[k] === 'string') G[k] = reprojPath(G[k]);
for (const k of ['places', 'riverLabels', 'stateLabels']) G[k] = G[k].map((r) => { const [x, y] = reproj(r[1], r[2]); return [r[0], +x.toFixed(1), +y.toFixed(1), ...r.slice(3)]; });
G.proj = PROJ;
// The detailed drawing's frame, now a slightly curved quadrilateral: it becomes the clip for the detail layers
const frame = [];
const edge = (a, b, n = 24) => { for (let i = 0; i < n; i++) { const t = i / n; frame.push(reproj(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)); } };
const c = [[oldBox.x0, oldBox.y0], [oldBox.x1, oldBox.y0], [oldBox.x1, oldBox.y1], [oldBox.x0, oldBox.y1]];
for (let i = 0; i < 4; i++) edge(c[i], c[(i + 1) % 4]);
G.frame = 'M' + frame.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';
const fxs = frame.map((p) => p[0]), fys = frame.map((p) => p[1]);
G.box = { x0: Math.min(...fxs), x1: Math.max(...fxs), y0: Math.min(...fys), y1: Math.max(...fys) };
fs.writeFileSync(path.join(ROOT, 'v5/record-assets/geo.js'), header(base.head) + 'window.RECORD_GEO=' + JSON.stringify(G) + ';\n');

const det = load('v5/record-assets/geo-detail.js');
for (const k of Object.keys(det.obj)) det.obj[k] = reprojPath(det.obj[k]);
fs.writeFileSync(path.join(ROOT, 'v5/record-assets/geo-detail.js'), header(det.head) + 'window.RECORD_GEO_DETAIL=' + JSON.stringify(det.obj) + ';\n');

/* ---------- The region ---------- */
// Data extent: wide enough that a portrait phone at the opening framing never meets the edge of the drawing.
const EXT = { lon0: -97, lon1: -71, lat0: 25, lat1: 41 };
const inExt = ([lon, lat], pad = 0) => lon > EXT.lon0 - pad && lon < EXT.lon1 + pad && lat > EXT.lat0 - pad && lat < EXT.lat1 + pad;
// The extent in projected units (a curved sheet; its bounding box is what the view is held within)
const extRing = [];
{ const S = 40, L = (a, b) => { for (let i = 0; i < S; i++) { const t = i / S; extRing.push(P(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)); } };
  L([EXT.lon0, EXT.lat1], [EXT.lon1, EXT.lat1]); L([EXT.lon1, EXT.lat1], [EXT.lon1, EXT.lat0]); L([EXT.lon1, EXT.lat0], [EXT.lon0, EXT.lat0]); L([EXT.lon0, EXT.lat0], [EXT.lon0, EXT.lat1]); }
// The view is held inside the largest rectangle the curved sheet fully covers
const ex = extRing.map((p) => p[0]), ey = extRing.map((p) => p[1]);
const topY = Math.max(...extRing.filter((_, i) => i < 40).map((p) => p[1]));   // north edge sags at its ends
const botY = Math.min(...extRing.filter((_, i) => i >= 80 && i < 120).map((p) => p[1]));
const leftX = Math.max(...extRing.filter((_, i) => i >= 120).map((p) => p[0]));
const rightX = Math.min(...extRing.filter((_, i) => i >= 40 && i < 80).map((p) => p[0]));
const BOX = { x0: Math.round(leftX), x1: Math.round(rightX), y0: Math.round(topY), y1: Math.round(botY) };

function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let m = -1, md = tol * tol;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i]; let t = ((px - ax) * dx + (py - ay) * dy) / L; t = Math.max(0, Math.min(1, t));
      const ex2 = ax + t * dx - px, ey2 = ay + t * dy - py, d = ex2 * ex2 + ey2 * ey2;
      if (d > md) { md = d; m = i; }
    }
    if (m > 0) { keep[m] = 1; st.push([a, m], [m, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const enc = (pts) => 'M' + pts.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join('L');
// Lines: densify in degrees (long surveyed straight runs), keep runs inside the padded extent, project, simplify
function lines(list, tol, pad = 0.6) {
  let out = '';
  for (const raw of list) {
    const pts = [];
    raw.forEach((p, i) => {
      if (i) { const q = raw[i - 1], n = Math.floor(Math.hypot(p[0] - q[0], p[1] - q[1]) / 0.05); for (let k = 1; k < n; k++) pts.push([q[0] + (p[0] - q[0]) * k / n, q[1] + (p[1] - q[1]) * k / n]); }
      pts.push(p);
    });
    let cur = [];
    const flush = () => { if (cur.length > 1) { const s = dp(cur.map((p) => P(...p)), tol); if (s.length > 1) out += enc(s); } cur = []; };
    for (const p of pts) { if (inExt(p, pad)) cur.push(p); else flush(); }
    flush();
  }
  return out;
}
// The same, as tiles: each run goes to the tile holding its first point, and the tile records its true bounds,
// so the page can leave out tiles that are off screen (dashed lines are costly to redraw while zooming)
function lineTiles(list, tol, cell = 1600, pad = 0.6) {
  const tiles = new Map();
  for (const raw of list) {
    const pts = [];
    raw.forEach((p, i) => {
      if (i) { const q = raw[i - 1], n = Math.floor(Math.hypot(p[0] - q[0], p[1] - q[1]) / 0.05); for (let k = 1; k < n; k++) pts.push([q[0] + (p[0] - q[0]) * k / n, q[1] + (p[1] - q[1]) * k / n]); }
      pts.push(p);
    });
    let cur = [];
    const flush = () => {
      if (cur.length > 1) {
        const sp = dp(cur.map((p) => P(...p)), tol);
        if (sp.length > 1) {
          const key = Math.floor(sp[0][0] / cell) + ',' + Math.floor(sp[0][1] / cell);
          const t = tiles.get(key) || { b: [Infinity, Infinity, -Infinity, -Infinity], d: '' };
          for (const [x, y] of sp) { t.b[0] = Math.min(t.b[0], x); t.b[1] = Math.min(t.b[1], y); t.b[2] = Math.max(t.b[2], x); t.b[3] = Math.max(t.b[3], y); }
          t.d += enc(sp); tiles.set(key, t);
        }
      }
      cur = [];
    };
    for (const p of pts) { if (inExt(p, pad)) cur.push(p); else flush(); }
    flush();
  }
  return [...tiles.values()].map((t) => [t.b.map(Math.round), t.d]);
}
// Polygons: clipped to the padded extent in longitude and latitude (Sutherland–Hodgman), then projected.
// The view never reaches the padding, so the cut edges are never seen.
function clipRing(ring, pad = 1) {
  const B = [['x', EXT.lon0 - pad, 1], ['x', EXT.lon1 + pad, -1], ['y', EXT.lat0 - pad, 1], ['y', EXT.lat1 + pad, -1]];
  let out = ring;
  for (const [ax, v, sgn] of B) {
    const i = ax === 'x' ? 0 : 1, inside = (p) => sgn * (p[i] - v) >= 0, res = [];
    for (let k = 0; k < out.length; k++) {
      const a = out[k], b = out[(k + 1) % out.length];
      const ia = inside(a), ib = inside(b);
      if (ia) res.push(a);
      if (ia !== ib) { const t = (v - a[i]) / (b[i] - a[i]); res.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    out = res; if (!out.length) break;
  }
  return out;
}
function polys(rings, tol, minArea = 0) {
  let out = '';
  for (const raw of rings) {
    if (!raw.some((p) => inExt(p, 1.5))) continue;
    const ring = clipRing(raw); if (ring.length < 4) continue;
    const pr = ring.map((p) => P(...p));
    let a = 0; for (let i = 0, j = pr.length - 1; i < pr.length; j = i++) a += (pr[j][0] - pr[i][0]) * (pr[j][1] + pr[i][1]);
    if (Math.abs(a / 2) < minArea) continue;
    const s = dp(pr, tol); if (s.length > 3) out += enc(s) + 'Z';
  }
  return out;
}
const geomLines = (g) => (g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []);
const geomRings = (g) => (g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : []);
const touches = (g) => { const o = []; const w = (a) => (typeof a[0] === 'number' ? o.push(a) : a.forEach(w)); w(g.coordinates); return o.some((p) => inExt(p, 0.5)); };

// Census: land, coast, state and county lines
const states = rd(path.join(TOOLS, 'node_modules/us-atlas/states-10m.json'));
const counties = rd(path.join(TOOLS, 'node_modules/us-atlas/counties-10m.json'));
const nation = topo.feature(states, states.objects.nation);
const world = rd(path.join(TOOLS, 'node_modules/world-atlas/countries-10m.json'));
const others = topo.feature(world, world.objects.countries).features.filter((f) => ['Bahamas', 'Mexico', 'Cuba', 'Canada'].includes(f.properties.name));
const land = polys([...(nation.features || [nation]).flatMap((f) => geomRings(f.geometry)), ...others.flatMap((f) => geomRings(f.geometry))], 1.2, 4);
const coastUS = topo.mesh(states, states.objects.states, (a, b) => a === b);
const coastOther = topo.mesh(world, world.objects.countries, (a, b) => a === b && a.properties.name !== 'United States of America');
const borders = topo.mesh(world, world.objects.countries, (a, b) => a !== b && (a.properties.name === 'United States of America' || b.properties.name === 'United States of America'));
const coast = lines([...coastUS.coordinates, ...coastOther.coordinates], 0.7);
const stateLines = lines(topo.mesh(states, states.objects.states, (a, b) => a !== b).coordinates.concat(borders.coordinates), 0.6);
const countyLines = lineTiles(topo.mesh(counties, counties.objects.counties, (a, b) => a !== b && a.id.slice(0, 2) === b.id.slice(0, 2)).coordinates, 0.8);

// Natural Earth: rivers, lakes, interstates, places
const ne = (f) => rd(path.join(NE, f + '.geojson')).features.filter((x) => x.geometry && touches(x.geometry));
const riversMajor = ne('ne_10m_rivers_lake_centerlines').filter((f) => f.properties.featurecla !== 'Lake Centerline' || true);
const riversNA = ne('ne_10m_rivers_north_america');
const lakesMajor = ne('ne_10m_lakes').filter((f) => !/Erie|Ontario/.test(f.properties.name || ''));
const lakesNA = ne('ne_10m_lakes_north_america');
const roads = ne('ne_10m_roads').filter((f) => f.properties.sov_a3 === 'USA' && f.properties.level === 'Interstate' && f.properties.type !== 'Ferry Route');
const rivers = lines(riversMajor.flatMap((f) => geomLines(f.geometry)), 1.1);
const riversMinor = lines(riversNA.flatMap((f) => geomLines(f.geometry)), 1.0);
const lakes = polys(lakesMajor.flatMap((f) => geomRings(f.geometry)), 0.6);
const lakesMinor = polys(lakesNA.flatMap((f) => geomRings(f.geometry)), 0.6, 2);
const interstates = lines(roads.flatMap((f) => geomLines(f.geometry)), 0.8);

// Places: US cities by population and capital status. Tier 1 opens with the region; 2 and 3 arrive with zoom.
const CAPS = new Set(['Montgomery', 'Tallahassee', 'Atlanta', 'Columbia', 'Raleigh', 'Nashville', 'Jackson', 'Baton Rouge', 'Frankfort', 'Richmond', 'Little Rock', 'Charleston']);
const placesRaw = rd(path.join(NE, 'ne_10m_populated_places_simple.geojson')).features.map((f) => f.properties)
  .filter((p) => p.sov_a3 === 'USA' && inExt([p.longitude, p.latitude], -0.2));
// Tier 1 is an editorial choice: the cities by which a reader finds their way around the Southeast.
const T1 = new Set(['Atlanta', 'Nashville', 'Memphis', 'Birmingham', 'Charlotte', 'Raleigh', 'New Orleans', 'Jacksonville', 'Tampa', 'Orlando', 'Miami', 'Louisville', 'St. Louis', 'Richmond', 'Washington,  D.C.', 'Washington, D.C.']);
const cands = placesRaw.map((p) => {
  const pop = p.pop_max, cap = CAPS.has(p.name) && /capital/i.test(p.featurecla);
  const tier = T1.has(p.name) && pop >= 4e5 ? 1 : (cap || pop >= 4e5) ? 2 : pop >= 1.2e5 ? 3 : 0;
  const [x, y] = P(p.longitude, p.latitude);
  return tier ? { name: p.name.replace(/,\s+/, ', '), x, y, tier, pop } : null;
}).filter(Boolean).sort((a, b) => a.tier - b.tier || b.pop - a.pop);
// A suburb inside a larger city's reach is not named at these scales (Metairie, Coral Gables, Southaven…)
const keepP = [];
for (const c of cands) if (!keepP.some((k) => Math.hypot(k.x - c.x, k.y - c.y) < 300)) keepP.push(c);
const regionPlaces = keepP.map((c) => [c.name, +c.x.toFixed(1), +c.y.toFixed(1), c.tier]);

// State names at a point well inside each state (pole of inaccessibility by grid search, in projected units)
const stateFeats = topo.feature(states, states.objects.states).features;
const STATE_ABBR = { Georgia: 1, Tennessee: 1, Alabama: 1, Mississippi: 1, Florida: 1, 'South Carolina': 1, 'North Carolina': 1, Kentucky: 1, Virginia: 1, 'West Virginia': 1, Louisiana: 1, Arkansas: 1, Missouri: 1, Ohio: 1, Indiana: 1, Illinois: 1, Texas: 1, Oklahoma: 1, Maryland: 1, Delaware: 1, Pennsylvania: 1, 'New Jersey': 1 };
function insideRing(pt, ring) { let c2 = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c2 = !c2; } return c2; }
function segDist(p, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L; t = Math.max(0, Math.min(1, t)); return Math.hypot(a[0] + t * dx - p[0], a[1] + t * dy - p[1]); }
const stateLabels = [];
for (const f of stateFeats) {
  const name = f.properties.name; if (!STATE_ABBR[name]) continue;
  const rings = geomRings(f.geometry).map((r) => r.map((p) => P(...p)));
  const ring = rings.reduce((a, b) => (b.length > a.length ? b : a));
  const xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1]);
  let best = null;
  // Labels read horizontally: favour points with room east–west (distance weighted toward vertical clearance)
  for (let i = 1; i < 60; i++) for (let j = 1; j < 60; j++) {
    const p = [Math.min(...xs) + (Math.max(...xs) - Math.min(...xs)) * i / 60, Math.min(...ys) + (Math.max(...ys) - Math.min(...ys)) * j / 60];
    if (!insideRing(p, ring)) continue;
    let d = Infinity; for (let k = 1; k < ring.length; k += 1) d = Math.min(d, segDist(p, ring[k - 1], ring[k]));
    if (!best || d > best.d) best = { p, d };
  }
  if (best) stateLabels.push([name.toUpperCase(), +best.p[0].toFixed(0), +best.p[1].toFixed(0)]);
}
// Florida's widest open ground is the peninsula; its name reads better there than in the panhandle
const waterLabels = [['GULF OF MEXICO', ...P(-89.2, 27.6).map((v) => +v.toFixed(0))], ['ATLANTIC OCEAN', ...P(-76.4, 31.6).map((v) => +v.toFixed(0))]];

// A light graticule every two degrees, as drawn on an atlas plate
let grat = '';
for (let lat = 26; lat <= 40; lat += 2) { const pts = []; for (let lon = EXT.lon0 - 1; lon <= EXT.lon1 + 1; lon += 0.25) pts.push(P(lon, lat)); grat += enc(pts); }
for (let lon = -96; lon <= -72; lon += 2) { const pts = []; for (let lat = EXT.lat0 - 1; lat <= EXT.lat1 + 1; lat += 0.25) pts.push(P(lon, lat)); grat += enc(pts); }

const sea = enc(extRing) + 'Z';
const REG = { box: BOX, sea, land, coast, states: stateLines, rivers, lakes, interstates, graticule: grat, places: regionPlaces, stateLabels, waterLabels };
const REGD = { counties: countyLines, riversMinor, lakesMinor };
const SRC = `   Sources: US Census via us-atlas 3.0.1 (1:10m) for the nation, state and county lines; Natural Earth 5.1.2 (public domain, 1:10m)
   for rivers, lakes, Interstates and cities; world-atlas 2.0.2 (Natural Earth) for land beyond the United States.
   Lambert conformal conic, standard parallels ${LAT1}° and ${LAT2}°N, centred on ${LAT0}°N ${LON0}° (the same as geo.js). */\n`;
fs.writeFileSync(path.join(ROOT, 'v5/record-assets/geo-region.js'), `/* Map Exploration 002 — the Southeast at regional scale. Generated by studio/map-exploration-002/build-region.mjs; do not edit by hand.\n${SRC}window.RECORD_REGION=${JSON.stringify(REG)};\n`);
fs.writeFileSync(path.join(ROOT, 'v5/record-assets/geo-region-detail.js'), `/* Map Exploration 002 — the Southeast, county lines and lesser rivers and lakes (loaded after first paint). Generated by studio/map-exploration-002/build-region.mjs; do not edit by hand.\n${SRC}window.RECORD_REGION_DETAIL=${JSON.stringify(REGD)};\n`);

const kb = (s) => (s.length / 1024).toFixed(0) + 'k';
console.log('projection', PROJ, 'box', BOX, 'detail frame', G.box);
for (const [k, v] of Object.entries({ ...REG, ...REGD })) console.log(k.padEnd(12), typeof v === 'string' ? kb(v) : JSON.stringify(v).length);
console.log('county tiles', countyLines.length);
console.log('places', regionPlaces.map((p) => p[0] + ':' + p[3]).join(', '));
console.log('stateLabels', stateLabels.map((s) => s[0]).join(', '));
// Self-check: reprojection residual inside North Georgia, relative to the old drawing (units = 1/1000° lat ≈ 111 m)
let worst = 0;
for (const [lon, lat] of [[-84.39, 33.75], [-84.986, 34.299], [-84.326, 34.867], [-84.97, 34.775], [-84.6, 34.15]]) {
  const o = [(lon - OLD.lon0) * OLD.cos * OLD.k, (OLD.lat0 - lat) * OLD.k], n = P(lon, lat); worst = Math.max(worst, Math.hypot(o[0] - n[0], o[1] - n[1]));
}
console.log('max shift at project sites vs old projection (units):', worst.toFixed(2));
