
// ========== SERVICE WORKER OFFLINE CACHE ESTRATÉGICO ==========
const CACHE_NAME = 'offline-stock-v2';
const urlsToCache = [
  './',
  './index.html',
  // No necesita más recursos, la app es autocontenida
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(fetchRes => {
        if (!fetchRes || fetchRes.status !== 200) return fetchRes;
        const responseClone = fetchRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return fetchRes;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Recurso no disponible offline', { status: 404 });
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => { if (key !== CACHE_NAME) return caches.delete(key); })
    ))
  );
  self.clients.claim();
});
        