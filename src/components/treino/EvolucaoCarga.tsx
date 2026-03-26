import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dumbbell, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExerciseHistory {
  nome: string;
  data: string;
  maxCarga: number;
}

const EXERCISE_COLORS: Record<string, string> = {
  "Supino Reto": "hsl(215 75% 60%)",
  "Supino Inclinado": "hsl(215 55% 50%)",
  "Agachamento Livre": "hsl(152 60% 52%)",
  "Levantamento Terra": "hsl(0 80% 65%)",
  "Desenvolvimento Militar": "hsl(38 92% 60%)",
  "Remada Curvada": "hsl(270 55% 65%)",
  "Leg Press": "hsl(152 40% 45%)",
  "Stiff": "hsl(38 72% 50%)",
  "Barra Fixa": "hsl(215 60% 55%)",
  "Paralelas": "hsl(200 60% 55%)",
  "Puxador Frente": "hsl(270 40% 55%)",
  "Remada Baixa": "hsl(270 60% 60%)",
  "Rosca Direta": "hsl(0 60% 55%)",
  "Tríceps Polia": "hsl(0 50% 50%)",
  "Extensora": "hsl(80 50% 50%)",
  "Flexora": "hsl(80 40% 45%)",
  "Elevação Pélvica": "hsl(330 50% 55%)",
  "Panturrilha": "hsl(180 50% 50%)",
  "Elevação Lateral": "hsl(38 60% 55%)",
};

const EvolucaoCarga = () => {
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [chartData, setChartData] = useState<{ data: string; label: string; carga: number }[]>([]);
  const [allData, setAllData] = useState<ExerciseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: exercicios } = await supabase
        .from("treino_exercicios")
        .select("nome, cargas, sessao_id");

      if (!exercicios || exercicios.length === 0) {
        setLoading(false);
        return;
      }

      const sessaoIds = [...new Set(exercicios.map((e) => e.sessao_id))];
      const { data: sessoes } = await supabase
        .from("treino_sessoes")
        .select("id, data")
        .in("id", sessaoIds);

      const sessaoMap = new Map(sessoes?.map((s) => [s.id, s.data]) || []);

      const history: ExerciseHistory[] = [];
      const namesSet = new Set<string>();

      exercicios.forEach((ex) => {
        const data = sessaoMap.get(ex.sessao_id);
        if (!data) return;

        const cargas = (ex.cargas as any[]) || [];
        let maxCarga = 0;
        cargas.forEach((c: any) => {
          const v = parseFloat(c.kg);
          if (!isNaN(v) && v > 0) maxCarga = Math.max(maxCarga, v);
        });

        if (maxCarga > 0) {
          namesSet.add(ex.nome);
          history.push({ nome: ex.nome, data, maxCarga });
        }
      });

      const names = [...namesSet].sort();
      setExerciseNames(names);
      setAllData(history);
      if (names.length > 0) setSelected(names[0]);
    } catch (err) {
      console.error("Erro ao buscar evolução de carga:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selected || allData.length === 0) {
      setChartData([]);
      return;
    }

    // Group by date, take max per date
    const byDate = new Map<string, number>();
    allData
      .filter((d) => d.nome === selected)
      .forEach((d) => {
        const curr = byDate.get(d.data) || 0;
        byDate.set(d.data, Math.max(curr, d.maxCarga));
      });

    const sorted = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, carga]) => ({
        data,
        label: format(parseISO(data), "dd/MM", { locale: ptBR }),
        carga,
      }));

    setChartData(sorted);
  }, [selected, allData]);

  const color = EXERCISE_COLORS[selected] || "hsl(152 60% 52%)";
  const hasData = chartData.length >= 1;
  const hasMultiple = chartData.length >= 2;

  const lastTwo = chartData.slice(-2);
  const variacao =
    lastTwo.length === 2 && lastTwo[0].carga > 0
      ? ((lastTwo[1].carga - lastTwo[0].carga) / lastTwo[0].carga) * 100
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

  if (exerciseNames.length === 0) {
    return (
      <div className="surface-card p-6 text-center border border-border">
        <Dumbbell size={24} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground font-mono">
          Finalize treinos com carga para ver a evolução aqui.
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
        <Dumbbell size={16} className="text-accent" />
        <h3 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          EVOLUÇÃO DE CARGA
        </h3>
      </div>

      {/* Exercise selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 px-1 scrollbar-hide">
        {exerciseNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`shrink-0 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-wider transition-colors ${
              selected === name
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="surface-card p-4 border border-border">
        {!hasData ? (
          <div className="text-center py-8">
            <Dumbbell size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-mono">
              Nenhuma carga registrada para {selected}.
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{selected}</p>
                <p className="font-mono text-2xl font-black text-foreground">
                  {chartData[chartData.length - 1].carga}
                  <span className="text-xs text-muted-foreground ml-1">kg</span>
                </p>
              </div>
              {hasMultiple && (
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
              )}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={160}>
              {hasMultiple ? (
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
                    itemStyle={{ color }}
                    formatter={(value: number) => [`${value} kg`, selected]}
                  />
                  <Line
                    type="monotone"
                    dataKey="carga"
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: color, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: color }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
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
                    formatter={(value: number) => [`${value} kg`, selected]}
                  />
                  <Bar dataKey="carga" fill={color} radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>

            <div className="flex items-center gap-1 mt-2 justify-end">
              <Calendar size={10} className="text-muted-foreground" />
              <span className="font-mono text-[9px] text-muted-foreground">
                {chartData.length} {chartData.length === 1 ? "sessão" : "sessões"}
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default EvolucaoCarga;
