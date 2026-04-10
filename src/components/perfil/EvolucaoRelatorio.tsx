import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoricoEntry {
  data: string;
  valor: string;
  label: string;
  categoria: string;
}

const CORES_CATEGORIA: Record<string, string[]> = {
  biometrics: ["hsl(152 60% 52%)", "hsl(38 92% 60%)", "hsl(215 75% 60%)", "hsl(0 80% 65%)", "hsl(270 55% 65%)"],
  strength: ["hsl(38 92% 60%)", "hsl(152 60% 52%)", "hsl(0 80% 65%)", "hsl(215 75% 60%)", "hsl(270 55% 65%)", "hsl(180 60% 50%)", "hsl(330 60% 55%)"],
  hormones: ["hsl(270 55% 65%)", "hsl(152 60% 52%)"],
  goals: ["hsl(38 92% 60%)", "hsl(215 75% 60%)"],
};

const getColor = (categoria: string, index: number) => {
  const cores = CORES_CATEGORIA[categoria] || CORES_CATEGORIA.biometrics;
  return cores[index % cores.length];
};

interface MetricOption {
  categoria: string;
  label: string;
  unit: string;
  color: string;
}

const UNIT_MAP: Record<string, string> = {
  "Peso": "kg", "% Gordura": "%", "IMC": "", "Cintura": "cm", "Altura": "cm",
  "Testo Total": "ng/dL", "Testo Livre": "pg/mL",
  "Peso alvo": "kg", "% Gordura alvo": "%",
};

const EvolucaoRelatorio = () => {
  const [historico, setHistorico] = useState<HistoricoEntry[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MetricOption | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorico();
  }, []);

  const fetchHistorico = async () => {
    try {
      const { data } = await supabase
        .from("perfil_metricas_historico")
        .select("data, valor, label, categoria")
        .order("data", { ascending: true });
      setHistorico(data || []);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
    }
  };

  // Build dynamic metric list from actual DB data
  const metricas: MetricOption[] = (() => {
    const seen = new Set<string>();
    const result: MetricOption[] = [];
    const catCounters: Record<string, number> = {};
    for (const h of historico) {
      const key = `${h.categoria}::${h.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const idx = catCounters[h.categoria] || 0;
      catCounters[h.categoria] = idx + 1;
      result.push({
        categoria: h.categoria,
        label: h.label,
        unit: UNIT_MAP[h.label] || (h.categoria === "strength" ? "kg" : ""),
        color: getColor(h.categoria, idx),
      });
    }
    return result;
  })();

  // Auto-select first metric
  useEffect(() => {
    if (metricas.length > 0 && !selectedMetric) {
      setSelectedMetric(metricas[0]);
    }
  }, [metricas.length]);

  const chartData = historico
    .filter((h) => h.label === selectedMetric.label && h.categoria === selectedMetric.categoria)
    .map((h) => ({
      data: h.data,
      valor: parseFloat(h.valor),
      label: format(parseISO(h.data), "dd/MM", { locale: ptBR }),
    }))
    .filter((d) => !isNaN(d.valor));

  const hasData = chartData.length >= 2;
  const lastTwo = chartData.slice(-2);
  const variacao =
    lastTwo.length === 2 && lastTwo[0].valor > 0
      ? ((lastTwo[1].valor - lastTwo[0].valor) / lastTwo[0].valor) * 100
      : 0;

  if (loading) {
    return (
      <div className="surface-card p-6 text-center">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
          <div className="h-32 bg-secondary rounded" />
        </div>
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
        <TrendingUp size={16} className="text-primary" />
        <h3 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          EVOLUÇÃO CORPORAL
        </h3>
      </div>

      {/* Metric selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 px-1 scrollbar-hide">
        {METRICAS_EVOLUCAO.map((m) => (
          <button
            key={`${m.categoria}-${m.label}`}
            onClick={() => setSelectedMetric(m)}
            className={`shrink-0 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-wider transition-colors ${
              selectedMetric.label === m.label && selectedMetric.categoria === m.categoria
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="surface-card p-4 border border-border">
        {!hasData ? (
          <div className="text-center py-8">
            <BarChart3 size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-mono">
              Atualize suas métricas em dias diferentes para ver a evolução.
            </p>
            <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
              Mínimo 2 registros necessários
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{selectedMetric.label}</p>
                <p className="font-mono text-2xl font-black text-foreground">
                  {chartData[chartData.length - 1].valor}
                  <span className="text-xs text-muted-foreground ml-1">{selectedMetric.unit}</span>
                </p>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-mono text-[11px] font-bold ${
                  Math.abs(variacao) < 1
                    ? "bg-secondary text-muted-foreground"
                    : variacao > 0
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {Math.abs(variacao) < 1 ? (
                  <Minus size={12} />
                ) : variacao > 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {Math.abs(variacao) < 1 ? "Estável" : `${variacao > 0 ? "+" : ""}${variacao.toFixed(1)}%`}
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 16%)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "hsl(240 5% 45%)", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "hsl(240 5% 45%)", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240 5% 10%)",
                    border: "1px solid hsl(240 4% 16%)",
                    borderRadius: "8px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "11px",
                  }}
                  labelStyle={{ color: "hsl(240 5% 45%)" }}
                  itemStyle={{ color: selectedMetric.color }}
                  formatter={(value: number) => [`${value} ${selectedMetric.unit}`, selectedMetric.label]}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke={selectedMetric.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: selectedMetric.color, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: selectedMetric.color }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Data points count */}
            <div className="flex items-center gap-1 mt-2 justify-end">
              <Calendar size={10} className="text-muted-foreground" />
              <span className="font-mono text-[9px] text-muted-foreground">
                {chartData.length} registros
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default EvolucaoRelatorio;
