-- =====================================================================
-- ELEGÂNCIA — Peças escolhidas à mão em Lançamentos, Mais vendidos e Outlet
-- Cole no SQL Editor do Supabase e clique em RUN.
-- (lista vazia = o site escolhe sozinho)
-- =====================================================================
alter table public.configuracoes
  add column if not exists lancamentos_ids uuid[] default '{}',
  add column if not exists mais_vendidos_ids uuid[] default '{}',
  add column if not exists outlet_ids uuid[] default '{}';
