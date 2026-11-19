import { supabase } from './supabase'

export type Config = {
  nome_loja: string
  whatsapp: string | null
  instagram: string | null
  parcelas_sem_juros: number
  aviso_topo: string | null
  capa_foto_url: string | null
  capa_foto_mobile_url: string | null
  capa_posicao: string
  capa_posicao_mobile: string
  capa_titulo: string | null
  capa_botao: string | null
  capa_cor_texto: string
  look_produto_id: string | null
  look_titulo: string | null
  look_texto: string | null
  editorial_ativo: boolean
  editorial_foto_url: string | null
  editorial_selo: string | null
  editorial_titulo: string | null
  editorial_texto: string | null
  sobre_texto: string | null
  endereco: string | null
  horario: string | null
  cnpj: string | null
}

export const CONFIG_PADRAO: Config = {
  nome_loja: 'Elegância Confecções',
  whatsapp: null,
  instagram: '@eleganciaa_modass',
  parcelas_sem_juros: 6,
  aviso_topo: 'Enviamos para todo o Brasil · Do P ao XG',
  capa_foto_url: '/demo/bege.jpg',
  capa_foto_mobile_url: null,
  capa_posicao: 'center',
  capa_posicao_mobile: 'center',
  capa_titulo: 'ELEGÂNCIA',
  capa_botao: 'Coleção Verão 27',
  capa_cor_texto: 'escuro',
  look_produto_id: null,
  look_titulo: 'Monte o look completo',
  look_texto: 'Peças escolhidas pela loja para combinar. Finalize tudo numa compra só.',
  editorial_ativo: true,
  editorial_foto_url: '/demo/tend.jpg',
  editorial_selo: 'Editorial',
  editorial_titulo: '4 tendências do verão',
  editorial_texto: 'Peplum, listras, poá e jeans wide leg.',
  sobre_texto: '18 anos de história em Pontalina-GO. Moda feminina do P ao XG, com envio para todo o Brasil.',
  endereco: null,
  horario: null,
  cnpj: null,
}

export async function buscarConfig(): Promise<Config> {
  const { data, error } = await supabase.from('configuracoes').select('*').eq('id', 1).maybeSingle()
  if (error || !data) {
    if (error) console.error(error)
    return CONFIG_PADRAO
  }
  const limpo = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined))
  return { ...CONFIG_PADRAO, ...limpo } as Config
}

/** Converte "topo" | "center" | "baixo" ou número 0–100 em object-position */
export function posicaoCss(p: string | null | undefined): string {
  if (!p) return 'center'
  if (/^\d+$/.test(p)) return `center ${p}%`
  if (p === 'topo' || p === 'top') return 'center top'
  if (p === 'baixo' || p === 'bottom') return 'center bottom'
  return 'center'
}
