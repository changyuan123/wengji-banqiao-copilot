import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SUB_COOKIE, verifySubscriptionCookie } from "@/lib/ecpay";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const value = jar.get(SUB_COOKIE)?.value;
  return NextResponse.json({ subscribed: verifySubscriptionCookie(value) });
}
