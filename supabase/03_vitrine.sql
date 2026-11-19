-- =====================================================================
-- ELEGÂNCIA — Vitrine: avisos do topo, banners (carrossel), filtro por
-- tamanho e vídeos estilo stories.
-- Cole no SQL Editor do Supabase e clique em RUN (depois do 02_painel.sql).
-- Pode rodar de novo sem problema.
-- =====================================================================

-- Liga/desliga de cada bloco da página inicial
alter table public.configuracoes
  add column if not exists avisos_ativo boolean default true,
  add column if not exists banners_ativo boolean default true,
  add column if not exists filtro_tamanho_ativo boolean default true,
  add column if not exists filtro_tamanho_titulo text default 'Filtrar por tamanho',
  add column if not exists videos_ativo boolean default true,
  add column if not exists videos_titulo text default 'Descubra cada detalhe em vídeo',
  add column if not exists look_ativo boolean default true;

-- Avisos que trocam na faixa preta do topo
create table if not exists public.avisos (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  link text,
  ordem int not null default 0,
  ativo boolean not null default true
);

-- Banners do carrossel da capa
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  foto_url text,
  foto_mobile_url text,
  posicao text default '50',
  posicao_mobile text default '50',
  titulo text,
  subtitulo text,
  botao_texto text,
  link text,
  cor_texto text default 'escuro',
  ordem int not null default 0,
  ativo boolean not null default true
);

-- Vídeos estilo stories
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  video_url text not null,
  capa_url text,
  produto_id uuid references public.produtos(id) on delete set null,
  ordem int not null default 0,
  ativo boolean not null default true
);

alter table public.avisos  enable row level security;
alter table public.banners enable row level security;
alter table public.videos  enable row level security;

drop policy if exists avisos_ler on public.avisos;
drop policy if exists avisos_admin on public.avisos;
drop policy if exists banners_ler on public.banners;
drop policy if exists banners_admin on public.banners;
drop policy if exists videos_ler on public.videos;
drop policy if exists videos_admin on public.videos;

create policy avisos_ler   on public.avisos  for select using (ativo or public.is_admin());
create policy avisos_admin on public.avisos  for all using (public.is_admin()) with check (public.is_admin());
create policy banners_ler  on public.banners for select using (ativo or public.is_admin());
create policy banners_admin on public.banners for all using (public.is_admin()) with check (public.is_admin());
create policy videos_ler   on public.videos  for select using (ativo or public.is_admin());
create policy videos_admin on public.videos  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.avisos, public.banners, public.videos to anon, authenticated;
grant insert, update, delete on public.avisos, public.banners, public.videos to authenticated;

-- Vídeos podem ter até 50 MB
update storage.buckets
   set file_size_limit = 52428800
 where id = 'produtos' and (file_size_limit is null or file_size_limit < 52428800);

-- Conteúdo inicial (só se ainda estiver vazio)
insert into public.avisos (texto, ordem)
select v.texto, v.ordem from (values
  ('Pague em até 6x sem juros', 1),
  ('5% OFF no pagamento via Pix', 2),
  ('Enviamos para todo o Brasil', 3)
) as v(texto, ordem)
where not exists (select 1 from public.avisos);

insert into public.banners (foto_url, foto_mobile_url, posicao, posicao_mobile, titulo, botao_texto, link, cor_texto, ordem)
select coalesce(c.capa_foto_url, '/demo/bege.jpg'), c.capa_foto_mobile_url,
       coalesce(c.capa_posicao, '50'), coalesce(c.capa_posicao_mobile, '50'),
       coalesce(c.capa_titulo, 'ELEGÂNCIA'), coalesce(c.capa_botao, 'Coleção Verão 27'),
       '#vitrine', coalesce(c.capa_cor_texto, 'escuro'), 1
from public.configuracoes c
where c.id = 1 and not exists (select 1 from public.banners);

insert into public.banners (foto_url, posicao, titulo, botao_texto, link, cor_texto, ordem)
select '/demo/preto.jpg', '30', 'NOVA COLEÇÃO', 'Ver vestidos', '/?cat=vestidos', 'escuro', 2
where (select count(*) from public.banners) = 1;
