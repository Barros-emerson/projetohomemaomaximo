
CREATE TABLE public.readiness_checkin (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  sono_qualidade INTEGER NOT NULL DEFAULT 5,
  energia INTEGER NOT NULL DEFAULT 5,
  dor_muscular INTEGER NOT NULL DEFAULT 5,
  estresse INTEGER NOT NULL DEFAULT 5,
  score NUMERIC NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(data)
);

ALTER TABLE public.readiness_checkin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all readiness_checkin" ON public.readiness_checkin
  FOR ALL USING (true) WITH CHECK (true);
