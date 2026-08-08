# 惜食驚喜袋平台（Too Good To Go 風格）

店長上架今晚多種驚喜袋 → 客人留聯絡方式並預約 → 到店掃碼取袋付款。

- **商家後台：** https://wengji-banqiao-copilot.vercel.app
- **客人今晚貨架：** https://wengji-banqiao-copilot.vercel.app/today
- **店長掃碼取袋：** https://wengji-banqiao-copilot.vercel.app/scan
- **驗證說明：** https://wengji-banqiao-copilot.vercel.app/verify
- **Repo：** https://github.com/changyuan123/wengji-banqiao-copilot

## 重點

- 袋數／價錢／時段由店長決定（數字可直接用鍵盤輸入）
- 可同時上架多種袋子（貨架）；停賣只擋新預約，已預約不可取消
- 店長清楚勾選菜單 → 寫進資料庫；客人只看自動模糊說明
- 預約需留手機或 LINE
- 客人頁不顯示店長後台／掃碼按鈕
- 商家方案：**NT$299／3 個月**

## 雲端資料庫（很重要）

Vercel 上若**沒有**填 Upstash Redis，上架／預約資料會在不同伺服器間遺失，手打 6 碼也會失敗。

請到 [Upstash](https://upstash.com/) 免費建立 Redis，在 Vercel Environment Variables 填：

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
MERCHANT_PIN=5919
NEXT_PUBLIC_SITE_URL=https://wengji-banqiao-copilot.vercel.app
SUBSCRIPTION_SECRET=改成一串很長的亂碼
```

取袋請**優先掃客人 QR**（QR 內含簽名票券，即使伺服器短暫忘記也能辨識）。
