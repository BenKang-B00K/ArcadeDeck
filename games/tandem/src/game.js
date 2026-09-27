import { LEVELS } from './levels.js';

// Tuning: solo jump clears 2 tiles, jump from partner's head clears 3.
const GRAV = 32, JUMP_V = 12.65, RUN = 6, ACC_GROUND = 70, ACC_AIR = 45;
const FALL_MAX = 18, COYOTE = 0.1, JUMP_BUFFER = 0.12, EXIT_HOLD = 0.35, DEATH_TIME = 1;
export const PW = 0.7, PH = 0.9;
const E = 1e-6;
const DOOR = 'ABCD', BRIDGE = 'WXYZ', PLATE = 'abcd';
// Hazards: saw drones patrol and bounce; cannons fire bolts on a fixed rhythm.
const DRONE_V = 3, DRONE_R = 0.3, BOLT_V = 6, BOLT_R = 0.18, CANNON_PERIOD = 2.4;

// E margin: boxes that merely touch (within float error) don't overlap
const overlap = (l1, b1, r1, t1, l2, b2, r2, t2) => l1 < r2 - E && r1 > l2 + E && b1 < t2 - E && t1 > b2 + E;
const hits = (p, x, y, w, h) => overlap(p.x - PW / 2, p.y, p.x + PW / 2, p.y + PH, x, y, x + w, y + h);
// circle vs player box, shrunk a little so grazes feel fair
const hitsCircle = (p, cx, cy, r) => {
  const nx = Math.max(p.x - PW / 2 + 0.08, Math.min(cx, p.x + PW / 2 - 0.08));
  const ny = Math.max(p.y + 0.08, Math.min(cy, p.y + PH - 0.08));
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
};

export class Game {
  constructor(emit) { this.emit = emit; }

  load(index) {
    const rows = LEVELS[index].map;
    const h = rows.length, w = rows[0].length;
    Object.assign(this, {
      index, w, h, cells: new Array(w * h),
      plates: [], dyn: [], gems: [], spikes: [], exits: [], dynAt: new Map(), drones: [], cannons: [], bolts: [],
      active: { a: false, b: false, c: false, d: false },
      state: 'play', timer: 0, exitTimer: 0, gemsTaken: 0, waiting: false, time: 0,
    });
    const spawns = [];
    rows.forEach((row, r) => [...row].forEach((c, x) => {
      const y = h - 1 - r; // y up
      this.cells[y * w + x] = c;
      if (c === '1' || c === '2') spawns[+c - 1] = { x: x + 0.5, y };
      else if (PLATE.includes(c)) this.plates.push({ x, y, ch: c, on: false });
      else if (c === '*') this.gems.push({ x, y, taken: false });
      else if (c === '^') this.spikes.push({ x, y });
      else if (c === 'E') this.exits.push({ x, y });
      else if (c === 'o' || c === 'v') {
        this.cells[y * w + x] = '.';
        this.drones.push({ x: x + 0.5, y: y + 0.5, vx: c === 'o' ? DRONE_V : 0, vy: c === 'v' ? DRONE_V : 0 });
      } else if (c === '<' || c === '>') {
        const n = this.cannons.length;
        this.cannons.push({ x, y, dir: c === '>' ? 1 : -1, t: 0.6 + (n * 0.9) % CANNON_PERIOD });
      }
      else if (DOOR.includes(c) || BRIDGE.includes(c)) {
        const door = DOOR.includes(c);
        const d = { x, y, door, ch: PLATE[(door ? DOOR : BRIDGE).indexOf(c)], solid: door };
        this.dyn.push(d);
        this.dynAt.set(y * w + x, d);
      }
    }));
    this.players = spawns.map((s, id) => ({
      id, x: s.x, y: s.y, vx: 0, vy: 0, dx: 0, grounded: false, on: null,
      coyote: 0, jumpBuf: 0, facing: id ? -1 : 1, inExit: false,
    }));
  }

  cell(x, y) {
    return x < 0 || y < 0 || x >= this.w || y >= this.h ? '#' : this.cells[y * this.w + x];
  }

  solid(x, y, pid) {
    const c = this.cell(x, y);
    if (c === '#' || c === '<' || c === '>') return true;
    if (c === 'R') return pid === 1;
    if (c === 'U') return pid === 0;
    const d = this.dynAt.get(y * this.w + x);
    return d ? d.solid : false;
  }

  // what stops drones and bolts: walls, cannons, closed doors, bridges, barriers, rail stops
  blocks(x, y) {
    const c = this.cell(x, y);
    if ('#<>RU:'.includes(c)) return true; // ':' = rail stop, invisible wall for hazards only
    const d = this.dynAt.get(y * this.w + x);
    return d ? d.solid : false;
  }

  stepHazards(dt) {
    for (const d of this.drones) {
      if (d.vx) {
        const nx = d.x + d.vx * dt;
        if (this.blocks(Math.floor(nx + Math.sign(d.vx) * DRONE_R), Math.floor(d.y))) d.vx = -d.vx; else d.x = nx;
      }
      if (d.vy) {
        const ny = d.y + d.vy * dt;
        if (this.blocks(Math.floor(d.x), Math.floor(ny + Math.sign(d.vy) * DRONE_R))) d.vy = -d.vy; else d.y = ny;
      }
    }
    for (const c of this.cannons) {
      if ((c.t -= dt) > 0) continue;
      c.t += CANNON_PERIOD;
      this.bolts.push({ x: c.x + 0.5 + c.dir * 0.6, y: c.y + 0.45, vx: c.dir * BOLT_V });
      this.emit('shoot', c);
    }
    this.bolts = this.bolts.filter(b => {
      b.x += b.vx * dt;
      return !this.blocks(Math.floor(b.x), Math.floor(b.y));
    });
  }

  jump(pid) { if (this.state === 'play') this.players[pid].jumpBuf = JUMP_BUFFER; }

  step(dt, inputs) {
    if (this.state === 'dead') {
      if ((this.timer -= dt) <= 0) { this.load(this.index); this.emit('restart'); }
      return;
    }
    if (this.state !== 'play') return;
    this.time += dt; // stage clock: sim time only, so pauses don't count
    const P = this.players;

    for (const pl of this.plates) {
      const on = P.some(p => hits(p, pl.x + 0.1, pl.y, 0.8, 0.3));
      if (on !== pl.on) { pl.on = on; this.emit('plate', pl); }
    }
    for (const ch of PLATE) this.active[ch] = this.plates.some(pl => pl.ch === ch && pl.on);
    for (const d of this.dyn) {
      const want = d.door ? !this.active[d.ch] : this.active[d.ch];
      // never materialise a tile inside a player
      if (want && !d.solid) d.solid = !P.some(p => hits(p, d.x, d.y, 1, 1));
      else if (!want) d.solid = false;
    }

    this.stepHazards(dt);
    P.forEach((p, i) => this.stepPlayer(p, inputs[i], P[1 - i], dt));

    for (const p of P) {
      if (this.spikes.some(s => hits(p, s.x + 0.1, s.y, 0.8, 0.45))
        || this.drones.some(d => hitsCircle(p, d.x, d.y, DRONE_R))
        || this.bolts.some(b => hitsCircle(p, b.x, b.y, BOLT_R))) return this.die(p);
      for (const g of this.gems) {
        if (!g.taken && hits(p, g.x + 0.2, g.y + 0.2, 0.6, 0.6)) {
          g.taken = true; this.gemsTaken++; this.emit('gem', g);
        }
      }
      p.inExit = this.exits.some(e => p.x > e.x && p.x < e.x + 1 && p.y < e.y + 1 && p.y + PH > e.y);
    }
    const n = P.filter(p => p.inExit).length;
    if (n === 1 && !this.waiting) this.emit('waiting');
    this.waiting = n === 1;
    this.exitTimer = n === 2 ? this.exitTimer + dt : 0;
    if (this.exitTimer >= EXIT_HOLD) { this.state = 'clear'; this.emit('clear'); }
  }

  die(p) {
    this.state = 'dead';
    this.timer = DEATH_TIME;
    p.dead = true;
    this.emit('die', p);
  }

  stepPlayer(p, inp, other, dt) {
    const target = inp.x * RUN, acc = (p.grounded ? ACC_GROUND : ACC_AIR) * dt;
    p.vx = p.vx < target ? Math.min(p.vx + acc, target) : Math.max(p.vx - acc, target);
    if (inp.x) p.facing = Math.sign(inp.x);
    p.coyote = p.grounded ? COYOTE : p.coyote - dt;
    p.jumpBuf -= dt;
    if (p.jumpBuf > 0 && p.coyote > 0) {
      p.vy = JUMP_V; p.jumpBuf = 0; p.coyote = 0;
      this.emit('jump', p);
    }
    // short hop when jump released early
    p.vy = Math.max(p.vy - (p.vy > 0 && !inp.jump ? GRAV * 2.2 : GRAV) * dt, -FALL_MAX);

    const x0 = p.x, carry = p.on ? p.on.dx : 0, wasGrounded = p.grounded, vy = p.vy;
    this.moveX(p, p.vx * dt + carry, other);
    this.moveY(p, p.vy * dt, other);
    p.dx = p.x - x0;
    if (!wasGrounded && p.grounded && vy < -4) this.emit('land', { p, v: -vy });
  }

  // Steps are < 1 tile, so only the leading column/row needs checking.
  moveX(p, dx, o) {
    if (!dx) return;
    p.x += dx;
    const y0 = Math.floor(p.y + E), y1 = Math.floor(p.y + PH - E);
    const tx = Math.floor(dx > 0 ? p.x + PW / 2 - E : p.x - PW / 2 + E);
    for (let y = y0; y <= y1; y++) {
      if (this.solid(tx, y, p.id)) {
        p.x = dx > 0 ? tx - PW / 2 : tx + 1 + PW / 2;
        p.vx = 0;
        break;
      }
    }
    if (!o.dead && hits(p, o.x - PW / 2, o.y, PW, PH)) {
      p.x = o.x + (dx > 0 ? -PW : PW);
      p.vx = 0;
    }
  }

  moveY(p, dy, o) {
    p.y += dy;
    p.grounded = false;
    p.on = null;
    const x0 = Math.floor(p.x - PW / 2 + E), x1 = Math.floor(p.x + PW / 2 - E);
    const ty = Math.floor(dy < 0 ? p.y : p.y + PH - E);
    for (let x = x0; x <= x1; x++) {
      if (this.solid(x, ty, p.id)) {
        if (dy < 0) { p.y = ty + 1; p.grounded = true; } else p.y = ty - PH;
        p.vy = 0;
        break;
      }
    }
    if (!o.dead && hits(p, o.x - PW / 2, o.y, PW, PH)) {
      if (dy < 0) { p.y = o.y + PH; p.grounded = true; p.on = o; } else p.y = o.y - PH;
      p.vy = 0;
    }
  }
}
