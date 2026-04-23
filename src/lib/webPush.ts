// Helpers para subscrever este device em Web Push e disparar tests/sync.
import { supabase } from "@/integrations/supabase/client";

const SW_PATH = "/push-sw.js";

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buf = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};

export const isPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

let cachedReg: ServiceWorkerRegistration | null = null;

export const ensurePushSW = async (): Promise<ServiceWorkerRegistration> => {
  if (cachedReg) return cachedReg;
  // Try existing registration first
  const existing = await navigator.serviceWorker.getRegistration(SW_PATH);
  if (existing) {
    cachedReg = existing;
    return existing;
  }
  const reg = await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
  await navigator.serviceWorker.ready;
  cachedReg = reg;
  return reg;
};

export const getPushSubscription = async (): Promise<PushSubscription | null> => {
  if (!isPushSupported()) return null;
  const reg = await ensurePushSW();
  return reg.pushManager.getSubscription();
};

export const subscribeThisDevice = async (): Promise<{
  ok: boolean;
  reason?: string;
  endpoint?: string;
}> => {
  if (!isPushSupported()) return { ok: false, reason: "Navegador sem suporte" };
  if (isInIframe()) return { ok: false, reason: "Abra fora do preview (URL publicada / app instalado)" };

  // Permission
  if (Notification.permission !== "granted") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, reason: "Permissão negada" };
  }

  // Public key
  const { data: cfg, error: cfgErr } = await supabase.functions.invoke("push-config");
  if (cfgErr || !cfg?.publicKey) {
    return { ok: false, reason: "VAPID public key indisponível" };
  }

  const reg = await ensurePushSW();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(cfg.publicKey),
    });
  }

  const json: any = sub.toJSON();
  const ua = navigator.userAgent;
  const device_label =
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Android/.test(ua) ? "Android" :
    /Mac/.test(ua) ? "Mac" :
    /Windows/.test(ua) ? "Windows" : "Web";

  const { error } = await supabase.functions.invoke("push-subscribe", {
    body: {
      endpoint: json.endpoint,
      keys: json.keys,
      device_label,
    },
  });

  if (error) return { ok: false, reason: error.message };
  return { ok: true, endpoint: json.endpoint };
};

export const unsubscribeThisDevice = async (): Promise<boolean> => {
  const sub = await getPushSubscription();
  if (!sub) return true;
  await sub.unsubscribe();
  return true;
};

export const sendTestPush = async (): Promise<{ ok: boolean; sent?: number; reason?: string }> => {
  const { data, error } = await supabase.functions.invoke("push-send-due", {
    body: { test: true, title: "🔔 Teste real", body: "Web Push em background funcionando." },
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true, sent: data?.sent ?? 0 };
};
