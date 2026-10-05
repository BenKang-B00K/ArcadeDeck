// Devices -> per-player intents { steer -1..1, throttle 0..1, brake 0..1, drift, item (edge), back, pause (edge) }.
// Devices: 'kb0' (left cluster WASD), 'kb1' (right cluster, arrows), 'pad0'..'pad3' (Standard mapping), 'touch0' /
// 'touch1' (on-screen controls inside that player's view). DESIGN.md §5.

const keys = new Set();
const GAME_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyQ', 'Space', 'ShiftLeft', 'ShiftRight',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Period', 'Comma', 'Slash']);
export let racing = false; // game keys don't scroll or press focused buttons while racing
export const setRacing = on => { racing = on; for (const l of Object.values(latch)) l.item = l.drift = false; if (!on) { keys.clear(); for (const t of touch) t.release(); } };

export const CLUSTERS = {
  kb0: { left: ['KeyA'], right: ['KeyD'], up: ['KeyW'], down: ['KeyS'], drift: ['ShiftLeft'], item: ['KeyE', 'Space'], back: ['KeyQ'], confirm: ['Space', 'KeyE'], cancel: ['Escape', 'KeyQ'] },
  kb1: { left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'], drift: ['ShiftRight', 'Slash'], item: ['Enter', 'Period'], back: ['Comma'], confirm: ['Enter', 'Period'], cancel: ['Backspace', 'Comma'] },
};
// per-device menu edges for this frame: up / down / left / right / confirm / cancel / start
const EDGE = () => ({ up: false, down: false, left: false, right: false, confirm: false, cancel: false, start: false });
const edges = { kb0: EDGE(), kb1: EDGE(), pad0: EDGE(), pad1: EDGE(), pad2: EDGE(), pad3: EDGE() };
export let lastDevice = 'kb0';
// a key tapped and released between two frames would never be seen as held: latch item / drift presses until read
const latch = { kb0: { item: false, drift: false }, kb1: { item: false, drift: false } };
addEventListener('keydown', e => {
  keys.add(e.code);
  if (racing && GAME_KEYS.has(e.code)) e.preventDefault();
  for (const dev of ['kb0', 'kb1']) {
    const C = CLUSTERS[dev], E = edges[dev];
    for (const a of ['up', 'down', 'left', 'right']) if (C[a].includes(e.code)) { E[a] = true; lastDevice = dev; }
    if (e.repeat) continue;
    if (C.confirm.includes(e.code)) { E.confirm = true; lastDevice = dev; }
    if (C.cancel.includes(e.code)) E.cancel = true;
    if (C.item.includes(e.code)) latch[dev].item = true;
    if (C.drift.includes(e.code)) latch[dev].drift = true;
  }
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
addEventListener('pointerdown', e => { if (e.pointerType === 'touch') lastDevice = 'touch0'; }, true);
const down = list => { for (const c of list) if (keys.has(c)) return true; return false; };

// ---------- gamepads ----------
export const pads = []; // per index: { buttons: bool[], axes: number[], connected, raw }
const repeatAt = [0, 0, 0, 0];
export const onPad = { connect: null, disconnect: null };
addEventListener('gamepadconnected', e => onPad.connect?.(e.gamepad.index));
addEventListener('gamepaddisconnected', e => { pads[e.gamepad.index] = null; onPad.disconnect?.(e.gamepad.index); });
// call once per frame: snapshots every pad and fills the menu edges (D-pad / left stick with key-repeat)
export function poll(now) {
  const list = navigator.getGamepads?.() || [];
  for (let i = 0; i < 4; i++) {
    const g = list[i], E = edges['pad' + i];
    if (!g || !g.connected) { pads[i] = null; continue; }
    const prev = pads[i]?.buttons || [];
    const b = g.buttons.map(x => x.pressed);
    pads[i] = { buttons: b, axes: g.axes, raw: g };
    const edge = n => b[n] && !prev[n];
    if (b.some(Boolean)) lastDevice = 'pad' + i;
    E.confirm ||= edge(0); E.cancel ||= edge(1); E.start ||= edge(9);
    const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
    const dx = b[14] ? -1 : b[15] ? 1 : Math.abs(ax) > 0.5 ? Math.sign(ax) : 0;
    const dy = b[12] ? -1 : b[13] ? 1 : Math.abs(ay) > 0.5 ? Math.sign(ay) : 0;
    if ((dx || dy) && now > repeatAt[i]) {
      repeatAt[i] = now + (repeatAt[i] ? 170 : 360);
      if (dx < 0) E.left = true; if (dx > 0) E.right = true; if (dy < 0) E.up = true; if (dy > 0) E.down = true;
    } else if (!dx && !dy) repeatAt[i] = 0;
  }
}
export const edgesOf = dev => edges[dev] || EDGE();
export function clearEdges() { for (const E of Object.values(edges)) for (const k in E) E[k] = false; }
export const anyPadButton = () => pads.some(p => p?.buttons.some(Boolean));
export function rumble(dev, strength = 0.6, ms = 140) {
  if (dev?.startsWith('pad')) pads[+dev[3]]?.raw.vibrationActuator?.playEffect?.('dual-rumble', { duration: ms, strongMagnitude: strength, weakMagnitude: strength * 0.6 }).catch?.(() => {});
  else if (dev?.startsWith('touch')) navigator.vibrate?.(Math.round(ms / 4));
}

// ---------- touch: floating joystick on the left + Drift / Item / Brake buttons inside each touch player's view ----------
// Touches are routed to the view they start in, because each view carries its own control layer. The stick jumps under
// the thumb wherever it lands in the left zone (its ring kept clear of the notch and the home bar), trails the thumb
// past its rim so reversing from full lock never takes more than one radius, and steers by its x offset.
const STICK_DEAD = 0.06;
class TouchPad {
  constructor() { this.held = { drift: false, brake: false, item: false }; this.tap = { drift: false, item: false }; this.release(); }
  // let go of everything: a finger lifted while the pause modal is up never reaches its control
  release() {
    this.steer = 0; this.id = -1;
    for (const k in this.held) this.held[k] = false;
    this.tap.drift = this.tap.item = false;
    this.el?.querySelectorAll('.on').forEach(n => n.classList.remove('on'));
    if (this.el) this.stick.style.translate = this.knob.style.translate = '';
  }
  mount(el) {
    const zone = el.querySelector('.tz-steer'), stick = this.stick = el.querySelector('.tz-stick'), knob = this.knob = el.querySelector('.tz-knob');
    this.el = el; this.release();
    let zl = 0, zt = 0, x0 = 0, x1 = 0, y0 = 0, y1 = 0, ox = 0, oy = 0, rx = 0, ry = 0, R = 1; // zone origin, base clamp box, finger origin, rest centre, rim
    const place = () => { stick.style.translate = `${Math.max(x0, Math.min(x1, ox)) - rx}px ${Math.max(y0, Math.min(y1, oy)) - ry}px`; };
    const move = e => {
      if (e.pointerId !== this.id) return;
      let dx = e.clientX - zl - ox, dy = e.clientY - zt - oy;
      const m = Math.hypot(dx, dy);
      if (m > R) { const f = 1 - R / m; ox += dx * f; oy += dy * f; dx -= dx * f; dy -= dy * f; place(); }
      const x = dx / R;
      this.steer = Math.abs(x) < STICK_DEAD ? 0 : (x - Math.sign(x) * STICK_DEAD) / (1 - STICK_DEAD);
      knob.style.translate = `${dx}px ${dy}px`;
    };
    zone.addEventListener('pointerdown', e => {
      if (this.id >= 0) return;
      this.id = e.pointerId; zone.setPointerCapture(e.pointerId);
      const z = zone.getBoundingClientRect(), cs = getComputedStyle(zone); // layout reads on touch-down only
      R = stick.offsetWidth / 2 || 50; rx = stick.offsetLeft + R; ry = stick.offsetTop + R;
      zl = z.left; zt = z.top; ox = e.clientX - zl; oy = e.clientY - zt;
      x0 = parseFloat(cs.paddingLeft) + R; x1 = Math.max(x0, z.width - R); y0 = R; y1 = Math.max(y0, z.height - parseFloat(cs.paddingBottom) - R);
      place(); stick.classList.add('on');
      move(e);
    });
    zone.addEventListener('pointermove', move);
    const up = e => { if (e.pointerId === this.id) { this.id = -1; this.steer = 0; stick.classList.remove('on'); stick.style.translate = knob.style.translate = ''; } };
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) zone.addEventListener(t, up);
    for (const key of ['drift', 'brake', 'item']) {
      const b = el.querySelector('.tz-' + key);
      // tap latches like the keyboard's: a press and lift between two frames still counts
      b.addEventListener('pointerdown', e => { this.held[key] = true; if (key in this.tap) this.tap[key] = true; b.setPointerCapture(e.pointerId); b.classList.add('on'); });
      const off = () => { this.held[key] = false; b.classList.remove('on'); };
      for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(t, off);
    }
  }
}
export const touch = [new TouchPad(), new TouchPad()];

// ---------- tilt steering (optional, Settings): gravity along the phone's long axis ----------
// ponytail: raw accelerationIncludingGravity.y, sign checked on Android only; flip it here if iOS steers mirrored
let tiltG = 0, tiltHooked = false;
export let tiltOn = false;
// resolves to the new state. iOS asks for motion permission and only answers inside a tap (pointerup / click)
export async function enableTilt(on) {
  tiltOn = false;
  if (!on) return false;
  try { if (typeof window.DeviceMotionEvent?.requestPermission === 'function' && await DeviceMotionEvent.requestPermission() !== 'granted') return false; } catch { return false; }
  if (!tiltHooked) {
    tiltHooked = true;
    addEventListener('devicemotion', e => {
      const g = e.accelerationIncludingGravity, a = screen.orientation?.angle ?? (window.orientation + 360) % 360; // old iOS: window.orientation
      if (g) tiltG = (a === 270 ? -1 : 1) * (g.y || 0);
    });
  }
  return (tiltOn = true);
}

export const newIntent = () => ({ steer: 0, throttle: 0, brake: 0, drift: false, item: false, back: false, _item: false });

// keyboard steering ramps in (digital keys would otherwise snap the wheel), springs back faster
const RAMP = 5, RETURN = 9, DEAD = 0.18;
// read one device into o. kbShare: the other keyboard cluster has no player, so this one may use it too
export function read(dev, o, dt, kbShare = false) {
  let target = 0, thr = 0, brk = 0, dr = false, it = false, bk = false, analog = false;
  if (dev === 'kb0' || dev === 'kb1') {
    const list = kbShare ? ['kb0', 'kb1'] : [dev];
    for (const d of list) {
      const C = CLUSTERS[d];
      target += (down(C.right) ? 1 : 0) - (down(C.left) ? 1 : 0);
      if (down(C.up)) thr = 1; if (down(C.down)) brk = 1;
      dr ||= down(C.drift) || latch[d].drift; it ||= down(C.item) || latch[d].item; bk ||= down(C.back);
      latch[d].item = latch[d].drift = false;
    }
    target = Math.max(-1, Math.min(1, target));
  } else if (dev?.startsWith('pad')) {
    const p = pads[+dev[3]];
    if (p) {
      const b = p.buttons, ax = p.axes[0] || 0, ay = p.axes[1] || 0, mag = Math.hypot(ax, ay);
      // radial deadzone, rescaled so steering starts at 0 just outside it
      target = mag > DEAD ? ax / mag * Math.min(1, (mag - DEAD) / (1 - DEAD)) : 0;
      if (b[14]) target = -1; if (b[15]) target = 1;
      analog = !b[14] && !b[15];
      thr = b[0] || b[7] ? 1 : (p.raw.buttons[7]?.value || 0);
      brk = b[1] || b[6] ? 1 : (p.raw.buttons[6]?.value || 0);
      dr = b[4] || b[5]; it = b[2]; bk = b[3];
    }
  } else if (dev?.startsWith('touch')) {
    const t = touch[+dev[5]], h = t.held;
    target = tiltOn && t.id < 0 ? Math.max(-1, Math.min(1, tiltG / 4.5)) : t.steer; // a thumb on the stick overrides tilt
    analog = true; brk = h.brake ? 1 : 0; thr = 1 - brk; dr = h.drift || t.tap.drift; it = h.item || t.tap.item; // no gas button: touch accelerates unless braking
    t.tap.drift = t.tap.item = false;
  }
  if (analog) o.steer = target;
  else {
    const rate = target === 0 || Math.sign(target) !== Math.sign(o.steer) ? RETURN : RAMP;
    o.steer += Math.max(-rate * dt, Math.min(rate * dt, target - o.steer));
  }
  o.throttle = thr; o.brake = brk; o.drift = dr; o.back = bk;
  o.item = it && !o._item; o._item = it;
  return o;
}
