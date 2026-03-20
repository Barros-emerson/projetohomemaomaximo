import { Settings } from "lucide-react";

const Config = () => (
  <div className="p-4 space-y-6">
    <div className="surface-card p-5 border-glow text-center">
      <Settings size={32} className="text-primary mx-auto mb-3" />
      <h2 className="font-mono text-sm font-bold tracking-widest text-foreground">CONFIGURAÇÕES</h2>
      <p className="font-mono text-xs text-muted-foreground mt-2">
        Configurações do protocolo em breve.
      </p>
    </div>
  </div>
);

export default Config;
