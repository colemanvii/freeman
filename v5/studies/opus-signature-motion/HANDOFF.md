# Handoff — refined 01 Practiced signature → production entrance

For Codex. The selected direction is **01 Practiced** from the hand study, after **refinement 002**.
This is integration only: the motion is final. Do not retune it or redraw the artwork.
Do not merge or deploy until a human approves.

## Exact source

| | |
|---|---|
| Branch | `claude/animation-direction-refinement-ol5qft` |
| Motion (refinement 002) | `2878454484352e9881123cfdc7867133a79daa80` |
| Production assets (player + baked timeline) | `218f4d83b345e78f5b8d99e52b31cfe5cc38f449` ← **integrate from this commit** |
| Study base | `5af00842a68f545b4d6f88da762bf8d0dd0ff4b3` (on `release/approved-v5-2026-10-18`) |
| Verified against production at | `release/approved-v5-2026-10-18` @ `3dc2b3357e1517d1d81ea90b96e5217301fd9fd6` |
| Study folder | `v5/studies/opus-signature-motion/` |

At `218f4d8`, the files' SHA-256 hashes are:

| File | Role | SHA-256 |
|---|---|---|
| `v5/studies/opus-signature-motion/hand-mark.js` | **ship**: the player | `55b8a622e641fb8e32eb13fbc46b933d1da13fb8e1c68762eb057004a1c840a8` |
| `v5/studies/opus-signature-motion/practiced.timeline.js` | **ship**: baked timing, 39.5 KB (9.5 KB gzip) | `4a00f4a07947fa5cd0558e76fa55d7415f14e2b6755a06588f2a97a69ca1d027` |
| `v5/studies/opus-signature-motion/hand.js` | engine, source of the timeline; **do not ship** | `94be8fedd1248f32e81abb397582285b8742b5b2a7b7386546e4c386bb75f114` |
| `v5/studies/opus-signature-motion/bake.js` | regenerates the timeline from `hand.js` | |
| `v5/studies/opus-signature-motion/verify.js` | offline check (Node) | |
| `v5/studies/opus-signature-motion/integration-check.js` | browser check against production (Playwright) | |
| `v5/pixel-mark.js` | production artwork; **unchanged, still the source of truth** | `069f61eb69a8b6ae4d9b81ca199b3229bc52d8459f837f8b7a1ce560c33b1c5a` |

`hand.js` needs 0.2–0.4 s of main-thread work per build on desktop, and longer on a phone.
Production therefore ships only the baked result.

## Minimal integration (3 edits on a branch from the release branch)

1. **Copy two files** into the site root: `v5/hand-mark.js` and `v5/practiced.timeline.js`.
   Copy them from the commit above byte-for-byte.
2. **`v5/index.html`**: load both files after `pixel-mark.js` and before `app.js`. Keep them
   `defer` so the order is preserved:
   ```html
   <script defer src="/pixel-mark.js?v=20261018-v5-restore"></script><script defer src="/practiced.timeline.js?v=20261020-hand-002"></script><script defer src="/hand-mark.js?v=20261020-hand-002"></script><script defer src="/app.js?v=…">
   ```
3. **`v5/app.js`**, in `entrance()`, replace the one mount line:
   ```js
   // before
   const mark = window.FreemanPixelMark ? window.FreemanPixelMark.mount(canvas, { play }) : null;
   // after
   const signature = window.FreemanHandMark || window.FreemanPixelMark;
   const mark = signature ? signature.mount(canvas, { play }) : null;
   ```
   Then bump the `app.js?v=` query on every page that loads it (20 HTML files in `v5/`), as the
   repo does for every `app.js` change.

Nothing else changes: not `pixel-mark.js`, `styles.css`, `fit()`, the markup, or the routes.
`FreemanHandMark.mount` returns the same `{ replay, paint, destroy }` handle. Click-to-replay,
colorway `paint()` and `destroy()` on route change therefore work unchanged.

## How production behaviour is preserved

- **Dimensions:** the canvas stays 160 × 61. The CSS size still comes from `--px`, set by
  the production `fit()` (a whole number of device pixels). The player never touches layout.
- **Position:** the `fit()` centring is untouched (phone 48% height, desktop 50%), as is the
  `.v4-home-identity` group with the nav.
- **Colours:** every draw reads `--mark` through production's own `ink()` logic, including the
  sand fallback. Chalk, sand and umber are verified. A colorway change repaints without
  restarting.
- **Final frame:** the player never stores coordinates. It reads the artwork from
  `FreemanPixelMark.mount(offscreen, { play: false })` and scans the finished frame row by row.
  Every pixel ends at full opacity, so the final frame is RGBA-identical to production.
  - If the pixel count no longer matches the timeline, the player returns the production
    animation instead. This covers artwork that changed without a re-bake.
  - It also falls back to production if `practiced.timeline.js` failed to load.
- **Reduced motion:** like production, `prefers-reduced-motion: reduce` is checked on each
  `replay()`, and the finished frame is drawn at once.
- **Back/forward:** `mount(canvas, { play: false })`, which production passes on history arrival,
  draws the finished frame with no animation.
- **Timing:** phone (≤ 760 px, production's `PHONE` query) 1,881 ms; desktop 2,164 ms.
  - The profile is chosen at each `replay()`.
  - The clock starts on the frame after blank paper is painted.
  - A slow frame advances at most 34 ms, so a stroke is never skipped.

## Verify before handing back

```bash
node v5/studies/opus-signature-motion/verify.js        # engine + timeline freshness, all "ok"
python3 -m http.server 8820 --directory <production v5>  &
python3 -m http.server 8821 --directory <candidate v5>   &
node v5/studies/opus-signature-motion/integration-check.js http://127.0.0.1:8820/ http://127.0.0.1:8821/
```

`integration-check.js` passed 34/34 against `3dc2b33` with exactly the edits above. Its checks:

- size, position and `--px` identical to production;
- final frame identical to production in all three colorways;
- the hand plays from blank and ink only grows;
- click replay and colorway repaint work;
- back navigation shows the finished frame;
- reduced motion shows the finished frame;
- no console errors.

Viewports: phone 390 × 844 @3× and desktop 1440 × 900 @1×. Chromium only. Check on a
physical iPhone (Safari) before approval.

## If something changes

- **`pixel-mark.js` artwork changes:** run `node bake.js`, then `node verify.js`. `verify.js`
  reports a stale timeline, and the player falls back to production until it is re-baked.
- **Motion changes:** edit `HANDS.practiced` in `hand.js`, then re-bake. Never hand-edit the
  timeline.
- **Do not** load `hand.js` on the live site, alter `pixel-mark.js`, or alter the entrance
  layout.
