import Link from "next/link";
import { store } from "@/data/store";
import { defaultMerchantPin } from "@/lib/surprise-bag";

export const dynamic = "force-dynamic";

export default function VerifyPage() {
  const pin = defaultMerchantPin();

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[560px] px-4 pb-12 pt-8">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8B0000]">
        給非工程背景的驗證清單
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold text-[#1a120f]">
        怎麼確認「驚喜袋」流程？
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[#6b5348]">
        新模式很像 Too Good To Go：店長上架今晚袋子 → 客人預約 → 到店取袋付款。
        建議兩支手機（店長／客人）或兩個分頁。
      </p>

      <section
        className="mt-6 rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">一、店長上架（你決定價錢與時段）</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>
            打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/">
              商家後台
            </Link>
          </li>
          <li>填今晚幾袋、每袋多少錢（例如 5 袋、每袋 $199）</li>
          <li>填取餐時段、停止預約時間</li>
          <li>從菜單清楚勾選會進袋的菜（給資料庫；客人看不到細項）</li>
          <li>客人說明可留白或寫模糊版 → 按「上架今晚驚喜袋」</li>
        </ol>
      </section>

      <section
        className="mt-4 rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">二、客人預約</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>
            打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/today">
              今晚惜食頁
            </Link>
          </li>
          <li>應看到袋價、模糊說明、取餐時段（不要出現完整菜名清單）</li>
          <li>按「預約今晚這一袋」→ 出現 QR 與 6 碼</li>
        </ol>
      </section>

      <section
        className="mt-4 rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">三、店長取袋收款</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>
            打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/scan">
              掃碼取袋
            </Link>
            ，密碼 <strong>{pin}</strong>
          </li>
          <li>開相機掃 QR（或手打 6 碼）→ 綠色成功 → 向客人收袋價</li>
          <li>同一張再掃 → 應說已取過</li>
        </ol>
      </section>

      <section
        className="mt-4 rounded-2xl bg-[#fff8f4] p-4"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">怎樣算成功？</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px]">
          <li>袋價、袋數、時段都是店長填的</li>
          <li>客人只看到模糊說明，有驚喜感</li>
          <li>店長後台有清楚菜名（資料有留下）</li>
          <li>掃碼取袋成功，並記得收款</li>
        </ul>
      </section>

      <p className="mt-6 text-[12px] text-[#6b5348]">
        {store.fullName} · {store.address}
      </p>
    </main>
  );
}
