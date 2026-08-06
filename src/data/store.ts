export const store = {
  name: "翁記麻辣鍋",
  branch: "板橋店",
  fullName: "翁記麻辣鍋－板橋店",
  title: "翁記麻辣鍋 板橋店專屬 AI 行銷助手",
  headerTitle: "翁記麻辣鍋 板橋店專屬爆客助手",
  subtitle: "新北市板橋區篤行路三段28號 專用版",
  address: "新北市板橋區篤行路三段28號",
  addressHint: "玉平巷口",
  phone: "(02) 2687-XXXX",
  lat: 24.9892,
  lon: 121.4322,
  district: "板橋",
  subscriptionPrice: 999,
  strengths: [
    "長時間熬煮、溫潤可直接喝的招牌牛骨中藥麻辣湯底",
    "雙人鴛鴦套餐 $888",
    "招牌滷鴨血",
    "滷臭豆腐",
    "滷大腸／大腸頭",
    "蔬菜白湯",
    "免費綠豆湯",
    "免服務費",
    "可打包外帶",
  ],
  menuFocus: {
    combo888: "💰888 雙人鴛鴦套餐",
    duckBlood: "招牌滷鴨血",
    stinkyTofu: "滷臭豆腐",
  },
} as const;

/** 快速填入範例（可點選帶入，老闆仍可自行改寫） */
export type ScenarioId = "cold_rain" | "weekday_offpeak" | "late_takeaway";

export const scenarios: {
  id: ScenarioId;
  title: string;
  status: string;
  goal: string;
  focus: string;
}[] = [
  {
    id: "cold_rain",
    title: "冷雨夜衝桌",
    status: "今晚天氣轉冷／下雨，內用桌數偏少，客人猶豫要不要出門",
    goal: "用限時避寒優惠衝今晚內用桌數，主打 $888 雙人鴛鴦套餐加贈招牌滷鴨血或滷臭豆腐",
    focus: "$888 雙人鴛鴦套餐",
  },
  {
    id: "weekday_offpeak",
    title: "平日離峰補位",
    status: "平日離峰時段空桌偏多，附近居民與上班族還沒被喚來",
    goal: "平日離峰補位，加贈招牌鴨血／滷臭豆腐，把空桌變成熱桌",
    focus: "免費招牌鴨血／滷臭豆腐",
  },
  {
    id: "late_takeaway",
    title: "深夜／外帶湯底",
    status: "晚間與深夜內用偏淡，加班晚歸客較多、想快速帶走",
    goal: "主推外帶湯底與打包食材，強調免服務費、回家也能暖胃",
    focus: "外帶湯底＋免服務費",
  },
];
