import {
  FORBIDDEN_CUSTOMER_PHRASES,
  brandFactsText,
  buildClearanceOffer,
  buildCustomerHook,
  extractMentionedItems,
  menuCatalogText,
} from "@/lib/menu";
import { store } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

/** 不含空白的字數（中文以字為單位） */
export function countChars(text: string) {
  return text.replace(/\s/g, "").length;
}

export function buildSystemPrompt() {
  return [
    "你是台灣火鍋店社群文案，專為「翁記麻辣鍋－板橋店」寫 LINE／FB 短文。",
    "只寫繁體中文，親切，emoji 最多 3～5 個。",
    "絕對禁止 [TODO]、placeholder、英文草稿。",
    "",
    "【長度硬性規定】全文（含標點、不含純空白）必須在 80～140 字。超過 140 字不合格，請刪到合格。",
    "結構固定 4 段以內：①標題一行 ②優惠一句 ③地址＋電話一行 ④一句 CTA。不要灌水、不要重複賣點。",
    "不要長篇天氣敘述；天氣最多半句或不寫。",
    "免服務費／綠豆湯最多提一次，能不提就不提。",
    "",
    "【店長輸入是內部備註】",
    "過期／剩很多／清料 → 改寫成限時特惠、今晚主打、數量有限。",
    "禁止出現：過期、清料、剩很多、消化備料、庫存、報廢。",
    "正確短示範：「【今晚主打澳洲和牛】點888雙人套餐加點享特惠，數量有限！📍篤行路三段28號 ☎️(02)2687-XXXX 今晚就來翁記麻辣鍋！」",
    "",
    "文案必須含：翁記麻辣鍋、篤行路三段28號、電話。",
    "",
    "【品牌】",
    brandFactsText(),
    "",
    "【菜單】",
    menuCatalogText(),
  ].join("\n");
}

export function buildUserPrompt(situation: string, weather: WeatherPayload) {
  const weatherLine = `${weather.district} ${weather.tempC}°C ${weather.description}`;
  const mentioned = extractMentionedItems(situation);
  const mentionedLine =
    mentioned.length > 0
      ? mentioned.map((m) => m.promoName).join("、")
      : "（未對到品項→寫正面限時暖胃短文，勿貼店長原文）";

  return [
    `天氣（可忽略或半句）：${weatherLine}`,
    `店長內部備註（禁止原句給客人）：\n${situation.trim()}`,
    `對到品項：${mentionedLine}`,
    "請只輸出一篇 80～140 字短文案，可直接貼 LINE。不要前言、不要解釋。",
  ].join("\n\n");
}

/** 無 AI：精簡正面模板 */
export function templateCopy(situation: string, weather: WeatherPayload): string {
  const items = extractMentionedItems(situation);
  const offer = buildClearanceOffer(items, situation);
  const hook = buildCustomerHook(items, weather.tempC, weather.description);
  return `${hook}
${offer}
📍${store.address} ☎️${store.phone}
今晚就來翁記麻辣鍋！`;
}

export function sanitizeCopy(text: string, situation?: string): string {
  let out = text
    .replace(/\[TODO[^\]]*\]/gi, "")
    .replace(/\[Insert[^\]]*\]/gi, "")
    .replace(/\[.*?placeholder.*?\]/gi, "")
    .trim();

  for (const bad of FORBIDDEN_CUSTOMER_PHRASES) {
    if (out.includes(bad)) {
      out = out
        .split("\n")
        .filter((line) => !line.includes(bad))
        .join("\n");
      out = out.replaceAll(bad, "限時特選");
    }
  }

  out = out.replace(/^.*今天店裡狀況[:：].*$/gm, "").trim();
  out = out.replace(/^.*店長.*備註.*$/gm, "").trim();

  if (!out.includes("翁記麻辣鍋")) {
    out = `翁記麻辣鍋｜${out}`;
  }
  if (!out.includes("篤行路三段28號") && !out.includes("篤行路三段 28")) {
    out += `\n📍${store.address}`;
  }

  if (situation) {
    const mentioned = extractMentionedItems(situation).filter(
      (i) => i.role !== "perk" && i.role !== "combo",
    );
    // 太長就不要再追加品項句，避免爆字數
    if (countChars(out) < 120) {
      for (const item of mentioned.slice(0, 2)) {
        const present = [item.name, item.promoName, ...item.aliases].some((t) =>
          out.includes(t),
        );
        if (!present) {
          out += `\n主打${item.promoName}`;
        }
      }
    }
  }

  if (!out.includes("888") && !out.includes("雙人") && countChars(out) < 130) {
    out += `\n推${store.menuFocus.combo888}`;
  }
  if (!out.includes(store.phone) && !out.includes("2687")) {
    out += `\n☎️${store.phone}`;
  }

  out = out.replace(/\n{3,}/g, "\n\n").trim();

  // 仍過長：保留前段＋強制地址電話結尾
  if (countChars(out) > 160) {
    const lines = out.split("\n").filter(Boolean);
    const kept = lines.slice(0, 4).join("\n");
    out = `${kept}\n📍${store.address} ☎️${store.phone}`.trim();
  }

  return out;
}
