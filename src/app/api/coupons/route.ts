import { NextResponse } from "next/server";
import { claimCoupon, loadCoupon, summarizeDeal, loadDeal } from "@/lib/coupon-store";
import { siteOrigin } from "@/lib/today-deal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少券號" }, { status: 400 });
  }
  const coupon = await loadCoupon(id);
  if (!coupon) {
    return NextResponse.json({ error: "找不到這張折價券" }, { status: 404 });
  }
  const deal = await loadDeal(coupon.dealId);
  return NextResponse.json({
    coupon,
    deal: deal ? summarizeDeal(deal) : null,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const itemId = typeof body.itemId === "string" ? body.itemId : "";
  if (!itemId) {
    return NextResponse.json({ error: "請選擇要領的品項" }, { status: 400 });
  }

  try {
    const coupon = await claimCoupon(itemId, body.guestId);
    const origin = siteOrigin(request);
    const couponUrl = `${origin}/coupon/${coupon.id}`;
    return NextResponse.json({
      ok: true,
      coupon,
      couponUrl,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(couponUrl)}`,
      message: "領取成功！請今天到店出示給店長掃描，沒用掉就會過期。",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "領取失敗" },
      { status: 400 },
    );
  }
}
