"use client";

import { useEffect } from "react";

export function DevToolsBlocker() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      const blocked =
        key === "f12" ||
        (event.ctrlKey &&
          event.shiftKey &&
          ["i", "j", "c"].includes(key)) ||
        (event.ctrlKey && key === "u") ||
        (event.metaKey && event.altKey && key === "i");

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener(
        "contextmenu",
        handleContextMenu,
        true,
      );
    };
  }, []);

  return null;
}
