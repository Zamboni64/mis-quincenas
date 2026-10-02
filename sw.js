/* Service worker: guarda los archivos de la app en el dispositivo para que abra sin internet.

   Cómo se actualiza la app:
   1. Cada vez que publique un cambio, suba el número de VERSION de abajo.
   2. El navegador nota que este archivo cambió, descarga TODOS los archivos de nuevo a una caché nueva
      y, cuando termina, reemplaza la anterior de un solo golpe. Así nunca quedan mezclados archivos viejos y nuevos.
   3. La app abierta se recarga sola una vez para mostrar la versión nueva. */
const VERSION = "2.2";
const CACHE = "mis-quincenas-app-" + VERSION;
const CACHE_FIREBASE = "mis-quincenas-firebase"; // librerías de Firebase: no cambian, se conservan entre versiones
const ARCHIVOS = [
  "./", "index.html", "css/estilos.css",
  "js/motor.js", "js/almacen.js", "js/app.js", "js/firebase-config.js", "js/nube.js",
  "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  // cache: "reload" obliga a traer cada archivo del servidor y no de la memoria del navegador.
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ARCHIVOS.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== CACHE && n !== CACHE_FIREBASE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Librerías de Firebase (gstatic.com): llevan la versión en la dirección, basta guardarlas una vez.
  if (url.origin === "https://www.gstatic.com" && url.pathname.startsWith("/firebasejs/")) {
    e.respondWith(caches.open(CACHE_FIREBASE).then((cache) => cache.match(e.request).then((guardado) =>
      guardado || fetch(e.request).then((resp) => { if (resp && resp.ok) cache.put(e.request, resp.clone()); return resp; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // Archivos de la app: siempre desde la caché de esta versión; si alguno no está, se pide a la red.
  e.respondWith(caches.open(CACHE).then((cache) => cache.match(e.request, { ignoreSearch: true }).then((guardado) => guardado || fetch(e.request))));
});
