// Offline app shell. Bump CACHE on every release so old files are dropped.
const CACHE = 'sprintclash-v3.4.4';
const SHELL = [
  './', 'index.html', 'style.css', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'src/main.js', 'src/i18n.js', 'src/audio.js', 'src/net.js', 'src/fx.js', 'src/dash.js', 'src/timing.js',
  'src/stage.js', 'src/draw.js', 'src/stack.js', 'src/sprint.js', 'src/rope.js', 'src/echo.js',
  'src/lanes.js', 'src/tug.js', 'src/fuse.js', 'src/sumo.js', 'src/grid.js', 'src/curl.js', 'src/hex.js', 'src/boat.js', 'src/chicken.js', 'src/vault.js', 'src/crowd.js', 'src/kite.js', 'src/fish.js', 'src/chairs.js', 'src/puck.js',
  'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/utils/BufferGeometryUtils.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

// Every game shares this origin's Cache Storage: purge only our own old caches, never another game's.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.startsWith('sprintclash-')).map(k => caches.delete(k)))));
  self.clients.claim();
});

// stale-while-revalidate for our files + the jsDelivr CDN (three, peerjs); the PeerJS broker is never cached
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || !(r.url.startsWith(self.location.origin) || r.url.startsWith('https://cdn.jsdelivr.net/'))) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const fresh = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || fresh;
  }));
});
