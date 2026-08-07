import { NextResponse } from "next/server";
import { configuredAiProviders, generateWithAi } from "@/lib/ai";
import {
  getItemsByIds,
  resolvePromoItems,
  situationFromSelectedItems,
} from "@/lib/menu";
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
  const itemIds = Array.isArray(body.itemIds)
    ? body.itemIds.filter((x: unknown) => typeof x === "string")
    : [];
  const selected = getItemsByIds(itemIds).slice(0, 3);
  const extraNote =
    typeof body.situation === "string" ? body.situation.trim() : "";

  const situation =
    selected.length > 0
      ? situationFromSelectedItems(selected, extraNote)
      : extraNote;

  if (situation.length < 2) {
    return NextResponse.json(
      { error: "請先點選今天要推到惜食群的品項" },
      { status: 400 },
    );
  }

  const weather: WeatherPayload =
    body.weather && typeof body.weather.tempC === "number"
      ? body.weather
      : simulateBanqiaoWeather();

  const resolved =
    selected.length > 0
      ? { items: selected, candidates: [], matched: true as const }
      : resolvePromoItems(situation);
  const forceTemplate = body.forceTemplate === true;

  if (!resolved.matched || resolved.items.length === 0) {
    return NextResponse.json(
      {
        error: "認不出要推哪一道，請點選菜單按鈕",
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

  const focusItems = resolved.items.slice(0, 3);
  const matchedMeta = focusItems.map((i) => ({
    id: i.id,
    name: i.name,
    promoName: i.promoName,
  }));

  const effectiveSituation =
    selected.length > 0
      ? situationFromSelectedItems(focusItems, extraNote)
      : situation;

  if (forceTemplate) {
    return NextResponse.json({
      text: sanitizeCopy(
        templateCopy(effectiveSituation, weather, focusItems),
        effectiveSituation,
        focusItems,
      ),
      source: "template",
      matched: matchedMeta,
      providers: configuredAiProviders(),
    });
  }

  const messages = [
    { role: "system" as const, content: buildSystemPrompt() },
    {
      role: "user" as const,
      content: buildUserPrompt(effectiveSituation, weather, focusItems),
    },
  ];

  const ai = await generateWithAi(messages);
  if (ai) {
    return NextResponse.json({
      text: sanitizeCopy(ai.text, effectiveSituation, focusItems),
      source: ai.source,
      matched: matchedMeta,
      providers: configuredAiProviders(),
    });
  }

  return NextResponse.json({
    text: sanitizeCopy(
      templateCopy(effectiveSituation, weather, focusItems),
      effectiveSituation,
      focusItems,
    ),
    source: "template",
    reason: "no_ai_key_or_all_failed",
    matched: matchedMeta,
    providers: configuredAiProviders(),
  });
}
