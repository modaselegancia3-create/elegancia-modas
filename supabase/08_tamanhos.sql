-- Tamanhos escolhidos para o "Filtrar por numeração" (vazio = automático pelo estoque)
alter table public.configuracoes add column if not exists filtro_tamanhos text[] default '{}';
