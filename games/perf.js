// Shared phone heat guard for every hosted game (index.html: <script src="/perf.js"></script>, first thing in <head>,
// so it runs before any game code reads devicePixelRatio or grabs requestAnimationFrame).
// Phones only (coarse pointer): desktops keep native resolution and refresh rate.
//  1. devicePixelRatio reads at most 2 — a 3x phone otherwise fills 2.25x the pixels for no visible gain at arm's length.
//  2. requestAnimationFrame fires at most ~60/s — 120 Hz panels otherwise double CPU + GPU work per second.
// ponytail: 90 Hz panels land on 45 fps (every other vsync); a time-accumulator cap would give uneven pacing instead.
(() => {
  if (!matchMedia('(pointer: coarse)').matches) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  try { Object.defineProperty(window, 'devicePixelRatio', { get: () => dpr, configurable: true }); } catch { /* keep native */ }

  const raf = window.requestAnimationFrame.bind(window);
  const MIN_MS = 13; // 60 Hz vsync = 16.7 ms passes; 120 Hz = 8.3 ms skips every other
  let queue = new Map(), running = queue, id = 0, last = -MIN_MS, scheduled = false;
  const tick = (t) => {
    if (t - last < MIN_MS) return raf(tick);
    last = t;
    scheduled = false;
    running = queue;
    queue = new Map();
    running.forEach((cb) => {
      try { cb(t); } catch (err) { setTimeout(() => { throw err; }); } // one game callback throwing must not drop the rest
    });
  };
  window.requestAnimationFrame = (cb) => {
    queue.set(++id, cb);
    if (!scheduled) { scheduled = true; raf(tick); }
    return id;
  };
  window.cancelAnimationFrame = (i) => { queue.delete(i); running.delete(i); };
})();
