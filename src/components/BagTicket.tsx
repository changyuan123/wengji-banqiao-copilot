"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Reservation = {
  id: string;
  shortCode: string;
  status: "reserved" | "picked_up" | "expired";
  price: number;
  publicTitle: string;
  publicHint: string;
  pickupStart: string;
  pickupEnd: string;
  storeName: string;
  contact?: string;
  reservedAt: string;
  pickedUpAt?: string;
};

export function BagTicket({ reservationId }: { reservationId: string }) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ticketUrl, setTicketUrl] = useState("");

  useEffect(() => {
    setTicketUrl(`${window.location.origin}/bag/${reservationId}`);
    fetch(`/api/bags/reservation?id=${encodeURIComponent(reservationId)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "讀取失敗");
        setReservation(data.reservation);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "讀取失敗"));
  }, [reservationId]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center gap-3 px-4">
        <p className="text-center text-[#8B0000]">{error}</p>
        <Link href="/today" className="text-sm font-semibold text-[#8B0000] underline">
          回今晚惜食
        </Link>
      </main>
    );
  }

  if (!reservation) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[430px] items-center justify-center px-4">
        <p className="text-[#6b5348]">載入預約中…</p>
      </main>
    );
  }

  const qrUrl = ticketUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(ticketUrl)}`
    : "";

  const statusLabel =
    reservation.status === "picked_up"
      ? "已取袋"
      : reservation.status === "expired"
        ? "已過期"
        : "請在時段內到店取袋";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col pb-10">
      <header
        className="px-5 pb-5 pt-8 text-white"
        style={{
          background: "linear-gradient(165deg, #8B0000 0%, #5c0000 55%, #3d0000 100%)",
        }}
      >
        <p className="text-[11px] tracking-[0.18em] text-white/75">惜食驚喜袋</p>
        <h1 className="mt-2 font-display text-[1.45rem] font-bold">
          {reservation.publicTitle}
        </h1>
        <p className="mt-2 text-sm text-white/85">{statusLabel}</p>
      </header>

      <div className="flex flex-col gap-4 px-4 pt-4">
        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <p className="text-[12px] text-[#6b5348]">{reservation.storeName}</p>
          <p className="mt-2 text-3xl font-bold text-[#8B0000]">
            ${reservation.price}
            <span className="ml-2 text-sm font-medium text-[#6b5348]">到店付款</span>
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-[#1a120f]">
            {reservation.publicHint}
          </p>
          <p className="mt-3 text-[13px] font-semibold text-[#1a120f]">
            取餐時段 {reservation.pickupStart}–{reservation.pickupEnd}
          </p>
          {reservation.contact && (
            <p className="mt-2 text-[12px] text-[#6b5348]">
              聯絡方式已留下（店長取袋時可核對）
            </p>
          )}
        </section>

        {reservation.status === "reserved" && qrUrl && (
          <section
            className="rounded-2xl bg-white p-4 text-center shadow-sm"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="取袋 QR" className="mx-auto h-[240px] w-[240px]" />
            <p className="mt-2 text-[13px] text-[#6b5348]">到店請給店長掃描這張 QR</p>
          </section>
        )}

        <section
          className="rounded-2xl bg-white p-4 text-center shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <p className="text-[12px] text-[#6b5348]">6 碼預約號（相機壞了可給店長手打）</p>
          <p className="mt-1 font-mono text-[28px] font-bold tracking-[0.25em] text-[#1a120f]">
            {reservation.shortCode}
          </p>
        </section>

        {reservation.status === "picked_up" && (
          <p className="rounded-xl bg-[#e8f5ee] px-3 py-3 text-center text-sm text-[#14603a]">
            已於{" "}
            {reservation.pickedUpAt
              ? new Date(reservation.pickedUpAt).toLocaleString("zh-TW", {
                  hour12: false,
                })
              : "稍早"}{" "}
            取袋完成
          </p>
        )}

        <p className="text-center text-[12px] text-[#6b5348]">
          限今晚此時段取袋 · 一筆預約一袋 · 內容保留驚喜、以現場為準
        </p>

        <Link
          href="/today"
          className="rounded-xl bg-white py-3 text-center text-sm font-semibold text-[#8B0000]"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          回今晚惜食
        </Link>
      </div>
    </main>
  );
}
