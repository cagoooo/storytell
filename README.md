# 📚 繪本 → Google 表單 一條龍工作坊

> 把 Gemini 畫的繪本，輕鬆變成有圖片、有解謎、可發音的 Google 表單測驗。
> 國小老師專用，零安裝、單檔網頁、離線可用。

🌐 **線上 Demo**：https://cagoooo.github.io/storytell/

📖 **第一次用？** [5 分鐘上手指南](https://cagoooo.github.io/storytell/快速上手.html)

🎒 **歡迎老師試用 v0.6** — 卡住或有想法請[開 issue](https://github.com/cagoooo/storytell/issues/new/choose) 給我，越多回饋 v0.7 做得越準。

---

## ✨ 這是什麼？

老師想用 Gemini 做個有圖片的故事測驗給學生玩，但中間要跑五六個 Google 服務、貼來貼去很麻煩。這個工具把整條路收進一個網頁：

```
Gemini 畫繪本  →  Google Doc 整理  →  發布 + 共用
                                      ↓
       Google 表單  ←  Apps Script  ←  圖片網址轉換
            ↓
       QR Code 發給學生
```

## 🎯 功能

- 📋 **六步驟導覽**：每一步都有按鈕和說明
- 🔍 **內建圖片網址轉換器**：CORS 代理輪詢，picconvert 備援
- ⚡ **視覺化 Apps Script 編輯器**：表格式介面填一填，一鍵產出可貼上的程式碼，**完全不用 Gemini Canvas**
- 📱 **內建 QR Code + A4 派發單**：列印就能發給學生
- ♪ **TTS 整合**：Gemini TTS / Drive 音檔兩種方法
- 📚 **NotebookLM 接力**：產學習單、Audio Overview
- 💾 **進度自動儲存**（localStorage）
- 📱 **響應式設計**，手機 / 平板 / 電腦都能用

## 🚀 三種使用方式

### A. 線上版（最快）
直接打開 → https://cagoooo.github.io/storytell/

### B. 下載單檔（離線可用）
[下載 繪本表單工作坊.html](繪本表單工作坊.html)，雙擊開啟即可。

### C. 本地伺服器（推薦給開發 / 嘗試自架代理）
```bash
git clone https://github.com/cagoooo/storytell.git
cd storytell
python -m http.server 5500 --bind 127.0.0.1
# 開 http://127.0.0.1:5500/
```

## 🛠️ 自架 CORS 代理（可選）

第三方代理偶爾會掛。把 `worker.js` 部署到 Cloudflare Workers（免費，每天 10 萬請求）：

1. 註冊 [Cloudflare Workers](https://workers.cloudflare.com/)
2. Create Worker → 命名 `storytell-proxy` → Deploy
3. Edit code → 貼上 [`worker.js`](worker.js) 內容 → Save and Deploy
4. 拿到 `https://storytell-proxy.<你的子域名>.workers.dev`
5. 貼回 App 步驟 3 的「自架代理」設定

## 📂 專案結構

```
storytell/
├── index.html              # 入口（轉址到主 App）
├── 繪本表單工作坊.html    # 主 App（單檔）
├── manifest.json           # PWA 設定檔（可安裝到桌面）
├── service-worker.js       # PWA 離線快取（network-first）
├── version.json            # 版本號（用來偵測新版自動更新）
├── icon.svg                # App 圖示
├── icon-maskable.svg       # Android maskable icon
├── worker.js               # Cloudflare Workers CORS 代理
├── 進度表.md              # 開發 roadmap / 已知問題 / 未來規劃
└── README.md
```

## 🗺️ Roadmap

詳見 [`進度表.md`](進度表.md)。摘要：

- ✅ **v0.1.0** 六步驟工作坊 + 加碼 TTS / NotebookLM
- ✅ **v0.2.0** 視覺化編輯器 + QR Code + Cloudflare Workers 代理
- ✅ **v0.3.0** 多繪本管理 + 7 種題型範本 + Web Speech TTS 試聽 + CSP 安全性 audit
- ✅ **v0.4.0** PWA / 離線可用 / 安裝到桌面 / 拖曳排序 / 命名圖片 / 深色模式 / 自動更新檢查
- ✅ **v0.5.0** Gemini API 直連（BYOK）+ 整本一鍵生成 + 五種單章 AI 動作
- ✅ **v0.6.0** 🎨 Gemini Image 直接生圖 + 整本順便生圖 + Apps Script 內嵌 base64
- 🔜 **v0.7.0** 學生答題分析儀表板 + NotebookLM 一鍵接
- 🔜 **v1.0.0** 公開發布

## 🎓 為誰做的

- 國小老師（特別是資訊 / 國語 / 故事教學）
- 在桃園、台北、台中等地的公立小學現場驗證中
- 設計理念：**零安裝、繁中為先、教學現場優先**

## 🤝 歡迎使用 / 改進

- 有 bug / 建議 → 開 [Issue](https://github.com/cagoooo/storytell/issues)
- 想改進 → 直接 PR
- 有真實課堂使用心得 → 也歡迎開 Discussion 分享

## 📜 授權

MIT License — 隨便用、隨便改、隨便散播。

---

Made with 💜 for Taiwanese elementary teachers · 桃園市 SMES

---

<!-- BEGIN:PROJECT_GUIDE -->
## 專案導覽

繪本自動轉成表單系統

- 專案定位：教育科技／教學支援專案
- Repository：`cagoooo/storytell`
- 可見性：公開
- 主要技術：HTML
- 線上入口：未在 GitHub repository metadata 設定

### 可以怎麼應用

- 教師備課、課堂示範與學生自主練習
- 依年級、領域或校本課程替換內容，建立可重複使用的教學版本
- 作為教育科技活動、學習成效觀察或 AI 輔助教學的原型

這些是依目前專案定位整理的延伸方向，不代表所有情境都已內建完成；實作前請先確認現有功能與資料格式。

### 技術與專案結構

- `README.md`
- `apple-touch-icon.png`
- `index.html`
- `package.json`
- `scripts`

檔案結構會隨版本演進；若本節與程式碼不一致，以目前預設分支的原始碼為準。

### 本機執行

```bash
npm install
```
請以 `package.json` 的 `scripts` 為準；若專案需要雲端服務，請先建立自己的環境變數與測試專案。

### 給 AI Agent 的接手指南

1. 先閱讀本 README、`AGENTS.md`（若有）、套件腳本與部署設定。
2. 先辨識教材、題庫、提示詞或設定資料的單一來源，避免只改畫面上的副本。
3. 調整內容時維持適齡、可讀性、無障礙與個資保護。
4. 修改後驗證教師操作流程、學生操作流程，以及桌機、平板、手機的可用性。
5. 不要捏造尚未存在的功能；README 與實作有落差時，應同時更新文件。
6. 提交前只納入本次任務檔案，並記錄實際執行過的驗證。

### 安全與資料注意事項

- 不要提交 `.env`、服務帳號、API 金鑰、token、學生個資或正式環境匯出資料。
- 使用 Firebase、Supabase、Google API 或其他雲端服務時，請建立自己的測試專案並套用最小權限。
- 若要公開衍生作品，請先確認程式碼、圖片、音訊、字型與教材內容的授權。

### 貢獻與客製化

歡迎依教學現場、活動或工作流程需求進行 fork／客製化。建議在變更說明中交代使用情境、主要修改、測試方式，以及是否影響資料格式或部署設定。
<!-- END:PROJECT_GUIDE -->
