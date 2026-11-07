"use client";

import { useEffect } from "react";

function shouldRefuse(): boolean {
  if (typeof window === "undefined") return true;
  if (window.top !== window.self) return true;
  if (window.location.hostname === "localhost") return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (shouldRefuse()) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) =>
          regs.forEach((r) => {
            if (r.active?.scriptURL.endsWith("/sw.js")) r.unregister();
          }),
        )
        .catch(() => {});
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  }, []);
  return null;
}