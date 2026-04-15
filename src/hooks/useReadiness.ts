import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const getLocalDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export interface ReadinessData {
  sono_qualidade: number;
  energia: number;
  dor_muscular: number;
  estresse: number;
  score: number;
  status: string;
}

export const calcReadiness = (sono: number, energia: number, dor: number, estresse: number) => {
  const score = (sono + energia + (10 - dor) + (10 - estresse)) * 2.5;
  let status = "recuperacao";
  if (score >= 80) status = "alta";
  else if (score >= 60) status = "normal";
  else if (score >= 40) status = "reduzir";
  return { score, status };
};

export const getReadinessLabel = (status: string) => {
  switch (status) {
    case "alta": return "Alta performance";
    case "normal": return "Treino normal";
    case "reduzir": return "Reduzir intensidade";
    case "recuperacao": return "Foco em recuperação";
    default: return "";
  }
};

export const getReadinessColor = (status: string) => {
  switch (status) {
    case "alta": return "text-emerald-400";
    case "normal": return "text-primary";
    case "reduzir": return "text-amber-400";
    case "recuperacao": return "text-red-400";
    default: return "text-muted-foreground";
  }
};

export const getReadinessBg = (status: string) => {
  switch (status) {
    case "alta": return "bg-emerald-400/10 border-emerald-400/25";
    case "normal": return "bg-primary/10 border-primary/25";
    case "reduzir": return "bg-amber-400/10 border-amber-400/25";
    case "recuperacao": return "bg-red-400/10 border-red-400/25";
    default: return "bg-secondary border-border";
  }
};

export const getReadinessMessage = (status: string) => {
  switch (status) {
    case "alta": return "Você está pronto. Execute.";
    case "normal": return "Consistência vence intensidade.";
    case "reduzir": return "Consistência vence intensidade. Reduza e avance.";
    case "recuperacao": return "Recuperar também é disciplina.";
    default: return "";
  }
};

export const getLoadAdjustment = (status: string): { multiplier: number; label: string } => {
  switch (status) {
    case "alta": return { multiplier: 1.0, label: "Progressão planejada" };
    case "normal": return { multiplier: 1.0, label: "Manter carga" };
    case "reduzir": return { multiplier: 0.875, label: "Carga reduzida ~12%" };
    case "recuperacao": return { multiplier: 0, label: "Sessão de recuperação" };
    default: return { multiplier: 1.0, label: "" };
  }
};

export const useReadiness = () => {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchToday = async () => {
    setLoading(true);
    const { data: row } = await supabase
      .from("readiness_checkin")
      .select("*")
      .eq("data", getLocalDate())
      .maybeSingle();

    if (row) {
      setData({
        sono_qualidade: row.sono_qualidade,
        energia: row.energia,
        dor_muscular: row.dor_muscular,
        estresse: row.estresse,
        score: Number(row.score),
        status: row.status,
      });
    } else {
      setData(null);
    }
    setLoading(false);
  };

  const saveCheckin = async (sono: number, energia: number, dor: number, estresse: number) => {
    const { score, status } = calcReadiness(sono, energia, dor, estresse);
    const today = getLocalDate();

    const { error } = await supabase
      .from("readiness_checkin")
      .upsert(
        { data: today, sono_qualidade: sono, energia: energia, dor_muscular: dor, estresse: estresse, score, status },
        { onConflict: "data" }
      );

    if (!error) {
      setData({ sono_qualidade: sono, energia, dor_muscular: dor, estresse, score, status });
    }
    return { score, status, error };
  };

  useEffect(() => {
    fetchToday();
  }, []);

  return { data, loading, saveCheckin, refetch: fetchToday };
};
