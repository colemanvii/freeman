"""Freeman public site navigation QA (Chromium via Playwright), per the rules in v5/README.md.

Replaces v5-source/tools/navigation-qa.py, which predates the approved Projects index (.pi-row) and
current CLOSE semantics. Read-only: never submits the contact form.
Usage: python3 qa/public-navigation-qa.py <base_url> [result.json]
"""
import json, pathlib, re, sys
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8788").rstrip("/")
OUT = sys.argv[2] if len(sys.argv) > 2 else None
RECORDS = json.loads((pathlib.Path(__file__).resolve().parent.parent / "v5-source" / "content.json").read_text())
ROUTES = ["/", "/company", "/projects", "/contact"] + [f"/project-{p['slug']}" for p in RECORDS["projects"]]
# Fieldwork is withdrawn from the public site (v5-source/generate.py --fieldwork): every old URL is a
# temporary redirect to Projects, and its reader, images and records are not served.
WITHDRAWN = ["/fieldwork", "/fieldwork.html"] + [f"/fieldwork-{a['slug']}{x}" for a in RECORDS["archive"] for x in ("", ".html")]
# Sources and tooling must never be served (they live in v5-source/).
INTERNAL = ["/README.md", "/content.json", "/generate.py", "/image-dimensions.json", "/validation.json", "/mobile-validation.json",
            "/navigation-validation.json", "/tools/navigation-qa.py", "/_preserved-portal/sample-brief.txt", "/_preserved-portal/portal.html",
            "/_preserved-portal/portal", "/fieldwork-reader.js", "/fieldwork-reader.css", "/fieldwork/fieldwork-reader.js", "/alder/README.md"] + \
    sorted({"/assets/" + a["image"].split("/")[-1] for a in RECORDS["archive"]})
# records.js ships to every visitor: only rendered fields, never source-only data.
UNPUBLISHED = re.compile(r"Budget|Total sq\. ft|\"Complete\"|\"quote\"|website-files\.com|\$\d|AI-generated|visual archive")
# Old Webflow URLs that must keep working after the domain cutover (v5/_redirects).
LEGACY = {"/about": "/company", "/sawdust": "/projects", "/projects/barnsley-gardens": "/project-barnsley-gardens",
          "/projects/beetlecat-atlanta": "/project-beetlecat", "/projects/bocado-pizza": "/project-bocado-pizza",
          "/projects/cleveland-surgery-center": "/projects", "/projects/dalton-surgery-center": "/project-dalton-surgery-center",
          "/projects/la-cresta-on-main": "/project-la-cresta-on-main", "/projects/o-ku-atlanta": "/project-o-ku-atlanta",
          "/projects/savi-provisions-emory-village": "/project-savi-provisions", "/projects/the-optimist": "/project-the-optimist",
          "/projects/unknown-old-slug": "/projects"}
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
        if w == 1440:
            for internal in INTERNAL:
                st = pg.request.get(BASE + internal, max_redirects=0).status
                check(f"internal file not served: {internal}", st == 404, st)
        if w == 1440:
            for old, new in LEGACY.items():
                r = pg.request.get(BASE + old, max_redirects=0)
                loc = r.headers.get("location", "")
                target = pg.request.get(BASE + new)
                code = 302 if old == "/sawdust" else 301  # Sawdust became Fieldwork, which is withdrawn for now
                check(f"legacy {old} → {code} {new}", r.status == code and loc.split("?")[0].rstrip("/").endswith(new) and target.status == 200, (r.status, loc, target.status))
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

        # Fieldwork withdrawn: no link or label on any public page, old URLs land on Projects.
        for r in ["/", "/company", "/projects", "/contact"] + [f"/project-{p['slug']}" for p in RECORDS["projects"]]:
            pg.goto(BASE + r); pg.wait_for_selector("#main > *", state="attached")
            n = pg.locator("a[href*='fieldwork' i]").count(); label = re.search(r"fieldwork", pg.inner_text("body"), re.I)
            check(f"{tag} {r} has no Fieldwork link or label", n == 0 and not label, (n, label))
        if w == 1440:
            for old in WITHDRAWN:
                r = pg.request.get(BASE + old, max_redirects=0)
                check(f"withdrawn {old} → 302 /projects", r.status == 302 and r.headers.get("location", "").split("?")[0].endswith("/projects"), (r.status, r.headers.get("location")))
            js = pg.request.get(BASE + "/records.js").text()
            check("records.js carries no unpublished fields", not UNPUBLISHED.search(js), UNPUBLISHED.search(js))
            check("records.js carries no Fieldwork records", '"archive": []' in js or '"archive":[]' in js)

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
