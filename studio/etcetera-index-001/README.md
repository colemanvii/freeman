# ETCETERA — study 001, round 2: one line

Isolated study on `study/etcetera-index-001` (cut from production `release/approved-v5-2026-10-18` at 44cb8cc). Not merged, not deployed. Round 1 (three index studies, a review sheet, footer switches, labels) was judged clunky and over-explained and is replaced; it remains in this branch's history at 2dc33fd.

Preview: `/etcetera` on the branch preview, or http://localhost:8816/etcetera.html (`etcetera-index-001` in `.claude/launch.json`).

## The direction

Taken from the site's strongest compositions: the entrance (one centred line in open paper, almost nothing else), the approved 2 × 2 (objects resting on a common baseline) and the project gallery (one thing, large).

- **Index**: every entry on one horizon in the middle of the page. Photographs and drawings at one height; words set as type at a size tied to that height, the title's full stop in Freeman orange; the film as a frame at its own proportion with a small play mark. All rest on one baseline, evenly spaced, with paper at both ends. No labels, numbers, types, copy or controls.
- **Selectable without instruction**: the orange cursor over every object; pointing at one makes the rest step back and its title appear beneath it. Keyboard focus does the same. One click or tap opens the experience directly.
- **Fit**: one line whenever its material can stand at a comfortable height (desktop and laptop, 1280 × 720 up); otherwise as few lines as keep it there (tablet two, phone three). It would page with production's sheet controls only if even the smallest line could not fit.

## The experiences, with only the navigation they need

The production shell everywhere: section line (ETCETERA current, returns to the index with the entry focused) and × CLOSE / Escape (real history; a direct arrival closes to the index). No footer.

- **Beetlecat**: the approved snapshot (`snapshot-001/`, unchanged from study/project-monograph-001 at 35264b1), composition A. Static, one viewport.
- **Built for generations**: the title alone, centred, in the first screen; then one centred 50ch column that scrolls inside the frame. No kicker, numerals or end links. Working copy, said once in the closing line. The Ruskin quotation (1849, public domain) is the only quotation.
- **Film**: one centred 16 : 9 frame, at most 80% of the frame's height. Select it (or Space) to play or pause; a small triangle shows while paused. No Freeman film is on file, so the frame says FOOTAGE FORTHCOMING; set `video.src` in `v5/etcetera/entries.js` and it plays.
- The four approved objects open as a single centred image; the Optimist note as text, its words unchanged.

## Files

`v5/etcetera/entries.js` (the collection, in index order), `index/`, `experiences/` (plate, essay, film, snapshot), `texts/`, `snapshot-001/`; routes `v5/etcetera-<slug>.html`; `v5/app.js` (ETCETERA routes and loader; holding flag `false` on this branch); every `v5/*.html` bumps the `app.js` cache version.

## Verified

Scripted fit test, no page scroll and nothing outside the frame: index at 1920 × 1080, 1440 × 900, 1366 × 768, 1280 × 720 (one line), 1024 × 768, 768 × 1024, 844 × 390, 667 × 375 (two lines), 390 × 844, 360 × 640 (three lines); every experience at 1440 × 900, 1024 × 768, 844 × 390, 390 × 844, 360 × 640. In the browser: hover and keyboard focus, Enter to open, Escape back with focus restored, Back/Forward. Not verified: real touch devices, Safari, video playback (no asset).
