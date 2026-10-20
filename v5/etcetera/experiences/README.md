# ETCETERA experience modules

Each ETCETERA entry opens in an experience: the shared interior shell (section line with ETCETERA current, × CLOSE, Escape, a footer naming the entry and its neighbours) around one module. The module decides everything inside the frame.

| Module | Used by | What it does |
|---|---|---|
| `plate` | 001, 003, 004 | One image, centred, never enlarged, caption on the image's edge |
| `essay` | 002, 006 | One narrow column that scrolls inside the frame; text from `../texts/<slug>.js` |
| `snapshot` | 005 | Mounts the approved Beetlecat snapshot (`../snapshot-001/`, unchanged) |
| `film` | 007 | One centred frame at the film's proportion; honest placeholder without `video.src` |

## Adding an entry

1. Add an object to `../entries.js` (fields are documented at the top of that file).
2. Add the route file `v5/etcetera-<slug>.html` (a copy of `etcetera.html` with its own `<title>` and `noindex`).
3. Reuse a module, or write a new one:

```js
(window.FreemanExperiences = window.FreemanExperiences || {}).name = {
  mount({ root, viewport, entry, params, words, esc, pad }) {
    viewport.innerHTML = "…";            // compose inside production's .viewport frame
    return { destroy() {}, key(e) {} }; // both optional; key returns true if it handled the key
  },
};
```

Register it under `modules` in `entries.js` with its `src` and `css` (paths relative to `/etcetera/`). `app.js` loads them on first use, sets `body[data-experience="<name>"]` so the module's CSS can reshape the frame, and calls `mount`. Nothing in `app.js` changes for a new entry or module.

Rules every module keeps: the page itself never scrolls (a module may scroll its own frame, as `essay` does); no animation for its own sake, and none under reduced motion; Monaco, the palette tokens, the crosshair cursors; Freeman orange only where it means something.
