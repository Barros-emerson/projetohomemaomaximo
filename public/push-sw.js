// Service Worker dedicado a Web Push.
// Registrado separadamente do SW do VitePWA em /push-sw.js.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Lembrete", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "🔔 Lembrete";
  const options = {
    body: data.body || "",
    icon: data.icon || "/logo-alfa1000.png",
    badge: "/logo-alfa1000.png",
    tag: data.tag || "hdv-alert",
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: { url: data.url || "/config" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
