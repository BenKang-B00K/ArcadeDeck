import * as THREE from 'three';
import { toon, box, cyl, part, cached, CYAN } from './toon.js';
import { tween, ease, lerp, beam, ring, lightFlash, flash, burst, makeTrail } from './vfx.js';
import { emit } from './particles.js';

// tier look: hat / vest / glow strength. Tier n is worth 10^(n-1) base workers.
export const TIERS = [
  { hat: 0xffc21a, vest: 0xff6a00, glow: 2.2 },
  { hat: 0xe8eef5, vest: 0x2f6fd8, glow: 3 },
  { hat: 0xffd700, vest: 0x1b1f2e, glow: 4 },
  { hat: 0x2ef2ff, vest: 0x7a2bd8, glow: 5 },
  { hat: 0xff3b6b, vest: 0x0a0a0a, glow: 6 },
];
// materials per worker so the flash uniform is local to it (shader program is still shared)
const mats = (f, T) => ({
  skin: toon(0xffd7a8, 0, 1, f), hat: toon(T.hat, 0, 1, f), vest: toon(T.vest, 0, 1, f), pants: toon(0x2c3e75, 0, 1, f), boot: toon(0x2a1c14, 0, 1, f),
  handle: toon(0x2b2f3d, 0, 1, f), steel: toon(0x5c6478, 0, 1, f),
  glow: toon(0x0a2a33, CYAN, T.glow, f), // visor + vest stripes
  core: toon(0x0a2a33, CYAN, 2, f),      // hammer core, intensity animated
});
const HIP = 0.22;
export const SCALE = 0.6;          // world scale of the chibi (~0.5 tall)
export const REACH = 0.56 * SCALE; // hammer head z-offset from feet at impact

// chibi worker, ~0.85 tall unscaled, faces +z. Rig: legs pivot hip, arms pivot shoulder, torso at hip (lean), hammer at hand (wrist)
export function makeWorker(flash = { value: 0 }, tier = 1) {
  const root = new THREE.Group();
  const M = mats(flash, TIERS[Math.min(tier, TIERS.length) - 1]);

  const mkLeg = x => {
    const g = new THREE.Group(); g.position.set(x, HIP, 0);
    const leg = box(0.13, 0.2, 0.13, M.pants); leg.position.y = -0.1; g.add(leg);
    const boot = box(0.15, 0.07, 0.18, M.boot); boot.position.set(0, -0.2, 0.02); g.add(boot);
    return g;
  };
  const legL = mkLeg(-0.09), legR = mkLeg(0.09);
  root.add(legL, legR);

  const torso = new THREE.Group(); torso.position.y = HIP; root.add(torso);
  const body = box(0.42, 0.34, 0.3, M.vest); body.position.y = 0.17; torso.add(body);
  for (const z of [0.155, -0.155]) { const s = box(0.43, 0.05, 0.015, M.glow, false); s.position.set(0, 0.2, z); torso.add(s); }

  const head = box(0.5, 0.44, 0.46, M.skin); head.position.y = 0.58; torso.add(head);
  const goggle = box(0.44, 0.15, 0.03, M.boot, false); goggle.position.set(0, 0.6, 0.235); torso.add(goggle); // dark frame
  const visor = box(0.36, 0.1, 0.02, M.glow, false); visor.position.set(0, 0.6, 0.255); torso.add(visor);
  const dome = part(cached('dome', () => new THREE.SphereGeometry(0.29, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), M.hat); dome.position.y = 0.8; torso.add(dome);
  const brim = cyl(0.36, 0.05, M.hat); brim.position.y = 0.8; torso.add(brim);

  const mkArm = x => {
    const g = new THREE.Group(); g.position.set(x, 0.3, 0);
    const a = box(0.12, 0.24, 0.12, M.vest); a.position.y = -0.12; g.add(a);
    const hand = box(0.13, 0.1, 0.13, M.skin); hand.position.y = -0.26; g.add(hand);
    return g;
  };
  const armL = mkArm(-0.31), armR = mkArm(0.31);
  torso.add(armL, armR);

  // energy hammer: handle along arm-local +z, glowing core through the head
  const hammer = new THREE.Group(); hammer.position.y = -0.26; armR.add(hammer);
  const handle = cyl(0.025, 0.32, M.handle); handle.rotation.x = Math.PI / 2; handle.position.z = 0.11; hammer.add(handle);
  const hhead = box(0.14, 0.14, 0.2, M.steel); hhead.position.z = 0.28; hammer.add(hhead);
  const coreMesh = box(0.15, 0.06, 0.22, M.core, false); coreMesh.position.z = 0.28; hammer.add(coreMesh);

  return { root, legL, legR, armL, armR, torso, hammer, hhead, hand: armR.children[1], core: M.core, mats: M };
}

const SWING_T = 0.5;
const tmp = new THREE.Vector3(), pA = new THREE.Vector3(), pB = new THREE.Vector3(), vel = new THREE.Vector3(), HAT = new THREE.Color();

// states: idle → walk → lift → swing → leave
export class Worker {
  constructor(parent, { speed = 1.6, onHit, floorY = () => 0, aim = null, tier = 1, worth = 10 ** (tier - 1) } = {}) {
    this.aim = aim;
    this.flash = { value: 0 };
    this.w = makeWorker(this.flash, tier); this.parent = parent; parent.add(this.w.root);
    this.trail = makeTrail();
    Object.assign(this, { speed, onHit, floorY, tier });
    this.scale = SCALE * (1 + 0.3 * (tier - 1)); // higher tier = bigger
    this.worth = worth;
    this.dead = false; this.trailLive = false;
    this.set('idle');
  }
  set(state) {
    this.state = state; this.t = 0; this.hitDone = false; this.trailOn = false;
  }
  spawnAt(pos) {
    const r = this.w.root; r.position.copy(pos); r.scale.setScalar(0.001);
    beam(pos);
    ring(new THREE.Vector3(pos.x, 0.01, pos.z), new THREE.Euler(-Math.PI / 2, 0, 0), 0.5, 0.5);
    tween(0.6, k => r.scale.setScalar(this.scale * ease.elastic(k)));
    flash(this.flash, 1, 0.35);
    lightFlash(new THREE.Vector3(pos.x, 0.4, pos.z), 6, 0.4);
    // particles: embers rise up the beam, dust kicks at the feet, hat-colour sparks fan out low
    for (let i = 0; i < 6; i++) emit.ember(tmp.set(pos.x + (Math.random() - 0.5) * 0.3, 0.05, pos.z + (Math.random() - 0.5) * 0.3), 1, { vel: vel.set(0, 1.2 + Math.random() * 1.3, 0), life: 0.7, size: 0.03 });
    emit.dust(tmp.set(pos.x, 0.05, pos.z), 5, { speed: 0.7 });
    emit.spark(tmp, 6 + 3 * this.tier, { dir: vel.set(0, 0.3, 0), speed: 2, color: HAT.set(TIERS[Math.min(this.tier, TIERS.length) - 1].hat).multiplyScalar(2.5), life: 0.35 });
    return this;
  }
  goTo(target, face = 0) { this.target = target.clone(); this.face = face; this.set('walk'); return this; }
  leave() {
    if (this.state === 'leave' || this.dead) return;
    this.set('leave');
    const r = this.w.root; beam(r.position, 0.35);
    tween(0.25, k => r.scale.setScalar(this.scale * (1 - ease.in(k))), () => this.dispose());
  }
  dispose() { this.parent.remove(this.w.root); this.trail.dispose(); Object.values(this.w.mats).forEach(m => m.dispose()); this.dead = true; }
  hit() {
    this.w.hhead.getWorldPosition(tmp);
    const ev = this.onHit?.(tmp, this.worth) ?? {};
    burst(tmp, ev.level ?? 0, { flash: this.flash, color: ev.color, feet: this.w.root.position, mult: 1 + 0.35 * (this.tier - 1) });
  }

  update(dt) {
    this.t += dt;
    const r = this.w.root;
    if (this.target && this.state !== 'leave') { const a = this.aim?.(); if (a) { this.target.copy(a.at); this.face = a.face; } }
    if (this.state === 'walk') {
      const d = tmp.subVectors(this.target, r.position); d.y = 0; const dist = d.length();
      if (dist < 0.03) { r.position.x = this.target.x; r.position.z = this.target.z; r.rotation.y = this.face; this.set('lift'); }
      else { r.position.addScaledVector(d.normalize(), Math.min(dist, this.speed * dt)); r.rotation.y = Math.atan2(d.x, d.z); }
    }
    if (this.state === 'lift' || this.state === 'swing') { // ride scaffold to current floor, keep following it
      const fy = this.floorY(), k = Math.min(1, 6 * dt); r.position.y += (fy - r.position.y) * k;
      r.position.x += (this.target.x - r.position.x) * k; r.position.z += (this.target.z - r.position.z) * k; r.rotation.y = this.face;
      if (this.state === 'lift' && Math.abs(fy - r.position.y) < 0.01) this.set('swing');
    }
    this.pose(dt);
  }

  pose(dt) {
    const { legL, legR, armL, armR, torso, hammer, core, hhead, hand } = this.w;
    const t = this.t, s = this.state;
    let lL = 0, lR = 0, aL = 0, aR = 0, lean = 0, bob = 0, wrist = 0;
    let coreI = 2 + Math.sin(t * 5) * 0.5, hScale = 1, phase = '';

    if (s === 'idle' || s === 'lift' || s === 'leave') {
      bob = Math.sin(t * 2) * 0.008;
      aL = aR = Math.sin(t * 2) * 0.05;
    }
    if (s === 'walk') {
      const w = Math.sin(t * 10);
      lL = w * 0.7; lR = -w * 0.7;
      aL = -w * 0.5; aR = w * 0.5;
      bob = Math.abs(Math.cos(t * 10)) * 0.03;
      lean = 0.08;
    }
    if (s === 'swing') {
      const p = (t % SWING_T) / SWING_T;
      // arm angle + wrist angle per keyframe: wrist flicks hammer over the top on slam
      const UP = -2.3, DOWN = -1.35, REST = -0.3;
      const UP_W = 0.5, DOWN_W = 1.55, REST_W = 0;
      if (p < 0.45) {        // wind-up + charge
        const k = ease.out(p / 0.45);
        aR = lerp(REST, UP, k); wrist = lerp(REST_W, UP_W, k); lean = lerp(0, -0.12, k);
        coreI = lerp(2, 7, k); hScale = lerp(1, 1.15, k); phase = 'charge';
      } else if (p < 0.65) { // slam + trail
        const k = ease.in((p - 0.45) / 0.2);
        aR = lerp(UP, DOWN, k); wrist = lerp(UP_W, DOWN_W, k); lean = lerp(-0.12, 0.2, k);
        coreI = 7; hScale = 1.15; phase = 'slam';
        if (!this.trailOn) { this.trailOn = true; this.trail.alpha(1); }
      } else if (p < 0.75) { // impact hold
        aR = DOWN; wrist = DOWN_W; lean = 0.2; coreI = 10; hScale = 1.15;
        if (!this.hitDone) { this.hitDone = true; this.hit(); }
      } else {               // recover
        const k = ease.io((p - 0.75) / 0.25);
        aR = lerp(DOWN, REST, k); wrist = lerp(DOWN_W, REST_W, k); lean = lerp(0.2, 0, k);
        coreI = lerp(10, 2, k); hScale = lerp(1.15, 1, k);
        this.trailOn = false; this.trail.alpha(1 - k);
      }
      aL = -aR * 0.15;
      lL = 0.12; lR = -0.12;
      if (t >= SWING_T) { this.leave(); return; }
    }

    legL.rotation.x = lL; legR.rotation.x = lR;
    armL.rotation.x = aL; armR.rotation.x = aR;
    hammer.rotation.x = wrist; hammer.scale.setScalar(hScale);
    torso.rotation.x = lean; torso.position.y = HIP + bob;
    core.emissiveIntensity = coreI;

    this.w.root.updateMatrixWorld();
    if (dt > 0 && phase) {
      hhead.getWorldPosition(pA);
      if (phase === 'charge') { // embers converge onto the core: spawn on a sphere, fly to centre, die on arrival
        for (let i = 0; i < 2; i++) {
          const r = 0.35 * SCALE, sp = 1.5;
          vel.set(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize();
          pB.copy(pA).addScaledVector(vel, r); vel.multiplyScalar(-sp);
          emit.ember(pB, 1, { vel, life: r / sp, size: 0.025 });
        }
      } else emit.spark(pA, 3, { speed: 0.8, life: 0.2 }); // slam drip
    }
    if (this.trailOn && dt > 0) { hhead.getWorldPosition(pA); hand.getWorldPosition(pB); this.trail.push(pA, pB, !this.trailLive); this.trailLive = true; }
    else if (!this.trailOn) this.trailLive = false;
  }
}
