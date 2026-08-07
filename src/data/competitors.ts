export type Competitor = {
  id: string;
  name: string;
  shortName: string;
  address: string;
  price: string;
  threat: string;
  /** Google News / 搜尋用關鍵字 */
  searchQueries: string[];
  /** 近期人工情報（無公開新聞時仍有內容） */
  intelNotes: { text: string; at: string; tag: string }[];
};

/** 翁記板橋店周邊競品（篤行路商圈） */
export const competitors: Competitor[] = [
  {
    id: "guotaisong",
    name: "鍋太爽板橋篤行店",
    shortName: "鍋太爽",
    address: "篤行路二段 102 號",
    price: "$199–$279 個人鍋",
    threat: "低價攔截單人客",
    searchQueries: ["鍋太爽 板橋", "鍋太爽 篤行"],
    intelNotes: [
      {
        tag: "價格動態",
        text: "海鮮豆腐鍋維持約 $199 帶路，週末外送滿額折扣需持續盯。",
        at: "2026-08-04",
      },
      {
        tag: "定位威脅",
        text: "個人鍋低價＋外送評分優勢，容易截走單身／外送客。",
        at: "2026-08-01",
      },
    ],
  },
  {
    id: "lasifang",
    name: "辣四方麻辣燙板橋篤行店",
    shortName: "辣四方",
    address: "篤行路商圈",
    price: "$149–$169 快速單人餐",
    threat: "快速出餐＋外送",
    searchQueries: ["辣四方 板橋", "辣四方 麻辣燙 篤行"],
    intelNotes: [
      {
        tag: "促銷",
        text: "犇牛餐約 $169，外送滿 $200 折 $20 類活動曾出現，適合對照翁記加點策略。",
        at: "2026-08-03",
      },
    ],
  },
  {
    id: "qiansheng",
    name: "錢昇涮涮鍋",
    shortName: "錢昇",
    address: "篤行路三段 16 號（極近）",
    price: "日式個人涮涮鍋",
    threat: "距離極近、日常用餐",
    searchQueries: ["錢昇涮涮鍋 板橋", "錢昇 篤行路"],
    intelNotes: [
      {
        tag: "現場觀察",
        text: "平日午市促銷不明顯，晚間以固定客為主；距離翁記極近，需守住聚餐／鴛鴦定位。",
        at: "2026-08-02",
      },
    ],
  },
  {
    id: "area_hotpot",
    name: "板橋篤行路火鍋商圈",
    shortName: "商圈動態",
    address: "板橋／樹林交界・篤行路",
    price: "商圈綜合",
    threat: "低價個人鍋夾擊",
    searchQueries: ["板橋 火鍋 優惠", "篤行路 美食", "板橋 個人鍋"],
    intelNotes: [
      {
        tag: "商圈提醒",
        text: "夏季偏高溫壓低堂食時，周邊個人鍋與麻辣燙常用價格戰；翁記宜主打湯頭可喝＋單點品質。",
        at: "2026-08-05",
      },
    ],
  },
];
