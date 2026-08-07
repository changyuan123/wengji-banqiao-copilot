import { store } from "@/data/store";

/** 翁記真實菜單（依門市菜單掃描建檔） */
export type MenuItem = {
  id: string;
  name: string;
  aliases: string[];
  promoName: string;
  price?: number;
  role:
    | "soup"
    | "pot"
    | "protein"
    | "braised"
    | "seafood"
    | "mushroom"
    | "veg"
    | "carb"
    | "addon"
    | "ball"
    | "dumpling"
    | "side"
    | "perk";
  popular?: boolean;
  note?: string;
};

/**
 * 完整菜單資料庫（電話 02-8675-5919）
 * 來源：翁記麻辣鍋門市菜單
 */
export const menuCatalog: MenuItem[] = [
  // ── 鍋型／湯底 ──
  {
    id: "pot_small",
    name: "小鍋",
    aliases: ["小鍋"],
    promoName: "小鍋$300（1–3人）",
    price: 300,
    role: "pot",
    note: "至少點1份紅區主菜",
  },
  {
    id: "pot_mid",
    name: "中鍋",
    aliases: ["中鍋"],
    promoName: "中鍋$400（4–6人）",
    price: 400,
    role: "pot",
    note: "至少點2份紅區主菜",
  },
  {
    id: "pot_large",
    name: "大鍋",
    aliases: ["大鍋"],
    promoName: "大鍋$500（7人以上）",
    price: 500,
    role: "pot",
    note: "至少點3份紅區主菜",
  },
  {
    id: "spicy_broth",
    name: "紅鍋（麻辣）",
    aliases: ["紅鍋", "麻辣", "麻辣湯", "紅湯", "湯底", "麻辣紅鍋"],
    promoName: "紅鍋（麻辣）",
    role: "soup",
  },
  {
    id: "yuanyang",
    name: "紅／白鍋（鴛鴦）",
    aliases: ["鴛鴦", "鴛鴦鍋", "紅白鍋", "紅／白鍋"],
    promoName: "鴛鴦鍋（紅／白）",
    role: "soup",
  },
  {
    id: "veggie_broth",
    name: "白鍋（蔬菜）",
    aliases: ["白鍋", "白湯", "蔬菜鍋", "清湯", "蔬菜白鍋"],
    promoName: "白鍋（蔬菜）",
    role: "soup",
  },

  // ── 嚴選肉品．主菜 ──
  {
    id: "short_rib",
    name: "頂級牛小排",
    aliases: ["牛小排", "頂級牛小排"],
    promoName: "頂級牛小排$500",
    price: 500,
    role: "protein",
    popular: true,
  },
  {
    id: "beef_tongue",
    name: "穀飼牛舌",
    aliases: ["牛舌", "穀飼牛舌"],
    promoName: "穀飼牛舌$500",
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
    aliases: ["伊比利", "伊比利豬", "伊比利豬肉"],
    promoName: "伊比利豬肉$450",
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
    aliases: ["霜降牛", "霜降", "嚴選霜降牛"],
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
    aliases: ["松阪豬", "松阪", "特級松阪豬"],
    promoName: "特級松阪豬$300",
    price: 300,
    role: "protein",
  },
  {
    id: "local_pork",
    name: "本地活菌豬",
    aliases: ["活菌豬", "本地活菌豬"],
    promoName: "本地活菌豬$300",
    price: 300,
    role: "protein",
    popular: true,
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
    aliases: ["紐西蘭羊肉", "羊肉", "羊", "羊肉類", "羊肉片", "羊排", "羊片"],
    promoName: "紐西蘭羊肉$300",
    price: 300,
    role: "protein",
  },
  {
    id: "cherry_duck",
    name: "本地櫻桃鴨",
    aliases: ["櫻桃鴨", "鴨肉", "本地櫻桃鴨"],
    promoName: "本地櫻桃鴨$300",
    price: 300,
    role: "protein",
  },

  // ── 燙滷珍饈．主菜 ──
  {
    id: "intestines",
    name: "秘製大腸頭",
    aliases: ["大腸頭", "大腸", "秘製大腸頭", "滷大腸"],
    promoName: "秘製大腸頭$300",
    price: 300,
    role: "braised",
    popular: true,
  },
  {
    id: "tripe",
    name: "美味牛肚",
    aliases: ["牛肚", "美味牛肚"],
    promoName: "美味牛肚$300",
    price: 300,
    role: "braised",
  },
  {
    id: "tendon",
    name: "Q彈牛筋",
    aliases: ["牛筋", "Q彈牛筋"],
    promoName: "Q彈牛筋$300",
    price: 300,
    role: "braised",
  },
  {
    id: "shank",
    name: "香滷牛腱",
    aliases: ["牛腱", "滷牛腱", "香滷牛腱"],
    promoName: "香滷牛腱$300",
    price: 300,
    role: "braised",
  },
  {
    id: "heart_tube",
    name: "心管",
    aliases: ["心管"],
    promoName: "心管$200",
    price: 200,
    role: "braised",
  },

  // ── 海味佳餚．主菜 ──
  {
    id: "seafood_luxury",
    name: "豪華海鮮拼盤",
    aliases: ["豪華海鮮拼盤", "豪華海鮮"],
    promoName: "豪華海鮮拼盤$1000",
    price: 1000,
    role: "seafood",
  },
  {
    id: "seafood_a",
    name: "海鮮拼盤A",
    aliases: ["海鮮拼盤A", "海鮮A", "海鮮拼盤 A"],
    promoName: "海鮮拼盤A$500",
    price: 500,
    role: "seafood",
    popular: true,
  },
  {
    id: "seafood_b",
    name: "海鮮拼盤B",
    aliases: ["海鮮拼盤B", "海鮮B", "海鮮拼盤 B"],
    promoName: "海鮮拼盤B$600",
    price: 600,
    role: "seafood",
    popular: true,
  },
  {
    id: "scallop",
    name: "干貝",
    aliases: ["干貝"],
    promoName: "干貝$380",
    price: 380,
    role: "seafood",
  },
  {
    id: "tuna",
    name: "南方黑鮪魚",
    aliases: ["黑鮪魚", "南方黑鮪魚", "鮪魚"],
    promoName: "南方黑鮪魚$350",
    price: 350,
    role: "seafood",
  },
  {
    id: "lobster",
    name: "生凍龍蝦",
    aliases: ["生凍龍蝦", "龍蝦"],
    promoName: "生凍龍蝦$400（1隻）",
    price: 400,
    role: "seafood",
    note: "1隻",
  },
  {
    id: "jumbo_shrimp",
    name: "巨無霸草蝦",
    aliases: ["巨無霸草蝦"],
    promoName: "巨無霸草蝦$400（4隻）",
    price: 400,
    role: "seafood",
    note: "4隻",
  },
  {
    id: "large_shrimp",
    name: "大草蝦",
    aliases: ["大草蝦"],
    promoName: "大草蝦$300（6隻）",
    price: 300,
    role: "seafood",
    note: "6隻",
  },
  {
    id: "shrimp",
    name: "草蝦",
    aliases: ["草蝦"],
    promoName: "草蝦$300（14隻）",
    price: 300,
    role: "seafood",
    note: "14隻",
  },
  {
    id: "squid",
    name: "透抽",
    aliases: ["透抽"],
    promoName: "透抽$250",
    price: 250,
    role: "seafood",
  },
  {
    id: "fish_fillet",
    name: "魚排",
    aliases: ["魚排"],
    promoName: "魚排$200",
    price: 200,
    role: "seafood",
  },
  {
    id: "baby_squid",
    name: "生凍小卷",
    aliases: ["小卷", "生凍小卷"],
    promoName: "生凍小卷$200",
    price: 200,
    role: "seafood",
  },

  // ── 養生菇類 ──
  {
    id: "mixed_mushroom",
    name: "綜合菇",
    aliases: ["綜合菇", "菇類拼盤"],
    promoName: "綜合菇$120",
    price: 120,
    role: "mushroom",
    popular: true,
  },
  {
    id: "king_oyster",
    name: "杏鮑菇",
    aliases: ["杏鮑菇"],
    promoName: "杏鮑菇$80",
    price: 80,
    role: "mushroom",
  },
  {
    id: "brown_beech",
    name: "鴻喜菇",
    aliases: ["鴻喜菇"],
    promoName: "鴻喜菇$80",
    price: 80,
    role: "mushroom",
  },
  {
    id: "white_beech",
    name: "美白菇",
    aliases: ["美白菇"],
    promoName: "美白菇$80",
    price: 80,
    role: "mushroom",
  },
  {
    id: "shiitake",
    name: "鮮香菇",
    aliases: ["鮮香菇", "香菇"],
    promoName: "鮮香菇$80",
    price: 80,
    role: "mushroom",
  },
  {
    id: "oyster_mushroom",
    name: "秀珍菇",
    aliases: ["秀珍菇"],
    promoName: "秀珍菇$80",
    price: 80,
    role: "mushroom",
  },
  {
    id: "enoki",
    name: "金針菇",
    aliases: ["金針菇", "金針"],
    promoName: "金針菇$80",
    price: 80,
    role: "mushroom",
  },

  // ── 生鮮蔬食 ──
  {
    id: "mixed_veg",
    name: "綜合蔬菜",
    aliases: ["綜合蔬菜", "蔬菜拼盤"],
    promoName: "綜合蔬菜$120",
    price: 120,
    role: "veg",
  },
  {
    id: "baby_cabbage",
    name: "娃娃菜",
    aliases: ["娃娃菜"],
    promoName: "娃娃菜$100",
    price: 100,
    role: "veg",
    popular: true,
  },
  {
    id: "leek_white",
    name: "蒜白",
    aliases: ["蒜白"],
    promoName: "蒜白$100",
    price: 100,
    role: "veg",
  },
  {
    id: "water_lily",
    name: "水蓮",
    aliases: ["水蓮", "水璉", "水莲"],
    promoName: "水蓮$100",
    price: 100,
    role: "veg",
  },
  {
    id: "dalumei",
    name: "大陸妹",
    aliases: ["大陸妹", "大陆妹", "A菜", "鵝仔菜"],
    promoName: "大陸妹$80",
    price: 80,
    role: "veg",
  },
  {
    id: "napa",
    name: "高麗菜",
    aliases: ["高麗菜", "高丽菜", "包心菜"],
    promoName: "高麗菜$80",
    price: 80,
    role: "veg",
  },
  {
    id: "tonghao",
    name: "茼蒿",
    aliases: ["茼蒿"],
    promoName: "茼蒿$80",
    price: 80,
    role: "veg",
    note: "季節限定",
  },
  {
    id: "baby_corn",
    name: "玉米筍",
    aliases: ["玉米筍"],
    promoName: "玉米筍$80",
    price: 80,
    role: "veg",
  },
  {
    id: "wood_ear",
    name: "木耳",
    aliases: ["木耳"],
    promoName: "木耳$80",
    price: 80,
    role: "veg",
  },
  {
    id: "daikon",
    name: "菜頭",
    aliases: ["菜頭", "白蘿蔔", "蘿蔔"],
    promoName: "菜頭$70",
    price: 70,
    role: "veg",
  },
  {
    id: "broccoli",
    name: "綠花椰",
    aliases: ["綠花椰", "花椰菜", "青花菜"],
    promoName: "綠花椰$70",
    price: 70,
    role: "veg",
    popular: true,
  },
  {
    id: "pumpkin",
    name: "南瓜",
    aliases: ["南瓜"],
    promoName: "南瓜$70",
    price: 70,
    role: "veg",
  },
  {
    id: "taro",
    name: "芋頭",
    aliases: ["芋頭"],
    promoName: "芋頭$70",
    price: 70,
    role: "veg",
  },
  {
    id: "sweet_corn",
    name: "甜玉米",
    aliases: ["甜玉米", "玉米"],
    promoName: "甜玉米$60",
    price: 60,
    role: "veg",
    popular: true,
  },

  // ── 米麵．副食 ──
  {
    id: "dongfen",
    name: "龍口冬粉",
    aliases: ["冬粉", "龍口冬粉"],
    promoName: "龍口冬粉$40",
    price: 40,
    role: "carb",
  },
  {
    id: "udon",
    name: "烏龍麵",
    aliases: ["烏龍麵", "烏龍面"],
    promoName: "烏龍麵$40",
    price: 40,
    role: "carb",
  },
  {
    id: "prince_noodle",
    name: "王子麵",
    aliases: ["王子麵", "王子面"],
    promoName: "王子麵$20",
    price: 20,
    role: "carb",
  },
  {
    id: "rice",
    name: "白飯",
    aliases: ["白飯"],
    promoName: "白飯$10",
    price: 10,
    role: "carb",
  },
  {
    id: "egg",
    name: "雞蛋",
    aliases: ["雞蛋"],
    promoName: "雞蛋$10",
    price: 10,
    role: "carb",
  },

  // ── 美味加點 ──
  {
    id: "sig_duck_blood",
    name: "加點招牌鴨血",
    aliases: ["招牌鴨血", "加點鴨血", "滷鴨血", "加點招牌鴨血"],
    promoName: "加點招牌鴨血$200",
    price: 200,
    role: "addon",
    popular: true,
    note: "限量",
  },
  {
    id: "sig_tofu",
    name: "加點招牌豆腐",
    aliases: ["招牌豆腐", "加點豆腐", "加點招牌豆腐"],
    promoName: "加點招牌豆腐$100",
    price: 100,
    role: "addon",
    popular: true,
    note: "限量",
  },

  // ── 手工丸滑 ──
  {
    id: "fuzhou_fish_ball",
    name: "福州大魚丸",
    aliases: ["福州大魚丸", "福州魚丸", "大魚丸"],
    promoName: "福州大魚丸$100",
    price: 100,
    role: "ball",
  },
  {
    id: "swallow_ball",
    name: "古早味燕丸",
    aliases: ["燕丸", "古早味燕丸"],
    promoName: "古早味燕丸$100",
    price: 100,
    role: "ball",
  },
  {
    id: "burst_beef_ball",
    name: "爆漿牛肉丸",
    aliases: ["爆漿牛肉丸", "牛肉丸"],
    promoName: "爆漿牛肉丸$100",
    price: 100,
    role: "ball",
  },
  {
    id: "taro_ball",
    name: "芋頭貢丸",
    aliases: ["芋頭貢丸"],
    promoName: "芋頭貢丸$100",
    price: 100,
    role: "ball",
  },
  {
    id: "shiitake_ball",
    name: "香菇貢丸",
    aliases: ["香菇貢丸"],
    promoName: "香菇貢丸$100",
    price: 100,
    role: "ball",
    popular: true,
  },
  {
    id: "handmade_ball",
    name: "手工貢丸",
    aliases: ["手工貢丸", "貢丸"],
    promoName: "手工貢丸$80",
    price: 80,
    role: "ball",
  },
  {
    id: "duck_ball",
    name: "鴨肉丸",
    aliases: ["鴨肉丸"],
    promoName: "鴨肉丸$80",
    price: 80,
    role: "ball",
    popular: true,
  },

  // ── 手工餃類 ──
  {
    id: "mixed_dumpling",
    name: "綜合餃",
    aliases: ["綜合餃"],
    promoName: "綜合餃$120",
    price: 120,
    role: "dumpling",
  },
  {
    id: "sanji_fish_dumpling",
    name: "三記魚餃",
    aliases: ["三記魚餃", "魚餃"],
    promoName: "三記魚餃$70",
    price: 70,
    role: "dumpling",
    popular: true,
  },
  {
    id: "sanji_shrimp_dumpling",
    name: "三記蝦餃",
    aliases: ["三記蝦餃", "蝦餃"],
    promoName: "三記蝦餃$70",
    price: 70,
    role: "dumpling",
  },
  {
    id: "swallow_dumpling",
    name: "燕餃",
    aliases: ["燕餃"],
    promoName: "燕餃$60",
    price: 60,
    role: "dumpling",
  },
  {
    id: "egg_dumpling",
    name: "可口美蛋餃",
    aliases: ["蛋餃", "可口美蛋餃"],
    promoName: "可口美蛋餃$60",
    price: 60,
    role: "dumpling",
  },

  // ── 精選鍋物 ──
  {
    id: "shrimp_paste",
    name: "手工蝦仁漿",
    aliases: ["蝦仁漿", "手工蝦仁漿"],
    promoName: "手工蝦仁漿$100",
    price: 100,
    role: "side",
    popular: true,
  },
  {
    id: "cuttlefish_paste",
    name: "手工花枝漿",
    aliases: ["花枝漿", "手工花枝漿"],
    promoName: "手工花枝漿$100",
    price: 100,
    role: "side",
    popular: true,
  },
  {
    id: "crab_stick",
    name: "日本蟹肉條",
    aliases: ["蟹肉條", "日本蟹肉條"],
    promoName: "日本蟹肉條$100",
    price: 100,
    role: "side",
    popular: true,
  },
  {
    id: "scallop_cake",
    name: "日本干貝燒",
    aliases: ["干貝燒", "日本干貝燒"],
    promoName: "日本干貝燒$100",
    price: 100,
    role: "side",
  },
  {
    id: "spare_rib_crisp",
    name: "排骨酥",
    aliases: ["排骨酥"],
    promoName: "排骨酥$100",
    price: 100,
    role: "side",
    popular: true,
  },
  {
    id: "mentaiko_cheese",
    name: "日本明太子起司球",
    aliases: ["明太子起司球", "日本明太子起司球", "明太子"],
    promoName: "日本明太子起司球$100",
    price: 100,
    role: "side",
  },
  {
    id: "roe_shrimp_ball",
    name: "日本魚卵蝦球",
    aliases: ["魚卵蝦球", "日本魚卵蝦球"],
    promoName: "日本魚卵蝦球$100",
    price: 100,
    role: "side",
  },
  {
    id: "hokkaido_fin",
    name: "日本北海翅",
    aliases: ["北海翅", "日本北海翅"],
    promoName: "日本北海翅$100",
    price: 100,
    role: "side",
  },
  {
    id: "fish_roe_egg",
    name: "魚包蛋",
    aliases: ["魚包蛋"],
    promoName: "魚包蛋$70",
    price: 70,
    role: "side",
  },
  {
    id: "lobster_salad",
    name: "龍蝦沙拉",
    aliases: ["龍蝦沙拉"],
    promoName: "龍蝦沙拉$70",
    price: 70,
    role: "side",
  },
  {
    id: "golden_fish_ball",
    name: "黃金魚蛋",
    aliases: ["黃金魚蛋", "魚蛋"],
    promoName: "黃金魚蛋$60",
    price: 60,
    role: "side",
    popular: true,
  },
  {
    id: "tempura",
    name: "甜不辣",
    aliases: ["甜不辣"],
    promoName: "甜不辣$60",
    price: 60,
    role: "side",
  },
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
    id: "frozen_tofu",
    name: "凍豆腐",
    aliases: ["凍豆腐"],
    promoName: "凍豆腐$60",
    price: 60,
    role: "side",
  },
  {
    id: "fuzhu",
    name: "腐竹",
    aliases: ["腐竹"],
    promoName: "腐竹$50",
    price: 50,
    role: "side",
    popular: true,
  },
  {
    id: "tofu_skin",
    name: "豆皮",
    aliases: ["豆皮"],
    promoName: "豆皮$50",
    price: 50,
    role: "side",
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

/** 口語／語音／錯字 → 正規菜名（套用後再對菜單） */
export const ORAL_NORMALIZE: Record<string, string> = {
  水璉: "水蓮",
  水莲: "水蓮",
  羊排: "羊肉",
  羊片: "羊肉",
  鴨血塊: "鴨血",
  和牛片: "和牛",
  澳牛: "澳洲和牛",
  蝦餃: "三記蝦餃",
  魚餃: "三記魚餃",
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

const PROMO_ROLES = new Set([
  "protein",
  "braised",
  "seafood",
  "mushroom",
  "veg",
  "addon",
  "ball",
  "dumpling",
  "side",
  "carb",
  "soup",
]);

export function menuCatalogText() {
  return menuCatalog
    .map((m) => {
      const price = m.price != null ? ` $${m.price}` : "";
      const pop = m.popular ? "（人氣）" : "";
      const deal = discountPrice(m);
      const dealLine = deal != null ? `｜限時特價$${deal}` : "｜限時特惠";
      return `- ${m.name}${price}${pop}${dealLine}｜口語：${m.aliases.join("／")}｜文案用「${m.promoName}」`;
    })
    .join("\n");
}

export function brandFactsText() {
  return [
    `店名：${store.fullName}`,
    `地址：${store.address}（${store.addressHint}）`,
    `電話：${store.phone}`,
    `鍋底：紅鍋（麻辣）／紅白鴛鴦／白鍋（蔬菜）；鍋資：小$300／中$400／大$500`,
    "本店以鍋底＋單點為主，不要預設發明「888雙人套餐」除非店長有說。",
    "若店長點名某品項，文案必須主打該品項，禁止改推無關品項。",
    "即期／清料僅供內部：對客人只寫限時特價／折扣，禁止寫即期、過期、清料。",
  ].join("\n");
}

/** 約八折，取整到 10 元；最低不低於原價 5 折 */
export function discountPrice(item: MenuItem): number | null {
  if (item.price == null || item.price <= 0) return null;
  if (item.price <= 20) return Math.max(item.price - 5, 5);
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
  const setB = new Set(alias);
  let shared = 0;
  for (const ch of token) if (setB.has(ch)) shared++;
  if (shared >= 2 && shared / maxLen >= 0.5) return 40 + shared * 5;
  return 0;
}

function extractTokens(situation: string): string[] {
  const cleaned = normalizeOral(situation).replace(MATCH_STOPWORDS, "");
  const tokens = cleaned.match(/[\u4e00-\u9fffA-Za-z0-9]{2,8}/g) ?? [];
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
    const al = Math.max(...a.aliases.map((x) => x.length), a.name.length);
    const bl = Math.max(...b.aliases.map((x) => x.length), b.name.length);
    return bl - al;
  });
  for (const item of ranked) {
    const aliases = [...item.aliases, item.name].sort((a, b) => b.length - a.length);
    if (aliases.some((a) => s.includes(a))) {
      if (!hit.some((h) => h.id === item.id)) hit.push(item);
    }
  }
  return hit;
}

export type ResolvePromoResult = {
  items: MenuItem[];
  candidates: MenuItem[];
  matched: boolean;
};

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
  return items.filter((i) => PROMO_ROLES.has(i.role) || (i.role !== "pot" && i.role !== "perk"));
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

/** 依分類輸出完整菜單（給人眼檢查） */
export function menuDatabaseSummary(): { category: string; count: number; items: string[] }[] {
  const groups: { category: string; roles: MenuItem["role"][] }[] = [
    { category: "鍋型／湯底", roles: ["pot", "soup"] },
    { category: "嚴選肉品", roles: ["protein"] },
    { category: "燙滷珍饈", roles: ["braised"] },
    { category: "海味佳餚", roles: ["seafood"] },
    { category: "養生菇類", roles: ["mushroom"] },
    { category: "生鮮蔬食", roles: ["veg"] },
    { category: "米麵副食", roles: ["carb"] },
    { category: "美味加點", roles: ["addon"] },
    { category: "手工丸滑", roles: ["ball"] },
    { category: "手工餃類", roles: ["dumpling"] },
    { category: "精選鍋物", roles: ["side"] },
  ];
  return groups.map((g) => {
    const items = menuCatalog.filter((m) => g.roles.includes(m.role));
    return {
      category: g.category,
      count: items.length,
      items: items.map((m) => {
        const price = m.price != null ? `$${m.price}` : "";
        const pop = m.popular ? " ★" : "";
        const note = m.note ? `（${m.note}）` : "";
        return `${m.name} ${price}${pop}${note}`.trim();
      }),
    };
  });
}
