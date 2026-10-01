// Named re-exports so Rollup tree-shakes three down to what HeroBackground
// uses; `import('three')` as a namespace keeps the whole ~750 kB library.
export {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Group,
  PerspectiveCamera, Points, PointsMaterial, Scene, Sprite, SpriteMaterial,
  SRGBColorSpace, WebGLRenderer,
} from 'three';
export type { Texture } from 'three';
