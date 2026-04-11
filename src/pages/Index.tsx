import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#050505" }}
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 45%, hsla(152,50%,40%,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Thin top accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
        style={{
          width: "min(320px, 50vw)",
          background:
            "linear-gradient(90deg, transparent, hsl(42 70% 55% / 0.5), transparent)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Eyebrow */}
        <motion.p
          className="tracking-[0.35em] text-[11px] font-medium uppercase mb-8"
          style={{ color: "hsl(42 60% 58%)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Disciplina · Força · Propósito
        </motion.p>

        {/* Title */}
        <motion.h1
          className="font-black leading-[0.9] tracking-[-0.03em] mb-6"
          style={{
            fontSize: "clamp(3.2rem, 10vw, 6.5rem)",
            color: "#f5f5f5",
            letterSpacing: "-0.02em",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
        >
          PROJETO
          <br />
          ALFA
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl font-light leading-relaxed mb-4"
          style={{ color: "hsl(0 0% 65%)" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Forje o homem que você foi chamado para ser.
        </motion.p>

        {/* Supporting text */}
        <motion.p
          className="text-sm font-light leading-relaxed max-w-md mb-12"
          style={{ color: "hsl(0 0% 42%)" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          Um sistema feito para homens que escolheram viver com excelência.
          Mente afiada. Corpo forte. Espírito inabalável.
        </motion.p>

        {/* CTA */}
        <motion.button
          onClick={() => navigate("/")}
          className="relative cursor-pointer px-10 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-300"
          style={{
            color: "#050505",
            backgroundColor: "hsl(42 60% 58%)",
            borderRadius: "2px",
          }}
          whileHover={{
            backgroundColor: "hsl(42 65% 64%)",
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          Entrar no Projeto
        </motion.button>

        {/* Minimal divider below CTA */}
        <motion.div
          className="mt-16 h-px"
          style={{
            width: 48,
            background: "hsl(0 0% 20%)",
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        />
      </motion.div>
    </div>
  );
};

export default Index;
