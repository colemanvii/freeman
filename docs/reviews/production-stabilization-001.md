# Freeman / Production Stabilization 001

Status: implementation verified locally; commit and branch push authorized for review.
No merge or deployment authorized. The publication commit uses `[CF-Pages-Skip]` to skip Cloudflare Pages deployment.
Branch: `fix/production-stabilization-001`.
Base: `release/approved-v5-2026-10-18` at `211968ba39b88821f4568692d2ce98dfedd55fdc`.

## Production verification

On 19 October 2026, fetched the named release directly from GitHub. Compared the live
`https://www.freemangc.com/` responses byte-for-byte with the release's `v5/` files:
`app.js`, `styles.css`, `records.js`, `company.html`, `projects.html`, `index.html`, and
`palette.js` all matched. This verifies the public implementation relevant to this change;
no Cloudflare production configuration was modified.

## Changes

- `v5/app.js`: separate desktop/mobile index scroll positions; preview photograph and closed-preview
  state saved with the index history entry; mobile project selection carried to the desktop preview;
  media-query lifecycle cleanup; debounced scroll history writes and page-hide persistence.
  Company tabs now control the actual tab panel, which is labelled by the active tab. Roving tab
  focus, arrow/Home/End keys, and in-place People updates preserve keyboard focus. Detail updates
  have a polite announcement region. Existing Company text is unchanged.
- `.github/workflows/qa.yml`: adds the actual production release branch to QA PR/push filters,
  retaining consolidation/fix coverage. Replaces the obsolete V4 portrait/preview smoke test with
  the production stabilization suite. No deployment step or deployment workflow was changed.
- `README.md`, `v5-source/README.md`, `qa/README.md`: reconcile the current production branch,
  source/output directories, legacy GitHub Pages distinction, and verification instructions.
- `qa/production-stabilization-001.py`: current-production browser regression and optional
  pixel-comparison suite.
- `docs/reviews/production-stabilization-001.md`: this review and verification record.

No stylesheet, project content, Company copy, generated HTML, Fieldwork, conversation study,
asset, animation or deployment configuration was changed. `.github/workflows/pages.yml` is unchanged.

## Results

- JavaScript syntax and `git diff --check`: pass.
- Stabilization suite: **29/29 pass**, including 20 pixel-identical baseline comparisons.
- Company keyboard/tab relationships/selection/focus and resize: 1440×900, 390×844, 320×568,
  and 844×390.
- Projects: desktop CLOSE, Back/Forward, reload, repeated 760/761 breakpoint crossings,
  independent mobile/desktop scroll, preview photograph restoration, mobile project selection
  followed by desktop return, and persistent closed preview. No browser script errors.
- Visual comparison: Company Philosophy/Services/People, Projects, and The Optimist detail at
  all four viewport sizes. Original release JavaScript and changed JavaScript were served against
  identical local release assets. Screenshots matched byte-for-byte after images decoded.
- Existing public-navigation suite: **223/229 pass**. The untouched release produces the exact
  same result JSON. Six failures concern overlapping section-navigation hit areas at 320×454
  and 375×553 on Projects, Beetlecat, and Contact.
- Existing homepage suite: fails `indicator drawn` on both untouched release and changed build.
  The test expects a solid selected-colorway outline; production CSS explicitly suppresses it.
  This historical test/design mismatch was not masked or changed.

The wider CI suite therefore is not fully green. The known mobile hit-area issues and homepage
assertion need separate decisions. Physical Safari/iPhone/iPad and assistive-technology testing
remain outstanding; these checks used Chromium. Private access/OS features were not changed or
retested in this narrowly scoped assignment.

## Reproduce locally

From this checkout, with Node and Python available:

```sh
python3 -m venv /tmp/freeman-stabilization-test-env
/tmp/freeman-stabilization-test-env/bin/pip install playwright==1.60.0
/tmp/freeman-stabilization-test-env/bin/python -m playwright install chromium
npx wrangler@4.151.1 pages dev v5 --port 8788 --ip 127.0.0.1
```

Keep the local server running. In a second terminal in the same checkout:

```sh
/tmp/freeman-stabilization-test-env/bin/python qa/production-stabilization-001.py http://127.0.0.1:8788 --visual
/tmp/freeman-stabilization-test-env/bin/python qa/public-navigation-qa.py http://127.0.0.1:8788 qa/results/stabilization-public-navigation.json
```

Open `http://127.0.0.1:8788/projects`. Select Beetlecat, advance the preview, scroll the register,
open the project, and use CLOSE. Resize across 760px and repeat in the mobile list. At
`http://127.0.0.1:8788/company`, keyboard-focus Philosophy, use arrows/Home/End, then tab into
People choices and select with Enter/Space. Focus should remain on the selected control.

Tests do not submit the contact form. Wrangler is a local emulator; do not run any deploy command.
