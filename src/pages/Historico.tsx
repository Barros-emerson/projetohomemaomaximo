import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Clock,
  Dumbbell,
  Trophy,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Camera,
  Calendar,
  Flame,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sessao {
  id: string;
  data: string;
  dia_semana: number;
  tipo: string;
  foco: string;
  duracao_segundos: number;
  total_series: number;
  series_completas: number;
  created_at: string;
}

interface Exercicio {
  id: string;
  sessao_id: string;
  nome: string;
  sets_planejados: number;
  sets_completos: number;
  cargas: { set: number; kg: string }[];
}

interface Foto {
  id: string;
  sessao_id: string;
  foto_base64: string;
}

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min ${sec}s`;
};

const dayColors: Record<string, { color: string; bg: string; border: string }> = {
  "UPPER FORÇA": { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/25" },
  "LOWER HIPERTROFIA": { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/25" },
  "UPPER HIPERTROFIA": { color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/25" },
  "LOWER FORÇA": { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/25" },
};

const getColors = (tipo: string, foco: string) => {
  const key = `${tipo} ${foco}`;
  return dayColors[key] || { color: "text-primary", bg: "bg-primary/10", border: "border-primary/25" };
};

const SessaoCard = ({
  sessao,
  exercicios,
  fotos,
}: {
  sessao: Sessao;
  exercicios: Exercicio[];
  fotos: Foto[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const colors = getColors(sessao.tipo, sessao.foco);
  const completionPct =
    sessao.total_series > 0
      ? Math.round((sessao.series_completas / sessao.total_series) * 100)
      : 0;

  const maxLoad = exercicios.reduce((max, ex) => {
    const cargas = (ex.cargas as any[]) || [];
    const exMax = cargas.reduce((m: number, c: any) => {
      const v = parseFloat(c.kg);
      return isNaN(v) ? m : Math.max(m, v);
    }, 0);
    return Math.max(max, exMax);
  }, 0);

  const dataFormatada = format(parseISO(sessao.data), "dd MMM yyyy", { locale: ptBR });
  const diaSemana = format(parseISO(sessao.data), "EEEE", { locale: ptBR });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`surface-card border ${colors.border} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
              <Dumbbell size={18} className={colors.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-mono text-xs font-extrabold tracking-wider ${colors.color}`}>
                {sessao.tipo} · {sessao.foco}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                {diaSemana} · {dataFormatada}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-mono text-sm font-extrabold text-foreground">
                {completionPct}%
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatTime(sessao.duracao_segundos)}
              </p>
            </div>
            {expanded ? (
              <ChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={16} className="text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Mini stats row */}
        <div className="flex gap-3 mt-3">
          <div className="flex items-center gap-1">
            <Dumbbell size={10} className="text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground">
              {sessao.series_completas}/{sessao.total_series}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} className="text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground">
              {formatTime(sessao.duracao_segundos)}
            </span>
          </div>
          {maxLoad > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp size={10} className="text-muted-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground">
                {maxLoad}kg
              </span>
            </div>
          )}
          {fotos.length > 0 && (
            <div className="flex items-center gap-1">
              <Camera size={10} className="text-muted-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground">
                {fotos.length}
              </span>
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className={`rounded-xl p-3 ${colors.bg}`}>
                  <Clock size={12} className="text-muted-foreground mb-1" />
                  <p className="font-mono text-sm font-extrabold text-foreground">
                    {formatTime(sessao.duracao_segundos)}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-mono">DURAÇÃO</p>
                </div>
                <div className={`rounded-xl p-3 ${colors.bg}`}>
                  <Trophy size={12} className="text-muted-foreground mb-1" />
                  <p className={`font-mono text-sm font-extrabold ${colors.color}`}>
                    {completionPct}%
                  </p>
                  <p className="text-[9px] text-muted-foreground font-mono">CONCLUSÃO</p>
                </div>
                <div className={`rounded-xl p-3 ${colors.bg}`}>
                  <TrendingUp size={12} className="text-muted-foreground mb-1" />
                  <p className="font-mono text-sm font-extrabold text-foreground">
                    {maxLoad > 0 ? `${maxLoad}kg` : "—"}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-mono">CARGA MÁX</p>
                </div>
              </div>

              {/* Exercise details */}
              <div className="space-y-2">
                <p className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
                  EXERCÍCIOS
                </p>
                {exercicios.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between py-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{ex.nome}</p>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {((ex.cargas as any[]) || []).length > 0 ? (
                          ((ex.cargas as any[]) || []).map((c: any, ci: number) => (
                            <span
                              key={ci}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${colors.bg} ${colors.color}`}
                            >
                              {c.kg}kg
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-muted-foreground">sem carga</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`font-mono text-sm font-bold ${
                        ex.sets_completos === ex.sets_planejados
                          ? colors.color
                          : "text-muted-foreground"
                      }`}
                    >
                      {ex.sets_completos}/{ex.sets_planejados}
                    </span>
                  </div>
                ))}
              </div>

              {/* Photos */}
              {fotos.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Camera size={12} className="text-muted-foreground" />
                    <p className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
                      FOTOS
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {fotos.map((foto) => (
                      <div key={foto.id} className="aspect-square rounded-xl overflow-hidden">
                        <img
                          src={foto.foto_base64}
                          alt="Treino"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Historico = () => {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorico();
  }, []);

  const fetchHistorico = async () => {
    try {
      const { data: sessoesData } = await supabase
        .from("treino_sessoes")
        .select("*")
        .order("data", { ascending: false })
        .limit(50);

      if (!sessoesData || sessoesData.length === 0) {
        setLoading(false);
        return;
      }

      setSessoes(sessoesData);

      const ids = sessoesData.map((s) => s.id);

      const [exRes, fotoRes] = await Promise.all([
        supabase.from("treino_exercicios").select("*").in("sessao_id", ids),
        supabase.from("treino_fotos").select("*").in("sessao_id", ids),
      ]);

      setExercicios((exRes.data as Exercicio[]) || []);
      setFotos((fotoRes.data as Foto[]) || []);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group sessions by month
  const grouped = sessoes.reduce<Record<string, Sessao[]>>((acc, s) => {
    const monthKey = format(parseISO(s.data), "MMMM yyyy", { locale: ptBR });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(s);
    return acc;
  }, {});

  // Summary stats
  const totalSessoes = sessoes.length;
  const totalMinutos = Math.round(
    sessoes.reduce((a, s) => a + s.duracao_segundos, 0) / 60
  );
  const totalSeries = sessoes.reduce((a, s) => a + s.series_completas, 0);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <History size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="font-mono text-sm font-extrabold tracking-wider text-foreground">
            HISTÓRICO DE TREINOS
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Todos os seus treinos registrados
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card p-4 animate-pulse">
              <div className="h-4 bg-secondary rounded w-2/3 mb-2" />
              <div className="h-3 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : sessoes.length === 0 ? (
        <div className="surface-card p-8 text-center border border-border">
          <Dumbbell size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-semibold">
            Nenhum treino registrado ainda
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Finalize seu primeiro treino para vê-lo aqui
          </p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="surface-card p-3 text-center border border-border">
              <Flame size={14} className="text-primary mx-auto mb-1" />
              <p className="font-mono text-lg font-extrabold text-foreground">{totalSessoes}</p>
              <p className="text-[9px] text-muted-foreground font-mono">TREINOS</p>
            </div>
            <div className="surface-card p-3 text-center border border-border">
              <Clock size={14} className="text-primary mx-auto mb-1" />
              <p className="font-mono text-lg font-extrabold text-foreground">{totalMinutos}</p>
              <p className="text-[9px] text-muted-foreground font-mono">MINUTOS</p>
            </div>
            <div className="surface-card p-3 text-center border border-border">
              <Dumbbell size={14} className="text-primary mx-auto mb-1" />
              <p className="font-mono text-lg font-extrabold text-foreground">{totalSeries}</p>
              <p className="text-[9px] text-muted-foreground font-mono">SÉRIES</p>
            </div>
          </div>

          {/* Grouped sessions */}
          {Object.entries(grouped).map(([month, monthSessoes]) => (
            <div key={month} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Calendar size={12} className="text-muted-foreground" />
                <h2 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  {month}
                </h2>
                <span className="text-[10px] text-muted-foreground">
                  ({monthSessoes.length})
                </span>
              </div>
              {monthSessoes.map((sessao) => (
                <SessaoCard
                  key={sessao.id}
                  sessao={sessao}
                  exercicios={exercicios.filter((e) => e.sessao_id === sessao.id)}
                  fotos={fotos.filter((f) => f.sessao_id === sessao.id)}
                />
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Historico;
