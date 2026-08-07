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
  const [publishBusy, setPublishBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState<string | null>(null);

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

    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      setPaidBanner("訂閱成功！");
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
        showToast("選很多也可以，特價頁會全部列出");
      }
      return next;
    });
    setShareUrl(null);
    setQrUrl(null);
  }

  async function handleGenerate() {
    if (selectedIds.length === 0) {
      showToast("請先點選今天要特價的品項");
      return;
    }
    setGenState("loading");
    setCopyText("");
    setMatchedLabel(null);
    setShareUrl(null);
    setQrUrl(null);
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
          ? `已選：${data.matched.map((m) => m.name).join("、")}`
          : null,
      );
      setGenState("done");
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

  async function handlePublish() {
    if (selectedIds.length === 0) {
      showToast("請先選擇品項");
      return;
    }
    setPublishBusy(true);
    try {
      const res = await fetch("/api/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: selectedIds,
          note: extraNote.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        shareUrl?: string;
        qrUrl?: string;
        canonicalUrl?: string;
        deal?: { text?: string };
        message?: string;
      };
      if (!res.ok) throw new Error(data.error || "發布失敗");
      setShareUrl(data.shareUrl || null);
      setQrUrl(data.qrUrl || null);
      setCanonicalUrl(data.canonicalUrl || null);
      if (data.deal?.text) {
        setCopyText(data.deal.text);
        setGenState("done");
      }
      showToast(data.message || "已發布到今日特價頁");
      window.setTimeout(() => {
        document.getElementById("publish-panel")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "發布失敗");
    } finally {
      setPublishBusy(false);
    }
  }

  async function copyShareUrl() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("特價連結已複製，傳給客人即可");
    } catch {
      showToast(shareUrl);
    }
  }

  async function handleCopyText() {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      showToast("文案已複製");
    } catch {
      showToast("複製失敗");
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
        <p className="text-[11px] tracking-[0.18em] text-white/75">商家後台 · 今日特價黑板</p>
        <h1
          className="mt-2 font-display text-[1.45rem] leading-snug font-bold"
          style={{ fontFamily: "var(--font-noto-serif), var(--font-display)" }}
        >
          {store.headerTitle}
        </h1>
        <p className="mt-2 text-sm text-white/85">{store.subtitle}</p>
        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[12px] leading-relaxed text-white/90">
          點菜 → 發布到<strong className="font-semibold">今日特價網頁</strong>
          。客人掃 QR 或開連結就能看、能轉傳。
          <strong className="font-semibold">不用 LINE、不按則數收費。</strong>
        </p>
        <a
          href="/today"
          className="mt-3 inline-block rounded-lg bg-white/15 px-3 py-1.5 text-[12px] font-semibold ring-1 ring-white/30"
        >
          預覽客人看到的今日頁 →
        </a>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pt-4">
        {paidBanner && (
          <div
            className="rounded-xl border border-[#eadcd4] bg-white px-3 py-2 text-sm text-[#5c0000]"
            role="status"
          >
            {paidBanner}
          </div>
        )}

        <section
          className="rounded-2xl bg-white px-4 py-3 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {weather?.icon ?? "⛅"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#6b5348]">板橋天氣</p>
              <p className="truncate text-base font-semibold text-[#1a120f]">{weatherLabel}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-end justify-between gap-2 px-1">
            <div>
              <h2 className="text-sm font-semibold text-[#1a120f]">① 點選今日特價品</h2>
              <p className="mt-0.5 text-[11px] text-[#6b5348]">
                選幾個寫幾個 · 已選 {selectedIds.length}
              </p>
            </div>
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="text-[11px] font-medium text-[#8B0000]"
                onClick={() => {
                  setSelectedIds([]);
                  setShareUrl(null);
                }}
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
            <div className="flex gap-1 overflow-x-auto border-b border-[#eadcd4] px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            <div className="grid max-h-[42vh] grid-cols-2 gap-2 overflow-y-auto p-3">
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
                    <span
                      className={`mt-0.5 block text-[11px] ${on ? "text-white/80" : "text-[#6b5348]"}`}
                    >
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

        <section>
          <h2 className="mb-1 px-1 text-sm font-semibold text-[#1a120f]">② 補充（可留空）</h2>
          <input
            value={extraNote}
            onChange={(e) => setExtraNote(e.target.value)}
            placeholder="例如：今天下大雨、數量不多…"
            className="w-full rounded-2xl border border-[#eadcd4] bg-white px-3 py-3 text-[15px] outline-none placeholder:text-[#a89084]"
          />
        </section>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishBusy || selectedIds.length === 0}
            className="rounded-2xl px-4 py-4 text-[15px] font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(180deg, #b22222 0%, #8B0000 100%)" }}
          >
            {publishBusy ? "發布中…" : "③ 發布到今日特價頁（主按鈕）"}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={genState === "loading"}
            className="rounded-2xl border border-[#eadcd4] bg-white px-4 py-3 text-[13px] font-semibold text-[#1a120f] disabled:opacity-50"
          >
            {genState === "loading" ? "產生文案中…" : "只預覽文案（不發布）"}
          </button>
        </div>

        {(shareUrl || qrUrl) && (
          <section
            id="publish-panel"
            className="rounded-2xl bg-white p-4 shadow-sm"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            <h2 className="text-sm font-semibold text-[#1a120f]">已發布！給客人這樣用</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[#6b5348]">
              請把連結或 QR 給客人／貼在店裡。朋友之間互相轉傳也完全免費。
            </p>
            {qrUrl && (
              <div className="mt-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="今日特價 QR" width={200} height={200} className="rounded-lg" />
              </div>
            )}
            <p className="mt-2 break-all rounded-xl bg-[#fff8f4] p-2 text-[11px] text-[#1a120f]">
              {shareUrl}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copyShareUrl}
                className="rounded-xl bg-[#8B0000] py-3 text-xs font-bold text-white"
              >
                複製特價連結
              </button>
              <a
                href={shareUrl || "/today"}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-[#eadcd4] py-3 text-center text-xs font-semibold"
              >
                打開客人頁面
              </a>
            </div>
            {canonicalUrl && (
              <p className="mt-2 text-[11px] text-[#6b5348]">
                固定入口（有發布才看得到最新）：{" "}
                <a className="font-medium text-[#8B0000]" href={canonicalUrl}>
                  {canonicalUrl}
                </a>
              </p>
            )}
          </section>
        )}

        {(copyText || genState === "loading") && (
          <section
            id="preview-panel"
            className="rounded-2xl bg-white p-4 shadow-sm"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            {matchedLabel && (
              <p className="mb-2 text-[11px] text-[#6b5348]">{matchedLabel}</p>
            )}
            <h2 className="mb-2 text-sm font-semibold">文案預覽</h2>
            <pre className="max-h-[220px] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-[#fff8f4] p-3 text-[13px] leading-relaxed text-[#1a120f]">
              {genState === "loading" ? "產生中…" : copyText}
            </pre>
            <button
              type="button"
              onClick={handleCopyText}
              disabled={!copyText}
              className="mt-3 w-full rounded-xl border border-[#eadcd4] py-3 text-xs font-semibold disabled:opacity-40"
            >
              複製文案文字
            </button>
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
              ? "已訂閱商家後台"
              : `訂閱商家後台 · NT$ ${store.subscriptionPrice}/月`}
          </p>
          <p className="mt-0.5 text-[11px] text-[#6b5348]">
            雲端運作 · 手機即可 · 特價走免費網頁不靠 LINE
          </p>
        </button>
      </div>

      {payOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-6 sm:items-center"
          role="dialog"
          aria-modal
          onClick={() => !payBusy && setPayOpen(false)}
        >
          <div
            className="w-full max-w-[400px] rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1a120f]">訂閱商家後台</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5348]">
              每月 NT${store.subscriptionPrice}。點菜單發布今日特價頁；客人用連結／QR
              查看與轉傳，不經 LINE 計費。
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl border border-[#eadcd4] py-3 text-sm"
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
