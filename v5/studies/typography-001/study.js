/* FREEMAN — TYPOGRAPHY STUDY 001
   Plates are generated from one set of templates so every direction is judged under identical
   conditions: same copy (production, release 80bd97d), same photographs, same geometry. */
(() => {
"use strict";
const A = "../../assets/";
const SIG = "signature.svg";

/* ---------- directions ---------- */
const D = [
 {id:"mon",key:"0",short:"Control",name:"Monaco",kind:"Monospace · one family",
  faces:"Monaco (Susan Kare & Kris Holmes, Apple, 1984; outlines Bigelow & Holmes, 1991)",
  phone:"Phones already use the Monaco Lineage stack: Menlo → Freeman Mono (DejaVu)",
  thesis:"The record. One monospaced voice does every job: navigation, labels, the statement, the essay, every project name.",
  status:{label:"System font · Apple only",tone:"warn",test:["Monaco"],note:"Cannot be licensed for the web. Where it is missing the desktop stack falls to Courier New."},
  right:"Precise without being cold — Monaco has a humanist hand (open counters, a round a). The uppercase labels and hairlines make every page read like a drawing set. It rhymes with the pixel signature: both began as bitmaps on the 1984 screen.",
  cost:"One voice for every job: “× CLOSE” and “Buildings outlive the people who build them” sound identical. No bold (FREEMAN GC is synthesised), no italic. Four paragraphs of mono read like a terminal. On Windows — where Revit, and therefore most architects, live — visitors see Courier New.",
  verdict:"Excellent at 9–12 px. Unconvincing above 20 px, and anywhere Freeman needs to sound human."},
 {id:"dia",key:"A",short:"A",name:"The Instrument",kind:"Monospace, upgraded",
  faces:"ABC Diatype Mono (Dinamo) — production target: Diatype Mono + Diatype Semi-Mono",
  phone:"Same face on phones",
  thesis:"Keep the monospaced record, change the tool. A contemporary mono with better caps, figures and spacing, and a proportional sibling in reserve for longer reading.",
  status:{label:"Trial font · this Mac only",tone:"warn",test:["Study Diatype Mono"],note:"Dinamo trial (Regular only), loaded with local() for evaluation — not embedded, not licensed for publication. Medium and Semi-Mono not seen."},
  right:"The least disruptive change and a real improvement at small sizes: cleaner capitals, steadier figures, tighter long names. Nothing a visitor would call a redesign.",
  cost:"Still a monospace at essay length. Without bold, FREEMAN GC loses its emphasis. Dinamo’s faces have been the uniform of design studios since 2018; in five years this will date to exactly now. It reads as technology before it reads as hospitality.",
  verdict:"A good engineering answer, not an identity answer. Finalist only as the record layer."},
 {id:"nhg",key:"B",short:"B",name:"The Neutral",kind:"Swiss grotesk · one family",
  faces:"Neue Haas Grotesk Text 55 / 65 / 75 (Christian Schwartz, 2010, after Max Miedinger’s 1957 drawings)",
  phone:"Same face on phones",
  thesis:"The original Haas drawing, before Helvetica: let perfect neutrality frame the photographs.",
  status:{label:"Installed font · this Mac only",tone:"warn",test:["Study Neue Haas Text"],note:"Text cuts found in ~/Library/Fonts and loaded with local(); this install’s licence is not verified. The Display cut is not installed, so large sizes use Text (no optical size)."},
  right:"Impeccable. Mixed-case names set beautifully, the photographs look expensive, and an architect would take it seriously at once.",
  cost:"Freeman disappears. This is every architecture practice, gallery and private bank of the last twenty years. The Helvetica Neue study (25 Oct) already walked this road, and production came back to Monaco.",
  verdict:"Too anonymous. The work speaks for itself — and so does nobody else."},
 {id:"frk",key:"C",short:"C",name:"American Gothic",kind:"American grotesk · weight as voice",
  faces:"Libre Franklin (Impallari Type, OFL) — lineage of Morris Fuller Benton’s Franklin Gothic, ATF 1902. Production target: ATF Franklin Gothic",
  phone:"Same face on phones",
  thesis:"Franklin Gothic is the working grotesk of American newspapers, rail cars and jobsite signs. Weight is the instrument: heavy capitals for names, a plain roman for reading.",
  status:{label:"Open licence · renders everywhere",tone:"ok",test:["Libre Franklin"],note:"Libre Franklin from Google Fonts (OFL). A real face, not a stand-in — but ATF Franklin Gothic is the better-drawn production option."},
  right:"Unmistakably a builder, and unmistakably American. The heavy names read like a site hoarding. Works at every size and renders on every device.",
  cost:"Loud. Next to the pixel script it becomes two strong marks competing. The heavy capitals drift toward workwear and sports branding, and a restaurateur may read “tough” before “tasteful.”",
  verdict:"The strongest new idea for a builder. Too much volume for hospitality — unless it learns to whisper."},
 {id:"opt",key:"D",short:"D",name:"The Inscription",kind:"Humanist sans · flared stroke",
  faces:"Optima (Hermann Zapf, Stempel 1958) — production target: Optima nova (Linotype)",
  phone:"Same face on phones",
  thesis:"Zapf drew Optima after letters cut into the floor of Santa Croce in Florence: type made for buildings. Letterspaced capitals, a calm stone-cut roman.",
  status:{label:"System font · Apple only",tone:"warn",test:["Optima"],note:"The macOS / iOS copy. A web licence for Optima nova is required to publish; Windows has no Optima."},
  right:"The letterspaced capitals are genuinely beautiful, and the architectural origin is real. Nothing like any contractor.",
  cost:"In America Optima says spa, cosmetics and wealth management. Running text feels like a 1980s annual report, and there is no mono partner for the record.",
  verdict:"Beautiful and wrong. Instructive, though: the labels gain a lot from air."},
 {id:"ssf",key:"E",short:"E",name:"The Publisher",kind:"Text serif · one family, optical sizes",
  faces:"Source Serif 4 (Frank Grießhammer, Adobe; OFL), optical sizes from caption to display",
  phone:"Same face on phones",
  thesis:"One serif family doing everything, its optical sizes carrying it from 9 px labels to the statement: Freeman as an independent publisher.",
  status:{label:"Open licence · renders everywhere",tone:"ok",test:["Source Serif 4"],note:"Variable font from Google Fonts with the opsz axis, so every size gets its own drawing."},
  right:"The Company page finally reads as an essay. Project names gain dignity, and italic places feel literate.",
  cost:"The record disappears. Spaced serif capitals at 9 px are fussy, the navigation loses its precision, and the site turns into a magazine that no longer feels built. It drifts toward boutique hotel.",
  verdict:"Proves the serif belongs in the voice — and that it does not belong in the labels."},
 {id:"cas",key:"F",short:"F",name:"Two Voices",kind:"Serif voice + monospaced record",
  faces:"Voice: Libre Caslon Display & Text (Impallari Type, OFL; after William Caslon, c. 1725). Record: the production Monaco Lineage stack (Menlo → Freeman Mono)",
  phone:"Same system on phones",
  thesis:"Separate what Freeman says from what Freeman records. Caslon speaks the statements, the essays and the names. The monospace keeps every label, number and credit exactly as the site has them now.",
  status:{label:"Open licence · renders everywhere",tone:"ok",test:["Libre Caslon Text","Libre Caslon Display"],note:"Libre Caslon from Google Fonts (OFL). The record layer is production’s own stack. Production upgrade path: Founders Caslon (Klim), to be tested with a trial."},
  right:"Keeps the site’s whole character — small uppercase mono, hairlines, four corners — and adds a human voice exactly where one was missing. With the eagle and “Built for Generations” it makes sense, and it never borrows its clients’ clothes.",
  cost:"Caslon carries heritage: set carelessly it turns into wedding stationery or colonial pastiche. Libre Caslon is good but not the best Caslon at display sizes. Two voices need rules, or they turn into a mixture.",
  verdict:"Recommended."}
];

/* ---------- content (production copy, release 80bd97d) ---------- */
const COPY = [
 "The way a place gets built matters.",
 "We work alongside owners, architects, designers, and operators who care deeply about what they create. We come to the table early, bring the right people together, and carry ambitious ideas through construction.",
 "Good construction is a relationship, not a transaction. It takes clear judgment, difficult conversations, respect for the people doing the work, and decisions made for the long term.",
 "We believe the process of building should be something people look forward to, not simply something they have to get through."
];
const REG = [
 ["01","Beetlecat","Atl"],["02","The Optimist","Atl"],["03","Barnsley Family Pool","Adairsville"],["04","Bocado Pizza","Atl"],
 ["05","Savi Provisions","Emory Village"],["06","O-Ku Atlanta","Atl"],["07","La Cresta on Main","Blue Ridge"],["09","Dalton Surgery Center","Dalton"],
 ["10","Muchacho Decatur","Decatur"],["11","Brewhouse Cafe","Atl"],["12","Mule Train","Atl"],["13","Broad Street BBQ","Atl"],
 ["14","Azalea Marketplace","Atl"],["15","Woodlands at Barnsley Resort","Adairsville"],["16","Dugan’s Pub","Adairsville"]
];

const head = cur => `<div class="hd ui"><span>${["Company","Projects","Contact"].map(s=>`<span class="${s.toLowerCase()===cur?"o":""}">${s}</span>`).join('<span class="sep">/</span>')}</span><span>× Close</span></div>`;

const P = {
 home:(d)=>`${d.id==="cas"?"":""}<span class="ui home-access">Access ↗</span>
  <img class="home-sig" src="${SIG}" alt="">
  <div class="home-nav"><span>Company</span><span class="sep">/</span><span>Projects</span><span class="sep">/</span><span>Contact</span></div>
  <div class="mi home-legal">Freeman General Contracting<br>Cartersville, Georgia</div>
  <div class="mi home-bfg">Built for Generations™</div>
  <div class="swatches"><i></i><i></i><i></i></div>`,
 company:()=>`${head("company")}<div class="co"><div class="tabs"><span class="o">Philosophy</span><span>Services</span><span>People</span></div>
  <h2>Built for generations<span class="o">.</span></h2>${COPY.map(p=>`<p>${p}</p>`).join("")}</div>`,
 register:()=>`${head("projects")}<div class="rg"><div><div class="mi rg-k">North Georgia</div><h2>Places we’ve built.</h2>
  <div class="rg-cols mi"><span>Project register</span><span>15 projects</span></div>
  <ol>${REG.map(([n,t,p],i)=>`<li class="${i===0?"on":""}"><span class="n">${n}</span><span class="t">${t}</span><span class="p">${p}</span></li>`).join("")}</ol></div>
  <figure><img src="${A}project-0.jpg" alt=""><figcaption class="mi"><span>01 Beetlecat · Atlanta, Georgia</span><span>Photograph Jared Swafford</span></figcaption></figure></div>`,
 detail:()=>`${head("projects")}<div class="pg-i"><h3 class="pg-n">Beetlecat</h3><p class="pg-p">Atlanta, Georgia</p>
  <dl><div class="pg-c"><dt class="mi">Hospitality operator</dt><dd>Rocket Farm Restaurants ↗</dd></div><div class="pg-c"><dt class="mi">Photography</dt><dd>Jared Swafford</dd></div></dl></div>
  <img class="pg-img" src="${A}project-0.jpg" alt="">
  <div class="pg-ctl"><span class="ar dim">←</span><span class="ct">01 / 04</span><span class="ar">→</span></div>`,
 plate:()=>`${head("projects")}<div class="pt"><img src="${A}project-2.jpg" alt=""><div class="pt-cap"><div class="pt-n">Barnsley Family Pool</div>
  <div class="pt-m mi"><span>03 · Hospitality</span><span>Adairsville, Georgia</span><span>South Street Partners</span></div></div></div>`,
 labels:()=>`
  <div><div class="lb-row"><span>Navigation</span><span class="v ui">Company<span class="sep">/</span><span class="o">Projects</span><span class="sep">/</span>Contact</span></div>
  <div class="lb-row"><span>Controls</span><span class="v ui">× Close &nbsp;&nbsp; <span class="o">Access ↗</span></span></div>
  <div class="lb-row"><span>Legal</span><span class="v mi">Freeman General Contracting<br>Cartersville, Georgia</span></div>
  <div class="lb-row"><span>Line</span><span class="v mi">Built for Generations™</span></div>
  <div class="lb-row"><span>Caption</span><span class="v mi">Barnsley Gardens / Image to come</span></div></div>
  <div><div class="lb-row"><span>Project</span><span class="v"><span class="lb-nm">The Optimist</span><br><span class="lb-pl">Atlanta, Georgia</span></span></div>
  <div class="lb-row"><span>Credit</span><span class="v"><span class="mi">Interior design</span><br><span class="lb-tx" style="font-size:var(--dd);line-height:1.5">Chuck Marie Studio</span></span></div>
  <div class="lb-row"><span>Figures</span><span class="v lb-num">01 / 04 &nbsp; 07 &nbsp; 16 &nbsp; 706.263.3348</span></div>
  <div class="lb-row"><span>Sentence</span><span class="v lb-tx">Buildings outlive the people who build them.</span></div></div>
  <div class="lb-long"><span class="mi">Long names</span><span class="pt-n">Woodlands at Barnsley Resort</span><span class="pt-n">Interventional Pain Consultants</span></div>`
};
const PLATES = {
 home:{t:"Home",dk:true,ph:true},company:{t:"Company",dk:true,ph:true},register:{t:"Project register",dk:true,ph:true},
 detail:{t:"Project detail",dk:true,ph:true},plate:{t:"Project plate",dk:true,ph:true},labels:{t:"Labels & details",lb:true}
};
const SIZE = {dk:[1440,900],ph:[390,844],lb:[720,450]};

function frame(d,plate,size){
 const [w,h]=SIZE[size];
 return `<div class="fit" data-w="${w}" data-h="${h}" tabindex="0" role="button" aria-label="${d.name}, ${PLATES[plate].t}, ${size==="ph"?"phone":"desktop"} — open full size"><div class="fr ${size} d-${d.id}" aria-hidden="true">${P[plate](d)}</div></div>`;
}

/* ---------- fit frames to their containers ---------- */
const ro = new ResizeObserver(es=>{for(const e of es)fit(e.target)});
function fit(el){const w=+el.dataset.w,h=+el.dataset.h,k=el.clientWidth/w;el.style.height=(h*k)+"px";el.firstElementChild.style.transform=`scale(${k})`}
function observe(root){root.querySelectorAll(".fit").forEach(el=>{ro.observe(el);fit(el)})}

/* ---------- font availability, measured, so no substitute is ever presented as the real face ---------- */
const cv=document.createElement("canvas").getContext("2d");
function has(fam){const s="Hamburgefonstiv 0123 RQWag";const m=f=>{cv.font=`32px ${f}`;return cv.measureText(s).width};
 return ["monospace","serif","sans-serif"].every(g=>m(`"${fam}",${g}`)!==m(g));}
async function fontStatus(){
 const loads=['400 12px "Study Diatype Mono"','400 12px "Study Neue Haas Text"','500 12px "Study Neue Haas Text"','12px "Libre Franklin"','12px "Source Serif 4"','12px "Libre Caslon Text"','italic 12px "Libre Caslon Text"','12px "Libre Caslon Display"','12px "Freeman Mono"'];
 await Promise.allSettled(loads.map(f=>document.fonts.load(f)));
 await document.fonts.ready;
 document.querySelectorAll("[data-check]").forEach(el=>{
  const d=D.find(x=>x.id===el.dataset.check);const ok=d.status.test.every(has);
  el.classList.toggle("bad",!ok);el.querySelector(".ck").textContent=ok?"Rendering the true face on this device":"NOT AVAILABLE ON THIS DEVICE — a fallback is showing; do not judge this direction here";
 });
}

/* ---------- direction view ---------- */
function dirHeader(d){return `<header class="dh">
 <div class="dh-id"><span class="key">${d.key}</span><span class="dh-kind">${d.kind}</span></div>
 <div class="dh-main"><h3>${d.name}</h3><p class="thesis">${d.thesis}</p></div>
 <dl class="dh-spec"><div><dt>Faces</dt><dd>${d.faces}</dd></div><div><dt>Phone</dt><dd>${d.phone}</dd></div>
 <div class="st ${d.status.tone}" data-check="${d.id}"><dt>Rendering</dt><dd><strong>${d.status.label}</strong><span class="ck">Checking…</span><small>${d.status.note}</small></dd></div></dl></header>`}
function dirCritique(d){return `<section class="crit"><div><h4>What it gets right</h4><p>${d.right}</p></div><div><h4>What it costs</h4><p>${d.cost}</p></div><div class="vd"><h4>Verdict</h4><p>${d.verdict}</p></div></section>`}
function dirBody(d){
 const cap=(p,s)=>`<figcaption><span>${d.key==="0"?"Control":d.key} · ${PLATES[p].t}</span><span>${SIZE[s].join(" × ")}${s==="lb"?" · shown enlarged":""}</span></figcaption>`;
 const dk=["home","company","register","detail","plate"].map(p=>`<figure class="pl">${frame(d,p,"dk")}${cap(p,"dk")}</figure>`).join("");
 const ph=["home","company","detail","register"].map(p=>`<figure class="pl">${frame(d,p,"ph")}${cap(p,"ph")}</figure>`).join("");
 return dirHeader(d)+`<div class="dk-grid">${dk}<figure class="pl">${frame(d,"labels","lb")}${cap("labels","lb")}</figure></div><h5 class="row-h">Phone · 390 × 844</h5><div class="ph-grid">${ph}</div>`+dirCritique(d);
}
function showDir(id){
 const d=D.find(x=>x.id===id)||D[0];
 document.querySelectorAll(".dir-tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.id===d.id));
 const host=document.getElementById("dir-body");host.innerHTML=dirBody(d);observe(host);fontStatus();
 try{localStorage.setItem("t001-dir",d.id)}catch(e){}
 if(location.hash.startsWith("#dir-"))history.replaceState(null,"","#dir-"+d.id);
}

/* ---------- side by side ---------- */
const CMP=[["home","dk","Home"],["company","dk","Company"],["register","dk","Register"],["detail","dk","Detail"],["plate","dk","Plate"],["labels","lb","Labels"],["home","ph","Phone · Home"],["company","ph","Phone · Company"],["detail","ph","Phone · Detail"],["register","ph","Phone · Register"]];
function showCmp(i){
 const [p,s]=CMP[i];
 document.querySelectorAll(".cmp-tabs button").forEach((b,j)=>b.setAttribute("aria-selected",i===j));
 const host=document.getElementById("cmp-body");host.className="cmp-grid "+s;
 host.innerHTML=D.map(d=>`<figure class="pl">${frame(d,p,s)}<figcaption><span><b>${d.key==="0"?"Control":d.key}</b> ${d.name}</span><span>${d.id==="cas"?"Recommended":""}</span></figcaption></figure>`).join("");observe(host);
}

/* ---------- viewer ---------- */
const vw=document.getElementById("viewer");
function openViewer(fitEl){
 const fr=fitEl.firstElementChild.cloneNode(true);fr.style.transform="";const w=+fitEl.dataset.w,h=+fitEl.dataset.h;
 const stage=vw.querySelector(".vw-stage");stage.innerHTML="";const box=document.createElement("div");box.className="vw-box";box.appendChild(fr);stage.appendChild(box);
 const label=fitEl.getAttribute("aria-label").replace(" — open full size","");vw.querySelector(".vw-cap").textContent=label;
 const size=()=>{const k=Math.min((innerWidth-48)/w,(innerHeight-96)/h,w<800?1.6:1);box.style.width=w*k+"px";box.style.height=h*k+"px";fr.style.transform=`scale(${k})`;vw.querySelector(".vw-scale").textContent=k>=0.999&&k<=1.001?"1 : 1":`${Math.round(k*100)}%`};
 size();vw._size=size;vw.hidden=false;document.body.style.overflow="hidden";vw.querySelector("button").focus();
}
function closeViewer(){vw.hidden=true;document.body.style.overflow="";}
addEventListener("resize",()=>{if(!vw.hidden&&vw._size)vw._size()});
document.addEventListener("click",e=>{const f=e.target.closest(".fit");if(f&&!vw.contains(f))openViewer(f);if(e.target.closest(".vw-close")||e.target===vw)closeViewer()});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&!vw.hidden)closeViewer();
 const f=e.target.closest&&e.target.closest(".fit");if(f&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openViewer(f)}
});

const COURIER0={id:"cou",key:"0",name:"Courier New (production fallback)"};
/* ---------- ?plate=cas.company.dk renders one plate at 1:1 (inspection / export) ---------- */
const solo=new URLSearchParams(location.search).get("plate");
if(solo){const [id,p,s]=solo.split(".");const d=D.find(x=>x.id===id)||COURIER0;
 document.body.innerHTML=`<div class="fr ${s} d-${d.id}">${P[p](d)}</div>`;document.body.className="solo";return;}

/* ---------- boot ---------- */
document.querySelector(".dir-tabs").innerHTML=D.map(d=>`<button type="button" role="tab" data-id="${d.id}"><b>${d.key==="0"?"Control":d.key}</b><span>${d.id==="mon"?"Monaco":d.name}</span></button>`).join("");
document.querySelector(".dir-tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(b)showDir(b.dataset.id)});
document.querySelector(".cmp-tabs").innerHTML=CMP.map(c=>`<button type="button" role="tab">${c[2]}</button>`).join("");
document.querySelector(".cmp-tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(b)showCmp([...b.parentNode.children].indexOf(b))});
const COURIER=COURIER0;
document.querySelectorAll("[data-plate]").forEach(el=>{const d=D.find(x=>x.id===el.dataset.dir)||COURIER;el.innerHTML=frame(d,el.dataset.plate,el.dataset.size)});
document.querySelectorAll("[data-sentence]").forEach(el=>{el.innerHTML=D.map(d=>`<div class="ln"><span class="ln-k">${d.key==="0"?"Ctl":d.key}</span><span class="fr ln-s d-${d.id}"><span class="${d.id==="mon"||d.id==="dia"?"ln-mono":""}">Built for generations<span class="o">.</span></span></span><span class="ln-n">${d.id==="mon"?"Monaco":d.name}</span></div>`).join("")});
observe(document);
let start="cas";try{start=localStorage.getItem("t001-dir")||"cas"}catch(e){}
const hm=location.hash.match(/^#dir-(\w+)/);if(hm)start=hm[1];
showDir(start);showCmp(1);fontStatus();
addEventListener("hashchange",()=>{const m=location.hash.match(/^#dir-(\w+)/);if(m){showDir(m[1]);document.getElementById("directions").scrollIntoView()}});
window.addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("input,textarea"))return;const sec=document.getElementById("directions").getBoundingClientRect();if(sec.top>innerHeight*.5||sec.bottom<innerHeight*.5||!vw.hidden)return;
 const i=D.findIndex(d=>document.querySelector(`.dir-tabs button[data-id="${d.id}"]`).getAttribute("aria-selected")==="true");
 if(e.key==="ArrowRight")showDir(D[(i+1)%D.length].id);if(e.key==="ArrowLeft")showDir(D[(i+D.length-1)%D.length].id);});
})();
