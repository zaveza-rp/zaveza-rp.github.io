/* Service worker — appka funguje bez signálu.
   Při změně index.html zvyš číslo verze, aby se iPadům stáhla nová. */
const CACHE = "rp-teren-v1.0.2";
const SOUBORY = ["./", "./index.html", "./manifest.webmanifest", "./ikona-192.png", "./ikona-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SOUBORY)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request).then(r => {
      const kopie = r.clone();
      caches.open(CACHE).then(ch => ch.put(e.request, kopie)).catch(() => {});
      return r;
    }).catch(() => caches.match("./index.html")))
  );
});
