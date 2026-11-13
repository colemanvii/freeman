#!/usr/bin/env python3
"""One-viewport workspaces and navigation smoke test; only fictional demo data."""
import sys
from playwright.sync_api import sync_playwright
base=(sys.argv[1] if len(sys.argv)>1 else "http://127.0.0.1:8788").rstrip("/")
password=(sys.argv[2] if len(sys.argv)>2 else "qa-demo-password")
with sync_playwright() as p:
 browser=p.chromium.launch()
 for width,height in [(1440,900),(1366,768),(1024,768),(390,844)]:
  ctx=browser.new_context(viewport={"width":width,"height":height},is_mobile=width<500,has_touch=width<500)
  page=ctx.new_page()
  page.goto(base+"/team-os",wait_until="networkidle")
  if page.locator("#password").count():
   page.locator("#password").fill(password)
   page.locator('button[type="submit"]').click()
   page.wait_for_url("**/team-os")
  assert page.locator('[data-os-tab="overview"][aria-current="page"]').count(),f"{width}: overview absent"
  for tab,detail in [("projects","rfi"),("finance","approval"),("relationships","rocket")]:
   page.locator('[data-os-tab="'+tab+'"]').click()
   assert page.locator('[data-os-tab="'+tab+'"][aria-current="page"]').count(),f"{width}: tab failed {tab}"
   assert page.locator("#os-workspace").is_visible(),f"{width}: workspace hidden {tab}"
   assert page.evaluate("document.documentElement.scrollHeight <= innerHeight+2"),f"{width}: vertical document scroll in {tab}"
   page.locator('[data-os-detail="'+detail+'"]').click()
   assert page.locator('[role="dialog"]').is_visible(),f"{width}: dialog missing {tab}"
   assert "FICTIONAL" in page.locator('#os-detail-content').inner_text()
   page.keyboard.press("Escape")
   assert page.locator("#os-detail-backdrop").is_hidden(),f"{width}: dialog did not close {tab}"
  page.locator('[data-os-tab="overview"]').click()
  assert page.locator("#jobs").is_visible(),f"{width}: overview missing after tabs"
  assert page.evaluate("document.documentElement.scrollHeight <= innerHeight+2"),f"{width}: overview vertical scroll"
  print("PASS",width,height)
  ctx.close()
 browser.close()
