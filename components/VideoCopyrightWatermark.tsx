"use client";

import { useEffect, useState } from "react";

/** علامة مائية صغيرة تتنقل على المشغّل (تقليل فعالية حذفها من تسجيل شاشة ثابت) */
export function VideoCopyrightWatermark({ code }: { code: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  const positions = [
    "right-3 top-3",
    "left-3 bottom-16",
    "left-3 top-10",
    "right-3 bottom-20",
    "left-1/2 top-4 -translate-x-1/2",
    "right-1/2 bottom-14 translate-x-1/2",
  ];
  const pos = positions[tick % positions.length];
  return (
    <div
      data-copyright-watermark
      className={`pointer-events-none absolute z-[25] max-w-[min(90%,14rem)] select-none rounded-md border border-white/25 bg-black/60 px-2 py-1.5 text-[10px] font-semibold text-white/95 shadow-lg backdrop-blur-sm sm:text-[11px] ${pos}`}
      dir="rtl"
      aria-hidden
    >
      <div className="text-[9px] font-normal text-white/75">كود حقوق الطبع والنشر</div>
      <div className="font-mono tracking-widest">{code}</div>
    </div>
  );
}
