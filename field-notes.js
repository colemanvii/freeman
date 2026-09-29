/* Each Sequence owns its content and controls. Moments and Pairs need no JavaScript. */
(() => {
  document.querySelectorAll('.entry.sequence').forEach(sequence => {
    const data = sequence.querySelector('.sequence-data');
    const slider = sequence.querySelector('input[type="range"]');
    const image = sequence.querySelector('.sequence-image');
    const controls = sequence.querySelector('.sequence-controls');
    const stops = sequence.querySelector('.sequence-stops');
    const stageLabel = sequence.querySelector('.sequence-stage');
    const observation = sequence.querySelector('.sequence-note');
    if (!data || !slider || !image || !controls || !stops || !stageLabel || !observation) return;
    let stages;
    try { stages = JSON.parse(data.textContent); } catch { return; }
    if (!Array.isArray(stages) || stages.length < 2 || !stages.every(stage =>
      stage && ['label', 'note', 'alt'].every(key => typeof stage[key] === 'string'))) return;

    const buttons = stages.map((stage, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.append(`${String(index + 1).padStart(2, '0')} `);
      const label = document.createElement('span');
      label.textContent = stage.label;
      button.append(label);
      button.addEventListener('click', () => select(index));
      return button;
    });
    function select(index) {
      const stage = stages[index];
      image.dataset.frame = index;
      image.setAttribute('aria-label', stage.alt);
      // Optional individual field photographs replace the illustrative contact sheet.
      if (stage.image) {
        image.style.backgroundImage = `url(${JSON.stringify(stage.image)})`;
        image.style.backgroundSize = 'cover';
      } else {
        image.style.removeProperty('background-image');
        image.style.removeProperty('background-size');
      }
      image.style.backgroundPosition = stage.position || 'center';
      stageLabel.textContent = `${String(index + 1).padStart(2, '0')} / ${String(stages.length).padStart(2, '0')} · ${stage.label}`;
      observation.textContent = stage.note;
      slider.value = index;
      slider.setAttribute('aria-valuetext', `${stage.label}, condition ${index + 1} of ${stages.length}`);
      buttons.forEach((button, i) => i === index ? button.setAttribute('aria-current', 'step') : button.removeAttribute('aria-current'));
    }
    slider.max = stages.length - 1;
    stops.replaceChildren(...buttons);
    stops.style.gridTemplateColumns = `repeat(${stages.length}, minmax(0, 1fr))`;
    slider.addEventListener('input', () => select(Number(slider.value)));
    const initial = Number(sequence.dataset.initialStage || 0);
    select(Number.isInteger(initial) ? Math.max(0, Math.min(stages.length - 1, initial)) : 0);
    controls.hidden = false;
  });
})();
