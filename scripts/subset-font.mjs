// 從 Noto Sans TC Bold（12MB）精簡出只用到的字元（~50KB）
// 之後 commit 精簡版即可，原始字型 .gitignore
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONT_IN = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');
const FONT_OUT = resolve(__dirname, 'fonts', 'NotoSansTC-Subset.ttf');

// OG 預覽圖會用到的所有中文字（寧多勿少；之後改文案先回來補字再 subset）
const TEXT = `
繪本一條龍工作坊
表單測驗教學
用人工智慧自動生成整本完整
故事插圖題目章節
鍵變印掃派發給學生
國小老師專用免費
免裝程式瀏覽器即可使用
離線可用支援暗色模式
快速上手分鐘
中文繁體版本
進入工作坊看指南
五分鐘版本最新
從到的故事
讓你輕鬆創作製作
神奇魔法森林勇氣友誼
適合年級閱讀理解
解謎闖關問答
打主題就能完成
可愛美麗童話奇幻
顯示文字資訊內容
桌面安裝立即新版
分享連結網址
全部開始繼續結束
`;

const ASCII = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;!?-_/\\·+()[]{}|@#$%&*"\'→←↑↓★✦●▸';

const chars = Array.from(new Set([...TEXT.replace(/\s/g, ''), ...ASCII])).join('');
console.log(`共 ${chars.length} 個唯一字元，開始精簡...`);

const buffer = readFileSync(FONT_IN);
const subset = await subsetFont(buffer, chars, { targetFormat: 'truetype' });
writeFileSync(FONT_OUT, subset);

console.log(`✓ ${(buffer.length/1024/1024).toFixed(2)} MB → ${(subset.length/1024).toFixed(1)} KB（${((subset.length/buffer.length)*100).toFixed(1)}%）`);
console.log(`輸出：${FONT_OUT}`);
