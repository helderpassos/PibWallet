/* PIB Wallet - service worker
   Cache-first para o app shell, network-first para dados.

   __BUILD_VERSION__ e trocado no build pelo hash do conteudo publicado
   (plugin em vite.config.js). Sem isso o nome do cache nunca mudava e o
   app podia ficar preso numa versao antiga. Builds identicos geram o mesmo
   hash, entao um deploy sem mudanca nao invalida o cache a toa. */
const VERSION = 'pibwallet-__BUILD_VERSION__'
/* O marcador abaixo vira, no build, a lista do que foi publicado - inclusive
   os JS e CSS de nome com hash, que o service worker nao teria como adivinhar.
   Sem eles no precache, quem visitava pela primeira vez e ficava sem rede em
   seguida abria o app quebrado: o service worker so passa a interceptar
   depois que assume o controle, entao os arquivos da primeira carga nunca
   chegavam ao cache. */
const SHELL = ['/', '/index.html', ...__BUILD_ASSETS__]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navegacoes: rede primeiro, cai para o shell em cache quando offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone()
            caches.open(VERSION).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)
      return cached || fresh
    })
  )
})

// Lembretes agendados pelo app (postMessage) quando a aba esta aberta.
self.addEventListener('message', (event) => {
  const data = event.data || {}
  if (data.type === 'SKIP_WAITING') self.skipWaiting()
  if (data.type === 'NOTIFY') {
    self.registration.showNotification(data.title || 'PIB Wallet', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag,
      data: { url: data.url || '/' }
    })
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) { client.navigate(target); return client.focus() }
      }
      return self.clients.openWindow(target)
    })
  )
})
