
CREATE TABLE public.oracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('gratidao', 'pedidos', 'intercessao')),
  conteudo TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.oracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to oracoes" ON public.oracoes
  FOR ALL USING (true) WITH CHECK (true);
