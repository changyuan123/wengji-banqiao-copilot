import {
  FORBIDDEN_CUSTOMER_PHRASES,
  brandFactsText,
  buildClearanceOffer,
  buildCustomerHook,
  buildCustomerLead,
  extractMentionedItems,
  menuCatalogText,
} from "@/lib/menu";
import { store } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

export function buildSystemPrompt() {
  return [
    "你是台灣火鍋店的資深社群文案企劃，專為「翁記麻辣鍋－板橋店」撰寫 LINE／FB／IG 宣傳文。",
    "只寫繁體中文，親切有溫度，適度 emoji。",
    "絕對禁止 [TODO]、placeholder、英文草稿。",
    "",
    "【最重要：店長輸入是『內部備註』，不是給客人看的原文】",
    "店長可能寫：要過期、剩很多、清料、賣不完……這些是內部資訊。",
    "你必須改寫成『正面行銷』：限時特惠、今晚主打、數量有限、現點現涮、錯過可惜。",
    "絕對禁止在文案出現：過期、快過期、到期、快壞、清料、剩很多、消化備料、庫存、報廢。",
    "錯誤示範（禁止）：「今天店裡狀況：澳洲和牛要過期了」",
    "正確示範：「今晚澳洲和牛限時特選，點 888 雙人套餐加點／升級享優惠，數量有限晚來售完！」",
    "",
    "任務：",
    "1) 辨識店長提到的菜單品項",
    "2) 依菜單設計合理優惠（加贈、加點特惠、約 8 折等，語氣誠懇）",
    "3) 用正面話術推品項，製造今晚就來的急迫感，但不要恐嚇或暗示食安問題",
    "文案必須含：翁記麻辣鍋、篤行路三段28號、店址與電話。",
    "",
    "【品牌與門市】",
    brandFactsText(),
    "",
    "【完整菜單】",
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
      : "（未對到清單品項時，仍用正面限時暖胃話術，勿貼上店長原文）";

  return [
    `今日天氣（可融入開場）：${weatherLine}`,
    `店長內部備註（禁止原句貼給客人）：\n${situation.trim()}`,
    `已對到菜單品項：${mentionedLine}`,
    "請輸出可直接貼上的完整行銷文案（180–320 字）：標題、正面限時優惠、行動呼籲、地址電話。不要分析過程、不要複述內部備註。",
  ].join("\n\n");
}

/** 無 AI 時：正面行銷模板（絕不貼店長原文） */
export function templateCopy(situation: string, weather: WeatherPayload): string {
  const addr = `${store.address}（${store.addressHint}）`;
  const phone = store.phone;
  const items = extractMentionedItems(situation);
  const offer = buildClearanceOffer(items, situation);
  const hook = buildCustomerHook(items, weather.tempC, weather.description);
  const lead = buildCustomerLead(items);

  return `${hook}

${lead}

翁記麻辣鍋為您準備好長時間熬煮、溫潤可直接喝的招牌牛骨中藥麻辣湯底 🔥

${offer}

免服務費，餐後還有免費綠豆湯；外帶打包回家煮麵也很讚！

📍 店址：${addr}
☎️ 訂位/外帶專線：${phone}
今晚就出發，好料限量、手慢沒有！`;
}

export function sanitizeCopy(text: string, situation?: string): string {
  let out = text
    .replace(/\[TODO[^\]]*\]/gi, "")
    .replace(/\[Insert[^\]]*\]/gi, "")
    .replace(/\[.*?placeholder.*?\]/gi, "")
    .trim();

  // 若 AI／模板仍漏出內部用語，強制改寫／刪除
  for (const bad of FORBIDDEN_CUSTOMER_PHRASES) {
    if (out.includes(bad)) {
      out = out
        .split("\n")
        .filter((line) => !line.includes(bad))
        .join("\n");
      out = out.replaceAll(bad, "限時特選");
    }
  }

  // 禁止「今天店裡狀況：…」這類把內部備註貼上的句型
  out = out.replace(/^.*今天店裡狀況[:：].*$/gm, "").trim();
  out = out.replace(/^.*店長.*備註.*$/gm, "").trim();

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
        out += `\n今晚主打加點：${item.promoName}（限時特惠）`;
      }
    }
  }

  if (!out.includes("888") && !out.includes("雙人")) {
    out += `\n（推薦 ${store.menuFocus.combo888}）`;
  }
  if (!out.includes(store.phone) && !out.includes("訂位")) {
    out += `\n☎️ ${store.phone}`;
  }

  return out.replace(/\n{3,}/g, "\n\n").trim();
}
