#!/usr/bin/env python3
"""V4 homepage: original Freeman script, three colorways, animation lifecycle, composition.
Read-only; no production writes.  Usage: python3 qa/freemangc-v4-home-qa.py http://127.0.0.1:8788"""
import sys
from playwright.sync_api import sync_playwright

base = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8788").rstrip("/")
PIXELS = 2278            # points in the original 160x61 bitmap (v5/pixel-mark.js)
DURATION = 1450          # Deliberate whole-signature arrival, about 1.4s
WAYS = [("chalk", "Light", "rgb(255, 249, 241)", "#332e20"),
        ("umber", "Dark", "rgb(51, 46, 32)", "#fff9f1"),
        ("sand", "Freeman", "rgb(249, 56, 34)", "#f93822")]
PAPER = {"chalk": "rgb(255, 249, 241)", "umber": "rgb(51, 46, 32)", "sand": "rgb(221, 207, 179)"}

# Opaque pixels on the canvas and the colour of the first original point (56,4).
INK = """() => { const c = document.querySelector('#v4-pixel-mark'); const x = c.getContext('2d');
  const d = x.getImageData(0, 0, 160, 61).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++;
  const p = x.getImageData(56, 4, 1, 1).data; return { n, rgb: '#' + [p[0], p[1], p[2]].map(v => v.toString(16).padStart(2, '0')).join('') }; }"""

def check(cond, msg):
    if not cond:
        raise AssertionError(msg)

with sync_playwright() as p:
    browser = p.chromium.launch()
    for width, height, dpr in [(1440, 900, 2), (1280, 720, 1), (390, 844, 3), (375, 667, 2)]:
        phone = width < 761
        ctx = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=dpr,
                                  is_mobile=phone, has_touch=phone)
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(base + "/")
        page.wait_for_timeout(120)
        mid = page.evaluate(INK)["n"]
        check(0 < mid < PIXELS, f"script should be assembling on arrival, saw {mid} pixels")
        page.wait_for_timeout(DURATION + 300)
        check(page.evaluate(INK)["n"] == PIXELS, "finished script must show every original pixel")

        # Regression: no preprinted top of F. The Deliberate cap must begin on clean paper.
        opening = page.evaluate("""() => {
          const m = window.FreemanSignatureMotion;
          const px = m._pixels();
          const times = m._schedule('deliberate', px).a;
          return { selected: m.RECOMMENDED,
                   initial: times.filter(t => t <= 0).length,
                   early: times.filter(t => t <= 50).length,
                   final: Math.max(...times) };
        }""")
        check(opening["selected"] == "deliberate", "Deliberate is the live profile")
        check(opening["initial"] == 0, f"F cap must not be pre-inked at t=0: {opening}")
        check(0 < opening["early"] < PIXELS, f"F cap should be drawn over time: {opening}")
        check(1300 < opening["final"] < 1500, f"Deliberate rhythm preserved: {opening}")

        # Radically simple: one script, three destinations, ACCESS, three squares. Nothing else interactive.
        check(page.locator("#main a").count() == 4, "links: COMPANY, PROJECTS, CONTACT, ACCESS")
        check(page.locator("#main button").count() == 4, "buttons: script (replay) + three colorways")
        check(page.locator(".v4-home-nav").inner_text().split() == ["COMPANY", "/", "PROJECTS", "/", "CONTACT"], "nav")
        check(page.locator(".client-access-entry").get_attribute("href") == "client-access.html", "ACCESS link")
        check("FREEMAN GC" not in page.locator("#main").inner_text(), "the script replaces the FREEMAN GC wordmark")
        check(page.locator("img[src*=eagle], .freeman-intro").count() == 0, "no eagle")
        check(page.locator("h1").inner_text() == "Freeman General Contracting", "document heading")

        # Composition: integer device pixels per bitmap pixel, on a device-pixel boundary, centred.
        g = page.evaluate("""() => { const c = document.querySelector('#v4-pixel-mark').getBoundingClientRect();
          const n = document.querySelector('.v4-home-nav').getBoundingClientRect();
          const s = document.querySelector('.v4-colorways').getBoundingClientRect();
          return { w: c.width * devicePixelRatio, h: c.height * devicePixelRatio, l: c.left * devicePixelRatio,
                   t: c.top * devicePixelRatio, cx: (c.left + c.right) / 2 - innerWidth / 2,
                   nx: (n.left + n.right) / 2 - innerWidth / 2, sx: (s.left + s.right) / 2 - innerWidth / 2,
                   over: document.documentElement.scrollWidth > innerWidth, gap: n.top - c.bottom }; }""")
        scale = round(g["w"] / 160)
        check(abs(g["w"] - 160 * scale) < 0.05 and abs(g["h"] - 61 * scale) < 0.05, f"integer bitmap scale {g}")
        check(abs(g["l"] - round(g["l"])) < 0.05 and abs(g["t"] - round(g["t"])) < 0.05, f"device-pixel aligned {g}")
        check(abs(g["cx"]) < 1 and abs(g["nx"]) < 1 and abs(g["sx"]) < 1, f"script, nav and squares share one axis {g}")
        check(not g["over"], "no horizontal overflow")

        # Colorways: Light / Dark / Freeman, in that order; swatches light, dark, solid red.
        btns = page.locator("[data-v4-color]")
        check(btns.count() == 3, "three colorways")
        for i, (pid, name, swatch, mark) in enumerate(WAYS):
            b = btns.nth(i)
            check(b.get_attribute("data-v4-color") == pid and b.get_attribute("aria-label") == f"{name} colorway", f"order {i}")
            check(b.evaluate("e => getComputedStyle(e).backgroundColor") == swatch, f"{name} swatch colour")
            box = b.bounding_box()
            check(box["width"] == box["height"], "square")
            if phone:
                hit = b.evaluate("e => { const r = getComputedStyle(e, '::after'); return r.content; }")
                check(hit != "none", "touch target expansion")
        for pid, name, swatch, mark in WAYS[::-1] + WAYS:
            page.locator(f"[data-v4-color='{pid}']").click()
            ink = page.evaluate(INK)
            check(ink["n"] == PIXELS, f"{name}: colour change must not restart the assembly ({ink['n']})")
            check(ink["rgb"] == mark, f"{name}: script colour {ink['rgb']} != {mark}")
            check(page.evaluate("document.documentElement.dataset.palette") == pid, "palette attribute")
            check(page.evaluate("getComputedStyle(document.body).backgroundColor") == PAPER[pid], "page background")
            pressed = [page.locator("[data-v4-color]").nth(i).get_attribute("aria-pressed") for i in range(3)]
            check(pressed == [str(w[0] == pid).lower() for w in WAYS], f"selected indicator {pressed}")
            check(page.locator(f"[data-v4-color='{pid}']").evaluate("e => getComputedStyle(e).outlineStyle") == "solid", "indicator drawn")

        # Lifecycle: resizing never replays; selecting the script does; Back shows it finished.
        page.set_viewport_size({"width": width, "height": height - 60})
        page.wait_for_timeout(250)
        check(page.evaluate(INK)["n"] == PIXELS, "resize must not replay the animation")
        page.set_viewport_size({"width": width, "height": height})
        page.locator(".v4-home-mark").click()
        page.wait_for_timeout(100)
        check(page.evaluate(INK)["n"] < PIXELS, "selecting the script replays it")
        page.wait_for_timeout(DURATION + 200)
        check(page.evaluate(INK)["n"] == PIXELS, "replay completes")
        page.locator(".v4-home-nav a", has_text="COMPANY").click()
        page.wait_for_url("**/company")
        check(page.evaluate("document.documentElement.dataset.palette") == "sand", "palette travels to Company")
        page.go_back()
        page.wait_for_selector("#v4-pixel-mark")
        page.wait_for_timeout(50)
        check(page.evaluate(INK)["n"] == PIXELS, "Back returns to the finished script")
        check(page.locator("[data-v4-color='sand']").get_attribute("aria-pressed") == "true", "palette kept on Back")
        page.locator(".client-access-entry").click()
        page.wait_for_url("**/client-access")
        page.go_back()
        page.wait_for_selector("#v4-pixel-mark")
        check(not errors, errors)
        page.screenshot(path=f"qa/results/v4-home-{width}.png")
        ctx.close()

        # Reduced motion: the finished script, immediately.
        ctx = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
        page = ctx.new_page()
        page.goto(base + "/")
        page.wait_for_timeout(50)
        check(page.evaluate(INK)["n"] == PIXELS, "reduced motion shows the finished script")
        ctx.close()
        print(f"PASS V4 home {width}x{height}@{dpr}x")
    browser.close()
