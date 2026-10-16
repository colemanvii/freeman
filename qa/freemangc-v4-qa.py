#!/usr/bin/env python3
"""V4 Company/Projects browser smoke test. Read-only; no production writes."""
import sys
from playwright.sync_api import sync_playwright

base=(sys.argv[1] if len(sys.argv)>1 else "http://127.0.0.1:8788").rstrip("/")
with sync_playwright() as p:
    browser=p.chromium.launch()
    for width,height in [(1440,900),(390,844)]:
        touch=width<761
        context=browser.new_context(viewport={"width":width,"height":height},is_mobile=touch,has_touch=touch)
        page=context.new_page()
        errors=[]
        page.on("pageerror",lambda error:errors.append(str(error)))
        page.goto(base+"/company")
        frame=page.locator(".co4-visual")
        frame.wait_for(state="visible")
        first=frame.bounding_box()
        media=page.locator(".co4-media").bounding_box()
        assert media and media["height"]>0 and abs(media["width"]/media["height"]-0.8)<0.035,media
        assert page.locator('[data-co4-tab="philosophy"]').get_attribute("aria-selected")=="true"
        page.locator('[data-co4-tab="services"]').click()
        assert page.get_by_text("General Contracting",exact=True).is_visible()
        page.locator('[data-co4-service="2"]').click()
        assert "constructability" in page.locator("#co4-service-text").inner_text()
        page.locator('[data-co4-tab="people"]').click()
        assert "Gabe Freeman" in page.locator("#co4-person-name").inner_text()
        page.locator('[data-co4-person="1"]').click()
        assert "Cameron Dombi" in page.locator("#co4-person-name").inner_text()
        after=frame.bounding_box()
        assert abs(first["x"]-after["x"])<2 and abs(first["width"]-after["width"])<2
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.screenshot(path=f"qa/results/v4-company-{width}.png")
        page.goto(base+"/projects")
        if touch:
            assert page.locator(".pi4-original-mobile .pi-project-link").first.is_visible()
            assert not page.locator(".pi4").is_visible()
            page.locator(".pi4-original-mobile .pi-project-link[data-slug='beetlecat']").click()
        else:
            assert page.locator(".pi4").is_visible()
            assert not page.locator(".pi4-original-mobile").is_visible()
            assert page.locator(".pi4-columns").inner_text().find("CLIENT")>=0
            assert page.locator(".pi4-columns").inner_text().find("DESIGN")>=0
            assert "Rocket Farm" in page.locator(".pi4-work-row:has(.pi4-select[data-pi4-select='beetlecat']) .pi4-client").inner_text()
            stage=page.locator(".pi4-stage").bounding_box()
            assert stage and stage["width"]<width*0.38,stage
            page.locator(".pi4-select[data-pi4-select='beetlecat']").click()
            photo=page.locator(".pi4-preview-image").bounding_box()
            assert photo and abs(photo["width"]/photo["height"]-0.8)<0.035,photo
            assert "Beetlecat" in page.locator(".pi4-preview-title").inner_text()
            page.locator(".pi4-arrows [data-pi4-step='1']").click()
            assert "02 /" in page.locator(".pi4-arrows").inner_text()
            page.screenshot(path=f"qa/results/v4-projects-{width}.png")
            page.locator(".pi4-preview-title a").click()
        page.wait_for_url("**/project-beetlecat")
        assert not errors,errors
        context.close()
        print(f"PASS V4 company and projects {width}x{height}")
    browser.close()
