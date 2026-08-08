import { NextResponse } from "next/server";
import { redeemCoupon, summarizeDeal } from "@/lib/coupon-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code =
    typeof body.code === "string"
      ? body.code
      : typeof body.couponId === "string"
        ? body.couponId
        : "";
  const pin = typeof body.pin === "string" ? body.pin : "";

  if (!code) {
    return NextResponse.json({ error: "請提供折價券" }, { status: 400 });
  }

  try {
    const result = await redeemCoupon(code, pin);
    return NextResponse.json({
      ok: true,
      coupon: result.coupon,
      deal: summarizeDeal(result.deal),
      remainingAfterRedeem: result.remainingAfterRedeem,
      message: `核銷成功：${result.coupon.itemName}（此品項還剩 ${result.remainingAfterRedeem} 份可出）`,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "核銷失敗" },
      { status: 400 },
    );
  }
}
