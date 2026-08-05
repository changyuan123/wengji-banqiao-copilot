import { NextResponse } from "next/server";
import {
  getEcpayConfig,
  parseFormBody,
  verifyCheckMacValue,
} from "@/lib/ecpay";

export const runtime = "nodejs";

/** 定期定額後續扣款通知（MVP：驗簽後回 1|OK） */
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

  return new NextResponse("1|OK", { status: 200 });
}
