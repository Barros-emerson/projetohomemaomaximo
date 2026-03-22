import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export const AppLayout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="font-semibold text-sm tracking-tight text-foreground">
            PROJETO <span className="text-gradient font-bold">ALFA 1000</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary text-foreground hover:bg-secondary/80 transition-colors active:scale-90"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase().replace('.', '')}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};
