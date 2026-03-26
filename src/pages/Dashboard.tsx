import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Dumbbell,
  Moon,
  Sun,
  Droplets,
  Zap,
  BookOpen,
  ChevronRight,
  Flame,
  GlassWater,
  RefreshCw,
} from "lucide-react";
import { rotinaSemanal } from "@/data/rotina-diaria";
import { weekPlan } from "@/data/treino-plano";
import { versiculosMemorizacao, planosDisponiveis } from "@/data/biblia-planos";
import { getFraseHoje } from "@/data/frases-poder";

const getTodayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

const getWeekOfYear = () => Math.ceil(((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);

const getPillarScores = (checklistPct: number, treinoPct: number) => [
  { name: "Checklist", icon: CheckSquare, weight: 35, score: Math.round(35 * checklistPct / 100), color: "hsl(38 92% 60%)" },
  { name: "Treino", icon: Dumbbell, weight: 25, score: Math.round(25 * treinoPct / 100), color: "hsl(0 80% 65%)" },
  { name: "Sono", icon: Moon, weight: 20, score: 0, color: "hsl(215 75% 60%)" },
  { name: "Sol", icon: Sun, weight: 10, score: 0, color: "hsl(38 92% 60%)" },
  { name: "Hidratação", icon: Droplets, weight: 10, score: 0, color: "hsl(152 60% 52%)" },
];

const getChecklistPct = (dayIdx: number): number => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(`ham-checklist-${dayIdx}-${dateStr}`);
    if (!saved) return 0;
    const checkedItems: string[] = JSON.parse(saved);
    const totalItems = rotinaSemanal[dayIdx].items.length;
    return totalItems > 0 ? Math.round((checkedItems.length / totalItems) * 100) : 0;
  } catch { return 0; }
};

const getTreinoPct = (dayIdx: number): number => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(`ham-treino-sets-${dayIdx}-${dateStr}`);
    if (!saved) return 0;
    const parsed = JSON.parse(saved);
    const doneSets = Object.values(parsed).reduce((a: number, v: any) => a + (Array.isArray(v) ? v.length : 0), 0);
    const totalSets = weekPlan[dayIdx].exercises.reduce((a, e) => a + parseInt(e.sets), 0);
    return totalSets > 0 ? Math.round(((doneSets as number) / totalSets) * 100) : 0;
  } catch { return 0; }
};

const getBibliaPct = (): number => {
  try {
    const saved = localStorage.getItem("ham-biblia-leituras");
    if (!saved) return 0;
    const leituras = JSON.parse(saved);
    const planoId = "salmos-proverbios";
    const plano = leituras[planoId];
    if (!plano || !Array.isArray(plano)) return 0;
    const done = plano.filter((l: any) => l.concluido).length;
    return Math.round((done / plano.length) * 100);
  } catch { return 0; }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Re-read localStorage periodically for live updates
  const getTodayI = () => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; };
  const [checklistPct, setChecklistPct] = useState(() => getChecklistPct(getTodayI()));
  const [treinoPct, setTreinoPct] = useState(() => getTreinoPct(getTodayI()));
  const [bibliaPct, setBibliaPct] = useState(() => getBibliaPct());
  const dateKey = new Date().toISOString().slice(0, 10);
  const [aguaMl, setAguaMl] = useState(() => {
    const saved = localStorage.getItem(`ham-agua-${dateKey}`);
    return saved ? parseInt(saved) : 0;
  });
  const [aguaAnim, setAguaAnim] = useState(false);
  const [aguaDetails, setAguaDetails] = useState(false);
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const META_AGUA = 3500;

  const adicionarAgua = useCallback(() => {
    setAguaMl(prev => {
      const novo = prev + 700;
      localStorage.setItem(`ham-agua-${dateKey}`, String(novo));
      return novo;
    });
    setAguaAnim(true);
    setTimeout(() => setAguaAnim(false), 400);
  }, [dateKey]);
  
  useEffect(() => {
    const update = () => {
      const todayI = getTodayI();
      setChecklistPct(getChecklistPct(todayI));
      setTreinoPct(getTreinoPct(todayI));
      setBibliaPct(getBibliaPct());
    };
    window.addEventListener("focus", update);
    window.addEventListener("storage", update);
    const interval = setInterval(update, 5000);
    return () => {
      window.removeEventListener("focus", update);
      window.removeEventListener("storage", update);
      clearInterval(interval);
    };
  }, []);

  const todayIdx = (() => { const d = now.getDay(); return d === 0 ? 6 : d - 1; })();
  const todayRoutine = rotinaSemanal[todayIdx];
  const todayTraining = weekPlan[todayIdx];
  const semana = Math.ceil(((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
  const versiculo = versiculosMemorizacao[(semana - 1) % versiculosMemorizacao.length];

  const streakData = (() => {
    const saved = localStorage.getItem("ham-biblia-streak");
    return saved ? JSON.parse(saved) : { count: 0 };
  })();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const userPhoto = localStorage.getItem("ham-user-photo");
  const pillars = getPillarScores(checklistPct, treinoPct);
  const totalScore = pillars.reduce((acc, p) => acc + p.score, 0);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        {userPhoto ? (
          <img src={userPhoto} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/20" />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <span className="font-mono text-primary font-bold">EB</span>
          </div>
        )}
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground">{greeting()}, Emerson</p>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>
        <div className="flex flex-col items-center shrink-0">
          <span className="font-mono font-black text-lg text-gradient">{totalScore}</span>
          <span className="font-mono text-[8px] text-muted-foreground tracking-wider">/100</span>
        </div>
      </motion.div>

      {/* Frase do dia */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="surface-card p-4"
      >
        <p className="text-[8px] font-mono text-muted-foreground/60 tracking-widest mb-2">🗡️ MENTALIDADE DO DIA</p>
        {(() => {
          const frase = getFraseHoje();
          return (
            <>
              <motion.p
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="text-[13px] text-foreground leading-[1.5] italic"
              >
                "{frase.texto}"
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-[10px] text-muted-foreground mt-2 font-mono"
              >
                — {frase.autor}{frase.obra ? `, ${frase.obra}` : ""}
              </motion.p>
            </>
          );
        })()}
      </motion.div>

      {/* Stories progress */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar relative">
        {[
          { label: "Rotina", pct: checklistPct, color: "hsl(38 92% 60%)", path: "/rotina" },
          { label: "Treino", pct: treinoPct, color: "hsl(0 80% 65%)", path: "/treino" },
          { label: "Bíblia", pct: bibliaPct, color: "hsl(270 55% 65%)", path: "/biblia" },
          { label: "Sono", pct: 0, color: "hsl(215 75% 60%)", path: "/sono" },
        ].map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            onClick={() => navigate(s.path)}
            className="flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center relative">
              <svg className="w-full h-full -rotate-90 absolute" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="25" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                <circle
                  cx="28" cy="28" r="25" fill="none"
                  stroke={s.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 25}`}
                  strokeDashoffset={`${2 * Math.PI * 25 * (1 - s.pct / 100)}`}
                />
              </svg>
              <span className="font-mono text-[11px] font-bold text-foreground">{s.pct}%</span>
            </div>
            <span className="text-[9px] text-muted-foreground tracking-wider font-medium uppercase">{s.label}</span>
          </motion.button>
        ))}

        {/* Água - circle button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + 4 * 0.04 }}
          className="flex flex-col items-center gap-1.5 shrink-0 relative"
        >
          <motion.button
            animate={aguaAnim ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={adicionarAgua}
            onTouchStart={() => {
              longPressTimer.current = setTimeout(() => setAguaDetails(true), 500);
            }}
            onTouchEnd={() => {
              if (longPressTimer.current) clearTimeout(longPressTimer.current);
            }}
            onMouseDown={() => {
              longPressTimer.current = setTimeout(() => setAguaDetails(true), 500);
            }}
            onMouseUp={() => {
              if (longPressTimer.current) clearTimeout(longPressTimer.current);
            }}
            className="w-14 h-14 rounded-full flex items-center justify-center relative active:scale-95 transition-transform"
          >
            <svg className="w-full h-full -rotate-90 absolute" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="25" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
              <circle
                cx="28" cy="28" r="25" fill="none"
                stroke="hsl(152 60% 52%)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 25}`}
                strokeDashoffset={`${2 * Math.PI * 25 * (1 - Math.min(aguaMl / META_AGUA, 1))}`}
              />
            </svg>
            <GlassWater size={18} className="text-foreground" />
          </motion.button>
          <span className="text-[9px] text-muted-foreground tracking-wider font-medium uppercase">ÁGUA</span>

          {/* Long press details popup */}
          {aguaDetails && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50 surface-card p-3 rounded-xl min-w-[160px] shadow-lg border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-baseline gap-1.5 mb-2">
                <Droplets size={12} className="text-primary shrink-0" />
                <span className="font-mono text-sm font-bold text-foreground">
                  {(aguaMl / 1000).toFixed(1)}L
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">/ {(META_AGUA / 1000).toFixed(1)}L</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min((aguaMl / META_AGUA) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground mt-1.5 font-mono">
                {Math.floor(aguaMl / 700)} garrafas · +700ml/toque
              </p>
              <button
                onClick={() => setAguaDetails(false)}
                className="mt-2 w-full text-[10px] font-mono text-primary font-medium"
              >
                FECHAR
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Overlay to close details */}
      {aguaDetails && (
        <div className="fixed inset-0 z-40" onClick={() => setAguaDetails(false)} />
      )}

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        onClick={() => navigate("/biblia")}
        className="w-full surface-card p-4 text-left active:scale-[0.98] transition-transform border-violet-500/15"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <BookOpen size={18} className="text-violet-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-violet-400 tracking-wider">DEVOCIONAL</span>
                <div className="flex items-center gap-1 bg-amber-500/10 rounded-full px-2 py-0.5">
                  <Flame size={10} className="text-amber-500" />
                  <span className="text-[10px] font-mono font-bold text-amber-500">{streakData.count}</span>
                </div>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed italic truncate">
                "{versiculo.texto.slice(0, 60)}..."
              </p>
              <p className="text-[10px] text-violet-400/70 mt-1">{versiculo.referencia}</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-2" />
        </div>
      </motion.button>

      {/* Training card */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={() => navigate("/treino")}
        className="w-full surface-card p-4 text-left active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{todayTraining.emoji}</span>
            <div>
              <p className={`font-mono text-sm font-bold ${todayTraining.colorClass}`}>
                {todayTraining.type} {todayTraining.focus}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {todayTraining.exercises.length > 0
                  ? `${todayTraining.exercises.length} exercícios · ${todayTraining.jiuType || ""}`
                  : todayTraining.jiuType || "Descanso"
                }
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      </motion.button>

      {/* Routine preview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="surface-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground">ROTINA DE HOJE</p>
          </div>
          <button onClick={() => navigate("/rotina")} className="text-[10px] font-mono text-primary font-medium active:scale-95">
            VER TUDO →
          </button>
        </div>
        <div className="space-y-0.5">
          {todayRoutine.items.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-secondary/30 transition-colors">
              <span className="font-mono text-[11px] text-muted-foreground w-10 shrink-0">
                {item.time}
              </span>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.dotColor }} />
              <span className="text-[12px] text-foreground truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pilares */}
      <div>
        <p className="text-[10px] font-mono text-muted-foreground tracking-widest mb-2 px-1">PILARES</p>
        <div className="grid grid-cols-5 gap-1.5">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            const pct = p.weight > 0 ? Math.round((p.score / p.weight) * 100) : 0;
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.03 }}
                className="surface-card p-2.5 flex flex-col items-center gap-1.5"
              >
                <Icon size={16} style={{ color: p.color }} />
                <span className="font-mono text-sm font-bold" style={{ color: p.color }}>{p.score}</span>
                <div className="w-full bg-secondary rounded-full h-1">
                  <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                </div>
                <span className="text-[8px] text-muted-foreground tracking-wider font-medium">{p.name.toUpperCase()}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
