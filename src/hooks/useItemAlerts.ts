import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { rotinaSemanal } from "@/data/rotina-diaria";

// Per-item alert config: minutes before (0 = off)
const STORAGE_KEY = "ham-item-alerts-v1";
const FIRED_KEY = "ham-item-alerts-fired-v1"; // {date}:{itemId}:{minutes}

export type AlertConfig = Record<string, number>; // itemId -> minutes before (0 = off)

export const ALERT_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Desligado" },
  { value: 5, label: "5 min antes" },
  { value: 10, label: "10 min antes" },
  { value: 15, label: "15 min antes" },
  { value: 30, label: "30 min antes" },
  { value: 60, label: "1 h antes" },
];

const loadConfig = (): AlertConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveConfig = (cfg: AlertConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {}
};

const loadFired = (): Set<string> => {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    if (!raw) return new Set();
    const obj = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    // Reset if not today
    if (obj.date !== today) return new Set();
    return new Set<string>(obj.ids || []);
  } catch {
    return new Set();
  }
};

const persistFired = (ids: Set<string>) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(FIRED_KEY, JSON.stringify({ date: today, ids: [...ids] }));
  } catch {}
};

const parseTime = (t: string): number | null => {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1]) * 60 + parseInt(m[2]);
};

const beep = () => {
  try {
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
};

const notify = (title: string, body: string) => {
  if (typeof window === "undefined") return;
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: "/favicon.ico" });
    } catch {}
  }
};

/**
 * Hook to manage per-item alerts.
 * - Persists user preferences to localStorage
 * - Polls every 30s and fires a notification + toast + beep
 *   `minutes` before the item's scheduled time
 * - Each (date, item, minutes) only fires once per day
 */
export const useItemAlerts = (todayIdx: number) => {
  const [config, setConfig] = useState<AlertConfig>(() => loadConfig());
  const firedRef = useRef<Set<string>>(loadFired());

  const setItemAlert = useCallback((itemId: string, minutes: number) => {
    setConfig((prev) => {
      const next = { ...prev };
      if (minutes <= 0) delete next[itemId];
      else next[itemId] = minutes;
      saveConfig(next);
      return next;
    });
  }, []);

  // Request notification permission once when user enables an alert
  useEffect(() => {
    const hasAny = Object.values(config).some((v) => v > 0);
    if (!hasAny) return;
    if (typeof window === "undefined") return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, [config]);

  // Polling tick
  useEffect(() => {
    const day = rotinaSemanal[todayIdx];
    if (!day) return;

    const tick = () => {
      const cfg = loadConfig(); // re-read (in case other tab changed)
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const today = now.toISOString().slice(0, 10);

      day.items.forEach((item) => {
        const before = cfg[item.id];
        if (!before || before <= 0) return;
        const target = parseTime(item.time);
        if (target === null) return;
        const triggerAt = target - before;
        // Fire when within [triggerAt, triggerAt + 1] minute window
        if (nowMins >= triggerAt && nowMins <= triggerAt + 1) {
          const key = `${today}:${item.id}:${before}`;
          if (firedRef.current.has(key)) return;
          firedRef.current.add(key);
          persistFired(firedRef.current);
          const msg = `${item.label} em ${before} min · ${item.time}`;
          toast(msg, { description: item.detail, duration: 8000 });
          notify("Lembrete de rotina", msg);
          beep();
        }
      });
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [todayIdx]);

  return { config, setItemAlert };
};
