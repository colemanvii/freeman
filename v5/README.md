# Freeman GC — V5 Fieldwork / fixed-screen site

Four public destinations: **Freeman GC / Projects / Fieldwork / Contact**.

Based on Astra's fixed-viewport edition, with no page scrolling and record-by-record previous/next navigation. Crosshair cursor and instantaneous orange word highlights (no underlining animation).

## Preview

Open `index.html` or run `python3 -m http.server 8765` from this folder. No build step or external dependencies.

## Edit

Edit `content.json`, then run `python3 generate.py` to refresh route entry points and `records.js`. Every route (including Fieldwork) uses the same generated shell. App logic and navigation are in `app.js`, the Fieldwork living index in `fieldwork-reader.js`; visual rules in `styles.css` and `fieldwork-reader.css`.

## Navigation

Every route is a real file (`company.html`, `project-<slug>.html`, `fieldwork-<slug>.html`, …), so deep links and refreshes need no server rewrites. After the first load, links are handled in place with the History API, so nothing resets between visits (palette, Fieldwork filters and list position, opening state).

- **Entrance (`index.html`) is shown once.** Leaving it replaces its history entry; no interior link points back to it, and browser Back from the first interior page leaves the site rather than returning to the centered screen. The red eagle plays on entry (once per tab session, never on Back/Forward).
- **One section line on every interior page.** `FREEMAN GC / PROJECTS / FIELDWORK / CONTACT` sits top-left everywhere (current section in orange), and the four sections link to each other directly — nothing routes through FREEMAN GC.
- **FREEMAN GC is the company page** — an editorial reading page about Freeman, paginated like the project records.
- **× CLOSE / Escape appear only on detail pages** and return to the parent section: Project → Projects (that project highlighted and focused); Fieldwork record or note → Fieldwork index (filters, list position and record kept). Top-level sections have no CLOSE.
- **Fieldwork** filters live in the URL (`fieldwork.html?category=Observation`); records step with ↑ ↓ (or ← → on a record) and name their connected project.
- Palette choice travels in `history.state` (survives reloads without sessionStorage); the entrance always starts in off-white.

QA: `python3 tools/navigation-qa.py http://localhost:8765/v5/` (Playwright/Chromium) checks the rules above, back/forward/refresh/deep links, and layout and 44px touch targets at 375×667, 390×844, 430×932, 1280×720, 1440×900 and three landscape phone sizes. Results: `navigation-validation.json`.

## Content and limitations

Nine project entries and six Fieldwork records are source-labeled, using local image assets. Fieldwork is not a verified live feed; archive capture dates remain unknown. The Client Portal is removed from the public navigation and route generator; its earlier HTML/sample brief are preserved under `_preserved-portal`, while the production portal remains entirely separate. Mobile Safari physical-device verification remains outstanding (WebKit is not available in the automated QA environment; Safari-specific handling is listed in `navigation-validation.json`).

Original Astra ZIP and Opus's separate GitHub branch were not modified.
