import {
  FORBIDDEN_CUSTOMER_PHRASES,
  brandFactsText,
  buildClearanceOffer,
  buildCustomerHook,
  extractMentionedItems,
  menuCatalogText,
  promoItems,
} from "@/lib/menu";
import { store } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

export function countChars(text: string) {
  return text.replace(/\s/g, "").length;
}

export function buildSystemPrompt() {
  return [
    "你是台灣火鍋店社群文案，專為「翁記麻辣鍋－板橋店」寫 LINE 短文。",
    "只寫繁體中文，親切，emoji 最多 3 個。",
    "絕對禁止 [TODO]、placeholder、簡體字、英文草稿。",
    "",
    "【長度】80～140 字（不含空白）。超過就不合格。",
    "結構：①標題 ②優惠一句 ③地址＋電話 ④一句 CTA。",
    "",
    "【最重要：緊扣店長點名的品項】",
    "店長若說羊肉／鴨血／大腸…文案必須主打那些品項。",
    "禁止擅自改推店長沒提到的品項（例如店長說羊肉，就不要寫澳洲和牛）。",
    "禁止預設「888雙人套餐」（本店以鍋底＋單點為主：小鍋$300／中$400／大$500）。",
    "",
    "【內部備註→正面行銷】",
    "客人少／沒人點／剩很多 → 改成限時特惠、今晚主打、數量有限。",
    "禁止出現：過期、清料、剩很多、沒人點、客人少、庫存。",
    "正確短示範：「【今晚主打紐西蘭羊肉】羊肉$300限時特惠，搭配小鍋$300起！📍篤行路三段28號 ☎️(02)8675-5919 今晚就來翁記麻辣鍋！」",
    "",
    "必須含：翁記麻辣鍋、篤行路三段28號、電話 (02)8675-5919。",
    "",
    "【品牌】",
    brandFactsText(),
    "",
    "【真實菜單】",
    menuCatalogText(),
  ].join("\n");
}

export function buildUserPrompt(situation: string, weather: WeatherPayload) {
  const weatherLine = `${weather.district} ${weather.tempC}°C ${weather.description}`;
  const mentioned = promoItems(extractMentionedItems(situation));
  const mentionedLine =
    mentioned.length > 0
      ? `必須主打：${mentioned.map((m) => m.promoName).join("、")}（不可改推其他肉品）`
      : "（未對到具體品項→可用小鍋$300起＋人氣單點，仍勿亂推）";

  return [
    `天氣（可忽略）：${weatherLine}`,
    `店長內部備註（禁止原句給客人）：\n${situation.trim()}`,
    mentionedLine,
    "只輸出一篇 80～140 字短文，直接可貼 LINE。不要前言。",
  ].join("\n\n");
}

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

  // 禁止亂推 888（除非店長有提）
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

  if (situation) {
    const mentioned = promoItems(extractMentionedItems(situation));
    // 若店長點名品項但文案沒出現 → 強制補上，並拿掉無關主打
    for (const item of mentioned.slice(0, 2)) {
      const present = [item.name, item.promoName, ...item.aliases].some((t) =>
        out.includes(t),
      );
      if (!present && countChars(out) < 125) {
        out = out.replace(/^/, `【主打${item.name}】`);
        if (!out.includes(item.promoName) && !out.includes(item.name)) {
          out += `\n今晚特惠${item.promoName}`;
        }
      }
    }
    // 店長說羊肉時，若文案卻在推和牛 → 刪和牛句
    if (/羊肉|羊/.test(situation) && !/和牛|澳洲/.test(situation)) {
      out = out
        .split(/[，。！\n]/)
        .filter((seg) => !/和牛|澳洲和牛/.test(seg) || /羊肉|羊/.test(seg))
        .join("，")
        .replace(/，{2,}/g, "，");
    }
  }

  if (!out.includes(store.phone) && !out.includes("8675")) {
    out += `\n☎️${store.phone}`;
  }

  out = out.replace(/\n{3,}/g, "\n\n").trim();

  if (countChars(out) > 160) {
    const lines = out.split("\n").filter(Boolean);
    out = `${lines.slice(0, 4).join("\n")}\n📍${store.address} ☎️${store.phone}`.trim();
  }

  return out;
}
