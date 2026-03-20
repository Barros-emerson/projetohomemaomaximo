import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Timer, ChevronRight, Check, Minus } from "lucide-react";
import { weekPlan, type TrainingDay } from "@/data/treino-plano";

const getTodayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1; // 0=seg
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
    if (left <= 0) {
      onDone();
      return;
    }
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

const Treino = () => {
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const [completedSets, setCompletedSets] = useState<Record<string, Set<number>>>({});
  const [loads, setLoads] = useState<Record<string, Record<number, string>>>({});
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);

  const day = weekPlan[selectedDay];
  const isOff = day.exercises.length === 0;

  // Workout clock
  useEffect(() => {
    if (!workoutActive) return;
    const t = setInterval(() => setWorkoutTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [workoutActive]);

  const toggleSet = (exId: string, setIdx: number) => {
    setCompletedSets((prev) => {
      const exSets = new Set(prev[exId] || []);
      if (exSets.has(setIdx)) exSets.delete(setIdx);
      else {
        exSets.add(setIdx);
        // Show rest timer
        const isForca = day.focus === "FORÇA";
        setRestSeconds(isForca ? 90 : 60);
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

  const totalSets = day.exercises.reduce((a, e) => a + parseInt(e.sets), 0);
  const doneSets = Object.values(completedSets).reduce((a, s) => a + s.size, 0);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {weekPlan.map((d, i) => {
          const isToday = i === getTodayIndex();
          const isSelected = i === selectedDay;
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`shrink-0 px-3 py-2 rounded-lg border font-mono text-[10px] font-bold tracking-wider transition-all duration-200 active:scale-95 ${
                isSelected
                  ? `${d.bgClass} ${d.borderClass} ${d.colorClass}`
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              <div>{d.label.slice(0, 3)}</div>
              {isToday && (
                <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-1" />
              )}
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
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                {day.exercises.length} exercícios · Descanso{" "}
                {day.focus === "FORÇA" ? "90s" : "60s"}
              </p>
            )}
          </div>
        </div>

        {!isOff && (
          <div className="mt-3 flex items-center gap-3">
            {!workoutActive ? (
              <button
                onClick={() => setWorkoutActive(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider transition-all active:scale-95 ${day.bgClass} ${day.colorClass} border ${day.borderClass}`}
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
                  onClick={() => setWorkoutActive(false)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/25 text-destructive font-mono text-[10px] font-bold tracking-wider active:scale-95"
                >
                  <Square size={12} />
                  FINALIZAR
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

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
                    <span className="font-mono text-sm font-bold text-foreground">
                      {ex.name}
                    </span>
                    {ex.equipment && (
                      <span className="font-mono text-[10px] text-muted-foreground ml-2">
                        {ex.equipment}
                      </span>
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
                            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-mono text-sm font-bold transition-all active:scale-90 ${
                              done
                                ? `bg-primary border-primary text-primary-foreground`
                                : `border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40`
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
                              className="w-14 h-10 rounded-lg bg-secondary border border-border text-center font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
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
