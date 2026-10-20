# Project Story 001 — The Optimist

**Status:** Laboratory study, 19 Oct 2026. Not published. Not for merge into the production branch or `main`.
**Branch:** `study/project-story-001`, cut from `release/approved-v5-2026-10-18` (the Cloudflare Pages production branch).
**Pages:** `v5/story-001/` → served only on the branch's Cloudflare Access–protected preview, `https://study-project-story-001.freeman-d6f.pages.dev/story-001/`.

> The result proves taste. The evidence proves capability.

Three working editorial structures for one hospitality project, built from the same evidence record, with a comparison index.

| | Study | Leads with | Structure | Control |
|---|---|---|---|---|
| A | **Approach** (`a/`) | The result | Eight views on one axis, ordered by distance: street → lawn → room → wall → seat → table. The record of what Freeman built is the destination. | A distance rule; the red locator is the only thing that moves. |
| B | **Account** (`b/`) | The evidence, and its absence | Fourteen plain sentences. Each opens what stands behind it: photograph, drawing, credit or an empty frame. *Marks* shows each sentence's status and the two withheld figures. | The sentences themselves. |
| C | **Sheet** (`c/`) | The people and the record | One architectural drawing sheet: general notes, elevation, seven photographic details, four details awaiting evidence, title block, revisions. | Detail callouts; a detail opens out of its place on the sheet. |

The index (`story-001/`) holds the governing idea, the material ledger, a comparison table and the provenance rules.

## Finding

B makes it explicit: every sentence about the **result** can be shown; every sentence about the **work** is, for now, only stated. Freeman has the photographs that prove taste, but no field evidence on file to prove capability. Whichever direction is chosen, the next step is capture, not design.

## Evidence record (`v5/story-001/evidence.js`)

The single source for all three studies.

- **Photographs:** 7, by Jared Swafford, the originals from Freeman's published portfolio (Webflow CDN). The three already in `v5/assets/` are byte-identical to the CDN files. Thumbnails in `assets/thumbs/` are 760 px derivatives.
- **Drawing:** the Freeman archive drawing of the sign.
- **Account:** Freeman's published project text, quoted verbatim as source text.
- **Credits:** Client (Rocket Farm Restaurants), Interior design (Chuck Marie Studio), Photography (Jared Swafford); Construction (Freeman GC) from the account.
- **Withheld:** "Total sq. ft. 2,000+" and "Complete 2024" appear only in legacy template credits; the live site omits them, and so do these studies.
- **Not on file:** field photographs, dates, schedule or cost records, shop drawings, any photograph matched to a scope item, any statement from the client or designer.

## Rules kept

1. No invented photographs, credits, client statements, dates, quantities or construction facts.
2. Captions and keynotes describe only what is visible.
3. No photograph is matched to Freeman's scope, so nothing visible is attributed to Freeman's work.
4. Design authorship belongs to Chuck Marie Studio; Freeman is credited for construction only.
5. Missing evidence is shown as missing.

## Design system

Production tokens only (`v5/styles.css`): `#fff9f1` paper, `#332e20` ink, `#f93822` Freeman red, Monaco, hairlines `#d5cec3`, crosshair cursors, instant red word highlight, the panel-head register. No new typefaces, no rounded cards, shadows, gradients or scroll choreography. Motion: A's locator; C's single outline that carries a detail from the sheet to its open view (off under reduced motion).

## Deployment behaviour (checked 19 Oct 2026)

- Cloudflare Pages project `freeman`: production branch `release/approved-v5-2026-10-18`, output `v5/`, no build command, previews for all branches. Branch previews redirect to Cloudflare Access.
- GitHub Actions: `pages.yml` runs on `main` only; `qa.yml` on `freeman-v5-consolidation` and `fix/**`. Neither runs for `study/**`.
- Pages emulation (`wrangler pages dev v5`): `/story-001` and `/story-001/a` 308 to trailing-slash URLs; all study files 200 with `X-Robots-Tag: noindex` and `Cache-Control: private, no-cache` (added to `v5/_headers`); unknown study paths 404; production routes unchanged.
- The study is not linked from the public site and is not in `sitemap.xml`. `v5-source/generate.py` does not touch `v5/story-001/`.

## Keys

Index: `1` `2` `3`. In a study: `[` `]` previous/next study, `I` about, `\` hide the lab frame. A: arrows, wheel, swipe, `Home`/`End`. B: `M` marks, arrows between sentences. C: `1`–`9`, arrows, `Esc`.

## Next

- Collect for The Optimist (or the next project): dated, fixed-position field photographs; start and handover dates; one photograph per scope item; shop drawings for the radius window and stainless; a statement in the client's or designer's own words.
- With that material, A can run backwards in time as well as inwards; B's empty frames fill; C gains PS-002, the field record.
