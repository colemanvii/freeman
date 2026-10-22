import fs from 'node:fs';
const src = fs.readFileSync(process.argv[2], 'utf8');
const window = {}; new Function('window', src)(window);
const F = window.FAI; const errs = [];
const now = F.NOW.date + ' ' + F.NOW.time;
for (const [id, s] of Object.entries(F.SOURCES)) {
  const at = s.at.join(' ');
  if (at > now) errs.push(`${id} dated after now (${at})`);
  if (s.project && !F.PROJECTS[s.project]) errs.push(`${id} unknown project`);
  if (s.by && !F.PEOPLE[s.by]) errs.push(`${id} unknown person ${s.by}`);
  if (!s.by && !s.from) errs.push(`${id} has no author`);
  if (s.pin) { const p = F.PROJECTS[s.project]; if (s.pin[0] < 0 || s.pin[0] > 100 || s.pin[1] < 0 || s.pin[1] > 60) errs.push(`${id} pin off plan`);
    const d = s.at[0]; if (d < p.start && p.no !== '2615') errs.push(`${id} before project start`); }
  if (/LIVE/.test(s.body) && !/not live/i.test(s.body)) errs.push(`${id} says LIVE`);
}
for (const id of F.DISPATCH) { const s = F.SOURCES[id]; if (s.at[0] !== F.NOW.date || s.at[1] < '06:00' || s.at[1] > F.NOW.time) errs.push(`dispatch ${id} outside 06:00–${F.NOW.time}`); }
for (const a of F.ATTENTION) { if (!F.SOURCES[a.src]) errs.push('attention missing ' + a.src); if (a.with && !F.SOURCES[a.with]) errs.push('attention missing ' + a.with); if (a.due < F.NOW.date) errs.push('attention overdue ' + a.src); if (F.SOURCES[a.src].access === 'finance' && !a.finance) errs.push('finance attention not flagged ' + a.src); }
for (const p of Object.values(F.PROJECTS)) {
  if (p.start >= p.finish) errs.push(p.no + ' start after finish');
  for (const r of p.rooms) { if (r.rough >= r.done) errs.push(`${p.no} ${r.id} rough after done`); if (r.done > p.finish) errs.push(`${p.no} ${r.id} done after turnover`); if (r.x + r.w > 100.01 || r.y + r.h > 60.01) errs.push(`${p.no} ${r.id} off plan`); }
  for (const [d] of p.next) if (d < F.NOW.date) errs.push(`${p.no} next item in the past ${d}`);
  for (const [d] of p.milestones) if (d < p.start && p.no !== '2615' || d > p.finish) errs.push(`${p.no} milestone ${d} outside job`);
}
for (const P of Object.values(F.PRECEDENTS)) for (const id of [P.id, P.now, P.lesson, ...P.reuse.map((r) => r[1])].filter(Boolean)) if (!F.SOURCES[id]) errs.push('precedent missing ' + id);
const js = fs.readFileSync(process.argv[3], 'utf8');
for (const m of js.matchAll(/\['([A-Z]+-[A-Z0-9-]+)'/g)) if (/^(DL|FN|PH|RFI|MM|PCO|SUB|INS|EM|SCH|SO|COI|PW|BID|PA|P|L)-/.test(m[1]) && !F.SOURCES[m[1]]) errs.push('fai.js cites missing ' + m[1]);
console.log(errs.length ? errs.join('\n') : `OK: ${Object.keys(F.SOURCES).length} sources, ${Object.keys(F.PROJECTS).length} projects, all dates on or before ${now}`);
process.exit(errs.length ? 1 : 0);
