// Offline play. Pages come from the network when possible so updates arrive;
// everything else has a hashed name and is safe to serve from the cache.
const CACHE = '2-4-6-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'cache') return;
  const urls = [...new Set([...event.data.urls, self.registration.scope])].filter((url) =>
    url.startsWith(self.location.origin),
  );
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(urls)).catch(() => {}));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const response = await fetch(request);
          cache.put(self.registration.scope, response.clone());
          return response;
        } catch {
          return (await cache.match(self.registration.scope)) || Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(request, { ignoreVary: true });
      if (hit) return hit;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    })(),
  );
});
