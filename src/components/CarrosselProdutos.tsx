import { Link } from 'react-router-dom'
import type { Produto } from '../types'
import CardProduto from './CardProduto'

/** Fileira de peças que desliza para o lado (Lançamentos, Mais vendidos, Outlet). */
export default function CarrosselProdutos({ titulo, produtos, verTodos }: { titulo: string | null; produtos: Produto[]; verTodos?: string }) {
  if (!produtos.length) return null
  return (
    <section className="mt-12">
      <div className="max-w-6xl mx-auto px-4 flex items-baseline justify-center relative mb-5">
        {titulo && <h2 className="font-serif text-3xl md:text-4xl text-center">{titulo}</h2>}
        {verTodos && (
          <Link to={verTodos} className="absolute right-4 text-[11px] uppercase tracking-[0.14em] underline text-muted">
            Ver tudo
          </Link>
        )}
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory sem-barra px-4 scroll-px-4">
          {produtos.map((p) => (
            <div key={p.id} className="shrink-0 snap-start w-[42vw] max-w-[260px] md:w-[calc(25%-15px)]">
              <CardProduto p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
