import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@/data/store";
import { decodeTodayToken, payloadToView, siteOrigin } from "@/lib/today-deal";
import { TodayDealCard } from "@/components/TodayDealCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const deal = payloadToView(decodeTodayToken(token) ?? { v: 1, at: "", ids: [] });
  return {
    title: deal ? `今日惜食｜${deal.items.map((i) => i.name).slice(0, 3).join("、")}` : "今日惜食特價",
    description: "翁記麻辣鍋板橋店限時特價，歡迎轉傳。",
  };
}

export default async function TodaySharePage({ params }: Props) {
  const { token } = await params;
  const payload = decodeTodayToken(token);
  const deal = payload ? payloadToView(payload) : null;
  if (!deal) notFound();

  const shareUrl = `${siteOrigin()}${deal.sharePath}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col pb-10">
      <header
        className="px-5 pb-5 pt-8 text-white"
        style={{
          background: "linear-gradient(165deg, #8B0000 0%, #5c0000 55%, #3d0000 100%)",
        }}
      >
        <p className="text-[11px] tracking-[0.18em] text-white/75">可轉傳的特價連結</p>
        <h1
          className="mt-2 font-display text-[1.5rem] font-bold leading-snug"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          翁記今晚惜食特價
        </h1>
        <p className="mt-2 text-sm text-white/85">{store.fullName}</p>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
        <TodayDealCard deal={deal} shareUrl={shareUrl} />
        <Link
          href="/today"
          className="text-center text-[12px] font-medium text-[#6b5348] underline-offset-2 hover:underline"
        >
          查看目前最新特價頁
        </Link>
      </div>
    </main>
  );
}
