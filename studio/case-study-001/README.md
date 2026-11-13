# Case Study 001

One reusable project case-study template, and one pilot: **Beetlecat**.
Branch `feature/case-study-001`, cut from production `ee4b6d8`. Not deployed.

## How it sits with the map

Nothing about the map changes. The map stays the index of projects; its sheet stays the summary.
The sheet's existing **Full project →** link already points at `/project-<slug>`. For a project with a
case study, that address now opens the case study instead of the photographs-only page.

- Same URL, so the sitemap, canonical link and the old Webflow redirects all still land correctly.
- **PROJECTS** in the section line and **× CLOSE** return to that project open on the map, as before.
- The foot of the case study links back to the project on the map and on to the next project.
- Projects without a case study keep their current page, untouched.

## The template

Opening (name, place, record, first photograph) → account → photographs in rows → foot.
The site's frame stays fixed; the sheet between the section line and the bottom edge scrolls.

| File | Role |
|---|---|
| `v5/case-study/studies.js` | Which projects have a case study; photograph order, captions, descriptions, row grouping |
| `v5/case-study/case-study.css` | The template's styles, scoped to `body[data-study]` |
| `v5/app.js` (`caseStudy`) | Renders it from the existing records; falls back to the current page if anything is missing |
| `v5/records.js` | `"caseStudy": true` on the project's record |
| `v5/project-beetlecat.html` | Description, share-preview tags, preload of the first photograph |

### To add another project

1. Add its entry to `v5/case-study/studies.js` (photographs must already be in `record-assets/photos.js`).
2. Add `"caseStudy": true` to its record in `v5/records.js`.
3. In its `project-<slug>.html`, copy the description / `og:` tags / preload / four extra tags from
   `project-beetlecat.html` and change the project-specific values.

The page shells are edited by hand. `v5-source/generate.py` is stale and must not be run.

## Evidence rules (unchanged from Project Story 001 and Monograph 001)

The template writes nothing. Every word on the page comes from a record Freeman already published:

| On the page | Source |
|---|---|
| Name, number, type, account | `v5/records.js` |
| Address, neighbourhood | `v5/record-assets/sites.js` (OSM address point, cross-checked) |
| Hospitality operator, photographer | `v5/project-credits.js` (verified 26 Oct 2026) |
| General contractor | Freeman's published account: "Freeman GC led construction" |
| Captions, image descriptions | What is visible in each photograph, and nothing about who designed or made it |

The account is Freeman's published text word for word; its first sentence is set large. The check
suite compares the two strings.

## Not on file for Beetlecat (left off the page, not filled in)

- Completion year, start and handover dates
- Floor area, contract value, schedule
- Architect / interior designer (no design credit has been published)
- Scope detail: what was new, what was existing, which trades were self-performed
- Construction photographs, drawings, field notes
- A statement from the client
- Whether "Hospitality operator" is the role Rocket Farm Restaurants wants shown
- A verified site for the photographer, Jared Swafford (shown without a link)
- Photograph originals above 1920 px, and the photographer's permission for crops

## Muchacho Decatur (second case study, 13 Nov 2026)

Same template, no design changes. Six photographs: the front of the house as the opening plate, then
front room + bar, door + cased opening, and one detail.

### Photographs

- **Source:** the Freeman Photographs Drive folder (`1oTSehQllUmR-f-amymYXjY114EP0SqXT`), uploaded Saturday
  7 Nov 2026. The files here are the 2400 px copies made that day in `~/Sites/freeman-photographs/v5/photographs`
  (frames 06, 08, 07, 05, 11, 12 of that set). The set is mixed: Barnsley and Muchacho frames together.
- **Already public:** every frame is in the public Photographs section.
- **Left out:** the second exterior (duplicate, more guests), the ribbon-cutting (an event photograph of people),
  and the wall light (no evidence it is Muchacho, and the weakest frame).
- Sized copies were added with `studio/case-study-001/add-photos.mjs`, which leaves existing entries alone.

### What is verified

| On the page | Source |
|---|---|
| 129 Church St, Downtown Decatur | What Now Atlanta, 4 Nov 2026; OSM building way 48296311; "129" on the door in plate 01 |
| Electric Hospitality (hospitality operator) | Freeman's published credit; What Now Atlanta names it as Muchacho's owner |
| BLUR Workshop (interior design) | Freeman's published credit only (see below) |
| It is a house | Visible in plate 01; What Now Atlanta: "renovated 1940 Craftsman bungalow" |

The map record changed with this: Muchacho was an approximate ring ("site to be confirmed") and is now placed at
its address.

### The account is new writing and needs approval

Freeman had published no account for this project. The four sentences on the page were written for this branch.
They state only what is visible in the photographs, a general truth about working in an existing building, and
the published credits. They are in `records.js` (`summary`), so the map sheet shows the same words.

### Needs confirmation before release

1. ~~The building's age.~~ **Settled 13 Nov 2026:** Cole confirmed 1940 (as What Now Atlanta reported), not a
   century. The account now says "a house built in 1940".
2. **"Historic".** No historic designation was found. The page does not use the word.
3. **BLUR Workshop on Decatur.** BLUR's own site lists only "Muchacho at Hemphill" (West Midtown), as architecture
   and interior design. Its role on Decatur rests on Freeman's record alone. Was BLUR also the architect here?
4. **Freeman's scope.** What was kept, what was replaced, what was new: windows, doors, trim, floors, porch,
   structure, services, kitchen, the outdoor space. Nothing is on file, so the page claims none of it.
5. **The door plate (04).** No sign or address in frame; placed by its position in the 7 Nov set and matching
   paint. Confirm it is Muchacho Decatur.
6. **Photographer.** Not on file; no credit is shown.
7. **Capture date.** The files carry no date; 7 Nov is the upload date (the opening weekend ran 6 to 8 Nov).
8. **Guests in frame.** Plates 02 and 03 show identifiable guests, as the Photographs section already does.
9. **Dates, floor area, seat count, contract value, prior tenant work** (the building was Revival before).

## Checks

```
PW=<path to node_modules/playwright> BASE=http://127.0.0.1:8921 node studio/case-study-001/check.mjs
PW=<path to node_modules/playwright> BASE=http://127.0.0.1:8921 node studio/case-study-001/shots.mjs
```

13 Nov 2026: `check.mjs` 379/379 (Chromium and WebKit; 1600×900 @2x, 1440×900, 1280×720, 1024×768,
iPhone 13, iPhone SE, Pixel 5). `studio/map-directory-001/check.mjs` 235/235 on this branch.

Weight of the page (JS + CSS + photographs, compressed): about 550 KB on a 1280 laptop, 780 KB at
1440, 1.3 MB on a 3× phone, 1.75 MB on a 2× 1600 desktop (which receives the four 1920 px originals).

## Known limits

- **Photograph resolution.** The originals are 1920 px wide. Plates are sized so that every screen
  tested gets at least 0.74 file pixels per screen pixel; larger plates would look soft on high-density
  desktops. Full-bleed photographs need larger originals from the photographer.
- **The page scrolls.** The 20 Oct rule was one static screen everywhere. Photographs has scrolled
  since 7 Nov; this page follows it. The opening is composed as a complete first screen.
- **No enlarge-on-click.** Photographs are already near the limit of their files.
- **No JavaScript, no content.** As with every page of the site, the shell is empty until `app.js`
  runs. Share previews work (tags are in the shell); the prerender in `proposals/context-score-001`
  would fix crawlers and is not part of this branch.
- **Phone header, pre-existing in production:** on a 390 px phone CONTACT and × CLOSE overlap on every
  project page (28 px). Not introduced here and not changed here.
