// S3 access-gate test: runs v5/ under `wrangler pages dev` with the gate enforced against a
// locally generated signing key, then checks public paths stay open and confidential paths
// open only with a valid token.  Usage: node qa/access-gate-test.mjs [path/to/wrangler]
import { spawn } from "node:child_process";
import http from "node:http";
import { webcrypto as crypto } from "node:crypto";

const WRANGLER = process.argv[2] || "npx";
const CERTS_PORT = 8811, PAGES_PORT = 8812, AUD = "test-aud";
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail: String(detail) });

const b64url = (buf) => Buffer.from(buf).toString("base64url");
async function keypair(kid) {
  const k = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", k.publicKey);
  return { kid, privateKey: k.privateKey, jwk: { ...jwk, kid, alg: "RS256", use: "sig" } };
}
async function token(key, claims, header = {}) {
  const h = b64url(JSON.stringify({ alg: "RS256", kid: key.kid, typ: "JWT", ...header }));
  const c = b64url(JSON.stringify(claims));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key.privateKey, new TextEncoder().encode(h + "." + c));
  return `${h}.${c}.${b64url(sig)}`;
}

const trusted = await keypair("trusted");
const rogue = await keypair("rogue");
const certs = http.createServer((req, res) => { res.setHeader("content-type", "application/json"); res.end(JSON.stringify({ keys: [trusted.jwk] })); }).listen(CERTS_PORT);

const args = ["pages", "dev", "v5", "--port", String(PAGES_PORT), "--ip", "127.0.0.1",
  "--binding", "ACCESS_MODE=enforce", "--binding", `ACCESS_AUD=${AUD}`, "--binding", `ACCESS_CERTS_URL=http://127.0.0.1:${CERTS_PORT}/certs`];
const wr = spawn(WRANGLER, WRANGLER === "npx" ? ["wrangler", ...args] : args, { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, WRANGLER_SEND_METRICS: "false" } });
let log = ""; wr.stdout.on("data", (d) => (log += d)); wr.stderr.on("data", (d) => (log += d));

const BASE = `http://127.0.0.1:${PAGES_PORT}`;
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE + "/client-access")).ok) break; } catch {} await new Promise((r) => setTimeout(r, 1000)); }

const now = Math.floor(Date.now() / 1000);
const good = await token(trusted, { aud: [AUD], email: "staff@freemangc.com", exp: now + 600, iat: now });
const tokens = {
  none: null,
  valid: good,
  expired: await token(trusted, { aud: [AUD], exp: now - 600 }),
  wrongAud: await token(trusted, { aud: ["other"], exp: now + 600 }),
  rogueKey: await token(rogue, { aud: [AUD], exp: now + 600 }),
  tampered: good.slice(0, good.lastIndexOf(".") - 4) + "AAAA" + good.slice(good.lastIndexOf(".")),
  algNone: b64url(JSON.stringify({ alg: "none", kid: "trusted" })) + "." + b64url(JSON.stringify({ aud: [AUD], exp: now + 600 })) + ".",
};
const get = (path, t) => fetch(BASE + path, { redirect: "manual", headers: t ? { "Cf-Access-Jwt-Assertion": t } : {} });

try {
  for (const path of ["/", "/company", "/projects", "/client-access", "/working-with-freeman", "/proposal-assets/app.js", "/proposal-assets/styles.css", "/favicon.svg"]) {
    const r = await get(path);
    check(`public ${path} open without token`, r.status === 200 || r.status === 308, r.status);
  }
  for (const path of ["/p/alder", "/p/alder/05-budget", "/proposal-alder", "/proposal-alder.html", "/proposal-assets/data/alder.js"]) {
    for (const [name, t] of Object.entries(tokens)) {
      const r = await get(path, t);
      if (name === "valid") {
        const ok = path === "/proposal-alder.html" ? [200, 308].includes(r.status) : r.status === 200;
        check(`confidential ${path} opens with valid token`, ok, r.status);
        if (r.status === 200) check(`confidential ${path} marked private`, /private/.test(r.headers.get("cache-control") || ""), r.headers.get("cache-control"));
      } else {
        check(`confidential ${path} refused (${name})`, r.status === 404, r.status);
      }
    }
  }
  const body = await (await get("/p/alder", good)).text();
  check("valid token serves the proposal shell", body.includes("/proposal-assets/data/alder.js"), body.slice(0, 80));
} finally {
  wr.kill(); certs.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`${results.length} checks, ${failed.length} failed`);
for (const f of failed) console.log("FAIL", f.name, "—", f.detail);
if (failed.length && process.env.GATE_DEBUG) console.log(log);
process.exit(failed.length ? 1 : 0);
