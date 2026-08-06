import { NextResponse } from "next/server";
import { configuredAiProviders, generateWithAi } from "@/lib/ai";
import {
  buildSystemPrompt,
  buildUserPrompt,
  sanitizeCopy,
  templateCopy,
} from "@/lib/prompts";
import type { WeatherPayload } from "@/lib/weather";
import { simulateBanqiaoWeather } from "@/lib/weather";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const situation =
    typeof body.situation === "string" ? body.situation.trim() : "";

  if (situation.length < 4) {
    return NextResponse.json(
      { error: "請先輸入今日營業狀況或目標（至少幾個字）" },
      { status: 400 },
    );
  }

  const weather: WeatherPayload =
    body.weather && typeof body.weather.tempC === "number"
      ? body.weather
      : simulateBanqiaoWeather();

  const messages = [
    { role: "system" as const, content: buildSystemPrompt() },
    { role: "user" as const, content: buildUserPrompt(situation, weather) },
  ];

  const ai = await generateWithAi(messages);
  if (ai) {
    return NextResponse.json({
      text: sanitizeCopy(ai.text, situation),
      source: ai.source,
      providers: configuredAiProviders(),
    });
  }

  return NextResponse.json({
    text: sanitizeCopy(templateCopy(situation, weather), situation),
    source: "template",
    reason: "no_ai_key_or_all_failed",
    providers: configuredAiProviders(),
  });
}
