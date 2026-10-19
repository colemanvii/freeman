#!/usr/bin/env python3
"""Read-only browser regression checks; run only against a local preview.
Optional --visual compares unchanged views with the git baseline's app.js.
"""
import argparse
import json
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('base', nargs='?', default='http://127.0.0.1:8788')
parser.add_argument('--visual', action='store_true')
parser.add_argument('--baseline', default='211968ba39b88821f4568692d2ce98dfedd55fdc')
args = parser.parse_args()
base = args.base.rstrip('/')
assert base.startswith(('http://127.0.0.1:', 'http://localhost:')), 'Local preview only'
results = []

def passed(name):
    results.append(name)
    print('PASS', name, flush=True)

def scroll(page, selector, value):
    page.locator(selector).evaluate('(el,v)=>el.scrollTop=v', value)
    page.wait_for_timeout(100)
    return page.locator(selector).evaluate('(el)=>el.scrollTop')

def near(page, selector, value):
    actual = page.locator(selector).evaluate('(el)=>el.scrollTop')
    assert abs(actual-value) <= 1, (selector, actual, value)

with sync_playwright() as p:
    browser = p.chromium.launch()
    for width, height in [(1440,900),(390,844),(320,568),(844,390)]:
        context = browser.new_context(viewport={'width':width,'height':height}, has_touch=width<900)
        page = context.new_page()
        errors=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(base+'/company')
        tab = page.locator('#co4-tab-philosophy')
        tab.focus()
        for key, name in [('ArrowRight','services'),('End','people'),('ArrowRight','philosophy'),('ArrowLeft','people'),('Home','philosophy')]:
            page.keyboard.press(key)
            active=page.locator('#co4-tab-'+name)
            expect(active).to_be_focused()
            expect(active).to_have_attribute('aria-selected','true')
            assert page.locator('[role=tab][tabindex="0"]').count()==1
            expect(page.locator('#co4-copy')).to_have_attribute('role','tabpanel')
            expect(page.locator('#co4-copy')).to_have_attribute('aria-labelledby','co4-tab-'+name)
            assert active.get_attribute('aria-controls')=='co4-copy'
        page.keyboard.press('Tab')
        expect(page.locator('#co4-copy')).to_be_focused()
        page.locator('#co4-tab-people').click()
        person=page.locator('[data-co4-person="1"]')
        person.focus(); page.keyboard.press('Enter')
        expect(person).to_be_focused()
        expect(person).to_have_attribute('aria-pressed','true')
        expect(page.locator('#co4-person-name')).to_have_text('Cameron Dombi')
        page.keyboard.press('Tab')
        expect(page.locator('[data-co4-person="2"]')).to_be_focused()
        page.keyboard.press('Space')
        expect(page.locator('[data-co4-person="2"]')).to_be_focused()
        expect(page.locator('#co4-person-name')).to_have_text('Mac Thompson')
        page.locator('#co4-tab-services').click()
        service=page.locator('[data-co4-service="2"]')
        service.focus(); page.keyboard.press('Enter')
        expect(service).to_be_focused()
        expect(page.locator('#co4-service-text')).to_contain_text('constructability')
        page.set_viewport_size({'width':390 if width>760 else 1440,'height':844})
        expect(service).to_be_focused()
        expect(page.locator('#co4-tab-services')).to_have_attribute('aria-selected','true')
        assert not errors, errors
        passed(f'Company keyboard, relationships, focus and resize {width}x{height}')
        context.close()

    context=browser.new_context(viewport={'width':1440,'height':700})
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(base+'/projects')
    page.locator('[data-pi4-select="beetlecat"]').click()
    page.locator('[data-pi4-step="1"]').click()
    expected_src=page.locator('#pi4-image').get_attribute('src')
    desktop_scroll=scroll(page,'.pi4-scroll',310)
    assert desktop_scroll>0
    page.locator('.pi4-preview-title a').click()
    page.locator('.panel-head .close').click()
    expect(page.locator('#pi4-image')).to_have_attribute('src',expected_src)
    near(page,'.pi4-scroll',desktop_scroll)
    page.go_forward(); page.go_back()
    expect(page.locator('#pi4-image')).to_have_attribute('src',expected_src)
    near(page,'.pi4-scroll',desktop_scroll)
    page.reload()
    expect(page.locator('#pi4-image')).to_have_attribute('src',expected_src)
    near(page,'.pi4-scroll',desktop_scroll)
    passed('Desktop CLOSE, Back/Forward and refresh restore scroll and preview image')

    for width in [760,761,390,1440,320,844]:
        page.set_viewport_size({'width':width,'height':700})
        page.wait_for_timeout(200)
        if width<=760:
            mobile_scroll=scroll(page,'.pi-scroller',540)
            assert mobile_scroll>0
        else:
            near(page,'.pi4-scroll',desktop_scroll)
            expect(page.locator('#pi4-image')).to_have_attribute('src',expected_src)
    passed('Repeated 760/761 breakpoint crossings retain independent scroll and preview')
    page.set_viewport_size({'width':390,'height':844}); page.wait_for_timeout(200)
    page.locator('[data-slug="beetlecat"]').click()
    # Click auto-scrolls the link; the saved scroll must match the actual departure position.
    page.locator('.panel-head .close').click()
    mobile_scroll=page.locator('.pi-scroller').evaluate('(el)=>el.scrollTop')
    page.reload(); near(page,'.pi-scroller',mobile_scroll)
    page.set_viewport_size({'width':1440,'height':700});page.wait_for_timeout(200)
    expect(page.locator('#pi4-image')).to_have_attribute('src',expected_src)
    near(page,'.pi4-scroll',desktop_scroll)
    passed('Mobile project visit and refresh retain desktop preview and both scroll positions')

    page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(200)
    page.locator('[data-slug="o-ku-atlanta"]').click()
    page.set_viewport_size({'width':1440,'height':700});page.wait_for_timeout(200)
    page.locator('.panel-head .close').click()
    expect(page.locator('[data-pi4-select="o-ku-atlanta"]')).to_have_attribute('aria-pressed','true')
    expect(page.locator('#pi4-image')).to_have_attribute('src','assets/project-5.jpg')
    passed('Project selected on mobile carries into desktop after returning across breakpoint')
    page.locator('[data-pi4-close]').click()
    page.locator('.site-nav a').filter(has_text='COMPANY').click()
    page.go_back()
    expect(page.locator('.pi4-empty-selection')).to_be_visible()
    page.reload()
    expect(page.locator('.pi4-empty-selection')).to_be_visible()
    assert not errors,errors
    passed('Closed preview survives navigation and refresh; no browser errors')
    context.close()

    if args.visual:
        baseline=subprocess.check_output(['git','show',args.baseline+':v5/app.js'],cwd=Path(__file__).resolve().parent.parent).decode()
        for width,height in [(1440,900),(390,844),(320,568),(844,390)]:
            for route,tab_name in [('company',None),('company','services'),('company','people'),('projects',None),('project-the-optimist',None)]:
                shots=[]
                for original in [True,False]:
                    ctx=browser.new_context(viewport={'width':width,'height':height},has_touch=width<900)
                    pg=ctx.new_page()
                    if original:
                        pg.route('**/app.js*',lambda r:r.fulfill(status=200,content_type='application/javascript',body=baseline))
                    pg.goto(base+'/'+route)
                    if tab_name: pg.locator('[data-co4-tab="'+tab_name+'"]').click()
                    pg.locator('body').click(position={'x':2,'y':2})
                    pg.mouse.move(0,0)
                    pg.evaluate('Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))')
                    shots.append(pg.screenshot())
                    ctx.close()
                assert shots[0]==shots[1], f'Visual difference: {route} {tab_name} {width}x{height}'
                passed(f'Pixel-identical {route}/{tab_name or "default"} {width}x{height}')
    browser.close()
Path('qa/results').mkdir(parents=True,exist_ok=True)
Path('qa/results/production-stabilization-001.json').write_text(json.dumps({'passed':len(results),'checks':results},indent=2)+'\n')
print(f'{len(results)} checks passed')
