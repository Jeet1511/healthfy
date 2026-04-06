/* 
  Service Worker for OMINA Emergency Safety App
  Handles offline caching and background functionality
*/

const CACHE_NAME = "omina-v1";
const RUNTIME_CACHE = "omina-runtime-v1";
const CRITICAL_FILES = [
  "/",
  "/index.html",
  "/styles.css",
  "/main.jsx",
  "/manifest.json",
];

// Install event - cache critical files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching critical files");
        return cache.addAll(CRITICAL_FILES).catch((err) => {
          console.warn("Could not cache all critical files:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log("Service Worker: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Try network request
      return fetch(request)
        .then((networkResponse) => {
          // Don't cache non-successful responses
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Clone response before caching
          const responseToCache = networkResponse.clone();

          // Cache successful API responses and static assets
          if (
            request.url.includes("/api/") ||
            request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2)$/)
          ) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // Network request failed, return offline page/response
          return getOfflineResponse(request);
        });
    })
  );
});

// Handle offline responses
function getOfflineResponse(request) {
  // For API requests, return offline data
  if (request.url.includes("/api/")) {
    return new Response(
      JSON.stringify({
        offline: true,
        message: "You are offline. Emergency SOS still available.",
        data: null,
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      }
    );
  }

  // For HTML pages, try to serve index.html
  return caches.match("/index.html").then((response) => {
    return (
      response ||
      new Response("Offline - Please check your connection", {
        status: 503,
        statusText: "Offline",
        headers: new Headers({
          "Content-Type": "text/plain",
        }),
      })
    );
  });
}

// Handle background sync for SOS
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-sos") {
    event.waitUntil(syncSOS());
  }
});

async function syncSOS() {
  try {
    // Retry failed SOS requests
    const cache = await caches.open(RUNTIME_CACHE);
    const allResponses = await cache.keys();

    for (const request of allResponses) {
      if (request.url.includes("/api/sos/")) {
        try {
          await fetch(request.clone());
        } catch (err) {
          console.log("SOS sync failed, will retry:", err);
        }
      }
    }
  } catch (err) {
    console.error("Background sync error:", err);
  }
}

// Handle push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const notificationOptions = {
    body: data.body || "Emergency notification",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "emergency-notification",
    requireInteraction: data.requireInteraction === true, // Keep notification visible
    vibrate: [200, 100, 200],
    data: data.data || {},
  };

  // Add custom actions for SOS-related notifications
  if (data.type === "sos") {
    notificationOptions.actions = [
      {
        action: "respond",
        title: "Send Help",
        icon: "/icon-respond.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icon-dismiss.png",
      },
    ];
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "OMINA Alert", notificationOptions)
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "respond") {
    // Open app to help page
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/?action=help");
        }
      })
    );
  }
});

// Periodic sync for location check (if user has set safe zones)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-safety-zones") {
    event.waitUntil(checkSafetyZones());
  }
});

async function checkSafetyZones() {
  try {
    // Periodically check if user has entered unsafe zones
    // Use last known location from IndexedDB
    console.log("Checking safety zones...");
  } catch (err) {
    console.error("Safety zone check error:", err);
  }
}

// Message passing for client-worker communication
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.delete(RUNTIME_CACHE);
  }

  if (event.data && event.data.type === "CACHE_SOS_DATA") {
    // Cache SOS data in service worker for quick access
    console.log("SOS data cached for offline access");
  }
});

console.log("OMINA Service Worker loaded");
