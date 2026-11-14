# Freeman Folio — second iteration (study 003)

Muchacho Decatur, rebuilt after the creative review of study 002. Same branch
(`claude/freeman-case-study-system-fcz54e`), new directory. Study 002 in `v5/folio/` is unchanged.
Not merged, not deployed, not linked from any published page, `noindex`.

- Prototype: `v5/folio-2/muchacho-decatur.html`
- Screens: `studio/case-study-system-003/screens/`

Serve `v5/` (`python3 -m http.server 8921` inside it) and open `/folio-2/muchacho-decatur.html`.

## What changed from study 002

| Review finding | Change |
|---|---|
| Nine leaves for six photographs; three turns did not pay off | Five leaves: Cover, The front, Inside, Openings, Record |
| A near-empty text leaf straight after the cover | The first sentence is now the lead beside the porch photograph, where the reading of the front begins |
| The two weakest photographs shown largest | One plate, **Openings**: window, opening, doorway, door, each cropped square to its casing, at one size, beside the sentence about new work meeting existing walls and trim |
| Interiors looked dim on white | Outside is set on white, inside on a dark ground. Turning from the front to the bar changes the light of the whole page |
| Ended on décor, then a table | The sideboard is no longer a leaf. The last leaf is the record, with all six photographs shown whole |
| Layouts were one idea mirrored | Each of the five leaves has its own composition; the name is set large at the foot of the cover |

Kept from 002: reading a photograph by its details, the index of live miniatures, the turning, the evidence
rules, the account word for word.

New in the system: `ground: "dark"` on any leaf; `lead` (a larger passage) on a plate; a passage under a band;
the `typology` leaf (matched crops, each `{ plate, name, view }`); `plates: true` on the colophon; any
photograph seen whole (click a crop or a thumbnail; arrows step, Escape returns).

## What this iteration still does not have

Nothing has been added to the material. There is still no drawing, no construction photograph, and no word
from the people who built it, so the folio still shows a finished building, not how it was made. The crop
names say what is visible (window, opening, doorway, door); whether each is original or new is not on file
and is not claimed. The interview guide and asset checklist are the route to that.

Open before release, unchanged: approval of the account; BLUR Workshop's role; confirmation that the door
plate is Muchacho Decatur; the photographer's name and permission, which matters more now that four frames
are cropped; guests identifiable in two crops.

## Checks

```
BASE=http://127.0.0.1:8921 node studio/case-study-system-003/check.mjs
BASE=http://127.0.0.1:8921 node studio/case-study-system-003/shots.mjs
```

14 Nov 2026: 347/347 in Chromium (1600×900 @2x, 1440×900, 1280×720, 1024×768, iPhone 13, iPhone SE, Pixel 5,
reduced motion). Study 002 still 993/993. **WebKit and Firefox were not run.**

## Known limits

- On a phone the porch photograph on leaf 02 is small, because the lead, the passage and the detail keys share the screen.
- Crops are taken from 2400 px files; the window and the opening are about 880 px across and are soft on large high-density screens.
- The dark ground is a new colour for the site (`#17140f`) and needs a decision against the site's palettes.
