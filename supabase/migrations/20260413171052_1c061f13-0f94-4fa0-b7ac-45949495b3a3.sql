
-- Metas & Objetivos
CREATE TABLE public.metas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  categoria TEXT NOT NULL DEFAULT 'geral',
  tipo_periodo TEXT NOT NULL DEFAULT 'mensal',
  valor_alvo NUMERIC NOT NULL DEFAULT 1,
  valor_atual NUMERIC NOT NULL DEFAULT 0,
  unidade TEXT DEFAULT '',
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  concluida BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all metas" ON public.metas FOR ALL TO public USING (true) WITH CHECK (true);

-- Hábitos Customizáveis
CREATE TABLE public.habitos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  titulo TEXT NOT NULL,
  icone TEXT DEFAULT '🔥',
  cor TEXT DEFAULT '#10B981',
  ativo BOOLEAN NOT NULL DEFAULT true,
  streak_atual INTEGER NOT NULL DEFAULT 0,
  maior_streak INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.habitos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all habitos" ON public.habitos FOR ALL TO public USING (true) WITH CHECK (true);

-- Check-ins diários dos hábitos
CREATE TABLE public.habitos_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  habito_id UUID NOT NULL REFERENCES public.habitos(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  feito BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(habito_id, data)
);

ALTER TABLE public.habitos_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all habitos_checkins" ON public.habitos_checkins FOR ALL TO public USING (true) WITH CHECK (true);

-- Gratidão Mútua
CREATE TABLE public.gratidao_mutua (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  autor TEXT NOT NULL DEFAULT 'emerson',
  texto TEXT NOT NULL,
  UNIQUE(data, autor)
);

ALTER TABLE public.gratidao_mutua ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all gratidao_mutua" ON public.gratidao_mutua FOR ALL TO public USING (true) WITH CHECK (true);

-- Journaling Noturno
CREATE TABLE public.journaling (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  vitoria_1 TEXT DEFAULT '',
  vitoria_2 TEXT DEFAULT '',
  vitoria_3 TEXT DEFAULT '',
  aprendizado TEXT DEFAULT '',
  plano_amanha TEXT DEFAULT ''
);

ALTER TABLE public.journaling ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all journaling" ON public.journaling FOR ALL TO public USING (true) WITH CHECK (true);

-- Agenda de Encontros
CREATE TABLE public.agenda_encontros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  data_evento DATE NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'date',
  concluido BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.agenda_encontros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all agenda_encontros" ON public.agenda_encontros FOR ALL TO public USING (true) WITH CHECK (true);

-- Score Diário
CREATE TABLE public.score_diario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  score_total NUMERIC NOT NULL DEFAULT 0,
  score_rotina NUMERIC NOT NULL DEFAULT 0,
  score_treino NUMERIC NOT NULL DEFAULT 0,
  score_sono NUMERIC NOT NULL DEFAULT 0,
  score_agua NUMERIC NOT NULL DEFAULT 0,
  score_biblia NUMERIC NOT NULL DEFAULT 0
);

ALTER TABLE public.score_diario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all score_diario" ON public.score_diario FOR ALL TO public USING (true) WITH CHECK (true);
