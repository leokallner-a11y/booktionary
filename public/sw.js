// Keeps the app shell available offline. Dictionary and book lookups always
// go to the network, since their answers can't be known ahead of time.
const CACHE = 'booktionary-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return

  // Network first, so updates show up right away; fall back to the cache offline.
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        }
        return res
      })
      .catch(() => caches.match(event.request).then((hit) => hit ?? caches.match('/'))),
  )
})
