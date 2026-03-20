import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Dumbbell,
  Moon,
  History,
  Settings,
} from "lucide-react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/checklist", icon: CheckSquare, label: "Checklist" },
  { path: "/treino", icon: Dumbbell, label: "Treino" },
  { path: "/sono", icon: Moon, label: "Sono" },
  { path: "/historico", icon: History, label: "Histórico" },
  { path: "/config", icon: Settings, label: "Config" },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "text-primary glow-primary"
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
  );
};
