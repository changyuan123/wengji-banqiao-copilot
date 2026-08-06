import { store } from "@/data/store";

/** 翁記可推品項：供 AI 與關鍵字清料邏輯使用 */
export type MenuItem = {
  id: string;
  name: string;
  /** 店長口語可能打的別名 */
  aliases: string[];
  /** 行銷時怎麼稱呼（給客人看，一律正面） */
  promoName: string;
  /** 建議搭配角色 */
  role: "soup" | "protein" | "side" | "combo" | "perk";
};

export const menuCatalog: MenuItem[] = [
  {
    id: "combo888",
    name: "雙人鴛鴦套餐",
    aliases: ["888", "雙人", "鴛鴦套餐", "套餐"],
    promoName: "💰888 雙人鴛鴦套餐",
    role: "combo",
  },
  {
    id: "spicy_broth",
    name: "中藥牛骨麻辣湯",
    aliases: ["麻辣湯", "紅湯", "麻辣湯底", "湯底", "麻辣"],
    promoName: "溫潤可喝的中藥牛骨麻辣湯底",
    role: "soup",
  },
  {
    id: "veggie_broth",
    name: "蔬菜白湯",
    aliases: ["白湯", "清湯", "蔬菜湯"],
    promoName: "蔬菜白湯",
    role: "soup",
  },
  {
    id: "aussie_wagyu",
    name: "澳洲和牛",
    aliases: ["澳洲和牛", "和牛", "澳牛", "澳洲牛"],
    promoName: "澳洲和牛",
    role: "protein",
  },
  {
    id: "duck_blood",
    name: "招牌滷鴨血",
    aliases: ["鴨血", "滷鴨血"],
    promoName: "招牌滷鴨血",
    role: "side",
  },
  {
    id: "stinky_tofu",
    name: "滷臭豆腐",
    aliases: ["臭豆腐", "滷臭豆腐"],
    promoName: "滷臭豆腐",
    role: "side",
  },
  {
    id: "intestines",
    name: "滷大腸／大腸頭",
    aliases: ["大腸", "大腸頭", "滷大腸"],
    promoName: "滷大腸頭",
    role: "side",
  },
  {
    id: "chicken",
    name: "雞肉片／雞腿肉",
    aliases: ["雞肉", "雞腿", "雞肉片", "雞"],
    promoName: "鮮嫩雞肉",
    role: "protein",
  },
  {
    id: "tofu_skin",
    name: "豆皮",
    aliases: ["豆皮", "腐竹", "豆腐皮"],
    promoName: "豆皮",
    role: "side",
  },
  {
    id: "tofu",
    name: "豆腐",
    aliases: ["豆腐", "嫩豆腐"],
    promoName: "嫩豆腐",
    role: "side",
  },
  {
    id: "beef",
    name: "精選牛肉",
    aliases: ["牛肉", "雪花牛", "梅花牛"],
    promoName: "精選牛肉",
    role: "protein",
  },
  {
    id: "pork",
    name: "梅花豬",
    aliases: ["梅花豬", "豬肉"],
    promoName: "梅花豬",
    role: "protein",
  },
  {
    id: "mung_bean",
    name: "免費綠豆湯",
    aliases: ["綠豆湯"],
    promoName: "免費綠豆湯",
    role: "perk",
  },
];

/** 店長內部用語 → 禁止出現在給客人的文案 */
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
] as const;

export function menuCatalogText() {
  return menuCatalog
    .map((m) => `- ${m.name}（口語：${m.aliases.join("／")}）→ 文案用「${m.promoName}」`)
    .join("\n");
}

export function brandFactsText() {
  return [
    `店名：${store.fullName}`,
    `地址：${store.address}（${store.addressHint}）`,
    `電話：${store.phone}`,
    `固定賣點：${store.strengths.join("、")}`,
    "優先使用上述菜單品項；若店長提到清單內品項，必須做成正面限時優惠。",
  ].join("\n");
}

/** 從店長輸入抓出有對到菜單的品項（較長別名優先） */
export function extractMentionedItems(situation: string): MenuItem[] {
  const s = situation.replace(/\s/g, "");
  const hit: MenuItem[] = [];
  for (const item of menuCatalog) {
    const aliases = [...item.aliases].sort((a, b) => b.length - a.length);
    if (aliases.some((a) => s.includes(a))) hit.push(item);
  }
  return hit;
}

export function isUrgencyClearance(situation: string): boolean {
  return /過期|到期|快壞|清料|清庫存|剩很多|剩超多|賣不完|消化/.test(situation);
}

/**
 * 依品項組「給客人看」的限時優惠（禁止過期／清料等內部用語）
 */
export function buildClearanceOffer(items: MenuItem[], situation: string): string {
  const clearable = items.filter((i) => i.role !== "perk" && i.role !== "combo");
  const names = clearable.map((i) => i.promoName);
  const urgent = isUrgencyClearance(situation);
  const urgencyCue = urgent ? "今晚限定、數量有限，晚來可能售完！" : "今日限時，歡迎篤行路朋友來暖胃！";

  if (names.length === 0) {
    return `今晚誠摯邀請內用 ${store.menuFocus.combo888}，湯頭溫潤可喝，免服務費。${urgencyCue}`;
  }

  if (names.length === 1) {
    const n = names[0];
    if (urgent) {
      return `極致回饋【今晚 ${n} 限時特惠】：內用點選 ${store.menuFocus.combo888}，加點／升級「${n}」享特別優惠（約 8 折起，以現場為準），${urgencyCue}`;
    }
    return `今日主打：內用點選 ${store.menuFocus.combo888}，再加贈或加點「${n}」，暖胃又過癮！`;
  }

  if (names.length === 2) {
    return `極致回饋【今日雙重主打】：內用點選 ${store.menuFocus.combo888}，可加點「${names[0]}」與「${names[1]}」享限時組合優惠，${urgencyCue}`;
  }

  const head = names.slice(0, 3).join("、");
  return `今晚主推 ${store.menuFocus.combo888}，並加碼「${head}」限時加點優惠，${urgencyCue}`;
}

/** 正面開場句（絕不複述店長內部備註） */
export function buildCustomerHook(items: MenuItem[], weatherTemp: number, weatherDesc: string): string {
  const clearable = items.filter((i) => i.role !== "perk" && i.role !== "combo");
  if (clearable.length === 0) {
    return `【板橋 ${weatherTemp}°C ${weatherDesc}｜翁記麻辣鍋今晚限時暖胃】`;
  }
  const label = clearable.map((i) => i.promoName).join("＋");
  return `【板橋 ${weatherTemp}°C ${weatherDesc}｜今晚主打：${label}】`;
}

export function buildCustomerLead(items: MenuItem[]): string {
  const clearable = items.filter((i) => i.role !== "perk" && i.role !== "combo");
  if (clearable.length === 0) {
    return "板橋篤行路的朋友們，今晚想來鍋熱騰騰的麻辣嗎？翁記為您備妥新鮮好料！";
  }
  if (clearable.length === 1) {
    return `板橋篤行路的朋友們！今晚特別為您準備「${clearable[0].promoName}」限時特選——口感鮮美、現點現涮，錯過可惜！`;
  }
  return `板橋篤行路的朋友們！今晚主打「${clearable.map((i) => i.promoName).join("、")}」限時組合，新鮮好料現點現涮，歡迎來暖胃！`;
}
