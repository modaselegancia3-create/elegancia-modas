import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { buscarCategorias, buscarProdutos } from '../lib/catalogo'
import type { Categoria } from '../types'

export default function Categorias() {
  const [cats, setCats] = useState<Categoria[]>([])
  useEffect(() => {
    Promise.all([buscarCategorias(), buscarProdutos()])
      .then(([c, p]) => {
        const comPecas = new Set(p.map((x) => x.categoria?.slug).filter(Boolean))
        setCats(c.filter((k) => comPecas.has(k.slug)))
      })
      .catch(console.error)
  }, [])
  return (
    <section className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-serif text-4xl mb-6">Categorias</h1>
      <ul className="border-t border-line">
        <li>
          <Link to="/" className="flex justify-between items-center min-h-[60px] border-b border-line text-sm tracking-[0.12em] uppercase">
            Novidades <span aria-hidden="true">›</span>
          </Link>
        </li>
        {cats.map((c) => (
          <li key={c.id}>
            <Link
              to={`/?cat=${c.slug}`}
              className="flex justify-between items-center min-h-[60px] border-b border-line text-sm tracking-[0.12em] uppercase"
            >
              {c.nome} <span aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
