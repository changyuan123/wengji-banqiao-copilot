"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PublicBag = {
  id: string;
  storeId: string;
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

export function TodayGuestBoard() {
  const router = useRouter();
  const [bags, setBags] = useState<PublicBag[]>([]);
  const [platformBlurb, setPlatformBlurb] = useState("今晚惜食驚喜袋貨架");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [contact, setContact] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("wj_guest_contact") || "";
  });
  const [pickingId, setPickingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bags")
      .then((r) => r.json())
      .then(
        (d: {
          bags?: PublicBag[];
          platform?: { blurb?: string };
        }) => {
          setBags(d.bags ?? []);
          if (d.platform?.blurb) setPlatformBlurb(d.platform.blurb);
        },
      )
      .catch(() => undefined);
  }, []);

  async function reserve(bagId: string) {
    const c = contact.trim();
    if (c.length < 8) {
      setToast("請先留下手機或 LINE（至少 8 個字），方便店家聯絡");
      return;
    }
    window.localStorage.setItem("wj_guest_contact", c);
    setBusyId(bagId);
    setToast(null);
    try {
      const res = await fetch("/api/bags/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: getGuestId(),
          bagId,
          contact: c,
        }),
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
      setBusyId(null);
      setPickingId(null);
      fetch("/api/bags")
        .then((r) => r.json())
        .then((d: { bags?: PublicBag[] }) => setBags(d.bags ?? []))
        .catch(() => undefined);
    }
  }

  const openBags = bags.filter((b) => b.salesOpen);
  const closedBags = bags.filter((b) => !b.salesOpen);

  return (
    <div className="flex flex-col gap-4">
      <section
        className="rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#8B0000]">
          惜食平台 · 今晚貨架
        </p>
        <h2 className="mt-1 text-lg font-bold text-[#1a120f]">{platformBlurb}</h2>
        <p className="mt-2 text-[13px] text-[#6b5348]">
          先填聯絡方式，再選要預約的袋子。到店取袋並付款；內容保留驚喜。
        </p>
        <label className="mt-3 block text-[12px] font-semibold text-[#6b5348]">
          你的聯絡方式（手機或 LINE）
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#eadcd4] px-3 py-3 text-[16px]"
            placeholder="例如 09xxxxxxxx 或 LINE ID"
            autoComplete="tel"
          />
        </label>
      </section>

      {openBags.length === 0 && closedBags.length === 0 && (
        <section
          className="rounded-2xl bg-white p-5 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-semibold">目前還沒有今晚驚喜袋</h2>
          <p className="mt-2 text-sm text-[#6b5348]">請稍後再看，或問店家是否已上架。</p>
        </section>
      )}

      {openBags.map((bag) => (
        <section
          key={bag.id}
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <p className="text-[12px] text-[#6b5348]">{bag.storeName}</p>
          <h3 className="mt-1 text-xl font-bold">{bag.publicTitle}</h3>
          <p className="mt-2 text-3xl font-bold text-[#8B0000]">
            ${bag.price}
            <span className="ml-2 text-sm font-medium text-[#6b5348]">到店付款</span>
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-[#1a120f]">{bag.publicHint}</p>
          <p className="mt-3 text-[13px] font-semibold">
            取餐 {bag.pickupStart}–{bag.pickupEnd}
          </p>
          <p className="mt-1 text-[12px] text-[#6b5348]">
            還可預約 {bag.remaining}／共 {bag.qty} 袋 · {bag.salesStopAt} 停止預約
          </p>

          {pickingId === bag.id ? (
            <div className="mt-4 space-y-2">
              <p className="text-[13px] text-[#6b5348]">
                將使用聯絡方式：<strong>{contact.trim() || "（尚未填寫）"}</strong>
              </p>
              <button
                type="button"
                disabled={busyId === bag.id}
                onClick={() => void reserve(bag.id)}
                className="w-full rounded-xl bg-[#8B0000] py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
              >
                {busyId === bag.id ? "預約中…" : "確認預約這一袋"}
              </button>
              <button
                type="button"
                onClick={() => setPickingId(null)}
                className="w-full rounded-xl border border-[#eadcd4] py-2.5 text-sm font-semibold"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickingId(bag.id)}
              className="mt-4 w-full rounded-xl bg-[#8B0000] py-3.5 text-[15px] font-bold text-white"
            >
              預約這一袋
            </button>
          )}
        </section>
      ))}

      {closedBags.length > 0 && (
        <section className="rounded-2xl bg-[#f5f0ec] p-4">
          <p className="text-[13px] font-semibold text-[#6b5348]">目前無法新預約</p>
          <ul className="mt-2 space-y-1 text-[12px] text-[#6b5348]">
            {closedBags.map((b) => (
              <li key={b.id}>
                {b.storeName} · {b.publicTitle}
                {b.remaining <= 0 ? "（已約滿）" : "（已停預約）"}
              </li>
            ))}
          </ul>
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
