"""Pixel-compare public pages between two deployments (e.g. production vs a branch preview).
Usage: python3 qa/public-visual-diff.py <base_a> <base_b>   — exits non-zero on any difference."""
import hashlib, sys
from playwright.sync_api import sync_playwright

A, B = (u.rstrip("/") for u in sys.argv[1:3])
ROUTES = ["/company", "/projects", "/project-beetlecat", "/project-the-optimist", "/fieldwork", "/fieldwork-radius", "/contact", "/"]
diffs = []
with sync_playwright() as p:
    br = p.chromium.launch()
    for (w, h) in [(1440, 900), (390, 844)]:
        for route in ROUTES:
            shots = []
            for base in (A, B):
                ctx = br.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
                ctx.add_init_script("try{sessionStorage.setItem('fgc-intro-seen','1')}catch(e){}")
                pg = ctx.new_page(); pg.goto(base + route); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(600)
                shots.append(hashlib.sha256(pg.screenshot()).hexdigest()); ctx.close()
            same = shots[0] == shots[1]
            print(("same " if same else "DIFF ") + f"{w}x{h} {route}")
            if not same: diffs.append((w, h, route))
    br.close()
sys.exit(1 if diffs else 0)
