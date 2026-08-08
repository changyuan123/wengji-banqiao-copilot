import { createHash, createHmac, timingSafeEqual } from "crypto";

export type EcpayConfig = {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  stage: boolean;
};

export const SUBSCRIPTION_AMOUNT = 299;
/** 方案涵蓋月數（一次付清） */
export const SUBSCRIPTION_MONTHS = 3;
export const SUB_COOKIE = "wengji_sub";

export function getEcpayConfig(): EcpayConfig | null {
  const merchantId = process.env.ECPAY_MERCHANT_ID;
  const hashKey = process.env.ECPAY_HASH_KEY;
  const hashIv = process.env.ECPAY_HASH_IV;
  if (!merchantId || !hashKey || !hashIv) return null;
  return {
    merchantId,
    hashKey,
    hashIv,
    stage: process.env.ECPAY_MODE !== "production",
  };
}

export function ecpayEndpoint(stage: boolean) {
  return stage
    ? "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"
    : "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";
}

function dotNetUrlEncode(value: string) {
  return encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

/** ECPay CheckMacValue (SHA256 / EncryptType=1) */
export function generateCheckMacValue(
  params: Record<string, string>,
  hashKey: string,
  hashIv: string,
) {
  const filtered = Object.entries(params).filter(([k]) => k !== "CheckMacValue");
  filtered.sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const raw =
    `HashKey=${hashKey}&` +
    filtered.map(([k, v]) => `${k}=${v}`).join("&") +
    `&HashIV=${hashIv}`;
  const encoded = dotNetUrlEncode(raw).toLowerCase();
  return createHash("sha256").update(encoded).digest("hex").toUpperCase();
}

export function verifyCheckMacValue(
  params: Record<string, string>,
  hashKey: string,
  hashIv: string,
) {
  const incoming = params.CheckMacValue;
  if (!incoming) return false;
  const expected = generateCheckMacValue(params, hashKey, hashIv);
  return expected === incoming.toUpperCase();
}

export function buildMerchantTradeNo() {
  const ts = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const stamp =
    `${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}` +
    `${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `WJ${stamp}${rand}`.slice(0, 20);
}

export function formatEcpayDate(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

function subSecret() {
  return process.env.SUBSCRIPTION_SECRET || "dev-only-insecure-secret";
}

/** 簽章訂閱 cookie：exp.sig */
export function mintSubscriptionCookie(days = 31) {
  const exp = Math.floor(Date.now() / 1000) + days * 86400;
  const payload = `1.${exp}`;
  const sig = createHmac("sha256", subSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySubscriptionCookie(value: string | undefined): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [flag, expStr, sig] = parts;
  if (flag !== "1") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const payload = `${flag}.${expStr}`;
  const expected = createHmac("sha256", subSecret()).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function parseFormBody(raw: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const pair of raw.split("&")) {
    if (!pair) continue;
    const [k, v = ""] = pair.split("=");
    params[decodeURIComponent(k.replace(/\+/g, " "))] = decodeURIComponent(
      v.replace(/\+/g, " "),
    );
  }
  return params;
}
