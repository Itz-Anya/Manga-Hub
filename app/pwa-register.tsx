"use client";

import { useEffect } from "react";

const REFUSE_HOST_PATTERNS = [
  /^id-preview--/,
  /^preview--/,
  /(^|\.)lovableproject\.com$/,
  /(^|\.)lovableproject-dev\.com$/,
  /(^|\.)beta\.lovable\.dev$/,
  /localhost$/,
];

function shouldRefuse(): boolean {
  if (typeof window === "undefined") return true;
  if (window.top !== window.self) return true;
  const host = window.location.hostname;
  if (REFUSE_HOST_PATTERNS.some((p) => p.test(host))) return true;
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