"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Coupon = {
  id: string;
  shortCode: string;
  itemName: string;
  price?: number;
  dealPrice: number | null;
  status: "claimed" | "redeemed" | "expired";
  claimedAt: string;
  redeemedAt?: string;
};

export function CouponTicket({ couponId }: { couponId: string }) {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [couponUrl, setCouponUrl] = useState("");

  useEffect(() => {
    setCouponUrl(`${window.location.origin}/coupon/${couponId}`);
    fetch(`/api/coupons?id=${encodeURIComponent(couponId)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "讀取失敗");
        setCoupon(data.coupon);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "讀取失敗"));
  }, [couponId]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center px-4">
        <p className="text-center text-[#8B0000]">{error}</p>
        <Link href="/today" className="mt-4 text-sm underline">
          回今日特價
        </Link>
      </main>
    );
  }

  if (!coupon) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[430px] items-center justify-center">
        <p className="text-[#6b5348]">載入折價券中…</p>
      </main>
    );
  }

  const qrUrl = couponUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(couponUrl)}`
    : "";

  const statusLabel =
    coupon.status === "redeemed"
      ? "已使用"
      : coupon.status === "expired"
        ? "已過期"
        : "請出示給店長掃描";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col pb-10">
      <header
        className="px-5 pb-5 pt-8 text-white"
        style={{
          background:
            coupon.status === "claimed"
              ? "linear-gradient(165deg, #8B0000 0%, #5c0000 100%)"
              : "linear-gradient(165deg, #5a5a5a 0%, #333 100%)",
        }}
      >
        <p className="text-[11px] tracking-[0.18em] text-white/75">翁記惜食折價券</p>
        <h1 className="mt-2 font-display text-[1.55rem] font-bold">{coupon.itemName}</h1>
        <p className="mt-2 text-sm text-white/90">{statusLabel}</p>
      </header>

      <div className="px-4 pt-4">
        <section className="rounded-2xl bg-white p-5 text-center shadow-sm" style={{ border: "1px solid var(--wj-line)" }}>
          <p className="text-[13px] text-[#6b5348]">特惠價</p>
          <p className="mt-1 text-3xl font-bold text-[#8B0000]">
            {coupon.dealPrice != null ? `$${coupon.dealPrice}` : "特惠"}
            {coupon.price != null && (
              <span className="ml-2 text-base font-normal text-[#6b5348] line-through">
                ${coupon.price}
              </span>
            )}
          </p>

          {coupon.status === "claimed" && qrUrl && (
            <div className="mt-4 flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="折價券 QR" width={280} height={280} className="rounded-xl" />
              <p className="text-[12px] text-[#6b5348]">到店請給店長掃描這張 QR</p>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-[#fff8f4] px-3 py-4">
            <p className="text-[12px] text-[#6b5348]">6 碼券號（相機壞了可給店長手打）</p>
            <p className="mt-1 text-3xl font-bold tracking-[0.35em] text-[#1a120f]">
              {coupon.shortCode}
            </p>
          </div>

          {coupon.status === "redeemed" && (
            <p className="mt-4 text-sm text-[#1f7a4c]">
              已於{" "}
              {coupon.redeemedAt
                ? new Date(coupon.redeemedAt).toLocaleString("zh-TW", { hour12: false })
                : "稍早"}{" "}
              核銷完成
            </p>
          )}
        </section>

        <p className="mt-4 text-center text-[12px] text-[#6b5348]">
          限當日使用 · 一張券只能用一次 · 截圖轉傳仍只算一張
        </p>

        <Link href="/today" className="mt-4 block text-center text-sm font-semibold text-[#8B0000]">
          回今日特價頁
        </Link>
      </div>
    </main>
  );
}
