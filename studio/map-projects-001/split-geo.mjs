// Projects map — split the base map so the first paint carries only what the overview draws.
// Street-level layers (primary roads, local streets) appear only when zoomed in; they move to
// geo-detail.js, which record.js loads after the first paint. Run after studio/the-record-001/build-geo.js.
// Usage: node studio/map-projects-001/split-geo.mjs
import fs from 'fs';
import path from 'path';
const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../v5/record-assets');
const src = fs.readFileSync(path.join(dir, 'geo.js'), 'utf8');
const head = src.slice(0, src.indexOf('window.RECORD_GEO='));
global.window = {};
new Function(src)();
const G = window.RECORD_GEO;
const DETAIL = ['primary', 'local'];
if (!DETAIL.every((k) => k in G)) throw new Error('geo.js is already split');
const detail = Object.fromEntries(DETAIL.map((k) => [k, G[k]]));
DETAIL.forEach((k) => delete G[k]);
fs.writeFileSync(path.join(dir, 'geo.js'), head + 'window.RECORD_GEO=' + JSON.stringify(G) + ';\n');
fs.writeFileSync(path.join(dir, 'geo-detail.js'), head.replace('base map.', 'base map, street-level detail (loaded after first paint).') + 'window.RECORD_GEO_DETAIL=' + JSON.stringify(detail) + ';\n');
