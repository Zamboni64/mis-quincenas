/* Service worker: guarda los archivos de la app en el teléfono para que abra sin internet.
   Estrategia: responde de inmediato con la copia guardada y, si hay conexión, descarga la versión
   nueva en segundo plano. Por eso un cambio en el código se ve la SEGUNDA vez que se abre la app. */
const CACHE = "mis-quincenas-v1";
const ARCHIVOS = [
  "./", "index.html", "css/estilos.css",
  "js/motor.js", "js/almacen.js", "js/app.js",
  "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  // Borra cachés de versiones anteriores (si algún día cambia el nombre de CACHE).
  e.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request, { ignoreSearch: true }).then((guardado) => {
        const deRed = fetch(e.request, { cache: "no-cache" })
          .then((resp) => { if (resp && resp.ok) cache.put(e.request, resp.clone()); return resp; })
          .catch(() => guardado);
        return guardado || deRed;
      })
    )
  );
});
