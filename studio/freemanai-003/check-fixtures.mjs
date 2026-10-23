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
for (const a of F.ATTENTION) { if (!F.SOURCES[a.src]) errs.push('attention missing ' + a.src); if (a.with && !F.SOURCES[a.with]) errs.push('attention missing ' + a.with); if (a.due < F.NOW.date) errs.push('attention overdue ' + a.src); if (!a.for || !a.for.every((r) => F.ROLES[r])) errs.push('attention has no responsible perspective ' + a.src); }
/* 003: facts and lenses. One list of facts per job; every lens reads only from it. */
const money = /\$\d|\d+(\.\d+)?%/;
for (const [no, facts] of Object.entries(F.FACTS)) {
  for (const [k, f] of Object.entries(facts)) {
    for (const id of f.src) { if (!F.SOURCES[id]) errs.push(`fact ${no}.${k} cites missing ${id}`); }
    if (f.kind === 'inferred' && !f.basis) errs.push(`inference ${no}.${k} has no basis`);
    if (f.kind === 'vif' && (!f.vif || !F.PEOPLE[f.owner])) errs.push(`V.I.F. ${no}.${k} names no one to verify`);
    if (/\$\d/.test(f.t) && !f.tier) errs.push(`fact ${no}.${k} states a dollar figure with no money tier`);
    if (f.src.some((id) => ['cost', 'company'].includes(F.SOURCES[id].access)) && !f.tier) errs.push(`fact ${no}.${k} rests on a money-tier source but has no tier`);
  }
  for (const [r, L] of Object.entries(F.LENSES[no] || {})) {
    if (!F.ROLES[r]) errs.push(`lens for unknown perspective ${r}`);
    for (const k of L.lead) if (!facts[k]) errs.push(`lens ${no}/${r} reads missing fact ${k}`);
    if (money.test(L.brief)) errs.push(`brief ${no}/${r} carries a figure; briefs are read by every perspective`);
    for (const [d] of L.marks) if (d < F.PROJECTS[no].start || d > F.PROJECTS[no].finish) errs.push(`lens ${no}/${r} mark ${d} outside job`);
    for (const it of L.layer || []) if (it.billed) {
      const sov = Object.values(F.SOURCES).find((s) => s.kind === 'Schedule of values' && s.project === no);
      for (const [room, pct] of Object.entries(it.billed)) {
        const name = F.PROJECTS[no].rooms.find((x) => x.id === room)?.name.toLowerCase();
        if (!name || !new RegExp(name + '[^,.]*?' + pct + '%').test(sov.body.toLowerCase())) errs.push(`billing layer ${room} ${pct}% does not match the schedule of values`);
      }
    }
  }
  if (Object.keys(F.LENSES[no] || {}).length !== Object.keys(F.ROLES).length) errs.push(`job ${no} lensed for some perspectives only`);
}
for (const p of Object.values(F.PROJECTS)) {
  if (p.start >= p.finish) errs.push(p.no + ' start after finish');
  for (const r of p.rooms) { if (r.rough >= r.done) errs.push(`${p.no} ${r.id} rough after done`); if (r.done > p.finish) errs.push(`${p.no} ${r.id} done after turnover`); if (r.x + r.w > 100.01 || r.y + r.h > 60.01) errs.push(`${p.no} ${r.id} off plan`); }
  for (const [d] of p.next) if (d < F.NOW.date) errs.push(`${p.no} next item in the past ${d}`);
  for (const [d] of p.milestones) if (d < p.start && p.no !== '2615' || d > p.finish) errs.push(`${p.no} milestone ${d} outside job`);
}
for (const P of Object.values(F.PRECEDENTS)) for (const id of [P.id, P.now, P.lesson, ...P.reuse.map((r) => r[1])].filter(Boolean)) if (!F.SOURCES[id]) errs.push('precedent missing ' + id);
const js = fs.readFileSync(process.argv[3], 'utf8');
for (const m of js.matchAll(/\['([A-Z]+-[A-Z0-9-]+)'/g)) if (/^(DL|FN|PH|RFI|MM|PCO|SUB|INS|EM|SCH|SO|COI|PW|BID|PA|P|L|LA|WX|SOV|WIP|CM)-/.test(m[1]) && !F.SOURCES[m[1]]) errs.push('fai.js cites missing ' + m[1]);
console.log(errs.length ? errs.join('\n') : `OK: ${Object.keys(F.SOURCES).length} sources, ${Object.keys(F.PROJECTS).length} projects, ${Object.values(F.FACTS).reduce((n, f) => n + Object.keys(f).length, 0)} facts read by ${Object.keys(F.ROLES).length} lenses, all dates on or before ${now}`);
process.exit(errs.length ? 1 : 0);
