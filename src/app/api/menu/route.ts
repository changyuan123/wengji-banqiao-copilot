import { NextResponse } from "next/server";
import { selectableMenuGroups } from "@/lib/menu";

export const runtime = "nodejs";

/** 手機按鈕用菜單（公開、只讀） */
export async function GET() {
  const groups = selectableMenuGroups();
  return NextResponse.json({
    groups,
    total: groups.reduce((n, g) => n + g.items.length, 0),
  });
}
