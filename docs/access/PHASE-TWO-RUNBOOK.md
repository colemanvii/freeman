# Phase Two runbook — access control (S3) and protected previews (S5)

Policy: generic onboarding stays public (the site, ACCESS pathways, platform orientation).
Confidential proposals and anything project-specific require sign-in.

| Item | Status |
|---|---|
| S4 internal files | PR #6 (stacked on #5) |
| S8 required QA | **Live**: `freeman-v5-consolidation` requires the `qa` check (admins included; up to date with base; no force-push or deletion) |
| S5 preview sign-in | Needs a dashboard step (below), then verification |
| S3 confidential gate | Code ready, **inactive** (`ACCESS_MODE` unset = off). Activation only after the test plan below |
| S7 GitHub Pages | Deferred until existing links are checked. Note: five Vercel projects also deploy this repository on every push (seen as PR checks) — include them in that review |

Why Claude did not configure S5/S3 directly: the Cloudflare login on this machine (wrangler) has
`pages (write)` but no Zero Trust / Access scope, and signing in to Access on Freeman's behalf is
not something Claude does. Each step below is a few minutes in the dashboard.

---

## S5 — require Freeman staff sign-in for branch previews

Effect: `*.freeman-d6f.pages.dev` preview URLs require a one-time PIN sent to a Freeman address.
Production `freeman-d6f.pages.dev` is **not** affected. CI is not affected (it runs locally).

1. **Zero Trust (first time only).** Cloudflare dashboard → Zero Trust. Choose a team name
   (e.g. `freemangc` → `freemangc.cloudflareaccess.com`) and the Free plan (up to 50 users).
   Cloudflare may ask for a payment method even on Free.
2. **Enable the preview policy.** Workers & Pages → `freeman` → Settings → General →
   *Access policy* → **Enable**. This creates an Access application for preview deployments.
3. **Fix who can sign in — important.** The generated policy admits only the Cloudflare account
   owner (`Colecalfee@gmail.com`). Zero Trust → Access → Applications → the `freeman` preview
   application → Policies → edit:
   - Action: Allow
   - Include: *Emails* `cole@freemangc.com`, `gabe@freemangc.com` (or *Emails ending in*
     `@freemangc.com` if every Freeman mailbox should qualify)
   - Login method: One-time PIN (enabled by default)
   - Session duration: 24 hours
4. **Optional, for automated preview QA.** Zero Trust → Access → Service Auth → create a service
   token `freeman-qa`; add a second policy to the preview application: Action *Service Auth*,
   Include *Service Token* `freeman-qa`. Store the ID/secret as GitHub secrets
   `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` if previews should be tested from CI; the QA
   scripts send them automatically when those variables are set.

**Verification**
- Claude runs `qa/check-protection.sh previews`: preview URLs must redirect to
  `*.cloudflareaccess.com`; production must stay 200. (Baseline today: previews 200 — not yet protected.)
- Cole and Gabe each open https://fix-phase-one-stabilization.freeman-d6f.pages.dev, request a
  PIN at their Freeman address, and confirm the preview loads. (Staff sign-in must be confirmed
  by staff; Claude does not sign in.)
- Someone outside the policy (a personal address) must be refused.

---

## S3 — confidential paths (design; do not activate until tested)

### What is gated

| Path | Why |
|---|---|
| `/p`, `/p/*` | Private proposals |
| `/proposal-alder`, `/proposal-alder.html` | The file behind the `/p/alder` rewrite; reachable directly otherwise |
| `/proposal-assets/data/*` | Proposal content (pricing, scope, decisions) |

Stays public: everything else, including `/client-access` (generic ACCESS pathways) and
`/proposal-assets/app.js` / `styles.css` (layout code with no client data).
Future project-specific ACCESS pages go under a gated prefix (e.g. `/a/<engagement>/…`) and are
added to the list in `functions/_middleware.js` and `v5/_routes.json`.

### Two layers

1. **Cloudflare Access application** (sign-in UI, one-time PIN): a self-hosted application on
   `freeman-d6f.pages.dev` with the paths above. Policies: Freeman staff (as S5) **plus** the
   invited client contacts for each proposal. One application (or policy) per proposal slug keeps
   clients from seeing each other's proposals.
2. **Token verification in the site itself** (`functions/_middleware.js`): for gated paths, the
   middleware verifies the `Cf-Access-Jwt-Assertion` token (RS256 signature against the team's
   published keys, audience, issuer, expiry). If the Access application were ever detached or
   misconfigured, confidential paths would return 404 instead of being served. Gated responses
   are marked `Cache-Control: private, no-store`.
   `v5/_routes.json` limits Functions to `/api/*` and the gated paths, so public pages are still
   served as static files with no extra cost or latency.

Controlled by Pages environment variables (set per environment, Preview first):

| Variable | Value |
|---|---|
| `ACCESS_MODE` | `off` (default) → `report` (log only) → `enforce` |
| `ACCESS_TEAM_DOMAIN` | e.g. `freemangc.cloudflareaccess.com` |
| `ACCESS_AUD` | the Access application's *Application Audience (AUD) tag* |

### Tested so far (no Cloudflare changes)
- `node qa/access-gate-test.mjs` — runs the real middleware under Pages emulation in `enforce`
  mode with a locally generated signing key: **48/48** — public paths open without a token;
  every gated path refuses no token, expired, wrong audience, untrusted key, tampered and
  `alg: none` tokens; opens with a valid token; marked private.
- With `ACCESS_MODE` unset: ACCESS + Alder **1207/1207**, public navigation **117/117**, contact
  relay still routed.

### Activation test plan (each step needs your go-ahead)
1. Create the Access application for the gated paths; policy = Freeman staff only.
2. Verify on production that only the gated paths prompt for sign-in: `qa/check-protection.sh confidential`.
   *Assumption to confirm in this step:* Access self-hosted applications can target the
   production `*.pages.dev` hostname with paths. If the dashboard refuses, the gate waits for
   `freemangc.com` to move to Cloudflare (today the apex is served by another host).
3. Preview environment: `ACCESS_MODE=report` + team domain + AUD → open a gated preview path
   signed in and signed out; check Functions logs show only signed-out failures.
4. Preview: `ACCESS_MODE=enforce` → repeat; then production `report` → `enforce`.
5. Only then: add client contacts to a proposal's policy and send the link.

Rollback at any step: set `ACCESS_MODE=off` (or delete the Access application).

### Not in scope
Invitation links and sessions for clients and trade partners (Phase Three), and removing the
ACCESS study-code field (it grants nothing; it goes when invitations ship).
