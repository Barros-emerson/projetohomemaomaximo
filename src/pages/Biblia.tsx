import { BookOpen } from "lucide-react";

const Biblia = () => (
  <div className="p-4 space-y-6">
    <div className="surface-card p-5 text-center" style={{ borderColor: "hsl(263 70% 70% / 0.3)" }}>
      <BookOpen size={32} className="text-violet-400 mx-auto mb-3" />
      <h2 className="font-mono text-sm font-bold tracking-widest text-foreground">BÍBLIA & REFLEXÃO</h2>
      <p className="font-mono text-xs text-muted-foreground mt-2">
        Devocional diário, reflexões e plano de leitura em breve.
      </p>
    </div>
  </div>
);

export default Biblia;
