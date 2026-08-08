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

## 雲端

建議在 Vercel 設定 Upstash Redis：

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
MERCHANT_PIN=5919
NEXT_PUBLIC_SITE_URL=https://wengji-banqiao-copilot.vercel.app
```
