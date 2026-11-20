/* لمّة service worker: app shell cached, menu always fresh when online */
const V = 'lamma-v1';
const SHELL = ['./', 'index.html', 'assets/css/style.css?v=1', 'assets/js/app.js?v=1', 'assets/img/logo-h-cream.svg', 'assets/img/mark.svg', 'assets/img/tablia-round.webp', 'data/menu.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/admin/')) return;
  if (u.pathname.includes('/api/') || u.pathname.endsWith('.json') || e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return res; })));
});
