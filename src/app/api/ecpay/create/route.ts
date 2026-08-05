import { NextResponse } from "next/server";
import {
  SUBSCRIPTION_AMOUNT,
  buildMerchantTradeNo,
  ecpayEndpoint,
  formatEcpayDate,
  generateCheckMacValue,
  getEcpayConfig,
} from "@/lib/ecpay";
import { store } from "@/data/store";

export const runtime = "nodejs";

export async function POST() {
  const cfg = getEcpayConfig();
  if (!cfg) {
    return NextResponse.json(
      {
        error:
          "尚未設定綠界環境變數（ECPAY_MERCHANT_ID / ECPAY_HASH_KEY / ECPAY_HASH_IV）",
      },
      { status: 503 },
    );
  }

  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!base) {
    return NextResponse.json(
      { error: "尚未設定 NEXT_PUBLIC_SITE_URL（綠界回調需要公開網域）" },
      { status: 503 },
    );
  }

  const merchantTradeNo = buildMerchantTradeNo();
  const amount = String(SUBSCRIPTION_AMOUNT);

  const params: Record<string, string> = {
    MerchantID: cfg.merchantId,
    MerchantTradeNo: merchantTradeNo,
    MerchantTradeDate: formatEcpayDate(),
    PaymentType: "aio",
    TotalAmount: amount,
    TradeDesc: `${store.fullName} AI助手月訂閱`,
    ItemName: `翁記專屬AI助手月費 NT$${SUBSCRIPTION_AMOUNT}`,
    ReturnURL: `${base}/api/ecpay/notify`,
    OrderResultURL: `${base}/api/ecpay/return`,
    ClientBackURL: `${base}/?subscribe=cancel`,
    ChoosePayment: "Credit",
    EncryptType: "1",
    // 信用卡定期定額
    PeriodAmount: amount,
    PeriodType: "M",
    Frequency: "1",
    ExecTimes: "99",
    PeriodReturnURL: `${base}/api/ecpay/period`,
  };

  params.CheckMacValue = generateCheckMacValue(params, cfg.hashKey, cfg.hashIv);

  return NextResponse.json({
    action: ecpayEndpoint(cfg.stage),
    params,
    merchantTradeNo,
  });
}
