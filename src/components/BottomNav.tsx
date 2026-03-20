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
  BookOpen,
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
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { path: "/rotina", icon: Zap, label: "CHECK", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
                { path: "/biblia", icon: BookOpen, label: "BÍBLIA", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
                { path: "/notas", icon: StickyNote, label: "NOTA", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
                { path: "/tarefas", icon: ClipboardList, label: "TAREFA", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setShowFab(false); }}
                  className={`${item.bg} border rounded-2xl px-4 py-3 flex flex-col items-center gap-1.5 ${item.color} font-mono text-[9px] font-bold tracking-wider active:scale-95 transition-transform`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {mainTabs.map((item) => {
            if (item.path === "__fab__") {
              return (
                <button
                  key="fab"
                  onClick={() => setShowFab(!showFab)}
                  className={`w-12 h-12 -mt-6 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                    showFab
                      ? "bg-muted text-muted-foreground rotate-45"
                      : "bg-primary text-primary-foreground"
                  }`}
                  style={!showFab ? { boxShadow: "0 4px 20px hsl(152 60% 52% / 0.3)" } : undefined}
                >
                  {showFab ? <X size={20} /> : <Plus size={20} strokeWidth={2.5} />}
                </button>
              );
            }

            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setShowFab(false); }}
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
                <span className="text-[9px] font-medium tracking-wider">
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
