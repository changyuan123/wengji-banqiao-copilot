import { NextResponse } from "next/server";
import { store } from "@/data/store";
import { siteOrigin } from "@/lib/today-deal";
import {
  buildBlurryHint,
  hasCloudStore,
  loadLatestBag,
  publishSurpriseBag,
  summarizeBagMerchant,
  summarizeBagPublic,
} from "@/lib/surprise-bag";
import { getItemsByIds } from "@/lib/menu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 客人／店長讀今晚最新驚喜袋 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const merchant = searchParams.get("merchant") === "1";
  const bag = await loadLatestBag();
  if (!bag) {
    return NextResponse.json({
      bag: null,
      cloudStore: hasCloudStore(),
      hint: "店長還沒上架今晚驚喜袋",
    });
  }
  return NextResponse.json({
    bag: merchant ? summarizeBagMerchant(bag) : summarizeBagPublic(bag),
    cloudStore: hasCloudStore(),
  });
}

/** 店長上架今晚驚喜袋 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const itemIds = Array.isArray(body.itemIds)
    ? body.itemIds.filter((x: unknown): x is string => typeof x === "string")
    : [];

  try {
    const bag = await publishSurpriseBag({
      qty: Number(body.qty),
      price: Number(body.price),
      pickupStart: typeof body.pickupStart === "string" ? body.pickupStart : "17:30",
      pickupEnd: typeof body.pickupEnd === "string" ? body.pickupEnd : "20:00",
      salesStopAt:
        typeof body.salesStopAt === "string" ? body.salesStopAt : "19:30",
      publicTitle:
        typeof body.publicTitle === "string" ? body.publicTitle : undefined,
      publicHint:
        typeof body.publicHint === "string" ? body.publicHint : undefined,
      itemIds,
      note: typeof body.note === "string" ? body.note : undefined,
      storeName: store.fullName,
    });

    const origin = siteOrigin(request);
    const guestUrl = `${origin}/today`;
    return NextResponse.json({
      ok: true,
      bag: summarizeBagMerchant(bag),
      guestUrl,
      scanUrl: `${origin}/scan`,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(guestUrl)}`,
      cloudStore: hasCloudStore(),
      suggestedHint: buildBlurryHint(getItemsByIds(itemIds)),
      message: hasCloudStore()
        ? "今晚驚喜袋已上架。客人可預約，到店掃碼取袋、當場付款。"
        : "今晚驚喜袋已上架（示範模式：建議之後接上 Upstash Redis 才穩）。",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "上架失敗" },
      { status: 400 },
    );
  }
}
