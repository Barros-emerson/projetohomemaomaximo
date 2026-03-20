import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Plus, Check, Trash2, ChevronDown } from "lucide-react";

interface Tarefa {
  id: string;
  text: string;
  done: boolean;
  category: string;
  createdAt: string;
}

const CATEGORIES = [
  { label: "Geral", color: "hsl(var(--muted-foreground))" },
  { label: "Saúde", color: "hsl(var(--primary))" },
  { label: "Trabalho", color: "hsl(var(--accent))" },
  { label: "Família", color: "hsl(215 75% 60%)" },
  { label: "Espiritual", color: "hsl(270 55% 65%)" },
];

const loadTarefas = (): Tarefa[] => {
  const saved = localStorage.getItem("ham-tarefas");
  return saved ? JSON.parse(saved) : [];
};

const Tarefas = () => {
  const [tarefas, setTarefas] = useState<Tarefa[]>(loadTarefas);
  const [newText, setNewText] = useState("");
  const [newCat, setNewCat] = useState("Geral");
  const [showAdd, setShowAdd] = useState(false);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    localStorage.setItem("ham-tarefas", JSON.stringify(tarefas));
  }, [tarefas]);

  const addTarefa = () => {
    if (!newText.trim()) return;
    const t: Tarefa = {
      id: Date.now().toString(),
      text: newText.trim(),
      done: false,
      category: newCat,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    setTarefas((prev) => [t, ...prev]);
    setNewText("");
    setShowAdd(false);
  };

  const toggle = (id: string) =>
    setTarefas((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) =>
    setTarefas((prev) => prev.filter((t) => t.id !== id));

  const pending = tarefas.filter((t) => !t.done);
  const done = tarefas.filter((t) => t.done);

  const getCatColor = (cat: string) =>
    CATEGORIES.find((c) => c.label === cat)?.color || "hsl(var(--muted-foreground))";

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-accent" />
          <h2 className="font-mono text-xs font-bold tracking-[0.15em] text-foreground uppercase">
            Tarefas
          </h2>
          <span className="font-mono text-[10px] text-muted-foreground">{pending.length} pendentes</span>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={16} className="text-accent" />
        </button>
      </motion.div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="surface-card p-4 space-y-3">
              <input
                autoFocus
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTarefa()}
                placeholder="Nova tarefa..."
                className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setNewCat(c.label)}
                    className="px-2.5 py-1 rounded-lg font-mono text-[9px] font-bold tracking-wider border transition-all active:scale-95"
                    style={
                      newCat === c.label
                        ? { borderColor: c.color, color: c.color, background: `${c.color}15` }
                        : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
                    }
                  >
                    {c.label.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAdd(false); setNewText(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-border font-mono text-[10px] font-bold tracking-wider text-muted-foreground active:scale-95"
                >
                  CANCELAR
                </button>
                <button
                  onClick={addTarefa}
                  className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground font-mono text-[10px] font-bold tracking-wider active:scale-95"
                >
                  ADICIONAR
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending */}
      {pending.length === 0 && !showAdd && (
        <div className="surface-card p-8 text-center">
          <ClipboardList size={28} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-mono text-[11px] text-muted-foreground">Nenhuma tarefa pendente.</p>
        </div>
      )}

      <div className="space-y-1">
        {pending.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="surface-card px-4 py-3 flex items-center gap-3"
          >
            <button
              onClick={() => toggle(t.id)}
              className="w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center active:scale-90 transition-all"
              style={{ borderColor: getCatColor(t.category) }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs text-foreground">{t.text}</p>
              <p className="font-mono text-[9px] mt-0.5" style={{ color: getCatColor(t.category) }}>
                {t.category.toUpperCase()}
              </p>
            </div>
            <button onClick={() => remove(t.id)} className="active:scale-90 p-1">
              <Trash2 size={12} className="text-muted-foreground/30" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div>
          <button
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-2 px-1 py-2 active:scale-95"
          >
            <ChevronDown
              size={12}
              className={`text-muted-foreground transition-transform ${showDone ? "rotate-180" : ""}`}
            />
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              CONCLUÍDAS ({done.length})
            </span>
          </button>
          <AnimatePresence>
            {showDone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                {done.map((t) => (
                  <div
                    key={t.id}
                    className="surface-card px-4 py-3 flex items-center gap-3 opacity-40"
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: getCatColor(t.category) }}
                    >
                      <Check size={12} className="text-background" />
                    </div>
                    <p className="font-mono text-xs text-foreground line-through flex-1">{t.text}</p>
                    <button onClick={() => remove(t.id)} className="active:scale-90 p-1">
                      <Trash2 size={12} className="text-muted-foreground/30" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Tarefas;
