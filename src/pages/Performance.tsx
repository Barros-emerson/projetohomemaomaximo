import { BarChart3 } from "lucide-react";

const Performance = () => (
  <div className="p-4 space-y-6">
    <div className="surface-card p-5 text-center" style={{ borderColor: "hsl(187 80% 55% / 0.3)" }}>
      <BarChart3 size={32} className="text-cyan-400 mx-auto mb-3" />
      <h2 className="font-mono text-sm font-bold tracking-widest text-foreground">PERFORMANCE</h2>
      <p className="font-mono text-xs text-muted-foreground mt-2">
        Métricas hormonais, evolução e score semanal em breve.
      </p>
    </div>
  </div>
);

export default Performance;
