# Project Monograph 001: Beetlecat

An isolated study on branch `study/project-monograph-001`, cut from the production release branch `release/approved-v5-2026-10-18` at 44cb8cc. Not merged into production, not deployed to production.

The monograph is an **ETCETERA object**: object 005 in the ETCETERA collection, which opens it at its own site route, `/etcetera-monograph-001`.

- Files: `v5/etcetera/monograph-001/` (`beetlecat.js` data, `monograph.js` module, `monograph.css`, `details/`), route shell `v5/etcetera-monograph-001.html`
- Production files changed on this branch: `v5/app.js` (route, ETCETERA object, loader; holding flag off) and `v5/etcetera.html` (asset version)
- Local preview: `http://localhost:8815/etcetera.html`
- Asset audit: [`INVENTORY.md`](INVENTORY.md)

## ETCETERA on this branch

Live ETCETERA has shown a temporary `UNDER CONSTRUCTION` holding state since 44cb8cc. The approved collection (cc00dae) is still in `app.js` behind `etceteraPublicHolding`. This branch sets that flag to `false` so the monograph can be seen within the approved composition. Releasing the monograph would therefore also end the holding state. That is a separate decision.

## Principle

The result proves taste. The evidence proves capability. The monograph shows the finished work at its best, then places it beside the record that would prove how it was built. Where that record does not exist, the page holds a frame open for it rather than filling it.

## What is native, and what is new

Native, reused rather than restyled: production `styles.css` (tokens, Monaco, the three palettes, hover words, crosshair cursors), `palette.js`, the interior shell (section line with PROJECTS in orange, × CLOSE, PREV · count · NEXT), the gallery's `.pg` layout and 220px information column, credit links, the project-plate caption and Company's headline register. The photographs are production's own files.

New, only within the study:

- **The frame scrolls.** Production's `.viewport` keeps its exact edges; the header and sheet controls stay fixed. Production pages still never scroll.
- **The information column becomes a margin.** It continues down the story and carries every caption, so photographs keep the field to themselves.
- **Sheets.** PREV / NEXT and ← → move one sheet, and the count reads `03 / 07`, just as on production's paged pages. Moves are immediate (production uses no transitions). Escape and × CLOSE are history.
- **Status.** Every fact carries one status: Shown, Credited, Stated or Not on file. Freeman red marks only *Stated*, a claim Freeman has made that nothing on file yet shows.

## The standard: seven sheets

| | Sheet | Holds | Rule |
|---|---|---|---|
| 01 | Plate | The project gallery layout, opened on the ETCETERA cover photograph, plus the sheet list | The photograph the visitor chose is the one that opens. |
| 02 | Account | Freeman's published account, quoted verbatim, and the status of each fact | Never paraphrase the account. A missing credit is shown missing. |
| 03 | Field plate | One photograph at full frame height, beside the margin | Caption in the margin. |
| 04 | Room | One landscape photograph across margin and field, with a project-plate caption | The widest moment. Shown once. |
| 05 | Detail | Crops of the credited photographs at no more than natural size, in rows of one or two, then one quiet photograph | Each crop names its plate and says CROP. List only what is visible: no makers, products or installers unless on file. |
| 06 | Field record | Each finished detail beside a frame of the same proportion for its construction evidence | A request, never a description. Real field photographs replace the frames one by one. |
| 07 | Record | Register, sources, next project, gallery, return | Dates and design credits appear only when verified. |

A new monograph is a new data file like `beetlecat.js`: plates, details, detail rows, claims, record requests and the next project. `monograph.js` and `monograph.css` do not change.

## Within the site

- **Discovering:** ETCETERA gains a third column. Object 005, the Beetlecat threshold photograph, spans both rows, and its caption sits on the second row's baseline. The four existing objects keep their order, alignment and baselines. On phones, the collection keeps its 2 × 2, with the monograph as one captioned line above it.
- **Entering:** the object is a link to `/etcetera-monograph-001`. `app.js` handles it in place like every other route, so palette and history carry over. The section line shows ETCETERA as the current section. The monograph's scripts and styles load on first use, and its cover styles load with ETCETERA.
- **Navigating:** PREV · count · NEXT, ← →, the sheet list in the margin, and scrolling within the frame.
- **Returning:** × CLOSE, Escape and RETURN / ETCETERA all go back in history. On a direct arrival with no earlier page in the visit, they fall back to the entrance, as every detail page does. Back and Forward, and reloading, return to the same place in the story.
- **Continuing:** the last sheet links to the Beetlecat gallery and to the next project, The Optimist, both in place.

## Open questions

1. Permission from Jared Swafford to publish crops of his photographs, and higher-resolution originals.
2. Whether a design credit exists for Beetlecat. The production record has none, so none is shown.
3. Whether Rocket Farm Restaurants will give a statement.
4. Whether Freeman has any Beetlecat field photographs at all. If it does, sheet 06 fills in with no layout change.
