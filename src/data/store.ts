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

/** 輸入框範例（內部備註；文案不會寫「即期／過期」） */
export const situationExamples = [
  {
    label: "水蓮＋大雨",
    text: "水璉要過期了 今天要下大雨",
  },
  {
    label: "三記蝦餃",
    text: "三記蝦餃要過期了，想推限時特價",
  },
  {
    label: "羊肉",
    text: "羊肉要過期了，想推限時特價",
  },
  {
    label: "和牛",
    text: "澳洲和牛剩很多，今晚特價清",
  },
  {
    label: "鴨血",
    text: "招牌鴨血快過期，要打折推",
  },
] as const;

export const situationPlaceholder = `例如：水璉要過期了、羊肉剩很多、鴨血快過期…
（對客人只會寫限時特價，不會寫即期／過期）`;