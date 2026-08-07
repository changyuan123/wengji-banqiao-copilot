type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type AiResult = {
  text: string;
  source: "groq" | "gemini" | "openai";
};

async function chatCompletionsCompatible(opts: {
  url: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  source: AiResult["source"];
  timeoutMs?: number;
}): Promise<AiResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10000);
  try {
    const res = await fetch(opts.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model,
        temperature: 0.85,
        max_tokens: 280,
        messages: opts.messages,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`${opts.source}_http_${res.status}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error(`${opts.source}_empty`);
    return { text, source: opts.source };
  } finally {
    clearTimeout(timer);
  }
}

async function geminiGenerate(opts: {
  apiKey: string;
  messages: ChatMessage[];
}): Promise<AiResult> {
  const system = opts.messages.find((m) => m.role === "system")?.content ?? "";
  const user = opts.messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `gemini-2.0-flash:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 280 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`gemini_http_${res.status}`);
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();
    if (!text) throw new Error("gemini_empty");
    return { text, source: "gemini" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 免費優先：Groq → Gemini → OpenAI → 呼叫端再走模板
 * Groq / Gemini 皆有免費額度；於 Vercel 環境變數設定對應 Key 即可。
 */
export async function generateWithAi(messages: ChatMessage[]): Promise<AiResult | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      return await chatCompletionsCompatible({
        url: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: groqKey,
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages,
        source: "groq",
      });
    } catch {
      /* try next */
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    try {
      return await geminiGenerate({ apiKey: geminiKey, messages });
    } catch {
      /* try next */
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      return await chatCompletionsCompatible({
        url: "https://api.openai.com/v1/chat/completions",
        apiKey: openaiKey,
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        source: "openai",
      });
    } catch {
      /* fall through */
    }
  }

  return null;
}

export function configuredAiProviders(): string[] {
  const list: string[] = [];
  if (process.env.GROQ_API_KEY) list.push("groq");
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) list.push("gemini");
  if (process.env.OPENAI_API_KEY) list.push("openai");
  return list;
}
