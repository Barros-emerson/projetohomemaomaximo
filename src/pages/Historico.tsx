import { History } from "lucide-react";

const Historico = () => (
  <div className="p-4 space-y-6">
    <div className="surface-card p-5 border-glow text-center">
      <History size={32} className="text-primary mx-auto mb-3" />
      <h2 className="font-mono text-sm font-bold tracking-widest text-foreground">HISTÓRICO</h2>
      <p className="font-mono text-xs text-muted-foreground mt-2">
        Visualização de histórico e tendências em breve.
      </p>
    </div>
  </div>
);

export default Historico;
