import { useState, useEffect } from "react";
import { Moon, Clock, BedDouble, AlarmClock, Check, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, differenceInMinutes, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

const META_SONO_MIN = 420; // 7h ideal
const BOM_SONO_MIN = 390; // 6h30 = suficiente

interface SonoRegistro {
  id: string;
  data: string;
  hora_dormiu: string;
  hora_acordou: string;
  duracao_minutos: number;
  suficiente: boolean;
  created_at: string;
}

const calcDuracao = (dormiu: string, acordou: string): number => {
  const [hd, md] = dormiu.split(":").map(Number);
  const [ha, ma] = acordou.split(":").map(Number);
  let minDormiu = hd * 60 + md;
  let minAcordou = ha * 60 + ma;
  if (minAcordou <= minDormiu) minAcordou += 24 * 60; // crossed midnight
  return minAcordou - minDormiu;
};

const formatMin = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m > 0 ? m.toString().padStart(2, "0") : ""}`;
};

const getQualidade = (min: number): { label: string; color: string; emoji: string } => {
  if (min >= META_SONO_MIN) return { label: "EXCELENTE", color: "hsl(152 60% 52%)", emoji: "🟢" };
  if (min >= BOM_SONO_MIN) return { label: "SUFICIENTE", color: "hsl(38 92% 60%)", emoji: "🟡" };
  if (min >= 300) return { label: "INSUFICIENTE", color: "hsl(25 90% 55%)", emoji: "🟠" };
  return { label: "CRÍTICO", color: "hsl(0 80% 55%)", emoji: "🔴" };
};

const Sono = () => {
  const hoje = new Date().toISOString().slice(0, 10);
  const [horaDormiu, setHoraDormiu] = useState("23:00");
  const [horaAcordou, setHoraAcordou] = useState("06:00");
  const [registroHoje, setRegistroHoje] = useState<SonoRegistro | null>(null);
  const [historico, setHistorico] = useState<SonoRegistro[]>([]);
  const [saving, setSaving] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const duracao = calcDuracao(horaDormiu, horaAcordou);
  const qualidade = getQualidade(duracao);

  const fetchData = async () => {
    const { data } = await supabase
      .from("sono_registros")
      .select("*")
      .order("data", { ascending: false })
      .limit(30);
    if (data) {
      setHistorico(data);
      const todayRec = data.find((r) => r.data === hoje);
      if (todayRec) {
        setRegistroHoje(todayRec);
        setHoraDormiu(todayRec.hora_dormiu);
        setHoraAcordou(todayRec.hora_acordou);
        setShowResult(true);
      }
    }
  };

  useEffect(() => { fetchData(); }, []);

  const salvar = async () => {
    setSaving(true);
    const suficiente = duracao >= BOM_SONO_MIN;

    if (registroHoje) {
      await supabase
        .from("sono_registros")
        .update({ hora_dormiu: horaDormiu, hora_acordou: horaAcordou, duracao_minutos: duracao, suficiente })
        .eq("id", registroHoje.id);
    } else {
      await supabase
        .from("sono_registros")
        .insert({ hora_dormiu: horaDormiu, hora_acordou: horaAcordou, duracao_minutos: duracao, suficiente, data: hoje });
    }

    setShowResult(true);
    setSaving(false);
    fetchData();
  };

  // Stats
  const ultimos7 = historico.filter((r) => {
    const d = new Date(r.data);
    return d >= subDays(new Date(), 7);
  });
  const mediaMin = ultimos7.length > 0 ? Math.round(ultimos7.reduce((s, r) => s + r.duracao_minutos, 0) / ultimos7.length) : 0;
  const diasSuficientes = ultimos7.filter((r) => r.suficiente).length;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-5 border-glow text-center"
      >
        <Moon size={28} className="text-primary mx-auto mb-2" />
        <h1 className="font-mono text-sm font-bold tracking-widest text-foreground">CONTROLE DE SONO</h1>
        <p className="font-mono text-[10px] text-muted-foreground mt-1">Registre e acompanhe sua qualidade de sono</p>
      </motion.div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="surface-card p-5 border-glow space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
              <BedDouble size={13} /> Hora que dormiu
            </label>
            <input
              type="time"
              value={horaDormiu}
              onChange={(e) => { setHoraDormiu(e.target.value); setShowResult(false); }}
              className="w-full bg-secondary border border-border rounded-xl px-3 py-3 font-mono text-lg text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
              <AlarmClock size={13} /> Hora que acordou
            </label>
            <input
              type="time"
              value={horaAcordou}
              onChange={(e) => { setHoraAcordou(e.target.value); setShowResult(false); }}
              className="w-full bg-secondary border border-border rounded-xl px-3 py-3 font-mono text-lg text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-between bg-secondary/50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">Duração:</span>
          </div>
          <span className="font-mono text-sm font-bold" style={{ color: qualidade.color }}>
            {formatMin(duracao)}
          </span>
        </div>

        <button
          onClick={salvar}
          disabled={saving}
          className="w-full py-3 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all active:scale-[0.97] disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? "SALVANDO..." : registroHoje ? "ATUALIZAR REGISTRO" : "SALVAR REGISTRO"}
        </button>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="surface-card p-5 border-glow text-center space-y-3"
          >
            <div className="text-3xl">{qualidade.emoji}</div>
            <div className="font-mono text-lg font-bold tracking-wider" style={{ color: qualidade.color }}>
              {qualidade.label}
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">{formatMin(duracao)}</div>
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              {duracao >= META_SONO_MIN
                ? "Sono excelente! Corpo e mente recuperados."
                : duracao >= BOM_SONO_MIN
                ? "Sono aceitável. Tente dormir um pouco mais cedo."
                : duracao >= 300
                ? "Sono insuficiente. Impacto no desempenho e recuperação."
                : "Sono crítico! Priorize descanso hoje."}
            </p>
            <div className="flex items-center justify-center gap-1 pt-1">
              <Check size={12} className="text-primary" />
              <span className="font-mono text-[9px] text-muted-foreground">Registrado para {new Date().toLocaleDateString("pt-BR")}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats resumo 7 dias */}
      {ultimos7.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card p-5 border-glow space-y-3"
        >
          <h3 className="font-mono text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase flex items-center gap-1.5">
            <TrendingUp size={13} /> Últimos 7 dias
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="font-mono text-lg font-bold text-foreground">{formatMin(mediaMin)}</p>
              <p className="font-mono text-[9px] text-muted-foreground">MÉDIA</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="font-mono text-lg font-bold text-foreground">{diasSuficientes}/{ultimos7.length}</p>
              <p className="font-mono text-[9px] text-muted-foreground">SUFICIENTES</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="font-mono text-lg font-bold text-foreground">{ultimos7.length}</p>
              <p className="font-mono text-[9px] text-muted-foreground">REGISTROS</p>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="flex items-end gap-1 h-16 pt-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const dateStr = subDays(new Date(), 6 - i).toISOString().slice(0, 10);
              const reg = historico.find((r) => r.data === dateStr);
              const min = reg ? reg.duracao_minutos : 0;
              const pct = Math.min((min / 540) * 100, 100); // 9h = 100%
              const q = getQualidade(min);
              const dayLabel = format(subDays(new Date(), 6 - i), "EEE", { locale: ptBR }).slice(0, 3).toUpperCase();
              return (
                <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max(pct * 0.5, 2)}px`,
                      backgroundColor: min > 0 ? q.color : "hsl(var(--secondary))",
                    }}
                  />
                  <span className="font-mono text-[7px] text-muted-foreground">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Histórico recente */}
      {historico.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="surface-card p-5 border-glow space-y-3"
        >
          <h3 className="font-mono text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase flex items-center gap-1.5">
            <Calendar size={13} /> Histórico
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {historico.slice(0, 14).map((r) => {
              const q = getQualidade(r.duracao_minutos);
              return (
                <div key={r.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{q.emoji}</span>
                    <div>
                      <p className="font-mono text-[11px] text-foreground">
                        {new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                      </p>
                      <p className="font-mono text-[9px] text-muted-foreground">
                        {r.hora_dormiu} → {r.hora_acordou}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold" style={{ color: q.color }}>{formatMin(r.duracao_minutos)}</p>
                    <p className="font-mono text-[8px]" style={{ color: q.color }}>{q.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Sono;
