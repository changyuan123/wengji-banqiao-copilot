import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "已改為今日特價網頁｜翁記板橋店",
  robots: { index: false, follow: false },
};

export default function RadarPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col justify-center gap-4 px-5 py-10">
      <h1 className="text-xl font-bold text-[#1a120f]">產品已改為「今日特價網頁」</h1>
      <p className="text-sm leading-relaxed text-[#6b5348]">
        不再使用 LINE 推播當主通道。店長在後台發布特價，客人打開／today
        或專屬連結即可查看與轉傳。
      </p>
      <Link
        href="/today"
        className="rounded-2xl bg-[#8B0000] px-4 py-3.5 text-center text-sm font-bold text-white"
      >
        看今日特價頁
      </Link>
      <Link href="/" className="text-center text-sm font-medium text-[#8B0000]">
        商家後台
      </Link>
    </main>
  );
}
