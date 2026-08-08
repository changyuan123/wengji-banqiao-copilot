import { createHmac, timingSafeEqual } from "crypto";

/** 寫進 QR 的簽名票券：即使伺服器忘記預約，掃碼仍能取袋 */
export type SignedBagTicket = {
  v: 1;
  id: string;
  code: string;
  bagId: string;
  price: number;
  title: string;
  hint: string;
  store: string;
  pickupStart: string;
  pickupEnd: string;
  exp: number; // unix sec
};

function ticketSecret() {
  return (
    process.env.BAG_TICKET_SECRET?.trim() ||
    process.env.SUBSCRIPTION_SECRET?.trim() ||
    "wengji-bag-ticket-dev-secret"
  );
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, "base64").toString("utf8");
}

export function signBagTicket(payload: SignedBagTicket): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", ticketSecret())
    .update(body)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${body}.${sig}`;
}

export function verifyBagTicket(token: string): SignedBagTicket | null {
  const parts = token.trim().split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;
  const expected = createHmac("sha256", ticketSecret())
    .update(body)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(fromB64url(body)) as SignedBagTicket;
    if (parsed?.v !== 1 || !parsed.id || !parsed.code) return null;
    if (parsed.exp * 1000 < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}
