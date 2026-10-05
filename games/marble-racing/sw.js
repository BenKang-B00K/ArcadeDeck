// Offline shell: serve from cache, refresh cache in the background (stale-while-revalidate).
const CACHE = 'marble-v2.43.14';
const SHELL = ['./', 'index.html', 'style.css', 'coop.js', 'src/game.js', 'src/race.js', 'src/track.js', 'src/sim.js', 'src/audio.js', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'vendor/three.module.js', 'vendor/three.core.js', 'vendor/rapier.mjs',
  'vendor/addons/postprocessing/EffectComposer.js', 'vendor/addons/postprocessing/RenderPass.js', 'vendor/addons/postprocessing/ShaderPass.js',
  'vendor/addons/postprocessing/MaskPass.js', 'vendor/addons/postprocessing/Pass.js', 'vendor/addons/postprocessing/UnrealBloomPass.js',
  'vendor/addons/postprocessing/OutputPass.js', 'vendor/addons/shaders/CopyShader.js', 'vendor/addons/shaders/LuminosityHighPassShader.js',
  'vendor/addons/shaders/OutputShader.js', 'vendor/addons/environments/RoomEnvironment.js', 'vendor/addons/utils/BufferGeometryUtils.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

// Every game shares this origin's Cache Storage: purge only our own old caches, never another game's.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith('marble-')).map(k => caches.delete(k))))
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
