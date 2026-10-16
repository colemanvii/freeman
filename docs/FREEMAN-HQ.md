# FREEMAN / HQ
**Master development brief · 2026-10-16 · Version 1**

This file is the shared coordination point for work on Freeman General Contracting's digital system. Read this before proposing changes. Update it whenever a decision, implementation, deployment, or blocker changes.

## Governing premise
**Freeman is one product, not fifteen disconnected experiments.**
The public website establishes the aesthetic and component vocabulary. The private interfaces are an extension of that system—not a competing design language. The result proves taste. The evidence proves capability.

## Workstreams

| ID | Area | Scope | Working classification |
|---|---|---|---|
| 01 | PUBLIC WEBSITE | Company · Projects · Fieldwork · Contact | LIVE, subject to production verification |
| 02 | PRIVATE ACCESS | Client · Architect · Trade Partners | BUILDING |
| 03 | PROPOSALS | Alder · reusable proposals · review/approval flow | INTEGRATING |
| 04 | FREEMAN OS | Internal team dashboard · project operations · command TV | BUILDING |
| 05 | RECORD | Editorial archive · field evidence · stories | PRIVATE / UNPUBLISHED |

These classifications are a planning overview, **not proof of deployed functionality**.

## Locked decisions
1. **One aesthetic.** Match the current public Freeman website: Monaco/industrial mono, quiet off-white palettes, black ink, fine rules, tiny orange punctuation, no generic cards/rounded SaaS UI. Palette should persist across entry, private access, and OS.
2. **One codebase.** Extend existing `v5/` pages, styles, and conventions; reconcile branches before integration. Do not replace functioning pages with isolated prototypes.
3. **One project record.** Role-based views expose appropriate records to Client, Architect, Trade Partners, and Team. Define shared fields, visibility, permissions, and provenance before wiring APIs.
4. **Proposals inside Client Access.** Preserve the approved **Study 05 / Alder** opening as the visual benchmark (asymmetric one-viewport, off-white editorial composition, strong thesis, budget/schedule, fine rules). Integrate rather than redesign.
5. **Freeman OS is a tool.** Actual ownership, commitments, dependencies, decisions, schedule, logs, documents, and next actions before decoration.
6. **No unverifiable production claims.** Explicit statuses: DESIGN / BRANCH / PREVIEW READY / PRODUCTION VERIFIED. A successful Git commit or deploy status alone is not a visual/regression check.
7. **Keep RECORD private** until approved to publish.

## Source of truth and current landmarks
- Production domain: https://freemangc.com/ (current output needs browser verification).
- GitHub repository: https://github.com/colemanvii/freeman
- Established working base examined on 2026-10-16: `fix-freeman-os-palette-20261016`.
- Current OS source at that base: `v5/team-os.html` (fictional demo data; workspace tabs and record detail).
- COMMAND / 001 experiment: `feature/command-001-20261016`; new `v5/command.html`, linked from team OS. A Vercel **preview** was reported READY at https://freeman-v5-preview-3n1qjhpc4-colemans-projects-7ba35578.vercel.app/command.html . No visual QA yet; NOT public production.
- This HQ brief branch: `feature/freeman-hq-20261016`; not yet merged into production. Reconcile it with the currently deployed source before integration.
- Historic OS branches for reference: `feature/freeman-os-study-07-connected-operations`, `feature/freeman-os-mission-board-v3`, `fix/freeman-os-static-viewport-20261015`.
- Alder proposal study: `study-05-alder`. Preserve approved opening.

## Immediate work queue (priority order)
- [ ] **P0 / Verify production baseline:** route inventory, palette continuity, all four entry/access roles, desktop/mobile layouts; document exact commit/hosting and bugs.
- [ ] **P0 / Freeze a unified design/system baseline:** reconcile latest public changes with portal and OS changes; identify conflicts before cherry-pick/merge.
- [ ] **P1 / Define project record and role visibility:** project identity, people, milestones, budget exposures, files/drawings, field photos, decisions, RFIs, approvals, activity, audit/provenance. Establish permission rules and security before actual client data.
- [ ] **P1 / Finish private access role screens:** Client sees status, budget scope, schedules, proposals, decisions and files; Architect sees drawings, submittals, RFIs, design decisions and site evidence; Trade Partners see assigned scope, current drawings, schedule, RFIs and deliverables. No empty dashboards.
- [ ] **P1 / Integrate proposal experience:** Alder quality benchmark, client-specific scope/budget/schedule, review and approval lifecycle; don't mistake demo UI for a binding legal workflow.
- [ ] **P1 / Refine COMMAND and internal OS:** test 1920×1080 TV legibility, one-screen/zero-scroll, project record navigation, decision owners and actionable source data.
- [ ] **P2 / Data integrations:** evaluate Procore, financial systems, scheduling/docs, authenticated access, update frequency, owner and failure states. Never claim data is live until connected.
- [ ] **P2 / RECORD editorial taxonomy:** conversations, processes, details, stories; field evidence and permissions, publication gate.
- [ ] **P2 / Full regression and deployment checklist:** mobile and desktop, no palette flashes, no broken links, no white route resets, no exposed private data.

## Definition of done
- **Design:** consistent visual system across all role views.
- **Function:** users can complete real tasks, not merely browse demonstration records.
- **Data:** source, freshness, access, and ownership are known.
- **Security:** server-side authorization for private records; client-side hiding alone is inadequate.
- **QA:** desktop/mobile keyboard and touch checks, role isolation, route/deep-link verification, no console errors, observed production behavior.
- **Release:** record exact branch, commit SHA, preview URL, production URL, change summary, and rollback path.

## Workflow for all agents and chats
1. Read this file and inspect relevant current source before making a design or code proposal.
2. State which workstream, branch and stage is being modified.
3. Preserve approved design and content; make the smallest useful coherent change.
4. Prefer a reviewable feature branch and functional preview.
5. Test and report what was directly verified vs assumed.
6. Update the brief with new decisions, unresolved questions, preview status, and exact paths.
7. Merge/deploy only once dependencies and production checks are resolved.

## Open decisions
- Canonical production branch and deployment provider/route configuration: verify.
- Authentication and authorization model for Team/Client/Architect/Trade Partner: define.
- Actual source of project data and integration sequence: validate with Freeman team.
- Single canonical project-record schema and document/version ownership: design and approve.
- Who approves public website, private access, and RECORD release gates: confirm.

## Working notes
- Use names from verified company records, not invented user identities. Current demo project/people records are fictional.
- Separate simulation/demo and real company activity visually.
- Do not let a COMMAND TV view become an independent data-entry location; it should read from the core project record.
