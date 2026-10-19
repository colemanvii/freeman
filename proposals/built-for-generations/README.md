# Built for Generations — Design Studies 001 and 002

Static design studies for *Built for Generations*, an editorial series from Freeman General Contracting. They're kept here exactly as approved, for reference.

**These are not production.** Nothing here is linked from freemangc.com, Conversations isn't in the live navigation, and nothing in `v5/` was changed. Every participant, title, introduction and question is an **editorial example**; there are no real interviews or quotations.

## Preview

From the repository root:

```bash
python3 -m http.server 8806 --bind 127.0.0.1 --directory proposals/built-for-generations
```

| Study | Home | Conversation |
|---|---|---|
| 001 | http://localhost:8806/ | http://localhost:8806/conversation.html |
| 002 (approved direction) | http://localhost:8806/study-002/ | http://localhost:8806/study-002/conversation.html |

No build step and no dependencies. Study 001 loads Newsreader from Google Fonts. Study 002 uses only Monaco and a short script that shows one sheet at a time; on phones and without JavaScript, every sheet is shown in order.

## How they differ

| | Study 001 | Study 002 |
|---|---|---|
| Position | A separate, restrained editorial imprint (Scandinavian influence) | An editorial extension of the Freeman site, built on the live V5 system |
| Type | Newsreader serif for the voice, Monaco for metadata | Monaco only, at V5 sizes (9–13px, 25px statements) |
| Color | Slightly cooler paper `#fbfaf7`, Freeman ink, orange used once or twice | Freeman's tokens exactly: `#fff9f1`, `#332e20`, `#706659`, `#d5cec3`, `#f93822` |
| Layout | Scrolling 12-column magazine page | V5 fixed shell: header, content area, legal text and ™ mark in the same positions as the live site |
| Navigation | Its own masthead | V5 section line with Conversations added in orange, plus `× CLOSE` |
| Index | Large serif titles in a list | Numbered ledger modelled on the V5 projects index, with an open 007 row to show the list continues |
| Detail page | One long page: intro, audio player, photos, transcript, film | Six sheets (Portrait, Introduction, Conversation, Listen, Film, Place) with V5 `← 01 / 06 →` controls |
| Audio | Round play button and progress bar | A dimension line with chapter ticks; no podcast UI |
| Interaction | Underline on hover | V5 instant orange highlight on words, crosshair cursors, no transitions |
| Freeman link | Colophon line in the footer | The nav itself, plus the V5 legal footer and `BUILT FOR GENERATIONS™` mark |

Study 001 was judged too conventionally editorial. Study 002 is the approved art direction. Design notes for Study 002 are in [`study-002/README.md`](study-002/README.md).

## Files

```
proposals/built-for-generations/
  index.html, conversation.html, styles.css   Study 001
  study-002/
    index.html, conversation.html             Study 002
    study.css, study.js
    README.md                                 Study 002 design notes
```
