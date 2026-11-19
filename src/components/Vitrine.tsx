import { Link } from 'react-router-dom'
import type { Produto } from '../types'
import CardProduto from './CardProduto'

/** Fileira de peças que desliza para o lado (2 e um pedaço no celular, 4–5 no computador). */
export default function Vitrine({ titulo, descricao, produtos, verTudo }: { titulo: string | null; descricao?: string | null; produtos: Produto[]; verTudo?: string }) {
  if (!produtos.length) return null
  return (
    <section className="mt-12">
      <div className="max-w-6xl mx-auto px-4 flex items-baseline justify-center relative mb-5">
        {titulo && <h2 className="text-xl md:text-2xl font-light tracking-[0.02em]">{titulo}</h2>}
        {verTudo && (
          <Link to={verTudo} className="absolute right-4 text-xs underline text-muted">
            Ver tudo
          </Link>
        )}
      </div>
      {descricao && <p className="max-w-xl mx-auto px-6 -mt-3 mb-5 text-center text-sm text-muted leading-relaxed">{descricao}</p>}
      <div className="max-w-6xl mx-auto flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory sem-barra px-4 scroll-px-4 pb-1">
        {produtos.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[42vw] max-w-[240px] md:w-[22%]">
            <CardProduto p={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
