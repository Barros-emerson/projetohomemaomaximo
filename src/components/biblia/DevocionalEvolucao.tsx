import { useState, useEffect, useMemo } from "react";
import { Check, Flame, BookOpen, BookMarked, Heart, TrendingUp, Trophy, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface DevocionalDia {
  date: string;
  leitura: boolean;
  reflexao: boolean;
  oracao: boolean;
  score: number; // 0-3
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const DevocionalEvolucao = () => {
  const [historico, setHistorico] = useState<DevocionalDia[]>([]);
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    buildHistorico();
  }, []);

  const buildHistorico = async () => {
    // Get last 28 days
    const dias: DevocionalDia[] = [];
    const leiturasSaved = localStorage.getItem("ham-biblia-leituras");
    const leituras = leiturasSaved ? JSON.parse(leiturasSaved) : {};
    
    // Collect all completed reading dates from localStorage reflexões
    const reflexaoDates = new Set<string>();
    const leituraDates = new Set<string>();

    // Check reflexões by date
    for (let i = 0; i < 28; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const ref = localStorage.getItem(`ham-biblia-reflexao-${dateStr}`);
      if (ref && ref.trim()) reflexaoDates.add(dateStr);
    }

    // Check reading completions - look at streak history
    const streakData = localStorage.getItem("ham-biblia-streak");
    const streak = streakData ? JSON.parse(streakData) : { count: 0, lastDate: "" };

    // Mark reading dates based on streak
    if (streak.lastDate && streak.count > 0) {
      for (let i = 0; i < streak.count; i++) {
        const d = new Date(streak.lastDate + "T12:00:00");
        d.setDate(d.getDate() - i);
        leituraDates.add(d.toISOString().split("T")[0]);
      }
    }

    // Also check completed readings across all plans
    Object.values(leituras).forEach((planLeituras: any) => {
      if (Array.isArray(planLeituras)) {
        planLeituras.forEach((l: any) => {
          if (l.concluido) leituraDates.add(hoje); // at minimum today
        });
      }
    });

    // Get prayer dates from Supabase
    const oracaoDates = new Set<string>();
    try {
      const since = new Date();
      since.setDate(since.getDate() - 28);
      const { data } = await supabase
        .from("oracoes")
        .select("data")
        .gte("data", since.toISOString().split("T")[0]);
      if (data) data.forEach(o => oracaoDates.add(o.data));
    } catch {}

    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const leitura = leituraDates.has(dateStr);
      const reflexao = reflexaoDates.has(dateStr);
      const oracao = oracaoDates.has(dateStr);
      dias.push({
        date: dateStr,
        leitura,
        reflexao,
        oracao,
        score: (leitura ? 1 : 0) + (reflexao ? 1 : 0) + (oracao ? 1 : 0),
      });
    }

    setHistorico(dias);
  };

  // Today's validation
  const hojeData = historico.find(d => d.date === hoje) || { date: hoje, leitura: false, reflexao: false, oracao: false, score: 0 };
  const hojeCompleto = hojeData.score === 3;

  // Stats
  const stats = useMemo(() => {
    if (historico.length === 0) return { diasCompletos: 0, totalPontos: 0, melhorSequencia: 0, mediaScore: 0 };
    
    const diasCompletos = historico.filter(d => d.score === 3).length;
    const totalPontos = historico.reduce((s, d) => s + d.score, 0);
    
    let melhorSequencia = 0;
    let seq = 0;
    historico.forEach(d => {
      if (d.score >= 1) { seq++; melhorSequencia = Math.max(melhorSequencia, seq); }
      else seq = 0;
    });

    const last7 = historico.slice(-7);
    const mediaScore = last7.reduce((s, d) => s + d.score, 0) / 7;

    return { diasCompletos, totalPontos, melhorSequencia, mediaScore };
  }, [historico]);

  // Chart data - last 7 days
  const chartData = useMemo(() => {
    return historico.slice(-7).map(d => {
      const date = new Date(d.date + "T12:00:00");
      return {
        day: WEEKDAYS[date.getDay()],
        score: d.score,
        date: d.date,
      };
    });
  }, [historico]);

  // Heatmap - last 28 days (4 weeks)
  const heatmapWeeks = useMemo(() => {
    const weeks: DevocionalDia[][] = [];
    for (let i = 0; i < 28; i += 7) {
      weeks.push(historico.slice(i, i + 7));
    }
    return weeks;
  }, [historico]);

  const getScoreColor = (score: number) => {
    if (score === 0) return "bg-secondary";
    if (score === 1) return "bg-amber-500/40";
    if (score === 2) return "bg-amber-500/70";
    return "bg-primary";
  };

  const getBarColor = (score: number) => {
    if (score === 0) return "hsl(var(--muted))";
    if (score === 1) return "hsl(38 92% 50% / 0.5)";
    if (score === 2) return "hsl(38 92% 50% / 0.8)";
    return "hsl(var(--primary))";
  };

  const pilares = [
    { key: "leitura", label: "Leitura", icon: BookOpen, done: hojeData.leitura, color: "text-violet-400" },
    { key: "reflexao", label: "Reflexão", icon: BookMarked, done: hojeData.reflexao, color: "text-amber-400" },
    { key: "oracao", label: "Oração", icon: Heart, done: hojeData.oracao, color: "text-rose-400" },
  ];

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="surface-card p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          <span className="font-mono text-xs tracking-widest text-foreground">EVOLUÇÃO DEVOCIONAL</span>
        </div>
        {hojeCompleto && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1"
          >
            <Trophy size={12} className="text-primary" />
            <span className="text-[10px] font-mono font-bold text-primary">COMPLETO</span>
          </motion.div>
        )}
      </div>

      {/* Today's validation checklist */}
      <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
        <p className="text-[10px] font-mono text-muted-foreground tracking-widest mb-2.5 flex items-center gap-1.5">
          <Calendar size={10} />
          VALIDAÇÃO DE HOJE
        </p>
        <div className="grid grid-cols-3 gap-2">
          {pilares.map((p) => (
            <div
              key={p.key}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all ${
                p.done
                  ? "bg-primary/5 border-primary/20"
                  : "bg-secondary/50 border-border/50"
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                p.done ? "bg-primary/20" : "bg-secondary"
              }`}>
                {p.done ? (
                  <Check size={14} className="text-primary" />
                ) : (
                  <p.icon size={14} className={p.color} />
                )}
              </div>
              <span className={`text-[10px] font-mono ${p.done ? "text-primary font-bold" : "text-muted-foreground"}`}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(hojeData.score / 3) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-1.5 font-mono">
          {hojeData.score}/3 pilares concluídos
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary/30 rounded-lg p-2.5 text-center border border-border/30">
          <p className="text-lg font-bold text-foreground">{stats.diasCompletos}</p>
          <p className="text-[9px] font-mono text-muted-foreground">DIAS 100%</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-2.5 text-center border border-border/30">
          <p className="text-lg font-bold text-foreground">{stats.melhorSequencia}</p>
          <p className="text-[9px] font-mono text-muted-foreground">MELHOR SEQ.</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-2.5 text-center border border-border/30">
          <p className="text-lg font-bold text-foreground">{stats.mediaScore.toFixed(1)}</p>
          <p className="text-[9px] font-mono text-muted-foreground">MÉDIA 7D</p>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div>
        <p className="text-[10px] font-mono text-muted-foreground tracking-widest mb-2">ÚLTIMOS 7 DIAS</p>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={20}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={[0, 3]} hide />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </motion.div>
  );
};

export default DevocionalEvolucao;
