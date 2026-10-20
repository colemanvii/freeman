"use strict";
/*
 * ETCETERA — three index studies over one registry (etcetera/entries.js). Each composes one fixed
 * viewport and pages when the collection outgrows it; app.js owns the sheet controls, history and
 * the study switch.
 *
 *   FreemanEtcIndex.mount(vp, ctx) → { paginate() → pages, render(i), pageOf(slug) }
 *   ctx: { study: "a"|"b"|"c", entries, fill, type, setType(type) }
 *
 *   A  Typographic  a ledger: number, title, type, date. The left margin states the collection and
 *                   counts it by type; the counts filter. Hover or focus reads an entry's line.
 *   B  Visual       a contact sheet: every entry's material at one shared height, wrapped on the
 *                   grid; text entries are set as type and films as a dark frame at the same height.
 *                   The register beneath names whatever is under the cursor.
 *   C  Composed     an issue: each sheet leads with its weightiest entry at large scale, sets two
 *                   figures beside it and lists the rest as lines. One structure on every sheet.
 *
 * Capacity comes from measuring the composed frame, never from a fixed count. ctx.fill adds clearly
 * labelled RESERVED rows (review only) to show how each study behaves at fifty entries.
 */
(() => {
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad = (n) => String(n).padStart(3, "0");
  const when = (d) => (d ? d.split("-").reverse().join(".") : "—");
  const href = (e) => `etcetera-${e.slug}.html`;
  const label = (e) => `${e.no}, ${e.title}, ${e.type}`;
  // A full stop in Freeman orange ends a title set large, as on the Company page.
  const stop = (t) => esc(t).replace(/[.]$/, "") + '<span class="co4-accent">.</span>';
  // An entry is a link, unless it is a review placeholder.
  const open = (e, cls, inner, extra = "") =>
    e.reserved
      ? `<span class="${cls} is-reserved" aria-hidden="true"${extra}>${inner}</span>`
      : `<a class="${cls}" href="${esc(href(e))}" data-slug="${esc(e.slug)}" aria-label="${esc(label(e))}"${extra}>${inner}</a>`;
  const kind = (e) => (e.image ? "image" : e.video ? "film" : "text");
  // An entry's material at any size: its image, a dark frame for film, its title set as type.
  function material(e) {
    if (e.image) return `<img src="${esc(e.image.src)}" width="${e.image.w}" height="${e.image.h}" alt="" decoding="async" draggable="false">`;
    if (e.video) return `<span class="ix-film"><span>FILM${e.video.src ? "" : " / FORTHCOMING"}</span></span>`;
    return `<span class="ix-type"><span>${esc(e.title)}</span></span>`;
  }
  const px = (el, name) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;
  const chunk = (list, n) => {
    const out = [];
    for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n));
    return out.length ? out : [[]];
  };
  function withFill(entries, fill) {
    const out = entries.slice();
    for (let i = 0; i < fill; i++)
      out.push({ no: pad(entries.length + i + 1), title: "Reserved", type: "Capacity test", reserved: true });
    return out;
  }

  /* ---------- A — Typographic ---------- */
  const A = {
    shell(ctx, rows, row) {
      const types = [...new Set(ctx.entries.map((e) => e.type))];
      const tally = (t) => String(ctx.entries.filter((e) => e.type === t).length).padStart(2, "0");
      const chip = (t, n, name) =>
        `<li><button type="button" class="ix-a-type" data-type="${esc(t)}" aria-pressed="${t === ctx.type}"><span>${esc(name)}</span><span>${n}</span></button></li>`;
      return `<div class="ix ix-a"${row ? ` style="--ix-row:${row}px"` : ""}>
        <aside class="ix-a-side">
          <p class="ix-a-head">ETCETERA</p>
          <p class="ix-a-lede">Things Freeman finds interesting, meaningful or worth sharing. Films, photographs, essays, drawings, and whatever else does not fit.</p>
          <ul class="ix-a-types" aria-label="Show entries by type">${chip("", String(ctx.entries.length).padStart(2, "0"), "All")}${types.map((t) => chip(t, tally(t), t)).join("")}</ul>
        </aside>
        <section class="ix-a-ledger" aria-label="Entries">
          <div class="ix-a-cols" aria-hidden="true"><span>NO.</span><span>TITLE</span><span>TYPE</span><span>DATE</span></div>
          <ol class="ix-a-rows">${rows}</ol>
          <p class="ix-a-dek" aria-hidden="true"><span class="ix-a-dek-no"></span><span class="ix-a-dek-text"></span></p>
        </section>
      </div>`;
    },
    row: (e) => `<li>${open(e, "ix-a-row", `<span class="ix-no">${esc(e.no)}</span><span class="ix-a-title"><span class="ix-hl">${esc(e.title)}</span></span><span class="ix-a-kind">${esc(e.type)}</span><span class="ix-a-date">${e.reserved ? "—" : when(e.date)}</span>`, e.dek ? ` data-dek="${esc(e.dek)}"` : "")}</li>`,
    list: (ctx) => withFill(ctx.entries, ctx.fill).filter((e) => !ctx.type || e.type === ctx.type),
    paginate(vp, ctx) {
      const list = A.list(ctx);
      vp.innerHTML = A.shell(ctx, list.length ? A.row(list[0]) : "");
      const rows = vp.querySelector(".ix-a-rows"), first = rows.firstElementChild;
      const each = first ? first.offsetHeight : 1, room = rows.clientHeight;
      const per = Math.max(1, Math.floor(room / each));
      // A short collection is given air: its rows open up (to half again their height) to fill the
      // ledger. As the collection grows they close to their set height, then the ledger pages.
      const row = list.length && list.length <= per ? Math.floor(Math.min(each * 1.5, room / list.length)) : 0;
      return chunk(list, per).map((items) => ({ items, row }));
    },
    render(vp, ctx, page) {
      vp.innerHTML = A.shell(ctx, page.items.map(A.row).join(""), page.row);
      const dekNo = vp.querySelector(".ix-a-dek-no"), dek = vp.querySelector(".ix-a-dek-text");
      const read = (row) => {
        dekNo.textContent = row ? row.querySelector(".ix-no").textContent : "";
        dek.textContent = row ? row.dataset.dek || "" : "";
      };
      const ledger = vp.querySelector(".ix-a-rows");
      ledger.addEventListener("mouseover", (e) => read(e.target.closest("[data-slug]")));
      ledger.addEventListener("mouseleave", () => read(ledger.contains(document.activeElement) ? document.activeElement : null));
      ledger.addEventListener("focusin", (e) => read(e.target.closest("[data-slug]")));
      ledger.addEventListener("focusout", () => read(null));
      vp.querySelectorAll(".ix-a-type").forEach((b) => b.addEventListener("click", () => {
        ctx.type = b.dataset.type === ctx.type ? "" : b.dataset.type;
        ctx.setType(ctx.type);
        const again = vp.querySelector(`.ix-a-type[data-type="${CSS.escape(ctx.type)}"]`);
        if (again) again.focus();
      }));
    },
  };

  /* ---------- B — Visual ---------- */
  // Text entries take a fixed proportion in the band, a narrow column of type.
  const TEXT_RATIO = 0.62;
  const ratio = (e) => (e.image ? e.image.w / e.image.h : e.video ? (e.video.w || 16) / (e.video.h || 9) : TEXT_RATIO);
  const B = {
    shell: (band) => `<div class="ix ix-b"><div class="ix-b-band">${band}</div>
      <div class="ix-b-register" aria-hidden="true"><span class="ix-b-reg-label"></span><span class="ix-b-reg-no"></span><span class="ix-b-reg-title"></span><span class="ix-b-reg-meta"></span><span class="ix-b-reg-dek"></span></div></div>`,
    // Greedy wrap at a shared height h: [[entry, …], …] rows of the given width.
    wrap(list, h, W, gap) {
      const rows = [];
      let row = [], x = 0;
      list.forEach((e) => {
        const w = h * ratio(e);
        if (row.length && x + gap + w > W) { rows.push(row); row = []; x = 0; }
        x += (row.length ? gap : 0) + w;
        row.push(e);
      });
      if (row.length) rows.push(row);
      return rows;
    },
    paginate(vp, ctx) {
      const list = withFill(ctx.entries, ctx.fill);
      vp.innerHTML = B.shell("");
      const band = vp.querySelector(".ix-b-band");
      const W = band.clientWidth, H = band.clientHeight;
      const gap = px(band, "--gap"), rowGap = px(band, "--row-gap"), cap = px(band, "--cap"), minH = px(band, "--min-h");
      const tall = (rows, h) => rows * (h + cap) + (rows - 1) * rowGap;
      // The largest shared height at which everything fits one sheet...
      let lo = minH, hi = Math.min(H - cap, 640), best = 0;
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2;
        if (tall(B.wrap(list, mid, W, gap).length, mid) <= H) { best = mid; lo = mid; } else hi = mid;
      }
      if (best) return [{ h: Math.floor(best), rows: B.wrap(list, Math.floor(best), W, gap), items: list }];
      // ...or, when it does not, as many rows at the smallest height as a sheet holds, sheet by sheet.
      const per = Math.max(1, Math.floor((H + rowGap) / (minH + cap + rowGap)));
      const h = Math.floor((H - (per - 1) * rowGap) / per - cap);
      return chunk(B.wrap(list, h, W, gap), per).map((rows) => ({ h, rows, items: rows.flat() }));
    },
    render(vp, ctx, page) {
      const slot = (e) => open(e, `ix-b-slot ix-${e.reserved ? "text" : kind(e)}-slot`,
        `<span class="ix-b-fig" style="height:${page.h}px">${material(e)}</span><span class="ix-b-cap"><span class="ix-no">${esc(e.no)}</span><span>${esc(e.type)}</span></span>`,
        ` style="width:${Math.floor(page.h * ratio(e))}px"${e.dek ? ` data-dek="${esc(e.dek)}"` : ""}`);
      vp.innerHTML = B.shell(page.rows.map((r) => `<div class="ix-b-row">${r.map(slot).join("")}</div>`).join(""));
      const reg = vp.querySelector(".ix-b-register"), get = (c) => reg.querySelector(c);
      const latest = ctx.entries[ctx.entries.length - 1];
      const show = (e, el) => {
        if (!e) return;
        get(".ix-b-reg-label").textContent = el ? "ENTRY" : "LATEST";
        get(".ix-b-reg-no").textContent = e.no;
        get(".ix-b-reg-title").textContent = e.title;
        get(".ix-b-reg-meta").textContent = `${e.type} / ${when(e.date)}`;
        get(".ix-b-reg-dek").textContent = e.dek || "";
      };
      const bySlug = (el) => el && ctx.entries.find((e) => e.slug === el.dataset.slug);
      const band = vp.querySelector(".ix-b-band");
      band.addEventListener("mouseover", (e) => { const el = e.target.closest("[data-slug]"); if (el) show(bySlug(el), el); });
      band.addEventListener("focusin", (e) => { const el = e.target.closest("[data-slug]"); if (el) show(bySlug(el), el); });
      band.addEventListener("mouseleave", () => show(latest));
      show(latest);
    },
  };

  /* ---------- C — Composed ---------- */
  const C = {
    // A sheet: the weightiest remaining entry leads (ties: the newest); then up to two entries with
    // visual material and weight 2+ as figures; then the rest in catalogue order as lines.
    take(pool, n) {
      const by = (e) => (e.weight || 1) * 1000 + Number(e.no);
      const lead = pool.slice().sort((a, b) => by(b) - by(a))[0];
      const rest = pool.filter((e) => e !== lead);
      const figs = rest.filter((e) => (e.weight || 1) >= 2 && kind(e) !== "text").slice(0, 2);
      const lines = rest.filter((e) => !figs.includes(e)).slice(0, n);
      return { lead, figs, lines, items: [lead, ...figs, ...lines] };
    },
    leadMarkup: (e) => !e ? "" : open(e, `ix-c-lead ix-c-lead-${e.reserved ? "text" : kind(e)}`,
      `<span class="ix-c-lead-fig">${kind(e) === "text" ? `<span class="ix-c-lead-title">${stop(e.title)}</span>${e.dek ? `<span class="ix-c-lead-dek">${esc(e.dek)}</span>` : ""}` : material(e)}</span>
       <span class="ix-c-cap"><span class="ix-no">${esc(e.no)}</span><span class="ix-c-cap-title"><span class="ix-hl">${esc(e.title)}</span></span><span>${esc(e.type)}</span></span>`),
    figMarkup: (e) => open(e, `ix-c-fig ix-${kind(e)}-slot`,
      `<span class="ix-c-fig-body">${material(e)}</span><span class="ix-c-cap"><span class="ix-no">${esc(e.no)}</span><span class="ix-c-cap-title"><span class="ix-hl">${esc(e.title)}</span></span></span>`),
    lineMarkup: (e) => `<li>${open(e, "ix-c-line",
      `<span class="ix-no">${esc(e.no)}</span><span class="ix-c-thumb">${e.image ? material(e) : ""}</span><span class="ix-c-line-title"><span class="ix-hl">${esc(e.title)}</span></span><span class="ix-c-line-kind">${esc(e.type)}</span>`)}</li>`,
    shell: (p, line) => `<div class="ix ix-c"${line ? ` style="--ix-line:${line}px"` : ""}>${C.leadMarkup(p.lead)}<div class="ix-c-side">
      <div class="ix-c-figs${p.figs.length ? "" : " is-empty"}">${p.figs.map(C.figMarkup).join("")}</div>
      <ol class="ix-c-lines">${p.lines.map(C.lineMarkup).join("")}</ol></div></div>`,
    paginate(vp, ctx) {
      let pool = withFill(ctx.entries, ctx.fill);
      // Measure how many lines a sheet holds with a lead and its figures in place.
      const probe = C.take(pool, 1);
      vp.innerHTML = C.shell(probe);
      const lines = vp.querySelector(".ix-c-lines"), one = lines.firstElementChild;
      const each = one ? one.offsetHeight : 40, room = lines.clientHeight;
      const n = Math.max(1, Math.floor(room / each));
      const pages = [];
      while (pool.length) {
        const p = C.take(pool, n);
        pages.push(p);
        pool = pool.filter((e) => !p.items.includes(e));
      }
      // As in A: on a single sheet the lines open up (to half again their height) to fill the column.
      if (pages.length === 1 && pages[0].lines.length) pages[0].line = Math.floor(Math.min(each * 1.5, room / pages[0].lines.length));
      return pages;
    },
    render(vp, ctx, page) { vp.innerHTML = C.shell(page, page.line); },
  };

  const STUDIES = { a: A, b: B, c: C };
  function mount(vp, ctx) {
    const S = STUDIES[ctx.study] || A;
    let pages = [];
    return {
      paginate() {
        pages = S.paginate(vp, ctx);
        return pages.length || 1;
      },
      render(i) {
        if (pages[i]) S.render(vp, ctx, pages[i]);
        vp.dataset.sheets = pages.length;
      },
      pageOf: (slug) => pages.findIndex((p) => p.items.some((e) => e && e.slug === slug)),
    };
  }
  window.FreemanEtcIndex = { mount };
})();
