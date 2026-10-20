# Project Monograph 001: Beetlecat

An isolated study on branch `study/project-monograph-001`, cut from the production release branch `release/approved-v5-2026-10-18` at 44cb8cc. Not merged into production, not deployed to production.

The monograph is an **ETCETERA object**: object 005 in the ETCETERA collection, which opens it at its own site route, `/etcetera-monograph-001`.

- Files: `v5/etcetera/monograph-001/` (`beetlecat.js` data, `monograph.js` plate composer, `monograph.css`, `details/`), route shell `v5/etcetera-monograph-001.html`
- Production files changed on this branch: `v5/app.js` (route, ETCETERA object, loader, paging and swipe; holding flag off) and `v5/etcetera.html` (asset version)
- Local preview: `http://localhost:8815/etcetera.html`
- Asset audit: [`INVENTORY.md`](INVENTORY.md)

## ETCETERA on this branch

Live ETCETERA has shown a temporary `UNDER CONSTRUCTION` holding state since 44cb8cc. The approved collection (cc00dae) is still in `app.js` behind `etceteraPublicHolding`. This branch sets that flag to `false` so the monograph can be seen within the approved composition. Releasing the monograph would therefore also end the holding state. That is a separate decision.

## Principle

The result proves taste. The evidence proves capability. The monograph shows the finished work at its best, then places it beside the record that would prove how it was built. Where that record does not exist, the page holds a frame open for it rather than filling it.

## Non-negotiable

Static and one viewport. ETCETERA and every plate of the monograph fit inside production's fixed `.viewport` frame on desktop and phones. Nothing scrolls, nothing overflows sideways, and nothing is hidden by clipping. Plates are recomposed for phones, never cropped.

## What is native

Production `styles.css` tokens, Monaco, the three palettes, hover words, crosshair cursors, the interior shell (section line with ETCETERA current, × CLOSE), and production's own paging: `chrome()`, PREV · 03 / 05 · NEXT, ← →, `?sheet=` in the URL, and Escape through history. Plate 01 is the project gallery layout (`.pg`). Plate 02 is production's project plate (`.project-plate`). Plate 03 uses Company's headline register. Phones split two plates across two sheets, as Company does. The only additions are horizontal swipes on touch screens (like the project gallery) and preloading of the plate photographs.

## ETCETERA

The approved 2 × 2 keeps its four objects, their order, columns and caption baselines. Object 005 enters below them as one index line on a hairline, set on the same two columns: `005 / PROJECT MONOGRAPH 001 · BEETLECAT` in the caption style, and `OPEN MONOGRAPH ↗` in the collection's own red OPEN ↗ style. To make room, the four objects render about 9% smaller at 1440 × 900.

## The plates

| | Plate | One idea | Composition |
|---|---|---|---|
| 01 | Beetlecat | Arrival | Gallery layout: name, place and credits beside the threshold photograph (the ETCETERA cover), with the plate list |
| 02 | The bar | The room | One photograph as a production project plate, with the large caption |
| 03 | Account | Freeman's words, and their standing | Company register: the published account verbatim, beside the record with each status. Freeman red marks *stated*. |
| 04 | Material | Craft | Five crops at one height, numbered D—01 to D—05, with a key. Never larger than their source. |
| 05 | Field record | The gap | The finished dining room beside an open frame of the same proportion, *NOT ON FILE*; what is requested; continue to the project, The Optimist, or back to ETCETERA |

Phones (portrait): 7 sheets. Account and record are split, and the Field record is split into the pair and a Continue sheet. The material crops sit in two rows. Short screens (phones in landscape): the same 7 sheets, composed side by side with tighter type.

**Verified by script** at 1920 × 1080, 1440 × 900, 1280 × 720, 1024 × 768, 1024 × 480, 844 × 390, 667 × 375, 390 × 844, 375 × 667, 375 × 812 and 360 × 640. On every sheet, every element sits inside the frame, the frame does not scroll, and the page has no horizontal or vertical overflow. ETCETERA was checked the same way at 1440 × 900, 1280 × 720, 1024 × 480, 844 × 390, 390 × 844 and 360 × 640.

## Detail crops (source pixels)

| Crop | From | x, y, w, h |
|---|---|---|
| D—01 door | `beetlecat-interior-2.jpg` | 860, 500, 340, 940 |
| D—02 counter front | `beetlecat-interior-2.jpg` | 0, 1240, 840, 660 |
| D—03 window frames | `beetlecat-3.jpg` | 1540, 0, 380, 860 |
| D—04 stools | `project-0.jpg` | 1040, 650, 560, 620 |
| D—05 carpet | `beetlecat-interior-2.jpg` | 840, 1420, 600, 500 |

A new monograph is a new data file like `beetlecat.js`. `monograph.js` and `monograph.css` do not change.

## Within the site

- **Discovering:** ETCETERA object 005, as described above.
- **Entering:** a link to `/etcetera-monograph-001`, handled in place by `app.js`, so palette and history carry over. Scripts and styles load on first use.
- **Navigating:** PREV / NEXT, ← →, swipes, and the plate list on plate 01.
- **Returning:** × CLOSE, Escape and RETURN / ETCETERA go back in history. On a direct arrival, they fall back to the entrance, as every detail page does.

## Open questions

1. Permission from Jared Swafford to publish crops of his photographs, and higher-resolution originals.
2. Whether a design credit exists for Beetlecat. The production record has none, so none is shown.
3. Whether Rocket Farm Restaurants will give a statement.
4. Whether Freeman has any Beetlecat field photographs at all. If it does, the open frame on plate 05 takes one with no layout change.
