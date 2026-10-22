# Signature motion refinement — study, 22 October 2026

Issue: colemanvii/freeman#65 · Branch: `study/signature-motion-refinement-20261022`, cut from `release/approved-v5-2026-10-18` at `0727859`.
Preview page: `/studies/signature-motion-refinement/` — the real entrance, real `app.js`, with a study selector top-left.

**Recommendation: 03 The Flourish, at the measured tempo (≈ 325 ms). If there is any doubt, 00 Already There.**
Both beat production and every earlier study. 01 is well made but is still a signature being performed for you. 02 is rejected.

## Sources verified (nothing assumed)

- Production deploy: `https://freemangc.com/` `index.html`, `app.js`, `pixel-mark.js`, `hand-mark.js`, `practiced.timeline.js`, `styles.css` were fetched on 22 Oct and are **byte-identical** to `0727859` on the release branch. No discrepancy.
- `entrance()` calls `window.FreemanPixelMark.mount(canvas, { play })`. `hand-mark.js` and `practiced.timeline.js` are downloaded on every visit (≈ 44 KB) and **never run**. The study page leaves them out; production should too, whatever is chosen.
- `play` is `!pop && !nav`: the script animates on load and reload only. In-site arrival and Back/Forward draw it finished. (The comment above `entrance()` says it also assembles on in-site links; the code does not.)
- `pixel-mark.js`: 2,278 pixels, 160 × 61, scatter up to ±13 × ±9 px, 1,850 ms, cubic ease-out, alpha `t × 2.3`.

## Critique of what exists (seen in the full homepage, at ordinary speed and frame-stepped)

Observed, measured with a frozen clock (`media/contact-desktop.png`, `media/contact-phone.png`):

| Production | 0 ms | 100 ms | 300 ms | 600 ms | 900 ms | 1200 ms | ≈1500 ms |
|---|---|---|---|---|---|---|---|
| Fully inked pixels | 0 | 0 | 0 | 0 | 408 | 1,724 | 2,278 |
| Translucent grey pixels | 0 | 31 | 697 | 1,547 | 1,380 | 0 | 0 |
| Pixels not where they will end | 2,278 | 2,283 | 2,403 | 2,391 | 1,932 | 1,076 | 0 |

So the first impression is **blank paper beside a live navigation**. Then comes a cloud **wider than the mark, in tones the bitmap never has**. The word is unreadable until ≈ 1.2 s. The causes of the gaminess, in order of weight:

1. **Pixel autonomy.** 2,278 agents each solve their own path. That is a particle system, the visual grammar of games and screensavers.
2. **Non-ink tones.** Partial alpha turns a 1-bit mark into grey dust. The bitmap is either ink or paper; the animation is neither.
3. **Temporal hierarchy inverted.** Noise first, identity last. The visitor's first ~1 s is spent waiting for a logo.
4. **Silhouette larger than the mark.** The cloud occupies ~13 px beyond the lettering, so the motion reads as an *event* around the mark.
5. **Blank delay.** Nothing at all for ~90 ms, while the nav is already sharp.

Earlier studies (`media/prior-studies.png`, from the isolated artboard at `study/signature-motion`):

- **Drawing** — the stroke order is mostly right, and it proved a pixel-honest inscription is possible. What doesn't work: 180 ms of blank, a word unreadable until ≈ 1.5 s, constant speed (mechanical regularity), and the underline arriving as a separate second act after the word. Hand-authored ownership masks leave clipped fragments mid-letter (see 1500 ms, "Freema:").
- **Impression** — a whole-mark opacity fade: grey at 300 ms, ink by 600. It is a UI transition, not ink. It also puts colours on screen the bitmap never has.
- **Construction** — three vertical masks racing left to right. Letters are visibly cut ("Fr|", "Freem|"). That is exactly the veto: masking seams.
- **Practiced hand** (`hand-mark.js`, unwired; `media/practiced-hand.png`) — 300 ms of blank, the word complete only at ≈ 1.5 s, 2.16 s total. A stray grey fragment appears below the F at 600 ms. Refined in timing, but the same inscription with a longer wait. It should not be wired in.

Hypothesis (not measured): what visitors call "gamey" is *the mark not existing yet*. Any treatment that withholds the name, however elegant, inherits some of that.

## The argument

The mark is a signature. A signature is not assembled, and it is not printed in stages. It is a name the signer already owns, closed by **one gesture** that is theirs alone: the flourish beneath it. Of the whole Freeman mark, only the underline is gesture by nature. It is the heaviest, fastest and most personal stroke, and it is the one a hand would make last.

So the brand deserves this: **the name is simply there, and the hand signs it off once.** Then nothing moves.

## The variants (all in the real entrance; every frame is a subset of the final bitmap at full ink)

**00 — Already There.** The finished mark on first paint: no loader, no delay. Navigation is immediately usable. Click does nothing.

**01 — An Author's Stroke** (1,050 ms; brisk 690 ms). The bitmap's own 1-px centre lines (Zhang–Suen thinning) carry an authored pen route:

- F cap from its inner curl;
- F stem down to the ball terminal;
- crossbar;
- pen lift;
- "reeman" as one continuous stroke, with the m and n retraces;
- the n's exit curl turning into the underline, pulled right to left.

Speed follows the two-thirds power law of human movement: slower in tight turns, faster on long hairlines, easing in and out. The underline accelerates and leaves at speed. Each ink pixel takes the time of its nearest centre-line pixel, measured *through ink*, so no stroke can light a neighbour. There are no masks, guides or pen.

Topology verdict: the bitmap **does** support it (`media/stroke-skeleton-routes.png`, `media/stroke-arrival-heatmap.png`), with two honest limits:

- the order of the a's bowl and the F's crossbar is inferred, not evidenced;
- the broad underline can't show pressure along its length.

**02 — An Impression** (360 ms). The first version inked pixels by depth. On a thin script that printed the underline's spine as a bar, then scattered single pixels (dust again), then the rest at once. Rejected on sight.

The second version is letterpress ink squeeze. The signature lands as its centre line plus one ring, so the letters are near full weight on frame 0. Ink then spreads to the true edges, which mostly means the underline swelling from a rule to its full form.

**03 — The Flourish** (≈ 325 ms; brisk ≈ 215 ms). The name, the F and every letter are present at first paint. Only the closing gesture is written:

- the n's exit rises into its curl (slow, a tight turn);
- the underline is pulled leftward under the word, accelerating;
- its thin tail lands last.

The stroke's edges lag its centre line slightly, as a loaded brush lays ink. The leading edge is therefore a tapered point, never a vertical cut (`media/flourish-underline-20ms.png`).

Tempo: treat as tuned by eye. Measured is the recommendation for 01 and 03. Brisk 03 (~215 ms) starts to read as a blink rather than a hand.

## Ranking, with reasons

1. **03 The Flourish — recommended.**
   - The identity is legible on the first frame.
   - The ceremony is over in a third of a second, before a visitor knows they're waiting.
   - The one moving thing is the one thing a hand really does: a signature signed, not built.
   - Risk: for ~0.3 s the mark is shown without its underline. Looked at as a still, that is an incomplete logo.
2. **00 Already There — the control, and it holds up.**
   - Most faithful to the doctrine ("mostly static; motion scarce enough to feel surprising").
   - Beats production, every earlier study, 01 and 02.
   - Choose it if 03 feels like any performance at all, and it is the right answer for anyone who wants zero motion.
3. **01 An Author's Stroke — rejected for arrival.**
   - Credible handwriting, but the name only becomes legible at ≈ 0.9 s, and the first ~100 ms is a single dot.
   - Every visit opens on someone performing the signature for you.
   - It would be acceptable only as an on-request replay (click), never on load.
4. **02 An Impression — rejected.**
   - Legible at once, but it is effectively a fade made of pixels.
   - Worse, the thin-to-full weight change resembles a webfont swapping in (FOUT): a technical artifact, not an authored act.
   - Mid-ink, the *a* briefly reads as an *o*.
5. **Production scatter — rejected.** The reasons are tabled above.

**Which would a top architect trust?** 00, and 03 as the only motion they would allow: one stroke, then stillness.
**Which will look embarrassing after six months?** Production's scatter and 01. The first is a particle demo; the second is a draw-on that every returning visitor has to sit through. 02 ages into "the logo loads weirdly".

## Implementation

- `v5/signature-motion.js`: the study engine.
  - Same `{ replay, paint, destroy }` handle as `FreemanPixelMark.mount`.
  - Reads the artwork from production's own renderer (`play:false`) and verifies it: count, 1-bit alpha, checksum. If the readback is altered (privacy noise) or the art changes, it falls back to the production renderer unchanged.
  - Frames are always subsets at full ink.
  - The first frame is drawn synchronously with the page.
  - Reduced motion (initially or mid-play), a hidden tab, a bfcache restore, or frames that stop arriving (watchdog at total + 400 ms) all end on the finished mark.
  - A slow frame rate can only make it finish sooner.
- `studies/signature-motion-refinement/index.html` and `study.js`: the production entrance with the production `app.js`, unmodified. `study.js` routes `FreemanPixelMark.mount` to the engine with the selected variant. The study page omits the two unused hand scripts and adds `noindex`.
- No change to `app.js`, `pixel-mark.js`, `styles.css`, `index.html`, other pages, headers, redirects or deploy settings.
- To adopt 03 later, the change is two lines plus this file:
  - a script tag for `signature-motion.js`;
  - in `entrance()`, mount through the engine with `{ variant: "flourish" }`.
  - The arrival table can be baked to ~3 KB so that the runtime analysis (~25 ms once, measured) disappears.

Controls: `00–03`, Replay (or click the signature), `0.25× speed`, `Brisk`, colourways as on the site. Keys: `0`–`3`, `R`, `S`, `T`. `?bare` hides the panel.

Known study-only quirk: on this sub-path, `app.js`'s own HEAD probe for `company.html` returns 404 in the console (a feature probe, not a script error). In-site navigation works in place. Reloading a sub-page of the study 404s, because only the entrance is copied.

## Verification

`qa/verify.mjs` (Playwright, Chromium and WebKit) → `qa/results.json`: **396 passed, 0 failed** (22 Oct 2026, local server).

- **Final frame:** every variant × light/dark/Freeman × DPR 1/2/3. The canvas RGBA is byte-identical to an independently loaded `FreemanPixelMark.mount(canvas,{play:false})`, and the on-screen raster is identical to the production entrance.
- **Colour:** `#332e20` / `#fff9f1` / `#f93822`.
- **Rendering:** exactly two colours on screen at every DPR (no resampling blur).
- **Placement and scale:** identical to production, with a whole number of device pixels per bitmap pixel. Pre-existing and noted: at DPR 3 production's group sits at y = 994.97 device px (layout rounding). It renders crisply all the same.
- **Every frame:** a subset of the final bitmap, monotone, no partial alpha; the first frame is not blank (02, 03).
- **History and bfcache:**
  - Back to the entrance is finished on the first frame;
  - a `back_forward` load is finished;
  - a bfcache restore mid-play finishes.
- **Palette switch mid-play:** keeps the frame, recolours, continues without restarting.
- **Reduced motion:** at load, turned on mid-play, and on replay.
- **Hidden tab and stalled frames:** a hidden tab finishes; no rAF at all still ends finished via the watchdog.
- **Replay and teardown:**
  - click replays from the start;
  - a route switch mid-play cancels all animation frames and removes the engine's listeners;
  - nothing is pending after finishing.
- **Phone 390 × 844 @3×:** no horizontal overflow; signature target ≥ 44 px; colourway targets enlarged as in production; no JS errors anywhere.

Real-time recordings (load → hold → click replay) are in `media/*.webm` for desktop and phone, production included. They were captured headless at ordinary speed. Contact sheets are frozen-clock frames at 0/120/300/600/900/1200/2000 ms.

One run of the suite (of three full runs) failed 5 WebKit placement checks: the mark sat 75 px low. That traced to a **pre-existing production bug, independent of motion**. In WebKit, if `styles.css` arrives after the deferred `app.js` runs, `entrance()`'s `fit()` measures the unstyled group, and the signature stays 75 px low until a resize. It is reproduced on the production entrance itself by delaying `styles.css` 600 ms: top 407 instead of 332 in WebKit, 332 in Chromium. It is not fixed here, because it is outside this study; it is worth its own fix (re-fit once styles and fonts are ready).

Not verified: a physical iPhone or Android device, Firefox, and how it feels to you. Only you can judge that.
