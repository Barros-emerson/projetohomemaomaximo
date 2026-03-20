import { motion } from "framer-motion";
import {
  CheckSquare,
  Dumbbell,
  Moon,
  Sun,
  Droplets,
  TrendingUp,
  Zap,
} from "lucide-react";

const pillars = [
  { name: "Checklist", icon: CheckSquare, weight: 35, score: 28, color: "text-primary" },
  { name: "Treino", icon: Dumbbell, weight: 25, score: 20, color: "text-primary" },
  { name: "Sono", icon: Moon, weight: 20, score: 14, color: "text-score-medium" },
  { name: "Sol", icon: Sun, weight: 10, score: 8, color: "text-primary" },
  { name: "Hidratação", icon: Droplets, weight: 10, score: 10, color: "text-primary" },
];

const totalScore = pillars.reduce((acc, p) => acc + p.score, 0);
const maxScore = 100;

const getScoreColor = (score: number) => {
  if (score >= 85) return "text-score-excellent";
  if (score >= 70) return "text-score-good";
  if (score >= 50) return "text-score-medium";
  if (score >= 30) return "text-score-low";
  return "text-score-critical";
};

const dailyFlow = [
  { time: "05:40", task: "Acordar + Sol", done: true },
  { time: "06:00", task: "Treino Musculação", done: true },
  { time: "07:30", task: "Primeira refeição", done: true },
  { time: "10:00", task: "Hidratação 1L", done: false },
  { time: "12:00", task: "Almoço protocolo", done: false },
  { time: "15:00", task: "Treino Jiu-Jitsu", done: false },
  { time: "19:00", task: "Última refeição", done: false },
  { time: "21:00", task: "Rotina do sono", done: false },
  { time: "22:30", task: "Apagar luzes", done: false },
];

const Dashboard = () => {
  return (
    <div className="p-4 space-y-6">
      {/* Score Principal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="surface-card p-6 text-center border-glow"
      >
        <p className="font-mono text-xs text-muted-foreground tracking-widest mb-2">SCORE SEMANAL</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className={`font-mono font-extrabold text-6xl ${getScoreColor(totalScore)} text-glow`}>
            {totalScore}
          </span>
          <span className="font-mono text-lg text-muted-foreground">/{maxScore}</span>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <TrendingUp size={14} className="text-primary" />
          <span className="font-mono text-xs text-primary">+5 vs semana anterior</span>
        </div>
      </motion.div>

      {/* Pilares */}
      <div>
        <h2 className="font-mono text-xs text-muted-foreground tracking-widest mb-3 px-1">PILARES</h2>
        <div className="grid grid-cols-5 gap-2">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            const pct = Math.round((p.score / p.weight) * 100);
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="surface-card p-3 flex flex-col items-center gap-2"
              >
                <Icon size={18} className={p.color} />
                <span className={`font-mono text-lg font-bold ${p.color}`}>{p.score}</span>
                <div className="w-full bg-secondary rounded-full h-1">
                  <div
                    className="bg-primary h-1 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] text-muted-foreground tracking-wider">
                  {p.name.toUpperCase()}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fluxo do Dia */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Zap size={14} className="text-accent" />
          <h2 className="font-mono text-xs text-muted-foreground tracking-widest">FLUXO DO DIA</h2>
        </div>
        <div className="space-y-1">
          {dailyFlow.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`surface-card px-4 py-3 flex items-center gap-3 ${
                item.done ? "opacity-60" : ""
              }`}
            >
              <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">
                {item.time}
              </span>
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                item.done ? "bg-primary" : "bg-secondary"
              }`} />
              <span className={`font-mono text-sm ${
                item.done ? "line-through text-muted-foreground" : "text-foreground"
              }`}>
                {item.task}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
