# The Record — Beetlecat / Exploration 002

**Status:** isolated review prototype; production and The Record 001 unchanged.  
**Branch:** `study/the-record-beetlecat-002` (forked from `study/the-record-001`, commit `593c823`).

## The idea
One map mark opens into a record worth spending time with. Keep the drawing visible, but give the finished photography and published project account room to breathe. Every claim has a source; missing field evidence is explicitly missing.

## What the study adds
- Beetlecat-specific record sheet on desktop, and a fully scrollable bottom sheet on mobile.
- Four sourced photographs, selected by thumbnails, arrows, or phone swipe.
- A full-screen image viewer with arrow-key navigation and an Escape-to-close action that **does not** close the whole map record.
- Client, builder, venue, photographer and the exact published Freeman project summary.
- Evidence ledger: finished photography and published account on file; original drawings, field documentation, decision history and completion year **not yet on file**.
- Direct route: `/studies/the-record-001/?p=beetlecat`. All other projects use the unmodified 001 record template.

## Sources
Original project record: `v5/records.js`.
- Client **Rocket Farm Restaurants**; photographer **Jared Swafford**.
- Image assets already used by Freeman: `assets/project-0.jpg`, `assets/projects/beetlecat-1.jpg`, `assets/projects/beetlecat-interior-2.jpg`, `assets/projects/beetlecat-3.jpg`.
- Public venue location: 299 N Highland Ave NE, Inman Park, Atlanta — supplied and sourced in `sites.js`.
- Published project account is reproduced rather than inventing construction decisions, dates, trades, or design credits.

## Review checklist
- [ ] Desktop: the map is visible; project photography has priority; gallery controls and fullscreen viewer work.
- [ ] Mobile (390px): the sheet is readable, can be scrolled with one thumb, image swipe works, and the map stays visible above.
- [ ] Escape from image viewer restores image focus; Escape again closes record.
- [ ] Back to map restores the previous map position and zoom; browser back/forward works.
- [ ] The Optimist and entries with no photographs retain their existing templates.
- [ ] No project year, drawing, field evidence or decision is represented as verified without source.
- [ ] Signed-in and signed-out preview access is tested on relevant Cloudflare hostnames.

Run `node studio/the-record-beetlecat-002/check.mjs` for self-contained content checks. The existing `studio/the-record-001/check.mjs` browser suite should also be run when a browser with Cloudflare Access is available.

## To truly finish this record
Interview the project team. Collect approved drawings, construction photographs, change records, and one specific decision whose outcome can be seen in the finished space. Verify opening and completion dates before animating the timeline. A beautiful layout is the beginning; the original evidence is the work.

Do not merge into production before approval.
