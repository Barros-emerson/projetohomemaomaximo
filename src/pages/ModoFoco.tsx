import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, X, Ban, Zap } from "lucide-react";
import { getRotinaDoDia } from "@/data/rotina-diaria";
import {
  loadCheckedFromDB,
  toggleChecklistItem,
  skipChecklistItem,
} from "@/hooks/useChecklistDB";

const getTodayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

const SWIPE_THRESHOLD = 100;

export default function ModoFoco() {
  const navigate = useNavigate();
  const todayIdx = getTodayIndex();
  const day = getRotinaDoDia(todayIdx);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Swipe motion
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  const cardOpacity = useTransform(x, [-220, -120, 0, 120, 220], [0.3, 0.7, 1, 0.7, 0.3]);
  const rightHintOpacity = useTransform(x, [0, 60, 140], [0, 0.6, 1]);
  const leftHintOpacity = useTransform(x, [-140, -60, 0], [1, 0.6, 0]);

  // Load handled items from DB
  useEffect(() => {
    loadCheckedFromDB(todayIdx).then((map) => {
      const c = new Set<string>();
      const s = new Set<string>();
      map.forEach((info, id) => {
        if (info.status === "skipped") s.add(id);
        else c.add(id);
      });
      setChecked(c);
      setSkipped(s);
      setLoading(false);
    });
  }, [todayIdx]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handled = (id: string) => checked.has(id) || skipped.has(id);
    const idx = day.items.findIndex((item) => !handled(item.id));
    if (idx === -1) setDone(true);
    else setCurrentItemIdx(idx);
  }, [checked, skipped, day.items]);

  const currentItem = day.items[currentItemIdx];
  const totalItems = day.items.length;
  const doneCount = day.items.filter((i) => checked.has(i.id)).length;
  const skippedCount = day.items.filter((i) => skipped.has(i.id)).length;
  const handledCount = doneCount + skippedCount;
  const pct = Math.round((doneCount / totalItems) * 100);

  const handleComplete = () => {
    if (!currentItem || busy) return;
    const item = currentItem;
    const nowTime = new Date();
    const timeStr = `${nowTime.getHours()}:${nowTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    // Optimistic update — UI avança imediatamente
    setChecked((prev) => new Set(prev).add(item.id));
    x.set(0);
    // Persiste em background
    toggleChecklistItem(todayIdx, item.id, false, timeStr).catch((e) =>
      console.error("toggleChecklistItem failed", e)
    );
  };

  const handleSkip = () => {
    if (!currentItem || busy) return;
    const item = currentItem;
    setSkipped((prev) => new Set(prev).add(item.id));
    x.set(0);
    skipChecklistItem(todayIdx, item.id, false).catch((e) =>
      console.error("skipChecklistItem failed", e)
    );
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (busy) {
      x.set(0);
      return;
    }
    if (info.offset.x > SWIPE_THRESHOLD) {
      handleComplete();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      handleSkip();
    } else {
      x.set(0);
    }
  };

  const clockStr = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground font-mono text-sm animate-pulse">Carregando...</span>
      </motion.div>
    );
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
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
          <p className="text-5xl font-black font-mono text-primary">{pct}%</p>
          <p className="text-sm text-muted-foreground font-mono">
            {doneCount}/{totalItems} concluídos
            {skippedCount > 0 && ` · ${skippedCount} não fiz`}
          </p>
          <p className="text-xs text-muted-foreground/60 font-mono">{day.dayLabel}</p>
        </motion.div>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-12 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-mono text-sm font-bold tracking-widest active:scale-95 transition-transform"
        >
          FECHAR
        </button>
      </motion.div>
    );
  }

  if (!currentItem) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-background flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-primary" />
          <span className="font-mono text-xs font-bold tracking-widest text-primary">
            MODO FOCO
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
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
            animate={{ width: `${(handledCount / totalItems) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-mono text-muted-foreground">
            {doneCount} feitos {skippedCount > 0 && `· ${skippedCount} pulados`}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {totalItems - handledCount} restantes
          </span>
        </div>
      </div>

      {/* Swipe hints */}
      <div className="px-6 flex items-center justify-between text-[9px] font-mono text-muted-foreground/40 tracking-widest pb-2">
        <span>← NÃO FIZ</span>
        <span>FIZ →</span>
      </div>

      {/* Current Item Card — swipeable */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col justify-center px-6 relative"
        >
          {/* Swipe action backgrounds */}
          <motion.div
            style={{ opacity: rightHintOpacity }}
            className="absolute inset-x-6 inset-y-0 flex items-center justify-start pl-8 rounded-3xl pointer-events-none"
          >
            <div className="flex items-center gap-3 text-primary">
              <Check size={48} strokeWidth={3} />
              <span className="font-mono text-xs font-bold tracking-widest">FIZ</span>
            </div>
          </motion.div>
          <motion.div
            style={{ opacity: leftHintOpacity }}
            className="absolute inset-x-6 inset-y-0 flex items-center justify-end pr-8 rounded-3xl pointer-events-none"
          >
            <div className="flex items-center gap-3" style={{ color: "#FB923C" }}>
              <span className="font-mono text-xs font-bold tracking-widest">NÃO FIZ</span>
              <Ban size={44} strokeWidth={2.5} />
            </div>
          </motion.div>

          <motion.div
            drag={busy ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity: cardOpacity }}
            className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-4 cursor-grab active:cursor-grabbing relative z-10"
          >
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
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Action buttons (fallback / acessibilidade) */}
      <div className="px-6 pb-8 pt-4 flex gap-3">
        <button
          onClick={handleSkip}
          disabled={busy}
          className="flex-1 py-4 rounded-2xl border border-border bg-secondary/40 text-muted-foreground font-mono text-xs font-bold tracking-widest active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Ban size={16} />
          NÃO FIZ
        </button>
        <button
          onClick={handleComplete}
          disabled={busy}
          className="flex-[1.4] py-4 rounded-2xl bg-primary text-primary-foreground font-mono text-xs font-bold tracking-widest active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Check size={16} />
          CONCLUÍDO
        </button>
      </div>
    </motion.div>
  );
}
