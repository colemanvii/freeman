import json,pathlib
root=pathlib.Path(__file__).resolve().parent
records=json.loads((root/'content.json').read_text())
(root/'records.js').write_text('window.RECORDS='+json.dumps(records).replace('</','<\\/')+';')
pages={'index.html':'Entry','company.html':'Company','projects.html':'Work','fieldwork.html':'Fieldwork','contact.html':'Contact','404.html':'Record not found'}
for p in records['projects']:pages['project-'+p['slug']+'.html']=p['name']
for a in records['archive']:pages['fieldwork-'+a['slug']+'.html']=a['title']
for name,title in pages.items():
 (root/name).write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f4f0"><title>{title} — Freeman GC</title><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="styles.css"><script defer src="records.js"></script><script defer src="app.js"></script></head><body><div id="site"><main id="main"></main></div><noscript>This prototype needs JavaScript for its fixed-page navigation. Contact Freeman at gabe@freemangc.com or 706.263.3348.</noscript></body></html>''')
