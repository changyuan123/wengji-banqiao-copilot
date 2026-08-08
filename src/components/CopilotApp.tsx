"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { store } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

type MenuBtn = { id: string; name: string; price?: number; popular?: boolean };
type MenuGroup = { category: string; items: MenuBtn[] };

type BagSummary = {
  id: string;
  publicTitle: string;
  publicHint: string;
  price: number;
  qty: number;
  remaining: number;
  reserved: number;
  pickedUp: number;
  pickupStart: string;
  pickupEnd: string;
  salesStopAt: string;
  salesOpen: boolean;
  salesClosed?: boolean;
  contents?: { itemId: string; name: string }[];
};

function parsePositiveInt(raw: string, fallback: number, max: number): number {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return fallback;
  const n = Number(digits);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(1, Math.floor(n)));
}

export function CopilotApp() {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [groups, setGroups] = useState<MenuGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState(0);
  const [qtyText, setQtyText] = useState("5");
  const [priceText, setPriceText] = useState("199");
  const [pickupStart, setPickupStart] = useState("17:30");
  const [pickupEnd, setPickupEnd] = useState("20:00");
  const [salesStopAt, setSalesStopAt] = useState("19:30");
  const [publicTitle, setPublicTitle] = useState("今晚惜食驚喜袋");
  const [toast, setToast] = useState<string | null>(null);
  const [publishBusy, setPublishBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [scanUrl, setScanUrl] = useState<string | null>(null);
  const [shelf, setShelf] = useState<BagSummary[]>([]);
  const [cloudStore, setCloudStore] = useState<boolean | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payBusy, setPayBusy] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [paidBanner, setPaidBanner] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshShelf = useCallback(() => {
    fetch(`/api/bags?merchant=1&storeId=${encodeURIComponent(store.id)}`)
      .then((r) => r.json())
      .then((d: { bags?: BagSummary[]; cloudStore?: boolean }) => {
        setShelf(d.bags ?? []);
        if (typeof d.cloudStore === "boolean") setCloudStore(d.cloudStore);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/weather");
        const data = (await res.json()) as WeatherPayload;
        if (!cancelled) setWeather(data);
      } catch {
        if (!cancelled) {
          setWeather({
            tempC: 18,
            description: "降雨",
            icon: "🌧️",
            precipProb: 60,
            isFallback: true,
            district: "板橋",
            fetchedAt: new Date().toISOString(),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((d: { groups?: MenuGroup[] }) => {
        if (d.groups?.length) setGroups(d.groups);
      })
      .catch(() => undefined);

    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d: { subscribed?: boolean }) => setSubscribed(!!d.subscribed))
      .catch(() => undefined);

    refreshShelf();

    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      setPaidBanner("訂閱成功！");
      setSubscribed(true);
    } else if (params.get("paid") === "0") {
      setPaidBanner("付款未完成或已取消，可稍後再試。");
    }
  }, [refreshShelf]);

  function toggleItem(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const selectedNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groups) for (const it of g.items) map.set(it.id, it.name);
    return selectedIds.map((id) => map.get(id)).filter(Boolean) as string[];
  }, [groups, selectedIds]);

  async function handlePublish() {
    if (selectedIds.length === 0) {
      showToast("請先勾選會進袋的食材（資料庫用）");
      return;
    }
    const qty = parsePositiveInt(qtyText, 0, 99);
    const price = parsePositiveInt(priceText, 0, 9999);
    if (qty < 1) {
      showToast("請輸入袋數（可直接用鍵盤打數字）");
      return;
    }
    if (price < 1) {
      showToast("請輸入袋價（可直接用鍵盤打數字）");
      return;
    }
    setPublishBusy(true);
    try {
      const res = await fetch("/api/bags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qty,
          price,
          pickupStart,
          pickupEnd,
          salesStopAt,
          publicTitle,
          itemIds: selectedIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上架失敗");
      setShelf(data.bags ?? []);
      setShareUrl(data.guestUrl || "/today");
      setQrUrl(data.qrUrl || null);
      setScanUrl(data.scanUrl || "/scan");
      if (typeof data.cloudStore === "boolean") setCloudStore(data.cloudStore);
      showToast(data.message || "已上架");
      setSelectedIds([]);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "上架失敗");
    } finally {
      setPublishBusy(false);
    }
  }

  async function stopSales(bagId: string) {
    try {
      const res = await fetch("/api/bags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", bagId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "停賣失敗");
      showToast(data.message || "已停賣");
      refreshShelf();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "停賣失敗");
    }
  }

  async function copyShareUrl() {
    const url = shareUrl || `${window.location.origin}/today`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("客人連結已複製");
    } catch {
      showToast(url);
    }
  }

  async function handleCheckout() {
    setPayBusy(true);
    try {
      const res = await fetch("/api/ecpay/create", { method: "POST" });
      const data = (await res.json()) as {
        action?: string;
        params?: Record<string, string>;
        error?: string;
      };
      if (!res.ok || !data.action || !data.params) {
        showToast(data.error || "無法啟動綠界付款，請稍後再試");
        setPayBusy(false);
        return;
      }
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.action;
      for (const [k, v] of Object.entries(data.params)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch {
      showToast("網路異常，無法開啟付款頁");
      setPayBusy(false);
    }
  }

  const weatherLabel = weather
    ? `${weather.district}：${weather.tempC}°C，${weather.description}`
    : "讀取天氣中…";
  const currentGroup = groups[activeCat];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <header
        className="px-5 pb-5 pt-8 text-white"
        style={{
          background: "linear-gradient(165deg, #8B0000 0%, #5c0000 55%, #3d0000 100%)",
        }}
      >
        <p className="text-[11px] tracking-[0.18em] text-white/75">
          惜食平台 · 商家後台
        </p>
        <h1 className="mt-2 font-display text-[1.55rem] font-bold">{store.headerTitle}</h1>
        <p className="mt-2 text-sm text-white/85">
          {store.fullName} · 可同時上架多種驚喜袋（貨架）
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[12px]">
          <a
            href="/scan"
            className="rounded-xl bg-white/15 py-2.5 font-semibold text-white"
          >
            掃碼取袋
          </a>
          <a
            href="/verify"
            className="rounded-xl bg-white/15 py-2.5 font-semibold text-white"
          >
            驗證說明
          </a>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-10">
        {paidBanner && (
          <div className="rounded-xl border border-[#eadcd4] bg-white px-3 py-2 text-sm text-[#5c0000]">
            {paidBanner}
          </div>
        )}

        {cloudStore === false && (
          <div className="rounded-xl border border-[#f0d9a8] bg-[#fff8e8] px-3 py-2 text-[13px] text-[#6b5348]">
            提醒：尚未接雲端記帳本（Upstash）。正式營業建議接上，預約才穩。
          </div>
        )}

        <section
          className="rounded-2xl bg-white px-4 py-3 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{weather?.icon ?? "⛅"}</span>
            <div>
              <p className="text-sm font-semibold">板橋天氣</p>
              <p className="text-[12px] text-[#6b5348]">{weatherLabel}</p>
            </div>
          </div>
        </section>

        {shelf.length > 0 && (
          <section
            id="publish-panel"
            className="rounded-2xl bg-white p-4 shadow-sm"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            <h2 className="text-base font-bold">今晚貨架（可多種）</h2>
            <p className="mt-1 text-[12px] text-[#6b5348]">
              已預約的不能取消。只能「停止新預約」，已約的客人仍可取袋。
            </p>
            <ul className="mt-3 space-y-3">
              {shelf.map((b) => (
                <li
                  key={b.id}
                  className="rounded-xl bg-[#fff8f4] p-3"
                  style={{ border: "1px solid var(--wj-line)" }}
                >
                  <p className="font-semibold">{b.publicTitle}</p>
                  <p className="mt-1 text-[13px] text-[#8B0000]">
                    ${b.price} · 還可約 {b.remaining}/{b.qty} · 已約 {b.reserved} ·
                    已取 {b.pickedUp}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6b5348]">
                    取餐 {b.pickupStart}–{b.pickupEnd}
                    {b.salesClosed || !b.salesOpen ? " · 已停新預約" : ""}
                  </p>
                  {b.contents && b.contents.length > 0 && (
                    <p className="mt-1 text-[11px] text-[#6b5348]">
                      資料庫：{b.contents.map((c) => c.name).join("、")}
                    </p>
                  )}
                  {b.salesOpen && (
                    <button
                      type="button"
                      onClick={() => void stopSales(b.id)}
                      className="mt-2 rounded-lg border border-[#eadcd4] px-3 py-1.5 text-[12px] font-semibold"
                    >
                      停止這一檔新預約
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void copyShareUrl()}
                className="rounded-xl bg-[#8B0000] py-3 text-[13px] font-bold text-white"
              >
                複製客人連結
              </button>
              <a
                href={scanUrl || "/scan"}
                className="rounded-xl border border-[#eadcd4] py-3 text-center text-[13px] font-bold text-[#8B0000]"
              >
                去掃碼取袋
              </a>
            </div>
            {qrUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="客人頁 QR" className="mx-auto mt-3 h-36 w-36" />
            )}
          </section>
        )}

        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-bold">新增一檔驚喜袋</h2>
          <p className="mt-1 text-[12px] text-[#6b5348]">
            袋數、價錢可直接用手指點選後輸入；可整格刪掉再打。
          </p>
          <label className="mt-3 block text-[12px] font-semibold text-[#6b5348]">
            袋名（客人看得到）
            <input
              value={publicTitle}
              onChange={(e) => setPublicTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#eadcd4] px-3 py-3 text-[16px]"
              placeholder="例如：肉多多袋、蔬食袋"
            />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-[12px] font-semibold text-[#6b5348]">
              今晚幾袋
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={qtyText}
                onChange={(e) => setQtyText(e.target.value.replace(/[^\d]/g, ""))}
                onBlur={() =>
                  setQtyText(String(parsePositiveInt(qtyText || "1", 1, 99)))
                }
                className="mt-1 w-full rounded-xl border border-[#eadcd4] px-3 py-3 text-[18px] font-bold"
                placeholder="例如 5"
              />
            </label>
            <label className="text-[12px] font-semibold text-[#6b5348]">
              每袋售價（元）
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={priceText}
                onChange={(e) => setPriceText(e.target.value.replace(/[^\d]/g, ""))}
                onBlur={() =>
                  setPriceText(String(parsePositiveInt(priceText || "1", 1, 9999)))
                }
                className="mt-1 w-full rounded-xl border border-[#eadcd4] px-3 py-3 text-[18px] font-bold"
                placeholder="例如 199"
              />
            </label>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <label className="text-[11px] font-semibold text-[#6b5348]">
              開始取
              <input
                type="time"
                value={pickupStart}
                onChange={(e) => setPickupStart(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#eadcd4] px-2 py-2 text-[14px]"
              />
            </label>
            <label className="text-[11px] font-semibold text-[#6b5348]">
              結束取
              <input
                type="time"
                value={pickupEnd}
                onChange={(e) => setPickupEnd(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#eadcd4] px-2 py-2 text-[14px]"
              />
            </label>
            <label className="text-[11px] font-semibold text-[#6b5348]">
              停止預約
              <input
                type="time"
                value={salesStopAt}
                onChange={(e) => setSalesStopAt(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#eadcd4] px-2 py-2 text-[14px]"
              />
            </label>
          </div>
        </section>

        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-bold">清楚勾選袋內食材（資料庫）</h2>
          <p className="mt-1 text-[12px] text-[#6b5348]">
            客人只會自動看到模糊說明，不會看到這些菜名。
          </p>
          {selectedNames.length > 0 && (
            <p className="mt-2 rounded-lg bg-[#fff8f4] px-2 py-2 text-[12px]">
              已選：{selectedNames.join("、")}
            </p>
          )}
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {groups.map((g, i) => (
              <button
                key={g.category}
                type="button"
                onClick={() => setActiveCat(i)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                  activeCat === i
                    ? "bg-[#8B0000] text-white"
                    : "bg-[#fff8f4] text-[#6b5348]"
                }`}
              >
                {g.category}
              </button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(currentGroup?.items ?? []).map((it) => {
              const on = selectedIds.includes(it.id);
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => toggleItem(it.id)}
                  className={`min-h-[52px] rounded-xl px-2.5 py-2 text-left text-[13px] font-medium ${
                    on
                      ? "bg-[#8B0000] text-white"
                      : "bg-[#fff8f4] text-[#1a120f] ring-1 ring-[#eadcd4]"
                  }`}
                >
                  {it.name}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          disabled={publishBusy}
          onClick={() => void handlePublish()}
          className="w-full rounded-2xl bg-[#8B0000] py-4 text-[16px] font-bold text-white disabled:opacity-60"
        >
          {publishBusy ? "上架中…" : "上架到今晚貨架"}
        </button>

        <button
          type="button"
          onClick={() => setPayOpen(true)}
          className="w-full rounded-xl px-3 py-3 text-left"
          style={{ background: "linear-gradient(90deg, #fff5f0, #ffe8dc)" }}
        >
          <span className="text-sm font-semibold text-[#5c0000]">
            {subscribed
              ? "已訂閱商家方案"
              : `商家方案 · NT$ ${store.subscriptionPrice}／${store.subscriptionMonths} 個月`}
          </span>
        </button>
      </main>

      {payOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4"
          onClick={() => !payBusy && setPayOpen(false)}
        >
          <div
            className="w-full max-w-[400px] rounded-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">惜食商家方案</h3>
            <p className="mt-2 text-sm text-[#6b5348]">
              NT${store.subscriptionPrice} 使用 {store.subscriptionMonths}{" "}
              個月（一次付清）。上架驚喜袋、客人預約取袋。
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-xl border border-[#eadcd4] py-3 font-semibold"
                onClick={() => setPayOpen(false)}
              >
                稍後
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#8B0000] py-3 font-bold text-white"
                onClick={() => void handleCheckout()}
              >
                {payBusy ? "導向綠界…" : "前往付款"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="anim-toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1a120f] px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}
    </div>
  );
}
