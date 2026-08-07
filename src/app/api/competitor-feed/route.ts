import { NextResponse } from "next/server";
import { buildCompetitorFeed } from "@/lib/competitor-feed";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  try {
    const feed = await buildCompetitorFeed();
    return NextResponse.json(feed);
  } catch {
    return NextResponse.json(
      { error: "競品動態暫時無法取得", items: [], fetchedAt: new Date().toISOString() },
      { status: 500 },
    );
  }
}
