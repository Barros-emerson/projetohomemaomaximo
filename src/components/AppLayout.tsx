import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { motion } from "framer-motion";

export const AppLayout = () => {
  const location = useLocation();
  const [userPhoto, setUserPhoto] = useState<string | null>(() =>
    localStorage.getItem("ham-user-photo")
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setUserPhoto(result);
      localStorage.setItem("ham-user-photo", result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer relative group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt="Perfil"
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-all">
                  <span className="font-mono text-primary font-bold text-xs">EB</span>
                </div>
              )}
            </label>
            <span className="font-semibold text-sm tracking-tight text-foreground">
              HOMEM AO <span className="text-gradient font-bold">MÁXIMO</span>
            </span>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-wider">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase().replace('.', '')}
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
