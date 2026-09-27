import * as THREE from 'three';

export const CYAN = 0x2ef2ff;

const grad = new THREE.DataTexture(new Uint8Array([60, 140, 200]), 3, 1, THREE.RedFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;

const NO_FLASH = { value: 0 };

// 3-band toon + cyan fresnel rim + flash uniform. Pass a `{ value }` ref per object group (e.g. one per worker) so flashes stay local.
export function toon(color, emissive = 0x000000, ei = 1, flash = NO_FLASH) {
  const m = new THREE.MeshToonMaterial({ color, gradientMap: grad, emissive, emissiveIntensity: ei });
  m.onBeforeCompile = sh => {
    sh.uniforms.uFlash = flash || NO_FLASH;
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uFlash;')
      .replace('#include <opaque_fragment>', `
        float rim = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 4.0);
        outgoingLight += vec3(0.18, 0.95, 1.0) * rim * 0.35;
        outgoingLight = mix(outgoingLight, vec3(0.7, 1.5, 1.6), uFlash);
        #include <opaque_fragment>`);
  };
  return m;
}

// inverted-hull outline: BackSide copy scaled to constant ~0.01 thickness
const hullMat = new THREE.MeshBasicMaterial({ color: 0x05060e, side: THREE.BackSide });
const O = 0.022, sz = new THREE.Vector3();
export function part(geo, mat, outline = true) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = true;
  if (outline) {
    geo.computeBoundingBox(); geo.boundingBox.getSize(sz);
    const h = new THREE.Mesh(geo, hullMat); h.scale.set(1 + O / sz.x, 1 + O / sz.y, 1 + O / sz.z); m.add(h);
  }
  return m;
}

// geometry cache: workers spawn/despawn constantly, so never dispose, just reuse
const geos = new Map();
export const cached = (key, make) => geos.get(key) ?? (geos.set(key, make()), geos.get(key));
// level teardown: free every geometry under root and evict it from the cache (a shared one still in use just re-uploads)
export function release(root) {
  const gone = new Set();
  root.traverse(o => { if (o.geometry && !gone.has(o.geometry)) { gone.add(o.geometry); o.geometry.dispose(); } });
  for (const [k, g] of geos) if (gone.has(g)) geos.delete(k);
}
export const box = (w, h, d, mat, o) => part(cached(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)), mat, o);
export const cyl = (r, h, mat, o) => part(cached(`c${r},${h}`, () => new THREE.CylinderGeometry(r, r, h, 16)), mat, o);
