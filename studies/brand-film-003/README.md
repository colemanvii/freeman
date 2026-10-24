# Freeman Brand Film 003: Built for Generations

*A 12.2-second vertical film (1080 × 1920, 30 fps, with sound) for Instagram Reels and Stories. This is a rebuild of 002, which is kept unchanged in `studies/brand-film-002/`. Study branch only; nothing here is deployed.*

The concept is the same as 002: signature → colorways → cursor → map → project photograph → eagle → Freeman / Built for Generations. What changes is the art direction. Every shot is cropped around its action at a confident scale, and the film is built around one transformation: the Beetlecat photograph expands out of its map preview into the full vertical frame.

All site footage was captured from the approved V5 build (`release/approved-v5-2026-10-18` @ `868cafb`), served unmodified, in **Monaco** on macOS. The DejaVu substitute used in 002 is gone.

## Renders
| File | |
|---|---|
| `renders/freeman-brand-film-003.mp4` | H.264 High, 30 fps, CRF 14 + AAC 256k stereo, 12.2 s, −19.3 LUFS, −1.5 dBTP |
| `renders/freeman-brand-film-003-silent.mp4` | Same picture, no audio track |
| `renders/freeman-brand-film-003-cover.png` | Cover: the Beetlecat photograph at rest, full frame (frame 240) |

## Sequence
| Time | Shot | Scale | What happens |
|---|---|---|---|
| 0.00–3.87 s | **Signature / Color** | site ×3 | The production handwriting writes "Freeman" from the first frame, 960 px wide with 60 px margins. The site's 1000 × 520 layout draws the script at 2 CSS px per bitmap pixel, so ×3 keeps every pixel whole and enlarges the swatches and navigation by 50% compared with 002. The crosshair clicks Dark (2.10 s), Freeman red on sand (2.70 s), then Light (3.30 s). |
| 3.87–4.23 s | **Navigation** | site ×4.5 | Cut closer while the cursor is moving toward MAP; the cursor keeps its height across the cut. The frame is centred on "PROJECTS / MAP / CONTACT". MAP takes the site's orange highlight and is clicked. |
| 4.23–6.30 s | **Map** | site ×2.5 | The Record, already zoomed to Inman Park with the site's own wheel zoom (the zoom and pan happen before the shot is seen). The map cuts in while the roads are still drawing. Marks arrive and the street grid clears, and only then does the cursor move to the Beetlecat mark. The site's real photo preview opens beside the mark and holds for 0.6 s, framed with Buckhead, Druid Hills, Kirkwood, Savi Provisions, Muchacho Decatur, West Midtown and Atlanta. Click. |
| 6.30–6.90 s | **Transformation** | — | The exact preview photograph expands to the full frame in one scale-and-position move, rendered from the original 1920 × 1370 file. The window reaches the frame edges still moving, so the arrival is decisive, then the photograph settles about 2% in scale and comes to rest by 7.5 s. |
| 6.90–10.00 s | **Beetlecat** | — | 3.1 s full-frame: a one-point vertical crop down the plaid aisle, with the stools, the bar and the framed print on the back wall. |
| 10.00–10.70 s | **Eagle** | ×4 | Sand paper, a short beat, then the approved Stamp bitmap stamps in Freeman red with the production "impression" motion at 1.25× speed (first ink 10.17 s). It is centred on the line the script occupies next. |
| 10.70–12.20 s | **Lockup** | — | The finished Freeman-colorway script (red on sand), taken pixel for pixel from the opening shot and placed exactly where it was, over "Built for Generations" in Monaco. Held for 1.5 s, then the film loops to its first frame. |

Instagram safe areas: all essential text sits between y = 429 and y = 1371, and nothing essential is under the right-hand button column. Essential labels were checked at 360 × 640.

## Sound
All sound is synthesized in `source/sound.py`, with no samples. Cue times come from the timeline or are measured from the frames.
- Dry press and release clicks on the swatches, MAP and Beetlecat.
- A short, dry, pitched knock on each colour change: D, F#, then A.
- A breath of air that rises with the expansion, a low warm landing on arrival, then a very quiet room tone under the photograph.
- A dry stamp impression on the first frame of red ink.
- A quiet D that fades to silence by the loop point.

Removed from 002: the pen scratching and the five wipe ticks. There is no sound for the map arriving or for the preview appearing.

## Verification
- **Expansion:** the first expansion frame matches the browser-rendered preview to the pixel. The best alignment is (0, 0), and the mean colour difference is under one level per channel. The photograph has no ICC profile, so its colours match the site's.
- **Smoothness:** the window and the photograph's scale are continuous in position and velocity through the arrival and the settle (`expansion.json` is written beside the composed frames).
- **Encoding:** the H.264 encode holds 39–46 dB PSNR against the composed PNG frames.

## Caveats
- **Sharpness:** the largest Beetlecat source on this machine is the site's own 1920 × 1370 JPEG. The full-frame crop (771 × 1370) is enlarged 1.40×, peaking at 1.43× during the settle. It holds up at phone size, but a higher-resolution original from Jared Swafford would make the hold sharper. To use one, swap the file in and re-run `compose.py`; nothing else changes.
- **Credit:** the photograph is uncredited on screen. Credit **Photo: Jared Swafford** in the post caption.
- **Map preparation:** the map is zoomed and panned with the site's own wheel and drag before the shot, which is an edit. Clicking Beetlecat does not open the site's record. The expansion is an editorial transition, as briefed.
- **Cut alignment:** the navigation punch-in keeps the cursor's height across the cut, but it shifts about 150 px sideways so that "PROJECTS / MAP / CONTACT" sits whole in the frame.

## Rebuild
```
git archive release/approved-v5-2026-10-18 v5 | tar -x -C site && cd site/v5 && python3 -m http.server 8765
node source/capture.js http://127.0.0.1:8765/ raw              # Playwright + Chromium; add --stills 1.6,2.9,… for key frames only
python3 source/compose.py raw frames site/v5                   # Pillow, numpy
python3 source/sound.py raw frames sound_raw.wav               # numpy, scipy, Pillow
ffmpeg -i sound_raw.wav -af "volume=6dB,alimiter=limit=0.84:attack=1:release=60:level=disabled" sound.wav
ffmpeg -framerate 30 -i frames/f%04d.png -i sound.wav -c:v libx264 -profile:v high -crf 14 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart film.mp4
```
- **Timing and framing:** every cut, crop, scale, cursor keyframe, the map preparation and the expansion parameters live in `source/timeline.json`.
- **Determinism:** `vclock.js` gives each document a virtual clock covering timers, rAF, `performance.now`, `Date` and CSS animations. Each shot runs in its own browser context at a device scale equal to its crop scale, so site pixels land on whole film pixels.
- **Plates:** `eagle.html` holds the Stamp eagle and `words.html` holds "Built for Generations". Both are served from the site's origin so they use its stylesheet, palette and eagle motion.
