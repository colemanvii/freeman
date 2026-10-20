# ETCETERA — study 001, round 4: composition refined, and the credo

Isolated study on `study/etcetera-index-001` (cut from production `release/approved-v5-2026-10-18` at 44cb8cc). Not merged, not deployed. Round 1 (three index studies, a review sheet, footer switches, labels) was judged clunky and over-explained and is replaced; it remains in this branch's history at 2dc33fd.

Preview: `/etcetera` on the branch preview, or http://localhost:8816/etcetera.html (`etcetera-index-001` in `.claude/launch.json`).

## The index (round 4)

Placed by hand on the site's twelve-column grid (`v5/etcetera/index/index.js` writes out every placement). Round 3 let Beetlecat dominate and read as vertical zones; round 4 composes one page:

- **Top line.** *Built for generations.* is the large graphic element, top left (columns 1–5), its full stop the one touch of red. Ruskin's printed passage on building for those who come after answers it, small, at the far right of the same line.
- **Baseline.** The two drawings stand together at left, the perspective wide and the elevation narrower and lower. Beetlecat rests at right at a medium scale, with open paper between it and the drawings. The Optimist note, the other restaurant piece, begins on Beetlecat's top line. The film, which has no footage yet, is only its play mark, closing the baseline like a full stop.
- **Phones** have their own six-column composition: the words, then Beetlecat with Ruskin and the note beside it, then the drawings, the play mark on the perspective's top line.
- Unchanged: pointing at an entry brings it forward, the rest recede, and its title appears. Keyboard focus does the same.

## The experiences, with only the navigation they need

The production shell everywhere: section line (ETCETERA current, returns to the index with the entry focused) and × CLOSE / Escape (real history; a direct arrival closes to the index). No footer.

- **Beetlecat**: the approved snapshot (`snapshot-001/`, unchanged from study/project-monograph-001 at 35264b1), composition A. Static, one viewport.
- **Built for generations**: a credo (`experiences/credo.js`, text in `texts/built-for-generations.js`). The title alone in the middle of the first screen; then the credo in one narrow column, Monaco at 16px, line-height 1.9, a blank line between stanzas and a longer pause before the last line; then a long silence and the authentic Freeman eagle (`v5/intro-eagle.svg`, the file committed as the exact original, the Webflow site's "Red Freeman Eagle.svg"), 96px wide, centred, with nothing beneath it. Every line break is set by hand within 34 characters, and the type is sized so 34 characters always fit, so the breaks hold on every screen (16px down to 375 wide; 13.6px at 320). The text is WORKING COPY, not approved company language: the file says so, and while `approved` is false the frame says WORKING COPY at bottom left. Closing "a" is the draft's; the alternative ("We don't get to decide what lasts…") is at `?closing=b`. × CLOSE returns to the index, including after a direct arrival.
- **Film**: one centred 16 : 9 frame, at most 80% of the frame's height. Select it (or Space) to play or pause; a small triangle shows while paused. No Freeman film is on file, so the frame says FOOTAGE FORTHCOMING; set `video.src` in `v5/etcetera/entries.js` and it plays.
- The four approved objects open as a single centred image; the Optimist note as text, its words unchanged.

## Files

`v5/etcetera/entries.js` (the collection, in index order), `index/`, `experiences/` (plate, essay, film, snapshot), `texts/`, `snapshot-001/`; routes `v5/etcetera-<slug>.html`; `v5/app.js` (ETCETERA routes and loader; holding flag `false` on this branch); every `v5/*.html` bumps the `app.js` cache version.

## Verified

- Index, scripted: 2560 × 1440, 1920 × 1080, 1440 × 900, 1366 × 768, 1280 × 720, 1024 × 768, 1024 × 600, 844 × 390, 667 × 375 (landscape); 768 × 1024, 430 × 932, 390 × 844, 375 × 667, 360 × 640 (portrait). No page scroll, every entry inside the frame, no two entries closer than a gutter.
- Credo, scripted, both closings: 2560 × 1440 down to 320 × 568. The column always fits the frame, no hand-set line rewraps, the credo scrolls, and the eagle is visible at the end of the scroll.
- In the browser (Chromium): index → credo → Space scrolls → × CLOSE returns to the index with the entry focused; × CLOSE after a direct arrival returns to the index; hover and keyboard focus on the index.
- Not tested: Safari or iOS (no WebKit browser can be driven here), real touch devices, video playback (no asset). The credo uses only features Safari supports (`dvh`, flexbox, `clip-path: polygon`; the scrollbar is hidden with both the standard and the WebKit property).
