// Server-side demo gate. Cloudflare Pages secrets required:
// FREEMAN_OS_PASSWORD and FREEMAN_OS_SESSION_KEY (32+ random characters).
const COOKIE="fos_session", AGE=8*60*60, enc=new TextEncoder();
function eq(a,b){const x=enc.encode(a),y=enc.encode(b);let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0;}
function b64(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
async function mac(secret,data){const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64(new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(data))));}
async function validCookie(req,secret){
 const v=(req.headers.get("Cookie")||"").split(";").map(s=>s.trim()).find(s=>s.startsWith(COOKIE+"="));
 if(!v)return false;const token=v.slice(COOKIE.length+1),i=token.lastIndexOf(".");if(i<0)return false;
 const exp=token.slice(0,i);if(!/^\d{13}$/.test(exp)||Number(exp)<Date.now()||Number(exp)>Date.now()+AGE*1000)return false;
 return eq(token.slice(i+1),await mac(secret,exp));
}
function page(error){
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Team Access — Freeman GC</title><style>'+
 ':root{--paper:#f4f4f0;--ink:#30312f;--muted:#70716c;--rule:#cfd1cb;--orange:#c2431a}*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--paper);color:var(--ink)}body{font:13px/1.55 Monaco,"SFMono-Regular",Consolas,monospace;-webkit-font-smoothing:antialiased}.frame{min-height:100dvh;padding:30px clamp(20px,5vw,64px) 22px;display:grid;grid-template-rows:auto 1fr auto;gap:30px}header,footer{display:flex;justify-content:space-between;gap:15px}header{font-size:11px}footer{border-top:1px solid var(--rule);padding-top:14px;font-size:10px;color:var(--muted)}main{width:100%;max-width:530px;align-self:center;justify-self:center;margin-top:-7vh}.kicker{font-size:11px;color:var(--muted);margin:0 0 20px}h1{font-weight:400;font-size:clamp(35px,5vw,60px);letter-spacing:-.055em;line-height:1.1;margin:0 0 24px}p{color:var(--muted);margin:0 0 32px;font-size:13px}label{display:block;font-size:11px;color:var(--muted);margin-bottom:10px}.line{display:flex;border-bottom:1px solid var(--ink);align-items:center;gap:16px}input{border:0;outline:0;background:transparent;color:var(--ink);font:17px Monaco,Consolas,monospace;padding:10px 0;min-width:0;flex:1;width:100%}input:focus-visible{outline:2px solid var(--orange);outline-offset:3px}button{background:transparent;border:0;color:var(--ink);font:13px Monaco,monospace;cursor:pointer;white-space:nowrap;min-height:44px}button:hover,button:focus-visible,a:hover{color:var(--orange)}.error{color:var(--orange);font-size:12px;margin-top:15px;min-height:19px}a{color:inherit;text-decoration:none}@media(max-width:480px){main{margin-top:0}.frame{padding:22px 20px}}'+
 '</style></head><body><div class="frame"><header><strong>FREEMAN GC</strong><span>TEAM ACCESS / <a href="/client-access">× CLOSE</a></span></header><main><div class="kicker">FREEMAN / PRIVATE DEMO</div><h1>Access.</h1><p>Enter the team password to open FreemanOS.</p><form action="/team-os" method="POST"><label for="password">PASSWORD</label><div class="line"><input id="password" name="password" type="password" autocomplete="current-password" maxlength="128" required autofocus><button type="submit">ENTER ↗</button></div><div class="error" role="alert">'+(error?'INCORRECT PASSWORD. TRY AGAIN.':'')+'</div></form></main><footer><span>BUILT FOR GENERATIONS</span><span>FREEMAN OS / DEMONSTRATION</span></footer></div></body></html>';
}
function respond(body,status){return new Response(body,{status:status||200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow","X-Content-Type-Options":"nosniff"}});}
export async function onRequest(ctx){
 const req=ctx.request,url=new URL(req.url);
 if(!/^\/team-os(?:\.html|\/)?$/.test(url.pathname))return ctx.next();
 const password=ctx.env.FREEMAN_OS_PASSWORD,secret=ctx.env.FREEMAN_OS_SESSION_KEY;
 if(!password||!secret||secret.length<32)return respond("FreemanOS access is not configured.",503);
 if(req.method==="POST"){
  const form=await req.formData().catch(()=>null),input=form?.get("password");
  if(typeof input!=="string"||!eq(input.slice(0,128),password))return respond(page(true),401);
  const expires=String(Date.now()+AGE*1000);
  const response=new Response(null,{status:303,headers:{"Location":"/team-os","Cache-Control":"private, no-store"}});
  response.headers.append("Set-Cookie",COOKIE+"="+expires+"."+(await mac(secret,expires))+"; Path=/team-os; HttpOnly; Secure; SameSite=Lax; Max-Age="+AGE);
  return response;
 }
 if(req.method!=="GET"&&req.method!=="HEAD")return new Response("Method not allowed",{status:405,headers:{"Allow":"GET, HEAD, POST"}});
 if(!(await validCookie(req,secret)))return respond(page(false));
 const origin=await ctx.next(),headers=new Headers(origin.headers);
 headers.set("Cache-Control","private, no-store");headers.set("X-Robots-Tag","noindex, nofollow");
 return new Response(origin.body,{status:origin.status,statusText:origin.statusText,headers});
}
