# Freeman — Motion 001

Three 8-second loops at 1080 × 1080 for X. Each one has a single idea. They use the real artwork, read live from production and never redrawn:

- **Signature**: `v5/pixel-mark.js`. It is 160 × 61 and 2,278 pixels, read back from its finished frame.
- **Eagle**: `v5/eagle/stamp.pbm`. This is the approved Stamp, 192 × 60 and derived from `v5/intro-eagle.svg`.
- **Palette**: ivory `#fff9f1`, ink `#332e20`, orange `#f93822`. Type is set in Monaco.

This folder sits outside `v5/`, so nothing here is deployed.

## The three ideas

### 01 Sundial

**A drawing becomes a building the moment it casts a shadow.**

The signature stands four units above the ground. Over one polar day the sun circles it without setting, so the loop is a real orbit and not a rewind. The shadow is drawn as a 1-bit checker fixed to the ground. It turns and stretches: short at noon in the south, longest under the low midnight sun in the north. The frame acts as the dial. The hour ticks sit where each 15° bearing meets a square plate, which is why they space out toward the corners as they do on a real square sundial. The orange square is the sun.

The palette has a logic: orange is light, ink is shadow and ivory is ground.

### 02 Material

**Nothing added, nothing taken away.**

The signature has exactly 2,278 pixels, and 2,278 = 67 × 34, so the signature is a block. The loop starts with that block. Each pixel then moves along one axis only:

1. **Courses.** Each row slides sideways, and nothing moves up or down. Every row hands out exactly 67 pixels. The result is a woven band, with each column holding as many pixels as that column of the signature.
2. **Plumb.** Each column slides up or down, and nothing moves sideways. The sweep runs left to right, the direction the hand writes.

Then the loop returns to the block. The only copy is the number that never changes: **2,278**.

**Round 2 (2026-11-08)** made four changes. Round 1 is kept as `study.html?s=02r1` and `out/…-02-material-round1.mp4`.

- **The midpoint is a tone, not noise.** Each column of the woven band is shaded with an 8 × 8 ordered (Bayer) dither, the 1-bit shading early Macs used. Each column is exactly as dark as that column of the signature is heavy: darkest at the F, lightest at the tapered ends. The rows are then balanced to exactly 67 each with the smallest possible changes. Round 1's round-robin deal read as a barcode.
- **Every frame is a true bitmap.** Pixels move in whole grid units. Because each row, then each column, moves as one, no two pixels ever share a cell. A check of all 480 frames counts exactly 2,278 distinct pixels in every one, so the caption is literally true in every frame.
- **One orange pixel.** The block's first cell in reading order (top left) becomes the signature's first pixel in writing order, where the pen starts on the F. You can follow it through the whole loop. This colours one pixel of the mark during the hold. It's a deliberate annotation, kept by Cole's decision on 2026-11-08.
- **Forward, not rewind.** The way back runs in the same directions as the way out: columns fall left to right, then rows gather top first.

### 03 Plumb

**Level and plumb are the first two lines of any building, and the weathervane is the last thing set on it.**

The Stamp eagle is a flat vane on a rod. It pivots on its measured centre of mass at x = 95.3. Facing you, it is level. Turned into the wind, it becomes a single plumb line in line with the rod, and the whole vane becomes Freeman's crosshair: two lines with an orange square where they cross. The eagle makes four quarter-turns per loop: eagle, line, mirrored eagle, line. Each turn is a damped swing with a small flutter at rest. Turned away, the eagle is drawn as a flat plate would look. Its cuts close up as the plate turns and reopen mirrored on the far side.

## Challenging the concepts

- **Sundial** can read as a drop-shadow text effect for its first second. It is rescued by the dial and the moving sun, which make it an instrument rather than a style. It has the least wit of the three and is the most beautiful to leave running.
- **Material** works most like Visualize Value: a true fact, one transformation, and a punchline you can check. The risk is the woven midpoint, which could look like a barcode or a glitch. It is on screen for about 0.4 s, and the moments either side of it, the flared block and the signature writing itself left to right, carry the motion. It depends on the caption, so remove the caption and test whether the idea still lands.
- **Plumb** is the cleverest idea and the riskiest image. A turning emblem is close to the spinning corporate logo. The defences are the physics, the long holds on the line, and the crosshair punchline, which only Freeman's own system can deliver. If it reads as a logo spin to anyone, cut it.

**Recommendation: 02 Material to post first.** It is the one most likely to make someone stop, count and share.

## Files

- `index.html`: all three playing live, side by side.
- `study.html?s=01|02|03`: one study at full size. Space pauses, ← → steps one frame (60 fps), and L jumps to the loop seam.
- `sheet.html?s=02&n=24&cols=8`: a contact sheet, with `&from=&to=` to zoom into one stretch of the loop.
- `motion.js`: the three studies as pure functions of loop phase. The player and the renderer share them.
- `out/*.mp4`: H.264 High, 1080 × 1080, 60 fps, 8.00 s, with a silent AAC track.
- `tools/render.cjs` renders every frame from `draw()`, and `tools/encode.swift` (AVFoundation, since this Mac has no ffmpeg) encodes the MP4s.

To re-render, serve the worktree root on port 8840, then run:

```
PLAYWRIGHT=~/Sites/emberwing/node_modules/playwright node tools/render.cjs 02 /tmp/frames/02
swiftc -O encode.swift -o encode && ./encode /tmp/frames/02 silence.wav out/02.mp4 12000000
```

**Round 3 (2026-11-08)** is now the default. Round 2 is kept as `study.html?s=02r2`.

- **A breath on the band.** On the way out, the woven band holds still from 2.50 to 2.85 s, so the loop now has three beats: block, tone, name. On the way back it holds for 0.2 s.
- **Cleaner dither.** Rows are balanced by shortest paths across all 34 rows instead of greedy swaps, which keeps the band as close to pure Bayer as the 67-per-row rule allows. The clumps at the low-density edges are now even diagonal hatching. The cross shapes in the near-50% field are genuine ordered dither, not leftovers from balancing.
- The conservation check passes again: 2,278 distinct pixels in all 480 frames, with an identical seam.
- Output: `out/freeman-material-no1-signature.mp4`. Earlier MP4s were moved to the Desktop.

### Material No. 2: Eagle (2026-11-08)

`study.html?s=04` · `out/freeman-material-no2-eagle.mp4`

This is the same rule, code and timing applied to the Stamp eagle. The rule is now general: any 1-bit mark whose pixel count factors into a block at least as tall as its heaviest column.

- The Stamp has 4,472 pixels. Its heaviest column, through the body, holds 58, so the block must be at least 58 rows tall. That gives **52 × 86, a pillar**, where the signature is a brick.
- The woven band shows the eagle's weight as tone: a dark spine where the body is, and fine diagonal hatching across the wings.
- The orange pixel follows the same rule as the signature. The block's top-left cell becomes the mark's leftmost, topmost pixel: the pen's start on the signature, the left wingtip on the eagle.
- It is drawn at 5 px per pixel because the eagle is 192 wide, so it keeps the same 60 px side margins as the signature at 6 px.
- Checks: 4,472 distinct pixels in all 480 frames, identical seam. After the refactor, the signature loops are bit-for-bit identical to round 3 (frame fingerprints match).
- The eagle and the round-1 and round-2 variants are built only when opened, so pages still load in about 0.3 s.

## Approved versions (2026-11-08)

These two pieces are preserved exactly as approved: no sound, no extra copy, no colourways. Each is tagged so it can be recovered even if the study changes later.

| Piece | Source | Pixels | Block | Frame fingerprint | Final MP4 | Tag |
| --- | --- | --- | --- | --- | --- | --- |
| Material No. 1 | Signature, `v5/pixel-mark.js` | 2,278 | 67 × 34 brick | `-126761301` | `out/freeman-material-no1-signature.mp4` | `archive/material-no1-approved` |
| Material No. 2 | Stamp eagle, `v5/eagle/stamp.pbm` | 4,472 | 52 × 86 pillar | `1734470243` | `out/freeman-material-no2-eagle.mp4` | `archive/material-no2-approved` |

To confirm a later change hasn't moved a single pixel, serve the worktree root on port 8840 and run `tools/verify.cjs`. It checks all 480 frames for full pixel counts, no overlaps, an identical seam, and the fingerprints above.

The production artwork is read, never copied or changed. At this commit, `v5/` is identical to `origin/release/approved-v5-2026-10-18`.
