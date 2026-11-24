/* eslint-disable */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.origin === self.location.origin) {
    const headers = new Headers(event.request.headers);
    headers.set("ngrok-skip-browser-warning", "true");
    const modifiedRequest = new Request(event.request, { headers });
    event.respondWith(fetch(modifiedRequest));
  } else {
    event.respondWith(fetch(event.request));
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "Instrunaka", body: "Nouvelle notification", url: "/" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});