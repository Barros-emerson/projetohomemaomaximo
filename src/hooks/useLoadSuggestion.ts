import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LoadSuggestion {
  exerciseName: string;
  estimated1RM: number;
  weekNumber: number;
  phase: string;
  targetPct: number;
  calculatedLoad: number;
  suggestedLoad: number;
  isChestExercise: boolean;
  hasHistory: boolean;
}

// 12-week cycle: Build (1-3) → Deload (4) → Overload (5-8) → Peak (9-11) → Deload (12)
const CYCLE_WEEKS = 12;
const WEEKLY_PERCENTAGES = [
  0.70, 0.75, 0.80,             // 1-3 Build
  0.60,                          // 4 Deload (also volume -40%)
  0.78, 0.82, 0.85, 0.87,        // 5-8 Overload
  0.88, 0.90, 0.92,              // 9-11 Peak
  0.60,                          // 12 Deload
];

const PHASE_BY_WEEK: Record<number, string> = {
  1: "BUILD", 2: "BUILD", 3: "BUILD",
  4: "DELOAD",
  5: "OVERLOAD", 6: "OVERLOAD", 7: "OVERLOAD", 8: "OVERLOAD",
  9: "PEAK", 10: "PEAK", 11: "PEAK",
  12: "DELOAD",
};

const CHEST_EXERCISES = [
  "Supino Reto",
  "Supino Inclinado",
  "Supino Inclinado com Halter",
  "Crucifixo",
];
const CHEST_MAX_PCT = 0.75;
const CHEST_REDUCTION = 0.85;

function roundToPlate(kg: number): number {
  return Math.round(kg / 2.5) * 2.5;
}

function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps * 0.0333);
}

export function useLoadSuggestions() {
  const [suggestions, setSuggestions] = useState<Record<string, LoadSuggestion>>({});
  const [weekNumber, setWeekNumber] = useState(1);
  const [phase, setPhase] = useState<string>("BUILD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data: sessoes } = await supabase
        .from("treino_sessoes")
        .select("data")
        .order("data", { ascending: true });

      let currentWeek = 1;
      if (sessoes && sessoes.length > 0) {
        const uniqueWeeks = new Set<string>();
        sessoes.forEach((s) => {
          const d = new Date(s.data);
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          uniqueWeeks.add(weekStart.toISOString().slice(0, 10));
        });
        currentWeek = ((uniqueWeeks.size - 1) % CYCLE_WEEKS) + 1;
      }
      setWeekNumber(currentWeek);
      setPhase(PHASE_BY_WEEK[currentWeek] || "BUILD");

      const { data: exercicios } = await supabase
        .from("treino_exercicios")
        .select("nome, cargas, sessao_id")
        .order("created_at", { ascending: false });

      if (!exercicios || exercicios.length === 0) {
        setLoading(false);
        return;
      }

      const bestByExercise = new Map<string, { weight: number; reps: number }>();

      exercicios.forEach((ex) => {
        const cargas = (ex.cargas as any[]) || [];
        cargas.forEach((c: any) => {
          const kg = parseFloat(c.kg);
          if (isNaN(kg) || kg <= 0) return;
          const reps = parseInt(c.reps) || 5;
          const current1RM = estimate1RM(kg, reps);
          const existing = bestByExercise.get(ex.nome);
          if (!existing || estimate1RM(existing.weight, existing.reps) < current1RM) {
            bestByExercise.set(ex.nome, { weight: kg, reps });
          }
        });
      });

      const targetPctBase = WEEKLY_PERCENTAGES[(currentWeek - 1) % CYCLE_WEEKS];
      const result: Record<string, LoadSuggestion> = {};

      bestByExercise.forEach((best, name) => {
        const rm = estimate1RM(best.weight, best.reps);
        const isChest = CHEST_EXERCISES.includes(name);

        let targetPct = targetPctBase;
        let calculated = rm * targetPct;

        if (isChest) {
          targetPct = Math.min(targetPct, CHEST_MAX_PCT);
          calculated = rm * targetPct * CHEST_REDUCTION;
        }

        result[name] = {
          exerciseName: name,
          estimated1RM: Math.round(rm * 10) / 10,
          weekNumber: currentWeek,
          phase: PHASE_BY_WEEK[currentWeek] || "BUILD",
          targetPct,
          calculatedLoad: Math.round(calculated * 10) / 10,
          suggestedLoad: roundToPlate(calculated),
          isChestExercise: isChest,
          hasHistory: true,
        };
      });

      setSuggestions(result);
    } catch (err) {
      console.error("Erro ao calcular sugestões de carga:", err);
    } finally {
      setLoading(false);
    }
  };

  return { suggestions, weekNumber, phase, loading };
}
