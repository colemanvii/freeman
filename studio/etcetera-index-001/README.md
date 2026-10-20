# ETCETERA — study 001, round 3: a composed index

Isolated study on `study/etcetera-index-001` (cut from production `release/approved-v5-2026-10-18` at 44cb8cc). Not merged, not deployed. Round 1 (three index studies, a review sheet, footer switches, labels) was judged clunky and over-explained and is replaced; it remains in this branch's history at 2dc33fd.

Preview: `/etcetera` on the branch preview, or http://localhost:8816/etcetera.html (`etcetera-index-001` in `.claude/launch.json`).

## The index (round 3: composed by hand)

Round 2's single horizon read as unrelated items on a shelf, spaced by an algorithm. Round 3 places each of the seven entries individually on the site's grid (`v5/etcetera/index/index.js`, where every placement is written out):

- **Landscape** (desktop, laptop, tablet sideways, phone sideways), twelve columns. Beetlecat, the one colour photograph, stands at the full height of the frame in columns 5–9: the dominant. *Built for generations.* is set large in 10–12 on Beetlecat's top line: the second voice. Ruskin and the architectural drawing are a small pair at top left on the same top line. The residential perspective rests on the baseline beneath them. The Optimist note, as small type, takes the residential drawing's top line across the way. The film is a small frame on the baseline at right. One top line and one baseline hold the composition; the left and right columns answer each other across Beetlecat.
- **Portrait** (phones, tablet upright), six columns, composed separately. The words first, large; Beetlecat with the two printed sheets beside it, aligned to its top and its foot; the residential drawing, the note and the film as a quiet group at the bottom. It scales as a whole to fit the screen.
- Text entries are set as typography with their line breaks chosen; only the leading words end in Freeman orange. No labels, numbers, borders or copy. Pointing at an entry, or focusing it, steps the rest back and shows its title beneath it.
- A new entry needs a place written into both compositions.

## The experiences, with only the navigation they need

The production shell everywhere: section line (ETCETERA current, returns to the index with the entry focused) and × CLOSE / Escape (real history; a direct arrival closes to the index). No footer.

- **Beetlecat**: the approved snapshot (`snapshot-001/`, unchanged from study/project-monograph-001 at 35264b1), composition A. Static, one viewport.
- **Built for generations**: the title alone, centred, in the first screen; then one centred 50ch column that scrolls inside the frame. No kicker, numerals or end links. Working copy, said once in the closing line. The Ruskin quotation (1849, public domain) is the only quotation.
- **Film**: one centred 16 : 9 frame, at most 80% of the frame's height. Select it (or Space) to play or pause; a small triangle shows while paused. No Freeman film is on file, so the frame says FOOTAGE FORTHCOMING; set `video.src` in `v5/etcetera/entries.js` and it plays.
- The four approved objects open as a single centred image; the Optimist note as text, its words unchanged.

## Files

`v5/etcetera/entries.js` (the collection, in index order), `index/`, `experiences/` (plate, essay, film, snapshot), `texts/`, `snapshot-001/`; routes `v5/etcetera-<slug>.html`; `v5/app.js` (ETCETERA routes and loader; holding flag `false` on this branch); every `v5/*.html` bumps the `app.js` cache version.

## Verified

Scripted fit test of the index at 2560 × 1440, 1920 × 1080, 1440 × 900, 1366 × 768, 1280 × 720, 1024 × 768, 1024 × 600, 844 × 390, 667 × 375 (landscape) and 768 × 1024, 430 × 932, 390 × 844, 375 × 667, 360 × 640 (portrait): no page scroll, every entry inside the frame, no two entries within 8px of each other. Viewed at 1920, 1440, 1280, the tablet, a phone, the smallest phone and a phone sideways; hover checked. Experiences unchanged since round 2. Not verified: real touch devices, Safari, video playback (no asset).
