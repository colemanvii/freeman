# Field Notes — first visual pass

Open `field-notes.html` in the existing static site. No build or dependencies. The existing navigation gains one link; the page reuses `styles.css` tokens and typography. Page-specific rules stay in `field-notes.css`. Existing homepage, project content, and prototype files are preserved. Return links use the small hash-routing extension in `app.js`.

## Content

Seven semantic articles are authored directly in HTML. Moment, Pair and Sequence describe content behavior, not visible categories. To add a note, duplicate the appropriate article, assign a unique heading ID and folio, and supply a photograph, descriptive alt text, one factual observation, and a verified project/date when available. Choose size based on the evidence; ordinary phone images need not fill the page.

The first pass uses existing assets only:

- 01: Tool 25, existing Freeman archive site photograph. Project/date unknown.
- 02: The Optimist portfolio photo and an explicitly described detail crop of that same image. Not before/after.
- 03: Tool 21, existing timber surface reference. Project/date unknown.
- 04: Prior AI-generated radius-window study. Explicitly illustrative, not a real Freeman/Barnsley sequence. Generation provenance is in `field-notes-assets/README.md`. Stage names replace fictional dates.
- 05: Tool 5 printed angle-divider illustration and Tool 1 layout square. An archive drawing/artifact pairing, not a project drawing or a claimed drawing-to-build relationship.
- 06: Existing Barnsley Gardens image. Portfolio photography and interior-design credits retained.
- 07: Tool 16 historical steelwork photograph. Historical reference, not attributed to a Freeman job.

Images in `field-notes-assets/` are optimized copies of these supplied/existing assets. Transparent outer margins were trimmed. The original source images are unchanged. The Optimist detail is a crop, clearly labeled. No dates, site decisions or project attribution were invented.

## Sequence

Four direct stage buttons and a native keyboard-accessible range. No autoplay, scroll interception or transition. The no-JavaScript fallback shows the frame and complete contact sheet. To use actual field captures, replace the contact-sheet background with aligned individual images, update labels/alt text in `field-notes.js`, add verified dates, and remove the illustrative notice only when all four frames are real.

## Review status

Local first pass for design review, not published. The main content limitation is the lack of dated jobsite photographs and project drawings. Replace archive references with current job evidence as supplied. The current rhythm and controls do not depend on exceptional photography or animation.
