# American Gothic live study — what changed and why

Branch `study/american-gothic-001`, cut from `origin/release/approved-v5-2026-10-18` at 80bd97d
(the build freemangc.com serves). Production files are untouched except for one added line in the
`<head>` of each page: Libre Franklin from Google Fonts, `american-gothic/american-gothic.css`, and
`american-gothic/toggle.js`. No generator was run.

## How it works
- Every rule lives under `html[data-type="gothic"]`. **Monaco mode removes the attribute**, so the
  production CSS applies untouched. Real-Chrome captures of Monaco mode are pixel-identical to the
  unmodified release on 11 of 12 screens; the twelfth (phone map) differs by a few pixels of the
  map's own animation timing.
- Switch: the tab on the right edge, the `T` key, or `?type=gothic` / `?type=monaco` in any URL.
  The choice is remembered across pages. `?clean` hides the switch.
- Face: Libre Franklin (Impallari Type), SIL Open Font Licence — free to use and embed on the web.
  Variable weights 300–700, roman and italic. Nothing falls back to a system substitute; every
  capture reports "Libre Franklin" as the rendered family.

## What stays exactly as production
Signature and its animation, eagle, layout, positions, colours, palettes, rules, photography,
copy, navigation, hover states, map behaviour, phone layouts. Element positions were measured in
both modes: the signature, swatches and every text baseline sit at the same coordinates.

## Typographic adjustments (the only differences)
| Role | Monaco (production) | American Gothic | Why |
|---|---|---|---|
| All text | Monaco / Menlo | Libre Franklin | the study |
| Small caps: nav, labels, captions | 400, +.035–.04em | **500**, +.075–.09em | Franklin's caps need space given back and one step of weight to hold Monaco's grey at 9–11 px |
| Legal, Built for Generations | 9 px, +.04em | 9 px, 500, +.075em | same |
| FREEMAN GENERAL CONTRACTING (first line of legal) | same as line 2 | **600** | the name a step firmer than the town, the only place words share the frame with the signature |
| Entrance nav under the signature | 12 px, +.035em | 12 px, 500, +.1em | same size, so the group stays centred on the script as composed |
| Statements (Built for generations. / Places we've built.) | 400, 0 / −.045em | **400**, −.018 / −.022em, tighter leading | strength from proportion, not weight; mono's negative tracking is far too tight for Franklin |
| Project name (detail) | 13 px caps, +.04em | 13 px caps, **600**, +.055em | the one place weight carries authority |
| Plate names | caps, −.035em | caps, 600, +.005em | |
| Company body | 13/1.75, 520 px box | **14.5/1.6, 34em measure**, `text-wrap:pretty` | Franklin sets ~80 characters in Monaco's box; the measure brings it back to ~68 and avoids one-word last lines. The box does not move |
| Credits (detail) | 10 px | 11 px | Franklin is narrower and lighter at 10 px |
| Counters, register numbers | mono figures | tabular lining figures | keeps 01 / 04 and columns steady |
| Phones | Monaco Lineage scale | same sizes, re-spaced; body 14.5/1.56; credits caps 500 | |

Nothing is heavier than 600 except the bold production already asks for.

## Evidence
`studio/american-gothic-001/screens/` — 24 Chrome captures: 6 pages × desktop (1440×900 @2×) and
phone (390×844 @3×, touch) × both faces. Re-run with `node studio/american-gothic-001/capture.mjs`.
