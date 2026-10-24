// Virtual clock for frame-exact capture. Installed before any site script runs.
// Timers, requestAnimationFrame, performance.now and Date advance only when the film says so.
(() => {
  let vt = 0, seq = 1;
  const base = Date.parse('2026-10-23T15:00:00Z'), RealDate = Date;
  const timers = new Map(), rafs = new Map();
  performance.now = () => vt;
  Date.now = () => base + vt;
  window.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [base + vt])); } static now() { return base + vt; } };
  window.setTimeout = (fn, ms = 0, ...a) => { const id = seq++; timers.set(id, { at: vt + Math.max(0, +ms || 0), fn, a }); return id; };
  window.setInterval = (fn, ms = 0, ...a) => { const id = seq++; timers.set(id, { at: vt + Math.max(1, +ms || 0), fn, a, every: Math.max(1, +ms || 0) }); return id; };
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id);
  window.requestAnimationFrame = (fn) => { const id = seq++; rafs.set(id, fn); return id; };
  window.cancelAnimationFrame = (id) => rafs.delete(id);
  const call = (fn, a) => { try { typeof fn === 'function' ? fn(...a) : 0; } catch (e) { console.error(e); } };
  // CSS animations and transitions follow the same clock: paused on first sight, then seeked.
  const syncAnims = () => {
    for (const a of document.getAnimations()) {
      if (a.__vt == null) { a.__vt = vt; a.pause(); }
      a.currentTime = Math.max(0, vt - a.__vt);
    }
  };
  window.__vclock = {
    syncAnims,
    now: () => vt,
    // Advance to `target` ms in steps of at most `step` (one display refresh), firing timers in order,
    // then animation frames at each step.
    advance(target, step = 1000 / 60) {
      while (vt < target - 1e-9) {
        const next = Math.min(target, vt + step);
        for (;;) {
          let due = null;
          for (const [id, t] of timers) if (t.at <= next && (!due || t.at < due[1].at)) due = [id, t];
          if (!due) break;
          const [id, t] = due; vt = Math.max(vt, t.at);
          if (t.every) t.at += t.every; else timers.delete(id);
          call(t.fn, t.a);
        }
        vt = next;
        const cbs = [...rafs.values()]; rafs.clear();
        cbs.forEach((fn) => call(fn, [vt]));
      }
    },
  };
})();
