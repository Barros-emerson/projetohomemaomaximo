export interface RotinaItem {
  id: string;
  time: string;
  label: string;
  detail: string;
  tags?: { label: string; color: string }[];
  alert?: boolean;
  immutable?: boolean;
  dotColor: string;
}

export interface RotinaDia {
  dayIndex: number; // 0=seg, 6=dom
  dayLabel: string;
  dayShort: string;
  badges: { label: string; color: string; bg: string }[];
  pillColor: string;
  pillBorder: string;
  pillBg: string;
  items: RotinaItem[];
}

const morningBase: RotinaItem[] = [
  { id: "acordar", time: "5:45", label: "Acordar", detail: "Ritmo lento. Banheiro, escovação, troca de roupa.", alert: true, dotColor: "#F5C542" },
  { id: "passeio", time: "6:10", label: "Passeio com o cachorro", detail: "10 a 13 minutos. Celular junto mas sem usar.", dotColor: "#4ADE80", tags: [{ label: "Sol matinal", color: "#4ADE80" }, { label: "Ativação", color: "#4ADE80" }] },
  { id: "cafe", time: "6:25", label: "Café preto + prep", detail: "Café sem açúcar. Creatina 5g. Prep para treino do lado de casa.", dotColor: "#FB923C", tags: [{ label: "Creatina 5g", color: "#FB923C" }, { label: "Pré-treino", color: "#FB923C" }] },
];

const workBase: RotinaItem[] = [
  { id: "volta_casa", time: "7:50", label: "Voltar para casa", detail: "Pós-treino. Hidratação e respiração até em casa.", dotColor: "#60A5FA" },
  { id: "sol", time: "8:00", label: "Banho + sol pós-treino", detail: "10-20 min de sol direto. Respiração. Sem celular.", dotColor: "#4ADE80", tags: [{ label: "Testo livre", color: "#4ADE80" }, { label: "Cortisol", color: "#4ADE80" }] },
  { id: "sair_trabalho", time: "8:10", label: "Sair para o trabalho", detail: "Deslocamento. Chegada ~9:00.", dotColor: "#60A5FA" },
  { id: "trabalho", time: "9:00", label: "Chegar no trabalho", detail: "Pós-treino: arroz + ovos/frango + gordura boa.", dotColor: "#60A5FA" },
  { id: "almoco", time: "12:30", label: "Almoço", detail: "Proteína + carboidrato complexo. Comer sem pressa.", dotColor: "#FB923C" },
  { id: "lanche", time: "16:00", label: "Lanche da tarde", detail: "Proteína + gordura. Pré-Jiu: banana ou arroz ~17:30.", dotColor: "#FB923C" },
];

const nightBase: RotinaItem[] = [
  { id: "desacelerar", time: "22:00", label: "Desacelerar digital", detail: "Tela off. Rotina de sono. Bíblia com Amor (áudio devocional).", dotColor: "#C084FC", tags: [{ label: "Dopamina", color: "#C084FC" }, { label: "Libido", color: "#C084FC" }] },
  { id: "dormir", time: "22:30", label: "Dormir", detail: "Meta 7h30. Polar monitora sono, HRV e Nightly Recharge.", alert: true, dotColor: "#F5C542", tags: [{ label: "GH noturno", color: "#F5C542" }, { label: "Recuperação", color: "#F5C542" }] },
];

export const rotinaSemanal: RotinaDia[] = [
  {
    dayIndex: 0, dayLabel: "Segunda-feira", dayShort: "SEG",
    pillColor: "#60A5FA", pillBorder: "rgba(96,165,250,0.4)", pillBg: "rgba(96,165,250,0.1)",
    badges: [
      { label: "UPPER FORÇA", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
      { label: "ALUNO JIU", color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
    ],
    items: [
      ...morningBase,
      { id: "treino_seg", time: "6:40", label: "Treino — UPPER FORÇA", detail: "Supino Reto 5x5 / Barra Fixa 4xFalha / Desenv. Militar 4x6 / Remada Curvada 4x6 / Paralelas 3xFalha", alert: true, dotColor: "#F87171", tags: [{ label: "Força", color: "#F87171" }, { label: "Polar ativo", color: "#F87171" }] },
      ...workBase,
      { id: "saida_jiu_seg", time: "17:50", label: "Saída do trabalho", detail: "Deslocamento para o Jiu-Jitsu.", dotColor: "#22D3EE" },
      { id: "jiu_seg", time: "19:00", label: "Jiu-Jitsu — ALUNO", detail: "Treino até 20:30. Intensidade alta. Na porrada.", alert: true, dotColor: "#22D3EE", tags: [{ label: "Aluno", color: "#22D3EE" }, { label: "Alta intensidade", color: "#F87171" }, { label: "Polar ativo", color: "#4ADE80" }] },
      { id: "casa_seg", time: "21:10", label: "Chegar em casa", detail: "Papo pós-treino habitual. Pós-Jiu: proteína + gordura. Pouco carbo.", dotColor: "#C084FC" },
      ...nightBase,
    ],
  },
  {
    dayIndex: 1, dayLabel: "Terça-feira", dayShort: "TER",
    pillColor: "#F87171", pillBorder: "rgba(248,113,113,0.4)", pillBg: "rgba(248,113,113,0.1)",
    badges: [
      { label: "LOWER FORÇA", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
      { label: "PROFESSOR JIU", color: "#F5C542", bg: "rgba(245,197,66,0.1)" },
    ],
    items: [
      ...morningBase,
      { id: "treino_ter", time: "6:40", label: "Treino — LOWER FORÇA", detail: "Agachamento 5x5 / Terra 4x5 / Leg Press 3x8 / Panturrilha 4x15 / Abdominal pesado", alert: true, dotColor: "#F87171", tags: [{ label: "Força", color: "#F87171" }] },
      ...workBase,
      { id: "jiu_ter", time: "18:10", label: "Jiu-Jitsu — PROFESSOR", detail: "Aula até 19:20. Carga controlada. Técnica, não guerra.", alert: true, dotColor: "#22D3EE", tags: [{ label: "Professor", color: "#22D3EE" }, { label: "Controlado", color: "#F5C542" }] },
      { id: "casa_ter", time: "20:00", label: "Chegar em casa", detail: "Mais cedo que segunda/quarta. Rotina noturna mais tranquila.", dotColor: "#C084FC" },
      ...nightBase,
    ],
  },
  {
    dayIndex: 2, dayLabel: "Quarta-feira", dayShort: "QUA",
    pillColor: "#4ADE80", pillBorder: "rgba(74,222,128,0.4)", pillBg: "rgba(74,222,128,0.1)",
    badges: [
      { label: "UPPER HIPER", color: "#C084FC", bg: "rgba(192,132,252,0.1)" },
      { label: "ALUNO JIU (forte)", color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
    ],
    items: [
      ...morningBase,
      { id: "treino_qua", time: "6:40", label: "Treino — UPPER HIPER", detail: "Supino Inclinado 4x10-12 / Puxador 4x10 / Elevação Lateral 4x15 / Remada Baixa 3x12 / Rosca 3x10 / Tríceps 3x12", alert: true, dotColor: "#C084FC", tags: [{ label: "Hipertrofia", color: "#C084FC" }] },
      ...workBase,
      { id: "saida_jiu_qua", time: "17:50", label: "Saída do trabalho", detail: "Deslocamento para o Jiu-Jitsu.", dotColor: "#22D3EE" },
      { id: "jiu_qua", time: "19:00", label: "Jiu-Jitsu — ALUNO (pesado)", detail: "Até 20:30. Na porrada. Máxima intensidade como aluno.", alert: true, dotColor: "#22D3EE", tags: [{ label: "Alta intensidade", color: "#F87171" }] },
      { id: "casa_qua", time: "21:10", label: "Chegar em casa", detail: "Papo pós treino. Mesma rotina noturna da segunda.", dotColor: "#C084FC" },
      ...nightBase,
    ],
  },
  {
    dayIndex: 3, dayLabel: "Quinta-feira", dayShort: "QUI",
    pillColor: "#C084FC", pillBorder: "rgba(192,132,252,0.4)", pillBg: "rgba(192,132,252,0.1)",
    badges: [
      { label: "LOWER HIPER", color: "#C084FC", bg: "rgba(192,132,252,0.1)" },
      { label: "PROFESSOR JIU", color: "#F5C542", bg: "rgba(245,197,66,0.1)" },
    ],
    items: [
      ...morningBase,
      { id: "treino_qui", time: "6:40", label: "Treino — LOWER HIPER", detail: "Agachamento 4x10 / Stiff 4x10 / Extensora 3x15 / Flexora 3x15 / Elevação Pélvica 3x12 / Panturrilha 4x15", alert: true, dotColor: "#C084FC", tags: [{ label: "Hipertrofia", color: "#C084FC" }] },
      ...workBase,
      { id: "jiu_qui", time: "18:10", label: "Jiu-Jitsu — PROFESSOR", detail: "Aula até 19:20. Técnica em foco, carga gerenciada.", alert: true, dotColor: "#22D3EE", tags: [{ label: "Professor", color: "#22D3EE" }, { label: "Controlado", color: "#F5C542" }] },
      { id: "casa_qui", time: "20:00", label: "Chegar em casa", detail: "Rotina noturna. Bíblia. Desacelerar. Dormir 22:30.", dotColor: "#C084FC" },
      ...nightBase,
    ],
  },
  {
    dayIndex: 4, dayLabel: "Sexta-feira", dayShort: "SEX",
    pillColor: "#FB923C", pillBorder: "rgba(251,146,60,0.4)", pillBg: "rgba(251,146,60,0.1)",
    badges: [
      { label: "LOWER HIPER", color: "#C084FC", bg: "rgba(192,132,252,0.1)" },
      { label: "SEM JIU", color: "#4ADE80", bg: "rgba(74,222,128,0.1)" },
    ],
    items: [
      ...morningBase,
      { id: "treino_sex", time: "6:40", label: "Treino — LOWER HIPER", detail: "Agachamento 4x10 / Stiff 4x10 / Extensora 3x15 / Flexora 3x15 / Elevação Pélvica 3x12 / Panturrilha 4x15", alert: true, dotColor: "#C084FC", tags: [{ label: "Hipertrofia", color: "#C084FC" }] },
      ...workBase,
      { id: "casa_sex", time: "17:30", label: "Saída do trabalho — para casa", detail: "Trânsito. Chegada em casa ~18:30. Sem Jiu. Dia mais livre.", dotColor: "#4ADE80", tags: [{ label: "Recuperação ativa", color: "#4ADE80" }] },
      ...nightBase,
    ],
  },
  {
    dayIndex: 5, dayLabel: "Sábado", dayShort: "SÁB",
    pillColor: "#22D3EE", pillBorder: "rgba(34,211,238,0.4)", pillBg: "rgba(34,211,238,0.1)",
    badges: [
      { label: "PROFESSOR PESADO", color: "#22D3EE", bg: "rgba(34,211,238,0.1)" },
      { label: "BÍBLIA", color: "#C084FC", bg: "rgba(192,132,252,0.1)" },
    ],
    items: [
      { id: "acordar_sab", time: "7:30", label: "Acordar sem pressa", detail: "Máximo 7:30. Café preto sem pressa. Ritmo de recuperação.", dotColor: "#F5C542" },
      { id: "biblia_sab", time: "8:00", label: "Bíblia — Leitura com Amor", detail: "Devocional do casal. Hábito diário.", alert: true, dotColor: "#C084FC", tags: [{ label: "Casal", color: "#C084FC" }, { label: "Áudio automático", color: "#C084FC" }] },
      { id: "sair_sab", time: "9:00", label: "Sair para o Jiu-Jitsu", detail: "Treino começa às 10:00. Chegar antes para prep.", dotColor: "#22D3EE" },
      { id: "jiu_sab", time: "10:00", label: "Jiu-Jitsu — PROFESSOR (pegado)", detail: "Até 11:30. Só porrada mesmo sendo professor. Estímulo hormonal alto.", alert: true, dotColor: "#22D3EE", tags: [{ label: "Alta intensidade", color: "#F87171" }, { label: "GH", color: "#F5C542" }] },
      { id: "almoco_sab", time: "12:00", label: "Almoço pós-treino", detail: "Restaurante próximo ao treino ou em casa. Sol + água + proteína.", dotColor: "#FB923C" },
      { id: "tarde_sab", time: "14:00", label: "Tarde livre", detail: "Casa. Família. Recuperação. Sem obrigações.", dotColor: "#4ADE80" },
    ],
  },
  {
    dayIndex: 6, dayLabel: "Domingo", dayShort: "DOM",
    pillColor: "#6B7280", pillBorder: "rgba(107,114,128,0.3)", pillBg: "rgba(107,114,128,0.08)",
    badges: [
      { label: "OFF TOTAL", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
      { label: "IGREJA 18:00", color: "#C084FC", bg: "rgba(192,132,252,0.1)" },
    ],
    items: [
      { id: "livre_dom", time: "Livre", label: "Dia 100% livre", detail: "Família, descanso, recuperação total. Zero obrigação.", dotColor: "#4ADE80" },
      { id: "igreja_dom", time: "18:00", label: "Igreja Batista Millenium", detail: "Compromisso fixo. App não agenda nada sobre este horário.", alert: true, immutable: true, dotColor: "#C084FC", tags: [{ label: "Imóvel", color: "#C084FC" }] },
    ],
  },
];
