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

type ComPromo = {
  preco: number
  preco_promocional: number | null
  promo_inicio?: string | null
  promo_fim?: string | null
  promo_riscado?: boolean | null
}

function hojeISO(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}

/** A promoção vale hoje? (dentro do prazo, se tiver prazo) */
export function promoValendo(p: ComPromo): boolean {
  if (p.preco_promocional == null || !(p.preco_promocional > 0) || p.preco_promocional >= p.preco) return false
  const hoje = hojeISO()
  if (p.promo_inicio && hoje < p.promo_inicio.slice(0, 10)) return false
  if (p.promo_fim && hoje > p.promo_fim.slice(0, 10)) return false
  return true
}

export function precoFinal(p: ComPromo): number {
  return promoValendo(p) ? (p.preco_promocional as number) : p.preco
}

/** Mostrar o preço antigo riscado (e a etiqueta de % OFF)? */
export function mostrarRiscado(p: ComPromo): boolean {
  return promoValendo(p) && p.promo_riscado !== false
}
