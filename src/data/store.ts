export const store = {
  name: "翁記麻辣鍋",
  branch: "板橋店",
  fullName: "翁記麻辣鍋－板橋店",
  title: "翁記麻辣鍋 板橋店專屬 AI 行銷助手",
  headerTitle: "翁記麻辣鍋 板橋店專屬爆客助手",
  subtitle: "新北市板橋區篤行路三段28號 專用版",
  address: "新北市板橋區篤行路三段28號",
  addressHint: "玉平巷口",
  phone: "(02) 8675-5919",
  lat: 24.9892,
  lon: 121.4322,
  district: "板橋",
  subscriptionPrice: 999,
  /** 真實菜單：以鍋底＋單點為主（非固定 888 套餐） */
  potSizes: [
    { name: "小鍋", people: "1–3人", price: 300 },
    { name: "中鍋", people: "4–6人", price: 400 },
    { name: "大鍋", people: "7人以上", price: 500 },
  ],
  broths: ["麻辣紅鍋", "鴛鴦鍋", "蔬菜白鍋"],
  strengths: [
    "溫潤可喝的中藥牛骨麻辣湯底",
    "鴛鴦／麻辣／蔬菜鍋底可選",
    "小鍋$300／中鍋$400／大鍋$500",
    "紐西蘭羊肉",
    "澳洲和牛",
    "招牌雪花牛",
    "秘製大腸頭",
    "加點招牌鴨血／招牌豆腐",
    "豆皮、手工丸滑等鍋料",
  ],
} as const;

/** 輸入框範例 */
export const situationExamples = [
  {
    label: "羊肉沒人點",
    text: "今天客人較少，羊肉類幾乎都沒人點，其他東西也剩很多，想推限時特惠把客人拉進來。",
  },
  {
    label: "澳洲和牛",
    text: "澳洲和牛想推今晚限時特惠，主打加點／升級。",
  },
  {
    label: "鴨血豆腐",
    text: "加點招牌鴨血跟招牌豆腐偏多，平日空桌，想做限時加贈。",
  },
  {
    label: "大腸頭",
    text: "秘製大腸頭備料偏多，想主打人氣滷味清桌。",
  },
  {
    label: "外帶",
    text: "內用偏淡想衝外帶，湯底食材可打包。",
  },
] as const;

export const situationPlaceholder = `例如：
今天客人較少，羊肉類幾乎沒人點，其他也剩很多，想推限時特惠…`;
