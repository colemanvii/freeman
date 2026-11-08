# Photographs 002 — two working studies

Isolated design studies for the Freeman photography page (`/photographs`). Nothing here is
wired to production, the Drive gallery or Cloudflare. Open `index.html` locally, or serve the folder:

    cd studio/studies/photographs-002 && python3 -m http.server 8002   # then http://localhost:8002

| | Direction | Idea |
| --- | --- | --- |
| 01 | [The Edited Wall](wall.html) | Production's justified rows, but every row's width and hang is authored, rows gather into clusters separated by real silence, and the phone has its own hang. |
| 02 | [The Photographic Sequence](sequence.html) | One column. Each photograph has a declared scale (four steps) and alignment; nothing is taller than the screen; full frames run edge to edge on the phone. |

Both share production's tokens, Libre Franklin, the eagle and wordmark, and the full-screen viewer
(`shared.css`, `shared.js`), so the studies differ only in composition. Both remove the
COLLAGE / SCROLL switch. Neither crops a photograph.

## What is real and what is approximate

- **Photographs:** the eighteen frames of 6 November committed with the first gallery (`060fc61`), byte for byte.
  Four Drive-only photographs — including the cover, two builders at the site — are not in the repository and are absent here.
- **Order:** production stores its curated rows as Drive IDs (`EDITORIAL_ROWS` in `lib/photographs-drive.js`). The
  order here (`ORDER` in `shared.js`) is the closest reading of those rows' comments. Swap in Drive IDs to make it exact.
- **No captions, dates, collection names or new branding.** Direction 02 closes with the existing eagle as a link home.
- **Rendering:** these prototypes compose in the browser for each breakpoint. A production version would render
  both compositions on the server so nothing is rearranged after load.

Screenshots for comparison are in `screens/`.
