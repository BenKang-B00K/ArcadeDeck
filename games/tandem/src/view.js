import * as THREE from 'three';
import { PW, PH } from './game.js';

export const COLORS = {
  p: [0xff5a6e, 0x3fa7ff],
  ch: { a: 0xffd166, b: 0x06d6a0, c: 0xc77dff, d: 0xff9f1c },
  exit: 0xbff4ff, gem: 0x7df9ff,
};
const FOV = 40, N_PART = 600, N_FLOAT = 40;

const canvasTex = (w, h, draw) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const rnd = (a, b) => a + Math.random() * (b - a);

// Bevelled stone block: light top/left edge, dark bottom/right edge, speckles.
// Drawn near-white so per-instance / material colour tints it.
const stone = (g, x, y, w, h, shade, bevel) => {
  const v = Math.round(shade * 255);
  g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, w, h);
  for (let i = 0; i < w * h / 40; i++) {
    g.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${rnd(0.03, 0.1)})`;
    g.fillRect(x + rnd(0, w), y + rnd(0, h), rnd(1, 3), rnd(1, 3));
  }
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, y, w, bevel); g.fillRect(x, y, bevel, h);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x, y + h - bevel, w, bevel); g.fillRect(x + w - bevel, y, bevel, h);
};
const bricks = (g, size, rows, cols, bevel, lo, hi) => {
  g.fillStyle = '#555'; g.fillRect(0, 0, size, size);
  const bh = size / rows, bw = size / cols;
  for (let r = 0; r < rows; r++) for (let c = -1; c < cols; c++) {
    const x = c * bw + (r % 2) * bw / 2;
    stone(g, x + 1, r * bh + 1, bw - 2, bh - 2, rnd(lo, hi), bevel);
  }
};

export class View {
  constructor(canvas) {
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: devicePixelRatio < 2, powerPreference: 'high-performance' });
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.1;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    this.maxDpr = Math.min(devicePixelRatio, 2);
    this.dpr = this.maxDpr;
    this.frameAvg = 1 / 60;
    this.perfTimer = 0;
    this.shake = 0;
    this.calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = this.scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x3d2c6e, 28, 80);
    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 200);
    this.cam = new THREE.Vector3(0, 0, 20);

    scene.add(new THREE.HemisphereLight(0xbfd2ff, 0x2a2050, 1.25));
    const sun = this.sun = new THREE.DirectionalLight(0xffd9b0, 2.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 15, bottom: -15, near: 1, far: 60 });
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);

    this.dot = canvasTex(64, 64, (c, w) => {
      const grd = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.4, 'rgba(255,255,255,.5)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = grd; c.fillRect(0, 0, w, w);
    });
    // diagonal energy stripes for R/U barriers, scrolled in update()
    this.stripes = canvasTex(64, 64, (g, w) => {
      g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, 0, w, w);
      g.strokeStyle = '#fff'; g.lineWidth = 7;
      for (let i = -w; i < w * 2; i += 16) { g.beginPath(); g.moveTo(i, w); g.lineTo(i + w, 0); g.stroke(); }
    });
    this.stripes.wrapS = this.stripes.wrapT = THREE.RepeatWrapping;
    const std = o => new THREE.MeshStandardMaterial(o);
    this.geo = {
      box: new THREE.BoxGeometry(1, 1, 1.4),
      cap: new THREE.BoxGeometry(1.02, 0.12, 1.44),
      door: new THREE.BoxGeometry(0.9, 1, 1.1),
      bridge: new THREE.BoxGeometry(1, 0.28, 1.1),
      plate: new THREE.CylinderGeometry(0.46, 0.5, 0.12, 6).scale(1, 1, 1.1),
      field: new THREE.BoxGeometry(1, 1, 1.3),
      spike: new THREE.ConeGeometry(0.15, 0.45, 4),
      gem: new THREE.OctahedronGeometry(0.2).scale(0.8, 1.4, 0.8),
      bar: new THREE.BoxGeometry(1, 1, 0.3),
      // floating island: inverted rock cone under a grassy lid, pivot at the lid
      float: new THREE.ConeGeometry(1, 1.8, 7).rotateX(Math.PI).translate(0, -0.9, 0),
      floatTop: new THREE.CylinderGeometry(1.08, 1.02, 0.28, 7).translate(0, 0.02, 0),
      fall: new THREE.PlaneGeometry(0.35, 7).translate(0.3, -3.5, 0.75),
      blade: new THREE.CylinderGeometry(0.32, 0.32, 0.07, 10).rotateX(Math.PI / 2),
      hub: new THREE.IcosahedronGeometry(0.13, 0),
      teeth: new THREE.TorusGeometry(0.31, 0.045, 4, 10),
      cannon: new THREE.BoxGeometry(0.9, 0.9, 1.1),
      barrel: new THREE.CylinderGeometry(0.2, 0.24, 0.5, 10).rotateZ(Math.PI / 2),
      bolt: new THREE.SphereGeometry(0.17, 12, 8),
      stop: new THREE.OctahedronGeometry(0.09),
      // decorations; planes pivot at their base (tuft) or top (vine, fringe)
      tuft: new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0),
      vine: new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0),
      fringe: new THREE.PlaneGeometry(1.02, 0.2).translate(0, -0.1, 0),
      flower: new THREE.PlaneGeometry(0.2, 0.2),
      crystal: new THREE.OctahedronGeometry(0.12),
      lamp: new THREE.BoxGeometry(0.18, 0.26, 0.18),
      lampCap: new THREE.BoxGeometry(0.28, 0.06, 0.26),
      glow: new THREE.PlaneGeometry(1, 1),
    };
    this.mat = {
      tile: std({ color: 0xffffff, roughness: 0.85, map: canvasTex(128, 128, (g, w) => bricks(g, w, 2, 2, 5, 0.75, 0.95)) }),
      cap: std({
        color: 0x86d990, emissive: 0x1c4a2c, roughness: 0.7,
        map: canvasTex(128, 32, (g, w, h) => {
          g.fillStyle = '#ddd'; g.fillRect(0, 0, w, h);
          for (let i = 0; i < 90; i++) {
            g.strokeStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '40,70,50'},${rnd(0.2, 0.5)})`;
            g.lineWidth = rnd(1, 2.5);
            const x = rnd(0, w); g.beginPath(); g.moveTo(x, h); g.lineTo(x + rnd(-4, 4), rnd(0, h * 0.6)); g.stroke();
          }
        }),
      }),
      // grass lip hanging over the front face of floor tiles
      fringe: std({
        color: 0x86d990, emissive: 0x1c4a2c, roughness: 0.7, alphaTest: 0.5,
        map: canvasTex(128, 32, (g, w, h) => {
          g.fillStyle = '#ddd';
          g.beginPath(); g.moveTo(0, 0);
          for (let x = 0; x <= w; x += 6) g.lineTo(x, rnd(0.3, 1) * h), g.lineTo(x + 3, rnd(0.1, 0.4) * h);
          g.lineTo(w, 0); g.fill();
        }),
      }),
      tuft: std({
        color: 0x6ccf9f, emissive: 0x1a5a44, roughness: 0.8, alphaTest: 0.5, side: THREE.DoubleSide,
        map: canvasTex(64, 64, (g, w, h) => {
          for (let i = 0; i < 11; i++) {
            const x = rnd(8, w - 8), t = rnd(0.35, 1) * h, lean = rnd(-14, 14), v = Math.round(rnd(170, 255));
            g.fillStyle = `rgb(${v},${v},${v})`;
            g.beginPath(); g.moveTo(x - 3, h); g.quadraticCurveTo(x, h - t * 0.5, x + lean, h - t); g.lineTo(x + 3, h); g.fill();
          }
        }),
      }),
      vine: std({
        color: 0x4fae84, emissive: 0x0f3326, roughness: 0.8, alphaTest: 0.5, side: THREE.DoubleSide,
        map: canvasTex(32, 64, (g, w, h) => {
          // stem sways one full period per texture height, so stacked segments join seamlessly
          g.strokeStyle = '#bbb'; g.lineWidth = 2.5; g.beginPath();
          for (let y = 0; y <= h; y += 2) g.lineTo(w / 2 + Math.sin(y / h * Math.PI * 2) * 4, y);
          g.stroke();
          for (let y = 4; y < h; y += 9) {
            const x = w / 2 + Math.sin(y / h * Math.PI * 2) * 4, s = y % 18 < 9 ? 1 : -1, v = Math.round(rnd(190, 255));
            g.fillStyle = `rgb(${v},${v},${v})`;
            g.beginPath(); g.ellipse(x + s * 5, y, 5.5, 3, s * 0.6, 0, Math.PI * 2); g.fill();
          }
        }),
      }),
      flower: new THREE.MeshBasicMaterial({
        alphaTest: 0.5, side: THREE.DoubleSide,
        map: canvasTex(32, 32, (g, w) => { // daisy: white petals, yellow heart
          g.fillStyle = '#fff';
          for (let i = 0; i < 8; i++) {
            const a = i / 8 * Math.PI * 2;
            g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * 8, w / 2 + Math.sin(a) * 8, 7, 3.5, a, 0, Math.PI * 2); g.fill();
          }
          g.fillStyle = '#ffc93c'; g.beginPath(); g.arc(w / 2, w / 2, 4.5, 0, Math.PI * 2); g.fill();
        }),
      }),
      crystal: std({ color: 0xffffff, emissive: 0x3a2f7a, emissiveIntensity: 0.8, roughness: 0.15, metalness: 0.1, flatShading: true }),
      lamp: new THREE.MeshBasicMaterial({ color: 0xffd08a }),
      lampFrame: std({ color: 0x2a2440, metalness: 0.6, roughness: 0.4 }),
      glow: new THREE.MeshBasicMaterial({ map: this.dot, color: 0xffa94d, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }),
      halo: new THREE.SpriteMaterial({ map: this.dot, color: COLORS.gem, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
      spike: std({ color: 0xd7dbe8, metalness: 0.6, roughness: 0.3 }),
      gem: std({ color: COLORS.gem, emissive: 0x2a9cff, emissiveIntensity: 1.1, roughness: 0.1, metalness: 0.2, flatShading: true, transparent: true, opacity: 0.9 }),
      exit: std({ color: COLORS.exit, emissive: COLORS.exit, emissiveIntensity: 0.6 }),
      // rising light streaks, scrolled upward in update()
      portal: new THREE.MeshBasicMaterial({
        color: COLORS.exit, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false,
        map: canvasTex(64, 128, (g, w, h) => {
          const grd = g.createLinearGradient(0, 0, w, 0);
          grd.addColorStop(0, 'rgba(255,255,255,.9)'); grd.addColorStop(0.5, 'rgba(255,255,255,.25)'); grd.addColorStop(1, 'rgba(255,255,255,.9)');
          g.fillStyle = grd; g.fillRect(0, 0, w, h);
          for (let i = 0; i < 14; i++) {
            const x = rnd(4, w - 4), y = rnd(0, h), l = rnd(16, 50);
            const s = g.createLinearGradient(0, y, 0, y + l);
            s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(0.5, 'rgba(255,255,255,.9)'); s.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = s; g.fillRect(x, y, rnd(1.5, 3), l); g.fillRect(x, y - h, 3, l);
          }
        }),
      }),
      float: std({ color: 0x6a5690, emissive: 0x1a1440, roughness: 0.8, flatShading: true }),
      floatTop: std({ color: 0x5fae6a, emissive: 0x143a22, roughness: 0.8, flatShading: true }),
      wall: std({
        color: 0x46407e, roughness: 1, alphaTest: 0.5,
        map: canvasTex(128, 128, (g, w) => bricks(g, w, 4, 2, 3, 0.55, 0.9)),
      }),
      red: this.fieldMat(COLORS.p[0]), blue: this.fieldMat(COLORS.p[1]),
      ch: {},
      blade: std({ color: 0xe8ebf5, metalness: 0.3, roughness: 0.35, emissive: 0x3a3f55 }),
      danger: std({ color: 0xff3b3b, emissive: 0xff2a2a, emissiveIntensity: 1.4 }),
      cannon: std({ color: 0x2b2d42, metalness: 0.5, roughness: 0.45 }),
      bolt: new THREE.MeshBasicMaterial({ color: 0xffc46b }),
      stop: new THREE.MeshBasicMaterial({ color: 0xff6a5a, transparent: true, opacity: 0.55 }),
    };
    // waterfall: the portal streaks, falling and fading out at the bottom
    this.mat.fall = new THREE.MeshBasicMaterial({
      color: 0xb8d4ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false,
      map: this.mat.portal.map.clone(),
      alphaMap: canvasTex(2, 64, (g, w, h) => {
        const grd = g.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, '#fff'); grd.addColorStop(1, '#000');
        g.fillStyle = grd; g.fillRect(0, 0, w, h);
      }),
    });
    this.mat.fall.map.repeat.set(1, 3);
    for (const k of ['wall', 'portal', 'vine', 'fall']) this.mat[k].map.wrapS = this.mat[k].map.wrapT = THREE.RepeatWrapping;
    const aniso = Math.min(4, r.capabilities.getMaxAnisotropy());
    this.mat.wall.map.anisotropy = this.mat.tile.map.anisotropy = aniso;
    this.initSky();
    for (const [k, c] of Object.entries(COLORS.ch)) this.mat.ch[k] = std({ color: c, emissive: c, emissiveIntensity: 0.35, roughness: 0.4 });
    // doors: dark stone slab with a glowing inset frame and diamond rune
    const rune = canvasTex(64, 64, (g, w) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, w);
      g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(8, 4, w - 16, w - 8);
      g.beginPath(); g.moveTo(w / 2, 18); g.lineTo(w - 22, w / 2); g.lineTo(w / 2, w - 18); g.lineTo(22, w / 2); g.closePath(); g.stroke();
    });
    this.mat.door = {};
    for (const [k, c] of Object.entries(COLORS.ch)) {
      this.mat.door[k] = std({ color: new THREE.Color(c).multiplyScalar(0.3), emissive: c, emissiveMap: rune, emissiveIntensity: 1, roughness: 0.6 });
    }

    this.level = new THREE.Group();
    scene.add(this.level);
    this.floaters = [this.geo.float, this.geo.floatTop, this.geo.fall].map((geo, i) => new THREE.InstancedMesh(geo, [this.mat.float, this.mat.floatTop, this.mat.fall][i], N_FLOAT));
    this.floatData = [];
    scene.add(...this.floaters);
    this.players = COLORS.p.map(c => this.makePlayer(c));
    this.initParticles();
    // bolt pool: bolts come and go every frame, meshes are reused
    this.boltMeshes = Array.from({ length: 32 }, () => {
      const m = new THREE.Mesh(this.geo.bolt, this.mat.bolt);
      m.visible = false;
      this.scene.add(m);
      return m;
    });

    addEventListener('resize', () => this.resize());
    this.resize();
  }

  // Far backdrop: one fullscreen shader quad drawn first — dusk gradient, setting sun, twinkling stars,
  // and a sea of clouds below the horizon. uCam gives it a little parallax.
  initSky() {
    this.sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      depthTest: false, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uCam: { value: new THREE.Vector2() } },
      vertexShader: 'void main() { gl_Position = vec4(position.xy, 1.0, 1.0); }',
      fragmentShader: /* glsl */`
        uniform float uTime; uniform vec2 uRes, uCam;
        float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + 1.0), f.x), f.y);
        }
        float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
        void main() {
          vec2 uv = gl_FragCoord.xy / uRes;
          vec2 p = vec2((uv.x - 0.5) * uRes.x / uRes.y, uv.y) + uCam;
          float y = p.y - 0.3; // height above the horizon
          vec3 col = mix(vec3(0.33, 0.19, 0.45), vec3(0.15, 0.1, 0.34), smoothstep(0.0, 0.3, y));
          col = mix(col, vec3(0.045, 0.035, 0.13), smoothstep(0.25, 0.85, y));
          vec2 sun = vec2(0.55, 0.3);
          float d = length((p - sun) * vec2(1.0, 1.6));
          col += vec3(1.0, 0.45, 0.3) * exp(-abs(y) * 9.0) * (0.25 + 0.5 * exp(-d * 2.5)); // horizon glow
          col += vec3(1.0, 0.6, 0.3) * exp(-d * 9.0) * 0.6;
          col = mix(col, vec3(1.0, 0.82, 0.45), smoothstep(0.052, 0.045, length(p - sun)));
          // stars: one per grid cell at most, twinkling
          vec2 g = p * 70.0, id = floor(g);
          float h = h21(id);
          if (h > 0.975) {
            float s = smoothstep(0.12, 0.0, length(fract(g) - 0.25 - 0.5 * vec2(h21(id + 7.0), h21(id + 3.0))));
            col += s * (0.55 + 0.45 * sin(uTime * (1.0 + h * 3.0) + h * 60.0)) * smoothstep(0.05, 0.35, y) * vec3(0.9, 0.88, 1.0);
          }
          // cloud sea: billowy top edge, lit warm near the sun, violet in the depths
          float edge = 0.31 + (fbm(vec2(p.x * 5.0 + uTime * 0.01, 3.0)) - 0.5) * 0.12;
          float depth = edge - p.y;
          if (depth > -0.02) {
            float puff = fbm(vec2(p.x * 7.0 + uTime * 0.015, p.y * 18.0 - uTime * 0.02));
            vec3 cc = mix(vec3(0.22, 0.14, 0.38), vec3(0.62, 0.36, 0.62), puff);
            cc += vec3(1.0, 0.5, 0.4) * exp(-depth * 10.0) * (0.25 + 0.6 * exp(-abs(p.x - sun.x) * 2.0)) * puff;
            col = mix(col, cc, smoothstep(-0.02, 0.02, depth));
          }
          gl_FragColor = vec4(col, 1.0); // colours above are already sRGB
        }`,
    }));
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);
  }

  fieldMat(c) {
    return new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, transparent: true, opacity: 0.3, depthWrite: false, map: this.stripes, emissiveMap: this.stripes });
  }

  makePlayer(color) {
    const root = new THREE.Group(), body = new THREE.Group();
    // jelly skin: fresnel rim glow added to the emissive term
    const skinMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, roughness: 0.3 });
    skinMat.onBeforeCompile = sh => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float rim = pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 2.5);
        totalEmissiveRadiance += mix(diffuseColor.rgb, vec3(1.0), 0.35) * rim * 1.4;`);
    };
    const skin = new THREE.Mesh(new THREE.CapsuleGeometry(PW / 2 - 0.01, PH - PW, 6, 16), skinMat);
    skin.castShadow = true;
    skin.position.y = PH / 2;
    body.add(skin);
    // sprout on top and stubby arms, same jelly
    const leafGeo = new THREE.SphereGeometry(0.09, 10, 6).scale(1.5, 0.55, 0.8);
    const arms = [], leaves = [];
    for (const s of [-1, 1]) {
      const leaf = new THREE.Mesh(leafGeo, skinMat);
      leaf.position.set(s * 0.08, PH + 0.06, 0);
      leaf.rotation.z = s * 0.6;
      const arm = new THREE.Mesh(leafGeo, skinMat);
      arm.position.set(s * (PW / 2 + 0.02), PH * 0.4, 0.05);
      arm.rotation.z = s * -0.9;
      body.add(leaf, arm);
      arms.push(arm);
      leaves.push(leaf);
    }
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, color, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    aura.position.set(0, PH / 2, -0.2);
    aura.scale.setScalar(PH * 2.4);
    root.add(aura);
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const black = new THREE.MeshBasicMaterial({ color: 0x14122a });
    const eyeGeo = new THREE.SphereGeometry(0.085, 12, 8), pupilGeo = new THREE.SphereGeometry(0.045, 8, 6);
    const pupils = [], eyes = [];
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, white);
      eyes.push(eye);
      eye.position.set(s * 0.12, PH * 0.62, 0.3);
      const pupil = new THREE.Mesh(pupilGeo, black);
      pupil.position.set(0, 0, 0.06);
      eye.add(pupil);
      pupils.push(pupil);
      body.add(eye);
    }
    // glossy highlight + cheeks
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false }));
    shine.position.set(-0.17, PH * 0.8, 0.24);
    shine.scale.set(0.8, 1.3, 0.4);
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xff9ab0, transparent: true, opacity: 0.55, depthWrite: false });
    for (const s of [-1, 1]) {
      const cheek = new THREE.Mesh(eyeGeo, cheekMat);
      cheek.position.set(s * 0.21, PH * 0.47, 0.27);
      cheek.scale.set(0.7, 0.4, 0.3);
      body.add(cheek);
    }
    body.add(shine);
    root.add(body);
    this.scene.add(root);
    return { root, body, pupils, eyes, arms, leaves, sq: 1, blink: rnd(1, 4), ph: 0, run: 0, face: 0, turnV: 0 };
  }

  initParticles() {
    const g = new THREE.BufferGeometry();
    this.pPos = new Float32Array(N_PART * 3).fill(-9999);
    this.pCol = new Float32Array(N_PART * 3);
    this.pBase = new Float32Array(N_PART * 3);
    this.pVel = new Float32Array(N_PART * 3);
    this.pLife = new Float32Array(N_PART);
    this.pMax = new Float32Array(N_PART).fill(1);
    this.pGrav = new Float32Array(N_PART);
    this.pNext = 0;
    g.setAttribute('position', new THREE.BufferAttribute(this.pPos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.pCol, 3).setUsage(THREE.DynamicDrawUsage));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({
      size: 0.25, map: this.dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    pts.frustumCulled = false;
    this.scene.add(pts);
    this.pGeo = g;
  }

  burst(x, y, color, n = 16, speed = 3, { life = 0.7, grav = 6, up = 0, spread = 0.2 } = {}) {
    const c = new THREE.Color(color);
    for (let k = 0; k < n; k++) {
      const i = this.pNext, j = i * 3;
      this.pNext = (i + 1) % N_PART;
      const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random() * 0.6);
      this.pPos[j] = x + (Math.random() - 0.5) * spread;
      this.pPos[j + 1] = y + (Math.random() - 0.5) * spread;
      this.pPos[j + 2] = (Math.random() - 0.5) * 0.6;
      this.pVel[j] = Math.cos(a) * s;
      this.pVel[j + 1] = Math.sin(a) * s + up;
      this.pVel[j + 2] = (Math.random() - 0.5) * s * 0.5;
      this.pBase[j] = c.r; this.pBase[j + 1] = c.g; this.pBase[j + 2] = c.b;
      this.pLife[i] = this.pMax[i] = life * (0.6 + Math.random() * 0.4);
      this.pGrav[i] = grav;
    }
  }

  build(g) {
    for (const o of [...this.level.children]) {
      if (o.isInstancedMesh) o.dispose();
      if (o.userData.own) o.geometry.dispose();
      o.userData.mat?.alphaMap?.dispose();
      o.userData.mat?.dispose();
      this.level.remove(o);
    }
    const add = (geo, mat, x, y, z = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      this.level.add(m);
      return m;
    };
    const inst = (geo, mat, list, place) => {
      if (!list.length) return;
      const m = new THREE.InstancedMesh(geo, mat, list.length), o = new THREE.Object3D();
      list.forEach((it, i) => { place(o, it, i); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
      this.level.add(m);
      return m;
    };
    const { w, h } = g;
    const isSolid = (x, y) => g.cell(x, y) === '#';

    // back wall: crumbling ruin that hugs the solid tiles; open sky shows through the gaps
    const wallGeo = new THREE.PlaneGeometry(w, h);
    const wallMat = this.mat.wall.clone();
    wallMat.alphaMap = this.ruinMask(g);
    const wall = add(wallGeo, wallMat, w / 2, h / 2, -0.7);
    wall.userData.own = true;
    wall.userData.mat = wallMat;
    wall.receiveShadow = true;
    this.mat.wall.map.repeat.set(w, h);

    // solid tiles: only those touching open space are visible
    const tiles = [], caps = [], spikes = [], red = [], blue = [], stops = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = g.cell(x, y);
      if (c === '#') {
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
          const nx = x + dx, ny = y + dy;
          return nx >= 0 && ny >= 0 && nx < w && ny < h && !isSolid(nx, ny);
        })) tiles.push({ x, y });
        if (y + 1 < h && !isSolid(x, y + 1)) caps.push({ x, y });
      } else if (c === '^') spikes.push({ x, y });
      else if (c === 'R') red.push({ x, y });
      else if (c === 'U') blue.push({ x, y });
      else if (c === ':') stops.push({ x, y });
    }
    const tm = inst(this.geo.box, this.mat.tile, tiles, (o, t) => o.position.set(t.x + 0.5, t.y + 0.5, 0));
    if (tm) {
      const col = new THREE.Color();
      tiles.forEach((t, i) => tm.setColorAt(i, col.setHSL(0.7 + hash(t.x, t.y) * 0.04, 0.3, 0.22 + hash(t.y, t.x) * 0.06)));
      tm.castShadow = tm.receiveShadow = true;
    }
    const cm = inst(this.geo.cap, this.mat.cap, caps, (o, t) => o.position.set(t.x + 0.5, t.y + 0.96, 0));
    if (cm) cm.receiveShadow = true;
    const spikeList = spikes.flatMap(s => [0.2, 0.5, 0.8].map(dx => ({ x: s.x + dx, y: s.y })));
    inst(this.geo.spike, this.mat.spike, spikeList, (o, s) => o.position.set(s.x, s.y + 0.225, 0));
    inst(this.geo.field, this.mat.red, red, (o, t) => o.position.set(t.x + 0.5, t.y + 0.5, 0));
    inst(this.geo.field, this.mat.blue, blue, (o, t) => o.position.set(t.x + 0.5, t.y + 0.5, 0));
    // rail stops: small markers showing where a saw turns around
    inst(this.geo.stop, this.mat.stop, stops, (o, t) => o.position.set(t.x + 0.5, t.y + 0.5, -0.3));
    this.decorate(g, caps, inst);

    this.dyn = g.dyn.map(d => {
      const m = add(d.door ? this.geo.door : this.geo.bridge, (d.door ? this.mat.door : this.mat.ch)[d.ch], d.x + 0.5, 0);
      m.castShadow = m.receiveShadow = true;
      return { d, m, vis: d.solid ? 1 : 0 };
    });
    this.plates = g.plates.map(p => {
      const mat = this.mat.ch[p.ch].clone();
      const m = add(this.geo.plate, mat, p.x + 0.5, p.y + 0.06);
      m.receiveShadow = true;
      m.userData.mat = mat;
      return { p, m, mat };
    });
    this.gems = g.gems.map(gm => ({ g: gm, m: add(this.geo.gem, this.mat.gem, gm.x + 0.5, gm.y + 0.5) }));
    this.gems.forEach(o => { o.m.castShadow = true; o.m.add(new THREE.Sprite(this.mat.halo)); });

    this.drones = g.drones.map(d => {
      const grp = new THREE.Group();
      grp.add(new THREE.Mesh(this.geo.blade, this.mat.blade), new THREE.Mesh(this.geo.teeth, this.mat.danger),
        new THREE.Mesh(this.geo.hub, this.mat.danger));
      grp.children.forEach(c => { c.castShadow = true; });
      this.level.add(grp);
      return { d, grp };
    });
    this.cannons = g.cannons.map(c => {
      const body = add(this.geo.cannon, this.mat.cannon, c.x + 0.5, c.y + 0.5);
      const barrel = new THREE.Mesh(this.geo.barrel, this.mat.danger);
      barrel.position.x = c.dir * 0.5;
      body.add(barrel);
      body.castShadow = body.receiveShadow = true;
      return { c, body, barrel };
    });

    // exit portal around the bounding box of all E tiles
    const ex = g.exits;
    this.exit = null;
    if (ex.length) {
      const x0 = Math.min(...ex.map(e => e.x)), x1 = Math.max(...ex.map(e => e.x)) + 1;
      const y0 = Math.min(...ex.map(e => e.y)), y1 = Math.max(...ex.map(e => e.y)) + 1;
      const cx = (x0 + x1) / 2, bw = x1 - x0, bh = y1 - y0;
      const bars = [[x0, y0 + bh / 2, 0.14, bh], [x1, y0 + bh / 2, 0.14, bh], [cx, y1, bw + 0.14, 0.14]];
      for (const [x, y, sx, sy] of bars) add(this.geo.bar, this.mat.exit, x, y, -0.2).scale.set(sx, sy, 1);
      const portalGeo = new THREE.PlaneGeometry(bw, bh);
      const portal = add(portalGeo, this.mat.portal, cx, y0 + bh / 2, -0.3);
      portal.userData.own = true;
      this.mat.portal.map.repeat.set(1, bh / 2);
      this.exit = { x0, x1, y0, y1 };
    }

    // background floaters spread around the level
    const o = new THREE.Object3D();
    this.floatData = Array.from({ length: N_FLOAT }, () => ({
      x: -12 + Math.random() * (w + 24), y: -6 + Math.random() * (h + 14), z: -14 - Math.random() * 18,
      s: 0.4 + Math.random() * 1.4, r: Math.random() * 6, v: (Math.random() - 0.5) * 0.4, fall: Math.random() < 0.3,
    }));
    this.floatObj = o;

    this.updateDyn(g, 1e3);
    this.update(g, 0, 0, true);
  }

  // White where the back wall stands: blobs around cells within ~1-2 tiles of a solid tile.
  ruinMask(g) {
    const S = 8, { w, h } = g, dist = new Array(w * h).fill(99), q = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g.cell(x, y) === '#') { dist[y * w + x] = 0; q.push(x, y); }
    for (let i = 0; i < q.length; i += 2) { // BFS distance to nearest solid
      const x = q[i], y = q[i + 1], d = dist[y * w + x] + 1;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && dist[ny * w + nx] > d) { dist[ny * w + nx] = d; q.push(nx, ny); }
      }
    }
    const t = canvasTex(w * S, h * S, c => {
      c.fillStyle = '#000'; c.fillRect(0, 0, w * S, h * S); c.fillStyle = '#fff';
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const r = hash(x + g.index * 5.3, y * 1.9);
        if (dist[y * w + x] > 0.6 + r * 1.8) continue;
        c.beginPath(); c.arc((x + 0.5) * S, (h - y - 0.5) * S, S * (0.75 + hash(y, x) * 0.4), 0, Math.PI * 2); c.fill();
      }
    });
    t.colorSpace = THREE.NoColorSpace;
    return t;
  }

  // Scenery only (never collides): placed by hash(x, y) so a stage looks the same every load.
  // Everything sits behind the play plane (z < -0.35) or on tile fronts, and casts no shadows.
  decorate(g, caps, inst) {
    const H = (x, y) => hash(x + g.index * 13.7, y); // per-stage seed
    const empty = (x, y) => g.cell(x, y) === '.', solid = (x, y) => g.cell(x, y) === '#';
    const col = new THREE.Color(), tint = (m, list) => m && list.forEach((it, i) => m.setColorAt(i, col.set(it.c)));
    const FLOWERS = [0xffffff, 0xffffff, 0xffffff, 0xffc0d8, 0xd8c0ff];
    const GLASS = [0x9f7dff, 0x7df9ff, 0xff8ad8];

    inst(this.geo.fringe, this.mat.fringe, caps, (o, t) => o.position.set(t.x + 0.5, t.y + 1, 0.73));

    const tufts = [], flowers = [];
    for (const t of caps) {
      if (!'.*12'.includes(g.cell(t.x, t.y + 1))) continue;
      for (let k = 0; k < 3; k++) {
        const r = H(t.x + k * 17.3, t.y * 3.1);
        if (r > 0.65) continue;
        const back = H(t.y + k, t.x * 1.7) < 0.65;
        const it = {
          x: t.x + 0.2 + H(t.x * 2.3, t.y + k) * 0.6, y: t.y + 1.02,
          z: back ? -0.35 - r * 0.45 : 0.45 + r * 0.3, sx: 0.45 + r * 0.4, sy: back ? 0.32 + r * 0.4 : 0.16 + r * 0.14,
        };
        tufts.push(it);
        if (back && r < 0.3) flowers.push({ ...it, y: it.y + it.sy * 0.85, c: FLOWERS[Math.floor(H(t.x, k) * FLOWERS.length)] });
      }
      // daisies on the grass lip, facing the camera
      if (H(t.x * 5.1, t.y + 2) < 0.22) flowers.push({ x: t.x + 0.2 + H(t.y, t.x * 3) * 0.6, y: t.y + 0.93, z: 0.76, c: 0xffffff });
    }
    inst(this.geo.tuft, this.mat.tuft, tufts, (o, t) => { o.position.set(t.x, t.y, t.z); o.scale.set(t.sx, t.sy, 1); });
    tint(inst(this.geo.flower, this.mat.flower, flowers, (o, t) => { o.position.set(t.x, t.y, t.z + 0.02); o.rotation.z = t.x * 7; }), flowers);

    const vines = [], lamps = [], crystals = [], lastLamp = {};
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      // vines under ceilings, leaving a tile of headroom
      if (solid(x, y) && empty(x, y - 1) && H(x * 3.7, y) < 0.3) {
        const n = 1 + Math.floor(H(x, y * 5.1) * 3), vx = x + 0.3 + H(y, x) * 0.4, flip = H(x, y) < 0.5 ? -1 : 1;
        for (let s = 0; s < n * 2 && empty(x, y - 2 - Math.floor(s / 2)); s++) vines.push({ x: vx, y: y - s * 0.5, flip });
      }
      // wall lanterns ~1.5 tiles above a floor, spaced out along the row
      if (empty(x, y) && empty(x, y - 1) && solid(x, y - 2) && H(x + 0.3, y * 1.7) < 0.3 && x - (lastLamp[y] ?? -9) > 5) {
        lastLamp[y] = x;
        lamps.push({ x: x + 0.5, y: y + 0.4, f: H(x, y) * 6 });
      }
      // crystal clusters on floors
      if (empty(x, y) && solid(x, y - 1) && H(x * 1.3 + 7, y) < 0.07) {
        for (let k = 0; k < 3; k++) {
          const sy = 1.2 + H(x + k, y) * 1.4;
          crystals.push({ x: x + 0.5 + (k - 1) * 0.13, y: y + 0.07 * sy, sy, rz: (k - 1) * 0.35, c: GLASS[Math.floor(H(x, y + k) * 3)] });
        }
      }
    }
    inst(this.geo.vine, this.mat.vine, vines, (o, v) => { o.position.set(v.x, v.y, -0.55); o.scale.set(0.3 * v.flip, 0.5, 1); });
    inst(this.geo.lamp, this.mat.lamp, lamps, (o, l) => o.position.set(l.x, l.y, -0.6));
    inst(this.geo.lampCap, this.mat.lampFrame, lamps, (o, l) => o.position.set(l.x, l.y + 0.16, -0.6));
    inst(this.geo.glow, this.mat.glow, lamps, (o, l) => { o.position.set(l.x, l.y, -0.62); o.scale.setScalar(2.8); });
    tint(inst(this.geo.crystal, this.mat.crystal, crystals, (o, c) => {
      o.position.set(c.x, c.y, -0.5); o.rotation.set(0, 0.4, c.rz); o.scale.set(1, c.sy, 1);
    }), crystals);
  }

  updateDyn(g, dt) {
    for (const it of this.dyn) {
      const { d, m } = it;
      it.vis = damp(it.vis, d.solid ? 1 : 0, 14, dt);
      const s = Math.max(0.06, it.vis);
      if (d.door) { m.scale.y = s; m.position.y = d.y + 1 - s / 2; } else { m.scale.x = s; m.position.y = d.y + 0.86; }
    }
  }

  // one-shot effects from game events
  fx(type, data) {
    if (type === 'jump') this.players[data.id].sq = 1.25;
    else if (type === 'land') {
      this.players[data.p.id].sq = Math.max(0.65, 1 - data.v * 0.02);
      this.burst(data.p.x, data.p.y + 0.05, 0xcfc8ff, 6, 1.5, { life: 0.35, grav: 2, spread: 0.5 });
    } else if (type === 'gem') this.burst(data.x + 0.5, data.y + 0.5, COLORS.gem, 24, 4);
    else if (type === 'plate' && data.on) this.burst(data.x + 0.5, data.y + 0.15, COLORS.ch[data.ch], 12, 2.5, { up: 1.5 });
    else if (type === 'shoot') {
      const k = this.cannons.find(o => o.c === data);
      if (k) k.barrel.scale.x = 1.6;
      this.burst(data.x + 0.5 + data.dir * 0.8, data.y + 0.45, 0xffc46b, 10, 2.5, { life: 0.3, grav: 0 });
    } else if (type === 'die') {
      this.burst(data.x, data.y + PH / 2, COLORS.p[data.id], 50, 6, { life: 0.9 });
      if (!this.calm) this.shake = 0.35;
    }
  }

  update(g, dt, time, snap = false) {
    this.updateDyn(g, dt);
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);
    for (const { p, m, mat } of this.plates) {
      m.position.y = damp(m.position.y, p.y + (p.on ? 0.02 : 0.06), 20, dt);
      mat.emissiveIntensity = damp(mat.emissiveIntensity, p.on ? 1.6 : 0.35, 10, dt);
    }
    for (const [k, m] of Object.entries(this.mat.ch)) m.emissiveIntensity = g.active[k] ? 0.9 : 0.35;
    for (const [k, m] of Object.entries(this.mat.door)) m.emissiveIntensity = (g.active[k] ? 2 : 1.1) + pulse * 0.3;
    for (const { d, grp } of this.drones) {
      grp.position.set(d.x, d.y, 0);
      grp.rotation.z -= dt * 14 * Math.sign(d.vx || d.vy);
      if (Math.random() < dt * 20) this.burst(d.x, d.y, 0xff5a4a, 1, 0.5, { life: 0.35, grav: 0, spread: 0.3 });
    }
    for (const { barrel } of this.cannons) barrel.scale.x = damp(barrel.scale.x, 1, 12, dt);
    this.boltMeshes.forEach((m, i) => {
      const b = g.bolts[i];
      m.visible = !!b;
      if (!b) return;
      m.position.set(b.x, b.y, 0);
      if (Math.random() < dt * 40) this.burst(b.x, b.y, 0xffa040, 1, 0.4, { life: 0.3, grav: 0, spread: 0.1 });
    });
    for (const { g: gm, m } of this.gems) {
      m.visible = !gm.taken;
      m.rotation.y = time * 2;
      m.position.y = gm.y + 0.5 + Math.sin(time * 3 + gm.x) * 0.08;
      m.children[0].scale.setScalar(0.9 + Math.sin(time * 4 + gm.x) * 0.15);
    }
    this.mat.red.opacity = this.mat.blue.opacity = 0.38 + pulse * 0.14;
    const exitOn = g.players.some(p => p.inExit);
    this.mat.portal.opacity = (exitOn ? 0.35 : 0.14) + pulse * 0.1;
    this.mat.portal.map.offset.y = -time * 0.35;
    this.stripes.offset.x = time * 0.25;
    this.mat.glow.opacity = 0.42 + Math.sin(time * 7.3) * 0.04 + Math.sin(time * 13.1) * 0.03;
    this.sky.material.uniforms.uTime.value = time;
    this.sky.material.uniforms.uCam.value.set(this.cam.x * 0.006, this.cam.y * 0.01);
    if (this.exit && Math.random() < dt * 14) {
      const e = this.exit;
      this.burst(e.x0 + Math.random() * (e.x1 - e.x0), e.y0 + 0.1, COLORS.exit, 1, 0.3, { life: 1.4, grav: -1.2, spread: 0 });
    }

    g.players.forEach((p, i) => {
      const v = this.players[i];
      v.root.visible = !p.dead;
      v.root.position.set(p.x, p.y, 0);
      v.sq = damp(v.sq, 1, 12, dt);
      // walk cycle: phase advances with distance so steps match speed; run eases in/out
      const spd = Math.abs(p.vx);
      v.run = damp(v.run, p.grounded && spd > 0.5 ? Math.min(spd / 6, 1) : 0, 12, dt);
      v.ph += dt * spd * 2.6;
      const step = Math.sin(v.ph), hop = Math.abs(step);
      v.body.position.y = hop * 0.09 * v.run;
      v.body.scale.set(1 / Math.sqrt(v.sq) + (1 - hop) * 0.05 * v.run, v.sq - (1 - hop) * 0.07 * v.run, 1 / Math.sqrt(v.sq));
      v.body.rotation.z = damp(v.body.rotation.z, -p.vx * 0.035 + step * 0.08 * v.run, 10, dt);
      // turn toward travel direction: springy snap with slight overshoot, deeper profile at speed
      if (p.facing !== v.face) { if (v.face) v.sq = Math.min(v.sq, 0.86); v.face = p.facing; }
      const sdt = Math.min(dt, 1 / 30), ry = v.body.rotation.y;
      v.turnV += ((p.facing * (0.25 + 0.45 * v.run) - ry) * 260 - v.turnV * 19) * sdt;
      v.body.rotation.y = ry + v.turnV * sdt;
      v.arms.forEach((a, k) => { a.rotation.z = (k ? -0.9 : 0.9) + step * 0.7 * v.run * (k ? 1 : -1); });
      v.leaves.forEach((l, k) => { l.rotation.z = (k ? 0.6 : -0.6) - p.vx * 0.04 + Math.sin(v.ph * 2) * 0.15 * v.run; });
      for (const pu of v.pupils) pu.position.x = p.facing * 0.03;
      if ((v.blink -= dt) < 0) v.blink = rnd(2, 5);
      for (const e of v.eyes) e.scale.y = v.blink < 0.12 ? 0.15 : 1;
      if (p.grounded && Math.abs(p.vx) > 3 && Math.random() < dt * 12) {
        this.burst(p.x - Math.sign(p.vx) * 0.2, p.y + 0.05, 0xb9b0e8, 1, 0.6, { life: 0.4, grav: 1, up: 0.6, spread: 0.2 });
      }
    });
    // ambient dust motes drifting up around the view
    if (Math.random() < dt * 5) {
      this.burst(this.cam.x + rnd(-1, 1) * this.cam.z * 0.8, this.cam.y + rnd(-1, 1) * this.cam.z * 0.4, 0x7a6cc4, 1, 0.15, { life: 3.5, grav: -0.15, spread: 0 });
    }

    const fo = this.floatObj;
    const [rock, lid, fall] = this.floaters;
    this.floatData.forEach((f, i) => {
      fo.position.set(f.x, f.y + Math.sin(time * 0.3 + f.r) * 0.4, f.z);
      fo.rotation.set(0, f.r + time * f.v * 0.2, 0);
      fo.scale.setScalar(f.s);
      fo.updateMatrix();
      rock.setMatrixAt(i, fo.matrix);
      lid.setMatrixAt(i, fo.matrix);
      if (!f.fall) fo.scale.setScalar(0);
      fo.rotation.y = 0; // waterfall stays facing the camera
      fo.updateMatrix();
      fall.setMatrixAt(i, fo.matrix);
    });
    for (const m of this.floaters) m.instanceMatrix.needsUpdate = true;
    this.mat.fall.map.offset.y = time * 0.8;

    this.updateParticles(dt);
    this.updateCamera(g, dt, snap);
    this.renderer.render(this.scene, this.camera);
    this.adapt(dt);
  }

  updateParticles(dt) {
    const P = this.pPos, V = this.pVel, C = this.pCol, B = this.pBase;
    for (let i = 0; i < N_PART; i++) {
      if (this.pLife[i] <= 0) continue;
      const j = i * 3;
      this.pLife[i] -= dt;
      if (this.pLife[i] <= 0) { P[j + 1] = -9999; continue; }
      V[j + 1] -= this.pGrav[i] * dt;
      const drag = 1 - 2 * dt;
      V[j] *= drag; V[j + 2] *= drag;
      P[j] += V[j] * dt; P[j + 1] += V[j + 1] * dt; P[j + 2] += V[j + 2] * dt;
      const f = this.pLife[i] / this.pMax[i];
      C[j] = B[j] * f; C[j + 1] = B[j + 1] * f; C[j + 2] = B[j + 2] * f;
    }
    this.pGeo.attributes.position.needsUpdate = true;
    this.pGeo.attributes.color.needsUpdate = true;
  }

  // Frame both players, never show outside the level when avoidable.
  updateCamera(g, dt, snap) {
    const [a, b] = g.players, cam = this.camera;
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2)), asp = cam.aspect;
    const halfH = Math.abs(a.y - b.y) / 2 + 4.5, halfW = Math.abs(a.x - b.x) / 2 + 7;
    // touch buttons cover the bottom ~25% of a phone screen: frame the level above them
    const pad = document.body.classList.contains('touch') ? 0.25 : 0;
    const fitAll = Math.max(g.h / 2 / (tan * (1 - pad)), g.w / 2 / (tan * asp)) + 1;
    const dist = Math.min(Math.max(halfH / (tan * (1 - pad)), halfW / (tan * asp), 15), fitAll);
    const vh = dist * tan, vw = vh * asp;
    const clamp = (v, half, size) => (half * 2 >= size ? size / 2 : Math.min(Math.max(v, half), size - half));
    const tx = clamp((a.x + b.x) / 2, vw, g.w), ty = clamp((a.y + b.y) / 2 + 0.6, vh * (1 - pad), g.h) - vh * pad;
    const k = snap ? 1e3 : 3.5, t = snap ? 1 : dt;
    this.cam.set(damp(this.cam.x, tx, k, t), damp(this.cam.y, ty, k, t), damp(this.cam.z, dist, k, t));
    // short decaying shake on death
    this.shake = Math.max(0, this.shake - dt);
    const sx = this.shake ? rnd(-1, 1) * this.shake * 0.5 : 0, sy = this.shake ? rnd(-1, 1) * this.shake * 0.5 : 0;
    cam.position.set(this.cam.x + sx, this.cam.y + this.cam.z * 0.06 + sy, this.cam.z);
    cam.lookAt(this.cam.x + sx, this.cam.y + sy, 0);
    this.sun.position.set(this.cam.x + 6, this.cam.y + 12, 14);
    this.sun.target.position.set(this.cam.x, this.cam.y, 0);
  }

  // Drop resolution on slow devices (mobile GPUs) until frames hold ~40fps; at 1x still slow, drop shadows (one shader recompile).
  adapt(dt) {
    if (!dt || !this.measure) return; // only gameplay frames (menus render at half rate on purpose)
    this.frameAvg = this.frameAvg * 0.95 + dt * 0.05;
    if ((this.perfTimer += dt) < 2) return;
    this.perfTimer = 0;
    if (this.frameAvg > 1 / 40 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25);
      this.resize();
    } else if (this.frameAvg > 1 / 40 && this.sun.castShadow) this.sun.castShadow = false;
  }

  resize() {
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.renderer.getDrawingBufferSize(this.sky.material.uniforms.uRes.value);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
