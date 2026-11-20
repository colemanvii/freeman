# FREEMANGC / V4 — Build contract

Date: 2026-10-16
Development branch: `feature/freemangc-v4-20261016`
Production: **DO NOT MERGE UNTIL APPROVED**.

## Direction from Gabe / Cole
- One Freeman identity. Monaco, fine rules, precise asymmetry, negative space; no cards, gradients or invented technical ornament.
- Desktop and mobile do not have to mimic one another; make each intentional.
- **COMPANY FIRST**. Static one-viewport composition with internal views PHILOSOPHY / SERVICES / PEOPLE. Philosophy is default; selected employee can change portrait and bio in a stable frame. Gabe is the initial People selection.
- **PROJECTS SECOND**. Desktop: compact project name index beside selected project imagery, photo prev/next and a full project gallery link. **Preserve the previously approved simple mobile Projects index**.
- **HOME THIRD**. Explore approved bitmap/monogram treatment; do not replace the existing entrance until a logo asset and colorway study are accepted.
- Colorways: warm white/ink, Freeman tan, warm-dark inverse with restrained red emphasis. Brand reference: Freeman GC Brand Guidelines 1.0 (Feb 2025), `#FFF9F1`, `#332E20`, `#DDCFB3`, `#F93822`.
- Do not change publicly deployed `freemangc.com` in this branch.

## In V4 so far
- `v5/app.js`: new COMPANY view modes; inline SERVICES selectors; PEOPLE state for Gabe Freeman, Cameron Dombi, Mac Thompson and Jimmy Jennings; photography on philosophy/services, typographic portraits explicitly marked pending instead of inventing images.
- `v5/styles.css`: standalone desktop/mobile compositions using the shared Freeman CSS tokens and fixed page frame.
- `v5/app.js`: desktop PROJECTS preview with project record photos, next/prev controls and open-full-gallery actions; existing mobile list remains in markup and visible at phone breakpoints.
- `v5/palette.js`, `v5/portal-identity.css`, `v5/styles.css`: palette constants reconciled with brand guidelines; ACCESS must stay visually continuous.
- V4 browser checks are in `qa/freemangc-v4-qa.py` and PR #52.

## Pending before release
- Real approved headshots and biographies (none fabricated).
- Final homepage bitmap logo file / animation from approved mark; evaluate reduced-motion mode.
- Desktop and phone visual review, navigation QA and accessibility QA all green.
- Regenerate route HTML from `v5-source/generate.py` and change app cache version together before release (no partial generated artifacts).
- Review project-photo crops and full gallery behavior across aspect ratios.
- Final signoff, then production merge; no changes to Freeman OS feature scope.

## Freeman OS
Preserve existing OS code. New objective: company-level state of the union, Monday meeting view, real two-week lookahead, revenue target ($12M annual), pay-application-to-payment cycle, and leadership attention. Resume data-driven development only after Procore/Ramp/QuickBooks/Claude integration plan and actual authoritative data are agreed.
