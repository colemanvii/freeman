# FreemanAI / Start Here

**A living company, not another dashboard.**

FreemanAI is the proposed interface for accessing what the organization knows: projects, people, field evidence, documents, precedents, decisions, and the work that needs attention.

**Cole explores the experience. Gabe develops the intelligence.** The aim is one coherent product, not two competing applications.

## What exists

**Exploration 001** — [branch](https://github.com/colemanvii/freeman/tree/study/freemanai-interface-001) · [study notes](https://github.com/colemanvii/freeman/blob/study/freemanai-interface-001/studio/freemanai-001/README.md) · [prototype code](https://github.com/colemanvii/freeman/tree/study/freemanai-interface-001/v5/studies/freemanai-001)

- An interactive static study organized around **See / Ask / Act** for owner, controller, PM, and superintendent.
- Fictional projects, records, metrics, and people; scripted answers and browser-only state.
- No language model, real-time data, shared backend, Procore/accounting connection, or secure server-side role enforcement.
- Preview: https://study-freemanai-interface-00.freeman-d6f.pages.dev/studies/freemanai-001/ — Cloudflare Access may require sign-in; a push is not proof that preview passed review.

**Exploration 002** — [creative assignment #67](https://github.com/colemanvii/freeman/issues/67)

A new direction: one intelligent work surface that transforms around a question. Show the company pulse, a project deep dive, institutional memory, and a field issue moving to a decision. It must feel unmistakably Freeman: engaging, tactile, exact, and extraordinarily useful. **At this snapshot this is a brief, not a completed prototype.**

## For Gabe and his Claude Code

1. Get GitHub collaborator access to `colemanvii/freeman` (or read access to the public prototype).
2. Read this guide and [issue #67](https://github.com/colemanvii/freeman/issues/67). Inspect the actual study branch before making assumptions.
3. From a fresh clone, `git fetch origin`; start from the chosen pushed study branch and create **your own** branch, e.g. `gabe/freemanai-exploration-002` (only once 002 exists). Push your version and open a pull request for review.
4. Keep Cole's branch and production untouched. Review experience and integration ideas together before selectively merging.

To run Exploration 001 locally, check out its branch, then from the repository root run `cd v5 && python3 -m http.server 8822`; visit `http://localhost:8822/studies/freemanai-001/`.

## Principles for the real system

- Let people **ask naturally**, explore visual evidence, and act from the answer. Put field capture within easy reach on a phone.
- Every consequential answer should disclose its source, date, access scope, and uncertainty.
- Keep authoritative records in their source systems (such as Procore and BuildingConnected); FreemanAI can link and interpret, not silently overwrite them.
- Design for offline/poor-signal field conditions, reliable handoffs, and an auditable decision trail.
- Role switching is only a **demo feature**. Actual production permissions, financial access, authentication, and audit logging must be enforced server-side.
- **This public repository is not the home for real FreemanAI data, proprietary integrations, API keys, or customer files.** Integration belongs in a separately permissioned and security-reviewed workspace.

**Measure success:** A superintendent can capture an issue almost effortlessly. Gabe can find a credible answer and the evidence behind it. The experience is memorable because it makes work clearer, not because it performs tricks.
