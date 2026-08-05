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

export type ScenarioId = "cold_rain" | "weekday_offpeak" | "late_takeaway";

export const scenarios: {
  id: ScenarioId;
  title: string;
  blurb: string;
  focus: string;
}[] = [
  {
    id: "cold_rain",
    title: "冷雨夜衝桌",
    blurb: "天氣轉冷或下雨時，主打暖胃與限時避寒優惠",
    focus: "$888 雙人鴛鴦套餐",
  },
  {
    id: "weekday_offpeak",
    title: "平日離峰補位",
    blurb: "平日空桌時段，用加贈招牌品項拉客進店",
    focus: "免費招牌鴨血／滷臭豆腐",
  },
  {
    id: "late_takeaway",
    title: "深夜／外帶湯底",
    blurb: "晚間與外帶客群，強調打包回家與免服務費",
    focus: "外帶湯底＋免服務費",
  },
];
