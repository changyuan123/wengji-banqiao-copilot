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

/** 輸入框範例：點一下可帶入，方便店長快速修改 */
export const situationExamples = [
  {
    label: "雞肉＋豆皮",
    text: "今天雞肉和豆皮剩很多，想清料，請依菜單設計限時優惠組合把這兩樣推出去。",
  },
  {
    label: "湯底偏多",
    text: "今天麻辣湯底還很多、白湯也剩不少，想推雙人套餐把湯消化掉，平日晚上空桌有點多。",
  },
  {
    label: "鴨血／大腸",
    text: "招牌滷鴨血與滷大腸備料偏多，想限時加贈吸引篤行路附近客人進來，主推888雙人鴛鴦。",
  },
  {
    label: "外帶清料",
    text: "內用偏淡，想主打外帶湯底與食材，強調免服務費、打包回家煮麵也很讚。",
  },
] as const;

export const situationPlaceholder = `例如：
今天雞肉和豆皮剩很多，想清料，幫我依菜單設計優惠組合…`;
