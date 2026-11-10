# Map Exploration 002 — the Southeast

Branch `study/map-exploration-002`, cut from production `f50c47e` (`release/approved-v5-2026-10-18`, verified byte-identical to freemangc.com on 2026-11-09). Not built on the Vercel experiment or `study/freeman-atlas-from-approved-map-001`.

PROJECTS now opens on the Southeast: Georgia among Tennessee, Alabama, Mississippi, the Carolinas and Florida. The work sits in North Georgia as a few small orange concentrations. Coming in, the region gives way to the approved North Georgia drawing, then to streets, exactly as before.

## Why zooming out the approved map was not enough

- **No ground beyond the frame.** `geo.js` covers a 2.4° × 1.9° box (about 34.15°N 84.6°W ± 1.2°). Outside it the paper is blank, and the lines stop at a hard edge. That edge is already visible on the right of the production map.
- **The zoom stopped at the frame.** `sMin` was 90% of a fit to that box, so the view could not leave it.
- **Weights for one scale.** OpenStreetMap shorelines, the named rivers and the Georgia county lines read well at ×0.5. At ×0.08 the lakes (Lanier, Allatoona) collapse into ink blots and the county dashes turn into noise.
- **Projection.** The base map uses a local equirectangular projection true at 34.15°N. Across 25–41°N that is off by up to about 10% east–west, so Florida and Kentucky would be visibly misshapen.
- **Labels and marks.** Tier thresholds started at ×0.2, so every town would have shown at once. The marks were sized for ×0.5.

## What changed (map only)

| | |
|---|---|
| Projection | Lambert conformal conic, standard parallels 31° and 37°N, centred on the same point and scaled so one unit is still 1/1000° of latitude at the centre. `geo.js` and `geo-detail.js` are reprojected by script from the production files, not edited by hand. Every layer, site and label moved together. The scale and shapes inside North Georgia are unchanged to within about 0.1%. |
| `geo-region.js` (new, 300 KB) | Sea, land, coast and state lines (Census, us-atlas 1:10m), plus land beyond the US (world-atlas). From Natural Earth 1:10m: major rivers and lakes, Interstates, cities in three tiers, state and water names, and a 2° graticule. |
| `geo-region-detail.js` (new, 400 KB, after first paint) | County lines for the whole region (Census), in 104 tiles culled to the view, plus Natural Earth's North American rivers and lakes. |
| Hand-off | Inside the approved drawing's frame, the OpenStreetMap layers take over from the regional ones at a scale tied to the screen (FAR = 90% of the ALL framing, capped at ×0.32). State and county lines come from the same Census source on both sides of the frame, so they join exactly. |
| Opening view | Desktop: 91.4–75.8°W, 29.6–37°N. Portrait: 88.4–79.3°W, 30.4–36.7°N, so Georgia keeps its size. The drawing always covers the map; you cannot pan off it. |
| Marks | Same marks, drawn smaller at the regional scale. Groups keep their count and place name. Single sites and approximate areas show no label until you come in. Choosing a regional group comes down to the place first (at most ×3.2), not straight to the street. |
| Controls | ALL still shows every place, framed exactly as the approved map opens. `0` returns to the region. Find also knows the region's cities. |
| Names | A name is shown whole or not at all (production allowed "HATTANOOGA" cut at the edge). Names also avoid the north arrow, scale and zoom buttons. |
| Attribution | Adds NATURAL EARTH. On phones the line drops "MAP DATA" and "U.S." so it stays on one line clear of the zoom buttons. |

The verified project coordinates (`sites.js`) and the precise/approximate distinction are unchanged. No projects were added. The kicker still reads NORTH GEORGIA, because that is where the places are.

## Checks

- `node studio/map-projects-001/check.mjs` (the approved suite): 359 / 359.
- `node studio/map-exploration-002/check.mjs`: 251 / 251. Covers Chromium and WebKit at 1440×900, 1280×760, 820×1180, 1180×820, 390×844 and 360×740: opening framing, cover clamp, clustering, discovery click, hand-off, ALL, Find, project open and close, frame pacing, console and network errors, and page scroll.
- Outside the map element, the page is pixel-identical to production at 1440, 820 and 390 wide (header, lede, register, project panel).
- Wheel zoom from the region in headless Chromium: p95 frame 16.8 ms, the same as production.

## Rebuild

```
TOOLS=<dir with node_modules/us-atlas@3.0.1, world-atlas@2.0.2, topojson-client@3.1.0>
NE=<dir with Natural Earth 5.1.2 geojson: ne_10m_rivers_lake_centerlines, ne_10m_rivers_north_america, ne_10m_lakes, ne_10m_lakes_north_america, ne_10m_roads, ne_10m_populated_places_simple>
node studio/map-exploration-002/build-region.mjs
```

Natural Earth files come from `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/`.
