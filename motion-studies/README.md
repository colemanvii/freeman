# Freeman — three motion studies

Standalone full-viewport comparison. Select 01 / 02 / 03 to replay a study in the same position. Replay, quarter-speed slow motion and light/dark settings are available for every study; speed and mode are retained independently per study. No framework, GSAP, external fonts, network dependencies or build step.

## Verified production source

Fetched from https://www.freemangc.com/ on 2026-10-19:

- `/pixel-mark.js`: original 160×61 script bitmap (`const pts`), plus 1850 ms scattered-pixel assembly. Original file preserved byte-for-byte here. SHA-256: `069f61eb69a8b6ae4d9b81ca199b3229bc52d8459f837f8b7a1ce560c33b1c5a`.
- `/app.js`, `entrance()` / `fit()`: integer device-pixel scaling, centered composition, mobile center at 48% height and desktop center at 50%; click to replay.
- `/styles.css`: `--mark` = `#332e20` on light and `#fff9f1` on dark. Original signature/nav clear space is max(12 bitmap pixels, 18 CSS pixels).
- Matching asset is also present in Git ref `origin/fix/mobile-touch-targets`, `v5/pixel-mark.js` (identical SHA-256).

Only this new `motion-studies/` directory is changed. Homepage, main, production routes and deployment configuration are untouched.

## Rendering and motion

The JSON in index.html is an exact copy of `pts`. Each original pixel becomes an axis-aligned 1×1 square in a native SVG path. No trace or approximated vector signature is displayed. The original renderer remains available for pixel-by-pixel reference testing.

01 Drawing uses invisible hand-sequence timing guides and a pixel ownership mask over the exact artwork. The F crossbar and terminal underline have separate ownership, preventing a broad brush from exposing adjacent crossing strokes. Main progress is linear and weighted by guide length; the terminal alone uses cubic-bezier(.22,.61,.36,1). No extra pen-lift delay. Desktop: pause 0–180, inscription 180–1720, terminal 1720–1980 ms. Mobile: 0–120, 120–1320, 1320–1540 ms.

02 Impression changes only opacity using one continuous cubic-bezier(.16,1,.3,1), desktop 160–1120 ms and mobile 100–820 ms. At the specified midpoint (640 / 460 ms), the curve gives **97.18%**, rather than 82%. As approved, the continuous easing is preserved; there is no second ease or artificial intermediate keyframe.

03 Construction uses adjoining invisible SVG mask rectangles at x=0, 48, 104 (30% / 65% of 160). Desktop intervals: 180–660, 540–1060, 940–1500 ms. Mobile: 120–480, 390–790, 700–1120 ms. Each uses cubic-bezier(.4,0,.2,1). Only mask widths change. At completion, the mask is removed entirely. No seams, moving artwork, visible region divisions, lines or frames.

All three end with the same original pixel geometry, opacity 1 and no mask. Production scaling, colors and signature position are retained. The comparison selector replaces the homepage navigation; signature y positioning is calculated using the original navigation height, so the larger phone comparison labels cannot shift the artwork.

Reduced motion shows the full signature immediately, including if the preference changes while playing. Returning from back/forward cache or hiding the tab finishes the mark. Resize recomputes device-pixel alignment. Theme changes do not restart playback. Speed is 4× longer without changing easing. Native controls have keyboard focus and touch targets; the selected study and toggles expose pressed state.

## Verification

Run `python3 -m http.server 8791 --directory motion-studies`, then with Python Playwright installed: `python motion-studies/qa/verify.py http://127.0.0.1:8791/`.

Chromium and WebKit are checked at 1440×900 DPR1 and 390×844 DPR3. All three final SVG frames are rasterized at native resolution and compared RGBA byte-for-byte to the original `FreemanPixelMark.mount(...,{play:false})` renderer, in both colors. Checks also cover stationary placement, construction boundaries, pause, controls, reduced motion, horizontal overflow and JS errors. Results and screenshots are in `qa/`. WebKit mobile emulation is not a physical iPhone test.

For deterministic inspection append `?inspect`; `studyInspector.select(0..2)` and `studyInspector.seek(ms)` expose rendered frames. This hook is absent from normal page loads.

## Working preview

- Stable: https://study-signature-motion.freeman-maintenance-preview.pages.dev/
- Immutable deployment: https://31d4960e.freeman-maintenance-preview.pages.dev/
- Runtime source commit: `40d59bc` on `study/signature-motion`.

The complete browser suite also passed against the immutable public deployment. The first deployment on the Freeman project is behind its existing Cloudflare Access policy; the separate preview project above provides direct access. No Access policy was changed. A post-deployment fetch confirmed the production homepage HTML SHA-256 was unchanged (`bdd06403bc4dcdc174b2dc483c76a862d9df73c0c87a42a5e21fedd047e19009`).
