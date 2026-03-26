
CREATE TABLE public.perfil_metricas_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria TEXT NOT NULL,
  label TEXT NOT NULL,
  valor TEXT NOT NULL,
  unidade TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.perfil_metricas_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all perfil_metricas_historico"
  ON public.perfil_metricas_historico
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
