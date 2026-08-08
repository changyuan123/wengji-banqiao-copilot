# 翁記麻辣鍋板橋店｜今日惜食特價（限量折價券）

**不用 LINE。** 店長設定今日剩幾份 → 客人領折價券 → 店長掃碼核銷扣庫存。

- **商家後台：** https://wengji-banqiao-copilot.vercel.app
- **客人今日頁：** https://wengji-banqiao-copilot.vercel.app/today
- **店長掃碼核銷：** https://wengji-banqiao-copilot.vercel.app/scan
- **驗證流程說明（給非工程背景）：** https://wengji-banqiao-copilot.vercel.app/verify
- **Repo：** https://github.com/changyuan123/wengji-banqiao-copilot

## 怎麼用（白話）

1. 店長打開商家後台，一次可選多種菜並設定「剩幾份」（例如雪花牛 3 份、水蓮 2 份）
2. 按「釋出限量折價券」
3. 客人打開今日頁，按「領取折價券」，得到專屬 QR／6 碼
4. 到店出示；店長打開掃碼頁開相機掃描（或手打 6 碼）→ 核銷成功，份數減少

相機掃碼支援常見手機瀏覽器；若鏡頭暫時無法辨識，用手打 6 碼即可完成核銷。

## 雲端優先

服務在 **GitHub + Vercel**，不依賴店內電腦。  
禁止在約 8GB 文書機本機跑 `npm install` / `dev` / `build`。

## 可選：雲端資料庫（Upstash Redis）

讓庫存／核銷記錄在 Vercel 多台伺服器之間都一致。免費申請 [Upstash Redis](https://upstash.com/) 後，在 Vercel 填：

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
MERCHANT_PIN=5919
NEXT_PUBLIC_SITE_URL=https://wengji-banqiao-copilot.vercel.app
```

不填也能先在示範環境走完流程；正式長期營業建議填上。

## 其他環境變數

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | 正式網域（產生完整分享連結） |
| `MERCHANT_PIN` | 店長核銷密碼（預設 5919） |
| `GROQ_API_KEY` 等 | 可選；文案預覽 |
| `ECPAY_*` / `SUBSCRIPTION_SECRET` | 訂閱（可選） |
