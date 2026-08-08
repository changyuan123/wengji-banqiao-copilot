import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/data/store";
import { loadLatestDeal, payloadToView, siteOrigin } from "@/lib/today-deal";
import { TodayGuestBoard } from "@/components/TodayGuestBoard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `今晚惜食驚喜袋｜${store.name}`,
  description: "翁記麻辣鍋板橋店今晚惜食驚喜袋。預約後到店取袋付款。",
};

export default async function TodayPage() {
  const latest = await loadLatestDeal();
  const deal = latest ? payloadToView(latest) : null;
  const origin = siteOrigin();
  const shareUrl = deal ? `${origin}${deal.sharePath}` : `${origin}/today`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col pb-10">
      <header
        className="px-5 pb-5 pt-8 text-white"
        style={{
          background: "linear-gradient(165deg, #8B0000 0%, #5c0000 55%, #3d0000 100%)",
        }}
      >
        <p className="text-[11px] tracking-[0.18em] text-white/75">今晚惜食 · 驚喜袋</p>
        <h1
          className="mt-2 font-display text-[1.5rem] font-bold leading-snug"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          翁記今晚惜食驚喜袋
        </h1>
        <p className="mt-2 text-sm text-white/85">
          先預約一袋 → 在時段內到店取袋並付款。內容保留一點驚喜。
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
        <TodayGuestBoard
          boardDeal={
            deal
              ? {
                  at: deal.at,
                  text: deal.text,
                  address: deal.address,
                  phone: deal.phone,
                  items: deal.items,
                }
              : null
          }
          shareUrl={shareUrl}
        />

        <div className="grid grid-cols-2 gap-2 text-center text-[12px]">
          <Link
            href="/"
            className="rounded-xl bg-white py-3 font-medium text-[#8B0000]"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            我是店長 → 後台
          </Link>
          <Link
            href="/scan"
            className="rounded-xl bg-white py-3 font-medium text-[#8B0000]"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            店長掃碼取袋
          </Link>
        </div>
      </div>
    </main>
  );
}
