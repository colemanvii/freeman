# Freeman GC / Private Proposal / Study 05 — Alder

Internal design preview. Alder is a fictional client; every figure, date, and role is illustrative.
Study 04 (`codex/proposal-live-studies:v5/proposals/studies/quiet-v4`) and the live V5 site are untouched.

- `data/alder.js` — the issue's content record (claim status, scope/budget/milestone/decision IDs, issue metadata)
- `app.js` — shell, router, chapter renderers; `styles.css` — layout and print
- Routes: `/p/alder`, `/p/alder/01-project-approach` … `/p/alder/06-decisions`, details beneath each, `/p/alder/issue` (printable record), `/p/expired` (failure state)
- Local: `node serve.mjs` → http://localhost:8805/p/alder
- Deploy: `vercel deploy` from this directory (static; `vercel.json` rewrites `/p/*` to `index.html`)
- PDF: `downloads/alder-issue-01.pdf` is generated from `/p/alder/issue` with headless Chrome

Release dependencies before any client issue: verified author, Little Rey evidence and Freeman's role,
approved pricing basis, named team, and real access control (an unlisted URL is not privacy).
