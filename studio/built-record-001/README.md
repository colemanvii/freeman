# The Built Record — Study 001

A case-study system built around a drawing set, piloted on **Muchacho Decatur**.
Branch `claude/freeman-case-study-system-273x7a`, built on `feature/case-study-001` (which was cut from
production `ee4b6d8`). Not merged, not linked from any published page, `noindex`.

- Prototype: `v5/built-record/muchacho-decatur.html`
- Second record, photographs only: `v5/built-record/beetlecat.html`
- The version it is compared with: `v5/project-muchacho-decatur.html` (unchanged)
- Screens: `studio/built-record-001/screens/`

Serve `v5/` (`python3 -m http.server 8921` inside it) and open `/built-record/muchacho-decatur.html`.

## 1. Audit of the current Muchacho page

What works and is kept: the opening photograph, the name and record beside it, the type, the frame,
the evidence rules (the template writes nothing; every fact has a source).

What does not:

- After the opening, five photographs run as uniform pairs at one size. A close-up of a door panel is
  given the same area as a room. There is no change of scale, so nothing reads as a detail or as a view.
- The plates are 5:4 and taller than the window in pairs, so a 1440×900 screen always shows two cropped
  halves and never one whole photograph.
- The page is photographs and four sentences. Nothing on it shows that Freeman reads a building: no
  drawing, no construction, no particulars beyond the credits.
- The account is the only writing and has not been approved.

## 2. Assets

| On file | Detail |
|---|---|
| Photographs | Six finished frames, 2400 px long edge (plate 01 is 1920×2400). All already public. |
| Record | Name, number, type, address, position, operator and interior-design credit, "built in 1940". |
| Account | Four sentences, written 13 Nov, not yet approved. |
| Drawings | **None.** Not in the repository, not in the Photographs Drive folder. |
| Construction photographs | **None** for Muchacho. (The Drive set holds Barnsley sitework frames with people.) |
| Scope, dates, area, team | **None.** |

The public building footprint (OSM way 48296311) could not be fetched from this environment, so no site
plan is drawn.

## 3. What the prototype does about the missing drawings

It does not invent any. The five sheets are **record drawings traced from Freeman's own photographs**, in
each photograph's pixel coordinates, so drawing and photograph register exactly. They show proportion and
arrangement as photographed. They state no dimension, material, assembly or structure. People, foliage,
fittings and furnishings are left out; anything the photograph hides is not drawn. Every sheet's title
block says "Traced from plate NN · Not to scale".

- **Floor plan (A-101)** is a reserved sheet that lists what is needed to draw it.
- **Construction** is a reserved plate on every key, with the photograph that is wanted.
- **The build** section says nothing is on file and lists four items.

When real material arrives, each of these is a data change in one file.

## 4. Structure of a record

| | Section | Draws when |
|---|---|---|
| 01 | Opening: name, record, first plate, contents | always |
| 02 | Overview: the account | the project has one |
| 03 | Architectural record: the drawing set | the record has sheets |
| 04 | The build | the record has a `build` entry |
| 05 | Finished work: spreads | the record has `finished` |
| 06 | Particulars | always |
| | Review notes (study only) | the record has `missing` |

Sections number themselves from what is present. Beetlecat has no drawings and no build, so its page is
01 Opening, 02 Overview, 03 Finished work, 04 Particulars, and nothing looks absent.

### The interactions

- **Opening.** The first plate and its drawing share one sheet, parted at the centre line of the door.
  A range input moves the seam (pointer, touch, arrow keys).
- **Drawing set.** Tabs choose a sheet. Numbered keys on the sheet choose a place. The stage shows that
  place as **A Drawing / B Construction / C Completed**; because the drawing is traced in the photograph's
  coordinates, A and C dissolve in register. ← → steps through the keys.
- Motion is one 0.32 s dissolve and one 0.42 s move of the stage; both are off under
  `prefers-reduced-motion`.

## 5. Files

| File | Role |
|---|---|
| `v5/built-record/built-record.js` | The renderer. Reads facts from `records.js`, `project-credits.js`, `record-assets/sites.js`, `record-assets/photos.js`. |
| `v5/built-record/built-record.css` | One stylesheet. Site tokens; warm paper `#f5f2ea`. |
| `v5/built-record/records/<slug>.js` | One project: plates, captions, sheets and their keys, spreads, particulars, missing items. No facts restated. |
| `v5/built-record/<slug>.html` | Page shell. |
| `v5/_headers` | `/built-record/*` is `noindex`. |

### To add a project

1. Copy `records/beetlecat.js`; list its plates (photographs must be in `record-assets/photos.js`) and spreads.
2. Copy `beetlecat.html`, change the slug.
3. Optional: add `sheets`. A sheet is `{ id, title, sub, plate, w, h, draw, keys }`; `draw` returns SVG in the
   plate's pixel coordinates, and each key is `{ n, name, view: [x, y, w, h], note, want }`.
   A sheet redrawn from the architect's drawing instead of a photograph needs one small addition to the
   renderer (a sheet with its own coordinate space and a separate photograph per key). That is the next step
   once a real plan exists.
4. Optional: a key's construction photograph is `build: { src, alt, date, note }`.

### How projects differ

| Project | Likely shape |
|---|---|
| Muchacho Decatur | As built here. Gains a plan sheet and construction plates when supplied. |
| Beetlecat | Photographs and account today. Strong candidate for a plan-led record: bar, dining room, counter. |
| Barnsley Resort, Woodlands | The large one: site plan as the first sheet, buildings as keys, sitework photographs already exist for The build. |
| Dugan's Pub, Brewhouse Café, Mule Train | No photographs in the repository yet; begin as Opening + Particulars and grow. |

## 6. Needed to reach production

1. Architect's plan, elevations and sections for Muchacho, and permission to redraw them. Any structural
   or MEP sheet Freeman is allowed to show.
2. Dated construction photographs. For future jobs, the capture protocol in `PROJECT-RECORD.md`
   (same position, before work is concealed) produces exactly what the Construction state needs.
3. Freeman's scope: kept, replaced, new.
4. Dates, floor area, seat count, delivery method, project team.
5. BLUR Workshop's role on Decatur; the photographer's name and permission for the crops used on the stage.
6. Confirmation that the door plate (04) is Muchacho Decatur.
7. Approval of the account.
8. A check of the five record drawings against the building. They were traced by eye from photographs.
9. Decision: warm paper `#f5f2ea` here against the site's current white `#ffffff`.

## Checks

```
PW=<path to node_modules/playwright> BASE=http://127.0.0.1:8921 node studio/built-record-001/check.mjs
PW=<path to node_modules/playwright> BASE=http://127.0.0.1:8921 node studio/built-record-001/shots.mjs
```

13 Nov 2026: 254/254 in Chromium (1440×900, 1280×720, 1024×768, iPhone 13, iPhone SE, reduced motion):
one h1, no sideways scroll, opening plate on the first screen, every key on every sheet by keyboard,
three states, seam by arrow keys, 44 px touch targets. **WebKit was not available in the build
environment and has not been run.**

## Known limits

- Needs JavaScript, like every page of the site.
- Stage crops are taken from 2400 px originals; the tightest (the lettering) is near the limit of the file.
- The opening seam uses `:has()` for its focus ring; older browsers still get the working control.
- Not wired into the map or `app.js`. Publishing means pointing `project-<slug>` at the record, which is a
  separate, reviewed change.
