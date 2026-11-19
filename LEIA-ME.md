# Elegância Confecções — Loja online

## Etapas
- [x] Etapa 1: banco de dados + vitrine (abertura, início, produto, sacola)
- [x] Etapa 2: painel da loja (/admin) — peças, fotos padronizadas, grade/estoque, aparência, categorias
- [ ] Etapa 3: checkout + Mercado Pago (Pix e cartão) + baixa de estoque
- [ ] Etapa 4: frete para todo o Brasil
- [ ] Etapa 5: pedidos, avisos e área da cliente
- [ ] Etapa 6: domínio próprio e lançamento

## Banco (Supabase › SQL Editor)
1. `supabase/schema.sql`
2. `supabase/02_painel.sql` (depois de criar o usuário admin@eleganciamodas.com em Authentication › Users)
3. `supabase/03_vitrine.sql` (avisos, banners, filtro por tamanho, vídeos)
4. `supabase/04_secoes.sql` (vitrines Lançamentos, Mais vendidos, Outlet)
5. `supabase/05_exemplos.sql` (exemplos)
6. `supabase/06_videos.sql` (opções dos vídeos)
7. `supabase/07_selecao.sql` (peças escolhidas nas vitrines e % do outlet)
8. `supabase/08_tamanhos.sql` (tamanhos do filtro escolhidos no painel)

## Painel
Endereço: /admin — login com o usuário criado no Supabase.
As fotos de peças são padronizadas no navegador (3:4, 1200x1600, luz corrigida) antes de enviar.

## Rodar no computador
`npm install` → copiar `.env.example` para `.env` → `npm run dev`
