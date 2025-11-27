// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}

  const title = data.title || '새로운 서비스 요청'
  const options = {
    body: data.body || '새로운 서비스 요청이 들어왔습니다.',
    vibrate: [200, 100, 200],
    tag: data.tag || 'service-request',
    requireInteraction: true,
    data: {
      url: data.url || '/admin/dashboard/services'
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})

self.addEventListener('install', function(event) {
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim())
})
