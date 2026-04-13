
CREATE TABLE IF NOT EXISTS public.camila_notas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL DEFAULT '',
  conteudo TEXT DEFAULT '',
  cor TEXT DEFAULT '#FB7185',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.camila_tarefas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  concluida BOOLEAN DEFAULT FALSE,
  criado_por TEXT NOT NULL DEFAULT 'camila',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.camila_notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camila_tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all camila_notas" ON public.camila_notas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all camila_tarefas" ON public.camila_tarefas FOR ALL USING (true) WITH CHECK (true);
