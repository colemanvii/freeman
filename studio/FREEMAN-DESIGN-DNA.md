# FREEMAN DESIGN DNA

**Status:** Draft for approval · October 8, 2026
**Applies to:** Freeman OS (internal) and all future Freeman public surfaces
**Foundation:** `main/v3-study.html` + `main/archive/index.html`
**Relationship to `DESIGN-DOCTRINE.md`:** The doctrine stays as the statement of intent. Where the two conflict, this specification governs. The known conflict is that the doctrine warns against "generic sans-serif rebrands," and this spec adopts a grotesk.

---

## 1. Position

Freeman is an institution with a body of work, accumulated evidence and memory. The interface is the record's paper, rules and index. It never becomes the subject.

- **The work is the brand.** Photography and evidence carry the identity. Chrome stays quiet.
- **Sheets, not pages.** A screen is a sheet in a record set, like a drawing or a ledger page. It is not a marketing page or a dashboard.
- **Every claim is sourced.** If a fact or image cannot be sourced, it is labelled as unsourced or it is not shown (see §9).

## 2. Lineage: what each source contributes

| Source | Keep | Leave behind |
|---|---|---|
| `main/v3-study.html` | Evidence field plus metadata rail, the bottom-anchored statement, the record header, the orange portal dot, keyboard navigation, zero decorative motion | 7–9px type, `overflow:hidden` on body, the static "Builder" field (L234), image filter (see §8) |
| `main/archive/index.html` | Search as the entry point, the ledger row, the record taxonomy (Finished Result → Quotes/Proof), label/value facts, numbered sections, the detail overlay | 7–10px type, mixed data types in one column, hard-coded detail facts (L112) |
| `main/index.html` | The slash index nav for top-level navigation | Trailing slash and orphan wrap on mobile, the dead `COMPANY` link |
| `studio/index-study/` (V1, V2) | The orange stamp as a highlight on a word ("COMMERCIAL", "FROM PROCORE") | Monaco-only typography |
| `work-panel*.html` | Numbered list rows with right-aligned category tags | Arial/Georgia pairing, 8.5–9.5px labels, orange on many states |
| V1 / `v3` branch / V4 | Nothing structural. The sentences "The result proves taste. The evidence proves capability." and "The work before it disappears." | Baskerville, rounded images, pills, tinted boxes, long-scroll collage |

## 3. Color

Five tokens. No others.

```css
--paper:  #f4f5f5;  /* V3 / Archive field */
--ink:    #111415;  /* V3 / Archive ink — 16.9:1 on paper */
--muted:  #666b6e;  /* replaces #7b8083 (3.66:1, fails AA) — now 4.94:1 */
--rule:   #dde0e1;  /* hairlines only, never text */
--signal: #ff5a1f;  /* the single Freeman orange (V3 / Archive value) */
```

Two working surfaces are derived from these and used only for hover and empty image wells: `--paper-2: #eceeee` (V3 hover) and `--well: #e8eaeb` (V3 image background).

**Retired values:** `#e75a28`, `#f05a28`, `#ef3e23`, `#f15b2a`, `#d85a16`, `#f2efe8`, `#f3f4f1`, `#f4f4f1`, `#f4f5f1`, and the `#9aa0a3` placeholder grey (2.42:1).

**Signal rules.** Orange on paper measures 2.85:1, which fails even the large-text threshold. Therefore:

1. Orange is never used for text on paper, at any size.
2. Orange may be a **dot** (5–6px), a **rule** (2px), or a **stamp fill** carrying `--ink` text (5.93:1).
3. Orange means one thing: **a human needs to act or look.** Examples: a decision pending, an item needing attention, an illustrative image, the client portal entry point.
4. At most one stamp per viewport region. If everything is orange, nothing is.

## 4. Typography

Two voices. No serif in product UI.

| Role | Voice | Use |
|---|---|---|
| **Statement / name** | Grotesk | Headlines, project names, record titles, values, body |
| **Record / metadata** | Monospace | Labels, record numbers, dates, coordinates, dimensions, status, provenance lines |

**Faces (open item O-1).** Choose licensed faces that are self-hosted as WOFF2, so the identity renders identically on macOS, Windows and Android. Until they are chosen, use the stacks below, which match current V3 behaviour.

```css
--grotesk: "Helvetica Neue", Helvetica, Arial, sans-serif;
--mono:    Monaco, "Courier New", monospace;   /* weak on Windows — resolve with O-1 */
```

### Scale

This is V3 and Archive scaled up for readability. Nothing in the system is smaller than 12px.

| Token | Desktop | Mobile | Line height | Tracking | Weight | Voice | Source |
|---|---|---|---|---|---|---|---|
| `display-1` | clamp(56px, 6vw, 96px) | 40px | 0.9 | −0.055em | 400 | grotesk | V3 `.tagline`, Archive `h1` |
| `display-2` | clamp(40px, 4.4vw, 72px) | 34px | 0.92 | −0.05em | 400 | grotesk | Archive `.projectHead h2` |
| `heading` | 24px | 21px | 1.15 | −0.02em | 500 | grotesk | Archive `.sectionTitle h3` (was 19px) |
| `body` | 17px | 16px | 1.45 | −0.01em | 400 | grotesk | Archive hero `p` (was 16px) |
| `value` | 15px | 15px | 1.3 | 0 | 400 | grotesk | V3 `.v` (was 9px) |
| `label` | 12px | 12px | 1.2 | +0.08em, uppercase | 400 | mono | V3 `.k` (was 7px) |
| `record-id` | 13px | 13px | 1 | +0.04em | 400 | mono, tabular | Archive `.eyebrow` |

**Rules**
- Hierarchy comes from scale, placement and spacing. Bold is reserved for the wordmark and for one emphasis per block.
- One `display-1` per screen.
- Numbers in tables and ledgers use tabular figures.
- Lines of `body` text stay between 45 and 75 characters (`max-width: 68ch`).
- The wordmark is `FREEMAN` in grotesk 700, tracked −0.045em (V3 `.wordmark`), at 16px in the OS.

## 5. Space and grid

**Spacing scale (px):** `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`

| | Desktop | Mobile |
|---|---|---|
| Outer margin | 24 | 16 |
| Header height | 56 | 48 |
| Gap, field to rail | 0, separated by a 1px rule | n/a (rail stacks below) |
| Section padding | 32 top/bottom | 24 |

**The core grid** is the evidence field plus rail: `grid-template-columns: minmax(0,1fr) 280px`. The rail grows from V3's 190px to fit the larger type. On mobile it collapses to a stacked rail below the field, showing three facts with a "More" control. V3 currently hides facts 4 and onward with no way to reach them.

**Structure is drawn with 1px `--rule` lines only.** No shadows, no corner radius (the only exception is the circular signal dot), no filled containers, no cards, no pills.

## 6. Layout patterns

### A. Sheet (viewport-composed)
For a single object: home, record cover, evidence plate.
`header / field + rail / footer statement`, sized `min-height: 100dvh`.
- **Scroll fallback.** If the viewport is shorter than 680px, or the content doesn't fit, the sheet scrolls. Never use `overflow: hidden` on `html`/`body`. This fixes V3 L17.
- The footer carries one `display-1` statement, left-aligned, sitting on the bottom margin.

### B. Ledger (scrolls)
For an index of records: Archive home, evidence lists, decision logs.
- The search field comes first: full width, an underline in `--ink`, `body` size, mono placeholder in `--muted`.
- Rows are separated by rules. Columns: `96px thumb | record-id + name | place | sector | date/status`.
- **One data type per column.** A date column holds dates or `Unrecorded`, never a word like "Record". Archive currently mixes them (L88).
- The whole row is the hit target. Rows that aren't ready yet show `label: NOT YET ASSEMBLED` and no hover. Today, Archive rows 002 and 003 look clickable but do nothing (L110).
- **Empty state.** `No records match "window".` followed by suggested filters. Never a blank area.

### C. Record (cover sheet, then scrolling body)
The cover is a Sheet with title block facts. The body uses the Archive's numbered sections in fixed order:

`01 Finished Result · 02 Field Evidence · 03 Hidden Work · 04 Decisions · 05 Drawings + Reality · 06 People · 07 Lessons · 08 Quotes / Proof`

- Empty sections stay in place, showing an empty state ("No hidden-work records yet"). Gaps in the record are information, so they are not hidden.
- The project sequence uses the README order: `Reference → Decision → Field → Resolution → Finished → Return`.

### D. Plate (overlay)
For a single piece of evidence: the image at full field width, plus a rail with all provenance fields (§9). `Esc` closes it, and arrow keys move to the previous and next items. The facts come from the item itself, never from the parent page. Archive L112 currently hard-codes Barnsley onto every item.

## 7. Components

| Component | Spec | Origin |
|---|---|---|
| **Title block header** | 3 columns: wordmark (left) · current record ID in mono `label` (centre) · nav (right). A rule below. | V3 `.top` |
| **Slash index** | `FREEMAN / ARCHIVE / RECORDS / PEOPLE / DECISIONS` in mono 14px; slashes in `--muted`; the active item in `--ink` with a signal dot. Wraps whole items only, never leaving a trailing slash. | `main/index.html` |
| **Metadata rail** | A stack of label/value pairs separated by rules. Labels use `label`, values use `value`. | V3 `.side` |
| **Fact row** | `label` column 96px + `value`. | Archive `.fact` |
| **Ledger row** | See §6B. Hover changes the background to `--paper-2` over 120ms. | Archive `.row` |
| **Evidence plate** | An image (`object-fit: cover` in the ledger, `contain` in the plate overlay), then a rule, then the **provenance line** in mono `label`. | Archive `.card` + §9 |
| **Stamp** | `--signal` fill, `--ink` text, mono `label`, padding 2px 6px, no radius. | V1/V2 index study |
| **Signal dot** | 6px circle in `--signal`, placed before a label. | V3 `.portal:before` |
| **Sequence strip** | 2–6 frames, equal size, in one row; mono stage labels beneath. | Field Notes 04, V4 contact sheet |
| **Section head** | `record-id` number (48px column) + `heading`. | Archive `.sectionTitle` |
| **Statement** | `display-1`, one per screen, sourced from Freeman language. | V3 `.tagline` |
| **Control pair** | ← / → as two cells split by a rule, 44px tall. | V3 `.controls` (was 30px) |

**Status vocabulary (OS).** `ACTIVE · NEXT · HOLD · DONE` are set in mono `label` and `--muted`. Only `DECISION NEEDED` and `ATTENTION` get a stamp. This replaces the Work Panel's use of orange text for `NOT STARTED`, `BUILDING`, `NEEDS WORK` and `DON'T IGNORE`.

## 8. Photography

- **Evidence is shown, not styled.** No filters on FIELD evidence. V3's `contrast(1.035) saturate(.92)` (L83) may be kept on PORTFOLIO hero images only, if approved. Evidence images are never cropped in the plate view.
- Show the image at full field width, with no border radius and no caption overlaid on the image. Captions sit below or in the rail. The single exception is the frame index (`01 / 06`), which V3 places in the image corner using `mix-blend-mode: difference`.
- Use real portfolio photography for finished results, and credit the photographer every time.
- An image may appear only once per screen.
- Store images locally in the repo or in the OS asset store. Never hotlink to the Webflow CDN.

## 9. Provenance (required on every image and claim)

Every piece of evidence carries exactly one class:

| Class | Meaning | Allowed in Archive / public | Builder = Freeman? |
|---|---|---|---|
| `FIELD` | A verified Freeman jobsite photograph with project and date | Yes | Yes |
| `PORTFOLIO` | Finished Freeman work by a credited photographer | Yes | Yes |
| `COLLECTION` | From Freeman's image collection; project and/or date unknown | Yes, with "Unrecorded" values shown | No |
| `REFERENCE` | Historical, product, precedent or third-party image; not Freeman work | Reference sections only | No |
| `ILLUSTRATIVE` | AI-generated, mock or composited | **No.** Studies only, always stamped | No |

**Required fields:** `id`, `class`, `project` (or `Unattributed`), `place`, `date`, `phase`, `subject`, `source` (photographer, collection ID, or generator), `verified_by`.

**Provenance line format** (mono `label`, below every image):
`PORTFOLIO · BARNSLEY RESORT · ADAIRSVILLE, GA · PHOTO: JARED SWAFFORD · DATE UNRECORDED`

**Rules**
1. Never fill an unknown value with an estimate. Show `Unrecorded`.
2. "Builder: Freeman" appears only for `FIELD` and `PORTFOLIO`.
3. Record numbers are issued by the Archive register. They are never decorative. V4's `Field / 014`, `Evidence / 027` and similar numbers are not records.
4. `ILLUSTRATIVE` items carry an `ILLUSTRATIVE` stamp next to the image, not in a collapsed footer.
5. A project record contains only that project's evidence.
6. A placeholder value such as "Mock record" is never shown as a fact. Use an `EMPTY` state.

## 10. Motion and interaction

- **Default: none.** Allowed: a background change on row hover (120ms), an image swap (instant, or a fade of 150ms or less), and an overlay that opens instantly.
- No scroll choreography, parallax, reveal-on-scroll or floating elements.
- **Keyboard:** `←/→` move through sequences, `Esc` closes overlays, `/` focuses search. V3 and Archive already support the first two.
- **Focus:** a visible 2px `--ink` outline with a 2px offset on every interactive element.
- Hit targets are at least 44px tall on touch screens.

## 11. Writing

- Short declaratives. Complete sentences in the body, fragments only in labels.
- No marketing adjectives ("premier", "world-class", "seamless").
- Statements must come from Freeman's own language or be approved by Freeman.
- **Canonical names (open item O-2):** the company name and project names are fixed in one register and used everywhere.
- Mono labels are uppercase. Grotesk is sentence case. Avoid all-caps grotesk except for the wordmark.

## 12. Freeman OS screen set (Archive-first)

| Screen | Pattern | Entry |
|---|---|---|
| **Archive** (home) | Ledger | Search: "Search project, material, person, condition, detail…" |
| **Project record** | Record | From a ledger row |
| **Evidence plate** | Plate | From any image |
| **Decisions log** | Ledger | Slash index |
| **People / knowledge holders** | Ledger | Slash index |
| **Intake** (new evidence) | Sheet with form | Requires a provenance class before saving |
| **Work Panel** | A view inside the Archive (weekly plan) | Slash index |

**Refused in the OS:** icon sidebars, KPI tiles, avatar stacks, multi-colour status chips, charts without a stated question, and modal wizards.

## 13. Decision test

Before shipping any screen:

1. Could it appear in a generic SaaS or architecture-studio template with the logo swapped? If so, revise it.
2. Is every image classed and every fact sourced? If not, it doesn't ship.
3. Is any text below 12px, or any text in orange? Fix it.
4. Is orange used for anything other than "a human needs to act"? Remove it.
5. Does it work at a 1280×720 viewport and at 390px width, with scrolling where needed? It must.

## 14. Open items

| ID | Item | Owner |
|---|---|---|
| O-1 | Licensed grotesk and mono faces, with self-hosting rights | Freeman / design |
| O-2 | Canonical names: "Freeman General Contractors" vs "Freeman General Contracting", and "Barnsley Resort" vs "Barnsley Gardens" | Freeman |
| O-3 | Whether the PORTFOLIO image filter is kept (§8) | Design |
| O-4 | Whether the Archive is public or internal (it is currently linked from the live `main/index.html`) | Freeman |