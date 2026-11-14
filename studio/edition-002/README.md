# Freeman / Edition 002

The second edition of the creative treatment for Gabe, 14 November 2026. It keeps Edition 001's three ideas
and structure, marks each with the call saved on that page, and adds three connected proposals:

| | Chapter | Status |
|---|---|---|
| 01 | The Globe | From Edition 001. Call saved: explore |
| 02 | On a Mission | From Edition 001. Call saved: refine |
| 03 | Freeman × Represent | From Edition 001. Call saved: parked |
| 04 | The Building Record | New. Drawings, photographs and the story of each building |
| 05 | Built for Generations | New. The series, refined: a recurring documentary |
| 06 | The House | New. Freeman as a publisher: one catalogue |
| 07 | Your Call | Three decisions and a ninety-day plan |

## Files

- `src.html`: the source. `index.html`: the built page. `tools/build.py`: the build.
- `img/`: resized copies of Freeman photographs. Nothing is stock and nothing is generated.

Rebuild from the repo root (needs the two branches named in the script fetched):

    python3 studio/edition-002/tools/build.py

To view locally: `cd studio/edition-002 && python3 -m http.server 8765`, then open `http://127.0.0.1:8765/`.

## What the build lifts, so nothing is redrawn

- From `studio/edition-001/index.html`: the styles, the globe plate, the homepage comparison, the storyboard,
  the jacket studies and the code that draws them.
- From `release/approved-v5-2026-10-18`: the Stamp eagle (`v5/eagle/stamp.pbm`, 192 × 60).
- From `claude/freeman-case-study-system-273x7a` (Built Record Study 001): the record drawings traced from
  Freeman's photographs of Muchacho Decatur, and the project records and credits behind the register.

## Photographs

| Files | Source | Credit |
|---|---|---|
| `beetlecat-*`, `optimist-*`, `barnsley-*` | Freeman's published portfolio | Jared Swafford |
| `muchacho-01` to `-06`, `woodlands-dining` | Freeman Photographs folder, via the V5 project assets | Photographer to be credited |
| `field-*` | Freeman Photographs folder (Photographs 002 study; Edition 001) | Photographer to be credited |
| `ruskin` | Freeman archive (`v5/etcetera/ruskin.webp`) | John Ruskin, 1849 |

## What is real and what is not

- Real: every photograph; the script and eagle bitmaps; the fifteen projects, their numbers and credits.
- Traced, not surveyed: the record drawings. No architect's drawing of any Freeman project is on file.
- Proposed: the series, the catalogue numbering, the print edition, every collaboration. Tristan has not been
  asked. Represent has not been contacted. No partner has been approached. Nothing is priced.
- The account of Muchacho Decatur was written for the study on 13 November and is not yet approved.

## Checked

14 November 2026, Chromium: 1440 × 900, iPhone 13 (390) and iPhone SE (320). No sideways scroll, no script
errors, every control at least 40 px tall on a phone. Record sheet (seam, keys, three states, drawn motion),
animatic (play, scrub, both end cards), catalogue filter, print proof and the three decisions exercised.
WebKit and Firefox have not been run.

Nothing in `v5/` or on the live site was changed. `main` deploys the legacy GitHub Pages site; this branch
does not deploy anywhere.
