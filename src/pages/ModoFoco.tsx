import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, X, ChevronRight, Zap } from "lucide-react";
import { rotinaSemanal } from "@/data/rotina-diaria";
import { loadCheckedFromDB, toggleChecklistItem } from "@/hooks/useChecklistDB";

const getTodayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

export default function ModoFoco() {
  const navigate = useNavigate();
  const todayIdx = getTodayIndex();
  const day = rotinaSemanal[todayIdx];

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Load checked items from DB on mount
  useEffect(() => {
    loadCheckedFromDB(todayIdx).then((map) => {
      setChecked(new Set(map.keys()));
      setLoading(false);
    });
  }, [todayIdx]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const idx = day.items.findIndex((item) => !checked.has(item.id));
    if (idx === -1) {
      setDone(true);
    } else {
      setCurrentItemIdx(idx);
    }
  }, [checked, day.items]);

  const currentItem = day.items[currentItemIdx];
  const totalItems = day.items.length;
  const doneCount = day.items.filter((i) => checked.has(i.id)).length;
  const pct = Math.round((doneCount / totalItems) * 100);

  const handleCheck = () => {
    if (!currentItem || checking) return;
    setChecking(true);
    const nowTime = new Date();
    const timeStr = `${nowTime.getHours()}:${nowTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    
    // Save to DB (not checked yet, so isChecked=false to insert)
    toggleChecklistItem(todayIdx, currentItem.id, false, timeStr).then(() => {
      const newChecked = new Set(checked);
      newChecked.add(currentItem.id);
      setChecked(newChecked);
      setChecking(false);
    });
  };

  const handleSkip = () => {
    const next = day.items.findIndex(
      (item, i) => i > currentItemIdx && !checked.has(item.id)
    );
    if (next !== -1) setCurrentItemIdx(next);
  };

  const clockStr = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground font-mono text-sm animate-pulse">Carregando...</span>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Check size={40} className="text-primary" />
          </div>

          <h1 className="text-xl font-bold font-mono tracking-wider text-foreground">
            PROTOCOLO COMPLETO
          </h1>

          <p className="text-5xl font-black font-mono text-primary">
            {pct}%
          </p>

          <p className="text-sm text-muted-foreground font-mono">
            {doneCount}/{totalItems} itens concluídos
          </p>

          <p className="text-xs text-muted-foreground/60 font-mono">
            {day.dayLabel}
          </p>
        </motion.div>
        <button
          onClick={() => navigate(-1)}
          className="mt-12 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-mono text-sm font-bold tracking-widest active:scale-95 transition-transform"
        >
          FECHAR
        </button>
      </div>
    );
  }

  if (!currentItem) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-primary" />
          <span className="font-mono text-xs font-bold tracking-widest text-primary">
            MODO FOCO
          </span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center active:scale-90 transition-transform"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 pb-4">
        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-mono text-muted-foreground">
            {doneCount} concluídos
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {totalItems - doneCount} restantes
          </span>
        </div>
      </div>

      {/* Current Item Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col justify-center px-6"
        >
          <div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-4">
            <p className="text-3xl font-black font-mono text-foreground text-center">
              {clockStr}
            </p>

            <div className="flex items-center gap-2 justify-center">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentItem.dotColor }}
              />
              <span className="font-mono text-sm text-muted-foreground">
                {currentItem.time}
              </span>
            </div>

            <h2 className="text-lg font-bold text-foreground text-center">
              {currentItem.label}
            </h2>

            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              {currentItem.detail}
            </p>

            {currentItem.tags && currentItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {currentItem.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border border-border"
                    style={{ color: tag.color }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="px-6 pb-8 pt-4 flex flex-col items-center gap-3">
        <button
          onClick={handleCheck}
          disabled={checking}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-mono text-sm font-bold tracking-widest active:scale-95 transition-transform disabled:opacity-60"
        >
          {checking ? (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex"
            >
              <Check size={20} />
            </motion.span>
          ) : (
            <span>✓ CONCLUÍDO</span>
          )}
        </button>

        {day.items.some(
          (item, i) => i > currentItemIdx && !checked.has(item.id)
        ) && (
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 text-xs font-mono text-muted-foreground active:scale-95 transition-transform"
          >
            PULAR
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
