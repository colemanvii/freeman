const entries=[
 {day:'Day 01',stage:'Opening up',note:'The arched brick opening is exposed; temporary bracing remains in place.',alt:'Exposed brick arch and rough plaster with temporary timber bracing and offcuts'},
 {day:'Day 08',stage:'Setting the frame',note:'The timber frame is in place; the brick reveal remains exposed.',alt:'Unfinished timber radius window frame with exposed brick reveals and a workbench'},
 {day:'Day 16',stage:'Closing the reveal',note:'Plaster meets the curved frame. Protective tape remains on the glazing.',alt:'New plaster reveals around the radius window, with protective tape and floor covering'},
 {day:'Day 21',stage:'Finished result',note:'The reveal is complete. The timber sill carries the line of the frame.',alt:'Completed timber radius window in pale plaster, with a simple bench beneath'}
];
const slider=document.querySelector('#time'),recall=document.querySelector('#recall');
let selected=1,holding=false;
function render(index){const e=entries[index];document.querySelectorAll('.photo').forEach((p,i)=>p.classList.toggle('visible',i===index));document.querySelector('#photograph').setAttribute('aria-label',`Illustrative study: ${e.alt}`);document.querySelector('#day').textContent=e.day;document.querySelector('#stage').textContent=e.stage;document.querySelector('#note').textContent=e.note;document.querySelector('#count').textContent=`0${index+1} / 04`;}
function select(index){selected=index;slider.value=index;slider.setAttribute('aria-valuetext',`${entries[index].day}, ${entries[index].stage}`);document.querySelectorAll('[data-stage]').forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});render(holding?3:index)}
slider.addEventListener('input',()=>select(Number(slider.value)));
document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.stage))));
function begin(){holding=true;recall.classList.add('holding');render(3)}
function end(){if(!holding)return;holding=false;recall.classList.remove('holding');render(selected)}
recall.addEventListener('pointerdown',e=>{if(e.button!==0)return;recall.setPointerCapture(e.pointerId);begin()});
recall.addEventListener('pointerup',end);recall.addEventListener('pointercancel',end);recall.addEventListener('lostpointercapture',end);
recall.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)begin()}});
recall.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();end()}});
recall.addEventListener('contextmenu',e=>e.preventDefault());recall.addEventListener('blur',end);window.addEventListener('blur',end);document.addEventListener('visibilitychange',()=>{if(document.hidden)end()});
const image=new Image();image.onerror=()=>{document.querySelector('.image-error').hidden=false};image.src='record-assets/window-sequence.png';
select(1);
