import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "已改為惜食特價｜翁記板橋店",
  description: "競品動態已收斂，請使用首頁惜食特價推播",
  robots: { index: false, follow: false },
};

/** 產品轉向惜食特價後，競品頁改為導回主流程 */
export default function RadarPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col justify-center gap-4 px-5 py-10">
      <h1
        className="font-display text-xl font-bold text-[#1a120f]"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        產品已改為「惜食特價推播」
      </h1>
      <p className="text-sm leading-relaxed text-[#6b5348]">
        我們不再主打店家互看競品。請用首頁：點菜單按鈕 → 產限時特價文 → 推播惜食群。服務在
        Vercel 雲端，手機即可操作。
      </p>
      <Link
        href="/"
        className="rounded-2xl bg-[#8B0000] px-4 py-3.5 text-center text-sm font-bold text-white"
      >
        回到惜食特價首頁
      </Link>
    </main>
  );
}
