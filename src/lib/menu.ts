import { store } from "@/data/store";

/** 翁記可推品項：供 AI 與關鍵字清料邏輯使用 */
export type MenuItem = {
  id: string;
  name: string;
  /** 店長口語可能打的別名 */
  aliases: string[];
  /** 行銷時怎麼稱呼 */
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
    name: "牛肉",
    aliases: ["牛肉", "雪花牛", "梅花牛"],
    promoName: "精選牛肉",
    role: "protein",
  },
  {
    id: "pork",
    name: "梅花豬",
    aliases: ["梅花豬", "豬肉", "豬"],
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
    "只准使用上述菜單與賣點，不可發明沒有的品項或價格。",
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

/** 依清料品項組合理限時優惠句 */
export function buildClearanceOffer(items: MenuItem[]): string {
  const clearable = items.filter((i) => i.role !== "perk" && i.role !== "combo");
  const names = clearable.map((i) => i.promoName);
  if (names.length === 0) {
    return `今晚誠摯邀請內用 ${store.menuFocus.combo888}，湯頭溫潤可喝，免服務費。`;
  }
  if (names.length === 1) {
    return `極致回饋【今日限時清料優惠】：內用點選 ${store.menuFocus.combo888}，免費加贈「${names[0]}」乙份（今日備料充足，晚來可能沒有！）`;
  }
  if (names.length === 2) {
    return `極致回饋【今日雙重清料優惠】：內用點選 ${store.menuFocus.combo888}，可任選加贈「${names[0]}」或「${names[1]}」乙份；也可加點一次吃到兩個！`;
  }
  const head = names.slice(0, 3).join("、");
  return `極致回饋【今日清料特餐】：內用點選 ${store.menuFocus.combo888}，再加贈「${head}」相關加點優惠（今日備料偏多，歡迎來幫忙消化！）`;
}
