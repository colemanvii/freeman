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
| `access-alder-qa.py` | ACCESS: every role/step deep link, invalid and outdated links, Back/Forward/refresh, in-page BACK, CLOSE, keyboard, focus, announcements, codes, layout at 10 viewports, touch targets, contrast. Alder: every chapter and interior link directly, in-place navigation, history, refresh, canonical URL, unknown chapter. |
| `public-navigation-qa.py` | Every public route directly; entrance → Projects → project → refresh → CLOSE; Back/Forward; direct-arrival CLOSE; Fieldwork; contact form present (never submitted); internal source files are not served. |
| `access-gate-test.mjs` | S3 gate: runs `functions/_middleware.js` in enforce mode with a local signing key; public paths open, confidential paths need a valid Access token. `node qa/access-gate-test.mjs [wrangler]` |
| `check-protection.sh` | From outside: previews require sign-in (S5) / confidential paths gated (S3). No credentials. |
| `public-visual-diff.py` | Pixel comparison of public pages between two deployments, to prove a change left them untouched. |

CI runs the first two on every push to `fix/**` and on pull requests into `freeman-v5-consolidation`
(`.github/workflows/qa.yml`). `v5-source/tools/navigation-qa.py` is superseded: it predates the approved
Projects index and current CLOSE behaviour.
