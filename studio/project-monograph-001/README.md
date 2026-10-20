# Project Monograph 001: Beetlecat

An isolated study on branch `study/project-monograph-001`, cut from the production release branch `release/approved-v5-2026-10-18` at 44cb8cc. Nothing under `v5/` outside `v5/studies/project-monograph-001/` is changed. Not merged, not deployed.

- Page: `v5/studies/project-monograph-001/` (served locally at `http://localhost:8815/studies/project-monograph-001/`)
- Asset audit: [`INVENTORY.md`](INVENTORY.md)

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
| 01 | Plate | The production gallery page, unchanged, plus the sheet list | Entering from the gallery shows the same photograph in the same place. |
| 02 | Account | Freeman's published account, quoted verbatim, and the status of each fact | Never paraphrase the account. A missing credit is shown missing. |
| 03 | Threshold | One portrait photograph at full frame height | Caption in the margin. |
| 04 | Room | One landscape photograph across margin and field, with a project-plate caption | The widest moment. Shown once. |
| 05 | Detail | Crops of the credited photographs at no more than natural size, in rows of one or two, then one quiet photograph | Each crop names its plate and says CROP. List only what is visible: no makers, products or installers unless on file. |
| 06 | Field record | Each finished detail beside a frame of the same proportion for its construction evidence | A request, never a description. Real field photographs replace the frames one by one. |
| 07 | Record | Register, sources, next project, gallery, return | Dates and design credits appear only when verified. |

A new monograph is a new data file like `beetlecat.js`: plates, details, detail rows, claims, record requests and the next project. `monograph.js` and `monograph.css` do not change.

## Connecting it to the site (proposed, not applied)

- **Entering:** on the project gallery page (`project-beetlecat`), add one line under the credits, `MONOGRAPH ↗`, in the existing `.pg-related` slot that `styles.css` already defines. In the Projects index preview, `VIEW PROJECT ↗` can stay pointed at the gallery; the gallery then becomes the monograph's first sheet.
- **Navigating:** inside the monograph only (sheets, ← →, the margin's sheet list).
- **Returning:** × CLOSE and Escape go back in history, so the visitor lands on the Projects index with Beetlecat still selected (verified). On a direct arrival, they fall back to `/projects`.
- **Route:** production would serve it at `/project-beetlecat/monograph` or `/monograph-beetlecat`. Either needs a small route and a `parse()` case in `app.js`, or a standalone page as here. Decide before any production work.

## Open questions

1. Permission from Jared Swafford to publish crops of his photographs, and higher-resolution originals.
2. Whether a design credit exists for Beetlecat. The production record has none, so none is shown.
3. Whether Rocket Farm Restaurants will give a statement.
4. Whether Freeman has any Beetlecat field photographs at all. If it does, sheet 06 fills in with no layout change.
