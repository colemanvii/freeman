/* FreemanAI — Film Study 001. A 30-second silent motion test.
   The approved Exploration 002 interface runs untouched in iframes; this director moves the
   camera, the cursor and the cuts, and operates the interface through ordinary DOM events.
   One question. One building. One decision. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const APP = '/studies/freemanai-002/';
  const KEY = 'freemanai-002';
  const params = new URLSearchParams(location.search);
  const RENDER = params.has('render');
  if (RENDER) document.body.classList.add('render');

  /* ---------- frame ---------- */
  function fit() {
    const avW = RENDER ? innerWidth : innerWidth - 48;
    const avH = RENDER ? innerHeight : innerHeight - 24 - 52;
    const w = Math.floor(Math.min(avW, (avH * 16) / 9));
    document.documentElement.style.setProperty('--w', w + 'px');
    document.documentElement.style.setProperty('--h', Math.round((w * 9) / 16) + 'px');
    document.documentElement.style.setProperty('--s', w / 1600);
  }
  addEventListener('resize', fit);
  fit();

  /* ---------- time ---------- */
  const E = {
    inOut: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    sine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    out: (t) => 1 - Math.pow(1 - t, 3),
    quint: (t) => (t < .5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
    lin: (t) => t
  };
  let t0 = 0;
  const now = () => (performance.now() - t0) / 1000;
  /* The film clock and where each beat landed, for checking the cut against the shot list and for rendering. */
  window.filmNow = () => (t0 ? now() : -1);
  const marks = (window.filmMarks = []);
  const mark = (name) => marks.push([name, +now().toFixed(2)]);
  const until = (s) => new Promise((res) => { const f = () => (now() >= s ? res() : requestAnimationFrame(f)); f(); });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const tween = (dur, fn, e = E.inOut) => new Promise((res) => {
    const a = performance.now();
    const f = () => { const k = Math.min(1, (performance.now() - a) / (dur * 1000)); fn(e(k)); k < 1 ? requestAnimationFrame(f) : res(); };
    f();
  });
  const lerp = (a, b, k) => a + (b - a) * k;
  let seed = 7;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

  /* ---------- camera: a point in the 1600 × 900 world held at the centre, at a zoom ---------- */
  const cam = { x: 800, y: 450, z: 1 };
  const applyCam = () => { $('cam').style.transform = `translate(800px,450px) scale(${cam.z}) translate(${-cam.x}px,${-cam.y}px)`; };
  const camSet = (c) => { Object.assign(cam, c); applyCam(); };
  const camTo = (c, dur, e = E.inOut) => { const a = { ...cam }; return tween(dur, (k) => { cam.x = lerp(a.x, c.x, k); cam.y = lerp(a.y, c.y, k); cam.z = lerp(a.z, c.z, k); applyCam(); }, e); };
  function frame(r, { pad = 60, max = 3, min = 1, dy = 0 } = {}) {
    const z = Math.max(min, Math.min(max, 1600 / (r.width + pad * 2), 900 / (r.height + pad * 2)));
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 + dy, z };
  }
  const union = (...rs) => { const l = Math.min(...rs.map((r) => r.left)), t = Math.min(...rs.map((r) => r.top)), r2 = Math.max(...rs.map((r) => r.left + r.width)), b = Math.max(...rs.map((r) => r.top + r.height)); return { left: l, top: t, width: r2 - l, height: b - t }; };
  const shift = (r, dx, dy) => ({ left: r.left + dx, top: r.top + dy, width: r.width, height: r.height });

  /* ---------- the interface frames ---------- */
  const PHONE = { x: 593 + 12, y: 16 + 12 };
  const F = { desk: $('desk'), desk2: $('desk2'), hand: $('hand') };
  const doc = (f) => F[f].contentDocument;
  const win = (f) => F[f].contentWindow;
  function rect(f, el) {
    const r = (typeof el === 'string' ? doc(f).querySelector(el) : el).getBoundingClientRect();
    return f === 'hand' ? shift(r, PHONE.x, PHONE.y) : { left: r.left, top: r.top, width: r.width, height: r.height };
  }
  const centre = (r) => [r.left + r.width / 2, r.top + r.height / 2];
  function load(f, url) {
    return new Promise((res) => {
      F[f].onload = () => {
        const d = doc(f), w = win(f);
        const st = d.createElement('style');
        st.textContent = '*{scrollbar-width:none!important;cursor:none!important}::-webkit-scrollbar{display:none}input{caret-color:#f93822}';
        d.head.appendChild(st);
        // Synthetic pointer events have no real pointer to capture; the interface's drag still works without it.
        w.Element.prototype.setPointerCapture = function () {};
        w.Element.prototype.releasePointerCapture = function () {};
        setTimeout(res, 120);
      };
      F[f].src = url;
    });
  }
  function click(f, el, x, y) {
    const w = win(f);
    const t = typeof el === 'string' ? doc(f).querySelector(el) : el;
    t.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y, view: w }));
  }
  function pointer(f, el, type, x, y) {
    const w = win(f);
    el.dispatchEvent(new w.PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', isPrimary: true, clientX: x, clientY: y, buttons: type === 'pointerup' ? 0 : 1 }));
  }
  async function type(el, text, ms, jitter) {
    for (const ch of text) {
      el.value += ch;
      el.dispatchEvent(new (el.ownerDocument.defaultView.Event)('input', { bubbles: true }));
      await sleep(ms + (rand() - .5) * 2 * jitter + (ch === ' ' ? ms * .4 : 0));
    }
  }

  /* ---------- cursor and touch, in world space ---------- */
  const cur = { x: 0, y: 0 };
  const placeCursor = () => { $('cursor').style.transform = `translate(${cur.x}px,${cur.y}px)`; };
  const cursorAt = (x, y) => { cur.x = x; cur.y = y; placeCursor(); };
  const cursorTo = (x, y, dur, e = E.inOut) => { const a = { ...cur }; return tween(dur, (k) => { cur.x = lerp(a.x, x, k); cur.y = lerp(a.y, y, k); placeCursor(); }, e); };
  const cursorShow = (on, dur = .25) => { $('cursor').style.transition = `opacity ${dur}s ease`; $('cursor').style.opacity = on ? 1 : 0; };
  const press = async () => { $('cursor').classList.add('down'); await sleep(110); $('cursor').classList.remove('down'); };
  function touch(x, y) {
    const t = $('touch');
    t.style.left = x + 'px'; t.style.top = y + 'px';
    t.classList.remove('tap'); void t.offsetWidth; t.classList.add('tap');
  }

  /* ---------- overlays ---------- */
  const fade = (el, to, dur, e = E.sine) => { const a = +getComputedStyle(el).opacity; return tween(dur, (k) => { el.style.opacity = lerp(a, to, k); }, e); };
  const caption = (text) => { const c = $('caption'); if (text) { c.textContent = text; c.classList.add('on'); } else c.classList.remove('on'); };

  /* ---------- the record, between capture and decision ----------
     Marks the captured record as reviewed by the project manager, in the interface's own stored
     format, so the owner's view opens on a real decision. */
  function escalate(id) {
    const s = JSON.parse(localStorage.getItem(KEY));
    const r = s.records.find((x) => x.id === id);
    const t = (s.clock += 3);
    r.state = 'decision';
    r.trail.push([t, 'Project manager', 'Reviewed: needs owner decision', 'reviewed'], [t, 'Project manager', 'Escalated to owner decision with a sample estimate']);
    localStorage.setItem(KEY, JSON.stringify(s));
  }

  /* ---------- the date rule ---------- */
  const dn = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const JOB = { from: dn('2026-05-04'), to: dn('2026-12-18'), today: dn('2026-10-22') };
  const ruleX = (r, v) => r.left + ((v - JOB.from) / (JOB.to - JOB.from)) * r.width;

  /* ---------- the film ---------- */
  let saved = null;
  async function film() {
    document.body.classList.add('film');
    $('play').disabled = true;
    try { saved = localStorage.getItem(KEY); localStorage.removeItem(KEY); } catch (_) { /* storage blocked: the interface keeps state in memory */ }
    F.desk2.style.visibility = 'hidden'; F.desk.style.visibility = 'visible'; $('phone').style.visibility = 'hidden';
    $('paper').style.opacity = 1; $('card').style.opacity = 0;
    await Promise.all([load('desk', APP + '?as=owner'), load('hand', APP + '?as=super')]);
    await sleep(500);
    $('poster').hidden = true;

    // 1. One question. Tight on the headline; the room opens around it.
    const head = rect('desk', '.headline');
    const askR = rect('desk', '#ask');
    camSet(frame(head, { pad: 30, max: 2.1 }));
    t0 = performance.now();
    window.filmEpoch = performance.timeOrigin + t0;
    progress();
    until(.15).then(() => fade($('paper'), 0, .9));
    until(.9).then(() => caption('One question.'));
    camTo(frame(union(head, askR), { pad: 90, max: 1.6 }), 2.7, E.sine);

    mark('2 type');
    // 2. The question, typed into the real field.
    await until(2.35);
    const input = doc('desk').getElementById('q');
    const go = rect('desk', '#ask .go');
    cursorAt(askR.left + 36, askR.top + askR.height / 2 + 26);
    cursorShow(true);
    input.focus();
    await until(2.6);
    await type(input, 'What’s going on with Etowah Mercantile?', 46, 16);
    await cursorTo(...centre(go), .38);
    await until(4.75);
    await press();
    caption('');
    doc('desk').getElementById('ask').requestSubmit();

    mark('3 plot');
    // 3. The sheet plots itself.
    await until(4.95);
    cursorShow(false, .2);
    camTo({ x: 800, y: 450, z: 1 }, .7, E.out);
    await until(5.7);
    const sheet = doc('desk').getElementById('sheet');
    const hint = rect('desk', '.rule-hint');
    const lift = Math.max(0, hint.top - 128);
    const s0 = sheet.scrollTop;
    tween(1.25, (k) => { sheet.scrollTop = s0 + lift * k; }, E.inOut);
    const plan = shift(rect('desk', '.plan'), 0, -lift);
    const rule = shift(rect('desk', '#rule'), 0, -lift);
    camTo(frame(union(plan, shift(rule, 0, -8)), { pad: 30, max: 1.9 }), 2.5, E.inOut);

    mark('4 scrub');
    // 4. One building. Time, dragged across it.
    await until(8.3);
    caption('One building.');
    const host = doc('desk').getElementById('rule');
    const rr = host.getBoundingClientRect();
    const y = rr.top + 40;
    const at = (v) => ruleX(rr, v);
    cursorAt(at(JOB.today) + 70, y + 46);
    cursorShow(true, .3);
    await cursorTo(at(JOB.today), y, .45, E.out);
    await until(8.85);
    $('cursor').classList.add('down');
    pointer('desk', host, 'pointerdown', at(JOB.today), y);
    let v = JOB.today;
    const drag = (to, dur, e) => { const a = v; return tween(dur, (k) => { v = lerp(a, to, k); const x = at(v); pointer('desk', host, 'pointermove', x, y); cursorAt(x, y); }, e); };
    await drag(JOB.from, 1.15, E.inOut);
    await until(10.45);
    const c0 = { ...cam };
    camTo({ x: c0.x, y: c0.y + 10, z: c0.z * 1.04 }, 4.6, E.sine);
    await drag(JOB.to, 4.2, E.sine);
    await until(15.05);
    await drag(JOB.today, .85, E.inOut);
    pointer('desk', host, 'pointerup', at(JOB.today), y);
    $('cursor').classList.remove('down');
    await until(15.75);
    caption('');

    mark('5 evidence');
    // 5. Evidence: a storefront pin opens its source, the cited line in red.
    const pinEl = doc('desk').querySelector('.plan [data-src="RFI-031"]');
    const pin = pinEl.getBoundingClientRect();
    camTo(frame(pin, { pad: 220, max: 1.85 }), .9, E.inOut);
    await cursorTo(...centre(pin), .9, E.inOut);
    await until(16.85);
    await press();
    click('desk', pinEl, ...centre(pin));
    await until(17.2);
    cursorShow(false, .3);
    const cited = rect('desk', '#evidence mark');
    const drawer = rect('desk', '#evidence .ev-body');
    camTo(frame(union(cited, { left: drawer.left, top: cited.top - 60, width: drawer.width, height: 10 }), { pad: 70, max: 2.2 }), 1.1, E.inOut);

    mark('6 phone');
    // 6. The field. A drawn phone; the camera follows four touches.
    await until(19.2);
    await fade($('paper'), 1, .3);
    F.desk.style.visibility = 'hidden';
    $('phone').style.visibility = 'visible';
    camSet({ x: 800, y: 450, z: 1 });
    $('phone').classList.add('drawn');
    fade($('paper'), 0, .4);
    await until(20.2);
    const capBtn = rect('hand', '#capture-btn');
    touch(...centre(capBtn));
    click('hand', '#capture-btn');
    await until(20.55);
    const planEl = doc('hand').getElementById('cap-plan');
    const pr = rect('hand', planEl);
    camTo(frame(union(pr, rect('hand', '#cap-note')), { pad: 40, max: 1.75 }), .7, E.inOut);
    await until(21.35);
    const lp = planEl.getBoundingClientRect();
    const px = lp.left + ((18 + 2) / 104) * lp.width, py = lp.top + ((48 + 2) / 64) * lp.height;
    touch(px + PHONE.x, py + PHONE.y);
    click('hand', planEl, px, py);
    await until(21.75);
    const note = doc('hand').getElementById('cap-note');
    await type(note, 'Water staining under the roof drain at the mezzanine. Need the roofer before drywall closes Friday.', 12, 5);
    const send = rect('hand', '#cap-send');
    camTo(frame(union(rect('hand', '#cap-note'), send), { pad: 50, max: 1.6 }), .6, E.inOut);
    await until(23.45);
    touch(...centre(send));
    click('hand', '#cap-send');
    camTo({ x: 800, y: 450, z: 1 }, .7, E.inOut);
    await until(23.7);
    escalate('FR-0413');
    const owner = load('desk2', APP + '?as=owner&q=FR-0413');

    mark('7 decision');
    // 7. One decision. The owner approves; the eagle presses in red.
    await until(24.5);
    await owner;
    await fade($('paper'), 1, .3);
    $('phone').style.visibility = 'hidden';
    F.desk2.style.visibility = 'visible';
    const node = rect('desk2', '.route li:nth-child(3)');
    const approve = rect('desk2', '[data-step="approve"]');
    camSet(frame(union(node, approve), { pad: 46, max: 2.4 }));
    caption('One decision.');
    fade($('paper'), 0, .35);
    cursorAt(approve.left + approve.width + 120, approve.top + 70);
    cursorShow(true, .3);
    await until(25.15);
    await cursorTo(...centre(approve), .6, E.inOut);
    await until(25.85);
    await press();
    click('desk2', '[data-step="approve"]');
    await sleep(140);
    cursorShow(false, .25);
    const stampEl = await (async () => { for (let i = 0; i < 20; i++) { const s = doc('desk2').querySelector('.stamp canvas'); if (s) return s.closest('.stamp'); await sleep(30); } return null; })();
    if (stampEl) {
      // The sheet re-lays out as the decision lands; measure the stamp once it has settled.
      await sleep(420);
      const st = frame(rect('desk2', doc('desk2').querySelector('.stamp canvas').closest('.stamp')), { pad: 70, max: 2.6 });
      await camTo(st, 1.25, E.inOut);
      camTo({ ...st, z: st.z * 1.035 }, 1.0, E.sine);
    }

    mark('8 card');
    // 8. Paper, and the name.
    await until(28.15);
    caption('');
    await fade($('paper'), 1, .35);
    await fade($('card'), 1, .45);
    await until(30);
    end();
  }

  function end() {
    document.body.classList.remove('film');
    try { if (saved === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, saved); } catch (_) {}
    $('play').disabled = false;
    $('play').textContent = '↺ Replay';
    window.filmDone = true;
  }

  function progress() {
    const f = () => {
      const s = Math.min(30, now());
      $('progress').style.width = (s / 30) * 100 + '%';
      $('tc').textContent = `00:${String(Math.floor(s)).padStart(2, '0')}`;
      if (s < 30) requestAnimationFrame(f);
    };
    f();
  }

  let started = false;
  const start = () => {
    if (started) { const u = new URL(location.href); u.searchParams.set('autoplay', '1'); location.href = u; return; }
    started = true;
    film().catch((e) => { console.error(e); end(); });
  };
  $('poster').addEventListener('click', start);
  $('play').addEventListener('click', start);
  addEventListener('keydown', (e) => { if (e.key === ' ' && !started) { e.preventDefault(); start(); } });
  if (params.has('autoplay') || RENDER) start();
})();
