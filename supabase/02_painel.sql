-- =====================================================================
-- ELEGÂNCIA — Etapa 2: painel da loja
-- Cole no SQL Editor do Supabase e clique em RUN (depois do schema.sql).
-- =====================================================================

-- Campos da "Aparência da loja" (capa, look da semana, editorial, rodapé)
alter table public.configuracoes
  add column if not exists capa_foto_url text default '/demo/bege.jpg',
  add column if not exists capa_foto_mobile_url text,
  add column if not exists capa_posicao text default 'center',
  add column if not exists capa_posicao_mobile text default 'center',
  add column if not exists capa_titulo text default 'ELEGÂNCIA',
  add column if not exists capa_botao text default 'Coleção Verão 27',
  add column if not exists capa_cor_texto text default 'escuro',
  add column if not exists look_produto_id uuid references public.produtos(id) on delete set null,
  add column if not exists look_titulo text default 'Monte o look completo',
  add column if not exists look_texto text default 'Peças escolhidas pela loja para combinar. Finalize tudo numa compra só.',
  add column if not exists editorial_ativo boolean default true,
  add column if not exists editorial_foto_url text default '/demo/tend.jpg',
  add column if not exists editorial_selo text default 'Editorial',
  add column if not exists editorial_titulo text default '4 tendências do verão',
  add column if not exists editorial_texto text default 'Peplum, listras, poá e jeans wide leg.',
  add column if not exists sobre_texto text default '18 anos de história em Pontalina-GO. Moda feminina do P ao XG, com envio para todo o Brasil.',
  add column if not exists endereco text,
  add column if not exists horario text,
  add column if not exists cnpj text;

update public.configuracoes
   set aviso_topo = 'Enviamos para todo o Brasil · Do P ao XG'
 where id = 1 and aviso_topo = 'Enviamos para todo o Brasil';

-- =====================================================================
-- TORNAR O USUÁRIO DO PAINEL ADMINISTRADOR
-- 1) Antes: Authentication > Users > Add user > Create new user
--    e-mail: admin@eleganciamodas.com  |  senha: (a que você quiser)
--    marque "Auto Confirm User".
-- 2) Depois rode este SQL (pode rodar de novo sem problema):
-- =====================================================================
insert into public.admins (user_id)
select id from auth.users where email = 'admin@eleganciamodas.com'
on conflict (user_id) do nothing;

-- Confere: deve aparecer 1 linha com o e-mail
select u.email from public.admins a join auth.users u on u.id = a.user_id;
