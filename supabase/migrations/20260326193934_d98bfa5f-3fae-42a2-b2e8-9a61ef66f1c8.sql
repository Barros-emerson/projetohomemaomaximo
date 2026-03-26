CREATE TABLE public.treino_sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL DEFAULT CURRENT_DATE,
  dia_semana integer NOT NULL,
  tipo text NOT NULL,
  foco text NOT NULL,
  duracao_segundos integer NOT NULL DEFAULT 0,
  total_series integer NOT NULL DEFAULT 0,
  series_completas integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.treino_exercicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id uuid NOT NULL REFERENCES public.treino_sessoes(id) ON DELETE CASCADE,
  exercicio_id text NOT NULL,
  nome text NOT NULL,
  sets_planejados integer NOT NULL,
  sets_completos integer NOT NULL DEFAULT 0,
  cargas jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.treino_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id uuid NOT NULL REFERENCES public.treino_sessoes(id) ON DELETE CASCADE,
  foto_base64 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.treino_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treino_exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treino_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all treino_sessoes" ON public.treino_sessoes FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all treino_exercicios" ON public.treino_exercicios FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all treino_fotos" ON public.treino_fotos FOR ALL TO public USING (true) WITH CHECK (true);