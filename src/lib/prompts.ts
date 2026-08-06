import { store, type BossBrief } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

export function buildSystemPrompt() {
  return [
    "你是台灣火鍋店的資深社群文案企劃，專為「翁記麻辣鍋－板橋店」撰寫 LINE 官方帳號與 Facebook／Instagram 宣傳文。",
    "只寫繁體中文，語氣親切在地、有溫度，適度使用 emoji。",
    "絕對禁止出現 [TODO]、[Insert]、placeholder、英文草稿、未完成括號提示。",
    "文案必須自然提到：店名「翁記麻辣鍋」、地址「篤行路三段28號」、以及 $888 雙人套餐或招牌鴨血（依老闆今日目標與狀況調整）。",
    "強調真實賣點：中藥牛骨麻辣湯底可喝、免服務費、免費綠豆湯、可外帶。",
    "請依老闆輸入的「今日營業狀況」與「今日營業目標」來決定主軸與優惠說法，不要忽略老闆的輸入。",
    "結尾固定含店址與訂位電話。",
    `電話：${store.phone}`,
    `完整地址：${store.address}（${store.addressHint}）`,
  ].join("\n");
}

export function buildUserPrompt(brief: BossBrief, weather: WeatherPayload) {
  const rain =
    weather.precipProb != null ? `降雨機率約 ${weather.precipProb}%` : "降雨資訊未知";
  const weatherLine = `${weather.district} 目前 ${weather.tempC}°C、${weather.description}（${rain}）${weather.isFallback ? "【模擬天氣】" : ""}`;

  return [
    `今日天氣：${weatherLine}`,
    `老闆回報｜今日營業狀況：\n${brief.situation}`,
    `老闆設定｜今日營業目標：\n${brief.goal}`,
    `品牌賣點（可自然穿插）：${store.strengths.join("、")}`,
    "請輸出一篇可直接貼上 LINE 社群／官方帳號的完整文案（約 180–320 字），含標題列、對應今日狀況與目標的優惠或行動呼籲、地址與電話。不要前言、不要解釋。",
  ].join("\n\n");
}

export function templateCopy(brief: BossBrief, weather: WeatherPayload): string {
  const temp = weather.tempC;
  const desc = weather.description;
  const addr = `${store.address}（${store.addressHint}）`;
  const phone = store.phone;
  const situation = brief.situation.trim() || "今日營業狀況依現場調整";
  const goal = brief.goal.trim() || `主打 ${store.menuFocus.combo888}，搭配 ${store.menuFocus.duckBlood}`;

  return `【🍲 翁記麻辣鍋板橋店｜今日爆客】

板橋現在 ${temp}°C、${desc}！
${situation}

今天我們的目標：
${goal}

湯底是長時間熬煮、溫潤可直接喝的招牌牛骨中藥麻辣湯 🔥
也推薦 ${store.menuFocus.combo888}，招牌 ${store.menuFocus.duckBlood}、${store.menuFocus.stinkyTofu} 都值得點。
免服務費，餐後免費綠豆湯，可內用也可打包外帶！

📍 店址：${addr}
☎️ 訂位/外帶專線：${phone}
現在就傳訊預訂，熱騰騰等你來！`;
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
  if (!out.includes("888") && !out.includes("鴨血")) {
    out += `\n（推薦 ${store.menuFocus.combo888}，搭配 ${store.menuFocus.duckBlood}）`;
  }
  if (!out.includes(store.phone) && !out.includes("訂位")) {
    out += `\n☎️ ${store.phone}`;
  }

  return out.trim();
}
