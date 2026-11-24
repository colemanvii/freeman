# Projects = the map (26 Oct 2026)

PROJECTS now opens the map (`/map`). The former index (`/projects`, `/projects.html`, `/projects/*`) 301s to
`/map`; every project page keeps its URL. Branch `feature/map-projects-001`, cut from production
(`release/approved-v5-2026-10-18` @ 13b93fb).

## What changed
- **Navigation.** COMPANY / PROJECTS / CONTACT on the entrance, every interior page and the map. A project
  page's PROJECTS link (and its × CLOSE, when you came from the map) returns to the map with that project open.
- **Credits.** `v5/project-credits.js` is the single source for partner names, roles and links, read by the map
  and the project pages. Roles: Developer, Ownership group, Hospitality operator, Client, Architect, Interior
  design, Collaborators, Photography. Only credits Freeman published; a role more specific than "Client" only
  where the partner's own site says so; a link only where the partner's site was loaded and confirmed.
- **Desktop.** Selecting a project opens an editorial panel beside the map (the map keeps ~65% of the
  width): name, place, photographs (one at a time, uncropped, full-screen viewer), story, credits, full project,
  nearby. ← / → buttons or keys move between projects; INDEX lists all of them; marks stay clickable.
- **Phones.** The project is a sheet with three rests: peek (name and controls), half (map above), full. Drag
  or tap its top; pull below the name to close. Photographs swipe sideways (native scroll-snap). Zoom controls
  step aside while the sheet is up; the open project is always centred in the visible map and drawn apart from
  any neighbouring cluster.
- **History.** Opening a project from the map is one history step; moving between projects replaces it, so
  Back returns to the map, not through every project visited. × CLOSE leaves Projects like browser Back.
- **Current work.** The three in-progress projects from the old index are listed under the register (not placed:
  no site is on file).

## Performance
| | Before | After |
|---|---|---|
| Map scripts and styles before first paint (gzip) | ~187 KB | ~141 KB; street detail (48 KB) after first paint |
| Photographs when opening The Optimist | ~3.8 MB (originals, incl. 2.5 MB thumbnail) | ~0.6 MB incl. two preloaded neighbours |
| Marks during a pinch or flight | rebuilt every frame | moved; rebuilt only when a group forms or splits |

Resized photographs (`v5/assets/map/`, content-hashed, cached immutable) come from `build-photos.mjs`;
originals are untouched and remain the largest `srcset` source. `split-geo.mjs` moves street layers into
`geo-detail.js`. The Beetlecat study feature (`story-beetlecat.*`) is no longer loaded; Beetlecat uses the
shared panel with the same photographs, story and credits.

## Checks
`check.mjs` (Playwright, Chromium + WebKit; 1440, 1280 desktop; iPhone 13, iPhone SE, Pixel 7): 359 checks —
credit integrity against `content.json`, redirects, entrance → map, marker → panel, rapid switching (15 steps,
no history growth, focus kept), keyboard, partner links (new tab, no opener, map keeps its place), photographs
and viewer, INDEX, Back/Forward, deep link + refresh, full project → back to map, × CLOSE, sheet rests and
drag, 44 px targets, no horizontal scroll, no page zoom. `qa/public-navigation-qa.py` updated for /map.

## Open questions for Freeman
- **Jared Swafford** and **Wright Gardner Architects**: no verified website, so shown without links. The live
  site currently links them to a Flickr page and to wrightgardnerarchitect.com; both were removed.
- **David Thompson Architecture / Studio** are one firm; shown under its own name, David Thompson Studio.
- **Roles.** Freeman published owners/operators as "Client". Shown as Hospitality operator (Rocket Farm, Indigo
  Road, Electric Hospitality), Ownership group (South Street Partners, owner of Barnsley Resort) and Developer
  (South Downtown). Savi Provisions, Bocado Pizza and Interventional Pain Consultants stay "Client".
- **Azalea Marketplace**: the store trades as "Azalea Fresh Market" (powered by Savi Provisions). Name unchanged.
- **Muchacho Decatur**: BLUR Workshop's site shows only the Hemphill Muchacho; the credit stands as published.
`qa/public-navigation-qa.py`: 225 of 231 pass; the 6 failures are its tap-area *estimate* for the section
line on 320–375 px phones (it ignores the hit area's centring transform). Production fails the same check
today on `/` and `/contact` (with one more overlap: MAP × CONTACT); measured hit areas do not touch.
