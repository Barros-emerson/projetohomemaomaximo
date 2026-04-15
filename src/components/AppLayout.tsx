import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Bell, X, Check, Trash2 } from "lucide-react";

interface Tarefa {
  id: string;
  text: string;
  done: boolean;
  category: string;
  createdAt: string;
}

const loadTarefas = (): Tarefa[] => {
  const saved = localStorage.getItem("ham-tarefas");
  return saved ? JSON.parse(saved) : [];
};

const getCatColor = (cat: string) => {
  const map: Record<string, string> = {
    "Saúde": "hsl(var(--primary))",
    "Trabalho": "hsl(var(--accent))",
    "Família": "hsl(215 75% 60%)",
    "Espiritual": "hsl(270 55% 65%)",
  };
  return map[cat] || "hsl(var(--muted-foreground))";
};

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [now, setNow] = useState(new Date());
  const [showTarefas, setShowTarefas] = useState(false);
  const [tarefas, setTarefas] = useState<Tarefa[]>(loadTarefas);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync tarefas from localStorage on route change or focus
  useEffect(() => {
    setTarefas(loadTarefas());
  }, [location.pathname]);

  useEffect(() => {
    const onFocus = () => setTarefas(loadTarefas());
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, []);

  const pendingCount = tarefas.filter((t) => !t.done).length;

  const toggleTarefa = (id: string) => {
    const tarefa = tarefas.find((t) => t.id === id);
    if (tarefa && !tarefa.done) {
      // Vibração
      if (navigator.vibrate) navigator.vibrate(50);
      // Som
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.15;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.15);
      } catch {}
    }
    const updated = tarefas.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTarefas(updated);
    localStorage.setItem("ham-tarefas", JSON.stringify(updated));
  };

  const removeTarefa = (id: string) => {
    const updated = tarefas.filter((t) => t.id !== id);
    setTarefas(updated);
    localStorage.setItem("ham-tarefas", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 active:scale-95 transition-transform">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              HOMEM <span className="text-gradient font-bold">DE VERDADE</span>
            </span>
          </button>
          <div className="flex items-center gap-3">
            {/* Bell / Tarefas */}
            <button
              onClick={() => setShowTarefas(!showTarefas)}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-secondary text-foreground hover:bg-secondary/80 transition-colors active:scale-90"
            >
              <Bell size={15} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary text-foreground hover:bg-secondary/80 transition-colors active:scale-90"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider">
              {now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase().replace('.', '')}
            </div>
          </div>
        </div>
      </header>

      {/* Tarefas dropdown */}
      <AnimatePresence>
        {showTarefas && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[57px] left-0 right-0 z-40 px-4"
          >
            <div className="max-w-lg mx-auto bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-foreground uppercase">
                  Tarefas Pendentes
                </span>
                <button onClick={() => setShowTarefas(false)} className="active:scale-90">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {tarefas.filter((t) => !t.done).length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="font-mono text-[11px] text-muted-foreground">Nenhuma tarefa pendente 🎉</p>
                  </div>
                ) : (
                  tarefas
                    .filter((t) => !t.done)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0"
                      >
                        <button
                          onClick={() => toggleTarefa(t.id)}
                          className="w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center active:scale-90 transition-all"
                          style={{ borderColor: getCatColor(t.category) }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-foreground truncate">{t.text}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="font-mono text-[9px]" style={{ color: getCatColor(t.category) }}>
                              {t.category.toUpperCase()}
                            </p>
                            <span className="font-mono text-[8px] text-muted-foreground">{t.createdAt}</span>
                          </div>
                        </div>
                        <button onClick={() => removeTarefa(t.id)} className="active:scale-90 p-1">
                          <Trash2 size={12} className="text-muted-foreground/30" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
};
