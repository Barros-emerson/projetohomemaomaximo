export interface LeituraDia {
  dia: number;
  passagem: string;
  concluido: boolean;
}

export interface PlanoLeitura {
  id: string;
  nome: string;
  descricao: string;
  leituras: LeituraDia[];
}

export const planosDisponiveis: PlanoLeitura[] = [
  {
    id: "salmos-proverbios",
    nome: "Salmos & Provérbios",
    descricao: "31 dias — 1 Salmo + 1 Provérbio por dia",
    leituras: Array.from({ length: 31 }, (_, i) => ({
      dia: i + 1,
      passagem: `Salmo ${i + 1} + Provérbios ${i + 1}`,
      concluido: false,
    })),
  },
  {
    id: "novo-testamento",
    nome: "Novo Testamento",
    descricao: "90 dias — 3 capítulos por dia",
    leituras: [
      { dia: 1, passagem: "Mateus 1–3", concluido: false },
      { dia: 2, passagem: "Mateus 4–6", concluido: false },
      { dia: 3, passagem: "Mateus 7–9", concluido: false },
      { dia: 4, passagem: "Mateus 10–12", concluido: false },
      { dia: 5, passagem: "Mateus 13–15", concluido: false },
      { dia: 6, passagem: "Mateus 16–18", concluido: false },
      { dia: 7, passagem: "Mateus 19–21", concluido: false },
      { dia: 8, passagem: "Mateus 22–24", concluido: false },
      { dia: 9, passagem: "Mateus 25–28", concluido: false },
      { dia: 10, passagem: "Marcos 1–3", concluido: false },
      { dia: 11, passagem: "Marcos 4–6", concluido: false },
      { dia: 12, passagem: "Marcos 7–9", concluido: false },
      { dia: 13, passagem: "Marcos 10–12", concluido: false },
      { dia: 14, passagem: "Marcos 13–16", concluido: false },
      { dia: 15, passagem: "Lucas 1–3", concluido: false },
      { dia: 16, passagem: "Lucas 4–6", concluido: false },
      { dia: 17, passagem: "Lucas 7–9", concluido: false },
      { dia: 18, passagem: "Lucas 10–12", concluido: false },
      { dia: 19, passagem: "Lucas 13–15", concluido: false },
      { dia: 20, passagem: "Lucas 16–18", concluido: false },
      { dia: 21, passagem: "Lucas 19–21", concluido: false },
      { dia: 22, passagem: "Lucas 22–24", concluido: false },
      { dia: 23, passagem: "João 1–3", concluido: false },
      { dia: 24, passagem: "João 4–6", concluido: false },
      { dia: 25, passagem: "João 7–9", concluido: false },
      { dia: 26, passagem: "João 10–12", concluido: false },
      { dia: 27, passagem: "João 13–15", concluido: false },
      { dia: 28, passagem: "João 16–18", concluido: false },
      { dia: 29, passagem: "João 19–21", concluido: false },
      { dia: 30, passagem: "Atos 1–3", concluido: false },
    ],
  },
  {
    id: "cronologico",
    nome: "Bíblia Cronológica",
    descricao: "365 dias — Leitura em ordem histórica",
    leituras: [
      { dia: 1, passagem: "Gênesis 1–3", concluido: false },
      { dia: 2, passagem: "Gênesis 4–7", concluido: false },
      { dia: 3, passagem: "Gênesis 8–11", concluido: false },
      { dia: 4, passagem: "Gênesis 12–15", concluido: false },
      { dia: 5, passagem: "Gênesis 16–19", concluido: false },
      { dia: 6, passagem: "Gênesis 20–23", concluido: false },
      { dia: 7, passagem: "Gênesis 24–26", concluido: false },
    ],
  },
  {
    id: "conhecer-jesus",
    nome: "Conhecer Jesus — Trilha Completa",
    descricao: "3 fases • ~120 dias • De João ao AT com Cristo nos olhos",
    leituras: [
      // ===== FASE 1 — Conhecer Jesus profundamente (30 dias) =====
      // Evangelho de João (21 caps) — 10 dias
      { dia: 1, passagem: "João 1–2 (Fase 1 • Quem é Jesus)", concluido: false },
      { dia: 2, passagem: "João 3–4", concluido: false },
      { dia: 3, passagem: "João 5–6", concluido: false },
      { dia: 4, passagem: "João 7–8", concluido: false },
      { dia: 5, passagem: "João 9–10", concluido: false },
      { dia: 6, passagem: "João 11–12", concluido: false },
      { dia: 7, passagem: "João 13–14", concluido: false },
      { dia: 8, passagem: "João 15–16", concluido: false },
      { dia: 9, passagem: "João 17–18", concluido: false },
      { dia: 10, passagem: "João 19–21 + Isaías 53", concluido: false },
      // Evangelho de Lucas (24 caps) — 12 dias
      { dia: 11, passagem: "Lucas 1–2 (Fase 1 • Humanidade de Cristo)", concluido: false },
      { dia: 12, passagem: "Lucas 3–4", concluido: false },
      { dia: 13, passagem: "Lucas 5–6", concluido: false },
      { dia: 14, passagem: "Lucas 7–8", concluido: false },
      { dia: 15, passagem: "Lucas 9–10", concluido: false },
      { dia: 16, passagem: "Lucas 11–12", concluido: false },
      { dia: 17, passagem: "Lucas 13–14", concluido: false },
      { dia: 18, passagem: "Lucas 15–16", concluido: false },
      { dia: 19, passagem: "Lucas 17–18", concluido: false },
      { dia: 20, passagem: "Lucas 19–20", concluido: false },
      { dia: 21, passagem: "Lucas 21–22", concluido: false },
      { dia: 22, passagem: "Lucas 23–24", concluido: false },
      // Atos (28 caps) — 10 dias
      { dia: 23, passagem: "Atos 1–3 (Fase 1 • Nascimento da Igreja)", concluido: false },
      { dia: 24, passagem: "Atos 4–6", concluido: false },
      { dia: 25, passagem: "Atos 7–9", concluido: false },
      { dia: 26, passagem: "Atos 10–12", concluido: false },
      { dia: 27, passagem: "Atos 13–15", concluido: false },
      { dia: 28, passagem: "Atos 16–18", concluido: false },
      { dia: 29, passagem: "Atos 19–21", concluido: false },
      { dia: 30, passagem: "Atos 22–24", concluido: false },
      { dia: 31, passagem: "Atos 25–26", concluido: false },
      { dia: 32, passagem: "Atos 27–28", concluido: false },

      // ===== FASE 2 — Construção da mente cristã (~30 dias) =====
      // Tiago (5) — 3 dias
      { dia: 33, passagem: "Tiago 1–2 (Fase 2 • Fé com obras)", concluido: false },
      { dia: 34, passagem: "Tiago 3–4", concluido: false },
      { dia: 35, passagem: "Tiago 5 + Provérbios 3", concluido: false },
      // Efésios (6) — 3 dias
      { dia: 36, passagem: "Efésios 1–2 (Fase 2 • Identidade)", concluido: false },
      { dia: 37, passagem: "Efésios 3–4", concluido: false },
      { dia: 38, passagem: "Efésios 5–6", concluido: false },
      // Romanos (16) — 8 dias (calma)
      { dia: 39, passagem: "Romanos 1–2 (Fase 2 • Profundidade)", concluido: false },
      { dia: 40, passagem: "Romanos 3–4", concluido: false },
      { dia: 41, passagem: "Romanos 5–6", concluido: false },
      { dia: 42, passagem: "Romanos 7–8", concluido: false },
      { dia: 43, passagem: "Romanos 9–10", concluido: false },
      { dia: 44, passagem: "Romanos 11–12", concluido: false },
      { dia: 45, passagem: "Romanos 13–14", concluido: false },
      { dia: 46, passagem: "Romanos 15–16", concluido: false },

      // ===== FASE 3 — Entender as raízes (Gênesis + Êxodo + Salmos/Provérbios paralelos) =====
      // Gênesis (50) — 17 dias, ~3 caps/dia, com Salmo + Provérbio em paralelo
      { dia: 47, passagem: "Gênesis 1–3 + Salmo 1 + Provérbios 1", concluido: false },
      { dia: 48, passagem: "Gênesis 4–6 + Salmo 23 + Provérbios 2", concluido: false },
      { dia: 49, passagem: "Gênesis 7–9 + Salmo 27 + Provérbios 3", concluido: false },
      { dia: 50, passagem: "Gênesis 10–12 + Salmo 34 + Provérbios 4", concluido: false },
      { dia: 51, passagem: "Gênesis 13–15 + Salmo 91 + Provérbios 5", concluido: false },
      { dia: 52, passagem: "Gênesis 16–18 + Salmo 121 + Provérbios 6", concluido: false },
      { dia: 53, passagem: "Gênesis 19–21 + Salmo 139 + Provérbios 7", concluido: false },
      { dia: 54, passagem: "Gênesis 22–24 + Salmo 8 + Provérbios 8", concluido: false },
      { dia: 55, passagem: "Gênesis 25–27 + Salmo 19 + Provérbios 9", concluido: false },
      { dia: 56, passagem: "Gênesis 28–30 + Salmo 37 + Provérbios 10", concluido: false },
      { dia: 57, passagem: "Gênesis 31–33 + Salmo 46 + Provérbios 11", concluido: false },
      { dia: 58, passagem: "Gênesis 34–36 + Salmo 51 + Provérbios 12", concluido: false },
      { dia: 59, passagem: "Gênesis 37–39 + Salmo 62 + Provérbios 13", concluido: false },
      { dia: 60, passagem: "Gênesis 40–42 + Salmo 73 + Provérbios 14", concluido: false },
      { dia: 61, passagem: "Gênesis 43–45 + Salmo 84 + Provérbios 15", concluido: false },
      { dia: 62, passagem: "Gênesis 46–48 + Salmo 90 + Provérbios 16", concluido: false },
      { dia: 63, passagem: "Gênesis 49–50 + Salmo 103 + Provérbios 17", concluido: false },
      // Êxodo (40) — 14 dias, ~3 caps/dia
      { dia: 64, passagem: "Êxodo 1–3 + Salmo 105 + Provérbios 18", concluido: false },
      { dia: 65, passagem: "Êxodo 4–6 + Salmo 106 + Provérbios 19", concluido: false },
      { dia: 66, passagem: "Êxodo 7–9 + Salmo 107 + Provérbios 20", concluido: false },
      { dia: 67, passagem: "Êxodo 10–12 + Salmo 113 + Provérbios 21", concluido: false },
      { dia: 68, passagem: "Êxodo 13–15 + Salmo 114 + Provérbios 22", concluido: false },
      { dia: 69, passagem: "Êxodo 16–18 + Salmo 116 + Provérbios 23", concluido: false },
      { dia: 70, passagem: "Êxodo 19–21 + Salmo 119:1–48 + Provérbios 24", concluido: false },
      { dia: 71, passagem: "Êxodo 22–24 + Salmo 119:49–104 + Provérbios 25", concluido: false },
      { dia: 72, passagem: "Êxodo 25–27 + Salmo 119:105–176 + Provérbios 26", concluido: false },
      { dia: 73, passagem: "Êxodo 28–30 + Salmo 127 + Provérbios 27", concluido: false },
      { dia: 74, passagem: "Êxodo 31–33 + Salmo 128 + Provérbios 28", concluido: false },
      { dia: 75, passagem: "Êxodo 34–36 + Salmo 130 + Provérbios 29", concluido: false },
      { dia: 76, passagem: "Êxodo 37–38 + Salmo 133 + Provérbios 30", concluido: false },
      { dia: 77, passagem: "Êxodo 39–40 + Salmo 150 + Provérbios 31", concluido: false },
    ],
  },
];

export const versiculosMemorizacao = [
  { semana: 1, texto: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias.", referencia: "Isaías 40:31" },
  { semana: 2, texto: "Tudo posso naquele que me fortalece.", referencia: "Filipenses 4:13" },
  { semana: 3, texto: "Sede fortes e corajosos. Não temais, nem vos espanteis, porque o Senhor, vosso Deus, é convosco por onde quer que andeis.", referencia: "Josué 1:9" },
  { semana: 4, texto: "Porque Deus não nos deu espírito de covardia, mas de poder, de amor e de moderação.", referencia: "2 Timóteo 1:7" },
  { semana: 5, texto: "O Senhor é a minha força e o meu escudo; nele o meu coração confia, e dele recebo ajuda.", referencia: "Salmo 28:7" },
  { semana: 6, texto: "Combati o bom combate, completei a carreira, guardei a fé.", referencia: "2 Timóteo 4:7" },
  { semana: 7, texto: "Não sabeis vós que os que correm no estádio, todos, na verdade, correm, mas um só leva o prêmio?", referencia: "1 Coríntios 9:24" },
  { semana: 8, texto: "Portanto, quer comais quer bebais, ou façais outra qualquer coisa, fazei tudo para glória de Deus.", referencia: "1 Coríntios 10:31" },
];
