(function(){
"use strict";
var CONTENT_URL="/desk/content.json";
var DRAFT_KEY="freeman-the-desk-draft-v1";
var VISIT_KEY="freeman-the-desk-last-visit-v1";
var loaded=null;
var draft={choices:{},note:""};
try { var d=JSON.parse(localStorage.getItem(DRAFT_KEY)||"null"); if(d&&d.choices)draft=d; } catch(e){}
var lastVisit=0;try { lastVisit=Number(localStorage.getItem(VISIT_KEY)||0); }catch(e){}
var thisVisit=Date.now();
var $=function(s,scope){return (scope||document).querySelector(s);};
var $$=function(s,scope){return Array.prototype.slice.call((scope||document).querySelectorAll(s));};
function node(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function append(parent,children){children.forEach(function(x){parent.appendChild(x);});return parent;}
function link(href,cls,txt){var a=node("a",cls,txt);a.href=href; if(/^https?:/.test(href)){a.target="_blank";a.rel="noopener noreferrer";}return a;}
function dt(s){return new Date(s+"T12:00:00").toLocaleDateString("en-US",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase();}
function isNew(x){return lastVisit>0 && new Date(x.updatedAt||x.date+"T12:00:00").getTime()>lastVisit;}
function renderWork(){
 var root=$("#nowList"); root.replaceChildren();
 loaded.work.forEach(function(x){
  var a=link(x.url,"work-card");var meta=append(node("div","meta"),[node("span",null,"STUDY / "+x.number),node("span",null,isNew(x)?"NEW SINCE VISIT":dt(x.date))]);
  var fig=node("figure"),img=node("img");img.src=x.image;img.alt=x.alt;img.loading="lazy";fig.appendChild(img);
  append(a,[meta,fig,node("span","stage",x.stage),node("h3",null,x.title),node("p",null,x.description),append(node("div","read-more"),[node("span",null,"OPEN STUDY"),node("span",null,"↗")])]);
  root.appendChild(a);
 });
}
function renderNotes(){
 var root=$("#notesList");root.replaceChildren();
 loaded.notes.forEach(function(x,i){var row=node("article","note-row");var meta=node("div","note-meta",x.subject+" / "+dt(x.date));var b=node("div","note-body");append(b,[node("h3",null,x.title),node("p",null,x.body)]);append(row,[meta,b,node("p","note-aside",x.aside)]);root.appendChild(row);});
}
function saveDraft(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(draft));}catch(e){}}
function renderQuestions(){
 var root=$("#questions");root.replaceChildren();
 loaded.questions.forEach(function(q){
  var row=node("article","question");var head=node("div","question-head","QUESTION / "+q.num);
  var body=node("div");append(body,[node("h3",null,q.title),node("p","desc",q.desc)]);
  var options=node("div","option-list");options.setAttribute("role","group");options.setAttribute("aria-label",q.title);
  q.options.forEach(function(option){var b=node("button",null,option[1]);b.type="button";b.setAttribute("aria-pressed",String(draft.choices[q.id]===option[0]));b.addEventListener("click",function(){
   draft.choices[q.id]=draft.choices[q.id]===option[0]?"":option[0];saveDraft();
   $$("button",options).forEach(function(x){x.setAttribute("aria-pressed",String(x===b&&!!draft.choices[q.id]));});
   $("#feedbackStatus").textContent="Selection saved on this device. Use Email Cole to send it.";
  });options.appendChild(b);});
  append(row,[head,body,options]);root.appendChild(row);
 });
 var note=$("#replyNote");note.value=draft.note||"";note.addEventListener("input",function(){draft.note=note.value;saveDraft();});
}
function feedbackText(){
 var lines=["FREEMAN / THE DESK","Reactions to Edition 002",""];
 loaded.questions.forEach(function(q){var selection=q.options.find(function(x){return x[0]===draft.choices[q.id];});
 lines.push(q.num+" / "+q.title,selection?"Direction: "+selection[1]:"No direction selected","");});
 lines.push("Additional note:",draft.note||"(none)");return lines.join("\n");
}
function renderArchive(filter){
 var root=$("#archiveRows");root.replaceChildren();
 var rows=loaded.archive.filter(function(x){return filter==="all"||x.category===filter;});
 rows.forEach(function(x){
  var row=link(x.url,"archive-row");
  append(row,[node("div","num",x.number),node("h3",null,x.title),node("span","category meta",x.category.toUpperCase()),node("span","meta",x.status),node("span","arrow","↗")]);
  root.appendChild(row);
 });
 if(!rows.length)root.appendChild(node("p","error-note","Nothing filed in this category yet."));
}
function init(){
 renderWork();renderNotes();renderQuestions();renderArchive("all");
 if(lastVisit){var count=loaded.work.filter(isNew).length;$("#visitSummary").textContent=count?count+" NEW SINCE YOUR LAST VISIT":"YOU’RE UP TO DATE";}else $("#visitSummary").textContent="WELCOME TO THE FIRST EDITION";
 $$("#archiveFilters button").forEach(function(b){b.addEventListener("click",function(){
  $$("#archiveFilters button").forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});renderArchive(b.dataset.filter);
 });});
 $("#copyFeedback").addEventListener("click",function(){
  var text=feedbackText();
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){$("#feedbackStatus").textContent="Response copied. Paste it into a message to Cole.";},function(){$("#feedbackStatus").textContent="Copy failed. Use Email Cole instead.";});}
  else $("#feedbackStatus").textContent="Clipboard unavailable here. Use Email Cole instead.";
 });
 $("#emailFeedback").addEventListener("click",function(){
  var url="mailto:colecalfee@gmail.com?subject="+encodeURIComponent("The Desk / Edition 002 — notes for Cole")+"&body="+encodeURIComponent(feedbackText());
  window.location.href=url;
  $("#feedbackStatus").textContent="Email compose opened where supported. Press Send in your mail app to deliver.";
 });
}
fetch(CONTENT_URL,{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("Content unavailable");return r.json();}).then(function(d){
 if(!d||!Array.isArray(d.work)||!Array.isArray(d.notes)||!Array.isArray(d.archive)||!Array.isArray(d.questions))throw new Error("Invalid content");
 loaded=d;init();
}).catch(function(e){["#nowList","#notesList","#questions","#archiveRows"].forEach(function(s){var x=$(s);if(x)x.appendChild(node("p","error-note","The current entries could not be loaded. Please refresh."));});});
window.addEventListener("pagehide",function(){try{localStorage.setItem(VISIT_KEY,String(thisVisit));}catch(e){}});
})();