import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, BookOpen, HandHeart, Shield, Check, Send, Sparkles, Flame, ChevronDown, MessageCircleHeart, Scroll, StickyNote, ListChecks, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { versiculosMemorizacao, planosDisponiveis } from "@/data/biblia-planos";

const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const getWeekOfYear = () =>
  Math.ceil(((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);

interface OracaoItem { id: string; tipo: string; conteudo: string; data: string; }
interface NotaItem { id: string; titulo: string; conteudo: string; cor: string; created_at: string; }
interface TarefaItem { id: string; titulo: string; concluida: boolean; criado_por: string; para_quem: string; created_at: string; }

const Tab = ({ label, icon: Icon, active, onClick, color }: { label: string; icon: any; active: boolean; onClick: () => void; color: string }) => (
  <button
    onClick={onClick}
    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-mono text-[9px] font-bold tracking-wider transition-all active:scale-95"
    style={active
      ? { background: `${color}20`, color, border: `1px solid ${color}40` }
      : { color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
    }
  >
    <Icon size={14} />
    {label}
  </button>
);

export default function ModoCamila() {
  const dataHoje = hoje();
  const semana = getWeekOfYear();
  const versiculo = versiculosMemorizacao[(semana - 1) % versiculosMemorizacao.length];
  const plano = planosDisponiveis[0];
  const passagemHoje = plano.leituras[(new Date().getDate() - 1) % plano.leituras.length];

  const [abaAtiva, setAbaAtiva] = useState<"reflexao" | "oracao" | "mensagem" | "notas" | "tarefas">("reflexao");
  const [reflexao, setReflexao] = useState("");
  const [leituraFeita, setLeituraFeita] = useState(false);
  const [oracaoTab, setOracaoTab] = useState<"gratidao" | "pedidos" | "intercessao">("gratidao");
  const [oracoes, setOracoes] = useState({ gratidao: "", pedidos: "", intercessao: "" });
  const [mensagem, setMensagem] = useState("");
  const [horarioMensagem, setHorarioMensagem] = useState("06:55");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [reflexaoEmerson, setReflexaoEmerson] = useState("");
  const [oracoesEmerson, setOracoesEmerson] = useState<OracaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReflexaoEmerson, setShowReflexaoEmerson] = useState(false);

  // Notas
  const [notas, setNotas] = useState<NotaItem[]>([]);
  const [novaNota, setNovaNota] = useState({ titulo: "", conteudo: "" });
  const [editandoNota, setEditandoNota] = useState<string | null>(null);
  const [notaEditando, setNotaEditando] = useState({ titulo: "", conteudo: "" });
  const coresNotas = ["#FB7185", "#A78BFA", "#34D399", "#FBBF24", "#60A5FA"];

  // Tarefas
  const [tarefas, setTarefas] = useState<TarefaItem[]>([]);
  const [novaTarefa, setNovaTarefa] = useState("");
  const [novaTarefaParaQuem, setNovaTarefaParaQuem] = useState<"camila" | "emerson">("camila");

  useEffect(() => {
    const load = async () => {
      try {
        const { data: devocional } = await supabase
          .from("camila_devocional")
          .select("reflexao, leitura_feita, oracao_gratidao, oracao_pedidos, oracao_intercessao")
          .eq("data", dataHoje)
          .limit(1);
        if (devocional && devocional.length > 0) {
          const d = devocional[0];
          setReflexao(d.reflexao || "");
          setLeituraFeita(d.leitura_feita || false);
          setOracoes({ gratidao: d.oracao_gratidao || "", pedidos: d.oracao_pedidos || "", intercessao: d.oracao_intercessao || "" });
        }
        const { data: emersonRef } = await supabase
          .from("emerson_reflexao_publica")
          .select("reflexao")
          .eq("data", dataHoje)
          .limit(1);
        if (emersonRef && emersonRef.length > 0) setReflexaoEmerson(emersonRef[0].reflexao || "");

        const { data: pedidos } = await supabase
          .from("oracoes")
          .select("id, tipo, conteudo, data")
          .eq("tipo", "pedidos")
          .order("created_at", { ascending: false })
          .limit(5);
        if (pedidos) setOracoesEmerson(pedidos as OracaoItem[]);

        // Notas
        const { data: notasData } = await supabase
          .from("camila_notas")
          .select("*")
          .order("created_at", { ascending: false });
        if (notasData) setNotas(notasData as NotaItem[]);

        // Tarefas
        const { data: tarefasData } = await supabase
          .from("camila_tarefas")
          .select("*")
          .order("created_at", { ascending: false });
        if (tarefasData) setTarefas(tarefasData as TarefaItem[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dataHoje]);

  const salvarDevocional = useCallback(async () => {
    setSalvando(true);
    try {
      await supabase.from("camila_devocional").upsert(
        { data: dataHoje, reflexao, leitura_feita: leituraFeita, oracao_gratidao: oracoes.gratidao, oracao_pedidos: oracoes.pedidos, oracao_intercessao: oracoes.intercessao },
        { onConflict: "data" }
      );
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    } catch (err) { console.error(err); }
    finally { setSalvando(false); }
  }, [dataHoje, reflexao, leituraFeita, oracoes]);

  const enviarMensagem = useCallback(async () => {
    if (!mensagem.trim()) return;
    setSalvando(true);
    try {
      await supabase.from("camila_mensagens").insert({ data: dataHoje, texto: mensagem.trim(), horario_rotina: horarioMensagem, lida: false });
      setMensagem("");
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    } catch (err) { console.error(err); }
    finally { setSalvando(false); }
  }, [dataHoje, mensagem, horarioMensagem]);

  // NOTAS CRUD
  const criarNota = useCallback(async () => {
    if (!novaNota.titulo.trim() && !novaNota.conteudo.trim()) return;
    try {
      const cor = coresNotas[Math.floor(Math.random() * coresNotas.length)];
      const { data } = await supabase.from("camila_notas").insert({ titulo: novaNota.titulo.trim(), conteudo: novaNota.conteudo.trim(), cor }).select().single();
      if (data) setNotas(prev => [data as NotaItem, ...prev]);
      setNovaNota({ titulo: "", conteudo: "" });
    } catch (err) { console.error(err); }
  }, [novaNota]);

  const salvarNotaEditada = useCallback(async () => {
    if (!editandoNota) return;
    try {
      await supabase.from("camila_notas").update({ titulo: notaEditando.titulo, conteudo: notaEditando.conteudo }).eq("id", editandoNota);
      setNotas(prev => prev.map(n => n.id === editandoNota ? { ...n, titulo: notaEditando.titulo, conteudo: notaEditando.conteudo } : n));
      setEditandoNota(null);
    } catch (err) { console.error(err); }
  }, [editandoNota, notaEditando]);

  const deletarNota = useCallback(async (id: string) => {
    try {
      await supabase.from("camila_notas").delete().eq("id", id);
      setNotas(prev => prev.filter(n => n.id !== id));
    } catch (err) { console.error(err); }
  }, []);

  // TAREFAS CRUD
  const criarTarefa = useCallback(async () => {
    if (!novaTarefa.trim()) return;
    try {
      const { data } = await supabase.from("camila_tarefas").insert({ titulo: novaTarefa.trim(), criado_por: "camila", para_quem: novaTarefaParaQuem }).select().single();
      if (data) setTarefas(prev => [data as TarefaItem, ...prev]);
      setNovaTarefa("");
    } catch (err) { console.error(err); }
  }, [novaTarefa, novaTarefaParaQuem]);

  const toggleTarefa = useCallback(async (id: string, concluida: boolean) => {
    try {
      await supabase.from("camila_tarefas").update({ concluida: !concluida }).eq("id", id);
      setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluida: !concluida } : t));
    } catch (err) { console.error(err); }
  }, []);

  const deletarTarefa = useCallback(async (id: string) => {
    try {
      await supabase.from("camila_tarefas").delete().eq("id", id);
      setTarefas(prev => prev.filter(t => t.id !== id));
    } catch (err) { console.error(err); }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Flame size={28} className="text-pink-400 animate-pulse" />
          <p className="font-mono text-xs text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">

      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-pink-400 font-bold">MODO CAMILA</p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground mt-1">
            Bom dia, Amor 🌸
          </motion.p>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Heart size={20} className="text-pink-400" />
          <span className="font-mono text-[9px] font-bold text-pink-400">
            {leituraFeita ? "✓" : "—"}
          </span>
        </div>
      </div>

      {/* Versículo */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={12} className="text-violet-400" />
          <span className="font-mono text-[9px] tracking-widest text-violet-400">VERSÍCULO DA SEMANA</span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed italic">"{versiculo.texto}"</p>
        <p className="text-[11px] text-violet-400 mt-1 font-medium">{versiculo.referencia}</p>
      </div>

      {/* Passagem + check leitura */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-pink-400" />
            <div>
              <p className="font-mono text-[9px] tracking-widest text-pink-400">LEITURA DO DIA</p>
              <p className="text-sm font-medium text-foreground">{passagemHoje.passagem}</p>
            </div>
          </div>
          <button
            onClick={() => setLeituraFeita(!leituraFeita)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0 ml-3"
            style={leituraFeita ? { background: "#FB7185" } : { border: "2px solid rgba(244,114,182,0.3)" }}
          >
            {leituraFeita && <Check size={16} className="text-white" />}
          </button>
        </div>
        {!leituraFeita && <p className="text-[10px] text-muted-foreground mt-1.5 ml-7">Toque no círculo após ler 📖</p>}
      </div>

      {/* Abas principais */}
      <div className="px-5 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          <Tab label="REFLEXÃO" icon={Scroll} active={abaAtiva === "reflexao"} onClick={() => setAbaAtiva("reflexao")} color="#FB7185" />
          <Tab label="ORAÇÃO" icon={HandHeart} active={abaAtiva === "oracao"} onClick={() => setAbaAtiva("oracao")} color="#A78BFA" />
          <Tab label="AMOR" icon={MessageCircleHeart} active={abaAtiva === "mensagem"} onClick={() => setAbaAtiva("mensagem")} color="#34D399" />
        </div>
        <div className="flex gap-1.5 mt-1.5">
          <Tab label="NOTAS" icon={StickyNote} active={abaAtiva === "notas"} onClick={() => setAbaAtiva("notas")} color="#FBBF24" />
          <Tab label="TAREFAS" icon={ListChecks} active={abaAtiva === "tarefas"} onClick={() => setAbaAtiva("tarefas")} color="#60A5FA" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-5">
        <AnimatePresence mode="wait">

          {/* REFLEXÃO */}
          {abaAtiva === "reflexao" && (
            <motion.div key="reflexao" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
              <div className="rounded-2xl p-4" style={{ border: "1px solid rgba(251,113,133,0.2)", background: "rgba(251,113,133,0.04)" }}>
                <p className="font-mono text-[9px] tracking-widest text-pink-400 mb-2">O QUE DEUS FALOU COM VOCÊ HOJE?</p>
                <textarea
                  value={reflexao}
                  onChange={(e) => setReflexao(e.target.value)}
                  placeholder="Escreva sua reflexão do dia... O que o Senhor colocou em seu coração ao ler a Palavra?"
                  className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none min-h-[120px] leading-relaxed"
                />
              </div>

              {reflexaoEmerson ? (
                <button onClick={() => setShowReflexaoEmerson(!showReflexaoEmerson)} className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]" style={{ background: "rgba(251,113,133,0.05)", border: "1px solid rgba(251,113,133,0.15)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart size={14} style={{ color: "#FB7185" }} />
                      <span className="font-mono text-[9px] tracking-widest" style={{ color: "#FB7185" }}>REFLEXÃO DO EMERSON HOJE</span>
                    </div>
                    <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${showReflexaoEmerson ? "rotate-180" : ""}`} />
                  </div>
                  <AnimatePresence>
                    {showReflexaoEmerson && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="font-mono text-sm text-foreground/80 mt-3 leading-relaxed italic overflow-hidden">
                        "{reflexaoEmerson}"
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              ) : (
                <div className="rounded-2xl p-4 text-center" style={{ border: "1px dashed rgba(251,113,133,0.2)" }}>
                  <p className="font-mono text-[10px] text-muted-foreground">Emerson ainda não registrou a reflexão de hoje</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ORAÇÃO */}
          {abaAtiva === "oracao" && (
            <motion.div key="oracao" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
              <div className="flex gap-1.5">
                {(["gratidao", "pedidos", "intercessao"] as const).map((tab) => (
                  <button key={tab} onClick={() => setOracaoTab(tab)} className="flex-1 py-2 rounded-xl font-mono text-[9px] font-bold tracking-wider transition-all active:scale-95"
                    style={oracaoTab === tab ? { background: "rgba(167,139,250,0.2)", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.3)" } : { color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
                    {tab === "gratidao" ? "GRATIDÃO" : tab === "pedidos" ? "PEDIDOS" : "INTERCESSÃO"}
                  </button>
                ))}
              </div>
              <div className="rounded-2xl p-4" style={{ border: "1px solid rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.04)" }}>
                <textarea
                  value={oracoes[oracaoTab]}
                  onChange={(e) => setOracoes((prev) => ({ ...prev, [oracaoTab]: e.target.value }))}
                  placeholder={oracaoTab === "gratidao" ? "Pelo que você agradece hoje?" : oracaoTab === "pedidos" ? "Seus pedidos ao Senhor..." : "Por quem você quer interceder?"}
                  className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none min-h-[100px] leading-relaxed"
                />
              </div>
              {oracoesEmerson.length > 0 && oracaoTab === "intercessao" && (
                <div className="rounded-2xl p-4 space-y-2" style={{ border: "1px solid rgba(251,113,133,0.15)", background: "rgba(251,113,133,0.04)" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Shield size={12} style={{ color: "#FB7185" }} />
                    <p className="font-mono text-[9px] tracking-widest" style={{ color: "#FB7185" }}>PEDIDOS DO EMERSON</p>
                  </div>
                  {oracoesEmerson.map((o) => (
                    <p key={o.id} className="font-mono text-xs text-foreground/80 leading-relaxed border-l-2 pl-3" style={{ borderColor: "rgba(251,113,133,0.4)" }}>{o.conteudo}</p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* MENSAGEM DE AMOR */}
          {abaAtiva === "mensagem" && (
            <motion.div key="mensagem" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="rounded-2xl p-4" style={{ border: "1px solid rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.04)" }}>
                <p className="font-mono text-[9px] tracking-widest text-emerald-400 mb-0.5">MENSAGEM PARA O EMERSON</p>
                <p className="font-mono text-[10px] text-muted-foreground mb-3">Aparece na rotina dele no horário que você escolher 💚</p>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Ex: Vai arrasar no treino hoje! Te amo muito 💪🙏"
                  className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none min-h-[80px] leading-relaxed"
                />
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="font-mono text-[9px] text-muted-foreground tracking-wider mb-2">APARECER NA ROTINA ÀS:</p>
                  <select
                    value={horarioMensagem}
                    onChange={(e) => setHorarioMensagem(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  >
                    <option value="05:20">05:20 — Acordar</option>
                    <option value="06:00">06:00 — Café + mochilas</option>
                    <option value="06:55">06:55 — Treino 💪</option>
                    <option value="08:20">08:20 — Sol pós-treino</option>
                    <option value="12:30">12:30 — Almoço</option>
                    <option value="19:00">19:00 — Jiu-Jitsu</option>
                    <option value="22:00">22:00 — Desacelerar</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* NOTAS */}
          {abaAtiva === "notas" && (
            <motion.div key="notas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
              {/* Nova nota */}
              <div className="rounded-2xl p-4" style={{ border: "1px solid rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.04)" }}>
                <p className="font-mono text-[9px] tracking-widest text-amber-400 mb-2">NOVA NOTA</p>
                <input
                  value={novaNota.titulo}
                  onChange={(e) => setNovaNota(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título..."
                  className="w-full bg-transparent font-mono text-sm font-bold text-foreground placeholder:text-muted-foreground/40 outline-none mb-2"
                />
                <textarea
                  value={novaNota.conteudo}
                  onChange={(e) => setNovaNota(prev => ({ ...prev, conteudo: e.target.value }))}
                  placeholder="Escreva sua nota..."
                  className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none min-h-[60px] leading-relaxed"
                />
                <button
                  onClick={criarNota}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-wider transition-all active:scale-95"
                  style={{ background: "rgba(251,191,36,0.2)", color: "#FBBF24" }}
                >
                  <Plus size={12} /> SALVAR NOTA
                </button>
              </div>

              {/* Lista de notas */}
              {notas.map(n => (
                <div key={n.id} className="rounded-2xl p-4 relative" style={{ border: `1px solid ${n.cor}30`, background: `${n.cor}08` }}>
                  {editandoNota === n.id ? (
                    <>
                      <input value={notaEditando.titulo} onChange={(e) => setNotaEditando(prev => ({ ...prev, titulo: e.target.value }))} className="w-full bg-transparent font-mono text-sm font-bold text-foreground outline-none mb-1" />
                      <textarea value={notaEditando.conteudo} onChange={(e) => setNotaEditando(prev => ({ ...prev, conteudo: e.target.value }))} className="w-full bg-transparent font-mono text-xs text-foreground/80 outline-none resize-none min-h-[40px] leading-relaxed" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={salvarNotaEditada} className="font-mono text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: `${n.cor}20`, color: n.cor }}>SALVAR</button>
                        <button onClick={() => setEditandoNota(null)} className="font-mono text-[9px] text-muted-foreground">CANCELAR</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditandoNota(n.id); setNotaEditando({ titulo: n.titulo, conteudo: n.conteudo }); }}
                        className="w-full text-left"
                      >
                        {n.titulo && <p className="font-mono text-sm font-bold text-foreground mb-1">{n.titulo}</p>}
                        <p className="font-mono text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">{n.conteudo}</p>
                      </button>
                      <button onClick={() => deletarNota(n.id)} className="absolute top-3 right-3 text-muted-foreground/40 hover:text-destructive transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {notas.length === 0 && (
                <div className="rounded-2xl p-4 text-center" style={{ border: "1px dashed rgba(251,191,36,0.2)" }}>
                  <p className="font-mono text-[10px] text-muted-foreground">Nenhuma nota ainda. Crie a primeira! ✍️</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAREFAS */}
          {abaAtiva === "tarefas" && (
            <motion.div key="tarefas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
              {/* Nova tarefa */}
              <div className="rounded-2xl p-4" style={{ border: "1px solid rgba(96,165,250,0.2)", background: "rgba(96,165,250,0.04)" }}>
                <p className="font-mono text-[9px] tracking-widest text-blue-400 mb-2">NOVA TAREFA</p>
                <div className="flex gap-2 mb-2">
                  <input
                    value={novaTarefa}
                    onChange={(e) => setNovaTarefa(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && criarTarefa()}
                    placeholder="Ex: Comprar leite..."
                    className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
                  />
                  <button
                    onClick={criarTarefa}
                    className="px-3 py-1.5 rounded-lg transition-all active:scale-95"
                    style={{ background: "rgba(96,165,250,0.2)", color: "#60A5FA" }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setNovaTarefaParaQuem("camila")}
                    className="flex-1 py-1.5 rounded-lg font-mono text-[9px] font-bold tracking-wider transition-all active:scale-95"
                    style={novaTarefaParaQuem === "camila"
                      ? { background: "rgba(251,113,133,0.2)", color: "#FB7185", border: "1px solid rgba(251,113,133,0.3)" }
                      : { color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                    }
                  >
                    🌸 SÓ MINHA
                  </button>
                  <button
                    onClick={() => setNovaTarefaParaQuem("emerson")}
                    className="flex-1 py-1.5 rounded-lg font-mono text-[9px] font-bold tracking-wider transition-all active:scale-95"
                    style={novaTarefaParaQuem === "emerson"
                      ? { background: "rgba(96,165,250,0.2)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.3)" }
                      : { color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                    }
                  >
                    💪 P/ EMERSON
                  </button>
                </div>
              </div>

              {/* Lista de tarefas */}
              {tarefas.filter(t => !t.concluida).length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-mono text-[9px] tracking-widest text-blue-400">PENDENTES</p>
                  {tarefas.filter(t => !t.concluida).map(t => (
                    <div key={t.id} className="flex items-center gap-3 rounded-xl p-3" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--secondary) / 0.3)" }}>
                      <button
                        onClick={() => toggleTarefa(t.id, t.concluida)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90"
                        style={{ border: "2px solid rgba(96,165,250,0.3)" }}
                      />
                      <span className="font-mono text-sm text-foreground flex-1">{t.titulo}</span>
                      <span className="font-mono text-[8px] text-muted-foreground/50">{t.criado_por === "camila" ? "🌸" : "💪"}</span>
                      <button onClick={() => deletarTarefa(t.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {tarefas.filter(t => t.concluida).length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-mono text-[9px] tracking-widest text-muted-foreground">CONCLUÍDAS</p>
                  {tarefas.filter(t => t.concluida).map(t => (
                    <div key={t.id} className="flex items-center gap-3 rounded-xl p-3 opacity-50" style={{ border: "1px solid hsl(var(--border))" }}>
                      <button
                        onClick={() => toggleTarefa(t.id, t.concluida)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#60A5FA" }}
                      >
                        <Check size={12} className="text-white" />
                      </button>
                      <span className="font-mono text-sm text-foreground line-through flex-1">{t.titulo}</span>
                      <button onClick={() => deletarTarefa(t.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {tarefas.length === 0 && (
                <div className="rounded-2xl p-4 text-center" style={{ border: "1px dashed rgba(96,165,250,0.2)" }}>
                  <p className="font-mono text-[10px] text-muted-foreground">Nenhuma tarefa ainda. Adicione acima! ✅</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Botão salvar — só para reflexão/oração/mensagem */}
      {(abaAtiva === "reflexao" || abaAtiva === "oracao" || abaAtiva === "mensagem") && (
        <div className="px-5 pt-6">
          <button
            onClick={abaAtiva === "mensagem" ? enviarMensagem : salvarDevocional}
            disabled={salvando}
            className="w-full py-4 rounded-2xl font-mono text-sm font-black tracking-[0.1em] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-60"
            style={{
              background: salvo ? "#34D399" : abaAtiva === "mensagem" ? "#34D399" : "#FB7185",
              color: "#fff",
              boxShadow: `0 8px 24px ${abaAtiva === "mensagem" ? "rgba(52,211,153,0.3)" : "rgba(251,113,133,0.3)"}`,
            }}
          >
            {salvo ? <><Check size={18} /> SALVO!</> : abaAtiva === "mensagem" ? <><Send size={18} /> ENVIAR MENSAGEM</> : <><Heart size={18} /> {salvando ? "SALVANDO..." : "SALVAR DEVOCIONAL"}</>}
          </button>
        </div>
      )}

      <p className="font-mono text-[9px] text-muted-foreground/40 text-center mt-4 pb-4">
        Projeto Alfa 1000 · Modo Camila 🌸
      </p>
    </div>
  );
}
