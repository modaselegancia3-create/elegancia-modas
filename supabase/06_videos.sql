-- =====================================================================
-- ELEGÂNCIA — Opções dos vídeos (texto do botão e botões laterais)
-- Cole no SQL Editor do Supabase e clique em RUN.
-- =====================================================================
alter table public.configuracoes
  add column if not exists videos_botao_texto text default 'Adicionar ao carrinho',
  add column if not exists videos_curtir boolean default true,
  add column if not exists videos_whatsapp boolean default true,
  add column if not exists videos_compartilhar boolean default true;
