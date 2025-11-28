const CACHE_NAME = 'pwa-camera-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// 安裝事件 - 快取靜態資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch((err) => {
          console.log('Cache addAll error:', err);
        });
      })
  );
  self.skipWaiting();
});

// 激活事件 - 清理舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 攔截請求 - 優先使用快取，然後嘗試網路
self.addEventListener('fetch', (event) => {
  // 只處理 GET 請求
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 快取命中，返回快取
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // 檢查響應是否有效
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // 克隆響應以便快取
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // 網路錯誤，嘗試返回離線頁面
        return new Response('Offline - 無網路連接', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// 處理訊息 - 支援客戶端和 Service Worker 通訊
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
