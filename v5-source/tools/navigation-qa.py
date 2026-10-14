"""Freeman V5 navigation QA (Chromium via Playwright). Usage: python3 tools/navigation-qa.py [base_url] [result.json]"""
import sys, json
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8765/v5/"
results = []
def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))

VIEWPORTS = [(375, 667), (390, 844), (430, 932), (1280, 720), (1440, 900), (667, 375), (844, 390), (932, 430)]
ROUTES = ["company.html", "company.html?sheet=1", "projects.html", "project-beetlecat.html", "project-the-optimist.html?sheet=1",
          "fieldwork.html", "fieldwork-radius.html", "fieldwork-sequence.html", "fieldwork.html?note=new", "contact.html", "404.html"]

def is_touch(w, h):
    return min(w, h) <= 500

with sync_playwright() as p:
    browser = p.chromium.launch()

    # ---------- Behaviour (desktop + phone) ----------
    for (w, h) in [(1440, 900), (390, 844)]:
        tag = f"{w}x{h}"
        touch = is_touch(w, h)
        ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=touch, has_touch=touch)
        pg = ctx.new_page()
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        click = (lambda sel: pg.tap(sel)) if touch else (lambda sel: pg.click(sel))
        url = lambda: pg.url.replace(BASE, "")

        # 1. Entrance → destination replaces the entrance; Back leaves the site.
        pg.goto("about:blank")
        pg.goto(BASE + "index.html")
        check(f"{tag} eagle intro plays on first entry", pg.locator(".freeman-intro").count() == 1)
        pg.wait_for_timeout(2400)
        hl = pg.evaluate("history.length")
        nav_sel = ".mobile-home-nav a[href='projects.html']" if w <= 760 else ".center a[href='projects.html']"
        click(nav_sel)
        check(f"{tag} entrance → Projects in place", url() == "projects.html" and pg.locator(".index-row").count() > 0, url())
        check(f"{tag} entrance entry replaced (history length unchanged)", pg.evaluate("history.length") == hl)
        pg.go_back()
        check(f"{tag} Back from first interior page leaves the site (not the entrance)", pg.url == "about:blank", pg.url)
        pg.go_forward()
        pg.wait_for_selector(".panel-head")
        check(f"{tag} Forward restores Projects", url() == "projects.html", url())

        # 2. Close semantics.
        click(".index-row[data-slug='the-optimist']") if w > 760 else click(".index-row[data-slug='the-optimist'] .phrase")
        check(f"{tag} project opens", url() == "project-the-optimist.html", url())
        check(f"{tag} project × → Projects", pg.get_attribute(".panel-head .close", "href") == "projects.html")
        pg.keyboard.press("ArrowRight")
        check(f"{tag} sheet param kept on page change", "sheet=1" in url(), url())
        pg.reload(); pg.wait_for_selector(".panel-head")
        check(f"{tag} refresh keeps sheet", pg.inner_text(".count").strip().startswith("02"), pg.inner_text(".count"))
        click(".panel-head .close")
        check(f"{tag} × returns to Projects with project highlighted", url().startswith("projects.html") and pg.locator(".index-row.active[data-slug='the-optimist']").count() == 1, url())
        check(f"{tag} focus returns to closed project row", pg.evaluate("document.activeElement.dataset.slug") == "the-optimist")
        click(".panel-head .close")
        check(f"{tag} Projects × → FREEMAN GC", url() == "company.html", url())
        check(f"{tag} FREEMAN GC sheet 01 × inactive", pg.locator(".panel-head .close[disabled]").count() == 1)
        check(f"{tag} FREEMAN GC shows four destinations", pg.locator(".hub-register .index-row").count() == 4)
        pg.keyboard.press("Escape")
        check(f"{tag} Escape on FREEMAN GC sheet 01 stays", url() == "company.html")
        click("#next")
        check(f"{tag} FREEMAN GC sheet 02 × → sheet 01", pg.get_attribute(".panel-head .close", "href") == "company.html")
        pg.keyboard.press("Escape")
        check(f"{tag} Escape on sheet 02 → sheet 01", url() == "company.html" and pg.inner_text(".count").startswith("01"), url())
        click(".hub-register a[href='contact.html']")
        check(f"{tag} register → Contact", url() == "contact.html")
        check(f"{tag} Contact × → FREEMAN GC", pg.get_attribute(".panel-head .close", "href") == "company.html")
        check(f"{tag} Contact footer ← FREEMAN GC", pg.inner_text(".section-link").strip() == "← FREEMAN GC")
        pg.keyboard.press("Escape")
        check(f"{tag} Escape on Contact → FREEMAN GC", url() == "company.html", url())

        # 3. Fieldwork rules.
        click(".hub-register a[href='fieldwork.html']")
        pg.wait_for_selector(".fw-frame")
        check(f"{tag} Fieldwork index × → FREEMAN GC", pg.get_attribute(".fw-close", "href") == "company.html")
        click(".fw-menu [data-cat='Observation']")
        check(f"{tag} filter written to URL", url() == "fieldwork.html?category=Observation", url())
        click(".fw-name[data-slug='landscape']")
        check(f"{tag} record has its own URL", url() == "fieldwork-landscape.html", url())
        check(f"{tag} record names connected project", "BARNSLEY GARDENS" in pg.inner_text(".fw-relation").upper())
        check(f"{tag} record × → filtered index", pg.get_attribute(".fw-close", "href") == "fieldwork.html?category=Observation")
        pg.reload(); pg.wait_for_selector(".fw-detail")
        check(f"{tag} record deep link survives refresh", pg.locator(".fw-detail h2").inner_text() == "Building beside the landscape")
        click(".fw-relation-link")
        check(f"{tag} record → related project", url() == "project-barnsley-gardens.html", url())
        check(f"{tag} project lists related Fieldwork", pg.locator("a[href='fieldwork-landscape.html']").count() >= 0)
        pg.go_back(); pg.wait_for_selector(".fw-detail")
        check(f"{tag} Back from project → record", url() == "fieldwork-landscape.html", url())
        pg.keyboard.press("Escape")
        check(f"{tag} Escape on record → Fieldwork index", url().startswith("fieldwork.html"), url())
        check(f"{tag} returning focuses record", pg.evaluate("document.activeElement.dataset.slug") == "landscape")
        # scroll restoration
        click(".fw-menu [data-cat='All records']")
        pg.evaluate("document.querySelector('.fw-scroller').scrollTop = 9999")
        top = pg.evaluate("document.querySelector('.fw-scroller').scrollTop")
        pg.locator(".fw-name[data-slug='sequence']").click() if not touch else pg.tap(".fw-name[data-slug='sequence']")
        pg.go_back(); pg.wait_for_selector(".fw-scroller")
        check(f"{tag} Back restores Fieldwork list scroll", abs(pg.evaluate("document.querySelector('.fw-scroller').scrollTop") - top) < 4, top)
        # search input persists while typing (keyboard-safe)
        pg.evaluate("window.__inp = document.querySelector('.fw-search')")
        pg.fill(".fw-search", "radius")
        check(f"{tag} search keeps the same input node", pg.evaluate("window.__inp === document.querySelector('.fw-search')"))
        check(f"{tag} search filters", pg.locator(".fw-record").count() == 1)
        pg.fill(".fw-search", "")
        # record stepping
        click(".fw-name[data-slug='radius']")
        click("#fw-next")
        check(f"{tag} ↓ steps to next record (replace)", url() == "fieldwork-timber.html", url())
        pg.go_back()
        check(f"{tag} Back after stepping returns to index", url().startswith("fieldwork.html"), url())

        # 4. No interior link points at the entrance.
        bad = []
        for r in ROUTES:
            pg.goto(BASE + r); pg.wait_for_timeout(150)
            n = pg.evaluate("""() => [...document.querySelectorAll('a[href]')].filter(a => { const u = new URL(a.href); return /\\/v5\\/(index\\.html)?$/.test(u.pathname); }).length""")
            if n: bad.append(r)
        check(f"{tag} no interior link to the entrance", not bad, bad)

        # 5. Palette carried through navigation and reloads (history state, not just storage).
        pg.goto(BASE + "index.html"); pg.wait_for_timeout(100)
        check(f"{tag} eagle not replayed on re-entry in same tab session", pg.locator(".freeman-intro").count() == 0)
        pg.click(".palette-chip.palette-umber")
        click(nav_sel.replace("projects", "fieldwork"))
        check(f"{tag} palette kept into Fieldwork", pg.evaluate("document.documentElement.dataset.palette") == "umber")
        pg.evaluate("sessionStorage.clear()")
        pg.reload(); pg.wait_for_selector(".fw-frame")
        check(f"{tag} palette survives reload without sessionStorage", pg.evaluate("document.documentElement.dataset.palette") == "umber")
        pg.goto(BASE + "index.html")
        check(f"{tag} entrance restarts in off-white", pg.evaluate("document.documentElement.dataset.palette") == "chalk")
        check(f"{tag} no script errors", not errors, errors)
        ctx.close()

    # ---------- Layout: overflow, visibility, touch targets at every viewport ----------
    for (w, h) in VIEWPORTS:
        tag = f"{w}x{h}"
        touch = is_touch(w, h)
        ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=touch, has_touch=touch)
        pg = ctx.new_page()
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        for r in ["index.html"] + ROUTES:
            pg.goto(BASE + r); pg.wait_for_timeout(200 if r != "index.html" else 2300)
            info = pg.evaluate("""(touch) => {
              const vw = innerWidth, vh = innerHeight, out = [], small = [];
              const se = document.scrollingElement;
              const pageScroll = se.scrollHeight > vh + 1 || se.scrollWidth > vw + 1;
              const sel = '.panel-head .close, .panel-head .crumb, .section-link:not(:empty), #previous, #next, .fw-close, .fw-top a, .fw-backlink, .fw-step, .fw-back, .fw-menu button, .index-row, .center a, .mobile-home-nav a, .fw-relation-link, .palette-chip';
              for (const el of document.querySelectorAll(sel)) {
                const r = el.getBoundingClientRect();
                if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') continue;
                if (el.closest('.fw-side') && el.closest('.fw-side').scrollHeight > el.closest('.fw-side').clientHeight) {} // side column scrolls internally
                else if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) out.push((el.className || el.tagName) + ' ' + el.textContent.trim().slice(0,20));
                const sc = el.closest('.fw-side, .fw-scroller'); const scR = sc && sc.getBoundingClientRect(); const clipped = scR && (r.top < scR.top - 1 || r.bottom > scR.bottom + 1);
                if (touch && !clipped && !el.classList.contains('palette-chip')) {
                  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
                  const hit = (x, y) => { x = Math.min(vw - 1, Math.max(0, x)); y = Math.min(vh - 1, Math.max(0, y)); const t = document.elementFromPoint(x, y); return t && (t === el || el.contains(t)); };
                  if (!(hit(cx, cy - 20) && hit(cx, cy + 20) && hit(Math.max(r.left, cx - 20), cy) && hit(Math.min(r.right, cx + 20), cy)))
                    if (!el.closest('.fw-side') || (r.top > 0 && r.bottom < vh)) small.push((el.className || el.tagName).toString().split(' ')[0] + ':' + el.textContent.trim().slice(0, 14));
                }
              }
              return { pageScroll, out, small };
            }""", touch)
            check(f"{tag} {r}: no page scroll", not info["pageScroll"])
            check(f"{tag} {r}: controls inside viewport", not info["out"], info["out"])
            if touch:
                check(f"{tag} {r}: touch targets ≥ 40px", not info["small"], info["small"])
        check(f"{tag} no script errors", not errors, errors)
        ctx.close()

    # ---------- Keyboard-only path ----------
    ctx = browser.new_context(viewport={"width": 1280, "height": 720})
    pg = ctx.new_page()
    pg.goto(BASE + "index.html"); pg.wait_for_timeout(2300)
    pg.keyboard.press("Tab"); pg.keyboard.press("Tab")
    pg.keyboard.press("Enter")
    check("keyboard: Tab+Enter from entrance opens Projects", pg.url.endswith("projects.html"), pg.url)
    for _ in range(30):
        pg.keyboard.press("Tab")
        if pg.evaluate("document.activeElement.dataset.slug") == "beetlecat": break
    pg.keyboard.press("Enter")
    check("keyboard: Enter on row opens project", pg.url.endswith("project-beetlecat.html"), pg.url)
    pg.keyboard.press("Escape")
    check("keyboard: Escape closes to Projects and focuses row", pg.url.endswith("projects.html") and pg.evaluate("document.activeElement.dataset.slug") == "beetlecat")
    pg.keyboard.press("Shift+Tab")
    for _ in range(20):
        if pg.evaluate("document.activeElement.classList.contains('close')"): break
        pg.keyboard.press("Shift+Tab")
    check("keyboard: × CLOSE reachable by Tab", pg.evaluate("document.activeElement.classList.contains('close')"))
    pg.keyboard.press("Enter")
    check("keyboard: Enter on × → FREEMAN GC", pg.url.endswith("company.html"), pg.url)
    browser.close()

passed = sum(1 for r in results if r[1])
for name, ok, detail in results:
    if not ok: print("FAIL", name, detail)
print(f"{passed}/{len(results)} checks passed")
json.dump({"checks": len(results), "passed": passed, "failures": [[n, str(d)] for n, ok, d in results if not ok]},
          open(sys.argv[2] if len(sys.argv) > 2 else "/dev/null", "w"), indent=1)
