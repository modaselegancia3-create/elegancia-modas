import { Link } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import type { Produto } from '../types'
import { emEstoque, fotoCapa } from '../lib/catalogo'
import { dinheiro, parcelas, precoFinal } from '../lib/format'

export default function CardProduto({ p }: { p: Produto }) {
  const { config } = useConfig()
  const preco = precoFinal(p)
  const promo = preco < p.preco
  const esgotado = !emEstoque(p)
  return (
    <article className="flex flex-col gap-1.5 animar-entrada">
      <Link to={`/produto/${p.slug}`} className="relative block bg-[#F3F1EE] overflow-hidden group">
        <img
          src={fotoCapa(p)}
          alt={p.nome}
          loading="lazy"
          className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {esgotado && (
          <span className="absolute left-2 bottom-2 bg-white text-[10px] tracking-[0.18em] uppercase px-2 py-1">
            Esgotado
          </span>
        )}
        {promo && !esgotado && (
          <span className="absolute left-2 top-2 bg-ink text-white text-[10px] tracking-[0.18em] uppercase px-2 py-1">
            Oferta
          </span>
        )}
      </Link>
      {p.categoria && (
        <span className="text-[10px] tracking-[0.2em] uppercase text-gold mt-1">{p.categoria.nome}</span>
      )}
      <Link to={`/produto/${p.slug}`} className="text-sm leading-snug">
        {p.nome}
      </Link>
      <span className="text-sm">
        {promo && <s className="text-muted mr-2">{dinheiro(p.preco)}</s>}
        {dinheiro(preco)}
      </span>
      <span className="text-xs text-muted">{parcelas(preco, config.parcelas_sem_juros)}</span>
    </article>
  )
}
