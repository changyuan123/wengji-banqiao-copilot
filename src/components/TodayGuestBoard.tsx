"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TodayDealCard, type TodayDealCardData } from "@/components/TodayDealCard";

type StockLine = {
  itemId: string;
  name: string;
  price?: number;
  dealPrice: number | null;
  qty: number;
  claimed: number;
  redeemed: number;
  remainingToClaim: number;
};

type StockDeal = {
  id: string;
  note?: string;
  expiresAt: string;
  lines: StockLine[];
  totals: { qty: number; claimed: number; redeemed: number };
};

export function TodayGuestBoard({
  boardDeal,
  shareUrl,
}: {
  boardDeal: TodayDealCardData | null;
  shareUrl: string;
}) {
  const router = useRouter();
  const [stock, setStock] = useState<StockDeal | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stock")
      .then((r) => r.json())
      .then((d: { deal?: StockDeal | null }) => setStock(d.deal ?? null))
      .catch(() => undefined);
  }, []);

  async function claim(itemId: string) {
    setBusyId(itemId);
    setToast(null);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "領取失敗");
      if (data.couponUrl) {
        router.push(`/coupon/${data.coupon.id}`);
        return;
      }
      setToast("領取成功");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "領取失敗");
    } finally {
      setBusyId(null);
      // refresh counts
      fetch("/api/stock")
        .then((r) => r.json())
        .then((d: { deal?: StockDeal | null }) => setStock(d.deal ?? null))
        .catch(() => undefined);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {stock && (
        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-lg font-bold text-[#1a120f]">限量折價券 · 先領再來</h2>
          <p className="mt-1 text-[13px] text-[#6b5348]">
            點「領取」會得到專屬 QR。到店給店長掃描才算用掉一份。
          </p>
          <ul className="mt-3 space-y-3">
            {stock.lines.map((line) => {
              const soldOut = line.remainingToClaim <= 0;
              return (
                <li
                  key={line.itemId}
                  className="rounded-xl bg-[#fff8f4] p-3"
                  style={{ border: "1px solid var(--wj-line)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#1a120f]">{line.name}</p>
                      <p className="mt-0.5 text-[13px] text-[#8B0000]">
                        {line.dealPrice != null ? `特惠 $${line.dealPrice}` : "特惠"}
                        {line.price != null && (
                          <span className="ml-1 text-[11px] text-[#6b5348] line-through">
                            ${line.price}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6b5348]">
                        還可領 {line.remainingToClaim}／共 {line.qty} 份
                        {line.redeemed > 0 ? ` · 已核銷 ${line.redeemed}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={soldOut || busyId === line.itemId}
                      onClick={() => claim(line.itemId)}
                      className="shrink-0 rounded-xl bg-[#8B0000] px-3 py-2.5 text-[13px] font-bold text-white disabled:bg-[#b5a39a]"
                    >
                      {soldOut
                        ? "已領完"
                        : busyId === line.itemId
                          ? "領取中…"
                          : "領取折價券"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {stock.note && (
            <p className="mt-3 text-[13px] text-[#6b5348]">備註：{stock.note}</p>
          )}
        </section>
      )}

      {boardDeal && <TodayDealCard deal={boardDeal} shareUrl={shareUrl} />}

      {!stock && !boardDeal && (
        <section
          className="rounded-2xl bg-white p-5 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-semibold text-[#1a120f]">目前還沒有今日特價</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6b5348]">
            請向店家索取最新連結，或等店長在後台釋出限量份數。
          </p>
        </section>
      )}

      {toast && (
        <p className="text-center text-sm text-[#8B0000]" role="status">
          {toast}
        </p>
      )}
    </div>
  );
}
