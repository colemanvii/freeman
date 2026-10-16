#!/usr/bin/env python3
"""Public → ACCESS → gate → authenticated OS, all palettes and device appearances."""
import json, os, sys
from playwright.sync_api import sync_playwright
base=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8788'
password=sys.argv[2] if len(sys.argv)>2 else 'qa-demo-password'
colors={'chalk':'rgb(255, 249, 241)','sand':'rgb(221, 207, 179)','umber':'rgb(51, 46, 32)'}
labels={'chalk':'OFF-WHITE','sand':'SAND','umber':'UMBER'}
checks=[]
os.makedirs('qa/results',exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch()
 for device,opts in [('desktop',{'viewport':{'width':1440,'height':900}}),('iphone',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True,'device_scale_factor':3})]:
  for scheme in ['light','dark']:
   for palette,color in colors.items():
    ctx=b.new_context(**opts,color_scheme=scheme)
    # An old study preference must never override the website selection.
    ctx.add_init_script("localStorage.setItem('fos-palette','chalk')")
    page=ctx.new_page()
    def verify(stage):
     page.wait_for_load_state('load')
     actual=page.evaluate("""() => ({palette:document.documentElement.dataset.palette,bg:getComputedStyle(document.body).backgroundColor,font:getComputedStyle(document.body).fontFamily,overflow:document.documentElement.scrollWidth>innerWidth})""")
     assert actual['palette']==palette and actual['bg']==color, (stage,actual,palette)
     assert 'Monaco' in actual['font'] and not actual['overflow'],(stage,actual)
     checks.append(f'{device}/{scheme}/{palette}/{stage}')
    page.goto(base+'/');page.get_by_role('button',name=labels[palette]+' palette',exact=True).click();verify('landing')
    page.get_by_role('link',name='Access',exact=True).click();page.locator('[data-team]').wait_for();verify('access')
    page.locator('[data-team]').click();page.wait_for_url('**/team-os?entry=1');verify('gate')
    if scheme=='light':page.screenshot(path=f'qa/results/{device}-{palette}-gate.png',full_page=True)
    page.reload();verify('gate reload')
    page.locator('#password').fill('incorrect-test-phrase');page.get_by_role('button',name='PROCEED').click();page.get_by_role('alert').filter(has_text='INCORRECT').wait_for();verify('failed login')
    page.locator('#password').fill(password);page.get_by_role('button',name='PROCEED').click();page.locator('.os-nav').wait_for();verify('authenticated OS')
    if scheme=='light':page.screenshot(path=f'qa/results/{device}-{palette}-os.png',full_page=True)
    page.reload();verify('OS reload')
    page.goto(base+'/team-os.html');page.locator('.os-nav').wait_for();verify('legacy route')
    page.goto(base+'/client-access');verify('return access')
    page.goto(base+'/');verify('return landing')
    ctx.close()
 b.close()
json.dump({'passed':len(checks),'checks':checks},open('qa/results/palette-continuity.json','w'),indent=2)
print(f'PASS {len(checks)} palette, typography and overflow checks')
