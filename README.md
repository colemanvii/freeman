# Freeman General Contractors

Current live website and working design system for Freeman General Contractors.

**Built For Generations™**

## Repository model

Production is served by Cloudflare Pages from `release/approved-v5-2026-10-18`,
with output directory `v5/`. The release was verified against public production assets
on 19 October 2026 at commit `211968ba39b88821f4568692d2ce98dfedd55fdc`.
See [the production record](docs/releases/2026-10-18-production-trigger.md).

- `release/approved-v5-2026-10-18` — current approved production release.
- Dedicated development branches — proposed changes based on that release, reviewed individually.
- `main` — separate legacy GitHub Pages site; not the source of the current custom-domain site.
- `freeman-v5-consolidation` — earlier production lineage, retained for reference.

The existing GitHub Pages workflow publishes the repository root from `main`. That workflow
and Cloudflare production settings are unchanged. Updating the production branch can trigger
an automatic deployment: merge, push, and deployment require separate approval.

Public implementation: `v5/app.js` and `v5/styles.css`. Content and generation:
`v5-source/content.json` and `v5-source/generate.py`. Source material is not part of the
Cloudflare output. See [QA](qa/README.md) for checks against the release.

## Working folders

- `ideas/` — conceptual thinking, language, precedents, future directions
- `studio/` — studies, working principles, journals, and evidence behind the public work

Use the repo in this order:

**Think → `ideas/`**  
**Study / experiment → `studio/`**  
**Build next version → a focused development branch**  
**Approve each change → separately authorize production integration**

Git history preserves older versions.

## Current site

Desktop is intentionally static and viewport-composed. Mobile uses a scrollable adaptation of the same visual system.

Primary sections:
- Projects
- Company
- Contact

Fieldwork is intentionally unpublished. The current site is the approved editorial shell. New project-record work should deepen the project experience without redesigning the homepage.

## Project-record direction

The project-record direction is a reusable Freeman Project Record:

**Reference → Decision → Field → Resolution → Finished → Return**

Barnsley Gardens is the pilot.

The project record should feel like an architectural archive or builder's field book, while the existing homepage and overall Freeman visual language remain intact.

## Implementation rules

- No new repo.
- No framework unless there is a compelling technical reason.
- Preserve the existing Freeman visual language.
- Base production refinements on the verified production release.
- Keep experimental work isolated until it is approved.
- Integrate production changes only after explicit approval.

## Legacy GitHub Pages material (not the current production navigation)

- [Freeman home](index.html) — latest monograph layout and project navigation
- [Field Notes](field-notes.html)
- [Barnsley Gardens Project Record](record.html?project=barnsley-gardens)
- [Radius-window study](radius-window.html) — original illustrative sequence
- [Carry the Idea Through](ideas/carry-the-idea-through/index.html)

The studies retain their illustrative-image disclosures. Project notes and studio material remain in `ideas/` and `studio/`.
