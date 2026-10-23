#!/usr/bin/env python3
"""The Record 003: photo discovery, responsive record, and regression for red-map bug."""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8788").rstrip("/")
OUT = Path("qa/results/record-discovery-003")
OUT.mkdir(parents=True, exist_ok=True)

def check(cond, message):
    if not cond:
        raise AssertionError(message)
    print("PASS", message, flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    desktop = browser.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    desktop.on("pageerror", lambda err: errors.append(str(err)))
    desktop.goto(BASE + "/record", wait_until="domcontentloaded")
    desktop.wait_for_function("window.__record && document.querySelectorAll('.tb-set button').length === 15")
    check(desktop.locator(".tb-set button").count() == 15, "15 project records retained")
    check("Years on file" not in desktop.locator("#tblock").inner_text(), "empty year statistic removed")
    check(desktop.locator("#rule").is_hidden(), "empty chronology remains hidden")
    desktop.screenshot(path=str(OUT / "desktop-map.png"))
    
    beetlecat = desktop.locator('.tb-set button[data-slug="beetlecat"]')
    beetlecat.hover()
    desktop.wait_for_selector(".photo-peek:not([hidden]) img")
    check(desktop.locator(".photo-peek").is_visible(), "sourced image appears when project is hovered")
    check("Beetlecat" in desktop.locator(".photo-peek").inner_text(), "preview identifies the project")
    check(desktop.locator(".photo-peek img").get_attribute("src").endswith("/assets/project-0.jpg"), "preview uses existing project photo")
    desktop.screenshot(path=str(OUT / "desktop-photo-peek.png"))
    beetlecat.click()
    desktop.wait_for_selector('body[data-mode="record"][data-feature="beetlecat"]')
    check(desktop.locator(".photo-peek").is_hidden(), "hover image disappears inside project record")
    check(desktop.locator(".bc-thumb").count() == 4, "four published Beetlecat images retained")
    desktop.locator("#bc-next").click()
    check("beetlecat-1.jpg" in desktop.locator("#r-img").get_attribute("src"), "gallery advances with next arrow")
    desktop.locator("#bc-enlarge").click()
    check(desktop.locator("#bc-lightbox").evaluate("(e) => e.open"), "full-screen photo viewer opens")
    desktop.keyboard.press("Escape")
    check(not desktop.locator("#bc-lightbox").evaluate("(e) => e.open"), "Escape closes viewer without closing record")
    check(desktop.locator('body[data-mode="record"]').count() == 1, "project record stays open after viewer exit")
    desktop.locator("#r-back").click()
    desktop.wait_for_selector('body[data-mode="map"]')
    other = desktop.locator('.tb-set button[data-slug="muchacho-decatur"]')
    other.hover()
    check(desktop.locator(".photo-peek").is_hidden(), "projects without photography do not show fake imagery")
    # Explicit regression: the whole map once turned red from a generic .close:hover rule.
    desktop.locator("#zin").click()
    desktop.locator("#zin").click()
    desktop.locator("#zin").click()
    desktop.wait_for_timeout(1100)
    desktop.locator("#map").hover(position={"x": 120, "y": 135})
    bg = desktop.locator("#map").evaluate("(e) => getComputedStyle(e).backgroundColor")
    check(bg != "rgb(249, 56, 34)", "zoomed map cannot become a solid Freeman-red rectangle")
    check(not errors, "no desktop JavaScript page errors: " + "; ".join(errors[:3]))
    
    phone = browser.new_page(viewport={"width": 390, "height": 844},
                             device_scale_factor=2, is_mobile=True, has_touch=True)
    mobile_errors = []
    phone.on("pageerror", lambda err: mobile_errors.append(str(err)))
    phone.goto(BASE + "/record", wait_until="domcontentloaded")
    phone.wait_for_function("window.__record && document.querySelectorAll('.tb-set button').length === 15")
    check(phone.locator("#map").is_visible(), "map is visible on phone")
    check(phone.locator(".photo-peek").is_hidden(), "no hover card obstructs touch map")
    phone.locator("#reg-toggle").click()
    check(phone.locator(".tblock").evaluate("(e) => e.classList.contains('open')"), "mobile register expands")
    phone.locator('.tb-set button[data-slug="beetlecat"]').click()
    phone.wait_for_selector('body[data-mode="record"][data-feature="beetlecat"]')
    check(phone.locator("#r-img").is_visible(), "flagship photography visible in mobile record")
    phone.screenshot(path=str(OUT / "mobile-beetlecat.png"))
    check(phone.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), "no horizontal overflow on phone")
    phone.locator("#r-back").click()
    phone.wait_for_selector('body[data-mode="map"]')
    check(not mobile_errors, "no mobile JavaScript page errors: " + "; ".join(mobile_errors[:3]))
    browser.close()

print("The Record 003 browser QA passed.", flush=True)
