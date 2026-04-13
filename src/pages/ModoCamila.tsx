import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, BookOpen, HandHeart, Shield, Check, Send, Sparkles, Flame, ChevronDown, MessageCircleHeart, Scroll, StickyNote, ListChecks, Plus, Trash2, X, Sun, Moon, Leaf, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { versiculosMemorizacao, planosDisponiveis } from "@/data/biblia-planos";

const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const getWeekOfYear = () =>
  Math.ceil(((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);

// Cor principal: Sage / Verde menta delicado
const ACCENT = "#86BBBD";
const ACCENT_RGB = "134,187,189";

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
  const { theme, toggleTheme } = useTheme();
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
  const [showLeitor, setShowLeitor] = useState(false);
  const [textoBiblia, setTextoBiblia] = useState<{ book: string; chapter: number; text: string }[]>([]);
  const [carregandoBiblia, setCarregandoBiblia] = useState(false);
  const [versaoBiblia, setVersaoBiblia] = useState(() => localStorage.getItem("camila-versao-biblia") || "NTLH");
  const [buscaPersonalizada, setBuscaPersonalizada] = useState("");
  const [passagemAtual, setPassagemAtual] = useState("");
  const leitorRef = useRef<HTMLDivElement>(null);

  // Notas
  const [notas, setNotas] = useState<NotaItem[]>([]);
  const [novaNota, setNovaNota] = useState({ titulo: "", conteudo: "" });
  const [editandoNota, setEditandoNota] = useState<string | null>(null);
  const [notaEditando, setNotaEditando] = useState({ titulo: "", conteudo: "" });
  const coresNotas = [ACCENT, "#A78BFA", "#34D399", "#FBBF24", "#60A5FA"];

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

  // Re-fetch when version changes
  useEffect(() => {
    if (showLeitor && textoBiblia.length > 0) {
      buscarTextoBiblia();
    }
  }, [versaoBiblia]);

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
  const buscarTextoBiblia = useCallback(async (passagemCustom?: string) => {
    const passagem = passagemCustom || passagemHoje.passagem;
    setCarregandoBiblia(true);
    setPassagemAtual(passagem);
    try {
      const { data, error } = await supabase.functions.invoke("buscar-biblia", {
        body: { passagem, versao: versaoBiblia },
      });
      if (error) throw error;
      setTextoBiblia(data.chapters || []);
      setShowLeitor(true);
      setTimeout(() => leitorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      console.error("Erro ao buscar texto:", err);
    } finally {
      setCarregandoBiblia(false);
    }
  }, [passagemHoje.passagem, versaoBiblia]);

  const buscarPassagemPersonalizada = useCallback(() => {
    if (!buscaPersonalizada.trim()) return;
    buscarTextoBiblia(buscaPersonalizada.trim());
  }, [buscaPersonalizada, buscarTextoBiblia]);
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
          <Leaf size={28} style={{ color: ACCENT }} className="animate-pulse" />
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
          <p className="font-mono text-[9px] tracking-[0.2em] font-bold" style={{ color: ACCENT }}>MODO CAMILA</p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground mt-1">
            {new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite"}, Amor 🍃
          </motion.p>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ border: `1px solid rgba(${ACCENT_RGB},0.3)`, background: `rgba(${ACCENT_RGB},0.05)` }}
          >
            {theme === "dark" ? <Sun size={16} style={{ color: ACCENT }} /> : <Moon size={16} style={{ color: ACCENT }} />}
          </button>
          <div className="flex flex-col items-center gap-1">
            <Leaf size={20} style={{ color: ACCENT }} />
            <span className="font-mono text-[9px] font-bold" style={{ color: ACCENT }}>
              {leituraFeita ? "✓" : "—"}
            </span>
          </div>
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

      {/* Passagem + leitura integrada */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <BookOpen size={16} style={{ color: ACCENT }} className="shrink-0" />
            <div className="min-w-0">
              <p className="font-mono text-[9px] tracking-widest" style={{ color: ACCENT }}>LEITURA DO DIA</p>
              <p className="text-sm font-medium text-foreground truncate">{passagemHoje.passagem}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={() => buscarTextoBiblia()}
              disabled={carregandoBiblia}
              className="h-9 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-90 font-mono text-[9px] font-bold tracking-wider disabled:opacity-50"
              style={{ border: `1.5px solid rgba(${ACCENT_RGB},0.4)`, color: ACCENT }}
            >
              {carregandoBiblia ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <BookOpen size={14} />
                </motion.div>
              ) : (
                <><BookOpen size={14} /> LER</>
              )}
            </button>
            <button
              onClick={() => setLeituraFeita(!leituraFeita)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={leituraFeita ? { background: ACCENT } : { border: `2px solid rgba(${ACCENT_RGB},0.3)` }}
            >
              {leituraFeita && <Check size={16} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Leitor expandido */}
        <AnimatePresence>
          {showLeitor && textoBiblia.length > 0 && (
            <motion.div
              ref={leitorRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-2xl p-4 border" style={{ borderColor: `rgba(${ACCENT_RGB},0.2)`, background: `rgba(${ACCENT_RGB},0.05)` }}>
                {/* Header do leitor */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={versaoBiblia}
                      onChange={(e) => {
                        setVersaoBiblia(e.target.value);
                        localStorage.setItem("camila-versao-biblia", e.target.value);
                      }}
                      className="bg-transparent font-mono text-[10px] font-bold tracking-wider rounded-lg px-2 py-1 border"
                      style={{ color: ACCENT, borderColor: `rgba(${ACCENT_RGB},0.3)` }}
                    >
                      {["NTLH", "ARA", "NAA", "ACF", "NVI"].map(v => (
                        <option key={v} value={v} className="text-foreground bg-background">{v}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowLeitor(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                    style={{ color: ACCENT }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Busca personalizada */}
                <div className="flex gap-1.5 mb-3">
                  <input
                    value={buscaPersonalizada}
                    onChange={(e) => setBuscaPersonalizada(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarPassagemPersonalizada()}
                    placeholder="Ex: João 3, Salmo 23, Romanos 8"
                    className="flex-1 bg-transparent text-sm rounded-xl px-3 py-2 border placeholder:text-muted-foreground/50"
                    style={{ borderColor: `rgba(${ACCENT_RGB},0.25)` }}
                  />
                  <button
                    onClick={buscarPassagemPersonalizada}
                    disabled={carregandoBiblia || !buscaPersonalizada.trim()}
                    className="px-3 rounded-xl font-mono text-[9px] font-bold tracking-wider transition-all active:scale-90 disabled:opacity-40"
                    style={{ background: ACCENT, color: "#fff" }}
                  >
                    {carregandoBiblia ? "..." : "BUSCAR"}
                  </button>
                </div>

                {passagemAtual && (
                  <p className="font-mono text-[10px] tracking-wider mb-2 text-muted-foreground">
                    Lendo: <span style={{ color: ACCENT }} className="font-bold">{passagemAtual}</span>
                  </p>
                )}


                <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-4 scrollbar-thin">
                  {textoBiblia.map((ch, i) => (
                    <div key={i}>
                      <p className="font-mono text-[10px] tracking-widest font-bold mb-2" style={{ color: ACCENT }}>
                        {ch.book.toUpperCase()} {ch.chapter}
                      </p>
                      <div className="text-sm text-foreground/90 leading-[1.8] font-serif">
                        {ch.text.split("\n").map((line, j) => {
                          const verseMatch = line.match(/^(\d+)\s(.+)/);
                          if (verseMatch) {
                            return (
                              <p key={j} className="mb-1">
                                <sup className="text-[10px] font-mono font-bold mr-1" style={{ color: `rgba(${ACCENT_RGB},0.6)` }}>
                                  {verseMatch[1]}
                                </sup>
                                {verseMatch[2]}
                              </p>
                            );
                          }
                          return <p key={j} className="mb-1">{line}</p>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botão marcar como lido */}
                {!leituraFeita && (
                  <button
                    onClick={() => setLeituraFeita(true)}
                    className="mt-3 w-full py-2.5 rounded-xl font-mono text-[10px] font-bold tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                    style={{ background: ACCENT, color: "#fff" }}
                  >
                    <Check size={14} /> MARCAR COMO LIDA
                  </button>
                )}
                {leituraFeita && (
                  <p className="mt-3 text-center font-mono text-[10px] font-bold tracking-wider flex items-center justify-center gap-1.5" style={{ color: ACCENT }}>
                    <Check size={14} /> LEITURA CONCLUÍDA ✓
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showLeitor && !leituraFeita && <p className="text-[10px] text-muted-foreground mt-1.5 ml-7">Toque em LER para abrir a Bíblia 📖</p>}
      </div>

      {/* Abas principais */}
      <div className="px-5 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          <Tab label="REFLEXÃO" icon={Scroll} active={abaAtiva === "reflexao"} onClick={() => setAbaAtiva("reflexao")} color={ACCENT} />
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
              <div className="rounded-2xl p-4" style={{ border: `1px solid rgba(${ACCENT_RGB},0.2)`, background: `rgba(${ACCENT_RGB},0.04)` }}>
                <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: ACCENT }}>O QUE DEUS FALOU COM VOCÊ HOJE?</p>
                <textarea
                  value={reflexao}
                  onChange={(e) => setReflexao(e.target.value)}
                  placeholder="Escreva sua reflexão do dia... O que o Senhor colocou em seu coração ao ler a Palavra?"
                  className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none min-h-[120px] leading-relaxed"
                />
              </div>

              {reflexaoEmerson ? (
                <button onClick={() => setShowReflexaoEmerson(!showReflexaoEmerson)} className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]" style={{ background: `rgba(${ACCENT_RGB},0.05)`, border: `1px solid rgba(${ACCENT_RGB},0.15)` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart size={14} style={{ color: ACCENT }} />
                      <span className="font-mono text-[9px] tracking-widest" style={{ color: ACCENT }}>REFLEXÃO DO EMERSON HOJE</span>
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
                <div className="rounded-2xl p-4 text-center" style={{ border: `1px dashed rgba(${ACCENT_RGB},0.2)` }}>
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
                <div className="rounded-2xl p-4 space-y-2" style={{ border: `1px solid rgba(${ACCENT_RGB},0.15)`, background: `rgba(${ACCENT_RGB},0.04)` }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Shield size={12} style={{ color: ACCENT }} />
                    <p className="font-mono text-[9px] tracking-widest" style={{ color: ACCENT }}>PEDIDOS DO EMERSON</p>
                  </div>
                  {oracoesEmerson.map((o) => (
                    <p key={o.id} className="font-mono text-xs text-foreground/80 leading-relaxed border-l-2 pl-3" style={{ borderColor: `rgba(${ACCENT_RGB},0.4)` }}>{o.conteudo}</p>
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
                      ? { background: `rgba(${ACCENT_RGB},0.2)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.3)` }
                      : { color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                    }
                  >
                    🍃 SÓ MINHA
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
                      <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-full" style={t.para_quem === "emerson" ? { background: "rgba(96,165,250,0.15)", color: "#60A5FA" } : { background: `rgba(${ACCENT_RGB},0.15)`, color: ACCENT }}>
                        {t.para_quem === "emerson" ? "💪 EMERSON" : "🍃 MINHA"}
                      </span>
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
              background: salvo ? "#34D399" : abaAtiva === "mensagem" ? "#34D399" : ACCENT,
              color: "#fff",
              boxShadow: `0 8px 24px ${abaAtiva === "mensagem" ? "rgba(52,211,153,0.3)" : `rgba(${ACCENT_RGB},0.3)`}`,
            }}
          >
            {salvo ? <><Check size={18} /> SALVO!</> : abaAtiva === "mensagem" ? <><Send size={18} /> ENVIAR MENSAGEM</> : <><Heart size={18} /> {salvando ? "SALVANDO..." : "SALVAR DEVOCIONAL"}</>}
          </button>
        </div>
      )}

      <p className="font-mono text-[9px] text-muted-foreground/40 text-center mt-4 pb-4">
        Projeto Alfa 1000 · Modo Camila 🍃
      </p>
    </div>
  );
}
