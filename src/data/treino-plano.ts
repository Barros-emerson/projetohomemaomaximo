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

// Programa "Máquina 365" — séries e repetições exatamente como definidas.
export const weekPlan: TrainingDay[] = [
  {
    dayIndex: 0,
    label: "SEGUNDA",
    code: "M · PUSH STRENGTH",
    type: "PUSH",
    focus: "FORÇA",
    colorClass: "text-foreground",
    bgClass: "bg-foreground/5",
    borderClass: "border-foreground/20",
    emoji: "",
    intent: "Peitoral gigante + ombros largos + força real. Construa força suficiente para que seu físico imponha respeito antes mesmo da primeira palavra.",
    restSeconds: 150,
    exercises: [
      { id: "seg1", name: "Supino Barra", sets: "5", reps: "5", equipment: "Barra" },
      { id: "seg2", name: "Desenvolvimento Militar", sets: "5", reps: "5", equipment: "Barra" },
      { id: "seg3", name: "Barra Fixa", sets: "5", reps: "5" },
      { id: "seg4", name: "Supino Inclinado Halteres", sets: "3", reps: "10", equipment: "Halter" },
      { id: "seg5", name: "Elevação Lateral", sets: "5", reps: "15" },
      { id: "seg6", name: "Face Pull", sets: "3", reps: "20", equipment: "Cabo/Corda" },
      { id: "seg7", name: "Farmer Walk", sets: "4", reps: "40m" },
    ],
  },
  {
    dayIndex: 1,
    label: "TERÇA",
    code: "T · LOWER POWER",
    type: "LOWER",
    focus: "FORÇA",
    colorClass: "text-foreground",
    bgClass: "bg-foreground/5",
    borderClass: "border-foreground/20",
    emoji: "",
    jiuType: "BJJ 12:00",
    intent: "Joelho protegido + glúteo e posterior absurdamente fortes. Dor máxima aceitável: 3/10.",
    restSeconds: 120,
    exercises: [
      { id: "ter1", name: "Spanish Squat", sets: "5", reps: "40s", note: "Dor máxima aceitável: 3/10" },
      { id: "ter2", name: "Hip Thrust", sets: "5", reps: "6", equipment: "Barra" },
      { id: "ter3", name: "Terra Romeno", sets: "4", reps: "8", equipment: "Barra" },
      { id: "ter4", name: "Leg Press Parcial", sets: "4", reps: "12" },
      { id: "ter5", name: "Mesa Flexora", sets: "4", reps: "12" },
      { id: "ter6", name: "Abdução Máquina", sets: "4", reps: "20" },
      { id: "ter7", name: "Panturrilha", sets: "5", reps: "15" },
    ],
  },
  {
    dayIndex: 2,
    label: "QUARTA",
    code: "W · PULL MONSTER",
    type: "PULL",
    focus: "VOLUME",
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted-foreground/5",
    borderClass: "border-muted-foreground/20",
    emoji: "",
    intent: "Costas em V + bíceps gigantes.",
    restSeconds: 90,
    exercises: [
      { id: "qua1", name: "Barra Fixa", sets: "5", reps: "5" },
      { id: "qua2", name: "Remada Curvada", sets: "4", reps: "6", equipment: "Barra" },
      { id: "qua3", name: "Pulldown Aberto", sets: "4", reps: "10" },
      { id: "qua4", name: "Remada Unilateral", sets: "3", reps: "12", equipment: "Halter" },
      { id: "qua5", name: "Face Pull", sets: "4", reps: "20", equipment: "Cabo/Corda" },
      { id: "qua6", name: "Rosca Barra", sets: "4", reps: "8", equipment: "Barra" },
      { id: "qua7", name: "Rosca Inclinado", sets: "3", reps: "12", equipment: "Halter" },
      { id: "qua8", name: "Rosca Martelo", sets: "3", reps: "15", equipment: "Halter" },
    ],
  },
  {
    dayIndex: 3,
    label: "QUINTA",
    code: "R · ATHLETIC POWER",
    type: "POWER",
    focus: "EXPLOSÃO",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-400/8",
    borderClass: "border-emerald-400/20",
    emoji: "",
    jiuType: "BJJ 12:00",
    intent: "Explosão sem sacrificar recuperação.",
    restSeconds: 90,
    exercises: [
      { id: "qui1", name: "Push Press", sets: "6", reps: "3", equipment: "Barra" },
      { id: "qui2", name: "Kettlebell Swing", sets: "4", reps: "12", equipment: "Kettlebell" },
      { id: "qui3", name: "Sled Push", sets: "6", reps: "20m" },
      { id: "qui4", name: "Farmer Walk Pesado", sets: "3", reps: "40m" },
      { id: "qui5", name: "Battle Rope", sets: "6", reps: "20s" },
      { id: "qui6", name: "Prancha com Peso", sets: "3", reps: "45s" },
      { id: "qui7", name: "Pallof Press", sets: "3", reps: "15" },
    ],
  },
  {
    dayIndex: 4,
    label: "SEXTA",
    code: "F · SHAPE & STRENGTH",
    type: "FULL",
    focus: "PERFORMANCE",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-400/8",
    borderClass: "border-amber-400/20",
    emoji: "",
    intent: "Peito cheio + ombro 3D + braço grande + posterior forte.",
    restSeconds: 90,
    exercises: [
      { id: "sex1", name: "Terra Convencional", sets: "5", reps: "3", equipment: "Barra" },
      { id: "sex2", name: "Supino Inclinado Máquina", sets: "4", reps: "10" },
      { id: "sex3", name: "Crossover Baixo", sets: "3", reps: "15", equipment: "Cabo" },
      { id: "sex4", name: "Elevação Lateral 7-7-7", sets: "4", reps: "21", note: "7 parciais baixas + 7 altas + 7 completas" },
      { id: "sex5", name: "Posterior Ombro Máquina", sets: "4", reps: "15" },
      { id: "sex6", name: "Hip Thrust", sets: "3", reps: "12", equipment: "Barra" },
      { id: "sex7", name: "Flexora", sets: "3", reps: "15" },
      { id: "sex8", name: "Rosca Scott", sets: "4", reps: "10" },
      { id: "sex9", name: "Rosca Cabo", sets: "2", reps: "20", equipment: "Cabo" },
      { id: "sex10", name: "Tríceps Francês", sets: "3", reps: "12" },
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
    intent: "Modo Recuperação: descanso · mobilidade · caminhada opcional.",
    exercises: [],
  },
  {
    dayIndex: 6,
    label: "DOMINGO",
    code: "S · ACTIVE RECOVERY",
    type: "OFF",
    focus: "TOTAL",
    colorClass: "text-zinc-500",
    bgClass: "bg-zinc-500/8",
    borderClass: "border-zinc-500/15",
    emoji: "",
    intent: "Recuperação Ativa: caminhada · sol · alongamento.",
    exercises: [],
  },
];
