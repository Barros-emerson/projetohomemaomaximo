import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LoadSuggestion {
  exerciseName: string;
  estimated1RM: number;
  weekNumber: number;
  targetPct: number;
  calculatedLoad: number;
  suggestedLoad: number;
  isChestExercise: boolean;
  hasHistory: boolean;
}

const WEEKLY_PERCENTAGES = [0.70, 0.75, 0.80, 0.65, 0.82, 0.85];

const CHEST_EXERCISES = ["Supino Reto", "Supino Inclinado", "Crucifixo"];
const CHEST_MAX_PCT = 0.75;
const CHEST_REDUCTION = 0.85; // 15% reduction

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      // Get all sessions to determine week cycle
      const { data: sessoes } = await supabase
        .from("treino_sessoes")
        .select("data")
        .order("data", { ascending: true });

      // Determine current training week (cycle of 6)
      let currentWeek = 1;
      if (sessoes && sessoes.length > 0) {
        const uniqueWeeks = new Set<string>();
        sessoes.forEach((s) => {
          const d = new Date(s.data);
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          uniqueWeeks.add(weekStart.toISOString().slice(0, 10));
        });
        currentWeek = ((uniqueWeeks.size - 1) % 6) + 1;
      }
      setWeekNumber(currentWeek);

      // Get recent exercises with loads
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

          // Try to extract reps from the set context, default to 5
          const reps = parseInt(c.reps) || 5;
          const current1RM = estimate1RM(kg, reps);
          const existing = bestByExercise.get(ex.nome);

          if (!existing || estimate1RM(existing.weight, existing.reps) < current1RM) {
            bestByExercise.set(ex.nome, { weight: kg, reps });
          }
        });
      });

      const targetPctBase = WEEKLY_PERCENTAGES[(currentWeek - 1) % 6];
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

  return { suggestions, weekNumber, loading };
}
