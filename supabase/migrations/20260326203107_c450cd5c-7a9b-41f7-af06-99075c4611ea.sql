
CREATE UNIQUE INDEX perfil_metricas_historico_unique_entry
  ON public.perfil_metricas_historico (data, categoria, label);
