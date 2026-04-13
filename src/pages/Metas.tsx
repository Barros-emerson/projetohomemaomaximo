import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Check, Trash2, Edit3, X, Trophy, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Meta {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tipo_periodo: string;
  valor_alvo: number;
  valor_atual: number;
  unidade: string;
  data_inicio: string;
  data_fim: string | null;
  concluida: boolean;
  created_at: string;
}

const CATEGORIAS = [
  { id: "treino", label: "Treino", cor: "hsl(0 80% 65%)", emoji: "💪" },
  { id: "saude", label: "Saúde", cor: "hsl(152 60% 52%)", emoji: "🫀" },
  { id: "espiritual", label: "Espiritual", cor: "hsl(270 55% 65%)", emoji: "📖" },
  { id: "financeiro", label: "Financeiro", cor: "hsl(38 92% 60%)", emoji: "💰" },
  { id: "relacionamento", label: "Relacionamento", cor: "hsl(340 65% 60%)", emoji: "❤️" },
  { id: "geral", label: "Geral", cor: "hsl(215 75% 60%)", emoji: "🎯" },
];

const getCor = (cat: string) => CATEGORIAS.find(c => c.id === cat)?.cor || "hsl(var(--primary))";
const getEmoji = (cat: string) => CATEGORIAS.find(c => c.id === cat)?.emoji || "🎯";

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

export default function Metas() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [criando, setCriando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({
    titulo: "", descricao: "", categoria: "geral", tipo_periodo: "mensal",
    valor_alvo: "1", unidade: "", data_fim: ""
  });

  const loadMetas = useCallback(async () => {
    const { data } = await supabase.from("metas").select("*").order("created_at", { ascending: false });
    if (data) setMetas(data as Meta[]);
  }, []);

  useEffect(() => { loadMetas(); }, [loadMetas]);

  const salvar = async () => {
    if (!form.titulo.trim()) return;
    try {
      if (editandoId) {
        await supabase.from("metas").update({
          titulo: form.titulo, descricao: form.descricao, categoria: form.categoria,
          tipo_periodo: form.tipo_periodo, valor_alvo: Number(form.valor_alvo),
          unidade: form.unidade, data_fim: form.data_fim || null
        }).eq("id", editandoId);
        toast.success("Meta atualizada!");
      } else {
        await supabase.from("metas").insert({
          titulo: form.titulo, descricao: form.descricao, categoria: form.categoria,
          tipo_periodo: form.tipo_periodo, valor_alvo: Number(form.valor_alvo),
          unidade: form.unidade, data_fim: form.data_fim || null
        });
        toast.success("Meta criada!");
      }
      setForm({ titulo: "", descricao: "", categoria: "geral", tipo_periodo: "mensal", valor_alvo: "1", unidade: "", data_fim: "" });
      setCriando(false);
      setEditandoId(null);
      loadMetas();
    } catch { toast.error("Erro ao salvar meta"); }
  };

  const atualizarProgresso = async (id: string, novoValor: number, alvo: number) => {
    const concluida = novoValor >= alvo;
    await supabase.from("metas").update({ valor_atual: novoValor, concluida }).eq("id", id);
    if (concluida) toast.success("🏆 Meta concluída!");
    loadMetas();
  };

  const deletar = async (id: string) => {
    await supabase.from("metas").delete().eq("id", id);
    loadMetas();
  };

  const editar = (m: Meta) => {
    setForm({
      titulo: m.titulo, descricao: m.descricao || "", categoria: m.categoria,
      tipo_periodo: m.tipo_periodo, valor_alvo: String(m.valor_alvo),
      unidade: m.unidade || "", data_fim: m.data_fim || ""
    });
    setEditandoId(m.id);
    setCriando(true);
  };

  const ativas = metas.filter(m => !m.concluida);
  const concluidas = metas.filter(m => m.concluida);

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.05 }} className="min-h-screen bg-background pb-24 px-4 pt-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-primary font-bold">METAS & OBJETIVOS</p>
          <p className="text-xl font-bold text-foreground mt-1">Seus alvos</p>
        </div>
        <button
          onClick={() => { setCriando(!criando); setEditandoId(null); setForm({ titulo: "", descricao: "", categoria: "geral", tipo_periodo: "mensal", valor_alvo: "1", unidade: "", data_fim: "" }); }}
          className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary active:scale-95 transition-transform"
        >
          {criando ? <X size={18} /> : <Plus size={18} />}
        </button>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {criando && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="surface-card p-4 space-y-3">
              <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Nome da meta..." className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none" />
              <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição (opcional)..." className="w-full bg-transparent font-mono text-xs text-foreground/70 placeholder:text-muted-foreground/40 outline-none" />
              <div className="flex gap-2 flex-wrap">
                {CATEGORIAS.map(c => (
                  <button key={c.id} onClick={() => setForm(f => ({ ...f, categoria: c.id }))}
                    className="px-2.5 py-1 rounded-lg font-mono text-[9px] font-bold tracking-wider transition-all active:scale-95"
                    style={form.categoria === c.id ? { background: `${c.cor}20`, color: c.cor, border: `1px solid ${c.cor}40` } : { color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}
                  >{c.emoji} {c.label.toUpperCase()}</button>
                ))}
              </div>
              <div className="flex gap-2">
                {["mensal", "trimestral", "anual"].map(p => (
                  <button key={p} onClick={() => setForm(f => ({ ...f, tipo_periodo: p }))}
                    className="flex-1 py-1.5 rounded-lg font-mono text-[9px] font-bold tracking-wider transition-all active:scale-95"
                    style={form.tipo_periodo === p ? { background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" } : { color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}
                  >{p.toUpperCase()}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={form.valor_alvo} onChange={e => setForm(f => ({ ...f, valor_alvo: e.target.value }))} type="number" min="1" placeholder="Alvo" className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 font-mono text-sm text-foreground outline-none border border-border" />
                <input value={form.unidade} onChange={e => setForm(f => ({ ...f, unidade: e.target.value }))} placeholder="Unidade (ex: kg, vezes)" className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 font-mono text-xs text-foreground outline-none border border-border" />
              </div>
              <input value={form.data_fim} onChange={e => setForm(f => ({ ...f, data_fim: e.target.value }))} type="date" className="w-full bg-secondary/50 rounded-lg px-3 py-2 font-mono text-xs text-foreground outline-none border border-border" />
              <button onClick={salvar} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold tracking-widest active:scale-95 transition-transform">
                {editandoId ? "ATUALIZAR" : "CRIAR META"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metas Ativas */}
      {ativas.length > 0 && (
        <div className="space-y-2 mb-6">
          <p className="font-mono text-[9px] tracking-widest text-primary">EM ANDAMENTO ({ativas.length})</p>
          {ativas.map(m => {
            const pct = Math.min(100, Math.round((m.valor_atual / m.valor_alvo) * 100));
            const cor = getCor(m.categoria);
            return (
              <motion.div key={m.id} variants={fadeUp} className="surface-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base">{getEmoji(m.categoria)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-bold text-foreground truncate">{m.titulo}</p>
                      {m.descricao && <p className="font-mono text-[10px] text-muted-foreground truncate">{m.descricao}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => editar(m)} className="text-muted-foreground/40 hover:text-primary transition-colors"><Edit3 size={12} /></button>
                    <button onClick={() => deletar(m.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-secondary rounded-full h-2 mb-1">
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cor }} />
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-[9px] text-muted-foreground">{m.valor_atual}/{m.valor_alvo} {m.unidade}</span>
                      <span className="font-mono text-[9px] font-bold" style={{ color: cor }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => atualizarProgresso(m.id, Math.max(0, m.valor_atual - 1), m.valor_alvo)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground active:scale-90 font-bold text-sm">−</button>
                    <button onClick={() => atualizarProgresso(m.id, m.valor_atual + 1, m.valor_alvo)} className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 font-bold text-sm" style={{ background: `${cor}20`, color: cor }}>+</button>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${cor}15`, color: cor }}>{m.tipo_periodo.toUpperCase()}</span>
                  {m.data_fim && <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1"><Calendar size={8} />{new Date(m.data_fim + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Concluídas */}
      {concluidas.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[9px] tracking-widest text-muted-foreground flex items-center gap-1.5"><Trophy size={10} /> CONCLUÍDAS ({concluidas.length})</p>
          {concluidas.map(m => (
            <motion.div key={m.id} variants={fadeUp} className="surface-card p-3 opacity-60">
              <div className="flex items-center gap-2">
                <span className="text-sm">{getEmoji(m.categoria)}</span>
                <span className="font-mono text-sm text-foreground line-through flex-1">{m.titulo}</span>
                <Check size={14} className="text-primary" />
                <button onClick={() => deletar(m.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors"><Trash2 size={12} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {metas.length === 0 && !criando && (
        <motion.div variants={fadeUp} className="text-center py-16">
          <Target size={40} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="font-mono text-sm text-muted-foreground">Nenhuma meta definida ainda</p>
          <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">Toque no + para criar sua primeira meta</p>
        </motion.div>
      )}
    </motion.div>
  );
}
