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
(root / 'records.js').write_text('window.RECORDS=' + json.dumps(public).replace('</', '<\\/') + ';')

# Every route is a real file with the same shell; app.js renders the route in place and
# handles later navigation with the History API (see README "Navigation").
pages = {'index.html': 'Entry', 'company.html': 'Company', 'projects.html': 'Work', 'contact.html': 'Contact', '404.html': 'Record not found'}
for p in records['projects']:
    pages['project-' + p['slug'] + '.html'] = p['name']
if FIELDWORK:
    pages['fieldwork.html'] = 'Fieldwork'
    for a in records['archive']:
        pages['fieldwork-' + a['slug'] + '.html'] = a['title']

# Use the same pre-paint palette initialization as ACCESS and the server-rendered gate.
palette = '<script src="/palette.js"></script>'

fw_css = '<link rel="stylesheet" href="fieldwork-reader.css">' if FIELDWORK else ''
fw_js = '<script defer src="fieldwork-reader.js"></script>' if FIELDWORK else ''

SITE = 'https://www.freemangc.com'  # canonical host; the apex redirects here

def route(name):
    return '/' if name == 'index.html' else '/' + name[:-len('.html')]

for name, title in pages.items():
    # 404.html is served at any unknown path, including nested ones, so it resolves assets from the root.
    head = '<base href="/">' if name == '404.html' else f'<link rel="canonical" href="{SITE}{route(name)}">'
    (root / name).write_text(
        f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        f'<meta name="theme-color" content="#f4f4f0"><title>{title} — Freeman GC</title>{head}<link rel="icon" href="favicon.svg">{palette}'
        f'<link rel="stylesheet" href="styles.css">{fw_css}'
        f'<script defer src="records.js"></script>{fw_js}<script defer src="app.js?v=20261016-palette"></script></head>'
        f'<body><div id="site"><main id="main"></main></div><noscript>This site needs JavaScript. '
        f'Contact Freeman at gabe@freemangc.com or 706.263.3348.</noscript></body></html>'
    )

# Public routes only: private paths (/p/, proposals, ACCESS) are never listed.
urls = ''.join(f'<url><loc>{SITE}{route(n)}</loc></url>' for n in pages if n != '404.html' and not n.startswith('fieldwork'))
(root / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
    f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n')
(root / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n')

# Public Record stories retain their own fixed-viewport reader and construction study.
shutil.copy(src / "stories" / "record.html", root / "record.html")
