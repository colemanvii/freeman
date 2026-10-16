# Freeman / agent rules

Before changing any visual or functional interface, read `DESIGN-DOCTRINE.md` and `FREEMAN_DESIGN_STANDARD.md`.

## Actual production source
Cloudflare Pages project `freeman`, production benchmark commit `a1f39b3ff40c33007304fbf8a130839eae37c1e3` (October 16, 2026). Output `v5/`, generator `v5-source/generate.py`.

**Do not use root `index.html`, `styles.css`, or `portal.html` as production authority.** Production V5 uses `v5/styles.css` tokens: paper `#f4f4f0`, ink `#30312f`, muted `#8e918c`, hair `#cfd1cb`, orange `#f05a28`; Monaco-based monospace.

The palette system is `v5/palette.js` (chalk/sand/umber; sessionStorage `freeman-palette`). Role systems use `v5/portal-identity.css` loaded by `v5/client-access.html` and `v5/team-os.html`. Reuse these rather than inventing new palettes or global overrides.

## Mandatory principles
- **Continuity before novelty**: preserve authored early-digital / printed-institutional character, roughly 1994; quiet UI, true field evidence, restrained orange.
- Preserve interaction grammar: crosshair cursor, whole-word hover, navigation/back/close, keyboard focus and chosen palette persistence.
- Flat rectangular composition, structural hairlines and evidence-led content, not floating rounded SaaS cards, glossy gradients, or unrelated fonts.
- Don't add dummy real-world statuses or imply demonstrations grant account access.
- Preserve mobile functionality and readability; fixed-viewport character must not conceal controls.
- Inspect generated and source code before modifying, and regenerate only with the canonical workflow.
- Do not claim deployment success without Cloudflare evidence and visual desktop/mobile QA.
- Keep changes small and reviewable, and never redesign the approved public landing page without explicit instruction.
