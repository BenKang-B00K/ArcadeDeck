import * as THREE from 'three';

export const COL = [0x3ab8ff, 0xff4f6e, 0xa872ff, 0xffbf2e]; // banner team colours: P1 blue, P2 red, P3 purple, P4 gold
export const hex = i => '#' + COL[i].toString(16).padStart(6, '0');

export const mulberry32 = a => () => {
  a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function disposeScene(scene) {
  scene.traverse(o => {
    o.geometry?.dispose();
    for (const m of [o.material].flat()) {
      if (!m) continue;
      for (const v of Object.values(m)) if (v?.isTexture) v.dispose(); // every slot: map, emissiveMap, alphaMap…
      m.dispose();
    }
  });
}

export const buzz = ms => { if (navigator.userActivation?.hasBeenActive ?? true) navigator.vibrate?.(ms); };

export function flash(el, text, cls = '') {
  el.textContent = text;
  el.className = 'pmsg ' + cls;
  void el.offsetWidth; // restart CSS animation
  el.classList.add('pop');
}

// Pooled additive particles; a dead particle is just black (invisible under additive blending).
export class Burst {
  constructor(scene, n = 200) {
    this.n = n; this.i = 0; this.active = false;
    this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3); this.life = new Float32Array(n);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    const dot = canvasTex(32, 32, (x, w) => {
      const gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, '#fff'); gr.addColorStop(.4, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = gr; x.fillRect(0, 0, w, w);
    });
    this.pts = new THREE.Points(g, new THREE.PointsMaterial({ size: .35, map: dot, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    this.pts.frustumCulled = false;
    this.c = new THREE.Color();
    scene.add(this.pts);
  }
  emit(x, y, z, color, count = 24, speed = 6) {
    this.c.set(color);
    for (let k = 0; k < count; k++) {
      const i = this.i, j = i * 3;
      this.i = (i + 1) % this.n;
      this.pos[j] = x; this.pos[j + 1] = y; this.pos[j + 2] = z;
      this.vel[j] = (Math.random() - .5) * 2 * speed;
      this.vel[j + 1] = Math.random() * speed;
      this.vel[j + 2] = (Math.random() - .5) * 2 * speed;
      this.col[j] = this.c.r; this.col[j + 1] = this.c.g; this.col[j + 2] = this.c.b;
      this.life[i] = .6 + Math.random() * .5;
    }
    this.active = true;
  }
  update(dt) {
    if (!this.active) return;
    let any = false;
    const fade = Math.pow(.05, dt), { pos, vel, col, life } = this;
    for (let i = 0; i < this.n; i++) {
      if (life[i] <= 0) continue;
      const j = i * 3;
      if ((life[i] -= dt) <= 0) { col[j] = col[j + 1] = col[j + 2] = 0; continue; }
      any = true;
      vel[j + 1] -= 12 * dt;
      pos[j] += vel[j] * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt;
      col[j] *= fade; col[j + 1] *= fade; col[j + 2] *= fade;
    }
    const a = this.pts.geometry.attributes;
    a.position.needsUpdate = a.color.needsUpdate = true;
    this.active = any;
  }
}

// Neon reflection map (PMREM of a vertex-coloured dome + two softboxes). Built once; scenes point scene.environment at it.
export let ENV = null;
export function initEnv(renderer) {
  if (ENV) return;
  const s = new THREE.Scene(), g = new THREE.SphereGeometry(10, 48, 24), p = g.attributes.position, cols = [];
  const c = new THREE.Color(), mag = new THREE.Color(0xff3aa8), cy = new THREE.Color(0x35e0ff), top = new THREE.Color(0xbfd0ff);
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 10;
    c.setHex(0x05060f)
      .add(mag.clone().multiplyScalar(3 * Math.exp(-((y - .04) ** 2) / .006)))
      .add(cy.clone().multiplyScalar(2 * Math.exp(-((y - .35) ** 2) / .004)))
      .add(top.clone().multiplyScalar(4 * THREE.MathUtils.smoothstep(y, .8, 1)));
    cols.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  s.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  for (const [x, y, z, col] of [[7, 2, -6, 0xffffff], [-7, 3, 5, 0xffc080]]) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(3, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(3), side: THREE.DoubleSide }));
    b.position.set(x, y, z); b.lookAt(0, 0, 0); s.add(b);
  }
  const pm = new THREE.PMREMGenerator(renderer);
  ENV = pm.fromScene(s, .02).texture;
  pm.dispose(); disposeScene(s);
}
export const useEnv = (scene, k = .4) => { scene.environment = ENV; scene.environmentIntensity = k; };

// Screen-space glow: copy the finished frame, blur its bright parts at 1/4 and 1/8 res, add it back on top.
// Runs once after every pane is drawn, so split screen needs nothing special. Works on display-space colour.
export class Bloom {
  constructor(renderer, strength = .65, threshold = .7) {
    this.r = renderer; this.on = true; this.sz = new THREE.Vector2(); this.src = null;
    const vs = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
    const mk = (u, fs, o = {}) => new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: 'varying vec2 vUv;\n' + fs, depthTest: false, depthWrite: false, ...o });
    // 4 bilinear taps = 4x4 box downsample; soft knee on the brightest channel so saturated neon glows too
    this.bright = mk({ t: { value: null }, px: { value: new THREE.Vector2() }, th: { value: threshold } }, `uniform sampler2D t; uniform vec2 px; uniform float th;
      void main() {
        vec3 c = (texture2D(t, vUv - px).rgb + texture2D(t, vUv + px).rgb + texture2D(t, vUv + vec2(px.x, -px.y)).rgb + texture2D(t, vUv + vec2(-px.x, px.y)).rgb) * .25;
        gl_FragColor = vec4(c * smoothstep(th, 1., max(c.r, max(c.g, c.b))), 1.);
      }`);
    // 9-tap gaussian in 5 linear fetches
    this.blur = mk({ t: { value: null }, d: { value: new THREE.Vector2() } }, `uniform sampler2D t; uniform vec2 d;
      void main() {
        vec3 c = texture2D(t, vUv).rgb * .227027;
        c += (texture2D(t, vUv + d * 1.384615).rgb + texture2D(t, vUv - d * 1.384615).rgb) * .316216;
        c += (texture2D(t, vUv + d * 3.230769).rgb + texture2D(t, vUv - d * 3.230769).rgb) * .070270;
        gl_FragColor = vec4(c, 1.);
      }`);
    this.add = mk({ a: { value: null }, b: { value: null }, k: { value: strength } }, `uniform sampler2D a, b; uniform float k;
      void main() { gl_FragColor = vec4((texture2D(a, vUv).rgb + texture2D(b, vUv).rgb * 1.6) * k, 1.); }`,
      { blending: THREE.AdditiveBlending, transparent: true });
    this.rt = [0, 1, 2, 3].map(() => new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false }));
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.quad.frustumCulled = false;
    this.scene = new THREE.Scene(); this.scene.add(this.quad);
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  pass(mat, target) { this.quad.material = mat; this.r.setRenderTarget(target); this.r.render(this.scene, this.cam); }
  blurTo(from, mid, to) {
    const b = this.blur.uniforms;
    b.t.value = from.texture; b.d.value.set(1 / mid.width, 0); this.pass(this.blur, mid);
    b.t.value = mid.texture; b.d.value.set(0, 1 / to.height); this.pass(this.blur, to);
  }
  render() {
    if (!this.on) return;
    const r = this.r, { x: w, y: h } = r.getDrawingBufferSize(this.sz), [q0, q1, e0, e1] = this.rt;
    if (this.src?.image.width !== w || this.src?.image.height !== h) {
      this.src?.dispose();
      this.src = new THREE.FramebufferTexture(w, h);
      this.src.minFilter = this.src.magFilter = THREE.LinearFilter;
      q0.setSize(Math.ceil(w / 4), Math.ceil(h / 4)); q1.setSize(q0.width, q0.height);
      e0.setSize(Math.ceil(w / 8), Math.ceil(h / 8)); e1.setSize(e0.width, e0.height);
    }
    const ac = r.autoClear;
    r.autoClear = false;
    r.copyFramebufferToTexture(this.src);
    const u = this.bright.uniforms;
    u.t.value = this.src; u.px.value.set(1 / w, 1 / h);
    this.pass(this.bright, q0);
    this.blurTo(q0, q1, q0);       // tight glow, 1/4 res
    this.blurTo(q0, e0, e1);       // wide glow, 1/8 res
    this.blurTo(e1, e0, e1);
    this.add.uniforms.a.value = q0.texture; this.add.uniforms.b.value = e1.texture;
    r.setRenderTarget(null);
    r.setViewport(0, 0, w / r.getPixelRatio(), h / r.getPixelRatio());
    this.pass(this.add, null);
    r.autoClear = ac;
  }
}
