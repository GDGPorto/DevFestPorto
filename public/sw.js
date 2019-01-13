self.addEventListener('fetch', function(evt) {
    evt.respondWith(
        fromNetwork(evt.request, 4000).catch(function () {
            return fromCache(evt.request);
        })
    );
});

self.addEventListener('install', function(event) {
    // The promise that skipWaiting() returns can be safely ignored.
    self.skipWaiting();
    console.log("Latest version installed!");
    // Do not depend on precache to consider the SW installed. Cache will be filled later anyway
    precache();
});




// Time limited network request. If the network fails or the response is not
// served before timeout, the promise is rejected.
function fromNetwork(request, timeout) {
    return new Promise(function (fulfill, reject) {
        // Reject in case of timeout.
        var timeoutId = setTimeout(reject, timeout);
        // Fulfill in case of success.
        fetch(request).then(function (response) {

            console.info("Returning from network for and saving on cache: " + request.url);
            clearTimeout(timeoutId);

            fulfill(response.clone());

            // Store the response on cache
            if (response) {
                caches.open('cache').then(function (cache) {
                    cache.put(request, response);
                });
            }
            // Reject also if network fetch rejects.
        }, reject);
    });
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
    return caches.open('cache').then(function (cache) {
        return cache.match(request).then(function (matching) {
            console.info("Cache opened. Returning from cache...", request.url);
            return matching || Promise.reject('no-match');
        });
    });
}


// Open a cache and use `addAll()` with an array of assets to add all of them
// to the cache. Return a promise resolving when all the assets are added.
function precache() {
    return caches.open('cache').then(function (cache) {
        console.info("Cache opened. Will precache....");
        return cache.addAll([
            //cache.addAll(), takes a list of URLs, then fetches them from the server
            // and adds the response to the cache.
            // add your entire site to the cache- as in the code below; for offline access
            // If you have some build process for your site, perhaps that could
            // generate the list of possible URLs that a user might load.
            '/', // do not remove this
            '/index.html', //default
            '/index.html?homescreen=1', //default
            '/?homescreen=1', //default
            '/assets/css/main.css',// configure as by your site ; just an example
            '/images/*',// choose images to keep offline; just an example
            // Do not replace/delete/edit the service-worker.js/ and manifest.js paths below
            '/service-worker.js',
            '/manifest.js',
            //These are links to the extenal social media buttons that should be cached;
            // we have used twitter's as an example
            // 'https://platform.twitter.com/widgets.js',
        ]);
    });
}