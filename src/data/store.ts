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

/** 老闆自填的今日營業輸入 */
export type BossBrief = {
  situation: string;
  goal: string;
};

/** 一鍵帶入的常用範例（可修改後再生成） */
export const briefPresets: {
  id: string;
  label: string;
  situation: string;
  goal: string;
}[] = [
  {
    id: "cold_rain",
    label: "冷雨夜衝桌",
    situation: "今晚天氣轉冷／下雨，附近居民想找暖胃晚餐，店內尚有空桌可衝。",
    goal: "主打今晚限時避寒：內用點選 $888 雙人鴛鴦套餐，加贈招牌滷鴨血或滷臭豆腐，拉客進店。",
  },
  {
    id: "weekday_offpeak",
    label: "平日離峰補位",
    situation: "平日離峰時段空桌偏多，附近社區與上班族尚未決定晚餐。",
    goal: "用平日離峰加贈招牌鴨血／滷臭豆腐補位，強調湯頭可喝與雙人套餐價值。",
  },
  {
    id: "late_takeaway",
    label: "深夜／外帶",
    situation: "晚間加班與晚歸客群增加，內用較少、外帶與自取需求上升。",
    goal: "主打外帶湯底與食材打包回家，免服務費，適合晚歸與自取客。",
  },
];
