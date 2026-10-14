# Public launch cleanup: PR plan (14 Oct 2026)

Branch `launch/public-cleanup`, based on production `freeman-v5-consolidation` `1f41b6b` (the live
deployment). It contains PR #11's three commits unchanged, plus three commits on top. Nothing is
pushed or merged, and no Cloudflare or GitHub setting has been changed.

## One PR, in this order
Open `launch/public-cleanup` → `freeman-v5-consolidation` as one PR. It **supersedes PR #11**: close #11 after this merges, or retarget it. Merging #11 on its own would ship the regression below. It also **supersedes `fix/launch-hardening`**, whose fixes are cherry-picked here.

| # | Commit | What changes for a visitor |
|---|---|---|
| 1–3 | PR #11 (`ef08cc9`, `7345ee9`, `78e611f`) | FIELDWORK leaves the section line on every page and the entrance nav. The "Fieldwork 001 ↗" / "Related Fieldwork" links leave the Optimist and Barnsley pages. Old Fieldwork URLs redirect to Projects. |
| 4 | Launch hardening (`65e8c31`) | No visible change on the pages. Adds a canonical URL (www) on every page, `sitemap.xml` (13 public URLs) and `robots.txt`. A nested unknown URL now shows the styled "Record not found" page, and its links work. The noscript line reads "This site needs JavaScript. Contact Freeman at…" (was "This prototype…"). The "Freeman GC" photo credit on Bocado, O-Ku and Dalton becomes plain text; it linked to the staging pages.dev site. |
| 5 | Withdraw Fieldwork from the build | No further visible change. Fieldwork pages, reader, images and records are no longer deployed. **This fixes PR #11's regression**: its `/fieldwork-*` redirect also caught `fieldwork-reader.js`/`.css`, which every page loads, so every page logged four MIME errors. `records.js` ships only rendered fields. `/sawdust` and Fieldwork URLs use 302, not 301. |
| 6 | Withdraw Alder | `/p/alder`, `/proposal-alder` and `/proposal-assets/*` return 404. The ACCESS page answers the code ALDER with "Code not recognized". |

**Unchanged:** the landing page composition, Company, Projects, Contact, typography, colors, palettes, CLOSE/history behaviour and the ACCESS pathways. No content was rewritten, and no source material was deleted:
- Fieldwork is in `v5-source/fieldwork/` plus `content.json`; `python3 v5-source/generate.py --fieldwork` rebuilds it locally.
- Alder is in `v5-source/alder/`.
- Every source field remains in `content.json`.

## records.js: what stopped shipping
`records.js` dropped from 12.3 KB to 6.3 KB. The generator now publishes only `slug, id, name, location, type, summary, details, date, image, gallery`, and the credits `Client` / `Photography` / `Interior Design`.

**No longer public:**
- Budgets: Savi $850k, La Cresta $3.1 million, Cleveland $1.1M.
- "Total sq. ft. 2,000+" and "Complete 2024": template values on seven projects.
- Testimonial quotes on Beetlecat and Bocado.
- Scraped Webflow CDN URLs.
- The placeholder "Interior Designer".
- The `Location` and `Project Type` credits on La Cresta and Cleveland.
- All six Fieldwork records, including the "AI-generated imagery" notes and "visual archive / Tool 21" sources.

**Still public, because the pages render it:** project summaries and details. Gabe should verify the claims in them: Optimist "3 weeks… on time and under budget", La Cresta "four luxurious 3-story units", and the Cleveland/Dalton text, which is identical on both.

## Verified test results
All runs used Chromium/Playwright 1.60 against `wrangler pages dev` (production-equivalent routing), the same as CI.

| Target | `public-navigation-qa.py` | `access-alder-qa.py` |
|---|---|---|
| Production `www.freemangc.com`, baseline, old suites | 129 checks, 0 failed | 1216 checks, 0 failed |
| PR #11 as-is | **crashes**: Fieldwork test times out (CI would fail too); 4 console MIME errors per page | not run |
| `launch/public-cleanup` | **149 checks, 0 failed** | **1134 checks, 0 failed** |
| Production, with the new suites (negative control) | 51 failed: Fieldwork links still present, as expected | — |

The suites' new checks cover:
- No Fieldwork link or label on any public page at 1440×900 or 390×844.
- All 14 Fieldwork URLs return 302 to `/projects`, and query strings are kept.
- The reader and images return 404.
- `records.js` contains no budget, square-footage, quote, Webflow URL or AI text, and an empty archive.
- Nine Alder paths return 404.
- The ALDER code is not recognized, and the ACCESS page source has no Alder reference.
- Legacy Webflow redirects still work.
- The internal source files are not served.

**Pixel diff, production vs branch,** 14 routes × 2 viewports:
- Differences sit only in the section line, where FIELDWORK is removed, on every page.
- On Optimist and Barnsley, the "FIELDWORK 001 ↗" line is removed; on phones the photograph moves up into the freed space.
- `/client-access` is identical.
- There are no console errors on the branch.

**Spot checks:**
- A nested 404 such as `/some/deep/missing` is styled, and its links land on root routes.
- In-place navigation and Back/Forward work.
- Bocado shows "Photography — Freeman GC" as plain text.

## Approvals needed outside the repo (in priority order)

### 1. GitHub: the repository and GitHub Pages are public (CRITICAL)
- `github.com/colemanvii/freeman` is public. `v5-source/content.json`, with its budgets and quotes, downloads from `raw.githubusercontent.com` without authentication, and so does everything else in the repo.
- GitHub Pages also serves an older `main` at `colemanvii.github.io/freeman`, including `cockpit/` (internal planning) and `cockpit/data.json`.

Steps:
1. Repo → Settings → Pages → *Unpublish site* (or set Source to None). Then delete or disable `.github/workflows/pages.yml` on `main`, otherwise the next push to `main` republishes the site.
2. Repo → Settings → General → Danger Zone → *Change visibility* → Private. Cloudflare Pages keeps building, because its GitHub app keeps access. Verify that with one deploy afterwards.
3. Treat everything already pushed as having been public: it may have been copied or cached.

### 2. Cloudflare: apex → www permanent redirect
Dashboard → `freemangc.com` → **Rules → Redirect Rules → Create rule**:
- **Rule name:** `Apex to www (301)`
- **If incoming requests match:** *Custom filter expression* → Field `Hostname`, Operator `equals`, Value `freemangc.com`. The expression is `(http.host eq "freemangc.com")`.
- **Then:** *URL redirect* → Type **Dynamic** → Expression `concat("https://www.freemangc.com", http.request.uri.path)` → Status code **301** → **Preserve query string: on**.
- **Deploy.**

Leave the apex DNS record proxied (it is) and the apex Pages custom domain attached, so its certificate stays valid.

Verify:
```
curl -sI "https://freemangc.com/projects?x=1&y=2"   # 301, location: https://www.freemangc.com/projects?x=1&y=2
curl -sI "https://freemangc.com/"                    # 301, location: https://www.freemangc.com/
curl -sI "https://freemangc.com/about"               # 301 → www/about, which then 301s → /company
curl -sI "http://freemangc.com/contact"              # ends at https://www.freemangc.com/contact (1–2 hops)
curl -sI "https://www.freemangc.com/"                # 200, unaffected
```
Rollback: toggle the rule off, which takes effect in seconds.

### 3. Cloudflare: old Pages deployments still serve Alder and Fieldwork
Every deployment keeps its own URL. `https://fe86f84c.freeman-d6f.pages.dev/p/alder` and `https://6f123fd7.freeman-d6f.pages.dev/proposal-assets/data/alder.js` return 200 today, and this PR cannot change them. Choose one:

- **(a) Recommended:** Workers & Pages → `freeman` → Settings → *Access policy* → **Enable** for preview deployments. Cloudflare Access then puts a login in front of `*.freeman-d6f.pages.dev` previews. This is activating authentication, so it needs your approval. Afterwards, check whether the unique URL of the current production deployment is also covered.
- **(b)** Delete the old deployments that contain Alder (Deployments → ⋯ → Delete). This is irreversible and removes rollback targets, so do it only after this PR is live and stable.

### 4. Optional, once a real gate is wanted for ACCESS or proposals
Cloudflare Access (Zero Trust, free up to 50 users) on `www.freemangc.com/p/*` with an email one-time PIN for named people. Do not do this until there is content to protect: this PR removes Alder rather than gating it, which is the safest temporary approach.

## Contact delivery
Tested against production with invalid payloads only, so no mail was sent:
- `www`, apex and pages.dev origins are accepted on both hosts.
- A foreign origin returns 403.
- The Resend key is configured; the endpoint answers 400 for the invalid payload, not 503.

**Awaiting approval:** one real message from `https://www.freemangc.com/contact`, which delivers to gabe@ with cc to cole@. Then confirm it arrives, that Reply goes to the sender, and that it isn't in junk. There is no SPF or DMARC record; mail is DKIM-signed by Resend.

## After merge
- Cloudflare deploys `freeman-v5-consolidation`.
- Re-run both suites against `https://www.freemangc.com`, plus the visual diff against this branch's preview.
- Submit `https://www.freemangc.com/sitemap.xml` in Google Search Console.
