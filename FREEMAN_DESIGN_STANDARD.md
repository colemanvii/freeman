# FREEMAN / VISUAL STANDARD 003
## One firm. One visual language. Many instruments.
**Authority:** Cloudflare Pages production benchmark, commit `a1f39b3ff40c33007304fbf8a130839eae37c1e3` (October 16, 2026).
**Status:** Source-grounded policy; screenshot/browser acceptance still pending.

## 01 / Identity

Continuity before novelty. Freeman is an authored, circa-1994 early-digital and printed-institutional visual system: precise Monaco-based typography, deliberate composed surfaces, restrained orange, functional hairlines, authentic field evidence. It is neither a luxury architecture template nor a conventional SaaS dashboard. The work is the brand. The result proves taste; the evidence proves capability.

Read `DESIGN-DOCTRINE.md` for the primary philosophical guardrails.

## 02 / Production code map

Cloudflare Pages project `freeman` serves `freemangc.com`, `www.freemangc.com`, and `freeman-d6f.pages.dev` per screenshot of Cloudflare Deployments. The confirmed production commit is `a1f39b3` (merge PR #45).

- `v5/` — published output; `v5-source/generate.py` — generator.
- `v5/styles.css` — authoritative public-site CSS.
- `v5/palette.js` — pre-paint palette selection.
- `v5/portal-identity.css` — shared role/OS identity styles.
- `v5/client-access.html` — client/architect/trade access pathways.
- `v5/team-os.html` — internal Freeman OS.
- `v5-source/alder/` — proposal study sources; assess its own frozen approved benchmark separately.

The root `index.html`, `styles.css` and `portal.html` are **legacy/alternate surfaces**, not production V5 standards. Do not derive universal brand tokens from them.

## 03 / Exact source tokens (confirmed in the production commit)

From `v5/styles.css`:

| Token | Value |
| --- | --- |
| `--paper` | `#f4f4f0` |
| `--ink` | `#30312f` |
| `--muted` | `#8e918c` |
| `--hair` | `#cfd1cb` |
| `--orange` | `#f05a28` |
| `--mono` | `Monaco, "SFMono-Regular", Consolas, "Liberation Mono", monospace` |

These values are **verified in source**. Browser-computed font selection, actual deployment file contents, and full desktop/mobile rendering are not independently verified here.

The site's crosshair and orange interactive cursor, whole-word orange hover, fixed-viewport layouts, sharp rules, small metadata, and limited motion are purposeful identity features. Don't replace them with generic default components.

## 04 / Palette continuity

`v5/palette.js` selects `chalk`, `sand`, or `umber` using sessionStorage key `freeman-palette`, applies `data-palette` before paint, and adjusts `theme-color`.

- Chalk: `#f4f4f0`
- Sand: `#d9c5a7`
- Umber: `#51453b`

Palette tokens for each surface must map to the same named selection, including route changes, Team OS and Access. Don't force a return to white/chalk when navigating to a portal.

Both `v5/client-access.html` and `v5/team-os.html` already import `v5/portal-identity.css`. Extend the existing structure, rather than layering another unrelated portal CSS theme.

## 05 / Non-negotiable rules

1. The approved public V5 aesthetic is the benchmark; no separate portal or proposal brand.
2. One Monaco-centered typographic voice, hierarchy by scale, position, line breaks, and spacing.
3. Orange is punctuation: selected elements, active state, precise visual signals.
4. Compose surfaces like institutional plates and working instruments; avoid decorative cards, pills, gradients, floating layers and shadows.
5. Keep all metadata true; no invented construction status, dimensions, coordinates, or client activity.
6. Preserve navigation/back/close semantics, keyboard focus, touch, responsive legibility, and palette persistence.
7. Design for functional clarity: clients need decisions/documents/progress; architects need drawings/RFIs/submittals; partners need scope/schedule/updates; internal teams need assignments/risks/actions. Information architecture may differ, identity may not.
8. Protect the existing public experience. Do not change landing page visuals without explicit approval.
9. The script brand mark may be a secondary artifact, but must be tested in its actual context, not made into a new interface font.
10. Distinguish code-verified facts from visual estimates, proposals and future work.

## 06 / QA before any merge

- [ ] Check the Cloudflare deploy SHA and Pages build output path.
- [ ] Compare live V5 screenshots on desktop, laptop and mobile with review builds.
- [ ] Confirm chalk/sand/umber continuity across public → Access → Team OS and reload.
- [ ] Test hover, crosshair cursor, keyboard, touch and history/navigation.
- [ ] Test all role pathways and ensure illustrative flows do not claim actual account access.
- [ ] Review no-scroll behavior for clipping and small-screen accessibility.
- [ ] Verify functional data and proposal contents are approved rather than placeholders.
- [ ] Record differences and sign off on the proposed change before merge.

## 07 / Precedence

1. User-approved live V5 plus separately approved frozen proposal benchmarks.
2. `DESIGN-DOCTRINE.md`.
3. `v5-source/` generation workflow and the shared V5 CSS/palette system.
4. Surface-specific files as reconciled against the above.
5. Historical root pages and experiments.
6. Generic design advice, never overriding the above.

**No production deployment or visual regression check is implied by committing this document.**
