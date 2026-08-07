# -*- coding: utf-8 -*-
"""測 10 組即期品促銷（forceTemplate）"""
import json
import urllib.request
import urllib.error
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://wengji-banqiao-copilot.vercel.app"

CASES = [
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
]

FORBIDDEN = ["過期", "即期", "清料", "剩很多", "沒人點", "快壞", "庫存"]

WEATHER = {
    "tempC": 22,
    "description": "降雨",
    "icon": "🌧️",
    "precipProb": 80,
    "isFallback": True,
    "district": "板橋",
    "fetchedAt": "2026-08-07T00:00:00.000Z",
}


def run_one(situation: str):
    body = json.dumps(
        {"situation": situation, "forceTemplate": True, "weather": WEATHER},
        ensure_ascii=False,
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/api/generate",
        data=body,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            data = json.loads(res.read().decode("utf-8"))
            status = res.status
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            data = {"error": raw}
        status = e.code
    text = (data.get("text") or "").replace("\n", " ").strip()
    matched = "、".join(m.get("name", "") for m in data.get("matched") or []) or "(無)"
    bad = [w for w in FORBIDDEN if w in text]
    return {
        "status": status,
        "matched": matched,
        "source": data.get("source", ""),
        "text": text,
        "bad": "、".join(bad) if bad else "無",
        "needItem": bool(data.get("needItem")),
        "error": data.get("error", ""),
    }


def main():
    print(f"BASE={BASE}\n")
    rows = []
    for i, situation in enumerate(CASES, 1):
        try:
            r = run_one(situation)
            rows.append({"i": i, "situation": situation, **r})
            print(f"[{i}/10] status={r['status']} matched={r['matched']}")
        except Exception as e:
            rows.append(
                {
                    "i": i,
                    "situation": situation,
                    "status": 0,
                    "matched": "ERROR",
                    "source": "",
                    "text": str(e),
                    "bad": "",
                    "needItem": False,
                    "error": str(e),
                }
            )
            print(f"[{i}/10] FAIL {e}")

    print("\n=== TABLE ===")
    print("| # | 輸入 | 對到品項 | 禁詞 | 產出文案 |")
    print("|---|------|----------|------|----------|")
    for r in rows:
        text = r["text"][:140] + ("…" if len(r["text"]) > 140 else "")
        print(f"| {r['i']} | {r['situation']} | {r['matched']} | {r['bad']} | {text} |")

    failed = [
        r
        for r in rows
        if r["status"] != 200
        or r["needItem"]
        or r["bad"] != "無"
        or r["matched"] == "(無)"
    ]
    print(
        f"\nPASS {len(rows) - len(failed)}/{len(rows)}"
        + (f" FAIL #{','.join(str(f['i']) for f in failed)}" if failed else "")
    )


if __name__ == "__main__":
    main()
