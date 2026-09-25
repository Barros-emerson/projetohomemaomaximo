import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getFraseHoje } from "@/data/frases-poder";

const getSaudacao = () => {
  const h = new Date().getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const formatDate = () => {
  const now = new Date();
  return now
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
};

export default function Index() {
  const navigate = useNavigate();
  const frase = getFraseHoje();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Data — discreta no topo */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="pt-10 px-6 font-mono text-[10px] tracking-[0.25em] text-muted-foreground"
      >
        {formatDate()}
      </motion.p>

      {/* Saudação central */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex-1 flex flex-col justify-center px-6"
      >
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
          {getSaudacao()},
          <br />
          <span className="text-primary">Emerson</span>.
        </h1>

        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 max-w-[20rem] space-y-2"
        >
          <p
            className="text-base font-light leading-relaxed text-muted-foreground"
            style={{ fontFamily: "ui-serif, Georgia, 'Times New Roman', serif" }}
          >
            “{frase.texto}”
          </p>
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
            — {frase.autor}
            {frase.obra ? ` · ${frase.obra}` : ""}
          </p>
        </motion.blockquote>
      </motion.div>

      {/* Ação única */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="px-6 pb-12 space-y-3"
      >
        <button
          onClick={() => navigate("/foco")}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          COMEÇAR O DIA
          <ArrowRight size={16} />
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-3 font-mono text-[10px] tracking-widest text-muted-foreground/70 hover:text-muted-foreground transition-colors"
        >
          IR AO PAINEL
        </button>
      </motion.div>
    </div>
  );
}
