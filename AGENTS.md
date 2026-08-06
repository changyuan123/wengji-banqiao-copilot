# AGENTS.md

## Cursor Cloud specific instructions

翁記板橋 Copilot 是單一 Next.js 15（App Router + Turbopack）應用，套件管理用 npm（`package-lock.json`）。

### 服務與指令

- 開發：`npm run dev`（Turbopack，port 3000）。標準指令見 `package.json` 的 `scripts`。
- Lint：`npm run lint`（ESLint，`next/core-web-vitals` + `next/typescript`）。
- 沒有自動化測試（無 test script、無測試框架）。
- 正式建置為 `npm run build`（Vercel serverless；請勿設 `output: "export"`，API routes 需要 serverless）。

### 非顯而易見的注意事項

- 本機開發不需要任何密鑰即可跑起來：
  - 缺 `OPENAI_API_KEY` 時 `/api/generate` 會自動回退到內建模板文案（回應內含 `source: "template"`）。
  - 缺綠界（ECPay）變數時，訂閱流程會顯示設定提示而非報錯。
- 需要一個 `.env.local`（已被 gitignore）讓訂閱 cookie 簽章可用；至少設 `SUBSCRIPTION_SECRET`（長隨機字串）與 `NEXT_PUBLIC_SITE_URL`。環境變數清單見 `README.md` 與 `.env.example`。
- `/api/weather` 會即時打 Open-Meteo 取板橋天氣；若外網失敗會回退氣候模擬（回應內含 `isFallback: true`）。
- 核心流程：`/`（`src/components/CopilotApp.tsx`）→ 讀天氣 → 老闆輸入營業狀況/目標 → `POST /api/generate` 產出 LINE／社群文案。
