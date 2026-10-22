# Working Index

*Snapshot: 22 October 2026. Branch labels describe purpose, not deployment. Check GitHub and Cloudflare before changing anything live.*

## Current references

| Workstream | Start here | Status |
| --- | --- | --- |
| **Public website** | [Approved V5 baseline](https://github.com/colemanvii/freeman/tree/release/approved-v5-2026-10-18) | Approved release baseline; verify actual deployed SHA separately |
| **Repository front door** | [`main`](https://github.com/colemanvii/freeman/tree/main) | Default branch; older GitHub Pages build, distinct from Cloudflare V5 |
| **FreemanAI** | [Creative direction](FREEMANAI-DIRECTION.md) · [Handoff](FREEMANAI.md) | **002 approved as creative foundation**, not a live intelligence product |
| **FreemanAI 002** | [Approved tag](https://github.com/colemanvii/freeman/tree/archive/freemanai-002-approved) · [study branch](https://github.com/colemanvii/freeman/tree/study/freemanai-002) | Preserved at `3452257`; interactive fictional-data prototype |
| **FreemanAI 001** | [Earlier study](https://github.com/colemanvii/freeman/tree/study/freemanai-interface-001) | Archived conceptually; kept for comparison |
| **Website creative principles** | [Current direction](CURRENT-DIRECTION.md) · [Studio](../studio/README.md) | Current website language and creative guardrails |
| **Eagle / signature / copy** | [Branches](https://github.com/colemanvii/freeman/branches) | Various studies and candidates; verify approval separately |

## Branch discipline

This repository contains many historical study, fix, backup, and checkpoint branches. **Age alone is not a reason to delete or rename one.** Treat branches inactive for two weeks as **archive candidates**, after confirming they are not deployed, depended on, or carrying unique unmerged work.

- `release/*` — release baseline or candidate; not automatic deployment proof.
- `study/*` — isolated experiments and creative references.
- `feature/*`, `fix/*` — work that may or may not have shipped.
- `archive/*`, `backup/*`, `checkpoint/*` — historical reference.
- `docs/*` — handoff and documentation.

For public site changes, confirm production first. For FreemanAI, start with the [handoff guide](FREEMANAI.md). Do not connect real systems or confidential information to the public prototype.

## Collaboration rules

Work in separate branches. Review through pull requests. State separately what was committed, pushed, deployed, and verified. Preserve approved references; do not overwrite another person's work or edit production without explicit approval.
