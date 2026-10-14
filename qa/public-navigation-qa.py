"""Freeman public site navigation QA (Chromium via Playwright), per the rules in v5/README.md.

Replaces v5/tools/navigation-qa.py, which predates the approved Projects index (.pi-row) and
current CLOSE semantics. Read-only: never submits the contact form.
Usage: python3 qa/public-navigation-qa.py <base_url> [result.json]
"""
import json, re, sys
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8788").rstrip("/")
OUT = sys.argv[2] if len(sys.argv) > 2 else None
RECORDS = json.loads(open(__file__.rsplit("/qa/", 1)[0] + "/v5/content.json").read())
ROUTES = ["/", "/company", "/projects", "/fieldwork", "/contact"] + \
    [f"/project-{p['slug']}" for p in RECORDS["projects"]] + [f"/fieldwork-{a['slug']}" for a in RECORDS["archive"]]
BAD_TEXT = re.compile(r"\bundefined\b|\bNaN\b|\[object ")
results = []

def check(name, ok, detail=""):
    results.append({"check": name, "ok": bool(ok), "detail": str(detail)[:300]})

path = lambda pg: re.sub(r"\.html$", "", pg.evaluate("location.pathname")).replace("/index", "/")

with sync_playwright() as p:
    br = p.chromium.launch()
    for (w, h) in [(1440, 900), (390, 844)]:
        tag = f"{w}x{h}"
        touch = w < 500
        ctx = br.new_context(viewport={"width": w, "height": h}, is_mobile=touch, has_touch=touch)
        ctx.add_init_script("try{sessionStorage.setItem('fgc-intro-seen','1')}catch(e){}")
        pg = ctx.new_page()
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        tap = (lambda s: pg.tap(s)) if touch else (lambda s: pg.click(s))

        # Every public route loads directly, with no script errors or undefined text.
        for r in ROUTES:
            resp = pg.goto(BASE + r); pg.wait_for_selector("#main > *", state="attached")
            body = pg.inner_text("body")
            check(f"{tag} direct {r} loads", resp.status == 200 and "Record not found" not in body, resp.status)
            check(f"{tag} direct {r} no undefined text", not BAD_TEXT.search(body), BAD_TEXT.search(body))
        check(f"{tag} entrance links to ACCESS", pg.goto(BASE + "/") and pg.get_attribute(".client-access-entry", "href") == "client-access.html")

        # Entrance → Projects → project → CLOSE → Projects (selection restored) → Back/Forward.
        pg.goto("about:blank"); pg.goto(BASE + "/"); pg.wait_for_selector(".client-access-entry")
        tap((".mobile-home-nav" if w <= 760 else ".center") + " a[href='projects.html']")
        pg.wait_for_selector(".pi-project-link")
        check(f"{tag} entrance → Projects in place", path(pg) == "/projects", pg.url)
        slug = RECORDS["projects"][1]["slug"]
        tap(f".pi-project-link[data-slug='{slug}']"); pg.wait_for_function(f"location.pathname.includes('project-{slug}')")
        check(f"{tag} project opens", path(pg) == f"/project-{slug}", pg.url)
        pg.reload(); pg.wait_for_selector(".panel-head .close")
        check(f"{tag} refresh keeps the project", path(pg) == f"/project-{slug}", pg.url)
        tap(".panel-head .close"); pg.wait_for_selector(".pi-project-link, .client-access-entry", state="attached")
        check(f"{tag} CLOSE after refresh returns to Projects (history state survives refresh)", path(pg) == "/projects", pg.url)
        check(f"{tag} closed project is the current row", pg.locator(f".pi-row.is-current [data-slug='{slug}']").count() == 1)
        if path(pg) != "/projects":
            pg.goto(BASE + "/projects"); pg.wait_for_selector(".pi-project-link")
            tap(f".pi-project-link[data-slug='{slug}']"); pg.wait_for_function(f"location.pathname.includes('project-{slug}')"); pg.go_back(); pg.wait_for_selector(".pi-project-link")
        pg.go_forward(); pg.wait_for_function(f"location.pathname.includes('project-{slug}')")
        check(f"{tag} Forward reopens the project", path(pg) == f"/project-{slug}", pg.url)
        pg.go_back(); pg.wait_for_selector(".pi-project-link")
        check(f"{tag} Back returns to Projects", path(pg) == "/projects", pg.url)

        # Direct arrival on a project: CLOSE falls back to the entrance.
        pg.goto("about:blank"); pg.goto(BASE + f"/project-{slug}"); pg.wait_for_selector(".panel-head .close")
        tap(".panel-head .close"); pg.wait_for_selector(".client-access-entry")
        check(f"{tag} CLOSE on direct arrival → entrance", path(pg) == "/", pg.url)

        # Fieldwork record and back.
        pg.goto(BASE + "/fieldwork"); pg.wait_for_selector(".fl-item-title")
        first = pg.get_attribute(".fl-item-title", "href").replace(".html", "")
        tap(".fl-item-title"); pg.wait_for_function(f"location.pathname.includes('{first}')")
        check(f"{tag} Fieldwork record opens", path(pg) == "/" + first, pg.url)
        pg.go_back(); pg.wait_for_selector(".fl-item-title")
        check(f"{tag} Back returns to Fieldwork", path(pg) == "/fieldwork", pg.url)

        # Contact form present (not submitted).
        pg.goto(BASE + "/contact"); pg.wait_for_selector("#contact-inquiry")
        check(f"{tag} contact form fields", pg.locator("#contact-message").count() == 1 and pg.locator("#contact-email").count() == 1)
        check(f"{tag} no JS errors", not errors, errors)
        ctx.close()
    br.close()

failed = [r for r in results if not r["ok"]]
if OUT:
    json.dump({"base": BASE, "checks": len(results), "failed": len(failed), "results": results}, open(OUT, "w"), indent=2)
print(f"{len(results)} checks, {len(failed)} failed")
for f in failed:
    print("FAIL", f["check"], "—", f["detail"])
sys.exit(1 if failed else 0)
