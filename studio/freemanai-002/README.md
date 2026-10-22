# FreemanAI — Exploration 002: A Living Company

Issue colemanvii/freeman#67. Branch `study/freemanai-002`, cut from the production release (16019bc). It has no upstream and is pushed only with an explicit refspec.

- Page: `v5/studies/freemanai-002/`
- Local preview config: `freemanai-002`, port 8823

Exploration 001 (`study/freemanai-interface-001`) is untouched, for comparison. So are production, `main`, deployment settings and the ACCESS entry.

## The idea: the company as a drawing set

Freeman already has a shared visual language that every person on a job reads fluently: the construction drawing. FreemanAI 002 answers in that language. You ask one question ("What's happening at Freeman?" or anything else), by typing or speaking, and the surface plots a **sheet** in answer.

- **Title block.** Every sheet has one: sheet number, date, viewing role, source count and status.
- **Evidence as detail bubbles.** Every claim carries a numbered bubble, the way a drawing points to a detail elsewhere in the set. Tapping one opens the source beside the moment it supports, with the cited passage marked in Freeman red.
- **Revision clouds.** Unresolved or conflicting records are drawn inside a red revision cloud with a delta, the drafting mark for "this changed, look here."
- **A drawing set.** The questions asked in a session become a set index in the title block, each one a sheet you can return to.

Nothing here is a dashboard tile, a chat bubble or a tab. The question chooses the sheet.

## The signature interaction (15 seconds)

1. Ask "What's going on with Etowah Mercantile?" The plan plots itself: gridlines, rooms, then pins where field reports, photographs and RFIs happened.
2. **Drag the date.** The building fills with hatching room by room as work progresses. Pins appear on the day they were recorded, and the record list rewrites itself for that day.
3. Drag back to May: an empty shell. Drag to December: a finished building.

The same rule replays the company's morning on the pulse sheet.

## The four journeys

| Journey | Ask | Sheet |
|---|---|---|
| Company pulse | "What changed across Freeman today?" | G-001 |
| Project deep dive | "What's going on with Saltmarsh?" | A-2607 |
| Institutional memory | "Have we dealt with this duct problem before?" | D-501 |
| Capture to decision | Red CAPTURE button | F-0413 |

- **G-001 Company pulse.**
  - A schematic map of the work area with every job.
  - A dispatch from 06:00 with the person behind each entry.
  - What needs a person, with an owner and a date.
- **A-xxxx Project deep dive.**
  - The plan, the time rule, the record to date, what's next, and the people.
  - Evidence is one tap from any pin.
- **D-501 Institutional memory.**
  - This job's failed roof-curb detail beside the 2024 precedent's, drawn as sections.
  - What it cost each time: four days against one.
  - Why the precedent matches, what can be reused, and **Apply to Pinecrest**, which files it to a project manager.
- **F-xxxx Capture to decision.** On a phone, in four gestures: Capture, tap the plan, hold to talk, send.
  - The note becomes a field record with a grid reference.
  - It routes to project manager review, then to an owner decision if escalated.
  - Each step is stamped. The owner's approval is pressed with the Freeman eagle.
  - The record joins the project plan and the morning dispatch.

## Honesty rules the prototype keeps

- **Status.** Every sheet says whether it is from the record, disagrees, is not on file, or is restricted. It never guesses: an unanswerable question draws an X-ed "NOT ON FILE" sheet and offers to send the question to a person.
- **Labels.** Everything is labelled sample and fictional; nothing is called live.
- **Clock.** "Now" is fixed at Thursday 22 October 2026, 07:42, and every timestamp agrees with it. Actions advance a simulated clock.
- **Finance.** Content appears only for the owner and controller views, including inside evidence. The project manager and superintendent see a "withheld" marker, or a restricted sheet if they ask about money.
- **People.** Real staff names (Gabe, Macee, Dillon, Jimmy/Mac/Cameron) appear only in the role switcher. Every event and quote belongs to a fictional person on a fictional job.

## What is mocked

- **No model.** Questions are routed by keyword to composed sheets, and the answers are pre-written against the sample record.
- **No live connections.** Nothing connects to Procore, BuildingConnected, accounting, email or a shared database. Each source shows which system would hold it in production.
- **Browser-only state.** Records persist in this browser only (`localStorage`). RESET is in the title block.
- **Voice.** It uses the browser's speech recognition where available. If it hears nothing or is blocked, a labelled sample dictation is typed in.
- **Photos.** They stay in the browser. Sample photographs are drawn placeholders, never stock images.

## What production would need

- Server-side role-based access; the switcher here only simulates views.
- An append-only audit log.
- Consent, retention and release controls for photographs and voice.
- Real retrieval over the systems of record, with citations to real document IDs.

## Verified

- **Desktop 1440×900 and phone 375×812.**
- **Fixture check** (`studio/freemanai-002/check-fixtures.mjs`): every date is on or before now, every citation exists, and plans and milestones sit inside each job.
- **Scripted pass:** 4 roles × 12 questions (48 sheets) with every evidence drawer opened. No finance figure reached the project manager or superintendent, and no sheet claims to be live.
- **Capture loop:** walked end to end — capture, review, escalate, approve — with consistent stamps and trail.
