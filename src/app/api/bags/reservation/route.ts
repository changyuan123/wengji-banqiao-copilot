import { NextResponse } from "next/server";
import { loadReservation, summarizeBagPublic, loadBag } from "@/lib/surprise-bag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 讀取客人預約憑證（公開欄位，不含清楚菜單細項） */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少預約編號" }, { status: 400 });
  }
  const reservation = await loadReservation(id);
  if (!reservation) {
    return NextResponse.json({ error: "找不到這筆預約" }, { status: 404 });
  }
  const bag = await loadBag(reservation.bagId);
  return NextResponse.json({
    reservation,
    bag: bag ? summarizeBagPublic(bag) : null,
  });
}
