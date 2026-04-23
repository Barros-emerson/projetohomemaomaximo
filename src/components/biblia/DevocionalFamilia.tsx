import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Heart, HandHeart, Check, ChevronRight, Sparkles, Star, RefreshCw } from "lucide-react";
import { versiculosMemorizacao, planosDisponiveis } from "@/data/biblia-planos";

const PERGUNTAS_ADULTO = [
  "O que Deus está ensinando a você nessa fase da vida?",
  "Que área precisa ser entregue a Ele hoje?",
  "O que esse texto revela sobre o caráter de Deus?",
  "Qual atitude prática esse versículo inspira em você?",
  "Como esse texto se aplica ao seu casamento?",
  "O que você faria diferente hoje com base nessa leitura?",
  "Deus está pedindo alguma mudança na sua rotina?",
  "Como você pode servir alguém com o que aprendeu?",
];

const PERGUNTAS_CRIANCA = [
  "O que você aprendeu sobre Jesus hoje?",
  "Como você pode ser gentil com alguém hoje?",
  "Quem você quer agradecer a Deus hoje?",
  "O que mais te chamou atenção nessa história?",
  "O que Jesus faria no seu lugar hoje?",
  "Por quem você quer orar hoje?",
  "Qual palavra da Bíblia você quer lembrar hoje?",
  "Como você pode mostrar o amor de Deus hoje?",
];

const PERGUNTAS_CASAL = [
  "O que Deus falou com cada um de vocês hoje na leitura?",
  "Como posso orar especificamente por você essa semana?",
  "Que promessa bíblica você quer crer juntos esse mês?",
  "Qual área do casamento precisa da presença de Deus agora?",
  "O que estamos agradecendo juntos a Deus hoje?",
  "Como podemos servir alguém juntos essa semana?",
];

type PerfilTipo = "emerson" | "camila" | "crianca";

interface Perfil {
  id: PerfilTipo;
  nome: string;
  emoji: string;
  cor: string;
  bg: string;
  border: string;
  perguntas: string[];
}

const PERFIS: Perfil[] = [
  { id: "emerson", nome: "Emerson", emoji: "⚔️", cor: "#4ADE80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.25)", perguntas: PERGUNTAS_ADULTO },
  { id: "camila",  nome: "Camila",  emoji: "🌸", cor: "#FB7185", bg: "rgba(251,113,133,0.1)", border: "rgba(251,113,133,0.25)", perguntas: PERGUNTAS_ADULTO },
  { id: "crianca", nome: "Criança", emoji: "⭐", cor: "#FBBF24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)", perguntas: PERGUNTAS_CRIANCA },
];

type Etapa = "perfil" | "versiculo" | "leitura" | "reflexao" | "oracao" | "casal" | "concluido";
const ETAPAS: Etapa[] = ["perfil", "versiculo", "leitura", "reflexao", "oracao", "casal", "concluido"];

const ETAPA_LABELS: Record<Etapa, string> = {
  perfil: "Quem está aqui?",
  versiculo: "Versículo",
  leitura: "Leitura",
  reflexao: "Reflexão",
  oracao: "Oração",
  casal: "Para o casal",
  concluido: "Concluído",
};

interface DevocionalFamiliaProps {
  onConcluir?: (perfil: PerfilTipo) => void;
  onFechar?: () => void;
}

export default function DevocionalFamilia({ onConcluir, onFechar }: DevocionalFamiliaProps) {
  const semana = Math.ceil(((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
  const versiculo = versiculosMemorizacao[(semana - 1) % versiculosMemorizacao.length];
  const plano = planosDisponiveis[0];
  const passagemHoje = plano.leituras[(new Date().getDate() - 1) % plano.leituras.length];

  const [etapa, setEtapa] = useState<Etapa>("perfil");
  const [perfilAtivo, setPerfilAtivo] = useState<Perfil | null>(null);
  const [reflexao, setReflexao] = useState("");
  const [oracao, setOracao] = useState("");
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [perguntaCasalIdx, setPerguntaCasalIdx] = useState(() => Math.floor(Math.random() * PERGUNTAS_CASAL.length));
  const [leituraFeita, setLeituraFeita] = useState(false);

  const etapaIdx = ETAPAS.indexOf(etapa);
  const totalEtapas = ETAPAS.length - 1;
  const pct = Math.round((etapaIdx / totalEtapas) * 100);

  const avancar = (proxima?: Etapa) => {
    const idx = ETAPAS.indexOf(etapa);
    const next = proxima || ETAPAS[idx + 1];
    if (next) setEtapa(next);
  };

  const perfil = perfilAtivo || PERFIS[0];
  const perguntaAtual = perfil.perguntas[perguntaIdx % perfil.perguntas.length];
  const perguntaCasal = PERGUNTAS_CASAL[perguntaCasalIdx];

  const handleConcluir = useCallback(() => {
    if (onConcluir && perfilAtivo) onConcluir(perfilAtivo.id);
    setEtapa("concluido");
  }, [onConcluir, perfilAtivo]);

  // Próximo passo (mesma lógica do botão do rodapé)
  const handleProximo = useCallback(() => {
    if (etapa === "concluido") return;
    if (etapa === "leitura" && !leituraFeita) return;
    if (etapa === "casal") { handleConcluir(); return; }
    if (etapa === "oracao" && perfil.id === "crianca") { handleConcluir(); return; }
    const idx = ETAPAS.indexOf(etapa);
    const next = ETAPAS[idx + 1];
    if (next) setEtapa(next);
  }, [etapa, leituraFeita, perfil.id, handleConcluir]);

  const handleVoltar = useCallback(() => {
    const idx = ETAPAS.indexOf(etapa);
    if (idx > 0 && etapa !== "perfil") setEtapa(ETAPAS[idx - 1]);
  }, [etapa]);

  const proximaPergunta = useCallback(() => {
    if (etapa === "reflexao") setPerguntaIdx(i => i + 1);
    else if (etapa === "casal" && perfil.id !== "crianca") setPerguntaCasalIdx(i => (i + 1) % PERGUNTAS_CASAL.length);
  }, [etapa, perfil.id]);

  // Foco automático e atalhos de teclado
  const containerRef = useRef<HTMLDivElement>(null);
  const reflexaoRef = useRef<HTMLTextAreaElement>(null);
  const oracaoRef = useRef<HTMLTextAreaElement>(null);
  const proximoBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Foca no textarea quando entra em reflexão/oração; senão foca no botão Próximo
    const t = setTimeout(() => {
      if (etapa === "reflexao") reflexaoRef.current?.focus();
      else if (etapa === "oracao") oracaoRef.current?.focus();
      else proximoBtnRef.current?.focus();
    }, 250);
    return () => clearTimeout(t);
  }, [etapa]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Esc fecha sempre
      if (e.key === "Escape") { e.preventDefault(); onFechar?.(); return; }

      const target = e.target as HTMLElement | null;
      const isTextField = target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT");

      // Ctrl/Cmd + Enter: avança mesmo dentro de textarea
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleProximo();
        return;
      }

      // Atalhos só fora de campos de texto
      if (isTextField) return;

      if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); handleProximo(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); handleVoltar(); }
      else if (e.key.toLowerCase() === "n") { e.preventDefault(); proximaPergunta(); }
      else if (e.key === " " && etapa === "leitura") { e.preventDefault(); setLeituraFeita(v => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [etapa, handleProximo, handleVoltar, proximaPergunta, onFechar]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Devocional em Família"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden focus:outline-none"
    >
      {/* Header com progresso */}
      <div className="px-5 pt-6 pb-4 shrink-0 border-b border-border/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{etapa === "perfil" ? "✝️" : perfil.emoji}</span>
            <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
              {etapa === "concluido" ? "CONCLUÍDO" : ETAPA_LABELS[etapa].toUpperCase()}
            </span>
          </div>
          {onFechar && (
            <button onClick={onFechar} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground active:scale-90 transition-transform">
              ✕
            </button>
          )}
        </div>

        {etapa !== "concluido" && (
          <div className="flex gap-1.5">
            {ETAPAS.filter(e => e !== "concluido").map((e, i) => (
              <div key={e} className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: i <= etapaIdx ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: perfil.cor }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait">
          {/* PERFIL */}
          {etapa === "perfil" && (
            <motion.div key="perfil" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="pt-6 space-y-6">
              <div className="text-center space-y-2">
                <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">DEVOCIONAL DIÁRIO</p>
                <h2 className="text-2xl font-black text-foreground leading-tight">Quem está<br />fazendo o devocional?</h2>
                <p className="text-sm text-muted-foreground">Cada um com seu momento com Deus 🙏</p>
              </div>
              <div className="space-y-3">
                {PERFIS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPerfilAtivo(p); avancar("versiculo"); }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all active:scale-[0.97]"
                    style={{ border: `1.5px solid ${p.border}`, background: p.bg }}
                  >
                    <span className="text-3xl">{p.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-foreground">{p.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.id === "crianca" ? "Para os pequenos da família" : "Devocional completo"}
                      </p>
                    </div>
                    <ChevronRight size={18} style={{ color: p.cor }} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* VERSÍCULO */}
          {etapa === "versiculo" && (
            <motion.div key="versiculo" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="pt-6 space-y-5">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: perfil.bg, border: `1px solid ${perfil.border}` }}>
                  <Sparkles size={28} style={{ color: perfil.cor }} />
                </div>
                <p className="font-mono text-[10px] tracking-[0.3em]" style={{ color: perfil.cor }}>VERSÍCULO DA SEMANA</p>
                <p className="text-lg font-bold text-foreground leading-relaxed px-2">"{versiculo.texto}"</p>
                <p className="font-mono text-xs text-muted-foreground">{versiculo.referencia}</p>
              </div>
              {perfil.id === "crianca" && (
                <div className="rounded-xl p-4 text-center" style={{ background: perfil.bg, border: `1px solid ${perfil.border}` }}>
                  <p className="text-sm text-foreground">💡 Repita esse versículo 3 vezes em voz alta!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* LEITURA */}
          {etapa === "leitura" && (
            <motion.div key="leitura" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="pt-6 space-y-5">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: perfil.bg, border: `1px solid ${perfil.border}` }}>
                  <BookOpen size={28} style={{ color: perfil.cor }} />
                </div>
                <p className="font-mono text-[10px] tracking-[0.3em]" style={{ color: perfil.cor }}>LEITURA DO DIA</p>
                <p className="text-2xl font-black text-foreground">{passagemHoje.passagem}</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center px-2 leading-relaxed">
                  {perfil.id === "crianca"
                    ? "Abra a Bíblia com papai ou mamãe e leia a história juntos! Quando terminar, marque aqui 📖"
                    : "Abra sua Bíblia (ou app de leitura) e leia a passagem com atenção. Quando terminar, marque aqui."}
                </p>
                <button
                  onClick={() => setLeituraFeita(!leituraFeita)}
                  className="w-full py-4 rounded-xl font-mono text-sm font-bold tracking-wider transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                  style={leituraFeita ? { background: perfil.cor, color: "#000" } : { border: `2px solid ${perfil.border}`, color: perfil.cor }}
                >
                  {leituraFeita ? (<><Check size={16} /> Li a passagem!</>) : "Toque quando terminar de ler"}
                </button>
              </div>
            </motion.div>
          )}

          {/* REFLEXÃO */}
          {etapa === "reflexao" && (
            <motion.div key="reflexao" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="pt-6 space-y-4">
              <div className="text-center space-y-2">
                <p className="font-mono text-[10px] tracking-[0.3em]" style={{ color: perfil.cor }}>PENSE E ESCREVA</p>
                <div className="flex items-start gap-2 px-2">
                  <p className="text-base font-bold text-foreground leading-relaxed flex-1">"{perguntaAtual}"</p>
                  <button onClick={() => setPerguntaIdx(i => i + 1)} className="text-muted-foreground active:scale-90 shrink-0 mt-1">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
              <div className="rounded-2xl p-4" style={{ border: `1px solid ${perfil.border}`, background: perfil.bg }}>
                <textarea
                  value={reflexao}
                  onChange={(e) => setReflexao(e.target.value)}
                  placeholder={perfil.id === "crianca" ? "Desenhe ou escreva o que você aprendeu hoje com Jesus... 🎨" : "Escreva aqui o que veio ao seu coração..."}
                  className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none min-h-[120px] leading-relaxed"
                />
              </div>
              {perfil.id === "crianca" && (
                <div className="flex gap-2 justify-center flex-wrap">
                  {["❤️ Jesus me ama", "🙏 Quero orar", "📖 Aprendi muito", "⭐ Foi incrível!", "🤔 Tenho dúvida"].map(emoji => (
                    <button key={emoji} onClick={() => setReflexao(prev => prev + (prev ? " " : "") + emoji)}
                      className="px-3 py-2 rounded-xl bg-secondary text-sm font-medium active:scale-95 transition-transform">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ORAÇÃO */}
          {etapa === "oracao" && (
            <motion.div key="oracao" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="pt-6 space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
                  <HandHeart size={28} style={{ color: "#A78BFA" }} />
                </div>
                <p className="font-mono text-[9px] tracking-[0.25em] mb-1" style={{ color: "#A78BFA" }}>HORA DE ORAR</p>
                <p className="text-sm text-muted-foreground">
                  {perfil.id === "crianca" ? "Fale com Jesus do seu jeito! Ele ama te ouvir 💜" : "Registre sua oração do dia"}
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ border: "1px solid rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.04)" }}>
                <textarea
                  value={oracao}
                  onChange={(e) => setOracao(e.target.value)}
                  placeholder={perfil.id === "crianca" ? "Senhor Jesus, obrigado por... Eu quero pedir por..." : "Senhor, hoje eu te agradeço por... Eu te peço por... Intercedo por..."}
                  className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none min-h-[110px] leading-relaxed"
                />
              </div>
              {perfil.id === "crianca" && (
                <div className="grid grid-cols-3 gap-2">
                  {["🙏 Família", "❤️ Amigos", "🌍 Mundo", "⛪ Igreja", "🏠 Casa", "📚 Escola"].map(item => (
                    <button key={item} onClick={() => setOracao(prev => prev + (prev ? "\n" : "") + `Oro por: ${item}`)}
                      className="py-2.5 rounded-xl bg-secondary text-xs font-mono active:scale-95 transition-transform">
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* CASAL */}
          {etapa === "casal" && perfil.id !== "crianca" && (
            <motion.div key="casal" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="pt-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.25)" }}>
                  <Heart size={28} style={{ color: "#FB7185" }} />
                </div>
                <p className="font-mono text-[9px] tracking-[0.25em] mb-2" style={{ color: "#FB7185" }}>PARA O CASAL CONVERSAR</p>
                <h3 className="text-lg font-bold text-foreground leading-relaxed px-4">"{perguntaCasal}"</h3>
              </div>
              <div className="rounded-2xl p-4 text-center space-y-3" style={{ background: "rgba(251,113,133,0.05)", border: "1px solid rgba(251,113,133,0.15)" }}>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Compartilhem a resposta um com o outro antes de dormir ou no próximo encontro. Não precisa escrever aqui, só conversar 💬
                </p>
                <button onClick={() => setPerguntaCasalIdx(i => (i + 1) % PERGUNTAS_CASAL.length)}
                  className="flex items-center gap-1.5 mx-auto font-mono text-[10px] tracking-wider active:scale-95" style={{ color: "#FB7185" }}>
                  <RefreshCw size={11} /> Outra pergunta
                </button>
              </div>
            </motion.div>
          )}

          {etapa === "casal" && perfil.id === "crianca" && (
            <motion.div key="casal-crianca" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pt-8 text-center space-y-4">
              <span className="text-6xl">⭐</span>
              <h2 className="text-2xl font-black text-foreground">Incrível!</h2>
              <p className="text-muted-foreground font-mono text-sm">Você fez seu devocional hoje. Deus ficou muito feliz! 🎉</p>
            </motion.div>
          )}

          {/* CONCLUÍDO */}
          {etapa === "concluido" && (
            <motion.div key="concluido" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20 }} className="pt-10 flex flex-col items-center text-center space-y-5">
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: perfil.bg, border: `2px solid ${perfil.cor}` }}>
                <span className="text-4xl">{perfil.emoji}</span>
              </motion.div>
              <div className="space-y-2">
                <p className="font-mono text-[10px] tracking-[0.3em]" style={{ color: perfil.cor }}>DEVOCIONAL CONCLUÍDO</p>
                <h2 className="text-3xl font-black text-foreground">{perfil.nome}</h2>
                <p className="font-mono text-sm text-muted-foreground">Que bom que você esteve com Deus hoje! 🙏</p>
              </div>
              {reflexao && (
                <div className="w-full rounded-2xl p-4 text-left" style={{ background: perfil.bg, border: `1px solid ${perfil.border}` }}>
                  <p className="font-mono text-[9px] tracking-widest mb-1" style={{ color: perfil.cor }}>SUA REFLEXÃO DE HOJE</p>
                  <p className="text-sm text-foreground/80 italic leading-relaxed">"{reflexao}"</p>
                </div>
              )}
              <div className="flex items-center gap-2 mt-4">
                <Star size={14} style={{ color: perfil.cor }} />
                <p className="font-mono text-xs text-muted-foreground">Bênção registrada para {new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rodapé fixo */}
      {etapa !== "concluido" && (
        <div className="px-5 py-5 shrink-0">
          <button
            onClick={() => {
              if (etapa === "casal") { handleConcluir(); return; }
              if (etapa === "oracao" && perfil.id === "crianca") { handleConcluir(); return; }
              avancar();
            }}
            disabled={etapa === "leitura" && !leituraFeita}
            className="w-full py-4 rounded-2xl font-mono text-sm font-black tracking-[0.1em] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-40"
            style={{ background: perfil.cor, color: "#000", boxShadow: `0 8px 24px ${perfil.cor}40` }}
          >
            {etapa === "perfil" ? "COMEÇAR" :
             (etapa === "casal" || (etapa === "oracao" && perfil.id === "crianca"))
               ? (<><Check size={18} /> CONCLUIR DEVOCIONAL</>)
               : (<><span>PRÓXIMO</span> <ChevronRight size={16} /></>)}
          </button>
          {etapa !== "perfil" && (
            <button onClick={() => {
              const idx = ETAPAS.indexOf(etapa);
              if (idx > 0) setEtapa(ETAPAS[idx - 1]);
            }} className="w-full text-center font-mono text-[10px] text-muted-foreground/50 tracking-wider mt-2 py-2 active:text-muted-foreground transition-colors">
              ← VOLTAR
            </button>
          )}
        </div>
      )}

      {etapa === "concluido" && (
        <div className="px-5 py-5 shrink-0">
          <button onClick={() => { setEtapa("perfil"); setReflexao(""); setOracao(""); setLeituraFeita(false); setPerfilAtivo(null); }}
            className="w-full py-4 rounded-2xl font-mono text-sm font-black tracking-widest transition-all active:scale-[0.97] bg-secondary text-foreground">
            NOVO DEVOCIONAL
          </button>
          {onFechar && (
            <button onClick={onFechar} className="w-full text-center font-mono text-[10px] text-muted-foreground/50 mt-2 py-2 active:text-muted-foreground">
              Fechar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
