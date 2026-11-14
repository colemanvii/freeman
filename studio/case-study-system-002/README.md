# Freeman Folio — Case Study System 002

A case study read one composed screen at a time, piloted on **Muchacho Decatur**.

**Authoritative branch: `claude/freeman-case-study-system-fcz54e`.** It contains, unchanged, everything on
`feature/case-study-001` (the scrolling template) and `claude/freeman-case-study-system-273x7a` (The Built
Record, study 001). Both earlier branches are left as they were. Not merged, not deployed, not linked from any
published page, `noindex`. The published project pages and the map are untouched.

- Prototype: `v5/folio/muchacho-decatur.html`
- Same system, different stories: `v5/folio/beetlecat.html`, `v5/folio/barnsley-gardens.html`
- Screens: `studio/case-study-system-002/screens/`

Serve `v5/` (`python3 -m http.server 8921` inside it) and open `/folio/muchacho-decatur.html`.

## 1. Audit

Three versions of Muchacho Decatur exist.

| | What it is | Keep | Reconsider |
|---|---|---|---|
| `v5/project-muchacho-decatur.html` (case study 001) | Opening screen, then five photographs in uniform pairs down a scrolling page | The opening: name and record at the left, the porch photograph whole, at full height. The type. The site frame. The evidence rules: the template writes nothing. | Everything after the opening. A door panel gets the same area as a room. Pairs are taller than the window, so no photograph is ever seen whole. It is the page Freeman says it does not want: photographs one after another. |
| `v5/built-record/` (Built Record 001) | Opening photograph parted against a line drawing; a tabbed "drawing set" of five sheets with keyed places; reserved construction plates; spreads; particulars | Keyed places on a photograph, with plain notes of what is visible. One renderer, one data file per project, sections that appear only when material exists. | The drawings. They are tracings of the photographs, so they show nothing the photograph does not, and they dress the page in documentation Freeman does not have. The seam cuts the best photograph in half. Reserved plates put absence at the centre. It is still a long scrolling page with a table of contents. |
| This study | | | |

Material on file for Muchacho, unchanged since 13 Nov: six finished photographs (2400 px; the porch is
1920 × 2400), a four-sentence account awaiting approval, published credits, the address and position, "built 1940".

**Drawings and construction records: none.** Checked again on 14 Nov: nothing in the repository, nothing in
Drive under the project's name or address, and the public building footprint (OSM) is not reachable from the
build environment. See section 5.

## 2. The idea

A building is not experienced as a column of pictures. It is met, entered, and looked at closely. So:

1. **Nothing scrolls.** A folio is an ordered set of *leaves*. A leaf is one composed screen, complete in
   itself, like a spread in a printed monograph. The reader turns leaves: arrow keys, the rail, a swipe,
   the wheel (one leaf per gesture), or a number in the address (`#4`).
2. **Scale means something.** Each leaf has its own composition. The porch stands at full height. The bar
   runs edge to edge as a band. The W.C. door, a detail, is set small beside a sentence set large. No two
   consecutive leaves share a layout.
3. **The account runs through the folio like a text through a book.** Freeman's account is split by
   sentence and clause and placed where the photographs bear it out: "the first things a guest meets"
   beside the front; "how little of that meeting shows" beside a cased opening. Word for word; the check
   suite compares the leaves with `records.js`.
4. **A photograph can be read.** Where a plate has keyed details, choosing one moves the frame across the
   photograph to that place (one 0.7 s move), with a key plan showing where the frame is and one sentence
   saying what is there. A click on the photograph steps to the next detail; Escape returns to the whole.
   Six photographs yield sixteen views without inventing anything.
5. **The index is the folio in miniature.** `I` (or Index) shows every leaf at once, to scale, as live
   miniatures of the real leaves, like a printer's flat plan. One click opens a leaf.

Motion is limited to a 0.28 s dissolve between leaves and the move of the frame. Both are off under
`prefers-reduced-motion`.

### What was kept from the earlier work

The opening photograph and its composition (unsplit); Libre Franklin and the site's micro-labels; the frame
(section line, Close); the evidence rules; keyed details and their notes (rewritten only to remove references
to the tracings); one renderer and one data file per project; white `#fff`, following the 12 Nov site decision.

### What was retired

The traced "record drawings", the seam on the opening photograph, reserved/placeholder plates, the table of
contents, and the scrolling page. The files remain in `v5/built-record/` for reference.

## 3. Muchacho Decatur, leaf by leaf

| | Leaf | Composition |
|---|---|---|
| 01 | Cover | Name and record left; porch photograph whole, full height |
| 02 | A house | First sentence of the account, set large; address and position |
| 03 | The front | The porch again, to be read: dormer, eave, sign, entrance, lattice window, rail |
| 04 | Front room | Photograph right, clause left; two details |
| 05 | Bar | Edge-to-edge band, no text |
| 06 | What is already there | Third sentence large; the W.C. door small |
| 07 | Cased opening | Photograph left with the fourth sentence; two details |
| 08 | Sideboard | One photograph, centred, alone |
| 09 | Particulars | Closing sentence; record; return to the map; next folio |

Phone: the same nine leaves recomposed upright. Detail keys become a row of numbered 44 px targets.

## 4. The system

| File | Role |
|---|---|
| `v5/folio/folio.js` | The renderer and the turning. Reads facts from `records.js`, `project-credits.js`, `record-assets/sites.js`, `record-assets/photos.js`. |
| `v5/folio/folio.css` | One stylesheet. |
| `v5/folio/folios/<slug>.js` | One project: its plates (captions, descriptions) and its ordered leaves. No facts restated. |
| `v5/folio/<slug>.html` | Page shell. |

Leaf types: `cover` · `text` (a passage, optionally with a small plate) · `plate` (`left`, `right`, `centre`,
`band`; optional `passage`, optional `details`) · `drawing` (a real sheet in a title block; implemented, unused)
· `colophon`. A project is an ordered list of these, so each project gets its own sequence and rhythm from the
same parts:

| Project | Shape in this study |
|---|---|
| Muchacho Decatur | A house: upright cover, read the front, move inside. Nine leaves. |
| Beetlecat | A room: wide cover, dining room as the band, counter upright. Six leaves. |
| Barnsley Family Pool | A landscape: wide cover, umbrellas and sky as the band. Five leaves. |

### To add a project

1. Copy `folios/beetlecat.js`. List its plates (photographs must be in `record-assets/photos.js`) and its leaves.
2. Give leaves their passages by position in the account (`1`, `[2, 1]`). Every sentence must be used once, in order.
3. Copy `beetlecat.html`, change the slug, title and description.
4. Run the checks.

## 5. Drawings and construction records

Studied; the answer is yes, and not yet. A plan would change this folio more than any other addition: the
index could become the plan, and each leaf could say where in the house it stands. But a drawing has to be a
drawing. Nothing is on file, so the folio shows none and does not imitate one.

The system is ready: a `drawing` leaf takes an SVG or image with sheet number, title, author, date and scale.
What is needed, in order of value:

1. The architect's or designer's floor plan for 129 Church Street, and permission to show or redraw it.
2. Dated construction photographs (the capture protocol in `PROJECT-RECORD.md` produces them).
3. Freeman's scope: what was kept, replaced, new.
4. Any permit set, elevation, millwork or MEP sheet Freeman may show.

## 6. Open before release

Carried from 13 Nov and still open: approval of the account; BLUR Workshop's role on Decatur; confirmation
that the door plate is Muchacho Decatur; photographer's name and permission (details are crops); guests are
identifiable in plates 02 and 03; dates, area, seats. New: the Barnsley account's first sentence is set large
exactly as published ("This Barnsley project defined by…") and reads as missing a word. The Barnsley and
Beetlecat captions here are new descriptions of what is visible and need a read.

Publishing means pointing `project-<slug>` at the folio, which is a separate, reviewed change.

## Checks

```
BASE=http://127.0.0.1:8921 node studio/case-study-system-002/check.mjs
BASE=http://127.0.0.1:8921 node studio/case-study-system-002/shots.mjs
```

14 Nov 2026: 993/993 in Chromium, three folios × (1600×900 @2x, 1440×900, 1280×720, 1024×768, iPhone 13,
iPhone SE, Pixel 5, reduced motion): the page never scrolls, one h1, every leaf complete on one screen, every
detail by click, Escape, Home, index, deep links, 44 px touch targets, account word for word.
**WebKit and Firefox were not run.**

## Known limits

- Needs JavaScript, like every page of the site.
- Details zoom to at most 2.4× on 1920–2400 px files; the tightest are soft on high-density screens.
- The band crops its photograph (the bar loses about a third of its height at 1440 × 900). On phones it is shown whole.
- Uses container query units and `:has()`; browsers from 2023 on.
- The wheel turns leaves. Trackpad momentum is held to one leaf per gesture by a 0.65 s pause.
