import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, nameTag, part, makeRunner, animRunner, placeRunner } from './stage.js';

// Crowd Cover (online only): every player is secretly one of ~35 identical people wandering a plaza; only your own
// phone marks which one is you. Touch all 4 statues to win the round, but every touch chimes and flashes the statue,
// so rivals watch who was standing there. Your progress pips light up 3 s after a touch (the 4th, the win, at once).
// Punch (Action) whoever is in front of you: a rival is out; a bystander drops and YOU glow for 2 s (3 s punch cooldown).
// The fountain in the middle is a watchtower: from the moment you step in, any rival who touches a statue is revealed
// to you (your phone only; they aren't told). Stay in more than 3 s and you glow for everyone until you step out.
// Hold left / right to turn (at the crowd's own top turn rate), both together to stand still.
// Last one standing or first to 4 statues takes the round; first to 2 rounds wins.
// Host-authoritative: guests send held inputs + punches; the host streams the crowd at 12 Hz. On one shared screen
// everyone would see whose figure moves with which keys, so main.js only offers it online.
const PX = 16, PZ = 10, RCAP = 90, SPD = 1.8, SLOW = .92, TURN = 2, TOUCH = 1.2, REACH = 1.35, PIP_DELAY = 3, EXPOSE = 3, WINS = 2, MAX_ROUNDS = 3, STEP = 1 / 60;
// SLOW: each statue touched this round multiplies that player's walk speed (3 touches = x0.78), a tell rivals can read
const STAT = [[-11, -6.2], [11, -6.2], [-11, 6.2], [11, 6.2]], FR = [2.9, 2.2]; // fountain ellipse radii (x, z)
const ST = ['count', 'play', 'end', 'done'];
const inF = w => (w.x / FR[0]) ** 2 + (w.z / FR[1]) ** 2 < 1;
const FC = .85; // the fountain's centre pedestal is solid (its lower bowl would clip through heads)

// cute chibi: big round head in a bear-ear beanie, round hoodie body, stubby arms and feet; faces -z.
// c = { hood, skin, ink, blush, feet, pocket }. Crowd figures and the gold statues share it.
const sph = (r, w = 14, h = 10) => new THREE.SphereGeometry(r, w, h);
const chibi = (c, wave = false) => mergeGeometries([
  part(new THREE.CapsuleGeometry(.27, .32, 4, 14), c.hood, [0, .5, 0], [1, 1, .9]),           // round hoodie body
  part(sph(.1, 10, 8), c.pocket, [0, .56, -.24], [1.4, 1, .5]),                                // tummy pocket
  part(new THREE.CapsuleGeometry(.07, .16, 3, 8).rotateZ(.35), c.hood, [-.29, .52, 0]),       // stubby arms (one waves on statues)
  wave ? part(new THREE.CapsuleGeometry(.07, .2, 3, 8).rotateZ(-2.5), c.hood, [.33, .78, 0]) : part(new THREE.CapsuleGeometry(.07, .16, 3, 8).rotateZ(-.35), c.hood, [.29, .52, 0]),
  part(sph(.1, 10, 8), c.feet, [-.12, .07, -.04], [1, .7, 1.3]),                              // feet
  part(sph(.1, 10, 8), c.feet, [.12, .07, -.04], [1, .7, 1.3]),
  part(sph(.34, 20, 14), c.skin, [0, 1.2, 0]),                                                  // big head
  part(new THREE.SphereGeometry(.355, 20, 8, 0, Math.PI * 2, 0, Math.PI * .42), c.hood, [0, 1.22, .02]), // beanie
  part(sph(.1, 10, 8), c.hood, [-.22, 1.5, .02], [1, 1, .6]), part(sph(.1, 10, 8), c.hood, [.22, 1.5, .02], [1, 1, .6]), // bear ears
  part(sph(.05, 8, 6), c.blush, [-.22, 1.5, -.035], [1, 1, .4]), part(sph(.05, 8, 6), c.blush, [.22, 1.5, -.035], [1, 1, .4]),
  // face (front is -z, so it also shows which way a figure faces): dot eyes with glints, blush, tiny smile
  part(sph(.05, 10, 8), c.ink, [-.11, 1.2, -.305], [1, 1.2, .6]), part(sph(.05, 10, 8), c.ink, [.11, 1.2, -.305], [1, 1.2, .6]),
  part(sph(.016, 6, 4), c.pocket, [-.095, 1.22, -.33]), part(sph(.016, 6, 4), c.pocket, [.125, 1.22, -.33]),
  part(sph(.055, 10, 6), c.blush, [-.19, 1.12, -.26], [1, .55, .4]), part(sph(.055, 10, 6), c.blush, [.19, 1.12, -.26], [1, .55, .4]),
  part(new THREE.TorusGeometry(.035, .01, 4, 10, Math.PI).rotateZ(Math.PI), c.ink, [0, 1.11, -.325]),
]);

// one floating emblem per statue, so players can name them ("the heart one"): star, heart, moon, gem
const EMB = [0xffd23f, 0xff6b9a, 0x8fd8ff, 0x5cf2b0];
const extrude = sh => new THREE.ExtrudeGeometry(sh, { depth: .08, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 2 }).center();
function emblemGeo(k) {
  const s = new THREE.Shape();
  if (k === 0) { for (let i = 0; i < 10; i++) { const r = i % 2 ? .14 : .32, a = Math.PI / 2 + i * Math.PI / 5; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return extrude(s); }
  if (k === 1) { s.moveTo(0, -.3); s.bezierCurveTo(-.08, -.2, -.34, -.06, -.3, .12); s.bezierCurveTo(-.26, .3, -.04, .32, 0, .16); s.bezierCurveTo(.04, .32, .26, .3, .3, .12); s.bezierCurveTo(.34, -.06, .08, -.2, 0, -.3); return extrude(s); }
  if (k === 2) return new THREE.TorusGeometry(.2, .11, 10, 24, Math.PI * 1.3).rotateZ(Math.PI * .35);
  return new THREE.OctahedronGeometry(.28).scale(.9, 1.3, .9);
}

export function createCrowd({ renderer, mode, n = 2, me = 0, bots = [], send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], NW = (n === 2 ? 29 : 35) + n;
  let auth = !online || me === 0;

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x141a34);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 50, 130);
  lights(scene);
  const sky = addSky(scene, fogC, 0x3a3a8c);
  addCity(scene, { y: -.2, n: 160, x0: -90, x1: 90, z0: 60, z1: -90, clear: (x, z) => Math.abs(x) < PX + 8 && Math.abs(z) < PZ + 8 });

  // ---- plaza: stone tiles, statues on plinths, fountain, lamps
  const stone = canvasTex(512, 512, (g, w) => {
    g.fillStyle = '#3a3a52'; g.fillRect(0, 0, w, w);
    for (let y = 0; y < w; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = (x + y) / 64 % 2 ? '#43435e' : '#3b3b55'; g.fillRect(x + 1, y + 1, 62, 62); }
  });
  stone.wrapS = stone.wrapT = THREE.RepeatWrapping; stone.repeat.set(PX / 2, PZ / 2);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(PX * 2 + 4, PZ * 2 + 4).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: stone, roughness: .75 }));
  scene.add(floor);
  const curb = new THREE.Mesh(new THREE.BoxGeometry(PX * 2 + 5, .3, PZ * 2 + 5), new THREE.MeshStandardMaterial({ color: 0x22223a }));
  curb.position.y = -.16; scene.add(curb);
  // statues: octagonal tiered plinth (fits the .75 m collider), a gold chibi waving on top, its own floating emblem and ground halo
  const goldMat = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: .45, roughness: .3, emissive: 0x6a4a10, emissiveIntensity: .4 });
  const plinthMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .55, metalness: .1 });
  const plinthGeo = mergeGeometries([
    part(new THREE.CylinderGeometry(.74, .74, .16, 8), 0x4e4e6c, [0, .08, 0]),
    part(new THREE.CylinderGeometry(.56, .6, .56, 8), 0x8a8aa8, [0, .44, 0]),
    part(new THREE.CylinderGeometry(.6, .6, .05, 8), 0xd4a53a, [0, .66, 0]),
    part(new THREE.CylinderGeometry(.7, .62, .14, 8), 0x9a9ab8, [0, .79, 0]),
  ]);
  const G = { hood: 0xe8b64a, skin: 0xf2cf6e, ink: 0x6a4410, blush: 0xffb070, feet: 0xc08a2a, pocket: 0xfff0b0 };
  const statueGeo = chibi(G, true).scale(1.15, 1.15, 1.15);
  const halo = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, w * .3, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.55, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const statues = STAT.map(([x, z], k) => {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    g.rotation.y = Math.atan2(x, z); // face the fountain (figures face -z)
    const fig = new THREE.Mesh(statueGeo, goldMat); fig.position.y = .86;
    const emat = new THREE.MeshStandardMaterial({ color: EMB[k], emissive: EMB[k], emissiveIntensity: .7, roughness: .25, metalness: .3 });
    const emb = new THREE.Mesh(emblemGeo(k), emat); emb.position.y = 3.15;
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: halo, color: EMB[k], transparent: true, opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    glow.position.y = .02;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, .06, 8, 40).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: EMB[k], transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    ring.position.y = .05;
    g.add(new THREE.Mesh(plinthGeo, plinthMat), fig, emb, glow, ring); scene.add(g);
    return { g, ring, emb, emat, glow, pulse: 0 };
  });

  // fountain = watchtower: shallow wading pool (the zone), glowing rim, tiered centre fountain with falling water, and a
  // lighthouse "watch eye" on top whose beam sweeps the plaza
  const fountain = new THREE.Group(); scene.add(fountain);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x9a9ab8, roughness: .5 });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .26, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0x8a8aa8, roughness: .55, side: THREE.DoubleSide }));
  wall.scale.set(FR[0], 1, FR[1]); wall.position.y = .13;
  const rimTop = new THREE.Mesh(new THREE.RingGeometry(.955, 1.06, 64).rotateX(-Math.PI / 2), rimMat);
  rimTop.scale.set(FR[0], 1, FR[1]); rimTop.position.y = .26;
  const zoneMat = new THREE.MeshBasicMaterial({ color: 0x5ce8ff, transparent: true, opacity: .8, toneMapped: false, depthWrite: false });
  const zone = new THREE.Mesh(new THREE.RingGeometry(.99, 1.015, 64).rotateX(-Math.PI / 2), zoneMat); // glowing line on the rim: the watch zone
  zone.scale.set(FR[0], 1, FR[1]); zone.position.y = .265;
  const ripple = canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#1d5d96'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 90; i++) { // soft caustic squiggles
      const x = Math.random() * w, y = Math.random() * w, r = 8 + Math.random() * 22;
      g.strokeStyle = `rgba(160, 230, 255, ${.12 + Math.random() * .22})`; g.lineWidth = 1.5 + Math.random() * 2;
      g.beginPath(); g.ellipse(x, y, r, r * .55, Math.random() * 3, 0, Math.PI * 1.3); g.stroke();
    }
  });
  ripple.wrapS = ripple.wrapT = THREE.RepeatWrapping; ripple.repeat.set(2, 1.5);
  const water = new THREE.Mesh(new THREE.CircleGeometry(1, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: ripple, roughness: .08, metalness: .2, emissive: 0x0a3a66, emissiveIntensity: .7, transparent: true, opacity: .88, depthWrite: false }));
  water.scale.set(FR[0] * .96, 1, FR[1] * .96); water.position.y = .05;
  // centre: pedestal, lower + upper bowls (lathe), finial with a glass eye under a little gold roof
  const bowl = (r, h) => new THREE.LatheGeometry([[.12, 0], [r * .55, h * .35], [r, h], [r * .96, h], [r * .5, h * .45], [0, h * .5]].map(([a, b]) => new THREE.Vector2(a, b)), 32);
  const center = new THREE.Mesh(mergeGeometries([
    part(new THREE.CylinderGeometry(.6, .7, .3, 16), 0x7a7a98, [0, .15, 0]),
    part(new THREE.CylinderGeometry(.2, .26, 1.1, 12), 0x9a9ab8, [0, .8, 0]),
    part(bowl(.8, .26), 0xa8a8c6, [0, 1.25, 0]),
    part(new THREE.CylinderGeometry(.1, .14, .6, 10), 0x9a9ab8, [0, 1.8, 0]),
    part(bowl(.45, .18), 0xa8a8c6, [0, 2.05, 0]),
    part(new THREE.CylinderGeometry(.05, .07, .4, 8), 0xd4a53a, [0, 2.4, 0]),
    part(new THREE.ConeGeometry(.2, .22, 8), 0xd4a53a, [0, 3.02, 0]),
    part(sph(.04, 8, 6), 0xffe08a, [0, 3.16, 0]),
  ]), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .45, metalness: .25 }));
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x9ff4ff, toneMapped: false });
  const eyeOrb = new THREE.Mesh(sph(.19, 16, 12), eyeMat); eyeOrb.position.y = 2.78;
  const cage = new THREE.Mesh(new THREE.TorusGeometry(.22, .02, 6, 24), new THREE.MeshStandardMaterial({ color: 0xd4a53a, metalness: .8, roughness: .3 }));
  cage.position.y = 2.78;
  // falling water: two open cylinders under the bowl lips with scrolling streaks
  const streak = canvasTex(64, 128, (g, w, h) => { for (let x = 0; x < w; x += 4) { g.fillStyle = `rgba(210, 245, 255, ${.15 + Math.random() * .6})`; g.fillRect(x, Math.random() * h, 2, h * (.3 + Math.random() * .6)); } });
  streak.wrapS = streak.wrapT = THREE.RepeatWrapping; streak.repeat.set(10, 1);
  const fallMat = new THREE.MeshBasicMaterial({ map: streak, color: 0x9fe6ff, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
  const fall1 = new THREE.Mesh(new THREE.CylinderGeometry(.79, .9, 1.2, 32, 1, true), fallMat); fall1.position.y = .9;
  const fall2 = new THREE.Mesh(new THREE.CylinderGeometry(.44, .72, .56, 32, 1, true), fallMat); fall2.position.y = 1.97;
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(.04, .09, .5, 8), new THREE.MeshBasicMaterial({ color: 0xdff8ff, transparent: true, opacity: .7, toneMapped: false })); jet.position.y = 2.42;
  // sweeping beam from the eye, tilted down onto the plaza
  const beam = new THREE.Group(); beam.position.y = 2.78;
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x7ae8ff, transparent: true, opacity: .1, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, toneMapped: false, fog: false });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 7, 24, 1, true).translate(0, -3.5, 0).rotateZ(Math.PI / 2).rotateZ(-.32), beamMat);
  beam.add(cone);
  const pond = (r, y) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32).rotateX(-Math.PI / 2), water.material); m.position.y = y; return m; }; // water in the bowls
  fountain.add(wall, rimTop, zone, water, center, eyeOrb, cage, fall1, fall2, jet, beam, pond(.74, 1.48), pond(.41, 2.21));
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffd88a, toneMapped: false }), poleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, metalness: .6 });
  for (const [x, z] of [[-PX, -PZ], [PX, -PZ], [-PX, PZ], [PX, PZ], [0, -PZ - 1], [0, PZ + 1]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 3.4, 8), poleMat); p.position.set(x, 1.7, z);
    const b = new THREE.Mesh(new THREE.SphereGeometry(.25, 12, 8), lampMat); b.position.set(x, 3.5, z);
    scene.add(p, b);
  }

  // ---- the crowd: one instanced mesh of identical cute chibis. Players and bystanders share it, so nobody can be told apart.
  // Colours are baked per vertex; instance colour only tints public reveals.
  const figGeo = chibi({ hood: 0xb8a8ff, skin: 0xffd9bf, ink: 0x2a2238, blush: 0xff9ab8, feet: 0x5a4a6e, pocket: 0xffffff });
  const crowdMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .7 });
  const crowd = new THREE.InstancedMesh(figGeo, crowdMat, NW);
  crowd.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const BASE = new THREE.Color(0xffffff), cTmp = new THREE.Color();
  for (let k = 0; k < NW; k++) crowd.setColorAt(k, BASE);
  scene.add(crowd);
  const shadowTex = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const shadows = new THREE.InstancedMesh(new THREE.PlaneGeometry(.9, .9).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }), NW);
  shadows.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(shadows);

  // private overlay (this phone only): YOU ring, exposure timer arc, eye markers on players revealed to you
  const youRing = new THREE.Mesh(new THREE.RingGeometry(.5, .62, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: COL[me], transparent: true, opacity: .8, toneMapped: false, depthWrite: false }));
  youRing.position.y = .03; scene.add(youRing);
  const youTag = nameTag(t('crowdYou'), COL[me]); scene.add(youTag);
  const arcMat = new THREE.MeshBasicMaterial({ color: 0x3dff9a, transparent: true, opacity: .9, toneMapped: false, depthWrite: false, side: THREE.DoubleSide });
  let arc = null, arcK = -1;
  const eyes = IDX.map(i => {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.RingGeometry(.55, .7, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: COL[i], transparent: true, opacity: .9, toneMapped: false, depthWrite: false })); ring.position.y = .04;
    const tag = nameTag('👁 ' + label(i), COL[i]); tag.position.y = 2.2;
    g.add(ring, tag); g.visible = false; scene.add(g);
    return g;
  });
  const pubTags = IDX.map(i => { const s = nameTag(label(i), COL[i]); s.visible = false; scene.add(s); return s; }); // over publicly exposed players
  const burst = new Burst(scene);
  // winner reveal: whoever takes a round (and the match champion in the showcase) drops the disguise in a poof and
  // stands there as their own banner character, name tag on top, hopping with both arms up
  const heroes = IDX.map(i => { const r = makeRunner(COL[i]), tag = nameTag(label(i), COL[i]); r.add(tag); r.visible = false; scene.add(r); return r; });
  let hero = -1, heroT = 0, champShow = -1;

  // ---- state
  const S = {
    st: 'count', stT: 0, round: 1, T: 0, wins: Array(n).fill(0), finds: Array(n).fill(0), tot: Array(n).fill(0),
    w: [], pw: [], // walkers; pw[i] = walker index of player i
    p: IDX.map(() => ({ vis: 0, lit: 0, pend: [], out: 0, inC: 0, seen: [], rev: 0, cd: 0, sus: -1, goWatch: false, greedy: false, pch: 0, miss: 0 })),
    ring: [0, 0, 0, 0], chime: 0,
  };
  const inp = IDX.map(() => ({ l: 0, r: 0, pu: 0 }));
  const ctrl = new Set(online ? [me] : IDX), ai = new Set();
  const R = (a, b) => a + Math.random() * (b - a);

  const panes = [online ? me : 0].map(pi => {
    const v = makePane(pi, label, zones('↺', '👊', '↻'));
    v.chips = rankChips(v, n, label);
    v.cam = new THREE.PerspectiveCamera(50, 1, .1, 300); v.fov = 50; v.s = {};
    return v;
  });
  const V = panes[0];
  const pips = i => { const p = S.p[i], mine = i === V.pi; return '●'.repeat(p.lit) + (mine ? '◌'.repeat(p.vis - p.lit) : '') + '○'.repeat(4 - (mine ? p.vis : p.lit)); };
  const chips = () => V.chips(IDX.map(i => (S.p[i].out ? '✕' : pips(i)) + ` ★${S.wins[i]}`));
  let step = countdown(panes);

  function roundStart() {
    S.w = Array.from({ length: NW }, () => ({ x: R(-PX + 1, PX - 1), z: R(-PZ + 1, PZ - 1), a: R(0, 6.28), want: 0, tt: R(0, 2), stop: 0, dead: 0, pl: -1, ph: R(0, 6), mv: 1 }));
    S.w.forEach(w => { w.want = w.a; if (inF(w)) w.x += 4; });
    const pick = []; while (pick.length < n) { const k = Math.random() * NW | 0; if (!pick.includes(k)) pick.push(k); }
    S.pw = pick; pick.forEach((k, i) => { S.w[k].pl = i; });
    S.p.forEach(p => Object.assign(p, { watchCd: 0, vmask: 0, vis: 0, lit: 0, pend: [], out: 0, inC: 0, seen: [], rev: 0, cd: 0, sus: -1, goWatch: false, greedy: false }));
    Object.assign(S, { st: 'count', stT: 0, T: 0, ring: [0, 0, 0, 0] });
    step = countdown(panes);
    V.hint.textContent = coarse ? t('crowdTouch') : t('crowdKeys', keyHint(V.pi, online)); V.hint.classList.remove('hide');
    chips();
  }

  // ---- simulation (authority)
  const pw = i => S.w[S.pw[i]];
  function punch(i) {
    const P = S.p[i], w = pw(i);
    if (S.st !== 'play' || P.out || P.cd > 0) return;
    P.cd = .5; P.pch++;
    const fx = Math.cos(w.a), fz = Math.sin(w.a);
    let best = null, bd = REACH;
    for (const o of S.w) {
      if (o === w || o.dead) continue;
      const dx = o.x - w.x, dz = o.z - w.z, d = Math.hypot(dx, dz);
      if (d < bd && (dx * fx + dz * fz) / (d || 1) > .3) { bd = d; best = o; }
    }
    if (!best) return;
    best.dead = .001;
    if (best.pl >= 0) { S.p[best.pl].out = 1; S.finds[i]++; }
    else { P.rev = 2; P.cd = 3; P.sus = -1; P.miss++; }
  }
  function think(i, w) { // bot: drift toward the next statue like a wanderer, peek from the fountain, stalk suspects
    const P = S.p[i];
    if (w.tt <= 0) {
      w.tt = R(1, 3.2);
      if (Math.random() < .22) w.stop = R(.6, 1.8);
      else if (!P.goWatch && P.watchCd <= 0 && Math.random() < .1) P.goWatch = true;
      else {
        const next = STAT.map((s, k) => [s, k]).filter(([, k]) => !(P.vmask >> k & 1)).sort((a, b) => Math.hypot(a[0][0] - w.x, a[0][1] - w.z) - Math.hypot(b[0][0] - w.x, b[0][1] - w.z))[0];
        const sus = P.sus >= 0 ? S.w[P.sus] : null;
        const tgt = sus && !sus.dead ? [sus.x, sus.z] : next ? next[0] : [0, 0];
        w.want = Math.atan2(tgt[1] - w.z, tgt[0] - w.x) + R(-.6, .6);
      }
    }
    if (P.goWatch) { w.want = Math.atan2(-w.z, -w.x); if (inF(w) && Math.hypot(w.x, w.z) < 1) { P.goWatch = false; w.stop = R(1.2, 3.8); } }
    P.watchCd -= 1 / 60;
    if (P.inC === 0) P.greedy = Math.random() < .15;
    else {
      P.watchCd = 10; // a peek, then a while before the next one
      if (P.inC > 1.2 && !P.greedy) { w.stop = 0; w.want = Math.atan2(w.z, w.x); } // walk out before exposure
    }
    const sus = P.sus >= 0 ? S.w[P.sus] : null;
    if (P.cd <= 0 && sus && !sus.dead && Math.hypot(sus.x - w.x, sus.z - w.z) < REACH * .9 && Math.random() < .08) inp[i].pu = 1;
  }
  function sim(dt) {
    S.stT += dt;
    if (S.st === 'end' && S.stT > 3) {
      if (Math.max(...S.wins) >= WINS || S.round >= MAX_ROUNDS) { S.st = 'done'; return; }
      S.round++; roundStart(); return;
    }
    if (S.st !== 'play') return;
    S.T += dt;
    for (const w of S.w) {
      if (w.dead) { w.dead += dt; continue; }
      w.tt -= dt;
      let moving = true;
      const i = w.pl;
      if (i >= 0 && ctrl.has(i) && !ai.has(i) || i >= 0 && !ctrl.has(i)) { // a human (local, or a guest's input)
        const io = inp[i];
        w.a += (io.r - io.l) * TURN * dt * (io.l && io.r ? 0 : 1);
        moving = !(io.l && io.r);
      } else {
        if (i >= 0) think(i, w);
        else if (w.tt <= 0) { w.tt = R(1, 3.2); if (Math.random() < .22) w.stop = R(.6, 1.8); else w.want = w.a + R(-1.1, 1.1); }
        if (Math.abs(w.x) > PX - 1.5 || Math.abs(w.z) > PZ - 1.5) w.want = Math.atan2(-w.z, -w.x);
        const d = Math.atan2(Math.sin(w.want - w.a), Math.cos(w.want - w.a)); w.a += Math.max(-TURN * dt, Math.min(TURN * dt, d));
        if (w.stop > 0) { w.stop -= dt; moving = false; }
      }
      const sp = i >= 0 ? SPD * SLOW ** S.p[i].vis : SPD;
      if (moving) { w.x += Math.cos(w.a) * sp * dt; w.z += Math.sin(w.a) * sp * dt; w.ph += dt * 9; }
      w.mv = moving ? 1 : 0;
      w.x = Math.max(-PX, Math.min(PX, w.x)); w.z = Math.max(-PZ, Math.min(PZ, w.z));
      for (const [sx, sz] of STAT) { const dx = w.x - sx, dz = w.z - sz, d = Math.hypot(dx, dz); if (d < .75) { w.x = sx + dx / (d || 1) * .75; w.z = sz + dz / (d || 1) * .75; } } // plinths are solid
      { const d = Math.hypot(w.x, w.z); if (d < FC) { w.x = w.x / (d || 1) * FC; w.z = (d ? w.z / d : 1) * FC; } } // so is the fountain's centre
      if (i < 0) continue;
      const P = S.p[i];
      P.rev = Math.max(0, P.rev - dt); P.cd = Math.max(0, P.cd - dt);
      P.pend = P.pend.map(x => x - dt).filter(x => x > 0);
      P.inC = inF(w) ? P.inC + dt : 0; // after moving: the glow stops the frame you step out
      P.seen = P.seen.map(([j, tt]) => [j, tt - dt]).filter(([, tt]) => tt > 0);
      STAT.forEach(([sx, sz], k) => {
        if (P.vmask >> k & 1 || Math.hypot(w.x - sx, w.z - sz) > TOUCH) return;
        P.vmask |= 1 << k; P.vis++; S.tot[i]++; S.ring[k]++;
        if (P.vis === 4) { P.pend = []; } else P.pend.push(PIP_DELAY);
        // watchers (inside the fountain right now) see who it was; bots also suspect whoever stood near
        IDX.forEach(j => {
          const Q = S.p[j];
          if (j === i || Q.out) return;
          if (Q.inC > 0) { Q.seen = Q.seen.filter(([x]) => x !== i).concat([[i, 2.5]]); Q.sus = S.pw[i]; }
          else if (ai.has(j)) { const near = S.w.filter(o => o !== pw(j) && !o.dead && Math.hypot(o.x - sx, o.z - sz) < 3); if (near.length) Q.sus = S.w.indexOf(Math.random() < .5 ? w : near[Math.random() * near.length | 0]); }
        });
      });
      if (inp[i].pu) { inp[i].pu = 0; punch(i); }
    }
    IDX.forEach(i => { const P = S.p[i]; P.lit = P.vis - P.pend.length; if (P.rev > 0 || P.inC >= EXPOSE) IDX.forEach(j => { if (j !== i && ai.has(j)) S.p[j].sus = S.pw[i]; }); });
    S.w.forEach(w => { if (w.pl < 0 && w.dead > 1.6) w.gone = 1; });
    const alive = IDX.filter(i => !S.p[i].out), four = IDX.find(i => S.p[i].vis >= 4);
    if (four != null || alive.length <= 1 || S.T >= RCAP) {
      // time cap: whoever touched the most statues; a tie takes nobody
      const most = Math.max(...alive.map(i => S.p[i].vis)), top = alive.filter(i => S.p[i].vis === most);
      const win = four ?? (alive.length <= 1 ? alive[0] : top.length === 1 ? top[0] : undefined);
      if (win != null) S.wins[win]++;
      S.st = 'end'; S.stT = 0; S.lastWin = win ?? -1; S.by4 = four != null ? 1 : alive.length <= 1 ? 0 : 2;
    }
  }

  // ---- networking
  const q1 = v => Math.round(v * 10) / 10, q2 = v => Math.round(v * 100) / 100;
  let acc = 0, sendAcc = 0;
  function snapshot() {
    const w = [];
    S.w.forEach(o => w.push(q1(o.x), q1(o.z), q2(o.a), (o.mv ? 1 : 0) | (o.dead ? 2 : 0) | (o.gone ? 4 : 0)));
    send({ t: 'cw', from: 0, st: ST.indexOf(S.st), r: S.round, T: q1(S.T), w, pw: S.pw, wn: S.wins, fd: S.finds, tt: S.tot, rg: S.ring, lw: S.lastWin ?? -1, b4: S.by4 ?? 0,
      p: S.p.flatMap(p => [p.vis, p.lit, p.out, q1(p.inC), q1(p.rev), p.pch, p.miss]), sn: S.p.map(p => p.seen.map(([j]) => j)) });
  }
  const num = x => typeof x === 'number' && Number.isFinite(x);
  const arr = (a, len) => Array.isArray(a) && (len == null || a.length === len) && a.every(num);
  function applySnap(m) {
    const st = ST[m.st];
    if (st === 'count' && (S.st !== 'count' || m.r !== S.round)) { step = countdown(panes); V.hint.classList.remove('hide'); }
    if (S.w.length !== NW) S.w = Array.from({ length: NW }, () => ({ x: 0, z: 0, a: 0, ph: 0, mv: 0, dead: 0, pl: -1 }));
    S.w.forEach((o, k) => { const j = k * 4; o.tx = m.w[j]; o.tz = m.w[j + 1]; o.ta = m.w[j + 2]; o.mv = m.w[j + 3] & 1; o.dead = m.w[j + 3] & 2 ? (o.dead || .001) : 0; o.gone = m.w[j + 3] & 4 ? 1 : 0; o.pl = -1; if (o.x === 0 && o.z === 0 || m.r !== S.round) { o.x = o.tx; o.z = o.tz; o.a = o.ta; } });
    S.pw = m.pw.slice(); S.pw.forEach((k, i) => { S.w[k].pl = i; });
    S.p.forEach((P, i) => { const a = m.p.slice(i * 7, i * 7 + 7); Object.assign(P, { vis: a[0], lit: a[1], out: a[2], inC: a[3], rev: a[4], pch: a[5], miss: a[6] }); P.seen = (m.sn[i] ?? []).map(j => [j, 1]); });
    Object.assign(S, { st, round: m.r, T: m.T, wins: m.wn.slice(), finds: m.fd.slice(), tot: m.tt.slice(), ring: m.rg.slice(), lastWin: m.lw, by4: m.b4 });
  }
  function onNet(m) {
    if (!m || typeof m.t !== 'string') return;
    const i = m.from;
    if (auth) {
      if (!Number.isInteger(i) || i < 1 || i >= n || ctrl.has(i)) return;
      if (m.t === 'ci') { inp[i].l = m.l ? 1 : 0; inp[i].r = m.r ? 1 : 0; }
      else if (m.t === 'cp') inp[i].pu = 1;
    } else if (m.t === 'cw' && i === 0 && Number.isInteger(m.st) && ST[m.st] && Number.isInteger(m.r) && num(m.T) && arr(m.w, NW * 4) && arr(m.pw, n) && m.pw.every(k => k >= 0 && k < NW)
      && arr(m.wn, n) && arr(m.fd, n) && arr(m.tt, n) && arr(m.rg, 4) && num(m.lw) && num(m.b4) && arr(m.p, n * 7) && Array.isArray(m.sn) && m.sn.length === n && m.sn.every(s => arr(s) && s.every(j => j >= 0 && j < n))) applySnap(m);
  }

  // ---- input
  const act = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi)) return;
    if (a === 'A') { if (auth) inp[pi].pu = 1; else send({ t: 'cp', from: pi }); return; }
    inp[pi][a === 'L' ? 'l' : 'r'] = 1;
    if (!auth) send({ t: 'ci', from: pi, l: inp[pi].l, r: inp[pi].r });
  };
  const release = (pi, a) => {
    if (!ctrl.has(pi) || a === 'A') return;
    inp[pi][a === 'L' ? 'l' : 'r'] = 0;
    if (!auth) send({ t: 'ci', from: pi, l: inp[pi].l, r: inp[pi].r });
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act, release });

  // ---- match end
  const sc = makeShowcase(panes, label, onEnd);
  let ended = false, champ = 0;
  const champV = new THREE.Vector3();
  function finish() {
    if (ended) return;
    ended = true;
    const order = [...IDX].sort((a, b) => S.wins[b] - S.wins[a] || S.tot[b] - S.tot[a] || S.finds[b] - S.finds[a]);
    const key = i => [S.wins[i], S.tot[i], S.finds[i]];
    const draw = key(order[0]).every((v, k) => v === key(order[1])[k]);
    champ = order[0]; champShow = draw ? -1 : champ;
    sc.start({ order, draw, scores: IDX.map(i => t('crowdScore', { w: S.wins[i], f: S.finds[i] })) }, () => { const w = S.w[S.pw[champ]]; return champV.set(w?.x ?? 0, 0, w?.z ?? 0); }, { r: 6, h: 3.4, look: 1 });
  }

  // ---- feedback from state changes (same path on host and guests)
  let prev = null;
  function events() {
    const cur = { st: S.st, ring: S.ring.slice(), p: S.p.map(p => ({ out: p.out, lit: p.lit, pch: p.pch, miss: p.miss, seen: p.seen.map(([j]) => j).join(), exp: p.inC >= EXPOSE })), wins: S.wins.slice() };
    if (prev) {
      cur.ring.forEach((c, k) => { if (c > prev.ring[k]) { statues[k].pulse = 1.4; sfx.pitch(7 + k, .9, .1); sfx.pitch(11 + (k % 2), 1.1, .06); } });
      IDX.forEach(i => {
        const a = prev.p[i], b = cur.p[i], w = S.w[S.pw[i]];
        if (b.pch > a.pch) sfx.bump();
        if (b.out && !a.out) { if (w) burst.emit(w.x, 1, w.z, COL[i], 30, 5); flash(V.msg, i === V.pi ? t('crowdFound') : t('crowdIsOut', { p: label(i) }), i === V.pi ? 'hit' : ''); i === V.pi ? (sfx.fall(), buzz(80)) : sfx.hit(); }
        if (b.miss > a.miss && w) { burst.emit(w.x, 1.4, w.z, COL[i], 16, 3); if (i === V.pi) { flash(V.msg, t('crowdWrong'), 'hit'); sfx.miss(); } }
        if (b.exp && !a.exp && i === V.pi) { flash(V.msg, t('crowdExposed'), 'hit'); sfx.signal(); }
        if (b.lit > a.lit || b.out !== a.out) chips();
      });
      const mine = S.p[V.pi].seen.map(([j]) => j);
      mine.forEach(j => { if (!(prev.mySeen ?? []).includes(j)) { flash(V.msg, t('crowdSpotted', { p: label(j) }), 'great'); sfx.perfect(); } });
      if (prev.st === 'play' && cur.st === 'end') {
        const w = S.lastWin;
        flash(V.msg, w >= 0 ? t(['crowdLast', 'crowdAll4', 'crowdTime'][S.by4], { p: label(w) }) : t('sumoNoRound'), w === V.pi ? 'go' : '');
        w === V.pi ? sfx.finish() : sfx.lose();
        chips();
      }
      if (prev.st !== 'count' && cur.st === 'count') chips();
    }
    cur.mySeen = S.p[V.pi].seen.map(([j]) => j);
    prev = cur;
  }

  // ---- frame
  let time = 0, lastSt = S.st;
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P3 = new THREE.Vector3(), SC = new THREE.Vector3();
  function update(dt) {
    time += dt;
    if (S.st === 'count' && !step(dt) && auth) { S.st = 'play'; S.stT = 0; }
    if (S.st === 'play') V.hint.classList.add('hide');
    if (auth && S.st !== 'done') {
      acc = Math.min(acc + dt, .25);
      while (acc >= STEP) { acc -= STEP; sim(STEP); }
      if (online && (sendAcc += dt) >= 1 / 12) { sendAcc = 0; snapshot(); }
    } else if (!auth) S.w.forEach(o => { // ease toward the latest snapshot
      if (o.tx == null) return;
      const f = Math.min(1, dt * 10);
      o.x += (o.tx - o.x) * f; o.z += (o.tz - o.z) * f; o.a += Math.atan2(Math.sin(o.ta - o.a), Math.cos(o.ta - o.a)) * f;
      if (o.mv) o.ph += dt * 9;
      if (o.dead) o.dead += dt;
    });
    if (S.st === 'done') { if (auth && online && lastSt !== 'done') snapshot(); finish(); }
    lastSt = S.st;
    events();

    // statues + fountain
    statues.forEach((s, k) => {
      s.pulse = Math.max(0, s.pulse - dt); const e = 1 - s.pulse / 1.4, p = s.pulse / 1.4;
      s.ring.scale.setScalar(1 + e * 5); s.ring.material.opacity = s.pulse > 0 ? 1 - e : 0;
      s.emb.rotation.y = time * 1.2 + k; s.emb.position.y = 3.15 + Math.sin(time * 2 + k * 1.7) * .08 + p * .3;
      s.emb.scale.setScalar(1.45 + p * .8); s.emat.emissiveIntensity = .7 + p * 3;
      s.glow.material.opacity = .4 + Math.sin(time * 2.4 + k) * .08 + p * .6;
    });
    goldMat.emissiveIntensity = .4 + Math.max(...statues.map(s => s.pulse)) * 1.5;
    jet.scale.y = 1 + Math.sin(time * 6) * .15;
    ripple.offset.set(time * .03, time * .02); streak.offset.y = time * 1.6;
    // the watch eye and zone line react to this phone's player: calm cyan, bright while you watch, red once you're exposed
    const me2 = S.p[V.pi], watchC = me2.inC >= EXPOSE ? 0xff5a6e : me2.inC > 0 ? 0x3dff9a : 0x5ce8ff;
    beam.rotation.y = time * .7; beamMat.opacity = me2.inC > 0 ? .13 : .06;
    eyeMat.color.setHex(watchC); zoneMat.color.setHex(watchC); beamMat.color.setHex(watchC);
    zoneMat.opacity = .55 + Math.sin(time * 3) * .25;
    eyeOrb.scale.setScalar(1 + Math.sin(time * 4) * .06);

    // winner reveal (see heroes)
    const hv = sc.on ? champShow : S.st === 'end' && S.lastWin >= 0 ? S.lastWin : -1, hw = hv >= 0 ? S.w[S.pw[hv]] : null;
    if (hv !== hero) {
      if (hero >= 0) heroes[hero].visible = false;
      hero = hw ? hv : -1; heroT = 0;
      if (hw) { burst.emit(hw.x, .9, hw.z, 0xffffff, 26, 4); burst.emit(hw.x, 1.2, hw.z, COL[hv], 30, 5); burst.emit(hw.x, 1.5, hw.z, 0xffd23f, 18, 6); }
    }
    if (hero >= 0) {
      heroT += dt;
      const r = heroes[hero], u = r.userData, k = Math.min(1, heroT / .35);
      r.visible = true;
      r.scale.setScalar(k < 1 ? k * (1 + Math.sin(k * Math.PI) * .35) : 1); // pop in with a little overshoot
      r.rotation.y = -hw.a - Math.PI / 2;
      animRunner(r, 0, 0);
      u.armL.rotation.z = -2.6; u.armR.rotation.z = 2.6; u.armL.rotation.x = u.armR.rotation.x = 0; // both arms up
      u.elbowL.rotation.x = u.elbowR.rotation.x = .2;
      placeRunner(r, hw.x, Math.abs(Math.sin(heroT * 6)) * .3, hw.z);
    }

    // crowd instances
    S.w.forEach((o, k) => {
      const i = o.pl, P = i >= 0 ? S.p[i] : null;
      let s = 1, lie = 0;
      if (o.gone || (o.dead && i < 0 && o.dead > 1.6) || (hero >= 0 && i === hero)) s = 0; // the winner's chibi is swapped out
      else if (o.dead) lie = Math.min(1, o.dead * 4);
      const bob = o.mv && !o.dead ? Math.abs(Math.sin(o.ph)) * .07 : 0;
      E.set(-lie * Math.PI / 2, -o.a - Math.PI / 2, o.mv && !o.dead ? Math.sin(o.ph) * .05 : 0, 'YXZ'); Q.setFromEuler(E);
      M4.compose(P3.set(o.x, bob + lie * .34, o.z), Q, SC.setScalar(s)); crowd.setMatrixAt(k, M4);
      M4.compose(P3.set(o.x, .015, o.z), Q.identity(), SC.setScalar(s)); shadows.setMatrixAt(k, M4);
      const pub = P && (P.rev > 0 || P.inC >= EXPOSE) && !P.out; // publicly exposed: glows in their colour for everyone
      cTmp.copy(BASE); if (pub) cTmp.setHex(COL[i]).lerp(BASE, .15 + Math.sin(time * 12) * .1); if (o.dead) cTmp.multiplyScalar(.6);
      crowd.setColorAt(k, cTmp);
    });
    crowd.instanceMatrix.needsUpdate = true; crowd.instanceColor.needsUpdate = true; shadows.instanceMatrix.needsUpdate = true;
    IDX.forEach(i => { const P = S.p[i], w = S.w[S.pw[i]]; pubTags[i].visible = !!w && !P.out && (P.rev > 0 || P.inC >= EXPOSE); if (pubTags[i].visible) pubTags[i].position.set(w.x, 2.3, w.z); });

    // private overlay for this phone's player
    const myW = S.w[S.pw[V.pi]], myP = S.p[V.pi];
    youRing.visible = youTag.visible = !!myW && !myP.out && S.st !== 'done';
    if (myW) { youRing.position.set(myW.x, .08, myW.z); youTag.position.set(myW.x, 2.1, myW.z); youRing.material.opacity = .55 + Math.sin(time * 4) * .25; }
    const f = Math.min(1, myP.inC / EXPOSE), showArc = !!myW && myP.inC > 0 && !myP.out;
    if (showArc) {
      const kq = Math.round((1 - f) * 40);
      if (kq !== arcK) { arcK = kq; if (arc) { scene.remove(arc); arc.geometry.dispose(); } arc = kq > 0 ? new THREE.Mesh(new THREE.RingGeometry(.78, .95, 40, 1, Math.PI / 2, Math.PI * 2 * kq / 40).rotateX(-Math.PI / 2), arcMat) : null; if (arc) scene.add(arc); }
      if (arc) arc.position.set(myW.x, .09, myW.z);
      arcMat.color.setHex(f >= 1 ? 0xff5a6e : f > .66 ? 0xffd23f : 0x3dff9a);
    }
    if (arc) arc.visible = showArc;
    const seen = myP.seen.map(([j]) => j);
    eyes.forEach((e, j) => { const w = S.w[S.pw[j]]; e.visible = seen.includes(j) && !!w && !S.p[j].out; if (e.visible) e.position.set(w.x, 0, w.z); });

    const vs = S.st === 'play' && myP.inC > 0 ? (myP.inC >= EXPOSE ? t('crowdExposedHud') : t('crowdWatching', { n: Math.max(0, EXPOSE - myP.inC).toFixed(1) })) : t('sumoRound', { n: S.round });
    if (V.s.v !== vs) { V.s.v = vs; V.val.textContent = vs; V.val.style.color = myP.inC >= EXPOSE ? '#ff5a6e' : myP.inC > 0 ? '#3dff9a' : ''; }
    burst.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    V.cam.aspect = V.w / V.h; V.fov = fitFov(V.cam.aspect, 40, 42, 90);
  }

  function render() {
    renderPanes(renderer, scene, panes, v => {
      const c = v.cam;
      if (sc.on) { sc.cam(v, c, v.fov); sky.position.copy(c.position); return c; }
      // one fixed view of the whole plaza: the camera never gives away who you are
      c.position.set(0, 25, 19); c.lookAt(0, 0, 1.5);
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = v.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  function botify(i, local) {
    ai.add(i);
    if (local) ctrl.add(i);
    if (local && i === 0 && !auth) auth = true; // host gone: carry on from the last snapshot
    chips();
  }

  function dispose() {
    unbind();
    if (arc) arc.geometry.dispose();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  S.p.forEach(p => { p.vmask = 0; });
  if (auth) roundStart(); else { chips(); V.hint.textContent = coarse ? t('crowdTouch') : t('crowdKeys', keyHint(V.pi, online)); }
  resize();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
