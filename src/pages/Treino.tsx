import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Timer, Check, Camera, X, Image as ImageIcon } from "lucide-react";
import { weekPlan } from "@/data/treino-plano";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TreinoRelatorio, { type RelatorioData } from "@/components/treino/TreinoRelatorio";
import TreinoComparativo from "@/components/treino/TreinoComparativo";

const getTodayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

const RestTimer = ({
  seconds,
  onDone,
  onSkip,
}: {
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
}) => {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) { onDone(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  const pct = ((seconds - left) / seconds) * 100;
  const mins = Math.floor(left / 60);
  const secs = left % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
    >
      <div className="text-center space-y-6">
        <p className="font-mono text-xs text-muted-foreground tracking-widest">DESCANSO</p>
        <div className="relative w-40 h-40 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-4xl font-extrabold text-foreground">
              {mins}:{secs.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
        <button
          onClick={onSkip}
          className="font-mono text-xs text-muted-foreground tracking-wider hover:text-foreground transition-colors active:scale-95"
        >
          PULAR →
        </button>
      </div>
    </motion.div>
  );
};

const getLocalDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

const getTreinoStorageKey = (dayIdx: number) => {
  return `ham-treino-sets-${dayIdx}-${getLocalDate()}`;
};

const Treino = () => {
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const [completedSets, setCompletedSets] = useState<Record<string, Set<number>>>(() => {
    try {
      const saved = localStorage.getItem(getTreinoStorageKey(getTodayIndex()));
      if (saved) {
        const parsed = JSON.parse(saved);
        const result: Record<string, Set<number>> = {};
        Object.entries(parsed).forEach(([k, v]) => { result[k] = new Set(v as number[]); });
        return result;
      }
    } catch {}
    return {};
  });
  const [loads, setLoads] = useState<Record<string, Record<number, string>>>(() => {
    try {
      const saved = localStorage.getItem(`ham-treino-loads-${getTodayIndex()}-${new Date().toISOString().slice(0, 10)}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [workoutActive, setWorkoutActive] = useState(() => {
    return !!localStorage.getItem("ham-treino-start");
  });
  const [workoutTime, setWorkoutTime] = useState(() => {
    const start = localStorage.getItem("ham-treino-start");
    return start ? Math.floor((Date.now() - parseInt(start)) / 1000) : 0;
  });
  const [showTimer, setShowTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [photos, setPhotos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ham-treino-photos-today");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const day = weekPlan[selectedDay];
  const isOff = day.exercises.length === 0;

  // Persist completed sets
  useEffect(() => {
    const serializable: Record<string, number[]> = {};
    Object.entries(completedSets).forEach(([k, v]) => { serializable[k] = [...v]; });
    localStorage.setItem(getTreinoStorageKey(selectedDay), JSON.stringify(serializable));
  }, [completedSets, selectedDay]);

  // Persist loads
  useEffect(() => {
    const key = `ham-treino-loads-${selectedDay}-${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(key, JSON.stringify(loads));
  }, [loads, selectedDay]);

  useEffect(() => {
    if (!workoutActive) return;
    const startTs = localStorage.getItem("ham-treino-start");
    if (!startTs) return;
    const tick = () => setWorkoutTime(Math.floor((Date.now() - parseInt(startTs)) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [workoutActive]);

  const toggleSet = (exId: string, setIdx: number) => {
    setCompletedSets((prev) => {
      const exSets = new Set(prev[exId] || []);
      if (exSets.has(setIdx)) exSets.delete(setIdx);
      else {
        exSets.add(setIdx);
        setRestSeconds(day.focus === "FORÇA" ? 90 : 60);
        setShowTimer(true);
      }
      return { ...prev, [exId]: exSets };
    });
  };

  const setLoad = (exId: string, setIdx: number, value: string) => {
    setLoads((prev) => ({
      ...prev,
      [exId]: { ...(prev[exId] || {}), [setIdx]: value },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => {
          const updated = [...prev, reader.result as string];
          localStorage.setItem("ham-treino-photos-today", JSON.stringify(updated));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
    toast.success("Foto adicionada! 💪");
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem("ham-treino-photos-today", JSON.stringify(updated));
      return updated;
    });
  };

  const finalizarTreino = async () => {
    setSaving(true);
    const startTs = localStorage.getItem("ham-treino-start");
    const duracao = startTs ? Math.floor((Date.now() - parseInt(startTs)) / 1000) : workoutTime;

    const totalSeries = day.exercises.reduce((a, e) => a + parseInt(e.sets), 0);
    const seriesCompletas = Object.values(completedSets).reduce((a, s) => a + s.size, 0);

    const exerciciosData = day.exercises.map(ex => {
      const exSets = completedSets[ex.id] || new Set();
      const exLoads = loads[ex.id] || {};
      const cargas = [...exSets].map(si => ({
        set: si + 1,
        kg: exLoads[si] || "",
      })).filter(c => c.kg);

      return {
        nome: ex.name,
        exercicio_id: ex.id,
        setsCompletos: exSets.size,
        setsPlanejados: parseInt(ex.sets),
        cargas,
      };
    });

    // Save to DB
    try {
      const { data: sessao, error: sessaoErr } = await supabase
        .from("treino_sessoes")
        .insert({
          dia_semana: selectedDay,
          tipo: day.type,
          foco: day.focus,
          duracao_segundos: duracao,
          total_series: totalSeries,
          series_completas: seriesCompletas,
        })
        .select()
        .single();

      if (sessaoErr) throw sessaoErr;

      // Save exercises
      if (sessao) {
        const exInserts = exerciciosData.map(ex => ({
          sessao_id: sessao.id,
          exercicio_id: ex.exercicio_id,
          nome: ex.nome,
          sets_planejados: ex.setsPlanejados,
          sets_completos: ex.setsCompletos,
          cargas: ex.cargas,
        }));

        await supabase.from("treino_exercicios").insert(exInserts);

        // Save photos
        if (photos.length > 0) {
          const photoInserts = photos.map(foto => ({
            sessao_id: sessao.id,
            foto_base64: foto,
          }));
          await supabase.from("treino_fotos").insert(photoInserts);
        }
      }

      toast.success("Treino salvo com sucesso! 🏆");
    } catch (err) {
      console.error("Erro ao salvar treino:", err);
      toast.error("Erro ao salvar, mas o relatório foi gerado.");
    }

    // Build report
    const relatorioData: RelatorioData = {
      duracao,
      totalSeries,
      seriesCompletas,
      exercicios: exerciciosData,
      fotos: photos,
      tipo: day.type,
      foco: day.focus,
      emoji: day.emoji,
      colorClass: day.colorClass,
      bgClass: day.bgClass,
      borderClass: day.borderClass,
    };

    setRelatorio(relatorioData);
    localStorage.removeItem("ham-treino-start");
    setWorkoutActive(false);
    setWorkoutTime(0);
    setSaving(false);
  };

  const fecharRelatorio = () => {
    setRelatorio(null);
    setCompletedSets({});
    setLoads({});
    setPhotos([]);
    localStorage.removeItem("ham-treino-photos-today");
    localStorage.removeItem(getTreinoStorageKey(selectedDay));
    localStorage.removeItem(`ham-treino-loads-${selectedDay}-${new Date().toISOString().slice(0, 10)}`);
  };

  const totalSets = day.exercises.reduce((a, e) => a + parseInt(e.sets), 0);
  const doneSets = Object.values(completedSets).reduce((a, s) => a + s.size, 0);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  // Show report view
  if (relatorio) {
    return (
      <div className="p-4 space-y-4 pb-24">
        <TreinoRelatorio data={relatorio} />
        <TreinoComparativo />
        <button
          onClick={fecharRelatorio}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold tracking-wider active:scale-95 transition-all"
        >
          NOVO TREINO
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {weekPlan.map((d, i) => {
          const isToday = i === getTodayIndex();
          const isSelected = i === selectedDay;
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`shrink-0 px-3 py-2 rounded-xl border font-mono text-[10px] font-bold tracking-wider transition-all duration-200 active:scale-95 ${
                isSelected
                  ? `${d.bgClass} ${d.borderClass} ${d.colorClass}`
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              <div>{d.label.slice(0, 3)}</div>
              {isToday && <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-1" />}
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <motion.div
        key={selectedDay}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`surface-card p-4 border ${day.borderClass}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{day.emoji}</span>
          <div className="flex-1">
            <h2 className={`font-mono text-sm font-extrabold tracking-wider ${day.colorClass}`}>
              {day.label} — {day.type} {day.focus}
            </h2>
            {!isOff && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {day.exercises.length} exercícios · Descanso {day.focus === "FORÇA" ? "90s" : "60s"}
              </p>
            )}
          </div>
        </div>

        {!isOff && (
          <div className="mt-3 flex items-center gap-3">
            {!workoutActive ? (
              <button
                onClick={() => {
                  localStorage.setItem("ham-treino-start", Date.now().toString());
                  setWorkoutActive(true);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider transition-all active:scale-95 ${day.bgClass} ${day.colorClass} border ${day.borderClass}`}
              >
                <Play size={14} />
                INICIAR TREINO
              </button>
            ) : (
              <div className="flex items-center gap-3 flex-1">
                <div className="font-mono text-lg font-extrabold text-foreground">
                  {formatTime(workoutTime)}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {doneSets}/{totalSets} séries
                </div>
                <button
                  onClick={finalizarTreino}
                  disabled={saving}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive font-mono text-[10px] font-bold tracking-wider active:scale-95 disabled:opacity-50"
                >
                  <Square size={12} />
                  {saving ? "SALVANDO..." : "FINALIZAR"}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Photo upload section */}
      {!isOff && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="surface-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-primary" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground">FOTOS DO TREINO</span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] font-mono text-primary font-medium active:scale-95 flex items-center gap-1"
            >
              <Camera size={12} />
              ADICIONAR
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {photos.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/30 transition-colors flex flex-col items-center gap-2"
            >
              <ImageIcon size={24} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Toque para adicionar fotos</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={photo} alt={`Treino ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-foreground" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/30 transition-colors flex items-center justify-center"
              >
                <Camera size={20} className="text-muted-foreground" />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Exercises or OFF content */}
      {isOff ? (
        <div className={`surface-card p-6 text-center border ${day.borderClass}`}>
          <span className="text-4xl mb-3 block">{day.emoji}</span>
          <p className={`font-mono text-sm font-bold ${day.colorClass}`}>
            {day.type === "OPCIONAL"
              ? "Ombro leve, braço moderado ou Jiu-Jitsu"
              : day.dayIndex === 6
              ? "Descanso total. Recuperação."
              : "Caminhada + Mobilidade + Sol"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {day.exercises.map((ex, ei) => {
            const setsCount = parseInt(ex.sets);
            const exSets = completedSets[ex.id] || new Set();

            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ei * 0.04 }}
                className={`surface-card p-4 border ${day.borderClass}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-foreground">{ex.name}</span>
                    {ex.equipment && (
                      <span className="text-[10px] text-muted-foreground ml-2">{ex.equipment}</span>
                    )}
                  </div>
                  <span className={`font-mono text-lg font-extrabold ${day.colorClass}`}>
                    {ex.sets}x{ex.reps}
                  </span>
                </div>

                {workoutActive && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {Array.from({ length: setsCount }).map((_, si) => {
                      const done = exSets.has(si);
                      return (
                        <div key={si} className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleSet(ex.id, si)}
                            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-mono text-sm font-bold transition-all active:scale-90 ${
                              done
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                            }`}
                          >
                            {done ? <Check size={16} /> : si + 1}
                          </button>
                          {done && (
                            <input
                              type="text"
                              placeholder="kg"
                              value={loads[ex.id]?.[si] || ""}
                              onChange={(e) => setLoad(ex.id, si, e.target.value)}
                              className="w-14 h-10 rounded-xl bg-secondary border border-border text-center font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Comparativo mensal */}
      {!isOff && !workoutActive && (
        <TreinoComparativo />
      )}

      {/* Rest timer */}
      <AnimatePresence>
        {showTimer && (
          <RestTimer
            seconds={restSeconds}
            onDone={() => setShowTimer(false)}
            onSkip={() => setShowTimer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Treino;
