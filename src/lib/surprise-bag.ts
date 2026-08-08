import { randomBytes } from "crypto";
import { getItemsByIds, type MenuItem } from "@/lib/menu";

/** 店長後台清楚記錄的袋內品項（給資料庫用，不直接秀給客人細項） */
export type BagContentItem = {
  itemId: string;
  name: string;
  role: string;
  price?: number;
};

/** 今晚一檔驚喜袋（由店長決定份數、價錢、時段） */
export type SurpriseBagOffer = {
  id: string;
  storeName: string;
  createdAt: string;
  /** 今晚共幾袋 */
  qty: number;
  reserved: number;
  pickedUp: number;
  /** 袋價（到店付） */
  price: number;
  /** 取餐開始／結束（台北 HH:mm） */
  pickupStart: string;
  pickupEnd: string;
  /** 停止接受預約的時間（台北 HH:mm）；到點就不能再約 */
  salesStopAt: string;
  /** 停止預約的絕對時間 */
  salesStopAtIso: string;
  /** 客人看到的標題 */
  publicTitle: string;
  /** 客人看到的模糊說明（驚喜感） */
  publicHint: string;
  /** 店長勾選的清楚菜單（資料庫） */
  contents: BagContentItem[];
  note?: string;
  /** 這檔有效到（通常＝取餐結束） */
  expiresAt: string;
};

export type BagReservation = {
  id: string;
  shortCode: string;
  bagId: string;
  guestId: string;
  status: "reserved" | "picked_up" | "expired";
  price: number;
  publicTitle: string;
  publicHint: string;
  pickupStart: string;
  pickupEnd: string;
  storeName: string;
  reservedAt: string;
  pickedUpAt?: string;
};

type GuestGuard = {
  id: string;
  dailyKey: string;
  dailyReserves: number;
  openReservationId?: string;
  missStreak: number;
  blockedUntil?: string;
};

const DAILY_LIMIT = 2;
const NOSHOW_LIMIT = 2;
const NOSHOW_BLOCK_DAYS = 2;

type MemoryStore = {
  latestBagId: string | null;
  bags: Map<string, SurpriseBagOffer>;
  reservations: Map<string, BagReservation>;
  codes: Map<string, string>;
  guests: Map<string, GuestGuard>;
};

const g = globalThis as unknown as { __wengjiBagMem?: MemoryStore };

function mem(): MemoryStore {
  if (!g.__wengjiBagMem) {
    g.__wengjiBagMem = {
      latestBagId: null,
      bags: new Map(),
      reservations: new Map(),
      codes: new Map(),
      guests: new Map(),
    };
  }
  return g.__wengjiBagMem;
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

export function taipeiDayKey(from = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(from);
}

function taipeiDayPlus(days: number, from = new Date()): string {
  const key = taipeiDayKey(from);
  const base = new Date(`${key}T00:00:00+08:00`);
  base.setTime(base.getTime() + days * 24 * 60 * 60 * 1000);
  return base.toISOString();
}

/** HH:mm → 今天台北該時刻的 ISO */
export function taipeiTodayAt(hhmm: string, from = new Date()): string {
  const day = taipeiDayKey(from);
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) throw new Error("時間格式請用例如 17:30");
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) {
    throw new Error("時間格式不正確");
  }
  const hh = String(h).padStart(2, "0");
  const mm = String(min).padStart(2, "0");
  return new Date(`${day}T${hh}:${mm}:00+08:00`).toISOString();
}

export function normalizeGuestId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim().slice(0, 80);
  if (!/^g_[a-zA-Z0-9_-]{8,64}$/.test(id)) return null;
  return id;
}

export function merchantPinOk(pin: string): boolean {
  const expected = (process.env.MERCHANT_PIN || "5919").trim();
  return pin.trim() === expected;
}

export function defaultMerchantPin(): string {
  return (process.env.MERCHANT_PIN || "5919").trim();
}

/** 依清楚菜單自動產生「模糊」客人文案（店長可再改） */
export function buildBlurryHint(items: MenuItem[]): string {
  const tags = new Set<string>();
  for (const i of items) {
    if (i.role === "protein" || i.role === "braised") tags.add("精選肉類");
    else if (i.role === "seafood") tags.add("海味");
    else if (i.role === "mushroom" || i.role === "veg") tags.add("菇蔬");
    else if (i.role === "ball" || i.role === "dumpling" || i.role === "side")
      tags.add("丸餃鍋料");
    else if (i.role === "addon") tags.add("招牌加點");
    else if (i.role === "carb") tags.add("主食");
    else tags.add("店長精選");
  }
  const list = [...tags];
  if (list.length === 0) {
    return "今晚隨機搭配店長精選食材，實際內容以現場為準，就是驚喜袋的樂趣。";
  }
  return `今晚隨機搭配：${list.join("、")}等（實際內容以現場為準，保留驚喜）。`;
}

export function summarizeBagPublic(bag: SurpriseBagOffer) {
  const remaining = Math.max(0, bag.qty - bag.reserved);
  const now = Date.now();
  const stopMs = new Date(bag.salesStopAtIso).getTime();
  const expired = now > new Date(bag.expiresAt).getTime();
  const salesOpen = !expired && now < stopMs && remaining > 0;
  return {
    id: bag.id,
    storeName: bag.storeName,
    publicTitle: bag.publicTitle,
    publicHint: bag.publicHint,
    price: bag.price,
    qty: bag.qty,
    remaining,
    reserved: bag.reserved,
    pickedUp: bag.pickedUp,
    pickupStart: bag.pickupStart,
    pickupEnd: bag.pickupEnd,
    salesStopAt: bag.salesStopAt,
    salesOpen,
    expiresAt: bag.expiresAt,
    /** 店長後台才看得到清楚清單 */
    contentsCount: bag.contents.length,
  };
}

export function summarizeBagMerchant(bag: SurpriseBagOffer) {
  return {
    ...summarizeBagPublic(bag),
    contents: bag.contents,
    note: bag.note,
    createdAt: bag.createdAt,
  };
}

async function saveBag(bag: SurpriseBagOffer): Promise<void> {
  mem().bags.set(bag.id, bag);
  mem().latestBagId = bag.id;
  await redisSet(`wengji:bag:${bag.id}`, JSON.stringify(bag));
  await redisSet("wengji:bag:latest", bag.id);
}

async function saveReservation(r: BagReservation): Promise<void> {
  mem().reservations.set(r.id, r);
  mem().codes.set(r.shortCode, r.id);
  await redisSet(`wengji:bagres:${r.id}`, JSON.stringify(r));
  await redisSet(`wengji:bagres:code:${r.shortCode}`, r.id);
}

async function saveGuest(guest: GuestGuard): Promise<void> {
  mem().guests.set(guest.id, guest);
  await redisSet(`wengji:bagguest:${guest.id}`, JSON.stringify(guest));
}

async function loadGuest(id: string): Promise<GuestGuard> {
  const raw = await redisGet(`wengji:bagguest:${id}`);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as GuestGuard;
      if (parsed?.id) {
        mem().guests.set(parsed.id, parsed);
        return parsed;
      }
    } catch {
      /* fall */
    }
  }
  return (
    mem().guests.get(id) ?? {
      id,
      dailyKey: taipeiDayKey(),
      dailyReserves: 0,
      missStreak: 0,
    }
  );
}

export async function loadBag(id: string): Promise<SurpriseBagOffer | null> {
  const raw = await redisGet(`wengji:bag:${id}`);
  if (raw) {
    try {
      const bag = JSON.parse(raw) as SurpriseBagOffer;
      mem().bags.set(bag.id, bag);
      return bag;
    } catch {
      /* fall */
    }
  }
  return mem().bags.get(id) ?? null;
}

export async function loadLatestBag(): Promise<SurpriseBagOffer | null> {
  const id = (await redisGet("wengji:bag:latest")) || mem().latestBagId;
  if (!id) return null;
  return loadBag(id);
}

export async function loadReservation(id: string): Promise<BagReservation | null> {
  const raw = await redisGet(`wengji:bagres:${id}`);
  if (raw) {
    try {
      const r = JSON.parse(raw) as BagReservation;
      mem().reservations.set(r.id, r);
      mem().codes.set(r.shortCode, r.id);
      return r;
    } catch {
      /* fall */
    }
  }
  return mem().reservations.get(id) ?? null;
}

export async function loadReservationByCode(
  code: string,
): Promise<BagReservation | null> {
  const normalized = code.replace(/\D/g, "").slice(0, 6);
  if (normalized.length !== 6) return null;
  const id =
    (await redisGet(`wengji:bagres:code:${normalized}`)) ||
    mem().codes.get(normalized) ||
    null;
  if (!id) return null;
  return loadReservation(id);
}

function formatTaipei(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "稍後";
  }
}

export type PublishBagInput = {
  qty: number;
  price: number;
  pickupStart: string;
  pickupEnd: string;
  salesStopAt: string;
  publicTitle?: string;
  publicHint?: string;
  itemIds: string[];
  note?: string;
  storeName: string;
};

export async function publishSurpriseBag(
  input: PublishBagInput,
): Promise<SurpriseBagOffer> {
  const qty = Math.floor(Number(input.qty));
  const price = Math.floor(Number(input.price));
  if (!Number.isFinite(qty) || qty < 1 || qty > 99) {
    throw new Error("袋數請填 1～99");
  }
  if (!Number.isFinite(price) || price < 1 || price > 9999) {
    throw new Error("袋價請由店長決定（建議 1～9999 元）");
  }

  const items = getItemsByIds(input.itemIds);
  if (items.length === 0) {
    throw new Error("請至少從菜單清楚勾選會進袋的食材（給資料庫用）");
  }

  const pickupStart = input.pickupStart.trim();
  const pickupEnd = input.pickupEnd.trim();
  const salesStopAt = input.salesStopAt.trim();
  const expiresAt = taipeiTodayAt(pickupEnd);
  const salesStopAtIso = taipeiTodayAt(salesStopAt);
  if (new Date(salesStopAtIso).getTime() > new Date(expiresAt).getTime()) {
    throw new Error("停止預約時間不能晚於取餐結束時間");
  }

  const contents: BagContentItem[] = items.map((i) => ({
    itemId: i.id,
    name: i.name,
    role: i.role,
    price: i.price,
  }));

  const bag: SurpriseBagOffer = {
    id: newId("bag"),
    storeName: input.storeName,
    createdAt: new Date().toISOString(),
    qty,
    reserved: 0,
    pickedUp: 0,
    price,
    pickupStart,
    pickupEnd,
    salesStopAt,
    salesStopAtIso,
    publicTitle:
      input.publicTitle?.trim().slice(0, 40) || "今晚火鍋惜食驚喜袋",
    publicHint:
      input.publicHint?.trim().slice(0, 120) || buildBlurryHint(items),
    contents,
    note: input.note?.trim().slice(0, 80) || undefined,
    expiresAt,
  };

  await saveBag(bag);
  return bag;
}

async function assertGuestMayReserve(guestId: string): Promise<GuestGuard> {
  const guest = await loadGuest(guestId);
  const today = taipeiDayKey();

  if (guest.blockedUntil && Date.now() < new Date(guest.blockedUntil).getTime()) {
    throw new Error(
      `你先前預約了卻沒來取，暫時不能約。請等到 ${formatTaipei(guest.blockedUntil)} 之後再試。`,
    );
  }
  if (guest.blockedUntil && Date.now() >= new Date(guest.blockedUntil).getTime()) {
    guest.blockedUntil = undefined;
    guest.missStreak = 0;
  }

  if (guest.dailyKey !== today) {
    guest.dailyKey = today;
    guest.dailyReserves = 0;
  }

  if (guest.openReservationId) {
    const open = await loadReservation(guest.openReservationId);
    if (open && open.status === "reserved") {
      const bag = await loadBag(open.bagId);
      const expired =
        !bag || Date.now() > new Date(bag.expiresAt).getTime();
      if (!expired) {
        throw new Error("你還有一袋沒取。請先到店取袋後，再預約下一袋。");
      }
      open.status = "expired";
      await saveReservation(open);
      guest.openReservationId = undefined;
      guest.missStreak += 1;
      if (guest.missStreak >= NOSHOW_LIMIT) {
        guest.blockedUntil = taipeiDayPlus(NOSHOW_BLOCK_DAYS);
        guest.missStreak = 0;
        await saveGuest(guest);
        throw new Error(
          `連續預約卻沒來取，暫停 ${NOSHOW_BLOCK_DAYS} 天（到 ${formatTaipei(guest.blockedUntil)}）。名額留給會來的人。`,
        );
      }
      await saveGuest(guest);
    } else {
      guest.openReservationId = undefined;
    }
  }

  if (guest.dailyReserves >= DAILY_LIMIT) {
    throw new Error(`今天已預約 ${DAILY_LIMIT} 袋，明天再來把機會留給其他人。`);
  }

  return guest;
}

export async function reserveBag(
  guestIdRaw: unknown,
): Promise<BagReservation> {
  const guestId = normalizeGuestId(guestIdRaw);
  if (!guestId) throw new Error("請重新整理頁面後再預約一次");

  const guest = await assertGuestMayReserve(guestId);
  const bag = await loadLatestBag();
  if (!bag) throw new Error("目前還沒有今晚的驚喜袋");

  const now = Date.now();
  if (now > new Date(bag.expiresAt).getTime()) {
    throw new Error("今晚取餐時間已過，請明天再來");
  }
  if (now >= new Date(bag.salesStopAtIso).getTime()) {
    throw new Error("店長已停止今晚預約，請下次早點來");
  }

  if (hasCloudStore()) {
    const key = `wengji:bag:reserved:${bag.id}`;
    const next = Number(await redisCommand(["INCR", key]));
    if (!Number.isFinite(next) || next > bag.qty) {
      await redisCommand(["DECR", key]);
      throw new Error("今晚驚喜袋已經約滿了");
    }
    bag.reserved = Math.max(bag.reserved, next);
  } else {
    if (bag.reserved >= bag.qty) throw new Error("今晚驚喜袋已經約滿了");
    bag.reserved += 1;
  }
  await saveBag(bag);

  const reservation: BagReservation = {
    id: newId("bres"),
    shortCode: newShortCode(),
    bagId: bag.id,
    guestId,
    status: "reserved",
    price: bag.price,
    publicTitle: bag.publicTitle,
    publicHint: bag.publicHint,
    pickupStart: bag.pickupStart,
    pickupEnd: bag.pickupEnd,
    storeName: bag.storeName,
    reservedAt: new Date().toISOString(),
  };
  await saveReservation(reservation);

  guest.dailyReserves += 1;
  guest.openReservationId = reservation.id;
  await saveGuest(guest);

  return reservation;
}

export async function pickupReservation(
  codeOrId: string,
  pin: string,
): Promise<{
  reservation: BagReservation;
  bag: SurpriseBagOffer;
  remainingAfterPickup: number;
}> {
  if (!merchantPinOk(pin)) throw new Error("店長密碼不正確");

  const looksLikeCode = /^\d{6}$/.test(codeOrId.trim());
  const reservation = looksLikeCode
    ? await loadReservationByCode(codeOrId.trim())
    : await loadReservation(codeOrId.trim());

  if (!reservation) throw new Error("找不到這筆預約");

  const bag = await loadBag(reservation.bagId);
  if (!bag) throw new Error("對應的驚喜袋不存在");

  if (Date.now() > new Date(bag.expiresAt).getTime()) {
    if (reservation.status === "reserved") {
      reservation.status = "expired";
      await saveReservation(reservation);
    }
    throw new Error("已過取餐時間，這袋已失效");
  }

  if (reservation.status === "picked_up") {
    throw new Error("這袋已經取過了");
  }

  if (hasCloudStore()) {
    const lock = await redisCommand([
      "SET",
      `wengji:bagpicked:${reservation.id}`,
      "1",
      "NX",
    ]);
    if (lock !== "OK") throw new Error("這袋已經取過了");
  }

  reservation.status = "picked_up";
  reservation.pickedUpAt = new Date().toISOString();
  await saveReservation(reservation);

  if (hasCloudStore()) {
    const n = Number(await redisCommand(["INCR", `wengji:bag:picked:${bag.id}`]));
    bag.pickedUp = Number.isFinite(n)
      ? Math.min(bag.qty, n)
      : Math.min(bag.qty, bag.pickedUp + 1);
  } else {
    bag.pickedUp = Math.min(bag.qty, bag.pickedUp + 1);
  }
  await saveBag(bag);

  const guest = await loadGuest(reservation.guestId);
  if (guest.openReservationId === reservation.id) {
    guest.openReservationId = undefined;
  }
  guest.missStreak = 0;
  guest.blockedUntil = undefined;
  await saveGuest(guest);

  return {
    reservation,
    bag,
    remainingAfterPickup: Math.max(0, bag.qty - bag.pickedUp),
  };
}

export function extractBagRef(raw: string): string | null {
  const text = raw.trim();
  if (/^\d{6}$/.test(text)) return text;
  try {
    const u = new URL(text);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("bag");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  } catch {
    /* not url */
  }
  const m = text.match(/bag\/([a-zA-Z0-9_]+)/);
  if (m?.[1]) return m[1];
  if (text.startsWith("bres_")) return text;
  return null;
}
