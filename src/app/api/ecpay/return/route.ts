import { NextResponse } from "next/server";
import {
  SUB_COOKIE,
  getEcpayConfig,
  mintSubscriptionCookie,
  parseFormBody,
  verifyCheckMacValue,
} from "@/lib/ecpay";

export const runtime = "nodejs";

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "/").replace(/\/$/, "") || "";
}

export async function POST(request: Request) {
  const cfg = getEcpayConfig();
  const base = siteBase();
  const raw = await request.text();
  const params = parseFormBody(raw);

  if (!cfg || !verifyCheckMacValue(params, cfg.hashKey, cfg.hashIv)) {
    return NextResponse.redirect(`${base}/?paid=0`, 303);
  }

  const ok = params.RtnCode === "1";
  const res = NextResponse.redirect(`${base}/?paid=${ok ? "1" : "0"}`, 303);
  if (ok) {
    res.cookies.set(SUB_COOKIE, mintSubscriptionCookie(31), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 31 * 86400,
    });
  }
  return res;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paid = url.searchParams.get("paid") ?? "0";
  const base = siteBase();
  return NextResponse.redirect(`${base}/?paid=${paid}`, 303);
}
