import type { Metadata } from "next";
import { store } from "@/data/store";
import { TodayGuestBoard } from "@/components/TodayGuestBoard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `今晚惜食驚喜袋｜惜食平台`,
  description: "今晚惜食驚喜袋貨架。預約後到店取袋付款。",
};

export default function TodayPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col pb-10">
      <header
        className="px-5 pb-5 pt-8 text-white"
        style={{
          background: "linear-gradient(165deg, #8B0000 0%, #5c0000 55%, #3d0000 100%)",
        }}
      >
        <p className="text-[11px] tracking-[0.18em] text-white/75">惜食平台 · 今晚貨架</p>
        <h1
          className="mt-2 font-display text-[1.5rem] font-bold leading-snug"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          今晚惜食驚喜袋
        </h1>
        <p className="mt-2 text-sm text-white/85">
          多家店共用的惜食入口（目前示範：{store.name}
          {store.branch}）。選袋子、留聯絡方式、到店取袋付款。
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
        <TodayGuestBoard />
      </div>
    </main>
  );
}
