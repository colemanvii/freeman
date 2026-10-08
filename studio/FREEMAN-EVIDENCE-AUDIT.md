# FREEMAN EVIDENCE AUDIT

**Status:** Draft for approval · October 8, 2026
**Repository:** `colemanvii/freeman`
**Branches examined:** `main` (live), `v4-living-monograph`, `v4-project-record`, `v1-archive`, `v2`, `v3`
**Nature of this audit:** Read-only. No files were changed, no imagery was removed, nothing was deployed.

---

## 1. Method

Every reference to `field-notes-assets/` and `record-assets/` was traced to its page, line and caption. Captions were checked against three sources:

1. The repo's own provenance records: `FIELD-NOTES.md` (L17–27), `field-notes-assets/README.md` and `record-assets/README.md`.
2. Visual inspection of each committed image.
3. Consistency across pages that use the same image.

**Limitation.** About 35 images are hotlinked from `cdn.prod.website-files.com` (Webflow) in `app-core.js`: the portfolio projects plus 26 "Tool" images. The audit sandbox blocks that CDN, so those images were assessed by filename and caption only (see E-32).

**Duplication.** `main/v3-study.html`, `main/archive/index.html` and `main/directions/*` are byte-identical on `v4-living-monograph`. Each finding below lists the `main` path, and the correction applies to both branches.

**Public exposure.** All of `main` deploys to GitHub Pages. `v3-study.html` (WORK), `archive/` (ARCHIVE) and the `directions/` studies are therefore publicly reachable, even though the Archive is labelled "Internal evidence system."

## 2. Severity scale

| Level | Definition |
|---|---|
| **S1 Critical** | Non-Freeman or AI-generated imagery presented as Freeman work, a Freeman jobsite, or a specific project, without disclosure |
| **S2 High** | Real imagery given the wrong project, subject, phase or date; unverified facts presented as fact |
| **S3 Medium** | Invented record numbers, placeholder data shown as fact, or code behaviour that produces misattribution |
| **S4 Low** | Naming inconsistency, inaccurate alt text, misleading but minor wording |

## 3. Summary

| Severity | Count | Main surfaces |
|---|---|---|
| S1 | 7 | `v3-study.html`, `archive/`, `v4/index.html`, `directions/sequence-v2/-v3` |
| S2 | 14 | Same surfaces, plus `directions/working-drawing.html`, `directions/sequence.html` |
| S3 | 8 | `archive/`, `v4/index.html`, V1 studies |
| S4 | 7 | Naming across the repo, `record.html`, `field-notes.html` |
| **Total** | **36** | |

**Root causes**
1. Four images with unknown or non-Freeman provenance (steelwork, timber, site, square) were reused across later studies under invented captions: "Field Study / North Georgia / 2026". `FIELD-NOTES.md` records their true status correctly, but that knowledge didn't travel with the files.
2. A fixed "Builder: Freeman General Contracting" field in V3, and hard-coded Barnsley facts in Archive, attach Freeman and Barnsley to everything they display.
3. Decorative record numbering (`Field / 014`, `Record / 031`) implies an archive register that doesn't exist.

**What's done right.** `field-notes.html`, `radius-window.html` and `record-data.js` disclose AI and unknown provenance accurately. They are the model for corrections (§7).

## 4. Asset register

Each committed asset, its known provenance, and the class it should carry under `FREEMAN-DESIGN-DNA.md` §9.

| Asset (`field-notes-assets/`) | What it actually shows | Recorded provenance | Proposed class | Permitted use |
|---|---|---|---|---|
| `barnsley.webp` | Barnsley pool and pavilion, completed, exterior | Portfolio; Photography: Jared Swafford; Interior design: Chuck Marie Studio (`FIELD-NOTES.md` L24) | `PORTFOLIO` | Barnsley Finished Result only |
| `optimist.webp` | The Optimist terrace, exterior, completed | Portfolio photo (`FIELD-NOTES.md` L20) | `PORTFOLIO` | Optimist record only; photographer credit needed (Q-8) |
| `optimist-detail.webp` | Crop of `optimist.webp`: terrace canopy and seating | Labelled crop (`FIELD-NOTES.md` L20) | `PORTFOLIO` (crop) | Optimist only; must say "crop" |
| `site.webp` | Red-brick industrial building, ladder, equipment | Webflow "Tool 25"; project and date unknown (L19) | `COLLECTION` | "Unattributed" only, until Q-2 is answered |
| `timber.webp` | Nail or metal fitting in a worn timber surface | "Tool 21"; timber surface reference; project and date unknown (L21) | `COLLECTION` | Material reference; **not** framing |
| `steelwork.webp` | Historical sepia photo: worker tying rebar on a rooftop over a dense, European-looking townscape | "Tool 16"; "Historical reference, not attributed to a Freeman job" (L25) | `REFERENCE` | Reference sections only; never Freeman work |
| `square.webp` | Rafter/speed square product image | "Tool 1"; artifact (L23) | `REFERENCE` (or `COLLECTION` if Freeman-owned, Q-5) | Tools and reference only |
| `angle-divider.webp` | Vintage "General" angle divider packaging, New York | "Tool 5"; printed illustration (L23) | `REFERENCE` | Tools and reference only |
| `window-sequence.webp` / `record-assets/window-sequence.png` | 2×2 radius-window sequence | **AI-generated**, "not Barnsley Gardens or verified Freeman construction" (`record-assets/README.md`) | `ILLUSTRATIVE` | Studies only, stamped |

## 5. Findings

### 5.1 V3 baseline: `main/v3-study.html` (live, public)

| ID | Sev | Line | Currently shows | Problem | Correction |
|---|---|---|---|---|---|
| E-01 | S1 | 234 | Rail field `Builder: Freeman General Contracting`, static on all 6 slides | Attributes historical steelwork (REFERENCE) and collection images to Freeman | Make Builder a per-slide value, shown only for `FIELD`/`PORTFOLIO`. Add a `Provenance` rail row. |
| E-02 | S1 | 253 | `steelwork.webp`: Field Study · North Georgia · 2026 · Steelwork | Historical non-Freeman photo given a Freeman project, place and date | Remove from the Work sequence. If shown anywhere, caption it `REFERENCE · Historical photograph · Not Freeman work · Date unrecorded`. |
| E-03 | S2 | 254 | `timber.webp`: Field Study · North Georgia · 2026 · Timber | Project, place and date invented | `COLLECTION · Timber surface detail · Project unrecorded · Date unrecorded` |
| E-04 | S2 | 257 | `site.webp`: Field Study · Georgia · 2026 · Construction | Project and date invented | `COLLECTION · Existing building · Project unrecorded · Date unrecorded` |
| E-05 | S2 | 233, 252 | `barnsley.webp`: Subject "Work in progress", Year 2026 | It is a completed portfolio photograph; the date is unverified | Subject: `Completed work`. Year: from the portfolio record or `Unrecorded`. Add photographer credit. |
| E-06 | S3 | 216 | Header `FIELD RECORD / 001` | The sequence is mostly portfolio and collection imagery; no record 001 exists | `SELECTED WORK`, or a real Archive record ID once one is issued |
| E-07 | S4 | 255–256 | Optimist: Year `Record`, Subject `Hospitality` | A placeholder in the Year field; a sector given as the subject | Year: actual or `Unrecorded`. Subject: `Terrace, completed` / `Terrace detail (crop)`. |

### 5.2 Archive: `main/archive/index.html` (live, public, labelled internal)

| ID | Sev | Line | Currently shows | Problem | Correction |
|---|---|---|---|---|---|
| E-08 | S1 | 95 | `steelwork.webp` in the **Barnsley** record: "Field evidence / Structure / Steel — Freeman documents the work before it disappears." | Historical non-Freeman photo presented as Barnsley field evidence | Remove it from the Barnsley record. Move it to a Reference collection with its correct class. |
| E-09 | S1 | 89 | Project row `003 · Field Study / North Georgia · Field Record · 2026`, thumbnail steelwork | An invented project assembled from REFERENCE and COLLECTION images | Remove the row. Use an `Unattributed collection` bin instead, which is not a project. |
| E-10 | S2 | 93–94 | `optimist-detail.webp` and `optimist.webp` under Barnsley **Finished Result** | Another project's photographs presented as Barnsley | Move them to the Optimist record. Barnsley Finished Result contains Barnsley images only. |
| E-11 | S2 | 94 | `optimist.webp` subject "Interior" | It is an exterior terrace | Subject: `Terrace / exterior` |
| E-12 | S2 | 96 | `timber.webp`: "Field evidence / Framing / Carpentry / Material / structure" | A surface detail of unknown origin is presented as Barnsley framing | Remove it from Barnsley. `COLLECTION · Timber surface detail`, no phase. |
| E-13 | S2 | 97 | `site.webp` in Barnsley as "Site condition" | Project unknown; not shown to be Barnsley | Remove it from Barnsley. `COLLECTION`. |
| E-14 | S3 | 112 | `openDetail()` hard-codes `Project: Barnsley Resort` and `Place: Adairsville, Georgia` | Every evidence plate, including Optimist, says Barnsley | Read project, place and class from each evidence item |
| E-15 | S3 | 108 | `hiddenGrid` = `evidence[3..5]`, the same items as `evidenceGrid` (L107) | The same three images are claimed as both Field Evidence and Hidden Work | Show only items tagged hidden work. Otherwise show "No hidden-work records yet." |
| E-16 | S3 | 55 | `Evidence: 06 records` | Only 1 of the 6 is Barnsley evidence | Compute the count from the project's own items |
| E-17 | S3 | 53–55 | `PM: Mock record`, `Super: Mock record`, `Status: Active`, `Year: 2026` | Placeholders and unverified status presented as facts | `Unassigned` or verified values. Add a `PROTOTYPE` stamp to the record header until the data is real. |
| E-18 | S2 | 63–64 | Decisions: "Coordinate before finish. Ceiling, trim, lighting, and sprinkler locations reviewed…"; "Protect the finished work…" | Presented as Barnsley decisions with no source; sections 05–08 are honestly labelled "Prototype record", these are not | Label them `EXAMPLE — not a Barnsley decision`, or remove them until sourced |
| E-19 | S4 | 110 | Rows 002 and 003 have hover and pointer, but `openProject()` returns for any index other than 0 | Implies records exist that don't | Remove the affordance and show `NOT YET ASSEMBLED` |

### 5.3 V4 living monograph: `v4-living-monograph/v4/index.html` (also `directions/living-monograph.html`)

| ID | Sev | Line | Currently shows | Problem | Correction |
|---|---|---|---|---|---|
| E-20 | S1 | 364–373 | AI `window-sequence.webp` under "Freeman Archive / Field Record / Window Sequence — THE WORK BEFORE IT DISAPPEARS — Existing condition → sequence → finished result. Preserved as project memory." | An AI-generated image is presented as Freeman project memory, with no disclosure | Remove it from the monograph. If the study keeps it, stamp it `ILLUSTRATIVE` beside the image: "AI-generated. Not Freeman construction." |
| E-21 | S1 | 340–341 | `steelwork.webp`: "Structure / North Georgia — Field / 014" | Historical non-Freeman photo given a Freeman location and field number | As E-02 |
| E-22 | S2 | 345–346 | `timber.webp`: "Framing + Hidden Systems — Evidence / 027"; alt "Timber framing" | Not framing; not hidden systems; provenance unknown | As E-12; correct the alt text |
| E-23 | S2 | 360–361 | `optimist-detail.webp`: "Interior Detail / The Optimist — Detail / 006" | It is an exterior terrace crop | `Terrace detail (crop of Result / 002)` — matches Field Notes' "Canopy detail" |
| E-24 | S2 | 381–382 | `site.webp`: "Existing Condition / Georgia — Field / 001"; alt "Freeman field condition" | Implies a Freeman jobsite and a Georgia location; both unknown | `COLLECTION · Existing building · Unrecorded` |
| E-25 | S2 | 386–387 | `square.webp`: "Field Detail — Artifact / 011"; alt "Construction detail" | A tool product image presented as a field detail | `REFERENCE · Rafter square` |
| E-26 | S3 | 336–392 | Record numbers `001, 014, 027, 002, 006, 001, 011, 031` | No register issues these; they're decorative and imply a body of records | Remove them, or use real Archive IDs |
| E-27 | S4 | 335, 391 | `barnsley.webp` shown twice, as `Result / 001` and `Record / 031` | One image with two record identities | One use per screen, one ID per image |

### 5.4 Direction studies: `main/directions/` (live, public)

| ID | Sev | File:Line | Currently shows | Problem | Correction |
|---|---|---|---|---|---|
| E-28 | S2 | `working-drawing.html` 297–300, 323 | Barnsley pool exterior labelled `FIELD PHOTO / 014`, with callouts "Existing masonry retained", "MEP coordinated above ceiling", "Finish datum held through room", and `Status: In Progress / 2026` | Fabricated technical annotations on a finished exterior portfolio photo | Add a study banner, `ILLUSTRATIVE LAYOUT — annotations are examples`, or pair a real drawing with a real field photo |
| E-29 | S2 | `sequence.html` 241, 245, 277 | "FIELD RECORD / NORTH GEORGIA — Before the wall closes." over `barnsley.webp` (finished, Adairsville) | Wrong place, wrong phase | Caption from the image's own record; drop "Field record" |
| E-30 | S1 | `sequence-v2.html` 356, 371; `sequence-v3.html` 97, 127, 129 | Steelwork as "Coordination / North Georgia — FIELD 05"; timber as "Framing + hidden systems — FIELD 03"; eyebrow "Freeman General Contracting / Field Sequence 001" | Presents the historical photo and a collection image as a Freeman field sequence | Reclassify as E-02 and E-03, and remove "Field Sequence 001" |

### 5.5 Earlier versions (not live at the root)

| ID | Sev | File:Line | Currently shows | Problem | Correction |
|---|---|---|---|---|---|
| E-31 | S3 | `v1-archive/studio/index-study/index.html` 389–390 | "FIELD NOTE / NO. 014 — Eleven-sixteenths." beside "Field evidence" | No source for the note or its number. Already retired in V2. | Keep it retired unless Freeman supplies the source |
| E-32 | S3 | `v1-archive/index.html` 21 (data in `app-core.js` L14) | "Archive. From the field · ongoing" over 26 Webflow "Tool" images, including Tool 16 (historical steelwork) and Tool 5 (product illustration) | Captions every image as "from the field". **Not visually verified** (CDN blocked). | Caption each item with its class. Import the files locally. |

### 5.6 Disclosed studies (minor refinements)

| ID | Sev | File:Line | Issue | Correction |
|---|---|---|---|---|
| E-33 | S4 | `main/record.html` 21, 27; `record-data.js` 9, 14 | The title "Barnsley Gardens" sits directly above the AI image; the disclosure is in a figcaption below it | Move the notice into the title block and add an `ILLUSTRATIVE` stamp beside the image |
| E-34 | S4 | `main/field-notes.html` 75 | Steelwork: "Historical reference from Freeman's records." `FIELD-NOTES.md` L25 says "not attributed to a Freeman job." | "Historical photograph held in Freeman's image collection. Not a Freeman project." |

### 5.7 Naming (repo-wide)

| ID | Sev | Finding | Correction |
|---|---|---|---|
| E-35 | S4 | Company name: "Freeman General **Contracting**" in 13 files on `main` (including `v3-study.html`, `record.html`, `field-notes.html`) vs "Freeman General **Contractors**" in 5 (including `index.html`, `radius-window.html`, and the Webflow logotype filename) | Pick one canonical name (Q-6) and use it everywhere |
| E-36 | S4 | Project name: "Barnsley **Resort**" in 7 files (`v3-study.html`, `archive/`, `directions/*`) vs "Barnsley **Gardens**" in 6 (`record.html`, `record-data.js`, `field-notes.html`, `app-core.js`). The Webflow source photo is named "Barnsley Gardens". | Confirm with Freeman (Q-1). My understanding is that the property now markets itself as Barnsley Resort, but this should be verified, not assumed. |

## 6. Questions for Freeman

These must be answered before the affected captions can be written as fact. Until then, the corrections above use `Unrecorded`.

| ID | Question | Unblocks |
|---|---|---|
| Q-1 | Barnsley: canonical name, Freeman's scope, year(s), and whether the project is active or complete? | E-05, E-17, E-36 |
| Q-2 | `site.webp` (Tool 25, red-brick building): which project, place and date? | E-04, E-13, E-24 |
| Q-3 | `timber.webp` (Tool 21): where was it taken, and is it Freeman work? | E-03, E-12, E-22 |
| Q-4 | `steelwork.webp` (Tool 16): is it a Freeman family or company historical photo, or acquired imagery? Where and when? | E-02, E-08, E-21, E-34 |
| Q-5 | `square.webp` / `angle-divider.webp`: Freeman-owned objects photographed by Freeman, or catalogue images? | E-25 |
| Q-6 | Canonical company name? | E-35 |
| Q-7 | Should the Archive be public, or internal and access-controlled? | Public exposure of E-08 to E-19 |
| Q-8 | The Optimist: year and photographer credit? | E-07, asset register |
| Q-9 | Are dated jobsite photographs available for any active project? This is what the system actually needs. | All `FIELD` content |

## 7. Correct practice already in the repo (use as templates)

- **`field-notes.html` L65:** "Illustrative study · AI-generated images, not documented Freeman construction." The disclosure sits beside the image, is explicit, and is in plain language.
- **`field-notes.html` L21, L29:** "Freeman image collection · Capture date unrecorded" / "Material reference". Unknowns are stated, not filled in.
- **`record-data.js` L14–39:** every moment is labelled `Placeholder`, and the alt text begins "AI placeholder:".
- **`radius-window.html` L34:** "AI-generated images with sample days and notes… Not verified field documentation." The wording is correct, but it's hidden in a collapsed `<details>`. Per the DNA spec §9.4, this should become a visible stamp.
- **`FIELD-NOTES.md` L17–27:** a per-image source map. This should become the Archive's provenance register.

## 8. Recommended remediation order

No changes have been made. This is the proposed sequence once approved.

| Phase | Findings | Rationale |
|---|---|---|
| **P0 — before any Freeman OS build** | E-01, E-02, E-08, E-09, E-14, E-20, E-21, E-30 | Remove all public misattribution of non-Freeman or AI imagery. Fix the two code paths (E-01, E-14) that generate misattribution automatically. |
| **P1** | E-03 to E-05, E-10 to E-13, E-15 to E-18, E-22 to E-25, E-28, E-29 | Correct project, subject and date errors; separate Barnsley and Optimist evidence; label prototype data |
| **P2** | E-06, E-07, E-19, E-26, E-27, E-31 to E-36 | Numbering, naming canon, minor wording, and the Webflow import |
| **Structural** | — | Create a single evidence register (one JSON/CSV) holding the §9 fields from `FREEMAN-DESIGN-DNA.md`. All pages read captions from it, so a caption can't drift between files again. |

**Principles for remediation**
- Reclassify, don't delete. All assets stay in the repo with their correct class.
- Prefer `Unrecorded` to a plausible guess.
- Each correction should be its own reviewed commit on a branch, with `main` updated only after approval.