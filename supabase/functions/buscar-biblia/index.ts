import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Portuguese book names to bible-api.com almeida identifiers (uses Portuguese names)
const bookMap: Record<string, string> = {
  "gênesis": "gênesis",
  "genesis": "gênesis",
  "êxodo": "êxodo",
  "exodo": "êxodo",
  "levítico": "levítico",
  "levitico": "levítico",
  "números": "números",
  "numeros": "números",
  "deuteronômio": "deuteronômio",
  "deuteronomio": "deuteronômio",
  "josué": "josué",
  "josue": "josué",
  "juízes": "juízes",
  "juizes": "juízes",
  "rute": "rute",
  "1 samuel": "1 samuel",
  "2 samuel": "2 samuel",
  "1 reis": "1 reis",
  "2 reis": "2 reis",
  "1 crônicas": "1 crônicas",
  "2 crônicas": "2 crônicas",
  "esdras": "esdras",
  "neemias": "neemias",
  "ester": "ester",
  "jó": "jó",
  "jo": "jó",
  "salmo": "salmos",
  "salmos": "salmos",
  "provérbios": "provérbios",
  "proverbios": "provérbios",
  "eclesiastes": "eclesiastes",
  "cantares": "cantares",
  "isaías": "isaías",
  "isaias": "isaías",
  "jeremias": "jeremias",
  "lamentações": "lamentações",
  "ezequiel": "ezequiel",
  "daniel": "daniel",
  "oséias": "oséias",
  "joel": "joel",
  "amós": "amós",
  "obadias": "obadias",
  "jonas": "jonas",
  "miquéias": "miquéias",
  "naum": "naum",
  "habacuque": "habacuque",
  "sofonias": "sofonias",
  "ageu": "ageu",
  "zacarias": "zacarias",
  "malaquias": "malaquias",
  "mateus": "mateus",
  "marcos": "marcos",
  "lucas": "lucas",
  "joão": "joão",
  "joao": "joão",
  "atos": "atos",
  "romanos": "romanos",
  "1 coríntios": "1 coríntios",
  "1 corintios": "1 coríntios",
  "2 coríntios": "2 coríntios",
  "2 corintios": "2 coríntios",
  "gálatas": "gálatas",
  "galatas": "gálatas",
  "efésios": "efésios",
  "efesios": "efésios",
  "filipenses": "filipenses",
  "colossenses": "colossenses",
  "1 tessalonicenses": "1 tessalonicenses",
  "2 tessalonicenses": "2 tessalonicenses",
  "1 timóteo": "1 timóteo",
  "1 timoteo": "1 timóteo",
  "2 timóteo": "2 timóteo",
  "2 timoteo": "2 timóteo",
  "tito": "tito",
  "filemom": "filemom",
  "hebreus": "hebreus",
  "tiago": "tiago",
  "1 pedro": "1 pedro",
  "2 pedro": "2 pedro",
  "1 joão": "1 joão",
  "1 joao": "1 joão",
  "2 joão": "2 joão",
  "2 joao": "2 joão",
  "3 joão": "3 joão",
  "3 joao": "3 joão",
  "judas": "judas",
  "apocalipse": "apocalipse",
};

interface ChapterResult {
  book: string;
  chapter: number;
  text: string;
}

function parsePassagem(passagem: string): { book: string; chapters: number[] } | null {
  // e.g. "Salmo 1 + Provérbios 1", "Mateus 1–3", "Gênesis 1–3"
  // For combined readings like "Salmo X + Provérbios X", handle first part
  const cleanPassagem = passagem.split("+")[0].trim();
  
  // Match "Book Chapter" or "Book Chapter–Chapter"
  const match = cleanPassagem.match(/^(.+?)\s+(\d+)(?:\s*[–-]\s*(\d+))?$/i);
  if (!match) return null;

  const bookName = match[1].trim().toLowerCase();
  const startChapter = parseInt(match[2]);
  const endChapter = match[3] ? parseInt(match[3]) : startChapter;

  const bookId = bookMap[bookName];
  if (!bookId) return null;

  const chapters: number[] = [];
  for (let i = startChapter; i <= endChapter; i++) {
    chapters.push(i);
  }

  return { book: bookId, chapters };
}

async function fetchChapter(book: string, chapter: number): Promise<string> {
  // Try bible-api.com with almeida (Portuguese) version
  const url = `https://bible-api.com/${book}+${chapter}?translation=almeida`;
  const response = await fetch(url);
  
  if (response.ok) {
    const data = await response.json();
    if (data.text) {
      return data.text;
    }
    // If it returns verses array
    if (data.verses && Array.isArray(data.verses)) {
      return data.verses.map((v: any) => `${v.verse}. ${v.text}`).join("\n");
    }
  }

  throw new Error(`Could not fetch ${book} ${chapter}`);
}

async function fetchAllParts(passagem: string): Promise<ChapterResult[]> {
  const results: ChapterResult[] = [];
  
  // Split by "+" for combined readings like "Salmo 1 + Provérbios 1"
  const parts = passagem.split("+").map(p => p.trim());
  
  for (const part of parts) {
    const parsed = parsePassagem(part);
    if (!parsed) continue;
    
    for (const chapter of parsed.chapters) {
      try {
        const text = await fetchChapter(parsed.book, chapter);
        results.push({
          book: part.replace(/\d+[–-]?\d*/g, "").trim(),
          chapter,
          text,
        });
      } catch (e) {
        console.error(`Error fetching ${parsed.book} ${chapter}:`, e);
        results.push({
          book: part.replace(/\d+[–-]?\d*/g, "").trim(),
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
    const { passagem } = await req.json();
    if (!passagem) throw new Error("Passagem não informada");

    const chapters = await fetchAllParts(passagem);

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
