export type Categoria = {
  id: string
  nome: string
  slug: string
  ordem: number
}

export type Foto = {
  url: string
  ordem: number
}

export type Variante = {
  id: string
  cor: string
  cor_hex: string | null
  tamanho: string
  estoque: number
}

export type Produto = {
  id: string
  nome: string
  slug: string
  descricao: string | null
  preco: number
  preco_promocional: number | null
  destaque: boolean
  criado_em: string
  categoria: { nome: string; slug: string } | null
  fotos: Foto[]
  variantes: Variante[]
}

export type ItemSacola = {
  varianteId: string
  produtoId: string
  slug: string
  nome: string
  cor: string
  tamanho: string
  preco: number
  foto: string
  quantidade: number
  estoqueMax: number
}
