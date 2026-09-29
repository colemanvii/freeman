(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const records = typeof projectRecords === 'undefined' ? {} : projectRecords;
  const slug = new URLSearchParams(location.search).get('project') || 'barnsley-gardens';
  const project = Object.prototype.hasOwnProperty.call(records, slug) ? records[slug] : null;
  if (!project) {
    $('record-error').hidden = false;
    $('record-error-note').textContent = 'A project record has not been published at this address.';
    return;
  }
  document.title = `${project.title} — Project Record — Freeman`;
  $('projects-link').href = `index.html#projects/${encodeURIComponent(project.slug)}`;
  for (const [id, value] of Object.entries({
    'project-title': project.title, 'project-location': project.location,
    'project-type': project.type, 'project-status': project.status,
    'project-statement': project.statement, 'sequence-notice': project.sequenceNotice
  })) {
    $(id).textContent = value || '';
    $(id).hidden = !value;
  }
  $('record-content').hidden = false;

  const moments = Array.isArray(project.moments) ? project.moments : [];
  const finished = project.finished && project.finished.image ? project.finished : null;
  const entries = finished ? [...moments, finished] : [...moments];
  const slider = $('time'), recall = $('recall');
  let selected = Math.min(1, Math.max(0, moments.length - 1));
  let holding = false;
  let shown = selected;
  const states = new Map();
  const regions = {
    'top-left': '0% 0%', 'top-right': '100% 0%',
    'bottom-left': '0% 100%', 'bottom-right': '100% 100%'
  };
  function caption(entry, index) {
    return entry.day || entry.date || (entry === finished ? 'Finished' : `Moment ${String(index + 1).padStart(2, '0')}`);
  }
  function showImageStatus() {
    const entry = entries[shown];
    const state = entry?.image ? states.get(entry.image) : 'missing';
    const message = state === 'error' ? 'Photograph unavailable.' :
      state === 'missing' ? 'Dated field photograph pending.' :
      state === 'loading' ? 'Loading photograph…' : '';
    $('image-message').textContent = message;
    $('image-message').hidden = !message;
    $('photograph').setAttribute('aria-label', message || entry.alt || `${project.title} — ${entry.label || caption(entry, shown)}`);
  }
  const layers = entries.map(entry => {
    const layer = document.createElement('div');
    layer.className = 'photo';
    if (entry.image) {
      layer.style.backgroundImage = `url(${JSON.stringify(entry.image)})`;
      if (regions[entry.imageRegion]) {
        layer.style.backgroundSize = '200% 200%';
        layer.style.backgroundPosition = regions[entry.imageRegion];
      }
      if (!states.has(entry.image)) {
        states.set(entry.image, 'loading');
        const image = new Image();
        image.onload = () => { states.set(entry.image, 'ready'); showImageStatus(); };
        image.onerror = () => { states.set(entry.image, 'error'); showImageStatus(); };
        image.src = entry.image;
      }
    }
    $('photo-layers').append(layer);
    return layer;
  });
  function render(index) {
    shown = index;
    const entry = entries[index];
    layers.forEach((layer, i) => layer.classList.toggle('visible', i === index));
    $('day').textContent = caption(entry, index);
    $('date').hidden = !entry.date || entry.date === $('day').textContent;
    $('date').dateTime = entry.date || '';
    $('date').textContent = entry.date || '';
    $('stage').textContent = entry.label || '';
    $('note').textContent = entry.note || 'Field note pending.';
    $('count').textContent = `${index + 1} / ${entries.length}`;
    showImageStatus();
  }
  const buttons = entries.map((entry, i) => {
    const position = entries.length > 1 ? i / (entries.length - 1) * 100 : 0;
    const tick = document.createElement('i');
    tick.style.left = `${position}%`;
    $('track').append(tick);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = caption(entry, i);
    button.setAttribute('aria-label', `${caption(entry, i)}${entry.label ? `, ${entry.label}` : ''}`);
    button.style.left = `${position}%`;
    button.addEventListener('click', () => select(i));
    $('stops').append(button);
    return button;
  });
  $('stops').classList.toggle('many', entries.length > 6);
  function select(index) {
    selected = Math.max(0, Math.min(entries.length - 1, index));
    slider.value = String(selected);
    const entry = entries[selected];
    slider.setAttribute('aria-valuetext', `${caption(entry, selected)}${entry.label ? `, ${entry.label}` : ''}`);
    buttons.forEach((button, i) => {
      if (i === selected) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    render(holding ? entries.length - 1 : selected);
  }
  function begin() {
    if (!finished || holding) return;
    holding = true;
    recall.classList.add('holding');
    render(entries.length - 1);
  }
  function end() {
    if (!holding) return;
    holding = false;
    recall.classList.remove('holding');
    render(selected);
  }
  if (entries.length) {
    slider.max = String(entries.length - 1);
    slider.disabled = entries.length < 2;
    slider.addEventListener('input', () => select(Number(slider.value)));
    select(selected);
  } else {
    $('time-control').hidden = true;
    $('day').textContent = 'Record pending';
    $('note').textContent = 'The first dated field photograph and note have not been added.';
    showImageStatus();
  }
  recall.disabled = !finished;
  if (!finished) {
    recall.textContent = 'Finished view pending';
    recall.removeAttribute('aria-describedby');
  }
  recall.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !finished) return;
    recall.setPointerCapture(event.pointerId);
    begin();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'].forEach(event => recall.addEventListener(event, end));
  recall.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) begin();
    }
  });
  recall.addEventListener('keyup', event => {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); end(); }
  });
  recall.addEventListener('contextmenu', event => event.preventDefault());
  window.addEventListener('blur', end);
  document.addEventListener('visibilitychange', () => { if (document.hidden) end(); });

  // Sparse evidence ledger. Every group uses the same optional artifact fields:
  // title, date, image, alt, note, credit. No bespoke section markup is needed.
  const sections = [
    ['Reference', 'references', 'Reference material pending.'],
    ['Decision', 'decisions', 'A documented project decision has not yet been added.'],
    ['Field', 'fieldNotes', 'Supporting field photographs and notes pending.'],
    ['Resolution', 'resolutions', 'A documented field condition and its resolution have not yet been added.'],
    ['Finished', 'finishedArtifacts', 'Finished project documentation pending.'],
    ['Return', 'returns', 'A return visit has not yet been recorded.']
  ];
  sections.forEach(([title, key, empty], index) => {
    const artifacts = Array.isArray(project[key]) ? project[key] : [];
    const details = document.createElement('details');
    details.className = 'sequence-part';
    const summary = document.createElement('summary');
    const number = document.createElement('span'); number.className = 'section-number'; number.textContent = String(index + 1).padStart(2, '0');
    const heading = document.createElement('span'); heading.className = 'section-title'; heading.textContent = title;
    const status = document.createElement('span'); status.className = 'section-status'; status.textContent = artifacts.length ? `${artifacts.length} ${artifacts.length === 1 ? 'entry' : 'entries'}` : 'Awaiting material';
    summary.append(number, heading, status);
    const body = document.createElement('div'); body.className = 'section-body';
    if (!artifacts.length) { const note = document.createElement('p'); note.textContent = empty; body.append(note); }
    artifacts.forEach(artifact => {
      const figure = document.createElement('figure'); figure.className = 'artifact';
      if (artifact.title) { const title = document.createElement('h3'); title.textContent = artifact.title; figure.append(title); }
      if (artifact.image) {
        const image = document.createElement('img'); image.src = artifact.image; image.alt = artifact.alt || artifact.title || 'Project artifact'; image.loading = 'lazy'; image.decoding = 'async';
        image.addEventListener('error', () => { image.hidden = true; const unavailable = document.createElement('p'); unavailable.textContent = 'Image unavailable.'; image.after(unavailable); }, {once: true});
        figure.append(image);
      }
      const caption = document.createElement('figcaption');
      if (artifact.date) { const date = document.createElement('time'); date.dateTime = artifact.date; date.textContent = `${artifact.date} · `; caption.append(date); }
      caption.append(document.createTextNode(artifact.note || ''));
      if (artifact.credit) { const credit = document.createElement('span'); credit.className = 'credit'; credit.textContent = artifact.credit; caption.append(credit); }
      figure.append(caption); body.append(figure);
    });
    details.append(summary, body); $('project-sequence').append(details);
  });
})();
