// Merges keyboard, gamepads and on-screen touch buttons into one state per player.
const KEYS = [
  { left: ['KeyA'], right: ['KeyD'], jump: ['KeyW', 'Space'] },
  { left: ['ArrowLeft'], right: ['ArrowRight'], jump: ['ArrowUp', 'Enter', 'Numpad0'] },
];
const GAME_KEYS = new Set(KEYS.flatMap(k => [...k.left, ...k.right, ...k.jump]));

const down = new Set();
const touch = [{}, {}];
const prevJump = [false, false];
let prevStart = false;
export const capture = { on: false }; // true while playing, so menus keep Enter/Space

addEventListener('keydown', e => {
  // keys pressed in menus (Enter on "Play") must not leak in as a jump on the first frame
  if (!capture.on || !GAME_KEYS.has(e.code)) return;
  e.preventDefault();
  down.add(e.code);
});
addEventListener('keyup', e => down.delete(e.code));
addEventListener('blur', () => { down.clear(); touch.forEach(t => { t.left = t.right = t.jump = false; }); });

// Touch buttons: each pointer owns one button; sliding a finger across
// buttons of the same player re-targets it (left <-> right rocking).
export function bindTouch(root) {
  const owned = new Map(); // pointerId -> button
  const set = (btn, on) => { if (btn) { touch[+btn.dataset.p][btn.dataset.a] = on; btn.classList.toggle('on', on); } };
  const btnAt = (x, y) => document.elementFromPoint(x, y)?.closest('[data-a]');
  root.addEventListener('pointerdown', e => {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    e.preventDefault();
    owned.set(e.pointerId, b);
    set(b, true);
    navigator.vibrate?.(8);
  });
  root.addEventListener('pointermove', e => {
    const cur = owned.get(e.pointerId);
    if (!cur) return;
    const b = btnAt(e.clientX, e.clientY);
    if (b && b !== cur && b.dataset.p === cur.dataset.p) {
      set(cur, false); set(b, true); owned.set(e.pointerId, b);
    }
  });
  const up = e => { set(owned.get(e.pointerId), false); owned.delete(e.pointerId); };
  root.addEventListener('pointerup', up);
  root.addEventListener('pointercancel', up);
  root.addEventListener('contextmenu', e => e.preventDefault());
}

const any = codes => codes.some(c => down.has(c));

// Returns [{x, jump, jumpPressed}, …] plus start (pause) edge.
export function readInput() {
  const pads = [...(navigator.getGamepads?.() ?? [])].filter(Boolean);
  let start = false;
  const out = [0, 1].map(i => {
    const k = KEYS[i], t = touch[i], pad = pads[i];
    let x = (any(k.right) || t.right ? 1 : 0) - (any(k.left) || t.left ? 1 : 0);
    let jump = any(k.jump) || !!t.jump;
    if (pad) {
      const ax = pad.axes[0] ?? 0;
      if (Math.abs(ax) > 0.3) x = Math.sign(ax);
      if (pad.buttons[14]?.pressed) x = -1;
      if (pad.buttons[15]?.pressed) x = 1;
      jump ||= !!(pad.buttons[0]?.pressed || pad.buttons[1]?.pressed || pad.buttons[12]?.pressed);
      start ||= !!pad.buttons[9]?.pressed;
    }
    const jumpPressed = jump && !prevJump[i];
    prevJump[i] = jump;
    return { x, jump, jumpPressed };
  });
  out.start = start && !prevStart;
  prevStart = start;
  return out;
}
