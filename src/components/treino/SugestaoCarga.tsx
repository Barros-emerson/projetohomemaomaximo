import { motion } from "framer-motion";
import { Brain, AlertTriangle, TrendingUp } from "lucide-react";

interface Props {
  estimated1RM: number;
  targetPct: number;
  calculatedLoad: number;
  suggestedLoad: number;
  isChestExercise: boolean;
  weekNumber: number;
}

const SugestaoCarga = ({ estimated1RM, targetPct, calculatedLoad, suggestedLoad, isChestExercise, weekNumber }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-2 rounded-lg bg-secondary/50 border border-border p-2.5 space-y-1.5"
    >
      <div className="flex items-center gap-1.5">
        <Brain size={11} className="text-primary" />
        <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
          CARGA SUGERIDA · SEMANA {weekNumber}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <div className="text-center">
          <p className="font-mono text-[8px] text-muted-foreground">1RM Est.</p>
          <p className="font-mono text-xs font-bold text-foreground">{estimated1RM}<span className="text-[8px] text-muted-foreground">kg</span></p>
        </div>
        <div className="text-center">
          <p className="font-mono text-[8px] text-muted-foreground">Alvo</p>
          <p className="font-mono text-xs font-bold text-foreground">{Math.round(targetPct * 100)}%</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-[8px] text-muted-foreground">Calculado</p>
          <p className="font-mono text-xs font-bold text-foreground">{calculatedLoad}<span className="text-[8px] text-muted-foreground">kg</span></p>
        </div>
        <div className="text-center">
          <p className="font-mono text-[8px] text-muted-foreground">Usar</p>
          <p className="font-mono text-sm font-black text-primary">{suggestedLoad}<span className="text-[8px] text-muted-foreground">kg</span></p>
        </div>
      </div>

      {isChestExercise && (
        <div className="flex items-center gap-1 mt-1">
          <AlertTriangle size={10} className="text-amber-400" />
          <span className="font-mono text-[8px] text-amber-400">
            Progressão controlada devido à recuperação muscular
          </span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <TrendingUp size={9} className="text-muted-foreground" />
        <span className="font-mono text-[8px] text-muted-foreground italic">
          Baseado no seu histórico recente
        </span>
      </div>
    </motion.div>
  );
};

export default SugestaoCarga;
