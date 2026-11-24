#!/usr/bin/env python3
"""Company phone layout and route-shell consistency. Read-only; no production writes."""
import pathlib, re, sys
from playwright.sync_api import sync_playwright

base = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8788").rstrip("/")

# Every generated route loads the same app.js build (a hand-bumped key once left 18 routes stale).
v5 = pathlib.Path(__file__).resolve().parent.parent / "v5"
keys = {f.name: re.findall(r'src="app\.js\?v=([^"]+)"', f.read_text()) for f in v5.glob("*.html") if 'src="app.js' in f.read_text()}
assert len({k for v in keys.values() for k in v}) == 1, keys
print(f"PASS one app.js build across {len(keys)} routes")

with sync_playwright() as p:
    browser = p.chromium.launch()
    for width, height in [(375, 667), (390, 844), (430, 932), (1440, 900)]:
        touch = width < 761
        page = browser.new_context(viewport={"width": width, "height": height}, is_mobile=touch, has_touch=touch).new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(base + "/company")
        page.locator(".co4-visual").wait_for(state="visible")
        boxes = []
        for tab in ["philosophy", "services", "people"]:
            # A plain click fails if anything (the caption, the frame) covers the tab.
            page.locator(f'[data-co4-tab="{tab}"]').click(timeout=3000)
            visual = page.locator(".co4-visual").bounding_box()
            media = page.locator(".co4-media").bounding_box()
            nav = page.locator(".co4-nav").bounding_box()
            assert visual["y"] + visual["height"] <= nav["y"] + 1 or not touch, (tab, visual, nav)
            assert media["y"] + media["height"] <= visual["y"] + visual["height"] + 1, (tab, media, visual)
            boxes.append(tuple(round(media[k]) for k in ("x", "y", "width", "height")))
        assert len(set(boxes)) == 1, f"frame moves between tabs: {boxes}"
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        # A phone toolbar showing or hiding must not rebuild the page and reset the tab.
        page.set_viewport_size({"width": width, "height": height - 60})
        page.wait_for_timeout(300)
        assert page.locator('[data-co4-tab="people"]').get_attribute("aria-selected") == "true", "resize reset the Company tab"
        assert not errors, errors
        print(f"PASS Company layout {width}x{height}")
    browser.close()
