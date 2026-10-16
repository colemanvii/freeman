# Freeman agent instructions

Before editing any Freeman-facing UI:

1. Read `DESIGN-DOCTRINE.md` and `FREEMAN_DESIGN_STANDARD.md`.
2. Identify the *actual* target page, stylesheet cascade, deployed branch and accepted benchmark. Do not assume `styles.css` is the homepage source: `index.html` has inline CSS.
3. Continuity before novelty. Preserve Freeman's authored, early-digital / printed-institutional, circa-1994 quality, quiet interface and real construction evidence.
4. Reuse actual fonts, tokens, component styling and interaction patterns in the target. NEVER substitute Inter or guessed `#FBFBF9`/`#FF5500` constants based on an external aesthetic audit.
5. Avoid introducing rounded cards, decorative shadows, gradients, floating SaaS panels, generic UI kits or invented construction metadata.
6. New portals, proposals and team tools should be functional instruments, not visually separate brands. Do not break essential data density or accessibility.
7. Preserve navigation, focus, responsive behavior, hover and color controls. Screenshot-test against the existing approved surface before shipping.
8. Document observed deviations. Make minimal, reviewable edits. Do not redesign the landing page without an explicit request.

If unsure of what is deployed, say so and verify before claiming a production fix.
