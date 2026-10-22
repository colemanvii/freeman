# Working Index

*Snapshot: 22 October 2026. Branch labels describe their role, not proof of deployment. Check GitHub and Cloudflare before changing anything live.*

## Where work lives

| Workstream | Source | Status |
| --- | --- | --- |
| **Public website** | [Approved V5 baseline](https://github.com/colemanvii/freeman/tree/release/approved-v5-2026-10-18) | Approved release baseline; confirm the deployed SHA separately |
| **Repository front door** | [`main`](https://github.com/colemanvii/freeman/tree/main) | Default branch; GitHub Pages still builds from here; it diverges from V5 |
| **FreemanAI 001** | [Study branch](https://github.com/colemanvii/freeman/tree/study/freemanai-interface-001) | Clickable static prototype; entirely fictional data; no AI backend |
| **FreemanAI 002** | [Creative brief #67](https://github.com/colemanvii/freeman/issues/67) | Assignment only; not yet a built or verified preview at this snapshot |
| **Creative principles** | [Current direction](CURRENT-DIRECTION.md) · [Studio](../studio/README.md) | Decision reference and working archive |
| **Eagle / signature / copy studies** | [GitHub branches](https://github.com/colemanvii/freeman/branches) | Multiple experiments and release candidates; do not assume approval from a name |

## Navigating the branches

This repository has accumulated many study, fix, backup, and checkpoint branches. Preserve them as history; **do not delete, mass-merge, or rename them as part of a documentation cleanup**.

- `release/*`: release candidates or approved baselines, **not automatically the currently deployed commit**.
- `study/*`: creative experiments and isolated prototypes; compare before choosing.
- `feature/*` and `fix/*`: implementation work, not necessarily shipped.
- `archive/*`, `backup/*`, `checkpoint/*`: historical reference.
- `docs/*`: handoff and documentation changes.

The branch to start from depends on the task. For public-site work, confirm the current Cloudflare deployment first. For FreemanAI, start with the [handoff guide](FREEMANAI.md); do not connect live systems to the public prototype.

## Rules for collaborators

1. Name the branch and scope before editing; keep each person's work independent.
2. Use pull requests to compare, review, and selectively integrate.
3. State what was **committed**, what was **pushed**, what was **deployed**, and what was **actually checked**. These are different states.
4. Do not modify the approved site, deployment configuration, or another person's branch without explicit approval.
5. Keep sensitive company intelligence in private, authenticated infrastructure; a gated preview does not make public source private.
