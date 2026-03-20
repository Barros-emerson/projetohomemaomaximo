import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Dumbbell,
  Plus,
  Zap,
  Grid3X3,
  BookOpen,
  StickyNote,
  BarChart3,
  Settings,
  ClipboardList,
  X,
} from "lucide-react";

const mainTabs = [
  { path: "/", icon: Home, label: "Hoje" },
  { path: "/treino", icon: Dumbbell, label: "Treino" },
  { path: "__fab__", icon: Plus, label: "" },
  { path: "/rotina", icon: Zap, label: "Rotina" },
  { path: "__mais__", icon: Grid3X3, label: "Mais" },
];

const moreItems = [
  { path: "/tarefas", icon: ClipboardList, label: "Tarefas" },
  { path: "/biblia", icon: BookOpen, label: "Bíblia" },
  { path: "/notas", icon: StickyNote, label: "Notas" },
  { path: "/performance", icon: BarChart3, label: "Performance" },
  { path: "/config", icon: Settings, label: "Config" },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const [showFab, setShowFab] = useState(false);

  const isMoreActive = moreItems.some((m) => location.pathname === m.path);

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-20 right-3 left-3 max-w-lg mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="surface-card p-3 border-glow grid grid-cols-5 gap-1">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setShowMore(false);
                      }}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-lg transition-all duration-200 active:scale-95 ${
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                      <span className="text-[10px] font-mono font-medium tracking-wider">
                        {item.label.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB quick actions overlay */}
      <AnimatePresence>
        {showFab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowFab(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  navigate("/rotina");
                  setShowFab(false);
                }}
                className="surface-card border-glow px-5 py-3 flex items-center gap-2 text-accent font-mono text-xs font-bold tracking-wider active:scale-95 transition-transform"
              >
                <Zap size={16} />
                CHECKLIST
              </button>
              <button
                onClick={() => {
                  navigate("/notas");
                  setShowFab(false);
                }}
                className="surface-card border-glow px-5 py-3 flex items-center gap-2 text-primary font-mono text-xs font-bold tracking-wider active:scale-95 transition-transform"
              >
                <StickyNote size={16} />
                NOTA
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-lg mx-auto flex items-center justify-around py-1.5">
          {mainTabs.map((item) => {
            if (item.path === "__fab__") {
              return (
                <button
                  key="fab"
                  onClick={() => {
                    setShowFab(!showFab);
                    setShowMore(false);
                  }}
                  className={`w-12 h-12 -mt-5 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                    showFab
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground shadow-lg"
                  }`}
                  style={
                    !showFab
                      ? { boxShadow: "0 4px 20px hsl(142 72% 50% / 0.4)" }
                      : undefined
                  }
                >
                  {showFab ? <X size={22} /> : <Plus size={22} strokeWidth={3} />}
                </button>
              );
            }

            if (item.path === "__mais__") {
              return (
                <button
                  key="mais"
                  onClick={() => {
                    setShowMore(!showMore);
                    setShowFab(false);
                  }}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                    showMore || isMoreActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3X3
                    size={20}
                    strokeWidth={showMore || isMoreActive ? 2.5 : 1.5}
                  />
                  <span className="text-[10px] font-mono font-medium tracking-wider">
                    MAIS
                  </span>
                </button>
              );
            }

            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setShowMore(false);
                  setShowFab(false);
                }}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-mono font-medium tracking-wider">
                  {item.label.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
