# ETCETERA 005: Beetlecat, an editorial snapshot

An isolated study on branch `study/project-monograph-001`, cut from the production release branch `release/approved-v5-2026-10-18` at 44cb8cc. Not merged into production, not deployed to production.

One small page inside ETCETERA: five authentic photographs (two of them crops), one short commentary, and restrained identification and credits. It is composed three ways, so the editorial design can be judged with the content held constant. It replaces the earlier five-plate Project Monograph, which remains in this branch's history.

- Files: `v5/etcetera/snapshot-001/`
  - `beetlecat.js`: the content, shared by all three studies
  - `snapshot.js`: the compositions
  - `snapshot.css`
  - `details/`: the two crops
- Route shell: `v5/etcetera-snapshot-001.html`
- Production files changed on this branch: `v5/app.js` (route, ETCETERA object, loader and study switch; holding flag off) and `v5/etcetera.html` (asset version)
- Local preview: `http://localhost:8815/etcetera.html`. Open object 005, then switch STUDY A / B / C in the footer.
- Asset audit: [`INVENTORY.md`](INVENTORY.md)

## ETCETERA on this branch

Live ETCETERA has shown a temporary `UNDER CONSTRUCTION` holding state since 44cb8cc. The approved collection (cc00dae) is still in `app.js` behind `etceteraPublicHolding`. This branch sets that flag to `false` so the snapshot can be seen within the approved composition. Releasing it would therefore also end the holding state, which is a separate decision.

The approved 2 × 2 keeps its four objects, their order, columns and caption baselines. Object 005 enters below them as one index line on a hairline, set on the same two columns: `005 / BEETLECAT · AN EDITORIAL SNAPSHOT` in the caption style, and `OPEN ↗` in the collection's red OPEN style. To make room, the four objects render about 9% smaller at 1440 × 900.

## The content (identical in A, B and C)

| | Source | Status |
|---|---|---|
| Figures 1–3 | Production's Beetlecat photographs by Jared Swafford | Credited |
| Figures 4, 5 | Crops of 1 and 2: the door at 860, 500, 340 × 940 and the window frames at 1540, 0, 380 × 860 (source pixels) | Crops, labelled |
| **Two colours, one curve.** | Headline summarising the observation | Editorial |
| **Observed** | Only what is visible in figures 1–5: red in the carpet, ribbed counter fronts and banquette; yellow in the window frames, door and stools; one rounded line at every scale | Visible; attributes nothing to anyone |
| **Reading / ours** | “A few decisions, repeated without exception, make the room whole.” | Interpretation, labelled as ours |
| Client, Photography | Production record | Credited |
| Construction: Freeman GC | Freeman's own published record | Stated, and marked as stated |
| Design | No credit is published | Shown as not credited |

No construction narrative is told: nothing on file documents the build.

## The three studies

| | Name | Composition |
|---|---|---|
| A | Spread | A journal opening. Left page: figure 1 alone, full height. Right page: headline and text in two columns, figures 2 and 3 as a pair, then the two crops beside the credits. On phones, the spread is folded: figure 1 tall beside 2 and 3 stacked, the words, then the crops by the credits. |
| B | Band | All five figures in one band at one height (1 · 4 · 2 · 3 · 5), set on the register beneath: identification, observed, reading, credits in four columns. On phones, two rows over the register. |
| C | Plate | The project gallery's margin column holds every word. The field holds one dominant figure (2) and a row of four small figures beneath, like a journal plate. On phones, the plate sits above the words. |

**Phones in landscape and other short screens:** each study keeps its arrangement of the figures, with the words set in two columns beside them. A has figures first; B and C have words first.

## Static, one viewport: verified by script

Checked at 1920 × 1080, 1440 × 900, 1366 × 640, 1280 × 720, 1024 × 768, 1024 × 600, 768 × 1024, 844 × 390, 667 × 375, 430 × 932, 390 × 844, 375 × 667 and 360 × 640, for every study. On each:
- every element sits inside production's `.viewport` frame
- the frame does not scroll
- the page has no horizontal or vertical overflow

ETCETERA was checked at 1440 × 900. Figures are never shown larger than their source.

**Honest limit:** on the smallest phones (375 × 667 and below), the words claim most of the frame, and the figures land at roughly 40–170px tall.

## Open questions

1. Permission from Jared Swafford to publish crops of his photographs.
2. Whether a design credit exists for Beetlecat.
3. Whether Freeman has any Beetlecat field photographs. They would add evidence; the snapshot does not need them.
