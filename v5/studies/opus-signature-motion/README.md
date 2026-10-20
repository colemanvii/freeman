# Signature motion — the hand (Opus study 001)

Three interpretations of the Freeman signature being written by hand, in real time, from the
original 160 × 61 pixel script. Research only: not linked from the site, `noindex`, and never
merged to production.

Archived as tag `archive/signature-motion-opus-001` on branch `study/opus-signature-motion`.

## The three hands

| | Hand | Desktop | Mobile | Writing order |
|---|---|---|---|---|
| 01 | **Practiced** (selected, refined) | 2,164 ms | 1,881 ms | F cap → stem → crossbar → *reeman* → flourish |
| 02 | **Considered** | 2,706 ms | 2,166 ms | F cap → stem → *reeman* → crossbar → flourish |
| 03 | **One Breath** | 1,526 ms | 1,222 ms | F cap hooked into stem → crossbar → *reeman* → flourish |

- **Practiced** — a signature written thousands of times. Settles into the F, gathers speed
  through the name and runs straight into the underline as one throw, leaving the paper while
  still moving.
- **Considered** — signed with care. The pen rests briefly at each touchdown, crosses the F
  only after the name is finished, holds, then sweeps a separate, controlled underline.
- **One Breath** — fast and connected. The cap swash hooks back down into the stem with no
  lift, the crossbar is a dash, the name comes in quick beats, and the underline is a hard whip.

The production entrance animation (pixels converging over 1,850 ms) is included as a reference.

## Refinement 002 — Practiced (selected direction)

Practiced was chosen. One focused pass on timing, movement, transitions and the final hold; the
writing order, strokes, nib model, palette, placement and final frame are unchanged, and the
other two hands are untouched.

| | Before | After |
|---|---|---|
| Blank paper before touchdown | 180 ms (140 mobile) | 300 ms (258 mobile) |
| Mobile compression | ×0.78 | ×0.86 |
| Flourish profile | symmetric bell, peak 0.93 px/ms at 52%, releases at 0.32 | ballistic, peak 1.13 px/ms at 36%, releases at 0.49 |
| Flourish vs. fastest name stroke | slower (0.93 vs 0.97) | fastest stroke of the piece (1.13 vs 0.94) |
| Pen leaves the paper | 1,974 ms (1,538 mobile) | 2,014 ms (1,731 mobile) |
| Final hold | tip pixels fade in ≤ 12 ms; motion stops dead | last 26 px of the taper settle over up to 150 ms |
| Clock step per frame | up to 100 ms (a slow frame could skip the F cap) | ≤ 34 ms; clock starts after blank paper is painted |

- **Opening beat.** The page now paints blank paper, starts the clock on the next frame and
  holds 300 ms, so the first touchdown is seen rather than lost to page load.
- **Phones.** Mobile timing was 22% faster than desktop, moving the nib up to ~20 bitmap px per
  60 Hz frame. At ×0.86 the motion steps less, while the piece stays under two seconds.
- **The throw.** The underline launches hard out of the *n*, peaks early and is still moving when
  it leaves the paper, as the study describes. Before, it braked into the release.
- **The hold.** The hairline tip of the underline lands a beat behind the lifted pen (`settle`),
  so the finished signature arrives and rests instead of stopping on the last frame.
- **Playback.** A slow frame slows the clock rather than skipping ink. A Replay mid-play no
  longer leaves a second render loop drawing every frame.

A one-frame minimum ink fade was tried and rejected: at throw speed it left a ~20 px soft trail
behind the nib, which contradicts the study's crisp point of contact.

## What makes it read as a hand

The goal is the physical illusion of a pen moving, not pixels appearing in order.

- **A point of contact.** A pixel appears when a moving nib first covers it. The nib radius is
  the local half-width of the stroke, so the leading edge is round and wet. Each pixel settles
  within about one pixel of pen travel at any speed, so there is no smear behind the nib.
- **Rhythm, not constant speed.** Each line is cut at its vertical turning points (hump tops,
  leg bottoms, loop apexes, cusps). Every piece is one minimum-jerk motion: slow out of a turn,
  fastest mid-stroke, slow into the next. Durations follow isochrony (long strokes go faster
  rather than proportionally longer). The result is the 4–6 Hz pulse of real handwriting,
  visible in the instrument's speed meter.
- **Pen lifts and retraces.** Lifts are real air time with no ink. In the m, n, e and a the pen
  runs quickly back up strokes it has already drawn, which costs time and adds no ink.
- **The final gesture.** The underline is one ballistic throw out of the n's closing loop with
  a skewed velocity profile, so the taper is the pen lifting off in motion.
- **Crossing isolation.** Every pixel belongs to exactly one stroke: the nearest ink line, with
  near-ties going to the stroke written first. A stroke passing over another never discloses it
  early (F crossbar and stem; the cap and the stem's junction).

## Technical approach

`hand.js` (no dependencies, runs in the browser and in Node):

1. **Artwork.** In the page, the bitmap is read from production: `FreemanPixelMark.mount(canvas,
   { play: false })` draws the finished frame, and every opaque pixel is taken from it. No
   coordinate is copied or redrawn.
2. **Centrelines.** Zhang–Suen thinning of the bitmap. Each stroke (`STROKES`) is a list of
   waypoints routed along that skeleton by shortest path, plus a few free points where a stroke
   must hold its own line across a junction. Retraced skeleton segments are marked as no-ink.
3. **Smoothing.** The pixel staircase is smoothed and resampled every 0.5 px.
4. **Timing.** Segmentation at vertical turning points, minimum-jerk profiles with a per-hand
   `flow` (speed kept through turns), isochrony exponent `iso`, retrace speed, per-stroke
   `tempo`, touchdown dwell, and a skewed `throw` profile for the flourish. The pen time is
   scaled so each hand ends at its stated length; lifts and touches are fixed milliseconds.
5. **Ownership and contact.** Nearest-ink-line ownership, then a search back along the owning
   stroke for the first moment the nib covers the pixel.

`build(pixels, hand, { mobile })` returns `alphaAt(ms)` (opacity of every pixel), `penAt(ms)`
(nib position, or in the air), the stroke and lift timeline, and a speed trace. Every pixel
reaches opacity 1 at `total`, so the last frame is the production frame.

`instrument.js` runs one clock for everything. The production animation is driven from that
clock by giving the unmodified `pixel-mark.js` this page's animation frames, so Slow and
scrubbing apply to it too. Placement is production `app.js` `fit()` unchanged; the page uses
production `styles.css` for palette, Monaco and the entrance composition.

## Controls

| Control | Key | |
|---|---|---|
| 01 / 02 / 03 / Production | `1` `2` `3` `0` | choose a hand or the production reference; plays once |
| Replay | `r` or space | play again from the start (never loops) |
| Slow ¼× | `s` | quarter speed |
| Pen | | shows the moving point of contact (red) and its air path during lifts |
| Desktop / Mobile | | switch timing profile (defaults to the device, ≤ 760 px = mobile) |
| Speed meter | drag | hold any moment; the line is pen speed, dots are lifts, ticks are stroke starts |
| Light / Dark squares | | chalk or umber palette |

Under the meter, the page confirms after each run that the final frame equals the production
frame pixel for pixel. URL options: `?hand=practiced|considered|breath|production`,
`?palette=umber`, `?motion=reduce`. With reduced motion (system setting or `?motion=reduce`)
the finished signature is shown without animation, as on the live site.

## Preview

The page loads `/pixel-mark.js`, `/styles.css` and `/favicon.svg` from the site root, so serve
`v5/` as the root:

```bash
python3 -m http.server 8810 --bind 127.0.0.1 --directory v5
```

Then open <http://127.0.0.1:8810/studies/opus-signature-motion/>. Pushed branches also get a
Cloudflare Pages preview (Freeman staff sign-in):
`https://study-opus-signature-motion.freeman-d6f.pages.dev/studies/opus-signature-motion/`.

Offline check (all hands, desktop and mobile, every pixel owned, blank at the pause, complete
at the end):

```bash
node v5/studies/opus-signature-motion/verify.js
```

## Dependency on the production signature

- `v5/pixel-mark.js` is the original Freeman script (2,278 pixels, 160 × 61) and the source of
  truth. This study reads it and never modifies it. At the time of this study it was byte-for-
  byte identical to the file served at freemangc.com (branch base
  `release/approved-v5-2026-10-18`, commit `5af0084`).
- Stroke waypoints in `hand.js` are tied to that bitmap's skeleton. If the artwork ever
  changes, `verify.js` reports waypoints that no longer sit on the skeleton.
- `v5/styles.css` supplies `--mark`, `--paper`, `--ink`, `--orange`, Monaco and the
  `.v4-home` entrance classes.

## Files

| File | |
|---|---|
| `index.html` | the instrument page |
| `hand.js` | stroke definitions, the three hands, and the motion engine |
| `instrument.js` | clock, rendering, production reference, controls, final-frame check |
| `instrument.css` | instrument additions on top of production `styles.css` |
| `verify.js` | offline verification in Node |
| `bake.js` | bakes the refined Practiced hand into `practiced.timeline.js` |
| `practiced.timeline.js` | production timing table (per-pixel ink time and settle) |
| `hand-mark.js` | production player, drop-in for `FreemanPixelMark.mount` |
| `HANDOFF.md` | integration handoff for the production entrance |
