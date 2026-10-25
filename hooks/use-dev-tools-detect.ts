"use client";

import { useEffect, useRef } from "react";

export function useDevToolsDetect(
  onDetect: () => void,
  resetKey?: string,
) {
  const hasDetectedRef = useRef(false);
  const lastOpenSeenAtRef = useRef<number | null>(null);

  useEffect(() => {
    const isMobileLike =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    if (isMobileLike) return;

    if (resetKey !== undefined) {
      hasDetectedRef.current = false;
      lastOpenSeenAtRef.current = null;
    }

    const notifyOnce = () => {
      if (hasDetectedRef.current) return;

      hasDetectedRef.current = true;
      lastOpenSeenAtRef.current = Date.now();
      onDetect();
    };

    const detectSizeDiff = () => {
      const devtoolsOpen =
        window.outerWidth - window.innerWidth > 160 ||
        window.outerHeight - window.innerHeight > 160;

      if (devtoolsOpen) {
        notifyOnce();
        return;
      }

      const detectedAt = lastOpenSeenAtRef.current;

      if (
        hasDetectedRef.current &&
        detectedAt !== null &&
        Date.now() - detectedAt > 2000
      ) {
        hasDetectedRef.current = false;
        lastOpenSeenAtRef.current = null;
      }
    };

    const sizeInterval = window.setInterval(detectSizeDiff, 500);

    let worker: Worker | null = null;
    let workerUrl: string | null = null;
    let lastWorkerTick = Date.now();

    if (typeof Worker !== "undefined") {
      try {
        const workerCode = `
          const tick = () => {
            const start = Date.now();
            debugger;
            const delta = Date.now() - start;

            postMessage({ type: "tick", delta });
            setTimeout(tick, 1000);
          };

          tick();
        `;

        const blob = new Blob([workerCode], {
          type: "application/javascript",
        });

        workerUrl = URL.createObjectURL(blob);
        worker = new Worker(workerUrl);

        worker.onmessage = (event: MessageEvent) => {
          lastWorkerTick = Date.now();

          const delta = event.data?.delta;

          if (typeof delta === "number" && delta > 100) {
            notifyOnce();
          }
        };

        // Stop watching a failed worker to avoid a stale watchdog.
        worker.onerror = () => {
          worker?.terminate();
          worker = null;
        };
      } catch {
        // Continue with window-size detection if workers are unavailable.
        worker?.terminate();
        worker = null;

        if (workerUrl) {
          URL.revokeObjectURL(workerUrl);
          workerUrl = null;
        }
      }
    }

    const workerWatchdog = window.setInterval(() => {
      if (worker && Date.now() - lastWorkerTick > 1500) {
        notifyOnce();
      }
    }, 500);

    return () => {
      window.clearInterval(sizeInterval);
      window.clearInterval(workerWatchdog);
      worker?.terminate();

      if (workerUrl) {
        URL.revokeObjectURL(workerUrl);
      }
    };
  }, [onDetect, resetKey]);
}
