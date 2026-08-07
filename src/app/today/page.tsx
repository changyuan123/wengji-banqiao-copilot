import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/data/store";
import { loadLatestDeal, payloadToView, siteOrigin } from "@/lib/today-deal";
import { TodayDealCard } from "@/components/TodayDealCard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `今日惜食特價｜${store.name}`,
  description: "翁記麻辣鍋板橋店今日限時特價。打開連結即可查看，歡迎轉傳給朋友。",
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
        <p className="text-[11px] tracking-[0.18em] text-white/75">今日特價黑板 · 免費公開</p>
        <h1
          className="mt-2 font-display text-[1.5rem] font-bold leading-snug"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          翁記今晚惜食特價
        </h1>
        <p className="mt-2 text-sm text-white/85">
          打開就能看、轉傳給朋友也行。不用加 LINE。
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
        {deal ? (
          <TodayDealCard deal={deal} shareUrl={shareUrl} />
        ) : (
          <section
            className="rounded-2xl bg-white p-5 shadow-sm"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            <h2 className="text-base font-semibold text-[#1a120f]">目前還沒有今日特價</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5348]">
              請向店家索取最新連結，或掃描店內 QR。店長在後台按「發布」後，這裡就會更新。
            </p>
            <p className="mt-3 text-sm text-[#1a120f]">
              電話 {store.phone}
              <br />
              {store.address}
            </p>
          </section>
        )}

        <Link
          href="/"
          className="text-center text-[12px] font-medium text-[#8B0000] underline-offset-2 hover:underline"
        >
          我是店長 → 商家後台
        </Link>
      </div>
    </main>
  );
}
