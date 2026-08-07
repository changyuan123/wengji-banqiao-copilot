import {
  FORBIDDEN_CUSTOMER_PHRASES,
  brandFactsText,
  buildClearanceOffer,
  buildCustomerHook,
  menuCatalogText,
  promoItems,
  resolvePromoItems,
  shortDealLabel,
} from "@/lib/menu";
import { store } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

export function countChars(text: string) {
  return text.replace(/\s/g, "").length;
}

export function buildSystemPrompt() {
  return [
    "你是台灣火鍋店社群文案，專為「翁記麻辣鍋－板橋店」寫「惜食客群／限時特價」短文。",
    "只寫繁體中文，親切，emoji 最多 3 個。",
    "絕對禁止 [TODO]、placeholder、簡體字、英文草稿。",
    "",
    "【固定結構｜選幾個寫幾個】",
    "①【翁記今晚惜食特價】（可加雨夜暖鍋）",
    "②今日限時：品名$特價、品名$特價…（店長選了幾樣就寫幾樣，不可少寫）",
    "③數量有限，歡迎來吃",
    "④地址＋電話＋一句 CTA",
    "品項多時用頓號串成清單，口語自然即可，不要省略任何已選品。",
    "",
    "【產品定位】",
    "店長點選今日要推到惜食群的品項（數量不限）。你只輸出給客人看的限時特價文。",
    "必須主打系統指定的品項，禁止改推其他品。",
    "禁止預設「888雙人套餐」（鍋資：小$300／中$400／大$500）。",
    "",
    "【折扣話術】",
    "內部即使是即期／清料 → 對客人只寫限時特價、數量有限。",
    "禁止：即期、過期、清料、剩很多、沒人點、庫存。",
    "示範：「【翁記今晚惜食特價】今日限時：水蓮$80、三記蝦餃$60、紐西蘭羊肉$240。數量有限，歡迎來吃！📍篤行路三段28號 ☎️(02)8675-5919 今晚就來翁記麻辣鍋！」",
    "",
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
  const mentioned =
    presetItems && presetItems.length > 0
      ? promoItems(presetItems)
      : promoItems(resolvePromoItems(situation).items);
  const dealLines = mentioned.map((m) => shortDealLabel(m)).join("、");
  const mentionedLine =
    mentioned.length > 0
      ? `必須全部寫出（共 ${mentioned.length} 樣，缺一不可）：${dealLines}（禁止寫即期／過期）`
      : "（尚未對到品項——請店長重選）";

  const rainHint = /雨/.test(situation + weather.description)
    ? "可加雨夜暖鍋鉤子。"
    : "天氣可不提。";

  return [
    `天氣：${weatherLine}。${rainHint}`,
    `店長內部備註（禁止原句給客人）：\n${situation.trim()}`,
    mentionedLine,
    "用固定惜食清單格式輸出，選幾個寫幾個。不要前言。",
  ].join("\n\n");
}

export function templateCopy(
  situation: string,
  weather: WeatherPayload,
  presetItems?: ReturnType<typeof promoItems>,
): string {
  const items =
    presetItems && presetItems.length > 0
      ? promoItems(presetItems)
      : resolvePromoItems(situation).items;
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
今晚就來翁記麻辣鍋，歡迎來吃！`;
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
    const mentioned =
      presetItems && presetItems.length > 0
        ? promoItems(presetItems)
        : promoItems(resolvePromoItems(situation ?? "").items);
    const missing = mentioned.filter(
      (item) =>
        ![item.name, item.promoName, ...item.aliases].some((t) =>
          out.includes(t),
        ),
    );
    if (missing.length > 0) {
      out += `\n今日限時補：${missing.map(shortDealLabel).join("、")}`;
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

  // 多品清單不強制裁短，避免漏品
  return out.replace(/\n{3,}/g, "\n\n").trim();
}
