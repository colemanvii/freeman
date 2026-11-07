# The Record — Discovery 003

Isolated iteration on top of the public Record release. **Production is not changed by this branch.**

## Intent
Make curiosity pay off immediately without turning the geographic interface into an advertisement.

- Hover or keyboard-focus a specific mapped project or its register row on desktop: a restrained image proof appears using the existing Freeman project gallery. No fake photos, dates or stories.
- Move away or open the full project: the preview disappears. The existing project sheet, map position/history, cluster callouts, and image viewer stay intact.
- Remove the "Years on file: 0" and "Checked" counters from the title block; retain the honest two-value summary of projects and mapped sites. The empty timeline remains hidden; data is not deleted.
- Give long project names and their locations more breathing room in the desktop register.
- Touch devices: keep the original one-thumb register and project sheets, no photo tooltip over a map.

## Test
\`qa/record-discovery-003-qa.py\` runs in the \`record-discovery-003.yml\` CI workflow with Wrangler and Playwright: desktop preview, a real Beetlecat record and image gallery, no-image fallback, zoomed map red-fill regression, mobile register and project, horizontal overflow, JavaScript exceptions. Screenshots are retained in the Actions artifact.

The legacy generalized QA pipeline currently fails on several historical app suites (including public navigation). Its status should be reviewed separately; **the targeted Record browser suite must pass before this study is released.**

## Evidence integrity
Everything comes from \`v5/records.js\`, the existing public register. No new external images are pulled and no dates or coordinates are inferred.

## Implementation note
Only \`v5/record-assets/record.js\`, \`v5/record-assets/record.css\`, and the version query strings on \`v5/record.html\` are changed for the interface.
