# FREEMAN — VISUAL STANDARD / 003
## Repository-grounded system audit · 16 October 2026

**Status:** PROPOSED STANDARD — grounded in `main` repository source, **not yet verified against live production deployment or all responsive renders**.

**Primary authority:** `DESIGN-DOCTRINE.md` (locked October 4). The root `index.html` and its inline CSS are the current repository entrypoint reference. Do not treat older `styles.css` values as active homepage tokens without checking which page imports them.

## 01 / Definition

Freeman is an authored, early-digital / printed-institutional identity with a 1994 sensibility: quiet interface, rich content, industrial precision, real field evidence, and deliberate typographic composition. It should feel culturally specific, not like a luxury architecture template or a generic SaaS dashboard.

**CONTINUITY BEFORE NOVELTY.** The work is the brand. The result proves taste; the evidence proves capability.

## 02 / Verified source observations

### Root entrypoint: `index.html` (inline CSS)
- Typeface: `Monaco, "Courier New", monospace`. **VERIFIED IN SOURCE**, not verified as the computed rendered font on every visitor device.
- `--paper: #f4f4f1`; `--ink: #242424`; `--muted: #777873`; `--slash: #a4a49f`; `--accent: #e75a28`. **VERIFIED IN SOURCE**.
- Full-viewport `.page` with absolutely positioned, centered `.nav`; baseline alignment, slash separators; size `clamp(16px,1.5vw,22px)`. **VERIFIED IN SOURCE**.
- Navigation is text rather than a 72px header bar. Footer metadata is at the bottom corners. Mobile breakpoint `720px` wraps nav and adjusts footer. **VERIFIED IN SOURCE**.
- Sound panel uses a `box-shadow` exception. **VERIFIED IN SOURCE**; do not claim all shadows are absent.

### Older/multi-page stylesheet: `styles.css`
- Different tokens: `--paper:#f4f5f1`, `--ink:#171813`, `--muted:#6d7068`, `--rule:#d4d7cf`, `--red:#ef3e23`. **VERIFIED IN FILE**, NOT homepage canon.
- Body uses Helvetica Neue; some headings use Baskerville. Several image areas have rounded corners; a mobile project button uses a pill radius. **VERIFIED IN FILE**. These demonstrate historical/alternate styles, not permission to carry them forward.
- Header grid height is 92px base / 96px desktop override **in this stylesheet**, not a verified root-entrypoint header height.

### Proposal study: `proposal-study.html`
- Typeface `Monaco, "Courier New", monospace`. Source tokens: paper `#eeebe4`, ink `#24211d`, muted `#847e75`, line `#ccc5ba`, accent `#e75b2c`.
- One-viewport chapter layout with asymmetric 38% / 62% columns, fine rules, labels, line-based rows, restrained orange. A proposal *study*, not an authenticated live client proposal.

### Client portal: `portal.html`, `portal.css`, `portal-business.css`
- `portal.html` imports both `portal.css` and `portal-business.css`, so later overrides matter.
- `portal-business.css` uses radial/linear gradients, rounded shells and panels, shadows, and green signal treatments. **VERIFIED IN SOURCE**.
- These are clear visual discontinuities relative to the rooted institutional/monospaced direction and should be audited in a separate code change, **not silently restyled here**.
- Portal content contains example project/status statements; **do not present those as verified live operations**.

### Existing doctrine
`DESIGN-DOCTRINE.md` is the controlling expression of identity. It specifically says the Freeman system should evoke early-digital/printed institutional design circa 1994, preserve characterful tensions, favor authored static compositions, use real evidence, and avoid generic architecture, hospitality, agency, brutalist, minimal, and SaaS templates.

## 03 / Design rules for future implementation

1. **Inspect the target entrypoint first.** Determine the HTML, linked stylesheets, inline styles, cascade order, breakpoints, and script-driven states before making changes.
2. **Honor the existing font.** Reuse the target's actual typographic system; the root page uses Monaco/Courier, NOT an inferred Inter/Neue Haas font.
3. **Never invent “verified” tokens.** Match the actual target context. Do not promote an old stylesheet, a standalone proposal study, or Gemini's guessed values into universal production tokens.
4. **Compositions are placed, not assembled.** Favor static, composed, rectangular screens and strong content hierarchy over stacks of floating widgets.
5. **Orange is punctuation.** Apply sparingly to state, references, or precise accents, using the target context's actual accent variable.
6. **Prefer hairlines and whitespace to decorative panels.** Avoid introducing pill buttons, shadows, gradients, rounded cards, or generic dashboards to new Freeman work.
7. **Preserve interactions.** Keep navigation, whole-word hover behavior where implemented, background/color-changing behavior where implemented, history/back logic, and mobile touch behavior. Measure rather than assume.
8. **Real evidence only.** Project numbers, dates, status, coordinates, and metadata must be grounded in Freeman records—not aesthetic cosplay.
9. **Function matters.** Proposals expose scope, price, schedule, approvals; team tools expose status, decisions, work, and access. More information density is fine; visual drift is not.
10. **No unrequested redesign.** New work must remain native to its existing visual family. The Freeman script mark may be explored as a genuine secondary identity artifact without changing the core text system.

## 04 / QA gates before merge

- [ ] Identify the actual production entrypoint and its deployed commit; compare rendered desktop and mobile to repository source.
- [ ] Capture CSS computed font family, font files, and final cascade values at representative elements.
- [ ] Confirm paper/ink/accent values *per surface*; resolve mismatches deliberately, not with one global override.
- [ ] Check entrance, interior pages, access links, portals, proposals, and Freeman OS for visual continuity.
- [ ] Test hover, keyboard focus, touch, back/close, color controls, and navigation states.
- [ ] Check desktop at wide and laptop widths plus mobile portrait; no unintended scroll or clipped content.
- [ ] Test accessible contrast/readability and dense tables/forms.
- [ ] Compare screenshots to approved benchmark; reject visual regressions.
- [ ] Review any secondary script/logo treatment in context.
- [ ] Distinguish authenticated/real project data from illustrative placeholders.

## 05 / Explicitly unresolved

- Whether `main` maps to `freemangc.com` production at this moment.
- Computed font files or browser-dependent monospace rendering on every platform.
- Final deployed design of every internal, client, architect, and trade-partner workspace.
- Production acceptance of the proposal-study CSS and script asset.
- Exact current live-site hover / cursor / color-control behavior.

Do not mark any of these VERIFIED without deployed commit inspection and browser testing.

## 06 / Precedence

1. The user's approved current live experience and specific frozen design benchmarks.
2. `DESIGN-DOCTRINE.md` and this source-grounded audit.
3. Current target page source and components.
4. Historical prototypes and experiments.
5. Generic design-system advice (never override the above).

**This document records observations and review constraints; it does not change application behavior.**


## 07 / Production authority — VERIFIED FROM CLOUDFLARE AND COMMIT

**Cloudflare Pages:** project `freeman` serves `freemangc.com`, `www.freemangc.com`, and `freeman-d6f.pages.dev`, per the deployment dashboard screenshot supplied October 16, 2026. Its production deployment is commit `a1f39b3ff40c33007304fbf8a130839eae37c1e3` (merge PR #45).

**Canonical source:** `v5/` is Cloudflare's output folder, generated from `v5-source/generate.py`. The top-level `index.html`, `styles.css`, and `portal.html` are not the current production V5 authority. Never build a production portal patch against those root files.

### Production tokens (V5 source, commit a1f39b3)
From `v5/styles.css`:
- `--paper: #f4f4f0`
- `--ink: #30312f`
- `--muted: #8e918c`
- `--hair: #cfd1cb`
- `--orange: #f05a28`
- `--mono: Monaco, "SFMono-Regular", Consolas, "Liberation Mono", monospace`
- custom crosshair and orange-interaction cursors, orange whole-word hover, mostly fixed-viewport compositions

These are **verified in the deployed commit's repository source**, not browser-computed results.

### Existing palette and identity infrastructure
- `v5/palette.js` reads sessionStorage key `freeman-palette` and sets `data-palette` before paint, including the document's theme-color. Values: `chalk` (`#f4f4f0`), `sand` (`#d9c5a7`), and `umber` (`#51453b`).
- `v5/portal-identity.css` defines shared identity tokens and palette variants for gated/role surfaces.
- Both `v5/client-access.html` and `v5/team-os.html` already load the shared identity file. Prefer improving this existing system and removing duplicated definitions through tested incremental changes, not introducing a parallel portal stylesheet.
- `v5/client-access.html` implements client/architect/trade-partner guided access; the copy marks pathways as demonstrations, not actual access provisioning.

### Corrected precedence
1. User-approved deployed V5 screens and explicitly frozen proposal benchmarks.
2. `DESIGN-DOCTRINE.md`.
3. The deployed V5 generator and shared identity implementation.
4. V5 page-specific code that needs harmonization.
5. Legacy root pages and discarded prototypes, for historical reference only.

### Next engineering acceptance gates
- Identify duplicated declarations between V5 root styles, ACCESS, and Team OS and consolidate safely without changing behavior.
- Preserve all three selected palette modes, crosshair cursor, whole-word hover, no-scroll composition where intended, and responsive usability.
- Verify at wide desktop, laptop, mobile portrait, touch, keyboard and reload/navigation palette persistence.
- Keep client/architect/trade access workflows and demos intact; ensure no fake data is represented as live.
- Visual compare against the production deploy before merging.

**One firm. One visual language. Many instruments.**
