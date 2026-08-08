import { NextResponse } from "next/server";
import {
  extractBagRef,
  pickupReservation,
  summarizeBagMerchant,
} from "@/lib/surprise-bag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 店長掃碼／手打 6 碼：確認取袋 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const raw =
    typeof body.code === "string"
      ? body.code
      : typeof body.reservationId === "string"
        ? body.reservationId
        : "";
  const pin = typeof body.pin === "string" ? body.pin : "";
  const code = extractBagRef(raw) || raw.trim();

  if (!code) {
    return NextResponse.json({ error: "請提供預約碼" }, { status: 400 });
  }

  try {
    const result = await pickupReservation(code, pin);
    return NextResponse.json({
      ok: true,
      reservation: result.reservation,
      bag: summarizeBagMerchant(result.bag),
      remainingAfterPickup: result.remainingAfterPickup,
      message: `取袋成功：請收取 $${result.reservation.price}（此檔還可出 ${result.remainingAfterPickup} 袋）`,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "取袋失敗" },
      { status: 400 },
    );
  }
}
