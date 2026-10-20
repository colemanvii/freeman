/* Render only original pixel geometry. The polylines below are invisible timing
   guides, never replacement artwork. Each pixel belongs to one stroke/region;
   this keeps crossing strokes from leaking through a broad reveal brush. */
(()=>{'use strict';
const pts=JSON.parse(document.querySelector('#bitmap-data').textContent);
const art=document.querySelector('#artwork'), drawing=document.querySelector('#drawing-mask'), fields=document.querySelector('#construction-mask'), svg=document.querySelector('#signature');
const pixel=([x,y])=>`M${x} ${y}h1v1h-1z`;
const original=pts.map(pixel).join('');art.setAttribute('d',original);
const mq=matchMedia('(prefers-reduced-motion: reduce)'), phone=matchMedia('(max-width:760px)');
const names=['THE DRAWING','THE IMPRESSION','THE CONSTRUCTION'];
const preferences=names.map(()=>({slow:false,dark:false}));let selected=0,raf=0,elapsed=0,start=0,playing=false;
// F bowl / downstroke and return / r / e / e / m / a / n / flourish.
// Separate spatial ownership for the F crossbar and underline avoids revealing
// adjacent marks when an earlier stroke passes their crossing coordinates.
const guides=[
 [[34,16],[29,17],[26,15],[26,11],[29,8],[34,7],[40,7],[44,8],[48,8],[55,6],[62,4]],
 [[46,8],[43,13],[39,19],[35,24],[31,30],[27,35],[22,39],[17,41],[10,41],[5,39],[4,36]],
 [[31,26],[36,25],[41,24]],
 [[35,40],[40,32],[45,25],[48,27],[48,32],[45,37],[44,40],[47,41],[51,40],[55,37]],
 [[55,35],[61,32],[65,28],[65,25],[62,25],[58,28],[54,33],[53,38],[55,41],[59,41],[64,39],[68,35]],
 [[68,35],[74,32],[78,28],[78,25],[75,25],[71,28],[67,33],[66,38],[69,41],[72,41],[77,38],[81,33]],
 [[80,40],[86,29],[89,25],[88,29],[84,37],[91,28],[96,25],[99,26],[96,32],[91,40],[98,29],[104,25],[106,26],[106,30],[102,37],[102,40],[106,41],[110,37]],
 [[121,25],[116,25],[112,29],[109,35],[109,39],[112,41],[116,39],[120,33],[124,25],[120,34],[118,39],[121,41],[125,39],[130,32]],
 [[127,40],[134,25],[132,31],[130,36],[137,28],[142,25],[145,27],[143,33],[139,38],[139,40],[143,41],[148,38],[151,34],[153,31],[155,32],[155,36],[153,40],[149,43]],
 [[149,44],[137,47],[114,49],[86,50],[61,50],[42,48],[31,47],[22,49],[13,52],[5,56]]
];
const segments=guides.map(g=>{let length=0;const s=[];for(let i=1;i<g.length;i++){const a=g[i-1],b=g[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);s.push({a,b,l,offset:length});length+=l}return {s,length}});
const distances=segments.map(g=>g.length);const total=distances.slice(0,-1).reduce((a,b)=>a+b,0);
const preceding=distances.map((_,i)=>distances.slice(0,i).reduce((a,b)=>a+b,0));
function nearest(p,g){let best={distance:Infinity,along:0};for(const s of g.s){const dx=s.b[0]-s.a[0],dy=s.b[1]-s.a[1],t=Math.max(0,Math.min(1,((p[0]-s.a[0])*dx+(p[1]-s.a[1])*dy)/(s.l*s.l)));const d=Math.hypot(p[0]-s.a[0]-dx*t,p[1]-s.a[1]-dy*t);if(d<best.distance)best={distance:d,along:s.offset+t*s.l}}return best}
const ordered=pts.map(p=>{let allowed;
 if(p[1]>=45)allowed=[9];
 else if(p[0]<43&&p[1]>=23&&p[1]<=27)allowed=[1,2];
 else if(p[1]<22)allowed=[0,1];
 else allowed=[1,3,4,5,6,7,8];
 let best={distance:Infinity},owner=0;for(const i of allowed){const v=nearest(p,segments[i]);if(v.distance<best.distance){best=v;owner=i}}
 return {p,owner,progress:owner===9?best.along/distances[9]:(preceding[owner]+best.along)/total};
});
// Invert the cubic's x coordinate so timings match CSS cubic-bezier semantics.
function bezier(x,a,b,c,d){if(x<=0)return 0;if(x>=1)return 1;let lo=0,hi=1,t=x;for(let i=0;i<24;i++){t=(lo+hi)/2;const q=1-t,v=3*q*q*t*a+3*q*t*t*c+t*t*t;if(v<x)lo=t;else hi=t}const q=1-t;return 3*q*q*t*b+3*q*t*t*d+t*t*t}
const clamp=x=>Math.max(0,Math.min(1,x));
function timing(){return phone.matches?{pause:120,inscribe:1320,end:1540,impression:[100,820],fields:[[120,480],[390,790],[700,1120]]}:{pause:180,inscribe:1720,end:1980,impression:[160,1120],fields:[[180,660],[540,1060],[940,1500]]}}
function duration(){const t=timing();return selected===0?t.end:selected===1?t.impression[1]:t.fields[2][1]}
function render(ms){elapsed=ms;const t=timing(),done=mq.matches||ms>=duration();art.removeAttribute('mask');art.style.opacity='1';drawing.setAttribute('d','');fields.style.display='none';
 if(done)return;
 if(selected===1){art.style.opacity=String(bezier(clamp((ms-t.impression[0])/(t.impression[1]-t.impression[0])),.16,1,.3,1));return}
 art.setAttribute('mask','url(#reveal)');
 if(selected===0){const main=clamp((ms-t.pause)/(t.inscribe-t.pause)),terminal=bezier(clamp((ms-t.inscribe)/(t.end-t.inscribe)),.22,.61,.36,1);drawing.setAttribute('d',ordered.filter(p=>p.owner===9?terminal>0&&p.progress<=terminal:main>0&&p.progress<=main).map(v=>pixel(v.p)).join(''))}
 else{fields.style.display='';const bounds=[0,48,104,160];Array.from(fields.children).forEach((r,i)=>{const [a,b]=t.fields[i],v=bezier(clamp((ms-a)/(b-a)),.4,0,.2,1);r.setAttribute('width',(bounds[i+1]-bounds[i])*v)})}
}
function finish(){cancelAnimationFrame(raf);playing=false;render(duration())}
function replay(){cancelAnimationFrame(raf);if(mq.matches){finish();return}start=performance.now();playing=true;render(0);const tick=now=>{const ms=(now-start)/(preferences[selected].slow?4:1);render(ms);if(ms<duration())raf=requestAnimationFrame(tick);else{playing=false;announce()}};raf=requestAnimationFrame(tick);announce()}
function announce(){document.querySelector('#status').textContent=`0${selected+1} / ${names[selected]}${mq.matches?' / REDUCED MOTION':''}`}
function fit(){const dpr=devicePixelRatio||1,mobile=phone.matches,target=mobile?innerWidth*.72:Math.min(innerWidth*.34,innerHeight*.73),limit=mobile?innerWidth-40:Math.min(innerWidth*.5,innerHeight*.9);let n=Math.max(1,Math.round(target*dpr/160));while(n>1&&160*n/dpr>limit)n--;if(160*n/dpr<target*.75)n=target*dpr/160;const px=n/dpr,group=document.querySelector('.identity'),snap=v=>Math.round(v*dpr)/dpr;document.documentElement.style.setProperty('--px',px+'px');document.documentElement.style.setProperty('--x',snap((innerWidth-160*px)/2)+'px');document.documentElement.style.setProperty('--y',snap(innerHeight*(mobile?.48:.5)-(61*px+Math.max(px*12,18)+(mobile?16.5:18))/2)+'px')}
function sync(){const p=preferences[selected];document.documentElement.dataset.mode=p.dark?'dark':'light';document.querySelector('#mode').textContent=p.dark?'Light':'Dark';document.querySelector('#mode').setAttribute('aria-pressed',String(p.dark));document.querySelector('#slow').setAttribute('aria-pressed',String(p.slow));document.querySelectorAll('[data-study]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.study===selected)));announce();fit()}
document.querySelectorAll('[data-study]').forEach(b=>b.addEventListener('click',()=>{selected=+b.dataset.study;sync();replay()}));document.querySelector('#replay').addEventListener('click',replay);
document.querySelector('#slow').addEventListener('click',()=>{preferences[selected].slow=!preferences[selected].slow;sync();replay()});document.querySelector('#mode').addEventListener('click',()=>{preferences[selected].dark=!preferences[selected].dark;sync()});
addEventListener('resize',fit);mq.addEventListener('change',()=>{finish();announce()});phone.addEventListener('change',()=>{fit();finish()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)finish()});addEventListener('pageshow',e=>{if(e.persisted)finish()});
// Deterministic test hook, enabled only with ?inspect. Never changes artwork data.
if(new URLSearchParams(location.search).has('inspect'))window.studyInspector={seek(ms){cancelAnimationFrame(raf);playing=false;render(ms)},select(i){selected=i;sync();finish()},get points(){return pts},bezier};
sync();replay();
})();
