import { motion } from "framer-motion";
import { User, Target, Dumbbell, Heart, BookOpen, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface FieldGroupProps {
  title: string;
  items: { label: string; value: string; unit: string; highlight?: boolean }[];
  delay?: number;
}

const FieldGroup = ({ title, items, delay = 0 }: FieldGroupProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="surface-card p-4"
  >
    <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border uppercase">
      {title}
    </p>
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg p-2.5"
          style={
            item.highlight
              ? { background: "rgba(245,197,66,0.08)", border: "1px solid rgba(245,197,66,0.25)" }
              : { background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }
          }
        >
          <p className="font-mono text-[9px] font-bold tracking-wider uppercase" style={item.highlight ? { color: "#F5C542" } : { color: "hsl(var(--muted-foreground))" }}>
            {item.label}
          </p>
          <p className="font-mono text-sm font-semibold text-foreground mt-0.5">
            {item.value}
            {item.unit && <span className="text-[10px] text-muted-foreground ml-1">{item.unit}</span>}
          </p>
        </div>
      ))}
    </div>
  </motion.div>
);

const Perfil = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-3">
      {/* Avatar + Name */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-5 border-glow"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
            <span className="font-mono text-2xl font-extrabold text-primary">EB</span>
          </div>
          <div>
            <h2 className="font-mono text-base font-extrabold text-foreground tracking-wide">{profileData.name}</h2>
            <p className="font-mono text-[11px] text-muted-foreground">{profileData.age} anos · {profileData.city}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{profileData.occupation} · {profileData.ministry}</p>
          </div>
        </div>
      </motion.div>

      <FieldGroup title="Biometria Atual" items={biometrics} delay={0.05} />
      <FieldGroup title="Painel Hormonal" items={hormones} delay={0.1} />
      <FieldGroup title="Métricas Cardíacas" items={cardiac} delay={0.15} />
      <FieldGroup title="Força Atual (1RM)" items={strength} delay={0.2} />
      <FieldGroup title="Objetivos e Metas" items={goals} delay={0.25} />

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="surface-card p-3 space-y-1"
      >
        {[
          { icon: BookOpen, label: "Bíblia", path: "/biblia", color: "#C084FC" },
          { icon: Target, label: "Performance", path: "/performance", color: "#4ADE80" },
          { icon: Settings, label: "Configurações", path: "/config", color: "hsl(var(--muted-foreground))" },
        ].map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors active:scale-[0.98]"
          >
            <link.icon size={18} style={{ color: link.color }} />
            <span className="font-mono text-sm text-foreground">{link.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default Perfil;
