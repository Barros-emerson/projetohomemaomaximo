
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  device_label text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all push_subscriptions" ON public.push_subscriptions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.push_alerts_agendados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  detail text DEFAULT '',
  fire_at timestamptz NOT NULL,
  enviado boolean NOT NULL DEFAULT false,
  enviado_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.push_alerts_agendados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all push_alerts_agendados" ON public.push_alerts_agendados FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_push_alerts_pendentes ON public.push_alerts_agendados (fire_at) WHERE enviado = false;
