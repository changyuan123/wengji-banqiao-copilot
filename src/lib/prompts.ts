import { store, type ScenarioId } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

export function buildSystemPrompt() {
  return [
    "你是台灣火鍋店的資深社群文案企劃，專為「翁記麻辣鍋－板橋店」撰寫 LINE 官方帳號與 Facebook／Instagram 宣傳文。",
    "只寫繁體中文，語氣親切在地、有溫度，適度使用 emoji。",
    "絕對禁止出現 [TODO]、[Insert]、placeholder、英文草稿、未完成括號提示。",
    "文案必須自然提到：店名「翁記麻辣鍋」、地址「篤行路三段28號」、以及 $888 雙人套餐或招牌鴨血（依情境）。",
    "強調真實賣點：中藥牛骨麻辣湯底可喝、免服務費、免費綠豆湯、可外帶。",
    "結尾固定含店址與訂位電話。",
    `電話：${store.phone}`,
    `完整地址：${store.address}（${store.addressHint}）`,
  ].join("\n");
}

export function buildUserPrompt(scenario: ScenarioId, weather: WeatherPayload) {
  const rain =
    weather.precipProb != null ? `降雨機率約 ${weather.precipProb}%` : "降雨資訊未知";
  const weatherLine = `${weather.district} 目前 ${weather.tempC}°C、${weather.description}（${rain}）${weather.isFallback ? "【模擬天氣】" : ""}`;

  const focusByScenario: Record<ScenarioId, string> = {
    cold_rain: `情境：冷雨夜衝桌。主打今晚限時避寒優惠：內用點選 ${store.menuFocus.combo888}，加贈 ${store.menuFocus.duckBlood} 或 ${store.menuFocus.stinkyTofu}。用天氣冷／下雨當開頭痛點。`,
    weekday_offpeak: `情境：平日離峰補位。主打平日離峰加贈 ${store.menuFocus.duckBlood}／${store.menuFocus.stinkyTofu}，引導附近居民來填空桌，可提及與周邊低價個人鍋差異（湯頭可喝、雙人套餐價值）。`,
    late_takeaway: `情境：深夜／外帶湯底。主打外帶湯底、打包回家煮麵也很讚、免服務費、大腸頭與鴨血備妥，適合晚歸與自取客。`,
  };

  return [
    `今日天氣：${weatherLine}`,
    focusByScenario[scenario],
    `品牌賣點：${store.strengths.join("、")}`,
    "請輸出一篇可直接貼上的完整文案（約 180–320 字），含標題列、優惠說明、行動呼籲、地址與電話。不要前言、不要解釋。",
  ].join("\n\n");
}

export function templateCopy(scenario: ScenarioId, weather: WeatherPayload): string {
  const temp = weather.tempC;
  const desc = weather.description;
  const addr = `${store.address}（${store.addressHint}）`;
  const phone = store.phone;

  if (scenario === "cold_rain") {
    return `【🌧️ 板橋今晚 ${temp} 度${desc}！熱騰騰的翁記麻辣鍋為您暖胃 🍲】

板橋篤行路的朋友們，今晚天氣轉冷又潮濕，晚餐不用傷腦筋！
翁記麻辣鍋為您準備好了長時間熬煮、溫潤可直接喝的招牌牛骨中藥麻辣湯底 🔥

極致回饋【今晚限時避寒優惠】：
即日起至今晚 21:30 前，憑此 LINE 訊息內用點選 💰888 雙人鴛鴦套餐：
免費加贈 🌟「招牌滷鴨血」或「滷臭豆腐」乙份（極致入味，在地老饕必點！）

熱湯、滑嫩鴨血、大腸頭已為您備妥！不用收服務費，打包回家煮麵也超讚！

📍 店址：${addr}
☎️ 訂位/外帶專線：${phone}
即刻出發，給自己一個暖呼呼的麻辣夜！`;
  }

  if (scenario === "weekday_offpeak") {
    return `【平日暖胃好時光｜翁記麻辣鍋板橋店補位優惠】

板橋現在 ${temp}°C、${desc}，平日來一鍋剛剛好！
想吃有靈魂的麻辣，不一定要週末排隊——翁記麻辣鍋（篤行路三段28號）平日離峰加碼：

內用雙人鴛鴦套餐 💰888，再加贈招牌滷鴨血或滷臭豆腐乙份 🌟
湯底是溫潤可喝的中藥牛骨麻辣＋蔬菜白湯，免服務費，餐後還有免費綠豆湯。

📍 ${addr}
☎️ ${phone}
今天就約鄰居／同事，把空桌變成熱桌！`;
  }

  return `【深夜／外帶也暖胃｜翁記麻辣鍋板橋店】

板橋 ${temp}°C ${desc}，加班晚歸也不要隨便打發！
翁記麻辣鍋提供外帶湯底與食材，招牌牛骨中藥麻辣湯溫潤可喝，滷大腸、招牌鴨血都可帶走。

💰888 雙人鴛鴦套餐同樣適合外帶分享；店內免服務費，打包回家煮麵超讚。

📍 ${addr}
☎️ 訂位/外帶：${phone}
傳訊預訂，熱騰騰帶回家！`;
}

/** 確保關鍵字齊全、清掉 placeholder */
export function sanitizeCopy(text: string, scenario: ScenarioId): string {
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
  if (!out.includes("888") && scenario !== "late_takeaway") {
    out += `\n（推薦 ${store.menuFocus.combo888}）`;
  }
  if (!out.includes("鴨血") && scenario !== "late_takeaway") {
    out += `\n加贈或必點：${store.menuFocus.duckBlood}`;
  }
  if (scenario === "late_takeaway" && !out.includes("888") && !out.includes("鴨血")) {
    out += `\n可選 ${store.menuFocus.combo888}，搭配 ${store.menuFocus.duckBlood}。`;
  }
  if (!out.includes(store.phone) && !out.includes("訂位")) {
    out += `\n☎️ ${store.phone}`;
  }

  return out.trim();
}
