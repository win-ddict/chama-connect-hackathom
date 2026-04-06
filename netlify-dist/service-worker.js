const CACHE_NAME = "chamaconnect-shell-v6";
const CORE_ASSETS = [
    "./",
    "./index.html",
    "./assets/site.css?v=20260406e",
    "./assets/landing.js?v=20260406e",
    "./install.js?v=20260406e",
    "./images/chama_phones.png",
    "./images/chama-icon.png",
    "./favicon.ico?v=20260406e",
    "./manifest.json?v=20260406e",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

function isSameOrigin(requestUrl) {
    return new URL(requestUrl).origin === self.location.origin;
}

function isNetworkFirstRequest(request) {
    return request.mode === "navigate"
        || request.destination === "document"
        || request.destination === "style"
        || request.destination === "script";
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    if (!isSameOrigin(event.request.url)) {
        return;
    }

    if (isNetworkFirstRequest(event.request)) {
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                return networkResponse;
            }).catch(() => caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match("./index.html")))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                return networkResponse;
            });
        })
    );
});
