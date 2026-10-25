/* Brand System Study 001 — content.
   Every word and image here already exists in Freeman's production site (/records.js, /app.js)
   or the Field Notes collection (field-notes.html, FIELD-NOTES.md). Nothing is invented:
   unrecorded dates and projects are stated as unrecorded, and missing assets are left out. */
(() => {
  "use strict";
  const R = window.RECORDS.projects;
  const bySlug = (s) => R.find((p) => p.slug === s);
  const root = "../../";
  const credit = (p, k) => (p.credits.find((c) => c[0] === k) || [])[1] || "";

  const beetlecat = bySlug("beetlecat");
  window.FGC = {
    name: "Freeman General Contracting",
    place: "Cartersville, Georgia",
    bfg: "Built for Generations",
    line: "Hospitality construction for people with a clear vision.",
    email: "gabe@freemangc.com",
    phone: "706.263.3348",
    web: "freemangc.com",
    palette: [
      { id: "chalk", name: "Chalk", hex: "#fff9f1" },
      { id: "sand", name: "Sand", hex: "#ddcfb3" },
      { id: "umber", name: "Umber", hex: "#332e20" },
      { id: "signal", name: "Signal", hex: "#f93822" },
    ],
    project: {
      id: beetlecat.id,
      name: beetlecat.name,
      location: beetlecat.location,
      type: beetlecat.type,
      summary: beetlecat.summary,
      client: credit(beetlecat, "Client"),
      photography: credit(beetlecat, "Photography"),
      gallery: beetlecat.gallery.map((g) => ({ ...g, src: root + g.src })),
    },
    /* Projects with photography, for indexes. */
    work: R.filter((p) => p.image).map((p) => ({ id: p.id, name: p.name, location: p.location, type: p.type, client: credit(p, "Client") })),
    inProgress: [
      ["Barnsley Branded Residential", "Adairsville, Georgia", "Residential"],
      ["Magnolia Commons Retail Center", "Cumming, GA", "Retail"],
      ["Little Rey", "Dunwoody, Georgia", "Hospitality"],
    ],
    company: {
      lead: "The way a place gets built matters.",
      paras: [
        "We work alongside owners, architects, designers, and operators who care deeply about what they create. We come to the table early, bring the right people together, and carry ambitious ideas through construction.",
        "Good construction is a relationship, not a transaction. It takes clear judgment, difficult conversations, respect for the people doing the work, and decisions made for the long term.",
        "We believe the process of building should be something people look forward to, not simply something they have to get through.",
      ],
      essay: [
        "Buildings outlive the people who build them.",
        "There is a responsibility that comes with building something another person will inherit. It means thinking past opening day: how a place will be used, how it will age, how it will be maintained, and what it will give to the people who encounter it.",
        "Good construction is often invisible in the finished result. Behind every well-considered space are thousands of decisions, most of which no one will ever notice.",
        "Those decisions matter.",
      ],
      services: [
        ["General Contracting", "Construction execution, coordination of trades, quality, and completion."],
        ["Construction Management", "Planning and coordination throughout the life of a project."],
        ["Preconstruction", "Early collaboration around scope, budgets, schedules, and constructability."],
      ],
      people: [
        ["Gabe Freeman", "Founder / President"],
        ["Dillon Vanderpool", "Project Manager"],
        ["Cameron Dombi", "Superintendent"],
        ["Mac Thompson", "Superintendent"],
        ["Jimmy Jennings", "Superintendent"],
        ["Macee Murray", "Controller"],
      ],
      image: { src: root + "assets/projects/barnsley-gardens-2.jpg", name: "Barnsley Family Pool", photography: credit(bySlug("barnsley-gardens"), "Photography") },
    },
    /* Field Notes: observations exactly as published in field-notes.html; numbering is this study's. */
    notes: [
      { no: "01", title: "From the field", obs: "Ladders beside the brick openings.", source: "Freeman image collection", date: "Capture date unrecorded", project: "Project unrecorded", src: "field/site.webp", w: 520, h: 347 },
      { no: "02", title: "Timber detail", obs: "Recessed metal pull in worn timber.", source: "Material reference, Freeman image collection", date: "Capture date unrecorded", project: "Project unrecorded", src: "field/timber.webp", w: 358, h: 493 },
      { no: "03", title: "Setting out", obs: "A worn layout square.", source: "Reference material, Freeman image collection", date: "Not a project tool record", project: "Project unrecorded", src: "field/square.webp", w: 465, h: 445 },
    ],
    card: { name: "Gabe Freeman", role: "Founder / President" },
    sign: { name: "Little Rey", place: "Dunwoody, Georgia", type: "Hospitality", status: "In progress" },
  };
})();
