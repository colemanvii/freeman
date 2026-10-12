# Freeman GC — V5 Fieldwork / fixed-screen site

Four public destinations: **Freeman GC / Projects / Fieldwork / Contact**.

Based on Astra's fixed-viewport edition, with no page scrolling and record-by-record previous/next navigation. Crosshair cursor and instantaneous orange word highlights (no underlining animation).

## Preview

Open `index.html` or run `python3 -m http.server 8765` from this folder. No build step or external dependencies.

## Edit

Edit `content.json`, then run `python3 generate.py` to refresh route entry points and `records.js`. App logic is in `app.js`, visual rules in `styles.css`.

## Content and limitations

Nine project entries and six Fieldwork records are source-labeled, using local image assets. Fieldwork is not a verified live feed; archive capture dates remain unknown. The Client Portal is removed from the public navigation and route generator; its earlier HTML/sample brief are preserved under `_preserved-portal`, while the production portal remains entirely separate. Mobile Safari physical-device verification remains outstanding.

Original Astra ZIP and Opus's separate GitHub branch were not modified.
