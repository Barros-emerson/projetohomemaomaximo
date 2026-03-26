import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Portuguese book names to bible-api.com identifiers (almeida version)
const bookMap: Record<string, string> = {
  "gênesis": "genesis",
  "genesis": "genesis",
  "êxodo": "exodus",
  "exodo": "exodus",
  "levítico": "leviticus",
  "levitico": "leviticus",
  "números": "numbers",
  "numeros": "numbers",
  "deuteronômio": "deuteronomy",
  "deuteronomio": "deuteronomy",
  "josué": "joshua",
  "josue": "joshua",
  "juízes": "judges",
  "juizes": "judges",
  "rute": "ruth",
  "1 samuel": "1samuel",
  "2 samuel": "2samuel",
  "1 reis": "1kings",
  "2 reis": "2kings",
  "1 crônicas": "1chronicles",
  "2 crônicas": "2chronicles",
  "esdras": "ezra",
  "neemias": "nehemiah",
  "ester": "esther",
  "jó": "job",
  "jo": "job",
  "salmo": "psalms",
  "salmos": "psalms",
  "provérbios": "proverbs",
  "proverbios": "proverbs",
  "eclesiastes": "ecclesiastes",
  "cantares": "songofsolomon",
  "isaías": "isaiah",
  "isaias": "isaiah",
  "jeremias": "jeremiah",
  "lamentações": "lamentations",
  "ezequiel": "ezekiel",
  "daniel": "daniel",
  "oséias": "hosea",
  "joel": "joel",
  "amós": "amos",
  "obadias": "obadiah",
  "jonas": "jonah",
  "miquéias": "micah",
  "naum": "nahum",
  "habacuque": "habakkuk",
  "sofonias": "zephaniah",
  "ageu": "haggai",
  "zacarias": "zechariah",
  "malaquias": "malachi",
  "mateus": "matthew",
  "marcos": "mark",
  "lucas": "luke",
  "joão": "john",
  "joao": "john",
  "atos": "acts",
  "romanos": "romans",
  "1 coríntios": "1corinthians",
  "1 corintios": "1corinthians",
  "2 coríntios": "2corinthians",
  "2 corintios": "2corinthians",
  "gálatas": "galatians",
  "galatas": "galatians",
  "efésios": "ephesians",
  "efesios": "ephesians",
  "filipenses": "philippians",
  "colossenses": "colossians",
  "1 tessalonicenses": "1thessalonians",
  "2 tessalonicenses": "2thessalonians",
  "1 timóteo": "1timothy",
  "1 timoteo": "1timothy",
  "2 timóteo": "2timothy",
  "2 timoteo": "2timothy",
  "tito": "titus",
  "filemom": "philemon",
  "hebreus": "hebrews",
  "tiago": "james",
  "1 pedro": "1peter",
  "2 pedro": "2peter",
  "1 joão": "1john",
  "1 joao": "1john",
  "2 joão": "2john",
  "2 joao": "2john",
  "3 joão": "3john",
  "3 joao": "3john",
  "judas": "jude",
  "apocalipse": "revelation",
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
