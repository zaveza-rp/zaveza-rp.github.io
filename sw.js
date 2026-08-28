/* Service worker — appka funguje bez signálu.
   Při změně index.html zvyš číslo verze, aby se zařízením stáhla nová. */
const CACHE = "rp-teren-v1.3.0";
const SOUBORY = ["./", "./index.html", "./manifest.webmanifest", "./ikona-192.png", "./ikona-512.png"];

/* Každý soubor ukládáme zvlášť — kdyby některý chyběl (např. ikona),
   nesmí to shodit celou instalaci a připravit nás o offline režim. */
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SOUBORY.map(u => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const klice = await caches.keys();
    await Promise.all(klice.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith((async () => {
    const z = await caches.match(e.request);
    if (z) return z;
    try {
      const r = await fetch(e.request);
      const c = await caches.open(CACHE);
      c.put(e.request, r.clone()).catch(() => {});
      return r;
    } catch (_) {
      return (await caches.match("./index.html")) || Response.error();
    }
  })());
});
