import { Dumbbell, Plus } from "lucide-react";

const Treino = () => (
  <div className="p-4 space-y-6">
    <div className="surface-card p-5 border-glow text-center">
      <Dumbbell size={32} className="text-primary mx-auto mb-3" />
      <h2 className="font-mono text-sm font-bold tracking-widest text-foreground">TREINO</h2>
      <p className="font-mono text-xs text-muted-foreground mt-2">
        Módulo de Musculação e Jiu-Jitsu em breve.
      </p>
    </div>
    <button className="w-full surface-card px-4 py-4 flex items-center justify-center gap-2 text-primary font-mono text-sm font-medium tracking-wider hover:bg-secondary transition-colors">
      <Plus size={18} />
      REGISTRAR TREINO
    </button>
  </div>
);

export default Treino;
