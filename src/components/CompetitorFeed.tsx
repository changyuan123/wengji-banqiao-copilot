"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type FeedItem = {
  id: string;
  competitorId: string;
  storeName: string;
  shortName: string;
  tag: string;
  text: string;
  publishedAt: string;
  source: "news" | "intel";
  url?: string;
};

function relativeTimeZh(iso: string): string {
  const t = +new Date(iso);
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "剛剛";
  if (m < 60) return `${m} 分鐘前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小時前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} 天前`;
  return new Date(iso).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
}

type FeedResponse = {
  items: FeedItem[];
  fetchedAt?: string;
  sources?: { news: number; intel: number };
  error?: string;
};

export function CompetitorFeedApp() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [sources, setSources] = useState<{ news: number; intel: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/competitor-feed", { cache: "no-store" });
      const data = (await res.json()) as FeedResponse;
      if (!res.ok) throw new Error(data.error || "載入失敗");
      setItems(data.items ?? []);
      setFetchedAt(data.fetchedAt ?? null);
      setSources(data.sources ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "載入失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[#faf6f2]">
      <header
        className="sticky top-0 z-20 border-b border-[#eadcd4] px-4 pb-3 pt-4 backdrop-blur"
        style={{ background: "rgba(250,246,242,0.92)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="text-sm font-medium text-[#8B0000]">
            ← 爆客助手
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-[#eadcd4] bg-white px-3 py-1.5 text-xs font-semibold text-[#1a120f]"
          >
            {loading ? "更新中…" : "重新整理"}
          </button>
        </div>
        <h1
          className="mt-2 text-xl font-bold text-[#1a120f]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          競品動態
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-[#6b5348]">
          篤行路商圈情報流（類似 Threads）：公開新聞＋在地情報，給翁記老闆快速掃過。
        </p>
        {fetchedAt && (
          <p className="mt-1 text-[11px] text-[#a89084]">
            更新於 {new Date(fetchedAt).toLocaleString("zh-TW")}
            {sources ? `｜新聞 ${sources.news}・情報 ${sources.intel}` : ""}
          </p>
        )}
      </header>

      <main className="flex-1 px-0 pb-10">
        {error && (
          <p className="mx-4 mt-4 rounded-xl bg-white px-3 py-2 text-sm text-[#8B0000]">{error}</p>
        )}
        {loading && items.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#6b5348]">載入競品動態中…</p>
        )}
        {!loading && items.length === 0 && !error && (
          <p className="px-4 py-8 text-center text-sm text-[#6b5348]">目前沒有新動態</p>
        )}

        <ul className="divide-y divide-[#eadcd4]">
          {items.map((it) => (
            <li key={it.id} className="anim-rise bg-transparent px-4 py-4">
              <div className="flex gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: "linear-gradient(145deg,#8B0000,#b22222)" }}
                  aria-hidden
                >
                  {it.shortName.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[15px] font-bold text-[#1a120f]">{it.shortName}</span>
                    <span className="text-[11px] text-[#a89084]">{relativeTimeZh(it.publishedAt)}</span>
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        background: it.source === "news" ? "#eef6ff" : "#fff5f0",
                        color: it.source === "news" ? "#1d4f91" : "#8B0000",
                      }}
                    >
                      {it.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed whitespace-pre-wrap text-[#1a120f]">
                    {it.text}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-[#a89084]">{it.storeName}</p>
                  {it.url && (
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs font-semibold text-[#8B0000]"
                    >
                      查看原文 →
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
