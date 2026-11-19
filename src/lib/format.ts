export function dinheiro(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const PARCELAS_SEM_JUROS = 6

export function parcelas(v: number, n = PARCELAS_SEM_JUROS): string {
  return `${n}x de ${dinheiro(v / n)} sem juros`
}

const ORDEM_TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'U', 'Único']
export function ordenarTamanhos(a: string, b: string): number {
  const ia = ORDEM_TAMANHOS.indexOf(a)
  const ib = ORDEM_TAMANHOS.indexOf(b)
  if (ia === -1 && ib === -1) return a.localeCompare(b, 'pt-BR', { numeric: true })
  if (ia === -1) return 1
  if (ib === -1) return -1
  return ia - ib
}

export function precoFinal(p: { preco: number; preco_promocional: number | null }): number {
  return p.preco_promocional != null && p.preco_promocional > 0 && p.preco_promocional < p.preco
    ? p.preco_promocional
    : p.preco
}
