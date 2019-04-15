/*
* indexedDB
* */
var CACHE_NAME = 'obat-cache';

var urlsToCache = [
    '/',
    '/style.css',
    '/cewek.png',
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(
            function (cache) {
                console.log('service worker do install..', cache);
                return cache.addAll(urlsToCache);
            },
            // function (err) {
            //     console.log('err : ' , err);
            // }
        )
    )
});

/* aktivasi cache */
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                // delete cache jika ada versi  lebih baru
                cacheNames.filter(function (cacheName) {
                    return cacheName !== CACHE_NAME;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

/* fetch cache */
self.addEventListener('fetch', function (event) {
    var request = event.request;
        event.respondWith(
            caches.open('obat-cache')
                .then(function (cache) {
                return fetch(request).then(function (liveRequest) {
                    cache.put(request, liveRequest.clone());
                    return liveRequest;
                }).catch(function () {
                    return caches.match(request)
                        .then(function (response) {
                        if (response) return response;
                        return caches.match('/offline.html');
                    })
                })
            })
        )
    

})

self.importScripts('assets/sw-toolbox/sw-toolbox.js');

self.toolbox.precache([
  'offline.html',
  'images/ugm.png',
]);

self.toolbox.router.get('/(.*)', function(req, vals, opts) {
  return toolbox.networkFirst(req, vals, opts)
    .catch(function(error) {
      if (req.method === 'GET' && req.headers.get('accept').includes('text/html')) {
        return toolbox.cacheOnly(new Request('offline.html'), vals, opts);
      }
      throw error;
    });
});
