"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TodayDealCard, type TodayDealCardData } from "@/components/TodayDealCard";

type PublicBag = {
  id: string;
  storeName: string;
  publicTitle: string;
  publicHint: string;
  price: number;
  qty: number;
  remaining: number;
  pickupStart: string;
  pickupEnd: string;
  salesStopAt: string;
  salesOpen: boolean;
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

export function TodayGuestBoard({
  boardDeal,
  shareUrl,
}: {
  boardDeal: TodayDealCardData | null;
  shareUrl: string;
}) {
  const router = useRouter();
  const [bag, setBag] = useState<PublicBag | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bags")
      .then((r) => r.json())
      .then((d: { bag?: PublicBag | null }) => setBag(d.bag ?? null))
      .catch(() => undefined);
  }, []);

  async function reserve() {
    setBusy(true);
    setToast(null);
    try {
      const res = await fetch("/api/bags/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: getGuestId() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "預約失敗");
      if (data.reservation?.id) {
        router.push(`/bag/${data.reservation.id}`);
        return;
      }
      setToast("預約成功");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "預約失敗");
    } finally {
      setBusy(false);
      fetch("/api/bags")
        .then((r) => r.json())
        .then((d: { bag?: PublicBag | null }) => setBag(d.bag ?? null))
        .catch(() => undefined);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {bag && (
        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#8B0000]">
            今晚惜食驚喜袋
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#1a120f]">{bag.publicTitle}</h2>
          <p className="mt-1 text-[13px] text-[#6b5348]">{bag.storeName}</p>

          <p className="mt-3 text-3xl font-bold text-[#8B0000]">
            ${bag.price}
            <span className="ml-2 text-sm font-medium text-[#6b5348]">到店付款</span>
          </p>

          <p className="mt-3 text-[14px] leading-relaxed text-[#1a120f]">{bag.publicHint}</p>

          <p className="mt-3 text-[13px] font-semibold text-[#1a120f]">
            取餐 {bag.pickupStart}–{bag.pickupEnd}
          </p>
          <p className="mt-1 text-[12px] text-[#6b5348]">
            {bag.salesOpen
              ? `還可預約 ${bag.remaining}／共 ${bag.qty} 袋 · ${bag.salesStopAt} 停止預約`
              : bag.remaining <= 0
                ? "今晚已約滿"
                : "今晚已停止預約或已結束"}
          </p>

          <button
            type="button"
            disabled={!bag.salesOpen || busy}
            onClick={() => void reserve()}
            className="mt-4 w-full rounded-xl bg-[#8B0000] py-3.5 text-[15px] font-bold text-white disabled:bg-[#b5a39a]"
          >
            {busy ? "預約中…" : bag.salesOpen ? "預約今晚這一袋" : "目前無法預約"}
          </button>
          <p className="mt-2 text-center text-[11px] text-[#6b5348]">
            預約後請在時段內到店出示 QR，並支付袋價。內容保留驚喜。
          </p>
        </section>
      )}

      {boardDeal && <TodayDealCard deal={boardDeal} shareUrl={shareUrl} />}

      {!bag && !boardDeal && (
        <section
          className="rounded-2xl bg-white p-5 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-semibold text-[#1a120f]">目前還沒有今晚驚喜袋</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6b5348]">
            請向店家索取最新連結，或等店長在後台上架今晚袋子。
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
