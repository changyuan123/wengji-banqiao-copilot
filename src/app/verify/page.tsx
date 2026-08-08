import Link from "next/link";
import { store } from "@/data/store";
import { defaultMerchantPin } from "@/lib/coupon-store";

export const dynamic = "force-dynamic";

export default function VerifyPage() {
  const pin = defaultMerchantPin();

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[560px] px-4 pb-12 pt-8">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8B0000]">
        給非工程背景的驗證清單
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold text-[#1a120f]">
        怎麼確認「修好了」？
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[#6b5348]">
        不用看程式。用手機照下面點一點就好。最好準備兩支手機（一支當店長、一支當客人），或同一個瀏覽器開兩個分頁。
      </p>

      <section
        className="mt-6 rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">一、先測店長相機（最重要）</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[#1a120f]">
          <li>
            用手機打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/scan">
              掃碼核銷頁
            </Link>
            。
          </li>
          <li>密碼填 <strong>{pin}</strong>。</li>
          <li>按「開啟相機掃碼」→ 瀏覽器問你要不要開相機時選「允許」。</li>
          <li>
            <strong>成功樣子：</strong>畫面會出現鏡頭即時畫面（不是一片黑）。
          </li>
          <li>若打不開：改用手打券上的 6 碼，也算核銷成功。</li>
        </ol>
      </section>

      <section
        className="mt-4 rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">二、測「不只雪花牛」也能用</h2>
        <p className="mt-2 text-[14px] text-[#6b5348]">
          以前容易只測雪花牛。這次請一次選好幾樣，確認每樣都能領、能核銷。
        </p>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-[#1a120f]">
          <li>
            打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/">
              商家後台
            </Link>
            ，一次點選例如：
            <strong>招牌雪花牛、水蓮、三記蝦餃</strong>
            （或其他你想測的菜），每樣份數填 <strong>2</strong>。
          </li>
          <li>按「釋出限量折價券」。</li>
          <li>
            打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/today">
              今日特價頁
            </Link>
            → 應看到剛剛選的每一樣都能按「領取折價券」。
          </li>
          <li>每樣各領一張 → 手機出現大 QR 和 6 碼。</li>
          <li>
            店長到掃碼頁：用相機掃 QR（或手打 6 碼）→ 出現綠色成功，並顯示還剩幾份。
          </li>
          <li>同一張券再掃一次 → 應說已經用過了。</li>
        </ol>
      </section>

      <section
        className="mt-4 rounded-2xl bg-[#fff8f4] p-4"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">怎樣算「修好了」？</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px] text-[#1a120f]">
          <li>店長頁一按就能看到相機畫面。</li>
          <li>掃客人 QR（或手打 6 碼）會出現綠色成功。</li>
          <li>雪花牛以外的菜（水蓮、蝦餃等）也能領券、也能核銷。</li>
        </ul>
        <p className="mt-3 text-[13px] text-[#6b5348]">
          若後台有黃色提醒「還沒接雲端記帳本」，代表正式營業前還要在 Vercel 接上
          Upstash Redis，否則有時會突然找不到剛剛釋出的份數。
        </p>
      </section>

      <section
        className="mt-4 rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">快速連結</h2>
        <ul className="mt-2 space-y-2 text-[15px]">
          <li>
            <Link className="text-[#8B0000] underline" href="/">
              商家後台（釋出份數）
            </Link>
          </li>
          <li>
            <Link className="text-[#8B0000] underline" href="/today">
              客人今日頁（領券）
            </Link>
          </li>
          <li>
            <Link className="text-[#8B0000] underline" href="/scan">
              店長掃碼核銷
            </Link>
          </li>
        </ul>
        <p className="mt-3 text-[12px] text-[#6b5348]">
          {store.fullName} · {store.address}
        </p>
      </section>
    </main>
  );
}
