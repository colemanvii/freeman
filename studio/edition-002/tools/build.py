"""Build studio/edition-002/index.html from src.html.

Edition 002 does not start over. This script lifts the Edition 001 material it keeps
(styles, the globe plate, the homepage comparison, the storyboard, the jacket studies and
the code that draws them) straight out of studio/edition-001/index.html, so nothing from
Edition 001 is retyped or redrawn. It also inlines:

  the Stamp eagle      v5/eagle/stamp.pbm, 192 x 60, from the approved V5 release
  the record drawings  v5/built-record/records/muchacho-decatur.js (Built Record Study 001),
                       traced from Freeman's published photographs
  the register         v5/records.js and v5/project-credits.js

Usage, from the repo root (needs git and the two branches fetched):
  python3 studio/edition-002/tools/build.py
"""
import base64, json, pathlib, re, subprocess

V5 = "origin/release/approved-v5-2026-10-18"
BR = "origin/claude/freeman-case-study-system-273x7a"
root = pathlib.Path(__file__).resolve().parents[3]
here = root / "studio" / "edition-002"


def show(ref, path):
    return subprocess.run(["git", "show", f"{ref}:{path}"], capture_output=True, text=True, check=True, cwd=root).stdout


# ---- Edition 001, by line range (the file is a frozen copy of the published artifact) ----
e1 = (root / "studio" / "edition-001" / "index.html").read_text().split("\n")


def lines(a, b, starts=None):
    """1-indexed, inclusive. `starts` guards against the source file changing."""
    chunk = e1[a - 1:b]
    if starts is not None:
        assert chunk[0].strip().startswith(starts), (a, chunk[0])
    return "\n".join(chunk)


style_a = next(i for i, l in enumerate(e1) if l.strip() == "<style>") + 2
style_b = next(i for i, l in enumerate(e1) if l.strip() == "</style>")
E1 = {
    "E1_CSS": lines(style_a, style_b),
    "E1_GLOBE_PLATE": lines(292, 306, "<figure>"),
    "E1_GLOBE_ROWS": lines(308, 321, '<div class="rows block">'),
    "E1_GLOBE_HP": lines(323, 345, '<div class="block">'),
    "E1_FILM_ROWS": lines(371, 392, '<div class="rows">'),
    "E1_FILM_BOARD": lines(394, 541, '<div class="block">'),
    "E1_GAR_IDEA": lines(563, 569, '<div class="rows">'),
    "E1_GAR_PLATES": lines(571, 670, '<div class="block">'),
    "E1_GAR_SPEC": lines(672, 699, '<div class="block">'),
    "E1_JS": lines(758, 1042, "const RUNS"),
}
# Edition 001's photographs, under the names Edition 002 files them by.
RENAME = {"p01": "field-ruin", "p02": "field-ridge", "p04": "field-table", "p07": "muchacho-03",
          "p13": "woodlands-dining", "p17": "field-three", "p18": "field-machines"}
for k in E1:
    for old, new in RENAME.items():
        E1[k] = E1[k].replace(f"img/{old}.jpg", f"img/{new}.jpg")

# ---- the Stamp eagle, packed one bit per pixel ----
pbm = [l for l in show(V5, "v5/eagle/stamp.pbm").split("\n") if l and not l.startswith("#")]
w, h = map(int, pbm[1].split())
bits = "".join(pbm[2:]).replace(" ", "")[: w * h]
assert (w, h) == (192, 60) and bits.count("1") > 0
packed = bytearray((len(bits) + 7) // 8)
for i, b in enumerate(bits):
    if b == "1":
        packed[i >> 3] |= 0x80 >> (i & 7)
EAGLE = base64.b64encode(bytes(packed)).decode()

# ---- the record drawings: the drawing functions of Built Record Study 001, unchanged ----
rec = show(BR, "v5/built-record/records/muchacho-decatur.js")
a = rec.index("  // ---- drawing helpers")
b = rec.index("  const SAME =")
DRAW = rec[a:b].rstrip()
for fn in ("elevation", "frontRoom", "bar", "door", "opening"):
    assert f"const {fn} = (u) =>" in DRAW, fn

# ---- the register: every project Freeman has published, and what is on file for each ----
recs = show(BR, "v5/records.js")
projects = json.loads(recs[recs.index("{"):recs.rindex("}") + 1])["projects"]
cred = show(BR, "v5/project-credits.js")
partners = dict(re.findall(r"'([a-z-]+)':\s*\{\s*name:\s*'([^']+)'", cred))
block = cred[cred.index("projects: {"):]
by_slug = {}
for slug, body in re.findall(r"'([a-z0-9-]+)':\s*\[(.*?)\]", block, re.S):
    by_slug[slug] = [[r, partners[p]] for r, p in re.findall(r"role:\s*'([a-z]+)',\s*partner:\s*'([a-z-]+)'", body)]
DRAWINGS = {"muchacho-decatur": 5}  # record drawings traced from photographs; no architect's drawing is on file
register = []
for p in projects:
    photos = len(p.get("gallery", [])) or (1 if p.get("image") else 0)
    register.append({
        "no": p["id"], "name": p["name"], "place": p["location"], "type": p["type"],
        "photos": photos, "account": bool(p.get("summary")), "traced": DRAWINGS.get(p["slug"], 0),
        "credits": [c for c in by_slug.get(p["slug"], []) if c[0] != "photography"],
    })
register.sort(key=lambda r: r["no"])
muchacho = next(p for p in projects if p["slug"] == "muchacho-decatur")

out = (here / "src.html").read_text()
subs = dict(E1, EAGLE_B64=EAGLE, RECORD_DRAW=DRAW, REGISTER=json.dumps(register, ensure_ascii=False),
            MUCHACHO_ACCOUNT=json.dumps(muchacho["summary"], ensure_ascii=False))
for k, v in subs.items():
    token = "{{" + k + "}}"
    assert token in out, token
    out = out.replace(token, v)
left = re.findall(r"\{\{[A-Z0-9_]+\}\}", out)
assert not left, left
(here / "index.html").write_text(out)
print(f"index.html written: {len(out) / 1024:.0f} KB, {len(register)} projects in the register, eagle ink {bits.count('1')}")
