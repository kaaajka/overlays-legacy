/* Only the installed authoring shell. Local mutation/service responses are never cached. */
const VERSION = "motion-studio-shell-1";
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) =>
        cache.addAll([
          "/motion-studio",
          "/motion-studio.webmanifest",
          "/studio-icon-192.png",
          "/studio-icon-512.png",
        ]),
      ),
  ),
);
self.addEventListener("message", (event) => {
  if (event.data === "ACTIVATE_UPDATE") self.skipWaiting();
  if (event.data?.type === "CACHE_SHELL")
    event.waitUntil(
      caches.open(VERSION).then(async (cache) => {
        const paths = event.data.urls.filter((path) => {
          const url = new URL(path, self.location.origin);
          return url.origin === self.location.origin && !url.pathname.startsWith("/__studio");
        });
        await Promise.allSettled(
          paths.map(async (path) => {
            const response = await fetch(path);
            if (response.ok) await cache.put(path, response);
          }),
        );
        event.ports[0]?.postMessage("ready");
      }),
    );
});
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("motion-studio-shell-") && key !== VERSION)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/__studio/")
  )
    return;
  // Keep large media out of shell cache. Only small shell assets and JS/CSS modules.
  if (
    request.mode !== "navigate" &&
    !["script", "style", "font"].includes(request.destination) &&
    !url.pathname.includes("studio-icon")
  )
    return;
  if (request.mode === "navigate" && url.pathname !== "/motion-studio") return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(VERSION).then((cache) => cache.put(request, copy)));
        }
        return response;
      })
      .catch(
        async () =>
          (await caches.match(request, { ignoreVary: true })) ||
          (request.mode === "navigate" ? await caches.match("/motion-studio") : Response.error()),
      ),
  );
});
