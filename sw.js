const CACHE = 'wod-shell-20261116-v2';
const SHELL = ['/', '/style.css', '/app.mjs', '/engine.mjs', '/telemetry.mjs', '/pwa.mjs', '/mobile.css', '/manifest.webmanifest', '/icons/wod-192.png', '/icons/wod-512.png', '/icons/wod-180.png'];
self.addEventListener('install', event => {
  // Atomic precache: never activate an incomplete or redirected login page.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const responses = await Promise.all(SHELL.map(async path => {
      const response = await fetch(new Request(path, {cache: 'reload', credentials: 'same-origin'}));
      if (!response.ok || response.redirected) throw Error('Could not prepare offline timer');
      return [path, response];
    }));
    await Promise.all(responses.map(([path, response]) => cache.put(path, response)));
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('wod-shell-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  // Only public app assets. Admin, API, feedback and external traffic stay network-only.
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.search) return;
  const path = url.pathname === '/index.html' ? '/' : url.pathname;
  if (!SHELL.includes(path)) return;
  event.respondWith((async () => {
    const cached = await (await caches.open(CACHE)).match(path);
    return cached || fetch(request);
  })());
});
