"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type RedeemOk = {
  message: string;
  remainingAfterRedeem: number;
  coupon: { itemName: string; shortCode: string };
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
};

type JsQRFn = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
) => { data: string } | null;

declare global {
  interface Window {
    jsQR?: JsQRFn;
  }
}

async function loadJsQR(): Promise<JsQRFn | null> {
  if (typeof window === "undefined") return null;
  if (typeof window.jsQR === "function") return window.jsQR;
  try {
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-wj-jsqr="1"]',
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("jsQR load failed")),
          { once: true },
        );
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
      script.async = true;
      script.dataset.wjJsqr = "1";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("jsQR load failed"));
      document.head.appendChild(script);
    });
    return typeof window.jsQR === "function" ? window.jsQR : null;
  } catch {
    return null;
  }
}

function getBarcodeDetector():
  | (new (options: { formats: string[] }) => BarcodeDetectorLike)
  | null {
  if (typeof window === "undefined") return null;
  const Detector = (
    window as unknown as {
      BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike;
    }
  ).BarcodeDetector;
  return Detector ?? null;
}

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
  const [camStarting, setCamStarting] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [scanHint, setScanHint] = useState("對準客人手機上的 QR");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScanRef = useRef(0);
  const busyRef = useRef(false);
  const pinRef = useRef(pin);

  useEffect(() => {
    pinRef.current = pin;
  }, [pin]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("wj_merchant_pin", pin);
  }, [pin]);

  const redeem = useCallback(
    async (raw: string) => {
      const code = extractPickupRef(raw);
      if (!code) {
        showToast("讀不到預約碼，請再試一次");
        return;
      }
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setLastOk(null);
      try {
        const res = await fetch("/api/bags/pickup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, pin: pinRef.current }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "取袋失敗");
        setLastOk({
          message: data.message,
          remainingAfterRedeem: data.remainingAfterPickup,
          coupon: {
            itemName: data.reservation?.publicTitle || "驚喜袋",
            shortCode: data.reservation?.shortCode || "",
          },
        });
        showToast("取袋成功 · 請向客人收款");
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(80);
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : "取袋失敗");
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [showToast],
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    setScanOn(false);
    setCamStarting(false);
    setScanHint("對準客人手機上的 QR");
  }, []);

  const startCamera = useCallback(async () => {
    setCamError(null);
    setCamStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("這個瀏覽器沒有相機功能");
      }

      // 先把畫面區塊打開，讓 <video> 掛上 DOM，再接鏡頭（否則畫面會是黑的）
      setScanOn(true);
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        throw new Error("相機畫面還沒準備好，請再按一次");
      }

      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.muted = true;
      await video.play();
      setScanHint("鏡頭已開啟，請對準 QR");
    } catch (e) {
      stopCamera();
      const msg =
        e instanceof Error && e.message
          ? e.message
          : "打不開相機。請允許瀏覽器使用相機，或改用手打 6 碼。";
      setCamError(
        /NotAllowedError|Permission|許可|允許/i.test(String(e))
          ? "你按了拒絕相機。請到瀏覽器設定允許相機，或改用手打 6 碼。"
          : msg,
      );
    } finally {
      setCamStarting(false);
    }
  }, [stopCamera]);

  // 持續從畫面讀 QR（有內建掃碼就用內建；沒有就用網路小工具 jsQR）
  useEffect(() => {
    if (!scanOn) return;
    let cancelled = false;
    let timer: number | undefined;
    let detector: BarcodeDetectorLike | null = null;
    let jsQR: JsQRFn | null = null;

    const Detector = getBarcodeDetector();
    if (Detector) {
      try {
        detector = new Detector({ formats: ["qr_code"] });
      } catch {
        detector = null;
      }
    }

    async function ensureJsQR() {
      if (detector || jsQR) return;
      jsQR = await loadJsQR();
      if (!cancelled && !detector && !jsQR) {
        setScanHint("此手機掃碼較弱，請改用手打下方 6 碼");
      } else if (!cancelled && jsQR) {
        setScanHint("鏡頭已開啟，請對準 QR");
      }
    }

    void ensureJsQR();

    async function tick() {
      if (cancelled) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        try {
          let raw: string | null = null;

          if (detector) {
            const codes = await detector.detect(video);
            raw = codes[0]?.rawValue ?? null;
          } else {
            if (!jsQR) {
              jsQR = await loadJsQR();
            }
            if (jsQR) {
              const canvas = canvasRef.current;
              if (canvas) {
                const w = video.videoWidth || 640;
                const h = video.videoHeight || 480;
                if (w > 0 && h > 0) {
                  canvas.width = w;
                  canvas.height = h;
                  const ctx = canvas.getContext("2d", { willReadFrequently: true });
                  if (ctx) {
                    ctx.drawImage(video, 0, 0, w, h);
                    const image = ctx.getImageData(0, 0, w, h);
                    const result = jsQR(image.data, image.width, image.height);
                    raw = result?.data ?? null;
                  }
                }
              }
            }
          }

          const now = Date.now();
          if (raw && now - lastScanRef.current > 2500) {
            lastScanRef.current = now;
            await redeem(raw);
          }
        } catch {
          /* ignore frame errors */
        }
      }
      timer = window.setTimeout(tick, 350);
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [scanOn, redeem]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col pb-10">
      <header
        className="px-5 pb-5 pt-8 text-white"
        style={{
          background: "linear-gradient(165deg, #8B0000 0%, #5c0000 55%, #3d0000 100%)",
        }}
      >
        <p className="text-[11px] tracking-[0.18em] text-white/75">店長專用</p>
        <h1 className="mt-2 font-display text-[1.55rem] font-bold">掃碼取袋</h1>
        <p className="mt-2 text-sm text-white/85">
          客人出示預約 QR → 你一掃確認取袋，並當場收取袋價。也可手打 6 碼。
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
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

        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-bold">① 用相機掃取袋 QR</h2>
          <p className="mt-2 text-[13px] text-[#6b5348]">
            請用手機瀏覽器打開此頁，並允許使用相機。若掃不到，改用手打下方 6 碼即可。
          </p>

          {/* video 一直留在畫面上，只是關掉時藏起來，避免接不上鏡頭 */}
          <div
            className={`mt-3 overflow-hidden rounded-xl bg-black ${
              scanOn ? "block" : "hidden"
            }`}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="max-h-[320px] w-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" aria-hidden />
          </div>

          {scanOn && (
            <p className="mt-2 text-center text-[13px] font-semibold text-[#1f7a4c]">
              {scanHint}
            </p>
          )}

          {!scanOn ? (
            <button
              type="button"
              onClick={() => void startCamera()}
              disabled={camStarting}
              className="mt-3 w-full rounded-xl bg-[#8B0000] py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
            >
              {camStarting ? "開啟中…" : "開啟相機掃碼"}
            </button>
          ) : (
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

        <section
          className="rounded-2xl bg-white p-4 shadow-sm"
          style={{ border: "1px solid var(--wj-line)" }}
        >
          <h2 className="text-base font-bold">② 手打 6 碼（備援）</h2>
          <p className="mt-1 text-[12px] text-[#6b5348]">
            請優先掃客人 QR。沒接雲端資料庫時，手打 6 碼常常會失敗。
          </p>
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
            onClick={() => void redeem(manual)}
            className="mt-3 w-full rounded-xl bg-[#8B0000] py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
          >
            {busy ? "確認中…" : "確認取袋並收款"}
          </button>
        </section>

        {lastOk && (
          <section
            className="rounded-2xl p-4 text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #1f7a4c, #14603a)" }}
          >
            <p className="text-[12px] text-white/80">剛剛取袋成功</p>
            <p className="mt-1 text-xl font-bold">{lastOk.coupon.itemName}</p>
            <p className="mt-2 text-sm">{lastOk.message}</p>
            <p className="mt-2 text-2xl font-bold">還可出 {lastOk.remainingAfterRedeem} 袋</p>
          </section>
        )}

        <div className="grid grid-cols-2 gap-2 text-center text-[13px]">
          <Link
            href="/"
            className="rounded-xl bg-white py-3 font-semibold text-[#8B0000]"
            style={{ border: "1px solid var(--wj-line)" }}
          >
            回商家後台
          </Link>
          <Link
            href="/verify"
            className="rounded-xl bg-white py-3 font-semibold text-[#8B0000]"
            style={{ border: "1px solid var(--wj-line)" }}
          >
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

function extractPickupRef(raw: string): string | null {
  const text = raw.trim();
  if (text.includes(".") && text.length > 40 && !text.includes("://")) {
    return text;
  }
  if (/^\d{6}$/.test(text)) return text;
  try {
    const u = new URL(text);
    const t = u.searchParams.get("t");
    if (t) return decodeURIComponent(t);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("bag");
    if (idx >= 0 && parts[idx + 1] && parts[idx + 1] !== "ticket") {
      return parts[idx + 1];
    }
  } catch {
    /* not url */
  }
  const mTicket = text.match(/[?&]t=([^&#]+)/);
  if (mTicket?.[1]) {
    try {
      return decodeURIComponent(mTicket[1]);
    } catch {
      return mTicket[1];
    }
  }
  const m = text.match(/bag\/([a-zA-Z0-9_]+)/);
  if (m?.[1]) return m[1];
  if (text.startsWith("bres_")) return text;
  return null;
}
