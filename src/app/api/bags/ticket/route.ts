import { NextResponse } from "next/server";
import { verifyBagTicket } from "@/lib/bag-ticket";
import { loadReservation } from "@/lib/surprise-bag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 用簽名票券讀取預約畫面（不靠 Redis 也能顯示） */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const t = searchParams.get("t") || "";
  if (!t) {
    return NextResponse.json({ error: "缺少取袋票券" }, { status: 400 });
  }

  const ticket = verifyBagTicket(t);
  if (!ticket) {
    return NextResponse.json(
      { error: "票券無效或已過期，請重新預約" },
      { status: 400 },
    );
  }

  const saved = await loadReservation(ticket.id);
  const reservation = {
    id: ticket.id,
    shortCode: ticket.code,
    status: saved?.status || "reserved",
    price: ticket.price,
    publicTitle: ticket.title,
    publicHint: ticket.hint,
    pickupStart: ticket.pickupStart,
    pickupEnd: ticket.pickupEnd,
    storeName: ticket.store,
    reservedAt: saved?.reservedAt || new Date().toISOString(),
    pickedUpAt: saved?.pickedUpAt,
    ticket: t,
  };

  return NextResponse.json({ reservation, fromTicket: true });
}
