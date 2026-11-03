import json, pathlib, shutil, sys

# Source files live in v5-source/ (never deployed); generated files are written to v5/ (the Cloudflare output).
src = pathlib.Path(__file__).resolve().parent
root = src.parent / 'v5'
records = json.loads((src / 'content.json').read_text())

# Fieldwork is withdrawn from the public site while it is developed. Its records stay in content.json and
# its reader in v5-source/fieldwork/; `python3 generate.py --fieldwork` builds it into v5/ for local work.
# Never deploy a --fieldwork build.
FIELDWORK = '--fieldwork' in sys.argv
FIELDWORK_FILES = ['fieldwork-reader.js', 'fieldwork-reader.css']
FIELDWORK_ASSETS = sorted({pathlib.Path(a['image']).name for a in records['archive']})
for f in FIELDWORK_FILES:
    (root / f).unlink(missing_ok=True)
    if FIELDWORK: shutil.copy(src / 'fieldwork' / f, root / f)
for f in FIELDWORK_ASSETS:
    (root / 'assets' / f).unlink(missing_ok=True)
    if FIELDWORK: shutil.copy(src / 'fieldwork' / 'assets' / f, root / 'assets' / f)
for old in root.glob('fieldwork*.html'):
    old.unlink()

# records.js is public: it carries only what the pages render. Unrendered source fields (budgets, square
# footage, completion years, testimonial quotes, scraped Webflow URLs) stay in content.json.
PROJECT_FIELDS = ['slug', 'id', 'name', 'location', 'type', 'summary', 'details', 'date', 'image', 'gallery', 'credits']
PUBLIC_CREDITS = {'Client', 'Photography', 'Interior Design', 'Architect'}
def public_project(p):
    q = {k: p[k] for k in PROJECT_FIELDS if k in p}
    q['credits'] = [[k, v] for k, v in p['credits'] if k in PUBLIC_CREDITS and v != 'Interior Designer']
    return q
public = {'projects': [public_project(p) for p in records['projects']], 'archive': records['archive'] if FIELDWORK else []}
(root / 'records.js').write_text('window.RECORDS=' + json.dumps(public, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + ';')

# Every route is a real file with the same shell; app.js renders the route in place and
# handles later navigation with the History API (see README "Navigation").
# PROJECTS is the map (v5/map.html, hand-built); the former projects.html index redirects to /map (v5/_redirects).
# Hand-built and never written here: map.html, client-access.html, team-os.html, working-with-freeman.html.
#
# The shells below reproduce the approved production files byte for byte (release/approved-v5-2026-10-18,
# 807e49f). Change a shell only here, run this script, and commit the regenerated files with it:
# CI checks that `python3 v5-source/generate.py` leaves v5/ unchanged.
pages = {'index.html': ('entrance', 'Freeman General Contracting'),
         'company.html': ('interior', 'Company'),
         'contact.html': ('interior', 'Contact'),
         # Notes stays out of the section line and the sitemap (withdrawn), but its route file is kept current.
         'etcetera.html': ('interior', 'Notes'),
         '404.html': ('notfound', 'Record not found')}
for p in records['projects']:
    pages['project-' + p['slug'] + '.html'] = ('project', p['name'])
if FIELDWORK:
    pages['fieldwork.html'] = ('fieldwork', 'Fieldwork')
    for a in records['archive']:
        pages['fieldwork-' + a['slug'] + '.html'] = ('fieldwork', a['title'])

SITE = 'https://www.freemangc.com'  # canonical host; the apex redirects here

def route(name):
    return '/' if name == 'index.html' else '/' + name[:-len('.html')]

# Cache-busting versions of the shared files. Bump a version here when its file changes.
V = {
    'palette': '20261026-monaco-restored',
    'styles': '20261026-monaco-lineage',
    'records-entrance': '20261018-v5-restore',
    'pixel-mark': '20261018-v5-restore',
    'signature-motion': '20261022-hand-first-stroke-001',
    'project-credits': '20261026-map-projects',
    'app': '20261026-map-projects',
}

def script(src, defer=True):
    return f'<script{" defer" if defer else ""} src="{src}"></script>'

# Same pre-paint palette initialization as ACCESS and the server-rendered gate.
PALETTE = script(f'/palette.js?v={V["palette"]}', defer=False)
PIXEL_MARK = script(f'/pixel-mark.js?v={V["pixel-mark"]}')
SIGNATURE = script(f'/signature-motion.js?v={V["signature-motion"]}')
CREDITS = script(f'/project-credits.js?v={V["project-credits"]}')
FW_CSS = '<link rel="stylesheet" href="fieldwork-reader.css">'
FW_JS = script('fieldwork-reader.js')

# The entrance carries the public description and share tags; it uses root-relative paths throughout.
ENTRANCE_META = (
    '<meta name="description" content="Freeman General Contracting. Built for Generations.">'
    '<meta property="og:type" content="website">'
    '<meta property="og:site_name" content="Freeman General Contracting">'
    '<meta property="og:title" content="Freeman General Contracting">'
    '<meta property="og:description" content="Built for Generations.">'
    f'<meta property="og:url" content="{SITE}/">'
    '<meta name="twitter:card" content="summary">'
    '<meta name="twitter:title" content="Freeman General Contracting">'
)

def shell(name, kind, title):
    # 404.html is served at any unknown path, including nested ones, so it resolves assets from the root.
    if kind == 'entrance':
        head = (f'<title>{title}</title>{ENTRANCE_META}<link rel="canonical" href="{SITE}/">'
                f'<link rel="icon" href="favicon.svg">{PALETTE}'
                f'<link rel="stylesheet" href="/styles.css?v={V["styles"]}">'
                + script(f'/records.js?v={V["records-entrance"]}') + PIXEL_MARK + SIGNATURE + script(f'/app.js?v={V["app"]}'))
    else:
        link = '<base href="/">' if kind == 'notfound' else f'<link rel="canonical" href="{SITE}{route(name)}">'
        extra = {'interior': PIXEL_MARK + SIGNATURE, 'project': CREDITS, 'notfound': '',
                 'fieldwork': FW_JS + PIXEL_MARK + SIGNATURE}[kind]
        head = (f'<title>{title} — Freeman GC</title>{link}<link rel="icon" href="favicon.svg">{PALETTE}'
                f'<link rel="stylesheet" href="styles.css?v={V["styles"]}">' + (FW_CSS if kind == 'fieldwork' else '')
                + script('records.js') + extra + script(f'app.js?v={V["app"]}'))
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<meta name="theme-color" content="#f4f4f0">' + head + '</head>'
            '<body><div id="site"><main id="main"></main></div><noscript>This site needs JavaScript. '
            'Contact Freeman at gabe@freemangc.com or 706.263.3348.</noscript></body></html>')

for name, (kind, title) in pages.items():
    (root / name).write_text(shell(name, kind, title))

# Public routes only: private paths (/p/, proposals, ACCESS) are never listed.
urls = ''.join(f'<url><loc>{SITE}{route(n)}</loc></url>' for n in ['index.html', 'company.html', 'map.html', 'contact.html'] + [n for n in pages if n.startswith('project-')])
(root / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
    f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n')
(root / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n')

# The Record is now MAP (26 Oct 2026): the old route redirects to /map, keeping any query and hash.
# _redirects already 301s /record and /record.html; this file covers direct file requests and caches.
(root / 'record.html').write_text('''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/map">
<link rel="canonical" href="https://www.freemangc.com/map">
<title>Map — Freeman General Contracting</title>
<script>location.replace("/map" + location.search + location.hash)</script>
</head><body><p>The Record has moved to <a href="/map">Freeman's Map</a>.</p></body></html>
''')
