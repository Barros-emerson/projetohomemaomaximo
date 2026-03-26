import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, Clock, X, ChevronLeft, ChevronRight, ChevronDown, Utensils, Droplets, AlertTriangle } from "lucide-react";
import { rotinaSemanal, type RotinaItem } from "@/data/rotina-diaria";
import { dietaSemanal } from "@/data/dieta-semanal";

const getTodayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

/** Parse "5:20" → minutes from midnight (320). Returns null for non-time strings like "Livre" */
const parseTime = (t: string): number | null => {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1]) * 60 + parseInt(m[2]);
};

/** Format minutes from midnight → "5:20" */
const formatMinutes = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
};

interface AdjustedItem extends RotinaItem {
  adjustedTime: string | null; // null = no adjustment
  deltaMinutes: number; // how many minutes shifted
}
const SWIPE_THRESHOLD = 80;

interface SwipeableItemProps {
  children: React.ReactNode;
  index: number;
  isDone: boolean;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
}

const SwipeableItem = ({ children, index, isDone, onSwipeRight, onSwipeLeft }: SwipeableItemProps) => {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-120, -60, 0, 60, 120], [1, 0.6, 0, 0.6, 1]);
  const checkScale = useTransform(x, [0, 60, 120], [0, 0.8, 1]);
  const editScale = useTransform(x, [-120, -60, 0], [1, 0.8, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipeRight();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="relative overflow-hidden rounded-lg"
    >
      {/* Background reveal — right swipe (check) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-start pl-5 rounded-lg"
        style={{
          opacity: bgOpacity,
          background: "linear-gradient(90deg, hsl(142 72% 50% / 0.15), transparent)",
        }}
      >
        <motion.div style={{ scale: checkScale }}>
          <Check size={22} className="text-primary" />
        </motion.div>
      </motion.div>

      {/* Background reveal — left swipe (edit time) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-5 rounded-lg"
        style={{
          opacity: bgOpacity,
          background: "linear-gradient(270deg, rgba(251,146,60,0.15), transparent)",
        }}
      >
        <motion.div style={{ scale: editScale }}>
          <Clock size={20} style={{ color: "#FB923C" }} />
        </motion.div>
      </motion.div>

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`relative z-10 surface-card px-4 py-3 flex items-start gap-3 cursor-grab active:cursor-grabbing ${
          isDone ? "opacity-50" : ""
        }`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
const getStorageKey = (dayIdx: number) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  return `ham-checklist-${dayIdx}-${dateStr}`;
};

const loadChecked = (dayIdx: number): Set<string> => {
  try {
    const saved = localStorage.getItem(getStorageKey(dayIdx));
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
};

const loadRealTimes = (dayIdx: number): Record<string, string> => {
  try {
    const saved = localStorage.getItem(`ham-checklist-times-${dayIdx}-${new Date().toISOString().slice(0, 10)}`);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};

const Checklist = () => {
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const [checked, setChecked] = useState<Set<string>>(() => loadChecked(getTodayIndex()));
  const [realTimes, setRealTimes] = useState<Record<string, string>>(() => loadRealTimes(getTodayIndex()));
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTimeValue, setEditTimeValue] = useState("");

  // Persist checked items
  useEffect(() => {
    localStorage.setItem(getStorageKey(selectedDay), JSON.stringify([...checked]));
  }, [checked, selectedDay]);

  // Persist real times
  useEffect(() => {
    const key = `ham-checklist-times-${selectedDay}-${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(key, JSON.stringify(realTimes));
  }, [realTimes, selectedDay]);

  const day = rotinaSemanal[selectedDay];

  // Cascade logic: compute adjusted times based on real times
  const adjustedItems: AdjustedItem[] = useMemo(() => {
    let accumulatedDelay = 0; // in minutes

    return day.items.map((item) => {
      const idealMins = parseTime(item.time);

      // If this item has a real time registered, compute its own delay
      if (realTimes[item.id] && idealMins !== null) {
        const realMins = parseTime(realTimes[item.id]);
        if (realMins !== null) {
          accumulatedDelay = realMins - idealMins;
          // This item was explicitly set — show real time, no "adjusted" badge
          return { ...item, adjustedTime: null, deltaMinutes: 0 };
        }
      }

      // If immutable, don't shift
      if (item.immutable || idealMins === null) {
        return { ...item, adjustedTime: null, deltaMinutes: 0 };
      }

      // If there's accumulated delay and item not yet done
      if (accumulatedDelay > 0 && !checked.has(item.id) && !realTimes[item.id]) {
        const shifted = idealMins + accumulatedDelay;
        return {
          ...item,
          adjustedTime: formatMinutes(shifted),
          deltaMinutes: accumulatedDelay,
        };
      }

      return { ...item, adjustedTime: null, deltaMinutes: 0 };
    });
  }, [day.items, realTimes, checked]);

  const totalItems = day.items.length;
  const doneItems = day.items.filter((i) => checked.has(i.id)).length;
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // Remove auto-recorded time
        setRealTimes((rt) => {
          const copy = { ...rt };
          delete copy[id];
          return copy;
        });
      } else {
        next.add(id);
        // Auto-record current time
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
        setRealTimes((rt) => ({ ...rt, [id]: timeStr }));
      }
      return next;
    });
  };

  const openEdit = (item: RotinaItem) => {
    setEditingItem(item.id);
    setEditTimeValue(realTimes[item.id] || item.time);
  };

  const saveEdit = () => {
    if (editingItem && editTimeValue) {
      setRealTimes((prev) => ({ ...prev, [editingItem]: editTimeValue }));
    }
    setEditingItem(null);
    setEditTimeValue("");
  };

  const phrases = [
    "O dia começa agora. Cada check é um voto.",
    "Rotina alimentada. Continue no ritmo.",
    "Mais da metade. Você não para no meio.",
    "Quase lá. Disciplina é liberdade.",
    "Protocolo completo. Você é a máquina.",
  ];
  const getPhrase = (p: number) => {
    if (p === 0) return phrases[0];
    if (p < 40) return phrases[1];
    if (p < 60) return phrases[2];
    if (p < 100) return phrases[3];
    return phrases[4];
  };

  return (
    <div className="p-4 space-y-4">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {rotinaSemanal.map((d, i) => {
          const isToday = i === getTodayIndex();
          const isSelected = i === selectedDay;
          return (
            <button
              key={i}
              onClick={() => {
                setSelectedDay(i);
                setChecked(loadChecked(i));
                setRealTimes(loadRealTimes(i));
              }}
              className="shrink-0 px-3 py-2 rounded-lg border font-mono text-[10px] font-bold tracking-wider transition-all duration-200 active:scale-95"
              style={
                isSelected
                  ? { color: d.pillColor, borderColor: d.pillBorder, background: d.pillBg }
                  : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
              }
            >
              <div>{d.dayShort}</div>
              {isToday && <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-1" />}
            </button>
          );
        })}
      </div>

      {/* Progress header */}
      <motion.div
        key={selectedDay}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-5 border-glow"
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              ROTINA — {day.dayLabel.toUpperCase()}
            </p>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {day.badges.map((b) => (
                <span
                  key={b.label}
                  className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md"
                  style={{ color: b.color, background: b.bg }}
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>
          <span className="font-mono text-xs text-primary font-bold">
            {doneItems}/{totalItems}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mt-3">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-3xl font-extrabold text-primary text-glow">{pct}%</span>
          <span className="font-mono text-[10px] text-muted-foreground text-right max-w-[60%] leading-relaxed">
            {getPhrase(pct)}
          </span>
        </div>
      </motion.div>

      {/* Swipe hint */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground/40">
          <ChevronRight size={10} />
          <span>DESLIZAR → CONCLUIR</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground/40">
          <span>EDITAR HORÁRIO ← DESLIZAR</span>
          <ChevronLeft size={10} />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        <AnimatePresence initial={false}>
        {adjustedItems.map((item, i) => {
          const isDone = checked.has(item.id);
          const hasRealTime = !!realTimes[item.id];
          const isAdjusted = item.adjustedTime !== null && item.deltaMinutes > 0;
          const canEditTime = !item.immutable && parseTime(item.time) !== null;

          // Progressive reveal: first item always visible, others only after previous is checked
          const isVisible = i === 0 || checked.has(adjustedItems[i - 1].id);
          if (!isVisible) return null;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
            <SwipeableItem
              key={item.id}
              index={i}
              isDone={isDone}
              onSwipeRight={() => { if (!isDone) toggle(item.id); }}
              onSwipeLeft={() => { if (!isDone && canEditTime) openEdit(item); }}
            >
              {/* Check circle */}
              <button
                onClick={() => toggle(item.id)}
                className="w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all active:scale-90"
                style={
                  isDone
                    ? { background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))" }
                    : { borderColor: "hsl(var(--muted-foreground) / 0.3)" }
                }
              >
                <AnimatePresence>
                  {isDone && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check size={14} className="text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Time column */}
              <div className="w-12 shrink-0 mt-0.5">
                {hasRealTime ? (
                  <span className="font-mono text-xs block" style={{ color: "#FB923C" }}>
                    {realTimes[item.id]}
                  </span>
                ) : isAdjusted ? (
                  <span className="font-mono text-[10px] block" style={{ color: "#FB923C" }}>
                    → {item.adjustedTime}
                  </span>
                ) : (
                  <span className="font-mono text-xs block text-muted-foreground/30">--:--</span>
                )}
              </div>

              {/* Dot */}
              <div
                className="w-2 h-2 rounded-full shrink-0 mt-2"
                style={{ background: item.dotColor, boxShadow: item.alert ? `0 0 6px ${item.dotColor}` : undefined }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono text-sm block ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.label}
                  </span>
                  {isAdjusted && !isDone && (
                    <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: "#FB923C", background: "rgba(251,146,60,0.12)" }}>
                      +{item.deltaMinutes}min
                    </span>
                  )}
                  {item.immutable && (
                    <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: "#C084FC", background: "rgba(192,132,252,0.1)" }}>
                      IMÓVEL
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/60 block mt-0.5">{item.detail}</span>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1.5">
                    {item.tags.map((t) => (
                      <span key={t.label} className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ color: t.color, background: `${t.color}15` }}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </SwipeableItem>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>

      {/* Diet Suggestions */}
      {(() => {
        const dieta = dietaSemanal[selectedDay];
        if (!dieta) return null;

        // Find current/next meal based on time
        const now = new Date();
        const nowMins = now.getHours() * 60 + now.getMinutes();
        const currentMealIdx = dieta.refeicoes.reduce((best, ref, idx) => {
          const m = ref.time.match(/^(\d{1,2}):(\d{2})$/);
          if (!m) return best;
          const refMins = parseInt(m[1]) * 60 + parseInt(m[2]);
          if (refMins <= nowMins) return idx;
          return best;
        }, 0);

        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center gap-2 px-1">
              <Utensils size={14} className="text-primary" />
              <span className="font-mono text-xs font-bold tracking-widest text-foreground">
                ALIMENTAÇÃO — {dieta.titulo}
              </span>
            </div>

            <div className="space-y-2">
              {dieta.refeicoes.map((ref, idx) => {
                const isCurrent = selectedDay === getTodayIndex() && idx === currentMealIdx;
                return (
                  <motion.details
                    key={ref.time + ref.label}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`surface-card rounded-lg group ${isCurrent ? "ring-1 ring-primary/30" : ""}`}
                    {...(isCurrent ? { open: true } : {})}
                  >
                    <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: ref.dotColor }}
                      />
                      <span className="font-mono text-xs text-muted-foreground w-11 shrink-0">
                        {ref.time}
                      </span>
                      <span className="font-mono text-sm text-foreground flex-1">
                        {ref.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          AGORA
                        </span>
                      )}
                      <ChevronDown size={14} className="text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="px-4 pb-3 pt-1 space-y-2">
                      {ref.subtitle && (
                        <p className="font-mono text-[10px] font-bold text-primary tracking-wide">
                          {ref.subtitle}
                        </p>
                      )}
                      <div className="space-y-1">
                        {ref.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm">{item.emoji}</span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                      {ref.tip && (
                        <p className="font-mono text-[10px] text-primary/80 mt-1.5 border-l-2 border-primary/20 pl-2">
                          → {ref.tip}
                        </p>
                      )}
                    </div>
                  </motion.details>
                );
              })}
            </div>

            {/* Rules & hydration */}
            {(dieta.regras.length > 0 || dieta.hidratacao) && (
              <div className="surface-card rounded-lg p-4 space-y-3">
                {dieta.regras.map((regra, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle size={12} style={{ color: "#F87171" }} />
                      <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: "#F87171" }}>
                        {regra.title}
                      </span>
                    </div>
                    {regra.items.map((item, j) => (
                      <p key={j} className="font-mono text-[10px] text-muted-foreground ml-5">
                        ✕ {item}
                      </p>
                    ))}
                  </div>
                ))}
                {dieta.hidratacao && (
                  <div className="flex items-center gap-2">
                    <Droplets size={12} style={{ color: "#60A5FA" }} />
                    <span className="font-mono text-[10px] text-muted-foreground">
                      <span className="font-bold text-foreground">HIDRATAÇÃO:</span> {dieta.hidratacao}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* Edit time modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="surface-card p-6 border-glow w-[300px] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs font-bold tracking-widest text-foreground">
                  HORÁRIO REAL
                </p>
                <button onClick={() => setEditingItem(null)} className="active:scale-90">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">
                Que horas você realmente fez "{day.items.find((i) => i.id === editingItem)?.label}"?
              </p>
              <input
                type="time"
                value={editTimeValue}
                onChange={(e) => setEditTimeValue(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-mono text-lg text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (editingItem) {
                      setRealTimes((prev) => {
                        const next = { ...prev };
                        delete next[editingItem];
                        return next;
                      });
                    }
                    setEditingItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-border font-mono text-xs text-muted-foreground active:scale-95"
                >
                  LIMPAR
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold active:scale-95"
                >
                  SALVAR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checklist;
