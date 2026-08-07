import { store } from "@/data/store";

/** 翁記真實菜單（依門市菜單優化） */
export type MenuItem = {
  id: string;
  name: string;
  aliases: string[];
  promoName: string;
  price?: number;
  role: "soup" | "pot" | "protein" | "side" | "seafood" | "veg" | "perk";
  popular?: boolean;
};

export const menuCatalog: MenuItem[] = [
  // 鍋底／鍋型
  {
    id: "pot_small",
    name: "小鍋",
    aliases: ["小鍋"],
    promoName: "小鍋$300（1–3人）",
    price: 300,
    role: "pot",
  },
  {
    id: "pot_mid",
    name: "中鍋",
    aliases: ["中鍋"],
    promoName: "中鍋$400（4–6人）",
    price: 400,
    role: "pot",
  },
  {
    id: "pot_large",
    name: "大鍋",
    aliases: ["大鍋"],
    promoName: "大鍋$500（7人以上）",
    price: 500,
    role: "pot",
  },
  {
    id: "spicy_broth",
    name: "麻辣紅鍋",
    aliases: ["麻辣", "紅鍋", "麻辣湯", "紅湯", "湯底"],
    promoName: "溫潤可喝的中藥牛骨麻辣湯底",
    role: "soup",
  },
  {
    id: "yuanyang",
    name: "鴛鴦鍋",
    aliases: ["鴛鴦", "鴛鴦鍋"],
    promoName: "鴛鴦鍋（麻辣＋蔬菜）",
    role: "soup",
  },
  {
    id: "veggie_broth",
    name: "蔬菜白鍋",
    aliases: ["白鍋", "白湯", "蔬菜鍋", "清湯"],
    promoName: "蔬菜白鍋",
    role: "soup",
  },

  // 嚴選肉品
  {
    id: "short_rib",
    name: "頂級牛小排",
    aliases: ["牛小排", "頂級牛小排"],
    promoName: "頂級牛小排",
    price: 500,
    role: "protein",
    popular: true,
  },
  {
    id: "beef_tongue",
    name: "穀飼牛舌",
    aliases: ["牛舌", "穀飼牛舌"],
    promoName: "穀飼牛舌",
    price: 500,
    role: "protein",
  },
  {
    id: "aussie_wagyu",
    name: "澳洲和牛",
    aliases: ["澳洲和牛", "和牛", "澳牛"],
    promoName: "澳洲和牛$450",
    price: 450,
    role: "protein",
  },
  {
    id: "iberico",
    name: "伊比利豬肉",
    aliases: ["伊比利", "伊比利豬"],
    promoName: "伊比利豬肉",
    price: 450,
    role: "protein",
    popular: true,
  },
  {
    id: "snowflake",
    name: "招牌雪花牛",
    aliases: ["雪花牛", "招牌雪花牛"],
    promoName: "招牌雪花牛$300",
    price: 300,
    role: "protein",
    popular: true,
  },
  {
    id: "frosty_beef",
    name: "嚴選霜降牛",
    aliases: ["霜降牛", "霜降"],
    promoName: "嚴選霜降牛$300",
    price: 300,
    role: "protein",
    popular: true,
  },
  {
    id: "nz_beef",
    name: "紐西蘭低脂牛",
    aliases: ["紐西蘭低脂牛", "低脂牛"],
    promoName: "紐西蘭低脂牛$300",
    price: 300,
    role: "protein",
  },
  {
    id: "matsusaka",
    name: "特級松阪豬",
    aliases: ["松阪豬", "松阪"],
    promoName: "特級松阪豬$300",
    price: 300,
    role: "protein",
  },
  {
    id: "local_pork",
    name: "本地活菌豬",
    aliases: ["活菌豬"],
    promoName: "本地活菌豬$300",
    price: 300,
    role: "protein",
  },
  {
    id: "plum_pork",
    name: "本地梅花豬",
    aliases: ["梅花豬", "本地梅花豬"],
    promoName: "本地梅花豬$300",
    price: 300,
    role: "protein",
    popular: true,
  },
  {
    id: "nz_lamb",
    name: "紐西蘭羊肉",
    aliases: ["紐西蘭羊肉", "羊肉", "羊", "羊肉類", "羊肉片"],
    promoName: "紐西蘭羊肉$300",
    price: 300,
    role: "protein",
  },
  {
    id: "cherry_duck",
    name: "本地櫻桃鴨",
    aliases: ["櫻桃鴨", "鴨肉"],
    promoName: "本地櫻桃鴨$300",
    price: 300,
    role: "protein",
  },

  // 燙滷
  {
    id: "intestines",
    name: "秘製大腸頭",
    aliases: ["大腸頭", "大腸", "秘製大腸頭", "滷大腸"],
    promoName: "秘製大腸頭$300",
    price: 300,
    role: "side",
    popular: true,
  },
  {
    id: "tripe",
    name: "美味牛肚",
    aliases: ["牛肚"],
    promoName: "美味牛肚$300",
    price: 300,
    role: "side",
  },
  {
    id: "tendon",
    name: "Q彈牛筋",
    aliases: ["牛筋"],
    promoName: "Q彈牛筋$300",
    price: 300,
    role: "side",
  },
  {
    id: "shank",
    name: "香滷牛腱",
    aliases: ["牛腱", "滷牛腱"],
    promoName: "香滷牛腱$300",
    price: 300,
    role: "side",
  },

  // 海鮮精選
  {
    id: "seafood_a",
    name: "海鮮拼盤A",
    aliases: ["海鮮拼盤A", "海鮮A"],
    promoName: "海鮮拼盤A$500",
    price: 500,
    role: "seafood",
    popular: true,
  },
  {
    id: "seafood_b",
    name: "海鮮拼盤B",
    aliases: ["海鮮拼盤B", "海鮮B"],
    promoName: "海鮮拼盤B$600",
    price: 600,
    role: "seafood",
    popular: true,
  },
  {
    id: "shrimp",
    name: "草蝦",
    aliases: ["草蝦", "大草蝦", "巨無霸草蝦"],
    promoName: "草蝦",
    role: "seafood",
  },

  // 鍋料
  {
    id: "duck_blood",
    name: "鴨血糕",
    aliases: ["鴨血糕", "鴨血"],
    promoName: "鴨血糕$60",
    price: 60,
    role: "side",
    popular: true,
  },
  {
    id: "sig_duck_blood",
    name: "加點招牌鴨血",
    aliases: ["招牌鴨血", "加點鴨血", "滷鴨血"],
    promoName: "加點招牌鴨血$200",
    price: 200,
    role: "side",
    popular: true,
  },
  {
    id: "sig_tofu",
    name: "加點招牌豆腐",
    aliases: ["招牌豆腐", "加點豆腐"],
    promoName: "加點招牌豆腐$100",
    price: 100,
    role: "side",
    popular: true,
  },
  {
    id: "tofu_skin",
    name: "豆皮",
    aliases: ["豆皮", "腐竹"],
    promoName: "豆皮$50",
    price: 50,
    role: "side",
    popular: true,
  },
  {
    id: "tofu",
    name: "豆腐",
    aliases: ["豆腐", "嫩豆腐"],
    promoName: "豆腐",
    role: "side",
  },
  {
    id: "duck_ball",
    name: "鴨肉丸",
    aliases: ["鴨肉丸"],
    promoName: "鴨肉丸",
    price: 80,
    role: "side",
    popular: true,
  },
  {
    id: "youtiao",
    name: "老油條",
    aliases: ["油條", "老油條"],
    promoName: "老油條$40",
    price: 40,
    role: "side",
    popular: true,
  },
];

export const FORBIDDEN_CUSTOMER_PHRASES = [
  "過期",
  "快過期",
  "要過期",
  "到期",
  "快壞",
  "壞掉",
  "報廢",
  "清料",
  "清庫存",
  "剩很多",
  "剩超多",
  "太多了",
  "賣不完",
  "消化備料",
  "幫忙消化",
  "備料偏多",
  "庫存太多",
  "丟掉",
  "浪費",
  "沒人點",
  "客人少",
  "幾乎都沒",
] as const;

export function menuCatalogText() {
  return menuCatalog
    .map((m) => {
      const price = m.price != null ? ` $${m.price}` : "";
      const pop = m.popular ? "（人氣）" : "";
      return `- ${m.name}${price}${pop}｜口語：${m.aliases.join("／")}｜文案用「${m.promoName}」`;
    })
    .join("\n");
}

export function brandFactsText() {
  return [
    `店名：${store.fullName}`,
    `地址：${store.address}（${store.addressHint}）`,
    `電話：${store.phone}`,
    `鍋底：${store.broths.join("／")}；鍋資：小$300／中$400／大$500`,
    "本店以鍋底＋單點為主，不要預設發明「888雙人套餐」除非店長有說。",
    "若店長點名某品項（如羊肉），文案必須主打該品項，禁止改推無關的澳洲和牛等。",
  ].join("\n");
}

export function extractMentionedItems(situation: string): MenuItem[] {
  const s = situation.replace(/\s/g, "");
  const hit: MenuItem[] = [];
  // 較長別名優先，避免「羊」誤傷；同品項只加一次
  const ranked = [...menuCatalog].sort((a, b) => {
    const al = Math.max(...a.aliases.map((x) => x.length));
    const bl = Math.max(...b.aliases.map((x) => x.length));
    return bl - al;
  });
  for (const item of ranked) {
    const aliases = [...item.aliases].sort((a, b) => b.length - a.length);
    if (aliases.some((a) => s.includes(a))) {
      if (!hit.some((h) => h.id === item.id)) hit.push(item);
    }
  }
  return hit;
}

/** 可推的主打品（排除純鍋型說明） */
export function promoItems(items: MenuItem[]): MenuItem[] {
  return items.filter((i) => i.role !== "pot" && i.role !== "perk");
}

export function isUrgencyClearance(situation: string): boolean {
  return /過期|到期|快壞|清料|清庫存|剩很多|剩超多|賣不完|消化|沒人點|客人少|空桌|偏淡/.test(
    situation,
  );
}

export function buildClearanceOffer(items: MenuItem[], situation: string): string {
  const focus = promoItems(items);
  const names = focus.map((i) => i.promoName);
  const urgent = isUrgencyClearance(situation);
  const tail = urgent ? "數量有限，晚來可能售完！" : "今日限時！";

  if (names.length === 0) {
    if (/客人少|空桌|偏淡|沒人/.test(situation)) {
      return `今晚來小鍋$300起，主打人氣單點限時特惠。${tail}`;
    }
    return `今晚來翁記麻辣鍋，小鍋$300起，湯頭可喝。${tail}`;
  }
  if (names.length === 1) {
    return `今晚主打「${names[0]}」限時特惠，搭配小鍋$300起現點現涮。${tail}`;
  }
  if (names.length === 2) {
    return `今晚主打「${names[0]}」「${names[1]}」限時優惠，小鍋$300起。${tail}`;
  }
  return `今晚主打「${names.slice(0, 3).join("、")}」限時加點，小鍋$300起。${tail}`;
}

export function buildCustomerHook(items: MenuItem[], _temp: number, _desc: string): string {
  const focus = promoItems(items);
  if (focus.length === 0) return `【翁記麻辣鍋｜今晚限時】`;
  const label = focus
    .slice(0, 2)
    .map((i) => i.name)
    .join("＋");
  return `【今晚主打${label}】`;
}

export function buildCustomerLead(items: MenuItem[]): string {
  const focus = promoItems(items);
  if (focus.length === 0) return "篤行路朋友今晚來暖胃！";
  if (focus.length === 1) return `「${focus[0].promoName}」限時特選，現點現涮！`;
  return `主打「${focus
    .slice(0, 2)
    .map((i) => i.promoName)
    .join("、")}」，限量優惠！`;
}
