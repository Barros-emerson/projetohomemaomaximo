export interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  equipment?: string;
}

export interface TrainingDay {
  dayIndex: number;
  label: string;
  type: string;
  focus: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  emoji: string;
  jiuType?: string;
  exercises: Exercise[];
}

export const weekPlan: TrainingDay[] = [
  {
    dayIndex: 0,
    label: "SEGUNDA",
    type: "UPPER",
    focus: "FORÇA",
    colorClass: "text-blue-400",
    bgClass: "bg-blue-400/10",
    borderClass: "border-blue-400/25",
    emoji: "💪",
    jiuType: "ALUNO 19:00",
    exercises: [
      { id: "seg1", name: "Supino Reto", sets: "5", reps: "5", equipment: "Barra" },
      { id: "seg2", name: "Barra Fixa", sets: "4", reps: "Falha" },
      { id: "seg3", name: "Desenvolvimento Militar", sets: "4", reps: "6" },
      { id: "seg4", name: "Remada Curvada", sets: "4", reps: "6", equipment: "Barra" },
      { id: "seg5", name: "Paralelas", sets: "3", reps: "Falha" },
      { id: "seg6", name: "Elevação Lateral", sets: "2", reps: "Drop Set" },
      { id: "seg7", name: "Crucifixo", sets: "2", reps: "15-20", equipment: "Máquina/Cabo" },
    ],
  },
  {
    dayIndex: 1,
    label: "TERÇA",
    type: "LOWER",
    focus: "FORÇA",
    colorClass: "text-red-400",
    bgClass: "bg-red-400/10",
    borderClass: "border-red-400/25",
    emoji: "🦵",
    jiuType: "PROFESSOR 18:10",
    exercises: [
      { id: "ter0a", name: "Aquecimento + Mobilidade Segura", sets: "1", reps: "8-10min", equipment: "Bike/Esteira leve" },
      { id: "ter0b", name: "Ativação de Glúteo", sets: "2", reps: "15", equipment: "Miniband" },
      { id: "ter1", name: "Spanish Squat Isométrico", sets: "5", reps: "30-45s", equipment: "Banda · desc. 45s" },
      { id: "ter2", name: "Leg Press Parcial (0°-30°)", sets: "4", reps: "12", equipment: "Pés altos · cadência lenta" },
      { id: "ter3", name: "Hip Thrust / Elevação Pélvica", sets: "4", reps: "10-12", equipment: "Progressão controlada" },
      { id: "ter4", name: "Mesa Flexora", sets: "4", reps: "12-15", equipment: "Excêntrica controlada" },
      { id: "ter5", name: "Stiff / RDL", sets: "4", reps: "10", equipment: "Joelho semi-flexionado" },
      { id: "ter6", name: "Abdução de Quadril / Glúteo Médio", sets: "4", reps: "15-20", equipment: "Máquina/Cabo" },
      { id: "ter7", name: "Panturrilha", sets: "4", reps: "15-20", equipment: "Controlada" },
      { id: "ter8", name: "Pallof Press (Anti-Rotação)", sets: "3", reps: "12/lado", equipment: "Cabo/Banda" },
      { id: "ter9", name: "Prancha Lateral", sets: "3", reps: "30-40s/lado" },
      { id: "ter10", name: "Dead Bug", sets: "3", reps: "10/lado" },
    ],
  },
  {
    dayIndex: 2,
    label: "QUARTA",
    type: "OFF",
    focus: "RECUPERAÇÃO ATIVA",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-400/8",
    borderClass: "border-emerald-400/15",
    emoji: "🌿",
    jiuType: "JIU INTENSO (noite)",
    exercises: [],
  },
  {
    dayIndex: 3,
    label: "QUINTA",
    type: "UPPER",
    focus: "HIPERTROFIA",
    colorClass: "text-violet-400",
    bgClass: "bg-violet-400/10",
    borderClass: "border-violet-400/25",
    emoji: "🔥",
    jiuType: "PROFESSOR 18:10",
    exercises: [
      { id: "qui1", name: "Supino Inclinado", sets: "4", reps: "10-12", equipment: "Halter" },
      { id: "qui2", name: "Puxador Frente", sets: "4", reps: "10" },
      { id: "qui3", name: "Remada Baixa", sets: "3", reps: "12" },
      { id: "qui4", name: "Elevação Lateral", sets: "4", reps: "15" },
      { id: "qui5", name: "Rosca Direta", sets: "3", reps: "10", equipment: "Barra" },
      { id: "qui6", name: "Tríceps Polia", sets: "3", reps: "12", equipment: "Corda" },
    ],
  },
  {
    dayIndex: 4,
    label: "SEXTA",
    type: "LOWER",
    focus: "HIPERTROFIA",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-400/10",
    borderClass: "border-amber-400/22",
    emoji: "⚡",
    jiuType: "SEM JIU",
    exercises: [
      { id: "sex1", name: "Agachamento Livre", sets: "4", reps: "10" },
      { id: "sex2", name: "Stiff", sets: "4", reps: "10" },
      { id: "sex3", name: "Extensora", sets: "3", reps: "15" },
      { id: "sex4", name: "Flexora", sets: "3", reps: "15" },
      { id: "sex5", name: "Elevação Pélvica", sets: "3", reps: "12" },
      { id: "sex6", name: "Panturrilha", sets: "4", reps: "15" },
    ],
  },
  {
    dayIndex: 5,
    label: "SÁBADO",
    type: "JIU",
    focus: "FORTE",
    colorClass: "text-cyan-400",
    bgClass: "bg-cyan-400/8",
    borderClass: "border-cyan-400/20",
    emoji: "🥋",
    jiuType: "INTENSIDADE MÁXIMA",
    exercises: [],
  },
  {
    dayIndex: 6,
    label: "DOMINGO",
    type: "OFF",
    focus: "TOTAL",
    colorClass: "text-zinc-500",
    bgClass: "bg-zinc-500/8",
    borderClass: "border-zinc-500/15",
    emoji: "🙏",
    exercises: [],
  },
];
