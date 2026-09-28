# Freeman Project Record

Plain HTML/CSS/JavaScript. No dependencies or build step. The existing GitHub Pages workflow publishes these files unchanged.

Pilot: `record.html?project=barnsley-gardens`. Without a query, the pilot opens. Unknown slugs show a record-unavailable message; they never silently display another project.

## Content and provenance

Edit `record-data.js`. The Barnsley title, location, hospitality category, finished portfolio photograph, photographer and interior-design credits come from the existing `app-core.js`. The short statement is based on its description of work within an established resort.

No verified dated Barnsley field sequence was supplied. The fixed-view sequence reuses the explicitly illustrative AI study from the preceding prototype. It is not Barnsley photography. Labels use “Study”, not invented elapsed days. Dates remain empty and notes identify missing evidence. The existing Barnsley portfolio photograph appears separately in the Finished evidence section and is never represented as a matching frame.

The image-generation provenance and original prompt are in `record-assets/README.md`.

## Add a project

Add a key such as `beetlecat` or `the-optimist` to `projectRecords`, with its real title, location, type, status, statement, moments and finished view. Open `record.html?project=<key>`. No interface changes are necessary. Only Barnsley has a link from Projects in this release.

Each chronological `moments` entry has:

- `day`: verified elapsed-day label, or empty to use date / moment number.
- `date`: verified capture date, preferably `YYYY-MM-DD`; blank if unknown.
- `label`: concise stage name.
- `note`: one factual sentence.
- `image`: relative asset path or HTTPS image URL.
- `alt`: plain description of the photograph.

`finished` uses the same fields. Its image is the final timeline position and the hold target. Do not also put the same finished entry in `moments`.

The optional `imageRegion` exists only to display quadrants of the prototype contact sheet. **Remove it when adding a normal photograph.** Images display without cropping; match the framing and aspect ratio before adding them. Keep the original photographs separately.

Replace all demonstration images, labels, notes and the `sequenceNotice` together once verified evidence is available. If only some material is real, retain a clear notice identifying the placeholders.

Supporting evidence arrays are `references`, `decisions`, `fieldNotes`, `resolutions`, `finishedArtifacts`, and `returns`. Each accepts objects with optional `title`, `date`, `image`, `alt`, `note`, and `credit`. Empty arrays keep a restrained “Awaiting material” row. Attribution belongs with the artifact; do not imply Freeman designed work credited to another party.

`finishedArtifacts` may hold broader portfolio views. `finished` must be the matched view used for comparison. Keep them distinct.

## Behavior

- Opens at the second construction moment when available; never defaults to completion.
- Range input, keyboard arrows/Home/End, and moment buttons navigate the sequence.
- Holding the finished control with a pointer, Space or Enter temporarily shows the finished frame and note. Release, cancellation, focus loss and a hidden tab restore the selected moment.
- A missing finished image disables comparison; no construction moments produces a truthful pending state.
- Missing or failed images show text instead of a broken image. Reduced-motion preference removes the dissolve.
- More than six moments use a horizontally scrollable row of small labels; the range still covers the complete record.

## Capture protocol

Choose one safe, repeatable position; record camera height, lens and a reference frame. Assign one person. Return to the same position at meaningful changes, especially before work is concealed. Capture a photograph, retain its original date, log one observed fact and save it to the project folder. Return after completion using the same frame. No staging, marketing copy or bespoke page design is required per capture.

## Boundaries

`index.html`, `styles.css`, Company, Contact, Archive, Client Portal and the Pages workflow are unchanged. The only existing-code additions are a Barnsley record link and hash routing for the record's return navigation. The release is based on published main, not the separate unpublished monograph revision in the original checkout.
