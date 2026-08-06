import {
  brandFactsText,
  buildClearanceOffer,
  extractMentionedItems,
  menuCatalogText,
} from "@/lib/menu";
import { store } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

export function buildSystemPrompt() {
  return [
    "你是台灣火鍋店的資深社群文案企劃，專為「翁記麻辣鍋－板橋店」撰寫 LINE 官方帳號與 Facebook／Instagram 宣傳文。",
    "只寫繁體中文，語氣親切在地、有溫度，適度使用 emoji。",
    "絕對禁止出現 [TODO]、[Insert]、placeholder、英文草稿、未完成括號提示。",
    "店長會用口語描述今日營業狀況（例如：雞肉剩很多、豆皮偏多、湯太多、空桌）。你的任務是：",
    "1) 辨識店長提到的菜單品項與目標（清料／補位／外帶等）",
    "2) 只使用「完整菜單清單」裡的品項，設計合理的限時優惠組合（例如：點 $888 雙人套餐加贈豆皮／雞肉）",
    "3) 文案要明確點出那些「剩很多」的品項，引導客人來消化備料",
    "不要虛構店長沒說的庫存數字；把「偏多／剩很多」轉成限時優惠語氣即可。",
    "文案必須自然提到：店名「翁記麻辣鍋」、地址「篤行路三段28號」。",
    "結尾固定含店址與訂位電話。",
    "",
    "【品牌與門市資料】",
    brandFactsText(),
    "",
    "【完整菜單清單（只能用這些）】",
    menuCatalogText(),
  ].join("\n");
}

export function buildUserPrompt(situation: string, weather: WeatherPayload) {
  const rain =
    weather.precipProb != null ? `降雨機率約 ${weather.precipProb}%` : "降雨資訊未知";
  const weatherLine = `${weather.district} 目前 ${weather.tempC}°C、${weather.description}（${rain}）${weather.isFallback ? "【模擬天氣】" : ""}`;
  const mentioned = extractMentionedItems(situation);
  const mentionedLine =
    mentioned.length > 0
      ? mentioned.map((m) => m.promoName).join("、")
      : "（未精確對到品項，請依店長原文語意與菜單合理發揮）";

  return [
    `今日天氣（可適當融入開場）：${weatherLine}`,
    `店長今日營業狀況（原文）：\n${situation.trim()}`,
    `系統已對到的菜單品項：${mentionedLine}`,
    "請輸出一篇可直接貼上的完整文案（約 180–320 字），必須包含：標題、依清料／目標設計的優惠組合、行動呼籲、地址與電話。不要前言、不要解釋分析過程。",
  ].join("\n\n");
}

/** 無 AI 時：依菜單對應組清料文案（比單純關鍵字聰明） */
export function templateCopy(situation: string, weather: WeatherPayload): string {
  const temp = weather.tempC;
  const desc = weather.description;
  const addr = `${store.address}（${store.addressHint}）`;
  const phone = store.phone;
  const s = situation.trim();
  const items = extractMentionedItems(s);
  const clearable = items.filter((i) => i.role !== "perk" && i.role !== "combo");
  const offer = buildClearanceOffer(items);
  const takeaway = /外帶|打包|帶走/.test(s);

  const itemHook =
    clearable.length > 0
      ? clearable.map((i) => i.promoName).join("＋")
      : "今日現況";

  const hook = takeaway
    ? `【外帶清料｜翁記麻辣鍋板橋店】`
    : `【板橋 ${temp}°C ${desc}｜今日限時：${itemHook}】`;

  const bodyFocus =
    clearable.length > 0
      ? `今天「${clearable.map((i) => i.name).join("、")}」備料偏多，誠摯邀請篤行路的朋友來幫忙暖胃清料！`
      : `今天店裡狀況：${s}`;

  return `${hook}

板橋篤行路的朋友們！
${bodyFocus}

翁記麻辣鍋為您準備好長時間熬煮、溫潤可直接喝的招牌牛骨中藥麻辣湯底 🔥

${offer}

免服務費，餐後還有免費綠豆湯；外帶打包回家煮麵也很讚！

📍 店址：${addr}
☎️ 訂位/外帶專線：${phone}
即刻出發，好料不等人！`;
}

export function sanitizeCopy(text: string, situation?: string): string {
  let out = text
    .replace(/\[TODO[^\]]*\]/gi, "")
    .replace(/\[Insert[^\]]*\]/gi, "")
    .replace(/\[.*?placeholder.*?\]/gi, "")
    .trim();

  if (!out.includes("翁記麻辣鍋")) {
    out = `翁記麻辣鍋提醒您——\n${out}`;
  }
  if (!out.includes("篤行路三段28號") && !out.includes("篤行路三段 28")) {
    out += `\n\n📍 店址：${store.address}（${store.addressHint}）`;
  }

  if (situation) {
    const mentioned = extractMentionedItems(situation).filter(
      (i) => i.role !== "perk" && i.role !== "combo",
    );
    for (const item of mentioned) {
      const present = [item.name, item.promoName, ...item.aliases].some((t) =>
        out.includes(t),
      );
      if (!present) {
        out += `\n今日主打加贈／加點：${item.promoName}`;
      }
    }
  }

  if (!out.includes("888") && !out.includes("雙人")) {
    out += `\n（推薦 ${store.menuFocus.combo888}）`;
  }
  if (!out.includes(store.phone) && !out.includes("訂位")) {
    out += `\n☎️ ${store.phone}`;
  }

  return out.trim();
}
