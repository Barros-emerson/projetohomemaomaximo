import { Settings } from "lucide-react";
import { NotificationsSetup } from "@/components/NotificationsSetup";
import { OneShotComposer } from "@/components/OneShotComposer";

const Config = () => (
  <div className="p-4 space-y-4">
    <div className="surface-card p-5 border-glow text-center">
      <Settings size={28} className="text-primary mx-auto mb-2" />
      <h2 className="font-mono text-sm font-bold tracking-widest text-foreground">CONFIGURAÇÕES</h2>
      <p className="font-mono text-[11px] text-muted-foreground mt-1">
        Notificações, instalação e alertas únicos.
      </p>
    </div>

    <NotificationsSetup />
    <OneShotComposer />
  </div>
);

export default Config;
