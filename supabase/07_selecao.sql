-- =====================================================================
-- ELEGÂNCIA — Peças escolhidas à mão em Lançamentos, Mais vendidos e Outlet
-- Cole no SQL Editor do Supabase e clique em RUN.
-- (lista vazia = o site escolhe sozinho)
-- =====================================================================
alter table public.configuracoes
  add column if not exists lancamentos_ids uuid[] default '{}',
  add column if not exists mais_vendidos_ids uuid[] default '{}',
  add column if not exists outlet_ids uuid[] default '{}';

-- Descrição (texto embaixo do título) de cada vitrine
alter table public.configuracoes
  add column if not exists lancamentos_texto text,
  add column if not exists mais_vendidos_texto text,
  add column if not exists outlet_texto text;

-- Vídeo com nome e preço digitados à mão (quando não escolher uma peça)
alter table public.videos
  add column if not exists nome text,
  add column if not exists preco numeric(10,2),
  add column if not exists preco_antigo numeric(10,2);

-- Promoção com prazo e opção de mostrar o preço antigo riscado
alter table public.produtos
  add column if not exists promo_inicio date,
  add column if not exists promo_fim date,
  add column if not exists promo_riscado boolean not null default true;
