import { NextResponse } from "next/server";
import {
  SUB_COOKIE,
  getEcpayConfig,
  mintSubscriptionCookie,
  parseFormBody,
  verifyCheckMacValue,
} from "@/lib/ecpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cfg = getEcpayConfig();
  if (!cfg) {
    return new NextResponse("0|Missing config", { status: 503 });
  }

  const raw = await request.text();
  const params = parseFormBody(raw);

  if (!verifyCheckMacValue(params, cfg.hashKey, cfg.hashIv)) {
    return new NextResponse("0|CheckMacValue Error", { status: 400 });
  }

  const rtnCode = params.RtnCode;
  if (rtnCode !== "1") {
    return new NextResponse("1|OK", { status: 200 });
  }

  const token = mintSubscriptionCookie(93);
  const res = new NextResponse("1|OK", { status: 200 });
  res.cookies.set(SUB_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 93 * 86400,
  });
  return res;
}
