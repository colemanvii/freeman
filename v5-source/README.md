# Freeman GC — V5 Fieldwork / fixed-screen site

> **Layout.** `v5/` is the Cloudflare Pages output and contains only files served to visitors. Sources and tooling live here in `v5-source/` and are never deployed: edit `v5-source/content.json`, then run `python3 v5-source/generate.py` (it writes the route files and `records.js` into `v5/`). QA lives in `qa/` (see `qa/README.md`); `tools/navigation-qa.py` here is superseded.

Current public destinations: **Company / Projects / Contact**.

Production branch: `release/approved-v5-2026-10-18`; Cloudflare output: `v5/`.
The navigation and preview descriptions below include historical implementation notes.
Use the current `v5/app.js` and release QA as the authority for runtime behavior.

> **Public build (14 Oct 2026).** Fieldwork is withdrawn from the public site while it is developed: `python3 generate.py` builds Company / Projects / Contact only, ships no Fieldwork pages, reader, images or records, and old Fieldwork URLs 302 to `/projects` (`v5/_redirects`). Its reader and images live in `fieldwork/`; `python3 generate.py --fieldwork` builds the full site into `v5/` for local work (never deploy that build; run the plain command before committing). `records.js` carries only the fields the pages render; budgets, square footage, completion years, quotes and scraped URLs stay in `content.json`. The Alder proposal is kept in `alder/`, not deployed.

Based on Astra's fixed-viewport edition, with no page scrolling and record-by-record previous/next navigation. Crosshair cursor and instantaneous orange word highlights (no underlining animation).

## Preview and edit

From the repository root, run `npx wrangler pages dev v5 --port 8788 --ip 127.0.0.1`.
This emulates production's extensionless routes and redirects locally. See `qa/README.md`.

For a separately approved content change, edit `v5-source/content.json`, then run
`python3 v5-source/generate.py`. The generator rewrites public route shells and `records.js`.
Application logic is edited in `v5/app.js`; shared presentation in `v5/styles.css`.
Do not run the generator merely to preview an application-logic change.

## Current navigation

- Entrance: the Freeman pixel script, Company / Projects / Contact, Access, and colorways.
- Company: Philosophy / Services / People within the existing editorial frame.
- Projects: desktop register and selected-photo preview; mobile uses the stacked index.
- Project details: existing gallery or paged project record, according to the available content.
- CLOSE and browser Back return through the actual visit history. Direct-arrival CLOSE returns
  to the entrance. Project preview image and list positions belong to their index history entry;
  desktop and mobile keep independent scroll positions across breakpoint changes.
- Fieldwork remains unpublished. Its source reader, images and records stay under `v5-source/`.
- Palette selection persists through the existing application shell.

## Validation

`qa/production-stabilization-001.py` checks Company keyboard navigation and focus plus
Projects state restoration, including 760/761px breakpoint crossings. The optional `--visual`
comparison uses the production baseline's JavaScript to check unchanged views pixel-for-pixel.
See `qa/README.md` for the retained public-navigation and homepage suites and their limitations.

## Content and limitations

Fifteen project entries and six unpublished Fieldwork records are source-labeled, using local image assets. Fieldwork is not a verified live feed; archive capture dates remain unknown. The Client Portal is removed from the public navigation and route generator; its earlier HTML/sample brief are preserved under `_preserved-portal`, while the production portal remains entirely separate. Mobile Safari physical-device verification remains outstanding (WebKit is not available in the automated QA environment; Safari-specific handling is listed in `navigation-validation.json`).

Original Astra ZIP and Opus's separate GitHub branch were not modified.
