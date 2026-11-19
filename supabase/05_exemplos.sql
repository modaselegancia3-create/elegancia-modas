-- =====================================================================
-- ELEGÂNCIA — Deixa os blocos novos preenchidos com EXEMPLOS
-- (Outlet com promoção, Mais vendidos com destaque e vídeos de demonstração).
-- Cole no SQL Editor do Supabase e clique em RUN (depois do 04_secoes.sql).
-- Depois a loja troca tudo pelo painel.
-- =====================================================================

-- Outlet: duas peças em promoção
update public.produtos set preco_promocional = 209.90 where slug = 'calca-pantalona-laco'   and preco_promocional is null;
update public.produtos set preco_promocional = 139.90 where slug = 'blusa-peplum-salvia'    and preco_promocional is null;

-- Mais vendidos: peças com estrela
update public.produtos set destaque = true
 where slug in ('vestido-midi-gola-alta', 'vestido-halter-linho', 'blusa-transpassada-fivela', 'vestido-drapeado-menta');

-- Vídeos de demonstração (só se ainda não houver vídeos)
insert into public.videos (video_url, capa_url, produto_id, ordem)
select v.video, v.capa, p.id, v.ordem
from (values
  ('/demo/videos/bege.mp4',     '/demo/videos/bege.jpg',     'vestido-halter-linho',      1),
  ('/demo/videos/preto.mp4',    '/demo/videos/preto.jpg',    'vestido-midi-gola-alta',    2),
  ('/demo/videos/manequim.mp4', '/demo/videos/manequim.jpg', 'vestido-drapeado-menta',    3),
  ('/demo/videos/branca.mp4',   '/demo/videos/branca.jpg',   'blusa-transpassada-fivela', 4)
) as v(video, capa, slug, ordem)
join public.produtos p on p.slug = v.slug
where not exists (select 1 from public.videos);

-- Garante que todos os blocos estão ligados
update public.configuracoes
   set avisos_ativo = true, banners_ativo = true, filtro_tamanho_ativo = true,
       lancamentos_ativo = true, videos_ativo = true, mais_vendidos_ativo = true, outlet_ativo = true
 where id = 1;
