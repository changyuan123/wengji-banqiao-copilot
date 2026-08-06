# 翁記麻辣鍋板橋店｜AI 爆客行銷助手

專為 **翁記麻辣鍋－板橋店**（新北市板橋區篤行路三段 28 號）打造的單店 AI 行銷助手：讀板橋天氣 → 選營業目標 → 一鍵產出 LINE／社群文案。

**Repo：** https://github.com/changyuan123/wengji-banqiao-copilot

## 雲端優先（請勿在文書機本機建置）

本機約 8GB RAM，**禁止**在本機執行 `npm install` / `npm run dev` / `npm run build`。

請一律使用：

1. **GitHub Codespaces** 開發與預覽  
2. **Vercel** 正式部署  

```bash
# 在 Codespace 內
npm ci
npm run dev
```

雲端建置已驗證通過（`next build`，Codespace，2026-08-06）。

## 功能（MVP）

- 板橋即時天氣（Open-Meteo；失敗則氣候模擬）
- 老闆自行輸入「今日營業狀況」（湯／鴨血／雞肉／豆皮／空桌／外帶等），系統對照完整菜單後產出清料優惠文案
- AI 免費優先：`GROQ_API_KEY`（Llama）→ `GEMINI_API_KEY` → `OPENAI_API_KEY`；都沒有則走智能菜單模板（仍會點名你輸入的品項）
- 一鍵複製、LINE 分享
- 綠界信用卡**定期定額** NT$999／月

## 環境變數

複製 `.env.example` → Codespace Secrets／Vercel Project Settings：

| 變數 | 說明 |
|------|------|
| `GROQ_API_KEY` | **建議先填**，Groq 免費額度即可寫文案 |
| `GEMINI_API_KEY` | Google AI Studio 免費 Key（Groq 備援） |
| `OPENAI_API_KEY` | 可選 |
| `ECPAY_MERCHANT_ID` | 綠界特店代號 |
| `ECPAY_HASH_KEY` | 綠界 HashKey |
| `ECPAY_HASH_IV` | 綠界 HashIV |
| `ECPAY_MODE` | `stage` 或 `production` |
| `SUBSCRIPTION_SECRET` | 訂閱 cookie 簽章（長隨機字串） |
| `NEXT_PUBLIC_SITE_URL` | 正式網域（綠界回調必填，無尾斜線） |

綠界後台請設定：

- ReturnURL → `https://<domain>/api/ecpay/notify`
- OrderResultURL → `https://<domain>/api/ecpay/return`
- PeriodReturnURL → `https://<domain>/api/ecpay/period`

## 部署到 Vercel（建議）

一鍵匯入：  
https://vercel.com/new/import?s=https://github.com/changyuan123/wengji-banqiao-copilot

1. 用 GitHub 帳號登入 Vercel，Import 本 repo  
2. Framework 選 Next.js（自動偵測）  
3. 填入上方環境變數（至少先填 `SUBSCRIPTION_SECRET`、`NEXT_PUBLIC_SITE_URL`；OpenAI／綠界可後補）  
4. Deploy → 把產生的 `*.vercel.app` 網址寫回 `NEXT_PUBLIC_SITE_URL` 再 Redeploy 一次  
5. 用手機 Safari／Chrome 驗收：天氣、輸入「雞肉和豆皮剩很多」、生成文案是否點名清料優惠、複製 toast、訂閱導向綠界 stage

未設定任何 AI Key 時，仍會用**菜單對應模板**產出（例如點到雞肉／豆皮會寫加贈清料優惠）；設定 `GROQ_API_KEY` 後即可免費智能寫文。未設定綠界變數時訂閱會顯示設定提示。

## 與營運情報站的關係

[`wengji-banqiao-intel`](https://github.com/changyuan123/wengji-banqiao-intel) 為 GitHub Pages 靜態情報訂閱頁；本專案為獨立的 **Vercel + API** 爆客助手，兩者互不取代。
