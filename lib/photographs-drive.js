// Google Drive is the source of truth for /photographs.
//
// A Google service account with Viewer access to the folder reads it server-side; the folder
// stays private. Credentials live only in Cloudflare (secret GOOGLE_SERVICE_ACCOUNT_JSON).
// The folder listing is cached for PHOTOS_CACHE_SECONDS (default 120), so adding or removing a
// photograph in Drive shows on the gallery within a few minutes, with no code change or deploy.
// Images are served through /photograph-files/<id>/<size>?v=<version>, resized by Drive's
// thumbnailer, and cached at the edge under their version so an edited photograph gets a new URL.
// Routes are wired in functions/_middleware.js; /photographs and /assuranceamerica share this module.

import { FILMS } from "./films.js";

const DEFAULT_FOLDER = "1oTSehQllUmR-f-amymYXjY114EP0SqXT";
// /assuranceamerica: Barnsley, 11 November 2026. Same service account, same pipeline, its own folder.
const BARNSLEY_FOLDER = "1mknCK85iiUhAH7EfH9ZG6pmH0upnh6dB";
export const photosFolder = (env) => env.PHOTOS_DRIVE_FOLDER_ID || DEFAULT_FOLDER;
export const barnsleyFolder = (env) => env.ASSURANCEAMERICA_DRIVE_FOLDER_ID || BARNSLEY_FOLDER;
// Every folder whose photographs /photograph-files/ may serve. Nothing outside these is reachable.
const servedFolders = (env) => [photosFolder(env), barnsleyFolder(env)];
const SIZES = [640, 1280, 2400];
const API = "https://www.googleapis.com/drive/v3/files";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
// Formats browsers display directly; others (HEIC, TIFF, …) are shown via Drive's JPEG thumbnail.
const WEB = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const PHOTO = new Set([...WEB, "image/heic", "image/heif", "image/tiff", "image/bmp", "image/x-adobe-dng"]);
// An original is served only when Drive has no thumbnail AND the file is small enough for a phone.
// Larger files without a thumbnail are left out of the gallery and logged, never sent whole.
const ORIGINAL_LIMIT = 15 * 1024 * 1024;
const enc = new TextEncoder();
const memo = { token: null, tokenExp: 0, lists: new Map(), films: new Map() }; // folder -> { list, at }

const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64urlText = (s) => b64url(enc.encode(s));

async function accessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (memo.token && memo.tokenExp - 60 > now) return memo.token;
  const sa = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const head = b64urlText(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64urlText(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/drive.readonly", aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const sig = b64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(head + "." + claims)));
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + head + "." + claims + "." + sig,
  });
  if (!r.ok) throw new Error("Google token request failed: " + r.status);
  const j = await r.json();
  memo.token = j.access_token;
  memo.tokenExp = now + (j.expires_in || 3600);
  return memo.token;
}

function toPhoto(f) {
  if (!PHOTO.has(f.mimeType)) return null;
  if (!WEB.has(f.mimeType) && !f.thumbnailLink) return null;
  if (!f.thumbnailLink && Number(f.size) > ORIGINAL_LIMIT) { console.error("No Drive thumbnail, too large to serve:", f.id); return null; }
  const m = f.imageMediaMetadata || {};
  let w = Number(m.width) || 0, h = Number(m.height) || 0;
  if (m.rotation === 1 || m.rotation === 3) [w, h] = [h, w];
  if (!w || !h) { w = 3; h = 2; }
  // Non-JPEG sources (PNG exports) are delivered as JPEG; the "j" keeps their URLs distinct from
  // any earlier PNG delivery that a browser or edge may still hold.
  const v = (f.md5Checksum || f.modifiedTime || "0").replace(/[^A-Za-z0-9]/g, "").slice(0, 32) + (f.mimeType === "image/jpeg" ? "" : "jpg");
  return { id: f.id, mime: f.mimeType, w, h, v, thumb: f.thumbnailLink || "", size: Number(f.size) || 0 };
}

// Current photographs in the folder, in natural filename order (01, 02 … 10, or camera order).
export async function listPhotographs(env, folder = photosFolder(env)) {
  const ttl = (Number(env.PHOTOS_CACHE_SECONDS) || 120) * 1000;
  const cached = memo.lists.get(folder);
  if (cached && Date.now() - cached.at < ttl) return cached.list;
  try {
    const token = await accessToken(env);
    const out = [];
    let page = "";
    do {
      const q = new URLSearchParams({
        q: `'${folder}' in parents and trashed = false and mimeType contains 'image/'`,
        fields: "nextPageToken,files(id,mimeType,size,md5Checksum,modifiedTime,thumbnailLink,imageMediaMetadata(width,height,rotation))",
        orderBy: "name_natural",
        pageSize: "1000",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
      });
      if (page) q.set("pageToken", page);
      const r = await fetch(API + "?" + q, { headers: { Authorization: "Bearer " + token } });
      if (!r.ok) throw new Error("Drive list failed: " + r.status);
      const j = await r.json();
      for (const f of j.files || []) { const p = toPhoto(f); if (p) out.push(p); }
      page = j.nextPageToken || "";
    } while (page);
    memo.lists.set(folder, { list: out, at: Date.now() });
    return out;
  } catch (e) {
    // Drive briefly unavailable: keep showing the last gallery this server saw.
    if (cached) { console.error(e); return cached.list; }
    throw e;
  }
}

const src = (p, s) => `/photograph-files/${p.id}/${s}?v=${p.v}`;

// Editorial arrangement 001. Pairings are selected from actual photographs,
// not alphabetical filename order. Originals in Drive stay untouched.
// Newly uploaded images are composed into balanced rows using their dimensions.
const EDITORIAL_ROWS = [
  ["1GebdZcFOMI2DGXt1AQgw5HLHhxX7w0_D","1TlLcPA9LQ2V1qLVHPeRf1TR-4Oh31kXB"], // landscape / people
  ["1qq0JogiannwNiCYceJGeSpdwxD39fJ1L","1XoNJTPz2GAZiBfnujEWcmVQBTcXZZQjo","1Vl-ZtJkYfjY24wkntmMem0E2PHAG_U0g"], // forest / Gabe / warm interior: balanced early triptych
  ["1dc_6vXKpH13kH7s8PTOlEZR1t2SZpUUx","1dfAjy7cs1-Yo7BzM26cxrnRY0tlFYUVa","1qOnlA7KILjW3OF6PrJJP1VZWB0hr9-y7"], // warmth / forest / portrait
  ["1ZSheOon_z0A9cBlDnXmIF_Gz3sE25KCa","1OTTOWi5VYJoF2b0z3AaYYK1QSbsXv4_3"], // gathering / facade
  ["1_zAbtVB7zLlq4xL5oSYTYhWNvsrO7xYh","145sOwV-roo5lKx9l0dKOQ593onc49jcC"], // object / conversation
  ["1TqiSJqAa60a_Blk8oFh_5e1uczs4DdYG","1kc9_t8yG9b0u6B5TB2J2rIMa5YY_jsBs"], // equipment / quiet detail
  ["1wqofDj4b73fKx4uCpoqtNQyhfCoIZju9","1BRuJXWyjJv9cvOLHrrnG2bGPZWryVPX3","1xJ6HuO4gZkAtCLmqLhaT9bSqrL0LmME3"], // hospitality / crew / landscape
  ["1RNb3_2UW0ULwTjNdv-OFbd1cADXGyUhl","16Ki2nyYdEgC8H8I_hpw8nU7hgctlEYUX","1vOeVkar9-96DU3F5iH5DHc2WSKWDJ7NP"], // event / detail / work
  ["1Q_9BF5kl0M3oCSRqtoy72YhmEn3T800X","12Np6uey0czlQRKBsvTrBOhhZ5aFo_9yD"] // site / human presence
];
function tile(p,n) {
  return '<a class="tile" href="'+src(p,2400)+'" data-photo-id="'+p.id+'" style="--r:'+(p.w/p.h).toFixed(4)+'" data-w="'+p.w+'" data-h="'+p.h+'">' +
    '<img src="'+src(p,640)+'" srcset="'+src(p,640)+' 640w,'+src(p,1280)+' 1280w" sizes="(max-width:700px) 100vw,50vw" width="'+p.w+'" height="'+p.h+'" alt="" loading="'+(n<8?'eager':'lazy')+'" decoding="async"></a>';
}
export function tilesHtml(photos, pinned = EDITORIAL_ROWS) {
  const byId = new Map(photos.map(p => [p.id,p]));
  const seen = new Set();
  const rows = [];
  for (const ids of pinned) {
    const row = ids.map(id=>byId.get(id)).filter(Boolean);
    row.forEach(p=>seen.add(p.id));
    if(row.length) rows.push(row);
  }
  // Drive is the live inventory. Preserve the intentional opening, then compose
  // every unpinned image by its measured aspect ratio rather than filename pairs.
  // Dynamic programming balances row heights and avoids an orphaned last image.
  const fresh = photos.filter(p=>!seen.has(p.id));
  const ratio = p => Math.max(.45,Math.min(3.1,p.w/p.h));
  function compose(items) {
    if (!items.length) return [];
    if (items.length===1) return [[items[0]]];
    const best=Array(items.length+1).fill(Infinity),next=Array(items.length);
    best[items.length]=0;
    for(let i=items.length-1;i>=0;i--){
      for(const count of [2,3]){
        if(i+count>items.length)continue;
        const group=items.slice(i,i+count);
        const total=group.reduce((sum,p)=>sum+ratio(p),0);
        // An average row fills the width without extreme crops or tiny thumbnails.
        const cost=Math.pow(Math.log(total/2.85),2)*3+
          (count===3?.13:0)+best[i+count];
        if(cost<best[i]){best[i]=cost;next[i]=count;}
      }
    }
    // An odd-length tail must be incorporated into another row.
    // The only unavoidable singleton is a gallery containing one image.
    if(!Number.isFinite(best[0])){
      if(items.length===3)return [items];
      const prefix=compose(items.slice(0,-3));
      return [...prefix,items.slice(-3)];
    }
    const out=[];
    for(let i=0;i<items.length;){const count=next[i];out.push(items.slice(i,i+count));i+=count;}
    return out;
  }
  rows.push(...compose(fresh));

  // Folder deletions can shrink a pinned triptych to a singleton.
  // Rebalance it without duplicating a photo or leaving a giant full-bleed tile.
  for(let i=0;i<rows.length;i++){
    if(rows[i].length!==1||rows.length===1)continue;
    if(i+1<rows.length && rows[i+1].length>2){
      rows[i].push(rows[i+1].shift());
    }else if(i>0 && rows[i-1].length>2){
      rows[i].unshift(rows[i-1].pop());
    }else if(i+1<rows.length && rows[i+1].length===2){
      rows[i].push(...rows[i+1]);rows.splice(i+1,1);
    }else if(i>0){
      rows[i-1].push(...rows[i]);rows.splice(i--,1);
    }
  }
  let n=0;
  return rows.map(row=>'<div class="photo-row">'+row.map(p=>tile(p,n++)).join("\n")+'</div>').join("\n");
}

// Videos in a folder (id + checksum only), cached like the photographs. Only templates that ask for
// films (a <!-- films --> marker) trigger this listing, so /photographs never makes the call.
async function listVideos(env, folder) {
  const ttl = (Number(env.PHOTOS_CACHE_SECONDS) || 120) * 1000;
  const cached = memo.films.get(folder);
  if (cached && Date.now() - cached.at < ttl) return cached.list;
  try {
    const token = await accessToken(env);
    const q = new URLSearchParams({
      q: `'${folder}' in parents and trashed = false and mimeType contains 'video/'`,
      fields: "files(id,md5Checksum)", orderBy: "name_natural", pageSize: "100",
      supportsAllDrives: "true", includeItemsFromAllDrives: "true",
    });
    const r = await fetch(API + "?" + q, { headers: { Authorization: "Bearer " + token } });
    if (!r.ok) throw new Error("Drive video list failed: " + r.status);
    const list = ((await r.json()).files || []).map((f) => ({ id: f.id, md5: f.md5Checksum || "" }));
    memo.films.set(folder, { list, at: Date.now() });
    return list;
  } catch (e) {
    if (cached) { console.error(e); return cached.list; }
    throw e;
  }
}

// Films follow the photographs, in Drive filename order. A video is shown only through its web
// versions (studio/assuranceamerica-films/build-films.mjs); with none, or a changed original, it is
// left out and logged. preload="none": nothing but the poster downloads until someone presses play.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
export function filmsHtml(videos) {
  const films = [];
  for (const v of videos) {
    const f = FILMS[v.id];
    if (!f || (v.md5 && f.md5 !== v.md5)) { console.error("Film has no current web version; not shown:", v.id); continue; }
    films.push('<video class="film" controls preload="none" playsinline poster="' + esc(f.poster) + '" width="' + f.width + '" height="' + f.height + '" style="--r:' + (f.width / f.height).toFixed(4) + '">' +
      '<source src="' + esc(f.sources["720"].src) + '" type="video/mp4" media="(max-width:700px)">' +
      '<source src="' + esc(f.sources["1080"].src) + '" type="video/mp4"></video>');
  }
  if (!films.length) return "";
  const rows = [];
  for (let i = 0; i < films.length; i += 2) rows.push('<div class="film-row">' + films.slice(i, i + 2).join("\n") + "</div>");
  return '<section class="films" aria-label="Films">\n' + rows.join("\n") + "\n</section>";
}

// The gallery page: the static template (v5/photographs.html, v5/assuranceamerica.html) with the
// folder's photographs inserted. Only /photographs has a pinned editorial opening; any other folder
// is composed entirely from its photographs' measured proportions, in filename order.
export async function galleryPage(template, env, folder = photosFolder(env), pinned = folder === photosFolder(env) ? EDITORIAL_ROWS : []) {
  const html = await template.text();
  const photos = await listPhotographs(env, folder);
  const films = html.includes("<!-- films -->") ? filmsHtml(await listVideos(env, folder)) : "";
  return html.replace(/<main>[\s\S]*?<\/main>/, "<main>\n" + tilesHtml(photos, pinned) + "\n</main>").replace("<!-- films -->", () => films);
}

// Find a photograph currently in one of the served folders. A folder that cannot be read does not
// stop the others from serving.
async function findPhotograph(env, id) {
  let failure = null;
  for (const folder of servedFolders(env)) {
    try {
      const p = (await listPhotographs(env, folder)).find((x) => x.id === id);
      if (p) return p;
    } catch (e) { failure = failure || e; console.error(e); }
  }
  if (failure) throw failure;
  return null;
}

// One photograph at one size. Only ids currently in the folder are served, so removing a
// photograph from Drive removes it here too, even if an old copy is still in the edge cache.
export async function photographFile(url, env, waitUntil) {
  const m = /^\/photograph-files\/([A-Za-z0-9_-]{10,200})\/(\d+)$/.exec(url.pathname);
  const size = m && Number(m[2]);
  if (!m || !SIZES.includes(size)) return null;
  const p = await findPhotograph(env, m[1]);
  if (!p) return null;
  const cache = globalThis.caches && caches.default;
  const key = new Request(`https://photograph-cache.invalid/${p.id}/${size}/${p.v}`);
  const asJpeg = p.mime !== "image/jpeg";
  let res = cache && (await cache.match(key));
  if (!res) {
    const token = await accessToken(env);
    let body = null, type = "";
    if (p.thumb) {
      // -rj: Drive's thumbnailer returns JPEG (a 2400px PNG export is ~5 MB; as JPEG ~0.5 MB).
      const r = await fetch(p.thumb.replace(/=s\d+(-[a-z0-9-]+)?$/, "") + "=s" + size + (asJpeg ? "-rj" : ""), { headers: { Authorization: "Bearer " + token } });
      type = r.headers.get("Content-Type") || "";
      if (r.ok && type.startsWith("image/")) body = await r.arrayBuffer();
    }
    if (!body && WEB.has(p.mime) && p.size && p.size <= ORIGINAL_LIMIT) {
      // No usable thumbnail, small original: serve it. Never a large original (see ORIGINAL_LIMIT).
      const r = await fetch(`${API}/${p.id}?alt=media&supportsAllDrives=true`, { headers: { Authorization: "Bearer " + token } });
      if (r.ok) { body = await r.arrayBuffer(); type = p.mime; }
    }
    if (!body) console.error("Photograph unavailable (no thumbnail, original not served):", p.id, size);
    if (!body) return new Response("Unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
    res = new Response(body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
    if (cache) { const put = cache.put(key, res.clone()); waitUntil ? waitUntil(put) : await put; }
  }
  return res;
}

export const driveConfigured = (env) => Boolean(env.GOOGLE_SERVICE_ACCOUNT_JSON);
