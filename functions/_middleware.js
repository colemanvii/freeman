// Cloudflare Pages middleware — S3 access gate for confidential paths.
//
// Generic onboarding (ACCESS pathways, the public site) is never gated. Confidential paths —
// private proposals and their content data — require a valid Cloudflare Access token.
//
// Inactive by default. ACCESS_MODE (Pages environment variable):
//   "off"     (or unset) — pass everything through; today's behaviour.
//   "report"  — verify and log failures, but still serve (for testing the policy safely).
//   "enforce" — serve confidential paths only with a valid Access token; 404 otherwise.
// Also required when not "off": ACCESS_TEAM_DOMAIN (e.g. "freeman.cloudflareaccess.com") and
// ACCESS_AUD (the Access application's audience tag). ACCESS_CERTS_URL overrides the key URL
// (tests only).
//
// This verifies the token itself, so a confidential path is never served merely because an
// Access policy was misconfigured or detached. Only the paths in v5/_routes.json reach this code.

const CONFIDENTIAL = [/^\/p(\/|$)/, /^\/proposal-alder(\.html)?\/?$/, /^\/proposal-assets\/data\//];

export const isConfidential = (pathname) => CONFIDENTIAL.some((r) => r.test(pathname));

export async function onRequest(context) {
  const { request, env, next } = context;
  const mode = String(env.ACCESS_MODE || "off").toLowerCase();
  const { pathname } = new URL(request.url);
  if (mode === "off" || !isConfidential(pathname)) return next();

  const result = await verifyAccess(request, env);
  if (!result.ok) {
    console.warn("access gate:", mode, pathname, result.reason);
    if (mode !== "enforce") return next();
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  }
  const response = await next();
  const out = new Response(response.body, response);
  out.headers.set("Cache-Control", "private, no-store");
  out.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return out;
}

/* ---------- Cloudflare Access JWT (RS256) verification ---------- */

let keyCache = { url: "", at: 0, keys: new Map() };

async function signingKeys(env) {
  const url = env.ACCESS_CERTS_URL || `https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`;
  if (keyCache.url === url && Date.now() - keyCache.at < 10 * 60 * 1000 && keyCache.keys.size) return keyCache.keys;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error("certs " + res.status);
  const { keys = [] } = await res.json();
  const map = new Map();
  for (const jwk of keys) {
    if (jwk.kty !== "RSA" || !jwk.kid) continue;
    map.set(jwk.kid, await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]));
  }
  keyCache = { url, at: Date.now(), keys: map };
  return map;
}

const b64urlBytes = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const b64urlJson = (s) => JSON.parse(new TextDecoder().decode(b64urlBytes(s)));

export async function verifyAccess(request, env) {
  if (!env.ACCESS_AUD || !(env.ACCESS_TEAM_DOMAIN || env.ACCESS_CERTS_URL)) return { ok: false, reason: "gate not configured" };
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return { ok: false, reason: "no token" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed token" };
  try {
    const header = b64urlJson(parts[0]);
    const claims = b64urlJson(parts[1]);
    if (header.alg !== "RS256") return { ok: false, reason: "unexpected alg" };
    const keys = await signingKeys(env);
    const key = keys.get(header.kid);
    if (!key) return { ok: false, reason: "unknown key" };
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlBytes(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
    if (!valid) return { ok: false, reason: "bad signature" };
    const now = Math.floor(Date.now() / 1000);
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!aud.includes(env.ACCESS_AUD)) return { ok: false, reason: "wrong audience" };
    if (env.ACCESS_TEAM_DOMAIN && claims.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) return { ok: false, reason: "wrong issuer" };
    if (typeof claims.exp !== "number" || claims.exp < now - 30) return { ok: false, reason: "expired" };
    if (typeof claims.nbf === "number" && claims.nbf > now + 30) return { ok: false, reason: "not yet valid" };
    return { ok: true, email: claims.email || null };
  } catch (e) {
    return { ok: false, reason: "verification error: " + (e && e.message) };
  }
}
