import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, X, Trash2, Check, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Habito {
  id: string;
  titulo: string;
  icone: string;
  cor: string;
  ativo: boolean;
  streak_atual: number;
  maior_streak: number;
}

interface Checkin {
  habito_id: string;
  data: string;
  feito: boolean;
}

const EMOJIS = ["🔥", "💪", "🧘", "📖", "💧", "🏃", "🧠", "⚡", "🌅", "💎", "🎯", "✨"];
const CORES = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"];

const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getLast7Days = () => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return days;
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

export default function Habitos() {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [criando, setCriando] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoIcone, setNovoIcone] = useState("🔥");
  const [novoCor, setNovoCor] = useState("#10B981");
  const dataHoje = hoje();
  const last7 = getLast7Days();

  const load = useCallback(async () => {
    const [{ data: hab }, { data: chk }] = await Promise.all([
      supabase.from("habitos").select("*").eq("ativo", true).order("created_at"),
      supabase.from("habitos_checkins").select("habito_id, data, feito").gte("data", last7[0]).lte("data", last7[6])
    ]);
    if (hab) setHabitos(hab as Habito[]);
    if (chk) setCheckins(chk as Checkin[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const criar = async () => {
    if (!novoTitulo.trim()) return;
    await supabase.from("habitos").insert({ titulo: novoTitulo.trim(), icone: novoIcone, cor: novoCor });
    setNovoTitulo(""); setCriando(false);
    toast.success("Hábito criado!");
    load();
  };

  const toggleCheckin = async (habitoId: string) => {
    const existing = checkins.find(c => c.habito_id === habitoId && c.data === dataHoje);
    if (existing) {
      await supabase.from("habitos_checkins").delete().eq("habito_id", habitoId).eq("data", dataHoje);
    } else {
      await supabase.from("habitos_checkins").insert({ habito_id: habitoId, data: dataHoje });
    }
    // Recalcular streak
    await recalcularStreak(habitoId);
    load();
  };

  const recalcularStreak = async (habitoId: string) => {
    const { data: allCheckins } = await supabase.from("habitos_checkins")
      .select("data").eq("habito_id", habitoId).eq("feito", true).order("data", { ascending: false });
    
    let streak = 0;
    if (allCheckins) {
      const d = new Date();
      for (let i = 0; i < 365; i++) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (allCheckins.some(c => c.data === dateStr)) {
          streak++;
        } else if (i > 0) break; // Allow today to not be checked yet
        else break;
        d.setDate(d.getDate() - 1);
      }
    }
    const habito = habitos.find(h => h.id === habitoId);
    const maiorStreak = Math.max(streak, habito?.maior_streak || 0);
    await supabase.from("habitos").update({ streak_atual: streak, maior_streak: maiorStreak }).eq("id", habitoId);
  };

  const deletar = async (id: string) => {
    await supabase.from("habitos").delete().eq("id", id);
    load();
  };

  const isChecked = (habitoId: string, data: string) => checkins.some(c => c.habito_id === habitoId && c.data === data && c.feito);
  const checkedToday = habitos.filter(h => isChecked(h.id, dataHoje)).length;
  const totalHabitos = habitos.length;

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.05 }} className="min-h-screen bg-background pb-24 px-4 pt-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-primary font-bold">HÁBITOS</p>
          <p className="text-xl font-bold text-foreground mt-1">Consistência diária</p>
        </div>
        <button onClick={() => setCriando(!criando)}
          className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary active:scale-95 transition-transform"
        >{criando ? <X size={18} /> : <Plus size={18} />}</button>
      </motion.div>

      {/* Resumo */}
      {totalHabitos > 0 && (
        <motion.div variants={fadeUp} className="surface-card p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-primary" />
            <span className="font-mono text-xs text-foreground">{checkedToday}/{totalHabitos} hoje</span>
          </div>
          <div className="flex-1 mx-3">
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${totalHabitos > 0 ? (checkedToday / totalHabitos) * 100 : 0}%` }} />
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold text-primary">{totalHabitos > 0 ? Math.round((checkedToday / totalHabitos) * 100) : 0}%</span>
        </motion.div>
      )}

      {/* Criar */}
      <AnimatePresence>
        {criando && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="surface-card p-4 space-y-3">
              <input value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} onKeyDown={e => e.key === "Enter" && criar()} placeholder="Nome do hábito..." className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none" />
              <div>
                <p className="font-mono text-[9px] text-muted-foreground tracking-widest mb-1.5">ÍCONE</p>
                <div className="flex gap-1.5 flex-wrap">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setNovoIcone(e)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all active:scale-90"
                      style={novoIcone === e ? { background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)" } : { border: "1px solid hsl(var(--border))" }}
                    >{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono text-[9px] text-muted-foreground tracking-widest mb-1.5">COR</p>
                <div className="flex gap-1.5">
                  {CORES.map(c => (
                    <button key={c} onClick={() => setNovoCor(c)}
                      className="w-7 h-7 rounded-full transition-all active:scale-90"
                      style={{ background: c, border: novoCor === c ? "3px solid hsl(var(--foreground))" : "2px solid transparent", opacity: novoCor === c ? 1 : 0.5 }}
                    />
                  ))}
                </div>
              </div>
              <button onClick={criar} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold tracking-widest active:scale-95 transition-transform">CRIAR HÁBITO</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Hábitos */}
      <div className="space-y-2">
        {habitos.map(h => (
          <motion.div key={h.id} variants={fadeUp} className="surface-card p-3">
            <div className="flex items-center gap-3">
              {/* Check hoje */}
              <button onClick={() => toggleCheckin(h.id)}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90"
                style={isChecked(h.id, dataHoje)
                  ? { background: h.cor, color: "#fff" }
                  : { border: `2px solid ${h.cor}40` }
                }
              >
                {isChecked(h.id, dataHoje) ? <Check size={18} /> : <span className="text-lg">{h.icone}</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold text-foreground">{h.titulo}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {h.streak_atual > 0 && (
                    <span className="font-mono text-[9px] font-bold flex items-center gap-0.5" style={{ color: h.cor }}>
                      <Flame size={10} />{h.streak_atual} dias
                    </span>
                  )}
                  {h.maior_streak > 0 && (
                    <span className="font-mono text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <TrendingUp size={9} />max {h.maior_streak}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => deletar(h.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors shrink-0"><Trash2 size={12} /></button>
            </div>
            {/* Mini heatmap 7 dias */}
            <div className="flex gap-1.5 mt-2 justify-end items-center">
              {last7.map(day => (
                <div key={day} className="flex flex-col items-center gap-0.5">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {isChecked(h.id, day) ? <Check size={14} style={{ color: h.cor }} /> : <span className="text-muted-foreground/20 text-[10px]">·</span>}
                  </div>
                  <span className="text-[7px] text-muted-foreground font-mono">
                    {new Date(day + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "narrow" })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {habitos.length === 0 && !criando && (
        <motion.div variants={fadeUp} className="text-center py-16">
          <Flame size={40} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="font-mono text-sm text-muted-foreground">Nenhum hábito criado</p>
          <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">Crie hábitos e mantenha a consistência!</p>
        </motion.div>
      )}
    </motion.div>
  );
}
