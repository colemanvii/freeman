# Helvetica Neue 001

One focused type study of the current site (cut from `origin/release/approved-v5-2026-10-18` at 868cafb).
Content, photography, navigation, the pixel signature, colorways, crosshair and orange are unchanged.

- `v5/helvetica.css` — the whole study, loaded after `styles.css` on every page that uses it.
  It points `--mono` at Helvetica Neue, so every existing rule changes family, then sets
  one scale (11 label · 13 text · 16 reading · 34 title · 48 headline; titles step down once on phones)
  and two weights (400 reading, 500 names and actions).
- `v5/studies/helvetica-001/` — comparison sheet, current vs study, desktop 1440×900 and phone 390×844.
- `serve.py` — local preview with Pages-style clean URLs: `python3 serve.py 8845 ../../v5`.

Not covered: MAP, team-os, client-access and working-with-freeman have their own stylesheets and keep
Monaco. Helvetica Neue is a system font on Apple devices only; elsewhere the stack falls to Helvetica,
then Arial. Shipping it everywhere would need a licensed webfont.
