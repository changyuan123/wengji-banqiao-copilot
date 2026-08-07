# 翁記麻辣鍋板橋店｜今日惜食特價（免費網頁版）

**不用 LINE。** 店長發布特價 → 出現在公開網頁 → 客人開連結／掃 QR／轉傳給朋友。

- **商家後台：** https://wengji-banqiao-copilot.vercel.app  
- **客人今日頁：** https://wengji-banqiao-copilot.vercel.app/today  
- **Repo：** https://github.com/changyuan123/wengji-banqiao-copilot  

## 怎麼用（白話）

1. 店長打開商家後台，點今天要特價的菜  
2. 按「發布到今日特價頁」  
3. 複製連結或把 QR 給客人／貼店裡  
4. 客人打開就能看，還能轉傳（免費）  

## 雲端優先

服務在 **GitHub + Vercel**，不依賴店內電腦。  
禁止在約 8GB 文書機本機跑 `npm install` / `dev` / `build`。

## 可選：讓「/today」跨伺服器也記得最新一筆

分享連結 `/today/s/...` **本身已含資料，永遠可開**（不需資料庫）。  

若希望固定網址 `/today` 在冷啟動後仍顯示最新，可免費申請 [Upstash Redis](https://upstash.com/) 並在 Vercel 填：

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

不填也能用：請用發布後產生的專屬連結／QR。

## 其他環境變數

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | 正式網域（產生完整分享連結） |
| `GROQ_API_KEY` 等 | 可選；點菜單發布多走固定模板 |
| `ECPAY_*` / `SUBSCRIPTION_SECRET` | 訂閱（可選） |

LINE 相關變數已非本產品主通道，可不填。
