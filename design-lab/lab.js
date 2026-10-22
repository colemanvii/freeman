(function(){
'use strict';
const studies={
 ai:{num:'D-001',drawing:'01',title:'FreemanAI',desc:'A living drawing set for the intelligence of Freeman General Contracting. Ask a question; watch the relevant part of the company take shape.',state:'APPROVED CREATIVE REFERENCE',medium:'INTERACTIVE / DESKTOP + FIELD',review:'How does this change the way we work?',href:'/studies/freemanai-002/'},
 record:{num:'D-002',drawing:'02',title:'The Record',desc:'The map is the index. The projects are the stories. Explore the places Freeman has worked and watch a body of work become a record.',state:'EXPLORATION 001 / FOR REVIEW',medium:'INTERACTIVE / DESKTOP + MOBILE',review:'Which project stories are worth telling first?',href:'/studies/the-record-001/'}
};
let chosen='ai';
function el(id){return document.getElementById(id)}
function select(key){
 if(!studies[key])return;chosen=key;const v=studies[key];
 document.querySelectorAll('.study').forEach(n=>n.classList.toggle('is-active',n.dataset.study===key));
 el('number').textContent=v.num;el('drawing-id').textContent=v.drawing;el('detail-title').textContent=v.title;el('detail-desc').textContent=v.desc;
 el('state').textContent=v.state;el('medium').textContent=v.medium;el('review').textContent=v.review;el('launch').href=v.href;
 el('drawing-ai').setAttribute('visibility',key==='ai'?'visible':'hidden');el('drawing-record').setAttribute('visibility',key==='record'?'visible':'hidden');
}
document.querySelectorAll('.study').forEach(n=>{
 n.addEventListener('pointerenter',()=>select(n.dataset.study));
 n.addEventListener('focus',()=>select(n.dataset.study));
});
el('copy').addEventListener('click',async()=>{
 const value=new URL(studies[chosen].href,location.href).href;
 try{
  if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');
  await navigator.clipboard.writeText(value);
  el('copy').firstChild.nodeValue='COPIED TO CLIPBOARD ';
  setTimeout(()=>el('copy').firstChild.nodeValue='COPY STUDY LINK ',2000);
 }catch{
  const p=window.prompt('Copy the working study link:',value);
  void p;
 }
});
})();