"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { store } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

type GenState = "idle" | "loading" | "done" | "error";
type MenuBtn = { id: string; name: string; price?: number; popular?: boolean };
type MenuGroup = { category: string; items: MenuBtn[] };

export function CopilotApp() {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [groups, setGroups] = useState<MenuGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [extraNote, setExtraNote] = useState("");
  const [activeCat, setActiveCat] = useState(0);
  const [copyText, setCopyText] = useState("");
  const [genState, setGenState] = useState<GenState>("idle");
  const [matchedLabel, setMatchedLabel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payBusy, setPayBusy] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [paidBanner, setPaidBanner] = useState<string | null>(null);
  const [lineConfigured, setLineConfigured] = useState(false);
  const [lineAddFriendUrl, setLineAddFriendUrl] = useState<string | null>(null);
  const [lineSetupSteps, setLineSetupSteps] = useState<string[]>([]);
  const [lineConfirmOpen, setLineConfirmOpen] = useState(false);
  const [lineBusy, setLineBusy] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

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

    fetch("/api/line/broadcast")
      .then((r) => r.json())
      .then(
        (d: {
          configured?: boolean;
          addFriendUrl?: string | null;
          setupSteps?: string[];
        }) => {
          setLineConfigured(!!d.configured);
          setLineAddFriendUrl(d.addFriendUrl || null);
          setLineSetupSteps(d.setupSteps ?? []);
        },
      )
      .catch(() => undefined);

    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      setPaidBanner("訂閱成功！惜食特價推播已開啟。");
      setSubscribed(true);
    } else if (params.get("paid") === "0") {
      setPaidBanner("付款未完成或已取消，可稍後再試。");
    }
  }, []);

  const selectedItems = useMemo(() => {
    const map = new Map<string, MenuBtn>();
    for (const g of groups) for (const it of g.items) map.set(it.id, it);
    return selectedIds.map((id) => map.get(id)).filter(Boolean) as MenuBtn[];
  }, [groups, selectedIds]);

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const next = [...prev, id];
      if (next.length === 10) {
        showToast("選很多也可以，文案會變長，客人仍看得到全部特價");
      }
      return next;
    });
  }

  async function handleGenerate() {
    if (selectedIds.length === 0) {
      showToast("請先點選今天要推的品項");
      return;
    }
    setGenState("loading");
    setCopyText("");
    setMatchedLabel(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: selectedIds,
          situation: extraNote.trim(),
          weather,
        }),
      });
      const data = (await res.json()) as {
        text?: string;
        error?: string;
        matched?: { name: string }[];
      };
      if (!res.ok || !data.text) throw new Error(data.error || "生成失敗");
      setCopyText(data.text);
      setMatchedLabel(
        data.matched?.length
          ? `已選：${data.matched.map((m) => m.name).join("、")} → 對客人只寫限時特價`
          : null,
      );
      setGenState("done");
      // 捲到預覽區
      window.setTimeout(() => {
        document.getElementById("preview-panel")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    } catch {
      setGenState("error");
      showToast("生成失敗，請再試一次");
    }
  }

  async function handleCopy() {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = copyText;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    showToast("已複製！建議用下方「一鍵推播 LINE OA」給好友");
  }

  function handleLineShare() {
    if (!copyText) return;
    const url = `https://line.me/R/share?text=${encodeURIComponent(copyText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyAddFriendUrl() {
    if (!lineAddFriendUrl) {
      showToast("尚未設定加好友連結（Vercel：NEXT_PUBLIC_LINE_OA_URL）");
      return;
    }
    try {
      await navigator.clipboard.writeText(lineAddFriendUrl);
      showToast("加好友連結已複製，可貼在店內／限時動態");
    } catch {
      showToast(lineAddFriendUrl);
    }
  }

  async function handleLineBroadcast() {
    if (!copyText) return;
    setLineBusy(true);
    try {
      const res = await fetch("/api/line/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: copyText, confirm: true }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        showToast(data.error || "LINE 推播失敗");
        setLineBusy(false);
        setLineConfirmOpen(false);
        return;
      }
      showToast("已推播至惜食 LINE OA 好友！");
      setLineConfirmOpen(false);
    } catch {
      showToast("網路異常，無法推播");
    } finally {
      setLineBusy(false);
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
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col pb-32">
      <header
        className="relative overflow-hidden px-5 pb-5 pt-7 text-white anim-rise"
        style={{
          background: "linear-gradient(165deg, #8B0000 0%, #5c0000 55%, #3d0000 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-6 top-2 h-28 w-28 rounded-full opacity-30 anim-steam"
          style={{ background: "radial-gradient(circle, #ffb08a, transparent 70%)" }}
          aria-hidden
        />
        <p className="text-[11px] tracking-[0.18em] text-white/75">
          商家後台 · LINE OA 第一版
        </p>
        <h1
          className="mt-2 font-display text-[1.45rem] leading-snug font-bold"
          style={{ fontFamily: "var(--font-noto-serif), var(--font-display)" }}
        >
          {store.headerTitle}
        </h1>
        <p className="mt-2 text-sm text-white/85">{store.subtitle}</p>
        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[12px] leading-relaxed text-white/90">
          本階段主通道是<strong className="font-semibold">惜食 LINE 官方帳號</strong>
          ：點菜單產文 → 一鍵廣播給 OA 好友。先累積約 {store.friendGoal}{" "}
          位客人，再做下一版加強。
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pt-4">
        {paidBanner && (
          <div
            className="rounded-xl border border-[#eadcd4] bg-white px-3 py-2 text-sm text-[#5c0000] anim-rise"
            role="status"
          >
            {paidBanner}
          </div>
        )}

        <section
          className="rounded-2xl bg-white px-4 py-3 shadow-sm anim-rise"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#6b5348]">惜食 LINE OA 狀態</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#1a120f]">
                {lineConfigured ? "已接上，可一鍵推播" : "尚未接線（無法廣播）"}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#6b5348]">
                {lineConfigured
                  ? `目標：先累積約 ${store.friendGoal} 位會收特價的好友，再加強今日頁／核銷。`
                  : "請用手機完成下方接線步驟；Token 只填在 Vercel 雲端。"}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                lineConfigured ? "bg-[#06C755]/15 text-[#06C755]" : "bg-[#eadcd4] text-[#6b5348]"
              }`}
            >
              {lineConfigured ? "ON" : "OFF"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSetupOpen((v) => !v)}
              className="rounded-lg border border-[#eadcd4] px-3 py-2 text-[11px] font-semibold text-[#8B0000]"
            >
              {setupOpen ? "收起接線步驟" : "查看 LINE OA 接線步驟"}
            </button>
            <button
              type="button"
              onClick={copyAddFriendUrl}
              className="rounded-lg bg-[#06C755] px-3 py-2 text-[11px] font-semibold text-white"
            >
              複製加好友連結
            </button>
          </div>
          {setupOpen && (
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[12px] leading-relaxed text-[#1a120f]">
              {(lineSetupSteps.length
                ? lineSetupSteps
                : [
                    "LINE Developers 建立 Messaging API Channel",
                    "發行長期 Channel access token",
                    "Vercel 填 LINE_CHANNEL_ACCESS_TOKEN 並 Redeploy",
                    "可選填 NEXT_PUBLIC_LINE_OA_URL（加好友連結）",
                    "本站產文 → 一鍵推播",
                  ]
              ).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
        </section>

        <section
          className="rounded-2xl bg-white px-4 py-3 shadow-sm anim-rise"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {weather?.icon ?? "⛅"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#6b5348]">板橋天氣（可當文案氣氛）</p>
              <p className="truncate text-base font-semibold text-[#1a120f]">{weatherLabel}</p>
            </div>
          </div>
        </section>

        <section className="anim-rise" style={{ animationDelay: "60ms" }}>
          <div className="mb-2 flex items-end justify-between gap-2 px-1">
            <div>
              <h2 className="text-sm font-semibold text-[#1a120f]">① 點選今日惜食品</h2>
              <p className="mt-0.5 text-[11px] text-[#6b5348]">
                選幾個寫幾個 · 已選 {selectedIds.length}
              </p>
            </div>
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="text-[11px] font-medium text-[#8B0000]"
                onClick={() => setSelectedIds([])}
              >
                清空
              </button>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5 px-1">
              {selectedItems.map((it) => (
                <span
                  key={it.id}
                  className="rounded-full bg-[#8B0000] px-2.5 py-1 text-[11px] font-semibold text-white"
                >
                  {it.name}
                  {it.price != null ? ` $${it.price}` : ""}
                </span>
              ))}
            </div>
          )}

          <div
            className="rounded-2xl bg-white shadow-sm"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            <div className="flex gap-1 overflow-x-auto border-b border-[#eadcd4] px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            <div className="grid max-h-[42vh] grid-cols-2 gap-2 overflow-y-auto p-3 sm:grid-cols-2">
              {(currentGroup?.items ?? []).map((it) => {
                const on = selectedIds.includes(it.id);
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => toggleItem(it.id)}
                    className={`min-h-[52px] rounded-xl px-2.5 py-2 text-left text-[13px] font-medium transition active:scale-[0.98] ${
                      on
                        ? "bg-[#8B0000] text-white ring-2 ring-[#5c0000]"
                        : "bg-[#fff8f4] text-[#1a120f] ring-1 ring-[#eadcd4]"
                    }`}
                  >
                    <span className="block leading-snug">{it.name}</span>
                    <span className={`mt-0.5 block text-[11px] ${on ? "text-white/80" : "text-[#6b5348]"}`}>
                      {it.price != null ? `$${it.price}` : "時價"}
                      {it.popular ? " · 人氣" : ""}
                    </span>
                  </button>
                );
              })}
              {!currentGroup && (
                <p className="col-span-2 py-6 text-center text-sm text-[#6b5348]">菜單載入中…</p>
              )}
            </div>
          </div>
        </section>

        <section className="anim-rise" style={{ animationDelay: "90ms" }}>
          <h2 className="mb-1 px-1 text-sm font-semibold text-[#1a120f]">② 補充（可留空）</h2>
          <input
            value={extraNote}
            onChange={(e) => setExtraNote(e.target.value)}
            placeholder="例如：今天下大雨、數量不多…"
            className="w-full rounded-2xl border border-[#eadcd4] bg-white px-3 py-3 text-[15px] outline-none placeholder:text-[#a89084]"
          />
        </section>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={genState === "loading"}
          className="anim-rise rounded-2xl px-4 py-4 text-[15px] font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-70"
          style={{
            background: "linear-gradient(180deg, #b22222 0%, #8B0000 100%)",
            animationDelay: "110ms",
          }}
        >
          {genState === "loading" ? "產生特價文中…" : "③ 產生惜食特價文案"}
        </button>

        {(copyText || genState === "loading") && (
          <section
            id="preview-panel"
            className="relative rounded-2xl bg-white p-4 shadow-sm anim-rise"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            {matchedLabel && (
              <p className="mb-2 text-[11px] text-[#6b5348]">{matchedLabel}</p>
            )}
            <h2 className="mb-2 text-sm font-semibold">④ 預覽 → 推播惜食 LINE OA</h2>
            <pre className="max-h-[240px] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-[#fff8f4] p-3 text-[13px] leading-relaxed text-[#1a120f]">
              {genState === "loading" ? "正在寫限時特價短文…" : copyText}
            </pre>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!copyText}
                className="rounded-xl border border-[#eadcd4] py-3 text-xs font-semibold disabled:opacity-40"
              >
                複製全文
              </button>
              <button
                type="button"
                onClick={handleLineShare}
                disabled={!copyText}
                className="rounded-xl border border-[#06C755] py-3 text-xs font-semibold text-[#06C755] disabled:opacity-40"
              >
                備援：LINE 分享
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!copyText) return;
                  if (!lineConfigured) {
                    setSetupOpen(true);
                    showToast("請先完成 LINE OA 接線（見上方步驟）");
                    return;
                  }
                  setLineConfirmOpen(true);
                }}
                disabled={!copyText}
                className="col-span-2 rounded-xl bg-[#06C755] py-3.5 text-sm font-bold text-white disabled:opacity-40"
              >
                一鍵推播惜食 LINE OA（主通道）
              </button>
            </div>
            {!lineConfigured && (
              <p className="mt-2 text-[11px] leading-relaxed text-[#6b5348]">
                主通道尚未接線：請在 Vercel 設定 LINE_CHANNEL_ACCESS_TOKEN 後 Redeploy。未接線仍可複製／分享測試文案。
              </p>
            )}
            {lineConfigured && (
              <p className="mt-2 text-[11px] leading-relaxed text-[#6b5348]">
                推播會發給所有 OA 好友。請持續邀客人加好友，目標約 {store.friendGoal} 人。
              </p>
            )}
          </section>
        )}
      </main>

      <div
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[#eadcd4] bg-white/95 px-4 py-3 backdrop-blur"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={() => setPayOpen(true)}
          className="w-full rounded-xl px-3 py-3 text-left"
          style={{ background: "linear-gradient(90deg, #fff5f0, #ffe8dc)" }}
        >
          <p className="text-[13px] font-bold text-[#8B0000]">
            {subscribed
              ? "已訂閱惜食特價推播"
              : `訂閱惜食特價系統 · NT$ ${store.subscriptionPrice}/月`}
          </p>
          <p className="mt-0.5 text-[11px] text-[#6b5348]">
            雲端運作 · 手機即可操作 · 電腦壞了也不中斷
          </p>
        </button>
      </div>

      {lineConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-6 sm:items-center"
          role="dialog"
          aria-modal
          onClick={() => !lineBusy && setLineConfirmOpen(false)}
        >
          <div
            className="w-full max-w-[400px] rounded-2xl bg-white p-5 shadow-xl anim-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1a120f]">確認推播到惜食 LINE OA？</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5348]">
              將廣播給所有已加官方帳號的好友。請確認沒有「過期／即期」等內部用語。客人可再轉傳給朋友。
            </p>
            <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-[#fff8f4] p-3 text-xs text-[#1a120f]">
              {copyText}
            </pre>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl border border-[#eadcd4] py-3 text-sm font-medium"
                disabled={lineBusy}
                onClick={() => setLineConfirmOpen(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="flex-[1.4] rounded-xl py-3 text-sm font-bold text-white disabled:opacity-70"
                style={{ background: "#06C755" }}
                disabled={lineBusy}
                onClick={handleLineBroadcast}
              >
                {lineBusy ? "推播中…" : "確認推播"}
              </button>
            </div>
          </div>
        </div>
      )}

      {payOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-6 sm:items-center"
          role="dialog"
          aria-modal
          onClick={() => !payBusy && setPayOpen(false)}
        >
          <div
            className="w-full max-w-[400px] rounded-2xl bg-white p-5 shadow-xl anim-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="font-display text-lg font-bold text-[#1a120f]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              訂閱惜食特價推播
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5348]">
              每月 NT${store.subscriptionPrice}。點菜單產特價文、推播惜食客群；程式與資料在
              GitHub／Vercel 雲端，不放在店內電腦。
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#1a120f]">
              <li>手機／平板／電腦瀏覽器皆可操作</li>
              <li>菜單按鈕選品 → 限時特價文（不說即期）</li>
              <li>一鍵推播 LINE OA 惜食群</li>
            </ul>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl border border-[#eadcd4] py-3 text-sm font-medium"
                disabled={payBusy}
                onClick={() => setPayOpen(false)}
              >
                稍後
              </button>
              <button
                type="button"
                className="flex-[1.4] rounded-xl py-3 text-sm font-bold text-white disabled:opacity-70"
                style={{ background: "#8B0000" }}
                disabled={payBusy}
                onClick={handleCheckout}
              >
                {payBusy ? "導向綠界…" : "前往綠界付款"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="anim-toast fixed bottom-28 left-1/2 z-50 w-[min(92%,400px)] -translate-x-1/2 rounded-xl bg-[#1a120f] px-4 py-3 text-center text-sm text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
