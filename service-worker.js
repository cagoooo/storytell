/**
 * Storytell Workshop Service Worker
 * 策略：HTML network-first（永遠最新）；icon/font/CDN cache-first（離線可用）
 */
const VERSION = 'v0.6.7';
const CACHE = 'storytell-' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './繪本表單工作坊.html',
  './快速上手.html',
  './manifest.json',
  './icon.svg',
  './icon-maskable.svg',
  './favicon-32.png',
  './favicon-192.png',
  './apple-touch-icon.png',
  './og-preview.png',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.allSettled(PRECACHE.map((u) => c.add(u).catch(() => {})))
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('storytell-') && k !== CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // version.json 永遠不要快取，老師才能即時看到新版
  if (url.pathname.endsWith('version.json')) {
    e.respondWith(fetch(req, { cache: 'no-store' }).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // 不要攔截使用者自架的 Cloudflare Workers / 第三方代理 / Google Doc 抓圖
  // 這些是動態 API 呼叫，攔了反而會壞事
  const skip = [
    'workers.dev',
    'corsproxy.io',
    'allorigins.win',
    'codetabs.com',
    'docs.google.com',
    'googleusercontent.com',
    'docs-images-rt',
  ];
  if (skip.some((s) => url.hostname.includes(s) || url.pathname.includes(s))) {
    return; // 不呼叫 respondWith，瀏覽器走預設網路
  }

  // HTML / 根路徑 → network-first（保證新版）
  const isHTML =
    req.mode === 'navigate' ||
    req.headers.get('Accept')?.includes('text/html') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/');

  if (isHTML && url.origin === location.origin) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // 其他 → cache-first（圖示 / 字型 / CDN JS）
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // 背景順手 refresh 一次（不阻塞使用者）
        fetch(req)
          .then((res) => {
            if (res.ok && res.type !== 'opaque') {
              caches.open(CACHE).then((c) => c.put(req, res.clone())).catch(() => {});
            }
          })
          .catch(() => {});
        return cached;
      }
      return fetch(req)
        .then((res) => {
          if (res.ok && res.type !== 'opaque') {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});

// 主程式可以叫 SW 立刻清快取（用在「重新整理到最新版」按鈕）
self.addEventListener('message', (e) => {
  if (e.data === 'CLEAR_CACHE') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
