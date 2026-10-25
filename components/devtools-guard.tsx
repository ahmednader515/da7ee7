"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DevToolsBlocker } from "@/components/dev-tools-blocker";
import { useDevToolsDetect } from "@/hooks/use-dev-tools-detect";

const LAST_PATH_KEY = "devtools:last-path";
const WARNING_PATH = "/devtools-warning";

function saveCurrentPath() {
  try {
    sessionStorage.setItem(
      LAST_PATH_KEY,
      window.location.pathname +
        window.location.search +
        window.location.hash,
    );
  } catch {
    // Storage can be unavailable.
  }
}

export function DevToolsGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const isWarningPage = pathname?.startsWith(WARNING_PATH);

  useEffect(() => {
    if (!pathname || isWarningPage) return;
    saveCurrentPath();
  }, [pathname, isWarningPage]);

  const handleDetect = useCallback(() => {
    if (isWarningPage) return;

    saveCurrentPath();
    router.push(WARNING_PATH);
  }, [isWarningPage, router]);

  useDevToolsDetect(handleDetect, pathname ?? "");

  return <DevToolsBlocker />;
}
