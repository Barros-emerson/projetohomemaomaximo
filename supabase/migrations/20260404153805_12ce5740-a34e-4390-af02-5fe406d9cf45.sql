
-- Tabela de itens do checklist concluídos
CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL DEFAULT CURRENT_DATE,
  dia_semana integer NOT NULL,
  item_id text NOT NULL,
  horario_real text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (data, dia_semana, item_id)
);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all checklist_items" ON public.checklist_items
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Tabela de tipo de dia
CREATE TABLE public.tipo_dia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  tipo text NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tipo_dia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all tipo_dia" ON public.tipo_dia
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Tabela de registro de água
CREATE TABLE public.agua_registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  quantidade_ml integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agua_registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all agua_registros" ON public.agua_registros
  FOR ALL TO public USING (true) WITH CHECK (true);
