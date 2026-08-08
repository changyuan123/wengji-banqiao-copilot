import { NextResponse } from "next/server";
import {
  hasCloudStore,
  releaseStock,
  summarizeDeal,
  loadLatestDeal,
} from "@/lib/coupon-store";
import {
  saveLatestDeal,
  siteOrigin,
  type TodayDealPayload,
} from "@/lib/today-deal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const deal = await loadLatestDeal();
  return NextResponse.json({
    deal: deal ? summarizeDeal(deal) : null,
    cloudStore: hasCloudStore(),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const note = typeof body.note === "string" ? body.note : undefined;
  const rawItems = Array.isArray(body.items) ? body.items : [];

  const items = rawItems
    .map((row: { itemId?: unknown; qty?: unknown }) => ({
      itemId: typeof row.itemId === "string" ? row.itemId : "",
      qty: Number(row.qty),
    }))
    .filter((row: { itemId: string; qty: number }) => row.itemId && row.qty >= 1);

  try {
    const deal = await releaseStock({ items, note });

    // 同步舊的「今日特價黑板」資料，讓 /today 文案也更新
    const board: TodayDealPayload = {
      v: 1,
      at: deal.createdAt,
      ids: deal.lines.map((l) => l.itemId),
      note: deal.note,
    };
    await saveLatestDeal(board);

    const origin = siteOrigin(request);
    const guestUrl = `${origin}/today`;
    return NextResponse.json({
      ok: true,
      deal: summarizeDeal(deal),
      guestUrl,
      scanUrl: `${origin}/scan`,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(guestUrl)}`,
      cloudStore: hasCloudStore(),
      message: cloudHint(hasCloudStore()),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "發布失敗" },
      { status: 400 },
    );
  }
}

function cloudHint(ok: boolean) {
  if (ok) {
    return "已釋出限量份數。客人可領券，店長可掃碼核銷。";
  }
  return "已釋出限量份數（示範模式）。還沒接雲端記帳本時，過一陣子可能找不到記錄。正式使用請在 Vercel 接上 Upstash Redis。";
}
