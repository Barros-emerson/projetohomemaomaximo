import { StickyNote } from "lucide-react";

const Notas = () => (
  <div className="p-4 space-y-6">
    <div className="surface-card p-5 border-glow text-center">
      <StickyNote size={32} className="text-primary mx-auto mb-3" />
      <h2 className="font-mono text-sm font-bold tracking-widest text-foreground">NOTAS</h2>
      <p className="font-mono text-xs text-muted-foreground mt-2">
        Editor de notas rápidas com categorias em breve.
      </p>
    </div>
  </div>
);

export default Notas;
