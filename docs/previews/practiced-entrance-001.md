# Practiced entrance preview

Base: production release 3dc2b3357e1517d1d81ea90b96e5217301fd9fd6.

Player and baked timeline copied byte-for-byte from Claude commit 218f4d83b345e78f5b8d99e52b31cfe5cc38f449, per HANDOFF.md at 903e1073a79400f43fc5f4bc7e8a39b9a24508c4.

Integration: load timeline and player after pixel-mark.js on the entrance; mount FreemanHandMark with FreemanPixelMark fallback; refresh all 20 app.js route cache keys. Production artwork, CSS, navigation, layout and Company copy are unchanged.

Validation: both shipped SHA-256 hashes match the handoff; pixel-mark.js SHA-256 remains unchanged; JavaScript syntax checks pass; all six offline hand profiles and both baked timeline freshness checks pass. Claude's browser comparison reports 34 passing checks; this workspace has not rerun that suite because Chromium is unavailable. Physical iPhone/Safari review is pending.

Preview only. Do not merge into the release branch or deploy to the production domain without approval.
