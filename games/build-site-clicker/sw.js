// offline: precache the app shell, cache-first for the pinned three.js CDN build, network-first (cache fallback offline) for our own files.
// Bump CACHE with the CHANGELOG version so old caches get dropped.
const CACHE = 'bsc-v1.24.3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/apple-touch-icon.png', './icons/banner.webp',
  ...['scene', 'toon', 'particles', 'vfx', 'worker', 'landmark', 'levels', 'upgrades', 'state', 'sound', 'i18n'].map(f => `./src/${f}.js`)];

self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); });
// Every game shares this origin's Cache Storage: purge only our own old caches, never another game's.
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.startsWith('bsc-')).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const cdn = r.url.startsWith('https://cdn.jsdelivr.net/npm/three@');
  if (!cdn && new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: !cdn });
    if (cdn && hit) return hit; // versioned CDN url never changes
    // own files: network-first so every module comes from the same version (stale-while-revalidate mixed old + new files → NaN); cache only offline
    // no-cache: revalidate with the server (cheap 304) — plain fetch could still serve a heuristically-cached old module from the HTTP cache
    return fetch(r, { cache: 'no-cache' }).then(res => { if (res.ok) c.put(r, res.clone()); return res; }, () => hit || Promise.reject());
  }));
});
