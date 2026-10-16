// Server-side demo gate. Cloudflare Pages secrets required:
// FREEMAN_OS_PASSWORD and FREEMAN_OS_SESSION_KEY (32+ random characters).
const COOKIE="fos_session", AGE=8*60*60, ROOT="/team-os", enc=new TextEncoder();
const SECURITY={"X-Robots-Tag":"noindex, nofollow, noarchive","X-Content-Type-Options":"nosniff","Referrer-Policy":"same-origin","Content-Security-Policy":"frame-ancestors 'none'","X-Frame-Options":"DENY"};
function eq(a,b){const x=enc.encode(a),y=enc.encode(b);let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0;}
function b64(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
async function mac(secret,data){const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64(new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(data))));}
const sign=(secret,password,exp)=>mac(secret,"fos1|"+exp+"|"+password);
async function validCookie(req,secret,password){
 const v=(req.headers.get("Cookie")||"").split(";").map(s=>s.trim()).find(s=>s.startsWith(COOKIE+"="));
 if(!v)return false;const token=v.slice(COOKIE.length+1),i=token.lastIndexOf(".");if(i<0)return false;
 const exp=token.slice(0,i);if(!/^\d{13}$/.test(exp)||Number(exp)<Date.now()||Number(exp)>Date.now()+AGE*1000)return false;
 return eq(token.slice(i+1),await sign(secret,password,exp));
}
function canonical(path){
 let p=path;for(let n=0;n<5;n++){let d;try{d=decodeURIComponent(p);}catch{return null;}if(d===p)break;p=d;}
 p=p.replace(/\\/g,"/").replace(/\/{2,}/g,"/");
 const out=[];for(const t of p.split("/")){if(t===".")continue;if(t==="..")out.pop();else out.push(t);}
 return ("/"+out.filter((t,i)=>t||i===out.length-1).join("/")).toLowerCase();
}
const isProtected=p=>p===ROOT||p.startsWith(ROOT+"/")||p.startsWith(ROOT+".");
function page(error){
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#f4f4f0"><link rel="icon" href="/favicon.svg"><title>Team Access — Freeman GC</title><script src="/palette.js"></script><style>'+
 ':root{--paper:#f4f4f0;--ink:#30312f;--muted:#70716c;--rule:#cfd1cb;--orange:#c2431a}*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--paper);color:var(--ink)}body{font:13px/1.55 Monaco,"SFMono-Regular",Consolas,monospace;-webkit-font-smoothing:antialiased}.frame{min-height:100dvh;padding:30px clamp(20px,5vw,64px) 22px;display:grid;grid-template-rows:auto 1fr auto;gap:30px}header,footer{display:flex;justify-content:space-between;gap:15px}header{font-size:11px}footer{border-top:1px solid var(--rule);padding-top:14px;font-size:10px;color:var(--muted)}main{width:100%;max-width:530px;align-self:center;justify-self:center;margin-top:-7vh}.kicker{font-size:11px;color:var(--muted);margin:0 0 20px}h1{font-weight:400;font-size:clamp(35px,5vw,60px);letter-spacing:-.055em;line-height:1.1;margin:0 0 24px}p{color:var(--muted);margin:0 0 32px;font-size:13px}label{display:block;font-size:11px;color:var(--muted);margin-bottom:10px}.line{display:flex;border-bottom:1px solid var(--ink);align-items:center;gap:16px}input{border:0;outline:0;background:transparent;color:var(--ink);font:17px Monaco,Consolas,monospace;padding:10px 0;min-width:0;flex:1;width:100%}input:focus-visible{outline:none}.line:focus-within{border-bottom:2px solid var(--ink)}button{background:transparent;border:0;color:var(--ink);font:13px Monaco,monospace;cursor:pointer;white-space:nowrap;min-height:44px}button:hover,button:focus-visible,a:hover{color:var(--orange)}.error{color:var(--orange);font-size:12px;margin-top:15px;min-height:19px}a{color:inherit;text-decoration:none}.frame{padding:clamp(20px,3vw,38px) clamp(20px,3.6vw,48px);gap:20px}header{letter-spacing:.035em}main{max-width:360px;margin-top:-3vh}.kicker{font-size:10px;letter-spacing:.09em;margin-bottom:28px}h1{font-size:14px;letter-spacing:.09em;font-weight:400;line-height:1.5;margin-bottom:32px}p{display:none}label{font-size:10px;letter-spacing:.065em;margin-bottom:7px}.line{border-color:var(--rule);gap:10px}.line:focus-within{border-color:var(--ink)}input{font-size:17px;letter-spacing:.12em;padding:12px 0;color:transparent;caret-color:var(--orange);position:relative;z-index:2}.line{position:relative}.asterisks{position:absolute;left:0;top:50%;transform:translateY(-50%);font:17px Monaco,Consolas,monospace;letter-spacing:.12em;color:var(--orange);pointer-events:none;z-index:1;white-space:nowrap;overflow:hidden;max-width:calc(100% - 105px)}button{font-size:11px;letter-spacing:.055em;padding:0 4px}.error{font-size:10px;margin-top:12px}.micro{font-size:10px;color:var(--muted);line-height:1.9;margin-top:25px;letter-spacing:.015em}.seal{display:inline-block;width:5px;height:5px;background:var(--orange);margin-right:9px;vertical-align:middle}footer{letter-spacing:.03em}@media(max-width:480px){main{margin-top:0}.frame{padding:22px 20px}}'+
 '</style><link rel="stylesheet" href="/portal-identity.css"></head><body data-team-gate><div class="frame"><header><strong>FREEMAN GC</strong><span>TEAM ACCESS / <a href="/client-access">× CLOSE</a></span></header><main><div class="kicker"><span class="seal" aria-hidden="true"></span>FREEMAN / INTERNAL</div><h1>IDENTIFICATION REQUIRED</h1><form action="/team-os" method="POST"><label for="password">ACCESS PHRASE</label><div class="line"><input id="password" name="password" type="password" autocomplete="current-password" maxlength="128" required autofocus><span class="asterisks" id="asterisks" aria-hidden="true"></span><button type="submit">PROCEED ↗</button></div><div class="error" role="alert">'+(error?'INCORRECT PASSWORD. TRY AGAIN.':'')+'</div><div class="micro">RESTRICTED INTERFACE / FICTIONAL DEMONSTRATION<br>AUTHORIZED TEAM ACCESS ONLY</div></form><script>(function(){var p=document.getElementById("password"),a=document.getElementById("asterisks");function sync(){a.textContent="*".repeat(p.value.length)}p.addEventListener("input",sync);p.addEventListener("change",sync);sync()})()<\/script></main><footer><span>BUILT FOR GENERATIONS</span><span>FREEMAN OS / DEMONSTRATION</span></footer></div></body></html>';
}
function respond(body,status,extra){return new Response(body,{status:status||200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store",...SECURITY,...extra}});}
export async function onRequest(ctx){
 const req=ctx.request,url=new URL(req.url),path=canonical(url.pathname);
 if(path===null)return new Response("Bad request",{status:400,headers:{"Cache-Control":"no-store"}});
 if(!isProtected(path))return ctx.next();
 const password=ctx.env.FREEMAN_OS_PASSWORD,secret=ctx.env.FREEMAN_OS_SESSION_KEY;
 if(!password||password.length>128||!secret||secret.length<32)return respond("FreemanOS access is not configured.",503,{"Content-Type":"text/plain; charset=utf-8"});
 // A deliberate Team Access entry invalidates an existing demo session.
 // No GET side effects on unrelated paths; this route is private, no-store, and never indexed.
 if(req.method==="GET"&&url.searchParams.get("entry")==="1"){
  const response=respond(page(false));
  response.headers.append("Set-Cookie",COOKIE+"=; Path="+ROOT+"; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  return response;
 }
 if(req.method==="POST"){
  const form=await req.formData().catch(()=>null),input=form?.get("password");
  if(typeof input!=="string"||!eq(input.slice(0,128),password))return respond(page(true),401);
  const expires=String(Date.now()+AGE*1000);
  const response=new Response(null,{status:303,headers:{"Location":ROOT,"Cache-Control":"private, no-store"}});
  response.headers.append("Set-Cookie",COOKIE+"="+expires+"."+(await sign(secret,password,expires))+"; Path="+ROOT+"; HttpOnly; Secure; SameSite=Lax; Max-Age="+AGE);
  return response;
 }
 if(req.method!=="GET"&&req.method!=="HEAD")return new Response("Method not allowed",{status:405,headers:{"Allow":"GET, HEAD, POST"}});
 if(url.pathname!==ROOT)return new Response(null,{status:308,headers:{"Location":ROOT+url.search,"Cache-Control":"private, no-store"}});
 if(!(await validCookie(req,secret,password)))return respond(page(false));
 const origin=await ctx.next(),headers=new Headers(origin.headers);
 headers.set("Cache-Control","private, no-store");for(const [k,v] of Object.entries(SECURITY))headers.set(k,v);
 headers.delete("ETag");headers.delete("Last-Modified");
 return new Response(origin.body,{status:origin.status,statusText:origin.statusText,headers});
}
