import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Portuguese book names to bolls.life book numbers
const bookMap: Record<string, number> = {
  "gênesis": 1, "genesis": 1,
  "êxodo": 2, "exodo": 2,
  "levítico": 3, "levitico": 3,
  "números": 4, "numeros": 4,
  "deuteronômio": 5, "deuteronomio": 5,
  "josué": 6, "josue": 6,
  "juízes": 7, "juizes": 7,
  "rute": 8,
  "1 samuel": 9, "2 samuel": 10,
  "1 reis": 11, "2 reis": 12,
  "1 crônicas": 13, "2 crônicas": 14,
  "esdras": 15, "neemias": 16, "ester": 17,
  "jó": 18, "jo": 18,
  "salmo": 19, "salmos": 19,
  "provérbios": 20, "proverbios": 20,
  "eclesiastes": 21,
  "cantares": 22, "cântico dos cânticos": 22,
  "isaías": 23, "isaias": 23,
  "jeremias": 24,
  "lamentações": 25, "lamentacoes": 25,
  "ezequiel": 26, "daniel": 27,
  "oséias": 28, "oseias": 28,
  "joel": 29,
  "amós": 30, "amos": 30,
  "obadias": 31, "jonas": 32,
  "miquéias": 33, "miqueias": 33,
  "naum": 34, "habacuque": 35,
  "sofonias": 36, "ageu": 37,
  "zacarias": 38, "malaquias": 39,
  "mateus": 40, "marcos": 41, "lucas": 42,
  "joão": 43, "joao": 43,
  "atos": 44, "romanos": 45,
  "1 coríntios": 46, "1 corintios": 46,
  "2 coríntios": 47, "2 corintios": 47,
  "gálatas": 48, "galatas": 48,
  "efésios": 49, "efesios": 49,
  "filipenses": 50, "colossenses": 51,
  "1 tessalonicenses": 52, "2 tessalonicenses": 53,
  "1 timóteo": 54, "1 timoteo": 54,
  "2 timóteo": 55, "2 timoteo": 55,
  "tito": 56, "filemom": 57,
  "hebreus": 58, "tiago": 59,
  "1 pedro": 60, "2 pedro": 61,
  "1 joão": 62, "1 joao": 62,
  "2 joão": 63, "2 joao": 63,
  "3 joão": 64, "3 joao": 64,
  "judas": 65, "apocalipse": 66,
};

const validVersions = ["NTLH", "ARA", "NAA", "NVI", "ACF"];

interface ChapterResult {
  book: string;
  chapter: number;
  text: string;
}

function parsePassagem(passagem: string): { bookName: string; bookNum: number; chapters: number[] } | null {
  const cleanPassagem = passagem.split("+")[0].trim();
  const match = cleanPassagem.match(/^(.+?)\s+(\d+)(?:\s*[–-]\s*(\d+))?$/i);
  if (!match) return null;

  const bookName = match[1].trim();
  const bookKey = bookName.toLowerCase();
  const startChapter = parseInt(match[2]);
  const endChapter = match[3] ? parseInt(match[3]) : startChapter;

  const bookNum = bookMap[bookKey];
  if (!bookNum) return null;

  const chapters: number[] = [];
  for (let i = startChapter; i <= endChapter; i++) {
    chapters.push(i);
  }

  return { bookName, bookNum, chapters };
}

async function fetchChapter(bookNum: number, chapter: number, version: string): Promise<string> {
  const url = `https://bolls.life/get-chapter/${version}/${bookNum}/${chapter}/`;
  const response = await fetch(url);

  if (response.ok) {
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((v: { verse: number; text: string }) => 
        `${v.verse} ${v.text.replace(/<br\s*\/?>/gi, "").trim()}`
      ).join("\n");
    }
  }

  throw new Error(`Could not fetch book ${bookNum} chapter ${chapter} in ${version}`);
}

async function fetchAllParts(passagem: string, version: string): Promise<ChapterResult[]> {
  const results: ChapterResult[] = [];
  const parts = passagem.split("+").map(p => p.trim());

  for (const part of parts) {
    const parsed = parsePassagem(part);
    if (!parsed) continue;

    for (const chapter of parsed.chapters) {
      try {
        const text = await fetchChapter(parsed.bookNum, chapter, version);
        results.push({
          book: parsed.bookName,
          chapter,
          text,
        });
      } catch (e) {
        console.error(`Error fetching ${parsed.bookName} ${chapter}:`, e);
        results.push({
          book: parsed.bookName,
          chapter,
          text: `Não foi possível carregar ${part}. Tente novamente mais tarde.`,
        });
      }
    }
  }

  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { passagem, versao } = await req.json();
    if (!passagem) throw new Error("Passagem não informada");

    const version = validVersions.includes(versao) ? versao : "ARA";
    const chapters = await fetchAllParts(passagem, version);

    return new Response(JSON.stringify({ chapters }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("buscar-biblia error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
