# Freeman GC — Brutalist direction (`freeman-brutalist`)

An isolated, complete website direction for Freeman General Contractors.
Everything lives in `/brutalist`. Nothing at the repo root, on `main`, or in
the V1–V4 / Editorial directions was changed. `main` still deploys to
GitHub Pages; this branch does not.

## Run it

No build step, no dependencies.

```
# from the repo root
python3 -m http.server 8000
open http://localhost:8000/brutalist/
```

Opening `brutalist/index.html` directly from disk also works.

## Map

Every public screen is a single fixed composition: the page never scrolls.
Long material is reached by navigation instead — numbered panels, PREV/NEXT
slides and measured pages.

| Screen | File | How additional material is reached |
|---|---|---|
| Entry | `index.html` | — (five words, four corners) |
| Freeman GC | `freeman-gc.html#overview` | Six panels: Overview · Practice · Territory · People · Kind words · Questions. Each list item shows its detail on hover, focus or click |
| Projects | `projects.html` | Numbered index; hovering a row swaps the plate |
| Project | `project.html?p=<slug>#n` | Presentation: photographs, description, drawing, scope, particulars, kind words, Afield — one at a time, PREV/NEXT, ← → keys, contents line |
| Afield | `afield.html?view=ledger` | Filters + four views (Ledger · Sheet · Sawdust · About), paginated to fit the screen |
| Record | `record.html?r=AF-001` | ← → between records |
| Contact | `contact.html` | Two states: contact lines, and the inquiry form |
| Client Portal | `portal.html` → `portal-demo.html#overview` | Six tabbed panels, each paginated to fit |

## Interaction

- **Cursor:** a thin 1px crosshair everywhere (inputs keep the text cursor).
- **Hover:** an immediate, solid Freeman-orange rectangle tight to the word or
  phrase, text turns paper. Index rows highlight their title phrase. No
  transitions, fades or movement anywhere.
- **Keyboard focus:** a 1px orange outline box with 4px of air, ink text —
  as in the reference recording.
- **Keys:** ← → / PageUp PageDown step slides, panels and pages; ↑ ↓ move
  through section and pick lists; Home / End jump to the ends; Esc closes
  overlays.
- **Mobile:** navigation collapses to an INDEX overlay; company panels step
  with a bottom PREV/NEXT bar; Afield filters open as a full-screen sheet.

### How fitting works (`assets/js/site.js`)

- `Pager` measures the blocks inside a `.pg__body` and splits them into
  pages that fit the space actually available, recalculating on resize.
- `fit()` is a safety net: if a composition still exceeds its box on an
  unusually small screen, that box (never the page) scrolls internally
  rather than cropping. QA treats any such fallback as a failure; none
  occur at 1440×900, 1280×720, 1366×640, 390×844 or 375×667.

## The system

**One family: IBM Plex Mono** (300 / 400 / 500, self-hosted, SIL OFL).
The entry screen and the Work Index reference are already monospaced, and a
monospace grid is what makes a numbered index line up without effort:
`001`, `AF-014` and `34.165°N` all sit on the same rhythm. Plex Mono was
chosen over other monospaces because it was drawn for an institution (IBM)
rather than for code editors — it has real italics, a light weight that
holds up at display sizes, and enough warmth to set paragraphs. A grotesk
would have made the project titles more conventional and lost the ledger
quality. Hierarchy comes only from size, weight, case, placement and space.

**Colour.** Warm off-white `#f4f4f1` (the entry field), soft tan `#d4c4a8`
(Afield only), charcoal `#242424`, and Freeman orange `#e75a28` used as
punctuation: the Client Portal link, active-state underlines, record
numbers, the base on the territory plate, the demo band. Never fills.

**Structure.** A 12-column grid inside a 1440px measure, one viewport tall.
Type sizes are clamped against both width and height so a composition
holds on short laptop screens without becoming small. No rounded corners,
shadows, gradients, carousels or animation; the only thing that changes on
its own is the entry clock.

**Afield's identity** within the system: the tan field of the Work Index
reference, a single orange margin rule down the left edge (a notebook
margin), and orange record numbers.

## Content and provenance

All content comes from the published site (www.freemangc.com, read
2026-10-12) and the repo's approved `app-core.js`. Copy is edited for length;
facts are not added. Details:

- `data/projects.js` — 9 projects, credits, scope lists, photography.
  Omitted on purpose: "Interior Design: Interior Designer" and
  "Total sq. ft.: 2,000+" (identical on seven projects — reads as a CMS
  default). Restore if Freeman confirms them.
- Testimonials: only Paul Nair (Savi Provisions), which is published with
  attribution. Two unattributed quotes in the live site's hidden markup
  (Beetlecat, Bocado) are not used.
- Bo Wright's live-site portrait is a placeholder image, so his frame reads
  "Portrait pending".
- Coordinates are municipal centres, labelled as approximate.
- Image captions describe what each photograph shows; nothing more.
- `data/afield.js` — 36 records built from published photographs, published
  project facts and the Sawdust archive. All undated: no capture dates were
  available. Archive items are labelled as not Freeman jobsite evidence.
  The AI-generated radius-window study used elsewhere in the repo is
  deliberately **not** used here.
- `data/portal-demo.js` — sample data only, labelled as such on every
  portal screen. Sign-in, uploads, messaging and integrations are not
  implemented and the interface says so.

## Photography

Seven project galleries are served from the live site's asset library
(cdn.prod.website-files.com), as the rest of this repo already does. Only
the Barnsley and Optimist lead images and the archive references are in the
repo. If an image cannot load, the frame shows a labelled plate instead of a
broken image.

To bring every photograph into the repo:

```
cd brutalist && node scripts/localize-photography.mjs
```

That downloads ~76 images to `assets/photography/` and writes
`data/local-photography.js`; pages then prefer local files automatically.

## Adding content

- **Project:** add an object to `data/projects.js` (next `no`, unique
  `slug`). The index, plate sequence, detail page, territory plate and
  typology counts update themselves.
- **Afield record:** add an object to `data/afield.js` with the next unused
  `AF-` number. Use `image: { project, i }` to reuse a project photograph or
  `{ src }` for a new one. Leave `date` blank unless verified.
- **Portal:** replace `data/portal-demo.js` with an adapter that returns the
  same shape from a real source.

The HTML shells share a masthead and footer that are written out in each
file. If the navigation changes, update all nine; the mobile INDEX overlay
is built from the masthead automatically.

## Known gaps

- No dated field photography exists yet, so Afield cannot show sequence or
  progress over time. The structure supports it when captures arrive.
- The contact form prepares an email; it does not submit to a server.
- The portal is a demonstration.
- Project years show the published "Complete: 2024" for every project;
  worth confirming.
