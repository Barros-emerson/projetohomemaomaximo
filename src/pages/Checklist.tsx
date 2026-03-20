import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sun, Droplets, Pill, Dumbbell, Moon, Utensils, Eye, Coffee, Smartphone, Flame } from "lucide-react";

interface CheckItem {
  id: string;
  label: string;
  detail: string;
  icon: React.ElementType;
  section: string;
  time: string;
}

const checklistItems: CheckItem[] = [
  // MANHÃ
  { id: "acordar", label: "Acordar", detail: "Água + sal + café", icon: Coffee, section: "MANHÃ", time: "05:40" },
  { id: "pre_treino", label: "Pré-treino", detail: "Banana + Creatina 5g", icon: Pill, section: "MANHÃ", time: "06:00" },
  { id: "treino", label: "Treino musculação", detail: "Sessão do dia", icon: Dumbbell, section: "MANHÃ", time: "06:50" },
  { id: "sol", label: "Sol pós-treino", detail: "10-20min sem celular", icon: Sun, section: "MANHÃ", time: "08:00" },
  { id: "pos_treino", label: "Pós-treino", detail: "Proteína + carbo + gordura", icon: Utensils, section: "MANHÃ", time: "08:30" },
  // TRABALHO
  { id: "agua_trabalho", label: "Hidratação no trabalho", detail: "Manter garrafão cheio", icon: Droplets, section: "TRABALHO", time: "—" },
  { id: "almoco", label: "Almoço forte", detail: "Proteína + carboidrato complexo", icon: Utensils, section: "TRABALHO", time: "12:00" },
  { id: "lanche", label: "Lanche da tarde", detail: "Frutas ou whey", icon: Utensils, section: "TRABALHO", time: "15:00" },
  // JIU-JITSU
  { id: "pre_jiu", label: "Pré-Jiu", detail: "Banana ou arroz 30min antes", icon: Flame, section: "JIU-JITSU", time: "17:30" },
  { id: "jiu", label: "Treino Jiu-Jitsu", detail: "Sessão completa", icon: Dumbbell, section: "JIU-JITSU", time: "18:00" },
  { id: "pos_jiu", label: "Pós-Jiu", detail: "Proteína + recuperação", icon: Utensils, section: "JIU-JITSU", time: "19:30" },
  // NOITE
  { id: "desacelerar", label: "Desacelerar digital", detail: "Telas off, dopamina resetar", icon: Smartphone, section: "NOITE", time: "22:00" },
  { id: "dormir", label: "Dormir", detail: "Luzes apagadas", icon: Moon, section: "NOITE", time: "22:30" },
];

const sections = ["MANHÃ", "TRABALHO", "JIU-JITSU", "NOITE"];

const sectionColors: Record<string, string> = {
  "MANHÃ": "text-amber-400",
  "TRABALHO": "text-blue-400",
  "JIU-JITSU": "text-cyan-400",
  "NOITE": "text-violet-400",
};

const motivationalPhrases = [
  "O dia começa agora. Cada check é um voto.",
  "Rotina alimentada. Continue no ritmo.",
  "Mais da metade. Você não para no meio.",
  "Quase lá. Disciplina é liberdade.",
  "Protocolo completo. Você é a máquina.",
];

const getPhrase = (pct: number) => {
  if (pct === 0) return motivationalPhrases[0];
  if (pct < 40) return motivationalPhrases[1];
  if (pct < 60) return motivationalPhrases[2];
  if (pct < 100) return motivationalPhrases[3];
  return motivationalPhrases[4];
};

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
    <div className="p-4 space-y-5">
      {/* Progress header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-5 border-glow"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">ROTINA DIÁRIA</p>
          <span className="font-mono text-xs text-primary font-bold">{completedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-3xl font-extrabold text-primary text-glow">{pct}%</span>
          <span className="font-mono text-[10px] text-muted-foreground text-right max-w-[60%] leading-relaxed">
            {getPhrase(pct)}
          </span>
        </div>
      </motion.div>

      {/* Sections */}
      {sections.map((section) => {
        const items = checklistItems.filter((i) => i.section === section);
        const sectionDone = items.filter((i) => checked.has(i.id)).length;

        return (
          <div key={section}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className={`font-mono text-[10px] font-bold tracking-widest ${sectionColors[section]}`}>
                {section}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/50">
                {sectionDone}/{items.length}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-1">
              {items.map((item, i) => {
                const Icon = item.icon;
                const isDone = checked.has(item.id);
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => toggle(item.id)}
                    className={`w-full surface-card px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left active:scale-[0.98] ${
                      isDone ? "opacity-50" : ""
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        isDone ? "bg-primary border-primary" : "border-muted-foreground/30"
                      }`}
                    >
                      <AnimatePresence>
                        {isDone && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Check size={14} className="text-primary-foreground" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <span className="font-mono text-xs text-muted-foreground w-11 shrink-0">
                      {item.time}
                    </span>

                    <Icon size={16} className={isDone ? "text-primary" : "text-muted-foreground"} />

                    <div className="flex-1 min-w-0">
                      <span className={`font-mono text-sm block ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground/60 block">
                        {item.detail}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Checklist;
