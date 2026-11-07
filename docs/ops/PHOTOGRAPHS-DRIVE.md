# /photographs — Google Drive gallery

The gallery at freemangc.com/photographs is built from one Google Drive folder:
**Photos** (`1oTSehQllUmR-f-amymYXjY114EP0SqXT`).

- Add a photograph to the folder → it appears in the gallery within about 2 minutes.
- Delete it (or move it out) → it disappears within about 2 minutes.
- Order follows filenames in natural order (`01`, `02` … `10`; camera names sort by capture).
- JPEG, PNG, WebP, GIF, AVIF, HEIC/HEIF, TIFF, BMP and DNG are accepted. Other files are ignored.
- No captions or filenames are shown. No code change or deployment is needed.

The folder stays private. A Google service account has Viewer access and reads it server-side
(`lib/photographs-drive.js`, called from `functions/_middleware.js` behind the gallery password).
Photographs are resized by Google's thumbnailer (640 / 1280 / 2400 px) and cached by Cloudflare.

## One-time setup

1. **Google Cloud** (console.cloud.google.com, any project):
   enable the **Google Drive API**; create a **service account** (no roles needed);
   under *Keys* add a **JSON key** and download it.
2. **Drive**: share the *Photos* folder with the service account's email
   (`…@….iam.gserviceaccount.com`) as **Viewer**. Do not make the folder public.
3. **Cloudflare** → Workers & Pages → `freeman` → Settings → Variables and Secrets:
   add a **Secret** `GOOGLE_SERVICE_ACCOUNT_JSON` with the whole JSON key file as its value,
   for **Preview** and **Production**. Then delete the downloaded key file.
4. Redeploy once (any new deployment picks up the secret). From then on, Drive alone drives the gallery.

Optional plain variables: `PHOTOS_DRIVE_FOLDER_ID` (use a different folder),
`PHOTOS_CACHE_SECONDS` (default `120`).

If the secret is missing, `/photographs` shows "Photographs are unavailable." after the password.
