import { motion } from "framer-motion";
import { User, Target, Dumbbell, Heart, BookOpen, Settings, ChevronRight, Crown, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const profileData = {
  name: "Emerson Barros",
  age: 35,
  city: "Brasília, DF",
  occupation: "Product Owner",
  spouse: "Camila",
  ministry: "Casais Millenium",
};

const biometrics = [
  { label: "Peso", value: "—", unit: "kg" },
  { label: "Altura", value: "—", unit: "cm" },
  { label: "% Gordura", value: "—", unit: "%" },
  { label: "IMC", value: "Auto", unit: "" },
  { label: "Cintura", value: "—", unit: "cm" },
  { label: "Pescoço", value: "—", unit: "cm" },
];

const hormones = [
  { label: "Testo Total", value: "—", unit: "ng/dL", highlight: true },
  { label: "Testo Livre", value: "—", unit: "pg/mL" },
  { label: "SHBG", value: "—", unit: "nmol/L" },
  { label: "Cortisol", value: "—", unit: "μg/dL" },
  { label: "Vitamina D", value: "—", unit: "ng/mL" },
  { label: "Zinco", value: "—", unit: "μg/dL" },
];

const strength = [
  { label: "Supino Reto", value: "—", unit: "kg" },
  { label: "Agachamento", value: "—", unit: "kg" },
  { label: "Terra", value: "—", unit: "kg" },
  { label: "Desenvolvimento", value: "—", unit: "kg" },
];

const goals = [
  { label: "Meta Testo", value: "1.000", unit: "ng/dL", highlight: true },
  { label: "Peso alvo", value: "—", unit: "kg" },
  { label: "% Gordura alvo", value: "—", unit: "%" },
  { label: "Meta de sono", value: "7:30", unit: "h/noite" },
  { label: "Faixa Jiu", value: "Preta 2°", unit: "" },
  { label: "Prazo", value: "6 meses", unit: "" },
];

const cardiac = [
  { label: "FC Repouso", value: "—", unit: "bpm" },
  { label: "FC Máxima", value: "—", unit: "bpm" },
  { label: "HRV", value: "—", unit: "ms" },
  { label: "VO2Max", value: "—", unit: "mL/kg/min" },
];

const sectionIcons: Record<string, React.ReactNode> = {
  "Biometria Atual": <User size={14} className="text-primary" />,
  "Painel Hormonal": <TrendingUp size={14} className="text-accent" />,
  "Métricas Cardíacas": <Heart size={14} style={{ color: "hsl(var(--mod-treino))" }} />,
  "Força Atual (1RM)": <Dumbbell size={14} style={{ color: "hsl(var(--mod-treino))" }} />,
  "Objetivos e Metas": <Target size={14} className="text-primary" />,
};

interface FieldGroupProps {
  title: string;
  items: { label: string; value: string; unit: string; highlight?: boolean }[];
  delay?: number;
}

const FieldGroup = ({ title, items, delay = 0 }: FieldGroupProps) => (
  <motion.div
    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="surface-card overflow-hidden"
  >
    <div className="px-4 pt-4 pb-3 flex items-center gap-2">
      {sectionIcons[title]}
      <p className="font-mono text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
        {title}
      </p>
    </div>
    <div className="px-3 pb-3 grid grid-cols-3 gap-1.5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl px-3 py-2.5 text-center transition-colors"
          style={
            item.highlight
              ? { background: "hsla(var(--accent) / 0.08)", border: "1px solid hsla(var(--accent) / 0.2)" }
              : { background: "hsl(var(--secondary))" }
          }
        >
          <p
            className="font-mono text-[8px] font-semibold tracking-[0.12em] uppercase leading-tight"
            style={item.highlight ? { color: "hsl(var(--accent))" } : { color: "hsl(var(--muted-foreground))" }}
          >
            {item.label}
          </p>
          <p className="font-mono text-sm font-bold text-foreground mt-1 leading-none">
            {item.value}
          </p>
          {item.unit && (
            <p className="font-mono text-[8px] text-muted-foreground mt-0.5">{item.unit}</p>
          )}
        </div>
      ))}
    </div>
  </motion.div>
);

const Perfil = () => {
  const navigate = useNavigate();
  const [userPhoto] = useState<string | null>(() =>
    localStorage.getItem("ham-user-photo")
  );

  const quickLinks = [
    { icon: BookOpen, label: "Bíblia & Devocional", path: "/biblia", color: "hsl(var(--mod-biblia))" },
    { icon: Target, label: "Performance", path: "/performance", color: "hsl(var(--primary))" },
    { icon: Settings, label: "Configurações", path: "/config", color: "hsl(var(--muted-foreground))" },
  ];

  return (
    <div className="p-4 space-y-3 pb-8">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border"
        style={{
          background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
        }}
      >
        {/* Subtle glow */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
          style={{ background: "hsl(var(--primary))" }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full opacity-[0.05] blur-3xl pointer-events-none"
          style={{ background: "hsl(var(--accent))" }}
        />

        <div className="relative px-5 pt-6 pb-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt="Perfil"
                  className="w-[72px] h-[72px] rounded-2xl object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-2xl bg-secondary border border-border flex items-center justify-center">
                  <span className="font-mono text-2xl font-black text-primary">EB</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--accent))" }}>
                <Crown size={10} className="text-accent-foreground" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="font-mono text-base font-black text-foreground tracking-wide leading-tight">
                {profileData.name}
              </h2>
              <p className="font-mono text-[11px] text-muted-foreground mt-1">
                {profileData.age} anos · {profileData.city}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase" style={{ background: "hsla(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                  {profileData.occupation}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-info row */}
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Heart size={12} style={{ color: "hsl(var(--mod-treino))" }} />
              <span className="font-mono text-[10px] text-muted-foreground">{profileData.spouse}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} style={{ color: "hsl(var(--mod-biblia))" }} />
              <span className="font-mono text-[10px] text-muted-foreground">{profileData.ministry}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Sections */}
      <FieldGroup title="Biometria Atual" items={biometrics} delay={0.06} />
      <FieldGroup title="Painel Hormonal" items={hormones} delay={0.12} />
      <FieldGroup title="Métricas Cardíacas" items={cardiac} delay={0.18} />
      <FieldGroup title="Força Atual (1RM)" items={strength} delay={0.24} />
      <FieldGroup title="Objetivos e Metas" items={goals} delay={0.3} />

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.36, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="surface-card overflow-hidden divide-y divide-border/50"
      >
        {quickLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors active:scale-[0.98] active:bg-secondary"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${link.color}15` }}>
              <link.icon size={16} style={{ color: link.color }} />
            </div>
            <span className="font-mono text-xs font-semibold text-foreground flex-1 text-left">{link.label}</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default Perfil;
