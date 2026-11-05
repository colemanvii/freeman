# Freeman — Typography Study 001

Private study, 5 November 2026. Branch `study/typography-001`, cut from
`origin/release/approved-v5-2026-10-18` at 80bd97d (which freemangc.com serves byte-for-byte
on that date). No upstream. Production files are untouched; everything lives in this folder.

Open `/studies/typography-001/` on a local server rooted at `v5/` (clean URLs are not needed).
`?plate=<dir>.<plate>.<size>` renders one plate at 1:1, e.g. `?plate=cas.company.dk`
(dirs: mon dia nhg frk opt ssf cas cou · plates: home company register detail plate labels ·
sizes: dk ph lb).

- `index.html` — the study: audit, field, directions, side by side, finalists, recommendation, notes.
- `plates.css` — production compositions redrawn from measured geometry; one token block per direction.
- `study.js` — direction data, critiques, plate templates (production copy), live font checks, viewer.
- `signature.svg` — generated from the 160×61 bitmap in `pixel-mark.js`.

Fonts: OFL faces (Libre Caslon, Libre Franklin, Source Serif 4) from Google Fonts. ABC Diatype Mono
(trial) and Neue Haas Grotesk Text are loaded with `local()` from this Mac only — never embedded.
Optima and Monaco are Apple system fonts. Each direction reports in-browser whether its true face
is rendering.

Recommendation: F · Two Voices — Caslon for the voice, the Monaco Lineage mono for the record.
