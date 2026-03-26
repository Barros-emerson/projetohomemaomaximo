import { motion, AnimatePresence } from "framer-motion";
import { User, Target, Dumbbell, Heart, BookOpen, Settings, ChevronRight, ChevronDown, Crown, TrendingUp, Shield, Pencil, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const STORAGE_KEY = "ham-perfil-data";
const METRICS_KEY = "ham-perfil-metrics";

interface ProfileData {
  name: string;
  age: number;
  city: string;
  occupation: string;
  spouse: string;
  spousePhone: string;
  ministry: string;
  church: string;
  focus: string;
  anamnese: string;
}

const defaultProfile: ProfileData = {
  name: "Emerson Barros",
  age: 35,
  city: "Brasília, DF",
  occupation: "Product Owner",
  spouse: "Camila",
  spousePhone: "",
  ministry: "Casais Millenium",
  church: "",
  focus: "",
  anamnese: "",
};

const loadProfile = (): ProfileData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
};

interface MetricItem {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}

const defaultMetrics: Record<string, MetricItem[]> = {
  biometrics: [
    { label: "Peso", value: "—", unit: "kg" },
    { label: "Altura", value: "—", unit: "cm" },
    { label: "% Gordura", value: "—", unit: "%" },
    { label: "IMC", value: "Auto", unit: "" },
    { label: "Cintura", value: "—", unit: "cm" },
    { label: "Pescoço", value: "—", unit: "cm" },
  ],
  hormones: [
    { label: "Testo Total", value: "—", unit: "ng/dL", highlight: true },
    { label: "Testo Livre", value: "—", unit: "pg/mL" },
    { label: "SHBG", value: "—", unit: "nmol/L" },
    { label: "Cortisol", value: "—", unit: "μg/dL" },
    { label: "Vitamina D", value: "—", unit: "ng/mL" },
    { label: "Zinco", value: "—", unit: "μg/dL" },
  ],
  strength: [
    { label: "Supino Reto", value: "—", unit: "kg" },
    { label: "Agachamento", value: "—", unit: "kg" },
    { label: "Terra", value: "—", unit: "kg" },
    { label: "Desenvolvimento", value: "—", unit: "kg" },
  ],
  goals: [
    { label: "Meta Testo", value: "1.000", unit: "ng/dL", highlight: true },
    { label: "Peso alvo", value: "—", unit: "kg" },
    { label: "% Gordura alvo", value: "—", unit: "%" },
    { label: "Meta de sono", value: "7:30", unit: "h/noite" },
    { label: "Faixa Jiu", value: "Preta 2°", unit: "" },
    { label: "Prazo", value: "6 meses", unit: "" },
  ],
  cardiac: [
    { label: "FC Repouso", value: "—", unit: "bpm" },
    { label: "FC Máxima", value: "—", unit: "bpm" },
    { label: "HRV", value: "—", unit: "ms" },
    { label: "VO2Max", value: "—", unit: "mL/kg/min" },
  ],
};

const loadMetrics = (): Record<string, MetricItem[]> => {
  const saved = localStorage.getItem(METRICS_KEY);
  if (!saved) return defaultMetrics;
  try {
    const parsed = JSON.parse(saved);
    // Merge with defaults to handle new fields
    const result: Record<string, MetricItem[]> = {};
    for (const key of Object.keys(defaultMetrics)) {
      result[key] = defaultMetrics[key].map((def) => {
        const saved = parsed[key]?.find((s: MetricItem) => s.label === def.label);
        return saved ? { ...def, value: saved.value } : def;
      });
    }
    return result;
  } catch {
    return defaultMetrics;
  }
};

const sectionIcons: Record<string, React.ReactNode> = {
  "Biometria Atual": <User size={14} className="text-primary" />,
  "Painel Hormonal": <TrendingUp size={14} className="text-accent" />,
  "Métricas Cardíacas": <Heart size={14} style={{ color: "hsl(0 80% 65%)" }} />,
  "Força Atual (1RM)": <Dumbbell size={14} style={{ color: "hsl(0 80% 65%)" }} />,
  "Objetivos e Metas": <Target size={14} className="text-primary" />,
};

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ title, icon, children, delay = 0, defaultOpen = false }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="surface-card overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3.5 flex items-center gap-2 active:bg-secondary/30 transition-colors"
      >
        {icon}
        <p className="font-mono text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase flex-1 text-left">
          {title}
        </p>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface EditableMetricCardProps {
  item: MetricItem;
  onSave: (newValue: string) => void;
}

const EditableMetricCard = ({ item, onSave }: EditableMetricCardProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.value);

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className="rounded-xl px-3 py-2.5 text-center border-2"
        style={{ borderColor: "hsl(var(--primary))", background: "hsl(var(--secondary))" }}
      >
        <p
          className="font-mono text-[8px] font-semibold tracking-[0.12em] uppercase leading-tight text-muted-foreground"
        >
          {item.label}
        </p>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setDraft(item.value); setEditing(false); }
          }}
          className="w-full bg-transparent font-mono text-sm font-bold text-foreground mt-1 leading-none text-center outline-none"
        />
        {item.unit && <p className="font-mono text-[8px] text-muted-foreground mt-0.5">{item.unit}</p>}
        <div className="flex justify-center gap-1 mt-1.5">
          <button onClick={save} className="p-1 rounded-md bg-primary/10 active:scale-90">
            <Check size={10} className="text-primary" />
          </button>
          <button onClick={() => { setDraft(item.value); setEditing(false); }} className="p-1 rounded-md active:scale-90">
            <X size={10} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="rounded-xl px-3 py-2.5 text-center transition-colors active:scale-[0.97] group"
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
      <p className="font-mono text-sm font-bold text-foreground mt-1 leading-none">{item.value}</p>
      {item.unit && <p className="font-mono text-[8px] text-muted-foreground mt-0.5">{item.unit}</p>}
      <Pencil size={8} className="mx-auto mt-1 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors" />
    </button>
  );
};

interface EditableFieldGroupProps {
  title: string;
  items: MetricItem[];
  onUpdateItem: (index: number, newValue: string) => void;
  delay?: number;
}

const EditableFieldGroup = ({ title, items, onUpdateItem, delay = 0 }: EditableFieldGroupProps) => (
  <CollapsibleSection title={title} icon={sectionIcons[title]} delay={delay}>
    <div className="px-3 pb-3 grid grid-cols-3 gap-1.5">
      {items.map((item, i) => (
        <EditableMetricCard key={item.label} item={item} onSave={(v) => onUpdateItem(i, v)} />
      ))}
    </div>
  </CollapsibleSection>
);

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (val: string) => void;
  multiline?: boolean;
}

const EditableField = ({ label, value, onSave, multiline }: EditableFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-start gap-2">
        {multiline ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 font-mono text-[11px] text-foreground outline-none border border-primary/20 resize-none"
          />
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 font-mono text-[11px] text-foreground outline-none border border-primary/20"
          />
        )}
        <button onClick={save} className="p-1.5 rounded-lg bg-primary/10 active:scale-90">
          <Check size={14} className="text-primary" />
        </button>
        <button onClick={() => { setDraft(value); setEditing(false); }} className="p-1.5 rounded-lg active:scale-90">
          <X size={14} className="text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="w-full flex items-center justify-between py-2 px-1 rounded-lg hover:bg-secondary/30 transition-colors active:scale-[0.98] group"
    >
      <div className="text-left flex-1 min-w-0">
        <p className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase">{label}</p>
        <p className="font-mono text-xs text-foreground mt-0.5 truncate">
          {value || <span className="text-muted-foreground/40 italic">Toque para editar</span>}
        </p>
      </div>
      <Pencil size={12} className="text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors shrink-0 ml-2" />
    </button>
  );
};

const Perfil = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>(loadProfile);
  const [metrics, setMetrics] = useState<Record<string, MetricItem[]>>(loadMetrics);
  const [userPhoto, setUserPhoto] = useState<string | null>(() => localStorage.getItem("ham-user-photo"));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem("ham-user-photo", dataUrl);
      setUserPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
  }, [metrics]);

  const update = (key: keyof ProfileData, val: string) =>
    setProfile((prev) => ({ ...prev, [key]: key === "age" ? Number(val) || 0 : val }));

  const updateMetric = (section: string, index: number, newValue: string) => {
    setMetrics((prev) => {
      const updated = { ...prev };
      updated[section] = [...prev[section]];
      updated[section][index] = { ...updated[section][index], value: newValue };
      return updated;
    });
  };

  const quickLinks = [
    { icon: BookOpen, label: "Bíblia & Devocional", path: "/biblia", color: "hsl(270 55% 65%)" },
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
        style={{ background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}
      >
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: "hsl(var(--primary))" }} />
        <div className="relative px-5 pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="relative">
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                {userPhoto ? (
                  <img src={userPhoto} alt="Perfil" className="w-[72px] h-[72px] rounded-2xl object-cover ring-2 ring-primary/20" />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-2xl bg-secondary border border-border flex items-center justify-center">
                    <span className="font-mono text-2xl font-black text-primary">
                      {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center bg-primary">
                  <Pencil size={10} className="text-primary-foreground" />
                </div>
              </label>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="font-mono text-base font-black text-foreground tracking-wide leading-tight">{profile.name}</h2>
              <p className="font-mono text-[11px] text-muted-foreground mt-1">{profile.age} anos · {profile.city}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase" style={{ background: "hsla(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                  {profile.occupation}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Heart size={12} style={{ color: "hsl(0 80% 65%)" }} />
              <span className="font-mono text-[10px] text-muted-foreground">{profile.spouse}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} style={{ color: "hsl(270 55% 65%)" }} />
              <span className="font-mono text-[10px] text-muted-foreground">{profile.ministry}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Editable personal info */}
      <CollapsibleSection title="Dados Pessoais" icon={<Pencil size={14} className="text-primary" />} delay={0.04}>
        <div className="px-4 pb-4 space-y-1">
          <EditableField label="Nome" value={profile.name} onSave={(v) => update("name", v)} />
          <EditableField label="Idade" value={String(profile.age)} onSave={(v) => update("age", v)} />
          <EditableField label="Cidade" value={profile.city} onSave={(v) => update("city", v)} />
          <EditableField label="Profissão" value={profile.occupation} onSave={(v) => update("occupation", v)} />
          <EditableField label="Cônjuge" value={profile.spouse} onSave={(v) => update("spouse", v)} />
          <EditableField label="Telefone do cônjuge" value={profile.spousePhone} onSave={(v) => update("spousePhone", v)} />
          <EditableField label="Igreja" value={profile.church} onSave={(v) => update("church", v)} />
          <EditableField label="Ministério" value={profile.ministry} onSave={(v) => update("ministry", v)} />
        </div>
      </CollapsibleSection>

      {/* Editable focus & anamnese */}
      <CollapsibleSection title="Foco & Anamnese do Dia" icon={<Target size={14} className="text-accent" />} delay={0.08}>
        <div className="px-4 pb-4 space-y-1">
          <EditableField label="Foco atual" value={profile.focus} onSave={(v) => update("focus", v)} />
          <EditableField label="Anamnese do dia" value={profile.anamnese} onSave={(v) => update("anamnese", v)} multiline />
        </div>
      </CollapsibleSection>

      {/* Editable Data Sections */}
      <EditableFieldGroup title="Biometria Atual" items={metrics.biometrics} onUpdateItem={(i, v) => updateMetric("biometrics", i, v)} delay={0.12} />
      <EditableFieldGroup title="Painel Hormonal" items={metrics.hormones} onUpdateItem={(i, v) => updateMetric("hormones", i, v)} delay={0.15} />
      <EditableFieldGroup title="Métricas Cardíacas" items={metrics.cardiac} onUpdateItem={(i, v) => updateMetric("cardiac", i, v)} delay={0.18} />
      <EditableFieldGroup title="Força Atual (1RM)" items={metrics.strength} onUpdateItem={(i, v) => updateMetric("strength", i, v)} delay={0.21} />
      <EditableFieldGroup title="Objetivos e Metas" items={metrics.goals} onUpdateItem={(i, v) => updateMetric("goals", i, v)} delay={0.24} />

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.28, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
