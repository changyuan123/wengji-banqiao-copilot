import { NextResponse } from "next/server";
import type { BossBrief } from "@/data/store";
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

const MAX_LEN = 500;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.replace(/\r\n/g, "\n").trim().slice(0, MAX_LEN);
}

function parseBrief(body: Record<string, unknown>): BossBrief | null {
  const situation = cleanText(body.situation);
  const goal = cleanText(body.goal);
  if (!situation || !goal) return null;
  return { situation, goal };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const brief = parseBrief(body);
  if (!brief) {
    return NextResponse.json(
      { error: "請填寫今日營業狀況與營業目標" },
      { status: 400 },
    );
  }

  const weather: WeatherPayload =
    body.weather &&
    typeof body.weather === "object" &&
    body.weather !== null &&
    typeof (body.weather as WeatherPayload).tempC === "number"
      ? (body.weather as WeatherPayload)
      : simulateBanqiaoWeather();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const text = sanitizeCopy(templateCopy(brief, weather));
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
          { role: "user", content: buildUserPrompt(brief, weather) },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const text = sanitizeCopy(templateCopy(brief, weather));
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
      const text = sanitizeCopy(templateCopy(brief, weather));
      return NextResponse.json({ text, source: "template", reason: "empty_completion" });
    }

    return NextResponse.json({
      text: sanitizeCopy(raw),
      source: "openai",
    });
  } catch {
    const text = sanitizeCopy(templateCopy(brief, weather));
    return NextResponse.json({ text, source: "template", reason: "timeout_or_error" });
  }
}
