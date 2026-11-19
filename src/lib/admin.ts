import { supabase } from './supabase'

export type FotoForm = { id?: string; url: string; caminho?: string; arquivo?: Blob; preview?: string }
export type CorForm = { nome: string; hex: string }
export type ProdutoForm = {
  id?: string
  nome: string
  slug: string
  descricao: string
  categoria_id: string
  preco: string
  preco_promocional: string
  destaque: boolean
  ativo: boolean
  peso_gramas: string
  altura_cm: string
  largura_cm: string
  comprimento_cm: string
  fotos: FotoForm[]
  cores: CorForm[]
  tamanhos: string[]
  estoque: Record<string, number> // chave: `${cor}|${tamanho}`
}

export const TAMANHOS_PADRAO = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'Único']
const BUCKET = 'produtos'

export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function numeroBR(v: string): number | null {
  const limpo = v.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
  if (!limpo) return null
  const n = Number(limpo)
  return Number.isFinite(n) ? n : null
}

export async function souAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) {
    console.error(error)
    return false
  }
  return data === true
}

/** Envia uma foto JÁ padronizada (ver lib/imagem.ts) para o Storage. */
export async function enviarFoto(blob: Blob, pasta: string): Promise<{ url: string; caminho: string }> {
  const caminho = `${pasta || 'peca'}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, blob, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho)
  return { url: data.publicUrl, caminho }
}

function caminhoDaUrl(url: string): string | null {
  const marca = `/storage/v1/object/public/${BUCKET}/`
  const i = url.indexOf(marca)
  return i >= 0 ? decodeURIComponent(url.slice(i + marca.length)) : null
}

async function slugLivre(base: string, idAtual?: string): Promise<string> {
  let tentativa = base || 'peca'
  for (let n = 2; n < 50; n++) {
    const { data } = await supabase.from('produtos').select('id').eq('slug', tentativa).maybeSingle()
    if (!data || data.id === idAtual) return tentativa
    tentativa = `${base}-${n}`
  }
  return `${base}-${Date.now()}`
}

export function formularioVazio(): ProdutoForm {
  return {
    nome: '',
    slug: '',
    descricao: '',
    categoria_id: '',
    preco: '',
    preco_promocional: '',
    destaque: false,
    ativo: true,
    peso_gramas: '400',
    altura_cm: '5',
    largura_cm: '25',
    comprimento_cm: '30',
    fotos: [],
    cores: [{ nome: 'Única', hex: '#1B1A18' }],
    tamanhos: ['P', 'M', 'G', 'GG'],
    estoque: {},
  }
}

export async function carregarProduto(id: string): Promise<ProdutoForm> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*, fotos:produto_fotos(id,url,ordem), variantes(id,cor,cor_hex,tamanho,estoque)')
    .eq('id', id)
    .single()
  if (error) throw error
  const fotos = [...(data.fotos ?? [])].sort((a: any, b: any) => a.ordem - b.ordem)
  const variantes = (data.variantes ?? []) as { cor: string; cor_hex: string | null; tamanho: string; estoque: number }[]
  const cores: CorForm[] = []
  const tamanhos: string[] = []
  const estoque: Record<string, number> = {}
  variantes.forEach((v) => {
    if (!cores.find((c) => c.nome === v.cor)) cores.push({ nome: v.cor, hex: v.cor_hex ?? '#cccccc' })
    if (!tamanhos.includes(v.tamanho)) tamanhos.push(v.tamanho)
    estoque[`${v.cor}|${v.tamanho}`] = v.estoque
  })
  const ordem = TAMANHOS_PADRAO
  tamanhos.sort((a, b) => (ordem.indexOf(a) + 100) % 100 - (ordem.indexOf(b) + 100) % 100)
  return {
    id: data.id,
    nome: data.nome,
    slug: data.slug,
    descricao: data.descricao ?? '',
    categoria_id: data.categoria_id ?? '',
    preco: String(data.preco).replace('.', ','),
    preco_promocional: data.preco_promocional == null ? '' : String(data.preco_promocional).replace('.', ','),
    destaque: data.destaque,
    ativo: data.ativo,
    peso_gramas: String(data.peso_gramas),
    altura_cm: String(data.altura_cm),
    largura_cm: String(data.largura_cm),
    comprimento_cm: String(data.comprimento_cm),
    fotos: fotos.map((f: any) => ({ id: f.id, url: f.url })),
    cores: cores.length ? cores : [{ nome: 'Única', hex: '#1B1A18' }],
    tamanhos: tamanhos.length ? tamanhos : ['P', 'M', 'G', 'GG'],
    estoque,
  }
}

export async function salvarProduto(f: ProdutoForm, fotosRemovidas: FotoForm[]): Promise<string> {
  const preco = numeroBR(f.preco)
  if (!f.nome.trim()) throw new Error('Preencha o nome da peça.')
  if (preco == null || preco <= 0) throw new Error('Preencha um preço válido.')
  if (!f.cores.length || !f.tamanhos.length) throw new Error('Escolha pelo menos uma cor e um tamanho.')
  const promo = numeroBR(f.preco_promocional)
  const slug = await slugLivre(slugify(f.slug || f.nome), f.id)

  const linha = {
    nome: f.nome.trim(),
    slug,
    descricao: f.descricao.trim() || null,
    categoria_id: f.categoria_id || null,
    preco,
    preco_promocional: promo && promo > 0 ? promo : null,
    destaque: f.destaque,
    ativo: f.ativo,
    peso_gramas: Math.max(1, Math.round(numeroBR(f.peso_gramas) ?? 400)),
    altura_cm: Math.max(1, Math.round(numeroBR(f.altura_cm) ?? 5)),
    largura_cm: Math.max(1, Math.round(numeroBR(f.largura_cm) ?? 25)),
    comprimento_cm: Math.max(1, Math.round(numeroBR(f.comprimento_cm) ?? 30)),
  }

  let id = f.id
  if (id) {
    const { error } = await supabase.from('produtos').update(linha).eq('id', id)
    if (error) throw error
  } else {
    const { data, error } = await supabase.from('produtos').insert(linha).select('id').single()
    if (error) throw error
    id = data.id as string
  }

  // FOTOS: envia as novas, reescreve a ordem, apaga as removidas
  const finais: { url: string }[] = []
  for (const foto of f.fotos) {
    if (foto.arquivo) {
      const enviada = await enviarFoto(foto.arquivo, slug)
      finais.push({ url: enviada.url })
    } else {
      finais.push({ url: foto.url })
    }
  }
  const { error: eDel } = await supabase.from('produto_fotos').delete().eq('produto_id', id)
  if (eDel) throw eDel
  if (finais.length) {
    const { error } = await supabase
      .from('produto_fotos')
      .insert(finais.map((x, ordem) => ({ produto_id: id, url: x.url, ordem })))
    if (error) throw error
  }
  const caminhos = fotosRemovidas.map((x) => caminhoDaUrl(x.url)).filter((x): x is string => !!x)
  if (caminhos.length) await supabase.storage.from(BUCKET).remove(caminhos)

  // GRADE: cria/atualiza cada cor x tamanho e apaga combinações que saíram
  const grade = f.cores.flatMap((c) =>
    f.tamanhos.map((t) => ({
      produto_id: id!,
      cor: c.nome.trim() || 'Única',
      cor_hex: c.hex || null,
      tamanho: t,
      estoque: Math.max(0, Math.floor(f.estoque[`${c.nome}|${t}`] ?? 0)),
    })),
  )
  const { error: eUp } = await supabase.from('variantes').upsert(grade, { onConflict: 'produto_id,cor,tamanho' })
  if (eUp) throw eUp
  const { data: atuais } = await supabase.from('variantes').select('id,cor,tamanho').eq('produto_id', id)
  const manter = new Set(grade.map((g) => `${g.cor}|${g.tamanho}`))
  const sobras = (atuais ?? []).filter((v: any) => !manter.has(`${v.cor}|${v.tamanho}`)).map((v: any) => v.id)
  if (sobras.length) await supabase.from('variantes').delete().in('id', sobras)

  return id!
}

export async function excluirProduto(id: string): Promise<void> {
  const { data: fotos } = await supabase.from('produto_fotos').select('url').eq('produto_id', id)
  const { error } = await supabase.from('produtos').delete().eq('id', id)
  if (error) throw error
  const caminhos = (fotos ?? []).map((x: any) => caminhoDaUrl(x.url)).filter((x): x is string => !!x)
  if (caminhos.length) await supabase.storage.from(BUCKET).remove(caminhos)
}

export type LinhaAdmin = {
  id: string
  nome: string
  slug: string
  preco: number
  ativo: boolean
  destaque: boolean
  categoria: string
  foto: string
  estoqueTotal: number
}

export async function listarProdutosAdmin(): Promise<LinhaAdmin[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('id,nome,slug,preco,ativo,destaque,criado_em, categoria:categorias(nome), fotos:produto_fotos(url,ordem), variantes(estoque)')
    .order('criado_em', { ascending: false })
  if (error) throw error
  return (data ?? []).map((p: any) => {
    const fotos = [...(p.fotos ?? [])].sort((a: any, b: any) => a.ordem - b.ordem)
    const cat = Array.isArray(p.categoria) ? p.categoria[0] : p.categoria
    return {
      id: p.id,
      nome: p.nome,
      slug: p.slug,
      preco: Number(p.preco),
      ativo: p.ativo,
      destaque: p.destaque,
      categoria: cat?.nome ?? '—',
      foto: fotos[0]?.url ?? '/logo.png',
      estoqueTotal: (p.variantes ?? []).reduce((t: number, v: any) => t + (v.estoque ?? 0), 0),
    }
  })
}
