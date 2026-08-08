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
        怎麼驗收「限量折價券」？
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[#6b5348]">
        不用看程式碼。請用手機照下面步驟點一點，看流程順不順、哪裡卡住。
        建議準備：一支當「店長」的手機、一支當「客人」的手機（或同一個瀏覽器開兩個分頁也行）。
      </p>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid var(--wj-line)" }}>
        <h2 className="text-lg font-bold">你要測的故事（白話）</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[#1a120f]">
          <li>店長說：雪花牛只剩 3 份，放到系統裡釋出 3 份。</li>
          <li>客人打開今日頁，領走 1 張折價券（手機出現 QR）。</li>
          <li>店長掃那張 QR（或手打 6 碼），系統顯示核銷成功，還剩 2 份。</li>
          <li>同一張券再掃一次 → 應該失敗（已用過）。</li>
          <li>第 4 個客人再領 → 領得到就繼續；領滿 3 張後應該顯示領完了。</li>
        </ol>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid var(--wj-line)" }}>
        <h2 className="text-lg font-bold">逐步操作</h2>
        <ol className="mt-3 list-decimal space-y-4 pl-5 text-[15px] leading-relaxed">
          <li>
            <strong>店長釋出庫存</strong>
            <br />
            打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/">
              商家後台
            </Link>
            → 點「招牌雪花牛」（或任一品項）→ 把份數設成 <strong>3</strong> → 按
            「釋出限量折價券」。
          </li>
          <li>
            <strong>客人領券</strong>
            <br />
            打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/today">
              今日特價頁
            </Link>
            → 按「領取折價券」→ 應跳到一張有大 QR、有 6 碼的券。
          </li>
          <li>
            <strong>店長核銷</strong>
            <br />
            打開{" "}
            <Link className="font-semibold text-[#8B0000] underline" href="/scan">
              掃碼核銷頁
            </Link>
            → 密碼填 <strong>{pin}</strong> → 開相機掃客人 QR，或手打 6 碼 →
            應出現綠色成功，並顯示還剩幾份。
          </li>
          <li>
            <strong>防呆檢查</strong>
            <br />
            同一張券再核銷一次 → 應說已用過。再回今日頁多領幾張，確認不能超過 3 份。
          </li>
        </ol>
      </section>

      <section className="mt-4 rounded-2xl bg-[#fff8f4] p-4" style={{ border: "1px solid var(--wj-line)" }}>
        <h2 className="text-lg font-bold">測的時候請順便記下來</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px] text-[#1a120f]">
          <li>哪一步文字看不懂？</li>
          <li>按鈕會不會太小、要捲太久？</li>
          <li>相機掃不到時，手打 6 碼方不方便？</li>
          <li>成功／失敗提示夠不夠明顯？</li>
          <li>你覺得店長尖峰時段會不會用？</li>
        </ul>
        <p className="mt-3 text-[13px] text-[#6b5348]">
          測完把感覺回報即可（例如：「第 3 步掃碼很慢」「成功畫面不夠大」）。
        </p>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid var(--wj-line)" }}>
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
