"use client";

import { useEffect, useRef } from "react";

/** Slow random drift of the copyright code across the player. */
export function VideoCopyrightWatermark({ code }: { code: string }) {
  const codeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = codeRef.current;
    const box = el?.parentElement;
    if (!el || !box) return;

    let x = 8 + Math.random() * 40;
    let y = 10 + Math.random() * 40;
    let angle = Math.random() * Math.PI * 2;
    let nextTurn = 4 + Math.random() * 6;
    const speed = 1.15;
    let raf = 0;
    let last = performance.now();

    const place = () => {
      el.style.left = `${x}%`;
      el.style.top = `${y}%`;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      nextTurn -= dt;
      if (nextTurn <= 0) {
        angle += (Math.random() - 0.5) * Math.PI * 1.4;
        nextTurn = 6 + Math.random() * 8;
      }

      const bw = box.clientWidth || 1;
      const bh = box.clientHeight || 1;
      const maxX = Math.max(4, 100 - (el.offsetWidth / bw) * 100 - 3);
      const maxY = Math.max(6, 100 - (el.offsetHeight / bh) * 100 - 4);

      x += Math.cos(angle) * speed * dt;
      y += Math.sin(angle) * speed * dt;

      if (x <= 3 || x >= maxX) {
        x = Math.min(maxX, Math.max(3, x));
        const inward = x <= 3 ? 0 : Math.PI;
        angle = inward + (Math.random() - 0.5) * 1.4;
      }
      if (y <= 6 || y >= maxY) {
        y = Math.min(maxY, Math.max(6, y));
        const inward = y <= 6 ? Math.PI / 2 : -Math.PI / 2;
        angle = inward + (Math.random() - 0.5) * 1.4;
      }

      place();
      raf = requestAnimationFrame(frame);
    };

    place();
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      data-copyright-watermark
      className="copyright-watermark pointer-events-none absolute inset-0 z-[25] overflow-hidden select-none"
      aria-hidden
    >
      <span ref={codeRef} className="copyright-watermark-code" dir="ltr">
        {code}
      </span>
    </div>
  );
}
