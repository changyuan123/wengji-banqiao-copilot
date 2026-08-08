import { createHash, randomBytes } from "crypto";
import { discountPrice, getItemsByIds } from "@/lib/menu";

export type StockLine = {
  itemId: string;
  name: string;
  price?: number;
  dealPrice: number | null;
  qty: number;
  claimed: number;
  redeemed: number;
};

export type StockDeal = {
  id: string;
  createdAt: string;
  expiresAt: string;
  note?: string;
  lines: StockLine[];
};

export type CouponRecord = {
  id: string;
  shortCode: string;
  dealId: string;
  itemId: string;
  itemName: string;
  price?: number;
  dealPrice: number | null;
  status: "claimed" | "redeemed" | "expired";
  claimedAt: string;
  redeemedAt?: string;
};

type MemoryStore = {
  latestDealId: string | null;
  deals: Map<string, StockDeal>;
  coupons: Map<string, CouponRecord>;
  codes: Map<string, string>;
};

const g = globalThis as unknown as { __wengjiCouponMem?: MemoryStore };

function mem(): MemoryStore {
  if (!g.__wengjiCouponMem) {
    g.__wengjiCouponMem = {
      latestDealId: null,
      deals: new Map(),
      coupons: new Map(),
      codes: new Map(),
    };
  }
  return g.__wengjiCouponMem;
}

function redisCreds() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function hasCloudStore(): boolean {
  return !!redisCreds();
}

async function redisCommand(args: (string | number)[]): Promise<unknown> {
  const creds = redisCreds();
  if (!creds) return null;
  const res = await fetch(`${creds.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([args]),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: unknown }[];
  return data?.[0]?.result ?? null;
}

async function redisGet(key: string): Promise<string | null> {
  const result = await redisCommand(["GET", key]);
  return typeof result === "string" ? result : null;
}

async function redisSet(key: string, value: string): Promise<void> {
  await redisCommand(["SET", key, value]);
}

function newId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function newShortCode(): string {
  const n = randomBytes(3).readUIntBE(0, 3) % 1_000_000;
  return String(n).padStart(6, "0");
}

/** 台北時間當天 23:59:59 */
export function endOfTaipeiDay(from = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const day = fmt.format(from); // YYYY-MM-DD
  // 台北 23:59:59 → 先當 UTC+8
  const expires = new Date(`${day}T23:59:59+08:00`);
  return expires.toISOString();
}

export function merchantPinOk(pin: string): boolean {
  const expected = (process.env.MERCHANT_PIN || "5919").trim();
  return pin.trim() === expected;
}

export function defaultMerchantPin(): string {
  return (process.env.MERCHANT_PIN || "5919").trim();
}

function lineRemaining(line: StockLine) {
  return Math.max(0, line.qty - line.claimed);
}

export function summarizeDeal(deal: StockDeal) {
  return {
    ...deal,
    lines: deal.lines.map((l) => ({
      ...l,
      remainingToClaim: lineRemaining(l),
      remainingUnredeemed: Math.max(0, l.claimed - l.redeemed),
    })),
    totals: {
      qty: deal.lines.reduce((s, l) => s + l.qty, 0),
      claimed: deal.lines.reduce((s, l) => s + l.claimed, 0),
      redeemed: deal.lines.reduce((s, l) => s + l.redeemed, 0),
    },
  };
}

async function saveDeal(deal: StockDeal): Promise<void> {
  mem().deals.set(deal.id, deal);
  mem().latestDealId = deal.id;
  await redisSet(`wengji:stock:deal:${deal.id}`, JSON.stringify(deal));
  await redisSet("wengji:stock:latest", deal.id);
}

async function saveCoupon(coupon: CouponRecord): Promise<void> {
  mem().coupons.set(coupon.id, coupon);
  mem().codes.set(coupon.shortCode, coupon.id);
  await redisSet(`wengji:coupon:${coupon.id}`, JSON.stringify(coupon));
  await redisSet(`wengji:coupon:code:${coupon.shortCode}`, coupon.id);
}

export async function loadDeal(id: string): Promise<StockDeal | null> {
  const raw = await redisGet(`wengji:stock:deal:${id}`);
  if (raw) {
    try {
      const deal = JSON.parse(raw) as StockDeal;
      mem().deals.set(deal.id, deal);
      return deal;
    } catch {
      /* fall through */
    }
  }
  return mem().deals.get(id) ?? null;
}

export async function loadLatestDeal(): Promise<StockDeal | null> {
  const latestId = (await redisGet("wengji:stock:latest")) || mem().latestDealId;
  if (!latestId) return null;
  return loadDeal(latestId);
}

export async function loadCoupon(id: string): Promise<CouponRecord | null> {
  const raw = await redisGet(`wengji:coupon:${id}`);
  if (raw) {
    try {
      const c = JSON.parse(raw) as CouponRecord;
      mem().coupons.set(c.id, c);
      mem().codes.set(c.shortCode, c.id);
      return c;
    } catch {
      /* fall through */
    }
  }
  return mem().coupons.get(id) ?? null;
}

export async function loadCouponByCode(code: string): Promise<CouponRecord | null> {
  const normalized = code.replace(/\D/g, "").slice(0, 6);
  if (normalized.length !== 6) return null;
  const id =
    (await redisGet(`wengji:coupon:code:${normalized}`)) ||
    mem().codes.get(normalized) ||
    null;
  if (!id) return null;
  return loadCoupon(id);
}

export type ReleaseInput = {
  items: { itemId: string; qty: number }[];
  note?: string;
};

export async function releaseStock(input: ReleaseInput): Promise<StockDeal> {
  const lines: StockLine[] = [];
  for (const row of input.items) {
    const qty = Math.floor(Number(row.qty));
    if (!row.itemId || !Number.isFinite(qty) || qty < 1 || qty > 99) continue;
    const [menu] = getItemsByIds([row.itemId]);
    if (!menu) continue;
    lines.push({
      itemId: menu.id,
      name: menu.name,
      price: menu.price,
      dealPrice: discountPrice(menu),
      qty,
      claimed: 0,
      redeemed: 0,
    });
  }
  if (lines.length === 0) {
    throw new Error("請至少選擇一項，並設定份數（1–99）");
  }

  const deal: StockDeal = {
    id: newId("deal"),
    createdAt: new Date().toISOString(),
    expiresAt: endOfTaipeiDay(),
    note: input.note?.trim().slice(0, 80) || undefined,
    lines,
  };
  await saveDeal(deal);
  return deal;
}

function isExpired(deal: StockDeal, coupon?: CouponRecord): boolean {
  if (Date.now() > new Date(deal.expiresAt).getTime()) return true;
  if (coupon?.status === "expired") return true;
  return false;
}

export async function claimCoupon(itemId: string): Promise<CouponRecord> {
  const deal = await loadLatestDeal();
  if (!deal) throw new Error("目前沒有可領的惜食特價");
  if (isExpired(deal)) throw new Error("今日特價已截止，請明天再來");

  const line = deal.lines.find((l) => l.itemId === itemId);
  if (!line) throw new Error("這個品項不在今日特價裡");

  // 雲端資料庫：用計數器降低同時搶券超賣
  if (hasCloudStore()) {
    const key = `wengji:stock:claimed:${deal.id}:${itemId}`;
    const next = Number(await redisCommand(["INCR", key]));
    if (!Number.isFinite(next) || next > line.qty) {
      await redisCommand(["DECR", key]);
      throw new Error("這項已經被領完了");
    }
    line.claimed = Math.max(line.claimed, next);
  } else {
    if (line.claimed >= line.qty) throw new Error("這項已經被領完了");
    line.claimed += 1;
  }

  await saveDeal(deal);

  const coupon: CouponRecord = {
    id: newId("cpn"),
    shortCode: newShortCode(),
    dealId: deal.id,
    itemId: line.itemId,
    itemName: line.name,
    price: line.price,
    dealPrice: line.dealPrice,
    status: "claimed",
    claimedAt: new Date().toISOString(),
  };
  await saveCoupon(coupon);
  return coupon;
}

export async function redeemCoupon(
  couponIdOrCode: string,
  pin: string,
): Promise<{ coupon: CouponRecord; deal: StockDeal; remainingAfterRedeem: number }> {
  if (!merchantPinOk(pin)) {
    throw new Error("店長密碼不正確");
  }

  const looksLikeCode = /^\d{6}$/.test(couponIdOrCode.trim());
  const coupon = looksLikeCode
    ? await loadCouponByCode(couponIdOrCode.trim())
    : await loadCoupon(couponIdOrCode.trim());

  if (!coupon) throw new Error("找不到這張折價券");

  const deal = await loadDeal(coupon.dealId);
  if (!deal) throw new Error("對應的今日特價不存在");

  if (isExpired(deal, coupon)) {
    if (coupon.status === "claimed") {
      coupon.status = "expired";
      await saveCoupon(coupon);
    }
    throw new Error("這張券已過期（限當日使用）");
  }

  if (coupon.status === "redeemed") {
    throw new Error("這張券已經核銷過了");
  }

  // 雲端：SETNX 防止兩台手機同時掃同一張
  if (hasCloudStore()) {
    const lock = await redisCommand([
      "SET",
      `wengji:redeemed:${coupon.id}`,
      "1",
      "NX",
    ]);
    if (lock !== "OK") {
      throw new Error("這張券已經核銷過了");
    }
  }

  coupon.status = "redeemed";
  coupon.redeemedAt = new Date().toISOString();
  await saveCoupon(coupon);

  const line = deal.lines.find((l) => l.itemId === coupon.itemId);
  if (line) {
    if (hasCloudStore()) {
      const n = Number(
        await redisCommand(["INCR", `wengji:stock:redeemed:${deal.id}:${coupon.itemId}`]),
      );
      line.redeemed = Number.isFinite(n) ? Math.min(line.qty, n) : Math.min(line.qty, line.redeemed + 1);
    } else {
      line.redeemed = Math.min(line.qty, line.redeemed + 1);
    }
    await saveDeal(deal);
  }

  const remainingAfterRedeem = line
    ? Math.max(0, line.qty - line.redeemed)
    : 0;

  return { coupon, deal, remainingAfterRedeem };
}

export function couponFingerprint(id: string): string {
  return createHash("sha256").update(id).digest("hex").slice(0, 10);
}
