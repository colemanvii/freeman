# QA

Playwright (Chromium) suites for the production site in `v5/`. Run them against a server that
behaves like Cloudflare Pages (redirects, extensionless URLs):

```bash
npx wrangler pages dev v5 --port 8788
python3 qa/access-alder-qa.py http://127.0.0.1:8788 qa/results/access-alder.json
python3 qa/public-navigation-qa.py http://127.0.0.1:8788 qa/results/public-navigation.json
python3 qa/public-visual-diff.py https://freeman-d6f.pages.dev http://127.0.0.1:8788
```

| Suite | Covers |
|---|---|
| `access-alder-qa.py` | ACCESS: every role/step deep link, invalid and outdated links, Back/Forward/refresh, in-page BACK, CLOSE, keyboard, focus, announcements, codes, layout at 10 viewports, touch targets, contrast. Alder (withdrawn): every proposal path is 404, the ALDER code is not recognized, no Alder reference in the ACCESS source. |
| `public-navigation-qa.py` | Every public route directly; entrance → Projects → project → refresh → CLOSE; Back/Forward; direct-arrival CLOSE; Fieldwork withdrawn (no link or label on any public page, every old URL 302 → /projects, reader/images not served); `records.js` carries no unpublished fields; contact form present (never submitted); internal source files are not served. |
| `freemangc-v4-home-qa.py` | V4 entrance: the original 2,278-pixel script assembles on arrival and is finished on Back/Forward and with reduced motion; integer device-pixel scale on a device-pixel boundary; script, navigation and squares on one axis; Light / Dark / Freeman order, swatch colours, page and script colour, selected indicator; colorway change and resize never restart the animation; selecting the script replays it. |
| `production-stabilization-001.py` | Production Company tab relationships and keyboard focus; Projects history, scroll and preview restoration across desktop/mobile breakpoints. |
| `company-mobile-qa.py` (legacy study only) | Company: the photograph frame is identical across PHILOSOPHY / SERVICES / PEOPLE, stays inside its row and never covers the tabs (375×667 to 1440×900); a viewport resize keeps the selected tab. Every generated route loads the same `app.js` build. |
| `public-visual-diff.py` | Pixel comparison of public pages between two deployments, to prove a change left them untouched. |

CI targets pull requests and pushes to `release/approved-v5-2026-10-18` and the retained
`freeman-v5-consolidation` branch, plus pushes to `fix/**` (`.github/workflows/qa.yml`).
This is validation only; deployment triggers and production settings are unchanged.
The old `freemangc-v4-qa.py` and `company-mobile-qa.py` assert a removed Company portrait
and outdated preview geometry; they are historical study checks, not release acceptance checks. `v5-source/tools/navigation-qa.py` is superseded: it predates the approved
Projects index and current CLOSE behaviour.

## Production Stabilization 001

Run `python qa/production-stabilization-001.py http://127.0.0.1:8788 --visual` against a local
Pages emulator. The optional visual check compares the verified release baseline's JavaScript
with the current code at four desktop/mobile/landscape sizes.

See [the verification record](../docs/reviews/production-stabilization-001.md) for setup,
production verification, and baseline failures. Public navigation currently has six existing
small-screen hit-area failures; the homepage suite has a selected-indicator assertion that
also fails on the unchanged release. These checks remain visible in CI; this assignment does
not change their visual rules or mask their failures.
