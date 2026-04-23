import { Bell, Download, Check, Smartphone } from "lucide-react";
import { useNotificationPermission, useInstallPrompt } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import { toast } from "sonner";

/**
 * Compact banner shown on Checklist page so the user can:
 * 1) Grant notification permission
 * 2) Install the app to home screen (PWA)
 *
 * Auto-hides if both done. On iOS (no install prompt), shows manual instructions.
 */
export const NotificationsSetup = () => {
  const { permission, request } = useNotificationPermission();
  const { canInstall, installed, promptInstall } = useInstallPrompt();

  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const notifGranted = permission === "granted";
  const notifBlocked = permission === "denied";

  // Hide entirely if everything is set up & no action available
  if (notifGranted && (installed || (!canInstall && !isIOS))) return null;

  const handleNotif = async () => {
    const r = await request();
    if (r === "granted") {
      toast.success("Notificações ativadas", {
        description: "Você receberá os lembretes da rotina.",
      });
      // Test notification
      try {
        new Notification("Tudo certo! 🔔", {
          body: "Os alertas vão chegar aqui.",
          icon: "/logo-alfa1000.png",
        });
      } catch {}
    } else if (r === "denied") {
      toast.error("Notificações bloqueadas", {
        description: "Habilite manualmente nas configurações do navegador.",
      });
    }
  };

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted") {
      toast.success("App instalado!", {
        description: "Abra pelo ícone na tela inicial.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-3 space-y-2"
    >
      <div className="flex items-center gap-2">
        <Bell size={14} className="text-primary" />
        <p className="font-mono text-[10px] font-bold tracking-widest text-foreground">
          ALERTAS NO CELULAR
        </p>
      </div>

      <div className="space-y-1.5">
        {/* Notification permission */}
        {!notifGranted && (
          <button
            onClick={handleNotif}
            disabled={notifBlocked || permission === "unsupported"}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-background/40 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-left">
              <Bell size={14} className="text-primary shrink-0" />
              <span className="font-mono text-[11px] text-foreground">
                {notifBlocked
                  ? "Notificações bloqueadas no navegador"
                  : permission === "unsupported"
                    ? "Navegador não suporta notificações"
                    : "Ativar notificações"}
              </span>
            </div>
            {!notifBlocked && permission !== "unsupported" && (
              <span className="font-mono text-[10px] text-primary">ATIVAR</span>
            )}
          </button>
        )}
        {notifGranted && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-background/40">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-500" />
              <span className="font-mono text-[11px] text-muted-foreground">
                Notificações ativas
              </span>
            </div>
          </div>
        )}

        {/* Install PWA */}
        {!installed && canInstall && (
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-background/40 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2 text-left">
              <Download size={14} className="text-primary shrink-0" />
              <span className="font-mono text-[11px] text-foreground">
                Instalar app na tela inicial
              </span>
            </div>
            <span className="font-mono text-[10px] text-primary">INSTALAR</span>
          </button>
        )}

        {/* iOS instructions (no install prompt available) */}
        {!installed && !canInstall && isIOS && (
          <div className="px-3 py-2 rounded-md bg-background/40 space-y-1">
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-primary" />
              <span className="font-mono text-[11px] text-foreground">
                Instalar no iPhone
              </span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              Toque em <span className="text-foreground">Compartilhar</span> →{" "}
              <span className="text-foreground">Adicionar à Tela de Início</span>.
              Notificações funcionam após instalar (iOS 16.4+).
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
