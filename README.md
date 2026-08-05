# 翁記麻辣鍋板橋店｜AI 爆客行銷助手

專為 **翁記麻辣鍋－板橋店**（新北市板橋區篤行路三段 28 號）打造的單店 AI 行銷助手：讀板橋天氣 → 選營業目標 → 一鍵產出 LINE／社群文案。

## 雲端優先（請勿在文書機本機建置）

本機約 8GB RAM，**禁止**在本機執行 `npm install` / `npm run dev` / `npm run build`。

請一律使用：

1. **GitHub Codespaces** 開發與預覽  
2. **Vercel** 正式部署  

```bash
# 在 Codespace 內
npm install
npm run dev
```

## 功能（MVP）

- 板橋即時天氣（Open-Meteo；失敗則氣候模擬）
- 三種情境：冷雨夜衝桌／平日離峰／深夜外帶
- OpenAI `gpt-4o-mini` 文案（無 Key 或逾時則模板 fallback）
- 一鍵複製、LINE 分享
- 綠界信用卡**定期定額** NT$999／月

## 環境變數

複製 `.env.example` → Codespace／Vercel 環境變數：

| 變數 | 說明 |
|------|------|
| `OPENAI_API_KEY` | OpenAI |
| `ECPAY_MERCHANT_ID` / `HASH_KEY` / `HASH_IV` | 綠界特店 |
| `ECPAY_MODE` | `stage` 或 `production` |
| `SUBSCRIPTION_SECRET` | 訂閱 cookie 簽章 |
| `NEXT_PUBLIC_SITE_URL` | 正式網域（綠界回調） |

綠界後台請設定：

- ReturnURL → `https://<domain>/api/ecpay/notify`
- OrderResultURL → `https://<domain>/api/ecpay/return`
- PeriodReturnURL → `https://<domain>/api/ecpay/period`

## 部署

1. 將此 repo 匯入 [Vercel](https://vercel.com)
2. 填入環境變數並 Deploy
3. 用手機 Safari／Chrome 開啟正式網址驗收

## 與營運情報站的關係

[`wengji-banqiao-intel`](https://github.com/changyuan123/wengji-banqiao-intel) 為 GitHub Pages 靜態情報訂閱頁；本專案為獨立的 **Vercel + API** 爆客助手，兩者互不取代。
