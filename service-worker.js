const cacheName = "wfrp2e-cache-v2"; // Change version to force refresh

const assets = [
    "./index.html",
    "./style.css?v=2.0",  // Force latest version
    "./app.js?v=2.0",     // Force latest version
    "./manifest.json",
    "./data/items.json",
    "./data/npcs.json"
];

// Install event: Cache files
self.addEventListener("install", (event) => {
    console.log("✅ Service Worker Installing...");
    event.waitUntil(
        caches.open(cacheName).then(async (cache) => {
            console.log("📦 Caching assets...");
            const results = await Promise.allSettled(
                assets.map(url => cache.add(url))
            );
            results.forEach((result, index) => {
                if (result.status === "rejected") {
                    console.warn(`❌ Failed to cache: ${assets[index]}`, result.reason);
                }
            });
        })
    );
    self.skipWaiting(); // Forces the new service worker to take over immediately
});

// Activate event: Delete old caches and take control
self.addEventListener("activate", (event) => {
    console.log("✅ Service Worker Activated");
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== cacheName) {
                        console.log("🗑️ Deleting old cache:", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Immediately control active clients
});

// Fetch event: Try network first, then cache
self.addEventListener("fetch", (event) => {
    // Only handle HTTP/HTTPS requests—skip others (like WebSocket requests)
    if (!/^https?:/i.test(event.request.url)) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
            .then(response => {
                // Ensure that a valid Response is always returned
                return response || new Response("Not found", { status: 404 });
            })
    );
});
