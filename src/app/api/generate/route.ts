import { NextResponse } from "next/server";
import { type ScenarioId } from "@/data/store";
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

const SCENARIOS: ScenarioId[] = ["cold_rain", "weekday_offpeak", "late_takeaway"];

function isScenario(v: unknown): v is ScenarioId {
  return typeof v === "string" && (SCENARIOS as string[]).includes(v);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const scenario = isScenario(body.scenario) ? body.scenario : "cold_rain";
  const weather: WeatherPayload =
    body.weather && typeof body.weather.tempC === "number"
      ? body.weather
      : simulateBanqiaoWeather();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const text = sanitizeCopy(templateCopy(scenario, weather), scenario);
    return NextResponse.json({ text, source: "template", reason: "missing_api_key" });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.85,
        max_tokens: 700,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(scenario, weather) },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const text = sanitizeCopy(templateCopy(scenario, weather), scenario);
      return NextResponse.json({
        text,
        source: "template",
        reason: `openai_http_${res.status}`,
      });
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      const text = sanitizeCopy(templateCopy(scenario, weather), scenario);
      return NextResponse.json({ text, source: "template", reason: "empty_completion" });
    }

    return NextResponse.json({
      text: sanitizeCopy(raw, scenario),
      source: "openai",
    });
  } catch {
    const text = sanitizeCopy(templateCopy(scenario, weather), scenario);
    return NextResponse.json({ text, source: "template", reason: "timeout_or_error" });
  }
}
