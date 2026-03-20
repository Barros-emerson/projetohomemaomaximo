import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sun, Droplets, Pill, Dumbbell, Moon, Utensils, Eye } from "lucide-react";

interface CheckItem {
  id: string;
  label: string;
  icon: React.ElementType;
  category: string;
  time: string;
}

const checklistItems: CheckItem[] = [
  { id: "sol_manha", label: "Exposição solar manhã (10-20min)", icon: Sun, category: "SOL", time: "05:40" },
  { id: "agua_1", label: "Água: 1º litro", icon: Droplets, category: "HIDRATAÇÃO", time: "06:00" },
  { id: "suplemento_manha", label: "Suplementos manhã", icon: Pill, category: "SUPLEMENTAÇÃO", time: "06:00" },
  { id: "treino_musculacao", label: "Treino musculação", icon: Dumbbell, category: "TREINO", time: "06:00" },
  { id: "refeicao_1", label: "Refeição 1 - Pós-treino", icon: Utensils, category: "DIETA", time: "07:30" },
  { id: "agua_2", label: "Água: 2º litro", icon: Droplets, category: "HIDRATAÇÃO", time: "10:00" },
  { id: "refeicao_2", label: "Refeição 2 - Almoço protocolo", icon: Utensils, category: "DIETA", time: "12:00" },
  { id: "treino_jiujitsu", label: "Treino Jiu-Jitsu", icon: Dumbbell, category: "TREINO", time: "15:00" },
  { id: "agua_3", label: "Água: 3º litro", icon: Droplets, category: "HIDRATAÇÃO", time: "15:00" },
  { id: "refeicao_3", label: "Refeição 3 - Jantar", icon: Utensils, category: "DIETA", time: "19:00" },
  { id: "bloqueio_luz", label: "Bloqueio de luz azul", icon: Eye, category: "SONO", time: "20:00" },
  { id: "suplemento_noite", label: "Suplementos noite (Mg + Zn)", icon: Pill, category: "SUPLEMENTAÇÃO", time: "21:00" },
  { id: "rotina_sono", label: "Rotina de sono iniciada", icon: Moon, category: "SONO", time: "21:00" },
  { id: "apagar_luzes", label: "Luzes apagadas - dormir", icon: Moon, category: "SONO", time: "22:30" },
];

const Checklist = () => {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedCount = checked.size;
  const totalCount = checklistItems.length;
  const pct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-4 space-y-6">
      {/* Progress header */}
      <div className="surface-card p-5 border-glow">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">CHECKLIST DIÁRIO</p>
          <span className="font-mono text-xs text-primary">{completedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="font-mono text-2xl font-bold text-primary mt-3 text-glow">{pct}%</p>
      </div>

      {/* Checklist items */}
      <div className="space-y-1.5">
        {checklistItems.map((item, i) => {
          const Icon = item.icon;
          const isDone = checked.has(item.id);
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => toggle(item.id)}
              className={`w-full surface-card px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left ${
                isDone ? "opacity-50" : ""
              }`}
            >
              <div
                className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  isDone
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30"
                }`}
              >
                <AnimatePresence>
                  {isDone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check size={14} className="text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">
                {item.time}
              </span>

              <Icon size={16} className={isDone ? "text-primary" : "text-muted-foreground"} />

              <div className="flex-1 min-w-0">
                <span className={`font-mono text-sm block ${
                  isDone ? "line-through text-muted-foreground" : "text-foreground"
                }`}>
                  {item.label}
                </span>
              </div>

              <span className="font-mono text-[9px] text-muted-foreground/50 tracking-wider shrink-0">
                {item.category}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Checklist;
