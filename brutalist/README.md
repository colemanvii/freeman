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

| Page | File | Notes |
|---|---|---|
| Entry | `index.html` | The near-empty reference screen: five words, four corners |
| Freeman GC | `freeman-gc.html` | Position, practice, typologies, territory, method, people, FAQ |
| Projects | `projects.html` | Numbered index → hover plate → plate sequence |
| Project | `project.html?p=<slug>` | One template for every project |
| Afield | `afield.html` | Field record: search, kind/project filters, ledger/sheet views, Sawdust |
| Afield record | `record.html?r=AF-001` | One template for every record |
| Contact | `contact.html` | Verified contact lines and an inquiry that prepares an email |
| Client Portal | `portal.html` → `portal-demo.html` | Access page, then a labelled demonstration |

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

**Structure.** A 12-column grid inside a 1440px measure; every section opens
on a hairline with a number, a label and an aside. Rows are 42px. No
rounded corners, shadows, gradients, carousels or scroll animation. The only
motion on the site is the entry clock.

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
file. If the navigation changes, update all nine.

## Known gaps

- No dated field photography exists yet, so Afield cannot show sequence or
  progress over time. The structure supports it when captures arrive.
- The contact form prepares an email; it does not submit to a server.
- The portal is a demonstration.
- Project years show the published "Complete: 2024" for every project;
  worth confirming.
