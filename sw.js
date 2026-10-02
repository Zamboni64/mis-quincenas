/* Service worker: guarda los archivos de la app en el teléfono para que abra sin internet.
   Estrategia: responde de inmediato con la copia guardada y, si hay conexión, descarga la versión
   nueva en segundo plano. Por eso un cambio en el código se ve la SEGUNDA vez que se abre la app. */
const CACHE = "mis-quincenas-v2";
const ARCHIVOS = [
  "./", "index.html", "css/estilos.css",
  "js/motor.js", "js/almacen.js", "js/app.js", "js/firebase-config.js", "js/nube.js",
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
  if (e.request.method !== "GET") return;
  // Las librerías de Firebase vienen de gstatic.com con la versión en la dirección: nunca cambian, así que basta guardarlas una vez.
  if (url.origin === "https://www.gstatic.com" && url.pathname.startsWith("/firebasejs/")) {
    e.respondWith(caches.open(CACHE).then((cache) => cache.match(e.request).then((guardado) =>
      guardado || fetch(e.request).then((resp) => { if (resp && resp.ok) cache.put(e.request, resp.clone()); return resp; }))));
    return;
  }
  if (url.origin !== location.origin) return;
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
