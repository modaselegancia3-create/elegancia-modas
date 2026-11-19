-- =====================================================================
-- ELEGÂNCIA CONFECÇÕES — Loja online
-- Etapa 1: estrutura do banco de dados (Supabase / PostgreSQL)
-- Cole tudo no SQL Editor do Supabase e clique em RUN.
-- Pode rodar de novo sem problema (usa IF NOT EXISTS / ON CONFLICT).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- ADMINS (quem pode mexer no painel)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  criado_em timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- CATÁLOGO
-- ---------------------------------------------------------------------
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ordem int not null default 0,
  ativo boolean not null default true
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text,
  categoria_id uuid references public.categorias(id) on delete set null,
  preco numeric(10,2) not null check (preco >= 0),
  preco_promocional numeric(10,2) check (preco_promocional is null or preco_promocional >= 0),
  destaque boolean not null default false,
  ativo boolean not null default true,
  -- medidas do pacote (usadas no cálculo de frete)
  peso_gramas int not null default 400,
  altura_cm int not null default 5,
  largura_cm int not null default 25,
  comprimento_cm int not null default 30,
  criado_em timestamptz not null default now()
);

create table if not exists public.produto_fotos (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  url text not null,
  ordem int not null default 0
);

-- Grade: cada combinação cor + tamanho tem seu próprio estoque
create table if not exists public.variantes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  cor text not null default 'Única',
  cor_hex text,
  tamanho text not null,
  estoque int not null default 0 check (estoque >= 0),
  sku text,
  unique (produto_id, cor, tamanho)
);

create index if not exists idx_produtos_categoria on public.produtos(categoria_id);
create index if not exists idx_fotos_produto on public.produto_fotos(produto_id);
create index if not exists idx_variantes_produto on public.variantes(produto_id);

-- ---------------------------------------------------------------------
-- CLIENTES
-- ---------------------------------------------------------------------
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  nome text not null,
  email text not null,
  telefone text,
  cpf text,
  criado_em timestamptz not null default now()
);

create table if not exists public.enderecos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  cep text not null,
  rua text not null,
  numero text not null,
  complemento text,
  bairro text not null,
  cidade text not null,
  uf text not null,
  principal boolean not null default false
);

-- ---------------------------------------------------------------------
-- PEDIDOS
-- ---------------------------------------------------------------------
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity (start with 1001) unique,
  cliente_id uuid references public.clientes(id) on delete set null,
  nome text not null,
  email text not null,
  telefone text,
  cpf text,
  endereco jsonb,
  subtotal numeric(10,2) not null default 0,
  frete numeric(10,2) not null default 0,
  desconto numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  frete_servico text,
  forma_pagamento text,
  status text not null default 'aguardando_pagamento'
    check (status in ('aguardando_pagamento','pago','separando','enviado','entregue','cancelado')),
  mp_preference_id text,
  mp_payment_id text,
  codigo_rastreio text,
  observacao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete set null,
  variante_id uuid references public.variantes(id) on delete set null,
  nome text not null,
  cor text,
  tamanho text,
  foto_url text,
  preco_unit numeric(10,2) not null,
  quantidade int not null check (quantidade > 0)
);

create index if not exists idx_pedidos_cliente on public.pedidos(cliente_id);
create index if not exists idx_itens_pedido on public.pedido_itens(pedido_id);

create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql as $$
begin new.atualizado_em = now(); return new; end; $$;

drop trigger if exists trg_pedidos_atualizado on public.pedidos;
create trigger trg_pedidos_atualizado before update on public.pedidos
for each row execute function public.tocar_atualizado_em();

-- Baixa de estoque (vai ser chamada quando o Mercado Pago confirmar o pagamento)
create or replace function public.baixar_estoque_pedido(p_pedido uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare it record;
begin
  for it in select variante_id, quantidade from public.pedido_itens where pedido_id = p_pedido loop
    update public.variantes
       set estoque = greatest(estoque - it.quantidade, 0)
     where id = it.variante_id;
  end loop;
end; $$;

revoke all on function public.baixar_estoque_pedido(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- CONFIGURAÇÕES DA LOJA (uma linha só)
-- ---------------------------------------------------------------------
create table if not exists public.configuracoes (
  id int primary key default 1 check (id = 1),
  nome_loja text not null default 'Elegância Confecções',
  whatsapp text,
  instagram text default '@eleganciaa_modass',
  cep_origem text,
  parcelas_sem_juros int not null default 6,
  frete_gratis_acima numeric(10,2),
  aviso_topo text default 'Enviamos para todo o Brasil'
);
insert into public.configuracoes (id) values (1) on conflict (id) do nothing;

-- =====================================================================
-- SEGURANÇA (RLS)
-- Cliente vê o catálogo; só admin mexe. Pedidos são criados pelo
-- servidor (Edge Function do Mercado Pago), nunca direto pelo site.
-- =====================================================================
alter table public.admins        enable row level security;
alter table public.categorias    enable row level security;
alter table public.produtos      enable row level security;
alter table public.produto_fotos enable row level security;
alter table public.variantes     enable row level security;
alter table public.clientes      enable row level security;
alter table public.enderecos     enable row level security;
alter table public.pedidos       enable row level security;
alter table public.pedido_itens  enable row level security;
alter table public.configuracoes enable row level security;

-- limpa políticas antigas (para poder rodar o script de novo)
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public'
    and tablename in ('admins','categorias','produtos','produto_fotos','variantes','clientes','enderecos','pedidos','pedido_itens','configuracoes')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

create policy admins_self on public.admins for select using (user_id = auth.uid());

create policy cat_ler on public.categorias for select using (ativo or public.is_admin());
create policy cat_admin on public.categorias for all using (public.is_admin()) with check (public.is_admin());

create policy prod_ler on public.produtos for select using (ativo or public.is_admin());
create policy prod_admin on public.produtos for all using (public.is_admin()) with check (public.is_admin());

create policy foto_ler on public.produto_fotos for select using (true);
create policy foto_admin on public.produto_fotos for all using (public.is_admin()) with check (public.is_admin());

create policy var_ler on public.variantes for select using (true);
create policy var_admin on public.variantes for all using (public.is_admin()) with check (public.is_admin());

create policy cli_proprio on public.clientes for select using (auth_user_id = auth.uid() or public.is_admin());
create policy cli_atualiza on public.clientes for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy cli_admin on public.clientes for all using (public.is_admin()) with check (public.is_admin());

create policy end_proprio on public.enderecos for all
  using (exists (select 1 from public.clientes c where c.id = cliente_id and c.auth_user_id = auth.uid()) or public.is_admin())
  with check (exists (select 1 from public.clientes c where c.id = cliente_id and c.auth_user_id = auth.uid()) or public.is_admin());

create policy ped_proprio on public.pedidos for select
  using (exists (select 1 from public.clientes c where c.id = cliente_id and c.auth_user_id = auth.uid()) or public.is_admin());
create policy ped_admin on public.pedidos for update using (public.is_admin()) with check (public.is_admin());

create policy item_proprio on public.pedido_itens for select
  using (exists (select 1 from public.pedidos p join public.clientes c on c.id = p.cliente_id
                 where p.id = pedido_id and c.auth_user_id = auth.uid()) or public.is_admin());

create policy cfg_ler on public.configuracoes for select using (true);
create policy cfg_admin on public.configuracoes for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- PERMISSÕES DA API (garante acesso mesmo se o projeto foi criado
-- sem "Conceder acesso à API para novas tabelas"). O RLS acima
-- continua decidindo quem vê o quê.
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.categorias, public.produtos, public.produto_fotos,
  public.variantes, public.configuracoes to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- STORAGE: pasta pública "produtos" para as fotos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

drop policy if exists fotos_publicas_ler on storage.objects;
drop policy if exists fotos_admin_enviar on storage.objects;
drop policy if exists fotos_admin_alterar on storage.objects;
drop policy if exists fotos_admin_apagar on storage.objects;

create policy fotos_publicas_ler on storage.objects for select using (bucket_id = 'produtos');
create policy fotos_admin_enviar on storage.objects for insert with check (bucket_id = 'produtos' and public.is_admin());
create policy fotos_admin_alterar on storage.objects for update using (bucket_id = 'produtos' and public.is_admin());
create policy fotos_admin_apagar on storage.objects for delete using (bucket_id = 'produtos' and public.is_admin());

-- =====================================================================
-- DADOS DE EXEMPLO (para o site já abrir com peças)
-- Depois, no painel, a loja apaga e cadastra as peças reais.
-- =====================================================================
insert into public.categorias (nome, slug, ordem) values
  ('Vestidos','vestidos',1),
  ('Blusas','blusas',2),
  ('Calças','calcas',3),
  ('Conjuntos','conjuntos',4),
  ('Cintos','cintos',5),
  ('Semijoias','semijoias',6)
on conflict (slug) do nothing;

insert into public.produtos (nome, slug, descricao, categoria_id, preco, destaque)
select v.nome, v.slug, v.descricao, c.id, v.preco, v.destaque
from (values
  ('Vestido midi gola alta','vestido-midi-gola-alta','Malha encorpada, gola alta e manga assimétrica. Vai do trabalho ao jantar.','vestidos',289.90,true),
  ('Vestido halter em linho','vestido-halter-linho','Linho leve, decote halter e caimento reto. Combina com semijoias douradas.','vestidos',349.90,true),
  ('Blusa transpassada com fivela','blusa-transpassada-fivela','Tecido acetinado, transpasse com fivela dourada na lateral.','blusas',189.90,false),
  ('Calça pantalona com laço','calca-pantalona-laco','Cintura alta com laço lateral e perna ampla. Alonga a silhueta.','calcas',239.90,false),
  ('Blusa peplum sálvia','blusa-peplum-salvia','Alças finas e babado peplum na cintura. Tom verde-sálvia do verão.','blusas',169.90,false),
  ('Vestido drapeado menta','vestido-drapeado-menta','Drapeado na cintura com detalhe metálico. Comprimento midi.','vestidos',319.90,true)
) as v(nome, slug, descricao, cat, preco, destaque)
join public.categorias c on c.slug = v.cat
on conflict (slug) do nothing;

insert into public.produto_fotos (produto_id, url, ordem)
select p.id, v.url, 0
from (values
  ('vestido-midi-gola-alta','/demo/preto.jpg'),
  ('vestido-halter-linho','/demo/bege.jpg'),
  ('blusa-transpassada-fivela','/demo/branca.jpg'),
  ('calca-pantalona-laco','/demo/rosa.jpg'),
  ('blusa-peplum-salvia','/demo/verde.jpg'),
  ('vestido-drapeado-menta','/demo/manequim.jpg')
) as v(slug, url)
join public.produtos p on p.slug = v.slug
where not exists (select 1 from public.produto_fotos f where f.produto_id = p.id);

insert into public.variantes (produto_id, cor, cor_hex, tamanho, estoque)
select p.id, v.cor, v.hex, t.tam, t.qtd
from (values
  ('vestido-midi-gola-alta','Preto','#1B1A18'),
  ('vestido-halter-linho','Areia','#C9B79C'),
  ('blusa-transpassada-fivela','Off-white','#F1EEE7'),
  ('calca-pantalona-laco','Off-white','#F1EEE7'),
  ('blusa-peplum-salvia','Sálvia','#9AA58C'),
  ('vestido-drapeado-menta','Menta','#BFD8CC')
) as v(slug, cor, hex)
join public.produtos p on p.slug = v.slug
cross join (values ('P',3),('M',5),('G',4),('GG',2),('XG',0)) as t(tam, qtd)
on conflict (produto_id, cor, tamanho) do nothing;
