import { Link } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import type { Produto } from '../types'
import { emEstoque, fotoCapa } from '../lib/catalogo'
import { dinheiro, precoFinal } from '../lib/format'

/** Cartão de peça no estilo vitrine: nome em maiúsculas centralizado, preço e parcelas. */
export default function CardProduto({ p }: { p: Produto }) {
  const { config } = useConfig()
  const preco = precoFinal(p)
  const promo = preco < p.preco
  const desconto = promo ? Math.round((1 - preco / p.preco) * 100) : 0
  const esgotado = !emEstoque(p)
  const n = config.parcelas_sem_juros
  return (
    <article className="flex flex-col items-center text-center animar-entrada">
      <Link to={`/produto/${p.slug}`} className="relative block w-full bg-[#F3F1EE] overflow-hidden group">
        <img
          src={fotoCapa(p)}
          alt={p.nome}
          loading="lazy"
          className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {promo && !esgotado && (
          <span className="absolute left-2 top-2 bg-ink text-white text-[10px] font-medium tracking-[0.08em] px-2 py-1">{desconto}% OFF</span>
        )}
        {esgotado && <span className="absolute left-2 bottom-2 bg-white text-[10px] tracking-[0.18em] uppercase px-2 py-1">Esgotado</span>}
      </Link>
      <Link to={`/produto/${p.slug}`} className="mt-3 text-[13px] uppercase tracking-[0.04em] leading-snug line-clamp-2 px-1">
        {p.nome}
      </Link>
      {promo && <s className="text-[11px] text-[#9A938A] mt-1">{dinheiro(p.preco)}</s>}
      <span className={`text-sm font-semibold ${promo ? '' : 'mt-1'}`}>{dinheiro(preco)}</span>
      {n > 1 && (
        <span className="text-[11px] text-[#9A938A] mt-0.5 leading-tight">
          {n}x de {dinheiro(preco / n)} sem juros
        </span>
      )}
    </article>
  )
}
