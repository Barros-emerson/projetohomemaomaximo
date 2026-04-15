import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Moon, Zap, Flame, Brain } from "lucide-react";
import { toast } from "sonner";
import {
  useReadiness,
  calcReadiness,
  getReadinessLabel,
  getReadinessColor,
  getReadinessBg,
  getReadinessMessage,
  getLoadAdjustment,
} from "@/hooks/useReadiness";

const sliderFields: Array<{ key: "sono" | "energia" | "dor" | "estresse"; label: string; icon: typeof Moon; emoji: string; inverted?: boolean }> = [
  { key: "sono", label: "Qualidade do sono", icon: Moon, emoji: "😴" },
  { key: "energia", label: "Nível de energia", icon: Zap, emoji: "⚡" },
  { key: "dor", label: "Dor muscular", icon: Flame, emoji: "🔥", inverted: true },
  { key: "estresse", label: "Nível de estresse", icon: Brain, emoji: "🧠", inverted: true },
];

const Readiness = () => {
  const { data: todayData, loading, saveCheckin } = useReadiness();
  const [sono, setSono] = useState(todayData?.sono_qualidade ?? 7);
  const [energia, setEnergia] = useState(todayData?.energia ?? 7);
  const [dor, setDor] = useState(todayData?.dor_muscular ?? 3);
  const [estresse, setEstresse] = useState(todayData?.estresse ?? 3);
  const [saving, setSaving] = useState(false);
  const [showResult, setShowResult] = useState(!!todayData);

  // Sync when data loads
  useState(() => {
    if (todayData) {
      setSono(todayData.sono_qualidade);
      setEnergia(todayData.energia);
      setDor(todayData.dor_muscular);
      setEstresse(todayData.estresse);
      setShowResult(true);
    }
  });

  const values = { sono, energia, dor, estresse };
  const setters = {
    sono: setSono,
    energia: setEnergia,
    dor: setDor,
    estresse: setEstresse,
  };

  const preview = calcReadiness(sono, energia, dor, estresse);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await saveCheckin(sono, energia, dor, estresse);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar check-in");
    } else {
      toast.success("Check-in salvo! 🎯");
      setShowResult(true);
    }
  };

  const statusColor = getReadinessColor(preview.status);
  const statusBg = getReadinessBg(preview.status);
  const statusLabel = getReadinessLabel(preview.status);
  const message = getReadinessMessage(preview.status);
  const adjustment = getLoadAdjustment(preview.status);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Activity size={20} className="text-primary" />
        <div>
          <h1 className="font-mono text-sm font-extrabold tracking-wider text-foreground">
            READINESS CHECK
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Avaliação diária de prontidão
          </p>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {sliderFields.map((field) => {
          const val = values[field.key];
          const invertedNote = field.inverted
            ? val <= 3 ? "Ótimo" : val >= 7 ? "Alto" : ""
            : val >= 7 ? "Ótimo" : val <= 3 ? "Baixo" : "";

          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="surface-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{field.emoji}</span>
                  <span className="font-mono text-xs font-bold tracking-wider text-foreground">
                    {field.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {invertedNote && (
                    <span className={`text-[9px] font-mono tracking-wider ${
                      (field.inverted ? val <= 3 : val >= 7) ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {invertedNote}
                    </span>
                  )}
                  <span className={`font-mono text-lg font-extrabold ${statusColor}`}>
                    {val}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={val}
                onChange={(e) => setters[field.key](Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-secondary cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground font-mono">0</span>
                <span className="text-[9px] text-muted-foreground font-mono">10</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live Score Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`surface-card p-6 border ${statusBg} text-center`}
      >
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-2">
          READINESS SCORE
        </p>
        <div className={`font-mono text-5xl font-black ${statusColor}`}>
          {Math.round(preview.score)}
        </div>
        <p className={`font-mono text-xs font-bold tracking-wider mt-2 ${statusColor}`}>
          {statusLabel}
        </p>
        <p className="text-xs text-muted-foreground mt-3 italic">
          "{message}"
        </p>

        {/* Training adjustment info */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-1">
            AJUSTE DE TREINO
          </p>
          <p className={`font-mono text-xs font-bold ${statusColor}`}>
            {adjustment.label}
          </p>
          {preview.status === "recuperacao" && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Mobilidade · Caminhada · Sol · Alongamento
            </p>
          )}
        </div>
      </motion.div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold tracking-wider active:scale-95 transition-all disabled:opacity-50"
      >
        {saving ? "SALVANDO..." : showResult ? "ATUALIZAR CHECK-IN" : "SALVAR CHECK-IN"}
      </button>
    </div>
  );
};

export default Readiness;
