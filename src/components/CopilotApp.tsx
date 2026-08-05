"use client";

import { useCallback, useEffect, useState } from "react";
import { scenarios, store, type ScenarioId } from "@/data/store";
import type { WeatherPayload } from "@/lib/weather";

type GenState = "idle" | "loading" | "done" | "error";

export function CopilotApp() {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [scenario, setScenario] = useState<ScenarioId>("cold_rain");
  const [copyText, setCopyText] = useState("");
  const [genState, setGenState] = useState<GenState>("idle");
  const [toast, setToast] = useState<string | null>(null);
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
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d: { subscribed?: boolean }) => setSubscribed(!!d.subscribed))
      .catch(() => undefined);

    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      setPaidBanner("訂閱成功！感謝支持翁記專屬 AI 助手。");
      setSubscribed(true);
    } else if (params.get("paid") === "0") {
      setPaidBanner("付款未完成或已取消，可稍後再試。");
    }
  }, []);

  async function handleGenerate() {
    setGenState("loading");
    setCopyText("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, weather }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error || "生成失敗");
      setCopyText(data.text);
      setGenState("done");
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
    showToast("文案已複製到剪貼簿！可直接貼至 LINE 官方帳號或 FB 粉專。");
  }

  function handleLineShare() {
    if (!copyText) return;
    const url = `https://line.me/R/share?text=${encodeURIComponent(copyText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col pb-28">
      <header
        className="relative overflow-hidden px-5 pb-6 pt-8 text-white anim-rise"
        style={{
          background: "linear-gradient(165deg, #8B0000 0%, #5c0000 55%, #3d0000 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-6 top-2 h-28 w-28 rounded-full opacity-30 anim-steam"
          style={{ background: "radial-gradient(circle, #ffb08a, transparent 70%)" }}
          aria-hidden
        />
        <p className="text-[11px] tracking-[0.18em] text-white/75">WENG JI · BANQIAO</p>
        <h1
          className="font-display mt-2 text-[1.55rem] leading-snug font-bold"
          style={{ fontFamily: "var(--font-noto-serif), var(--font-display)" }}
        >
          {store.headerTitle}
        </h1>
        <p className="mt-2 text-sm text-white/85">{store.subtitle}</p>
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
          style={{ border: "1px solid var(--wj-line)", animationDelay: "40ms" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {weather?.icon ?? "⛅"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#6b5348]">板橋即時天氣</p>
              <p className="truncate text-base font-semibold text-[#1a120f]">{weatherLabel}</p>
              <p className="text-xs text-[#6b5348]">
                {weather?.precipProb != null
                  ? `降雨機率約 ${weather.precipProb}%`
                  : "降雨機率讀取中"}
                {weather?.isFallback ? " · 模擬天氣" : ""}
              </p>
            </div>
          </div>
        </section>

        <section className="anim-rise" style={{ animationDelay: "80ms" }}>
          <h2 className="mb-2 px-1 text-sm font-semibold text-[#1a120f]">今日營業目標</h2>
          <div className="flex flex-col gap-2.5">
            {scenarios.map((s) => {
              const active = scenario === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScenario(s.id)}
                  className="rounded-2xl px-4 py-3.5 text-left transition active:scale-[0.99]"
                  style={{
                    background: active ? "#fff5f0" : "#fff",
                    border: active ? "2px solid #8B0000" : "1px solid var(--wj-line)",
                    boxShadow: active ? "0 0 0 1px rgba(139,0,0,0.08)" : undefined,
                  }}
                >
                  <p className="text-[15px] font-bold text-[#1a120f]">{s.title}</p>
                  <p className="mt-0.5 text-xs text-[#6b5348]">{s.blurb}</p>
                  <p className="mt-1 text-xs font-medium text-[#8B0000]">主打：{s.focus}</p>
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={genState === "loading"}
          className="anim-rise rounded-2xl px-4 py-4 text-[15px] font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-70"
          style={{
            background: "linear-gradient(180deg, #b22222 0%, #8B0000 100%)",
            animationDelay: "120ms",
          }}
        >
          {genState === "loading"
            ? "產生中…（約 30 秒內完成）"
            : "🚀 一鍵生成今日爆客 LINE / 社群文案"}
        </button>

        {(copyText || genState === "loading") && (
          <section
            className="relative rounded-2xl bg-white p-4 shadow-sm anim-rise"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">今日文案預覽</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!copyText}
                  className="rounded-lg bg-[#8B0000] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  複製全文
                </button>
                <button
                  type="button"
                  onClick={handleLineShare}
                  disabled={!copyText}
                  className="rounded-lg border border-[#06C755] px-3 py-1.5 text-xs font-semibold text-[#06C755] disabled:opacity-40"
                >
                  LINE 分享
                </button>
              </div>
            </div>
            <pre className="max-h-[340px] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-[#fff8f4] p-3 text-[13px] leading-relaxed text-[#1a120f]">
              {genState === "loading" ? "AI 正在依板橋天氣與菜單撰寫…" : copyText}
            </pre>
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
              ? "已訂閱翁記專屬 AI 助手"
              : `訂閱翁記專屬 AI 助手 - NT$ ${store.subscriptionPrice}/月`}
          </p>
          <p className="mt-0.5 text-[11px] text-[#6b5348]">
            {subscribed
              ? "天天自動監測板橋天氣與爆客文案"
              : "每月只要 $999，多賣一桌雙人套餐即完全回本！"}
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
            className="w-full max-w-[400px] rounded-2xl bg-white p-5 shadow-xl anim-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="font-display text-lg font-bold text-[#1a120f]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              訂閱翁記專屬 AI 助手
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5348]">
              每月 NT${store.subscriptionPrice}（綠界信用卡定期定額）。天天依板橋天氣產出爆客文案，
              多賣一桌雙人套餐即完全回本。
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#1a120f]">
              <li>板橋即時天氣連動文案</li>
              <li>三種營業目標一鍵產出</li>
              <li>可直接貼 LINE OA／FB</li>
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
          className="anim-toast fixed bottom-24 left-1/2 z-50 w-[min(92%,400px)] -translate-x-1/2 rounded-xl bg-[#1a120f] px-4 py-3 text-center text-sm text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
