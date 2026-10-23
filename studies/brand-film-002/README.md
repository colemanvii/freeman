# Freeman Brand Film 002: Built for Generations

*A 12-second vertical film (1080 × 1920, 30 fps, with sound) for Instagram Stories and Reels. Study branch only; nothing here is deployed.*

The website is the performance. Every interaction in the film was captured from the approved V5 public site (`release/approved-v5-2026-10-18` @ `868cafb`), served unmodified. Only the closing **Eagle** and **Resolve** compositions were built for the film, and they use the site's own tokens, typography, script and Stamp motion.

## Renders
| File | |
|---|---|
| `renders/freeman-brand-film-002.mp4` | H.264 High, 30 fps + AAC 256k stereo, 12.000 s, mix −19.9 LUFS / −1.2 dBFS peak |
| `renders/freeman-brand-film-002-silent.mp4` | Same picture, no audio track |
| `renders/freeman-brand-film-002-cover.png` | Cover frame (the resolved script with "Built for Generations") |

## Sequence
| Time | Beat | What is real |
|---|---|---|
| 0.0–2.0 s | **Signature** | The entrance's production handwriting (`signature-motion.js`, "Deliberate" pass) writes the Freeman script, then holds. Window 1440 × 640, crop ×1.8. |
| 2.0–3.5 s | **Color** | The crosshair clicks the entrance's own colorway swatches: Dark (umber), Freeman (sand, red script), Light (chalk). These are the three approved palettes. The cursor turns red in Dark because the site's CSS defines it that way. |
| 3.5–5.0 s | **Enter** | The crosshair moves to **MAP**, gets the instant orange word highlight, and clicks. The public project map, "The Record: Places we've helped build.", loads. The cursor holds its screen position across the cut. Window 800 × 1422, a true 9:16 desktop window, crop ×1.35. |
| 5.0–8.0 s | **Place** | Hovering **01 Beetlecat** in the Project Register opens the site's photo glimpse. A click opens the record through the site's stepped 420 ms wipe while the map flies to Inman Park. **VIEW FRAME ↗** opens the photography viewer, and the Beetlecat bar (photo: Jared Swafford) holds full-width for about 1.6 s (6.36–8.0 s). |
| 8.0–10.0 s | **Eagle** | The approved 192 × 60 Stamp bitmap at ×3, in Freeman red on the Freeman (sand) colorway, lands (first ink 8.47 s) with the production `eagle/eagle-motion.js` "impression" motion. Above it: "Built for Generations". |
| 10.0–12.0 s | **Resolve** | The finished chalk script, at exactly its opening position (pixels taken from the opening shot), with "Built for Generations" on the line where the navigation sits. It holds for 2.0 s and loops back to the opening frame. |

## Sound
Original and synthesized in `source/sound.py`; no samples are used. Every cue is read from the capture log or measured from the frames.
- Pen on paper, driven by the signature's measured ink rate.
- Dry press and release clicks at every logged mouse event.
- One struck tone per colorway: D, then F#, then A.
- A sheet-settle as the map arrives.
- Five fine ticks, one for each step of the record wipe.
- A low room tone under the photograph.
- A dry stamp impression on the first frame of red ink.
- A quiet D chord fading to silence as the film resolves.

There are no typing sounds, because no text is entered.

## Notes and caveats
- **Font:** Monaco is Apple-licensed and absent on the Linux capture machine. DejaVu Sans Mono stands in, injected into the CSS responses at capture time; the site files are untouched. For exact Monaco, re-capture on a Mac and remove `FONT` from `capture.js`.
- **Live site:** freemangc.com was unreachable from the build environment, so the film shows the approved release build rather than a recording of the live site.
- **Map:** "MAP" is the public Record map (`/map`, formerly `/record`) linked from the site navigation.

## Rebuild
```
cd <release-worktree>/v5 && python3 -m http.server 8765
node source/capture.js http://localhost:8765/ raw     # Playwright + Chromium
python3 source/compose.py raw frames                  # crops → 1080×1920; draws the site's crosshair at one constant size
python3 source/sound.py raw frames sound_raw.wav      # numpy, scipy, Pillow
ffmpeg -i sound_raw.wav -af "volume=6dB,alimiter=limit=0.84:attack=1:release=60:level=disabled" sound.wav
ffmpeg -framerate 30 -i frames/f%04d.png -i sound.wav -c:v libx264 -crf 14 -pix_fmt yuv420p -c:a aac -b:a 256k film.mp4
```
- **Edit timing:** all timing, windows, crops and cursor keyframes live in `source/timeline.json`.
- **Determinism:** `vclock.js` gives each document a virtual clock covering timers, rAF, `performance.now`, `Date` and CSS animations, so every render is frame-exact.
