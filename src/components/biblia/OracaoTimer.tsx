import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
];

const OracaoTimer = () => {
  const [duration, setDuration] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const toggle = () => {
    if (finished) {
      reset();
      return;
    }
    setRunning(!running);
  };

  const reset = () => {
    setRunning(false);
    setFinished(false);
    setRemaining(duration);
  };

  const selectPreset = (seconds: number) => {
    if (running) return;
    setDuration(seconds);
    setRemaining(seconds);
    setFinished(false);
  };

  const progress = 1 - remaining / duration;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Timer size={14} className="text-violet-400" />
        <span className="font-mono text-[10px] tracking-widest text-violet-400">TIMER DE ORAÇÃO</span>
      </div>

      {/* Presets */}
      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.seconds}
            onClick={() => selectPreset(p.seconds)}
            className={`flex-1 text-[10px] font-mono py-1.5 rounded-lg border transition-all ${
              duration === p.seconds
                ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                : "bg-secondary/30 border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative w-[100px] h-[100px]">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="4"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={finished ? "hsl(142 71% 45%)" : "hsl(var(--primary))"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl font-bold text-foreground tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            {finished && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[9px] font-mono text-green-400 font-bold"
              >
                AMÉM
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className={`text-xs gap-1.5 ${running ? "border-amber-500/30 text-amber-400" : "border-violet-500/30 text-violet-400"}`}
            onClick={toggle}
          >
            {finished ? (
              <><RotateCcw size={12} /> Recomeçar</>
            ) : running ? (
              <><Pause size={12} /> Pausar</>
            ) : (
              <><Play size={12} /> {remaining < duration ? "Continuar" : "Iniciar"}</>
            )}
          </Button>
          {(running || remaining < duration) && !finished && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={reset}
            >
              <RotateCcw size={12} />
            </Button>
          )}
        </div>
      </div>

      {running && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-center text-muted-foreground italic"
        >
          "Aquiete-se e saiba que Eu sou Deus." — Salmo 46:10
        </motion.p>
      )}
    </div>
  );
};

export default OracaoTimer;
