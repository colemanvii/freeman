"""Browser-level bitmap fidelity, timing, controls and viewport checks.
Run with Playwright installed: python qa/verify.py [preview URL]
"""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
base=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8791/'
results=[]
with sync_playwright() as p:
 for engine in ['chromium','webkit']:
  browser=getattr(p,engine).launch()
  for mobile in [False,True]:
   context=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1440,'height':900},device_scale_factor=3 if mobile else 1,is_mobile=mobile,has_touch=mobile)
   page=context.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(base+'?inspect');page.wait_for_function('window.studyInspector')
   for study,end in enumerate([1540,820,1120] if mobile else [1980,1120,1500]):
    page.evaluate('(i)=>studyInspector.select(i)',study)
    page.evaluate('(ms)=>studyInspector.seek(ms)',end)
    for dark in [False,True]:
     if dark:page.locator('#mode').click()
     # Rasterize the SVG at its native 160x61 and compare with the actual original renderer.
     diff=page.evaluate('''async()=>{
       const reference=document.createElement('canvas');reference.width=160;reference.height=61;
       const mark=FreemanPixelMark.mount(reference,{play:false});
       const svg=document.querySelector('#signature').cloneNode(true);svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width','160');svg.setAttribute('height','61');
       svg.querySelector('#artwork').setAttribute('fill',getComputedStyle(document.querySelector('#artwork')).fill);
       const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));await img.decode();
       const actual=document.createElement('canvas');actual.width=160;actual.height=61;actual.getContext('2d').drawImage(img,0,0);
       const a=actual.getContext('2d').getImageData(0,0,160,61).data,b=reference.getContext('2d').getImageData(0,0,160,61).data;let differences=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])differences++;mark.destroy();return differences;
     }''')
     assert diff==0,(engine,mobile,study,dark,diff)
    assert page.locator('#artwork').get_attribute('mask') is None
    page.evaluate('studyInspector.seek(0)')
    if study==1:assert float(page.locator('#artwork').evaluate('(e)=>e.style.opacity'))==0
    else:assert page.locator('#artwork').get_attribute('mask')=='url(#reveal)'
    if study==2:
     page.evaluate('(ms)=>studyInspector.seek(ms)',480 if mobile else 660)
     widths=page.locator('#construction-mask rect').evaluate_all('(es)=>es.map(e=>+e.getAttribute("width"))')
     assert abs(widths[0]-48)<.001 and 0<widths[1]<56 and widths[2]==0,widths
    page.locator('#slow').click();assert page.locator('#slow').get_attribute('aria-pressed')=='true'
    page.locator('#replay').click()
    assert page.locator('[data-study="%d"]'%study).get_attribute('aria-pressed')=='true'
   page.emulate_media(reduced_motion='reduce');page.locator('#replay').click()
   assert page.locator('#artwork').get_attribute('mask') is None
   assert page.locator('#artwork').evaluate('(e)=>e.style.opacity')=='1'
   layout=page.evaluate('''()=>{const s=document.querySelector('#signature').getBoundingClientRect(),g=document.querySelector('.identity').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,center:s.x+s.width/2,expected:innerWidth/2,groupCenter:s.y,expectedY:innerHeight*(innerWidth<=760?.48:.5)-(s.height+Math.max(s.width/160*12,18)+(innerWidth<=760?16.5:18))/2}}''')
   assert not layout['overflow'] and abs(layout['center']-layout['expected'])<1 and abs(layout['groupCenter']-layout['expectedY'])<1,layout
   page.screenshot(path=str(Path(__file__).parent/('%s-%s.png'%(engine,'phone' if mobile else 'desktop'))))
   assert not errors,errors
   results.append({'engine':engine,'mobile':mobile,'final_rgba_differences':0,'studies':3,'palettes':2,'reduced_motion':'pass','controls':'pass','placement':'pass'})
   context.close()
  browser.close()
print(json.dumps(results,indent=2))
(Path(__file__).parent/'results.json').write_text(json.dumps(results,indent=2)+'\n')
