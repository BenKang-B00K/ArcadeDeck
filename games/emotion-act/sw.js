// Offline cache. Install: the page + every asset it links. Then stale-while-revalidate for GETs (cache only for immutable files).
// ponytail: hand-written instead of vite-plugin-pwa; bump CACHE when this file needs to evict old entries.
const CACHE = 'emotion-v2.14.5';

self.addEventListener('install', e => e.waitUntil((async () => {
  const c = await caches.open(CACHE);
  const html = await (await fetch('./', { cache: 'reload' })).text();
  const linked = [...html.matchAll(/(?:href|src)="(\.\/[^"]+)"/g)].map(m => m[1]);
  await c.addAll(['./', './icon-192.png', './icon-512.png', ...linked]);
  await self.skipWaiting();
})()));

// Every game shares this origin's Cache Storage: purge only our own old caches, never another game's.
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE && k.startsWith('emotion-')) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: e.request.mode === 'navigate' });
    // hashed build files and font files never change: no background refetch on every launch
    if (hit && /\/assets\/|\/\/fonts\.gstatic\.com\//.test(e.request.url)) return hit;
    const net = fetch(e.request).then(r => {
      if (r.ok || r.type === 'opaque') c.put(e.request, r.clone());
      return r;
    });
    if (!hit) return net;
    net.catch(() => {}); // offline: the cached copy is the answer
    return hit;
  }));
});
