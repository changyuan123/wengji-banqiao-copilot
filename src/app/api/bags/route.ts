import { NextResponse } from "next/server";
import { store } from "@/data/store";
import { siteOrigin } from "@/lib/today-deal";
import {
  closeBagSales,
  hasCloudStore,
  loadShelfBags,
  publishSurpriseBag,
  summarizeBagMerchant,
  summarizeBagPublic,
} from "@/lib/surprise-bag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 讀貨架（多種驚喜袋） */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const merchant = searchParams.get("merchant") === "1";
  const storeId = searchParams.get("storeId") || undefined;
  const bags = await loadShelfBags(storeId);
  return NextResponse.json({
    bags: bags.map((b) =>
      merchant ? summarizeBagMerchant(b) : summarizeBagPublic(b),
    ),
    cloudStore: hasCloudStore(),
    platform: {
      name: "惜食驚喜袋",
      blurb: "多家店共用的今晚惜食貨架（目前已上架示範店家）",
    },
  });
}

/** 店長上架一檔（可重複上架＝貨架多種）或停賣 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "publish";

  try {
    if (action === "close") {
      const bagId = typeof body.bagId === "string" ? body.bagId : "";
      if (!bagId) throw new Error("缺少袋號");
      const bag = await closeBagSales(bagId);
      return NextResponse.json({
        ok: true,
        bag: summarizeBagMerchant(bag),
        message: "已停止這一檔的新預約。已預約的客人仍可取袋，不能取消。",
      });
    }

    const itemIds = Array.isArray(body.itemIds)
      ? body.itemIds.filter((x: unknown): x is string => typeof x === "string")
      : [];

    const bag = await publishSurpriseBag({
      qty: Number(body.qty),
      price: Number(body.price),
      pickupStart: typeof body.pickupStart === "string" ? body.pickupStart : "17:30",
      pickupEnd: typeof body.pickupEnd === "string" ? body.pickupEnd : "20:00",
      salesStopAt:
        typeof body.salesStopAt === "string" ? body.salesStopAt : "19:30",
      publicTitle:
        typeof body.publicTitle === "string" ? body.publicTitle : undefined,
      itemIds,
      storeId: store.id,
      storeName: store.fullName,
    });

    const origin = siteOrigin(request);
    const guestUrl = `${origin}/today`;
    const shelf = await loadShelfBags(store.id);
    return NextResponse.json({
      ok: true,
      bag: summarizeBagMerchant(bag),
      bags: shelf.map(summarizeBagMerchant),
      guestUrl,
      scanUrl: `${origin}/scan`,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(guestUrl)}`,
      cloudStore: hasCloudStore(),
      message: hasCloudStore()
        ? "已上架到今晚貨架。可再上架另一種袋子。"
        : "已上架到今晚貨架（示範模式建議接 Redis）。可再上架另一種袋子。",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "操作失敗" },
      { status: 400 },
    );
  }
}
