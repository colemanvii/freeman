/* A sequence is optional: every other note is static HTML. No autoplay. */
(() => {
  const stages = [
    ['Opening', 'The brick opening is exposed. Temporary timber braces the arch.', 'Illustrative exposed brick arch with temporary timber bracing'],
    ['Frame', 'The frame is in place. The brick reveal remains exposed.', 'Illustrative timber window frame installed in an exposed brick opening'],
    ['Reveal', 'The reveal is plastered. Protection remains at the glass.', 'Illustrative plastered window reveal with tape and floor protection'],
    ['Finished', 'The timber frame and plaster reveal meet.', 'Illustrative finished timber radius window and plaster reveal']
  ];
  const slider = document.querySelector('#construction-stage');
  const image = document.querySelector('.sequence-image');
  const buttons = document.querySelectorAll('.sequence-stops button');
  function select(index) {
    const [label, note, alt] = stages[index];
    image.dataset.frame = index;
    image.setAttribute('aria-label', alt);
    document.querySelector('#sequence-stage').textContent = `${String(index + 1).padStart(2, '0')} / 04 · ${label}`;
    document.querySelector('#sequence-note').textContent = note;
    slider.value = index;
    slider.setAttribute('aria-valuetext', `${label}, condition ${index + 1} of 4`);
    buttons.forEach((button, i) => i === index ? button.setAttribute('aria-current', 'step') : button.removeAttribute('aria-current'));
  }
  slider.addEventListener('input', () => select(Number(slider.value)));
  buttons.forEach(button => button.addEventListener('click', () => select(Number(button.dataset.frame))));
  document.querySelector('.sequence-controls').hidden = false;
})();
