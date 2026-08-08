import { NextResponse } from "next/server";
import {
  SUBSCRIPTION_AMOUNT,
  SUBSCRIPTION_MONTHS,
  buildMerchantTradeNo,
  ecpayEndpoint,
  formatEcpayDate,
  generateCheckMacValue,
  getEcpayConfig,
} from "@/lib/ecpay";

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
    TradeDesc: `惜食商家方案${SUBSCRIPTION_MONTHS}個月`,
    ItemName: `惜食商家方案 ${SUBSCRIPTION_MONTHS}個月 NT$${SUBSCRIPTION_AMOUNT}`,
    ReturnURL: `${base}/api/ecpay/notify`,
    OrderResultURL: `${base}/api/ecpay/return`,
    ClientBackURL: `${base}/?subscribe=cancel`,
    ChoosePayment: "Credit",
    EncryptType: "1",
  };

  params.CheckMacValue = generateCheckMacValue(params, cfg.hashKey, cfg.hashIv);

  return NextResponse.json({
    action: ecpayEndpoint(cfg.stage),
    params,
    merchantTradeNo,
  });
}
