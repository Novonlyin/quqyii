const CACHE_NAME = 'persona-pwa-cache-v1';

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return new Response('目前处于离线状态，但应用框架已加载');
        })
    );
});