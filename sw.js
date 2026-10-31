/* Service Worker — FotoCalc
   Cachea los archivos para uso sin conexión (en terreno).
*/
const CACHE = 'fotocalc-v1.1';   // sigue el número de versión de la app
const ASSETS = [
  './',
  './index.html',
  './foto-i18n.js',
  './foto-data.js',
  './foto-engine.js',
  './foto-ui.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
        return resp;
      }).catch(() => cached)
    )
  );
});
