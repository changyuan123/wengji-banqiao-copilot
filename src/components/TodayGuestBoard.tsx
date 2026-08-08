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
  const [cloudStore, setCloudStore] = useState<boolean | null>(null);
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
          cloudStore?: boolean;
          platform?: { blurb?: string };
        }) => {
          setBags(d.bags ?? []);
          setCloudStore(!!d.cloudStore);
          if (d.platform?.blurb) setPlatformBlurb(d.platform.blurb);
        },
      )
      .catch(() => undefined);
  }, []);

  async function reserve(bagId: string) {
    const c = contact.trim();
    if (c) window.localStorage.setItem("wj_guest_contact", c);
    setBusyId(bagId);
    setToast(null);
    try {
      const res = await fetch("/api/bags/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: getGuestId(),
          bagId,
          contact: c || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "預約失敗");
      const ticket = data.reservation?.ticket as string | undefined;
      const id = data.reservation?.id as string | undefined;
      if (ticket) {
        if (id) window.localStorage.setItem(`wj_bag_ticket_${id}`, ticket);
        router.push(`/bag/ticket?t=${encodeURIComponent(ticket)}`);
        return;
      }
      if (id) {
        router.push(`/bag/${id}`);
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
        .then((d: { bags?: PublicBag[]; cloudStore?: boolean }) => {
          setBags(d.bags ?? []);
          if (typeof d.cloudStore === "boolean") setCloudStore(d.cloudStore);
        })
        .catch(() => undefined);
    }
  }

  const openBags = bags.filter((b) => b.salesOpen);
  const closedBags = bags.filter((b) => !b.salesOpen);

  return (
    <div className="flex flex-col gap-4">
      {cloudStore === false && (
        <div className="rounded-xl border border-[#f0d9a8] bg-[#fff8e8] px-3 py-2 text-[13px] leading-relaxed text-[#6b5348]">
          提醒：網站還沒接雲端記帳本時，貨架資料有時會突然不見。店長請盡快在
          Vercel 接上 Upstash Redis。取袋請掃 QR（較穩）。
        </div>
      )}

      <section
        className="rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#8B0000]">
          惜食平台 · 今晚貨架
        </p>
        <h2 className="mt-1 text-lg font-bold text-[#1a120f]">{platformBlurb}</h2>
        <p className="mt-2 text-[13px] text-[#6b5348]">
          選袋子預約 → 到店給店長掃 QR 取袋並付款。電話無法驗證真假，故不強制填寫。
        </p>
        <label className="mt-3 block text-[12px] font-semibold text-[#6b5348]">
          聯絡方式（選填，無法驗證是否為本人）
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#eadcd4] px-3 py-3 text-[16px]"
            placeholder="可不填；或留手機／LINE 方便店家聯繫"
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
          <p className="mt-2 text-sm text-[#6b5348]">
            請等店長上架。若店長剛上架卻看不到，多半是還沒接雲端資料庫。
          </p>
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
            還可預約 {bag.remaining}／共 {bag.qty} 袋
          </p>

          {pickingId === bag.id ? (
            <div className="mt-4 space-y-2">
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
