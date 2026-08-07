# 翁記麻辣鍋板橋店｜惜食特價（LINE OA 第一版）

**商家後台：** 手機點菜單 → 產限時特價文 → **一鍵推播惜食 LINE OA**  
**客人端：** 加官方帳號好友，收今日特價（可轉傳）  
**正式網址：** https://wengji-banqiao-copilot.vercel.app  
**Repo：** https://github.com/changyuan123/wengji-banqiao-copilot

## 本階段目標（先做小）

1. 接好 **一個惜食 LINE 官方帳號（OA）**  
2. 只有系統／OA **廣播**給好友（不要用店家自建群當主通道）  
3. 先累積約 **100 位**會來看特價的客人  
4. 到 100 人後再做：今日頁連結、核銷等加強  

## 雲端優先

- 服務在 **GitHub + Vercel**，不依賴店內電腦  
- **禁止**在約 8GB 文書機本機 `npm install` / `dev` / `build`  
- 開發用 **GitHub Codespaces**

## LINE OA 接線（必做）

1. 開啟 [LINE Developers Console](https://developers.line.biz/console/)  
2. 建立 Provider → 建立 **Messaging API** Channel（官方帳號）  
3. 進入 Channel → **Messaging API** → **Issue** 長期 Channel access token  
4. Vercel → 專案 → Settings → Environment Variables：

| 變數 | 必填 | 說明 |
|------|------|------|
| `LINE_CHANNEL_ACCESS_TOKEN` | ✅ | 推播用 Token |
| `NEXT_PUBLIC_LINE_OA_URL` | 建議 | 加好友連結，例如 `https://line.me/R/ti/p/@xxxxx` |
| `GROQ_API_KEY` | 可選 | 本階段點菜單多走固定模板，可暫不填 |
| `NEXT_PUBLIC_SITE_URL` | 訂閱用 | `https://wengji-banqiao-copilot.vercel.app` |

5. **Redeploy** 後打開商家後台，狀態應顯示「已接上惜食 LINE OA」  
6. 點菜單產文 → **一鍵推播 LINE OA** → 用另一支手機加 OA 好友測試是否收到  

> 廣播會發給**所有好友**，推播前請預覽確認。對客人只寫限時特價，不寫即期／過期。

## 邀客人加 OA（累積到 100）

- 店內放加好友 QR（LINE Official Account Manager 可下載）  
- 結帳／候位時請客人「加 LINE 收今晚惜食特價」  
- 後台若有設定 `NEXT_PUBLIC_LINE_OA_URL`，畫面會顯示可複製的加好友連結  

## 商家後台功能

- 菜單按鈕多選（**不限數量**，選幾個寫幾個）  
- 固定惜食清單文案＋約八折話術  
- 一鍵推播 LINE OA（主通道）  
- 複製／分享（備援）  

## 部署

Push `main` → Vercel 自動部署。
