// דפים מהרשת (וחזרה למעטפת בלי רשת), נכסים ותמונות מהמטמון.
const CACHE = 'tzior-v1'
const SHELL = ['/', '/manifest.webmanifest', '/icon.svg', '/icon-192.png']
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())))
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim())))
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { const c = res.clone(); caches.open(CACHE).then((x) => x.put('/', c)); return res }).catch(() => caches.match('/')))
    return
  }
  if (url.origin === location.origin && (url.pathname.startsWith('/assets/') || /\.(png|svg|woff2?)$/.test(url.pathname))) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const c = res.clone(); caches.open(CACHE).then((x) => x.put(req, c)); return res })))
  }
})
