const CACHE_NAME = "odaiate-pwa-v62-music-artist-genre";
const PRECACHE = [
  "./",
  "./index.html",
  "./style.css?v=55",
  "./script.js?v=55",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./topics.csv"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME && (k.startsWith("topic-hunter-") || k.startsWith("odaiate-pwa-"))).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put("./index.html", copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(req).then(cached => {
    const network = fetch(req).then(res => {
      if (res && res.ok) caches.open(CACHE_NAME).then(c => c.put(req, res.clone())).catch(() => {});
      return res;
    }).catch(() => cached || Response.error());
    return cached || network;
  }));
});
