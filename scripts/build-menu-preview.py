# -*- coding: utf-8 -*-
import re
from pathlib import Path

text = Path("src/lib/menu.ts").read_text(encoding="utf-8")
names = re.findall(r'name: "([^"]+)"', text)
prices = dict(
    zip(
        re.findall(r'id: "([^"]+)"', text),
        re.findall(r"(?:price: (\d+)|role:)", text),
    )
)

# Parse blocks more reliably
items = []
for block in re.split(r"\n\s*\{\n", text):
    if "name:" not in block:
        continue
    m_name = re.search(r'name: "([^"]+)"', block)
    m_price = re.search(r"price: (\d+)", block)
    m_role = re.search(r'role: "([^"]+)"', block)
    m_pop = "popular: true" in block
    m_note = re.search(r'note: "([^"]+)"', block)
    if not m_name or not m_role:
        continue
    items.append(
        {
            "name": m_name.group(1),
            "price": int(m_price.group(1)) if m_price else None,
            "role": m_role.group(1),
            "popular": m_pop,
            "note": m_note.group(1) if m_note else "",
        }
    )

role_cat = {
    "pot": "鍋型／湯底",
    "soup": "鍋型／湯底",
    "protein": "嚴選肉品",
    "braised": "燙滷珍饈",
    "seafood": "海味佳餚",
    "mushroom": "養生菇類",
    "veg": "生鮮蔬食",
    "carb": "米麵副食",
    "addon": "美味加點",
    "ball": "手工丸滑",
    "dumpling": "手工餃類",
    "side": "精選鍋物",
}

lines = [
    "# 翁記麻辣鍋－板橋店 菜單資料庫（依菜單掃描）",
    "",
    f"- 電話：02-8675-5919",
    f"- 品項總數：**{len(items)}**",
    f"- 已含：三記蝦餃、三記魚餃、水蓮（獨立品項，不再誤作空心菜）",
    "",
]

order = [
    "鍋型／湯底",
    "嚴選肉品",
    "燙滷珍饈",
    "海味佳餚",
    "養生菇類",
    "生鮮蔬食",
    "米麵副食",
    "美味加點",
    "手工丸滑",
    "手工餃類",
    "精選鍋物",
]

for cat in order:
    subset = [i for i in items if role_cat.get(i["role"]) == cat]
    lines.append(f"## {cat}（{len(subset)}）")
    lines.append("")
    lines.append("| 品名 | 價格 | 人氣 | 備註 |")
    lines.append("|------|------|------|------|")
    for i in subset:
        price = f"${i['price']}" if i["price"] is not None else "—"
        pop = "★" if i["popular"] else ""
        lines.append(f"| {i['name']} | {price} | {pop} | {i['note']} |")
    lines.append("")

Path("scripts/menu-db-preview.md").write_text("\n".join(lines), encoding="utf-8")
print(f"items={len(items)}")
print("三記蝦餃", any(i["name"] == "三記蝦餃" for i in items))
print("水蓮", any(i["name"] == "水蓮" for i in items))
print("空心菜", any(i["name"] == "空心菜" for i in items))
