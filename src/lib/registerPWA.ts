// Registers the PWA service worker. Skips registration inside iframes
// (Lovable preview) to avoid stale content & navigation issues.
export const registerPWA = async () => {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // Skip inside iframes (e.g., Lovable preview)
  try {
    if (window.self !== window.top) return;
  } catch {
    return;
  }

  // Skip on lovable preview hosts
  const host = window.location.hostname;
  if (host.includes("lovableproject.com") || host.includes("id-preview")) return;

  try {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({ immediate: true });
  } catch (err) {
    console.warn("[PWA] register failed", err);
  }
};
