/**
 * 繪本表單工作坊 — Cloudflare Workers CORS 代理
 *
 * 功能：給定 ?url=<google_doc_url>，抓取後加上 CORS header 回傳，
 * 讓前端 fetch 不被瀏覽器擋。
 *
 * 部署步驟（5 分鐘搞定）：
 *   1. 到 https://workers.cloudflare.com/ 註冊（免費，每天 10 萬請求）
 *   2. Dashboard → Workers & Pages → Create application → Create Worker
 *   3. 命名 storytell-proxy → Deploy（先部署 hello world）
 *   4. 點 "Edit code" / "Quick edit" → 把這整個檔案內容貼上
 *   5. 點 "Save and Deploy"
 *   6. 拿到 https://storytell-proxy.<你的子域名>.workers.dev
 *   7. 貼回 App 步驟 3 的「自架代理設定」欄位 → 儲存
 *
 * 安全設計：
 *   - 白名單只放 docs.google.com 與 *.googleusercontent.com
 *   - 防止 Worker 被當成通用代理濫用消耗免費額度
 *   - 邊緣快取 5 分鐘，反覆抓同一份 Doc 不重複請求
 *
 * 額度：
 *   - 免費版每天 100,000 次請求，對單一老師 / 班級綽綽有餘
 *   - 觸頂會回傳 1015 錯誤，前端會自動 fallback 到備援代理
 */

export default {
  async fetch(request) {
    // CORS 預檢
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== 'GET') {
      return text('Method Not Allowed', 405);
    }

    const targetParam = new URL(request.url).searchParams.get('url');
    if (!targetParam) {
      return text(
        'Storytell CORS Proxy is alive.\n\nUsage: ?url=https://docs.google.com/document/d/e/.../pub',
        200
      );
    }

    let target;
    try {
      target = new URL(targetParam);
    } catch {
      return text('Invalid URL', 400);
    }

    // 白名單
    const ok =
      target.hostname === 'docs.google.com' ||
      target.hostname.endsWith('.googleusercontent.com');
    if (!ok) {
      return text('Only docs.google.com and *.googleusercontent.com are allowed', 403);
    }

    try {
      const upstream = await fetch(target.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0 StorytellProxy/1.0' },
        cf: { cacheTtl: 300, cacheEverything: true },
      });
      const body = await upstream.arrayBuffer();
      return new Response(body, {
        status: upstream.status,
        headers: {
          ...corsHeaders(),
          'Content-Type':
            upstream.headers.get('content-type') || 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    } catch (e) {
      return text('Upstream fetch failed: ' + e.message, 502);
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function text(msg, status) {
  return new Response(msg, {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
