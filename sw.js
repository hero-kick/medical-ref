// ============================================================
//  Service Worker  ─  オフラインキャッシュ
//
//  index.html や PDF を更新したら CACHE_VERSION の末尾番号を
//  1つ増やすと、次回アクセス時にキャッシュが自動で更新されます。
//  例: 'medical-v1' → 'medical-v2'
// ============================================================

const CACHE_VERSION = 'medical-v5';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './pdf/iryo_kubun_hyoka.pdf',
  './pdf/shougai_jiritsu.pdf',
  './pdf/ninchisho_jiritsu.pdf',
  './pdf/jsnp_yakuzai_38.pdf',
];

// インストール時: ファイルを個別にキャッシュ
// ※ addAll は1ファイルでも失敗すると全体が失敗するため、
//    1件ずつ catch して他のファイルへ影響しないようにする
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      Promise.all(
        FILES_TO_CACHE.map(url =>
          cache.add(url).catch(err =>
            console.warn('[SW] キャッシュ失敗（スキップ）:', url, err)
          )
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// 有効化時: 古いキャッシュを削除してからすべてのクライアントを制御下に置く
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// リクエスト時: キャッシュ優先、なければネットワーク
self.addEventListener('fetch', event => {
  // chrome-extension など http(s) 以外は無視
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // 成功したレスポンスはキャッシュに追加しておく（動的キャッシュ）
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // 完全オフラインかつキャッシュ未登録のリクエストに対するフォールバック
      return new Response('オフラインです。このファイルはキャッシュされていません。', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    })
  );
});
