/** WebKit + standard Fullscreen API helpers (Safari needs webkit* variants). */
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type WebKitElement = HTMLElement & {
  webkitMatchesSelector?: (selectors: string) => boolean;
};

export function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export async function exitFullscreenSafe(): Promise<void> {
  const doc = document as FullscreenDocument;
  try {
    if (doc.fullscreenElement && doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    }
  } catch {
    /* ignore */
  }
}

/** Portal target: native fullscreen element, or Plyr fallback container. */
export function getFullscreenPortalTarget(playerContainer: Element | null | undefined): Element | null {
  const docTarget = getFullscreenElement();
  if (docTarget) return docTarget;
  if (!(playerContainer instanceof HTMLElement)) return null;
  const webkitEl = playerContainer as WebKitElement;
  if (
    playerContainer.classList.contains("plyr--fullscreen-fallback") ||
    playerContainer.classList.contains("plyr--fullscreen-active") ||
    playerContainer.matches(":fullscreen") ||
    (typeof webkitEl.webkitMatchesSelector === "function" &&
      webkitEl.webkitMatchesSelector(":-webkit-full-screen"))
  ) {
    return playerContainer;
  }
  return null;
}
