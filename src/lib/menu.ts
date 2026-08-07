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

  // 蔬菜（口語／語音容錯）
  {
    id: "kongxin",
    name: "空心菜",
    aliases: ["空心菜", "水蓮", "水璉", "水莲", "通菜", "蕹菜", "空心"],
    promoName: "空心菜$100",
    price: 100,
    role: "veg",
    popular: true,
  },
  {
    id: "napa",
    name: "高麗菜",
    aliases: ["高麗菜", "高丽菜", "包心菜"],
    promoName: "高麗菜",
    role: "veg",
  },
  {
    id: "dalumei",
    name: "大陸妹",
    aliases: ["大陸妹", "大陆妹", "A菜", "鵝仔菜"],
    promoName: "大陸妹",
    role: "veg",
  },
];

/** 口語／語音／錯字 → 正規別名（套用後再對菜單） */
export const ORAL_NORMALIZE: Record<string, string> = {
  水璉: "空心菜",
  水蓮: "空心菜",
  水莲: "空心菜",
  通菜: "空心菜",
  蕹菜: "空心菜",
  羊排: "羊肉",
  羊片: "羊肉",
  鴨血塊: "鴨血",
  和牛片: "和牛",
  澳牛: "澳洲和牛",
};

export const FORBIDDEN_CUSTOMER_PHRASES = [
  "過期",
  "快過期",
  "要過期",
  "即期",
  "即期品",
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

const MATCH_STOPWORDS =
  /要過期了?|快過期|過期了?|即期|到期|快壞|清料|清庫存|剩很多|剩超多|賣不完|沒人點|客人少|今天|今晚|明天|下大雨|下雨|大雨|偏多|備料|限時|特惠|想推|主打|搭配|小鍋|中鍋|大鍋/g;

export function menuCatalogText() {
  return menuCatalog
    .map((m) => {
      const price = m.price != null ? ` $${m.price}` : "";
      const pop = m.popular ? "（人氣）" : "";
      const deal = discountPrice(m);
      const dealLine =
        deal != null ? `｜限時特價$${deal}` : "｜限時特惠";
      return `- ${m.name}${price}${pop}${dealLine}｜口語：${m.aliases.join("／")}｜文案用「${m.promoName}」`;
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
    "即期／清料僅供內部：對客人只寫限時特價／折扣，禁止寫即期、過期、清料。",
  ].join("\n");
}

/** 約八折，取整到 10 元；最低不低於原價 5 折 */
export function discountPrice(item: MenuItem): number | null {
  if (item.price == null || item.price <= 0) return null;
  const raw = Math.round((item.price * 0.8) / 10) * 10;
  const floor = Math.round((item.price * 0.5) / 10) * 10;
  const deal = Math.max(raw, floor, 10);
  return deal >= item.price ? item.price - 10 : deal;
}

/** 客人看得到的折扣標示（不提即期） */
export function discountPromoLabel(item: MenuItem): string {
  const deal = discountPrice(item);
  if (item.price != null && deal != null) {
    return `${item.name}限時特價$${deal}（原價$${item.price}）`;
  }
  return `${item.name}限時特惠加點`;
}

export function normalizeOral(situation: string): string {
  let s = situation.replace(/\s/g, "");
  for (const [from, to] of Object.entries(ORAL_NORMALIZE)) {
    s = s.split(from).join(to);
  }
  return s;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length];
}

function scoreAlias(token: string, alias: string): number {
  if (!token || !alias) return 0;
  if (token === alias) return 100;
  if (token.includes(alias) || alias.includes(token)) {
    return 70 + Math.min(alias.length, token.length) * 2;
  }
  const dist = levenshtein(token, alias);
  const maxLen = Math.max(token.length, alias.length);
  if (maxLen <= 1) return 0;
  const sim = 1 - dist / maxLen;
  if (sim >= 0.6) return Math.round(sim * 60);
  // 共用字元
  const setB = new Set(alias);
  let shared = 0;
  for (const ch of token) if (setB.has(ch)) shared++;
  if (shared >= 2 && shared / maxLen >= 0.5) return 40 + shared * 5;
  return 0;
}

function extractTokens(situation: string): string[] {
  const cleaned = normalizeOral(situation).replace(MATCH_STOPWORDS, "");
  const tokens = cleaned.match(/[\u4e00-\u9fff]{2,6}/g) ?? [];
  const extra: string[] = [];
  for (const t of tokens) {
    if (t.length >= 4) {
      extra.push(t.slice(0, 2), t.slice(0, 3), t.slice(-2), t.slice(-3));
    }
  }
  return [...new Set([...tokens, ...extra])].filter((t) => t.length >= 2);
}

export function extractMentionedItems(situation: string): MenuItem[] {
  const s = normalizeOral(situation);
  const hit: MenuItem[] = [];
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

export type ResolvePromoResult = {
  items: MenuItem[];
  /** 模糊候選（分數較低，供 UI 點選） */
  candidates: MenuItem[];
  matched: boolean;
};

/** 精確＋模糊對菜；促銷品才算 matched */
export function resolvePromoItems(situation: string): ResolvePromoResult {
  const exact = promoItems(extractMentionedItems(situation));
  if (exact.length > 0) {
    return { items: exact, candidates: [], matched: true };
  }

  const tokens = extractTokens(situation);
  const scores = new Map<string, number>();
  for (const item of menuCatalog) {
    if (item.role === "pot" || item.role === "perk") continue;
    let best = 0;
    for (const token of tokens) {
      for (const alias of [item.name, ...item.aliases]) {
        best = Math.max(best, scoreAlias(token, alias));
      }
    }
    if (best > 0) scores.set(item.id, best);
  }

  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({
      item: menuCatalog.find((m) => m.id === id)!,
      score,
    }))
    .filter((x) => x.item);

  const strong = ranked.filter((x) => x.score >= 55).map((x) => x.item);
  const weak = ranked
    .filter((x) => x.score >= 35 && x.score < 55)
    .map((x) => x.item)
    .slice(0, 5);

  if (strong.length > 0) {
    return {
      items: promoItems(strong),
      candidates: weak,
      matched: true,
    };
  }

  const fallbackCandidates =
    weak.length > 0
      ? weak
      : menuCatalog.filter((m) => m.popular && m.role !== "pot").slice(0, 5);

  return {
    items: [],
    candidates: promoItems(fallbackCandidates).slice(0, 5),
    matched: false,
  };
}

/** 可推的主打品（排除純鍋型說明） */
export function promoItems(items: MenuItem[]): MenuItem[] {
  return items.filter((i) => i.role !== "pot" && i.role !== "perk");
}

export function isUrgencyClearance(situation: string): boolean {
  return /過期|即期|到期|快壞|清料|清庫存|剩很多|剩超多|賣不完|消化|沒人點|客人少|空桌|偏淡/.test(
    situation,
  );
}

export function hasRainCue(situation: string, weatherDesc?: string): boolean {
  return /下大雨|下雨|大雨|雷雨|降雨/.test(situation) || /雨/.test(weatherDesc ?? "");
}

export function buildClearanceOffer(items: MenuItem[], situation: string): string {
  const focus = promoItems(items);
  const urgent = isUrgencyClearance(situation);
  const tail = urgent ? "數量有限，晚來可能售完！" : "今日限時！";

  if (focus.length === 0) {
    return `今晚小鍋$300起，人氣單點限時特惠。${tail}`;
  }

  const labels = focus.slice(0, 2).map(discountPromoLabel);
  if (labels.length === 1) {
    return `今晚主打「${labels[0]}」，搭配小鍋$300起現點現涮。${tail}`;
  }
  return `今晚主打「${labels[0]}」「${labels[1]}」，小鍋$300起。${tail}`;
}

export function buildCustomerHook(
  items: MenuItem[],
  _temp: number,
  weatherDesc: string,
  situation?: string,
): string {
  const focus = promoItems(items);
  const rain = hasRainCue(situation ?? "", weatherDesc);
  const rainBit = rain ? "雨夜暖鍋·" : "";
  if (focus.length === 0) return `【翁記麻辣鍋｜${rainBit}今晚限時】`;
  const label = focus
    .slice(0, 2)
    .map((i) => i.name)
    .join("＋");
  return `【${rainBit}今晚主打${label}】`;
}

export function buildCustomerLead(items: MenuItem[]): string {
  const focus = promoItems(items);
  if (focus.length === 0) return "篤行路朋友今晚來暖胃！";
  if (focus.length === 1) return `「${discountPromoLabel(focus[0])}」，現點現涮！`;
  return `主打「${focus
    .slice(0, 2)
    .map((i) => discountPromoLabel(i))
    .join("、")}」！`;
}

export function popularPromoChoices(): MenuItem[] {
  return menuCatalog.filter((m) => m.popular && m.role !== "pot").slice(0, 8);
}
