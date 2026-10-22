(function(){
'use strict';
const ideas=Array.isArray(window.FREEMAN_IDEAS)?window.FREEMAN_IDEAS:[];
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;
function toast(message){const n=$('toast');if(!n)return;n.textContent=message;n.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.classList.remove('show'),2200)}
async function shareLink(url){
 const absolute=new URL(url,location.href).href;
 if(navigator.share){try{await navigator.share({url:absolute});return}catch(e){if(e&&e.name==='AbortError')return}}
 try{await navigator.clipboard.writeText(absolute);toast('LINK COPIED')}catch{window.prompt('Copy this link',absolute)}
}
function linkOf(item){return item.kind==='prototype'?item.href:'./idea/?id='+encodeURIComponent(item.id)}
function renderIndex(){
 const target=$('list'), search=$('search');if(!target||!search)return;let filter='all';
 function paint(){
  const term=search.value.trim().toLowerCase();
  const arr=ideas.filter(x=>(filter==='all'||x.kind===filter)&&(!term||[x.title,x.subtitle,x.type,x.status,x.premise].join(' ').toLowerCase().includes(term)));
  target.innerHTML=arr.length?arr.map(x=>'<a class="idea-row" data-kind="'+escape(x.kind)+'" href="'+escape(linkOf(x))+'"><span class="no">'+escape(x.number)+'</span><span class="primary"><span class="name">'+escape(x.title)+'</span><span class="subtitle">'+escape(x.subtitle)+'</span></span><span class="type">'+escape(x.type)+'</span><span class="state"><span class="mark" aria-hidden="true"></span>'+escape(x.status)+'</span><span class="date">'+escape(x.date)+'</span><span class="arrow" aria-hidden="true">↗</span></a>').join(''):'<p class="empty">No matching records.</p>';
  $('count').textContent=String(arr.length).padStart(2,'0')+' OF '+String(ideas.length).padStart(2,'0')+' RECORDS';
 }
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
  filter=b.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(x=>{const on=x===b;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on))});paint();
 }));
 search.addEventListener('input',paint);$('share')?.addEventListener('click',()=>shareLink(location.href));paint();
}
function renderDetail(){
 const target=$('detail');if(!target)return;
 const params=new URLSearchParams(location.search);const x=ideas.find(t=>t.id===params.get('id'));
 if(!x){target.innerHTML='<div class="topline"><span>NO MATCH FOUND</span><span>THE IDEA REGISTER</span></div><div class="hero"><h1>Not on file</h1></div><p><a href="../">← RETURN TO THE INDEX</a></p>';return}
 document.title=x.title+' — Freeman Design Lab';
 $('crumb').textContent=x.number+' / '+x.title.toUpperCase();
 const btns=[x.href?'<a class="primary" href="'+escape(x.href)+'">'+escape(x.action||'OPEN WORKING STUDY')+' <span aria-hidden="true">↗</span></a>':'',
 x.source?'<a href="'+escape(x.source)+'" target="_blank" rel="noopener noreferrer">'+escape(x.sourceLabel||'SOURCE NOTE')+' <span aria-hidden="true">↗</span></a>':'',
 '<button type="button" id="copyIdea">SHARE THIS IDEA <span aria-hidden="true">↗</span></button>'].filter(Boolean).join('');
 target.innerHTML='<div class="topline"><span>DESIGN LAB / '+escape(x.number)+'</span><span>'+escape(x.status).toUpperCase()+'</span></div>'+
 '<div class="hero"><h1>'+escape(x.title)+'</h1><p>'+escape(x.subtitle)+'</p></div>'+
 '<div class="attributes"><div><label>DISCIPLINE</label><strong>'+escape(x.type)+'</strong></div><div><label>STATE</label><strong>'+escape(x.status)+'</strong></div><div><label>ON FILE</label><strong>'+escape(x.date)+'</strong></div></div>'+
 '<div class="statement">'+escape(x.statement)+'</div>'+
 '<div class="sections"><div class="section"><p class="eyebrow">01 / THE IDEA</p><p>'+escape(x.premise)+'</p></div>'+
 '<div class="section"><p class="eyebrow">02 / WHY IT MATTERS</p><p>'+escape(x.opportunity)+'</p></div>'+
 '<div class="section"><p class="eyebrow">03 / FIRST PROOF</p><p>'+escape(x.first)+'</p></div>'+
 '<div class="section"><p class="eyebrow">04 / READER\'S NOTE</p><p>These pages organize creative proposals and prototypes. Descriptions are working ideas, not commitments, approvals, or claims about live systems.</p></div>'+
 '<div class="review"><p class="eyebrow">A QUESTION FOR GABE</p><p>'+escape(x.question)+'</p><div class="actions">'+btns+'</div></div></div>';
 $('copyIdea')?.addEventListener('click',()=>shareLink(location.href));
}
if(document.body.dataset.page==='index')renderIndex();else if(document.body.dataset.page==='detail')renderDetail();
})();