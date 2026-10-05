// Offline shell: serve from cache, refresh cache in the background (stale-while-revalidate).
const CACHE = 'racing-v1.10.0';
const SHELL = ['./', 'index.html', 'style.css', 'src/game.js', 'src/audio.js', 'src/sim.js', 'src/tracks.js', 'src/world.js', 'src/input.js', 'src/animals.js', 'coop.js', 'manifest.webmanifest',
  'banners/toy-diorama.webp', 'banners/storybook.webp', 'banners/neon-arcade.webp', 'banners/festival.webp',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'vendor/three/three.module.min.js', 'vendor/three/three.core.min.js',
  'vendor/three/addons/postprocessing/EffectComposer.js', 'vendor/three/addons/postprocessing/Pass.js',
  'vendor/three/addons/postprocessing/RenderPass.js', 'vendor/three/addons/postprocessing/ShaderPass.js',
  'vendor/three/addons/postprocessing/MaskPass.js', 'vendor/three/addons/postprocessing/UnrealBloomPass.js',
  'vendor/three/addons/postprocessing/OutputPass.js', 'vendor/three/addons/shaders/CopyShader.js', 'vendor/three/addons/shaders/LuminosityHighPassShader.js',
  'vendor/three/addons/shaders/OutputShader.js', 'vendor/three/addons/environments/RoomEnvironment.js',
  'vendor/three/addons/utils/BufferGeometryUtils.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

// Every game shares this origin's Cache Storage: purge only our own old caches, never another game's.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith('racing-')).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});
