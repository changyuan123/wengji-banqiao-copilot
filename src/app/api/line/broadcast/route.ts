import { NextResponse } from "next/server";
import { FORBIDDEN_CUSTOMER_PHRASES } from "@/lib/menu";

export const runtime = "nodejs";
export const maxDuration = 30;

function lineAddFriendUrl() {
  return (
    process.env.NEXT_PUBLIC_LINE_OA_URL?.trim() ||
    process.env.LINE_OA_ADD_FRIEND_URL?.trim() ||
    ""
  );
}

/**
 * 一鍵推播至 LINE 官方帳號（Messaging API broadcast）
 * 本階段主通道：惜食 LINE OA（只有官方廣播給好友）
 * 文件：https://developers.line.biz/en/reference/messaging-api/#send-broadcast-message
 */
export async function POST(request: Request) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "尚未接上惜食 LINE OA。請到 LINE Developers 開 Messaging API、發行 Channel access token，填入 Vercel 的 LINE_CHANNEL_ACCESS_TOKEN 後 Redeploy。",
        code: "missing_line_token",
        setup: [
          "1. https://developers.line.biz/console/ 建立／選取 Provider",
          "2. 建立 Messaging API Channel（官方帳號）",
          "3. Channel → Messaging API → Issue Channel access token（long-lived）",
          "4. Vercel → Project → Settings → Environment Variables → LINE_CHANNEL_ACCESS_TOKEN",
          "5. Redeploy 後回本站再按推播",
        ],
      },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  let text = typeof body.text === "string" ? body.text.trim() : "";
  if (text.length < 4) {
    return NextResponse.json({ error: "沒有可發送的文案" }, { status: 400 });
  }

  const hit = FORBIDDEN_CUSTOMER_PHRASES.find((p) => text.includes(p));
  if (hit) {
    return NextResponse.json(
      {
        error: `文案含內部用語「${hit}」，請重新產生後再推播（對客人只寫限時特價）`,
        code: "forbidden_phrase",
      },
      { status: 400 },
    );
  }

  // 鼓勵轉傳（本階段不加複雜今日頁）
  if (!text.includes("轉傳") && !text.includes("轉發給")) {
    text = `${text}\n\n歡迎轉傳給想吃的朋友～`;
  }

  if (text.length > 4500) {
    return NextResponse.json({ error: "文案過長，無法發送" }, { status: 400 });
  }

  if (body.confirm !== true) {
    return NextResponse.json(
      { error: "請先確認要推播至惜食 LINE OA 好友" },
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
    let tip = "請檢查 Channel access token 是否正確、是否已 Redeploy。";
    if (res.status === 401 || res.status === 403) {
      tip = "Token 無效或權限不足，請重新發行 Channel access token。";
    }
    if (detail.includes("quota") || detail.toLowerCase().includes("rate")) {
      tip = "可能觸及 LINE 推播額度上限，請稍後再試或升級方案。";
    }
    return NextResponse.json(
      {
        error: `LINE OA 推播失敗。${tip}`,
        status: res.status,
        detail: detail.slice(0, 300),
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    channel: "line_oa_broadcast",
    addFriendUrl: lineAddFriendUrl() || null,
  });
}

export async function GET() {
  const configured = Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim());
  const addFriendUrl = lineAddFriendUrl();
  return NextResponse.json({
    configured,
    addFriendUrl: addFriendUrl || null,
    phase: "line_oa_first",
    goalFriends: 100,
    hint: configured
      ? "已接上惜食 LINE OA，可一鍵廣播給好友。目標先累積約 100 位會來看特價的客人。"
      : "尚未設定 LINE_CHANNEL_ACCESS_TOKEN。請先完成 LINE OA 接線。",
    setupSteps: [
      "LINE Developers 建立 Messaging API Channel",
      "發行長期 Channel access token",
      "Vercel 填 LINE_CHANNEL_ACCESS_TOKEN 並 Redeploy",
      "可選：填 NEXT_PUBLIC_LINE_OA_URL（加好友連結，方便店內邀客人）",
      "本站產文 → 一鍵推播",
      "客人加 OA 好友收今日惜食特價；累積約 100 人後再做加強版",
    ],
  });
}
