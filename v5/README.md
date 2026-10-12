# Freeman GC — V5 Fieldwork / fixed-screen site

Four public destinations: **Company / Projects / Fieldwork / Contact**.

Based on Astra's fixed-viewport edition, with no page scrolling and record-by-record previous/next navigation. Crosshair cursor and instantaneous orange word highlights (no underlining animation).

## Preview

Open `index.html` or run `python3 -m http.server 8765` from this folder. No build step or external dependencies.

## Edit

Edit `content.json`, then run `python3 generate.py` to refresh route entry points and `records.js`. Every route (including Fieldwork) uses the same generated shell. App logic and navigation are in `app.js`, the Fieldwork living index in `fieldwork-reader.js`; visual rules in `styles.css` and `fieldwork-reader.css`.

## Navigation

Every route is a real file (`company.html`, `project-<slug>.html`, `fieldwork-<slug>.html`, …), so deep links and refreshes need no server rewrites. After the first load, links are handled in place with the History API, so nothing resets between visits (palette, Fieldwork filters and list position, opening state).

- **Entrance (`index.html`).** An orange FREEMAN GC (same Monaco, size and baseline as the navigation; not a link) leads the navigation; brand and links centre as one group, stacked on phones. The red eagle plays on the first load of a tab session (never on Back/Forward). The entrance stays in history, so Back from the first interior page returns to it.
- **One section line on every interior page.** `COMPANY / PROJECTS / FIELDWORK / CONTACT` sits top-left everywhere (current section in orange), and the four sections link to each other directly. The entrance uses the same four labels. FREEMAN GC is the brand and is never a link.
- **PROJECTS is a full-width index**: NO. / PROJECT / CLIENT / DESIGN / DATE, each row one link to the project page. Only verified values are shown — Client from the project credits, Design from Freeman's published Interior Design credit (not presented as architect of record), a date only from an explicit `date` field; the scraped "Complete: 2024" template credit is not used. Unverified cells show a dash (hidden on phones). BACK restores the list position and selected row.
- **COMPANY is the company page** — one static view (no sheets): headline, a short introduction, services, Gabe Freeman (President) and Cartersville, Georgia. Only very small phones scroll it slightly; text is never shrunk to force a fit.
- **← BACK is real history.** Every interior page has `← BACK` bottom-left (Escape does the same on project and Fieldwork detail pages). It behaves exactly like browser Back, trackpad and mobile swipe-back: it returns to wherever the visitor came from. Each history entry stores its depth within the visit; on a direct arrival (no earlier same-site page) BACK falls back to the entrance. Leaving a page saves its view state into its own history entry — selected project, Fieldwork scroll and record — and filters/sheets live in the URL, so returning restores them. There is no × CLOSE and no custom swipe handling.
- **PREV / NEXT** only appear when a page has more than one sheet.
- **Fieldwork** is a photographic log: one list of compact rows (thumbnail / title + project). A date and time appear only when a record carries a genuine one; current records have none, so none are shown. Records keep their own pages; ↑ ↓ (or ← →) step between them, each step its own history entry so BACK retraces them. Local notes remain reachable at `fieldwork.html?note=new`.
- Palette choice travels in `history.state` (survives reloads without sessionStorage); the entrance always starts in off-white.

QA: `python3 tools/navigation-qa.py http://localhost:8765/v5/` (Playwright/Chromium) checks the rules above, back/forward/refresh/deep links, and layout and 44px touch targets at 375×667, 390×844, 430×932, 1280×720, 1440×900 and three landscape phone sizes. Results: `navigation-validation.json`.

## Content and limitations

Nine project entries and six Fieldwork records are source-labeled, using local image assets. Fieldwork is not a verified live feed; archive capture dates remain unknown. The Client Portal is removed from the public navigation and route generator; its earlier HTML/sample brief are preserved under `_preserved-portal`, while the production portal remains entirely separate. Mobile Safari physical-device verification remains outstanding (WebKit is not available in the automated QA environment; Safari-specific handling is listed in `navigation-validation.json`).

Original Astra ZIP and Opus's separate GitHub branch were not modified.
