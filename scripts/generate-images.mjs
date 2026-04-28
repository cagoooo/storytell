// 產生：
//   og-preview.png      — 1200×630 社群分享卡（FB / LINE / Twitter 標準尺寸）
//   favicon-32.png      — 32×32 瀏覽器分頁
//   favicon-192.png     — 192×192 PWA / 高解析
//   apple-touch-icon.png — 180×180 iOS 主畫面
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-Subset.ttf');

if (!existsSync(FONT_PATH)) {
  console.error('❌ 找不到精簡字型：' + FONT_PATH);
  console.error('   請先執行：npm run subset-font');
  process.exit(1);
}
GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');

// 品牌色
const PURPLE = '#7c3aed';
const PINK = '#ec4899';
const ORANGE = '#f97316';

// ============ OG Image (1200×630) ============
async function generateOGImage() {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // 漸層背景
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, PURPLE);
  grad.addColorStop(0.5, PINK);
  grad.addColorStop(1, ORANGE);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 裝飾圓圈（右上 + 左下）
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath(); ctx.arc(W - 80, 100, 220, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(120, H - 50, 180, 0, Math.PI * 2); ctx.fill();

  // 左側書本圖示（簡化版，避免 Noto Sans TC 沒有 emoji glyph）
  drawBookIcon(ctx, 100, 180, 180);

  // 主標題
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  ctx.font = '900 70px "NotoSansTC"';
  ctx.fillText('繪本 → Google 表單', 320, 200);
  ctx.font = '900 70px "NotoSansTC"';
  ctx.fillText('一條龍工作坊', 320, 285);

  // 分隔白線
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(320, 320); ctx.lineTo(560, 320); ctx.stroke();

  // 副標
  ctx.font = '700 32px "NotoSansTC"';
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.fillText('用 Gemini AI 自動生整本繪本 + 圖 + 題目', 320, 380);
  ctx.font = '500 28px "NotoSansTC"';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText('一鍵變 Google 表單測驗　掃 QR 派發給學生', 320, 425);

  // 底部「資訊條」
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  roundRect(ctx, 60, H - 100, W - 120, 70, 35);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '700 22px "NotoSansTC"';
  ctx.fillText('cagoooo.github.io/storytell', 95, H - 56);
  ctx.font = '500 20px "NotoSansTC"';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('國小老師專用 · 免裝程式 · 離線可用', 540, H - 56);

  const out = resolve(ROOT, 'og-preview.png');
  writeFileSync(out, canvas.toBuffer('image/png'));
  console.log('✓ ' + out + '  (' + W + '×' + H + ')');
}

// ============ Favicon / App Icon ============
async function generateFavicons() {
  // 從 icon.svg 載入（保留品牌書本造型一致）
  const svgPath = resolve(ROOT, 'icon.svg');
  let svgBuffer;
  if (existsSync(svgPath)) {
    svgBuffer = readFileSync(svgPath);
  } else {
    // Fallback：用 canvas 自己畫
    svgBuffer = null;
  }

  const sizes = [
    { name: 'favicon-32.png',       size: 32 },
    { name: 'favicon-192.png',      size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const { name, size } of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    if (svgBuffer) {
      try {
        const img = await loadImage(svgBuffer);
        ctx.drawImage(img, 0, 0, size, size);
      } catch (e) {
        console.warn('SVG 載入失敗，改用 fallback：' + e.message);
        drawFaviconFallback(ctx, size);
      }
    } else {
      drawFaviconFallback(ctx, size);
    }

    const out = resolve(ROOT, name);
    writeFileSync(out, canvas.toBuffer('image/png'));
    console.log('✓ ' + out + '  (' + size + '×' + size + ')');
  }
}

function drawFaviconFallback(ctx, size) {
  // 漸層背景
  const r = size * 0.2; // 圓角
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, PURPLE);
  grad.addColorStop(0.5, PINK);
  grad.addColorStop(1, ORANGE);
  roundRect(ctx, 0, 0, size, size, r);
  ctx.fillStyle = grad; ctx.fill();
  // 簡化書本
  drawBookIcon(ctx, size * 0.5 - size * 0.3, size * 0.5 - size * 0.3, size * 0.6);
}

// ============ Helpers ============
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 簡化書本圖示（白色，搭漸層底）
function drawBookIcon(ctx, x, y, size) {
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  // 書頁底（白色漸層四邊形）
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(s * 0.10, s * 0.18);
  ctx.lineTo(s * 0.50, s * 0.22);
  ctx.lineTo(s * 0.90, s * 0.18);
  ctx.lineTo(s * 0.90, s * 0.82);
  ctx.lineTo(s * 0.50, s * 0.78);
  ctx.lineTo(s * 0.10, s * 0.82);
  ctx.closePath();
  ctx.fill();
  // 書脊
  ctx.fillStyle = PURPLE;
  ctx.fillRect(s * 0.49, s * 0.20, s * 0.02, s * 0.58);
  // 左頁線條
  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = Math.max(2, s * 0.018);
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const yy = s * (0.36 + i * 0.10);
    ctx.beginPath();
    ctx.moveTo(s * 0.18, yy);
    ctx.lineTo(s * 0.42, yy + s * 0.005);
    ctx.stroke();
  }
  // 右頁亮點：黃色小框 + 綠勾勾（圖 + 表單意涵）
  ctx.fillStyle = '#fbbf24';
  roundRect(ctx, s * 0.55, s * 0.32, s * 0.30, s * 0.18, s * 0.025);
  ctx.fill();
  // 山
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.moveTo(s * 0.55, s * 0.50);
  ctx.lineTo(s * 0.62, s * 0.40);
  ctx.lineTo(s * 0.70, s * 0.46);
  ctx.lineTo(s * 0.78, s * 0.38);
  ctx.lineTo(s * 0.85, s * 0.50);
  ctx.closePath();
  ctx.fill();
  // 綠色勾勾（form check）
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = Math.max(3, s * 0.03);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(s * 0.58, s * 0.62);
  ctx.lineTo(s * 0.66, s * 0.72);
  ctx.lineTo(s * 0.82, s * 0.56);
  ctx.stroke();
  ctx.restore();
}

// ============ Main ============
console.log('開始生成圖片...\n');
await generateOGImage();
await generateFavicons();
console.log('\n全部完成 ✨');
