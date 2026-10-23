# FreemanAI — Exploration 003: One Company, Many Perspectives

Branch `study/freemanai-003`, cut from the approved tag `archive/freemanai-002-approved` (3452257). It has no upstream and is pushed only with an explicit refspec.

- Page: `v5/studies/freemanai-003/` (a copy of 002, then changed). 002 itself is untouched.
- Local preview config: `freemanai-003`, port 8825.
- Screens from the rendered page: `studio/freemanai-003/screens/`.
- Fixture check: `node studio/freemanai-003/check-fixtures.mjs v5/studies/freemanai-003/fixtures.js v5/studies/freemanai-003/fai.js`

## The idea: one sheet, issued to different people

A drawing set already has a word for "the same drawing, given to different people for different work": it is **issued**. It might be issued for review, for bid or for construction. In 003 the same sheet is issued to a person, for a purpose:

| Perspective | Issued to (preview) | Issued for | Jobs (sample) | Project cost | Company financials |
|---|---|---|---|---|---|
| Owner | Gabe | Decision | All | All jobs | Open |
| Controller | Macee | Accounting | All | All jobs | Open |
| Project manager | Dillon | Coordination | 2604, 2607 | Own jobs | None |
| Superintendent | Jimmy, Mac or Cameron | Construction | 2604, 2612 | None | None |

The sheet number never changes with the reader. A-2604 is A-2604 for everyone, because the facts are the sheet.

## What changes, and what never does

**Universal.** These are the same for every perspective:
- The facts and their sources.
- The plan, the hatch and the pins.
- Which records disagree. Conflict pins are red for everyone.
- The time rule, the evidence drawers and the title block.

**By responsibility.** These change with the perspective:

1. **Reading order.** Each job has one list of facts (`FACTS`). A lens (`LENSES`) only chooses which facts to read, in what order. The first three facts are the lede. A lens cannot write its own claims, so two people can lead differently but never disagree.
2. **Layer.** A lens draws its own layer over the shared plan, the way discipline sheets share one base:
   - Decisions: the storefront cloud and turnover float.
   - Billing: billed against schedule per room, as dimension lines.
   - Coordination: who has the ball, plus V.I.F. marks.
   - Field: crews per room, the boarded north wall and V.I.F. marks.
3. **Dates on the time rule.** Each lens marks its own dates. The controller sees pay app dates; the superintendent sees inspections and rain.
4. **For you.** One action this person can start, with a trail. The superintendent's action opens Capture, already placed at door 104.
5. **Across the company.** One line from each of the other desks about what it is watching on the same sheet. These lines never carry a figure, so everyone can read them.

**Re-issue motion.** Switching perspective on an open sheet keeps the sheet and its scroll position. The base plan holds still. Only the layer is redrawn and the reading re-lettered, and the "Issued for" stamp presses again. The motion itself says that the facts did not change.

## The demonstration question: "What's happening at Etowah Mercantile?"

One discovery runs through all four perspectives. The client's own email says they will answer "early next week", and the glass deadline is Friday. These two records disagree.

| Perspective | What it leads with | What it can do |
|---|---|---|
| Owner | The deadline, the client's timing, the conflict. Then the float inference (13 → 9 days) and margin. | Ask Lena to set up the call. |
| Controller | Pay app 7 and the missing CO-009. Then an inference: the market hall is billed at 55% against a schedule near 76%, about $88,000 possibly unbilled. | Ask the site to verify. |
| Project manager | The deadline, the client and the conflict. Then the float, the change cost, the sill height V.I.F., the inspection and the bar top. | Ask the glazier to hold the slot. |
| Superintendent | Today's work and Friday's inspection. Then the sill height V.I.F., Sunday's rain on the boarded north wall, and what the client's delay means for the boards. | Capture the measurement. |

## Four kinds of statement, in drafting marks

| Mark | Meaning |
|---|---|
| Solid bubble | From the record. Opens the source. |
| Dashed underline and bubble | Inferred by FreemanAI. Opens its basis and the records it read. Becomes a record only when a person confirms it. |
| Red bubble and revision cloud | Records disagree. |
| **V.I.F.** (verify in field) | Not in the record. Names the person who would know, and offers to ask them or, on site, to capture it. |
| Hatched tag | Withheld for this view, with the reason ("Not on your assignment", or who reads it). |

A legend under each lensed reading teaches these marks. "Dashed" consistently means "not established": inferences, the PREVIEW tag, and the X of a sheet that is not on file.

## Money is three tiers, not a switch

- **Record.** Everyone reads it.
- **Project cost.** Change cost, budget, commitments and pay apps. The owner and controller read it on every job; the PM reads it on assigned jobs only.
- **Company financials.** WIP, margin and cash. The owner and controller read it.
- **Restricted.** Payroll and personnel. This tier is not in this sample at all.

A record that only contains a figure stays readable. For example, the superintendent can open PCO-012 and see the five-week lead time and the deadline, with the total hatched as "Project cost". A withheld line is drawn in place with its reason; it is never silently dropped. The PM asking about Pinecrest, a job they are not assigned to, sees "Project cost withheld / Not on your assignment".

## The selector: a transmittal, clearly a preview

The VIEW AS dropdown is replaced by a **transmittal**: the form a set is sent with. It has columns To / For / Jobs / Project cost / Company, and each row states its responsibilities as a working assumption. It opens from the top bar or from the "Issued to" row in the title block. Both carry a dashed PREVIEW tag. The note says it plainly: it is not sign-in, and it grants nothing. Production would recognise the person by Freeman sign-in, read their assignments and access on the server, and log every view.

## Also fixed

**Repaint crash from 002.** 002 wrote the sheet number over the project number when it painted (`spec.no = s.no`). So repainting a project sheet threw an error, whether from a role switch or from reopening it from the set index. 003 keeps the sheet number in `spec.sheet`. 002 is left as approved.

## Verified

- **Fixture check.**
  - Every fact cites existing records.
  - Every inference has a basis, and every V.I.F. names a person.
  - Dollar facts carry a tier, and briefs carry no figures.
  - The billing layer matches the schedule of values.
  - Every job with lenses has them for all four perspectives.
- **Scripted pass, desktop 1440×900 and phone 390×844.**
  - 4 perspectives × 9 questions (72 sheets), with every cite, inference and V.I.F. opened (860 drawers).
  - No project-cost figure reached the superintendent, or the PM off their jobs.
  - No company figure reached the PM or the superintendent.
  - No raw `{{…}}` marker, no claim of "live", and no console errors.
- **Flows.**
  - Lens actions file records and are remembered.
  - The superintendent's capture opens pre-placed.
  - V.I.F. verify files a record.
  - Re-issuing keeps the sheet and its scroll position.
- **002 regressions.**
  - Capture → PM escalate → owner approval with the eagle stamp.
  - The time scrub at both ends.
  - Apply precedent.
  - Reopening from the set index, then re-issuing.

## Still mocked

The same as 002: there is no model, nothing is live and the state is browser-only. Perspectives are hand-picked previews. Lenses exist for Etowah (2604) only; other jobs fall back to the 002 reading with the tier rules applied.
