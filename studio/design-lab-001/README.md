# Freeman Design Lab — Exploration 001
**Branch:** \`study/design-lab-001\` (isolated from production)
**Purpose:** After-hours creative review for Gabe and Cole.

## What ships
- A standalone editorial index at \`design-lab/index.html\` with the Freeman drawing-sheet design language.
- Two *actual*, self-contained study folders under \`design-lab/studies/\`: the preserved FreemanAI Exploration 002 and The Record Exploration 001.
- Shared static assets from the approved Freeman website that those studies require.
- No user account database, no simulated comments, no operational data. Copy-link works for sharing.
- The approved source studies are copied by Git tree SHA, without modifying their files. Contextual exit links redirect to the Lab and public-project links redirect to the existing public website.

## Publish as a separate Cloudflare Pages site
1. In Cloudflare Pages create a **new** project connected to \`colemanvii/freeman\`; choose production branch \`study/design-lab-001\`.
2. Build command **none**; build output directory **\`design-lab\`** (not \`v5\`).
3. Configure Cloudflare Access on **all paths of the new Pages deployment**, including the Pages \`*.pages.dev\` hostname and any custom domain \`lab.freemangc.com\`, permitting only Gabe and Cole (email one-time PIN or existing identity provider). Use a long session duration appropriate to staff, e.g. 30 days, subject to Freeman policy.
4. Test signed out in a private browser on both hostnames: no index, JS, images, or studies should be accessible. Do not invite anyone until this holds.
5. Test signed in as each authorized person: index, both studies, their scripts, images, and links.
6. Point \`lab.freemangc.com\` to the new Pages project only after access protection passes.
7. Share the single index URL by iMessage. Remove unauthorized branch previews from auto-deploy if they bypass Access.

**Important:** Cloudflare Access is configured outside the repository. The repository cannot provide authentication by itself. No Cloudflare project or login policy is created by committing this branch. \`robots.txt\` and noindex headers are *not* access controls.

## Content/limitations
FreemanAI 002 has fictional scripted sample data, simulated roles, no connected model or live security enforcement. The Record uses public project information and partial site coordinates; no completion years are verified yet. Neither is production software. Only externally approved media belongs in this public repository.

## Source snapshots
- FreemanAI 002 source tree: \`archive/freemanai-002-approved\` — \`v5/studies/freemanai-002\`.
- The Record 001 source tree: \`study/the-record-001\` at \`593c823\` — \`v5/studies/the-record-001\`.
- Shared assets: \`release/approved-v5-2026-10-18\` / stable October 22 study assets.

## Review direction
One address, one sign-in, no meeting required. Future phase: a permissioned server-side feedback store with identity and timestamps; never pretend a client-side note is shared feedback.
