# Freeman GC — V5 Fieldwork / fixed-screen site

> **Layout.** `v5/` is the Cloudflare Pages output and contains only files served to visitors. Sources and tooling live here in `v5-source/` and are never deployed: edit `v5-source/content.json`, then run `python3 v5-source/generate.py` (it writes the route files and `records.js` into `v5/`). QA lives in `qa/` (see `qa/README.md`); `tools/navigation-qa.py` here is superseded.

Four public destinations: **Company / Projects / Fieldwork / Contact**.

> **Public build (14 Oct 2026).** Fieldwork is withdrawn from the public site while it is developed: `python3 generate.py` builds Company / Projects / Contact only, ships no Fieldwork pages, reader, images or records, and old Fieldwork URLs 302 to `/projects` (`v5/_redirects`). Its reader and images live in `fieldwork/`; `python3 generate.py --fieldwork` builds the full site into `v5/` for local work (never deploy that build; run the plain command before committing). `records.js` carries only the fields the pages render; budgets, square footage, completion years, quotes and scraped URLs stay in `content.json`. The Alder proposal is kept in `alder/`, not deployed.

Based on Astra's fixed-viewport edition, with no page scrolling and record-by-record previous/next navigation. Crosshair cursor and instantaneous orange word highlights (no underlining animation).

## Preview

Open `index.html` or run `python3 -m http.server 8765` from this folder. No build step or external dependencies.

## Edit

Edit `content.json`, then run `python3 generate.py` to refresh route entry points and `records.js`. Every route (including Fieldwork) uses the same generated shell. App logic and navigation are in `app.js`, the Fieldwork living index in `fieldwork-reader.js`; visual rules in `styles.css` and `fieldwork-reader.css`.

## Navigation

Every route is a real file (`company.html`, `project-<slug>.html`, `fieldwork-<slug>.html`, …), so deep links and refreshes need no server rewrites. After the first load, links are handled in place with the History API, so nothing resets between visits (palette, Fieldwork filters and list position, opening state).

- **Entrance (`index.html`).** An orange FREEMAN GC (same Monaco, size and baseline as the navigation; not a link) leads the navigation; brand and links centre as one group, stacked on phones. The red eagle plays on the first load of a tab session (never on Back/Forward). The entrance stays in history, so Back from the first interior page returns to it.
- **One section line on every interior page.** `COMPANY / PROJECTS / FIELDWORK / CONTACT` sits top-left everywhere (current section in orange), and the four sections link to each other directly. The entrance uses the same four labels. FREEMAN GC is the brand and is never a link.
- **PROJECTS is the map** (`map.html`, `record-assets/`; 26 Oct 2026). The former index (`/projects`) 301s to `/map`. Partner credits and links for the map and the project pages live in `v5/project-credits.js`. See `studio/map-projects-001/README.md`.
- **Project galleries** (Beetlecat, The Optimist, Barnsley Gardens): one photograph at a time beside the name, place and verified credits, with `← 01 / 03 →` centred beneath. Click the photograph's left/right half, use ← → or swipe (touches starting at the screen edge are left to the browser's swipe-back); 280 ms slide, none with reduced motion. Photos are never enlarged beyond natural size. Originals from Freeman's published portfolio are kept byte-for-byte in `assets/projects/`. Other projects keep the paged layout.
- **COMPANY is the company page** — one static view (no sheets): headline, a short introduction, services, Gabe Freeman (President) and Cartersville, Georgia. Only very small phones scroll it slightly; text is never shrunk to force a fit.
- **× CLOSE is real history.** Every interior page has exactly one `× CLOSE`, upper right on the section line (the original V5 component); there is no footer BACK, and the entrance has none. Escape does the same on project and Fieldwork detail pages. It behaves exactly like browser Back, trackpad and mobile swipe-back: it returns to wherever the visitor came from. Each history entry stores its depth within the visit; on a direct arrival (no earlier same-site page) CLOSE falls back to the entrance. Leaving a page saves its view state into its own history entry — selected project, Fieldwork scroll and record, Company sheet — so returning restores it. There is no custom swipe handling outside the project galleries, whose swipes ignore touches starting at the screen edge.
- **PREV / NEXT** only appear when a page has more than one sheet.
- **Fieldwork** is a photographic log: one list of compact rows (thumbnail / title + project). A date and time appear only when a record carries a genuine one; current records have none, so none are shown. Records keep their own pages; ↑ ↓ (or ← →) step between them, each step its own history entry so CLOSE and browser Back retrace them. Local notes remain reachable at `fieldwork.html?note=new`.
- Palette choice travels in `history.state` (survives reloads without sessionStorage); the entrance always starts in off-white.

QA: `python3 tools/navigation-qa.py http://localhost:8765/v5/` (Playwright/Chromium) checks the rules above, back/forward/refresh/deep links, and layout and 44px touch targets at 375×667, 390×844, 430×932, 1280×720, 1440×900 and three landscape phone sizes. Results: `navigation-validation.json`.

## Content and limitations

Nine project entries and six Fieldwork records are source-labeled, using local image assets. Fieldwork is not a verified live feed; archive capture dates remain unknown. The Client Portal is removed from the public navigation and route generator; its earlier HTML/sample brief are preserved under `_preserved-portal`, while the production portal remains entirely separate. Mobile Safari physical-device verification remains outstanding (WebKit is not available in the automated QA environment; Safari-specific handling is listed in `navigation-validation.json`).

Original Astra ZIP and Opus's separate GitHub branch were not modified.
