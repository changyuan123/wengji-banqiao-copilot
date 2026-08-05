import { NextResponse } from "next/server";
import { store } from "@/data/store";
import { fetchBanqiaoWeather, simulateBanqiaoWeather } from "@/lib/weather";

export const runtime = "nodejs";

export async function GET() {
  try {
    const weather = await fetchBanqiaoWeather(store.lat, store.lon);
    return NextResponse.json(weather);
  } catch {
    return NextResponse.json(simulateBanqiaoWeather());
  }
}
