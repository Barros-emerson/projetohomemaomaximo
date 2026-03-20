import { ClipboardList } from "lucide-react";

const Tarefas = () => (
  <div className="p-4 space-y-6">
    <div className="surface-card p-5 border-glow text-center">
      <ClipboardList size={32} className="text-accent mx-auto mb-3" />
      <h2 className="font-mono text-sm font-bold tracking-widest text-foreground">TAREFAS</h2>
      <p className="font-mono text-xs text-muted-foreground mt-2">
        Gestão de tarefas com prioridades e categorias em breve.
      </p>
    </div>
  </div>
);

export default Tarefas;
