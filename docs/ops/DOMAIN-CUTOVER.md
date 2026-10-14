# freemangc.com → Cloudflare Pages: cutover checklist

Status: **Phase A underway (nameservers changed); phase B not started.**

## Cutover log
| When (ET) | Event | Verified |
|---|---|---|
| 14 Oct, before 4:42 PM | DNSSEC confirmed **off**; 12 records imported into Cloudflare (8 inventoried below + 2 Cloudflare NS + `_domainconnect` CNAME → `_domainconnect.domains.squarespace.com` + `email` CNAME → `email.secureserver.net`, both legacy and harmless, left unchanged) | Cloudflare answers match the Squarespace zone record for record, all **DNS only**, TTL 300 |
| 14 Oct, 4:42 PM | Squarespace confirmed nameservers → `aaron.ns.cloudflare.com`, `zainab.ns.cloudflare.com` (by Cole) | .com registry delegates only to those two; no DS |
| 14 Oct, evening | Email records checked through Cloudflare and through 1.1.1.1, 8.8.8.8 and 9.9.9.9 (8.8.8.8 still caching the old nameservers; same answers either way) | MX `0 freemangc-com.mail.protection.outlook.com`, `autodiscover` → `autodiscover.outlook.com`, Resend DKIM, `send` CNAME all resolve |
| 14 Oct, evening | PR #9 (legacy URL redirects) live, commit `1f41b6b`, deployment `fe86f84c` | `/about`, `/sawdust`, `/projects/*` → 301, query strings preserved |

**Phase B prerequisite found:** Webflow serves custom domains through Cloudflare for SaaS, so Webflow may still hold `freemangc.com` / `www.freemangc.com` as custom hostnames. If a Pages custom domain stays in *Verifying* / reports the hostname is in use, remove the custom domain in Webflow → Site settings → Publishing (the site stays published on its `webflow.io` address; Webflow hosting is **not** cancelled). Connect the apex first (it returns 403 today, so nothing visible can break) to find out before touching `www`.
Goal: serve the site from Cloudflare Pages (project `freeman`) on freemangc.com; Squarespace
stays registrar; Microsoft 365 email uninterrupted; rollback in minutes.

## Verified 14 Oct 2026 (read-only lookups)

**Delegation.** The .com registry lists 8 nameservers: `ns01–04.squarespacedns.com` and
`dns1–4.p08.nsone.net` (Squarespace's NS1 back end). Both sets return identical answers.

**DNSSEC.** No DS record at the .com parent and no DNSKEY published, so DNSSEC is **off**.
No action is needed before changing nameservers. Re-check the Squarespace panel on the night: if
DNSSEC shows *on*, turn it off and wait 24 h before step A6.

**All records found (TTL 14400 s = 4 h):**

| Name | Type | Value | Role | In Cloudflare |
|---|---|---|---|---|
| `freemangc.com` | MX | `0 freemangc-com.mail.protection.outlook.com` | **Microsoft 365 inbound mail** | copy exactly · DNS only |
| `autodiscover` | CNAME | `autodiscover.outlook.com` | **Outlook account setup** | copy exactly · DNS only |
| `resend._domainkey` | TXT | `p=MIGfMA0GCSq…IDAQAB` (full key in export) | Contact-form DKIM (Resend, `contact@freemangc.com`) | copy exactly |
| `send` | CNAME | `send.forge.rmta.net` | Contact-form bounce/SPF domain | copy exactly · **DNS only** |
| `freemangc.com` | TXT | `"198.202.211.1"` | unknown (an IP stored as text) | copy as-is; ask who added it |
| `freemangc.com` | A | `75.2.70.75`, `99.83.190.102` | Webflow (apex currently returns **403**) | copy · DNS only (phase A) |
| `www` | CNAME | `cdn.webflow.com` | Webflow (live site) | copy · DNS only (phase A) |

Not present: SPF, DMARC, Microsoft 365 DKIM (`selector1/2._domainkey`), Teams/Skype (`sip`,
`lyncdiscover`, SRV), Intune (`enterpriseregistration/enrollment`), CAA. Email works today without
them, so **do not add or change any during the cutover**; fix email authentication separately
afterwards. A lookup can miss records, so **export the Squarespace zone first (A1)** and treat it
as the source of truth.

**Current site URLs** (crawl of www.freemangc.com; no sitemap published): 14 pages. The 11 that
don't exist on Pages get 301s in PR #9 (`/about` → `/company`, `/sawdust` → `/fieldwork`,
`/projects/<slug>` → `/project-<slug>`). **Merge PR #9 before phase B.**

**Production health (deployment `6f123fd7`, commit `47d20d2`).** All routes 200; unknown path 404;
contact relay answers (validation only, no email sent), including for the `www.freemangc.com`
origin. Production suites: ACCESS + Alder 1216/1216; public 111/117 (the six stale `pages.dev`
cache entries, which expire by 21 Oct). The stale entries are bound to `freeman-d6f.pages.dev`
only and do not carry over to freemangc.com.

## Canonical host and redirect

**Canonical: `https://www.freemangc.com`.** It is the address that works and is indexed today (the
apex is broken), so existing links, signatures and search results keep the same host.
- `freemangc.com/*` → 301 → `https://www.freemangc.com/<same path and query>` (Cloudflare Redirect Rule).
- `http://` → `https://` (Always Use HTTPS).
- `freeman-d6f.pages.dev` stays reachable tonight; a redirect to www can follow later.

## Phase A — DNS to Cloudflare, nothing visible changes (email risk only)
**A1–A6 done 14 Oct (see log). A7–A8 in progress.**

- [ ] **A1** Squarespace → Domains → freemangc.com → DNS settings: screenshot or export every record, including any "Microsoft 365" preset group.
- [ ] **A2** Check DNSSEC is off in Squarespace (expected; see above).
- [ ] **A3** Cloudflare dashboard → *Add a domain* → `freemangc.com` → Free → **Quick scan**. Compare with A1 line by line. Every record above must be present and **DNS only** (grey cloud), *including* the apex A and `www` CNAME, which still point at Webflow.
- [ ] **A4** SSL/TLS → Overview: **Full (strict)**. Edge Certificates: *Always Use HTTPS* **on**, *Minimum TLS* 1.2, *Automatic HTTPS Rewrites* on, **HSTS off**.
- [ ] **A5** Note the two Cloudflare nameservers shown (e.g. `xxx.ns.cloudflare.com`).
- [ ] **A6 (go-ahead)** Squarespace → Domains → freemangc.com → Nameservers → *Use custom nameservers* → enter the two Cloudflare nameservers → save. **Leave the Squarespace DNS records in place** (rollback).
- [ ] **A7** Wait for Cloudflare to show **Active** (usually under an hour; up to 24 h). Old answers can persist for up to the 4 h TTL.
- [ ] **A8** Verify through Cloudflare's nameservers (`dig @<cloudflare-ns>`) and public resolvers:
  - `dig +short MX freemangc.com` → `0 freemangc-com.mail.protection.outlook.com.`
  - `dig +short CNAME autodiscover.freemangc.com` → `autodiscover.outlook.com.`
  - `dig +short CNAME send.freemangc.com` → `send.forge.rmta.net.`
  - `dig +short TXT resend._domainkey.freemangc.com` → the same key
  - Send and receive mail between a Freeman mailbox and an outside address; Outlook desktop and phone sync.
  - `www.freemangc.com` still shows the Webflow site.

## Phase B — point the web at Cloudflare Pages
Requires the zone **Active** in Cloudflare. PR #9 is merged. Order: apex first (B2 before B1), then `www`, then the redirect rule.

- [ ] **B1 (go-ahead)** Workers & Pages → `freeman` → *Custom domains* → *Set up a custom domain* → `www.freemangc.com` → *Activate domain*. Cloudflare replaces the `www` CNAME with a proxied CNAME to `freeman-d6f.pages.dev`; status → **Active** with certificate (minutes).
- [ ] **B2** Same for `freemangc.com` (apex). This replaces the Webflow A records with a proxied record for Pages.
- [ ] **B3** Rules → *Redirect Rules* → *Create rule* "apex to www":
  - If: *Hostname* equals `freemangc.com`
  - Then: *Dynamic* · expression `concat("https://www.freemangc.com", http.request.uri.path)` · status **301** · *Preserve query string* on
- [ ] **B4** Caching → *Cache Rules* → "never cache private": If *URI Path* equals `/p` **or** starts with `/p/`, `/proposal-alder`, `/proposal-assets/data/`, `/a/`, `/admin/` → **Bypass cache**. (Not just `/p`, which would also match `/projects`. Belt and braces with `v5/_headers` `no-store`.)
- [ ] **B5** Verify:
  - `curl -sI https://freemangc.com/projects` → `301` to `https://www.freemangc.com/projects`
  - `curl -sI http://www.freemangc.com/` → `301` to `https://www.freemangc.com/`
  - `curl -sI https://www.freemangc.com/about` → `301` to `/company` (PR #9)
  - Certificate valid on both hosts
  - `python3 qa/public-navigation-qa.py https://www.freemangc.com` and `python3 qa/access-alder-qa.py https://www.freemangc.com` (expect all checks to pass; no stale cache on the new host)
  - `python3 qa/public-visual-diff.py https://freeman-d6f.pages.dev https://www.freemangc.com` → identical
  - Contact form: send one real test message and confirm it arrives (gabe@, cc cole@)
  - Repeat the A8 email checks
- [ ] **B6** Leave the Webflow site published and its custom domain attached for 30 days (rollback), then remove it and cancel Webflow hosting.

## Rollback

| Situation | Action | Time to effect |
|---|---|---|
| Website problem after phase B | Pages → Custom domains → remove `www` and apex; in DNS restore `www` CNAME `cdn.webflow.com` and apex A `75.2.70.75` + `99.83.190.102`, **DNS only**; disable the redirect rule | minutes (records are new and proxied, so no long TTL) |
| Bad deployment, domain fine | Pages → Deployments → previous production → *Rollback to this deployment* | seconds |
| Email or DNS problem after phase A | First compare Cloudflare records with the A1 export and fix the difference (fastest). If needed: Squarespace → Nameservers → *Use Squarespace nameservers* | fix: minutes; nameserver revert: up to 24 h |

Email only stops if the MX record is wrong. It is the one record to check first in any incident.

## After launch (separate changes)
SPF (`v=spf1 include:spf.protection.outlook.com -all`, after confirming no other senders use the
apex), DMARC starting at `p=none`, Microsoft 365 DKIM; S3 access gate on freemangc.com paths;
HSTS after two stable weeks; optional redirect of `freeman-d6f.pages.dev` to www.
