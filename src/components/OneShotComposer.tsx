import { useState, useEffect, useCallback } from "react";
import { Bell, Plus, Trash2, Clock, AlertTriangle, Zap, Smartphone, Send, BellOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  addOneShotAlert,
  listOneShotAlerts,
  removeOneShotAlert,
  type OneShotAlert,
} from "@/hooks/useItemAlerts";
import { supabase } from "@/integrations/supabase/client";
import {
  isPushSupported,
  isInIframe,
  getPushSubscription,
  subscribeThisDevice,
  unsubscribeThisDevice,
  sendTestPush,
} from "@/lib/webPush";

const pad = (n: number) => n.toString().padStart(2, "0");

const defaultTime = () => {
  const d = new Date(Date.now() + 5 * 60_000);
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

interface PendingAlert {
  id: string;
  label: string;
  detail: string;
  fire_at: string;
}

export const OneShotComposer = () => {
  const [label, setLabel] = useState("");
  const [time, setTime] = useState(defaultTime());
  const [localAlerts, setLocalAlerts] = useState<OneShotAlert[]>([]);
  const [serverAlerts, setServerAlerts] = useState<PendingAlert[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );
  const [deviceSubscribed, setDeviceSubscribed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshLocal = () => setLocalAlerts(listOneShotAlerts().filter((a) => !a.fired));

  const refreshServer = useCallback(async () => {
    const { data } = await supabase
      .from("push_alerts_agendados")
      .select("id, label, detail, fire_at")
      .eq("enviado", false)
      .order("fire_at", { ascending: true });
    setServerAlerts((data as PendingAlert[]) || []);
  }, []);

  const refreshDevice = useCallback(async () => {
    if (!isPushSupported() || isInIframe()) {
      setDeviceSubscribed(false);
      return;
    }
    try {
      const sub = await getPushSubscription();
      setDeviceSubscribed(!!sub);
    } catch {
      setDeviceSubscribed(false);
    }
  }, []);

  useEffect(() => {
    refreshLocal();
    refreshServer();
    refreshDevice();
    const id = window.setInterval(() => {
      refreshLocal();
      if ("Notification" in window) setPermission(Notification.permission);
    }, 5_000);
    return () => window.clearInterval(id);
  }, [refreshServer, refreshDevice]);

  const handleSubscribe = async () => {
    setBusy(true);
    const r = await subscribeThisDevice();
    setBusy(false);
    if (r.ok) {
      toast.success("Este device foi inscrito", {
        description: "Agora vai receber push mesmo com o app fechado.",
      });
      refreshDevice();
    } else {
      toast.error("Falha ao inscrever", { description: r.reason });
    }
  };

  const handleUnsubscribe = async () => {
    setBusy(true);
    await unsubscribeThisDevice();
    setBusy(false);
    toast("Device desinscrito");
    refreshDevice();
  };

  const handleTestRealPush = async () => {
    setBusy(true);
    const r = await sendTestPush();
    setBusy(false);
    if (r.ok) {
      toast.success("Push enviado", {
        description: `${r.sent} device(s) recebem agora. Bloqueie o celular e aguarde.`,
      });
    } else {
      toast.error("Falha no envio", { description: r.reason });
    }
  };

  const handleTestLocalToast = () => {
    if (permission === "granted") {
      try {
        new Notification("🔔 Teste local", {
          body: "Notificação local (app aberto).",
          icon: "/logo-alfa1000.png",
        });
      } catch {}
    }
    toast("🔔 Teste local disparado");
    beep();
  };

  const handleAdd = async () => {
    const trimmed = label.trim();
    if (!trimmed) {
      toast.error("Digite um rótulo pro alerta");
      return;
    }
    if (!time) {
      toast.error("Escolha um horário");
      return;
    }

    const [hh, mm] = time.split(":").map((s) => parseInt(s, 10));
    const fire = new Date();
    fire.setHours(hh, mm, 0, 0);
    if (fire.getTime() <= Date.now()) {
      fire.setDate(fire.getDate() + 1);
    }

    // 1) Local fallback (app aberto)
    addOneShotAlert({
      label: trimmed,
      detail: `Lembrete agendado às ${time}`,
      fireAt: `${fire.getFullYear()}-${pad(fire.getMonth() + 1)}-${pad(fire.getDate())}T${pad(fire.getHours())}:${pad(fire.getMinutes())}`,
    });

    // 2) Servidor (Web Push em background)
    const { error } = await supabase.from("push_alerts_agendados").insert({
      label: trimmed,
      detail: `Lembrete agendado às ${time}`,
      fire_at: fire.toISOString(),
    });

    if (error) {
      toast.error("Salvo só localmente", { description: error.message });
    } else {
      const isAmanha = fire.getDate() !== new Date().getDate();
      toast.success(`"${trimmed}" agendado`, {
        description: `${isAmanha ? "Amanhã" : "Hoje"} às ${time}. Funciona com app fechado.`,
      });
    }

    setLabel("");
    setTime(defaultTime());
    refreshLocal();
    refreshServer();
  };

  const handleRemoveServer = async (id: string, lbl: string) => {
    await supabase.from("push_alerts_agendados").delete().eq("id", id);
    toast(`"${lbl}" removido`);
    refreshServer();
  };

  const handleRemoveLocal = (id: string, lbl: string) => {
    removeOneShotAlert(id);
    refreshLocal();
    toast(`"${lbl}" removido (local)`);
  };

  const inIframe = isInIframe();
  const supported = isPushSupported();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-3 space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary" />
          <p className="font-mono text-[10px] font-bold tracking-widest text-foreground">
            ALERTA ÚNICO (PUSH REAL)
          </p>
        </div>
      </div>

      {/* DEVICE STATUS */}
      <div className="rounded-md border border-border bg-background/40 p-2.5 space-y-2">
        <div className="flex items-center gap-2">
          <Smartphone size={12} className="text-primary" />
          <p className="font-mono text-[10px] font-bold tracking-widest text-foreground">
            ESTE DEVICE
          </p>
        </div>

        {!supported && (
          <p className="font-mono text-[9px] text-destructive">
            Navegador sem suporte a Web Push.
          </p>
        )}
        {supported && inIframe && (
          <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
            Web Push em background só funciona fora do preview. Abra a URL publicada ou instale o app na tela inicial.
          </p>
        )}
        {supported && !inIframe && (
          <>
            {deviceSubscribed === null && (
              <p className="font-mono text-[9px] text-muted-foreground">Verificando…</p>
            )}
            {deviceSubscribed === false && (
              <button
                onClick={handleSubscribe}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground font-mono text-[11px] font-bold tracking-wider active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Bell size={12} />
                INSCREVER ESTE DEVICE
              </button>
            )}
            {deviceSubscribed === true && (
              <div className="space-y-1.5">
                <p className="font-mono text-[9px] text-primary">
                  ✅ Inscrito. Receberá push com app fechado e celular bloqueado.
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={handleTestRealPush}
                    disabled={busy}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded border border-primary/40 bg-primary/10 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send size={10} className="text-primary" />
                    <span className="font-mono text-[9px] font-bold tracking-wider text-primary">
                      TESTAR PUSH REAL
                    </span>
                  </button>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={busy}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded border border-border bg-background/40 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <BellOff size={10} className="text-muted-foreground" />
                    <span className="font-mono text-[9px] font-bold tracking-wider text-muted-foreground">
                      DESINSCREVER
                    </span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleTestLocalToast}
          className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded border border-border bg-background/30 active:scale-95 transition-all"
        >
          <Zap size={10} className="text-muted-foreground" />
          <span className="font-mono text-[9px] tracking-wider text-muted-foreground">
            TESTAR LOCAL (APP ABERTO)
          </span>
        </button>
      </div>

      {/* Permission warning */}
      {permission === "denied" && (
        <div className="flex items-start gap-2 px-2.5 py-2 rounded-md border border-destructive/40 bg-destructive/10">
          <AlertTriangle size={12} className="text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-mono text-[10px] font-bold text-destructive">
              NOTIFICAÇÕES BLOQUEADAS
            </p>
            <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
              Desbloqueie em: ícone do cadeado na URL → Notificações → Permitir. Depois recarregue.
            </p>
          </div>
        </div>
      )}

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

      {/* Server pending list */}
      <AnimatePresence>
        {serverAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border pt-2 space-y-1.5"
          >
            <p className="font-mono text-[9px] tracking-widest text-muted-foreground">
              AGENDADOS NO SERVIDOR ({serverAlerts.length})
            </p>
            {serverAlerts.map((a) => {
              const fireDate = new Date(a.fire_at);
              const isToday = fireDate.toDateString() === new Date().toDateString();
              const timeStr = `${pad(fireDate.getHours())}:${pad(fireDate.getMinutes())}`;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-background/40 border border-border/50"
                >
                  <Bell size={11} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] text-foreground truncate">{a.label}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">
                      {isToday ? "Hoje" : fireDate.toLocaleDateString("pt-BR")} · {timeStr}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveServer(a.id, a.label)}
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

      {/* Local-only fallback */}
      <AnimatePresence>
        {localAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border pt-2 space-y-1.5"
          >
            <p className="font-mono text-[9px] tracking-widest text-muted-foreground">
              FALLBACK LOCAL ({localAlerts.length})
            </p>
            {localAlerts.map((a) => {
              const fireDate = new Date(a.fireAt);
              const isToday = fireDate.toDateString() === new Date().toDateString();
              const timeStr = `${pad(fireDate.getHours())}:${pad(fireDate.getMinutes())}`;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-background/30 border border-border/30"
                >
                  <Bell size={11} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] text-muted-foreground truncate">{a.label}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">
                      {isToday ? "Hoje" : "Amanhã"} · {timeStr}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveLocal(a.id, a.label)}
                    className="p-1.5 rounded hover:bg-destructive/10 active:scale-90 transition-all"
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
