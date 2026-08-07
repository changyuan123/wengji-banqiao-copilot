import { NextResponse } from "next/server";
import { configuredAiProviders, generateWithAi } from "@/lib/ai";
import { resolvePromoItems } from "@/lib/menu";
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

  if (situation.length < 2) {
    return NextResponse.json(
      { error: "請輸入今天要推的品項（例如：空心菜要過期了）" },
      { status: 400 },
    );
  }

  const weather: WeatherPayload =
    body.weather && typeof body.weather.tempC === "number"
      ? body.weather
      : simulateBanqiaoWeather();

  const resolved = resolvePromoItems(situation);
  const forceTemplate = body.forceTemplate === true;

  if (!resolved.matched || resolved.items.length === 0) {
    return NextResponse.json(
      {
        error: "認不出要推哪一道，請點選下方品項或改寫品名後再生成",
        needItem: true,
        candidates: resolved.candidates.map((c) => ({
          id: c.id,
          name: c.name,
          promoName: c.promoName,
        })),
        source: "need_item",
      },
      { status: 422 },
    );
  }

  const matchedMeta = resolved.items.slice(0, 3).map((i) => ({
    id: i.id,
    name: i.name,
    promoName: i.promoName,
  }));

  if (forceTemplate) {
    return NextResponse.json({
      text: sanitizeCopy(templateCopy(situation, weather), situation),
      source: "template",
      matched: matchedMeta,
      providers: configuredAiProviders(),
    });
  }

  const messages = [
    { role: "system" as const, content: buildSystemPrompt() },
    { role: "user" as const, content: buildUserPrompt(situation, weather) },
  ];

  const ai = await generateWithAi(messages);
  if (ai) {
    return NextResponse.json({
      text: sanitizeCopy(ai.text, situation),
      source: ai.source,
      matched: matchedMeta,
      providers: configuredAiProviders(),
    });
  }

  return NextResponse.json({
    text: sanitizeCopy(templateCopy(situation, weather), situation),
    source: "template",
    reason: "no_ai_key_or_all_failed",
    matched: matchedMeta,
    providers: configuredAiProviders(),
  });
}
