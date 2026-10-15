#!/usr/bin/env python3
"""Regression tests for the FreemanOS demo password gate (test secrets only)."""
import http.client, json, sys, urllib.parse
from playwright.sync_api import sync_playwright

BASE=sys.argv[1].rstrip("/") if len(sys.argv)>1 else "http://localhost:8788"
OUT=sys.argv[2] if len(sys.argv)>2 else "qa/results/team-os-gate.json"
PASSWORD=sys.argv[3] if len(sys.argv)>3 else "qa-demo-password"
u=urllib.parse.urlsplit(BASE)
results=[]
def check(name, ok):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ")+name)
def raw(method,path,body=None,headers=None):
    c=(http.client.HTTPSConnection if u.scheme=="https" else http.client.HTTPConnection)(u.hostname,u.port,timeout=15)
    c.putrequest(method,path)
    hdr=dict(headers or {})
    if body is not None:
        hdr.setdefault("Content-Type","application/x-www-form-urlencoded")
        hdr["Content-Length"]=str(len(body.encode()))
    for k,v in hdr.items(): c.putheader(k,v)
    c.endheaders(body.encode() if body is not None else None)
    r=c.getresponse(); data=r.read().decode("utf-8","replace")
    status=r.status; headers=dict((k.lower(),v) for k,v in r.getheaders()); c.close()
    return status,headers,data

marker="Every name, date and event is fictional"
gate="Enter the team password"
paths=["/team-os","/team-os.html","/team-os/","/team%2Dos","/%74eam-os","//team-os","///team-os","/%2Fteam-os","/\\team-os","/./team-os","/x/../team-os","/team-os%2Ehtml","/team-os.ht%6dl","/team%252Dos","/TEAM-OS"]
for path in paths:
    for method in ["GET","HEAD"]:
        status,headers,data=raw(method,path)
        check(f"{method} {path} does not leak",marker not in data)
status,headers,data=raw("GET","/team-os")
check("gate is visible",status==200 and gate in data)
check("gate is not cached","no-store" in headers.get("cache-control",""))
check("gate disallows frames","frame-ancestors 'none'" in headers.get("content-security-policy",""))
status,headers,data=raw("POST","/team-os","password=wrong")
check("wrong password rejected",status==401 and "INCORRECT PASSWORD" in data and "set-cookie" not in headers)
status,headers,data=raw("POST","/team-os","password="+urllib.parse.quote(PASSWORD))
cookie=headers.get("set-cookie","")
check("good password redirects",status==303 and headers.get("location")=="/team-os")
check("secure session cookie",all(k.lower() in cookie.lower() for k in ["HttpOnly","Secure","SameSite=Lax","Max-Age=28800"]))
session=cookie.split(";")[0]
status,headers,data=raw("GET","/team-os",headers={"Cookie":session})
check("session reveals demo",status==200 and marker in data)
check("demo content is not cached","no-store" in headers.get("cache-control",""))
status,headers,data=raw("GET","/team-os",headers={"Cookie":"fos_session=garbage"})
check("invalid cookie rejected",status==200 and gate in data)
status,headers,data=raw("HEAD","/team-os.html")
check("legacy .html redirects",status==308 and headers.get("location")=="/team-os")
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,settings in [("desktop",{"viewport":{"width":1440,"height":900}}),("mobile",{"viewport":{"width":390,"height":844},"is_mobile":True,"has_touch":True})]:
        context=b.new_context(**settings);page=context.new_page()
        page.goto(BASE+"/client-access");page.locator("[data-team]").click()
        page.wait_for_url("**/team-os")
        check(name+" enters gate",gate in page.content())
        check(name+" no horizontal overflow",page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        page.locator("#password").fill(PASSWORD);page.locator("button[type=submit]").click()
        page.wait_for_url("**/team-os")
        check(name+" can log in",marker in page.content())
        page.goto(BASE+"/client-access");page.locator("[data-team]").click();page.wait_for_url("**/team-os")
        check(name+" return visit stays logged in",marker in page.content())
        context.close()
    b.close()
import os
os.makedirs(os.path.dirname(OUT) or ".",exist_ok=True)
json.dump({"checks":len(results),"failed":[n for n,ok in results if not ok]},open(OUT,"w"),indent=2)
print(f"{len(results)} checks; {sum(not ok for _,ok in results)} failures")
sys.exit(any(not ok for _,ok in results))
