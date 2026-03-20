import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { motion } from "framer-motion";

export const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background tactical-grid flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="font-mono text-primary-foreground font-extrabold text-sm">M</span>
            </div>
            <span className="font-mono font-bold text-sm tracking-widest text-foreground">
              HOMEM AO <span className="text-primary">MÁXIMO</span>
            </span>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};
