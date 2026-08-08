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
  contents?: { itemId: string; name: string }[];
};

function getGuestId(): string {
  const key = "wj_guest_id";
  let id = window.localStorage.getItem(key);
  if (!id || !/^g_/.test(id)) {
    const rand =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : `${Date.now()}${Math.random().toString(16).slice(2)}`;
    id = `g_${rand.slice(0, 24)}`;
    window.localStorage.setItem(key, id);
  }
  return id;
}

export function CopilotApp() {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [groups, setGroups] = useState<MenuGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState(0);
  const [qty, setQty] = useState(5);
  const [price, setPrice] = useState(199);
  const [pickupStart, setPickupStart] = useState("17:30");
  const [pickupEnd, setPickupEnd] = useState("20:00");
  const [salesStopAt, setSalesStopAt] = useState("19:30");
  const [publicTitle, setPublicTitle] = useState("今晚火鍋惜食驚喜袋");
  const [publicHint, setPublicHint] = useState("");
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [publishBusy, setPublishBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [scanUrl, setScanUrl] = useState<string | null>(null);
  const [published, setPublished] = useState<BagSummary | null>(null);
  const [cloudStore, setCloudStore] = useState<boolean | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payBusy, setPayBusy] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [paidBanner, setPaidBanner] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
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

    fetch("/api/bags?merchant=1")
      .then((r) => r.json())
      .then((d: { bag?: BagSummary | null; cloudStore?: boolean }) => {
        setCloudStore(!!d.cloudStore);
        if (d.bag) setPublished(d.bag);
      })
      .catch(() => setCloudStore(false));

    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      setPaidBanner("訂閱成功！");
      setSubscribed(true);
    } else if (params.get("paid") === "0") {
      setPaidBanner("付款未完成或已取消，可稍後再試。");
    }

    // 預先產生訪客 id（給之後測試用）
    getGuestId();
  }, []);

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
      showToast("請先從菜單勾選今晚會進袋的食材（資料庫用）");
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
          publicHint: publicHint.trim() || undefined,
          itemIds: selectedIds,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上架失敗");
      setPublished(data.bag ?? null);
      setShareUrl(data.guestUrl || "/today");
      setQrUrl(data.qrUrl || null);
      setScanUrl(data.scanUrl || "/scan");
      if (typeof data.cloudStore === "boolean") setCloudStore(data.cloudStore);
      if (!publicHint.trim() && data.suggestedHint) {
        setPublicHint(data.suggestedHint);
      }
      showToast(data.message || "已上架今晚驚喜袋");
      window.setTimeout(() => {
        document.getElementById("publish-panel")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "上架失敗");
    } finally {
      setPublishBusy(false);
    }
  }

  async function copyShareUrl() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("客人連結已複製");
    } catch {
      showToast(shareUrl);
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
    : "讀取板橋天氣中…";
  const currentGroup = groups[activeCat];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <header
        className="px-5 pb-5 pt-8 text-white"
        style={{
          background: "linear-gradient(165deg, #8B0000 0%, #5c0000 55%, #3d0000 100%)",
        }}
      >
        <p className="text-[11px] tracking-[0.18em] text-white/75">商家後台 · 今晚驚喜袋</p>
        <h1 className="mt-2 font-display text-[1.55rem] font-bold">{store.headerTitle}</h1>
        <p className="mt-2 text-sm text-white/85">
          店長決定袋數、價錢、取餐時段 → 客人預約 → 到店掃碼取袋並付款。
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px]">
          <a
            href="/today"
            className="rounded-xl bg-white/15 py-2.5 font-semibold text-white backdrop-blur"
          >
            客人頁
          </a>
          <a
            href="/scan"
            className="rounded-xl bg-white/15 py-2.5 font-semibold text-white backdrop-blur"
          >
            掃碼取袋
          </a>
          <a
            href="/verify"
            className="rounded-xl bg-white/15 py-2.5 font-semibold text-white backdrop-blur"
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
          <div className="rounded-xl border border-[#f0d9a8] bg-[#fff8e8] px-3 py-2 text-[13px] leading-relaxed text-[#6b5348]">
            提醒：還沒接雲端記帳本（Upstash）。可以先試流程；正式營業建議在 Vercel 接上
            Redis，資料才穩。
          </div>
        )}

        <section
          className="rounded-2xl bg-white px-4 py-3 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{weather?.icon ?? "⛅"}</span>
            <div>
              <p className="text-sm font-semibold text-[#1a120f]">板橋天氣</p>
              <p className="text-[12px] text-[#6b5348]">{weatherLabel}</p>
            </div>
          </div>
        </section>

        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-bold">① 今晚袋數與價錢（你決定）</h2>
          <p className="mt-1 text-[12px] text-[#6b5348]">
            剩多少做多少袋、賣多少錢，都由店長決定。
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-[12px] font-semibold text-[#6b5348]">
              今晚幾袋
              <input
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
                className="mt-1 w-full rounded-xl border border-[#eadcd4] px-3 py-2.5 text-[16px] font-bold"
              />
            </label>
            <label className="text-[12px] font-semibold text-[#6b5348]">
              每袋售價（元）
              <input
                type="number"
                min={1}
                max={9999}
                value={price}
                onChange={(e) =>
                  setPrice(Math.min(9999, Math.max(1, Number(e.target.value) || 1)))
                }
                className="mt-1 w-full rounded-xl border border-[#eadcd4] px-3 py-2.5 text-[16px] font-bold"
              />
            </label>
          </div>
        </section>

        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-bold">② 取餐時段與停止預約（你決定）</h2>
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
          <p className="mt-2 text-[11px] text-[#6b5348]">
            過了「停止預約」就不能再約；取餐結束後預約失效。
          </p>
        </section>

        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-bold">③ 清楚勾選袋內食材（資料庫）</h2>
          <p className="mt-1 text-[12px] text-[#6b5348]">
            這裡要選清楚，方便之後分析剩什麼。客人頁不會看到細項菜名。
          </p>
          {selectedNames.length > 0 && (
            <p className="mt-2 rounded-lg bg-[#fff8f4] px-2 py-2 text-[12px] text-[#1a120f]">
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
                      ? "bg-[#8B0000] text-white ring-2 ring-[#5c0000]"
                      : "bg-[#fff8f4] text-[#1a120f] ring-1 ring-[#eadcd4]"
                  }`}
                >
                  {it.name}
                  <span className="mt-0.5 block text-[11px] opacity-80">
                    {it.price != null ? `$${it.price}` : "時價"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-bold">④ 客人看到的「模糊」說明</h2>
          <p className="mt-1 text-[12px] text-[#6b5348]">
            留白也可：系統會依你勾的菜自動寫模糊版，保留驚喜感。
          </p>
          <input
            value={publicTitle}
            onChange={(e) => setPublicTitle(e.target.value)}
            className="mt-3 w-full rounded-xl border border-[#eadcd4] px-3 py-2.5 text-[15px]"
            placeholder="今晚火鍋惜食驚喜袋"
          />
          <textarea
            value={publicHint}
            onChange={(e) => setPublicHint(e.target.value)}
            rows={3}
            placeholder="例如：今晚隨機搭配精選肉類、菇蔬等（實際以現場為準）"
            className="mt-2 w-full rounded-xl border border-[#eadcd4] px-3 py-2.5 text-[14px]"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#eadcd4] px-3 py-2.5 text-[14px]"
            placeholder="內部備註（客人看不到，可留空）"
          />
        </section>

        <button
          type="button"
          disabled={publishBusy}
          onClick={() => void handlePublish()}
          className="w-full rounded-2xl bg-[#8B0000] py-4 text-[16px] font-bold text-white disabled:opacity-60"
        >
          {publishBusy ? "上架中…" : "⑤ 上架今晚驚喜袋（主按鈕）"}
        </button>

        {(shareUrl || published) && (
          <section
            id="publish-panel"
            className="rounded-2xl bg-white p-4 shadow-sm"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            <h2 className="text-base font-bold text-[#1f7a4c]">已上架今晚驚喜袋</h2>
            {published && (
              <div className="mt-2 space-y-1 text-[13px] text-[#1a120f]">
                <p>
                  {published.publicTitle} · ${published.price} · 共 {published.qty}{" "}
                  袋（還可約 {published.remaining}）
                </p>
                <p className="text-[#6b5348]">
                  取餐 {published.pickupStart}–{published.pickupEnd} · 停止預約{" "}
                  {published.salesStopAt}
                </p>
                <p className="text-[#6b5348]">{published.publicHint}</p>
                {published.contents && published.contents.length > 0 && (
                  <p className="rounded-lg bg-[#fff8f4] px-2 py-2 text-[12px]">
                    資料庫記錄：{published.contents.map((c) => c.name).join("、")}
                  </p>
                )}
              </div>
            )}
            {qrUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="客人頁 QR" className="mx-auto mt-3 h-[160px] w-[160px]" />
            )}
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
          </section>
        )}

        <button
          type="button"
          onClick={() => setPayOpen(true)}
          className="w-full rounded-xl px-3 py-3 text-left"
          style={{ background: "linear-gradient(90deg, #fff5f0, #ffe8dc)" }}
        >
          <span className="text-sm font-semibold text-[#5c0000]">
            {subscribed
              ? "已訂閱商家後台"
              : `訂閱商家後台 · NT$ ${store.subscriptionPrice}/月`}
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
            <h3 className="text-lg font-bold">訂閱商家後台</h3>
            <p className="mt-2 text-sm text-[#6b5348]">
              每月 NT${store.subscriptionPrice}。上架驚喜袋、客人預約取袋。
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
                {payBusy ? "導向綠界…" : "前往綠界付款"}
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
