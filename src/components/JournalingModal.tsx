import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Trophy, Lightbulb, Sunrise, X, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

interface JournalingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function JournalingModal({ open, onClose }: JournalingModalProps) {
  const [vitoria1, setVitoria1] = useState("");
  const [vitoria2, setVitoria2] = useState("");
  const [vitoria3, setVitoria3] = useState("");
  const [aprendizado, setAprendizado] = useState("");
  const [planoAmanha, setPlanoAmanha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [jaPreenchido, setJaPreenchido] = useState(false);

  const dataHoje = hoje();

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const { data } = await supabase.from("journaling").select("*").eq("data", dataHoje).limit(1);
      if (data && data.length > 0) {
        const j = data[0];
        setVitoria1(j.vitoria_1 || "");
        setVitoria2(j.vitoria_2 || "");
        setVitoria3(j.vitoria_3 || "");
        setAprendizado(j.aprendizado || "");
        setPlanoAmanha(j.plano_amanha || "");
        setJaPreenchido(true);
      } else {
        setVitoria1(""); setVitoria2(""); setVitoria3("");
        setAprendizado(""); setPlanoAmanha("");
        setJaPreenchido(false);
      }
    };
    load();
  }, [open, dataHoje]);

  const salvar = async () => {
    setSalvando(true);
    try {
      await supabase.from("journaling").upsert({
        data: dataHoje,
        vitoria_1: vitoria1,
        vitoria_2: vitoria2,
        vitoria_3: vitoria3,
        aprendizado,
        plano_amanha: planoAmanha
      }, { onConflict: "data" });
      toast.success("Journaling salvo! 🌙");
      onClose();
    } catch {
      toast.error("Erro ao salvar");
    }
    setSalvando(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 space-y-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon size={18} className="text-primary" />
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary">JOURNALING NOTURNO</span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
          </div>

          <p className="font-mono text-[10px] text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>

          {/* 3 Vitórias */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Trophy size={14} className="text-amber-400" />
              <span className="font-mono text-[9px] font-bold tracking-widest text-amber-400">3 VITÓRIAS DO DIA</span>
            </div>
            <div className="space-y-1.5">
              {[
                { val: vitoria1, set: setVitoria1, n: "1ª" },
                { val: vitoria2, set: setVitoria2, n: "2ª" },
                { val: vitoria3, set: setVitoria3, n: "3ª" },
              ].map(({ val, set, n }) => (
                <div key={n} className="flex items-center gap-2 rounded-xl p-2.5" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--secondary) / 0.3)" }}>
                  <span className="font-mono text-[9px] text-amber-400 font-bold w-5">{n}</span>
                  <input value={val} onChange={e => set(e.target.value)} placeholder={`${n} vitória...`}
                    className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none" />
                </div>
              ))}
            </div>
          </div>

          {/* Aprendizado */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb size={14} className="text-blue-400" />
              <span className="font-mono text-[9px] font-bold tracking-widest text-blue-400">APRENDIZADO DO DIA</span>
            </div>
            <textarea value={aprendizado} onChange={e => setAprendizado(e.target.value)} placeholder="O que aprendi hoje..."
              className="w-full rounded-xl p-3 bg-secondary/30 border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none min-h-[60px]" />
          </div>

          {/* Plano Amanhã */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sunrise size={14} className="text-primary" />
              <span className="font-mono text-[9px] font-bold tracking-widest text-primary">PLANO PARA AMANHÃ</span>
            </div>
            <textarea value={planoAmanha} onChange={e => setPlanoAmanha(e.target.value)} placeholder="O que vou focar amanhã..."
              className="w-full rounded-xl p-3 bg-secondary/30 border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none min-h-[60px]" />
          </div>

          {/* Salvar */}
          <button onClick={salvar} disabled={salvando}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold tracking-widest active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {salvando ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {jaPreenchido ? "ATUALIZAR" : "SALVAR"} JOURNALING
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
