"use strict";
/* FIELDWORK — Living front page / experimental editorial direction.
   Real V5 shell, real existing archive records, no fabricated capture dates.
   Editions are compositions, not claims of newly published work. */
window.FreemanFieldwork = (() => {
  const archive = window.RECORDS.archive;
  const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pad = n => String(n).padStart(2,"0");
  const url = a => "fieldwork-"+a.slug+".html";
  const src = a => "assets/"+a.image;
  let root,router,edition=0,lead=0,current=null;
  let editions = [0,3,2];
  function header(a) {
    return '<header class="lf-head"><nav aria-label="Freeman navigation"><a href="company.html">COMPANY</a><span>/</span><a href="projects.html">PROJECTS</a><span>/</span><a class="here" href="fieldwork.html">FIELDWORK</a><span>/</span><a href="contact.html">CONTACT</a></nav><a class="lf-close" href="'+(a?'fieldwork.html':'company.html')+'">× CLOSE</a></header>';
  }
  function footer() {
    return '<footer class="lf-footer"><span>FREEMAN GENERAL CONTRACTING<br>CARTERSVILLE, GEORGIA</span><span class="lf-footer-middle">BUILT FOR GENERATIONS™</span><span>FIELDWORK / AN ONGOING RECORD</span></footer>';
  }
  function small(a,i) {
    return '<article class="lf-brief"><a href="'+url(a)+'" class="lf-brief-image"><img src="'+src(a)+'" alt=""></a><div class="lf-brief-meta">'+pad(i+1)+' / '+esc(a.type)+'</div><a href="'+url(a)+'" class="lf-brief-title">'+esc(a.title)+'</a><span class="lf-brief-project">'+esc(a.project)+'</span></article>';
  }
  function front() {
    current=null;
    const feature=archive[lead],others=archive.map((a,i)=>({a,i})).filter(x=>x.i!==lead);
    root.innerHTML='<div class="lf-frame">'+header(false)+
      '<div class="lf-rule"></div>'+
      '<div class="lf-nameplate"><div class="lf-issue">A FREEMAN PUBLICATION<br><span>VOL. 001 / WORKING EDITION</span></div><h1>FIELDWORK<span>.</span></h1><div class="lf-updated">IN THE FIELD<br><span>AN ONGOING RECORD</span></div></div>'+
      '<div class="lf-rule"></div>'+
      '<div class="lf-front"><div class="lf-side"><div class="lf-kicker">THE EDITION / '+pad(edition+1)+'</div><h2>What the work reveals.</h2><p>People, places, materials, and the things worth noticing along the way.</p><div class="lf-selector"><div class="lf-kicker">ON THIS PAGE</div>'+archive.map((a,i)=>'<button data-lead="'+i+'" class="'+(i===lead?'selected':'')+'"><span>'+pad(i+1)+'</span><span>'+esc(a.title)+'</span><span>↗</span></button>').join('')+'</div><div class="lf-side-bottom">SELECT A STORY TO CHANGE THE FRONT PAGE.</div></div>'+
      '<div class="lf-feature"><div class="lf-kicker lf-feature-label">LEAD STORY / '+esc(feature.type.toUpperCase())+'</div><a href="'+url(feature)+'" class="lf-hero-link"><img class="lf-hero" src="'+src(feature)+'" alt=""></a><div class="lf-hero-caption"><div><div class="lf-hero-project">'+esc(feature.project)+' / '+esc(feature.type)+'</div><a href="'+url(feature)+'" class="lf-hero-title">'+esc(feature.title)+' ↗</a></div><button class="lf-next" type="button" aria-label="Show next lead story">NEXT STORY →</button></div></div>'+
      '<div class="lf-rail"><div class="lf-rail-top"><span>ELSEWHERE IN FIELDWORK</span><span>'+pad(archive.length)+' RECORDS</span></div><div class="lf-briefs">'+others.slice(0,3).map(x=>small(x.a,x.i)).join('')+'</div><button class="lf-edition" type="button">RESHUFFLE THE EDITION ↗</button><div class="lf-rail-note">A selection from Freeman’s existing visual archive. Reference and illustrative imagery are identified in individual records.</div></div></div>'+
      footer()+'</div>';
    root.querySelectorAll('[data-lead]').forEach(b=>b.addEventListener('click',()=>{lead=Number(b.dataset.lead);front()}));
    root.querySelector('.lf-next').addEventListener('click',()=>{lead=(lead+1)%archive.length;front()});
    root.querySelector('.lf-edition').addEventListener('click',()=>{edition=(edition+1)%editions.length;lead=editions[edition];front()});
  }
  function detail(a) {
    current=a;
    root.innerHTML='<div class="lf-frame">'+header(true)+'<div class="lf-rule"></div><div class="lf-detail"><div class="lf-detail-image"><img src="'+src(a)+'" alt=""></div><div class="lf-detail-copy"><div class="lf-kicker">FIELDWORK / '+esc(a.type.toUpperCase())+'</div><h1>'+esc(a.title)+'</h1><div class="lf-detail-project">'+esc(a.project)+'</div><p>'+esc(a.text||"")+'</p><div class="lf-details-note">'+esc(a.note||"")+'</div><div class="lf-details-source">SOURCE / '+esc(a.source||"Unverified reference")+'</div><a class="lf-back" href="fieldwork.html">← RETURN TO FRONT PAGE</a></div></div>'+footer()+'</div>';
  }
  function show(route) {
    const a=route.record;
    if(a)detail(a);else front();
  }
  return {
    mount(node,route,state,api){root=node;router=api;show(route)},
    update(route){show(route)},
    closeTarget(){return current?{href:"fieldwork.html"}:{href:"company.html"}},
    key(e){if(current)return false;if(e.key==="ArrowRight"){e.preventDefault();lead=(lead+1)%archive.length;front();return true}if(e.key==="ArrowLeft"){e.preventDefault();lead=(lead+archive.length-1)%archive.length;front();return true}return false},
    save(){return {lfEdition:edition,lfLead:lead}},
    destroy(){},
    title(){return current?current.title:"Fieldwork"}
  };
})();