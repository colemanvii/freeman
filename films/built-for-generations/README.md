# Built for Generations — a five-month documentary experiment

The pitch to Gabe Freeman for a five-month trial of an original documentary series. Creative Director:
Cole Calfee. Proposed production partner: Cusick Media. 14 November 2026.

This is a standalone Freeman media project. It is independent of the architectural case study system, the
website and the Three Ideas editions. The Represent clothing collaboration and the globe insignia are on
hold and are not part of it.

**Preview (private Artifact; share it from the page to let Gabe open it):** https://claude.ai/artifact/1QpgARccy2UroiG85LF4xV

**Working branch:** `claude/freeman-built-generations-pitch-906z9l`. Nothing here is deployed to
freemangc.com, and nothing in `v5/` or the root site was changed.

## Files

| | |
|---|---|
| `index.html` | The built page (body content only; the Artifact publisher supplies the document shell) |
| `preview.html` | The same page inside a document shell, for opening locally |
| `src/` | Source in five parts, plus the signature and eagle path data |
| `build.py` | Concatenates `src/` into `index.html` and `preview.html` |
| `img/` | Resized copies of Freeman photographs |
| `RESEARCH.md` | Source-linked research appendix, with its limits stated |

View locally:

    cd films/built-for-generations && python3 build.py && python3 -m http.server 8765
    # open http://127.0.0.1:8765/preview.html

## The pitch, in order

01 An idea · 02 A precedent (Represent) · 03 Our world · 04 The films, with the opening film
*Everything Before*: treatment, twelve-frame storyboard, look, sound, shot list · 05 The approach ·
06 Five months: schedule and investment at three scopes · 07 The opportunity and the five evaluation
questions · 08 The decision · Appendix.

Interaction is limited to: chapter navigation, the storyboard (buttons, thumbnails, arrow keys), expanding
film rows, the budget scope switch, and Gabe's call. The call is saved through the Artifact `db`
capability (`decision/gabe`) when the page is published as an Artifact; opened as a plain file it says it
cannot save.

## What is real and what is not

- **Real:** every photograph (Freeman's; Beetlecat and Barnsley by Jared Swafford; others still to be
  credited); the signature and eagle bitmaps from the approved V5 build; company copy and project credits
  from `release/american-gothic-2026-11-05`.
- **Original concept drawings:** the twelve storyboard frames. They are not footage and no dialogue is
  written for anyone.
- **Proposed:** the series, the five subjects, the schedule, the roles. $2,500 per crew day is a planning
  target, not a Cusick quotation.
- **Estimated:** every budget line other than the crew days, from published third-party benchmarks.
- **Not done:** no Represent video was watched and no source page was opened; the research sandbox blocked
  them. Represent facts are search-reported and labelled. See `RESEARCH.md`, section 0.
- **Not asked:** Cusick Media has not quoted. No owner, operator, designer or team member has been
  approached. The trial dates are not fixed. Cole's existing agreement is separate and is not described.

## Preserved from earlier work

From the Three Ideas editions (`claude/freeman-creative-vision-002-oc1apk`): the title, the premise line
("Hospitality is the moment a guest walks in…"), the six rules of the series, the dawn opening of the
Episode 001 storyboard, the "A Tuesday" format and the photographs. From the approved V5 release: palette,
Libre Franklin typography, the script signature and the Stamp eagle.

## Checked

14 November 2026, Chromium via Playwright: 1440 × 900 light and dark, and iPhone 13 (390). No horizontal
page scroll, no console errors. Storyboard stepping, the budget scope switch and the call form exercised.
WebKit and Firefox have not been run. The saved-call path can only be exercised on the published Artifact.
