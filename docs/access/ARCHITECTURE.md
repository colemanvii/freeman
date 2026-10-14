# Freeman ACCESS — architecture (Phases Two and Three)

Status: proposal for review. Nothing in this document is deployed or enabled.

**Governing principle.** ACCESS explains how to work with Freeman. Procore and BuildingConnected
remain the systems of record. ACCESS never stores project documents, RFIs, submittals, bids,
prequalification files, invoices or signatures.

---

## Phase Two — security and deployment hygiene

### Findings to resolve

| # | Risk | Current state (verified 14 Oct 2026) | Proposed action | Needs approval? |
|---|---|---|---|---|
| S1 | Private proposals are public | `/p/alder` and `/proposal-assets/data/alder.js` are fetchable by anyone. Alder is illustrative, so nothing confidential is exposed *today*. | Rule: no real proposal is deployed until S3 is live. Gate `/p/*` and `/proposal-assets/data/*`. | No (until a real proposal exists) |
| S2 | Client-side codes | `CLIENT`, `ARCHITECT`, `TRADE`, `ALDER` are string comparisons visible in page source. They grant nothing, but the UI implies they do. | Remove the code field when invitation links ship; until then label it "study code". | No |
| S3 | No authentication | Every page is public; `noindex` is the only control. | Cloudflare Access now; invitation sessions later (see below). | **Yes** — changes who can open private pages |
| S4 | Internal files served | `README.md`, `generate.py`, `tools/`, `*validation.json`, `content.json`, `_preserved-portal/` return 200. | Build into a clean output directory that contains only public files (changes the Cloudflare output setting from `v5` to `dist`), or move internal files out of `v5/`. | **Yes** — Cloudflare build setting |
| S5 | Public previews | Every pushed branch gets a public `*.freeman-d6f.pages.dev` URL. | Cloudflare Access policy on preview deployments (Pages → Settings → "Enable access policy"), Freeman staff emails only. | **Yes** — previews would then require sign-in |
| S6 | Contact relay abuse | `/api/contact` has no rate limit or bot check; requests without an `Origin` header are accepted. | Cloudflare Turnstile (invisible) + a per-IP rate-limiting rule on `/api/contact`; require `Origin`. | No visual change; Turnstile site key needed |
| S7 | Competing deployments | `.github/workflows/pages.yml` deploys **`main`** (an older site with `portal.html`, `proposal-study.html`) to `colemanvii.github.io/freeman/`. | Disable that workflow and unpublish GitHub Pages. Consequence: that URL stops working; nothing on production depends on it. | **Yes** — disables a live service |
| S8 | No automated checks | — | Done in Phase One: `.github/workflows/qa.yml`. Next: make it a required check via branch protection on `freeman-v5-consolidation`. | **Yes** — repository setting |

### Authentication: recommendation

Clients and trade partners should not have to create another account.

| | Cloudflare Access (email one-time PIN) | Invitation links + session (Pages Functions + D1) |
|---|---|---|
| Visitor experience | Enter email → receive 6-digit code → in. Re-prompts per session length. | Click the link in the invitation email → in. Expired link → "send me a fresh link". |
| Build effort | Configuration only. | ~1–2 weeks: invite, verify, session, revoke, admin list. |
| Per-project scoping | Coarse: policy by email list or group per path. | Fine: each engagement grants specific people specific pages. |
| Cost | Free up to 50 users, then per-seat. Trade partners will exceed 50. | Pages Functions + D1 free tier covers this volume. |
| Branding | Cloudflare's login page (limited customisation). | Fully Freeman. |
| Revocation | Edit policy. | Delete session / engagement. |

**Recommendation: both, in sequence.**
1. **Now:** Cloudflare Access with one-time PIN for `/p/*`, `/proposal-assets/data/*`, preview
   deployments and any future `/admin`. Staff-maintained email list. Zero code, reversible.
2. **Phase Three:** invitation links for clients, architects and trade partners (they are the
   ones who would exceed 50 seats and benefit from per-engagement scoping). Keep Cloudflare
   Access for Freeman staff and `/admin`.

Invitation link design (minimal, no passwords):
- Staff create an engagement and add people by email. The system emails a single-use link
  containing a 256-bit random token; only its SHA-256 hash is stored, expiring in 7 days.
- Opening the link sets an `HttpOnly; Secure; SameSite=Lax` session cookie (opaque ID, 30-day
  rolling expiry, stored server-side so it can be revoked) and burns the token.
- Every private request is authorised server-side against the engagement. Private content is
  served by a Function, never as a static asset.
- Rate-limit link requests; never reveal whether an email is invited.

---

## Phase Three — making ACCESS operational

### Data model (D1)

```
organization (id, name, kind: client|architect|trade_partner)
person       (id, organization_id, name, email, role_title)
engagement   (id, project_name, organization_id, audience: client|architect|trade,
              status: proposed|awarded|onboarding|active|closed,
              procore_project_url, kickoff_booking_url, freeman_contact_person_id)
membership   (engagement_id, person_id, invited_at, last_seen_at)
requirement  (id, module_id, audience, scope: organization|person|engagement,
              expires_after_days NULL, required BOOLEAN)
completion   (requirement_id, organization_id, person_id NULL, engagement_id NULL,
              completed_at, completed_by_person_id, method: self_reported|staff_verified,
              evidence_note)       -- a note or a link to the system of record, never a file
invite_token (token_hash, person_id, engagement_id, expires_at, used_at)
session      (id_hash, person_id, created_at, expires_at, revoked_at)
event        (at, actor, kind, engagement_id, detail)   -- audit trail
```

### Completion scopes

| Scope | Meaning | Examples | Repeats |
|---|---|---|---|
| **Organization** | Satisfied once for the company; may expire. | Trade partner prequalification, W-9, certificate of insurance, billing setup. | On expiry (e.g. COI annually) — **expiry periods to be confirmed by operations**. |
| **Person** | Each individual, once. | Procore account setup, "How Freeman uses Procore", BuildingConnected setup. | When the procedure version changes materially. |
| **Engagement** | Each project. | Project contacts, Procore project invitation accepted, kickoff scheduled, project-specific billing instructions. | Every project. |

A returning trade partner on a second project sees only engagement items and anything expired.
"Completed" is self-reported unless staff verify it against Procore/BuildingConnected; the UI
must say which.

### Reusable instruction modules

Defined in `docs/access/modules.json` (schema: `tutorial-registry.schema.json`). Each module
has written steps (always), an optional Loom video, an audience, a procedure version, an owner
and a review date. A module that is past its review date or not yet approved is not shown to
external users.

| Module | Audiences | Scope | Status |
|---|---|---|---|
| Procore account setup | Client, Architect, Trade Partners | Person | Needs content |
| Locating project information in Procore | Client, Architect, Trade Partners | Person | Needs content |
| Reviewing RFIs and submittals in Procore | Architect (Client: items needing review) | Person | Needs content |
| BuildingConnected setup | Trade Partners | Person | Needs content |
| Trade partner prequalification | Trade Partners | Organization | **Needs Freeman policy** |
| Freeman billing and payment procedures | Trade Partners | Organization + Engagement | **Needs Freeman policy** |
| Project contacts and communication | All | Engagement | Needs per-project data |
| Scheduling a kickoff meeting | Client, Architect | Engagement | Needs booking tool decision |

Loom: generic platform walkthroughs can be unlisted links (they contain no project data).
Anything project-specific is embedded only inside authenticated pages. Every video ships with a
transcript and the written steps, so the page works without the video.

### Integrations

| System | Phase Three (practical) | Later (needs vendor access/review) |
|---|---|---|
| Procore | Deep link to the project (`procore_project_url`); written orientation; staff mark "invitation accepted". | Procore OAuth app to read project-directory membership and mark that step automatically. Requires a Procore developer app and company admin approval. |
| BuildingConnected | Deep link + setup module. | Autodesk Platform Services exposes BuildingConnected APIs; scope and availability for Freeman's account **unverified** — confirm before planning. |
| E-signature | Out of scope for ACCESS: agreements are signed in a dedicated service (e.g. DocuSign / Dropbox Sign / Adobe Sign — **Freeman to choose**). | Webhook from the signature service marks the engagement *awarded*. |
| Scheduling | Store the Freeman PM's existing booking link on the engagement. | — |
| Email | Resend (already configured for `/api/contact`) for invitations and notifications. | — |

### Proposal → onboarding continuity

```
1 Private proposal (/p/<slug>)           — authenticated; served by a Function, not a static asset
2 Client reviews                         — read-only; "request a working session" (mailto today)
3 Agreement + signature                  — external e-signature service; ACCESS links to it, never imitates it
4 Staff mark engagement "awarded"        — manually, or by signature-service webhook
   → invitation emails to client contacts (Resend)
5 Client onboarding in ACCESS            — Project introduction → Procore → Working with Freeman → Kickoff
6 Procore instructions                   — modules + project deep link; Procore invitation sent from Procore
7 Kickoff                                — PM booking link; on booking, notify PM + client contact
```

ACCESS will **not** include an "Approve" or "Accept" button that implies a binding agreement.
If a non-binding "we'd like to proceed" signal is wanted, it is recorded as intent only and
labelled as such.

### Notifications (Resend)

| Event | Recipients |
|---|---|
| Engagement awarded / invitation sent | Invited people; Freeman contact (copy) |
| Person completes all required items | Freeman contact |
| Organization item expiring in 30 days | Organization's primary contact; Freeman operations |
| Kickoff booked | Freeman PM, client contact |

Recipients beyond the Freeman contact (e.g. operations, accounting) **to be confirmed**.

---

## Questions for Gabe / operations

Nothing below is invented on the site; each needs an owner's answer before content is written.

1. Prequalification: what Freeman requires (forms, safety record, licences, references), and
   whether it lives in BuildingConnected/TradeTapp, Procore, or elsewhere.
2. Insurance: required certificate of insurance coverages/limits; additional-insured wording;
   renewal tracking owner.
3. Billing: pay-application format, monthly cut-off date, required backup, lien-waiver
   type/timing, retainage, payment terms, where invoices are submitted.
4. Procore: which tools external users get (Documents, RFIs, Submittals, Drawings, Photos…)
   and default permission templates per audience.
5. RFIs and submittals: expected response times Freeman asks architects to meet.
6. Kickoff: who schedules, which booking tool, standard attendees and agenda.
7. Communication: whether project communication must stay in Procore, and the escalation contact.
8. E-signature service Freeman uses or prefers.
9. Who maintains ACCESS content and approves Loom recordings (owner + review cadence).
10. Approval to proceed with Phase Two items S3, S4, S5, S7 and S8.
