# Freeman General Contractors

Current live website and working design system for Freeman General Contractors.

**Built For Generations™**

## Repository model

All current Freeman work is published together from `main`. Development branches retain their original checkpoints. Branch names identify studies; `main` is the source of truth for the published site.

- `main` — approved, deployable Freeman site
- `v4-project-record` — preserved V4 prototype checkpoint
- `field-notes/first-visual-pass` — preserved Field Notes and original radius-window checkpoint

The live GitHub Pages site deploys from `main`.

## Working folders

- `ideas/` — conceptual thinking, language, precedents, future directions
- `studio/` — studies, working principles, journals, and evidence behind the public work

Use the repo in this order:

**Think → `ideas/`**  
**Study / experiment → `studio/`**  
**Build next version → a focused development branch**  
**Approve → merge to `main`**

Git history preserves older versions. Long-lived experiment branches should not become the archive.

## Current site

Desktop is intentionally static and viewport-composed. Mobile uses a scrollable adaptation of the same visual system.

Primary sections:
- Projects
- Company
- Archive
- Contact

The current site is the approved editorial shell. New project-record work should deepen the project experience without redesigning the homepage.

## Project-record direction

The project-record direction is a reusable Freeman Project Record:

**Reference → Decision → Field → Resolution → Finished → Return**

Barnsley Gardens is the pilot.

The project record should feel like an architectural archive or builder's field book, while the existing homepage and overall Freeman visual language remain intact.

## Implementation rules

- No new repo.
- No framework unless there is a compelling technical reason.
- Preserve the existing Freeman visual language.
- Do not redesign `main` while exploring V4.
- Keep experimental work isolated until it is approved.
- Promote only deliberate, reviewed changes into `main`.

## Published pages

- [Freeman home](index.html) — latest monograph layout and project navigation
- [Field Notes](field-notes.html)
- [Barnsley Gardens Project Record](record.html?project=barnsley-gardens)
- [Radius-window study](radius-window.html) — original illustrative sequence
- [Carry the Idea Through](ideas/carry-the-idea-through/index.html)

The studies retain their illustrative-image disclosures. Project notes and studio material remain in `ideas/` and `studio/`.
