import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Dumbbell, TrendingUp, BookOpen, Target } from "lucide-react";
import EvolucaoRelatorio from "@/components/perfil/EvolucaoRelatorio";
import EvolucaoCarga from "@/components/treino/EvolucaoCarga";
import TreinoComparativo from "@/components/treino/TreinoComparativo";
import DevocionalEvolucao from "@/components/biblia/DevocionalEvolucao";

const ABAS = [
  { id: "corporal", label: "CORPORAL", icon: TrendingUp },
  { id: "treino",   label: "TREINO",   icon: Dumbbell },
  { id: "espiritual", label: "ESPIRITUAL", icon: BookOpen },
];

const Performance = () => {
  const [abaAtiva, setAbaAtiva] = useState("corporal");

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
          <BarChart3 size={20} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="font-mono text-sm font-extrabold tracking-wider text-foreground">
            PERFORMANCE
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Evolução corporal, treino e espiritual
          </p>
        </div>
      </motion.div>

      {/* Meta Testo destaque */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="surface-card p-4 flex items-center gap-4"
        style={{ borderColor: "hsl(270 55% 65% / 0.3)" }}
      >
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
          <Target size={20} className="text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="font-mono text-[10px] text-violet-400 tracking-widest">META TESTOSTERONA</p>
          <p className="font-mono text-2xl font-black text-foreground">1.000 <span className="text-sm font-normal text-muted-foreground">ng/dL</span></p>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
            Atualize o valor em Perfil → Painel Hormonal para ver a evolução
          </p>
        </div>
      </motion.div>

      {/* Abas */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {ABAS.map((aba) => {
          const Icon = aba.icon;
          const isActive = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-[10px] font-bold tracking-wider transition-all active:scale-95 ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <Icon size={12} />
              {aba.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo das abas */}
      <motion.div
        key={abaAtiva}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {abaAtiva === "corporal" && <EvolucaoRelatorio />}
        {abaAtiva === "treino" && (
          <div className="space-y-4">
            <TreinoComparativo />
            <EvolucaoCarga />
          </div>
        )}
        {abaAtiva === "espiritual" && <DevocionalEvolucao />}
      </motion.div>
    </div>
  );
};

export default Performance;
