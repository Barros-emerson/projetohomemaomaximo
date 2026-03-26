import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Zap, Dumbbell, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SessaoComExercicios {
  id: string;
  data: string;
  dia_semana: number;
  tipo: string;
  foco: string;
  duracao_segundos: number;
  total_series: number;
  series_completas: number;
  exercicios: {
    exercicio_id: string;
    nome: string;
    sets_planejados: number;
    sets_completos: number;
    cargas: { set: number; kg: string }[];
  }[];
}

interface ComparativoMetrica {
  label: string;
  icon: React.ReactNode;
  atual: string;
  anterior: string;
  variacao: number; // percentage
  positivo: boolean; // is increase good?
}

const TreinoComparativo = () => {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<ComparativoMetrica[]>([]);
  const [temDados, setTemDados] = useState(false);

  useEffect(() => {
    calcularComparativo();
  }, []);

  const calcularComparativo = async () => {
    try {
      const hoje = new Date();
      const inicio4Semanas = new Date(hoje);
      inicio4Semanas.setDate(inicio4Semanas.getDate() - 28);
      const inicio8Semanas = new Date(hoje);
      inicio8Semanas.setDate(inicio8Semanas.getDate() - 56);

      // Buscar sessões das últimas 8 semanas
      const { data: sessoes } = await supabase
        .from("treino_sessoes")
        .select("*")
        .gte("data", inicio8Semanas.toISOString().slice(0, 10))
        .order("data", { ascending: true });

      if (!sessoes || sessoes.length < 2) {
        setTemDados(false);
        setLoading(false);
        return;
      }

      // Buscar exercícios
      const sessaoIds = sessoes.map(s => s.id);
      const { data: exercicios } = await supabase
        .from("treino_exercicios")
        .select("*")
        .in("sessao_id", sessaoIds);

      // Separar em duas metades: últimas 4 semanas vs 4 semanas anteriores
      const metade = inicio4Semanas.toISOString().slice(0, 10);
      const recentes = sessoes.filter(s => s.data >= metade);
      const anteriores = sessoes.filter(s => s.data < metade);

      if (anteriores.length === 0 || recentes.length === 0) {
        setTemDados(false);
        setLoading(false);
        return;
      }

      setTemDados(true);

      const exRecentes = exercicios?.filter(e => recentes.some(s => s.id === e.sessao_id)) || [];
      const exAnteriores = exercicios?.filter(e => anteriores.some(s => s.id === e.sessao_id)) || [];

      // Duração média
      const duracaoMediaRecente = recentes.reduce((a, s) => a + s.duracao_segundos, 0) / recentes.length;
      const duracaoMediaAnterior = anteriores.reduce((a, s) => a + s.duracao_segundos, 0) / anteriores.length;

      // Conclusão média (%)
      const conclusaoRecente = recentes.reduce((a, s) => a + (s.total_series > 0 ? s.series_completas / s.total_series : 0), 0) / recentes.length * 100;
      const conclusaoAnterior = anteriores.reduce((a, s) => a + (s.total_series > 0 ? s.series_completas / s.total_series : 0), 0) / anteriores.length * 100;

      // Carga máxima
      const maxCarga = (exList: typeof exRecentes) => {
        return exList.reduce((max, ex) => {
          const cargas = (ex.cargas as any[]) || [];
          const exMax = cargas.reduce((m: number, c: any) => {
            const v = parseFloat(c.kg);
            return isNaN(v) ? m : Math.max(m, v);
          }, 0);
          return Math.max(max, exMax);
        }, 0);
      };

      const cargaMaxRecente = maxCarga(exRecentes);
      const cargaMaxAnterior = maxCarga(exAnteriores);

      // Frequência
      const freqRecente = recentes.length;
      const freqAnterior = anteriores.length;

      // Volume total (séries completadas)
      const volumeRecente = recentes.reduce((a, s) => a + s.series_completas, 0);
      const volumeAnterior = anteriores.reduce((a, s) => a + s.series_completas, 0);

      // Carga média por exercício
      const mediaCargas = (exList: typeof exRecentes) => {
        let total = 0, count = 0;
        exList.forEach(ex => {
          const cargas = (ex.cargas as any[]) || [];
          cargas.forEach((c: any) => {
            const v = parseFloat(c.kg);
            if (!isNaN(v) && v > 0) { total += v; count++; }
          });
        });
        return count > 0 ? total / count : 0;
      };

      const cargaMediaRecente = mediaCargas(exRecentes);
      const cargaMediaAnterior = mediaCargas(exAnteriores);

      const calcVariacao = (atual: number, anterior: number) =>
        anterior > 0 ? ((atual - anterior) / anterior) * 100 : 0;

      const formatMin = (s: number) => `${Math.round(s / 60)}min`;

      setMetricas([
        {
          label: "Frequência",
          icon: <Calendar size={16} />,
          atual: `${freqRecente}x`,
          anterior: `${freqAnterior}x`,
          variacao: calcVariacao(freqRecente, freqAnterior),
          positivo: true,
        },
        {
          label: "Carga Máxima",
          icon: <TrendingUp size={16} />,
          atual: cargaMaxRecente > 0 ? `${cargaMaxRecente}kg` : "—",
          anterior: cargaMaxAnterior > 0 ? `${cargaMaxAnterior}kg` : "—",
          variacao: calcVariacao(cargaMaxRecente, cargaMaxAnterior),
          positivo: true,
        },
        {
          label: "Carga Média",
          icon: <Dumbbell size={16} />,
          atual: cargaMediaRecente > 0 ? `${cargaMediaRecente.toFixed(1)}kg` : "—",
          anterior: cargaMediaAnterior > 0 ? `${cargaMediaAnterior.toFixed(1)}kg` : "—",
          variacao: calcVariacao(cargaMediaRecente, cargaMediaAnterior),
          positivo: true,
        },
        {
          label: "Volume Total",
          icon: <Zap size={16} />,
          atual: `${volumeRecente} séries`,
          anterior: `${volumeAnterior} séries`,
          variacao: calcVariacao(volumeRecente, volumeAnterior),
          positivo: true,
        },
        {
          label: "Conclusão",
          icon: <BarChart3 size={16} />,
          atual: `${Math.round(conclusaoRecente)}%`,
          anterior: `${Math.round(conclusaoAnterior)}%`,
          variacao: calcVariacao(conclusaoRecente, conclusaoAnterior),
          positivo: true,
        },
        {
          label: "Duração Média",
          icon: <Clock size={16} />,
          atual: formatMin(duracaoMediaRecente),
          anterior: formatMin(duracaoMediaAnterior),
          variacao: calcVariacao(duracaoMediaRecente, duracaoMediaAnterior),
          positivo: false, // less time = more efficient
        },
      ]);
    } catch (err) {
      console.error("Erro ao calcular comparativo:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="surface-card p-6 text-center">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
          <div className="h-20 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (!temDados) {
    return (
      <div className="surface-card p-6 text-center border border-border">
        <BarChart3 size={24} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Continue treinando! O comparativo aparece após 4 semanas de dados.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 px-1">
        <BarChart3 size={16} className="text-primary" />
        <h3 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          COMPARATIVO 4 SEMANAS
        </h3>
      </div>

      <div className="space-y-2">
        {metricas.map((m, i) => {
          const isUp = m.variacao > 0;
          const isGood = m.positivo ? isUp : !isUp;
          const isNeutral = Math.abs(m.variacao) < 1;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="surface-card p-4 border border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{m.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Antes: {m.anterior}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-extrabold text-foreground">{m.atual}</p>
                  <div className={`flex items-center gap-1 justify-end text-[10px] font-mono font-bold ${
                    isNeutral
                      ? "text-muted-foreground"
                      : isGood
                      ? "text-green-400"
                      : "text-red-400"
                  }`}>
                    {isNeutral ? (
                      <Minus size={10} />
                    ) : isUp ? (
                      <TrendingUp size={10} />
                    ) : (
                      <TrendingDown size={10} />
                    )}
                    {isNeutral ? "=" : `${isUp ? "+" : ""}${Math.round(m.variacao)}%`}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TreinoComparativo;
