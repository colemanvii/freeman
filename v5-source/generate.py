import json, pathlib

# Source files live in v5-source/ (never deployed); generated files are written to v5/ (the Cloudflare output).
src = pathlib.Path(__file__).resolve().parent
root = src.parent / 'v5'
records = json.loads((src / 'content.json').read_text())
(root / 'records.js').write_text('window.RECORDS=' + json.dumps(records).replace('</', '<\\/') + ';')

# Every route is a real file with the same shell; app.js renders the route in place and
# handles later navigation with the History API (see README "Navigation").
pages = {'index.html': 'Entry', 'company.html': 'Company', 'projects.html': 'Work', 'fieldwork.html': 'Fieldwork', 'contact.html': 'Contact', '404.html': 'Record not found'}
for p in records['projects']:
    pages['project-' + p['slug'] + '.html'] = p['name']
for a in records['archive']:
    pages['fieldwork-' + a['slug'] + '.html'] = a['title']

# Applies the visitor's palette before first paint (entry always starts in off-white).
palette = ('<script>(function(){try{var f=location.pathname.split("/").pop().replace(/\\.html$/,"");'
           'var s=history.state||{},p=(f===""||f==="index")?"chalk":(s.palette||sessionStorage.getItem("freeman-palette"));'
           'if(/^(chalk|sand|umber)$/.test(p))document.documentElement.dataset.palette=p}catch(e){}})()</script>')

SITE = 'https://www.freemangc.com'  # canonical host; the apex redirects here

def route(name):
    return '/' if name == 'index.html' else '/' + name[:-len('.html')]

for name, title in pages.items():
    # 404.html is served at any unknown path, including nested ones, so it resolves assets from the root.
    head = '<base href="/">' if name == '404.html' else f'<link rel="canonical" href="{SITE}{route(name)}">'
    (root / name).write_text(
        f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        f'<meta name="theme-color" content="#f4f4f0"><title>{title} — Freeman GC</title>{head}<link rel="icon" href="favicon.svg">{palette}'
        f'<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="fieldwork-reader.css">'
        f'<script defer src="records.js"></script><script defer src="fieldwork-reader.js"></script><script defer src="app.js"></script></head>'
        f'<body><div id="site"><main id="main"></main></div><noscript>This site needs JavaScript. '
        f'Contact Freeman at gabe@freemangc.com or 706.263.3348.</noscript></body></html>'
    )

# Public routes only: private paths (/p/, proposals, ACCESS) are never listed.
urls = ''.join(f'<url><loc>{SITE}{route(n)}</loc></url>' for n in pages if n != '404.html')
(root / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
    f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n')
(root / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n')
