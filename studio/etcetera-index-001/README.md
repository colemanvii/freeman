# ETCETERA — Editorial index and independent experiences, study 001

An isolated design study on branch `study/etcetera-index-001`, cut from the production release branch `release/approved-v5-2026-10-18` at 44cb8cc. **Not merged, not pushed, not deployed.**

- Review sheet: `/studies/etcetera-index-001/` (links to all six deliverables, the 50-entry capacity tests and the approved 2 × 2)
- Local preview: `etcetera-index-001` in `.claude/launch.json` → http://localhost:8816/studies/etcetera-index-001/

## What exists before this study

| | Where | State |
|---|---|---|
| Production ETCETERA | `v5/app.js` `etcetera()` at 44cb8cc | Public holding state: `UNDER CONSTRUCTION`. The approved 2 × 2 (cc00dae: Ruskin, Optimist note, two drawings) sits behind `etceteraPublicHolding`. |
| Beetlecat | `study/project-monograph-001` @ 35264b1 | Third direction, after the scrolling monograph and the five-plate version were rejected: ETCETERA 005, one static snapshot, "Two colours, one curve.", composed three ways (A Spread, B Band, C Plate). No choice among A/B/C is on record. |
| Built for Generations | `study/built-for-generations` @ 71da220 | A *Conversations* series (Study 002 approved art direction) with example participants only. A different idea from the essay asked for here; not reused. |
| `study/etcetera-living-index-2026-10-20` | b9ffba8 | A single-file prototype; not built on. |

## The system

- **One registry**: `v5/etcetera/entries.js`. Every index and experience reads it. Fields: `no`, `slug`, `title`, `type`, `date`, optional `dek`, `image`, `video`, `weight`, and `experience: { module, files }`.
- **Modules**: `v5/etcetera/experiences/` (`plate`, `essay`, `film`, `snapshot`); see the README there. A new entry is one registry object plus a route file; a new kind of entry is one module. `app.js` never changes.
- **Routes**: every entry is a real file, `v5/etcetera-<slug>.html`, so deep links and refreshes work. In-site links use production's History API navigation.
- **Index studies**: `v5/etcetera/index/` — `etcetera.html?index=a|b|c`, switched in the footer (`INDEX A B C`, replaces history; remembered for the visit). `?index=approved` shows the approved 2 × 2 for comparison.
- **Pagination**: each study measures its frame and pages with production's own sheet controls (`PREV 01 / 05 NEXT`, `?sheet=`, ← →, and a horizontal swipe on phones). A short collection's rows open up to fill the frame; a long one pages.
- **Capacity test**: `?fill=43` adds 43 rows labelled `RESERVED / CAPACITY TEST` (review only, muted, not links) to show fifty entries.
- **Navigation**: × CLOSE and Escape are real history back; on a direct arrival an experience closes to the ETCETERA index rather than the entrance. The ETCETERA link in the section line returns to the index study in use with the entry focused. The footer's `← 004 / 006 →` steps between entries without adding history, so × CLOSE still returns to the index. Returning to the index restores the sheet and focuses the entry you opened.

## The index studies

| | Name | Composition |
|---|---|---|
| A | Typographic | A ledger on the twelve columns: NO. / TITLE (16–23px) / TYPE / DATE. The left margin states the collection and counts it by type; the counts filter (`?type=`). Hover or focus reads the entry's one line at the foot of the ledger. Phones: titles wrap to two lines, type and date beneath. |
| B | Visual | A contact sheet: every entry's material at one shared height, wrapped on the frame. Text entries are set as type under a rule; a film is a frame at its proportion. The register beneath names the entry under the cursor (LATEST when idle). |
| C | Composed | An issue: each sheet leads with its weightiest entry at large scale (006 is set as type, 80px), two figures beside it (weight 2, with material), the rest as lines with small thumbnails. The same structure on every sheet, whatever the content. |

## The experiences

| | Entry | Module | Notes |
|---|---|---|---|
| 001 | John Ruskin, on building | plate | Approved object, unchanged |
| 002 | On building a place people want to return to. | essay | Approved note, text verbatim from production, with its "not yet verified" line |
| 003, 004 | Architectural drawing, Residential perspective | plate | Approved objects, unchanged |
| **005** | **Beetlecat: two colours, one curve** | snapshot | The approved snapshot, carried over unchanged (`snapshot-001/`, one selector renamed for the new route). Static, one viewport. Study A by default; `STUDY A B C` stays in the footer because no choice is on record. |
| **006** | **Built for generations** | essay | One narrow column (58ch, from the fifth column, numerals hanging in the margin) that scrolls inside the frame. No images. |
| **007** | **Film** | film | One centred frame at 16 : 9, at most 86% of the frame's height and 1120px wide, one line of controls. No Freeman film is on file, so it is a placeholder in the tone production uses for an unloaded photograph. Give the entry a `video.src` and the same frame plays it (PLAY / PAUSE, time, FULL SCREEN, Space or K). Nothing autoplays. |

## Evidence and copy

- 006 is **working copy** drafted for this study and labelled on the page: "Not a quotation, and not yet approved by Freeman." It attributes nothing to Gabe Freeman or anyone else and claims nothing about any project. The only facts used are on the live site (a Georgia general contractor with a deliberate focus on hospitality; BUILT FOR GENERATIONS™ on the entrance). The one quotation is John Ruskin, *The Seven Lamps of Architecture* (1849), "The Lamp of Memory", public domain; it links to entry 001.
- The index's one-line statement ("Things Freeman finds interesting, meaningful or worth sharing…") and every `dek` are working copy too.
- Dates are when an entry joined the collection (October 2026), not when the work was made.
- No fictional entries: the seven entries are the four approved objects, the approved Beetlecat snapshot, the essay and the honest film placeholder.

## Verified

Scripted fit test (each page in a frame of the given size: the document never scrolls; for every static page every element sits inside production's `.viewport` frame and the frame does not scroll; the essay's column does scroll):

- Index A, B, C at 1920 × 1080, 1440 × 900, 1280 × 720, 1024 × 768, 768 × 1024, 844 × 390, 430 × 932, 390 × 844, 375 × 667, 360 × 640: all pass. One sheet everywhere except A and C on 844 × 390 and the two smallest phones (two sheets).
- Index A, B, C with 50 entries at 1440 × 900, 1024 × 768, 844 × 390, 390 × 844, 360 × 640: all pass, paged (A 5–13 sheets, B 2–5, C 6–12).
- Beetlecat, Built for Generations, Film, a plate, at 1440 × 900, 1024 × 768, 844 × 390, 390 × 844, 360 × 640; the note, a drawing and the review sheet at 1440 × 900 and 390 × 844: all pass.
- In the browser: entrance → ETCETERA → keyboard focus + Enter → Film → `← 006` (replaces history) → Back returns to the index with 007 focused → Back to the entrance → Forward twice; Escape closes; × CLOSE on a direct arrival goes to the index; A's filter and ← → paging; the umber palette.

Not verified: real touch devices (swipe was written but tested only by reading), Safari, and video playback (no video asset exists). Production routes (Company, Projects, a project, Contact, entrance) still render; their own internal scrollers are unchanged by this study.

## Production files changed on this branch

- `v5/app.js`: ETCETERA routes, loader, index switch and experience shell; the holding flag is `false`; × CLOSE falls back to the index for experiences; links with `data-replace` replace history. The approved 2 × 2 is kept intact as `etceteraCollection()`.
- `v5/*.html`: `app.js` cache version only.
- New: `v5/etcetera-*.html` (7), `v5/etcetera/{entries.js,shell.css,index/,experiences/,texts/,snapshot-001/}`, `v5/studies/etcetera-index-001/`.

Releasing any of this would also end the production holding state, which is a separate decision.
