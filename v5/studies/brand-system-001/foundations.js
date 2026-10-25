/* Brand System Study 001 — foundation sheets. One identical layout per direction so the
   systems can be read against each other: type, colour, grid, spacing, image, marks, motion. */
(() => {
  "use strict";
  const { sig, eagle } = window.FGCStudy, F = window.FGC, P = F.project, N = F.notes;
  const sw = (hex, name, share, ink) => `<div class="fd-sw" style="flex:${share}"><i style="background:${hex}${ink ? `;color:${ink}` : ""}"></i><span>${name}<br>${hex.toUpperCase()}<br>${share}%</span></div>`;
  const pal = (shares) => { const [c, s, u, o] = F.palette; return `<div class="fd-pal">${sw(c.hex, c.name, shares[0])}${sw(u.hex, u.name, shares[1])}${sw(s.hex, s.name, shares[2])}${sw(o.hex, o.name, shares[3])}</div>`; };
  const tile = (bg, fg, inner, cls = "") => `<div class="fd-tile ${cls}" style="background:${bg};color:${fg}">${inner}</div>`;
  const grid = ({ cols, margin, gutter, bands, sheet }) => {
    const W = 288, k = W / 1440, H = 900 * k;
    let inner = "";
    if (sheet) {
      inner = `<div style="position:absolute;inset:${16 * k}px;border:1px solid currentColor"></div><div style="position:absolute;top:${16 * k}px;bottom:${16 * k}px;right:${(16 + 272) * k}px;border-left:1px solid currentColor"></div>`
        + Array.from({ length: 5 }, (_, i) => `<div class="fd-col-line" style="left:${16 * k + ((1440 - 32 - 272) * k * (i + 1)) / 6}px;top:${16 * k}px;bottom:${16 * k}px"></div>`).join("");
    } else {
      const cw = (1440 - 2 * margin - (cols - 1) * gutter) / cols;
      inner = Array.from({ length: cols }, (_, i) => `<div class="fd-col" style="left:${(margin + i * (cw + gutter)) * k}px;width:${cw * k}px;top:${bands[0] * k}px;bottom:${bands[1] * k}px"></div>`).join("");
    }
    return `<div class="fd-grid" style="width:${W}px;height:${H}px">${inner}</div>`;
  };
  const space = (steps) => `<div class="fd-space">${steps.map((s) => `<div><i style="width:${s}px"></i><span>${s}</span></div>`).join("")}</div>`;

  const SHEETS = {
    A: {
      principle: "The production identity, unchanged in spirit, with every value fixed.",
      type: `<div class="art dA fd-spec"><div style="font-size:24px;line-height:1.25">Built for generations<b style="font-weight:400;color:var(--signal)">.</b></div><div style="font-size:15px;margin-top:14px">BEETLECAT</div><div style="font-size:12px;margin-top:10px;max-width:440px">We work alongside owners, architects, designers, and operators who care deeply about what they create.</div><div style="font-size:9px;letter-spacing:.04em;color:var(--muted);margin-top:12px"><span style="color:var(--signal)">P—01</span> / HOSPITALITY / ATLANTA, GEORGIA</div></div>`,
      typeNote: "Monaco, the production face, unsmoothed. Four sizes: 24 / 15 / 12 / 9. Capitals for names and labels, sentence case for reading.",
      shares: [86, 11, 2, 1],
      colorNote: "Chalk field, Umber ink. Sand is print stock. Signal marks where you are: current section, record number, Access. Never larger than a word.",
      grid: { cols: 12, margin: 30, gutter: 24, bands: [94, 88] },
      gridNote: "12 columns, 30 margins, 94 / 88 bands. Record column 300, plate takes the rest.",
      space: [6, 12, 18, 30, 64, 94],
      spaceNote: "Production values, kept: 30 margin, 64 between record and plate, 94 head band.",
      image: `<figure class="art dA fd-img"><img src="${P.gallery[0].src}" alt="" style="width:100%;height:150px;object-fit:contain;object-position:left top;filter:saturate(.88) contrast(.96)"><figcaption style="display:flex;justify-content:space-between;border-top:1px solid var(--hair);padding-top:8px;margin-top:8px;font-size:8px;color:var(--muted)"><span style="color:var(--umber)">BEETLECAT</span><span>P—01 / HOSPITALITY</span></figcaption></figure>`,
      imageNote: "Never cropped. Contained, saturation 88, contrast 96. Field images at no more than 1.5× their captured size.",
      marks: `<div class="fd-tiles">${tile("#fff9f1", "#332e20", sig(1))}${tile("#332e20", "#fff9f1", sig(1))}${tile("#ddcfb3", "#f93822", sig(1))}</div><div class="fd-tiles">${tile("#fff9f1", "#332e20", eagle(1), "fd-wide")}</div>`,
      marksNote: "The three approved colorways. Signature 2× on the entry, alone. Eagle closes print and Contact, never beside the signature. Whole-pixel scales only.",
      motion: "sig",
      motionNote: "The production hand writes the signature once per visit, 1.4 s. Hover: Signal ground under the word, instant. Nothing else moves.",
    },
    B: {
      principle: "A single serif, set like a monograph. Fewer elements, larger silence.",
      type: `<div class="art dB fd-spec"><div style="font-size:64px;line-height:.98;letter-spacing:-.02em;font-weight:380">Beetlecat</div><div style="font-size:21px;font-style:italic;margin-top:8px">Hospitality construction for people with a clear vision.</div><div style="font-size:15px;margin-top:10px;max-width:440px">We work alongside owners, architects, designers, and operators who care deeply about what they create.</div><div class="b-sc" style="margin-top:12px">No. 01 — Plate 1 of 4</div></div>`,
      typeNote: "Newsreader across optical sizes. Roman to read, italic for place and caption, letterspaced capitals for numbering. Old-style figures in text.",
      shares: [90, 9, 0.5, 0.5],
      colorNote: "Chalk on screen, Sand for print. Signal appears once per surface: the full stop of Built for Generations.",
      grid: { cols: 6, margin: 64, gutter: 32, bands: [168, 64] },
      gridNote: "Six columns, 64 margins. Every page is a spread: text page, plate page.",
      space: [8, 16, 32, 64, 96, 128],
      spaceNote: "Doubling scale from 8. Space between ideas is 96; within an idea, 16 to 32.",
      image: `<figure class="art dB fd-img"><img src="${P.gallery[2].src}" alt="" style="height:150px;width:auto"><figcaption style="display:block;margin-top:8px;font-size:12px;color:var(--muted)"><i>Plate 3.</i> Beetlecat, Atlanta.</figcaption></figure>`,
      imageNote: "One plate per page in natural colour, numbered and credited in italic. The photograph sets its own proportion.",
      marks: `<div class="fd-tiles">${tile("#fff9f1", "#332e20", sig(1))}${tile("#ddcfb3", "#332e20", sig(1))}</div><div class="fd-tiles">${tile("#ddcfb3", "#332e20", eagle(1), "fd-wide")}</div>`,
      marksNote: "Signature 2× on the entry, 1× as masthead on every inner page. Eagle on print only, small, on Sand.",
      motion: "still",
      motionNote: "None. Pages change by cut. The signature arrives finished. Stillness is the signal.",
    },
    C: {
      principle: "Freeman's pages issued as sheets: title block, schedules, notes, the Stamp as seal.",
      type: `<div class="art dC fd-spec"><div style="font-size:72px;line-height:.9;font-weight:700;font-stretch:75%">BUILT FOR GENERATIONS.</div><div style="font-size:40px;line-height:1;font-weight:700;font-stretch:75%;margin-top:10px">P-01</div><div style="font-size:10.5px;margin-top:10px;max-width:440px;font-stretch:100%">1. The way a place gets built matters.</div><div style="font-size:8.5px;letter-spacing:.08em;color:var(--muted);margin-top:10px;font-stretch:100%">SHEET / TITLE / GENERAL NOTES / SCHEDULE</div></div>`,
      typeNote: "Martian Mono, one family. Width carries hierarchy: 75 for titles and sheet numbers, 100 for reading. Capitals throughout.",
      shares: [84, 12, 1, 3],
      colorNote: "Signal is redline and seal: annotations on evidence, the Stamp, the sign block. Sand is reserved.",
      grid: { sheet: true },
      gridNote: "Sheet border 16, title block 272, drawing area in six lettered and numbered bays.",
      space: [4, 8, 16, 32, 56],
      spaceNote: "8 px module. 56 sets the drawing margin; rules are 1 px Umber.",
      image: `<div class="art dC fd-img" style="display:flex;gap:16px;align-items:flex-start"><img src="${N[0].src}" alt="" class="c-mono" style="width:173px;height:116px"><img src="${P.gallery[0].src}" alt="" style="width:120px;height:86px;object-fit:cover"></div>`,
      imageNote: "Finished work in colour inside crop marks. Field evidence in monochrome with Signal annotation, never beyond 1.5× capture.",
      marks: `<div class="fd-tiles">${tile("#fff9f1", "#f93822", eagle(1), "fd-wide")}${tile("#f93822", "#fff9f1", eagle(1), "fd-wide")}</div><div class="fd-tiles">${tile("#fff9f1", "#332e20", sig(1))}</div>`,
      marksNote: "The Stamp is the seal in every title block and the field of the jobsite sign. Signature on the entry sheet only.",
      motion: "eagle",
      motionNote: "Approved Stamp “Impression” when a sheet opens. Redlines appear without animation.",
    },
  };

  function foundation(key) {
    const s = SHEETS[key], d = window.FGCStudy.DIRS.find((x) => x.key === key);
    const sec = (n, t, body, note, cls = "") => `<section class="fd-sec ${cls}"><h3><span>${n}</span>${t}</h3><div class="fd-body">${body}</div><p>${note}</p></section>`;
    const motion = `<div class="fd-motion" data-motion="${s.motion}" data-dir="${key}">${s.motion === "eagle" ? `<canvas width="192" height="60" style="width:192px;height:60px"></canvas>` : `<canvas width="160" height="61" style="width:160px;height:61px"></canvas>`}</div>${s.motion === "still" ? "" : `<button type="button" class="fd-replay" data-replay>Replay</button>`}`;
    return { w: 1440, h: 900, id: `${key}-00-F`, html: `<div class="art fd" style="width:1440px;height:900px">
      <header class="fd-head"><span>${key} — ${d.name}</span><span>${s.principle}</span><span>Foundations</span></header>
      <div class="fd-grid-sheet">
        ${sec("01", "Typography", s.type, s.typeNote, "fd-span2")}
        ${sec("02", "Colour", pal(s.shares), s.colorNote)}
        ${sec("03", "Grid", grid(s.grid), s.gridNote)}
        ${sec("04", "Spacing", space(s.space), s.spaceNote)}
        ${sec("05", "Image", s.image, s.imageNote)}
        ${sec("06", "Signature &amp; eagle", s.marks, s.marksNote)}
        ${sec("07", "Motion", motion, s.motionNote)}
      </div></div>` };
  }
  window.FGCStudy.foundation = foundation;
})();
