import { useState, useCallback } from "react";
import { X, Check, Loader2, Minus, Plus, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  // Calculate reading progress from scroll
  const [progress, setProgress] = useState(0);

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
        <button
          onClick={() => setShowControls(!showControls)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono text-[11px] font-bold">Aa</span>
        </button>
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
                        return (
                          <p
                            key={i}
                            className="text-foreground/90 font-light tracking-[0.01em]"
                            style={{ fontSize: `${fontSize}px`, lineHeight: 2 }}
                          >
                            {verseNum && (
                              <span className="inline-block font-mono font-semibold text-violet-400/70 mr-2 align-super select-none"
                                style={{ fontSize: `${Math.max(10, fontSize - 4)}px` }}
                              >
                                {verseNum}
                              </span>
                            )}
                            {verseText}
                          </p>
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

      {/* Scroll to top hint */}
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
