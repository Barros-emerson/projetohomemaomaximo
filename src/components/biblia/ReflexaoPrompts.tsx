import { useState, useEffect } from "react";
import { Lightbulb, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROMPTS = [
  "O que Deus está ensinando a você nessa fase?",
  "Que área da sua vida precisa ser entregue a Ele?",
  "O que esse texto revela sobre o caráter de Deus?",
  "Qual atitude prática esse versículo inspira?",
  "Existe um pecado para confessar ou uma promessa para crer?",
  "Como esse texto se aplica ao seu casamento?",
  "O que você faria diferente hoje com base nessa leitura?",
  "Que verdade desse texto você precisa lembrar em tentações?",
  "Como você pode servir alguém com o que aprendeu?",
  "Qual frase mais tocou seu coração? Por quê?",
  "Deus está pedindo alguma mudança na sua rotina?",
  "O que esse texto diz sobre quem você é em Cristo?",
];

const ReflexaoPrompts = () => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length));

  const rotate = () => {
    setIndex((prev) => (prev + 1) % PROMPTS.length);
  };

  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-violet-500/5 border border-amber-500/10">
      <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lightbulb size={14} className="text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-mono text-amber-400/70 tracking-widest mb-1">PENSE SOBRE ISSO</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-foreground/80 leading-relaxed italic"
          >
            "{PROMPTS[index]}"
          </motion.p>
        </AnimatePresence>
      </div>
      <button
        onClick={rotate}
        className="text-muted-foreground hover:text-amber-400 transition-colors mt-1"
      >
        <RefreshCw size={12} />
      </button>
    </div>
  );
};

export default ReflexaoPrompts;
