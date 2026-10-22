# Freeman Design Lab — 002: the working register

**Branch:** `study/design-lab-001` (not production)  
**Deployment (existing protected preview):** `https://study-design-lab-001.freeman-d6f.pages.dev/lab/`

## The editorial decision

**Index first, experience second.** The front door is a deliberately plain, useful catalogue. Don't make the Lab homepage compete with the actual explorations. Clicking a working prototype goes straight into the full interactive experience; clicking an idea opens an editorial concept sheet.

### Contents

- `01` FreemanAI — approved 002 interactive design reference
- `02` The Record — 001 interactive geographic record
- `03` Carry the Idea Through — recorded concept
- `04` Project Monographs — editorial concept
- `05` Field Evidence — documentation practice
- `06` Built for Generations — audio/conversation concept
- `07` Freeman ACCESS — proposal
- `08` The Drawing & The Stamp — identity and motion study

Only two entries are interactive prototypes; the others are explicitly marked as ideas, concepts, or proposals. These eight are the opening register, **not** an assertion that every Freeman idea has been catalogued.

## Where it lives

**Standalone deploy package:** `design-lab/` (output directory for a future dedicated Pages project):
- `index.html` — calm responsive index, with filtering and search
- `idea/index.html` — linked concept pages via `?id=...`
- `ideas.js` — editorial idea register; public-safe content only
- `lab.js` / `lab.css` — UI and behavior
- `studies/freemanai-002/` and `studies/the-record-001/` — preserved working studies

**Preview mirror:** `v5/lab/`, `v5/lab/idea/`, `v5/ideas.js`, `v5/lab.js`, `v5/lab.css` on the existing Cloudflare preview, with studies under `v5/studies/`. Update both copies of the register/UI while the preview mirror exists. Neither output modifies the production release.

## Adding an idea

1. Add a new object in `design-lab/ideas.js` with a unique `id`, number, title, subtitle, type, explicit status, date, statement, premise, opportunity, first test and review question.
2. Mark `kind: "idea"` unless there is a real, verified live interaction to open. For prototypes, include `href` and `action`.
3. Use grounded, cleared, public-safe language. **No private company facts, credentials, private project addresses, client data or financial information in this public repo.**
4. Mirror the idea to `v5/ideas.js` until the standalone project is the only preview. Check desktop and mobile, every link, and search.
5. Ask Gabe for perspective with the permanent Lab link or the direct concept URL; do not claim a shared feedback record exists until one is built.

## Access still requires account configuration

The repo alone does **not** secure a site. The current Cloudflare preview is expected to be Access-gated, but protection has not been independently tested for every hostname.

For a permanent `lab.freemangc.com`, create a **separate** Pages project with build output `design-lab`; configure Cloudflare Access for both the custom domain and the Pages hostname, allowing only Gabe and Cole. Test a signed-out private browser on both URLs and all assets before sharing. Allow long-lived trusted staff sessions appropriate to company policy. Remember that other Vercel/GitHub branch auto-previews may be exposed.

Do not merge into production just to make a preview link easier to access. No operational intelligence, shared comments, database or custom login is implemented in this version.
