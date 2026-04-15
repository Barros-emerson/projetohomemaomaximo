CREATE TABLE public.versiculos_favoritos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referencia TEXT NOT NULL,
  texto TEXT NOT NULL,
  versao TEXT NOT NULL DEFAULT 'ARA',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.versiculos_favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all versiculos_favoritos" ON public.versiculos_favoritos
  FOR ALL TO public USING (true) WITH CHECK (true);