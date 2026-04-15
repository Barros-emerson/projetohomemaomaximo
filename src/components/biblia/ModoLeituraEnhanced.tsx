import { useState, useCallback, useEffect } from "react";
import { X, Check, Loader2, Minus, Plus, ChevronUp, Bookmark, BookmarkCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { LeituraDia } from "@/data/biblia-planos";

interface ChapterResult {
  book: string;
  chapter: number;
  text: string;
}

interface FavoritoVerse {
  id: string;
  referencia: string;
  texto: string;
  versao: string;
}

interface Props {
  leitura: LeituraDia;
  bibliaTexto: ChapterResult[];
  bibliaLoading: boolean;
  versaoBiblia: string;
  onClose: () => void;
  onConcluir: (dia: number) => void;
  onChangeVersao: (versao: string) => void;
}

const ModoLeituraEnhanced = ({
  leitura,
  bibliaTexto,
  bibliaLoading,
  versaoBiblia,
  onClose,
  onConcluir,
  onChangeVersao,
}: Props) => {
  const [fontSize, setFontSize] = useState(15);
  const [showControls, setShowControls] = useState(false);
  const [showFavoritos, setShowFavoritos] = useState(false);
  const [progress, setProgress] = useState(0);
  const [favoritos, setFavoritos] = useState<FavoritoVerse[]>([]);
  const [favoritosSet, setFavoritosSet] = useState<Set<string>>(new Set());
  const [savingRef, setSavingRef] = useState<string | null>(null);

  // Load favorites on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from("versiculos_favoritos")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) {
          setFavoritos(data);
          setFavoritosSet(new Set(data.map((f: FavoritoVerse) => f.referencia)));
        }
      } catch {}
    };
    load();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    if (scrollHeight > 0) {
      setProgress(Math.min(1, scrollTop / scrollHeight));
    }
  }, []);

  const totalVerses = bibliaTexto.reduce(
    (acc, ch) => acc + ch.text.split("\n").filter(Boolean).length,
    0
  );

  const toggleFavorito = useCallback(async (referencia: string, texto: string) => {
    setSavingRef(referencia);
    const isFav = favoritosSet.has(referencia);

    try {
      if (isFav) {
        // Remove
        const { error } = await supabase
          .from("versiculos_favoritos")
          .delete()
          .eq("referencia", referencia);
        if (error) throw error;
        setFavoritos(prev => prev.filter(f => f.referencia !== referencia));
        setFavoritosSet(prev => {
          const next = new Set(prev);
          next.delete(referencia);
          return next;
        });
        toast.success("Versículo removido dos favoritos");
      } else {
        // Add
        const { data, error } = await supabase
          .from("versiculos_favoritos")
          .insert({ referencia, texto, versao: versaoBiblia })
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setFavoritos(prev => [data, ...prev]);
          setFavoritosSet(prev => new Set(prev).add(referencia));
        }
        toast.success("Versículo salvo! ✝️");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar versículo");
    } finally {
      setSavingRef(null);
    }
  }, [favoritosSet, versaoBiblia]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top progress bar */}
      <div className="h-0.5 bg-secondary">
        <motion.div
          className="h-full bg-violet-500"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={22} />
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">MODO LEITURA</span>
          <select
            value={versaoBiblia}
            onChange={(e) => onChangeVersao(e.target.value)}
            className="bg-secondary text-foreground text-[11px] font-mono rounded-lg px-2 py-1 border border-border/50 focus:outline-none focus:border-violet-500/50"
          >
            <option value="ARA">ARA</option>
            <option value="NTLH">NTLH</option>
            <option value="NAA">NAA</option>
            <option value="ACF">ACF</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavoritos(!showFavoritos)}
            className={`relative transition-colors ${showFavoritos ? "text-amber-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Bookmark size={18} fill={showFavoritos ? "currentColor" : "none"} />
            {favoritos.length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">{favoritos.length > 9 ? "9+" : favoritos.length}</span>
              </span>
            )}
          </button>
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-mono text-[11px] font-bold">Aa</span>
          </button>
        </div>
      </div>

      {/* Font controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border/50 overflow-hidden"
          >
            <div className="flex items-center justify-center gap-4 px-4 py-2.5">
              <button
                onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Minus size={14} />
              </button>
              <span className="font-mono text-xs text-foreground w-8 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize((s) => Math.min(24, s + 1))}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Plus size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favoritos panel */}
      <AnimatePresence>
        {showFavoritos && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border/50 overflow-hidden bg-secondary/20"
          >
            <div className="p-4 max-h-[280px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <BookmarkCheck size={14} className="text-amber-400" />
                <span className="font-mono text-[10px] tracking-widest text-amber-400">VERSÍCULOS FAVORITOS</span>
                <span className="text-[10px] text-muted-foreground">({favoritos.length})</span>
              </div>
              {favoritos.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-3 text-center">
                  Toque em um versículo para salvá-lo como favorito.
                </p>
              ) : (
                <div className="space-y-2">
                  {favoritos.map((fav) => (
                    <motion.div
                      key={fav.id}
                      layout
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group relative p-2.5 rounded-lg bg-background border border-border/50 hover:border-amber-500/20 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <Heart size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-mono text-amber-400 font-medium mb-0.5">
                            {fav.referencia} <span className="text-muted-foreground/60">• {fav.versao}</span>
                          </p>
                          <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">{fav.texto}</p>
                        </div>
                        <button
                          onClick={() => toggleFavorito(fav.referencia, fav.texto)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        <div className="max-w-lg mx-auto px-6 py-8 space-y-6">
          {/* Reading header */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono tracking-[0.2em] text-violet-400 uppercase">
              Dia {leitura.dia}
            </p>
            <h2 className="text-2xl font-bold text-foreground leading-tight">
              {leitura.passagem}
            </h2>
            {totalVerses > 0 && (
              <p className="text-[10px] font-mono text-muted-foreground">
                {totalVerses} versículos • {versaoBiblia}
              </p>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Bookmark hint */}
          {bibliaTexto.length > 0 && !bibliaLoading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-[10px] text-center text-muted-foreground/60 italic"
            >
              Toque em um versículo para salvá-lo ✝️
            </motion.p>
          )}

          {/* Bible text */}
          {bibliaLoading ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 size={28} className="text-violet-400 animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando texto bíblico...</p>
            </div>
          ) : bibliaTexto.length > 0 ? (
            <div className="space-y-10">
              {bibliaTexto.map((ch, idx) => (
                <div key={idx}>
                  <h3 className="font-mono text-[11px] tracking-[0.2em] text-violet-400 uppercase mb-5 pb-2 border-b border-border/50">
                    {ch.book} {ch.chapter}
                  </h3>
                  <div className="space-y-2">
                    {ch.text
                      .split("\n")
                      .filter(Boolean)
                      .map((line, i) => {
                        const match = line.match(/^(\d+)\s+(.*)/);
                        const verseNum = match ? match[1] : null;
                        const verseText = match ? match[2] : line;
                        const ref = verseNum ? `${ch.book} ${ch.chapter}:${verseNum}` : "";
                        const isFav = ref ? favoritosSet.has(ref) : false;
                        const isSaving = savingRef === ref;

                        return (
                          <motion.p
                            key={i}
                            className={`text-foreground/90 font-light tracking-[0.01em] rounded-lg px-2 py-0.5 -mx-2 cursor-pointer transition-colors ${
                              isFav
                                ? "bg-amber-500/8 border-l-2 border-amber-500/40"
                                : "hover:bg-secondary/40 border-l-2 border-transparent"
                            }`}
                            style={{ fontSize: `${fontSize}px`, lineHeight: 2 }}
                            onClick={() => {
                              if (verseNum && verseText && !isSaving) {
                                toggleFavorito(ref, verseText);
                              }
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {verseNum && (
                              <span
                                className={`inline-block font-mono font-semibold mr-2 align-super select-none ${
                                  isFav ? "text-amber-400" : "text-violet-400/70"
                                }`}
                                style={{ fontSize: `${Math.max(10, fontSize - 4)}px` }}
                              >
                                {verseNum}
                              </span>
                            )}
                            {verseText}
                            {isFav && (
                              <Bookmark
                                size={12}
                                className="inline-block ml-1.5 text-amber-400 align-middle"
                                fill="currentColor"
                              />
                            )}
                          </motion.p>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed py-8 text-center">
              Não foi possível carregar o texto. Abra sua Bíblia e leia a passagem acima.
            </p>
          )}

          {/* Complete button */}
          <div className="pt-6 pb-8">
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white h-12 text-sm font-medium gap-2 rounded-xl"
              onClick={() => onConcluir(leitura.dia)}
            >
              <Check size={18} />
              Concluir leitura
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {progress > 0.3 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-violet-600/90 flex items-center justify-center shadow-lg"
          onClick={() => {
            const el = document.querySelector(".flex-1.overflow-y-auto");
            el?.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <ChevronUp size={18} className="text-white" />
        </motion.button>
      )}
    </div>
  );
};

export default ModoLeituraEnhanced;
