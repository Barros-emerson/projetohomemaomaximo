import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { rotinaSemanal, type RotinaDia } from "@/data/rotina-diaria";

const getTodayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

const Checklist = () => {
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const day = rotinaSemanal[selectedDay];
  const totalItems = day.items.length;
  const doneItems = day.items.filter((i) => checked.has(i.id)).length;
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
                setChecked(new Set());
              }}
              className="shrink-0 px-3 py-2 rounded-lg border font-mono text-[10px] font-bold tracking-wider transition-all duration-200 active:scale-95"
              style={
                isSelected
                  ? { color: d.pillColor, borderColor: d.pillBorder, background: d.pillBg }
                  : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
              }
            >
              <div>{d.dayShort}</div>
              {isToday && (
                <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-1" />
              )}
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
            <p className="font-mono text-xs text-muted-foreground tracking-widest">ROTINA — {day.dayLabel.toUpperCase()}</p>
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
          <span className="font-mono text-xs text-primary font-bold">{doneItems}/{totalItems}</span>
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

      {/* Timeline */}
      <div className="space-y-1">
        {day.items.map((item, i) => {
          const isDone = checked.has(item.id);
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => toggle(item.id)}
              className={`w-full surface-card px-4 py-3 flex items-start gap-3 transition-all duration-200 text-left active:scale-[0.98] ${
                isDone ? "opacity-50" : ""
              }`}
            >
              {/* Check circle */}
              <div
                className="w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
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
              </div>

              {/* Time */}
              <span className="font-mono text-xs text-muted-foreground w-11 shrink-0 mt-0.5" style={item.alert ? { color: "#F5C542" } : undefined}>
                {item.time}
              </span>

              {/* Dot */}
              <div
                className="w-2 h-2 rounded-full shrink-0 mt-2"
                style={{ background: item.dotColor, boxShadow: item.alert ? `0 0 6px ${item.dotColor}` : undefined }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className={`font-mono text-sm block ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {item.label}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/60 block mt-0.5">
                  {item.detail}
                </span>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1.5">
                    {item.tags.map((t) => (
                      <span
                        key={t.label}
                        className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                        style={{ color: t.color, background: `${t.color}15` }}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Checklist;
