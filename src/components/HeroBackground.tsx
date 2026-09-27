import { useEffect, useRef } from 'react';
import type * as THREE_NS from 'three';
import './HeroBackground.css';

// Soft round sprite so points render as glows, not squares.
const dotTexture = (THREE: typeof THREE_NS) => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  if (!g) return null;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
};

const cloud = (THREE: typeof THREE_NS, count: number, spread: number, color: number, size: number, opacity: number, map: THREE_NS.Texture | null) => {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] = (Math.random() - 0.5) * spread;
    pos[i + 1] = (Math.random() - 0.5) * spread * 0.6;
    pos[i + 2] = (Math.random() - 0.5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size,
    map: map ?? undefined,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
};

// Cute drifters — one line-art glyph per genre family on the site, drawn with
// canvas paths. No sprite sheet, no icon dep, no network request; the glow is
// just shadowBlur.
type Glyph = { color: string; draw: (g: CanvasRenderingContext2D) => void };

const GLYPHS: Glyph[] = [
  // Tower Defense
  {
    color: '#00e5ff',
    draw: g => {
      g.beginPath();
      g.moveTo(34, 46); g.lineTo(34, 28); g.lineTo(48, 28); g.lineTo(48, 40);
      g.lineTo(58, 40); g.lineTo(58, 28); g.lineTo(70, 28); g.lineTo(70, 40);
      g.lineTo(80, 40); g.lineTo(80, 28); g.lineTo(94, 28); g.lineTo(94, 46);
      g.closePath(); g.stroke();
      g.beginPath();
      g.moveTo(42, 46); g.lineTo(42, 106); g.lineTo(86, 106); g.lineTo(86, 46);
      g.stroke();
      g.beginPath(); g.arc(64, 70, 9, 0, Math.PI * 2); g.stroke();
    },
  },
  // RPG
  {
    color: '#f5c542',
    draw: g => {
      g.beginPath();
      g.moveTo(64, 14); g.lineTo(76, 36); g.lineTo(76, 82); g.lineTo(52, 82);
      g.lineTo(52, 36); g.closePath(); g.stroke();
      g.beginPath();
      g.moveTo(34, 84); g.lineTo(94, 84);
      g.moveTo(64, 84); g.lineTo(64, 108);
      g.stroke();
      g.beginPath(); g.arc(64, 112, 6, 0, Math.PI * 2); g.stroke();
    },
  },
  // Arcade
  {
    color: '#e040fb',
    draw: g => {
      g.beginPath(); g.arc(64, 34, 15, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(64, 49); g.lineTo(64, 82); g.stroke();
      g.beginPath();
      g.moveTo(28, 104); g.lineTo(40, 82); g.lineTo(88, 82); g.lineTo(100, 104);
      g.closePath(); g.stroke();
    },
  },
  // Idle / Tycoon
  {
    color: '#f5c542',
    draw: g => {
      g.beginPath(); g.arc(64, 64, 38, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.arc(64, 64, 26, 0, Math.PI * 2); g.stroke();
      g.beginPath();
      g.moveTo(64, 46); g.lineTo(64, 82);
      g.moveTo(74, 54); g.lineTo(56, 54); g.lineTo(56, 64); g.lineTo(72, 64);
      g.lineTo(72, 74); g.lineTo(54, 74);
      g.stroke();
    },
  },
  // Action
  {
    color: '#F43F5E',
    draw: g => {
      g.beginPath();
      g.moveTo(76, 14); g.lineTo(42, 70); g.lineTo(60, 70); g.lineTo(52, 114);
      g.lineTo(88, 56); g.lineTo(68, 56);
      g.closePath(); g.stroke();
    },
  },
  // Strategy / Auto Battler
  {
    color: '#7C3AED',
    draw: g => {
      g.beginPath();
      g.moveTo(64, 16); g.lineTo(102, 32); g.lineTo(102, 64);
      g.quadraticCurveTo(102, 96, 64, 112);
      g.quadraticCurveTo(26, 96, 26, 64);
      g.lineTo(26, 32);
      g.closePath(); g.stroke();
      g.beginPath();
      g.moveTo(48, 62); g.lineTo(60, 76); g.lineTo(82, 48);
      g.stroke();
    },
  },
  // Roguelike
  {
    color: '#00e5ff',
    draw: g => {
      g.beginPath();
      g.moveTo(50, 18); g.lineTo(78, 18);
      g.moveTo(57, 18); g.lineTo(57, 44);
      g.moveTo(71, 18); g.lineTo(71, 44);
      g.stroke();
      g.beginPath();
      g.moveTo(57, 44);
      g.bezierCurveTo(30, 60, 34, 110, 64, 110);
      g.bezierCurveTo(94, 110, 98, 60, 71, 44);
      g.stroke();
      g.beginPath(); g.moveTo(40, 84); g.quadraticCurveTo(64, 74, 88, 84); g.stroke();
    },
  },
];

const glyphTexture = (THREE: typeof THREE_NS, glyph: Glyph) => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  if (!g) return null;
  g.strokeStyle = glyph.color;
  g.lineWidth = 7;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.shadowColor = glyph.color;
  g.shadowBlur = 14;
  glyph.draw(g);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

type Flier = {
  sprite: THREE_NS.Sprite;
  speed: number;
  offset: number;
  baseY: number;
  baseZ: number;
  phase: number;
  // Two bob waves at unrelated frequencies read as wandering rather than
  // as a metronome; the x/z wobbles add the rest of the randomness.
  bob: [number, number];
  freq: [number, number, number, number];
  wobble: [number, number];
};

const makeFliers = (THREE: typeof THREE_NS): Flier[] =>
  GLYPHS.flatMap((glyph, i) => {
    const map = glyphTexture(THREE, glyph);
    if (!map) return [];
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, opacity: 0.85, depthWrite: false }));
    const scale = 2.4 + Math.random() * 1.4;
    sprite.scale.set(scale, scale, 1);
    const rnd = (min: number, max: number) => min + Math.random() * (max - min);
    return [{
      sprite,
      speed: rnd(2, 5) * (Math.random() < 0.35 ? -1 : 1),
      offset: (i / GLYPHS.length) * 110 + rnd(0, 16),
      baseY: rnd(-12, 12),
      baseZ: rnd(-12, 8),
      phase: Math.random() * Math.PI * 2,
      bob: [rnd(0.8, 2.2), rnd(0.4, 1.6)],
      freq: [rnd(0.35, 0.8), rnd(0.11, 0.29), rnd(0.2, 0.5), rnd(0.13, 0.31)],
      wobble: [rnd(1.5, 4), rnd(1.5, 4)],
    }];
  });

const HeroBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Phones/tablets: skip the 190 kB three.js chunk and the always-on WebGL
    // loop (battery, scroll jank). The CSS gradient behind the canvas stays.
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      canvas.classList.add('is-ready'); // gradient only
      return;
    }

    let dispose = () => {};
    let cancelled = false;

    // ponytail: idle-defer the 750 kB chunk — the CSS gradient paints first, the
    // starfield fades in once the main thread is free (Lighthouse TBT / main-thread work).
    const idle = (cb: () => void) =>
      typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(cb, { timeout: 3000 }) : window.setTimeout(cb, 1500);
    idle(() => import('three').then(THREE => {
      if (cancelled) return;

      let renderer: THREE_NS.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
      } catch {
        canvas.classList.add('is-ready');
        return; // ponytail: no WebGL context — the CSS gradient behind the canvas is the fallback
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight, false);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
      camera.position.z = 40;

      const map = dotTexture(THREE);
      const group = new THREE.Group();
      const near = cloud(THREE, 320, 100, 0x00e5ff, 0.42, 0.55, map);
      const far = cloud(THREE, 520, 150, 0xe040fb, 0.3, 0.35, map);
      group.add(near, far);
      scene.add(group);

      // Fliers live outside `group` so the slow scene spin doesn't swing them.
      const fliers = makeFliers(THREE);
      for (const f of fliers) scene.add(f.sprite);

      const pointer = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight, false);
      };
      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('resize', onResize);

      let raf = 0;
      const tick = (t: number) => {
        raf = requestAnimationFrame(tick);
        // The canvas is position:fixed, so scrolling never hides it — only a
        // background tab is safe to skip.
        if (document.hidden) return;
        group.rotation.y = t * 0.00004;
        near.rotation.z = t * 0.00002;
        far.rotation.z = -t * 0.000015;
        const sec = t * 0.001;
        for (const f of fliers) {
          // Position derived from the clock, so a dropped frame never desyncs
          // the drift and the wrap always happens well outside the frustum.
          // Wrapping with a floored modulo keeps the negative-speed fliers in
          // range too.
          const lap = (sec * f.speed + f.offset) % 110;
          f.sprite.position.x = (lap < 0 ? lap + 110 : lap) - 55
            + Math.sin(sec * f.freq[2] + f.phase) * f.wobble[0];
          f.sprite.position.y = f.baseY
            + Math.sin(sec * f.freq[0] + f.phase) * f.bob[0]
            + Math.sin(sec * f.freq[1] + f.phase * 1.7) * f.bob[1];
          f.sprite.position.z = f.baseZ + Math.sin(sec * f.freq[3] + f.phase) * f.wobble[1];
          f.sprite.material.rotation = Math.sin(sec * f.freq[1] * 2 + f.phase) * 0.22;
        }
        camera.position.x += (pointer.x * 3 - camera.position.x) * 0.03;
        camera.position.y += (-pointer.y * 2 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);
      canvas.classList.add('is-ready');

      dispose = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('resize', onResize);
        map?.dispose();
        for (const p of [near, far]) {
          p.geometry.dispose();
          (p.material as THREE_NS.PointsMaterial).dispose();
        }
        for (const f of fliers) {
          f.sprite.material.map?.dispose();
          f.sprite.material.dispose();
        }
        renderer.dispose();
      };
    }));

    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-bg" aria-hidden="true" />;
};

export default HeroBackground;
