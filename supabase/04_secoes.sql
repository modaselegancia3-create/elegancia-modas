-- =====================================================================
-- ELEGÂNCIA — Vitrines da página inicial (Lançamentos, Mais vendidos, Outlet)
-- Cole no SQL Editor do Supabase e clique em RUN (depois do 03_vitrine.sql).
-- =====================================================================
alter table public.configuracoes
  add column if not exists lancamentos_ativo boolean default true,
  add column if not exists lancamentos_titulo text default 'Lançamentos',
  add column if not exists mais_vendidos_ativo boolean default true,
  add column if not exists mais_vendidos_titulo text default 'Mais vendidos',
  add column if not exists outlet_ativo boolean default true,
  add column if not exists outlet_titulo text default 'Outlet';

update public.configuracoes set filtro_tamanho_titulo = 'Filtrar por numeração'
 where id = 1 and filtro_tamanho_titulo = 'Filtrar por tamanho';
