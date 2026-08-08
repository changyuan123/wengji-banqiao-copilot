# 翁記麻辣鍋板橋店｜今晚惜食驚喜袋

類似 **Too Good To Go**：店長上架今晚驚喜袋 → 客人預約 → 到店掃碼取袋並付款。

- **商家後台：** https://wengji-banqiao-copilot.vercel.app
- **客人今晚頁：** https://wengji-banqiao-copilot.vercel.app/today
- **店長掃碼取袋：** https://wengji-banqiao-copilot.vercel.app/scan
- **驗證流程說明：** https://wengji-banqiao-copilot.vercel.app/verify
- **Repo：** https://github.com/changyuan123/wengji-banqiao-copilot

## 怎麼用（白話）

1. **店長**決定：今晚幾袋、每袋多少錢、幾點到幾點可取、幾點停止預約
2. 從菜單**清楚勾選**會進袋的食材（寫進資料庫；客人看不到細項）
3. 客人頁只顯示**模糊說明**（保留驚喜）→ 客人按「預約」
4. 到店出示 QR；店長掃碼確認取袋，**當場收取袋價**

## 資料怎麼累積

店長每次上架都會把「清楚菜單品項」存起來，方便之後分析什麼常進袋、什麼常賣不完。  
客人端只看模糊文案，不會洩漏完整清單。

## 雲端優先

服務在 **GitHub + Vercel**。正式營業建議在 Vercel 接上 Upstash Redis：

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
MERCHANT_PIN=5919
NEXT_PUBLIC_SITE_URL=https://wengji-banqiao-copilot.vercel.app
```

## 防亂約（內建）

- 一人一天最多約 2 袋
- 手上還有未取的袋就不能再約
- 連續約了不來會暫停幾天
