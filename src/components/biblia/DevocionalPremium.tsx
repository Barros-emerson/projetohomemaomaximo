import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Check, Loader2, Minus, Plus, Bookmark, Focus, ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { LeituraDia } from "@/data/biblia-planos";

interface ChapterResult {
  book: string;
  chapter: number;
  text: string;
}

interface Props {
  leitura: LeituraDia;
  bibliaTexto: ChapterResult[];
  bibliaLoading: boolean;
  versaoBiblia: string;
  streak: number;
  onClose: () => void;
  onConcluir: (dia: number) => void;
  onChangeVersao: (versao: string) => void;
}

// ====== Frases inspiracionais (cabeçalho) ======
const FRASES_HEADER = [
  "Homens fortes também se ajoelham.",
  "A disciplina espiritual sustenta o corpo.",
  "Silêncio é onde a alma escuta.",
  "Quem se ancora em Deus, não tomba.",
  "A Palavra forja o caráter antes do combate.",
  "Antes da força, o joelho.",
  "O homem se mede pelo que medita.",
];

// ====== Frases de conclusão (transição final) ======
const FRASES_CONCLUSAO = [
  "Conhecimento sem prática não transforma.",
  "A Palavra só muda quem decide obedecer.",
  "Hoje você não leu — você foi formado.",
  "O texto se cumpre no homem que age.",
  "A meditação de hoje é a decisão de amanhã.",
];

// ====== 3 perguntas de reflexão guiada ======
const PERGUNTAS = [
  "O que esse texto revela sobre Deus?",
  "O que confronta meu comportamento atual?",
  "O que preciso aplicar hoje?",
];

// ====== Mapa simples de referências cruzadas (Antigo/Novo Testamento) ======
const CROSS_REFS: Record<string, string[]> = {
  "João": ["Isaías 53", "Salmo 23", "Gênesis 1"],
  "Mateus": ["Isaías 7", "Salmo 2", "Deuteronômio 6"],
  "Marcos": ["Isaías 40", "Salmo 110", "Malaquias 3"],
  "Lucas": ["Isaías 61", "Salmo 22", "Êxodo 12"],
  "Atos": ["Joel 2", "Salmo 16", "Isaías 49"],
  "Romanos": ["Habacuque 2", "Gênesis 15", "Salmo 32"],
  "Salmo": ["Provérbios 3", "Isaías 26", "Lamentações 3"],
  "Salmos": ["Provérbios 3", "Isaías 26", "Lamentações 3"],
  "Provérbios": ["Eclesiastes 12", "Salmo 1", "Tiago 1"],
  "Gênesis": ["João 1", "Romanos 5", "Hebreus 11"],
  "Êxodo": ["João 6", "1 Coríntios 10", "Hebreus 3"],
  "Isaías": ["Lucas 4", "Mateus 12", "Romanos 10"],
};

// ====== Saudação contextual por horário ======
const getSaudacao = () => {
  const h = new Date().getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const getFraseHeader = () => {
  const day = new Date().getDate();
  return FRASES_HEADER[day % FRASES_HEADER.length];
};

const getFraseConclusao = () => {
  return FRASES_CONCLUSAO[Math.floor(Math.random() * FRASES_CONCLUSAO.length)];
};

// Estima ~200 palavras/minuto
const estimarTempo = (texto: string) => {
  const palavras = texto.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(palavras / 200));
};

// Tema central (heurística leve por livro)
const TEMA_LIVRO: Record<string, string> = {
  "João": "Conhecendo quem Cristo é",
  "Mateus": "O Reino se aproximou",
  "Marcos": "Servo obediente",
  "Lucas": "O Filho do Homem",
  "Atos": "Igreja em movimento",
  "Romanos": "Justificados pela fé",
  "Salmo": "Coração diante de Deus",
  "Salmos": "Coração diante de Deus",
  "Provérbios": "Sabedoria prática",
  "Gênesis": "No princípio",
  "Êxodo": "Liberdade pela aliança",
  "Isaías": "O Santo de Israel",
};

const DevocionalPremium = ({
  leitura,
  bibliaTexto,
  bibliaLoading,
  versaoBiblia,
  streak,
  onClose,
  onConcluir,
  onChangeVersao,
}: Props) => {
  const dataKey = useMemo(() => new Date().toISOString().split("T")[0], []);
  const fraseHeader = useMemo(getFraseHeader, []);
  const saudacao = useMemo(getSaudacao, []);

  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem("ham-dev-fontsize") || 17);
  });
  const [showControls, setShowControls] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConclusao, setShowConclusao] = useState(false);
  const [fraseFinal, setFraseFinal] = useState("");

  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [savingRef, setSavingRef] = useState<string | null>(null);

  // Versículos marcados como refletidos (persistido por capítulo)
  const capKey = useMemo(
    () => `ham-dev-refletidos-${leitura.passagem}`,
    [leitura.passagem]
  );
  const [refletidos, setRefletidos] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(capKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Anotações por dia
  const notasKey = `ham-dev-notas-${dataKey}`;
  const [notas, setNotas] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(notasKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [notaPessoal, setNotaPessoal] = useState(() => {
    return localStorage.getItem(`ham-dev-nota-${dataKey}`) || "";
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("ham-dev-fontsize", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(capKey, JSON.stringify([...refletidos]));
  }, [refletidos, capKey]);

  useEffect(() => {
    localStorage.setItem(notasKey, JSON.stringify(notas));
  }, [notas, notasKey]);

  useEffect(() => {
    localStorage.setItem(`ham-dev-nota-${dataKey}`, notaPessoal);
  }, [notaPessoal, dataKey]);

  // Carregar favoritos
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("versiculos_favoritos")
          .select("referencia");
        if (data) setFavoritos(new Set(data.map((f: any) => f.referencia)));
      } catch {}
    })();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const t = e.currentTarget;
    const max = t.scrollHeight - t.clientHeight;
    setProgress(max > 0 ? Math.min(1, t.scrollTop / max) : 0);
  }, []);

  const textoCompleto = useMemo(
    () => bibliaTexto.map((c) => c.text).join(" "),
    [bibliaTexto]
  );
  const totalVersos = useMemo(
    () =>
      bibliaTexto.reduce(
        (acc, ch) => acc + ch.text.split("\n").filter(Boolean).length,
        0
      ),
    [bibliaTexto]
  );
  const tempoEstimado = useMemo(() => estimarTempo(textoCompleto), [textoCompleto]);

  // Referências cruzadas baseadas no primeiro livro
  const crossRefs = useMemo(() => {
    if (!bibliaTexto[0]) return [];
    const livro = bibliaTexto[0].book;
    // Tenta exato e fallback por prefixo
    if (CROSS_REFS[livro]) return CROSS_REFS[livro];
    for (const key of Object.keys(CROSS_REFS)) {
      if (livro.startsWith(key) || key.startsWith(livro)) return CROSS_REFS[key];
    }
    return [];
  }, [bibliaTexto]);

  const temaCentral = useMemo(() => {
    if (!bibliaTexto[0]) return "";
    const livro = bibliaTexto[0].book;
    if (TEMA_LIVRO[livro]) return TEMA_LIVRO[livro];
    for (const key of Object.keys(TEMA_LIVRO)) {
      if (livro.startsWith(key)) return TEMA_LIVRO[key];
    }
    return "Meditação do dia";
  }, [bibliaTexto]);

  const toggleRefletido = useCallback((ref: string) => {
    setRefletidos((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  }, []);

  const toggleFavorito = useCallback(
    async (e: React.MouseEvent, ref: string, texto: string) => {
      e.stopPropagation();
      setSavingRef(ref);
      const isFav = favoritos.has(ref);
      try {
        if (isFav) {
          await supabase.from("versiculos_favoritos").delete().eq("referencia", ref);
          setFavoritos((prev) => {
            const next = new Set(prev);
            next.delete(ref);
            return next;
          });
        } else {
          await supabase
            .from("versiculos_favoritos")
            .insert({ referencia: ref, texto, versao: versaoBiblia });
          setFavoritos((prev) => new Set(prev).add(ref));
          toast.success("Versículo favoritado");
        }
      } catch {
        toast.error("Erro ao favoritar");
      } finally {
        setSavingRef(null);
      }
    },
    [favoritos, versaoBiblia]
  );

  const handleConcluir = useCallback(() => {
    setFraseFinal(getFraseConclusao());
    setShowConclusao(true);
    // Auto-conclui após animação
    setTimeout(() => {
      onConcluir(leitura.dia);
    }, 2800);
  }, [leitura.dia, onConcluir]);

  const refletidosCount = refletidos.size;
  const refletidoPct = totalVersos > 0 ? (refletidosCount / totalVersos) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top, #0d0d10 0%, #060608 60%, #030305 100%)",
      }}
    >
      {/* Barra de progresso de scroll — dourada e sutil */}
      <div className="h-px bg-white/5">
        <motion.div
          className="h-full"
          style={{
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, transparent, #c9a86a, transparent)",
          }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Top bar */}
      <div
        className={`flex items-center justify-between px-5 py-3 transition-opacity duration-500 ${
          focusMode ? "opacity-20 hover:opacity-100" : "opacity-100"
        }`}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[9px] tracking-[0.3em] uppercase"
            style={{ color: "#c9a86a" }}
          >
            Devocional
          </span>
          <select
            value={versaoBiblia}
            onChange={(e) => onChangeVersao(e.target.value)}
            className="bg-white/[0.03] text-white/70 text-[10px] font-mono rounded-md px-2 py-0.5 border border-white/5 focus:outline-none focus:border-amber-500/30"
          >
            <option value="ARA">ARA</option>
            <option value="NTLH">NTLH</option>
            <option value="NAA">NAA</option>
            <option value="ACF">ACF</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFocusMode((v) => !v)}
            className={`transition-colors ${
              focusMode ? "text-amber-400" : "text-white/40 hover:text-white/80"
            }`}
            aria-label="Modo foco"
          >
            <Focus size={16} />
          </button>
          <button
            onClick={() => setShowControls((v) => !v)}
            className="text-white/40 hover:text-white/80 transition-colors font-mono text-[11px] font-semibold"
          >
            Aa
          </button>
        </div>
      </div>

      {/* Controles de fonte */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center justify-center gap-4 px-4 py-2.5">
              <button
                onClick={() => setFontSize((s) => Math.max(13, s - 1))}
                className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-white/60 hover:text-white"
              >
                <Minus size={14} />
              </button>
              <span className="font-mono text-xs text-white/70 w-8 text-center">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize((s) => Math.min(26, s + 1))}
                className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-white/60 hover:text-white"
              >
                <Plus size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        <div className="max-w-[640px] mx-auto px-6 py-10 space-y-10">
          {/* CABEÇALHO ELEGANTE */}
          <motion.header
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`space-y-3 transition-opacity duration-500 ${
              focusMode ? "opacity-30" : "opacity-100"
            }`}
          >
            <p
              className="font-mono text-[10px] tracking-[0.3em] uppercase"
              style={{ color: "#c9a86a" }}
            >
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <h1
              className="text-2xl font-light text-white/90 leading-tight tracking-tight"
              style={{ fontFamily: "ui-serif, Georgia, 'Times New Roman', serif" }}
            >
              {saudacao}, Emerson.
            </h1>
            <p className="text-sm text-white/40 italic font-light">"{fraseHeader}"</p>
          </motion.header>

          {/* CARD PRINCIPAL DE LEITURA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`rounded-2xl p-6 transition-opacity duration-500 ${
              focusMode ? "opacity-30" : "opacity-100"
            }`}
            style={{
              background:
                "linear-gradient(180deg, rgba(201,168,106,0.04) 0%, rgba(255,255,255,0.015) 100%)",
              border: "1px solid rgba(201,168,106,0.12)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <BookOpen size={12} style={{ color: "#c9a86a" }} />
                  <span
                    className="font-mono text-[9px] tracking-[0.3em] uppercase"
                    style={{ color: "#c9a86a" }}
                  >
                    Leitura de hoje
                  </span>
                </div>
                <h2
                  className="text-3xl font-light text-white tracking-tight"
                  style={{ fontFamily: "ui-serif, Georgia, serif" }}
                >
                  {leitura.passagem}
                </h2>
                <p className="text-sm text-white/50 italic">"{temaCentral}"</p>
              </div>
            </div>

            <div className="mt-5 pt-5 flex items-center gap-6 border-t border-white/5">
              <div>
                <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase">
                  Tempo
                </p>
                <p className="text-sm text-white/80 mt-0.5">~{tempoEstimado} min</p>
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase">
                  Versículos
                </p>
                <p className="text-sm text-white/80 mt-0.5">{totalVersos || "—"}</p>
              </div>
              <div>
                <p
                  className="font-mono text-[9px] tracking-widest uppercase"
                  style={{ color: "#c9a86a" }}
                >
                  Constância
                </p>
                <p className="text-sm mt-0.5" style={{ color: "#c9a86a" }}>
                  {streak} dias
                </p>
              </div>
            </div>
          </motion.div>

          {/* PROGRESSO ESPIRITUAL DISCRETO */}
          {totalVersos > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`space-y-1.5 transition-opacity duration-500 ${
                focusMode ? "opacity-30" : "opacity-100"
              }`}
            >
              <div className="flex justify-between font-mono text-[10px] text-white/40">
                <span>{refletidosCount} de {totalVersos} refletidos</span>
                <span>{Math.round(refletidoPct)}%</span>
              </div>
              <div className="h-px bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: "#c9a86a" }}
                  animate={{ width: `${refletidoPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* TEXTO BÍBLICO */}
          {bibliaLoading ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <Loader2 size={24} className="animate-spin" style={{ color: "#c9a86a" }} />
              <p className="text-xs text-white/40 font-mono tracking-widest uppercase">
                Carregando texto sagrado
              </p>
            </div>
          ) : bibliaTexto.length > 0 ? (
            <div className="space-y-12">
              {bibliaTexto.map((ch, idx) => (
                <motion.section
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.5 }}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <h3
                      className="font-mono text-[10px] tracking-[0.4em] uppercase"
                      style={{ color: "#c9a86a" }}
                    >
                      {ch.book} {ch.chapter}
                    </h3>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="space-y-1">
                    {ch.text
                      .split("\n")
                      .filter(Boolean)
                      .map((line, i) => {
                        const match = line.match(/^(\d+)\s+(.*)/);
                        const verseNum = match ? match[1] : null;
                        const verseText = match ? match[2] : line;
                        const ref = verseNum
                          ? `${ch.book} ${ch.chapter}:${verseNum}`
                          : "";
                        const isRefletido = refletidos.has(ref);
                        const isFav = favoritos.has(ref);

                        return (
                          <motion.div
                            key={i}
                            className="group relative -mx-3 px-3 py-1 rounded-md cursor-pointer"
                            whileTap={{ scale: 0.995 }}
                            onClick={() => {
                              if (ref) toggleRefletido(ref);
                            }}
                          >
                            <p
                              className="font-light"
                              style={{
                                fontSize: `${fontSize}px`,
                                lineHeight: 1.85,
                                letterSpacing: "0.005em",
                                fontFamily:
                                  "ui-serif, Georgia, 'Times New Roman', serif",
                                color: isRefletido ? "#8A8A8A" : "rgba(255,255,255,0.92)",
                                transition: "color 300ms ease",
                              }}
                            >
                              {verseNum && (
                                <span
                                  className="inline-block mr-2 align-super font-mono select-none"
                                  style={{
                                    fontSize: `${Math.max(9, fontSize - 6)}px`,
                                    color: isRefletido
                                      ? "rgba(138,138,138,0.6)"
                                      : "#c9a86a",
                                    transition: "color 300ms ease",
                                  }}
                                >
                                  {verseNum}
                                </span>
                              )}
                              {verseText}
                              {isFav && (
                                <Bookmark
                                  size={11}
                                  className="inline-block ml-1.5 align-middle"
                                  fill="currentColor"
                                  style={{ color: "#c9a86a" }}
                                />
                              )}
                            </p>

                            {/* Botão favoritar — aparece on hover/focus */}
                            {ref && (
                              <button
                                onClick={(e) => toggleFavorito(e, ref, verseText)}
                                disabled={savingRef === ref}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-white/5"
                                aria-label="Favoritar versículo"
                              >
                                <Bookmark
                                  size={12}
                                  className={isFav ? "fill-current" : ""}
                                  style={{
                                    color: isFav ? "#c9a86a" : "rgba(255,255,255,0.4)",
                                  }}
                                />
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                  </div>

                  {/* Campo de anotação por capítulo */}
                  <div className="mt-6 pl-3 border-l border-white/10">
                    <textarea
                      value={notas[ch.chapter] || ""}
                      onChange={(e) =>
                        setNotas((prev) => ({ ...prev, [ch.chapter]: e.target.value }))
                      }
                      placeholder="Anotação sobre este capítulo..."
                      rows={2}
                      className="w-full bg-transparent text-sm text-white/70 placeholder:text-white/20 italic font-light focus:outline-none resize-none"
                      style={{ fontFamily: "ui-serif, Georgia, serif" }}
                    />
                  </div>
                </motion.section>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 italic text-center py-12">
              Abra sua Bíblia física e leia a passagem acima.
            </p>
          )}

          {/* REFERÊNCIAS CRUZADAS */}
          {crossRefs.length > 0 && !bibliaLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="pt-4"
            >
              <p
                className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3"
                style={{ color: "#c9a86a" }}
              >
                Este texto se conecta com
              </p>
              <div className="space-y-1.5">
                {crossRefs.map((r) => (
                  <button
                    key={r}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
                  >
                    <span
                      className="text-sm text-white/80 font-light"
                      style={{ fontFamily: "ui-serif, Georgia, serif" }}
                    >
                      {r}
                    </span>
                    <ChevronRight size={14} className="text-white/30" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* REFLEXÃO GUIADA */}
          {!bibliaLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-6 space-y-5"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={12} style={{ color: "#c9a86a" }} />
                <p
                  className="font-mono text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: "#c9a86a" }}
                >
                  Reflexão guiada
                </p>
              </div>

              <div className="space-y-4">
                {PERGUNTAS.map((q, i) => (
                  <div key={i} className="space-y-1">
                    <p
                      className="text-sm text-white/70 font-light italic"
                      style={{ fontFamily: "ui-serif, Georgia, serif" }}
                    >
                      {i + 1}. {q}
                    </p>
                  </div>
                ))}
              </div>

              <textarea
                value={notaPessoal}
                onChange={(e) => setNotaPessoal(e.target.value)}
                placeholder="Escreva aqui o que Deus tocou em você..."
                rows={5}
                className="w-full rounded-xl px-4 py-3 text-sm font-light text-white/90 placeholder:text-white/25 focus:outline-none resize-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontFamily: "ui-serif, Georgia, serif",
                  lineHeight: 1.7,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(201,168,106,0.3)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")
                }
              />
            </motion.div>
          )}

          {/* MARCAR COMO REFLETIDO / CONCLUIR */}
          <div className="pt-4 pb-10">
            <button
              onClick={handleConcluir}
              className="w-full h-14 rounded-xl flex items-center justify-center gap-2 text-sm font-medium tracking-wide transition-all active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(201,168,106,0.18) 0%, rgba(201,168,106,0.08) 100%)",
                border: "1px solid rgba(201,168,106,0.35)",
                color: "#e8d4a8",
              }}
            >
              <Check size={16} />
              Marcar como refletido
            </button>
          </div>
        </div>
      </div>

      {/* TRANSIÇÃO DE CONCLUSÃO */}
      <AnimatePresence>
        {showConclusao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-8"
            style={{
              background:
                "radial-gradient(ellipse at center, #0a0a0c 0%, #000 100%)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-center space-y-6 max-w-md"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mx-auto w-12 h-px"
                style={{ background: "#c9a86a" }}
              />
              <p
                className="text-2xl font-light leading-relaxed italic"
                style={{
                  fontFamily: "ui-serif, Georgia, serif",
                  color: "#e8d4a8",
                }}
              >
                "{fraseFinal}"
              </p>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mx-auto w-12 h-px"
                style={{ background: "#c9a86a" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DevocionalPremium;
