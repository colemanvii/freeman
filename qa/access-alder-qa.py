"""Freeman ACCESS + Alder proposal QA (Chromium via Playwright).

Run against a server that applies Cloudflare Pages routing (redirects, pretty URLs), e.g.
    npx wrangler pages dev v5 --port 8788
    python3 qa/access-alder-qa.py http://127.0.0.1:8788 qa/results/access-alder.json

Exits non-zero when any check fails.
"""
import json, re, sys
import os
from playwright.sync_api import sync_playwright

# Protected previews (S5): pass a Cloudflare Access service token via CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET.
ACCESS_HEADERS = {"CF-Access-Client-Id": os.environ["CF_ACCESS_CLIENT_ID"], "CF-Access-Client-Secret": os.environ["CF_ACCESS_CLIENT_SECRET"]} \
    if os.environ.get("CF_ACCESS_CLIENT_ID") else None

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8788").rstrip("/")
OUT = sys.argv[2] if len(sys.argv) > 2 else None
results = []

def check(name, ok, detail=""):
    results.append({"check": name, "ok": bool(ok), "detail": str(detail)[:300]})

# Mirrors the pathway definition the brief approved; the page must match it exactly.
PATHWAYS = {
    "client": ("CLIENT", ["PROJECT INTRODUCTION", "PROCORE", "WORKING WITH FREEMAN", "KICKOFF"]),
    "architect": ("ARCHITECT", ["INTRODUCTIONS", "PROCORE", "PROJECT COORDINATION"]),
    "trade": ("TRADE PARTNERS", ["PREQUALIFICATION", "BUILDINGCONNECTED", "PROCORE", "BILLING & PAYMENT", "PRECONSTRUCTION"]),
}
COUNT = {3: "THREE", 4: "FOUR", 5: "FIVE"}
ACCESS = BASE + "/client-access"
CHAPTERS = ["01-project-approach", "02-relevant-work", "03-people-scope", "04-schedule", "05-budget", "06-decisions", "issue"]
VIEWPORTS = [(320, 568), (375, 667), (390, 844), (768, 1024), (1280, 720), (1366, 768), (1440, 900), (1920, 1080), (667, 375), (844, 390)]
BAD_TEXT = re.compile(r"\bundefined\b|\bnull\b|NaN|\[object")

def contrast(fg, bg):
    def lum(rgb):
        c = [x / 255 for x in rgb]
        c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    a, b = lum(fg), lum(bg)
    return (max(a, b) + 0.05) / (min(a, b) + 0.05)

def rgb(s):
    return [int(float(x)) for x in re.findall(r"[\d.]+", s)[:3]]

def all_states():
    yield ""
    for role, (_, steps) in PATHWAYS.items():
        yield "#" + role
        for i in range(len(steps)):
            yield f"#{role}/{i + 1}"

with sync_playwright() as p:
    browser = p.chromium.launch()

    def page(w=1440, h=900):
        touch = min(w, h) <= 500
        ctx = browser.new_context(extra_http_headers=ACCESS_HEADERS, viewport={"width": w, "height": h}, is_mobile=touch, has_touch=touch)
        pg = ctx.new_page()
        pg.errors = []
        pg.on("pageerror", lambda e: pg.errors.append(str(e)))
        pg.on("console", lambda m: m.type == "error" and pg.errors.append(m.text))
        return ctx, pg

    def text(pg, sel):
        return pg.inner_text(sel).strip()

    # ---------- ACCESS: every valid deep link renders the right content ----------
    ctx, pg = page()
    for role, (name, steps) in PATHWAYS.items():
        pg.goto(f"{ACCESS}#{role}"); pg.wait_for_selector("#body .choice")
        check(f"access #{role} overview heading", text(pg, "#heading") == name, text(pg, "#heading"))
        check(f"access #{role} overview count label", text(pg, "#section") == f"{COUNT[len(steps)]} STEPS", text(pg, "#section"))
        check(f"access #{role} overview lists approved steps", [t.strip() for t in pg.locator("#body .choice .name").all_inner_texts()] == steps)
        for i, title in enumerate(steps):
            pg.goto(f"{ACCESS}#{role}/{i + 1}"); pg.reload(); pg.wait_for_selector("#heading")
            check(f"access #{role}/{i + 1} heading", text(pg, "#heading") == title, text(pg, "#heading"))
            check(f"access #{role}/{i + 1} step label", text(pg, "#section") == f"STEP {i + 1:02d} / {len(steps):02d}", text(pg, "#section"))
            check(f"access #{role}/{i + 1} kicker", text(pg, "#kicker") == f"{name} / ONBOARDING", text(pg, "#kicker"))
            body = pg.inner_text("main")
            check(f"access #{role}/{i + 1} no undefined/null text", not BAD_TEXT.search(body), BAD_TEXT.search(body))
            check(f"access #{role}/{i + 1} NEXT hidden only on last step", pg.is_visible("#next") == (i < len(steps) - 1))
            if title in ("PROCORE", "BUILDINGCONNECTED"):
                href = pg.get_attribute("#body a[target=_blank]", "href") or ""
                check(f"access #{role}/{i + 1} platform link", ("procore" if title == "PROCORE" else "buildingconnected") in href, href)
    check("access: Trade Partners is plural everywhere", "TRADE PARTNER " not in pg.content().upper().replace("TRADE PARTNERS", ""))
    check("access deep links: no JS errors", not pg.errors, pg.errors)
    ctx.close()

    # ---------- ACCESS: invalid and outdated deep links fall back gracefully ----------
    ctx, pg = page()
    for bad, expect_hash, expect_heading in [
        ("#client/5", "#client", "CLIENT"), ("#architect/4", "#architect", "ARCHITECT"), ("#trade/6", "#trade", "TRADE PARTNERS"),
        ("#trade/99", "#trade", "TRADE PARTNERS"), ("#client/-1", "#client", "CLIENT"), ("#client/x", "#client", "CLIENT"),
        ("#client/1/2", "#client", "CLIENT"), ("#client/0", "#client", "CLIENT"), ("#CLIENT/2", "#client/2", "PROCORE"),
        ("#owner/1", "", "Welcome."), ("#%E0%A4%A", "", "Welcome."), ("#", "", "Welcome."),
    ]:
        pg.goto("about:blank"); pg.goto(ACCESS + bad); pg.wait_for_selector("#heading")
        h = pg.evaluate("location.hash")
        check(f"access invalid {bad} → {expect_hash or 'home'}", h == expect_hash and text(pg, "#heading") == expect_heading, f"{h} / {text(pg, '#heading')}")
    check("access invalid deep links: no JS errors", not pg.errors, pg.errors)
    ctx.close()

    # ---------- ACCESS: history, BACK, CLOSE, refresh (desktop and phone) ----------
    for (w, h) in [(1440, 900), (390, 844)]:
        tag = f"{w}x{h}"
        ctx, pg = page(w, h)
        tap = (lambda s: pg.tap(s)) if w < 500 else (lambda s: pg.click(s))
        state = lambda: (pg.evaluate("location.pathname.split('/').pop()"), pg.evaluate("location.hash"))
        # Arrive the real way: the ACCESS link on the entrance.
        pg.goto("about:blank"); pg.goto(BASE + "/"); pg.wait_for_selector(".client-access-entry"); pg.wait_for_timeout(2600)
        tap(".client-access-entry"); pg.wait_for_selector("#body .choice")
        tap("[data-role=trade]"); tap("[data-step='0']"); tap("#next"); tap("#next")
        check(f"{tag} access flow reaches #trade/3", state()[1] == "#trade/3", state())
        pg.go_back(); check(f"{tag} Back → #trade/2", state()[1] == "#trade/2" and text(pg, "#heading") == "BUILDINGCONNECTED", state())
        pg.go_back(); check(f"{tag} Back → #trade/1", state()[1] == "#trade/1", state())
        pg.go_back(); check(f"{tag} Back → #trade overview", state()[1] == "#trade" and pg.locator("#body .choice").count() == 5, state())
        pg.go_back(); check(f"{tag} Back → Access home", state() == ("client-access", "") and text(pg, "#heading") == "Welcome.", state())
        pg.go_forward(); check(f"{tag} Forward → #trade overview", state()[1] == "#trade", state())
        pg.go_forward(); pg.go_forward(); check(f"{tag} Forward ×2 → #trade/2", state()[1] == "#trade/2" and text(pg, "#heading") == "BUILDINGCONNECTED", state())
        pg.reload(); pg.wait_for_selector("#heading")
        check(f"{tag} refresh keeps #trade/2", text(pg, "#heading") == "BUILDINGCONNECTED", text(pg, "#heading"))
        hl = pg.evaluate("history.length")
        tap("#back"); check(f"{tag} in-page BACK from step 2 → step 1 (retraces history)", state()[1] == "#trade/1" and pg.evaluate("history.length") == hl, (state(), hl))
        tap("#back"); check(f"{tag} in-page BACK from step 1 → overview", state()[1] == "#trade", state())
        tap("[data-step='3']"); tap("#back")
        check(f"{tag} in-page BACK from step 4 (opened from overview) → step 3", state()[1] == "#trade/3", state())
        tap("#close"); pg.wait_for_selector(".client-access-entry")
        check(f"{tag} CLOSE returns to the entrance the visitor came from", pg.evaluate("location.pathname") in ("/", "/index"), pg.url)
        check(f"{tag} CLOSE does not replay the entrance animation", pg.locator(".freeman-intro").count() == 0)
        pg.go_forward(); pg.wait_for_selector("#heading")
        check(f"{tag} Forward after CLOSE re-enters Access", state()[0] == "client-access", pg.url)
        # Arrival from an interior page: CLOSE returns there, not to the entrance.
        pg.goto(BASE + "/company"); pg.wait_for_selector(".panel-head")
        pg.goto(ACCESS, referer=BASE + "/company"); pg.wait_for_selector("#body .choice")
        tap("[data-role=client]"); tap("[data-step='1']")
        tap("#close"); pg.wait_for_selector(".panel-head")
        check(f"{tag} CLOSE from a step returns to Company", state()[0] == "company", pg.url)
        # Direct arrival: CLOSE falls back to the entrance.
        pg.goto("about:blank"); pg.goto(ACCESS + "#client/2"); pg.wait_for_selector("#heading")
        tap("#close"); pg.wait_for_selector(".client-access-entry")
        check(f"{tag} CLOSE on direct arrival → entrance", pg.evaluate("location.pathname") in ("/", "/index"), pg.url)
        check(f"{tag} history: no JS errors", not pg.errors, pg.errors)
        ctx.close()

    # ---------- ACCESS: keyboard, focus, announcements, codes ----------
    ctx, pg = page()
    pg.goto(ACCESS); pg.wait_for_selector("#body .choice")
    pg.focus("[data-role=architect]"); pg.keyboard.press("Enter")
    check("keyboard: Enter on a relationship opens it", pg.evaluate("location.hash") == "#architect")
    check("focus moves to the new heading", pg.evaluate("document.activeElement.id") == "heading")
    check("view change is announced", "ARCHITECT" in pg.inner_text("#announce").upper(), pg.inner_text("#announce"))
    pg.focus("#next"); pg.keyboard.press("Enter"); pg.keyboard.press("Enter")
    check("keyboard: NEXT keeps focus for repeated steps", pg.evaluate("location.hash") == "#architect/2" and pg.evaluate("document.activeElement.id") == "next")
    pg.keyboard.press("Escape"); check("Escape steps back", pg.evaluate("location.hash") == "#architect/1", pg.evaluate("location.hash"))
    pg.goto(ACCESS); pg.fill("#code-entry", "nope"); pg.keyboard.press("Enter")
    check("unknown code shows status", "not recognized" in pg.inner_text("#code-status"))
    pg.fill("#code-entry", "trade"); pg.keyboard.press("Enter")
    check("TRADE code opens Trade Partners", pg.evaluate("location.hash") == "#trade")
    pg.goto(ACCESS); pg.fill("#code-entry", "alder"); pg.keyboard.press("Enter"); pg.wait_for_url(re.compile(r"/p/alder$"))
    pg.wait_for_selector("main h1")
    check("ALDER code opens the proposal at /p/alder", pg.evaluate("location.pathname") == "/p/alder" and "unavailable" not in pg.title().lower(), pg.url)
    check("keyboard/codes: no JS errors", not pg.errors, pg.errors)
    ctx.close()

    # ---------- ACCESS: layout at every viewport and state ----------
    LAYOUT = """() => {
      const r = (s) => { const e = document.querySelector(s); return e && e.offsetParent !== null ? e.getBoundingClientRect() : null; };
      const foot = r('.footer'), body = document.getElementById('body'), h1 = document.getElementById('heading');
      const below = (s) => { const b = r(s); return !b || b.bottom <= foot.top + 0.5; };
      const small = [...document.querySelectorAll('#back,#next,#close,.choice,.code-line button')].filter(e => e.offsetParent)
        .map(e => [e.id || e.className, e.getBoundingClientRect()]).filter(([, b]) => b.height < 44 || b.width < 44).map(([n, b]) => n + ' ' + Math.round(b.width) + 'x' + Math.round(b.height));
      const lastChoice = [...document.querySelectorAll('#body li')].pop();
      return {
        hscroll: document.documentElement.scrollWidth > innerWidth,
        footerInView: foot.bottom <= innerHeight + 0.5,
        actionsClear: below('.actions'), noteClear: below('#note'), formClear: below('#code-form'),
        h1Fits: h1.scrollWidth <= h1.clientWidth + 1,
        bodyScrolls: body.scrollHeight > body.clientHeight + 1,
        bodyReachable: body.scrollHeight <= body.clientHeight + 1 || getComputedStyle(body).overflowY === 'auto',
        small
      };
    }"""
    for (w, h) in VIEWPORTS:
        ctx, pg = page(w, h)
        scrolled = []
        for st in all_states():
            pg.goto(ACCESS + st); pg.reload(); pg.wait_for_selector("#heading")
            m = pg.evaluate(LAYOUT)
            label = f"{w}x{h} {st or 'home'}"
            check(f"layout {label}: no horizontal scroll", not m["hscroll"])
            check(f"layout {label}: footer in view", m["footerInView"])
            check(f"layout {label}: actions/note/form clear of footer", m["actionsClear"] and m["noteClear"] and m["formClear"], m)
            check(f"layout {label}: heading fits", m["h1Fits"])
            check(f"layout {label}: list reachable", m["bodyReachable"])
            check(f"layout {label}: touch targets ≥ 44px", not m["small"], m["small"])
            if m["bodyScrolls"]:
                scrolled.append(st or "home")
        results.append({"check": f"info {w}x{h}: states whose list scrolls inside the frame", "ok": True, "detail": ", ".join(scrolled) or "none"})
        check(f"layout {w}x{h}: no JS errors", not pg.errors, pg.errors)
        ctx.close()

    # ---------- ACCESS: contrast of text styles ----------
    ctx, pg = page()
    pg.goto(ACCESS + "#trade"); pg.wait_for_selector("#body .choice")
    bg = rgb(pg.evaluate("getComputedStyle(document.body).backgroundColor"))
    for sel in [".eyebrow", ".choice .desc", ".choice .number", "#note", ".footer", "#next", "#back", ".top .muted", "#heading", "#intro"]:
        c = rgb(pg.evaluate(f"getComputedStyle(document.querySelector({json.dumps(sel)})).color"))
        ratio = contrast(c, bg)
        check(f"contrast {sel} ≥ 4.5:1", ratio >= 4.5, round(ratio, 2))
    ctx.close()

    # ---------- Alder proposal ----------
    for (w, h) in [(1440, 900), (390, 844)]:
        tag = f"{w}x{h}"
        ctx, pg = page(w, h)
        r = pg.goto(BASE + "/p/alder"); pg.wait_for_selector("main h1, main .chapter-title, main")
        check(f"{tag} alder /p/alder loads without redirect", r.status == 200 and pg.evaluate("location.pathname") == "/p/alder", (r.status, pg.url))
        check(f"{tag} alder opening is not the unavailable view", "unavailable" not in pg.title().lower(), pg.title())
        links = sorted(set(pg.eval_on_selector_all("a[href^='/p/alder/']", "as => as.map(a => a.getAttribute('href').split('#')[0])")))
        check(f"{tag} alder opening links every chapter", all(any(l.startswith(f"/p/alder/{c}") for l in links) for c in CHAPTERS[:6]), links)
        seen, queue = set(), [f"/p/alder/{c}" for c in CHAPTERS]
        while queue:
            path = queue.pop(0)
            if path in seen: continue
            seen.add(path)
            r = pg.goto(BASE + path); pg.wait_for_selector("main")
            ok = r.status == 200 and pg.evaluate("location.pathname") == path and "unavailable" not in pg.title().lower()
            check(f"{tag} alder direct link {path}", ok, (r.status, pg.url, pg.title()))
            body = pg.inner_text("body")
            check(f"{tag} alder {path} no undefined/null text", not BAD_TEXT.search(body), BAD_TEXT.search(body))
            for l in pg.eval_on_selector_all("a[href^='/p/alder/']", "as => as.map(a => a.getAttribute('href').split('#')[0])"):
                if l not in seen and l.count("/") <= 5: queue.append(l)
        check(f"{tag} alder crawled interior links ({len(seen)})", len(seen) >= len(CHAPTERS))
        # In-app navigation, history and refresh.
        pg.goto(BASE + "/p/alder"); pg.wait_for_selector("main")
        pg.click("main a[href='/p/alder/05-budget']") if pg.locator("main a[href='/p/alder/05-budget']").count() else pg.goto(BASE + "/p/alder/05-budget")
        pg.wait_for_function("location.pathname === '/p/alder/05-budget'")
        check(f"{tag} alder chapter opens in place", "Budget" in pg.title(), pg.title())
        pg.go_back(); pg.wait_for_function("location.pathname === '/p/alder'")
        check(f"{tag} alder Back → opening", "unavailable" not in pg.title().lower(), pg.title())
        pg.go_forward(); pg.wait_for_function("location.pathname === '/p/alder/05-budget'")
        check(f"{tag} alder Forward → budget", "Budget" in pg.title(), pg.title())
        pg.reload(); pg.wait_for_selector("main")
        check(f"{tag} alder refresh keeps budget", pg.evaluate("location.pathname") == "/p/alder/05-budget" and "Budget" in pg.title(), (pg.url, pg.title()))
        pg.goto(BASE + "/proposal-alder"); pg.wait_for_selector("main")
        check(f"{tag} alder /proposal-alder canonicalizes to /p/alder", pg.evaluate("location.pathname") == "/p/alder")
        errors_before = list(pg.errors)
        pg.goto(BASE + "/p/alder/not-a-chapter"); pg.wait_for_selector("main")
        check(f"{tag} alder unknown chapter shows the unavailable view", "unavailable" in pg.title().lower(), pg.title())
        check(f"{tag} alder: no JS errors", not errors_before, errors_before)
        ctx.close()

    browser.close()

failed = [r for r in results if not r["ok"]]
summary = {"base": BASE, "checks": len(results), "failed": len(failed), "failures": failed, "results": results}
if OUT:
    import os
    os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
    json.dump(summary, open(OUT, "w"), indent=2)
print(f"{len(results)} checks, {len(failed)} failed")
for f in failed:
    print("FAIL", f["check"], "—", f["detail"])
for r in results:
    if r["check"].startswith("info"):
        print(r["check"], "—", r["detail"])
sys.exit(1 if failed else 0)
