# Field Notes

Open `field-notes.html` in the existing static site. No build or dependencies. The existing navigation gains one link; the page reuses `styles.css` tokens and typography. Page-specific rules stay in `field-notes.css`. Existing homepage, project content, and prototype files are preserved. Return links use the small hash-routing extension in `app.js`.

## Content

Seven semantic articles are authored directly in HTML. Moment, Pair and Sequence describe content behavior, not visible categories. To add a note, duplicate the appropriate article, assign a unique heading ID and folio, and supply a photograph, descriptive alt text, one factual observation, and a verified project/date when available. Choose size based on the evidence; ordinary phone images need not fill the page.

### Reusable primitives

- `entry moment`: one figure and an `entry-aside` containing folio, heading, observation and optional source. Reusable composition modifiers are `moment--lead` (large image with marginal caption), `moment--compact` (small image beside text), `moment--wide` (full-width image, caption below), and `moment--inset` (right-aligned image beside text). These are layout choices, not entry-specific selectors.
- `entry pair`: an `entry-heading`, two figures inside `pair-images`, and an optional shared observation/source. Use `pair--context` for detail/context photographs or `pair--artifact` for two uncropped reference objects. Width, offset and column balance are shared CSS variables.
- `entry sequence`: one static initial figure, scoped controls, and a `sequence-data` JSON block. Each record supplies `label`, `note`, `alt`, and either `position` for the illustrative sheet or `image` for an actual photograph. The controller derives the stage buttons, range maximum and count from that block. Each Sequence is independent; no global IDs are used to select its controls.

Copy a complete article, choose an existing composition, and update content. Keep IDs unique, including the range input and its label. No new CSS is required for another note of the same composition. Keep images' width/height attributes accurate and verify any observation against its source. Archive references must not imply verified Freeman jobsite evidence.

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

Four direct stage buttons and a native keyboard-accessible range. No autoplay, scroll interception or transition. The no-JavaScript fallback shows the frame and complete contact sheet. To use actual field captures, supply aligned individual image URLs in the article’s `sequence-data`, update the static initial frame and no-JavaScript fallback to match, add verified dates, and remove the illustrative notice only when all four frames are real.

## Review status

Design-review implementation on `field-notes/first-visual-pass`; not merged into main or published to the live site. The main content limitation is the lack of dated jobsite photographs and project drawings. Replace archive references with current job evidence as supplied. The current rhythm and controls do not depend on exceptional photography or animation.


## Navigation and verification

`field-notes-nav.css` styles only links directly inside `.freeman-nav`; it does not set navigation layout or override other sections. `styles.css` continues to own the existing site’s responsive navigation. Field Notes’ page-specific header layout stays in `field-notes.css`.

The `app.js` integration synchronizes existing section buttons, Home and project selection with browser history. Empty hashes restore Home; the six supported direct links are `#projects`, `#company`, `#archive`, `#contact`, `#optimist` and `#barnsley-gardens`. Other selected projects retain their index in history state under `#projects`. This preserves project selection when moving between existing sections. The named project aliases still depend on the existing project order; update their map if that order changes.

Refinement checks cover direct links, refresh, Back/Forward, return to Home and navigation to/from Field Notes at desktop, tablet and mobile widths. Sequence checks cover pointer and keyboard input, independent instances, reduced motion, and the no-JavaScript fallback. Existing Project Record files and uncommitted work are outside this refinement.
