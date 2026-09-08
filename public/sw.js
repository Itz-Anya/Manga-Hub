// Manga Hub service worker — app-shell + image cache, network-first HTML.
const VERSION = "v1";
const HTML_CACHE = `mangahub-html-${VERSION}`;
const IMG_CACHE = `mangahub-img-${VERSION}`;
const API_CACHE = `mangahub-api-${VERSION}`;
const MAX_IMG = 500;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("mangahub-") && !k.endsWith(VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const cache = await caches.open(HTML_CACHE);
          cache.put(req, res.clone());
          return res;
        } catch {
          const cached = await caches.match(req);
          return cached || caches.match("/");
        }
      })(),
    );
    return;
  }

  if (url.hostname === "uploads.mangadex.org" || url.pathname.startsWith("/api/image")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMG_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          if (res.ok) {
            cache.put(req, res.clone());
            trimCache(IMG_CACHE, MAX_IMG);
          }
          return res;
        } catch {
          return cached || Response.error();
        }
      })(),
    );
    return;
  }

  if (url.pathname.startsWith("/api/mangadex")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
  }
});