export interface RefeicaoItem {
  emoji: string;
  text: string;
}

export interface Refeicao {
  time: string;
  label: string;
  subtitle?: string;
  items: RefeicaoItem[];
  tip?: string;
  dotColor: string;
}

export interface RegrasDia {
  title: string;
  items: string[];
}

export interface DietaDia {
  dayIndex: number;
  dayLabel: string;
  titulo: string;
  refeicoes: Refeicao[];
  regras: RegrasDia[];
  hidratacao: string;
}

const segundaFeira: DietaDia = {
  dayIndex: 0,
  dayLabel: "Segunda-feira",
  titulo: "DIETA DE PERFORMANCE",
  refeicoes: [
    {
      time: "05:40", label: "AO ACORDAR", dotColor: "#F5C542",
      items: [
        { emoji: "💧", text: "Água + pitada de sal" },
        { emoji: "☕", text: "Café preto" },
      ],
    },
    {
      time: "06:00", label: "PRÉ-TREINO", dotColor: "#4ADE80",
      subtitle: "Você NÃO vai mais treinar em jejum.",
      items: [
        { emoji: "🍌", text: "1 banana" },
        { emoji: "🍯", text: "1 colher de mel OU aveia" },
      ],
      tip: "Energia rápida + melhora força",
    },
    {
      time: "08:20", label: "PÓS-TREINO (OBRIGATÓRIO)", dotColor: "#F87171",
      subtitle: "Aqui você define sua semana.",
      items: [
        { emoji: "🍚", text: "150–200g arroz" },
        { emoji: "🍗", text: "150–200g frango OU carne" },
        { emoji: "🫒", text: "1 fio de azeite" },
      ],
      tip: "Reposição + estímulo anabólico",
    },
    {
      time: "09:30", label: "CAFÉ REFORÇADO", dotColor: "#FB923C",
      items: [
        { emoji: "🥚", text: "3–4 ovos" },
        { emoji: "🍎", text: "1 fruta" },
        { emoji: "☕", text: "Café" },
      ],
    },
    {
      time: "12:30", label: "ALMOÇO (BASE FORTE)", dotColor: "#60A5FA",
      items: [
        { emoji: "🍚", text: "Arroz" },
        { emoji: "🫘", text: "Feijão" },
        { emoji: "🥩", text: "200g carne vermelha" },
        { emoji: "🥦", text: "Legumes" },
        { emoji: "🫒", text: "Azeite" },
      ],
      tip: "Aqui você constrói testosterona",
    },
    {
      time: "16:00", label: "LANCHE", dotColor: "#FB923C",
      items: [
        { emoji: "🥛", text: "Iogurte OU whey" },
        { emoji: "🥜", text: "Castanhas" },
        { emoji: "🍎", text: "1 fruta" },
      ],
    },
    {
      time: "17:30", label: "PRÉ-JIU", dotColor: "#22D3EE",
      items: [
        { emoji: "🍌", text: "Banana OU arroz" },
        { emoji: "☕", text: "Café (se necessário)" },
      ],
      tip: "Você precisa chegar com energia, não morto",
    },
    {
      time: "21:00", label: "JANTA (PÓS-JIU)", dotColor: "#C084FC",
      items: [
        { emoji: "🥩", text: "150–200g carne OU ovos" },
        { emoji: "🥦", text: "Legumes" },
        { emoji: "🍚", text: "Pouco carbo (purê ou arroz, se quiser)" },
      ],
    },
    {
      time: "22:00", label: "CEIA (OPCIONAL)", dotColor: "#6B7280",
      items: [
        { emoji: "🥛", text: "Iogurte OU ovos" },
      ],
    },
  ],
  regras: [
    {
      title: "ZERO EXCESSO",
      items: [
        "Nada de doce",
        "Nada de álcool",
        "Nada de \"escapadinha\"",
        "Segunda é ajuste de sistema.",
      ],
    },
  ],
  hidratacao: "3 a 4 litros de água",
};

// Terça a Domingo reutilizam a base de segunda com pequenas variações
const tercaFeira: DietaDia = {
  ...segundaFeira,
  dayIndex: 1,
  dayLabel: "Terça-feira",
  titulo: "DIETA DE CONSTRUÇÃO",
  refeicoes: [
    ...segundaFeira.refeicoes.slice(0, 6),
    {
      time: "17:30", label: "PRÉ-JIU (PROFESSOR)", dotColor: "#22D3EE",
      items: [
        { emoji: "🍌", text: "Banana OU arroz" },
        { emoji: "☕", text: "Café (se necessário)" },
      ],
      tip: "Carga controlada — menos gasto, mesma nutrição",
    },
    {
      time: "20:00", label: "JANTA (PÓS-JIU LEVE)", dotColor: "#C084FC",
      items: [
        { emoji: "🥩", text: "150–200g carne OU ovos" },
        { emoji: "🥦", text: "Legumes" },
        { emoji: "🫒", text: "Azeite" },
      ],
    },
    segundaFeira.refeicoes[8],
  ],
};

const quartaFeira: DietaDia = {
  ...segundaFeira,
  dayIndex: 2,
  dayLabel: "Quarta-feira",
  titulo: "DIETA DE VOLUME",
  refeicoes: segundaFeira.refeicoes.map((r) =>
    r.label === "ALMOÇO (BASE FORTE)"
      ? { ...r, tip: "Dia pesado. Coma forte aqui." }
      : r
  ),
};

const quintaFeira: DietaDia = {
  ...tercaFeira,
  dayIndex: 3,
  dayLabel: "Quinta-feira",
  titulo: "DIETA DE SUSTENTAÇÃO",
};

const sextaFeira: DietaDia = {
  ...segundaFeira,
  dayIndex: 4,
  dayLabel: "Sexta-feira",
  titulo: "DIETA DE RECUPERAÇÃO",
  refeicoes: [
    ...segundaFeira.refeicoes.slice(0, 6),
    {
      time: "18:30", label: "JANTA (SEM JIU)", dotColor: "#4ADE80",
      items: [
        { emoji: "🥩", text: "150–200g carne OU ovos" },
        { emoji: "🥦", text: "Legumes + salada" },
        { emoji: "🫒", text: "Azeite" },
      ],
      tip: "Sem Jiu hoje — janta mais leve, foco em gordura boa",
    },
    segundaFeira.refeicoes[8],
  ],
};

const sabado: DietaDia = {
  dayIndex: 5,
  dayLabel: "Sábado",
  titulo: "DIETA DE GUERREIRO",
  refeicoes: [
    {
      time: "07:30", label: "AO ACORDAR", dotColor: "#F5C542",
      items: [
        { emoji: "💧", text: "Água + sal" },
        { emoji: "☕", text: "Café preto sem pressa" },
      ],
    },
    {
      time: "08:30", label: "PRÉ-TREINO JIU", dotColor: "#4ADE80",
      items: [
        { emoji: "🍌", text: "Banana + mel" },
        { emoji: "🍚", text: "OU pão com ovos" },
      ],
      tip: "Você vai para a guerra, coma antes",
    },
    {
      time: "12:00", label: "ALMOÇO PÓS-TREINO", dotColor: "#F87171",
      subtitle: "Treino mais pesado da semana. Coma forte.",
      items: [
        { emoji: "🍚", text: "Arroz" },
        { emoji: "🥩", text: "200g+ carne vermelha" },
        { emoji: "🫘", text: "Feijão" },
        { emoji: "🥦", text: "Legumes" },
        { emoji: "🫒", text: "Azeite generoso" },
      ],
      tip: "Janela anabólica — coma sem culpa",
    },
    {
      time: "16:00", label: "LANCHE", dotColor: "#FB923C",
      items: [
        { emoji: "🥜", text: "Castanhas + fruta" },
        { emoji: "🥛", text: "Iogurte OU whey" },
      ],
    },
    {
      time: "19:00", label: "JANTA LIVRE", dotColor: "#C084FC",
      items: [
        { emoji: "🍽️", text: "Refeição com a família" },
        { emoji: "🥩", text: "Proteína + legumes" },
      ],
      tip: "Sábado à noite: pode ser mais flexível, sem exagero",
    },
  ],
  regras: [
    {
      title: "SÁBADO CONTROLADO",
      items: [
        "Flexibilidade ≠ liberdade total",
        "Sem álcool",
        "Proteína em todas as refeições",
      ],
    },
  ],
  hidratacao: "3 litros de água",
};

const domingo: DietaDia = {
  dayIndex: 6,
  dayLabel: "Domingo",
  titulo: "DIETA DE DESCANSO",
  refeicoes: [
    {
      time: "Livre", label: "CAFÉ DA MANHÃ", dotColor: "#F5C542",
      items: [
        { emoji: "🥚", text: "Ovos + café" },
        { emoji: "🍞", text: "Pão OU tapioca" },
        { emoji: "🍎", text: "1 fruta" },
      ],
    },
    {
      time: "12:00", label: "ALMOÇO EM FAMÍLIA", dotColor: "#60A5FA",
      items: [
        { emoji: "🍚", text: "Arroz + feijão" },
        { emoji: "🥩", text: "Proteína (carne, frango ou peixe)" },
        { emoji: "🥗", text: "Salada" },
      ],
      tip: "Dia de descanso. Coma bem, sem pressão",
    },
    {
      time: "16:00", label: "LANCHE", dotColor: "#FB923C",
      items: [
        { emoji: "🥛", text: "Iogurte + castanhas" },
        { emoji: "🍎", text: "Fruta" },
      ],
    },
    {
      time: "19:00", label: "JANTA LEVE", dotColor: "#C084FC",
      items: [
        { emoji: "🥚", text: "Ovos OU carne" },
        { emoji: "🥦", text: "Legumes" },
      ],
    },
  ],
  regras: [
    {
      title: "REGRA DE DOMINGO",
      items: [
        "Dia de descanso, não de destruição",
        "Proteína em todas refeições",
        "Hidrate bem para a semana",
      ],
    },
  ],
  hidratacao: "3 litros de água",
};

export const dietaSemanal: DietaDia[] = [
  segundaFeira,
  tercaFeira,
  quartaFeira,
  quintaFeira,
  sextaFeira,
  sabado,
  domingo,
];
