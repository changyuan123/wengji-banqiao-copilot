"use client";

import { useState } from "react";

export type TodayDealCardData = {
  at: string;
  text: string;
  address: string;
  phone: string;
  items: {
    id: string;
    name: string;
    price?: number;
    deal: number | null;
  }[];
};

export function TodayDealCard({
  deal,
  shareUrl,
}: {
  deal: TodayDealCardData;
  shareUrl: string;
}) {
  const [toast, setToast] = useState<string | null>(null);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast("連結已複製，可貼給朋友");
    } catch {
      setToast(shareUrl);
    }
    window.setTimeout(() => setToast(null), 2500);
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "翁記今晚惜食特價",
          text: deal.text.slice(0, 120),
          url: shareUrl,
        });
        return;
      } catch {
        /* fall through */
      }
    }
    await copyLink();
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
  const updated = new Date(deal.at).toLocaleString("zh-TW", { hour12: false });

  return (
    <section
      className="rounded-2xl bg-white p-4 shadow-sm"
      style={{ border: "1px solid var(--wj-line)" }}
    >
      <p className="text-[11px] text-[#6b5348]">更新時間 {updated}</p>
      <h2 className="mt-1 text-lg font-bold text-[#1a120f]">今日限時特價</h2>
      <ul className="mt-3 space-y-2">
        {deal.items.map((it) => (
          <li
            key={it.id}
            className="flex items-baseline justify-between gap-2 border-b border-[#f0e4dc] pb-2 text-[15px]"
          >
            <span className="font-medium text-[#1a120f]">{it.name}</span>
            <span className="shrink-0 font-semibold text-[#8B0000]">
              {it.deal != null ? (
                <>
                  ${it.deal}
                  {it.price != null && (
                    <span className="ml-1 text-[11px] font-normal text-[#6b5348] line-through">
                      ${it.price}
                    </span>
                  )}
                </>
              ) : (
                "特惠"
              )}
            </span>
          </li>
        ))}
      </ul>

      <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fff8f4] p-3 text-[13px] leading-relaxed text-[#1a120f]">
        {deal.text}
      </pre>

      <p className="mt-3 text-sm text-[#1a120f]">
        📍{deal.address}
        <br />
        ☎️{deal.phone}
      </p>

      <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-[#fff8f4] p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="今日特價 QR Code" width={200} height={200} className="rounded-lg" />
        <p className="text-center text-[11px] text-[#6b5348]">掃 QR 或轉傳連結給朋友</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="rounded-xl border border-[#eadcd4] py-3 text-sm font-semibold"
        >
          複製連結
        </button>
        <button
          type="button"
          onClick={nativeShare}
          className="rounded-xl bg-[#8B0000] py-3 text-sm font-bold text-white"
        >
          轉傳給朋友
        </button>
      </div>

      {toast && (
        <p className="mt-2 text-center text-[12px] text-[#8B0000]" role="status">
          {toast}
        </p>
      )}
    </section>
  );
}
