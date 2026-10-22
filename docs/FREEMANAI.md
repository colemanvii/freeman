# FreemanAI / Start Here

**A living company, not another dashboard.**

FreemanAI is the proposed experience for accessing what Freeman knows—its projects, people, field evidence, decisions, precedents, and the work that needs attention.

**Cole leads the experience. Gabe develops the intelligence.** Separate explorations, one shared product.

## Approved creative foundation

**Exploration 002 — The Living Drawing Set** is the **approved creative reference**, not a production release.

- [Creative direction](FREEMANAI-DIRECTION.md) — what this experience must preserve.
- [Preserved approval tag](https://github.com/colemanvii/freeman/tree/archive/freemanai-002-approved) — the exact approved version (`3452257`).
- [Working study branch](https://github.com/colemanvii/freeman/tree/study/freemanai-002) · [rationale and technical notes](https://github.com/colemanvii/freeman/blob/study/freemanai-002/studio/freemanai-002/README.md).
- [Cloudflare preview](https://study-freemanai-002.freeman-d6f.pages.dev/studies/freemanai-002/) — requires Cloudflare Access; build behind the gate has not been independently verified here.
- [Original design brief #67](https://github.com/colemanvii/freeman/issues/67).

One question becomes a construction sheet: a company pulse, a project plan with a time scrub, an evidence-backed precedent, or a captured field issue progressing to a decision. Evidence appears as detail bubbles; conflicts as revision clouds; approvals as a Freeman eagle stamp.

**Exploration 001** — [earlier study branch](https://github.com/colemanvii/freeman/tree/study/freemanai-interface-001). Retained for comparison. Its See / Ask / Act structure is **not** the approved creative model.

## For Gabe and his Claude Code

1. Read the [creative direction](FREEMANAI-DIRECTION.md) and [002 study notes](https://github.com/colemanvii/freeman/blob/study/freemanai-002/studio/freemanai-002/README.md).
2. Clone or fetch `colemanvii/freeman`. Start from the **approval tag** to preserve the exact baseline: `git switch -c gabe/freemanai-002 archive/freemanai-002-approved` (after `git fetch --tags origin`). Push that new branch, never the tag.
3. Explore integrations and changes there. Share a preview and PR for joint review. Keep Cole's original study and the production site untouched.

To run 002 locally: check out its study branch or the approved tag, then from the repository root run `cd v5 && python3 -m http.server 8823`; open `http://localhost:8823/studies/freemanai-002/`.

## Prototype versus product

002 uses fictional people, projects, dates, and financial figures. Responses are prewritten; state is local to one browser. No model, live retrieval, shared database, finance system, or secure authentication is connected. The role switcher **simulates**, but does not enforce, permissions.

A real FreemanAI must cite its sources and their freshness, explicitly handle uncertainty, enforce server-side access, record decisions, and keep sensitive company data outside this **public repository**. Procore and BuildingConnected remain systems of record unless Freeman explicitly decides otherwise.

**The objective:** intelligence that is pleasurable to use because it makes the work clearer.
