import { supabase } from './supabase'

export type Aviso = { id?: string; texto: string; link: string | null; ordem: number; ativo: boolean }
export type Banner = {
  id?: string
  foto_url: string | null
  foto_mobile_url: string | null
  posicao: string
  posicao_mobile: string
  titulo: string | null
  subtitulo: string | null
  botao_texto: string | null
  link: string | null
  cor_texto: string
  ordem: number
  ativo: boolean
}
export type Video = {
  id?: string
  video_url: string
  capa_url: string | null
  produto_id: string | null
  nome?: string | null
  preco?: number | null
  preco_antigo?: number | null
  ordem: number
  ativo: boolean
}

async function ler<T>(tabela: string, soAtivos: boolean): Promise<T[]> {
  let q = supabase.from(tabela).select('*').order('ordem')
  if (soAtivos) q = q.eq('ativo', true)
  const { data, error } = await q
  if (error) {
    // tabela ainda não criada (rodar 03_vitrine.sql): segue sem o bloco
    console.warn(tabela, error.message)
    return []
  }
  return (data ?? []) as T[]
}

export const buscarAvisos = (todos = false) => ler<Aviso>('avisos', !todos)
export const buscarBanners = (todos = false) => ler<Banner>('banners', !todos)
export const buscarVideos = (todos = false) => ler<Video>('videos', !todos)

/** Grava a lista inteira: apaga o que saiu, atualiza/insere o resto na ordem da tela. */
export async function sincronizarLista<T extends { id?: string; ordem: number }>(
  tabela: 'avisos' | 'banners' | 'videos',
  itens: T[],
): Promise<void> {
  const { data: atuais, error: e1 } = await supabase.from(tabela).select('id')
  if (e1) throw e1
  const manter = new Set(itens.map((i) => i.id).filter(Boolean))
  const apagar = (atuais ?? []).map((r: any) => r.id as string).filter((id) => !manter.has(id))
  if (apagar.length) {
    const { error } = await supabase.from(tabela).delete().in('id', apagar)
    if (error) throw error
  }
  for (let i = 0; i < itens.length; i++) {
    const { id, ...resto } = itens[i] as any
    const linha = { ...resto, ordem: i + 1 }
    if (id) {
      const { error } = await supabase.from(tabela).update(linha).eq('id', id)
      if (error) throw error
    } else {
      const { error } = await supabase.from(tabela).insert(linha)
      if (error) throw error
    }
  }
}
