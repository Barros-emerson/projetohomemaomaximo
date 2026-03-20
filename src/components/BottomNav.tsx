import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Dumbbell,
  Plus,
  Zap,
  User,
  StickyNote,
  X,
  ClipboardList,
} from "lucide-react";

const mainTabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/rotina", icon: Zap, label: "Rotina" },
  { path: "__fab__", icon: Plus, label: "" },
  { path: "/treino", icon: Dumbbell, label: "Treino" },
  { path: "/perfil", icon: User, label: "Perfil" },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFab, setShowFab] = useState(false);

  return (
    <>
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
                onClick={() => { navigate("/rotina"); setShowFab(false); }}
                className="surface-card border-glow px-5 py-3 flex items-center gap-2 text-accent font-mono text-xs font-bold tracking-wider active:scale-95 transition-transform"
              >
                <Zap size={16} />
                CHECK
              </button>
              <button
                onClick={() => { navigate("/notas"); setShowFab(false); }}
                className="surface-card border-glow px-5 py-3 flex items-center gap-2 text-primary font-mono text-xs font-bold tracking-wider active:scale-95 transition-transform"
              >
                <StickyNote size={16} />
                NOTA
              </button>
              <button
                onClick={() => { navigate("/tarefas"); setShowFab(false); }}
                className="surface-card border-glow px-5 py-3 flex items-center gap-2 font-mono text-xs font-bold tracking-wider active:scale-95 transition-transform text-blue-400"
              >
                <ClipboardList size={16} />
                TAREFA
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
                  onClick={() => setShowFab(!showFab)}
                  className={`w-12 h-12 -mt-5 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                    showFab
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground shadow-lg"
                  }`}
                  style={!showFab ? { boxShadow: "0 4px 20px hsl(142 72% 50% / 0.4)" } : undefined}
                >
                  {showFab ? <X size={22} /> : <Plus size={22} strokeWidth={3} />}
                </button>
              );
            }

            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setShowFab(false); }}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
