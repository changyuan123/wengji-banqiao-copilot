import {
  FORBIDDEN_CUSTOMER_PHRASES,
  brandFactsText,
  buildClearanceOffer,
  buildCustomerHook,
  discountPromoLabel,
  menuCatalogText,
  promoItems,
  resolvePromoItems,
} from "@/lib/menu";
import { store } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

export function countChars(text: string) {
  return text.replace(/\s/g, "").length;
}

export function buildSystemPrompt() {
  return [
    "你是台灣火鍋店社群文案，專為「翁記麻辣鍋－板橋店」寫「惜食客群／限時特價」LINE 短文。",
    "只寫繁體中文，親切，emoji 最多 3 個。",
    "絕對禁止 [TODO]、placeholder、簡體字、英文草稿。",
    "",
    "【長度】選 1～2 樣約 80～140 字；選 3 樣可到 180 字（不含空白），仍須精簡。",
    "結構：①標題（含全部已選品名）②特價一句（每個已選品都要有折扣）③地址＋電話 ④一句 CTA。",
    "",
    "【產品定位：惜食特價推播】",
    "店長用系統點選今日要推到惜食群的品項（最多 3 樣）。你只輸出給客人看的限時特價文案。",
    "店長選了幾樣，標題與特價句就必須出現幾樣，禁止只寫其中 2 樣。",
    "必須主打系統指定的品項，禁止改推其他肉品／單點。",
    "禁止預設「888雙人套餐」（鍋資：小$300／中$400／大$500）。",
    "",
    "【折扣話術｜極重要】",
    "內部即使是即期／快過期／清料／剩很多 → 對客人只寫：限時特價、今晚優惠、數量有限。",
    "必須寫出折扣感（限時特價$xx 或 原價$xx→特價$yy），讓客人覺得划算。",
    "禁止出現：即期、即期品、過期、清料、剩很多、沒人點、客人少、庫存、快壞。",
    "正確短示範：「【今晚主打紐西蘭羊肉】紐西蘭羊肉限時特價$240（原價$300），搭配小鍋$300起！📍篤行路三段28號 ☎️(02)8675-5919 今晚就來翁記麻辣鍋！」",
    "",
    "若店長有提到下雨／大雨，可加一句雨夜暖鍋（仍勿提庫存）。",
    "必須含：翁記麻辣鍋、篤行路三段28號、電話 (02)8675-5919。",
    "",
    "【品牌】",
    brandFactsText(),
    "",
    "【真實菜單＋限時特價參考】",
    menuCatalogText(),
  ].join("\n");
}

export function buildUserPrompt(
  situation: string,
  weather: WeatherPayload,
  presetItems?: ReturnType<typeof promoItems>,
) {
  const weatherLine = `${weather.district} ${weather.tempC}°C ${weather.description}`;
  const mentioned = (
    presetItems && presetItems.length > 0
      ? promoItems(presetItems)
      : promoItems(resolvePromoItems(situation).items)
  ).slice(0, 3);
  const dealLines = mentioned
    .slice(0, 3)
    .map((m) => discountPromoLabel(m))
    .join("、");
  const mentionedLine =
    mentioned.length > 0
      ? `必須主打並寫出折扣（共 ${Math.min(mentioned.length, 3)} 樣，缺一不可）：${dealLines}（不可改推其他品項；對客人禁止寫即期／過期）`
      : "（尚未對到品項——不應發生；若發生請只寫請店長重選品項）";

  const rainHint = /雨/.test(situation + weather.description)
    ? "店長或天氣提到雨：可加雨夜暖鍋鉤子。"
    : "天氣僅供氣氛，可不提。";

  const lenHint =
    mentioned.length >= 3
      ? "只輸出一篇短文（約 120～180 字），直接可貼 LINE。三樣品名與特價都要出現。不要前言。"
      : "只輸出一篇 80～140 字短文，直接可貼 LINE。不要前言。";

  return [
    `天氣：${weatherLine}。${rainHint}`,
    `店長內部備註（禁止原句給客人）：\n${situation.trim()}`,
    mentionedLine,
    lenHint,
  ].join("\n\n");
}

export function templateCopy(
  situation: string,
  weather: WeatherPayload,
  presetItems?: ReturnType<typeof promoItems>,
): string {
  const items = (
    presetItems && presetItems.length > 0
      ? promoItems(presetItems)
      : resolvePromoItems(situation).items
  ).slice(0, 3);
  const offer = buildClearanceOffer(items, situation);
  const hook = buildCustomerHook(
    items,
    weather.tempC,
    weather.description,
    situation,
  );
  return `${hook}
${offer}
📍${store.address} ☎️${store.phone}
今晚就來翁記麻辣鍋！`;
}

export function sanitizeCopy(
  text: string,
  situation?: string,
  presetItems?: ReturnType<typeof promoItems>,
): string {
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
      out = out.replaceAll(bad, "限時特價");
    }
  }

  out = out.replace(/^.*今天店裡狀況[:：].*$/gm, "").trim();

  if (situation && !/888|雙人套餐/.test(situation)) {
    out = out.replace(/💰?888\s*雙人鴛鴦套餐/g, "小鍋$300起");
    out = out.replace(/888雙人套餐/g, "小鍋$300起");
  }

  if (!out.includes("翁記麻辣鍋")) {
    out = `翁記麻辣鍋｜${out}`;
  }
  if (!out.includes("篤行路三段28號") && !out.includes("篤行路三段 28")) {
    out += `\n📍${store.address}`;
  }

  if (situation || (presetItems && presetItems.length > 0)) {
    const mentioned = (
      presetItems && presetItems.length > 0
        ? promoItems(presetItems)
        : promoItems(resolvePromoItems(situation ?? "").items)
    ).slice(0, 3);
    for (const item of mentioned) {
      const present = [item.name, item.promoName, ...item.aliases].some((t) =>
        out.includes(t),
      );
      if (!present) {
        out += `\n${discountPromoLabel(item)}`;
        if (!out.includes(item.name)) {
          out = out.replace(/^/, `【主打${item.name}】`);
        }
      }
    }
    if (situation && /羊肉|羊/.test(situation) && !/和牛|澳洲/.test(situation)) {
      out = out
        .split("\n")
        .map((line) => {
          if (!/和牛|澳洲和牛/.test(line)) return line;
          if (/羊肉|羊/.test(line)) return line;
          return "";
        })
        .filter(Boolean)
        .join("\n");
    }
  }

  if (!out.includes(store.phone) && !out.includes("8675")) {
    out += `\n☎️${store.phone}`;
  }

  out = out.replace(/\n{3,}/g, "\n\n").trim();

  // 三樣特價文較長，放寬上限避免裁掉第三樣
  if (countChars(out) > 220) {
    const lines = out.split("\n").filter(Boolean);
    out = `${lines.slice(0, 5).join("\n")}\n📍${store.address} ☎️${store.phone}`.trim();
  }

  return out;
}
