import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Clock, AlertTriangle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  addOneShotAlert,
  listOneShotAlerts,
  removeOneShotAlert,
  type OneShotAlert,
} from "@/hooks/useItemAlerts";

const pad = (n: number) => n.toString().padStart(2, "0");

const formatLocal = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;

const defaultTime = () => {
  const d = new Date(Date.now() + 30 * 60_000);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const QUICK_LABELS = [
  "Lanche da tarde",
  "Beber água",
  "Tomar suplemento",
  "Ligar pra Camila",
  "Pausa pra alongar",
];

const beep = () => {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
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

export const OneShotComposer = () => {
  const [label, setLabel] = useState("");
  const [time, setTime] = useState(defaultTime());
  const [alerts, setAlerts] = useState<OneShotAlert[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  const refresh = () => setAlerts(listOneShotAlerts().filter((a) => !a.fired));

  useEffect(() => {
    refresh();
    const id = window.setInterval(() => {
      refresh();
      if (typeof window !== "undefined" && "Notification" in window) {
        setPermission(Notification.permission);
      }
    }, 5_000);
    return () => window.clearInterval(id);
  }, []);

  const handleTestNow = () => {
    if (permission === "granted") {
      try {
        new Notification("🔔 Teste imediato", {
          body: "Se você está vendo isso, as notificações funcionam.",
          icon: "/logo-alfa1000.png",
        });
      } catch {}
    }
    toast("🔔 Teste disparado", {
      description: permission === "granted"
        ? "Notificação + toast + beep enviados."
        : "Sem permissão: só toast + beep funcionam.",
      duration: 6000,
    });
    beep();
  };


  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      toast.error("Digite um rótulo pro alerta");
      return;
    }
    if (!time) {
      toast.error("Escolha um horário");
      return;
    }

    // Build local datetime — assume hoje; se já passou, agenda pra amanhã
    const [hh, mm] = time.split(":").map((s) => parseInt(s, 10));
    const fire = new Date();
    fire.setHours(hh, mm, 0, 0);
    if (fire.getTime() <= Date.now()) {
      fire.setDate(fire.getDate() + 1);
    }

    addOneShotAlert({
      label: trimmed,
      detail: `Lembrete agendado às ${time}`,
      fireAt: formatLocal(fire),
    });

    // Pede permissão se ainda não tem
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const isAmanha = fire.getDate() !== new Date().getDate();
    toast.success(`"${trimmed}" agendado`, {
      description: `${isAmanha ? "Amanhã" : "Hoje"} às ${time}. Mantenha o app aberto.`,
    });
    setLabel("");
    setTime(defaultTime());
    refresh();
  };

  const handleRemove = (id: string, lbl: string) => {
    removeOneShotAlert(id);
    refresh();
    toast(`"${lbl}" removido`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-3 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-primary" />
        <p className="font-mono text-[10px] font-bold tracking-widest text-foreground">
          ALERTA ÚNICO
        </p>
      </div>

      {/* Form */}
      <div className="space-y-2">
        <div>
          <label className="font-mono text-[9px] tracking-widest text-muted-foreground block mb-1">
            RÓTULO
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex.: Lanche da tarde"
            maxLength={60}
            className="w-full px-3 py-2 rounded-md border border-border bg-background/40 text-foreground font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Quick labels */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_LABELS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setLabel(q)}
              className="px-2 py-1 rounded border border-border bg-background/40 font-mono text-[9px] text-muted-foreground hover:text-foreground hover:border-primary/50 active:scale-95 transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        <div>
          <label className="font-mono text-[9px] tracking-widest text-muted-foreground block mb-1">
            HORÁRIO (HOJE OU AMANHÃ SE JÁ PASSOU)
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background/40 text-foreground font-mono text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-primary text-primary-foreground font-mono text-[11px] font-bold tracking-wider active:scale-[0.98] transition-all"
        >
          <Plus size={14} />
          AGENDAR ALERTA
        </button>
      </div>

      {/* Pending list */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border pt-2 space-y-1.5"
          >
            <p className="font-mono text-[9px] tracking-widest text-muted-foreground">
              AGENDADOS ({alerts.length})
            </p>
            {alerts.map((a) => {
              const fireDate = new Date(a.fireAt);
              const isToday = fireDate.toDateString() === new Date().toDateString();
              const timeStr = `${pad(fireDate.getHours())}:${pad(fireDate.getMinutes())}`;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-background/40 border border-border/50"
                >
                  <Bell size={11} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] text-foreground truncate">
                      {a.label}
                    </p>
                    <p className="font-mono text-[9px] text-muted-foreground">
                      {isToday ? "Hoje" : "Amanhã"} · {timeStr}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(a.id, a.label)}
                    className="p-1.5 rounded hover:bg-destructive/10 active:scale-90 transition-all"
                    aria-label="Remover alerta"
                  >
                    <Trash2 size={12} className="text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
