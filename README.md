# 翁記麻辣鍋板橋店｜惜食特價推播

專為 **翁記麻辣鍋－板橋店** 的雲端惜食工具：手機點菜單 → 產限時特價文（不說即期）→ 推播 LINE 惜食客群。

**正式網址：** https://wengji-banqiao-copilot.vercel.app  
**Repo：** https://github.com/changyuan123/wengji-banqiao-copilot

## 為什麼一定要放雲端

- 店長用**手機／平板**操作，不依賴店內電腦  
- 程式與設定在 **GitHub + Vercel**；本機壞了、關機，服務仍在  
- 換電腦開 Cursor／Codespace 即可繼續改，**客人不受影響**  
- **禁止**在約 8GB 文書機本機跑 `npm install` / `npm run dev` / `npm run build`

開發請用 **GitHub Codespaces**；正式環境用 **Vercel**（跟 GitHub `main` 自動部署）。

## 功能

1. 完整菜單按鈕（分類瀏覽，一次最多選 3 樣）  
2. 自動產 80～140 字限時特價文（約八折話術，禁止「過期／即期」）  
3. 複製／LINE 分享／**一鍵推播 LINE OA**（惜食群）  
4. 板橋天氣可當氣氛鉤子  
5. 綠界訂閱 NT$999／月  

競品動態已收斂：`/radar` 僅導回惜食首頁。

## LINE OA 推播

1. [LINE Developers](https://developers.line.biz/console/) 發行 Channel access token  
2. Vercel 環境變數：`LINE_CHANNEL_ACCESS_TOKEN` → Redeploy  
3. 手機上產文 →「一鍵推播惜食群」

## 環境變數

| 變數 | 說明 |
|------|------|
| `GROQ_API_KEY` | 建議：文案 AI |
| `GEMINI_API_KEY` | 備援 |
| `OPENAI_API_KEY` | 可選 |
| `LINE_CHANNEL_ACCESS_TOKEN` | 惜食群推播 |
| `ECPAY_*` / `SUBSCRIPTION_SECRET` / `NEXT_PUBLIC_SITE_URL` | 訂閱 |

## 部署

Push `main` → Vercel 自動部署。  
Import：https://vercel.com/new/import?s=https://github.com/changyuan123/wengji-banqiao-copilot
