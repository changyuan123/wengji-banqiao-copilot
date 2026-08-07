import { NextResponse } from "next/server";
import {
  decodeTodayToken,
  encodeTodayToken,
  loadLatestDeal,
  payloadToView,
  saveLatestDeal,
  siteOrigin,
  type TodayDealPayload,
} from "@/lib/today-deal";

export const runtime = "nodejs";

/** 讀取目前最新的今日特價（若有） */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (token) {
    const payload = decodeTodayToken(token);
    const view = payload ? payloadToView(payload) : null;
    if (!view) {
      return NextResponse.json({ error: "連結無效或已過期" }, { status: 404 });
    }
    return NextResponse.json({
      deal: view,
      shareUrl: `${siteOrigin(request)}${view.sharePath}`,
    });
  }

  const latest = await loadLatestDeal();
  if (!latest) {
    return NextResponse.json({
      deal: null,
      hint: "目前還沒有發布今日特價。請用店家給你的連結，或向店家詢問。",
    });
  }
  const view = payloadToView(latest);
  return NextResponse.json({
    deal: view,
    shareUrl: view ? `${siteOrigin(request)}${view.sharePath}` : null,
  });
}

/** 店家發布今日特價（免費網頁通道，不用 LINE） */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const itemIds: string[] = Array.isArray(body.itemIds)
    ? body.itemIds.filter((x: unknown): x is string => typeof x === "string")
    : [];
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 80) : "";

  if (itemIds.length === 0) {
    return NextResponse.json({ error: "請先選擇今日特價品項" }, { status: 400 });
  }

  const payload: TodayDealPayload = {
    v: 1,
    at: new Date().toISOString(),
    ids: [...new Set(itemIds)].slice(0, 40),
    note: note || undefined,
  };

  const view = payloadToView(payload);
  if (!view) {
    return NextResponse.json({ error: "選到的品項無法辨識" }, { status: 400 });
  }

  await saveLatestDeal(payload);
  const origin = siteOrigin(request);
  const shareUrl = `${origin}${view.sharePath}`;
  const canonicalUrl = `${origin}/today`;

  return NextResponse.json({
    ok: true,
    deal: view,
    token: encodeTodayToken(payload),
    shareUrl,
    canonicalUrl,
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}`,
    message: "已發布！請把連結或 QR 給客人看／轉傳（完全不用 LINE）",
  });
}
