import { NextResponse } from "next/server";
import { siteOrigin } from "@/lib/today-deal";
import { reserveBag } from "@/lib/surprise-bag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
    const reservation = await reserveBag({
      guestId: body.guestId,
      bagId: body.bagId,
      contact: body.contact,
    });
    const origin = siteOrigin(request);
    const bagUrl = `${origin}/bag/${reservation.id}`;
    return NextResponse.json({
      ok: true,
      reservation,
      bagUrl,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(bagUrl)}`,
      message: "預約成功！請在取餐時段到店出示，並支付袋價。",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "預約失敗" },
      { status: 400 },
    );
  }
}
