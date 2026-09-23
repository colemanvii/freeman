(()=>{
  const s=document.createElement('style');
  s.textContent=`
.brand .logo{display:none!important}.brand{gap:0!important}.brand .mark{width:30px!important;height:auto!important}
header{position:relative!important}.header-actions{justify-self:end!important;display:flex!important;align-items:center!important;gap:14px!important;white-space:nowrap!important}.header-actions .header-mark{justify-self:auto!important}
.client-portal{display:inline-flex!important;align-items:center!important;justify-content:center!important;height:28px!important;padding:0 10px!important;border:1px solid rgba(23,24,19,.16)!important;border-radius:0!important;color:var(--ink)!important;background:transparent!important;text-decoration:none!important;font-size:9px!important;line-height:1!important;letter-spacing:.09em!important;text-transform:uppercase!important;transition:border-color .18s ease,color .18s ease,background .18s ease!important}.client-portal:hover{border-color:var(--red)!important;color:var(--red)!important}.client-short{display:none!important}
.company-hero-image .eagle-overlay{display:none!important}.founder-photo{height:auto!important;background:transparent!important;align-self:start!important}.founder-photo img{width:100%!important;height:auto!important;max-height:none!important;object-fit:contain!important;object-position:center top!important;display:block!important}
.archive-head{align-items:flex-start!important;gap:32px!important}.archive-head span{max-width:620px!important;text-align:right!important;font-size:10px!important;line-height:1.42!important;letter-spacing:.09em!important;text-transform:uppercase!important;color:var(--muted)!important}.archive{min-height:0!important;overflow:hidden!important}.archive-grid{gap:9px!important;min-height:0!important;grid-template-rows:repeat(4,minmax(0,1fr))!important}.archive-cell{border-radius:6px!important;box-shadow:none!important;min-height:0!important}.archive-cell img{min-height:0!important}
.home-capabilities{margin-top:17px;padding-top:13px;border-top:1px solid rgba(23,24,19,.12);font-size:9px;line-height:1.55;letter-spacing:.08em;text-transform:uppercase;color:#777a72}.home-capabilities b{color:#242620;font-weight:600}.home-capabilities i{font-style:normal;color:var(--red);padding:0 5px}
.home-proof{position:relative}.home-proof:before{content:'CLIENT PERSPECTIVE';position:absolute;left:0;top:-17px;font:8px/1 Arial,sans-serif;letter-spacing:.12em;color:var(--red);text-transform:uppercase}.home-proof blockquote{max-width:390px}.home-proof cite{color:#666960}
.freeman-story{height:100%;padding:72px 4% 30px 0}.freeman-story .story-note-box{max-width:760px;border:1px solid rgba(239,62,35,.52);padding:18px 20px 20px;background:rgba(239,62,35,.018)}.freeman-story .story-label{margin-bottom:14px;color:var(--red);font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:8px;letter-spacing:.12em;text-transform:uppercase}.freeman-story .story-copy{font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:12px;line-height:1.65;letter-spacing:.015em;color:#5e6159}.freeman-story .story-copy em{font-family:Baskerville,Georgia,serif;font-size:15px;color:var(--ink)}
.project-testimonial{margin-top:20px;padding:15px 0 0 17px;border-top:1px solid rgba(212,215,207,.75);border-left:2px solid var(--red);max-width:465px}.project-testimonial .testimonial-label{font:8px/1.2 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--red);margin-bottom:9px}.project-testimonial .project-quote{font-family:Baskerville,Georgia,serif!important;font-size:18px!important;line-height:1.22!important;font-style:normal!important;color:#262821!important;margin:0!important}.project-testimonial .testimonial-credit{margin-top:10px;font:9px/1.35 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.proj-btn.has-testimonial .nm:after{content:'';display:inline-block;width:4px;height:4px;margin:0 0 2px 7px;border-radius:50%;background:var(--red)}
@media(min-width:1001px){.service-card:nth-child(-n+2),.faq-item:nth-child(-n+2){border-top:0!important}.faq-list{height:100%!important;grid-template-rows:1fr 1fr!important;column-gap:46px!important}.faq-item{padding:24px 0 26px!important;display:flex!important;flex-direction:column!important;justify-content:flex-start!important}.faq-item h3{font-size:18px!important;line-height:1.16!important;letter-spacing:-.012em!important;margin:0 0 20px!important;white-space:nowrap!important}.faq-item p{font-size:14px!important;line-height:1.52!important;max-width:96%!important;margin:0!important}.subview[data-sub="faqs"],#faqs{height:100%!important}}
@media(max-width:1000px) and (min-width:701px){.brand .mark{width:28px!important}.archive-head span{max-width:430px!important}.header-actions{gap:10px!important}.client-portal{height:26px!important;padding:0 9px!important;font-size:8px!important}.freeman-story .story-copy{font-size:11px}.project-testimonial .project-quote{font-size:16px!important}}
@media(max-width:700px){header{min-height:94px!important;grid-template-rows:48px 46px!important}.brand .logo{display:none!important}.brand{gap:0!important}.brand .mark{width:29px!important}.header-actions{grid-column:2!important;grid-row:1!important;justify-self:end!important;gap:8px!important}.header-mark{font-size:8px!important;letter-spacing:.09em!important}.client-portal{height:25px!important;padding:0 8px!important;font-size:8px!important;letter-spacing:.07em!important}.client-full{display:none!important}.client-short{display:inline!important}nav button{padding:12px 0 9px!important}.home{padding-top:34px!important}.home-copy h1{margin-top:22px!important}.home-statement{margin-top:48px!important}.home-proof{margin-top:38px!important}.home-image{margin-top:28px!important}.home-capabilities{font-size:8px!important}.proj-list-items{gap:6px!important;padding:1px 0 16px!important;scroll-snap-type:x proximity!important;-webkit-mask-image:linear-gradient(to right,#000 0,#000 calc(100% - 24px),transparent 100%)!important;mask-image:linear-gradient(to right,#000 0,#000 calc(100% - 24px),transparent 100%)!important}.proj-btn{height:31px!important;padding:0 11px!important;border:1px solid rgba(23,24,19,.17)!important;border-radius:10px!important;background:rgba(244,245,241,.55)!important;box-shadow:none!important;scroll-snap-align:start!important}.proj-btn .nm{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif!important;font-size:9px!important;font-weight:500!important;letter-spacing:.055em!important;line-height:1!important;text-transform:uppercase!important}.proj-btn.active{background:var(--ink)!important;border-color:var(--ink)!important}.proj-btn.active .nm{color:var(--paper)!important}.founder-photo{width:100%!important;height:auto!important;min-height:0!important;border-radius:16px!important;background:transparent!important}.founder-photo img{width:100%!important;height:auto!important;max-height:none!important;object-fit:contain!important;object-position:center top!important}.archive{overflow:visible!important}.archive-head{display:block!important}.archive-head span{display:block!important;margin-top:8px!important;max-width:100%!important;text-align:left!important;font-size:9px!important}.freeman-story{padding:40px 0 10px}.freeman-story .story-note-box{max-width:100%;padding:16px 16px 18px}.freeman-story .story-copy{font-size:11px}.project-testimonial{margin-top:18px;padding:13px 0 0 13px}.project-testimonial .project-quote{font-size:17px!important}}
#freeman-loader{position:fixed;inset:0;z-index:9999;background:#f4f5f1;display:grid;place-items:center;opacity:1;visibility:visible;transition:opacity .48s ease,visibility .48s ease}#freeman-loader img{width:clamp(126px,17vw,190px);height:auto;opacity:0;transform:translateY(7px);animation:freemanEagleIn .62s ease .08s forwards}@keyframes freemanEagleIn{to{opacity:1;transform:translateY(0)}}#freeman-loader.out{opacity:0;visibility:hidden}@media(prefers-reduced-motion:reduce){#freeman-loader,#freeman-loader img{transition:none!important;animation:none!important;opacity:1;transform:none}}
`;
  document.head.appendChild(s);

  const renameCopy=t=>t.replaceAll('Freeman General Contractors','Freeman General Contracting').replaceAll('General Contractors','General Contracting').replaceAll('Eight years','eight years').replaceAll('following Three years','following three years');
  const applyBrandName=(root=document)=>{
    document.title=renameCopy(document.title);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
    while(n=walker.nextNode()){if(n.nodeValue)n.nodeValue=renameCopy(n.nodeValue)}
    if(root.querySelectorAll)root.querySelectorAll('[aria-label],[alt],[title]').forEach(el=>['aria-label','alt','title'].forEach(a=>{const v=el.getAttribute(a);if(v)el.setAttribute(a,renameCopy(v))}));
  };
  applyBrandName();
  const nameObserver=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1||n.nodeType===11)applyBrandName(n);else if(n.nodeType===3&&n.nodeValue)n.nodeValue=renameCopy(n.nodeValue)})));
  nameObserver.observe(document.body,{childList:true,subtree:true});

  const header=document.querySelector('header');
  const headerMark=document.querySelector('.header-mark');
  if(header&&headerMark&&!document.querySelector('.client-portal')){
    const actions=document.createElement('div');actions.className='header-actions';header.insertBefore(actions,headerMark);actions.appendChild(headerMark);
    const portal=document.createElement('a');portal.className='client-portal';portal.href='/portal.html';portal.target='_blank';portal.rel='noopener noreferrer';portal.setAttribute('aria-label','Open Freeman client portal');portal.innerHTML='<span class="client-full">Client Portal</span><span class="client-short">Portal</span>';actions.appendChild(portal);
  }

  const overviewBtn=document.querySelector('.subnav button[data-sub="overview"]');if(overviewBtn)overviewBtn.textContent='Story';
  const overview=document.getElementById('overview');
  if(overview)overview.innerHTML='<div class="freeman-story"><div class="story-note-box"><div class="story-label">THE FREEMAN STORY</div><div class="story-copy">Freeman was built around a simple belief: the construction process should earn the same trust as the finished place. From Cartersville, Georgia, the company brings clear communication, thoughtful coordination and durable craft to hospitality, commercial and residential work — building the relationships, as well as the spaces, intended to last.</div></div></div>';
  const archiveNote=document.querySelector('.archive-head span');if(archiveNote)archiveNote.textContent='The working record behind the finished work — people, process, materials and decisions.';
  // Homepage opening is intentionally spare in V3; proof lives with the work.

  const loader=document.createElement('div');loader.id='freeman-loader';loader.setAttribute('aria-hidden','true');loader.innerHTML='<img src="https://cdn.prod.website-files.com/666b9585b7fd3bd24dfbba73/6904f319ecdcf81821e678cb_Red%20Freeman%20Eagle.svg" alt="">';document.body.prepend(loader);
  const dismiss=()=>{loader.classList.add('out');setTimeout(()=>loader.remove(),550)};
  if(document.readyState==='complete')setTimeout(dismiss,520);else window.addEventListener('load',()=>setTimeout(dismiss,520),{once:true});setTimeout(dismiss,1800);

  const installTestimonials=()=>{
    try{
      projects.forEach(p=>{p.quote='';p.quoteBy='';});
      projects[4].quote='Freeman General Contracting is a breath of fresh air in the construction industry. Highly communicative, attentive to detail, and easy to be around.';
      projects[4].quoteBy='Paul Nair · Founder, Savi Provisions';

      const quoteEl=document.getElementById('pQuote');
      let wrap=document.querySelector('.project-testimonial');
      let credit;
      if(quoteEl&&!wrap){
        wrap=document.createElement('div');wrap.className='project-testimonial';
        const label=document.createElement('div');label.className='testimonial-label';label.textContent='Client perspective';
        credit=document.createElement('div');credit.className='testimonial-credit';
        quoteEl.parentNode.insertBefore(wrap,quoteEl);wrap.appendChild(label);wrap.appendChild(quoteEl);wrap.appendChild(credit);
      }else if(wrap){credit=wrap.querySelector('.testimonial-credit')}


      // V3 field evidence is project-specific and optional.
      // Do not render generic archive imagery as proof for a project.
      const fieldEvidenceByProject={
        // Populate only with verified project-specific assets.
      };
      window.freemanFieldEvidence=fieldEvidenceByProject;

      const existingProcess=document.querySelector('.project-process');
      if(existingProcess)existingProcess.remove();

      // Field Notes remains the chronological, unpaired working log.
      const fieldNotes=[...document.querySelectorAll('.archive-cell')].map((cell,i)=>({
        number:String(i+1).padStart(3,'0'),
        image:cell.querySelector('img')?.src||'',
        title:'From the field',
        meta:'Freeman archive'
      }));
      window.freemanFieldNotes=fieldNotes;
      fieldNotes.forEach((note,i)=>{
        const cell=document.querySelectorAll('.archive-cell')[i];
        if(!cell)return;
        cell.classList.add('field-note');
        const old=cell.querySelector('span'); if(old)old.remove();
        let meta=cell.querySelector('.field-note-meta');
        if(!meta){meta=document.createElement('div');meta.className='field-note-meta';cell.appendChild(meta)}
        meta.innerHTML='<span class="field-note-number">FIELD NOTE '+note.number+'</span><b>'+note.title+'</b><em>'+note.meta+'</em>';
        cell.setAttribute('aria-label','Field Note '+note.number);
      });

      const baseShowProject=showProject;
      showProject=function(i){
        baseShowProject(i);
        const p=projects[i];
        const box=document.querySelector('.project-testimonial');
        const c=box?.querySelector('.testimonial-credit');
        if(box){box.style.display=p.quote?'block':'none'}
        if(c)c.textContent=p.quoteBy||'';
        const nav=document.getElementById('projectNav');
        if(nav){
          const prev=projects[(i-1+projects.length)%projects.length];
          const next=projects[(i+1)%projects.length];
          nav.innerHTML='<button type="button" class="project-nav-prev">← '+prev.name+'</button><span>'+String(i+1).padStart(2,'0')+' / '+String(projects.length).padStart(2,'0')+'</span><button type="button" class="project-nav-next">'+next.name+' →</button>';
          nav.querySelector('.project-nav-prev').onclick=()=>showProject((i-1+projects.length)%projects.length);
          nav.querySelector('.project-nav-next').onclick=()=>showProject((i+1)%projects.length);
        }
      };

      [...document.querySelectorAll('.proj-btn')].forEach((b,i)=>b.classList.toggle('has-testimonial',Boolean(projects[i]?.quote)));
      showProject(0);
    }catch(e){console.warn('Freeman testimonial enhancement skipped',e)}
  };

  const core=document.createElement('script');
  core.src='app-core.js?v=v3mono2';
  core.onload=installTestimonials;
  document.body.appendChild(core);
})();
