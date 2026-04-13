
CREATE TABLE IF NOT EXISTS public.camila_devocional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  reflexao TEXT DEFAULT '',
  leitura_feita BOOLEAN DEFAULT FALSE,
  oracao_gratidao TEXT DEFAULT '',
  oracao_pedidos TEXT DEFAULT '',
  oracao_intercessao TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.camila_mensagens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  texto TEXT NOT NULL,
  horario_rotina VARCHAR(5) NOT NULL DEFAULT '06:55',
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emerson_reflexao_publica (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  reflexao TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.camila_devocional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camila_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emerson_reflexao_publica ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all camila_devocional" ON public.camila_devocional FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all camila_mensagens" ON public.camila_mensagens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all emerson_reflexao_publica" ON public.emerson_reflexao_publica FOR ALL USING (true) WITH CHECK (true);
