import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { rotinaSemanal } from "@/data/rotina-diaria";
import { loadCheckedFromDB } from "@/hooks/useChecklistDB";

const getTodayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

const formatDate = () => {
  const now = new Date();
  return now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).toUpperCase();
};

export default function Index() {
  const navigate = useNavigate();
  const todayIdx = getTodayIndex();
  const day = rotinaSemanal[todayIdx];

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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

  const applicableItems = day.items.filter((i) => !skipped.has(i.id));
  const totalItems = applicableItems.length;
  const doneCount = applicableItems.filter((i) => checked.has(i.id)).length;
  const pct = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top date */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="pt-8 px-6"
      >
        <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
          {formatDate()}
        </p>
      </motion.div>

      {/* Main question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="px-6 pt-10 pb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
          Você está vivendo como
          <br />
          um <span className="text-primary">homem de verdade</span>
          <br />
          hoje?
        </h1>
      </motion.div>

      {/* Progress line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-6 pb-6"
      >
        <div className="flex items-end justify-between mb-2">
          <span className="font-mono text-xs text-muted-foreground tracking-wider">
            PROTOCOLO DO DIA
          </span>
          <span className="font-mono text-xs text-foreground font-bold">
            {pct}%
          </span>
        </div>
        <div className="w-full h-1 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[10px] text-muted-foreground">
            {doneCount}/{totalItems}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {totalItems - doneCount} restantes
          </span>
        </div>
      </motion.div>

      {/* Checklist */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate={loading ? "hidden" : "show"}
        className="flex-1 px-6 pb-6 space-y-0"
      >
        {day.items.map((item) => {
          const isDone = checked.has(item.id);
          const isItemSkipped = skipped.has(item.id);
          return (
            <motion.div
              key={item.id}
              variants={fadeUp}
              className={`flex items-center gap-3 py-3 border-b border-secondary/60 last:border-b-0 ${isItemSkipped ? "opacity-30" : ""}`}
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                  isItemSkipped ? "bg-muted-foreground/30" : isDone ? "bg-primary" : "bg-secondary"
                }`}
              />
              <span
                className={`font-mono text-xs w-11 shrink-0 ${
                  isDone || isItemSkipped
                    ? "text-muted-foreground/40 line-through"
                    : "text-muted-foreground"
                }`}
              >
                {item.time}
              </span>
              <span
                className={`text-sm font-medium flex-1 ${
                  isDone || isItemSkipped
                    ? "text-muted-foreground/40 line-through"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </span>
              {isDone && <span className="font-mono text-[10px] text-primary/60">✓</span>}
              {isItemSkipped && <span className="font-mono text-[10px] text-muted-foreground/40">—</span>}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-6 pb-8 flex gap-3"
      >
        <button
          onClick={() => navigate("/foco")}
          className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold tracking-widest active:scale-[0.97] transition-transform"
        >
          MODO FOCO
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex-1 py-3.5 rounded-xl border border-border text-foreground font-mono text-xs font-bold tracking-widest active:scale-[0.97] transition-transform"
        >
          PAINEL
        </button>
      </motion.div>
    </div>
  );
}
