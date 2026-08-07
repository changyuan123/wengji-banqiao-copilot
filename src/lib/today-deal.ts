import { store } from "@/data/store";
import {
  getItemsByIds,
  shortDealLabel,
  discountPrice,
  type MenuItem,
} from "@/lib/menu";

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
  const b64 = Buffer.from(json, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(token: string): string {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, "base64").toString("utf8");
}

export function encodeTodayToken(payload: TodayDealPayload): string {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeTodayToken(token: string): TodayDealPayload | null {
  try {
    const raw = fromBase64Url(decodeURIComponent(token));
    const data = JSON.parse(raw) as TodayDealPayload;
    if (data?.v !== 1 || !Array.isArray(data.ids) || data.ids.length === 0) {
      return null;
    }
    return {
      v: 1,
      at: typeof data.at === "string" ? data.at : new Date().toISOString(),
      ids: data.ids.filter((x) => typeof x === "string").slice(0, 40),
      note: typeof data.note === "string" ? data.note.slice(0, 80) : undefined,
    };
  } catch {
    return null;
  }
}

export function buildDealText(
  items: MenuItem[],
  note: string | undefined,
  at: string,
): string {
  const list = items.map(shortDealLabel).join("、");
  const rain = note && /雨/.test(note) ? "雨夜暖鍋·" : "";
  const updated = new Date(at).toLocaleString("zh-TW", { hour12: false });
  const noteLine = note?.trim() ? `\n（${note.trim()}）` : "";
  return `【${rain}翁記今晚惜食特價】
今日限時：${list}。小鍋$300起，數量有限，歡迎來吃！${noteLine}
📍${store.address} ☎️${store.phone}
今晚就來翁記麻辣鍋！
更新：${updated}`;
}

export function payloadToView(payload: TodayDealPayload): TodayDealView | null {
  const items = getItemsByIds(payload.ids);
  if (items.length === 0) return null;
  const token = encodeTodayToken(payload);
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
    text: buildDealText(items, payload.note, payload.at),
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
  if (!url || !token) return;
  try {
    await fetch(`${url}/set/wengji:today-deal`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch {
    /* ignore */
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
        if (typeof data.result === "string" && data.result) {
          const parsed = JSON.parse(data.result) as TodayDealPayload;
          if (parsed?.v === 1 && Array.isArray(parsed.ids) && parsed.ids.length) {
            return parsed;
          }
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
    try {
      const u = new URL(request.url);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* ignore */
    }
  }
  return "https://wengji-banqiao-copilot.vercel.app";
}
