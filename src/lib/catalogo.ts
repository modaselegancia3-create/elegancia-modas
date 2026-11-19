import { supabase } from './supabase'
import type { Categoria, Produto } from '../types'

const SELECT = `
  id, nome, slug, descricao, preco, preco_promocional, promo_inicio, promo_fim, promo_riscado, destaque, criado_em,
  categoria:categorias ( nome, slug ),
  fotos:produto_fotos ( url, ordem ),
  variantes ( id, cor, cor_hex, tamanho, estoque )
`

function normalizar(row: any): Produto {
  return {
    ...row,
    preco: Number(row.preco),
    preco_promocional: row.preco_promocional == null ? null : Number(row.preco_promocional),
    categoria: Array.isArray(row.categoria) ? row.categoria[0] ?? null : row.categoria,
    fotos: [...(row.fotos ?? [])].sort((a: any, b: any) => a.ordem - b.ordem),
    variantes: row.variantes ?? [],
  }
}

export async function buscarProdutos(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select(SELECT)
    .eq('ativo', true)
    .order('criado_em', { ascending: false })
  if (error) throw error
  return (data ?? []).map(normalizar)
}

export async function buscarProduto(slug: string): Promise<Produto | null> {
  const { data, error } = await supabase
    .from('produtos')
    .select(SELECT)
    .eq('slug', slug)
    .eq('ativo', true)
    .maybeSingle()
  if (error) throw error
  return data ? normalizar(data) : null
}

export async function buscarCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nome, slug, ordem')
    .eq('ativo', true)
    .order('ordem')
  if (error) throw error
  return data ?? []
}

export function emEstoque(p: Produto): boolean {
  return p.variantes.some((v) => v.estoque > 0)
}

export function fotoCapa(p: Produto): string {
  return p.fotos[0]?.url ?? '/logo.png'
}
