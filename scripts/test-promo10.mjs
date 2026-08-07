/**
 * 測 10 組即期品促銷（呼叫已部署 API，forceTemplate 驗證對菜＋折扣話術）
 * Usage: node scripts/test-promo10.mjs [baseUrl]
 */
const BASE =
  process.argv[2] || "https://wengji-banqiao-copilot.vercel.app";

const CASES = [
  "水璉要過期了 今天要下大雨",
  "羊肉要過期了",
  "澳洲和牛剩很多",
  "招牌鴨血快過期，要打折推",
  "大腸頭沒人點，備料偏多",
  "豆皮要過期了",
  "雪花牛清料",
  "招牌豆腐剩很多",
  "草蝦快壞了",
  "梅花豬要過期 今天下大雨",
];

const FORBIDDEN = ["過期", "即期", "清料", "剩很多", "沒人點", "快壞", "庫存"];

async function runOne(situation) {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      situation,
      forceTemplate: true,
      weather: {
        tempC: 22,
        description: "降雨",
        icon: "🌧️",
        precipProb: 80,
        isFallback: true,
        district: "板橋",
        fetchedAt: new Date().toISOString(),
      },
    }),
  });
  const data = await res.json();
  const text = data.text || "";
  const bad = FORBIDDEN.filter((w) => text.includes(w));
  return {
    status: res.status,
    matched: (data.matched || []).map((m) => m.name).join("、") || "(無)",
    source: data.source || "",
    text: text.replace(/\s+/g, " ").trim(),
    bad: bad.join("、") || "無",
    needItem: !!data.needItem,
  };
}

async function main() {
  console.log(`BASE=${BASE}\n`);
  const rows = [];
  for (let i = 0; i < CASES.length; i++) {
    const situation = CASES[i];
    try {
      const r = await runOne(situation);
      rows.push({ i: i + 1, situation, ...r });
      console.log(`[${i + 1}/10] OK matched=${r.matched}`);
    } catch (e) {
      rows.push({
        i: i + 1,
        situation,
        status: 0,
        matched: "ERROR",
        source: "",
        text: String(e),
        bad: "",
        needItem: false,
      });
      console.log(`[${i + 1}/10] FAIL`, e);
    }
  }

  console.log("\n=== TABLE ===");
  console.log("| # | 輸入 | 對到品項 | 禁詞檢查 | 產出文案 |");
  console.log("|---|------|----------|----------|----------|");
  for (const r of rows) {
    const text = r.text.slice(0, 120) + (r.text.length > 120 ? "…" : "");
    console.log(
      `| ${r.i} | ${r.situation} | ${r.matched} | ${r.bad} | ${text} |`,
    );
  }

  const failed = rows.filter(
    (r) => r.status !== 200 || r.needItem || r.bad !== "無" || r.matched === "(無)",
  );
  console.log(
    `\nPASS ${rows.length - failed.length}/${rows.length}` +
      (failed.length ? ` FAIL #${failed.map((f) => f.i).join(",")}` : ""),
  );
}

main();
