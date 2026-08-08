"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type RedeemOk = {
  message: string;
  remainingAfterRedeem: number;
  coupon: { itemName: string; shortCode: string };
};

export function ScanRedeemApp() {
  const [pin, setPin] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("wj_merchant_pin") || "5919";
  });
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastOk, setLastOk] = useState<RedeemOk | null>(null);
  const [scanOn, setScanOn] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScanRef = useRef(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("wj_merchant_pin", pin);
  }, [pin]);

  async function redeem(raw: string) {
    const code = extractCouponRef(raw);
    if (!code) {
      showToast("讀不到折價券，請再試一次");
      return;
    }
    if (busy) return;
    setBusy(true);
    setLastOk(null);
    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "核銷失敗");
      setLastOk({
        message: data.message,
        remainingAfterRedeem: data.remainingAfterRedeem,
        coupon: data.coupon,
      });
      showToast("核銷成功");
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(80);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "核銷失敗");
    } finally {
      setBusy(false);
    }
  }

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanOn(false);
  }, []);

  async function startCamera() {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanOn(true);
    } catch {
      setCamError("打不開相機。請改用手打 6 碼券號，或允許瀏覽器使用相機。");
      setScanOn(false);
    }
  }

  useEffect(() => {
    if (!scanOn) return;
    let cancelled = false;
    let timer: number | undefined;

    async function tick() {
      if (cancelled) return;
      const video = videoRef.current;
      const Detector = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (s: ImageBitmapSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      if (video && Detector && video.readyState >= 2) {
        try {
          const detector = new Detector({ formats: ["qr_code"] });
          const codes = await detector.detect(video);
          const now = Date.now();
          if (codes[0]?.rawValue && now - lastScanRef.current > 2500) {
            lastScanRef.current = now;
            await redeem(codes[0].rawValue);
          }
        } catch {
          /* ignore frame errors */
        }
      }
      timer = window.setTimeout(tick, 500);
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanOn]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const supportsDetector = useMemo(() => {
    if (typeof window === "undefined") return false;
    return "BarcodeDetector" in window;
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col pb-10">
      <header
        className="px-5 pb-5 pt-8 text-white"
        style={{
          background: "linear-gradient(165deg, #8B0000 0%, #5c0000 55%, #3d0000 100%)",
        }}
      >
        <p className="text-[11px] tracking-[0.18em] text-white/75">店長專用</p>
        <h1 className="mt-2 font-display text-[1.55rem] font-bold">掃碼核銷折價券</h1>
        <p className="mt-2 text-sm text-white/85">
          客人出示手機 QR → 你一掃就扣一份庫存。也可手打 6 碼。
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid var(--wj-line)" }}>
          <label className="text-[12px] font-semibold text-[#6b5348]">店長密碼</label>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputMode="numeric"
            className="mt-1 w-full rounded-xl border border-[#eadcd4] px-3 py-3 text-[16px]"
            placeholder="預設 5919"
          />
          <p className="mt-1 text-[11px] text-[#6b5348]">預設是電話後四碼 5919（之後可改）</p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid var(--wj-line)" }}>
          <h2 className="text-base font-bold">① 用相機掃 QR</h2>
          {!supportsDetector && (
            <p className="mt-2 text-[13px] text-[#6b5348]">
              你的瀏覽器可能不支援直接掃碼，請改用手打 6 碼，或用 Chrome／Safari 最新版。
            </p>
          )}
          {scanOn ? (
            <div className="mt-3 overflow-hidden rounded-xl bg-black">
              <video ref={videoRef} playsInline muted className="max-h-[320px] w-full object-cover" />
            </div>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="mt-3 w-full rounded-xl bg-[#8B0000] py-3.5 text-[15px] font-bold text-white"
            >
              開啟相機掃碼
            </button>
          )}
          {scanOn && (
            <button
              type="button"
              onClick={stopCamera}
              className="mt-2 w-full rounded-xl border border-[#eadcd4] py-3 text-sm font-semibold"
            >
              關閉相機
            </button>
          )}
          {camError && <p className="mt-2 text-[13px] text-[#8B0000]">{camError}</p>}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid var(--wj-line)" }}>
          <h2 className="text-base font-bold">② 手打 6 碼券號</h2>
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            className="mt-2 w-full rounded-xl border border-[#eadcd4] px-3 py-3 text-center text-[22px] tracking-[0.3em]"
            placeholder="000000"
          />
          <button
            type="button"
            disabled={busy || manual.length !== 6}
            onClick={() => redeem(manual)}
            className="mt-3 w-full rounded-xl bg-[#8B0000] py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
          >
            {busy ? "核銷中…" : "確認核銷"}
          </button>
        </section>

        {lastOk && (
          <section
            className="rounded-2xl p-4 text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #1f7a4c, #14603a)" }}
          >
            <p className="text-[12px] text-white/80">剛剛核銷成功</p>
            <p className="mt-1 text-xl font-bold">{lastOk.coupon.itemName}</p>
            <p className="mt-2 text-sm">{lastOk.message}</p>
            <p className="mt-2 text-2xl font-bold">還剩 {lastOk.remainingAfterRedeem} 份</p>
          </section>
        )}

        <div className="grid grid-cols-2 gap-2 text-center text-[13px]">
          <Link href="/" className="rounded-xl bg-white py-3 font-semibold text-[#8B0000]" style={{ border: "1px solid var(--wj-line)" }}>
            回商家後台
          </Link>
          <Link href="/verify" className="rounded-xl bg-white py-3 font-semibold text-[#8B0000]" style={{ border: "1px solid var(--wj-line)" }}>
            驗證流程說明
          </Link>
        </div>
      </div>

      {toast && (
        <div className="anim-toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1a120f] px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}
    </main>
  );
}

function extractCouponRef(raw: string): string | null {
  const text = raw.trim();
  if (/^\d{6}$/.test(text)) return text;
  try {
    const u = new URL(text);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("coupon");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  } catch {
    /* not url */
  }
  const m = text.match(/coupon\/([a-zA-Z0-9_]+)/);
  if (m?.[1]) return m[1];
  if (text.startsWith("cpn_")) return text;
  return null;
}
