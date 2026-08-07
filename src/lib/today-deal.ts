import { store } from "@/data/store";
import {
  getItemsByIds,
  shortDealLabel,
  discountPrice,
  buildClearanceOffer,
  buildCustomerHook,
  type MenuItem,
} from "@/lib/menu";
import type { WeatherPayload } from "@/lib/weather";

export type TodayDealPayload = {
  v: 1;
  at: string;
  ids: string[];
  note?: string;
};

export type TodayDealView = {
  at: string;
  note?: string;
  items: {
    id: string;
    name: string;
    price?: number;
    deal: number | null;
    label: string;
  }[];
  text: string;
  sharePath: string;
  storeName: string;
  address: string;
  phone: string;
};

const g = globalThis as unknown as {
  __wengjiTodayDeal?: TodayDealPayload;
};

function toBase64Url(json: string): string {
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(json, "utf8").toString("base64")
      : btoa(json);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(token: string): string {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const full = b64 + pad;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(full, "base64").toString("utf8");
  }
  return atob(full);
}

export function encodeTodayToken(payload: TodayDealPayload): string {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeTodayToken(token: string): TodayDealPayload | null {
  try {
    const raw = fromBase64Url(token);
    const data = JSON.parse(raw) as TodayDealPayload;
    if (data?.v !== 1 || !Array.isArray(data.ids) || data.ids.length === 0) {
      return null;
    }
    return {
      v: 1,
      at: data.at || new Date().toISOString(),
      ids: data.ids.filter((x) => typeof x === "string").slice(0, 40),
      note: typeof data.note === "string" ? data.note.slice(0, 80) : undefined,
    };
  } catch {
    return null;
  }
}

function weatherStub(): WeatherPayload {
  return {
    tempC: 24,
    description: "多雲",
    icon: "⛅",
    precipProb: 20,
    isFallback: true,
    district: store.district,
    fetchedAt: new Date().toISOString(),
  };
}

export function buildDealText(
  items: MenuItem[],
  note: string | undefined,
  at: string,
): string {
  const situation = note?.trim()
    ? `${items.map((i) => i.name).join("、")}要過期了。${note.trim()}`
    : `${items.map((i) => i.name).join("、")}要過期了，限時特價`;
  const w = weatherStub();
  // 用發布當下時間氣氛；雨在 note 裡即可
  const hook = buildCustomerHook(items, w.tempC, w.description, situation);
  const offer = buildClearanceOffer(items, situation);
  return `${hook}
${offer}
📍${store.address} ☎️${store.phone}
今晚就來翁記麻辣鍋，歡迎來吃！
更新：${new Date(at).toLocaleString("zh-TW", { hour12: false })}`;
}

export function payloadToView(payload: TodayDealPayload): TodayDealView | null {
  const items = getItemsByIds(payload.ids);
  if (items.length === 0) return null;
  const token = encodeTodayToken(payload);
  const text = buildDealText(items, payload.note, payload.at);
  return {
    at: payload.at,
    note: payload.note,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      deal: discountPrice(i),
      label: shortDealLabel(i),
    })),
    text,
    sharePath: `/today/s/${token}`,
    storeName: store.fullName,
    address: store.address,
    phone: store.phone,
  };
}

export async function saveLatestDeal(payload: TodayDealPayload): Promise<void> {
  g.__wengjiTodayDeal = payload;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    await fetch(`${url}/set/wengji:today-deal`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }
}

export async function loadLatestDeal(): Promise<TodayDealPayload | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    try {
      const res = await fetch(`${url}/get/wengji:today-deal`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { result?: string | null };
        if (data.result) {
          const parsed = JSON.parse(data.result) as TodayDealPayload;
          if (parsed?.v === 1 && Array.isArray(parsed.ids)) return parsed;
        }
      }
    } catch {
      /* fall through */
    }
  }
  return g.__wengjiTodayDeal ?? null;
}

export function siteOrigin(request?: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  if (request) {
    const u = new URL(request.url);
    return `${u.protocol}//${u.host}`;
  }
  return "https://wengji-banqiao-copilot.vercel.app";
}
