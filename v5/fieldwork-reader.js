"use strict";
/* Freeman Fieldwork — composed, interactive editorial surface.
   Existing V5 navigation, archive imagery and source disclosures.
   No fabricated reporting dates or claims of field documentation. */
window.FreemanFieldwork=(()=>{
  const archive=window.RECORDS.archive;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pad=n=>String(n).padStart(2,"0");
  const href=a=>"fieldwork-"+a.slug+".html";
  const photo=a=>"assets/"+a.image;
  let root,selected=0,current=null;
  const note=a=>a.status&&/illustrative|ai.generated|reference/i.test(a.status)?"REFERENCE / STUDY":a.type.toUpperCase();
  const nav=detail=>'<header class="ed-nav"><nav aria-label="Primary"><a href="company.html">COMPANY</a><span>/</span><a href="projects.html">PROJECTS</a><span>/</span><a href="fieldwork.html" class="ed-current">FIELDWORK</a><span>/</span><a href="contact.html">CONTACT</a></nav><a href="'+(detail?'fieldwork.html':'company.html')+'">× CLOSE</a></header>';
  const foot='<footer class="ed-foot"><span>FREEMAN GENERAL CONTRACTING<br>CARTERSVILLE, GEORGIA</span><span>BUILT FOR GENERATIONS™</span></footer>';
  function tile(i,variant){
    const a=archive[i];
    return '<article class="ed-tile '+variant+'"><button class="ed-pick" type="button" data-select="'+i+'" aria-label="Feature '+esc(a.title)+'"><img src="'+photo(a)+'" alt="" loading="'+(variant==="ed-feature"?"eager":"lazy")+'"><span class="ed-photo-index">'+pad(i+1)+'</span></button><div class="ed-tile-caption"><span>'+esc(a.project)+'</span><a href="'+href(a)+'">'+esc(a.title)+' <span aria-hidden="true">↗</span></a></div></article>';
  }
  function front(){
    current=null;
    const list=archive.map((a,i)=>i).filter(i=>i!==selected);
    // Consistent but asymmetric visual hierarchy; selecting any item re-composes the page.
    root.innerHTML='<div class="ed-frame">'+nav(false)+
      '<section class="ed-heading"><div><span class="ed-small">FIELDWORK</span><span class="ed-tick" aria-hidden="true"></span></div><span class="ed-date">13 OCT 2026</span></section>'+
      '<main class="ed-composition" aria-label="Fieldwork selections">'+
        '<section class="ed-lead">'+
          '<div class="ed-lead-label">'+pad(selected+1)+' / '+esc(note(archive[selected]))+'</div>'+
          '<a class="ed-lead-photo" href="'+href(archive[selected])+'"><img src="'+photo(archive[selected])+'" alt=""></a>'+
          '<div class="ed-lead-bottom"><div><div class="ed-subtle">'+esc(archive[selected].project)+'</div><a class="ed-lead-title" href="'+href(archive[selected])+'">'+esc(archive[selected].title)+' ↗</a></div><button class="ed-cycle" data-next type="button" aria-label="Feature next story">→</button></div>'+
        '</section>'+
        '<section class="ed-aside">'+
          tile(list[0],"ed-secondary")+
          '<div class="ed-aside-bottom"><span>'+pad(list[0]+1)+' — '+esc(archive[list[0]].type)+'</span><button data-select="'+list[1]+'" type="button" aria-label="Feature '+esc(archive[list[1]].title)+'">↗ '+esc(archive[list[1]].title)+'</button></div>'+
        '</section>'+
        '<section class="ed-bottom">'+
          tile(list[2],"ed-bottom-photo")+
          '<div class="ed-text-column"><span class="ed-small">'+pad(list[1]+1)+' / '+esc(archive[list[1]].type)+'</span><button data-select="'+list[1]+'" class="ed-text-title" type="button">'+esc(archive[list[1]].title)+'</button><span class="ed-subtle">'+esc(archive[list[1]].project)+'</span></div>'+
          tile(list[3],"ed-bottom-photo")+
          '<div class="ed-mini"><span class="ed-small">MORE</span>'+list.slice(4).map(i=>'<button data-select="'+i+'" type="button">'+pad(i+1)+' <span>'+esc(archive[i].title)+'</span> ↗</button>').join('')+'</div>'+
        '</section>'+
      '</main>'+foot+'</div>';
    root.querySelectorAll('[data-select]').forEach(el=>el.onclick=()=>{selected=Number(el.dataset.select);front()});
    root.querySelector('[data-next]').onclick=()=>{selected=(selected+1)%archive.length;front()};
  }
  function detail(a){
    current=a;
    root.innerHTML='<div class="ed-frame">'+nav(true)+
      '<section class="ed-heading"><span class="ed-small">FIELDWORK</span><a class="ed-date" href="fieldwork.html">← ALL RECORDS</a></section>'+
      '<main class="ed-detail"><figure><img src="'+photo(a)+'" alt=""><figcaption>'+esc(a.project)+' / '+esc(a.type)+'</figcaption></figure><article><span class="ed-small">'+esc(note(a))+'</span><h1>'+esc(a.title)+'</h1><p>'+esc(a.text||"")+'</p><div class="ed-record-note">'+esc(a.note||"")+'</div><div class="ed-record-note">SOURCE / '+esc(a.source||"Unverified reference")+'</div><a href="fieldwork.html" class="ed-return">← FIELDWORK</a></article></main>'+foot+'</div>';
  }
  const show=route=>route.record?detail(route.record):front();
  return {
    mount(node,route,state){root=node;if(state&&Number.isInteger(state.edSelected))selected=Math.max(0,Math.min(archive.length-1,state.edSelected));show(route)},
    update(route){show(route)},
    key(e){if(current)return false;if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();selected=(selected+(e.key==="ArrowRight"?1:archive.length-1))%archive.length;front();return true}return false},
    save(){return {edSelected:selected}},
    destroy(){},
    isDetail(){return !!current},
    resize(){show({record:current})},
    closeTarget(){return {href:current?"fieldwork.html":"company.html"}},
    title(){return current?current.title:"Fieldwork"}
  };
})();