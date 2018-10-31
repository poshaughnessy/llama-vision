// Partly based on "Offline copy of pages" service worker from: https://www.pwabuilder.com

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/images/llama-lens-right.svg'
];

// Install stage sets up the index page (home page) in the cache and opens a new cache
self.addEventListener('install', event => {

  function onInstall() {
    return caches.open('pwabuilder-offline')
      .then(cache => {
        console.log('Caching pre-defined assets on installation');
        return cache.addAll(PRECACHE_URLS);
      });
  }

  event.waitUntil(onInstall(event));
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener('fetch', event => {
  const updateCache = request => {
    return caches.open('pwabuilder-offline').then(cache => {
      return fetch(request).then(response => {
        console.log('[PWA Builder] add page to offline' + response.url);
        return cache.put(request, response);
      });
    });
  };

  event.waitUntil(updateCache(event.request));

  event.respondWith(
    fetch(event.request).catch(error => {
      console.log( '[PWA Builder] Network request Failed. Serving content from cache: ' + error );

      // Check to see if you have it in the cache
      // If not in the cache, then return error page
      return caches.open('pwabuilder-offline').then(cache => {
        return cache.match(event.request).then(matching => {
          const report = !matching || matching.status == 404 ? Promise.reject('no-match'): matching;
          return report;
        });
      });
    })
  );
});
