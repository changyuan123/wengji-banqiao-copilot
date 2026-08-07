import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * 一鍵推播至 LINE 官方帳號（Messaging API broadcast）
 * 需在 Vercel 設定 LINE_CHANNEL_ACCESS_TOKEN
 * 文件：https://developers.line.biz/en/reference/messaging-api/#send-broadcast-message
 */
export async function POST(request: Request) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "尚未設定 LINE_CHANNEL_ACCESS_TOKEN。請到 LINE Developers 建立 Messaging API Channel，把 Channel access token 填入 Vercel 環境變數後 Redeploy。",
        code: "missing_line_token",
      },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (text.length < 4) {
    return NextResponse.json({ error: "沒有可發送的文案" }, { status: 400 });
  }
  if (text.length > 4500) {
    return NextResponse.json({ error: "文案過長，無法發送" }, { status: 400 });
  }

  // 需店長明確確認（前端會先彈窗；後端再檢查）
  if (body.confirm !== true) {
    return NextResponse.json(
      { error: "請先確認要推播至 LINE 官方帳號好友" },
      { status: 400 },
    );
  }

  const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ type: "text", text }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      {
        error: "LINE 推播失敗，請檢查 Channel access token 與 OA 方案是否支援廣播",
        status: res.status,
        detail: detail.slice(0, 300),
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, channel: "line_oa_broadcast" });
}

export async function GET() {
  const configured = Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim());
  return NextResponse.json({
    configured,
    hint: configured
      ? "已設定 LINE OA，可一鍵廣播文案給好友"
      : "尚未設定 LINE_CHANNEL_ACCESS_TOKEN",
  });
}
