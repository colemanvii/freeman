# freemangc.com → Cloudflare Pages: cutover checklist

Status: plan only. **No DNS or domain changes have been made.**
Goal: serve the site from Cloudflare Pages (`freeman` project) on `freemangc.com`, keep Squarespace
as registrar, keep Microsoft 365 email working throughout, and keep a fast rollback.

## Current state (public DNS lookup, 14 Oct 2026)

A lookup cannot list every record. **Export the full zone from Squarespace before step 1.**

| Record | Value | Purpose | Keep? |
|---|---|---|---|
| NS | `ns01–04.squarespacedns.com` (NS1-backed `dns1–4.p08.nsone.net`) | Squarespace DNS | replaced by Cloudflare NS in phase A |
| DS (DNSSEC) | none found | — | nothing to disable first; re-check in Squarespace |
| `@` A | `75.2.70.75`, `99.83.190.102` | Webflow. **The apex returns 403 today**; only `www` serves the site | replaced in phase B |
| `www` CNAME | `cdn.webflow.com` | Webflow | replaced in phase B |
| `@` MX | `0 freemangc-com.mail.protection.outlook.com` | Microsoft 365 mail | **preserve exactly** |
| `autodiscover` CNAME | `autodiscover.outlook.com` | Outlook setup | **preserve**, DNS only |
| `resend._domainkey` TXT | `p=MIGfMA0…` (DKIM key) | Resend: contact form sends as `contact@freemangc.com` | **preserve**, DNS only |
| `send` | resolves via `send.forge.rmta.net` (SPF + MX `feedback.forge.rmta.net`) | Bounce/SPF domain for sending service | **preserve as exported** (confirm record type in the export) |
| `@` TXT | `"198.202.211.1"` | Unknown. Looks like an IP pasted into a TXT record | preserve; ask who added it |

Not found (pre-existing gaps; **do not change during the cutover**, fix separately afterwards):
no SPF at the apex (`v=spf1 include:spf.protection.outlook.com …`), no DMARC (`_dmarc`), no
Microsoft 365 DKIM (`selector1/selector2._domainkey`), no CAA. These affect email deliverability,
not the cutover.

## Decisions before starting
- [ ] **Canonical host.** Recommended: `freemangc.com`, with `www` → 301 to the apex (the apex is broken today, so no links depend on it working). Alternative: keep `www` canonical.
- [ ] **Old Webflow URLs.** Export Webflow's 301 list and `https://www.freemangc.com/sitemap.xml`; map any old page URLs that should survive into `v5/_redirects` (PR + QA as usual).
- [ ] **Webflow features in use.** Forms, CMS and analytics on Webflow stop at cutover. The new contact form already relays through `/api/contact` (Resend).
- [ ] **Window.** Business hours, with someone who can test Outlook on desktop and phone.

## Phase A — move DNS to Cloudflare with no visible change (email risk only)
1. [ ] Squarespace → Domains → freemangc.com → DNS: export or screenshot **every** record, including Microsoft 365 presets.
2. [ ] Lower TTLs on `@` and `www` to 300 s (if Squarespace allows) at least 24 h ahead.
3. [ ] Cloudflare → Add a site → `freemangc.com` → Free plan. Compare the auto-imported records **line by line** with the export; add anything missing.
4. [ ] Set proxy status:
   - `@` A and `www` CNAME still pointing at Webflow, **DNS only** (grey cloud) for now.
   - MX, `autodiscover`, `resend._domainkey`, `send`, and all TXT: **DNS only**.
5. [ ] SSL/TLS: mode **Full (strict)**, *Always Use HTTPS* on, minimum TLS 1.2, *Automatic HTTPS Rewrites* on. **Leave HSTS off** until the cutover has been stable for at least two weeks.
6. [ ] Squarespace → Domains → freemangc.com → Nameservers → **use custom nameservers** → the two Cloudflare nameservers. Registration stays at Squarespace.
   **Do not delete the Squarespace DNS records**; they are the rollback.
7. [ ] Wait for Cloudflare to show the zone as **Active** (minutes to a few hours).
8. [ ] Verify nothing changed:
   - `dig +short MX freemangc.com` → `0 freemangc-com.mail.protection.outlook.com.`
   - `dig +short CNAME autodiscover.freemangc.com` → `autodiscover.outlook.com.`
   - Send and receive mail with an external address.
   - Outlook desktop and phone still sync.
   - Contact form sends (Resend).
   - `www.freemangc.com` still serves Webflow.

## Phase B — point the web at Cloudflare Pages
9. [ ] Workers & Pages → `freeman` → Custom domains → add `freemangc.com`, then `www.freemangc.com`. Accept Cloudflare's proposed records: proxied CNAMEs to `freeman-d6f.pages.dev`, replacing the Webflow `@` A and `www` CNAME. Wait for both to be **Active** with certificates issued.
10. [ ] Redirect (Rules → Redirect Rules): `www.freemangc.com/*` → `https://freemangc.com/${1}`, 301, preserve query string. Reverse it if `www` is chosen as canonical.
11. [ ] Verify:
    - `https://freemangc.com` and `https://www.freemangc.com` have valid certificates; `www` redirects (301); `http` → `https`.
    - QA against the new host: `python3 qa/access-alder-qa.py https://freemangc.com`, `python3 qa/public-navigation-qa.py https://freemangc.com`, and `python3 qa/public-visual-diff.py https://freeman-d6f.pages.dev https://freemangc.com`.
    - The contact form works from `https://freemangc.com`. Both hosts are already in the allowed origins in `functions/api/contact.js`.
    - Repeat the email checks from step 8.
12. [ ] Cache safety on the new zone (Caching → Cache Rules): **Bypass cache** for `/p*`, `/proposal-assets/data/*`, `/a/*`, `/admin/*`. Owning the zone also allows per-URL cache purges, which is impossible on `pages.dev`.
13. [ ] Keep the Webflow site published on its `webflow.io` address and leave the custom domain attached in Webflow for 30 days (fast rollback). Then remove it and cancel Webflow hosting.

## Rollback
- **Fast (minutes, after phase B).** In Cloudflare DNS, remove the Pages custom-domain records and restore `@` A `75.2.70.75` + `99.83.190.102` and `www` CNAME `cdn.webflow.com` (DNS only). This works only while the domain is still attached in Webflow (step 13).
- **Full (hours, after phase A).** Squarespace → Nameservers → back to Squarespace defaults. The untouched Squarespace records take over again as caches expire. Email is unaffected in either direction as long as the MX and `autodiscover` records match.
- **Site content.** Independent of DNS: roll back via Cloudflare Pages → Deployments (see the PR #5 pre-merge report).

## After the cutover (separate, each by PR or a deliberate change)
- Email authentication: SPF, DMARC (start at `p=none`), Microsoft 365 DKIM.
- S3 activation can target `freemangc.com` paths directly (runbook step 2 no longer depends on `pages.dev` support).
- Consider redirecting `freeman-d6f.pages.dev` to `freemangc.com` so there is one public address.
- HSTS, after two stable weeks.
