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
