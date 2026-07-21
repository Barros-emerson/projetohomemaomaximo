export interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  equipment?: string;
  note?: string;
}

export interface TrainingDay {
  dayIndex: number;
  label: string;
  code: string; // tactical code shown in header
  type: string;
  focus: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  emoji: string; // kept for legacy compat, empty when unused
  jiuType?: string;
  intent?: string; // one-line strategic intent
  restSeconds?: number;
  exercises: Exercise[];
}

// Tactical palette — no bodybuilding colors.
// FORÇA branco / VOLUME cinza / POWER verde / PERFORMANCE dourado / RECOVERY zinc
export const weekPlan: TrainingDay[] = [
  {
    dayIndex: 0,
    label: "SEGUNDA",
    code: "M · UPPER STRENGTH",
    type: "UPPER",
    focus: "FORÇA",
    colorClass: "text-foreground",
    bgClass: "bg-foreground/5",
    borderClass: "border-foreground/20",
    emoji: "",
    intent: "Força máxima do tronco. Barra pesada, execução limpa.",
    restSeconds: 180,
    exercises: [
      { id: "seg1", name: "Supino Reto", sets: "5", reps: "5", equipment: "Barra", note: "Progressão lenta — peitoral em recuperação. Sem passar pela dor." },
      { id: "seg2", name: "Barra Fixa com Carga", sets: "5", reps: "5", equipment: "Cinturão" },
      { id: "seg3", name: "Desenvolvimento Militar em Pé", sets: "5", reps: "5", equipment: "Barra" },
      { id: "seg4", name: "Remada Curvada", sets: "4", reps: "6", equipment: "Barra" },
      { id: "seg5", name: "Farmer Walk", sets: "4", reps: "40m", equipment: "Halter/Trap bar pesado", note: "Grip + postura + core" },
      { id: "seg6", name: "Face Pull", sets: "3", reps: "20", equipment: "Cabo/Corda", note: "Saúde do ombro" },
    ],
  },
  {
    dayIndex: 1,
    label: "TERÇA",
    code: "T · LOWER STRENGTH",
    type: "LOWER",
    focus: "FORÇA",
    colorClass: "text-foreground",
    bgClass: "bg-foreground/5",
    borderClass: "border-foreground/20",
    emoji: "",
    jiuType: "BJJ 12:00",
    intent: "Força de perna. Sem falha total — Jiu ao meio-dia.",
    restSeconds: 180,
    exercises: [
      { id: "ter1", name: "Agachamento (Back Squat)", sets: "5", reps: "5", equipment: "Barra", note: "Parar 1-2 reps antes da falha" },
      { id: "ter2", name: "Levantamento Terra Romeno (RDL)", sets: "4", reps: "6", equipment: "Barra" },
      { id: "ter3", name: "Afundo Caminhando", sets: "3", reps: "10/perna" },
      { id: "ter4", name: "Panturrilha em Pé", sets: "4", reps: "15" },
      { id: "ter5", name: "Ab Wheel (Roda Abdominal)", sets: "4", reps: "12" },
    ],
  },
  {
    dayIndex: 2,
    label: "QUARTA",
    code: "W · UPPER VOLUME",
    type: "UPPER",
    focus: "VOLUME",
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted-foreground/5",
    borderClass: "border-muted-foreground/20",
    emoji: "",
    intent: "Volume técnico. Execução perfeita, nunca sacrifique técnica.",
    restSeconds: 75,
    exercises: [
      { id: "qua1", name: "Supino Inclinado com Halter", sets: "4", reps: "10", equipment: "Halter", note: "Progressão lenta — peito em recuperação" },
      { id: "qua2", name: "Remada na Máquina", sets: "4", reps: "10" },
      { id: "qua3", name: "Puxador Frente", sets: "3", reps: "12" },
      { id: "qua4", name: "Desenvolvimento na Máquina", sets: "3", reps: "10" },
      { id: "qua5", name: "Elevação Lateral", sets: "3", reps: "15" },
      { id: "qua6", name: "Rosca Direta", sets: "3", reps: "10", equipment: "Barra" },
      { id: "qua7", name: "Tríceps na Corda", sets: "3", reps: "12", equipment: "Polia" },
    ],
  },
  {
    dayIndex: 3,
    label: "QUINTA",
    code: "R · POWER DAY",
    type: "POWER",
    focus: "EXPLOSÃO",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-400/8",
    borderClass: "border-emerald-400/20",
    emoji: "",
    jiuType: "BJJ 12:00",
    intent: "Explosividade e potência. Sem foco em hipertrofia.",
    restSeconds: 120,
    exercises: [
      { id: "qui1", name: "Box Jump", sets: "5", reps: "3", note: "Altura confortável — foco em pousar" },
      { id: "qui2", name: "Push Press", sets: "5", reps: "3", equipment: "Barra", note: "Impulso de perna" },
      { id: "qui3", name: "Kettlebell Swing", sets: "5", reps: "10", equipment: "KB pesado" },
      { id: "qui4", name: "Farmer Walk Pesado", sets: "4", reps: "30m", equipment: "Máxima carga com forma limpa" },
      { id: "qui5", name: "Core Stability (Pallof/Dead Bug)", sets: "3", reps: "45s" },
      { id: "qui6", name: "Mobilidade de Quadril + Ombro", sets: "1", reps: "5-8min" },
    ],
  },
  {
    dayIndex: 4,
    label: "SEXTA",
    code: "F · LOWER PERFORMANCE",
    type: "LOWER",
    focus: "PERFORMANCE",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-400/8",
    borderClass: "border-amber-400/20",
    emoji: "",
    intent: "Força de posterior e cadeia atlética. Cargas altas, reps baixas.",
    restSeconds: 210,
    exercises: [
      { id: "sex1", name: "Levantamento Terra Convencional", sets: "5", reps: "3", equipment: "Barra" },
      { id: "sex2", name: "Agachamento Frontal (Front Squat)", sets: "4", reps: "6", equipment: "Barra" },
      { id: "sex3", name: "Hip Thrust", sets: "4", reps: "8", equipment: "Barra" },
      { id: "sex4", name: "Mesa Flexora", sets: "3", reps: "12" },
      { id: "sex5", name: "Panturrilha em Pé", sets: "4", reps: "15" },
    ],
  },
  {
    dayIndex: 5,
    label: "SÁBADO",
    code: "S · RECOVERY",
    type: "RECOVERY",
    focus: "RECUPERAÇÃO",
    colorClass: "text-zinc-400",
    bgClass: "bg-zinc-500/8",
    borderClass: "border-zinc-500/20",
    emoji: "",
    jiuType: "BJJ opcional",
    intent: "Sem academia. Jiu se quiser. Recuperar é operar.",
    exercises: [],
  },
  {
    dayIndex: 6,
    label: "DOMINGO",
    code: "S · OFF",
    type: "OFF",
    focus: "TOTAL",
    colorClass: "text-zinc-500",
    bgClass: "bg-zinc-500/8",
    borderClass: "border-zinc-500/15",
    emoji: "",
    intent: "Caminhada · Sol · Mobilidade · Família · Bíblia.",
    exercises: [],
  },
];
