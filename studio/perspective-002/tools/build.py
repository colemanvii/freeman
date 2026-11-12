"""Build index.html from src.html by inlining the production signature and eagle bitmaps.

Sources (read from the approved V5 release, never redrawn):
  v5/pixel-mark.js     160 x 61 signature, 2,278 pixels
  v5/eagle/stamp.pbm   192 x 60 Stamp eagle
Usage: python3 studio/perspective-002/tools/build.py  (from the repo root; needs git and the release branch)
"""
import base64, re, subprocess, pathlib
REL = "origin/release/approved-v5-2026-10-18"
here = pathlib.Path(__file__).resolve().parent.parent
show = lambda p: subprocess.run(["git", "show", f"{REL}:{p}"], capture_output=True, text=True, check=True).stdout
def pack(bits):
    out = bytearray((len(bits) + 7) // 8)
    for i, b in enumerate(bits):
        if b: out[i >> 3] |= 0x80 >> (i & 7)
    return base64.b64encode(bytes(out)).decode()
lines = [l for l in show("v5/eagle/stamp.pbm").split("\n") if l and not l.startswith("#")]
w, h = map(int, lines[1].split()); bits = "".join(lines[2:]).replace(" ", "")[: w * h]
eagle = pack([c == "1" for c in bits]); assert (w, h) == (192, 60) and bits.count("1") > 0
pts = re.findall(r"\[(\d+),(\d+)\]", show("v5/pixel-mark.js").split("const pts=")[1].split(";")[0])
sig = [False] * (160 * 61)
for x, y in pts: sig[int(y) * 160 + int(x)] = True
assert sum(sig) == 2278, sum(sig)
src = (here / "src.html").read_text()
(here / "index.html").write_text(src.replace("__EAGLE__", eagle).replace("__SIG__", pack(sig)))
print("index.html written; eagle ink", bits.count("1"), "signature pixels", sum(sig))
