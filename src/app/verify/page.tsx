import Link from "next/link";
import { store } from "@/data/store";
import { defaultMerchantPin } from "@/lib/surprise-bag";

export const dynamic = "force-dynamic";

export default function VerifyPage() {
  const pin = defaultMerchantPin();

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[560px] px-4 pb-12 pt-8">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8B0000]">
        驗證清單（白話）
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold">今晚驚喜袋怎麼測？</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[#6b5348]">
        建議兩支手機：一支店長、一支客人。
      </p>

      <section
        className="mt-6 rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">店長</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>
            打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/">
              商家後台
            </Link>
          </li>
          <li>袋數、價錢用鍵盤直接打數字（可整格刪掉重打）</li>
          <li>上架第一種袋子後，再上架第二種（貨架可多種）</li>
          <li>模糊說明不用自己寫，系統依勾選自動產生</li>
          <li>「停止新預約」不會取消已預約的客人</li>
        </ol>
      </section>

      <section
        className="mt-4 rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">客人</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>
            打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/today">
              今晚貨架
            </Link>
            （不應看到店長按鈕）
          </li>
          <li>先填手機或 LINE</li>
          <li>選一種袋子預約 → 出現 QR 與 6 碼</li>
        </ol>
      </section>

      <section
        className="mt-4 rounded-2xl bg-white p-4 shadow-sm"
        style={{ border: "1px solid var(--wj-line)" }}
      >
        <h2 className="text-lg font-bold">取袋</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>
            店長打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/scan">
              掃碼取袋
            </Link>
            ，密碼 <strong>{pin}</strong>
          </li>
          <li>掃客人 QR，或手打客人頁上的 6 碼（不要打店長密碼）</li>
          <li>成功後向客人收袋價</li>
        </ol>
      </section>

      <p className="mt-6 text-[13px] text-[#6b5348]">
        訂閱方案：NT${store.subscriptionPrice}／{store.subscriptionMonths} 個月
      </p>
    </main>
  );
}
