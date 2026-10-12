import json, pathlib

root = pathlib.Path(__file__).resolve().parent
records = json.loads((root / 'content.json').read_text())
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

for name, title in pages.items():
    (root / name).write_text(
        f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        f'<meta name="theme-color" content="#f4f4f0"><title>{title} — Freeman GC</title><link rel="icon" href="favicon.svg">{palette}'
        f'<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="fieldwork-reader.css">'
        f'<script defer src="records.js"></script><script defer src="fieldwork-reader.js"></script><script defer src="app.js"></script></head>'
        f'<body><div id="site"><main id="main"></main></div><noscript>This prototype needs JavaScript for its fixed-page navigation. '
        f'Contact Freeman at gabe@freemangc.com or 706.263.3348.</noscript></body></html>'
    )
