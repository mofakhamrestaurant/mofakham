/* سرویس‌ورکر: اول اینترنت، اگر نبود آخرین نسخه‌ی ذخیره‌شده */
var C = 'mf-v1';
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(function (c) {
    return Promise.all(['', 'menu.json', 'settings.json', 'api/menu', 'api/settings'].map(function (p) {
      var rq = new Request(self.registration.scope + p);
      return fetch(rq, { cache: 'no-store' }).then(function (r) { if (r.ok) return c.put(rq, r); }).catch(function () {});
    }));
  }));
});
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin) return;
  var p = u.pathname, page = r.mode === 'navigate';
  var data = /(menu\.json|settings\.json|\/api\/menu|\/api\/settings)$/.test(p);
  var asset = /\/uploads\//.test(p) || /manifest\.webmanifest$/.test(p);
  if (!page && !data && !asset) return;
  var key = page ? new Request(u.origin + u.pathname) : r;
  e.respondWith((async function () {
    var c = await caches.open(C);
    try {
      var n = await fetch(r, { cache: 'no-store' });
      if (n && n.ok) c.put(key, n.clone());
      return n;
    } catch (err) {
      var m = await c.match(key);
      if (m) {
        if (data) { var h = new Headers(m.headers); h.set('X-From-Cache', '1'); return new Response(m.body, { status: 200, headers: h }); }
        return m;
      }
      throw err;
    }
  })());
});
