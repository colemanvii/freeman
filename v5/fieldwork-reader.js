"use strict";
/*
 * FIELDWORK / small-format log.
 * Every photographic tile and its companion note map to one of the six existing
 * source records. No implied recent field visits, fabricated dates, or invented posts.
 * V5 router and palette remain untouched.
 */
window.FreemanFieldwork = (() => {
  const archive = window.RECORDS.archive;
  const escape = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const pad = n => String(n).padStart(2,"0");
  const href = a => "fieldwork-"+a.slug+".html";
  const image = a => "assets/"+a.image;
  let root, mode="all", shift=0, current=null;
  const cards = archive.flatMap((a,i) => [
    { a, i, kind:"photo", key:a.slug+"-photo" },
    { a, i, kind:"note", key:a.slug+"-note" }
  ]);
  function header(detail) {
    return '<header class="fl-nav"><nav aria-label="Freeman navigation"><a href="company.html">COMPANY</a><span>/</span><a href="projects.html">PROJECTS</a><span>/</span><a class="fl-current" href="fieldwork.html">FIELDWORK</a><span>/</span><a href="contact.html">CONTACT</a></nav><a href="'+(detail?"fieldwork.html":"company.html")+'">× CLOSE</a></header>';
  }
  const footer = '<footer class="fl-footer"><span>FREEMAN GENERAL CONTRACTING<br>CARTERSVILLE, GEORGIA</span><span>FIELDWORK / ARCHIVE MATERIAL</span></footer>';
  const provenance = a => (/AI.generated|SAMPLE/i.test(a.status||"") ? "ILLUSTRATIVE STUDY" : /reference/i.test(a.status||"") ? "ARCHIVE REFERENCE" : a.status||a.type);
  const excerpt = a => {
    const s=String(a.text||"").replace(/\s+/g," ").trim();
    return s.length>160 ? s.slice(0,157).replace(/\s+\S*$/,"")+"…" : s;
  };
  function card(c,pos) {
    const a=c.a;
    const kind=c.kind;
    const cap='<div class="fl-label"><span>'+pad(c.i+1)+' / '+escape(a.type)+'</span><span>'+escape(provenance(a))+'</span></div>';
    return '<article class="fl-item fl-'+kind+'">'+
      '<a class="fl-item-link" href="'+href(a)+'" aria-label="'+escape(a.title)+' — '+kind+'">'+
      (kind==="photo" ? '<div class="fl-image"><img src="'+escape(image(a))+'" alt="" loading="lazy"></div>' : '<div class="fl-note-content">'+escape(excerpt(a))+'</div>')+
      '</a>'+cap+'<a class="fl-item-title" href="'+href(a)+'">'+escape(a.title)+'</a></article>';
  }
  function visible() {
    let items=cards.filter(c => mode==="all" || c.kind===mode);
    // Rotation changes the reading order without inventing new material.
    if(shift && items.length) items=items.slice(shift%items.length).concat(items.slice(0,shift%items.length));
    return items;
  }
  function front() {
    current=null;
    const list=visible();
    root.innerHTML='<div class="fl-frame">'+header(false)+
      '<div class="fl-heading"><span>FIELDWORK<span class="fl-dot">.</span></span><span class="fl-count">06 SOURCE RECORDS / '+pad(list.length)+' FRAGMENTS</span></div>'+
      '<div class="fl-tools"><div class="fl-filters" aria-label="View type">'+
      [['all','ALL'],['photo','PHOTOGRAPHS'],['note','NOTES']].map(([k,t])=>'<button type="button" data-mode="'+k+'" aria-pressed="'+(mode===k)+'">'+t+'</button>').join('')+
      '</div><button type="button" class="fl-cycle" aria-label="Change arrangement" title="Change arrangement">↻ <span>REARRANGE</span></button></div>'+
      '<main class="fl-log" aria-label="Fieldwork archive"><div class="fl-grid">'+list.map(card).join('')+'</div></main>'+
      '<div class="fl-bottom"><span>PHOTOGRAPHS AND OBSERVATIONS FROM THE EXISTING FREEMAN ARCHIVE</span><span>SELECT ANY ENTRY ↗</span></div>'+
      footer+'</div>';
    root.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;shift=0;front()});
    root.querySelector('.fl-cycle').onclick=()=>{shift=(shift+3)%Math.max(visible().length,1);front()};
  }
  function detail(a) {
    current=a;
    root.innerHTML='<div class="fl-frame">'+header(true)+
      '<div class="fl-heading"><span>FIELDWORK<span class="fl-dot">.</span></span><a class="fl-count" href="fieldwork.html">← INDEX</a></div>'+
      '<main class="fl-detail"><div class="fl-detail-photo"><img src="'+escape(image(a))+'" alt=""></div>'+
      '<article class="fl-detail-text"><span class="fl-micro">'+escape(a.project)+' / '+escape(a.type)+'</span><h1>'+escape(a.title)+'</h1>'+
      '<p>'+escape(a.text||"")+'</p>'+
      (a.note?'<div class="fl-disclosure">'+escape(a.note)+'</div>':"")+
      '<div class="fl-disclosure">SOURCE / '+escape(a.source||"Unverified archive reference")+'</div>'+
      '<a href="fieldwork.html" class="fl-return">← FIELDWORK</a></article></main>'+footer+'</div>';
  }
  const show=route=>route.record?detail(route.record):front();
  return {
    mount(node,route,state){root=node;if(state){if(["all","photo","note"].includes(state.flMode))mode=state.flMode;if(Number.isInteger(state.flShift))shift=state.flShift;}show(route)},
    update(route){show(route)},
    key(e){if(current)return false;if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();shift=(shift+(e.key==="ArrowRight"?3:9))%12;front();return true}return false},
    save(){return {flMode:mode,flShift:shift}},
    destroy(){},
    isDetail(){return !!current},
    resize(){show({record:current})},
    closeTarget(){return {href:current?"fieldwork.html":"company.html"}},
    title(){return current?current.title:"Fieldwork"}
  };
})();