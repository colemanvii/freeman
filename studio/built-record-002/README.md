# Freeman case studies — production prototype (002)

**Round 2, 16 Nov 2026 (later).** Two briefs from Cole changed the system; this section is current and
overrides anything below it.

The journey: **Projects map → project overview (the map's panel) → View full case study → slideshow.**

- The slideshow opens at the project's existing address, `/project-muchacho-decatur`. `v5/project-muchacho-decatur.html`
  is now the slideshow shell; the standalone `/built/` contents page and `/built/muchacho-decatur.html` are gone.
- A project has a slideshow when its record in `v5/records.js` has `"slideshow": true`. Only Muchacho has it.
  The overview then shows `View full case study →` straight after its photographs; every other project
  keeps `Full project →` where it was. One changed line in `record-assets/record.js`; the map is otherwise untouched.
- `← Back to project` (top right, and on the last slide) returns to that project's overview. Arriving from
  the overview it goes back in history, so the map is as it was left; arriving directly it opens `/map?p=<slug>`.
  Slides replace the address (`#3`), never push, so browser Back leaves the case study in one step.
- One ground everywhere, the site's off-white `#fff9f1`. No dark slides.
- Previous and next arrows stand in the left and right margins at mid-height (at the foot on phones, either
  side of the counter). Arrow keys and swipe. Counter `03 / 07` at the foot, centred. One 0.28 s dissolve.
- Three compositions: the opening; a photograph alone; a photograph with a short passage at its right
  (beneath it on phones). Plus the record slide, and `drawing` for a real sheet. Removed: dark ground,
  bands, the plate of crops, the whole-photograph view, the tick rail, the wheel, the hint text.
- Muchacho is seven slides: opening · door open + passage · front room · bar + passage · cased opening +
  passage · wall light · record. Six photographs, each shown once and whole.
- **Barnsley and The Optimist have not been moved to this system.** Their files still open at
  `/built/barnsley-resort.html` and `/built/the-optimist.html` on the new ground with the new navigation, but
  their slides are the round 1 compositions and are not for review.

Local: `wrangler pages dev v5 --port 8932` (clean URLs are needed), then `/map?p=muchacho-decatur`.
Check: `PW=<playwright> node studio/built-record-002/journey.mjs` — 379 checks, Chromium, seven screen sizes:
the overview action, the address, every slide fits, arrows clear of the photograph, counter, ground,
Back to project, browser back and forward, deep link, swipe, and Beetlecat still reading `Full project`.
**WebKit and Firefox were not run.**

---

# Round 1 notes (superseded where they differ)

16 Nov 2026. Branch `feature/built-record-002`, cut from the five-leaf folio branch
(`claude/freeman-case-study-system-fcz54e`) and merged with production
(`release/approved-v5-2026-10-18` @ 95d7bfc). Not deployed to production, not linked from any published
page, `noindex` (`v5/_headers`, `/built/*`). The published project pages and the map are untouched.

- Contents: `v5/built/index.html`
- Studies: `v5/built/muchacho-decatur.html`, `barnsley-resort.html`, `the-optimist.html`
- Screens, desktop and phone: `studio/built-record-002/screens/`
- What is missing: `REGISTER.md`

Serve `v5/` (`python3 -m http.server 8932 --directory v5`) and open `/built/`.

## Audit

| Earlier work | Kept | Dropped |
|---|---|---|
| Case study 001 (`v5/case-study/`, scrolling template) | The opening: name, record, the photograph whole. The rule that the page writes no facts. | The scroll, and photographs in uniform pairs. |
| Built Record 001 (`v5/built-record/`, drawing set) | One renderer, one data file per project. | Drawings traced from photographs; reserved plates that put absence at the centre. |
| Folio 002 (`v5/folio/`, nine leaves) | The leaf: one composed screen, nothing scrolls. | Nine leaves for six photographs. |
| Folio 003 (`v5/folio-2/`, five leaves) | Five leaves. White outside, dark inside. The name large at the foot of the cover. The plate of matched crops. The record with every photograph whole. | The cover photograph repeated on leaf 02. The keyed "read the photograph" control and the index of miniatures: both were interface, not editing. A sentence cut at a semicolon. The bar shown twice. |

Projects with enough real material to publish, in order: Muchacho Decatur (eight photographs, verified
date and building, credits), Barnsley Resort (three works on Freeman's record, a third-party credit that
names Freeman, eight photographs across two sets), The Optimist (the only project whose scope, schedule
and result Freeman has published; three photographs, none of the work itself). Beetlecat has the best
finished photographs after Muchacho but no scope, date or account beyond "led construction". Every other
project has one or two small photographs or none.

## The three studies

| | Shape | Leaves |
|---|---|---|
| Muchacho Decatur | A house: met from the street, entered, looked at closely. White, then dark, then white. | Cover · The front · Inside · In the walls · Record |
| Barnsley Resort | A place with three works. All landscape; photographs paired at two scales. | Cover · The place · Family pool · Woodlands · On site · Record |
| The Optimist | A job against a clock. Short and dark. The schedule is set as type because no photograph shows the work. | Cover · Three weeks · Lit cabinet · Record |

Changes to Muchacho from the five-leaf folio: leaf 02 now shows the porch in the evening with the door
open (a photograph not used before) instead of repeating the cover; the account is six whole sentences;
the crops are Window, Doorway, Door and Wall light, so the bar appears once; "Opened November 2026" is
added to the record.

## Content structure

One file per study, `v5/built/studies/<slug>.js`, plus one line in `v5/built/index.js`.

```js
window.FREEMAN_BUILT["<slug>"] = {
  record: "<slug in records.js>",   // optional; defaults to the study's own slug
  project: { id, name, type, location },   // only when the study stands for several records (Barnsley)
  site: { precision, lat, lon, address, area },   // only with `project`
  credits: [["Label", ["partner-key" | { name, url }]]],   // only with `project`; else project-credits.js
  account: ["One sentence.", "…"],   // each sentence's source is noted in the file's header
  plates: { "01": { src, caption, alt } },   // src must be in record-assets/photos.js
  leaves: [ … ]
};
```

Leaves. `lead` and `passage` take a sentence number or a literal string. `ground: "dark"` on any leaf.

| Type | Fields |
|---|---|
| `cover` | `plate`; `layout: "band"` for a wide photograph edge to edge |
| `plate` | `plate`, `side: "left" \| "right" \| "band"`, `lead`, `passage`, `label`, `focus` |
| `pair` | `plates: [a, b]`, `layout: "tall-left" \| "tall-right" \| "major-left"`, `lead`, `passage`, `label` |
| `typology` | `items: [{ plate, name, view: [x, y, w, h] }]`, `lead`, `passage` |
| `statement` | `figure`, `lead`, `passage`, `list`, `listTitle`, `source` |
| `drawing` | `sheet`, `title`, `by`, `date`, `scale`, `src` or `svg`. For a real sheet; unused until one is on file |
| `colophon` | `lead`, `passage`, `particulars: [[k, v]]`, `works: [{ no, name, note }]`, `plates: true`, `next` |

To add a study: copy a study file; add its photographs with
`SHARP=<path> node studio/case-study-001/add-photos.mjs assets/projects/<file>.jpg`; copy an `.html`
shell and change the slug, title and description; add the line to `index.js`; run the check.

## Checks

```
PW=<path to node_modules/playwright> node studio/built-record-002/shots.mjs
```

16 Nov 2026, Chromium: 105 leaves (15 leaves and the contents at 1920×1080, 1440×900, 1280×720, 1024×768,
iPhone 13, iPhone SE, Pixel 5). Every leaf fits one screen, no clipped text, no missing image, no script
error. **WebKit and Firefox were not run.**

## Before release

- Approval of the three accounts and the register items marked "blocks publication".
- Publishing means pointing `project-<slug>` (or the map's "Full project" link) at the study and removing
  the `/built/*` block from `_headers`. That is a separate, reviewed change.
- The four earlier prototypes (`v5/case-study`, `v5/built-record`, `v5/folio`, `v5/folio-2`) are still on
  this branch for comparison and should be removed before a release.
- Phones under 620 px of usable height do not show the strip of whole photographs on the record leaf;
  every photograph still opens whole when tapped.
- The dark ground `#17140f` is still not one of the site's palettes.
