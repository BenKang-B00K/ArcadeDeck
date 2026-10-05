// Shared offline cache for every hosted game that ships no service worker of its own.
// Each game registers it under its own scope (index.html: register('/sw.js', { scope: './' })),
// so each gets its own registration and its own cache, 'deck-/<slug>/'.
// Network-first: online play is unchanged (the HTTP cache still answers first); offline, the cached copy does.
// A changed game page = a new build: that game's cache is dropped and refills as the new build loads.
// Games with their own sw.js purge only their own cache prefix, so they leave 'deck-' caches alone.
// ponytail: files are cached on a miss only (re-writing a 200 MB game on every visit would cost more than it saves),
// so a build that changes a file but not the page keeps the old copy offline until the page changes too.
const CACHE = 'deck-' + new URL(self.registration.scope).pathname;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range') || new URL(req.url).origin !== location.origin) return;
  const nav = req.mode === 'navigate';
  const key = nav ? req.url.split(/[?#]/)[0] : req;
  e.respondWith((async () => {
    let c = await caches.open(CACHE);
    const hit = await c.match(key);
    let res;
    try { res = await fetch(req); } catch (err) { if (hit) return hit; throw err; }
    if (res.status !== 200 || res.redirected) return res;
    if (nav) {
      if (hit && (await hit.text()) !== (await res.clone().text())) { await caches.delete(CACHE); c = await caches.open(CACHE); }
      await c.put(key, res.clone());
    } else if (!hit) {
      e.waitUntil(c.put(key, res.clone()).catch(() => {})); // quota full: just stay online-only
    }
    return res;
  })());
});

// Every load, the register snippet sends the files the page loaded; cache the ones this worker never saw
// (loaded before it took control on a first visit, or served from Chrome's memory cache).
self.addEventListener('message', (e) => {
  if (!Array.isArray(e.data)) return;
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(e.data
    .filter((u) => typeof u === 'string' && u.startsWith(location.origin + '/'))
    .map((u) => c.match(u).then((hit) => hit || c.add(u)).catch(() => {})))));
});
