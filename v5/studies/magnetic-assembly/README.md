# Signature motion — Magnetic Assembly (study 001)

Three refinements of the **original** Freeman pixel assembly (`/pixel-mark.js`), not of the
handwriting player. The signature's pixels hang loosely around their final positions, drift,
then snap into place. This is research only. It is not linked from the site, is marked `noindex`,
and is never merged to production.

Open `/studies/magnetic-assembly/`. Keys: `1`–`4` choose a variation, `R` or Space replays, `S`
slows to ¼×, `V` cycles the views. The URL keeps the state (`?v=lodestone&view=compare`).

- **Entrance** shows the selected motion in the live entrance composition, using the production `fit()`.
- **Compare** shows all four motions, which start on the same animation frame.
- **Light / Dark** shows the selected motion in both colorways at once.

The colorway squares switch the whole page between Light, Dark and Freeman.

## The three variations

| | Variation | Dispersion | Units | Suspended (to first snap) | Snap | Total |
|---|---|---|---|---|---|---|
| 01 | **Settle** | ±1.8 × ±1.3 px (0.14×) | 2,278 single pixels | 760 ms | Lands in the original's hash order over 220 ms, soft in-out | 1,280 ms |
| 02 | **Lodestone** | ±3.6 × ±2.5 px (0.28×) | 197 shards (~5 px) | 970 ms | Accelerates in, every shard lands on one frame, dead stop | 1,200 ms |
| 03 | **Field** | ±5.9 × ±4.1 px (0.45×) | 117 shards (~7 px) | 1,120 ms | Lands on one frame, then a trace of overtravel (≤0.2 px) | 1,550 ms |
| — | Original | ±13 × ±9 px | 2,278 pixels | — | Staggered cubic ease-out | 1,850 ms |

## What is kept from the original

- **Artwork.** It is read from `pixel-mark.js`'s own finished frame and never restated. The page
  checks every variation's final frame against production cell by cell. The result is shown
  under the readout: 2,278 px, 0 differ.
- **Direction of dispersion.** Each unit's loose position is the original `hash()` offset, scaled
  down. A pixel that started up and to the left in the original starts up and to the left here.
- **Colour, scale and placement.** Colour comes from `--mark` on every draw, so a colorway
  change repaints in place. One bitmap pixel is a whole number of device pixels. The production
  entrance `fit()` is used unchanged.
- **Contract.** `mount(canvas, opts)` returns `{ replay, paint, destroy }` like
  `FreemanPixelMark`. `play:false` draws the finished frame. Reduced motion draws the finished
  frame immediately.

## Engine notes

- The engine draws at **device resolution**, with a 14-cell margin around the 160 × 61 box.
  Suspended units sit between bitmap cells and drift by fractions of a cell, which keeps the
  hover still and quiet. The finished frame is drawn on whole cells only.
- The **hover** is two slow sines per axis per unit (about 0.4–1.4 Hz), with phases taken from the
  hash. Over the hover the offsets gather in by 15–28%, so the pull is felt before the snap.
- **Magnetic snap.** The curve is a pure ease-in (u³ for Lodestone): the unit accelerates all
  the way in and only its target stops it. In Lodestone and Field, each unit's travel time
  scales with √distance, so far shards leave earlier and **all of them arrive on the same frame**.
- **Shards.** Shards are cells of a jittered grid (nearest seed). They break a stroke at
  irregular angles rather than in squares, so they never read as a mosaic or a scanline glitch.
- **Cost.** A frame draws in about 0.2 ms (Lodestone) to 0.4 ms (Settle) on a desktop.
  That leaves room for iPhone Safari at 60 fps. There are no per-frame allocations beyond the
  drift pair.

## Recommendation: 02 Lodestone

1. **It hovers as a signature, not a cloud.** Settle hangs as grain, which reads as a dust or
   particle effect, the thing to avoid. Shards keep short runs of each stroke intact, so the
   suspended state is the signature itself, just loosened. It is almost recognizable by
   construction, not by blur.
2. **The snap is one event.** About 200 pieces arrive on a single frame. The seams close at the
   same instant, and the mark goes from "almost" to exact with nothing in between. That one
   frame is what makes the snap feel magnetic and satisfying. A stagger turns it into a
   process.
3. **Mechanical precision, no spring.** The pieces accelerate into position and stop dead, with
   no bounce. Field's overtravel opens hairline seams at the moment of arrival, which softens
   the click it is meant to sharpen.
4. **Restraint.** At 0.28× the original offsets, no shard moves more than about one stroke-width
   from home. The whole sequence is 1.2 s, about two-thirds of the original. The pieces fade in
   already loose and drift for about a third of a second once all are visible: long enough to
   register, short enough to stay an entrance.
5. **It is still the original.** It uses the same bitmap, the same hash and directions, and the
   same final frame, pixel for pixel. Only the dispersion, the time spent apart and the arrival
   change.

For a builder, assembling the mark out of pieces that drop exactly into place is the right
metaphor. It is assembly, not a reveal.
