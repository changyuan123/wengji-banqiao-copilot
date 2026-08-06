import { store } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

export function buildSystemPrompt() {
  return [
    "你是台灣火鍋店的資深社群文案企劃，專為「翁記麻辣鍋－板橋店」撰寫 LINE 官方帳號與 Facebook／Instagram 宣傳文。",
    "只寫繁體中文，語氣親切在地、有溫度，適度使用 emoji。",
    "絕對禁止出現 [TODO]、[Insert]、placeholder、英文草稿、未完成括號提示。",
    "店長會用口語描述「今日營業狀況／目標」（例如：湯剩很多、鴨血偏多、空桌、想推外帶）。你要先理解重點，再寫成可直接貼上的行銷文案。",
    "文案必須自然提到：店名「翁記麻辣鍋」、地址「篤行路三段28號」。",
    "若店長有提到特定品項或套餐，文案要呼應；若未提到，可自然帶入 $888 雙人套餐或招牌鴨血等真實菜單賣點。",
    "不要虛構店長沒說的誇大庫存數字；可把「偏多／想清料」轉成限時優惠或邀請語，語氣真實。",
    "強調真實賣點：中藥牛骨麻辣湯底可喝、免服務費、免費綠豆湯、可外帶。",
    "結尾固定含店址與訂位電話。",
    `電話：${store.phone}`,
    `完整地址：${store.address}（${store.addressHint}）`,
  ].join("\n");
}

export function buildUserPrompt(situation: string, weather: WeatherPayload) {
  const rain =
    weather.precipProb != null ? `降雨機率約 ${weather.precipProb}%` : "降雨資訊未知";
  const weatherLine = `${weather.district} 目前 ${weather.tempC}°C、${weather.description}（${rain}）${weather.isFallback ? "【模擬天氣】" : ""}`;

  return [
    `今日天氣（可適當融入開場，不要硬拗）：${weatherLine}`,
    `店長今日營業狀況／目標（請據此分析並寫文案）：\n${situation.trim()}`,
    `品牌固定賣點（可選用）：${store.strengths.join("、")}`,
    "請輸出一篇可直接貼上的完整文案（約 180–320 字），含標題列、依店長狀況設計的優惠或號召、行動呼籲、地址與電話。不要前言、不要解釋、不要條列分析過程。",
  ].join("\n\n");
}

/** 無 OpenAI 時：依店長關鍵字組出可用模板 */
export function templateCopy(situation: string, weather: WeatherPayload): string {
  const temp = weather.tempC;
  const desc = weather.description;
  const addr = `${store.address}（${store.addressHint}）`;
  const phone = store.phone;
  const s = situation.trim();

  const mentionsSoup = /湯|麻辣|白湯|湯底/.test(s);
  const mentionsDuck = /鴨血/.test(s);
  const mentionsTakeaway = /外帶|打包|帶走/.test(s);
  const mentionsEmpty = /空桌|離峰|平日|客人少|淡/.test(s);

  let offer = `內用點選 ${store.menuFocus.combo888}，歡迎搭配招牌滷鴨血、滷臭豆腐。`;
  if (mentionsDuck && mentionsSoup) {
    offer = `今晚主推 ${store.menuFocus.combo888}：湯頭熬好了，再加贈或加點「招牌滷鴨血」暖胃又過癮！`;
  } else if (mentionsDuck) {
    offer = `今晚主打「招牌滷鴨血」＋ ${store.menuFocus.combo888}，入味鴨血趁熱來一鍋！`;
  } else if (mentionsSoup) {
    offer = `湯底已長時間熬煮完成，誠摯邀請您來享用 ${store.menuFocus.combo888}，溫潤麻辣湯可直接喝。`;
  } else if (mentionsTakeaway) {
    offer = `外帶湯底與食材都方便帶走；${store.menuFocus.combo888} 一樣適合打包分享，免服務費。`;
  } else if (mentionsEmpty) {
    offer = `平日來鍋剛剛好！內用 ${store.menuFocus.combo888}，可加點招牌滷鴨血，把空桌變成熱桌。`;
  }

  const hook = mentionsTakeaway
    ? `【外帶也暖胃｜翁記麻辣鍋板橋店】`
    : `【板橋 ${temp}°C ${desc}｜翁記麻辣鍋依今日現況限時招呼】`;

  return `${hook}

板橋篤行路的朋友們，今天店裡狀況是這樣——
${s}

翁記麻辣鍋已為您備妥溫潤可喝的中藥牛骨麻辣湯底 🔥
${offer}

免服務費，餐後還有免費綠豆湯；外帶打包回家煮麵也很讚！

📍 店址：${addr}
☎️ 訂位/外帶專線：${phone}
今天就出發，給自己一鍋熱騰騰的麻辣！`;
}

/** 確保關鍵字齊全、清掉 placeholder */
export function sanitizeCopy(text: string): string {
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
  if (!out.includes("888") && !out.includes("鴨血") && !out.includes("外帶")) {
    out += `\n（推薦 ${store.menuFocus.combo888}／${store.menuFocus.duckBlood}）`;
  }
  if (!out.includes(store.phone) && !out.includes("訂位")) {
    out += `\n☎️ ${store.phone}`;
  }

  return out.trim();
}
