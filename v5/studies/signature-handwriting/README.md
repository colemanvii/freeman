# Signature handwriting — round 2 (whole signature), 22 October 2026

Issue colemanvii/freeman#65, revision of 22 Oct ("The Flourish is not approved"). Branch `study/signature-motion-refinement-20261022`.
Preview: `/studies/signature-handwriting/` (selector) and the branch's own entrance `/` (plays the recommended pass).

**Recommendation: 01 Fluent (980 ms).** The pen is already down on the first frame. The F is written in about 200 ms, and the name forms legibly letter by letter. The n turns, without stopping, into the underline, which is thrown under the whole name and lands at 980 ms. Then nothing moves.
00 Still remains the baseline; 02 Quick and 03 Deliberate are rejected (reasons below).

The Flourish candidate (`release-candidate/signature-flourish-20261022`) is not merged and not deployed; it is superseded by this study.

## What changed since round 1, and why

Round 1's 01 (and the earlier "Practiced" hand) proved the bitmap carries believable stroke topology. Both failed on rhythm:

- a blank or single-pixel opening (Practiced: ~300 ms blank);
- a capital that ate a third of the time;
- an underline that arrived as a second act.

Round 2 keeps the same artwork, skeleton and letter route, and rebuilds the hand.

1. **Ductus from the artwork's own pressure.** The F cap's heavy teardrop at the right is where the pen lands. The cap thins as the pen sweeps left along the top, and the inner ball of the curl is where it stops. Written the other way round, the opening is a tiny curl that reads as a stray mark (`media/cap-direction.png`).
2. **Motor rhythm, not easing.**
   - Each rise or fall between vertical turning points is one motion, and motions take similar time whatever their length (isochrony, duration ∝ length^0.5).
   - Inside a motion the pen is fastest mid-way and slows into turns, never to a stop.
   - Where the finished stroke is broad the pen was pressing, so it moves slower; hairlines are quick.
   - Retracing ink already down (m, n, a) is quick.
   - Pen lifts are real air time.
3. **A practiced capital.** The cap and stem are thrown faster than the name; the name carries the time.
4. **One gesture to the end.** The underline starts exactly where the n ends, so there is no lift and no air time. It leaves the n already moving and gathers speed. The thin tail lands last. This removes the "and now the underline" hold that made the Flourish feel appended.
5. **Pen already down.** A 25 ms lead means the first painted frame already carries the landing (≈ 90 px), not a dot.
6. **Ink, not animation.** Every frame is a subset of the original 160 × 61 bitmap at full ink. There is no partial alpha, no movement and no mask. Stroke edges lag the centre line by a few ms, so each stroke's leading edge tapers like a pen tip instead of cutting straight.

## The passes (same hand, materially different timing)

Ink laid per 60 Hz frame (`·` = a frame with no new ink, i.e. a pen lift):

```
01 fluent      980ms  first 87px  max 149px/frame  lifts: 2f, 2f, 1f (all inside the F)
   █▄▂··▃▇▄▃··▁▂·▁▃▂▄▃▄▃▂▂▄▃▂▃▃▃▃▃▃▂▃▃▃▄▄▃▄▄▂▃▂▂▃▃▂▃▄▆▇▇█████▆·
02 quick       679ms  first 124px max 236px/frame  lifts: 1f, 1f, 1f
   █▂·▃█▃▁·▂·▂▃▅▄▅▃▅▄▃▄▄▃▄▃▄▅▆▅▅▃▄▃▄▄▃▇█████·
03 deliberate 1381ms  first 56px  max 78px/frame   lifts: 2f, 2f, 2f
   ▅▄▃▂▁··▂▅▅▃▂▁··▁▁··▁▃▂▃▃▂▃▃▂▂▂▃▄▂▂▂▃▂▂▂▂▂▂▂▂▂▂▃▂▄▃▂▄▃▃▁▂▃▁▁▂▃▂▂▂▃▃▃▃▄▄▄▄▄▅▅▅▆▆▆▇▇▆▃·
```

- **01 Fluent — recommended.**
  - F by ~200 ms, "Free" by ~450, "Freeman" by ~800, underline by 980.
  - The proportions read like a real signature: capital ~20%, name ~60%, underline ~20%.
  - The name is never withheld for long and never blank, and the underline is the same breath as the name (`media/fluent-underline-60hz.png`, 17 ms steps).
- **02 Quick — rejected.** Clean and legible, but the underline lands in ~5 frames at up to 236 px per frame. At normal speed that reads as a snap, not a throw.
- **03 Deliberate — rejected.** Believable as a careful hand, but 1.4 s is a ceremony on every load. Its longer lifts leave the F reading as a "T" for ~200 ms.
- **00 Still — the baseline.** Finished on first paint. If any handwriting feels like a performance after living with it, this is the answer.

Honest limits:

- Between the stem and the crossbar (~150–220 ms in 01) the F briefly reads as a script "T"; that is how this F is written.
- The a's bowl and the crossbar order are inferred from the bitmap, not documented.
- I judged motion from frame-accurate captures at 17–70 ms steps and real-time recordings, not by watching a live screen. The recordings (`media/*.webm`) are there for your eye.

## Entrance integration on this branch

This fixes the issues the revision named; they are fixed on the study branch only.

- **Direct project URL → CLOSE → entrance.** Project pages don't load the signature scripts, so the entrance used to show no signature at all. That is true in production today too. `entrance()` now loads `pixel-mark.js` then `signature-motion.js` on the way, and draws the exact finished mark. Selecting it writes the signature by hand. Each script loads once, at the same URL as the entrance's tags, and leaving before they arrive mounts nothing.
- **Fallback never scatters.**
  - If the hand is unavailable, `app.js` shows the original bitmap finished and still, and replay keeps it still.
  - If the artwork can't be verified, the engine does the same.
  - The retired scattered-pixel assembly is never played.
  - If both scripts are unreachable, the button is inert and there is no error.
- The branch's own entrance (`/`) now plays 01 Fluent. `hand-mark.js` and `practiced.timeline.js` are no longer loaded (the files remain on this branch). `app.js` is versioned `20261022-hand-002` on all 21 routes.

## Verification

`qa/verify.mjs` (Playwright 1.63, Chromium + WebKit) → `qa/results.json`: **548 passed, 0 failed**. Round 1's suite still passes (396/396).

- **Final frame:** every pass × light/dark/Freeman × DPR 1/2/3. The canvas is byte-identical to an independently loaded `FreemanPixelMark.mount(canvas,{play:false})`, and the on-screen raster is identical to the plain entrance. Colours are `#332e20` / `#fff9f1` / `#f93822`, with whole device pixels per bitmap pixel.
- **Every frame:** a subset of the final bitmap, monotone, with no partial alpha. The first frame already carries ink.
- **History:**
  - Back to the entrance is finished;
  - a `back_forward` load is finished;
  - a bfcache restore mid-play finishes.
- **Mid-play events:**
  - a palette switch keeps the frame, recolours, and continues;
  - turning on reduced motion (or having it at load) finishes the mark, and replay stays still;
  - a hidden tab finishes;
  - if no frames arrive at all, the watchdog finishes.
- **Replay and teardown:** click replays; a route switch mid-play cancels frames and removes listeners.
- **Project URLs:** every one → CLOSE → exact mark, with no partial-alpha pixel ever, no errors and no failed requests. Plus project → entrance → Company → Back, and leaving before the scripts arrive.
- **Fallbacks:** flourish script missing (on the entrance, and arriving from a project page), unknown artwork, and both scripts missing.
- **Phone:** 390 × 844 @3×.

Not verified: a physical iPhone or Android, Firefox, and how it feels to you. A passing test count is not aesthetic approval; the contact sheets and recordings are what to judge.

## Media

- `contact-desktop.png`, `contact-phone.png`: live production, the unwired Practiced hand, round 1, and 00–03 at the same moments (0–2200 ms).
- `fluent-50ms.png`, `fluent-phone.png`, `quick-40ms.png`, `deliberate-70ms.png`: each pass frame by frame.
- `fluent-underline-60hz.png`: the n turning into the underline.
- `cap-direction.png`: the two cap directions.
- `desk-*.webm`, `phone-*.webm`: real-time recordings (load, hold, click replay).
