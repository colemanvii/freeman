# FreemanAI — Film Study 001

A 30-second **silent** motion test with three beats: one question, one building, one decision.

- **Branch:** `study/freemanai-film-001`, cut from `archive/freemanai-002-approved` (3452257).
- **Page:** `v5/studies/freemanai-film-001/`
- **Local preview:** config `freemanai-film-001`, port 8824.

The approved Exploration 002 (`v5/studies/freemanai-002/`) is untouched. The film runs the real interface inside the frame, in an iframe, and directs it from outside:

- the camera;
- the cursor and touches;
- pointer and click events;
- the cuts.

Nothing in the film is a recreation.

## Frame

- 16:9, with a world of 1600 × 900 interface pixels.
- Chalk paper on an umber surround.
- Freeman red appears only as the pen, the date handle, the evidence highlight and the stamp.

## Shot list, as cut (seconds)

| # | In | Out | Picture | Camera |
|---|----|-----|---------|--------|
| 1 | 0.0 | 2.6 | Paper, then *What's happening at Freeman?* Caption: One question. | Tight on the headline, slow pull back to the ask line |
| 2 | 2.6 | 4.9 | *What's going on with Etowah Mercantile?* typed into the real field, about 46 ms a key, then the crosshair presses ↵ | Holds |
| 3 | 4.9 | 8.3 | The sheet plots: gridlines, rooms, pins; the red pen traces the outline | Wide, then a 2.5 s push onto the plan and date rule |
| 4 | 8.3 | 15.9 | **Hero.** The handle is taken at today, dragged back to 4 May (empty shell, 8.9–10.0), held, swept slowly to 18 Dec (10.45–14.65) as rooms hatch and pins land, held, returned to today. Caption: One building. | Drifts in 4% across the sweep |
| 5 | 15.9 | 19.2 | The storefront RFI pin is pressed; its source opens with the cited line in red | Push to the pin, then to the highlighted passage |
| 6 | 19.2 | 24.5 | Cut to a drawn phone. Capture, tap the mezzanine, the note, send; stamped CAPTURED | Follows each touch, then back to the whole phone |
| 7 | 24.5 | 28.15 | The owner's view. Approve. The eagle presses in red. Caption: One decision. | Settles on the stamp, then a slow 3.5% drift |
| 8 | 28.15 | 30.0 | Paper. *FreemanAI* / Built for Generations | Still |

## Review

- **Live:** open the page and press Play. It plays at real speed in the browser, and the timings above were measured in headless Chromium with no overruns. A browser tab in the background throttles timers and will play slowly.
- **Rendered:** `film-study-001.webm` (1920 × 1080, 30 fps, 30.00 s, 15 MB, VP8). It is linked from the page as "Rendered video". Safari and iPhone support for WebM varies; Chrome and Firefox play it.

## Re-rendering

The tools are in `tools/` and need Playwright with Chromium installed (`PLAYWRIGHT_CORE` can point at a `playwright-core` folder) and a local server for `v5/` on port 8824.

- `film-time.cjs`: plays once and prints where each beat landed.
- `film-stills.cjs`: captures stills at chosen seconds.
- `film-render.cjs`: records the screen stream at about 44 fps and resamples it to a constant 30 fps. Encode the frames with Playwright's bundled ffmpeg (it reads MJPEG piped as a file and writes VP8 WebM).

## Not in this study

Sound, voice, live action and colour grading.

The page plays at real speed in a browser. It saves and restores the visitor's own Exploration 002 sample state around each playback.
