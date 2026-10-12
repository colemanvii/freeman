# Freeman Editorial — Recovery & Content Integration Brief
Date: 2026-10-12
Status: Ready for Opus audit / Astra implementation

## Governing decision
Use `design-previews/editorial-working.html` as the working visual direction. Preserve `design-previews/v1.html` as the original reference. Do not redesign the homepage, overwrite `index.html`, or remove preserved branches. V1 and V2 are a single editorial direction.

## Source of truth
- Published business information, copy, projects, and photographs: https://www.freemangc.com/
- Current projects index: https://www.freemangc.com/projects
- Existing GitHub repo: https://github.com/colemanvii/freeman
- Existing editorial working file: `design-previews/editorial-working.html`
- V1 preserved original: `v1-archive`
- Already-built archive: `archive/index.html`
- Existing client portal: `portal.html`
- Existing project record: `record.html`
- Existing field notes: `field-notes.html`

## Confirmed project names (published projects index)
1. Beetlecat — Rocket Farm Restaurants
2. The Optimist — Rocket Farm Restaurants
3. Barnsley Gardens — Barnsley Resort
4. Bocado Pizza
5. Savi Provisions
6. O-Ku Atlanta
7. LaCresta on Main
8. Cleveland Surgery Center
9. Dalton Surgery Center — Interventional Pain Consultants

## Critical recovery finding
The standalone Editorial HTML includes containers for `#projects`, `#company`, `#archive`, and `#contact`, but the HTML does not visibly define the original project data array or the full view-controller setup. Verify whether these were lost when the preview was copied. Recover missing logic from the original preserved branch and any relevant older branches, rather than replacing the interface wholesale.

## Opus audit — acceptance criteria
1. Map every existing page/view, script, stylesheet, data source, internal link, and branch with relevant work.
2. Identify exact broken/missing dependencies in `editorial-working.html`.
3. Compare all nine projects, their names, project copy, photos, locations, clients, and credits against the published Freeman site; label missing/unconfirmed values.
4. Flag any unsupported invented testimonials, imagery, client endorsements, or project claims in the current working copy.
5. Produce a concise ordered repair list with file paths and confidence level. Do not write a fresh design.

## Astra implementation — acceptance criteria
1. Work on a new focused development branch; don't touch protected baseline or `main/index.html`.
2. Restore original navigation (Projects / Company / Archive / Contact), view switching, project selection, gallery rendering, and responsive styles.
3. Populate projects using verified current-site copy and assets. Do not invent content.
4. Preserve the Editorial visual design (Baskerville headline, pale canvas, architectural photography, brand red).
5. Keep the existing Archive, Field Notes, Project Record, and Client Portal resources intact; integrate thoughtfully, with working navigation.
6. Treat Contact as nonfunctional until submission is properly implemented and tested. Never imply messages are sent when they are not.
7. Test desktop (1440px+) and mobile (390px). Capture screenshots of every section and list known issues.
8. Present preview and diff for approval before any merge/deployment.

## Initial release priority
Projects first: all nine indexed and browsable, accurate source copy, no blank panels or broken images. Then Company, Archive, Contact, and integrations.

## Non-goals
No rebrand, no new conceptual direction, no automated rewriting of approved copy, no new repository, no live homepage replacement without explicit approval.
