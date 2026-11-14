#!/usr/bin/env python3
"""Assemble index.html from src/. Run from this directory: python3 build.py
The page is authored as body content only; the Artifact publisher adds the document shell.
index.html opens directly in a browser as well (browsers supply the missing shell)."""
import pathlib
here = pathlib.Path(__file__).parent
out = "".join((here / "src" / n).read_text() for n in
              ["00-head.html", "10-front.html", "20-films.html", "30-back.html", "90-script.html"])
out = out.replace("{{SIG}}", (here / "src" / "signature.path").read_text().strip())
out = out.replace("{{EAGLE}}", (here / "src" / "eagle.path").read_text().strip())
assert "{{" not in out
(here / "index.html").write_text(out)
# preview.html: the same content inside the document shell the publisher would add, for local viewing.
shell = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
         '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
         '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>')
(here / "preview.html").write_text(shell + out + "</body></html>")
print("index.html", len(out), "bytes")
