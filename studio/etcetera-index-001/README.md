# ETCETERA — Index Study 002 (on top of study 001, round 4)

Index Study 002 is on `study/etcetera-index-002`, cut from `study/etcetera-index-001` at 854cf60; the round 4 index is kept as tag `archive/etcetera-index-001-round4`. Study 001 was an isolated study on `study/etcetera-index-001` (cut from production `release/approved-v5-2026-10-18` at 44cb8cc). Not merged, not deployed. Round 1 (three index studies, a review sheet, footer switches, labels) was judged clunky and over-explained and is replaced; it remains in this branch's history at 2dc33fd.

Preview: `/etcetera` on the branch preview, or http://localhost:8816/etcetera.html (`etcetera-index-001` in `.claude/launch.json`).

## The index: a table of contents (Index Study 002)

The collage compositions are retired (round 4 recoverable at tag `archive/etcetera-index-001-round4`). Taking only the clarity of terrain.com/productions (one quiet list, generous spacing) and none of its rows, dividers, thumbnails or type:

- **One list** in columns 2–7 of the site's twelve-column frame, a little above the middle, as the entrance's line sits. Every title ends in a Freeman orange full stop, the way the site sets its headings ("Built for generations." "What we do." "Our people." on Company).
- **Two levels.** The three experiences (Built for generations, Beetlecat, Film) are set large and close, as chapters; after a pause, the four approved objects follow, small, as sections. Marked by `lead: true` in `entries.js`; the order of `entries.js` is the order of the contents.
- **One small preview.** Columns 9–12 hold a frame exactly the list's height, empty at rest. Pointing at (or focusing) an entry shows its material from the frame's top-left corner, on the first title's cap line: the photograph or drawing, the film's play mark, nothing for words. The selected title stays; the others recede. While the pointer is over the list it decides; otherwise keyboard focus does.
- **Phones:** the titles alone, large and small; a tap opens the experience directly.
- **Pagination:** only when a frame cannot hold the list (e.g. 667 × 375), with production's PREV / NEXT, ← → and swipe; a sheet never ends on the first entry of a new group.

## The experiences, with only the navigation they need

The production shell everywhere: section line (ETCETERA current, returns to the index with the entry focused) and × CLOSE / Escape (real history; a direct arrival closes to the index). No footer.

- **Beetlecat**: the approved snapshot (`snapshot-001/`, unchanged from study/project-monograph-001 at 35264b1), composition A. Static, one viewport.
- **Built for generations**: a credo (`experiences/credo.js`, text in `texts/built-for-generations.js`). The title alone in the middle of the first screen; then the credo in one narrow column, Monaco at 16px, line-height 1.9, a blank line between stanzas and a longer pause before the last line; then a long silence and the authentic Freeman eagle (`v5/intro-eagle.svg`, the file committed as the exact original, the Webflow site's "Red Freeman Eagle.svg"), 96px wide, centred, with nothing beneath it. Every line break is set by hand within 34 characters, and the type is sized so 34 characters always fit, so the breaks hold on every screen (16px down to 375 wide; 13.6px at 320). The text is WORKING COPY, not approved company language: the file says so, and while `approved` is false the frame says WORKING COPY at bottom left. Closing "a" is the draft's; the alternative ("We don't get to decide what lasts…") is at `?closing=b`. × CLOSE returns to the index, including after a direct arrival.
- **Film**: one centred 16 : 9 frame, at most 80% of the frame's height. Select it (or Space) to play or pause; a small triangle shows while paused. No Freeman film is on file, so the frame says FOOTAGE FORTHCOMING; set `video.src` in `v5/etcetera/entries.js` and it plays.
- The four approved objects open as a single centred image; the Optimist note as text, its words unchanged.

## Files

`v5/etcetera/entries.js` (the collection, in index order), `index/`, `experiences/` (plate, essay, film, snapshot), `texts/`, `snapshot-001/`; routes `v5/etcetera-<slug>.html`; `v5/app.js` (ETCETERA routes and loader; holding flag `false` on this branch); every `v5/*.html` bumps the `app.js` cache version.

## Verified (Index Study 002)

- Fit, scripted: 2560 × 1440 → 320 × 568 (15 sizes, desktop, tablet, phones upright and sideways). No page scroll, every title and the preview inside the frame. One sheet everywhere except 667 × 375 (two sheets: the experiences, then the objects).
- In the browser (Chromium): hover (title forward, others recede, preview), keyboard (Tab through titles shows the preview, Enter opens, Escape returns with the entry focused), touch emulation (no hover state; a tap opens Film; Back returns with Film focused), history (Projects → ETCETERA → Beetlecat → Escape → Back → Forward), sheet paging with ← →, light and dark palettes.
- Experiences, texts and route files: unchanged since round 4 (`git diff archive/etcetera-index-001-round4` touches only the index, `entries.js` order and cache versions).
- Not tested: Safari / iOS, real touch devices.
