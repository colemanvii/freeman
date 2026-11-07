// Google Drive is the source of truth for /photographs.
//
// A Google service account with Viewer access to the folder reads it server-side; the folder
// stays private. Credentials live only in Cloudflare (secret GOOGLE_SERVICE_ACCOUNT_JSON).
// The folder listing is cached for PHOTOS_CACHE_SECONDS (default 120), so adding or removing a
// photograph in Drive shows on the gallery within a few minutes, with no code change or deploy.
// Images are served through /photograph-files/<id>/<size>?v=<version>, resized by Drive's
// thumbnailer, and cached at the edge under their version so an edited photograph gets a new URL.
// Every route here sits behind the password gate in functions/_middleware.js.

const DEFAULT_FOLDER = "1oTSehQllUmR-f-amymYXjY114EP0SqXT";
const SIZES = [640, 1280, 2400];
const API = "https://www.googleapis.com/drive/v3/files";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
// Formats browsers display directly; others (HEIC, TIFF, …) are shown via Drive's JPEG thumbnail.
const WEB = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const PHOTO = new Set([...WEB, "image/heic", "image/heif", "image/tiff", "image/bmp", "image/x-adobe-dng"]);
const enc = new TextEncoder();
const memo = { token: null, tokenExp: 0, list: null, listAt: 0, listKey: "", lastGood: null };

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
  const m = f.imageMediaMetadata || {};
  let w = Number(m.width) || 0, h = Number(m.height) || 0;
  if (m.rotation === 1 || m.rotation === 3) [w, h] = [h, w];
  if (!w || !h) { w = 3; h = 2; }
  const v = (f.md5Checksum || f.modifiedTime || "0").replace(/[^A-Za-z0-9]/g, "").slice(0, 32);
  return { id: f.id, mime: f.mimeType, w, h, v, thumb: f.thumbnailLink || "" };
}

// Current photographs in the folder, in natural filename order (01, 02 … 10, or camera order).
export async function listPhotographs(env) {
  const folder = env.PHOTOS_DRIVE_FOLDER_ID || DEFAULT_FOLDER;
  const ttl = (Number(env.PHOTOS_CACHE_SECONDS) || 120) * 1000;
  if (memo.list && memo.listKey === folder && Date.now() - memo.listAt < ttl) return memo.list;
  try {
    const token = await accessToken(env);
    const out = [];
    let page = "";
    do {
      const q = new URLSearchParams({
        q: `'${folder}' in parents and trashed = false and mimeType contains 'image/'`,
        fields: "nextPageToken,files(id,mimeType,md5Checksum,modifiedTime,thumbnailLink,imageMediaMetadata(width,height,rotation))",
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
    memo.list = out; memo.listAt = Date.now(); memo.listKey = folder; memo.lastGood = out;
    return out;
  } catch (e) {
    // Drive briefly unavailable: keep showing the last gallery this server saw.
    if (memo.lastGood && memo.listKey === folder) { console.error(e); return memo.lastGood; }
    throw e;
  }
}

const src = (p, s) => `/photograph-files/${p.id}/${s}?v=${p.v}`;

export function tilesHtml(photos) {
  return photos.map((p, n) =>
    `<a class="tile" href="${src(p, 2400)}" style="--r:${(p.w / p.h).toFixed(4)}" data-w="${p.w}" data-h="${p.h}">` +
    `<img src="${src(p, 640)}" srcset="${src(p, 640)} 640w,${src(p, 1280)} 1280w" sizes="(max-width:700px) 100vw,50vw" width="${p.w}" height="${p.h}" alt="" loading="${n < 8 ? "eager" : "lazy"}" decoding="async"></a>`
  ).join("\n");
}

// The gallery page: the static template (v5/photographs.html) with the folder's photographs inserted.
export async function galleryPage(template, env) {
  const html = await template.text();
  const photos = await listPhotographs(env);
  return html.replace(/<main>[\s\S]*?<\/main>/, "<main>\n" + tilesHtml(photos) + "\n</main>");
}

// One photograph at one size. Only ids currently in the folder are served, so removing a
// photograph from Drive removes it here too, even if an old copy is still in the edge cache.
export async function photographFile(url, env, waitUntil) {
  const m = /^\/photograph-files\/([A-Za-z0-9_-]{10,200})\/(\d+)$/.exec(url.pathname);
  const size = m && Number(m[2]);
  if (!m || !SIZES.includes(size)) return null;
  const p = (await listPhotographs(env)).find((x) => x.id === m[1]);
  if (!p) return null;
  const cache = globalThis.caches && caches.default;
  const key = new Request(`https://photograph-cache.invalid/${p.id}/${size}/${p.v}`);
  let res = cache && (await cache.match(key));
  if (!res) {
    const token = await accessToken(env);
    let body = null, type = "";
    if (p.thumb) {
      const r = await fetch(p.thumb.replace(/=s\d+(-[a-z0-9-]+)?$/, "") + "=s" + size, { headers: { Authorization: "Bearer " + token } });
      type = r.headers.get("Content-Type") || "";
      if (r.ok && type.startsWith("image/")) body = await r.arrayBuffer();
    }
    if (!body && WEB.has(p.mime)) {
      // No usable thumbnail: serve the original file.
      const r = await fetch(`${API}/${p.id}?alt=media&supportsAllDrives=true`, { headers: { Authorization: "Bearer " + token } });
      if (r.ok) { body = await r.arrayBuffer(); type = p.mime; }
    }
    if (!body) return new Response("Unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
    res = new Response(body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
    if (cache) { const put = cache.put(key, res.clone()); waitUntil ? waitUntil(put) : await put; }
  }
  return res;
}

export const driveConfigured = (env) => Boolean(env.GOOGLE_SERVICE_ACCOUNT_JSON);
