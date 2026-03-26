import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Zap, Dumbbell, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ComparativoMetrica {
  label: string;
  icon: React.ReactNode;
  atual: string;
  anterior: string;
  variacao: number;
  positivo: boolean;
}

const TreinoComparativo = () => {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<ComparativoMetrica[]>([]);
  const [temDados, setTemDados] = useState(false);
  const [periodoLabel, setPeriodoLabel] = useState("COMPARATIVO SEMANAL");

  useEffect(() => {
    calcularComparativo();
  }, []);

  const calcularComparativo = async () => {
    try {
      const hoje = new Date();
      // Current week: last 7 days. Previous week: 7-14 days ago.
      const inicioSemanaAtual = new Date(hoje);
      inicioSemanaAtual.setDate(inicioSemanaAtual.getDate() - 7);
      const inicioSemanaAnterior = new Date(hoje);
      inicioSemanaAnterior.setDate(inicioSemanaAnterior.getDate() - 14);

      const { data: sessoes } = await supabase
        .from("treino_sessoes")
        .select("*")
        .gte("data", inicioSemanaAnterior.toISOString().slice(0, 10))
        .order("data", { ascending: true });

      if (!sessoes || sessoes.length === 0) {
        setTemDados(false);
        setLoading(false);
        return;
      }

      const sessaoIds = sessoes.map(s => s.id);
      const { data: exercicios } = await supabase
        .from("treino_exercicios")
        .select("*")
        .in("sessao_id", sessaoIds);

      const metade = inicioSemanaAtual.toISOString().slice(0, 10);
      const recentes = sessoes.filter(s => s.data >= metade);
      const anteriores = sessoes.filter(s => s.data < metade);

      // If only current week data, show stats without comparison
      if (recentes.length === 0 && anteriores.length === 0) {
        setTemDados(false);
        setLoading(false);
        return;
      }

      // Show data even if only one week exists
      const hasComparison = anteriores.length > 0 && recentes.length > 0;
      setTemDados(true);
      setPeriodoLabel(hasComparison ? "COMPARATIVO SEMANAL" : "RESUMO DA SEMANA");

      const atual = recentes.length > 0 ? recentes : anteriores;
      const anterior = hasComparison ? anteriores : [];

      const exAtuais = exercicios?.filter(e => atual.some(s => s.id === e.sessao_id)) || [];
      const exAnteriores = exercicios?.filter(e => anterior.some(s => s.id === e.sessao_id)) || [];

      const duracaoMediaAtual = atual.reduce((a, s) => a + s.duracao_segundos, 0) / atual.length;
      const duracaoMediaAnterior = anterior.length > 0 ? anterior.reduce((a, s) => a + s.duracao_segundos, 0) / anterior.length : 0;

      const conclusaoAtual = atual.reduce((a, s) => a + (s.total_series > 0 ? s.series_completas / s.total_series : 0), 0) / atual.length * 100;
      const conclusaoAnterior = anterior.length > 0 ? anterior.reduce((a, s) => a + (s.total_series > 0 ? s.series_completas / s.total_series : 0), 0) / anterior.length * 100 : 0;

      const maxCarga = (exList: typeof exAtuais) => {
        return exList.reduce((max, ex) => {
          const cargas = (ex.cargas as any[]) || [];
          const exMax = cargas.reduce((m: number, c: any) => {
            const v = parseFloat(c.kg);
            return isNaN(v) ? m : Math.max(m, v);
          }, 0);
          return Math.max(max, exMax);
        }, 0);
      };

      const cargaMaxAtual = maxCarga(exAtuais);
      const cargaMaxAnterior = maxCarga(exAnteriores);

      const freqAtual = atual.length;
      const freqAnterior = anterior.length;

      const volumeAtual = atual.reduce((a, s) => a + s.series_completas, 0);
      const volumeAnterior = anterior.reduce((a, s) => a + s.series_completas, 0);

      const mediaCargas = (exList: typeof exAtuais) => {
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

      const cargaMediaAtual = mediaCargas(exAtuais);
      const cargaMediaAnterior = mediaCargas(exAnteriores);

      const calcVariacao = (at: number, ant: number) =>
        ant > 0 ? ((at - ant) / ant) * 100 : 0;

      const formatMin = (s: number) => `${Math.round(s / 60)}min`;

      setMetricas([
        {
          label: "Frequência",
          icon: <Calendar size={16} />,
          atual: `${freqAtual}x`,
          anterior: hasComparison ? `${freqAnterior}x` : "—",
          variacao: hasComparison ? calcVariacao(freqAtual, freqAnterior) : 0,
          positivo: true,
        },
        {
          label: "Carga Máxima",
          icon: <TrendingUp size={16} />,
          atual: cargaMaxAtual > 0 ? `${cargaMaxAtual}kg` : "—",
          anterior: hasComparison && cargaMaxAnterior > 0 ? `${cargaMaxAnterior}kg` : "—",
          variacao: hasComparison ? calcVariacao(cargaMaxAtual, cargaMaxAnterior) : 0,
          positivo: true,
        },
        {
          label: "Carga Média",
          icon: <Dumbbell size={16} />,
          atual: cargaMediaAtual > 0 ? `${cargaMediaAtual.toFixed(1)}kg` : "—",
          anterior: hasComparison && cargaMediaAnterior > 0 ? `${cargaMediaAnterior.toFixed(1)}kg` : "—",
          variacao: hasComparison ? calcVariacao(cargaMediaAtual, cargaMediaAnterior) : 0,
          positivo: true,
        },
        {
          label: "Volume Total",
          icon: <Zap size={16} />,
          atual: `${volumeAtual} séries`,
          anterior: hasComparison ? `${volumeAnterior} séries` : "—",
          variacao: hasComparison ? calcVariacao(volumeAtual, volumeAnterior) : 0,
          positivo: true,
        },
        {
          label: "Conclusão",
          icon: <BarChart3 size={16} />,
          atual: `${Math.round(conclusaoAtual)}%`,
          anterior: hasComparison ? `${Math.round(conclusaoAnterior)}%` : "—",
          variacao: hasComparison ? calcVariacao(conclusaoAtual, conclusaoAnterior) : 0,
          positivo: true,
        },
        {
          label: "Duração Média",
          icon: <Clock size={16} />,
          atual: formatMin(duracaoMediaAtual),
          anterior: hasComparison ? formatMin(duracaoMediaAnterior) : "—",
          variacao: hasComparison ? calcVariacao(duracaoMediaAtual, duracaoMediaAnterior) : 0,
          positivo: false,
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
          Finalize seu primeiro treino para ver o resumo semanal aqui.
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
          {periodoLabel}
        </h3>
      </div>

      <div className="space-y-2">
        {metricas.map((m, i) => {
          const isUp = m.variacao > 0;
          const isGood = m.positivo ? isUp : !isUp;
          const isNeutral = Math.abs(m.variacao) < 1;
          const noComparison = m.anterior === "—";

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
                      {noComparison ? "Sem dados anteriores" : `Antes: ${m.anterior}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-extrabold text-foreground">{m.atual}</p>
                  {!noComparison && (
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
                  )}
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
