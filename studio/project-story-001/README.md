# Project Story 001 — The Optimist

> The result proves taste. The evidence proves capability.

**Status:** Archived Freeman creative research milestone, 19 Oct 2026. Laboratory study: not published, not merged, not deployed to freemangc.com.
**Archive:** annotated tag [`archive/project-story-001`](https://github.com/colemanvii/freeman/tree/archive/project-story-001) → commit `958687b871d75f701ee9f0242c1158a39dbd40b5`. This README was written after the tag, in a docs-only commit on the same branch. The tag holds the verified implementation; this file describes it.
**Branch:** `study/project-story-001`, cut from `release/approved-v5-2026-10-18` (the Cloudflare Pages production branch). Never merged anywhere.
**Pages:** `v5/story-001/`, served only on the branch's Cloudflare Access–protected preview, `https://study-project-story-001.freeman-d6f.pages.dev/story-001/`.

One hospitality project is told three ways from one evidence record. Each way is written for a different reader, and the three are linked.

---

## 1. Publishing architecture

```
                        ┌──────────────────────────── evidence.js ────────────────────────────┐
                        │ project · parties · scope · withheld · statuses · claims · protocol │
                        │ plates (7 photographs + 1 drawing, visible-only keynotes)           │
                        └───────────────┬──────────────────────┬──────────────────────┬───────┘
                                        │                      │                      │
   visitor ──►  A · APPROACH  ──"The proof"──►  B · ACCOUNT  ◄──sentence links──►  C · SHEET
              public entry                    standard of proof                  architects & designers
              eight views → the record        Read · Marks · Capture brief       PS-001 project story
                    └──"For architects and designers"───────────────────────►  PS-002 field record
```

| | Study | Role | Reader | Leads with | Structure | Control |
|---|---|---|---|---|---|---|
| A | **Approach** `a/` | **Public entry** | Guests, operators, prospective clients | The result | Ten positions on one axis: title, eight views ordered by distance (street → lawn → room → wall → seat → table), the record | A distance rule; its red locator is the only thing that moves |
| B | **Account** `b/` | **Standard of proof** | Owners and developers weighing a builder; Freeman itself | The evidence, and its absence | Fourteen plain sentences in four paragraphs (place, people, work, record), each opening its exhibit | The sentences themselves |
| C | **Sheet** `c/` | **For architects and designers** | The design profession Freeman wants to work with | The people and the record | Drawing sheets: notes, elevation, details, title block, revisions | Detail callouts; a detail opens out of its place on the sheet |

**How they connect**
- A's final position ("What Freeman built") links to **B in Marks view** ("The proof") and to **C** ("For architects and designers").
- In B, each sentence's exhibit includes **"On the sheet"**, a link to its detail on PS-001 where one exists.
- In C, each detail view includes **"In the account · sentence NN"** (a link back into B). Details 8–11 also link to their **capture frame on PS-002**.
- The comparison index `story-001/` holds the governing idea, the material ledger, the three studies, a comparison table and the provenance rules.

**The rule behind the roles:** A may say only what B can account for. Every public claim has a status in B, and every stated claim has a request for the evidence that would prove it. C restates the same record in the architecture world's own document.

## 2. The shared evidence record — `v5/story-001/evidence.js`

`window.STORY` is the single source for the index and all three studies. Nothing in it is invented, and every item names its source.

| Key | Holds |
|---|---|
| `project` | Name, scope (Oyster Bar refresh), location, type; the latitude lettered on a table in photograph 4 |
| `sourceText` | Freeman's published project account, verbatim. It is quoted, never rewritten in place |
| `parties` | Client (Rocket Farm Restaurants), Interior design (Chuck Marie Studio), Construction (Freeman GC), Photography (Jared Swafford), Drawing (Freeman GC archive), each with its source |
| `scope` | The four published scope items, all `located: false` (no photograph identified) |
| `schedule` | Three weeks; on time and under budget; `record: false` |
| `withheld` | "2,000+ sq. ft." and "Complete 2024": legacy template credits, unconfirmed, never used |
| `awaiting` | Evidence that would complete the story |
| `statuses` | The proof standard: **Shown**, **Credited**, **Stated, no record**, **Withheld**, each with its definition |
| `upgrade` | How a claim moves up a status (only when a record is added), and that nothing moves down except a correction |
| `claims` | The fourteen sentences: `id` (`s01`–`s14`), paragraph, status, exhibit, source, note, verbatim `quote`, `now` / `next` evidence requests, and matching sheet `detail` |
| `protocol` | Freeman's capture protocol, quoted from `PROJECT-RECORD.md` (Project Record pilot) |
| `plates` | `dr` (drawing) and `p0`–`p6` (photographs): file, size, credit, source, title, caption, alt text and keynotes `[x %, y %, visible detail]` |

**Assets.** The seven photographs are the originals from Freeman's published portfolio, kept byte for byte. Three are identical to the files already in production `v5/assets/`, which was checked by hash. `assets/thumbs/` holds 760 px derivatives. The drawing is a transparent PNG from the Freeman archive.

**Status today:** 4 shown · 3 credited · **7 stated, no record** · 2 withheld.

## 3. The capture brief — B → *Capture brief* (`b/#brief`)

The brief turns the seven stated claims (sentences 06–12) into work. For each claim it gives:

- the claim, with Freeman's **source text** quoted and its **sheet detail**
- **Collect now · this project**: what may still exist for The Optimist (dates, shop drawings, photographs that identify an item, cost against contract, a statement in the client's own words)
- **Next project · during the work**: what to capture while the work happens
- a **Filed** box to tick on paper

It closes with **Freeman's capture protocol** and **the proof standard**. Everything in the brief is a request: beyond the quoted source text, it states nothing about the project.

PS-002 is the same brief in drawing form: seven capture frames plus a reference frame, each with blank **Position / Date / By / File** fields.

## 4. Print formats

| Page | How | Paper | Result (checked in headless Chrome) |
|---|---|---|---|
| B · Capture brief | Print from any B view, or the *Print brief* button | US letter, portrait, 14 mm margins | 2 pages |
| C · PS-001 Project story | Print while PS-001 is showing | Tabloid 17 × 11 in, landscape, 0.35 in margins | 1 page |
| C · PS-002 Field record | Print while PS-002 is showing (`c/#ps-002`) | Tabloid 17 × 11 in, landscape | 1 page |

In print, the lab frame, overlays and keynote markers are hidden, and photographs are fitted, never cropped. Phone layouts apply to `screen` only, so print always gets the full layout. Turn on *Background graphics* if a browser drops the dashed red frames.

## 5. Addresses and keys

- **Index:** `story-001/`, `#compare`, `#prov`. Keys `1` `2` `3` open the studies.
- **A:** `a/#0`–`#9`. Arrow keys, wheel, swipe, click the plate (the left third goes back), `Home` / `End`.
- **B:** `b/#s01`–`#s14` (Read), `#marks`, `#marks-s09`, `#marks-w1`, `#brief`. Keys `R` / `M` / `C` switch views; arrow keys move between sentences; `Enter` holds one.
- **C:** `c/#d0`–`#d11` opens a detail; `#ps-002` shows the second sheet. Keys `1`–`9`, arrows, `Esc`, `S` switches sheet.
- **In any study:** `[` `]` move to the previous or next study, `I` opens About, `\` hides the lab frame.

## 6. Design system

Production tokens only (`v5/styles.css`):
- `#fff9f1` paper, `#332e20` ink, `#f93822` Freeman red, `#d5cec3` hairlines
- Monaco
- crosshair cursors, the instant red word highlight, the panel-head register

There are no new typefaces, rounded cards, shadows, gradients or scroll choreography. Motion is limited to two things: A's locator, and C's single outline that carries a detail from the sheet to its open view. Both are off under reduced motion.

## 7. Isolation and deployment (checked 19 Oct 2026)

- **Cloudflare Pages** project `freeman`: production branch `release/approved-v5-2026-10-18`, output `v5/`, no build command. Every other branch gets a preview, and the branch alias and unique deployment URLs both redirect to Cloudflare Access. Pages builds branch pushes; the archive tag is not a branch.
- **GitHub Actions:** `pages.yml` runs on `main` only; `qa.yml` runs on `freeman-v5-consolidation` and `fix/**`. Neither runs for `study/**`.
- **Headers:** `v5/_headers` adds `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: private, no-cache` for `/story-001` and `/story-001/*`. This is the only change outside `v5/story-001/`.
- **Not linked** from the public site, not in `sitemap.xml`, and not touched by `v5-source/generate.py`. `https://www.freemangc.com/story-001/` returns 404.

## 8. Verification of `958687b`

1. The worktree matches `958687b` exactly, and the branch on GitHub points to the same commit.
2. The commit contains the index, A, B, C, `lab.css`, `lab.js`, `evidence.js`, 7 originals, 7 thumbnails and the drawing. Compared with the production branch, it adds 23 files and changes only `v5/_headers`.
3. Clean export: `git archive 958687b v5` served with `wrangler pages dev`. All study routes return 200, bare paths 308 to the trailing slash, a production route still returns 200, and every asset referenced by a page or by `evidence.js` exists.
4. Rendered in Chrome: index 3 studies; A 10 rule positions plus the links to B and C; B 14 + 2 sentences and 7 brief rows with the protocol; C 11 details plus the elevation on PS-001 and 8 frames on PS-002.

**To reproduce:**

```bash
git fetch origin tag archive/project-story-001
mkdir -p /tmp/ps001 && git archive archive/project-story-001 v5 | tar -x -C /tmp/ps001
npx wrangler@4 pages dev /tmp/ps001/v5 --port 8788
```

Then open `http://127.0.0.1:8788/story-001/`. Any static server works too (for example `python3 -m http.server` in `v5/`), but it will not apply `_headers` or Pages URL handling.

## 9. Remaining limitations

**Evidence**
- No field evidence exists on file. Seven of the fourteen claims are stated only, and details 8–11 are empty by design.
- No photograph is matched to Freeman's scope, so the photographs prove the restaurant, not Freeman's part of it.
- Keynote positions were placed by eye on the published photographs and describe only what is visible.
- The originals came from the Webflow CDN, which will go when Webflow hosting is cancelled. They are now kept in the repo.

**Data**
- The record is shared, but some text is still kept in the page files themselves:
  - B's two withheld sentences
  - C's PS-001 general notes, legend and title-block values
  - A's viewing order and stage names
  - the dates `19.10.26` on the sheets
- A second project would need these moved into the record.

**Platforms not yet tested**
- Tested in Chromium only: desktop at 1440×900 and 1280×720, and phone emulation at 375×812. Not tested on a physical iPhone, in Safari or in Firefox, and touch swiping was not tried on a real device.
- Print was checked in headless Chrome only. Safari and Firefox pagination are unverified.
- Monaco is a macOS system font. Other systems fall back to SF Mono, Consolas or Liberation Mono, and the typography changes.

**Accessibility and performance**
- No screen-reader audit has been done. B's sentences are `role="button"` spans inside running prose.
- Images have no `srcset`. A and the detail views load full originals (6.6 MB in all), and C shows thumbnails first.

**Deployment**
- The preview is behind Cloudflare Access. The latest preview build could not be confirmed from here because the Cloudflare token had expired. The address still redirects to Access.

## 10. Rules kept

1. No invented photographs, credits, client statements, dates, quantities or construction facts.
2. Captions and keynotes describe only what is visible.
3. Nothing visible is attributed to Freeman's work.
4. Design authorship belongs to Chuck Marie Studio; Freeman is credited for construction only.
5. Missing evidence is shown as missing.

## 11. Finding

Every sentence about the **result** can be shown. Every sentence about the **work** is, for now, only stated. Freeman has the photographs that prove taste, but no field evidence on file that proves capability. Whatever is developed next, the next step is capture, not design.
